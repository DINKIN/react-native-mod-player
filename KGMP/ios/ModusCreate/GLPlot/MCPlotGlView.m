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



//
//- (instancetype) initWithFrame:(CGRect)frame {
//    self = [super initWithFrame:frame];
//    
//    dispatch_async(dispatch_get_main_queue(), ^{
//
//        EZAudioPlot *plotter = [[EZAudioPlot alloc] initWithFrame:self.bounds];
////            EZAudioPlotGL *plotter = [[EZAudioPlotGL alloc] initWithFrame:self.bounds];
//
//        plotter.backgroundColor = [UIColor colorWithRed:.1 green:.1 blue:.1 alpha:1];
//        plotter.color = [UIColor colorWithRed:1 green:1 blue:1 alpha:1];
//        
//        plotter.plotType = EZPlotTypeBuffer;
//        isRendering = false;
//        
//        NSLog(@"%@ created an EZAudioPlotGL %@ %p",  NSStringFromClass([self class]), self.registered, plotter);
//        NSLog(@"Bounds %@", self.bounds);
//        plotter.pointCount = 50;
//        self.plotter = plotter;
//        [self addSubview:self.plotter];
//        [self layoutSubviews];
//    });
//    
//    
//    return self;
//}


// Called via manager
- (void) update:(float[])data withSize:(int)size {
//    NSLog(@"Update %p %@", self, self.registered);
  
//    NSLog(@"update() %f  %i", data[0], size);
//    for (int i = 0; i < size; i++) {
//        printf("%f ", data[i]);
//    }
//    
//    printf("\n --------------------- \n");
  
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
            NSLog(@"Bounds %@", self.bounds);
            plotter.pointCount = 50;
            self.plotter = plotter;
            [self addSubview:self.plotter];
            [self layoutSubviews];
        });
    }
  

    if (self.plotter) {
        __weak typeof (self) weakSelf = self;

//        NSDate *date = [NSDate date];

//        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
        dispatch_async(dispatch_get_main_queue(), ^{
//            NSLog(@"%@ update  plotter = %p", self.registered, _plotter);
//            double timePassed_ms = [date timeIntervalSinceNow] * -1000.0;
//            printf("%f\n", timePassed_ms);

            [weakSelf.plotter updateBuffer:data withBufferSize:size];
        });
    
    }
}


//- (void) layoutSubviews {
//    [super layoutSubviews];
//
//
//  [CATransaction begin];
//  [CATransaction setAnimationDuration:0];
//  
////    EZAudioPlotGL *plotter;
////    plotter = [[EZAudioPlotGL alloc] initWithFrame:self.frame];
//////            plotter = [[EZAudioPlotGL alloc] init];
////
////    plotter.backgroundColor = [UIColor colorWithRed:.1 green:.1 blue:.1 alpha:1];
////    plotter.color = [UIColor colorWithRed:1 green:1 blue:1 alpha:1];
////    
////    plotter.plotType = EZPlotTypeBuffer;
////    isRendering = false;
////    
////    NSLog(@"%@ created an EZAudioPlotGL %@ %p",  NSStringFromClass([self class]), self.registered, plotter);
////
////    self.plotter = plotter;
////    [self addSubview:self.plotter];
////    [self layoutSubviews];
//
//    [CATransaction commit];
//
//}


- (void) dealloc {
    if (self.plotter) {
        [self.plotter removeFromSuperview];
        self.plotter = nil;
    }
}


@end
