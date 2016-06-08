//
//  MCDBManager.h
//  KGMP
//
//  Created by Jesus Garcia on 6/8/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <sqlite3.h>

@interface MCDBManager : NSObject

+ (id)sharedManager;

- (NSMutableArray *) execQuery:(NSString *)statementString;

@end
