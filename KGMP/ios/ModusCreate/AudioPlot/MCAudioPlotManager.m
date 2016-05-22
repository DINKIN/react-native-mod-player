//
//  MCAudioPlotManager.m
//  KGMP
//
//  Created by Jesus Garcia on 5/22/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "MCAudioPlotManager.h"

#import "RCTBridge.h"
#import "MCAudioPlot.h"
#import "RCTEventDispatcher.h"
#import "UIView+React.h"




@implementation MCAudioPlotManager

RCT_EXPORT_MODULE()

- (id) init {
    NSLog(@"MCAudioPlotManager init();");
    if (self = [super init]) {
        return self;
    }
    
    return  nil;
}

- (UIView *)view {
  return [[MCAudioPlot alloc] init];
}


@end



