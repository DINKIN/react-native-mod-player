
var React            = require('react-native'),
    MCBridgedWebView = require('../Extension/MCBridgedWebView');

var {
        StyleSheet,
        View,
        TouchableOpacity
    } = React;

var styles = StyleSheet.create({
    container : {
        flex        : 1,
        // borderWidth : 1,
        // borderColor : '#FF0000'
    },

    webView : {
        backgroundColor : 'rgba(0,0,0,0)',
        height          : 350,
        flex            : 1
    }
});


var BridgedWKWebView = React.createClass({
    getInitialState: function() {
        return {
        // url: DEFAULT_URL,
            localUrl : 'cubetest.html'
        };
    },

    render: function() {

        // if (! this.state.js) {
        //     setTimeout(() => {
                
        //     }, 1000)  
        // }


        return (
            <View style={styles.container}>
                <MCBridgedWebView
                    ref={"webView"}
                    automaticallyAdjustContentInsets={false}
                    style={styles.webView}
                    localUrl={this.state.localUrl}
                    javaScriptEnabledAndroid={true}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                />
            </View>
        );
    },

    execJsCall : function(jsCall) {
        // console.log('BridgedWKWebView.execJsCall ' + jsCall)
        this.refs.webView.execJsCall(jsCall);
    }
});

module.exports = BridgedWKWebView;

