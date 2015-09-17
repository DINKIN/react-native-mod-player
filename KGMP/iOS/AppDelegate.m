/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"

#import "RCTRootView.h"
#import "MCQueueManager.h"
@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;
#if TARGET_IPHONE_SIMULATOR

  // Loading JavaScript code - uncomment the one you want.

  // OPTION 1
  // Load from development server. Start the server from the repository root:
  //
  // $ npm start
  //
  // To run on device, change `localhost` to the IP address of your computer, and make sure your computer and
  // iOS device are on the same Wi-Fi network.
  jsCodeLocation = [NSURL URLWithString:@"http://localhost:8081/jsx/index.ios.bundle"];

#else

  // OPTION 2
  // Load from pre-bundled file on disk. To re-generate the static bundle, run
  //
  // $ curl 'http://localhost:8081/jsx/index.ios.bundle?dev=false&minify=true' -o iOS/main.jsbundle
  //
  // and uncomment the next following line

   jsCodeLocation  = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
                                                   
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"KGMP"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
    
//  
//
//  [qMgr getRandomFile];
//    [qMgr getDirectories];
//    [qMgr getFilesForDirectory:@"uCF/"];

  rootView.backgroundColor = [UIColor blackColor];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  
  UIViewController *rootViewController = [[UIViewController alloc] init];
  rootViewController.view = rootView;
  
    
  self.window.rootViewController = rootViewController;
  
  [self.window makeKeyAndVisible];
//  
//    for (id familyName in [UIFont familyNames]) {
//        NSLog(@"%@", familyName);
//        for (id fontName in [UIFont fontNamesForFamilyName:familyName]) {
//            NSLog(@"  %@", fontName);
//        }
//    }
  return YES;
}

@end
