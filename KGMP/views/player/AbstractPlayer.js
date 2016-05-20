
import React, {
    Component, 
    PropTypes
} from "react";

import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Dimensions,
    Image
} from "react-native";


import PlayController from '../PlayController';

const Slider = require('react-native-slider');
const UrlTool = require('../utils/UrlTool'),
      { 
          BlurView,
          VibrancyView
      } = require('react-native-blur');


var RCTDeviceEventEmitter = require('RCTDeviceEventEmitter'),
    SummaryCard           = require('./accessories/SummaryCard'),
    MusicControlButton    = require('./accessories/MusicControlButton'),
    PatternView           = require('./PatternView/CompositeView'),
    styles                = require('./AbstractPlayerStyles'),
    CloseButton           = require('./accessories/CloseButton'),
    BaseView              = require('../BaseView'),
    ProgressView          = require('./accessories/ProgressView'),
    AnimatedLazyImage     = require('../common/AnimatedLazyImage');



var {
        MCModPlayerInterface,
        MCQueueManager
    } = require('NativeModules');



var updateStart = 'up(',
    updateEnd   = ')',
    comma       = ',',
    currentPattern = null;


var windowDimensions = Dimensions.get('window');
windowDimensions.mid = (windowDimensions.height - 30) / 2;
   

class AbstractPlayer extends BaseView {

    data     = null;  // Used to paint out the view (song title, num tracks, etc)
    plotters = null;  // References to the child plotter instances (LibEzPlotGlView)

    dirInfo   = null;
    rowID     = null;

    patternsRegistered = null; // used to check if patterns are registered by wkwebview

    commandCenterEventHandler = null; 
    patternUpdateHandler      = null;
        
    patterns           = null; // used to store pattern data.
    gettingPatternData = false;

    loading = false; // used to control floods of loading from the UI
    

    prevPat = null;
    
    
    // Event handler function keys 
    audioControlMethodMap = {
        prev      : 'previousTrack',
        next      : 'nextTrack',
        play      : 'playTrack',
        pause     : 'pauseTrack',
        like      : 'like',
        dislike   : 'dislike',
        playPause : 'playPause',
        seekBack  : () => {},
        seekFwd   : () => {} 
    };

    wkWebViewEventMatrix = {
        init   : 'onWkWebViewInit',
        patReg : 'onWkWebViewPatternsRegistered'
    };


    state = {
        prevPat        : -1,
        pattern        : -1,
        songLoaded     : 0,
        playingSong    : 0,
        numberPatterns : 0,
        leftSide       : 'l',
        rightSide      : 'r',
        fileRecord     : null,
        sliderPosition : 0,
        currentPattern : -1
    };

    render() {
        // debugger;
        var state     = this.state,
            props     = this.props,
            modObject = state.modObject || props.modObject; // TOdo refactor

        if (! modObject) {
            // console.log(this.constructor.name, 'no mod object, returning null')
            // console.log(state)
            return null;
        }

        // console.log('render() modObject', modObject);

        this.fileRecord = state.fileRecord || props.fileRecord;

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

        var fileName = modObject.file_name ? modObject.file_name : modObject.fileName,
            pattern  = modObject.patterns[modObject.patternOrds[0]],
            songName = this.fileRecord.song_name;


        if (songName) {
            // console.log(rowData.song_name);
            // console.log('\t', decodeURI(rowData.song_name));
            songName = decodeURI(unescape(songName)).trim();
            songName = `"${songName}"`;   
        }
        else {
            songName = ' ';
        }


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

        let targetWidth = windowDimensions.width - 50,
            mainImageDims = {
                height: Math.floor((464 / 700) * targetWidth),
                width: targetWidth
            };



        let imgName   = modObject.group,
            imgUri    = UrlTool.getUrlForImage(imgName),
            source    = {
                ...mainImageDims,
                uri    : imgUri
            },
            imgStyle = {
                ...mainImageDims,
                shadowColor   : '#000',
                shadowOpacity : .5,
                shadowRadius  : 5,
                shadowOffset  : {
                    width  : 0,
                    height : 10
                }
            },
            rootImageSource = {
                ...window.windowDimensions,
                uri : imgUri
            }

        let likeDislikeStyle = {color:'#888'};
        var BlurViewType = BlurView;


        var panHandlers = props.panResponderScope ? props.panResponderScope.panHandlers : {};


        var customStyles3 = {
            track: {
                height: 2,
                borderRadius: 0,
                backgroundColor: '#CCC',
            },
            thumb: {
                width: 3,
                height: 20,
                borderRadius: 0,
                backgroundColor: '#666',
            }
        };

        var sliderSteps = modObject.patternOrds.length - 1;
        // console.log('sliderSteps', sliderSteps)

        return (
            <Image style={[styles.container, this.props.style]} source={rootImageSource}>
                <BlurViewType blurType={"light"} style={[styles.container, {paddingTop: 30, backgroundColor :'rgba(255,255,255, .8)'}]}>
                    <View {...panHandlers}>
                        <View style={styles.titleBar}>
                            <Text style={{fontSize:30, fontWeight:'300', marginBottom : 5}}>{modObject.group}</Text>
                            <Text style={{fontSize:16, fontWeight:'300', color:'#999', marginBottom : 5}} numberOfLines={1}>{fileName}</Text>
                            <Text style={{fontSize:14, fontWeight:'300', color:'#AAA', width: 200, marginBottom : 5, textAlign : 'center'}} numberOfLines={1}>
                                {songName}
                            </Text>
                        </View>
                        
                        <View style={{justifyContent:'center', paddingHorizontal:25, marginBottom : 20}}>
                            <AnimatedLazyImage source={source} style={imgStyle}/>
                        </View>
                    </View>

                    <View style={{marginTop: 10, paddingVertical:20,  alignItems:'center'}}>
                        <Slider
                            ref={'slider'}
                            minimumValue={0}
                            value={state.sliderPosition}
                            maximumValue={sliderSteps}
                            trackStyle={customStyles3.track}
                            thumbStyle={customStyles3.thumb}
                            minimumTrackTintColor='#666'
                            style={{width:mainImageDims.width}}
                            step={1}
                            onSlidingStart={this.onSlidingStart}
                            onSlidingComplete={this.onSliderChangeComplete}
                          />
                    </View>

                    <View style={styles.controlsContainer}>
                        <MusicControlButton onPress={this.onButtonPress} btnChar={"dislike"} btnStyle={"dislikeButton"} isLikeBtn={true} fontStyle={likeDislikeStyle}/>
                        <View style={{flex:1}}/>
                        <MusicControlButton onPress={this.onButtonPress} btnChar={"prev"} btnStyle={"prevButton"}/>
                        <MusicControlButton onPress={this.onButtonPress} btnChar={centerBtnChar} btnStyle={centerBtnStyle} fontStyle={{fontSize:30}} style={{marginHorizontal : 20}}/>
                        <MusicControlButton onPress={this.onButtonPress} btnChar={"next"} btnStyle={"nextButton"}/>
                        <View style={{flex:1}}/>
                        <MusicControlButton onPress={this.onButtonPress} btnChar={"like"} btnStyle={"likeButton"} isLikeBtn={true} liked={liked} fontStyle={likeDislikeStyle}/>
                    </View>            
                    {/*

                    <SummaryCard style={{height: 167}} data={modObject} ref={"summaryCard"}/>
                    */}                
                    <View style={{flex:1, overflow: 'hidden', backgroundColor:'transparent'}}>

                    </View>

                    {/*

                    <ProgressView numberOfCells={modObject.patternOrds.length} highlightNumber={0} ref={"progressView"} style={styles.progressView}/>
                    <View style={{padding:5}}>
                        <Text style={styles.instrumentsLabel}>Instruments:</Text>
                    </View>
                    <ScrollView style={{flex:1, padding: 5}} automaticallyAdjustContentInsets={false}>
                        {instViews}
                    </ScrollView>

                    <View style={[styles.bar, {top: windowDimensions.mid}]}/>
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

             
                </BlurViewType>
            </Image>
        );
    }

    onSlidingStart = (value) => {
        console.log('onSlidingStart')
        this.deregisterPatternUpdateHandler();

        // this.setState({
        //     sliderPosition : value,
        //     order          : value
        // });
    }

    onSliderChangeComplete = (value) => { 
        // console.log('slider change', value);
        console.log('Release', value)

        PlayController.setOrder(value, () => {
            this.setState({
                sliderPosition : value,
                order          : value
            });

            // Give time for audio buffer to catch up
            setTimeout(() => {
                this.registerPatternUpdateHandler();
            }, 150); 
        })
    }

    componentWillMount() {
        // this.patterns = this.props.patterns;
        super.componentWillMount();
    }


    componentDidMount() {
        // console.log(this.refs)

        // setTimeout(()=> {
        //     // debugger;
        //     // this.refs.rtGLV.setPlotterRegistered('r');
        //     // this.refs.ltGLV.setPlotterRegistered('l');
        //     this.playTrack();
        // }, 350);

        this.addListenersOn(PlayController.eventEmitter, {
            play : () => {
                this.registerPatternUpdateHandler();
                this.setState(this.state);
            },

            pause : () => {
                var state = this.state;
                state.playingSong = 0;
                this.setState(state);
            },

            commandCenterFileLoaded : (eventObj) => {
                // debugger;
                // console.log('onCommandCenterEvent ' + eventObj.eventType);
                // console.log(eventObj);
                // debugger;
                var eventType = eventObj.eventType;

                if(eventType == 'playSleep') {
                    this.setState({playingSong:1});
                }
                else if(eventType == 'pauseSleep') {
                    this.setState({playingSong:0});
                }
                else {
                    this.onButtonPress(eventObj.eventType);
                }
            },

            fileLoaded : (config) => {
                console.log(this.constructor.name, 'Received fileLoaded')
                var fileRecord = config.fileRecord,
                    modObject = config.modObject;

                // console.log('Pattern orders', modObject.patternOrds);
                // debugger;
                this.loading = false;

                // this.refs.progressView.setState({
                //     numberOfCells   : modObject.patternOrds.length,
                //     highlightNumber : 0
                // });
                
                this.fileRecord = fileRecord;
                modObject.id_md5 = fileRecord.id_md5;

                // this.state.modObject = modObject;

                modObject.fileName = modObject.file_name;

                // this.forceUpdate();   

                this.patterns = modObject.patterns;
                // this.onWkWebViewInit();
                this.playTrack();

                this.setState({
                    fileRecord : fileRecord,
                    modObject : modObject,
                    currentPattern : -1,
                    sliderPosition : 0
                });

            } 
        })
    }

    componentWillUnmount() {
        super.componentWillUnmount();


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

        // if (this.commandCenterEventHandler) {
        //     this.commandCenterEventHandler.remove();
        //     this.commandCenterEventHandler = null;
        // }
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
 

    previousTrack() {
        // if (this.loading) {
        //     return;
        // }

        // this.loading = true;

        PlayController.previousTrack()
    }
    
    // Todo: clean this up
    // Todo: read from local list (not have to poll the owner component)
    nextTrack() {
        // if (this.loading) {
        //     return;
        // }

        // this.loading = true;
        // this.showSpinner();
        // debugger;
        PlayController.nextTrack();
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
   
        state.playingSong = 1;

        PlayController.resume();
    }

   
    pauseTrack(callback) {
        var state = this.state;

        if (state.playingSong) {
            this.deregisterPatternUpdateHandler();     
            PlayController.pause();

        }
        else {
            callback && callback();
        }
    }


    like() {
        MCQueueManager.updateLikeStatus(1, this.state.modObject.id_md5, (rowData) => {
            setTimeout(() => {
                this.fileRecord.like_value = 1;
                this.setState({});

            }, 500);
        });
    }

    dislike () {
        this.pauseTrack();
        // this.showDislikeSpinner();

        setTimeout(() => {
            MCQueueManager.updateLikeStatus(-1, this.state.modObject.id_md5, (rowData) => {
                if (rowData) {
                    this.loadFile(rowData);                    
                }
                else {
                    alert('Apologies, there are no more files in the queue');
                    window.mainNavigator.popToTop();
                }
            });
        }, 350);
    }

    loadFile(rowData, callback) {
        this.patterns = {};
        this.patternsRegistered = false;


        this.deregisterPatternUpdateHandler();
        // debugger;
        PlayController.loadFile(rowData);
    }


    
    onButtonPress = (buttonType) => {
        var methodName = this.audioControlMethodMap[buttonType];
        this[methodName] && this[methodName]();
    }

    
    onPatternUpdateEvent = (position) => {
        // console.log(position)
        var refs    = this.refs,
            order   = position[0], 
            pattern = position[1],
            row     = position[2];


        var state          = this.state,
            currentPattern = state.currentPattern;


        // refs.webView.execJsCall(''.concat(updateStart , pattern, comma, row, updateEnd));

        // refs.summaryCard.setState({
        //     order   : order,
        //     pattern : pattern,
        //     row     : row
        // });

        // debugger;

        if (pattern != currentPattern && state.sliderPosition != order) {
            // refs.progressView.setState({
            //     numberOfCells   : this.state.modObject.patternOrds.length,
            //     highlightNumber : order
            // });
            console.log('New order', order)
            this.setState({
                currentPattern : pattern,
                sliderPosition : order
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

        // if (this.state.modObject) {

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

        // windowDimensions.newTop = windowDimensions.mid - (row * 11);

        // var r = this.refs.patternView;
        // console.log(typeof r,r)
        // if (!this.refs.patternView) {
        //     return;
        // }


        // refs.patternView.setNativeProps({
        //     style : {top : windowDimensions.newTop}
        // });

        // console.log(windowDimensions.newTop)


        // console.log(position[1], state.prevPat, this.prevPat)
        // if (position[1] != this.prevPat) {
        //     console.log("new state")
        //     this.prevPat = state.prevPat = position[1];
        //     state.order = position[0];
        //     state.pattern = this.state.modObject.patterns[position[1]];
        //     state.row = position[2];
        //     this.setState(state);
        // }
    }

    onWkWebViewEvent  = (event) => {
        return;

        var body   = event.nativeEvent.body,
            matrix = this.wkWebViewEventMatrix;

        if (matrix[body]) {
            this[matrix[body]](body);
        }
    }

    // Register patterns
    onWkWebViewInit = () => {
        return;
        console.log('onWkWebViewInit');

        var newModObj = {},
            modObject = this.state.modObject;

        newModObj.patterns    = modObject.patterns;
        newModObj.patternOrds = modObject.patternOrds;
        newModObj.currentPat  = modObject.currentPat;
        
        newModObj = JSON.stringify(newModObj);
        // window.modObjStr = newModObj;
        // window.refz = this.refs;
        // console.log('do it')
        this.refs.webView.execJsCall('rp(\'' + newModObj + '\')');
    }

    onWkWebViewPatternsRegistered =  () => {
        return;
        console.log('onWkWebViewPatternsRegistered');
        this.patternsRegistered = true;
        // this.onPatternUpdateEvent([this.state.modObject.patternOrds[0], 0,0]); 
    }
}





module.exports = AbstractPlayer;