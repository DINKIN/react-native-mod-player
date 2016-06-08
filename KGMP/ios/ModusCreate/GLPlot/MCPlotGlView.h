//
//  RCEzPlotGlView.h
//  UIExplorer
//
//  Created by Jesus Garcia on 3/8/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//


#import "RCTView.h"
#import "RCTComponent.h"
#import "RCTBridge.h"
#import "EZAudioPlot.h"
#import "RCTInvalidating.h"

@interface MCPlotGlView : RCTView <RCTInvalidating> {
    BOOL isRendering;
}



@property(nullable, nonatomic,strong) NSString *registered;
//@property EZAudioPlotGL *plotter;
@property(nullable, nonatomic, strong) EZAudioPlot *plotter;
@property(nullable, nonatomic, strong) NSString *plotterType;
@property(nullable, nonatomic) BOOL *shouldMirror;
@property(nullable, nonatomic) BOOL *shouldFill;

@property(nullable, nonatomic,strong) dispatch_queue_t myQueue;

- (void) update:(float[])data withSize:(int)size;
- (void) setNewLineColor:(UIColor * _Nullable)color;
- (void) setNewBackgroundColor:(UIColor * _Nullable)color;

@end
