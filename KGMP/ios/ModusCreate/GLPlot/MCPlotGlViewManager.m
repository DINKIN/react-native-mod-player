;//
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

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE()

- (UIView *)view {
//    NSLog(@"%@ %@",  NSStringFromClass([self class]),  NSStringFromSelector(_cmd));
    MCPlotGlView *view = [MCPlotGlView new];
    return view;
}


RCT_EXPORT_VIEW_PROPERTY(plotterType, NSString);
RCT_EXPORT_VIEW_PROPERTY(shouldMirror, BOOL);
RCT_EXPORT_VIEW_PROPERTY(shouldFill, BOOL);

RCT_CUSTOM_VIEW_PROPERTY(lineColor, NSString, MCPlotGlView) {
    [view setNewLineColor:[RCTConvert UIColor:json]];
}

RCT_CUSTOM_VIEW_PROPERTY(backgroundColor, NSString, MCPlotGlView) {
    [view setNewBackgroundColor:[RCTConvert UIColor:json]];
}



RCT_CUSTOM_VIEW_PROPERTY(side, BOOL, MCPlotGlView) {
//    NSLog(@"%@ MCPlotGlView %p self = %p, %p", json, view, self, self);
    view.registered = json;

}

// Used by the delegate
-(void) updateLeft:(float *)leftBuffer andRight:(float *)rightBuffer  withNumFrames:(int)nFrames {

//    if (self.ltView && self.rtView) {
//        [self.ltView update:leftBuffer  withSize:nFrames];
//        [self.rtView update:rightBuffer withSize:nFrames];
//    }
}

// Used by the view. Bad practice? probably.
-(void) clearUpdateDelegate {
//    [[MCModPlayer sharedManager] setDelegate:nil];

}

@end
