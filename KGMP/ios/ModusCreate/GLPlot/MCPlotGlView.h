//
//  RCEzPlotGlView.h
//  UIExplorer
//
//  Created by Jesus Garcia on 3/8/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "RCTView.h"
#import "EZAudioPlotGL.h"
#import "EZAudioPlot.h"

@interface MCPlotGlView : UIView {
    BOOL isRendering;
}


@property NSString *registered;
@property EZAudioPlot *plotter;

@property (nonatomic, strong) dispatch_queue_t myQueue;

- (void) update:(float[])data withSize:(int)size;
- (void) renderPlotter;

@end
