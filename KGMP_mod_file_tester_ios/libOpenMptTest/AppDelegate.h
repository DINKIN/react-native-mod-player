//
//  AppDelegate.h
//  libXmpTest
//
//  Created by Jesus Garcia on 4/10/15.
//  Copyright (c) 2015 Jesus Garcia. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "OpenMptPlayer.h"

@interface AppDelegate : UIResponder <UIApplicationDelegate> {
    OpenMptPlayer *player;
}

@property (strong, nonatomic) UIWindow *window;


@end

