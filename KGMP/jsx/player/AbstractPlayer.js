var React = require('react-native');

var {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
    VibrationIOS
} = React;

var MCModPlayerInterface  = require('NativeModules').MCModPlayerInterface,
    SummaryCard           = require('./SummaryCard'),
    MusicControlButton    = require('./MusicControlButton'),
    RCTDeviceEventEmitter = require('RCTDeviceEventEmitter'),
    PatternView           = require('./PatternView'),
    RowNumberView         = require('./RowNumberView'),
    styles                = require('./AbstractPlayerStyles'),
    BaseComponent         = require('../BaseComponent');

class AbstractPlayer extends BaseComponent {
    render() {
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
    }

    componentWillMount() {
        this.patterns = this.props.patterns;

        this.commandCenterEventHandler = RCTDeviceEventEmitter.addListener(
            'commandCenterEvent',
            this.onCommandCenterEvent
        );

        this.modObject = this.props.modObject;
    }

    componentWillUnmount() {
        if (this.commandCenterEventHandler) {
            this.commandCenterEventHandler.remove();
            this.commandCenterEventHandler = null;
        }

        this.deregisterPatternUpdateHandler();
    }

    deregisterPatternUpdateHandler() {
        if (this.patternUpdateHandler) {
            this.patternUpdateHandler.remove();
            this.patternUpdateHandler = null;
        }
    }

    registerPatternUpdateHandler() {
        if (this.patternUpdateHandler) {
            return;
        }

        this.patternUpdateHandler = RCTDeviceEventEmitter.addListener(
            'rowPatternUpdate',
            this.onPatternUpdateEvent
        );
    }
 
    // TODO: Merge into a single Next/Prev method for cleanliness
    previousTrack() {
        // EXTEND
    }

    // Todo: clean this up
    nextTrack() {
        // EXTEND
    }

    playPause() {
        var state = this.state;
        // debugger; 
        if (state.playingSong) {
            this.pauseTrack();
        }
        else {
            this.playTrack();
        }
    }

    playTrack() {
        // EXTEND
    }
    
    pauseTrack(callback) {
        // EXTEND
    }

    like() {
        // EXTEND
    }

    dislike () {
        // EXTEND
    }

    loadFile(rowData) {
        // EXTEND
    }
}


AbstractPlayer.propTypes = {
    modObject : React.PropTypes.object,
    ownerList : React.PropTypes.object,
    patterns  : React.PropTypes.object
}

Object.assign(AbstractPlayer.prototype, {
    data     : null,  // Used to paint out the view (song title, num tracks, etc)
    plotters : null,  // References to the child plotter instances (LibEzPlotGlView)

    dirInfo   : null,
    rowID     : null,
    modObject : null, // used to override the props. TODO= figure out how to overwite props


    commandCenterEventHandler : null, 
    patternUpdateHandler      : null,
        
    patterns           : null, // used to store pattern data.
    gettingPatternData : false,
    
    state :  {
        songLoaded     : 0,
        playingSong    : 0,
        currentTime    : 0,
        currentRow     : 0,
        currentPattern : null
    },


    
    // Event handler function keys 
    audioControlMethodMap : {
        prev      : 'previousTrack',
        next      : 'nextTrack',
        play      : 'playTrack',
        pause     : 'pauseTrack',
        like      : 'like',
        dislike   : 'dislike',
        playPause : 'playPause',
        seekBack  : () => {},
        seekFwd   : () => {} 
    },

    bindableMethods : {

        onSummaryItemPress : function(fileTypeObj) {
            var wiki = fileTypeObj.wiki;

            if (wiki) {
                // debugger;
                this.props.navigator.showWebView(wiki);
            }
        },

        
        onButtonPress : function(buttonType) {
            var methodName = this.audioControlMethodMap[buttonType];
            this[methodName] && this[methodName]();
        },



        onCommandCenterEvent : function(event) {
            // debugger;
            console.log('onCommandCenterEvent ' + event.eventType);
            this.onButtonPress(event.eventType);
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

                var patterns       = this.patterns,
                    state          = this.state,
                    positionOrder  = position[0],
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
    }
});



module.exports = AbstractPlayer;