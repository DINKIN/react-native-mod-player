//
//  MCGmePlayer.m
//  UIExplorer
//
//  Created by Jesus Garcia on 3/6/15.
//

#import "MCModPlayer.h"
//#import "MCPlotGlViewManager.h"

@implementation MCModPlayer {

}


static short int **audioGenerationBuffer,
                 **audioVizBuffer;


static float **vizGenerationBufferL,
             **vizGenerationBufferR;

static int32_t *statusInfo;
static volatile int soundGeneratorBufferIndex, soundPlayerBufferIndex;
static volatile int *soundGeneratorFlag;

int bufferSize;
pthread_mutex_t audio_mutex;

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
        pthread_mutex_init(&audio_mutex, NULL);
        
        
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
    
//    pthread_mutex_lock(&audio_mutex);
    memcpy(mBuffer->mAudioData, audioGenerationBuffer[soundPlayerBufferIndex], mBuffer->mAudioDataByteSize);

    soundGeneratorFlag[soundPlayerBufferIndex] = 0;
//    printf("RD  \t#%i\t\t%i\n", soundPlayerBufferIndex, abs(soundPlayerBufferIndex - soundGeneratorBufferIndex));   fflush(stdout);

    unsigned long index = soundPlayerBufferIndex;
    soundPlayerBufferIndex++;
  

    if (soundPlayerBufferIndex == NUM_BUFFERS) {
        soundPlayerBufferIndex = 0;
    }
    
    if (player.appActive) {
        // TODO: Should we use GCD to execute this method in the main queue??
        
//         dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{ // 1
        
            struct StatusObject status = statuses[index];
            int32_t playerState[4];

            playerState[0] = status.order;
            playerState[1] = status.pattern;
            playerState[2] = status.row;
            playerState[3] = status.numRows;

//            printf("%i\t%i\n", status.pattern, status.row);
            [player notifyInterface:playerState];

//            int size = mBuffer->mAudioDataByteSize * sizeof(SInt16);
//            int size = mBuffer->mAudioDataByteSize;
        
//            int numFrames = bufferSize / (2 * sizeof(int16_t));

//            SInt16 *delegateData = malloc(size);
//            memcpy(delegateData, mBuffer->mAudioData, size);
        
            
//            MCPlotGlViewManager *delegate = [player getDelegate];
//            [delegate updateBuffers:audioVizBuffer[soundPlayerBufferIndex] withSize:numFrames];

//            [delegate updateLeft:vizGenerationBufferL[soundPlayerBufferIndex] andRight:vizGenerationBufferR[soundPlayerBufferIndex] withNumFrames:numFrames];
//            free(delegateData);
        


//        });
    }
    
    
    AudioQueueEnqueueBuffer(mQueue, mBuffer, 0, NULL);
//    pthread_mutex_unlock(&audio_mutex);

    
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
    
    

    Float32 duration = (SOUND_BUFFER_SAMPLE_SIZE * 4) * 1.0f/PLAYBACK_FREQ;
    [session setPreferredIOBufferDuration:duration error:&error];
    printf("Default Duration %f\n", [session preferredIOBufferDuration]);

 
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
        [NSThread sleepForTimeInterval:.025];
        
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
    
    bufferSize = SOUND_BUFFER_SAMPLE_SIZE / 2;
//    printf("bufferSize == %i\n", bufferSize);

    free(audioGenerationBuffer);
//    free(audioVizBuffer);
    free(vizGenerationBufferL);
    free(vizGenerationBufferR);
    free(mBuffers);

    /* Allocate Audio generation buffer */
    audioGenerationBuffer = (short int**)malloc(NUM_BUFFERS * sizeof(unsigned short int *));
//    audioVizBuffer        = (short int**)malloc(NUM_BUFFERS * sizeof(unsigned short int *));
    
    vizGenerationBufferL  = (float **)malloc((NUM_BUFFERS) * sizeof(float *));
    vizGenerationBufferR  = (float **)malloc((NUM_BUFFERS) * sizeof(float *));
    
    
    /* Allocate Audio Queue buffers */
    mBuffers = (AudioQueueBufferRef*) malloc(sizeof(AudioQueueBufferRef) * NUM_BUFFERS);
    
    soundGeneratorFlag = (int *)malloc(NUM_BUFFERS * sizeof(int));
    
    
    numFrames = bufferSize / (2 * sizeof(int16_t));
    self.numberOfFrames = numFrames;
    
    // Allocate buffers
    for (int i = 0; i < NUM_BUFFERS; i++) {
        /* Allocate buffers for AudioQueue */
        AudioQueueBufferRef mBuffer;
		AudioQueueAllocateBuffer(mAudioQueue, bufferSize, &mBuffer);
		mBuffers[i] = mBuffer;
        mBuffer->mAudioDataByteSize = bufferSize;

        memset(mBuffer->mAudioData, 0, bufferSize);
        
        AudioQueueEnqueueBuffer(mAudioQueue, mBuffer, 0, NULL);
        
        
        /* Allocate buffers for sound generation */
        audioGenerationBuffer[i] = (short int*)malloc(bufferSize);
//        audioVizBuffer[i]        = (short int*)malloc(bufferSize);
        
        vizGenerationBufferL[i]  = (float*)malloc(bufferSize);
        vizGenerationBufferR[i]  = (float*)malloc(bufferSize);
        
        
        /* set each value for the sound generator flag */
        soundGeneratorFlag[i] = 0;
    }

    self.isPrimed = true;
    
    soundThread = [[NSThread alloc] initWithTarget:self selector:@selector(generateAudioThread) object:nil];
    
    [soundThread start];
    
    soundGeneratorBufferIndex = 0;
    soundPlayerBufferIndex = 0;
    
    return self.modInfo;
}

// Create a thread to generate audio. Helps with skipping when the phone is hibernating, app is pushed to
// background or foreground.
- (void) generateAudioThread {

    
    NSThread *currentThread = [NSThread currentThread];
    
    [currentThread setThreadPriority:0.9f];
    [currentThread setName:@"Audio Gen"];
    
    float timeInterval = .001;
    
    MCModPlayer *player = self;
//    printf("\n\nNew Thread \t\t%p\n", currentThread);
    
   float splitter = 32768.0f;
 
    
    
    while(1) {
   
         [NSThread sleepForTimeInterval:timeInterval];
   
        if ([currentThread isCancelled]) {
//            printf("Exit thread \t\t%p\n", currentThread);
            [NSThread exit];
        }

    
        if (soundGeneratorFlag[soundGeneratorBufferIndex] == 0) {
//            pthread_mutex_lock(&audio_mutex);
          
            // Mutex lock start
            int32_t *playerState = [player.modPlayer fillBufferNew:audioGenerationBuffer[soundGeneratorBufferIndex] withNumFrames:numFrames];
            
//            memcpy(audioVizBuffer[soundGeneratorBufferIndex], audioGenerationBuffer[soundGeneratorBufferIndex], numFrames);

            struct StatusObject status;
            
            {
                status.order   = playerState[0];
                status.pattern = playerState[1];
                status.row     = playerState[2];
                status.numRows = playerState[3];
            }
            statuses[soundGeneratorBufferIndex] = status;
            
            
            SInt16 *frames = audioGenerationBuffer[soundGeneratorBufferIndex];
            
            soundGeneratorFlag[soundGeneratorBufferIndex] = 1;

           
            float *floatDataLt = vizGenerationBufferL[soundGeneratorBufferIndex],
                  *floatDataRt = vizGenerationBufferR[soundGeneratorBufferIndex];
            
            
            for (int channelNum = 0; channelNum < 2; channelNum++) {
                for (int x = 0; x < numFrames; x++) {

                    float value = (frames[x + channelNum] / splitter) ;
                    
                    if (channelNum == 0) {
                        floatDataLt[x] = value;
                    }
                    else {
                        floatDataRt[x] = value;
                    }
                }
             }
            
            
            soundGeneratorBufferIndex++;
        
            if (soundGeneratorBufferIndex == NUM_BUFFERS) {
                soundGeneratorBufferIndex = 0;
            }
            
//            pthread_mutex_unlock(&audio_mutex);
         }
        
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
    [self updateInfoCenter];
    AudioQueueSetParameter(mAudioQueue, kAudioQueueParam_Volume, 1.0f);
    AudioQueueStart(mAudioQueue, NULL);
    self.isPrimed = false;
    self.isPlaying = true;
}

- (void) pause {
    AudioQueuePause(mAudioQueue);
    AudioQueueFlush(mAudioQueue);
    self.isPlaying = false;

}

- (void) resume {
    AudioQueueStart(mAudioQueue, NULL);
    self.isPlaying = true;

}

- (void) dealloc {
    pthread_mutex_unlock(&audio_mutex);
    pthread_mutex_destroy(&audio_mutex);
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
