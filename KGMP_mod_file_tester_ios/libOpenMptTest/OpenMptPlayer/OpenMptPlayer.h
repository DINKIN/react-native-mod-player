//
//  XmpPlayer.h
//  libXmpTest
//
//  Created by Jesus Garcia on 4/10/15.
//  Copyright (c) 2015 Jesus Garcia. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <mach/mach.h>
#import <AudioToolbox/AudioToolbox.h>
#import <libopenmpt.h>
#import <libopenmpt_stream_callbacks_file.h>


#define PLAYBACK_FREQ 44100
#define SOUND_BUFFER_SIZE_SAMPLE (PLAYBACK_FREQ / 30)
#define NUM_BUFFERS 52
#define MIDIFX_OFS 32

@interface OpenMptPlayer : NSObject {
 
    AudioQueueRef mAudioQueue;
    AudioQueueBufferRef *mBuffers;
    
    char *loadedFileData;
    long loadedFileSize;
    
    BOOL audioShouldStop;
    NSThread *soundThread;
    
    int waveFormDataSize;
}



@property openmpt_module *mod;

@property SInt16 *sampleData;
@property BOOL processingSampleData;


- (void) initSound:(NSString *)path withTrackNumber:(int)track;
- (NSMutableArray *) getDirectories:(NSString*)path;
- (NSMutableArray *) getFilesForDirectory:(NSString*)path;
- (void) copyBufferData:(SInt16 *)frames withBufferSize:(int)size;
- (NSString *) loadFile:(NSString *)path;

- (NSMutableArray *) getContentsOfDirectory:(NSString*)path;


@end
