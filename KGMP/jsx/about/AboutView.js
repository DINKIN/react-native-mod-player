
var React                 = require('react-native'),
    MCModPlayerInterface  = require('NativeModules').MCModPlayerInterface,
    BridgedWKWebView      = require('../Extension/MCBridgedWebView'),
    CloseButton           = require('../player/accessories/CloseButton'),
    RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');
   

var mLogo = require('image!mlogo_medium');

var {
        StyleSheet,
        View,
        TouchableOpacity,
        Image,
        Text
    } = React;

var styles = StyleSheet.create({
    container : {
        flex        : 1,
        // borderWidth : 1,
        // borderColor : '#0000FF'
    },


    closeButton : {
        // position    : 'absolute',
        marginTop : 30,
        // width       : 50,
        // borderWidth : 1,
        // borderColor : '#00FF00'
    },
    aboutCt : {
        flex : 1,
        borderWidth : 1,
        borderColor : '#AEAEAE'
    }
});


//TODO: Convert to ES6
var AboutView = React.createClass({
    webViewRef : 'webview',
    patterns   : null,
    modObject  : null,

    render: function() {

        return (
            <View style={styles.container}>
                <View style={styles.closeButton}>
                    <CloseButton onPress={this.onClosebuttonPress}/>
                </View>
                <View style={styles.aboutCt}>
                    <Image source={mLogo} />
                </View>
            </View>
        );
    },



    onClosebuttonPress : function() {
        window.mainNavigator.pop();

    }
});

module.exports = AboutView;

