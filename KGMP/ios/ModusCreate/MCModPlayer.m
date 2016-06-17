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
    
    id leftDelegate;
    id rightDelegate;
    AEParametricEqModule *PEQ[10];
    
    
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

- (void) configureEQ:(AERenderer *) renderer {
    float QFactor = 2.0f; // define Q factor of the bands
    
    // define initial gain
    float initialGain = 0.0f;
/*
    Taken from itunes
    '32Hz',
    '64Hz',
    '125Hz',
    '250Hz',
    '500Hz',
    '1KHz',
    '2KHz',
    '4KHz',
    '8KHz',
    '16KHz',
*/


 // define center frequencies of the bands
    float centerFrequencies[10];
    centerFrequencies[0] = 32.0f;
    centerFrequencies[1] = 64.0f;
    centerFrequencies[2] = 125.0f;
    centerFrequencies[3] = 250.0f;
    centerFrequencies[4] = 500.0f;
    centerFrequencies[5] = 1000.0f;
    centerFrequencies[6] = 2000.0f;
    centerFrequencies[7] = 4000.0f;
    centerFrequencies[8] = 8000.0f;
    centerFrequencies[9] = 16000.0f;

    for (int i = 0; i < 10; i++) {
        PEQ[i] = [[AEParametricEqModule alloc] initWithRenderer:renderer];
        PEQ[i].qFactor = QFactor;
        PEQ[i].centerFrequency = centerFrequencies[i];
        PEQ[i].gain = initialGain;
    }

}


- (void) setEQ:(int)eqIndex withGain:(float) gain {
    PEQ[eqIndex].gain = gain;
}

- (void) setEQByPreset:(NSDictionary *)preset {
    
    PEQ[0].gain = [[preset valueForKey:@"freq32Hz"] doubleValue];
    PEQ[1].gain = [[preset valueForKey:@"freq64Hz"] doubleValue];
    PEQ[2].gain = [[preset valueForKey:@"freq125Hz"] doubleValue];
    PEQ[3].gain = [[preset valueForKey:@"freq250Hz"] doubleValue];
    PEQ[4].gain = [[preset valueForKey:@"freq500Hz"] doubleValue];
    PEQ[5].gain = [[preset valueForKey:@"freq1kHz"] doubleValue];
    PEQ[6].gain = [[preset valueForKey:@"freq2kHz"] doubleValue];
    PEQ[7].gain = [[preset valueForKey:@"freq4kHz"] doubleValue];
    PEQ[8].gain = [[preset valueForKey:@"freq8kHz"] doubleValue];
    PEQ[9].gain = [[preset valueForKey:@"freq16kHz"] doubleValue];
    
}

- (NSArray *) getEQ {
    NSMutableArray *presets = [NSMutableArray new];
    
    for (int i = 0; i < 10; i++) {
        NSNumber *preset = [[NSNumber alloc] initWithFloat:PEQ[i].gain];
        [presets addObject:preset];
    }
    
    return presets;
}

- (id) init {
//    NSLog(@"MCModPlayer init");
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

    [self configureEQ:renderer];


//    __block NSDate *date = [NSDate date];
//    printf("%f\n", timePassed_ms);

    renderer.block = ^(const AERenderContext * _Nonnull context) {
        AEBufferStack *bufferStack = context->stack;
        
        const AudioBufferList * bufferList = AEBufferStackPushWithChannels(bufferStack, 1, 2);

        if ( !bufferList ) {
            return;
        }
        
//        double timePassed_ms = [date timeIntervalSinceNow];
//        printf("%f\n", timePassed_ms * -1000.0);
//        date = [NSDate date];
       
        float *leftBuffer  = (float*)bufferList->mBuffers[0].mData,
              *rightBuffer = (float*)bufferList->mBuffers[1].mData;
        
        UInt32 byteSize = bufferList->mBuffers[0].mDataByteSize;
        
        if (isLoading || isPaused) {
            memset(leftBuffer,  0, byteSize);
            memset(rightBuffer, 0, byteSize);
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

        // apply the EQ to left
        for (int i = 0; i < 10; i++) {
            AEModuleProcess(PEQ[i], context);
        }
        
        AERenderContextOutput(context, 1);
       
        if (leftDelegate) {
            [leftDelegate  update:leftBuffer  withSize:context->frames];
        }
        
        if (rightDelegate) {
            [rightDelegate update:rightBuffer withSize:context->frames];
        }
    };
    
    
    AVAudioSession * audioSession = [AVAudioSession sharedInstance];
    [audioSession setCategory:AVAudioSessionCategoryPlayback error:nil];



#if TARGET_OS_IPHONE
    
#else
//    NSLog(@"setPreferredIOBufferDuration()");
//    [audioSession setPreferredIOBufferDuration:audioSession.sampleRate error:NULL];
#endif
//    [audioSession setPreferredIOBufferDuration:audioSession.sampleRate error:NULL];

    NSError *activationError = nil;
        
    BOOL success = [audioSession setActive:YES error:&activationError];
    
    if (!success) {
        /* handle the error condition */
        NSLog(@"Dafuq?");
    }

    isLoading = 0;

    
    return self.modInfo;
}


// STOP!!!!
- (void) STOP {
    if (self.output) {
        NSLog(@"STOP!!!! STOP!!!! STOP!!!! STOP!!!!!!!");
        [self.output stop];
    }
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
}

- (void) pause {
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
//    NSLog(@"Delegate set %p", aDelegate);
    delegate = aDelegate;

}
- (void) setLeftDelegate:(id)newDelegate {
//    NSLog(@"LEFT Delegate set %p", newDelegate);
    leftDelegate = newDelegate;
}

- (void) setRightDelegate:(id)newDelegate {
//    NSLog(@"RIGHT Delegate set %p", newDelegate);
    rightDelegate = newDelegate;
}


- (void) setOrder:(NSNumber *) newOrder {
    [self.modPlayer setNewOrder:newOrder];
}





@end
