//
//  AppDelegate.m
//  libXmpTest
//
//  Created by Jesus Garcia on 4/10/15.
//  Copyright (c) 2015 Jesus Garcia. All rights reserved.
//

#import "AppDelegate.h"

@interface AppDelegate () {
    UITextView *text;
}

@end

@implementation AppDelegate


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.

    player = [[OpenMptPlayer alloc] init];
    
//    NSString *filePath = [self getFilePath];
//    [player initSound:filePath withTrackNumber:0];

    text = [UITextView new];
    
    text.text = @"Some Text";
    
    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    
    
    UIViewController *rootViewController = [UIViewController new];
    self.window.rootViewController = rootViewController;

   [self testAllFiles];
            
        
    self.window.backgroundColor = [UIColor whiteColor];
    
    [self.window addSubview:text];

    [self.window makeKeyAndVisible];
    
    return YES;
}


- (void) testAllFiles {
    NSMutableArray *kmpDirs = [player getContentsOfDirectory:nil];
    NSMutableDictionary *data = [[NSMutableDictionary alloc] init];
    
    
    
    dispatch_queue_t myQueue = dispatch_queue_create("My Queue",NULL);
    
    
    dispatch_async(myQueue, ^{
        // Perform long running process
        NSDate *methodStart = [NSDate date];
        
        
        [kmpDirs enumerateObjectsUsingBlock:^(NSDictionary *dirObj, NSUInteger idx, BOOL *stop) {
            NSString *path = [dirObj valueForKey:@"path"];
            NSArray *pathSplit = [path componentsSeparatedByString:@"/"];
            
            NSString *dirName = [pathSplit objectAtIndex:[pathSplit count] - 1];

            
            printf("READING DIRECTORY --- %s/\n", [dirName UTF8String]);
            
            NSMutableDictionary *dir = [[NSMutableDictionary alloc] init];

            NSArray *files = [player getContentsOfDirectory:[dirObj valueForKey:@"path"]];

        
            [files enumerateObjectsUsingBlock:^(NSDictionary *fileObj, NSUInteger idx, BOOL *stop) {
            
                NSString *filePath = [fileObj valueForKey:@"path"];
                
                NSArray *pathSplit = [filePath componentsSeparatedByString:@"/"];
                
//                NSString *fileName = [pathSplit objectAtIndex:[pathSplit count] - 1];
                
                printf("READING FILE --- %s ",  [[fileObj valueForKey:@"name"] UTF8String]);

                NSString *songName;
                
                @try {
                    songName = [player loadFile:filePath];
                }
                @catch(NSException * e) {
                    printf("   FATAL --- \n");
                }
                
                NSMutableDictionary *tmpData = [[NSMutableDictionary alloc] initWithDictionary:fileObj];
                [tmpData removeObjectForKey:@"path"];
                [tmpData setValue:songName forKey:@"songName"];
                
                [tmpData setValue:[fileObj valueForKey:@"name"] forKey:@"file_name"];
                [tmpData removeObjectForKey:@"name"];
                

                if (songName == nil) {
                    printf("    BAD\n");
                    [tmpData setValue:@"true" forKey:@"bad"];
                }
                else {
                    printf("    GOOD\n");
                }
                
                [dir setValue:tmpData forKey:[fileObj valueForKey:@"name"]];

            }];
            
            [data setValue:dir forKey:[dirObj valueForKey:@"name"]];

        }];
        
        
            
        NSDate *methodFinish = [NSDate date];
        NSTimeInterval executionTime = [methodFinish timeIntervalSinceDate:methodStart];
        
        
        
        NSError *jsonError;
        NSData *jsonData = [NSJSONSerialization
                            dataWithJSONObject:data
                            options:NSJSONWritingPrettyPrinted
                            error:&jsonError
                           ];
        
        NSString *jsonDataString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];

        
        printf(" - ---- - --- --- \n");
        
        printf("%s", [jsonDataString UTF8String]);
        
        printf("\n\n\n");
        
        NSLog(@"executionTime = %f", executionTime);
        NSLog(@"DONE");

    });

    
//    [kmpDirs enumerateObjectsUsingBlock:^(NSDictionary *dirObj, NSUInteger idx, BOOL *stop) {
//        printf("READING DIRECTORY--- %s\n", [[dirObj valueForKey:@"dirName"] UTF8String]);
//        
//        NSMutableDictionary *dir = [[NSMutableDictionary alloc] init];
//
//        NSArray *files = [player getDirectories:[dirObj valueForKey:@"path"]];
//        
//        [files enumerateObjectsUsingBlock:^(NSDictionary *fileObj, NSUInteger idx, BOOL *stop) {
//            NSString *filePath = [fileObj valueForKey:@"path"];
//            printf("CHECKING FILE ----> %s\n", [[fileObj valueForKey:@"dirName"] UTF8String]);
//            BOOL didRead;
//            
//            @try {
//                didRead = [player loadFile:filePath];
//            }
//            @catch(NSException * e) {
//                printf("   FATAL --- \n");
//            }
//            
//            if (didRead == TRUE) {
////                printf("       FILE OK!!!\n");
//                [dir setValue:fileObj forKey:[fileObj valueForKey:@"dirName"]];
//            }
//        }];
//        
//        
//        [data setValue:dir forKey:[dirObj valueForKey:@"dirName"]];
//        
//    }];
    
//    NSLog(@"%@", data);


    
}



- (NSString *) getFilePath {
        // Todo: Convert to JSON, allow the user to pick which dir
    NSMutableArray *kmpDirs = [player getDirectories:nil];
    
    // Simulate user selecting first item
    NSDictionary *nsfDir = [kmpDirs objectAtIndex:0];
    
    //Todo: Convert to JSON, allow the user to pick a file
    NSMutableArray *filesInDir = [player getFilesForDirectory:[nsfDir objectForKey:@"path"]];
    
    // Simulate user selecting NSF file
    NSString *file = [[filesInDir objectAtIndex:0] objectForKey:@"path"];
    
    return file;

}


- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
//    NSLog(@"here");

    



}

- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
}

@end
