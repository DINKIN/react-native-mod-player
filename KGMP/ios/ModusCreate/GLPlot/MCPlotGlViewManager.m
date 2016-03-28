//
//  MCPlotGlViewManager.m
//  UIExplorer
//
//  Created by Jesus Garcia on 3/8/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "MCPlotGlViewManager.h"

#import "RCTEventDispatcher.h"
#import "RCTLog.h"
#import "RCTUtils.h"



@implementation MCPlotGlViewManager {

}

pthread_mutex_t glMutex = PTHREAD_MUTEX_INITIALIZER;


RCT_EXPORT_MODULE()

- (UIView *)view {
//    NSLog(@"%@ %@",  NSStringFromClass([self class]),  NSStringFromSelector(_cmd));
    MCPlotGlView *view = [MCPlotGlView new];
//    view.delegate = self;
    return view;
}

RCT_CUSTOM_VIEW_PROPERTY(side, BOOL, MCPlotGlView) {
    MCModPlayer *player = [MCModPlayer sharedManager];
    
    
//    NSLog(@"%@ view %p self = %p, %p", json, view, self, self);
    
//    return;
    view.registered = json;
    
    
//    NSLog(@"view points to %@", NSClassFromString(view));
//
//    NSLog(@"%@ %@",  NSStringFromClass([self class]),  NSStringFromSelector(_cmd));
    if ([json isEqualToString:@"l"]) {
        self.ltView = view;
    }
    
    if ([json isEqualToString:@"r"]) {
        self.rtView = view;
    }
    
    
//    NSLog(@"%@ ltView %p", json, self.ltView);
//    NSLog(@"%@ rtView %p", json, self.rtView);
  
    
    if ([json isEqualToString:@" "]) {
        if (updateThread) {
            printf(" ----- STOPPING GLPlot THREAD LOOP -----\n");
            [updateThread cancel];
            updateThread = nil;
        }
        player.ltPlotter = nil;
        return;
    }
    

    
    if ([json isEqualToString:@"rU"]) {
        if (updateThread) {
            printf(" ----- STOPPING GLPlot THREAD LOOP -----\n");

            [updateThread cancel];
            updateThread = nil;
        }
        self.rtView = nil;
        
        player.rtPlotter = nil;
        return;
    }
   
    
    [[MCModPlayer sharedManager] setDelegate:self];
    
     if (! updateThread) {
//        NSLog(@"------ creating update thread");
        updateThread = [[NSThread alloc] initWithTarget:self selector:@selector(threadLoop:) object:nil];
        [updateThread start];
    }
    
}




-(void) threadLoop:(MCPlotGlView *)view {
    NSLog(@"----- STARTING GLPlot THREAD LOOP ----- ");
//    return;
    float timeInterval = .0005;
  
    while ([[NSThread currentThread] isCancelled] == NO) {
    
        [NSThread sleepForTimeInterval:timeInterval];
        if (self.ltView && self.rtView && numFrames) {
            pthread_mutex_lock(&glMutex);


            /*
             for(size_t i = 0; i < ioData->mNumberBuffers; ++i) {
                AudioBuffer buffer = ioData->mBuffers[i];
                for(size_t sampleIdx = 0; sampleIdx < inNumberFrames; ++sampleIdx) {
                  // Calculate current LFO amplitude based on phase, frequency, and sample index.
                  Float32 lfoAmp = cosf(2 * M_PI * lfoFreq * ((framesProcessed / kGraphSampleRate) + (sampleIdx / (Float32)inNumberFrames)));
                  SInt16 *sampleBuffer = buffer.mData;
                  
                  // Modulate left and right samples with LFO wave
                  sampleBuffer[2 * sampleIdx] = (SInt16)(lfoAmp * sampleBuffer[2 * sampleIdx]);
                  sampleBuffer[2 * sampleIdx + 1] = (SInt16)(lfoAmp * sampleBuffer[2 * sampleIdx + 1]);

                  // Mute channels as necessary
                  if(muteLeftChannel)
                    sampleBuffer[2*sampleIdx] = 0;
                  if(muteRightChannel)
                    sampleBuffer[2*sampleIdx + 1] = 0;
                }
              }
            
            
            */
            


            [self.ltView update:bufferLeft  withSize:numFrames / 2];
            [self.rtView update:bufferRight withSize:numFrames / 2];

               
            pthread_mutex_unlock(&glMutex);
          
          }
      
    }
    
}

-(void) updateLeft:(float *)leftBuffer andRight:(float *)rightBuffer  withNumFrames:(int)nFrames {
    pthread_mutex_lock(&glMutex);
    bufferLeft  = leftBuffer;
    bufferRight = rightBuffer;
    numFrames   = nFrames;

    pthread_mutex_unlock(&glMutex);
}


-(void) updateBuffers:(SInt16*)inBuffer withSize:(int)nFrames {

    pthread_mutex_lock(&glMutex);
//    if (! bufferData) {
////        bufferData = malloc(nFrames * sizeof(SInt16));
//
//        bufferData = malloc(nFrames * (2 * sizeof(int16_t)));
//    }

//    memcpy(bufferData, inBuffer, nFrames);
    numFrames = nFrames;
  
    pthread_mutex_unlock(&glMutex);

}

@end
