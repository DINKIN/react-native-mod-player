
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions
} from 'react-native';


var RCTDeviceEventEmitter = require('RCTDeviceEventEmitter'),
    SummaryCard           = require('./accessories/SummaryCard'),
    MusicControlButton    = require('./accessories/MusicControlButton'),
    PatternView           = require('./PatternView/CompositeView'),
    styles                = require('./AbstractPlayerStyles'),
    CloseButton           = require('./accessories/CloseButton'),
    BaseComponent         = require('../BaseComponent'),
    ProgressView          = require('./accessories/ProgressView');

var {
        MCModPlayerInterface,
        MCQueueManager
    } = require('NativeModules');

var updateStart = 'up(',
    updateEnd   = ')',
    comma       = ',',
    currentPattern = null;


var dims = Dimensions.get('window');
dims.mid = (dims.height - 30) / 2;
   

class AbstractPlayer extends BaseComponent {

    setInitialState() {
        this.state = {
            prevPat        : -1,
            pattern        : -1,
            songLoaded     : 0,
            playingSong    : 0,
            numberPatterns : 0,
            leftSide       : 'l',
            rightSide      : 'r',
        }
    }

    render() {
        // debugger;
        var state     = this.state,
            props     = this.props,
            modObject = this.modObject || props.modObject,
            dictInfo  = props.dictInfo;

        // console.log('render() modObject', modObject);

        this.fileRecord = this.fileRecord || props.fileRecord;

        var buttonChars = this.buttonChars,
            liked       = this.fileRecord.like_value == 1,
            centerBtnChar,
            centerBtnStyle;

        if (state.playingSong) {
            centerBtnChar  = "pause";
            centerBtnStyle = "pauseButton";
        }
        else {
            centerBtnChar  = "play";
            centerBtnStyle = "playButton";
        }

        // debugger;
        var fileName = modObject.file_name ? modObject.file_name : modObject.fileName,
            pattern  = modObject.patterns[modObject.patternOrds[0]],
            newTopPosition;

        /*
        if (state.currentPattern != null) {
            pattern = this.patterns[state.currentPattern];
        }
        else if (typeof  this.patterns != 'undefined'){
            state.currentPattern = modObject.currentPat;
            pattern = this.patterns[modObject.currentPat];
        }

        pattern = pattern || [];

        if (state.currentRow) {
            newTopPosition = {
                top : (508 / 2) - (state.currentRow * 11)
            }
        }
        */

        // var instViews   = [],
        //     // instruments = modObject.instruments,
        //     len         = instruments.length,
        //     rowStyle    = styles.instrumentRow,
        //     greenText   = styles.instrumentText,
        //     whiteText   = styles.instrumentName,
        //     rowStr      = 'row_',
        //     colonStr    = ':',
        //     sixteen     = 16,
        //     zeroStr     = '0',
        //     rowInHex;

        // instViews.length = len;

        // if (len > 0) {
        //     for (var i=0; i < len; i++) {

        //         rowInHex = i.toString(sixteen).toUpperCase();

        //         if (i < sixteen) {
        //             rowInHex = zeroStr + rowInHex;
        //         }

        //         instViews[i] = (
        //             <View style={rowStyle} key={rowStr + rowInHex}>
        //                 <Text style={greenText}>{rowInHex + colonStr}</Text> 
        //                 <Text style={whiteText}>{instruments[i]}</Text>
        //             </View>
        //         );

        //     }
        // }

        // else {
        //     instViews[0] = (
        //         <View style={rowStyle} key="wtf">
        //             <Text style={whiteText}>{"Not available for this song."}</Text>
        //         </View>
        //     );
        // }

        return (
            <View style={styles.container}>
                <CloseButton onPress={this.onClosebuttonPress} />

                <View style={styles.titleBar}>
                    <Text style={styles.fileName}>{fileName}</Text>
                </View>

                <SummaryCard style={{height: 167}} data={modObject} ref={"summaryCard"}/>
                
                <View style={{flex:1, overflow: 'hidden', backgroundColor:'#FF0000'}}>

                </View>
                <ProgressView numberOfCells={modObject.patternOrds.length} highlightNumber={0} ref={"progressView"} style={styles.progressView}/>

                {/*
                <View style={{padding:5}}>
                    <Text style={styles.instrumentsLabel}>Instruments:</Text>
                </View>
                <ScrollView style={{flex:1, padding: 5}} automaticallyAdjustContentInsets={false}>
                    {instViews}
                </ScrollView>

                <View style={[styles.bar, {top: dims.mid}]}/>
                 */}

                {/*
                <BridgedWKWebView ref={"webView"} style={styles.webView} localUrl={"pattern_view.html"} onWkWebViewEvent={this.onWkWebViewEvent}/>
                <View style={[styles.rowNumberz, newTopPosition]}>
                    <RowNumberView ref={"rowNumberView"} rows={pattern.length}/>
                </View>
               
                <View style={[styles.patternView, newTopPosition]}>
                    <PatternView ref={"patternView"} rows={pattern}/>
                </View>
                <View style={styles.playerBarTop}/>
                <View style={styles.playerBarBottom}/>

                <View style={styles.vizContainer}>
                    <MCAudioPlotGlView ref="ltGLV" side={state.leftSide} style={styles.vizItem}/>
                    <View style={styles.vizSeparator}/>
                    <MCAudioPlotGlView ref="rtGLV" side={state.rightSide} style={styles.vizItem}/>
                </View>
                */}

                <View style={styles.controlsContainer}>
                    <MusicControlButton onPress={this.onButtonPress} btnChar={"dislike"} btnStyle={"dislikeButton"} isLikeBtn={true}/>
                    <MusicControlButton onPress={this.onButtonPress} btnChar={"prev"} btnStyle={"prevButton"}/>
                    <MusicControlButton onPress={this.onButtonPress} btnChar={centerBtnChar} btnStyle={centerBtnStyle}/>
                    <MusicControlButton onPress={this.onButtonPress} btnChar={"next"} btnStyle={"nextButton"}/>
                    <MusicControlButton onPress={this.onButtonPress} btnChar={"like"} btnStyle={"likeButton"} isLikeBtn={true} liked={liked}/>
                </View>                     
            </View>
        );
    }

    componentWillMount() {
        // this.patterns = this.props.patterns;

        this.commandCenterEventHandler = RCTDeviceEventEmitter.addListener(
            'commandCenterEvent',
            this.onCommandCenterEvent
        );

        this.modObject = this.props.modObject;


    }


    componentDidMount() {
        // console.log(this.refs)

        setTimeout(()=> {
            // debugger;
            // this.refs.rtGLV.setPlotterRegistered('r');
            // this.refs.ltGLV.setPlotterRegistered('l');
            this.playTrack();
        }, 350);
    }

    componentWillUnmount() {
        MCModPlayerInterface.pause(function() {});
        this.deregisterPatternUpdateHandler();

        this.setState({
            songLoaded     : 0,
            playingSong    : 0,
            numberPatterns : 0,
            leftSide       : 'lU',
            rightSide      : 'rU'
        })

        // this.refs.ltGLV.side = 'lU';
        // this.refs.ltGLV.side = 'rU';
        // this.refs.ltGLV.setPlotterUnRegistered('lU')
        // this.refs.rtGLV.setPlotterUnRegistered('rU');

        if (this.commandCenterEventHandler) {
            this.commandCenterEventHandler.remove();
            this.commandCenterEventHandler = null;
        }


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
        var props = this.props,
            state = this.state;
   
        // TODO: Merge logic into one block below
        if (! state.songLoaded) {
            // debugger;
            MCModPlayerInterface.resume(
                // SUCCESS callback
                () => {
                    state.songLoaded  = 1;
                    state.playingSong = 1;
                    this.registerPatternUpdateHandler();
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
      
    }

   
    pauseTrack(callback) {
        var state = this.state;

        if (state.playingSong) {
            this.deregisterPatternUpdateHandler();     
            MCModPlayerInterface.pause(() => {
                state.playingSong = 0;
                this.setState(state);

                callback && callback();
            });
        }
        else {
            callback && callback();
        }
    }


    like() {
        this.showLikeSpinner();

        MCQueueManager.updateLikeStatus(1, this.modObject.id_md5, (rowData) => {
            setTimeout(() => {
                window.main.hideSpinner();
                this.fileRecord.like_value = 1;
                this.setState({});

            }, 500);
        });
    }

    dislike () {
        this.pauseTrack();
        this.showDislikeSpinner();
        setTimeout(() => {
            MCQueueManager.updateLikeStatus(-1, this.modObject.id_md5, (rowData) => {
                if (rowData) {
                    this.loadFile(rowData);                    
                }
                else {
                    alert('Apologies, there are no more files in the queue');
                    window.main.hideSpinner();
                    window.mainNavigator.popToTop();
                }
            });
        }, 350);
    }

    loadFile(rowData, callback) {
        this.patterns = {};
        this.patternsRegistered = false;

        var filePath = window.bundlePath + unescape(rowData.directory) + unescape(rowData.name);

        this.deregisterPatternUpdateHandler();
        // debugger;
        MCModPlayerInterface.pause(() => {

            MCModPlayerInterface.loadFile(
                filePath,
                //failure
                (data) => {
                    this.hideSpinner();

                    alert('failure in loading file ' + unescape(rowData.name));
                    // console.log(data);
                    this.loading = false;

                },        
                //success
                (modObject) => {
                    this.loading = false;

                    this.refs.progressView.setState({
                        numberOfCells   : modObject.patternOrds.length,
                        highlightNumber : 0
                    });
                    
                    this.fileRecord = rowData;
                    modObject.id_md5 = rowData.id_md5;

                    this.modObject = modObject;
                    modObject.fileName = rowData.name;

                    // this.forceUpdate();   

                    this.patterns = modObject.patterns;
                    // this.onWkWebViewInit();
                    this.playTrack();
                    this.hideSpinner();

                    console.log('Mod Object', modObject)


                    callback && callback();
                }
            );
        });
    }

    onCommandCenterEventFileLoad(eventObj) {
        var {
                modObject,
                file 
            } = eventObj;


        this.showSpinner();

        this.loading = false;

        // alert('here')

        modObject.id_md5 = file.id_md5;
        modObject.record = file;

        this.modObject = modObject;
        modObject.fileName = file.name;

        this.setState({});
        this.refs.progressView.setState({
            numberOfCells   : modObject.patternOrds.length,
            highlightNumber : 0
        });

        this.hideSpinner();
    }
}


AbstractPlayer.propTypes = {
    modObject : React.PropTypes.object,
    ownerList : React.PropTypes.object,
    patterns  : React.PropTypes.object,
    navigator : React.PropTypes.object
}

Object.assign(AbstractPlayer.prototype, {
    data     : null,  // Used to paint out the view (song title, num tracks, etc)
    plotters : null,  // References to the child plotter instances (LibEzPlotGlView)

    dirInfo   : null,
    rowID     : null,
    modObject : null, // used to override the props. TODO= figure out how to overwite props

    patternsRegistered : null, // used to check if patterns are registered by wkwebview

    commandCenterEventHandler : null, 
    patternUpdateHandler      : null,
        
    patterns           : null, // used to store pattern data.
    gettingPatternData : false,

    loading : false, // used to control floods of loading from the UI
    

    prevPat : null,
    
    
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

    wkWebViewEventMatrix : {
        init   : 'onWkWebViewInit',
        patReg : 'onWkWebViewPatternsRegistered'
    },

    bindableMethods : {

        onClosebuttonPress : function() {
            window.mainNavigator.pop();
        },
 
        
        onButtonPress : function(buttonType) {
            var methodName = this.audioControlMethodMap[buttonType];
            this[methodName] && this[methodName]();
        },

        onCommandCenterEvent : function(eventObj) {
            // debugger;
            // console.log('onCommandCenterEvent ' + eventObj.eventType);
            // console.log(eventObj);
            var eventType = eventObj.eventType;

            if (eventType == 'fileLoad') {
                this.onCommandCenterEventFileLoad(eventObj);
            }
            else if(eventType == 'playSleep') {
                this.setState({playingSong:1});
            }
            else if(eventType == 'pauseSleep') {
                this.setState({playingSong:0});
            }
            else {
                this.onButtonPress(eventObj.eventType);
            }
        },
        
        onPatternUpdateEvent : function(position) {
            var refs    = this.refs,
                order   = position[0], 
                pattern = position[1],
                row     = position[2];

            // refs.webView.execJsCall(''.concat(updateStart , pattern, comma, row, updateEnd));

            refs.summaryCard.setState({
                order   : order,
                pattern : pattern,
                row     : row
            });

            // debugger;

            if (pattern != currentPattern) {
                refs.progressView.setState({
                    numberOfCells   : this.modObject.patternOrds.length,
                    highlightNumber : order
                });    
            }
            

            // curentPattern = pattern;

            /** For the pattern view, which is disabled for now **/

            // var order   = position[0], 
            //     pattern = position[1],
            //     row     = position[2],
            //     numRows = position[3];

            // var patterns       = this.patterns,
            //     state          = this.state,
            //     currentPattern = state.currentPattern,
            //     targetPattern  = patterns[pattern]; 

            // if (state.playingSong == 0) {
            //     return;
            // }

            // if (this.modObject) {

            //     var positionOrder  = position[0],
            //         positionPattrn = position[1],
            //         positionRow    = position[2];
                
            //     if (patterns && position.pat != state.currentPattern) {
                    
            //         var pattern = patterns[positionPattrn];

            //         if (! pattern) {
            //             return;
            //         }

            //         var row = pattern[positionRow];
                    
            //         state.currentPattern = positionPattrn;
            //     }

            //     state.currentRow = positionRow;
            //     this.setState(state);
            // }


            // var state = this.state;

            // dims.newTop = dims.mid - (row * 11);

            // var r = this.refs.patternView;
            // console.log(typeof r,r)
            // if (!this.refs.patternView) {
            //     return;
            // }


            // refs.patternView.setNativeProps({
            //     style : {top : dims.newTop}
            // });

            // console.log(dims.newTop)


            // console.log(position[1], state.prevPat, this.prevPat)
            // if (position[1] != this.prevPat) {
            //     console.log("new state")
            //     this.prevPat = state.prevPat = position[1];
            //     state.order = position[0];
            //     state.pattern = this.modObject.patterns[position[1]];
            //     state.row = position[2];
            //     this.setState(state);
            // }
        },

        onWkWebViewEvent : function(event) {
            return;

            var body   = event.nativeEvent.body,
                matrix = this.wkWebViewEventMatrix;

            if (matrix[body]) {
                this[matrix[body]](body);
            }
        },

        // Register patterns
        onWkWebViewInit : function() {
            return;
            console.log('onWkWebViewInit');

            var newModObj = {},
                modObject = this.modObject;

            newModObj.patterns    = modObject.patterns;
            newModObj.patternOrds = modObject.patternOrds;
            newModObj.currentPat  = modObject.currentPat;
            
            newModObj = JSON.stringify(newModObj);
            // window.modObjStr = newModObj;
            // window.refz = this.refs;
            // console.log('do it')
            this.refs.webView.execJsCall('rp(\'' + newModObj + '\')');
        },

        onWkWebViewPatternsRegistered : function() {
            console.log('onWkWebViewPatternsRegistered');
            this.patternsRegistered = true;
            this.onPatternUpdateEvent([this.modObject.patternOrds[0], 0,0]); 
        }
    }
});



module.exports = AbstractPlayer;