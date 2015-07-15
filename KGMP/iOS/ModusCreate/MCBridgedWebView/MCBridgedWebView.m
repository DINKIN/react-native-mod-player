//
//  MCBridgedWebView.m
//
//  Created by Jesus Garcia on 6/29/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

/*
    This class was mostly copied from RCTWebView because of it's current design, where the _webview
    instance variable is private, preventing us from extending RCTWebView directly so that we can 
    inject an executor (RCTWebViewExecutor).
*/


#import "MCBridgedWebView.h"

@class RCTEventDispatcher;


@implementation MCBridgedWebView {
  RCTEventDispatcher *_eventDispatcher;
  WKWebView *_webView;
  
  RCTWebViewExecutor *_executor;
}

- (instancetype)initWithEventDispatcher:(RCTEventDispatcher *)eventDispatcher {
  NSLog(@"MCBridgedWebView.h initWithEventDispatcher");
  if ((self = [super initWithFrame:CGRectZero])) {
    super.backgroundColor = [UIColor clearColor];
    _automaticallyAdjustContentInsets = YES;
    _contentInset = UIEdgeInsetsZero;
    _eventDispatcher = eventDispatcher;
    
    WKWebViewConfiguration *wkConfig = [[WKWebViewConfiguration alloc] init];
    [wkConfig.userContentController addScriptMessageHandler:self name:@"bridge"];

    _webView = [[WKWebView alloc] initWithFrame:self.bounds configuration:wkConfig];
    
//    _webView.delegate = self;
    
//    _executor = [[RCTWebViewExecutor alloc] initWithWebView:_webView];
    _webView.scrollView.scrollEnabled = false;
    
    [self addSubview:_webView];
  }
  return self;
}


- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message{
    NSDictionary *event = @{
        @"target" : self.reactTag,
        @"body"   : message.body
    };
    
    [_eventDispatcher sendInputEventWithName:@"wkWebViewEvent" body:event];

    NSLog(@"wkwv message %@", message.body);
}



- (void)executeJSCall:(NSString *)method {// method:(NSString *)method arguments:(NSArray *)arguments {
    NSLog(@"executeJSCall");
    
  [_webView evaluateJavaScript:method completionHandler:^(id result, NSError * error) {
      NSLog(@"Result -> %@", result);
      NSLog(@"Error -> %@", error);
  }];
  

}




- (void)setURL:(NSURL *)URL
{
  // Because of the way React works, as pages redirect, we actually end up
  // passing the redirect urls back here, so we ignore them if trying to load
  // the same url. We'll expose a call to 'reload' to allow a user to load
  // the existing page.
//  if ([URL isEqual:_webView.request.URL]) {
//    return;
//  }
  if (!URL) {
    // Clear the webview
    [_webView loadHTMLString:nil baseURL:nil];
    return;
  }
  
//  [_webView loadRequest:[NSURLRequest requestWithURL:URL]];
}

- (void) setLocalURL:(NSString *)fileToLoad {
    NSLog(@"setLocalURL(%@)", fileToLoad);
    
    NSString *bundlePath = [[NSBundle mainBundle] bundlePath];
    
    NSString *filePath = [NSString stringWithFormat:@"%@/webview-files/%@", bundlePath, fileToLoad];
    
    NSString *htmlString = [NSString stringWithContentsOfFile:filePath encoding:NSUTF8StringEncoding error:nil];

    self.HTML = htmlString ;
}

- (void)setHTML:(NSString *)HTML
{
 
    [_webView loadHTMLString:HTML baseURL:nil];
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  _webView.frame = self.bounds;
  [RCTView autoAdjustInsetsForView:self
                    withScrollView:_webView.scrollView
                      updateOffset:YES];
}

- (void)setContentInset:(UIEdgeInsets)contentInset
{
  _contentInset = contentInset;
  [RCTView autoAdjustInsetsForView:self
                    withScrollView:_webView.scrollView
                      updateOffset:NO];
}

- (void)setBackgroundColor:(UIColor *)backgroundColor
{
  CGFloat alpha = CGColorGetAlpha(backgroundColor.CGColor);
  self.opaque = _webView.opaque = (alpha == 1.0);
  _webView.backgroundColor = backgroundColor;
}

- (UIColor *)backgroundColor
{
  return _webView.backgroundColor;
}

- (NSMutableDictionary *)baseEvent
{
//  NSURL *url = _webView.request.URL;
  
  
  [_webView evaluateJavaScript:@"document.title" completionHandler:^(id Result, NSError * error) {
      NSLog(@"Error -> %@", error);
  }];
  
  
  
  NSMutableDictionary *event = [[NSMutableDictionary alloc] initWithDictionary: @{
    @"target": self.reactTag,
    @"url": @"",
    @"loading" : @(_webView.loading),
    @"title": @"",
    @"canGoBack": @([_webView canGoBack]),
    @"canGoForward" : @([_webView canGoForward]),
  }];

  return event;
}

#pragma mark - UIWebViewDelegate methods

static NSString *const RCTJSAJAXScheme = @"react-ajax";

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request
 navigationType:(UIWebViewNavigationType)navigationType
{
  // We have this check to filter out iframe requests and whatnot
  BOOL isTopFrame = [request.URL isEqual:request.mainDocumentURL];
  if (isTopFrame) {
    NSMutableDictionary *event = [self baseEvent];
    [event addEntriesFromDictionary: @{
      @"url": [request.URL absoluteString],
      @"navigationType": @(navigationType)
    }];
    [_eventDispatcher sendInputEventWithName:@"topLoadingStart" body:event];
  }

  // AJAX handler
  return ![request.URL.scheme isEqualToString:RCTJSAJAXScheme];
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error
{
  if ([error.domain isEqualToString:NSURLErrorDomain] && error.code == NSURLErrorCancelled) {
    // NSURLErrorCancelled is reported when a page has a redirect OR if you load
    // a new URL in the WebView before the previous one came back. We can just
    // ignore these since they aren't real errors.
    // http://stackoverflow.com/questions/1024748/how-do-i-fix-nsurlerrordomain-error-999-in-iphone-3-0-os
    return;
  }

  NSMutableDictionary *event = [self baseEvent];
  [event addEntriesFromDictionary: @{
    @"domain": error.domain,
    @"code": @(error.code),
    @"description": [error localizedDescription],
  }];
  [_eventDispatcher sendInputEventWithName:@"topLoadingError" body:event];
}

- (void)webViewDidFinishLoad:(UIWebView *)webView
{
  if (_shouldInjectAJAXHandler) {

    // From http://stackoverflow.com/questions/5353278/uiwebviewdelegate-not-monitoring-xmlhttprequest

    [webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"\
      var s_ajaxListener = new Object();                       \n\
      s_ajaxListener.tempOpen = XMLHttpRequest.prototype.open; \n\
      s_ajaxListener.tempSend = XMLHttpRequest.prototype.send; \n\
      s_ajaxListener.callback = function() {                   \n\
        window.location.href = '%@://' + this.url;             \n\
      }                                                        \n\
      XMLHttpRequest.prototype.open = function(a,b) {          \n\
        s_ajaxListener.tempOpen.apply(this, arguments);        \n\
        s_ajaxListener.method = a;                             \n\
        s_ajaxListener.url = b;                                \n\
        if (a.toLowerCase() === 'get') {                       \n\
          s_ajaxListener.data = (b.split('?'))[1];             \n\
        }                                                      \n\
      }                                                        \n\
      XMLHttpRequest.prototype.send = function(a,b) {          \n\
        s_ajaxListener.tempSend.apply(this, arguments);        \n\
        if (s_ajaxListener.method.toLowerCase() === 'post') {  \n\
          s_ajaxListener.data = a;                             \n\
        }                                                      \n\
        s_ajaxListener.callback();                             \n\
      }                                                        \n\
    ", RCTJSAJAXScheme]];
  }

  // we only need the final 'finishLoad' call so only fire the event when we're actually done loading.
  if (!webView.loading && ![webView.request.URL.absoluteString isEqualToString:@"about:blank"]) {
    [_eventDispatcher sendInputEventWithName:@"topLoadingFinish" body:[self baseEvent]];
  }
}

@end
