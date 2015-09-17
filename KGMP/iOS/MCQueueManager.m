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
        ░ Get Favorites (By Directory??)
 
        ░ Browse global directories
        ░ Browse specific directory
            ░ Hide files by -1 (dislike)
        ░ Like file by
            ░ md5
            x file_name
        ░ Dislike file by
            ░ md5
            x file_name
 
        ░ Queue Managers
            ░ Random Tracks
            ░ Directory browsing
            ░ Favorites
 
    ░ Good queue manager (next, previous)
    ░ Hook in Command Center
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
    
    /*  browseType:
        0 = directory
        1 = favorites list
        2 = random file from directories
        3 = random favorites
    */
    short browseType;
}



@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

//
//
//+ (id)sharedManager {
//    static MCQueueManager *sharedMyManager = nil;
//    static dispatch_once_t onceToken;
//  
//    hasInitialized = true;
//    dispatch_once(&onceToken, ^{
//        sharedMyManager = [[self alloc] init];
//    });
//    return sharedMyManager;
//}


- (instancetype) init {
    
    if (self = [super init]) {
        queue = [[NSMutableArray alloc] init];
        return self;
    }
    
    return nil;
}



/*********************************************************************************************************/
#pragma mark RCT_METHODS_for_directories

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
    
    queue =[[NSMutableArray alloc] initWithArray:[self getFilesForDirectory:dirName]];
    queueIndex = 0;

    browseType = 0;
    NSLog(@"%@      browseType = %i\n", self, browseType);
    if (queue == nil) {
        errorCallback(@[]);
    }
    else {
        successCallback(@[queue]);
    }
    
}


RCT_EXPORT_METHOD(getNextFileFromCurrentSet:(RCTResponseSenderBlock)successCallback) {
    NSDictionary *file = [self getNextFileFromCurrentSet];
//    NSLog(@"%@      browseType = %i\n", self, browseType);

    successCallback(@[file]);
    
}

RCT_EXPORT_METHOD(getPreviousFileFromCurrentSet:(RCTResponseSenderBlock)successCallback) {
    NSDictionary *file = [self getPreviousFileFromCurrentSet];
//    NSLog(@"%@      browseType = %i\n", self, browseType);

    successCallback(@[file]);
}

RCT_EXPORT_METHOD(setQueueIndex:(nonnull NSNumber *)index) {
//    printf("QueueIndex now set to %lld\n", [index longLongValue]);
    queueIndex = [index longLongValue];
}


/*********************************************************************************************************/
#pragma mark RCT_METHODS_for_favorites

RCT_EXPORT_METHOD(getFavorites:(RCTResponseSenderBlock)successCallback) {
    [queue removeAllObjects];
    browseType = 1;
    
    NSString *query = @"SELECT * FROM songs WHERE like_value IS '1' ORDER BY name COLLATE NOCASE ASC;";
    
    queue = [[NSMutableArray alloc] initWithArray:[self execQuery:query]];
    queueIndex = 0;
    
    successCallback(@[queue]);
}

RCT_EXPORT_METHOD(getFavoritesRandomized:(RCTResponseSenderBlock)successCallback) {
    [queue removeAllObjects];
    browseType = 3;
    
    NSString *query = @"SELECT * FROM songs where like_value IS '1' ORDER BY RANDOM() COLLATE NOCASE ASC;";

    queue = [[NSMutableArray alloc] initWithArray:[self execQuery:query]];
    queueIndex = 0;
    
    NSDictionary *file = [queue objectAtIndex:queueIndex];
    
    successCallback(@[file]);
}


/*********************************************************************************************************/
#pragma mark RCT_METHODS_for_random

RCT_EXPORT_METHOD(getNextRandomAndClearQueue:(RCTResponseSenderBlock)successCallback) {
    [queue removeAllObjects];
    browseType = 2;
    
    NSString *query = @"UPDATE songs SET in_queue = 0;";
    [self execQuery:query];
    
    
    NSDictionary *file = [self getRandomFile];
    
    [queue addObject:file];
    queueIndex = [queue indexOfObject:file];

//    printf("Loading queued index %lu\n", queueIndex);
    successCallback(@[file]);
}

RCT_EXPORT_METHOD(getNextRandom:(RCTResponseSenderBlock)successCallback) {
    NSDictionary *file = [self getNextRandom];
    successCallback(@[file]);
}




RCT_EXPORT_METHOD(getPreviousRandom:(RCTResponseSenderBlock)successCallback) {
    NSDictionary *file = [self getPreviousRandom];
    successCallback(@[file]);
}


RCT_EXPORT_METHOD(updateLikeStatus:(nonnull NSNumber *)likeValue
                  withMdFiveString:(NSString *)id_md5
                      andCallback:(RCTResponseSenderBlock)successCallback) {
    NSDictionary *file;
    
    NSString *query  = [NSString stringWithFormat:@"UPDATE songs SET like_value = %@ WHERE id_md5 = '%@';", likeValue, id_md5];
    
    [self execQuery:query];

    // If we dislike a song, we just need to replace it in the queue.
    if ((int)[likeValue integerValue] == -1) {
       unsigned long numFiles = [queue count] - 1;
 
        [queue removeObjectAtIndex:queueIndex];
        
        if (queueIndex > numFiles) {
            queueIndex = numFiles;
        }
        else if (queueIndex == numFiles) {
            queueIndex--;
        }

    
        numFiles = [queue count];
        // We have no more items!
        if (numFiles == 0) {
        
            // directory listings || Favorites list ||  Random favorites
            if (browseType == 0 || browseType == 1 || browseType == 3) {
                successCallback(@[]);
                return;
            }
            // Random Files
            else if (browseType == 2) {
                file = [self getRandomFile];
                [queue addObject:file];
                queueIndex = [queue indexOfObject:file];
            }
            
        }
        else {
            file = [queue objectAtIndex:queueIndex];
        }

    
        successCallback(@[file]);
        return;
    }
    
    successCallback(@[]);
}



#pragma mark general_utilities

- (NSArray *) getDirectories {
    NSMutableArray *directories = [self execQuery:@"SELECT * FROM directories where number_files > 0 ORDER BY name COLLATE NOCASE;"];
    return directories;
}

- (NSArray *) getFilesForDirectory:(NSString *)dirName {
    NSString *query = [NSString stringWithFormat:@"SELECT * FROM songs WHERE directory IS '%@' AND like_value IS NOT '-1' ORDER BY name COLLATE NOCASE;", dirName];
    return [self execQuery:query];
}


- (NSDictionary *) getRandomFile {
    NSMutableArray *rows = [self execQuery:@"SELECT * FROM songs where like_value IS NOT '-1' AND in_queue IS NOT 1  ORDER BY RANDOM() LIMIT 1;"];
    
    NSDictionary *file = [rows objectAtIndex:0];
 
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_LOW, 0), ^{
        NSString *query = [NSString stringWithFormat:@"UPDATE songs SET in_queue = %@ WHERE id_md5 = '%@';", @"1", [file valueForKey:@"id_md5"]];
        
        [self execQuery:query];
    });
    
    return file;

}


- (NSDictionary *) getNext {
    NSLog(@"%@      browseType = %i\n", self, browseType);

    // directory listings || Favorites list || random favorites list
    if (browseType == 0 || browseType == 1 || browseType == 3) {
        return [self getNextFileFromCurrentSet];
    }
    // Random files from directories
    else if (browseType == 2) {
        return [self getNextRandom];
    }

    return nil;
}

- (NSDictionary *) getPrevious {
    NSLog(@"%@      browseType = %i\n", self, browseType);
    // directory listings || Favorites list || random favorites list
    if (browseType == 0 || browseType == 1 || browseType == 3) {
        return [self getPreviousFileFromCurrentSet];
    }
    // Random files from directories
    else if (browseType == 2) {
        return [self getPreviousRandom];
    }
   
    return nil;
}



- (NSDictionary *) getNextFileFromCurrentSet {
    queueIndex++;
    
    unsigned long totalItems = [queue count] - 1;
    
    if (queueIndex > totalItems) {
        queueIndex = 0;
    }
    
    return [queue objectAtIndex:queueIndex];
}

- (NSDictionary *) getPreviousFileFromCurrentSet {
    unsigned long totalItems = [queue count] - 1;
    NSDictionary *file;
    

    
    if (queueIndex == 0) {
        queueIndex = totalItems;
        file = [queue objectAtIndex:queueIndex];
    }
    else {
        queueIndex--;
        file = [queue objectAtIndex:queueIndex];
    }
    
//    printf("queueIndex = %lu\n", queueIndex);

    return file;
}


/* 
    Used by both instance exposed method to get the next random file
*/
-(NSDictionary *)getNextRandom {
    unsigned long totalItems = [queue count];
    NSDictionary *file;
    
    if (queueIndex < totalItems - 1) {
        queueIndex++;
        file = [queue objectAtIndex:queueIndex];
        queueIndex = [queue indexOfObject:file];
    }
    else {
        file = [self getRandomFile];
        
        [queue addObject:file];
        queueIndex = [queue indexOfObject:file];
    }
    
    printf ("QUEUE INDEX == %lu\n", queueIndex);
    return file;
}


/* 
    Used by both instance exposed method to get the jprevious random file
*/
-(NSDictionary *) getPreviousRandom {
    NSDictionary *file;
    int totalItems = (int)[queue count];
    
//    if (queueIndex > -1) {
        queueIndex--;
//    }
    
    if (queueIndex == -1) {
        file = [self getRandomFile];
        
        [queue insertObject:file atIndex:0];
        queueIndex = [queue indexOfObject:file];
    }
    else if (queueIndex <= totalItems - 1) {
        file = [queue objectAtIndex:(unsigned long)queueIndex];
        queueIndex = [queue indexOfObject:file];
    }
    
    return file;
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

    if(openDatabaseResult != SQLITE_OK) {
        return nil;
    }
    
    return db;

}




- (void) closeDb:(sqlite3 *)db {
    sqlite3_close(db);
}

- (NSMutableArray *) execQuery:(NSString *)statementString {
//    printf(" ***** Query: \n\t\t\t%s\n", [statementString UTF8String]);
    
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
