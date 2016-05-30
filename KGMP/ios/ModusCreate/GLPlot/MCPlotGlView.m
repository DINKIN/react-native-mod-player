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
#import "UIView+React.h"
#import "RCTAutoInsetsProtocol.h"

@implementation MCPlotGlView {
    UIColor *lineColor;
}


// Called via manager
- (void) update:(float[])data withSize:(int)size {

    if (self.plotter) {
        __weak typeof (self) weakSelf = self;

//       NSDate *date = [NSDate date];
        dispatch_async(dispatch_get_main_queue(), ^{
//            printf("%f\n", [date timeIntervalSinceNow] * -1000.0);

            [weakSelf.plotter updateBuffer:data withBufferSize:size];
        });
    
    }
}

- (instancetype)initWithFrame:(CGRect)frame {
    if (self == [super initWithFrame:frame]) {
        NSLog(@"%p %@ initWithFrame %@",  self, NSStringFromClass([self class]), NSStringFromCGRect(frame));

        EZAudioPlot *plotter = [[EZAudioPlot alloc] initWithFrame:frame];

        plotter.plotType = EZPlotTypeBuffer;
        plotter.rollingHistoryLength=128;
        
        NSLog(@"%p %@ created an EZAudioPlotGL %@ %p",  self, NSStringFromClass([self class]), self.registered, plotter);
        self.plotter = plotter;
        [self addSubview:self.plotter];

    }

    return self;
}


- (void)layoutSubviews {
//    NSLog(@"%p %@ layoutSubviews %@",  self, NSStringFromClass([self class]), self.registered);
//
//    NSLog(@"%@", @{
//        @"bounds"    : NSStringFromCGRect(self.bounds),
//        @"transform" : NSStringFromCGAffineTransform(self.transform),
//        @"frame"     : NSStringFromCGRect(self.frame)
//    });

//    self.plotter.bounds = self.bounds;
    self.plotter.frame = self.bounds;
//    self.plotter.transform = self.transform;
//    [self.plotter sizeThatFits:self.bounds.size];
    [super layoutSubviews];
    
//    NSDictionary *sizes2 = @{
//        @"bounds"    : NSStringFromCGRect(self.plotter.bounds),
//        @"transform" : NSStringFromCGAffineTransform(self.plotter.transform),
//        @"frame"     : NSStringFromCGRect(self.plotter.frame)
//    };
//    
//    NSLog(@"self.plotter %@ %@", self.registered, sizes2);
//    
}

- (void) setNewLineColor:(UIColor * _Nullable)color {
    if (self.plotter) {
        self.plotter.color = color;
    }
//    NSLog(@"setLineColor %@", color);
}

- (void) setShouldMirror:(BOOL *)shouldMirror {
    if (self.plotter) {
        self.plotter.shouldMirror = shouldMirror;
    }
}

- (void) setShouldFill:(BOOL *)shouldFill {
    if (self.plotter) {
        self.plotter.shouldFill = shouldFill;
    }
}

- (void) setPlotterType:(NSString *)plotterType {
    if ([plotterType isEqualToString:@"rolling"]) {
        self.plotter.plotType = EZPlotTypeRolling;
    }
    else {
        self.plotter.plotType = EZPlotTypeBuffer;
    }
}



- (void) setNewBackgroundColor:(UIColor * _Nullable)color {

    if (self.plotter) {
        self.plotter.backgroundColor = color;
    }
//    NSLog(@"setNewBackgroundColor %@", color);
}


- (void) dealloc {
    if (self.plotter) {
        NSLog(@"%@ DESTROYING an EZAudioPlotGL %@ %p",  NSStringFromClass([self class]), self.registered, self.plotter);
        [self.plotter removeFromSuperview];
        self.plotter = nil;
    }
}


@end
