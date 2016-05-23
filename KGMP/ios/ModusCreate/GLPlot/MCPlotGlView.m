//
//  EZPlotGlView.m
//  UIExplorer
//
//  Created by Jesus Garcia on 3/8/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "MCPlotGlView.h"
#import "RCTViewManager.h"
#import "RCTBridge.h"

@implementation MCPlotGlView


// Called via manager
- (void) update:(float[])data withSize:(int)size {
//    NSLog(@"Update %p %@", self, self.registered);

    // Lazy render
    if (! self.plotter && !isRendering) {
        isRendering = true;
        
        dispatch_async(dispatch_get_main_queue(), ^{
            if (CGSizeEqualToSize(self.bounds.size, CGSizeZero)) {
                isRendering = false;
                // Do nothing if layout hasn't happened yet
                return;
            }
            EZAudioPlot *plotter = [[EZAudioPlot alloc] initWithFrame:self.bounds];
//            EZAudioPlotGL *plotter = [[EZAudioPlotGL alloc] initWithFrame:self.bounds];

            plotter.backgroundColor = [UIColor colorWithRed:.1 green:.1 blue:.1 alpha:1];
            plotter.color = [UIColor colorWithRed:1 green:1 blue:1 alpha:1];
            
            plotter.plotType = EZPlotTypeBuffer;
            isRendering = false;
            
            NSLog(@"%@ created an EZAudioPlotGL %@ %p",  NSStringFromClass([self class]), self.registered, plotter);
            plotter.pointCount = 50;
            self.plotter = plotter;
            [self addSubview:self.plotter];
            [self layoutSubviews];
        });
    }
  

    if (self.plotter) {
        __weak typeof (self) weakSelf = self;

//       NSDate *date = [NSDate date];

        dispatch_async(dispatch_get_main_queue(), ^{
//            printf("%f\n", [date timeIntervalSinceNow] * -1000.0);

            [weakSelf.plotter updateBuffer:data withBufferSize:size];
        });
    
    }
}



- (void) dealloc {
    if (self.plotter) {
        [self.plotter removeFromSuperview];
        self.plotter = nil;
    }
}


@end
