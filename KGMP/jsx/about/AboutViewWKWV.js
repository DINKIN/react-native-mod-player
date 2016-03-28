
var React                 = require('react-native'),
    MCModPlayerInterface  = require('NativeModules').MCModPlayerInterface,
    // BridgedWKWebView      = require('../Extension/MCBridgedWebView'),
    CloseButton           = require('../player/accessories/CloseButton'),
    RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');
   

var {
        StyleSheet,
        View,
        TouchableOpacity,
    } = React;

var styles = StyleSheet.create({
    container : {
        flex        : 1,
        // borderWidth : 1,
        // borderColor : '#0000FF'
    },
    
    webView : {
        flex            : 1
    },

    closeButton : {
        // position    : 'absolute',
        marginTop : 30,
        // width       : 50,
        // borderWidth : 1,
        // borderColor : '#00FF00'
    }
});


//TODO: Convert to ES6
var AboutView = React.createClass({
    webViewRef : 'webview',
    patterns   : null,
    modObject  : null,

    render: function() {
        var modObject = this.props.modObject;

        this.modObject = modObject;
        this.patterns  = modObject.patterns;
        // console.log(modObject)

        // this.state.modFileLoaded = true;
        // this.setState(this.state);
        setTimeout(() => {
            MCModPlayerInterface.resume(() => {
                this.registerPatternUpdateHandler();
            });
        }, 1000);

        return (
            <View style={styles.container}>
                <View style={styles.closeButton}>
                    <CloseButton onPress={this.onClosebuttonPress}/>
                </View>
                <BridgedWKWebView ref={"webView"} style={styles.webView} localUrl={"cubetest.html"}/>
            </View>
        );
    },

    loadModFile : function() {
        MCModPlayerInterface.loadModusAboutMod(
            //failure
            (data) => {
                alert('Apologies. This file could not be loaded.');
                console.log(data);
            },        
            //success
            (modObject) => {
                this.state.modFileLoaded = true;

                this.afterLoadModFile(modObject);
                if (modObject) {

                    // modObject.directory = record.directory;

                    // var fileName = modObject.directory.split('/'),
                    //     rtBtnText,
                    //     rtBtnHandler;

                    // fileName = fileName[fileName.length - 1];

                    // modObject.fileName = fileName;
                   
                    // window.mainNavigator.push({
                    //     title            : 'Player',
                    //     component        : ListPlayer,
                    //     componentConfig  : {
                    //         ownerList : this,
                    //         modObject : modObject,
                    //         patterns  : modObject.patterns
                    //     }
                    // });

                }
                else {
                    alert('Woah. Something hit the fan!');
                }

            }
        );
    },


    onClosebuttonPress : function() {
        this.deregisterPatternUpdateHandler();
        MCModPlayerInterface.pause(() => {
            window.mainNavigator.pop();

        });
    },


    deregisterPatternUpdateHandler : function() {
        if (this.patternUpdateHandler) {
            this.patternUpdateHandler.remove();
            this.patternUpdateHandler = null;
        }
    },

    registerPatternUpdateHandler : function() {
        if (this.patternUpdateHandler) {
            return;
        }

        this.patternUpdateHandler = RCTDeviceEventEmitter.addListener(
            'rowPatternUpdate',
            this.onPatternUpdateEvent
        );
    }, 

    jsCallArgs : [null, null, null],
 
    onPatternUpdateEvent : function(position) {
        // console.log(position[0],position[1],position[2],position[3])


        var order      = position[0], 
            pattNum    = position[1],
            rowNum     = position[2],
            numRows    = position[3],
            jsCallArgs = this.jsCallArgs,
            jsCall;

        var patterns = this.patterns,
            state    = this.state,
            pattern  = patterns[pattNum],
            row      = pattern[rowNum],
            channels = row.split('|');

        var chan3      = channels[2],
            chan3Split = chan3.split(' '),
            chan3Note  = chan3Split[0]

        var chan2      = channels[1],
            chan2Split = chan2.split(' '),
            chan2Note  = chan2Split[0];


        // console.log(channels[2])
        // console.log(chan0Split[0]);



        if (chan3Note == 'D#6') {
            jsCallArgs[0] = 250;
        }
        else {
            jsCallArgs[0] = null;
        }

        if (chan2Note == 'C-6') {
            jsCallArgs[2] = 50;
        }
        else {
            jsCallArgs[2] = null;
        }


        jsCall = 'u(' +  jsCallArgs[0] + ',' + jsCallArgs[1] + ',' + jsCallArgs[2] + ')';

        this.refs.webView.execJsCall(jsCall);

        
        return;
        this.refs.summaryCard.setState({
            order   : position[0],
            pattern : position[1],
            row     : position[2],
            numRows : position[3]
        });

        return;
        /** For the pattern view, which is disabled for now **/
        var order   = position[0], 
            pattern = position[1],
            row     = position[2],
            numRows = position[3];

        var patterns       = this.patterns,
            state          = this.state,
            currentPattern = state.currentPattern,
            targetPattern  = patterns[pattern]; 

        if (state.playingSong == 0) {
            return;
        }

        if (this.modObject) {

            var positionOrder  = position[0],
                positionPattrn = position[1],
                positionRow    = position[2];
            
            if (patterns && position.pat != state.currentPattern) {
                
                var pattern = patterns[positionPattrn];

                if (! pattern) {
                    return;
                }

                var row = pattern[positionRow];
                
                state.currentPattern = positionPattrn;
            }

            state.currentRow = positionRow;
            this.setState(state);
        }

    }
});

module.exports = AboutView;

