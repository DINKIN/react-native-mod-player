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

        // console.log('******')
        // console.log(modObject);

        var name = modObject.file_name ? modObject.file_name : modObject.fileName;

        var pattern;

        if (state.currentPattern != null) {
            pattern = this.patterns[state.currentPattern];
        }
        else if (typeof  this.patterns != 'undefined'){
            state.currentPattern = modObject.currentPat;
            pattern = this.patterns[modObject.currentPat];
        }

        pattern = pattern || []

        var newTopPosition;
      
        if (state.currentRow) {
            var newTop =  (508 / 2) - (state.currentRow * 11) ;
            // console.log(newTop);
            newTopPosition = {
                top : newTop
            }

        }

        return (
            <View style={styles.container}>
                <View style={styles.titleBar}>
                    <Text style={{fontSize: 16}}>{name}</Text>
                </View>

                
                {/*
                  
                <View style={styles.imageContainer}>
                    <PatternView ref={"patternView"} rows={pattern}/>
                </View>
                */}
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
               
                

                {/*
                <View style={styles.vizContainer}>
                    <RCEzAudioPlotGlView style={styles.vizItem}/>
                    <View style={styles.vizSeparator}/>
                    <RCEzAudioPlotGlView style={styles.vizItem}/>
                </View>
                */}

                <View style={styles.controlsContainer}>
                    {/* 
                    <Text style={styles.timeText}>
                        Current Time : {state.currentTime}
                    </Text>
                    <Text style={styles.trackText}>
                        {state.currentTrack + 1}  of {modObject.trackCount + 1}
                    </Text>
                    */}
                    <MusicControlButton onPress={this.onButtonPress} btnChar={"dislike"} btnStyle={"dislikeButton"} isLikeBtn={true}/>
                    <MusicControlButton onPress={this.onButtonPress} btnChar={"prev"} btnStyle={"prevButton"}/>
                    <MusicControlButton onPress={this.onButtonPress} btnChar={centerBtnChar} btnStyle={centerBtnStyle}/>
                    <MusicControlButton onPress={this.onButtonPress} btnChar={"next"} btnStyle={"nextButton"}/>
                    <MusicControlButton onPress={this.onButtonPress} btnChar={"like"} btnStyle={"likeButton"} isLikeBtn={true}/>

                </View>                     
            </View>
        );
    },

  

    leftViz : null,
    rightViz : null,

    onSummaryItemPress : function(fileTypeObj) {
        var wiki = fileTypeObj.wiki;

        if (wiki) {
            // debugger;
            this.props.navigator.showWebView(wiki);
        }
    },

    methodMap : {
        'prev'  : 'previousTrack',
        'next'  : 'nextTrack',
        'play'  : 'playTrack',
        'pause' : 'pauseTrack'
    },

    onButtonPress : function(buttonType) {
        var methodName = this.methodMap[buttonType];
        this[methodName] && this[methodName]();
    },

    onCommandCenterEvent : function(event) {

        // console.log(event);
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
        
        // this.getAllPatterns();
        
        // this.registerPatternUpdateHandler();
    
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
        // console.log(position.ord + ' ' + position.pat + ' ' + position.row);
        // debugger;

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
            // this.refs.patternView.highlightRow(position.row);
            // this.refs.rowNumberView.highlightRow(position.row);
        }

    },

    // componentWillMount : function() {
        // return;
        // var me = this;

        // HACK!!! :(
        // Arbitrary timeout to allow the subviews to render.
        // If you know of a better way to do this, pelase let me know. The below code is horrific.
        // setTimeout(function() {
        //     var viewContainer = me._reactInternalInstance._renderedComponent._renderedComponent._renderedChildren['.2'],
        //         children      = viewContainer._renderedComponent._renderedChildren,
        //         leftViz       = children['.0'],
        //         rightViz      = children['.2'];
                
           
        //     me.leftViz  = leftViz;
        //     me.rightViz = rightViz;

        //     leftViz._instance.setPlotterRegistered('l');
        //     rightViz._instance.setPlotterRegistered('r');

        // }, 50)
    // },

    // componentWillUnmount : function() { 
        // clearInterval(this.intervalId);   
        // return;
        // this.leftViz._instance.setPlotterUnRegistered('l');
        // this.rightViz._instance.setPlotterUnRegistered('r');
        // MCXmpPlayerInterface.pause();
    // },

    // TODO: Merge into a single Next/Prev method for cleanliness
    previousTrack : function() {
        var state     = this.state,
            rowID     = parseInt((this.rowID != null) ? this.rowID : this.props.rowID),
            ownerList = this.props.ownerList,
            record    = ownerList.getPreviousRecord(rowID);

        if (! record) {
            rowID  = ownerList.getRowDataCount();
            record = ownerList.getLastRecord();

            if (! record) {
                alert('Apologies! There are no more songs to play in this list.');
                VibrationIOS.vibrate();
                return;
            }
        }

        this.pauseTrack(() => {

            this.patterns = {};            

            this.deregisterPatternUpdateHandler();
            MCModPlayerInterface.loadFile(
                record.path,
                //failure
                (data) => {
                    alert('Could not get file info.');
                    VibrationIOS.vibrate();
                    // console.log(data);
                },        
                //success
                (modObject) => {
                   
                    modObject.path = record.path;
                    this.modObject = modObject;
                    this.rowID = rowID - 1;
                    this.forceUpdate();   

                    var fileName = modObject.path.split('/');
                    fileName = fileName[fileName.length - 1];

                    modObject.fileName = fileName;
                    this.modObject = modObject;
                    
                    this.patterns = modObject.patterns;

                    this.playTrack();
                }
            );
        });
        

    },
    // Todo: clean this up
    nextTrack : function() {
        var state = this.state,
            rowID = parseInt((this.rowID != null) ? this.rowID : this.props.rowID),
            ownerList = this.props.ownerList,
            record = ownerList.getNextRecord(rowID);

        // console.log('nextTrack :: ' + rowID);

        if (! record) {
            rowID  = 0;
            record = ownerList.getFirstRecord();

            if (! record) {
                alert('Apologies! There are no more songs to play in this list.');
                VibrationIOS.vibrate();
                return;
            }
        }

        this.patterns = {};
        this.pauseTrack();

        this.deregisterPatternUpdateHandler();
        
        MCModPlayerInterface.loadFile(
            record.path,
            //failure
            (data) => {
                alert('failure ');
                console.log(data);
            },        
            //success
            (modObject) => {
                // console.log(data);

                if (modObject) {
                    modObject.path = record.path;
                    this.modObject = modObject;

                    this.rowID = rowID + 1;
                    this.forceUpdate();   

                    var fileName = modObject.path.split('/');
                    fileName = fileName[fileName.length - 1];

                    modObject.fileName = fileName;
                    this.modObject = modObject;

                    this.patterns = modObject.patterns;;

                    this.playTrack();
                }
            }
        );

       

        
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

                    var ownerList = props.ownerList,
                        rowID     = parseInt((this.rowID != null) ? this.rowID : props.rowID);

                    ownerList.setRecordIsPlaying(rowID, true);
                }
            );

            
        } 
        else {
            state.playingSong = 1;
            MCModPlayerInterface.resume(
                () => {
                    this.registerPatternUpdateHandler();
                    this.setState(state);
                    
                    var ownerList = props.ownerList,
                        rowID     = parseInt((this.rowID != null) ? this.rowID : props.rowID);

                    ownerList.setRecordIsPlaying(rowID, true);
                }

            );
            
        }
      
    },
    
    pauseTrack : function(callback) {
        var state = this.state;

        // setTimeout(function() {
        //     clearInterval(me.intervalId);
        //     me.intervalId = null;
        // }, 10);

        if (state.playingSong) {
            MCModPlayerInterface.pause(() => {
                state.playingSong = 0;
                this.setState(state);

                var props     = this.props,
                    ownerList = props.ownerList,
                    rowID     = parseInt((this.rowID != null) ? this.rowID : props.rowID);

                ownerList.setRecordIsPlaying(rowID, false);    

                this.deregisterPatternUpdateHandler();     

                if (callback) {
                    callback();
                }
            });
           
        }
    },

    getAllPatterns : function() {
        return;
        MCModPlayerInterface.getAllPatterns(
            this.modObject.path,
            // ERROR callback
            () => {
                console.log('Something hit the fan with getting all patterns');

            },
            // SUCCESS callback
            (patternData) => {
                this.patterns = patternData;
                // debugger;
            }
        );
    }
});
