//
//  MCGmePlayer.h
//  UIExplorer
//
//  Created by Jesus Garcia on 3/6/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <mach/mach.h>
#import <AudioToolbox/AudioToolbox.h>
#import <AVFoundation/AVFoundation.h>
#import <MediaPlayer/MediaPlayer.h>

#import <UIKit/UIApplication.h>
#import <pthread.h>
#import "TheAmazingAudioEngine.h"

#import "MC_OMPT.h"
#import "MCPlotGlView.h"


#define PLAYBACK_FREQ 44100
#define SOUND_BUFFER_SAMPLE_SIZE (PLAYBACK_FREQ / 24)
#define NUM_BUFFERS 24

@interface MCModPlayer : NSObject {
    AudioQueueRef mAudioQueue;
    AudioQueueBufferRef *mBuffers;
    
    char *loadedFileData;
    int loadedFileSize;
    
    BOOL audioShouldStop;
    NSThread *soundThread;
    
    int waveFormDataSize;
    
    BOOL appInForeground;
    
    BOOL updatesSinceLastSleep;
    
    int audioBufferIndex;
    
    size_t numFrames;
    
    
    id delegate;

}
  
@property NSDictionary *modInfo;
@property NSString *loadedFileName;
@property BOOL isPrimed;
@property BOOL isPlaying;


@property size_t numberOfFrames;

@property MCPlotGlView *ltPlotter;
@property MCPlotGlView *rtPlotter;


//@property xmp_context xmpContext;

@property id modPlayer;
//
@property (nonatomic, copy) void (^updateInterfaceBlock)(int32_t *playerState);
@property (nonatomic, copy) void (^updateInterfaceSinceLastSleepBlock)(NSDictionary *modInfo);

@property BOOL appActive;
@property BOOL copyingFloatData;



@property float* floatDataLt;
@property float* floatDataRt;
@property int renderedAudioBuffSize;

@property (nonatomic, strong, readwrite) AEAudioUnitOutput * output;

+ (instancetype) sharedManager;


void interrruptCallback (void *inUserData,UInt32 interruptionState );

- (NSDictionary *) initializeSound:(NSString *)path;


//- (float *) getBufferData:(NSString *)channel;
- (NSMutableDictionary *) getInfo:(NSString *)path;

- (NSDictionary *)getAllPatterns:(NSString *)path;
- (NSArray *) getPatternData:(NSNumber *)patternNumber;

- (void) pause;
- (void) resume;
- (void) play;

//- (void) setDelegate:(id)someDelegate;
- (void) registerInfoCallback:(void(^)(int32_t *playerState))executionBlock;
- (void) registerCallbackSinceLastSleep:(void(^)(NSDictionary *modInfo))executionBlock;

- (void) appHasGoneInBackground;
- (void) appHasGoneInForeground;
- (void) setDelegate:(id)aDelegate;
- (void) setOrder:(NSNumber *)newOrder;



@end
