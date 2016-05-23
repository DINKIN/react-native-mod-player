//
//  MCGmePlayer.m
//  UIExplorer
//
//  Created by Jesus Garcia on 3/6/15.
//

#import "MCModPlayer.h"
#import "MCPlotGlViewManager.h"

@implementation MCModPlayer {

    int lastPattern,
        lastRow;
    
    BOOL isLoading,
         isPaused;
}



static volatile int *soundGeneratorFlag;

int bufferSize;

struct StatusObject {
    int32_t order;
    int32_t pattern;
    int32_t row;
    int32_t numRows;
};


struct StatusObject statuses[NUM_BUFFERS];

+ (id)sharedManager {
    static MCModPlayer *sharedMyManager = nil;
    static dispatch_once_t onceToken;
  
    dispatch_once(&onceToken, ^{
        sharedMyManager = [[self alloc] init];
    });
    
    return sharedMyManager;
}

- (id) init {
    NSLog(@"MCModPlayer init");
    self.appActive = true;
    
    if (self = [super init]) {
        NSNotificationCenter *notificationCenter = [NSNotificationCenter defaultCenter];
        
        [notificationCenter addObserver:self
                               selector:@selector(appHasGoneInBackground)
                                   name:UIApplicationDidEnterBackgroundNotification
                                 object:nil];
       
        [notificationCenter addObserver:self
                               selector:@selector(appHasGoneInForeground)
                                   name:UIApplicationDidBecomeActiveNotification
                                 object:nil];

        return self;
    }
    
    return nil;
}

- (void) appHasGoneInBackground {
    self.appActive = false;
}

- (void) appHasGoneInForeground {
    self.appActive = true;
    if (self.updateInterfaceSinceLastSleepBlock) {
        self.updateInterfaceSinceLastSleepBlock(self.modInfo);
        [self registerCallbackSinceLastSleep:nil];
    }
}


- (void) registerInfoCallback:(void(^)(int32_t *playerState))executionBlock {
    self.updateInterfaceBlock = executionBlock;
}

- (void) registerCallbackSinceLastSleep:(void(^)(NSDictionary *modInfo))executionBlock {
    self.updateInterfaceSinceLastSleepBlock = executionBlock;
}


- (void) notifyInterface:(int32_t *) playerState {
    if (self.updateInterfaceBlock) {
        self.updateInterfaceBlock(playerState);
    }
}



- (NSDictionary *) loadFile:(NSString *)path {

    self.modInfo = [self.modPlayer loadFile:path];
     NSArray *pathParts = [path componentsSeparatedByString:@"/"];
    
    self.loadedFileName = [pathParts objectAtIndex:[pathParts count] - 1];
    
    return self.modInfo;
}

- (NSDictionary *) initializeSound:(NSString *)path {

    isLoading = 1;
    
    if (self.modPlayer) {
        [self loadFile:path];
        isLoading = 0;
        isPaused = 0;
        return self.modInfo;
    }
    
    self.modPlayer = [[MC_OMPT alloc] init];
    [self loadFile:path];


    AERenderer *renderer = [AERenderer new];
    self.output = [[AEAudioUnitOutput alloc] initWithRenderer:renderer];
    
    lastPattern = -1;
    lastRow = -1;

//    __block NSDate *date = [NSDate date];
//    printf("%f\n", timePassed_ms);

    renderer.block = ^(const AERenderContext * _Nonnull context) {
        AEBufferStack *bufferStack = context->stack;
                
        
        const AudioBufferList * bufferList = AEBufferStackPushWithChannels(bufferStack, 1, 2);

        if ( !bufferList ) {
            return;
        }
        
//        double timePassed_ms = [date timeIntervalSinceNow];
//        
//        printf("%f\n", timePassed_ms * -1000.0);
//        date = [NSDate date];
       
        float *leftBuffer  = (float*)bufferList->mBuffers[0].mData,
              *rightBuffer = (float*)bufferList->mBuffers[1].mData;
        
        
        if (isLoading || isPaused) {
            memset(leftBuffer,  0, bufferList->mBuffers[0].mDataByteSize);
            memset(rightBuffer, 0, bufferList->mBuffers[0].mDataByteSize);
        }
        else {
            
            int32_t *currentStep = [self.modPlayer fillLeftBuffer:leftBuffer
                                                  withRightBuffer:rightBuffer
                                                    withNumFrames:context->frames];
                
            
            int currentPattern = currentStep[1],
                currentRow     = currentStep[2];

            if (lastPattern != currentPattern || lastRow != currentRow) {
                __weak typeof (self) weakSelf = self;

                int32_t playerState[4];

                playerState[0] = currentStep[0];
                playerState[1] = currentStep[1];
                playerState[2] = currentStep[2];
                playerState[3] = currentStep[3];

                [weakSelf notifyInterface:playerState];
            }

        }
    
        [delegate updateLeft:leftBuffer andRight:rightBuffer withNumFrames:context->frames];
    
        
        AERenderContextOutput(context, 1);
    };
    
    
    AVAudioSession * audioSession = [AVAudioSession sharedInstance];
    [audioSession setCategory:AVAudioSessionCategoryPlayback error:nil];



#if TARGET_OS_IPHONE
    
#else
    NSLog(@"setPreferredIOBufferDuration()");
    [audioSession setPreferredIOBufferDuration:audioSession.sampleRate error:NULL];
#endif

    NSError *activationError = nil;
        
    BOOL success = [audioSession setActive:YES error:&activationError];
    
    if (!success) {
        /* handle the error condition */
        NSLog(@"Dafuq?");
    }

    isLoading = 0;

    
    return self.modInfo;
}


- (NSArray *) getPatternData:(NSNumber *)patternNumber {
    if (! self.modPlayer) {
        self.modPlayer = [[MC_OMPT alloc]init];
    }
    
    return [self.modPlayer getPatternData:patternNumber];

}

- (NSDictionary *) getAllPatterns:(NSString *)path {
    MC_OMPT *modPlayer = [[MC_OMPT alloc]init];
    
    NSDictionary *patternData = [modPlayer getAllPatterns:path];
    
    return patternData;
}

- (NSDictionary *) getInfo:(NSString *)path {
    MC_OMPT *modPlayer = [[MC_OMPT alloc]init];
    
    self.modInfo = [modPlayer getInfo:path];
    
    return self.modInfo;
}

- (void) updateInfoCenter {

    MPNowPlayingInfoCenter *infoCenter = [MPNowPlayingInfoCenter defaultCenter];
    NSDictionary *modInfo = self.modInfo;
    
    if (! modInfo) {
        return;
    }
    
    NSDictionary *nowPlayingInfo = @{
        MPMediaItemPropertyAlbumArtist       : [modInfo valueForKey:@"artist"],
        MPMediaItemPropertyGenre             : [modInfo valueForKey:@"type"],
        MPMediaItemPropertyTitle             : [modInfo valueForKey:@"name"] ?: @"Mod file",
        MPMediaItemPropertyPlaybackDuration  : [modInfo valueForKey:@"length"],
        MPMediaItemPropertyBeatsPerMinute    : [modInfo valueForKey:@"bpm"],
        MPMediaItemPropertyAlbumTitle        : self.loadedFileName,
        MPNowPlayingInfoPropertyPlaybackRate : isPaused ? @0.0f : @1.0f
    };

//    NSLog(@"Updated infoCenter\n%@\n", modInfo);
    
    [[UIApplication sharedApplication] beginReceivingRemoteControlEvents];

    infoCenter.nowPlayingInfo = nowPlayingInfo;
    [[AVAudioSession sharedInstance] setActive:YES error:nil];
}

/************************************************/
/* Handle phone calls interruptions             */
/************************************************/
void interruptionListenerCallback (void *inUserData, UInt32 interruptionState ) {
	MCModPlayer *player = (__bridge MCModPlayer*) inUserData;
    AVAudioSession *session = [AVAudioSession sharedInstance];

    if (interruptionState == kAudioSessionBeginInterruption) {
		[player pause];
	}
    else if (interruptionState == kAudioSessionEndInterruption) {
		// if the interruption was removed, and the app had been playing, resume playback
		

        [session setCategory:AVAudioSessionCategoryPlayback error:nil];

		[session setActive:YES error:nil];
        [player resume];
	}
}


- (void) play {
    [self.output start:nil];
    isPaused = false;
    self.isPlaying = true;
    [self updateInfoCenter];

    return;
//    [self updateInfoCenter];
//    AudioQueueSetParameter(mAudioQueue, kAudioQueueParam_Volume, 1.0f);
//    AudioQueueStart(mAudioQueue, NULL);
//    self.isPrimed = false;
//    self.isPlaying = true;
}

- (void) pause {
//    [self.output stop];
    isPaused = true;
    self.isPlaying = false;
    [self updateInfoCenter];


}

- (void) resume {
    [self.output start:nil];
    isPaused = false;
    self.isPlaying = true;
    [self updateInfoCenter];

}


- (id) getDelegate {
    return delegate;
}


- (void) setDelegate:(id)aDelegate {
    NSLog(@"Delegate set %p", aDelegate);
    delegate = aDelegate;

}


- (void) setOrder:(NSNumber *) newOrder {
    [self.modPlayer setNewOrder:newOrder];
}





@end
