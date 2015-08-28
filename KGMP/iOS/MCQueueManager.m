//
//  MCQueueManager.m
//  KGMP
//
//  Created by Jesus Garcia on 8/9/15.
//  Copyright (c) 2015 Modus Create. All rights reserved.
//

// Inspired heavily by https://github.com/almost/react-native-sqlite

#import "MCQueueManager.h"


#import "RCTLog.h"
#import "RCTUtils.h"
#import <Foundation/Foundation.h>
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"

#import <sqlite3.h>

/*
    TODO items:
    - Add bridged methods
        ░ Get random file
        - Get Favorites (By Directory??)
 
        ░ Browse global directories
        ░ Browse specific directory
            - Hide files by -1 (dislike)
        - Like file by 
            - md5
            - file_name
        - Dislike file by
            - md5
            - file_name
 
        - Queue Managers
            - Random Tracks
            - Directory browsing 
            - Favorites
 
    - Good queue manager (next, previous)
    - Hook in Command Center
    - Hook in app launch, hibernate, awake
*/


// From RCTAsyncLocalStorage, make a queue so we can serialise our interactions
static dispatch_queue_t MCQueueManagerQueue(void) {
    static dispatch_queue_t sqliteQueue;
    static dispatch_once_t onceToken;
    
    
    dispatch_once(&onceToken, ^{
        // All JS is single threaded, so a serial queue is our only option.

        sqliteQueue = dispatch_queue_create("com.moduscreate.sqlite", DISPATCH_QUEUE_SERIAL);
        dispatch_set_target_queue(sqliteQueue, dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0));
    });

    return sqliteQueue;
}


@implementation MCQueueManager {
    NSMutableArray *queue;
    unsigned long queueIndex;
}


@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();


- (instancetype) init {
    if (self = [super init]) {
        queue = [[NSMutableArray alloc] init];
        return self;
    }
    
    return nil;
}



#pragma mark RCT_METHODS

RCT_EXPORT_METHOD(getDirectories:(RCTResponseSenderBlock)errorCallback
                     callback:(RCTResponseSenderBlock)successCallback) {
    
    NSArray *directories = [self getDirectories];
    
    if (directories == nil) {
        errorCallback(@[]);
    }
    else {
        successCallback(@[directories]);
    }
}


RCT_EXPORT_METHOD(getFilesForDirectory:(NSString *)dirName
                    withErrorCallback:(RCTResponseSenderBlock)errorCallback
                    andSuccessCallback:(RCTResponseSenderBlock)successCallback) {
    
    NSArray *files = [self getFilesForDirectory:dirName];
    
    if (files == nil) {
        errorCallback(@[]);
    }
    else {
        successCallback(@[files]);
    }
    
}


RCT_EXPORT_METHOD(getNextRandomAndClearQueue:(RCTResponseSenderBlock)successCallback) {
    [queue removeAllObjects];
    
    NSDictionary *file = [self getRandomFile];
    
    [queue addObject:file];
    queueIndex = [queue indexOfObject:file];

    printf("Loading queued index %lu\n", queueIndex);
    successCallback(@[file]);
    
}


RCT_EXPORT_METHOD(getNextRandom:(RCTResponseSenderBlock)successCallback) {
    NSDictionary *file;
    
    unsigned long totalItems = [queue count];
    
    

    if (queueIndex < totalItems - 1) {
        queueIndex++;
        file = [queue objectAtIndex:queueIndex];
        queueIndex = [queue indexOfObject:file];
        
        printf(">>> Existing FILE\n");
    }
    else {
        file = [self getRandomFile];
        [queue addObject:file];
        queueIndex = [queue indexOfObject:file];

        printf(">>> NEW FILE\n");
    }
    
    printf("Loading queued index %lu, %lu\n", queueIndex, [queue count]);
    successCallback(@[file]);
}



RCT_EXPORT_METHOD(getPreviousRandom:(RCTResponseSenderBlock)successCallback) {
    NSDictionary *file;
    
    unsigned long totalItems = [queue count];
//    printf("getPreviousRandom(%lu)\n", queueIndex);
    
    if (queueIndex > 0) {
        queueIndex--;
    }
    
    if (queueIndex == 0) {
        file = [self getRandomFile];
        
        [queue insertObject:file atIndex:0];
        queueIndex = [queue indexOfObject:file];
//        printf("<<< NEW FILE\n");
    }
    else if (queueIndex <= totalItems - 1) {
        file = [queue objectAtIndex:queueIndex];
        queueIndex = [queue indexOfObject:file];
//        printf("<<< Existing FILE\n");
    }
    
//    printf("Loading queued index %lu, %lu\n", queueIndex, [queue count]);
    successCallback(@[file]);
}



RCT_EXPORT_METHOD(updateLikeStatus:(NSNumber *)likeValue
                  withMdFiveString:(NSString *)id_md5
                      andCallback:(RCTResponseSenderBlock)successCallback) {

    NSString *query  = [NSString stringWithFormat:@"UPDATE songs SET like_value = %@ WHERE id_md5 = '%@';", likeValue, id_md5];
    [self execQuery:query];

    // If we dislike a song, we just need to replace it in the queue.
    if ((int)[likeValue integerValue] == -1) {
        NSDictionary *file = [self getRandomFile];
      
        [queue replaceObjectAtIndex:queueIndex withObject:file];
        
        successCallback(@[file]);
        return;
    }
    
    successCallback(@[]);
}



#pragma mark general_utilities

- (NSArray *) getDirectories {
    
    NSMutableArray *directories = [self execQuery:@"SELECT * FROM directories where number_files > 0 ORDER BY name;"];
    
//    NSLog(@"%@", directories);
//    printf("done\n");
    
    return directories;
}

- (NSArray *) getFilesForDirectory:(NSString *)dirName {
    
    NSString *query = [NSString stringWithFormat:@"SELECT * FROM songs WHERE directory IS '%@' ORDER BY name;", dirName];
   
    NSMutableArray *files = [self execQuery:query];
    
//    NSLog(@"%@", files);
//    printf("done\n");
    return files;
}


- (NSDictionary *) getRandomFile {
    
    NSMutableArray *rows = [self execQuery:@"SELECT * FROM songs where like_value IS NOT '-1' ORDER BY RANDOM() LIMIT 1;"];

//    NSLog(@"RandomFile: %@", [rows objectAtIndex:0]);
    return [rows objectAtIndex:0];
}




/* ******************************************************************************************************** */
#pragma mark SQLite3_methods


- (sqlite3 *) openDb {
    
    NSString *filename = @"keygenmusicplayer.db";
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    NSString *dbPath = [documentsDirectory stringByAppendingPathComponent:filename];

    if (![[NSFileManager defaultManager] fileExistsAtPath:dbPath]) {
        // If the db file doesn't exist in the documents directory
        // but it does exist in the bundle then copy it over now
        
        NSString *sourcePath = [[[NSBundle mainBundle] resourcePath] stringByAppendingPathComponent:filename];
        NSError *error;
        
        if ([[NSFileManager defaultManager] fileExistsAtPath:sourcePath]) {
            [[NSFileManager defaultManager] copyItemAtPath:sourcePath toPath:dbPath error:&error];
            if (error != nil) {
                return nil;
            }
        }

    }

    sqlite3 *db;
    BOOL openDatabaseResult = sqlite3_open([dbPath UTF8String], &db);
    printf("Open DB %s\n", [dbPath UTF8String]);
    
    if(openDatabaseResult != SQLITE_OK) {
        return nil;
    }
    
    return db;

}




- (void) closeDb:(sqlite3 *)db {
    sqlite3_close(db);
}

- (NSMutableArray *) execQuery:(NSString *)statementString {
//    printf("Query: %s", [statementString UTF8String]);
    
    sqlite3 *db = [self openDb];
    
    NSMutableArray *rows = [[NSMutableArray alloc]init];
    
    sqlite3_stmt *stmt;
        
    int rc = sqlite3_prepare_v2(db, [statementString UTF8String], -1, &stmt, NULL);
    if (rc != SQLITE_OK) {
        NSLog(@"SQL Error: %s", sqlite3_errmsg(db));
        return nil;
    }

    
    rc = sqlite3_step(stmt);
    
    while (rc == SQLITE_ROW) {
        int totalColumns = sqlite3_column_count(stmt);
        NSMutableDictionary *rowData = [NSMutableDictionary dictionaryWithCapacity: totalColumns];
        // Go through all columns and fetch each column data.
        for (int i=0; i<totalColumns; i++){
            // Convert the column data to text (characters).
            
            NSObject *value;
            NSData *data;
            switch (sqlite3_column_type(stmt, i)) {
                case SQLITE_INTEGER:
                    value = [NSNumber numberWithLongLong: sqlite3_column_int64(stmt, i)];
                    break;
                case SQLITE_FLOAT:
                    value = [NSNumber numberWithDouble: sqlite3_column_double(stmt, i)];
                    break;
                case SQLITE_NULL:
                    value = [NSNull null];
                    break;
                case SQLITE_BLOB:
                    // TODO: How should we support blobs? Maybe base64 encode them?
//                    callback(@[@"BLOBs not supported", [NSNull null]]);
                    sqlite3_finalize(stmt);
                    [self closeDb:db];
                    return nil;
                    break;
                case SQLITE_TEXT:
                default:
                    data  = [NSData dataWithBytes: sqlite3_column_blob(stmt, i) length: sqlite3_column_bytes16(stmt, i)];
                    value = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
                    break;
            }
            char *columnName = (char *)sqlite3_column_name(stmt, i);
            // Convert the characters to string.
            [rowData setValue:value forKey:[NSString stringWithUTF8String: columnName]];
        }
        
        [rows addObject:rowData];
        rc = sqlite3_step(stmt);
    }

    
    sqlite3_finalize(stmt);
    [self closeDb:db];
    
    return rows;

}



@end
