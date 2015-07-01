/*
    This class was mostly copied from RCTWebView because of it's current design, where the _webview
    instance variable is private, preventing us from extending RCTWebView directly so that we can 
    inject an executor (RCTWebViewExecutor).
*/
'use strict';

var ActivityIndicatorIOS = require('ActivityIndicatorIOS'),
    EdgeInsetsPropType   = require('EdgeInsetsPropType'),
    React                = require('React'),
    StyleSheet           = require('StyleSheet'),
    Text                 = require('Text'),
    View                 = require('View');

var invariant              = require('invariant'),
    keyMirror              = require('keyMirror'),
    requireNativeComponent = require('requireNativeComponent');

var PropTypes               = React.PropTypes,
    MCBridgedWebViewManager = require('NativeModules').MCBridgedWebViewManager;

var BGWASH          = 'rgba(255,255,255,0.8)',
    RCT_WEBVIEW_REF = 'webview';

var MCBridgedWebViewState = keyMirror({
    IDLE    : null,
    LOADING : null,
    ERROR   : null,
});

var NavigationType = {
    click        : MCBridgedWebViewManager.NavigationType.LinkClicked,
    formsubmit   : MCBridgedWebViewManager.NavigationType.FormSubmitted,
    backforward  : MCBridgedWebViewManager.NavigationType.BackForward,
    reload       : MCBridgedWebViewManager.NavigationType.Reload,
    formresubmit : MCBridgedWebViewManager.NavigationType.FormResubmitted,
    other        : MCBridgedWebViewManager.NavigationType.Other,
};

type ErrorEvent = {
  domain      : any;
  code        : any;
  description : any;
}

type Event = Object;

var defaultRenderLoading = () => (
    <View style={styles.loadingView}>
        <ActivityIndicatorIOS />
    </View>
);

var defaultRenderError = (errorDomain, errorCode, errorDesc) => (
    <View style={styles.errorContainer}>
        <Text style={styles.errorTextTitle}>
            Error loading page
        </Text>
        <Text style={styles.errorText}>
            {'Domain: ' + errorDomain}
        </Text>
        <Text style={styles.errorText}>
            {'Error Code: ' + errorCode}
        </Text>
        <Text style={styles.errorText}>
            {'Description: ' + errorDesc}
        </Text>
    </View>
);

var BridgedWebView = React.createClass({
    statics: {
        NavigationType: NavigationType,
    },

    propTypes: {
        url: PropTypes.string,
        localUrl: PropTypes.string,
        html: PropTypes.string,
        renderError: PropTypes.func, // view to show if there's an error
        renderLoading: PropTypes.func, // loading indicator to show
        bounces: PropTypes.bool,
        scrollEnabled: PropTypes.bool,
        automaticallyAdjustContentInsets: PropTypes.bool,
        shouldInjectAJAXHandler: PropTypes.bool,
        contentInset: EdgeInsetsPropType,
        onNavigationStateChange: PropTypes.func,
        startInLoadingState: PropTypes.bool, // force MCBridgedWebView to show loadingView on first load
        style: View.propTypes.style,
        /**
         * Used for android only, JS is enabled by default for MCBridgedWebView on iOS
         */
        javaScriptEnabledAndroid: PropTypes.bool,
        /**
         * Used for iOS only, sets whether the webpage scales to fit the view and the
         * user can change the scale
         */
        scalesPageToFit: PropTypes.bool,
    },

    getInitialState: function() {
        return {
            viewState: MCBridgedWebViewState.IDLE,
            lastErrorEvent: (null: ?ErrorEvent),
            startInLoadingState: true,
        };
    },

    componentWillMount: function() {
        if (this.props.startInLoadingState) {
            this.setState({viewState: MCBridgedWebViewState.LOADING});
        }
    },

    render: function() {
        var otherView = null;

        if (this.state.viewState === MCBridgedWebViewState.LOADING) {
            otherView = (this.props.renderLoading || defaultRenderLoading)();
        } 
        else if (this.state.viewState === MCBridgedWebViewState.ERROR) {
            var errorEvent = this.state.lastErrorEvent;
           
            invariant(
                errorEvent != null,
                'lastErrorEvent expected to be non-null'
            );
            
            otherView = (this.props.renderError || defaultRenderError)(
                errorEvent.domain,
                errorEvent.code,
                errorEvent.description
            );
        } 
        else if (this.state.viewState !== MCBridgedWebViewState.IDLE) {
            console.error(
                'MCBridgedWebView invalid state encountered: ' + this.state.loading
            );
        }

        var webViewStyles = [styles.container, styles.webView, this.props.style];
        
        if (this.state.viewState === MCBridgedWebViewState.LOADING ||
            this.state.viewState === MCBridgedWebViewState.ERROR) {
            // alert('hiding')
            // if we're in either LOADING or ERROR states, don't show the webView
            // webViewStyles.push(styles.hidden);
        }

        console.log(this.props)
        return (
            <View style={styles.container}>
                <MCBridgedWebView
                    ref={RCT_WEBVIEW_REF}
                    key="webViewKey"
                    style={webViewStyles}
                    url={this.props.url}
                    localUrl={this.props.localUrl}
                    html={this.props.html}
                    bounces={this.props.bounces}
                    scrollEnabled={this.props.scrollEnabled}
                    shouldInjectAJAXHandler={this.props.shouldInjectAJAXHandler}
                    contentInset={this.props.contentInset}
                    automaticallyAdjustContentInsets={this.props.automaticallyAdjustContentInsets}
                    onLoadingStart={this.onLoadingStart}
                    onLoadingFinish={this.onLoadingFinish}
                    onLoadingError={this.onLoadingError}
                    scalesPageToFit={this.props.scalesPageToFit}
                />
            </View>
        );
    },

    goForward: function() {
        MCBridgedWebViewManager.goForward(this.getWebWiewHandle());
    },

    goBack: function() {
       MCBridgedWebViewManager.goBack(this.getWebWiewHandle());
    },

    reload: function() {
       MCBridgedWebViewManager.reload(this.getWebWiewHandle());
    },

    /**
     * We return an event with a bunch of fields including:
     *  url, title, loading, canGoBack, canGoForward
     */
    updateNavigationState: function(event: Event) {
        if (this.props.onNavigationStateChange) {
          this.props.onNavigationStateChange(event.nativeEvent);
       }
    },

    getWebWiewHandle: function(): any {
        return React.findNodeHandle(this.refs[RCT_WEBVIEW_REF]);
    },

    onLoadingStart: function(event: Event) {
        this.updateNavigationState(event);
    },

    onLoadingError: function(event: Event) {
        event.persist(); // persist this event because we need to store it
        console.error('Encountered an error loading page', event.nativeEvent);

        this.setState({
            lastErrorEvent: event.nativeEvent,
            viewState: MCBridgedWebViewState.ERROR
        });
    },

    onLoadingFinish: function(event: Event) {
        this.setState({
            viewState: MCBridgedWebViewState.IDLE,
        });

        this.updateNavigationState(event);
    },

    execJsCall : function(jsCallAsString) {
        console.log('execJsCall(%s)', jsCallAsString);
        MCBridgedWebViewManager.exec(this.getWebWiewHandle(), jsCallAsString);
 
    }
});


var styles = StyleSheet.create({
  container: {
    flex: 1,
    // borderWidth : 1,
    // borderColor : '#00FF00'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BGWASH,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 2,
  },
  errorTextTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 10,
  },
  hidden: {
    height: 0,
    flex: 0, // disable 'flex:1' when hiding a View
  },
  loadingView: {
    backgroundColor: BGWASH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webView: {
    backgroundColor: '#ffffff',
  }
});

var MCBridgedWebView = requireNativeComponent('MCBridgedWebView', BridgedWebView);
module.exports = BridgedWebView;
