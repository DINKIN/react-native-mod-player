//
//  RCEGamePlayerInterface.m
//  UIExplorer
//
//  Created by Jesus Garcia on 3/7/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "MCModPlayerInterface.h"
#import "MCQueueManager.h"

@implementation MCModPlayerInterface {
   NSDictionary *globalModObject;
   
}
@synthesize bridge = _bridge;

int instanceCount = 0;
BOOL hasInitialized = false;

RCT_EXPORT_MODULE();

+ (id)sharedManager {
    static MCModPlayerInterface *shared = nil;
    static dispatch_once_t onceToken;
  
    dispatch_once(&onceToken, ^{
        shared = [[self alloc] init];
    });
    return shared;
}


- (instancetype) init {
    
    if (self = [super init]) {
        NSLog(@"MCModPlayerInterface init %p", self);
        instanceCount++;
        hasInitialized = true;
        [self configureCommandCenter];

        return self;
    }

    return nil;
}

- (void) dealloc {
    MPRemoteCommandCenter *commandCenter = [MPRemoteCommandCenter sharedCommandCenter];
   
    [commandCenter.playCommand            removeTarget:self action:@selector(commandPlay:)];
    [commandCenter.pauseCommand           removeTarget:self action:@selector(commandPause:)];
    [commandCenter.togglePlayPauseCommand removeTarget:self action:@selector(commandTogglePlayPause:)];
    [commandCenter.nextTrackCommand       removeTarget:self action:@selector(commandNextTrack:)];
    [commandCenter.previousTrackCommand   removeTarget:self action:@selector(commandPreviousTrack:)];
    
}

- (void)setBridge:(RCTBridge *)bridge
{
    _bridge = bridge;
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


}

- (NSDictionary *) loadFileViaPathString:(NSString *)path {
    MCModPlayer *player = [MCModPlayer sharedManager];
    
    NSDictionary *modObject = [player initializeSound:path];
    
    if (modObject == nil) {
        return nil;
    }
    else {
    
        self.currentRow   = 0;
        self.currentOrder  = 0;

        NSArray *ords = [modObject objectForKey:@"patternOrds"];

        self.currentPattern = [ords objectAtIndex:0];

        return modObject;
    }
}

- (NSDictionary *) loadFileViaDictionary:(NSDictionary *)file {
    
    NSString *dir  = [[file objectForKey:@"directory"]  stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding],
             *name = [[file objectForKey:@"name"] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
   
    NSString *appUrl = [[NSBundle mainBundle] bundlePath],
             *path   = [NSString stringWithFormat:@"%@%@%@%@", appUrl, @"/KEYGENMUSiC MusicPack/", dir, name];
    
    return [self loadFileViaPathString:path];
}

- (NSDictionary *) getGlobalModObject {

    return globalModObject;
}

RCT_EXPORT_METHOD(loadFile:(NSDictionary *)fileRecord
             errorCallback:(RCTResponseSenderBlock)errorCallback
                  callback:(RCTResponseSenderBlock)callback) {
   
    NSLog(@"fileRecord %@", fileRecord);
    
    NSString *bundlePath = [[NSBundle mainBundle] bundlePath],
             *fileDir    = [[fileRecord valueForKey:@"directory"] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding],
             *fileName   = [[fileRecord valueForKey:@"name"] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding],
             *filePath   = [NSString stringWithFormat:@"%@/KEYGENMUSiC MusicPack/%@%@", bundlePath, fileDir, fileName];
    
    NSDictionary *modObject = [self loadFileViaPathString:filePath];
    globalModObject = modObject;
    
    if (modObject == nil) {
        errorCallback(@[@"Could not initialize audio."]);
    }
    else {
        callback(@[modObject]);
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
    
    NSDictionary *modObject  = [player initializeSound:filePath],
                 *patterns = [player getAllPatterns:filePath];
    
    NSMutableDictionary *allmodObject = [[NSMutableDictionary alloc] initWithDictionary:modObject];
    
    [allmodObject setObject:patterns forKey:@"patterns"];
    
    callback(@[allmodObject]);
}

RCT_EXPORT_METHOD(setEQ:(nonnull NSNumber*)index
               withGain:(nonnull NSNumber*)gain) {
   
    MCModPlayer *player = [MCModPlayer sharedManager];
    [player setEq:[index intValue] withGain:[gain floatValue]];
    
    NSLog(@"%@ %@", index, gain);
    
}


RCT_EXPORT_METHOD(setOrder:(nonnull NSNumber *) newOrder
                  callback:(RCTResponseSenderBlock)callback) {
    
    MCModPlayer *player = [MCModPlayer sharedManager];
    NSLog(@"new Order %@", newOrder);
    [player setOrder:newOrder];
    callback(@[]);
}

#pragma mark Utilities

- (MPRemoteCommandHandlerStatus) commandPlay:(MPRemoteCommandEvent *)event {
    MCModPlayer *player = [MCModPlayer sharedManager];

    NSLog(@"commandCenter :: playCommand");
    [player resume];
    
    
    if (player.appActive) {

        [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:@{
            @"eventType" : @"play"
        }];
    }
    else {
        // When the UI becomes active, emit this event
        [player registerCallbackSinceLastSleep:^(NSDictionary *modObject){
            [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:@{
                @"eventType" : @"playSleep"
            }];
        }];
    }
    
    return MPRemoteCommandHandlerStatusSuccess;
}

- (MPRemoteCommandHandlerStatus) commandTogglePlayPause:(MPRemoteCommandEvent *)event {
    MCModPlayer *player = [MCModPlayer sharedManager];

    NSLog(@"commandCenter :: togglePlayPause");
    [player resume];
        
        
        if (player.appActive) {
            [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:@{
                @"eventType" : @"playPause"
            }];
        }
        else {
            NSString *eventType;
            
            if (player.isPlaying) {
                eventType = @"playSleep";
            }
            else {
                eventType = @"pauseSleep";
            }
            
            [player registerCallbackSinceLastSleep:^(NSDictionary *modObject){
                [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:@{
                    @"eventType" : @"pauseSleep"
                }];
            }];
            
        }
    
    return MPRemoteCommandHandlerStatusSuccess;
}

- (MPRemoteCommandHandlerStatus) commandPause:(MPRemoteCommandEvent *)event {
    MCModPlayer *player = [MCModPlayer sharedManager];
    
    
    NSLog(@"commandCenter :: pauseCommand");
    [player pause];
    
    if (player.appActive) {
        [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:@{
            @"eventType" : @"pause"
        }];
    }
    else {
        // When the UI becomes active, emit this event
        [player registerCallbackSinceLastSleep:^(NSDictionary *modObject){
            [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:@{
                @"eventType" : @"pauseSleep"
            }];
        }];
    }

    
    return MPRemoteCommandHandlerStatusSuccess;
}



- (MPRemoteCommandHandlerStatus) commandNextTrack:(MPRemoteCommandEvent *)event {
    MCModPlayer *player = [MCModPlayer sharedManager];
    
    NSLog(@"nextTrackCommand");
        
    MCQueueManager *qMgr = [_bridge moduleForName:@"MCQueueManager"];
    
    NSDictionary *file = [qMgr getNext];
    [player pause];
    
    
    NSDictionary *modObject = [self loadFileViaDictionary:file];
    [player play];
    
    NSDictionary *eventBody = @{
        @"eventType"  : @"fileLoad",
        @"modObject"  : modObject,
        @"fileRecord" : file
    };
    
    if (player.appActive) {
        [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:eventBody];
    }
    else {
        // When the UI becomes active, emit this event
        [player registerCallbackSinceLastSleep:^(NSDictionary *modObject){
            [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:eventBody];
        }];
    }
    
    return MPRemoteCommandHandlerStatusSuccess;
}

- (MPRemoteCommandHandlerStatus) commandPreviousTrack:(MPRemoteCommandEvent *)event {
    MCModPlayer *player = [MCModPlayer sharedManager];

    NSLog(@"previousTrackCommand");

    MCQueueManager *qMgr = [_bridge moduleForName:@"MCQueueManager"];

    NSDictionary *file = [qMgr getPrevious];
    [player pause];
    
    NSDictionary *modObject = [self loadFileViaDictionary:file];
    [player play];
    
    NSDictionary *eventBody = @{
        @"eventType"  : @"fileLoad",
        @"modObject"  : modObject,
        @"fileRecord" : file
    };
    
    if (player.appActive) {
        [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:eventBody];
    }
    else {
        // When the UI becomes active, emit this event
        [player registerCallbackSinceLastSleep:^(NSDictionary *modObject){
            [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:eventBody];
        }];
    }
    
    
    return MPRemoteCommandHandlerStatusSuccess;
}

- (void) configureCommandCenter {
    NSLog(@"------> configureCommandCenter()");
    
    /** Remote control management**/
    MPRemoteCommandCenter *commandCenter = [MPRemoteCommandCenter sharedCommandCenter];
   
    [commandCenter.playCommand            addTarget:self action:@selector(commandPlay:)];
    [commandCenter.pauseCommand           addTarget:self action:@selector(commandPause:)];
    [commandCenter.togglePlayPauseCommand addTarget:self action:@selector(commandTogglePlayPause:)];
    [commandCenter.nextTrackCommand       addTarget:self action:@selector(commandNextTrack:)];
    [commandCenter.previousTrackCommand   addTarget:self action:@selector(commandPreviousTrack:)];

    

    NSNotificationCenter *notificationCenter = [NSNotificationCenter defaultCenter];

    /* Handle audio route changes */
    [notificationCenter addObserver:self
                           selector:@selector(audioRouteChanged:)
                               name:AVAudioSessionRouteChangeNotification
                             object:nil];
    
    
    [notificationCenter addObserver:self
                        selector:@selector(audioInterruption:)
                        name:AVAudioSessionInterruptionNotification
                        object:nil];


    
//    [commandCenter.likeCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent *event) {
//        NSLog(@"like!");
//        
//        return YES;
//    }];
//    
//        
//    [commandCenter.dislikeCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent *event) {
//        NSLog(@"DISlike!");
//        
//        return YES;
//    }];
    
//    [commandCenter.ratingCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent *event) {
//        NSLog(@"Rating!");
//        
//        return YES;
//    }];
    
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


}


// TODO: Is there anything to do here? Pause/resume?
- (void) audioRouteChanged:(NSNotification *)notification {
    NSInteger routeChangeReason = [notification.userInfo[AVAudioSessionRouteChangeReasonKey] integerValue];
    
    
    NSLog(@"Route change, %ld", (long)routeChangeReason);

    if (routeChangeReason == AVAudioSessionRouteChangeReasonUnknown) {
        [[MCModPlayer sharedManager] pause];
        
        [_bridge.eventDispatcher sendDeviceEventWithName:@"commandCenterEvent" body:@{
            @"eventType" : @"pause"
        }];
    };
    
/*
switch (routeChangeReason) {
    case AVAudioSessionRouteChangeReasonUnknown:
        NSLog(@"routeChangeReason : AVAudioSessionRouteChangeReasonUnknown");
        break;

    case AVAudioSessionRouteChangeReasonNewDeviceAvailable:
        // a headset was added or removed
        NSLog(@"routeChangeReason : AVAudioSessionRouteChangeReasonNewDeviceAvailable");
        break;

    case AVAudioSessionRouteChangeReasonOldDeviceUnavailable:
        // a headset was added or removed
        NSLog(@"routeChangeReason : AVAudioSessionRouteChangeReasonOldDeviceUnavailable");
        break;

    case AVAudioSessionRouteChangeReasonCategoryChange:
        // called at start - also when other audio wants to play
        NSLog(@"routeChangeReason : AVAudioSessionRouteChangeReasonCategoryChange");//AVAudioSessionRouteChangeReasonCategoryChange
        break;

    case AVAudioSessionRouteChangeReasonOverride:
        NSLog(@"routeChangeReason : AVAudioSessionRouteChangeReasonOverride");
        break;

    case AVAudioSessionRouteChangeReasonWakeFromSleep:
        NSLog(@"routeChangeReason : AVAudioSessionRouteChangeReasonWakeFromSleep");
        break;

    case AVAudioSessionRouteChangeReasonNoSuitableRouteForCategory:
        NSLog(@"routeChangeReason : AVAudioSessionRouteChangeReasonNoSuitableRouteForCategory");
        break;

    default:
        break;
*/
}

- (void) audioInterruption:(NSNotification*)notification {
    // get the user info dictionary
    NSDictionary *interuptionDict = notification.userInfo;
    // get the AVAudioSessionInterruptionTypeKey enum from the dictionary
    NSInteger interuptionType = [[interuptionDict valueForKey:AVAudioSessionInterruptionTypeKey] integerValue];
    // decide what to do based on interruption type here...
    switch (interuptionType) {
        case AVAudioSessionInterruptionTypeBegan:
            NSLog(@"Audio Session Interruption case started.");
            // fork to handling method here...
            // EG:[self handleInterruptionStarted];
            break;

        case AVAudioSessionInterruptionTypeEnded:
            NSLog(@"Audio Session Interruption case ended.");
            // fork to handling method here...
            // EG:[self handleInterruptionEnded];
            break;

        default:
            NSLog(@"Audio Session Interruption Notification case default.");
            break;
    }
}



- (BOOL) isPlaying {
    MCModPlayer *player = [MCModPlayer sharedManager];
    return player.isPlaying;
}




@end
