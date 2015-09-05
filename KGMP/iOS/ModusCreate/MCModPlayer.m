//
//  MCGmePlayer.m
//  UIExplorer
//
//  Created by Jesus Garcia on 3/6/15.
//

#import "MCModPlayer.h"

@implementation MCModPlayer {

}


static short int **audio_generation_buffer;
static volatile int soundIndex;



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


void audioCallback(void *data, AudioQueueRef mQueue, AudioQueueBufferRef mBuffer) {

    MCModPlayer *player = (__bridge MCModPlayer*)data;
    
    // Todo: memcpy from sound thread
//    int32_t *playerState = [player.modPlayer fillBuffer:mBuffer];
    
    
    
    memcpy(mBuffer->mAudioData, audio_generation_buffer[soundIndex], mBuffer->mAudioDataByteSize);
    soundIndex++;
    
    if (soundIndex > 15) {
        soundIndex = 0;
    }
    AudioQueueEnqueueBuffer(mQueue, mBuffer, 0, NULL);
    
    
//    if (player.appActive) {
//        // TODO: Should we use GCD to execute this method in the main queue??
//        [player notifyInterface:playerState];
//    }
}


- (BOOL) initAudioSession {
    AVAudioSession *session = [AVAudioSession sharedInstance];

    NSError *error = nil;
    BOOL success = [session setCategory:AVAudioSessionCategoryPlayback error:&error];
    
    if (! success) {
#if DEBUG
        NSLog(@"%@", [error localizedFailureReason]);
#endif
        return NO;
    }
    
    
    success = [session setActive:YES error:&error];
    
    if (! success) {
#if DEBUG
        NSLog(@"%@", [error localizedFailureReason]);
#endif
        return NO;
    }



    return YES;
}



- (NSDictionary *) initializeSound:(NSString *)path  {
    
    if (self.modPlayer) {
    
        [self pause];

        AudioQueueStop(mAudioQueue, YES);
        AudioQueueReset(mAudioQueue);
        AudioQueueDispose(mAudioQueue, YES);
    }
    else {
        BOOL success = [self initAudioSession];
        if (! success) {
            return nil;
        }


        self.modPlayer = [[MC_OMPT alloc] init];
    }
    
    if (soundThread) {
        [soundThread cancel];
        // Give the current sound thread time to finish work.
        [NSThread sleepForTimeInterval:.010];
        
        soundThread = nil;
    }
    
    self.modInfo = [self.modPlayer loadFile:path];
    
    NSArray *pathParts = [path componentsSeparatedByString:@"/"];
    
    self.loadedFileName = [pathParts objectAtIndex:[pathParts count] - 1];
    
    AudioStreamBasicDescription mDataFormat;
    UInt32 err;

  /*
        (AudioStreamBasicDescription) mDataFormat = {
          mSampleRate = 44100
          mFormatID = 1819304813
          mFormatFlags = 12
          mBytesPerPacket = 4
          mFramesPerPacket = 1
          mBytesPerFrame = 4
          mChannelsPerFrame = 2
          mBitsPerChannel = 16
          mReserved = 1
        }
    */
    
    mDataFormat.mFormatID         = kAudioFormatLinearPCM;
    mDataFormat.mFormatFlags      = kLinearPCMFormatFlagIsSignedInteger | kAudioFormatFlagIsPacked;
    mDataFormat.mSampleRate       = PLAYBACK_FREQ;
    mDataFormat.mBitsPerChannel   = 16;
    mDataFormat.mChannelsPerFrame = 2;
    mDataFormat.mBytesPerFrame    = (mDataFormat.mBitsPerChannel >> 3) * mDataFormat.mChannelsPerFrame;
    mDataFormat.mFramesPerPacket  = 1;
    mDataFormat.mBytesPerPacket   = mDataFormat.mBytesPerFrame;
    
    err = AudioQueueNewOutput(&mDataFormat,
                             audioCallback,
                             CFBridgingRetain(self),
                             CFRunLoopGetMain(),
                             kCFRunLoopCommonModes,
                             0,
                             &mAudioQueue);
    
    int bufferSize = 4096 * 2;

    /* Allocate Audio generation buffer */
    audio_generation_buffer = (short int**)malloc(NUM_BUFFERS * sizeof(unsigned short int *));
    
    /* Allocate Audio Queue buffers */
    mBuffers = (AudioQueueBufferRef*) malloc( sizeof(AudioQueueBufferRef) * NUM_BUFFERS);
    
    
    numFrames = bufferSize / (2 * sizeof(int16_t));

    
    static int zeros[4096 * 2] = {0};
    
    // Allocate buffers
    for (int i = 0; i < NUM_BUFFERS; i++) {
        /* Allocate buffers for AudioQueue */
        AudioQueueBufferRef mBuffer;
		AudioQueueAllocateBuffer(mAudioQueue, bufferSize, &mBuffer);
		
		mBuffers[i] = mBuffer;
        mBuffer->mAudioDataByteSize = bufferSize;

        memcpy(mBuffer->mAudioData, zeros, bufferSize);
        
        AudioQueueEnqueueBuffer(mAudioQueue, mBuffer, 0, NULL);
        
        
        /* Allocate buffers for sound generation */
        audio_generation_buffer[i] = (short int*)malloc(bufferSize);
        
    }

    self.isPrimed = true;
    
    soundThread = [[NSThread alloc] initWithTarget:self selector:@selector(generateAudioThread) object:nil];
    
    [soundThread start];
    
    soundIndex = 0;
    memset(audio_generation_buffer[soundIndex], 0, bufferSize);

    return self.modInfo;
}

- (void) generateAudioThread {
    
    float timeInterval = .001;
    int currentIndex = -1;
    
    MCModPlayer *player = self;
    printf("New Thread \t\t%p\n", [NSThread currentThread]);
    while(1) {
        if ([[NSThread currentThread] isCancelled]) {
            printf("Exit thread \t\t%p\n", [NSThread currentThread]);
            [NSThread exit];
        }
        
        
    
        if (currentIndex != soundIndex) {
//            printf("currentIndex %i soundIndex %i \n", currentIndex, soundIndex);
            int32_t *playerState = [player.modPlayer fillBufferNew:audio_generation_buffer[soundIndex] withNumFrames:numFrames];
            
            currentIndex = soundIndex;
        }
        
        [NSThread sleepForTimeInterval:timeInterval];
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
    
    NSDictionary *nowPlayingInfo = @{
        MPMediaItemPropertyAlbumArtist      : [modInfo valueForKey:@"artist"],
        MPMediaItemPropertyGenre            : [modInfo valueForKey:@"type"],
        MPMediaItemPropertyTitle            : [modInfo valueForKey:@"name"] ?: @"Mod file",
        MPMediaItemPropertyPlaybackDuration : [modInfo valueForKey:@"length"],
        MPMediaItemPropertyBeatsPerMinute   : [modInfo valueForKey:@"bpm"],
        MPMediaItemPropertyAlbumTitle       : self.loadedFileName
    };
    
    infoCenter.nowPlayingInfo = nowPlayingInfo;
}

/************************************************/
/* Handle phone calls interruptions             */
/************************************************/
//void interruptionListenerCallback (void *inUserData,UInt32 interruptionState ) {
//	ModizMusicPlayer *mplayer=(ModizMusicPlayer*)inUserData;
//	if (interruptionState == kAudioSessionBeginInterruption) {
//		mInterruptShoudlRestart=0;
//		if ([mplayer isPlaying] && (mplayer.bGlobalAudioPause==0)) {
//			[mplayer Pause:YES];
//			mInterruptShoudlRestart=1;
//		}
//	}
//    else if (interruptionState == kAudioSessionEndInterruption) {
//		// if the interruption was removed, and the app had been playing, resume playback
//		if (mInterruptShoudlRestart) {
//            //check if headphone is used?
//            CFStringRef newRoute;
//            UInt32 size = sizeof(CFStringRef);
//            AudioSessionGetProperty(kAudioSessionProperty_AudioRoute,&size,&newRoute);
//            if (newRoute) {
//                if (CFStringCompare(newRoute,CFSTR("Headphone"),NULL)==kCFCompareEqualTo) {  //
//                    mInterruptShoudlRestart=0;
//                }
//            }
//            
//			if (mInterruptShoudlRestart) [mplayer Pause:NO];
//			mInterruptShoudlRestart=0;
//		}
//		
//		UInt32 sessionCategory = kAudioSessionCategory_MediaPlayback;
//		AudioSessionSetProperty (
//								 kAudioSessionProperty_AudioCategory,
//								 sizeof (sessionCategory),
//								 &sessionCategory
//								 );
//		AudioSessionSetActive (true);
//	}
//}


- (void) play {
    [self updateInfoCenter];
    AudioQueueSetParameter(mAudioQueue, kAudioQueueParam_Volume, 1.0f);
    AudioQueueStart(mAudioQueue, NULL);
    self.isPrimed = false;
}

- (void) pause {
    AudioQueuePause(mAudioQueue);
    AudioQueueFlush(mAudioQueue);
}

- (void) resume {
    AudioQueueStart(mAudioQueue, NULL);
}







@end
