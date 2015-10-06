//
//  MCBridgedWebView.h
//  TestApp
//
//  Created by Jesus Garcia on 6/29/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "RCTWebView.h"
#import "RCTWebViewExecutor.h"

#import "RCTAutoInsetsProtocol.h"
#import "RCTEventDispatcher.h"
#import "RCTLog.h"
#import "RCTUtils.h"
#import "RCTView.h"
#import "UIView+React.h"

#import "RCTWebViewExecutor.h"

#import <WebKit/WebKit.h>


@interface MCBridgedWebView : RCTView  <WKUIDelegate, WKScriptMessageHandler, RCTAutoInsetsProtocol>

@property (nonatomic, strong) NSURL *URL;
@property (nonatomic, strong) NSString *LocalURL;

@property (nonatomic, assign) UIEdgeInsets contentInset;
@property (nonatomic, assign) BOOL shouldInjectAJAXHandler;
@property (nonatomic, assign) BOOL automaticallyAdjustContentInsets;

- (instancetype)initWithEventDispatcher:(RCTEventDispatcher *)eventDispatcher NS_DESIGNATED_INITIALIZER;


- (void)reload;
- (void)executeJSCall:(NSString *)method;
//- (void)executeJSCall:(NSString *)method arguments:(NSArray *)arguments;



@end
