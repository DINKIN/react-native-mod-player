//
//  MCFsTool.m
//
//  Created by Jesus Garcia on 3/5/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "MCFsTool.h"


@implementation MCFsTool

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getDirectoriesAsJson:(NSString *)path
                         errorCallback:(RCTResponseSenderBlock)errorCallback
                              callback:(RCTResponseSenderBlock)callback) {
    
    NSMutableArray *directories = [self getContentsOfDirectory:path];
    
    callback(@[directories]);
}
    
RCT_EXPORT_METHOD(getBundlePath:(RCTResponseSenderBlock)callback) {
     NSString *appUrl  = [[NSBundle mainBundle] bundlePath];

    callback(@[
        [appUrl stringByAppendingString:@"/KEYGENMUSiC MusicPack/"]
    ]);
}


- (NSMutableArray *) getContentsOfDirectory:(NSString*)path {
   
    if (path == nil) {
        NSString *appUrl  = [[NSBundle mainBundle] bundlePath];
        path = [appUrl stringByAppendingString: @"/KEYGENMUSiC MusicPack"];
    }
    
   
    NSURL *directoryUrl = [[NSURL alloc] initFileURLWithPath:path];
    
    NSFileManager *fileManager = [[NSFileManager alloc] init];
    
    NSArray *keys = [NSArray arrayWithObject:NSURLIsDirectoryKey];
    
    
    NSArray *enumerator = [fileManager contentsOfDirectoryAtURL   : directoryUrl
                                       includingPropertiesForKeys : keys
                                       options                    : 0
                                       error                      : nil
                          ];
    
    
    NSArray *pathSplit = [path componentsSeparatedByString:@"/"];

    NSString *x           = [pathSplit objectAtIndex:[pathSplit count] -1],
             *strToRemove = [NSString stringWithFormat:@"%@ - ", x],
             *emptyStr    = @"";
    
    
    NSMutableArray *pathDictionaries = [[NSMutableArray alloc] init];

    NSString *fileType = @"file",
             *dirType  = @"dir";

    for (NSURL *url in enumerator) {
        NSError *error;
        
        NSNumber *isDirectory = nil;
        NSDictionary *jsonObj;
        
        [url getResourceValue:&isDirectory forKey:NSURLIsDirectoryKey error:&error];
  
        BOOL isDirectoryBool = [isDirectory boolValue];
   
        if (isDirectoryBool) {
            jsonObj = @{
                @"name"      : [url lastPathComponent],
                @"directory" : [url path],
                @"type"      : dirType
            };
        }
        else if (! isDirectoryBool) {
            NSString *file_name = [[url lastPathComponent] stringByReplacingOccurrencesOfString:strToRemove withString:emptyStr];
            
            jsonObj = @{
                @"name"      : [url lastPathComponent],
                @"file_name" : file_name,
                @"directory" : [url path],
                @"type"      : fileType
            };
            
        }
        
        [pathDictionaries addObject:jsonObj];

    }
    
    return pathDictionaries;
}



@end
