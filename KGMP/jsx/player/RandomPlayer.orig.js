'use strict';

var React = require('react-native');


var {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
    VibrationIOS
} = React;


// var MCAudioPlotGlView     = require('../Extension/MCAudioPlotGlView.js'),
var MCModPlayerInterface  = require('NativeModules').MCModPlayerInterface,
    SummaryCard           = require('./SummaryCard'),
    MusicControlButton    = require('./MusicControlButton'),
    RCTDeviceEventEmitter = require('RCTDeviceEventEmitter'),
    PatternView           = require('./PatternView'),
    RowNumberView         = require('./RowNumberView'),
    styles                = require('./AbstractPlayerStyles');





module.exports = React.createClass({
    data     : null,  // Used to paint out the view (song title, num tracks, etc)
    plotters : null,  // References to the child plotter instances (LibEzPlotGlView)

    dirInfo : null,

    rowID     : null,
    modObject : null, // used to override the props. TODO: figure out how to overwite props

    // Event handler function keys 
    commandCenterEventHandler : null, 
    patternUpdateHandler      : null,
    
    patterns : null, // used to store pattern data.
    gettingPatternData : false,

    props : {
        modObject : React.PropTypes.object,
        ownerList : React.PropTypes.object,
        patterns  : React.PropTypes.object
    },
   
    getInitialState : function() {
        return {
            songLoaded     : 0,
            playingSong    : 0,
            currentTime    : 0,
            currentRow     : 0,
            currentPattern : null
        }
    },

    render: function() {

        // debugger;
        var state     = this.state,
            props     = this.props,
            modObject = this.modObject || props.modObject,
            images    = [<SummaryCard data={modObject} onPress={this.onSummaryItemPress}/>],
            dictInfo  = props.dictInfo;

        var buttonChars = this.buttonChars,
            centerBtnChar,
            centerBtnStyle;

        if (state.playingSong) {
            centerBtnChar = "pause";
            centerBtnStyle = "pauseButton";
        }
        else {
            centerBtnChar = "play";
            centerBtnStyle = "playButton";
        }
        // <RCEzAudioPlotGlView style={styles.vizItem}/>

        var name = modObject.file_name ? modObject.file_name : modObject.fileName,
            pattern;

        if (state.currentPattern != null) {
            pattern = this.patterns[state.currentPattern];
        }
        else if (typeof  this.patterns != 'undefined'){
            state.currentPattern = modObject.currentPat;
            pattern = this.patterns[modObject.currentPat];
        }

        pattern = pattern || [];

        var newTopPosition;
      
        if (state.currentRow) {
            newTopPosition = {
                top : (508 / 2) - (state.currentRow * 11)
            }
        }

        return (
            <View style={styles.container}>
                <View style={styles.titleBar}>
                    <Text style={{fontSize: 16}}>{name}</Text>
                </View>

                <View style={styles.imageContainer}>
                    <View style={[styles.rowNumberz, newTopPosition]}>
                        <RowNumberView ref={"rowNumberView"} rows={pattern.length}/>
                    </View>
                    <View style={[styles.patternView, newTopPosition]}>
                        <PatternView ref={"patternView"} rows={pattern}/>
                    </View>
                    <View style={styles.playerBarTop}/>
                    <View style={styles.playerBarBottom}/>
                </View>

                <View style={styles.controlsContainer}>
                    <MusicControlButton onPress={this.onButtonPress} btnChar={"dislike"} btnStyle={"dislikeButton"} isLikeBtn={true}/>
                    <MusicControlButton onPress={this.onButtonPress} btnChar={"prev"} btnStyle={"prevButton"}/>
                    <MusicControlButton onPress={this.onButtonPress} btnChar={centerBtnChar} btnStyle={centerBtnStyle}/>
                    <MusicControlButton onPress={this.onButtonPress} btnChar={"next"} btnStyle={"nextButton"}/>
                    <MusicControlButton onPress={this.onButtonPress} btnChar={"like"} btnStyle={"likeButton"} isLikeBtn={true}/>
                </View>                     
            </View>
        );
    },

    onSummaryItemPress : function(fileTypeObj) {
        var wiki = fileTypeObj.wiki;

        if (wiki) {
            // debugger;
            this.props.navigator.showWebView(wiki);
        }
    },

    methodMap : {
        'prev'    : 'previousTrack',
        'next'    : 'nextTrack',
        'play'    : 'playTrack',
        'pause'   : 'pauseTrack',
        'like'    : 'like',
        'dislike' : 'dislike'
    },

    onButtonPress : function(buttonType) {
        var methodName = this.methodMap[buttonType];
        this[methodName] && this[methodName]();
    },

    onCommandCenterEvent : function(event) {

        console.log('onCommandCenterEvent ' + event.eventType);
                // debugger;

        switch(event.eventType) {
            case 'play' :
               this.playTrack();
            break;

            case 'pause' :
                this.pauseTrack();
            break;

            case 'nextTrack' :
                this.nextTrack();
            break;

            case 'previousTrack' :
                this.previousTrack();
            break;

            case 'seekBackward' : 
                // TODO
            break;

            case 'seekForward' : 
                // TODO
            break;

            default:

            break; 
        }    
    },

    componentWillMount : function() {
        this.patterns = this.props.patterns;

        this.commandCenterEventHandler = RCTDeviceEventEmitter.addListener(
            'commandCenterEvent',
            this.onCommandCenterEvent
        );

        this.modObject = this.props.modObject;
    },

    componentWillUnmount : function() {
        if (this.commandCenterEventHandler) {
            this.commandCenterEventHandler.remove();
            this.commandCenterEventHandler = null;
        }

        this.deregisterPatternUpdateHandler();
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
        var order   = position[0], 
            pattern = position[1],
            row     = position[2],
            numRows = position[3];


        // console.log('Ord: ' + order, ' Pat: ' + pattern, ' Row: ' + row, ' #Rows: ' + numRows);

        // return;
        var patterns       = this.patterns,
            state          = this.state,
            currentPattern = state.currentPattern,
            targetPattern  = this.patterns[pattern],
            shldGetPattern = (row >=  (numRows / 4)); 

        if (state.playingSong == 0) {
            return;
        }

        if (this.modObject) {

            var patterns = this.patterns,
                state    = this.state;

            var positionOrder  = position[0],
                positionPattrn = position[1],
                positionRow    = position[2];
            
            if (patterns && position.pat != state.currentPattern) {
                
                var pattern = patterns[positionPattrn];

                if (! pattern) {
                    // debugger;
                    console.log('no pattern! ' + positionPattrn);
                    return;
                }

                var row = pattern[positionRow];
                
                state.currentPattern = positionPattrn;
            }

            state.currentRow = positionRow;
            this.setState(state);
        }

    },

    // TODO: Merge into a single Next/Prev method for cleanliness
    previousTrack : function() {
        window.db.getPrevRandom((rowData) => {
            if (! rowData) {
                alert('Sorry. No more items in history.');
                return;
            }
            
            this.loadFile(rowData);
        });
    },
    // Todo: clean this up
    nextTrack : function() {
        window.db.getNextRandom((rowData) => {
            this.loadFile(rowData);
        });
    },


    playTrack : function() {
        var props = this.props,
            state = this.state;

   
        // TODO: Merge logic into one block below
        if (! state.songLoaded) {
            // debugger;
            MCModPlayerInterface.resume(
                // SUCCESS callback
                () => {
                    this.registerPatternUpdateHandler();

                    state.songLoaded  = 1;
                    state.playingSong = 1;

                    this.setState(state);
                }
            );
            
        } 
        else {
            state.playingSong = 1;
            MCModPlayerInterface.resume(
                () => {
                    this.registerPatternUpdateHandler();
                    this.setState(state);
                }
            );
            
        }
      
    },
    
    pauseTrack : function(callback) {
        var state = this.state;

        if (state.playingSong) {
            MCModPlayerInterface.pause(() => {
                state.playingSong = 0;
                this.setState(state);

                this.deregisterPatternUpdateHandler();     

                if (callback) {
                    callback();
                }
            });
        }
    },

    like : function() {
        db.updateLikeViaCurrentItem(1, (rowData) => {
            console.log(rowData)
        });
    },

    dislike : function() {
        db.updateLikeViaCurrentItem(-1, () => {
            db.getNewRandomCurrentItem((rowData) => {
                var filePath = window.bundlePath + rowData.path + rowData.file_name;
                this.loadFile(filePath);
            });
        });
    },

    loadFile : function(rowData) {
        this.deregisterPatternUpdateHandler();
        this.pauseTrack();
        this.patterns = {};

        var filePath = window.bundlePath + rowData.path + rowData.file_name;

        MCModPlayerInterface.loadFile(
            filePath,
            //failure
            (data) => {
                alert('failure ');
                console.log(data);
            },        
            //success
            (modObject) => {

                if (modObject) {
                    this.modObject = modObject;
                    modObject.fileName = rowData.file_name;

                    this.forceUpdate();   

                    this.patterns = modObject.patterns;;

                    this.playTrack();
                }
            }
        );
    }
});
