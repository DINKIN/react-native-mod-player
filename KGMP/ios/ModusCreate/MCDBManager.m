//
//  MCDBManager.m
//  KGMP
//
//  Created by Jesus Garcia on 6/8/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "MCDBManager.h"
@implementation MCDBManager



+ (id)sharedManager {
    static MCDBManager *sharedMyManager = nil;
    static dispatch_once_t onceToken;
  
    dispatch_once(&onceToken, ^{
        sharedMyManager = [[self alloc] init];
    });
    return sharedMyManager;
}

/* ******************************************************************************************************** */
#pragma mark SQLite3_methods

- (sqlite3 *) openDb {
    
    NSString *filename = @"keygenmusicplayer.db";
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    NSString *dbPath = [documentsDirectory stringByAppendingPathComponent:filename];
  
    NSLog(@"dbPath = %@", dbPath);

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
    printf(" ***** Query: \n\t\t\t%s\n", [statementString UTF8String]);
    
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
