//
//  RCEGamePlayerInterface.h
//  UIExplorer
//
//  Created by Jesus Garcia on 3/7/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "MCModPlayer.h"
#import "RCTBridgeModule.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
#import "MCQueueManager.h"
#import "MCDBManager.h"

@interface MCModPlayerInterface : NSObject <RCTBridgeModule>


@property int currentRow;
@property int currentPattern;
@property int currentOrder;
@property double then;
@property BOOL appActive;

+ (id)sharedManager;
- (void) audioRouteChanged:(NSNotification *)notification;
- (BOOL) isPlaying;
- (NSDictionary *) getGlobalModObject;

@end

