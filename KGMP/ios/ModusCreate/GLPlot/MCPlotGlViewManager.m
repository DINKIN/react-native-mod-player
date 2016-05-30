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


RCT_EXPORT_MODULE()

- (UIView *)view {
//    NSLog(@"%@ %@",  NSStringFromClass([self class]),  NSStringFromSelector(_cmd));
    MCPlotGlView *view = [MCPlotGlView new];
    return view;
}
//
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
    MCModPlayer *player = [MCModPlayer sharedManager];
    
    //    NSLog(@"%@ view %p self = %p, %p", json, view, self, self);
    view.registered = json;

//    NSLog(@"%@ %@",  NSStringFromClass([self class]),  NSStringFromSelector(_cmd));
    if ([json isEqualToString:@"l"]) {
        self.ltView = view;
    }
    
    if ([json isEqualToString:@"r"]) {
        self.rtView = view;
    }
    
    
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
}



// Used by the delegate
-(void) updateLeft:(float *)leftBuffer andRight:(float *)rightBuffer  withNumFrames:(int)nFrames {

    if (self.ltView && self.rtView) {
        [self.ltView update:leftBuffer  withSize:nFrames];
        [self.rtView update:rightBuffer withSize:nFrames];
    }
}

@end
