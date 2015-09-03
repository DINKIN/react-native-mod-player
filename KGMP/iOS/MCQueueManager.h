//
//  MCQueueManager.h
//  KGMP
//
//  Created by Jesus Garcia on 8/9/15.
//  Copyright (c) 2015 Modus Create. All rights reserved.
//

#import <RCTBridgeModule.h>

@interface MCQueueManager : NSObject <RCTBridgeModule>

- (NSArray *) getDirectories;
- (NSArray *) getFilesForDirectory:(NSString *)dirName;
- (NSDictionary *) getRandomFile;
- (NSDictionary *) getNext;
- (NSDictionary *) getPrevious;
@end
