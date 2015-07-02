
var React                 = require('react-native'),
    BridgedWKWebView      = require('./BridgedWKWebView'),
    CloseButton           = require('../player/CloseButton'),
    MCModPlayerInterface  = require('NativeModules').MCModPlayerInterface,
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


var AboutView = React.createClass({
    webViewRef : 'webview',
    patterns : null,
    modObject : null,

    getInitialState: function() {
        return {
        // url: DEFAULT_URL,
            localUrl : 'cubetest.html'
        };
    },

    render: function() {
        var state = this.state;

        if (! this.state.modFileLoaded) {
            this.loadModFile();
        }

        var webView = state.modFileLoaded ? (<BridgedWKWebView ref={"webView"} style={styles.webView}/>) : null;


        return (
            <View style={styles.container}>
                <View style={styles.closeButton}>
                    <CloseButton onPress={this.onClosebuttonPress}/>
                </View>
                {webView}
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

                    // modObject.path = record.path;

                    // var fileName = modObject.path.split('/'),
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

    afterLoadModFile : function(modObject) {
        this.modObject = modObject;
        this.patterns  = modObject.patterns;
        console.log(modObject)
        this.state.modFileLoaded = true;
        this.setState(this.state);
        MCModPlayerInterface.resume(() => {
            this.registerPatternUpdateHandler();
        });


    },

    onClosebuttonPress : function() {
        this.deregisterPatternUpdateHandler();
        window.mainNavigator.pop();
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

 
    onPatternUpdateEvent : function(position) {
        // console.log(position[0],position[1],position[2],position[3])


        var order   = position[0], 
            pattNum = position[1],
            rowNum  = position[2],
            numRows = position[3];

        var patterns = this.patterns,
            state    = this.state,
            pattern  = patterns[pattNum],
            row      = pattern[rowNum],
            channels = row.split('|');

        var chan      = channels[2],
            chanSplit = chan.split(' '),
            note      = chanSplit[0],
            jsCall;

        // console.log(channels[2])
        // console.log(chan0Split[0]);

        if (note == 'D#6') {
            jsCall = "particleCount = 200; particles.drawcalls[ 0 ].count = particleCount;";
        }
        else {
            jsCall = "particleCount = 50; particles.drawcalls[ 0 ].count = particleCount;";
        }




        var wv = this.refs.webView;


        // debugger;
        // this.state.js = true;
        // var call = "particleCount = 200;particles.drawcalls[ 0 ].count = particleCount;";
        wv.execJsCall(jsCall);

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

    }});

module.exports = AboutView;

