//
//  MCBridgedWebViewManager.m
//  TestApp
//
//  Created by Jesus Garcia on 6/29/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "MCBridgedWebViewManager.h"


@implementation MCBridgedWebViewManager

RCT_EXPORT_MODULE();

RCT_REMAP_VIEW_PROPERTY(url, URL, NSURL);
RCT_REMAP_VIEW_PROPERTY(localUrl, LocalURL, NSString);
RCT_REMAP_VIEW_PROPERTY(html, HTML, NSString);

RCT_REMAP_VIEW_PROPERTY(bounces, _webView.scrollView.bounces, BOOL);
RCT_REMAP_VIEW_PROPERTY(scrollEnabled, _webView.scrollView.scrollEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(contentInset, UIEdgeInsets);
RCT_EXPORT_VIEW_PROPERTY(automaticallyAdjustContentInsets, BOOL);
RCT_EXPORT_VIEW_PROPERTY(shouldInjectAJAXHandler, BOOL);

- (UIView *)view {
    NSLog(@"MCBridgedWebViewManager view()");
    return [[MCBridgedWebView alloc] initWithEventDispatcher:self.bridge.eventDispatcher];
}

-(NSArray *) customDirectEventTypes {
    return @[
        @"onWkWebViewEvent"
    
    ];
}


RCT_EXPORT_METHOD(exec:(nonnull NSNumber *)reactTag JSCall:(NSString *)jsCall)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
        id view = viewRegistry[reactTag];
        
        if (![view isKindOfClass:[MCBridgedWebView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting MCBridgedWebView, got: %@", view);
        }

        [view executeJSCall:jsCall];
    }];
}



/*
- (void)executeJSCall:(NSString *)name
               method:(NSString *)method
            arguments:(NSArray *)arguments
              context:(NSNumber *)executorID
             callback:(RCTJavaScriptCallback)onComplete
{
*/
@end
