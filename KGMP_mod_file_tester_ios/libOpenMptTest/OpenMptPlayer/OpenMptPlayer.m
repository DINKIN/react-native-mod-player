//
//  XmpPlayer.m
//  libXmpTest
//
//  Created by Jesus Garcia on 4/10/15.
//  Copyright (c) 2015 Jesus Garcia. All rights reserved.
//

#import "OpenMptPlayer.h"

@implementation OpenMptPlayer  {
   
}

- (id) init {
    return self = [super init];
}

void handle_error( const char* str ) {
	if ( str ) {
		printf( "Error: %s\n", str ); getchar();
		exit( 1 );
	}
}



// Executed within a different context (not this class);
void audioCallback(void *data, AudioQueueRef mQueue, AudioQueueBufferRef mBuffer) {
    OpenMptPlayer *player = (__bridge OpenMptPlayer*)data;

    size_t count = openmpt_module_read_interleaved_stereo(player.mod, PLAYBACK_FREQ, mBuffer->mAudioDataByteSize / (2*sizeof(int16_t)),  mBuffer->mAudioData);
//    NSLog(@"Count = %i", count);

    AudioQueueEnqueueBuffer(mQueue, mBuffer, 0, NULL);
}


- (void) copyBufferData:(SInt16 *)frames withBufferSize:(int)size {
    if (! self.processingSampleData) {
        if (self.sampleData) {
            free(self.sampleData);
        }
        self.sampleData = malloc(sizeof(SInt16) * size);
    
        memcpy(self.sampleData, frames, size);
    }
}




- (void) initSound:(NSString *)path  withTrackNumber:(int) track{
    /* LOAD FILE */
    FILE *file;
    
    const char* fil = [path cStringUsingEncoding:NSASCIIStringEncoding];
    
    file = fopen(fil, "rb");
    
    if (file == NULL) {
      return;
    }
    
    fseek(file, 0L, SEEK_END);
    (loadedFileSize) = ftell(file);
    rewind(file);
    loadedFileData = (char*) malloc(loadedFileSize);
    
    fread(loadedFileData, loadedFileSize, sizeof(char), file);
    

   	openmpt_module * mod = 0;
	mod = openmpt_module_create_from_memory(loadedFileData, loadedFileSize, NULL, NULL, NULL);
    openmpt_module_set_repeat_count(mod, 100);
    self.mod = mod;
   
    fclose(file);

    AudioStreamBasicDescription mDataFormat;
    UInt32 err;
    float mVolume = 1.0f;

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
                             CFRunLoopGetCurrent(),
                             kCFRunLoopCommonModes,
                             0,
                             &mAudioQueue);

    /* Create associated buffers */
    mBuffers = (AudioQueueBufferRef*) malloc( sizeof(AudioQueueBufferRef) * NUM_BUFFERS );
    
    int bufferSize = 1024;
    
 
    size_t numFrames = bufferSize / (2*sizeof(int16_t));

    for (int i = 0; i < NUM_BUFFERS; i++) {
        
        AudioQueueBufferRef mBuffer;
		
        AudioQueueAllocateBuffer(mAudioQueue, bufferSize, &mBuffer);
		
		mBuffers[i] = mBuffer;
        mBuffer->mAudioDataByteSize = bufferSize;
        
   		openmpt_module_read_interleaved_stereo(mod, PLAYBACK_FREQ, numFrames,  mBuffer->mAudioData);
        

        
        AudioQueueEnqueueBuffer(mAudioQueue, mBuffer, 0, NULL);
    }
    
    err = AudioQueueSetParameter(mAudioQueue, kAudioQueueParam_Volume, mVolume );
    err = AudioQueueStart(mAudioQueue, NULL );
}


- (NSString *) loadFile:(NSString *)path {
    FILE *file;
    
    const char* fil = [path cStringUsingEncoding:NSASCIIStringEncoding];
    
    file = fopen(fil, "rb");
    
    if (file == NULL) {
        printf("Cannot open: %s\n", fil);

        return FALSE;
    }
    
    fseek(file, 0L, SEEK_END);
    loadedFileSize = ftell(file);
    
    rewind(file);
    loadedFileData = (char*) malloc(loadedFileSize);
    
    fread(loadedFileData, loadedFileSize, sizeof(char), file);
    fclose(file);


   	openmpt_module * mod = NULL;
	mod = openmpt_module_create_from_memory(loadedFileData, loadedFileSize, NULL, NULL, NULL);
    
    free(loadedFileData);
    
    if (mod == NULL) {
        openmpt_module_destroy(mod);

//        printf("Read Error: %s\n", fil);
        return NULL;
    }
    
    
    
    const char *typeLong = openmpt_module_get_metadata(mod, "type_long");
    
    if (typeLong == NULL) {
        openmpt_module_destroy(mod);

//        printf("Read Error: %s\n", fil);
        return NULL;
    }
    
    
    const char *title = openmpt_module_get_metadata(mod, "title");
    
    NSString *nsName = [[NSString alloc] initWithCString:title];
    
    
    openmpt_module_destroy(mod);
   
    
    return nsName ?: @"";
}

// Todo: Merge getDirectories and getFilesForDirectory into one method

- (NSMutableArray *) getDirectories:(NSString*)path {

    
    if (path == nil) {
        NSString *appUrl  = [[NSBundle mainBundle] bundlePath];
        path = [appUrl stringByAppendingString: @"/KEYGENMUSiC MusicPack/"];
    }
    

    
    NSURL *directoryUrl = [[NSURL alloc] initFileURLWithPath:path];
    
    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSArray *keys = [NSArray arrayWithObject:NSURLIsDirectoryKey];
    
    NSArray *directories = [fileManager
                             contentsOfDirectoryAtURL: directoryUrl
                             includingPropertiesForKeys : keys
                             options : 0
                             error:nil
                            ];

    NSMutableArray *pathDictionaries = [[NSMutableArray alloc] init];
    
    for (NSURL *url in directories) {
         NSDictionary *jsonObj = [[NSDictionary alloc]
                                    initWithObjectsAndKeys:
                                        [url lastPathComponent], @"dirName",
                                        [url path], @"path",
                                        nil
                                    ];
        
        
        [pathDictionaries addObject:jsonObj];
    }
    
    return pathDictionaries;
}



- (NSMutableArray *) getContentsOfDirectory:(NSString*)path {
   
    if (path == nil) {
        NSString *appUrl  = [[NSBundle mainBundle] bundlePath];
        path = [appUrl stringByAppendingString: @"/KEYGENMUSiC MusicPack/"];
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
                @"name" : [url lastPathComponent],
                @"path" : [url path],
                @"type" : dirType
            };
        }
        else if (! isDirectoryBool) {
            NSString *file_name = [[url lastPathComponent] stringByReplacingOccurrencesOfString:strToRemove withString:emptyStr];
            
            jsonObj = @{
                @"name"      : [url lastPathComponent],
                @"file_name_short" : file_name,
                @"path"      : [url path],
                @"type"      : fileType
            };
            
        }
        
        [pathDictionaries addObject:jsonObj];

    }
    
    return pathDictionaries;
}



- (NSMutableArray *) getFilesForDirectory:(NSString*)path {
   
    NSURL *directoryUrl = [[NSURL alloc] initFileURLWithPath:path];
    
    NSFileManager *fileManager = [[NSFileManager alloc] init];
    
    NSArray *keys = [NSArray arrayWithObject:NSURLIsDirectoryKey];
    
    NSDirectoryEnumerator *enumerator = [fileManager
                                         enumeratorAtURL : directoryUrl
                                         includingPropertiesForKeys : keys
                                         options : 0
                                         errorHandler : ^(NSURL *url, NSError *error) {
                                             //Handle the error.
                                             // Return YES if the enumeration should continue after the error.
                                             NSLog(@"Error :: %@", error);
                                             return YES;
                                         }];
    
    NSMutableArray *pathDictionaries = [[NSMutableArray alloc] init];

    for (NSURL *url in enumerator) {
        NSError *error;
        NSNumber *isDirectory = nil;
        if (! [url getResourceValue:&isDirectory forKey:NSURLIsDirectoryKey error:&error]) {
            //handle error
        }
        else if (! [isDirectory boolValue]) {
            NSDictionary *jsonObj = [[NSDictionary alloc]
                initWithObjectsAndKeys:
                    [url lastPathComponent], @"fileName",
                    [url path], @"path",
                    nil
                ];
            
            [pathDictionaries addObject:jsonObj];
        }
    }
        return pathDictionaries;
}


@end
