
var React                 = require('react-native'),
    MCModPlayerInterface  = require('NativeModules').MCModPlayerInterface,
    // BridgedWKWebView      = require('../Extension/MCBridgedWebView'),
    CloseButton           = require('../player/accessories/CloseButton'),
    RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');
   

var mLogo = require('image!mlogo_tiny');

var {
        StyleSheet,
        View,
        TouchableOpacity,
        Image,
        Text,
        TouchableWithoutFeedback,
        LinkingIOS
    } = React;

var isIphone4 = (window.height == 480);

var styles = StyleSheet.create({
    container : {
        flex        : 1,
        backgroundColor : '#000000'
        // borderWidth : 1,
        // borderColor : '#0000FF'
    },


    closeButton : {
        // position    : 'absolute',
        marginTop : 25,
        // width       : 50,
        // borderWidth : 1,
        // borderColor : '#00FF00'
    },
    aboutCt : {
        flex : 1,
        paddingTop : isIphone4 ? 0 : 40 
        // borderWidth : 1,
        // borderColor : '#AEAEAE'
    },

    titleRed : {
        fontFamily : 'PerfectDOSVGA437Win', 
        fontSize   : 45,
        fontWeight : 'bold',
        color      : '#FF0000'
    },

    titleGreen : {
        fontFamily : 'PerfectDOSVGA437Win', 
        fontSize   : 45,
        color      : '#00FF00'
    },

    aboutText : {
        color      : '#AEAEAE', 
        fontSize   : 24, 
        fontFamily : 'PerfectDOSVGA437Win'
    },

    aboutTextTitle : {
        color      : '#FFFFFF', 
        fontSize   : 24, 
        fontFamily : 'PerfectDOSVGA437Win'
    },

    imgCenterCt : { 
        flexDirection : 'row', 
        alignItems : 'center', 
        justifyContent : 'center'
    },

    twitterFont : {
        fontFamily : 'fontello',
        fontSize : 18,
        color : '#4099FF',
        marginRight : 15
    }
});


//TODO: Convert to ES6
var AboutView = React.createClass({
    webViewRef : 'webview',
    patterns   : null,
    modObject  : null,

    render: function() {

        var kgmStyle = {
                flexDirection:'row', 
                justifyContent : 'center', 
                paddingTop : isIphone4 ? 0 : 30
            },
            playerStyle = {
                flexDirection:'row', 
                justifyContent : 'center', 
                marginBottom : isIphone4 ? 0 : 40
            },
            developedByStyle = {
                alignItems : 'center', 
                marginTop : isIphone4 ? 30 : 50,
                marginBottom : isIphone4 ? 35 : 65
            }


        return (
            <View style={styles.container}>
                <View style={styles.closeButton}>
                    <CloseButton onPress={this.onClosebuttonPress}/>
                </View>
                <View style={styles.aboutCt}>   
                    <View style={kgmStyle}>
                        <Text style={styles.titleRed}>K</Text>
                        <Text style={styles.titleGreen}>ey</Text>
                        <Text style={styles.titleRed}>G</Text>
                        <Text style={styles.titleGreen}>en</Text>
                        <Text style={[styles.titleRed, {marginLeft: 10}]}>M</Text>
                        <Text style={styles.titleGreen}>usic</Text>
                    </View>

                    <View style={playerStyle}>
                        <Text style={styles.titleRed}>P</Text>
                        <Text style={styles.titleGreen}>layer</Text>
                    </View>

                    <View style={developedByStyle}>
                        <Text style={styles.aboutTextTitle}>Lovingly developed by:</Text>
                        <TouchableWithoutFeedback onPress={this.onJayPress}>
                            <View style={styles.imgCenterCt}>
                                <Text style={styles.twitterFont}>{'\uE828'}</Text>
                                <Text style={styles.aboutText}>Jay Garcia</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View> 
                    <View style={{alignItems : 'center'}}>
                        <Text style={styles.aboutTextTitle}>The KGMP Support Team:</Text>
                        <TouchableWithoutFeedback onPress={this.onStanPress}>
                            <View style={styles.imgCenterCt}>
                                <Text style={styles.twitterFont}>{'\uE828'}</Text>
                                <Text style={styles.aboutText}>Stan Bershadskiy</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={this.onMikePress}>
                            <View style={styles.imgCenterCt}>
                                <Text style={styles.twitterFont}>{'\uE828'}</Text>
                                <Text style={styles.aboutText}>Mike Schwartz</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={this.onGrgurPress}>
                            <View style={styles.imgCenterCt}>
                                <Text style={styles.twitterFont}>{'\uE828'}</Text>
                                <Text style={styles.aboutText}>Grgur Grisogono</Text>
                            </View>
                        </TouchableWithoutFeedback>                        
                    </View>                        
                </View>
                <View style={{ alignItems : 'center', justifyContent : 'center', height : 105}}>
                    <Text style={styles.aboutText}>Sponsored By:</Text>
                    <TouchableWithoutFeedback onPress={this.onModusPress}>
                        <View style={styles.imgCenterCt}>
                            <Image style={{marginRight : 10}} source={mLogo} />
                            <Text style={{color:'#FFFFFF', fontFamily : 'PerfectDOSVGA437Win', fontWeight : 'bold', fontSize : 24, marginTop: 12}}>Modus Create</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        );
    },



    onClosebuttonPress : function() {
        window.mainNavigator.pop();

    },

    onModusPress : function() {
        LinkingIOS.openURL('http://moduscreate.com');
    },
    onJayPress : function() {
        LinkingIOS.openURL('https://twitter.com/ModusJesus');
    },
    onStanPress : function() {
        LinkingIOS.openURL('https://twitter.com/stan229');
    },
    onGrgurPress : function() {
        LinkingIOS.openURL('https://twitter.com/ggrgur');
    },
    onMikePress : function() {
        LinkingIOS.openURL('https://twitter.com/ModusSchwartz');
    }
});

module.exports = AboutView;

