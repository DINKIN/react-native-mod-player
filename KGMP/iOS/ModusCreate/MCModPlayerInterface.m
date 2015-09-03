//
//  RCEGamePlayerInterface.m
//  UIExplorer
//
//  Created by Jesus Garcia on 3/7/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "MCModPlayerInterface.h"

@implementation MCModPlayerInterface
@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

- (instancetype) init {
    if (self = [super init]) {
        [self configureCommandCenter];
//        NSLog(@"MCModPlayerInterface init");
        
        MCModPlayerInterface *interface = self;
//        NSString *formatString = @"%i";
        
        
        self.then = CACurrentMediaTime();
        
        [[MCModPlayer sharedManager] registerInfoCallback:^(int32_t *playerState) {
            int ord     = (int)playerState[0],
                pat     = (int)playerState[1],
                row     = (int)playerState[2],
                numRows = (int)playerState[3];
            
            if (interface.currentOrder != ord || interface.currentPattern != pat || interface.currentRow != row) {

                [_bridge.eventDispatcher sendDeviceEventWithName:@"rowPatternUpdate" body:@[
                    
                    [[NSNumber alloc] initWithInt:ord],
                    [[NSNumber alloc] initWithInt:pat],
                    [[NSNumber alloc] initWithInt:row],
                    [[NSNumber alloc] initWithInt:numRows]
                    
                ]];
                
                interface.currentRow     = row;
                interface.currentOrder   = ord;
                interface.currentPattern = pat;
            }
            
        }];

        return self;
    }

    return nil;
}

- (NSDictionary *) loadFileViaPathString:(NSString *)path {
    MCModPlayer *player = [MCModPlayer sharedManager];
    
    NSDictionary *modInfo = [player initializeSound:path];

    
    if (modInfo == nil) {
        return nil;
    }
    else {
    
        self.currentRow   = 0;
        self.currentOrder  = 0;

        NSArray *ords = [modInfo objectForKey:@"patternOrds"];

        self.currentPattern = [ords objectAtIndex:0];

        return modInfo;
    }
}

- (NSString *) unescapeString:(NSString *)str {
    NSDictionary *options = @{
        NSDocumentTypeDocumentAttribute      : NSHTMLTextDocumentType,
        NSCharacterEncodingDocumentAttribute : @(NSUTF8StringEncoding)
    };

    NSData *data = [str dataUsingEncoding:NSUTF8StringEncoding];

    return [[[NSAttributedString alloc] initWithData:data options:options documentAttributes:nil error:nil] string];
}

- (NSDictionary *) loadFileViaDictionary:(NSDictionary *)file {
    
    NSString *dir  = [[file objectForKey:@"directory"]  stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding],
             *name = [[file objectForKey:@"name"] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
   
    NSString *appUrl = [[NSBundle mainBundle] bundlePath],
             *path   = [NSString stringWithFormat:@"%@%@%@%@", appUrl, @"/KEYGENMUSiC MusicPack/", dir, name];
    
    return [self loadFileViaPathString:path];
}

RCT_EXPORT_METHOD(loadFile:(NSString *)path
                 errorCallback:(RCTResponseSenderBlock)errorCallback
                 callback:(RCTResponseSenderBlock)callback) {
    
    
    NSDictionary *modInfo = [self loadFileViaPathString:path];

    if (modInfo == nil) {
        errorCallback(@[@"Could not initialize audio."]);
    }
    else {
        callback(@[modInfo]);
    }
}



RCT_EXPORT_METHOD(getPattern:(nonnull NSNumber *)patternNumber
                   errorCallback:(RCTResponseSenderBlock)errorCallback
                        callback:(RCTResponseSenderBlock)callback) {

    NSArray *patternData = [[MCModPlayer sharedManager] getPatternData:patternNumber];
    
    if (patternData == nil) {
        errorCallback(@[]);
    }
    else {
        callback(@[patternData]);
    }
    
}



RCT_EXPORT_METHOD(getAllPatterns:(NSString *)path
                   errorCallback:(RCTResponseSenderBlock)errorCallback
                        callback:(RCTResponseSenderBlock)callback) {

    NSDictionary *patternData = [[MCModPlayer sharedManager] getAllPatterns:path];
    
    if (patternData == nil) {
        errorCallback(@[]);
    }
    else {
        callback(@[patternData]);
    }
}


RCT_EXPORT_METHOD(pause:(RCTResponseSenderBlock)callback) {
    [[MCModPlayer sharedManager] pause];
    
    callback(@[]);
}


RCT_EXPORT_METHOD(resume:(RCTResponseSenderBlock)callback) {
    MCModPlayer *player = [MCModPlayer sharedManager];
    
    if (player.isPrimed) {
        [player play];
    }
    else {
        [player resume];
    }
    
    callback(@[]);
    
    
    
}

RCT_EXPORT_METHOD(getFileInfo:(NSString *)path
                errorCallback:(RCTResponseSenderBlock)errorCallback
                     callback:(RCTResponseSenderBlock)callback) {
    
    NSMutableDictionary *gameObject = [[MCModPlayer sharedManager] getInfo:path];
    
    if (gameObject == nil) {
       
        errorCallback(@[]);
    }
 
    else {
        callback(@[gameObject]);
    }
}

RCT_EXPORT_METHOD(loadModusAboutMod:(RCTResponseSenderBlock)errorCallback
                           callback:(RCTResponseSenderBlock)callback) {

    
    NSString *bundlePath = [[NSBundle mainBundle] bundlePath],
             *fileToLoad = @"KEYGENMUSiC MusicPack/!!Modus Create/ModusCreate.xm",
             *filePath   = [NSString stringWithFormat:@"%@/%@", bundlePath, fileToLoad];
 
    MCModPlayer *player = [MCModPlayer sharedManager];
    
    NSDictionary *modInfo  = [player initializeSound:filePath],
                 *patterns = [player getAllPatterns:filePath];
    
    NSMutableDictionary *allModInfo = [[NSMutableDictionary alloc] initWithDictionary:modInfo];
    
    [allModInfo setObject:patterns forKey:@"patterns"];
    
    callback(@[allModInfo]);
}





- (void) configureCommandCenter {
    MCModPlayer *player = [MCModPlayer sharedManager];
    
    /** Remote control management**/
    MPRemoteCommandCenter *commandCenter = [MPRemoteCommandCenter sharedCommandCenter];

    int success = MPRemoteCommandHandlerStatusSuccess;
    
    [commandCenter.togglePlayPauseCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent *event) {
        [player resume];
        
        NSLog(@"playPause");
        
        if (player.appActive) {
            [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:@{
                @"eventType" : @"playPause"
            }];
        }
        
        return success;
    }];
    
    [commandCenter.playCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent *event) {
        [player resume];
        
        NSLog(@"playCommand");
        
        if (player.appActive) {

            [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:@{
                @"eventType" : @"play"
            }];
        }
        
        return success;
    }];
    
    [commandCenter.pauseCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent *event) {
        [player pause];
        
        NSLog(@"pauseCommand");
        
        if (player.appActive) {
            [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:@{
                @"eventType" : @"pause"
            }];
        }
        
        return success;
    }];

    [commandCenter.nextTrackCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent *event) {
        NSLog(@"nextTrackCommand");
        
        if (player.appActive) {
            [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:@{
                @"eventType" : @"next"
            }];
        }
        else {
            MCQueueManager *qMgr = [_bridge.modules valueForKey:@"MCQueueManager"];
            
            NSDictionary *file = [qMgr getNext];
            [player pause];
            [self loadFileViaDictionary:file];
            [player play];
            
            // When the UI becomes active, emit this event
            [player registerCallbackSinceLastSleep:^(NSDictionary *modInfo){
                [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:@{
                    @"eventType" : @"UIUpdate",
                    @"modObject" : modInfo,
                    @"file"      : file
                }];
            }];
        }
        

        return success;
    }];
    
    [commandCenter.previousTrackCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent *event) {
        NSLog(@"previousTrackCommand");
        
        if (player.appActive) {
           [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:@{
                @"eventType" : @"prev"
            }];
        }
        else {
            MCQueueManager *qMgr = [_bridge.modules valueForKey:@"MCQueueManager"];
            
            NSDictionary *file = [qMgr getPrevious];
            [player pause];
            [self loadFileViaDictionary:file];
            [player play];
            
            // When the UI becomes active, emit this event
            [player registerCallbackSinceLastSleep:^(NSDictionary *modInfo){
                [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:@{
                    @"eventType" : @"UIUpdate",
                    @"modObject" : modInfo,
                    @"file"      : file
                }];
            }];
            
        }
        
        return success;
    }];
    
//    [commandCenter.seekBackwardCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent *event) {
//        //TODO: Handle reverse seek.  Is this called continuously?
//        NSLog(@"seek backward");
//        
//        [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:@{
//            @"eventType" : @"seekBackward"
//        }];
//        return MPRemoteCommandHandlerStatusSuccess;
//    }];
//    
//    [commandCenter.seekForwardCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent *event) {
//        //TODO: Handle forward seek.  Is this called continuously?
//        NSLog(@"seek forward");
//        
//        [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:@{
//            @"eventType" : @"seekForward"
//        }];
//        
//        return MPRemoteCommandHandlerStatusSuccess;
//    }];


    NSNotificationCenter *notificationCenter = [NSNotificationCenter defaultCenter];

    [notificationCenter addObserver:self
                           selector:@selector(audioRouteChanged:)
                               name:AVAudioSessionRouteChangeNotification
                             object:nil];

}


// TODO: Is there anything to do here? Pause/resume?
- (void) audioRouteChanged:(NSNotification *)notification {
    NSInteger routeChangeReason = [notification.userInfo[AVAudioSessionRouteChangeReasonKey] integerValue];
    
    if (routeChangeReason == AVAudioSessionRouteChangeReasonOldDeviceUnavailable) {
        [[MCModPlayer sharedManager] pause];
    };
    
    NSLog(@"Route change, %ld", (long)routeChangeReason);
}





@end
