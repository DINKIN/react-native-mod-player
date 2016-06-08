//
//  MCPlotGlViewManager.h
//  UIExplorer
//
//  Created by Jesus Garcia on 3/8/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "RCTViewManager.h"

#import "MCPlotGlView.h"
#import "MCModPlayer.h"


@interface MCPlotGlViewManager : RCTViewManager {    
    float *bufferLeft,
          *bufferRight;
    
    int numFrames;
}

@property MCPlotGlView *ltView;
@property MCPlotGlView *rtView;

-(void) updateLeft:(float *)leftBuffer andRight:(float *)rightBuffer  withNumFrames:(int)nFrames;
-(void) clearUpdateDelegate;

@end
