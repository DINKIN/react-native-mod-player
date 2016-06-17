//
//  EZPlotGlView.m
//  UIExplorer
//
//  Created by Jesus Garcia on 3/8/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "MCPlotGlView.h"
#import "RCTViewManager.h"
#import "UIView+React.h"
#import "RCTAutoInsetsProtocol.h"

#import "MCModPlayer.h"


@implementation MCPlotGlView {
    UIColor *lineColor;
    __weak RCTBridge *_bridge;
}

- (instancetype)initWithFrame:(CGRect)frame {
    if (self == [super initWithFrame:frame]) {
//        NSLog(@"%p %@ initWithFrame %@",  self, NSStringFromClass([self class]), NSStringFromCGRect(frame));

        EZAudioPlot *plotter = [[EZAudioPlot alloc] initWithFrame:frame];

        plotter.plotType = EZPlotTypeBuffer;
        plotter.rollingHistoryLength = 128;
        
//        NSLog(@"%p %@ created an EZAudioPlotGL %@ %p",  self, NSStringFromClass([self class]), self.registered, plotter);
        self.plotter = plotter;
        [self addSubview:self.plotter];

    }

    return self;
}

// Called via manager
- (void) update:(float[])data withSize:(int)size {

    if (self.plotter) {
        typeof(self) weakSelf = self;

        dispatch_async(dispatch_get_main_queue(), ^{
            if (weakSelf.plotter) {
                [weakSelf.plotter updateBuffer:data withBufferSize:size];
            }
        });
    
    }
}

- (void)layoutSubviews {
    self.plotter.frame = self.bounds;
    [super layoutSubviews];
}

- (void) setNewLineColor:(UIColor * _Nullable)color {
    if (self.plotter) {
        self.plotter.color = color;
    }
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
}

- (void) setRegistered:(NSString *)registered {
    
//    NSLog(@"setRegistered %@", registered);
    
    if ([registered isEqualToString:@"l"]) {
        [[MCModPlayer sharedManager] setLeftDelegate:self];

    }
    else if ([registered isEqualToString:@"r"]) {
        [[MCModPlayer sharedManager] setRightDelegate:self];
    }
    
    _registered = registered;
}


- (void) dealloc {
    if (self.plotter) {
//        NSLog(@"%@ ------ DESTROYING an EZAudioPlotGL %@ %p",  NSStringFromClass([self class]), self.registered, self.plotter);
//        if ([self.registered isEqualToString:@"l"]) {
////            [[MCModPlayer sharedManager] setLeftDelegate:nil];
//        }
//        else if ([self.registered isEqualToString:@"r"]) {
////            [[MCModPlayer sharedManager] setRightDelegate:nil];
//
//        }
//        [self.plotter removeFromSuperview];
//        self.plotter = nil;
    }
}


@end
