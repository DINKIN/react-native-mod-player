
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
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback
} from "react-native";


import PlayController from '../PlayController';

const Slider = require('react-native-slider'),
      Ionicons = require('react-native-vector-icons/Ionicons'),
      UrlTool = require('../utils/UrlTool'),
      { 
          BlurView,
          VibrancyView
      } = require('react-native-blur');


var RCTDeviceEventEmitter = require('RCTDeviceEventEmitter'),
    MusicControlButton    = require('./accessories/MusicControlButton'),
    PatternView           = require('./PatternView/CompositeView'),
    styles                = require('./AbstractPlayerStyles'),
    CloseButton           = require('./accessories/CloseButton'),
    BaseView              = require('../BaseView'),
    AnimatedLazyImage     = require('../common/AnimatedLazyImage'),
    MCAudioPlotGlView     = require('./MCAudioPlotGlView');

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

    data      = null;  // Used to paint out the view (song title, num tracks, etc)
    plotters  = null;  // References to the child plotter instances (LibEzPlotGlView)
    dirInfo   = null;
    rowID     = null;
    patternsRegistered        = null; // used to check if patterns are registered by wkwebview
    commandCenterEventHandler = null; 
    patternUpdateHandler      = null;
    patterns                  = null; // used to store pattern data.
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

    setInitialState() {
        this.state = {
            prevPat        : -1,
            pattern        : -1,
            songLoaded     : 0,
            playingSong    : 0,
            numberPatterns : 0,
            leftSide       : 'l',
            rightSide      : 'r',
            fileRecord     : null,
            sliderPosition : 0,
            currentPattern : -1,
            plotterMirror  : false,
            plotterFill    : false,
            plotterType    : 'buffer',
            modObject      : this.props.modObject
        };
    }

    render() {
        var state     = this.state,
            props     = this.props,
            modObject = state.modObject; 

        if (! modObject) {
            return <View />;
        }

        var fileRecord = this.fileRecord = state.fileRecord || props.fileRecord;


        var buttonChars = this.buttonChars,
            liked       = fileRecord.like_value == 1,
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
            songName = fileRecord.song_name;


        if (songName) {
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

        let targetWidth = windowDimensions.width - 50,
            mainImageDims = {
                height : targetWidth - 30,// Math.floor((464 / 700) * targetWidth),
                width  : targetWidth
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

        // let likeDislikeStyle = {color:'#888'};
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

        return (
            <Image style={[styles.container, this.props.style]} source={rootImageSource}>
                <BlurViewType blurType={"light"} style={[styles.container, {paddingTop: 30, backgroundColor :'rgba(255,255,255, .8)'}]}>
                    <View {...panHandlers}>
                        <Text style={{fontSize:30, fontWeight:'300', marginBottom : 5, textAlign : 'center'}}>{modObject.group}</Text>
                        
                        <View style={{justifyContent:'center', paddingHorizontal:25, marginBottom : 20}}>
                            <AnimatedLazyImage source={source} style={imgStyle}/>
                        </View>
                    </View>

                    <View style={{flexDirection:'row'}}>
                        <TouchableOpacity onPress={this.onEqButtonPress} style={{width : 60, alignSelf : 'stretch',  justifyContent : 'center', alignItems : 'center'}}>
                            <Ionicons name="ios-settings" size={25} color='#666'/>
                        </TouchableOpacity>

                        <View style={styles.titleBar}>
                            <Text style={{fontSize:16, fontWeight:'300', color:'#999', marginBottom : 5}} numberOfLines={1}>{fileName}</Text>
                            <Text style={{fontSize:14, fontWeight:'300', color:'#AAA', width: 200, marginBottom : 5, textAlign : 'center'}} numberOfLines={1}>
                                {songName}
                            </Text>
                        </View>

                        <TouchableOpacity onPress={this.onAddToPlaylistPress} style={{width : 60, alignSelf : 'stretch',  justifyContent : 'center', alignItems : 'center'}}>
                            <Ionicons name="ios-plus-outline" size={25} color='#666'/>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity activeOpacity={.75} style={styles.vizContainer} onPress={this.onPlotterPress}>
                        <MCAudioPlotGlView ref="ltGLV" 
                                           plotterType={state.plotterType} 
                                           side={state.leftSide} 
                                           style={styles.vizItem}
                                           shouldFill={state.plotterFill}
                                           shouldMirror={state.plotterMirror} 
                                           lineColor={'#AAA'}/>
                        
                        <View style={styles.vizSeparator}/>
                        
                        <MCAudioPlotGlView ref="rtGLV" 
                                           plotterType={state.plotterType} 
                                           side={state.rightSide}
                                           style={styles.vizItem} 
                                           shouldFill={state.plotterFill}
                                           shouldMirror={state.plotterMirror}  
                                           lineColor={'#AAA'} />
                    </TouchableOpacity>

                    <View style={{marginTop: 5, paddingVertical:0, alignItems:'center'}}>
                        <Slider
                            ref={'slider'}
                            minimumValue={0}
                            value={state.sliderPosition}
                            maximumValue={sliderSteps}
                            trackStyle={customStyles3.track}
                            thumbStyle={customStyles3.thumb}
                            minimumTrackTintColor='#666'
                            style={{width:mainImageDims.width - 20}}
                            step={1}
                            onSlidingStart={this.onSlidingStart}
                            onSlidingComplete={this.onSliderChangeComplete}
                          />
                    </View>

                    <View style={styles.controlsContainer}>
                        <MusicControlButton onPress={this.onButtonPress} btnChar={"dislike"} btnStyle={"dislikeButton"} isLikeBtn={true}/>
                        
                        <View style={{flex:1}}/>
                        
                        <MusicControlButton onPress={this.onButtonPress} btnChar={"prev"} btnStyle={"prevButton"}/>
                        <MusicControlButton onPress={this.onButtonPress} btnChar={centerBtnChar} btnStyle={centerBtnStyle} fontStyle={{fontSize:30}} style={{marginHorizontal : 20}}/>
                        <MusicControlButton onPress={this.onButtonPress} btnChar={"next"} btnStyle={"nextButton"}/>
                        
                        <View style={{flex:1}}/>
                        
                        <MusicControlButton onPress={this.onButtonPress} btnChar={"like"} btnStyle={"likeButton"} isLikeBtn={true} liked={liked}/>
                    </View>            
                    {/*

                    <SummaryCard style={{height: 167}} data={modObject} ref={"summaryCard"}/>
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

    onEqButtonPress = () => {
        var state = this.state;
        PlayController.emitShowEQScreen(state.fileRecord, state.eqSettings);
    }

    onAddToPlaylistPress = () => {
        PlayController.emitShowPlaylistSelectorScreen(this.state.fileRecord);
    }

    onPlotterPress = () => {
        var plotterType = this.state.plotterType;
        var newState;
        // console.log(this.state)
        // debugger;
        if (plotterType == 'buffer') {
            newState = {
                plotterType   : 'rolling',
                plotterFill   : true,
                plotterMirror : true
            };
        }
        else {
            newState = {
                plotterType   : 'buffer',
                plotterFill   : false,
                plotterMirror : false
            };
        }

        this.setState(newState);
    }

    onSlidingStart = (value) => {
        this.deregisterPatternUpdateHandler();
    }

    onSliderChangeComplete = (value) => { 
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
        super.componentWillMount();
    }


    componentDidMount() {

        // setTimeout(()=> {
            // return;
            // debugger;
            // this.playTrack();
            // this.onEqButtonPress()

        // }, 3000);

        this.addListenersOn(PlayController.eventEmitter, {
            play : () => {
                this.registerPatternUpdateHandler();
                this.setState({
                    playingSong : 1
                });
            },

            pause : () => {
                this.deregisterPatternUpdateHandler();
                this.setState({
                    playingSong : 0
                });
            },

            fileLoaded : (config) => {
                console.log(this.constructor.name, 'Received fileLoaded', config);
                var fileRecord = config.fileRecord,
                    modObject  = config.modObject;

                // console.log('Pattern orders', modObject.patternOrds);
                // debugger;
                this.loading = false;
                
                this.fileRecord = fileRecord;
                modObject.id_md5 = fileRecord.id_md5;
                modObject.fileName = modObject.file_name;
                this.patterns = modObject.patterns;

                this.playTrack();


                this.setState({
                    fileRecord     : fileRecord,
                    modObject      : modObject,
                    eqSettings     : modObject.eqSettings,
                    currentPattern : -1,
                    sliderPosition : 0
                });

            },

            eqSettingsPersisted : (eqSettings) => {
                this.setState({
                    eqSettings : eqSettings
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
        PlayController.previousTrack()
    }
    
    nextTrack() {
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
        this.setState({
            playingSong : 1
        });

        PlayController.resume();
    }

   
    pauseTrack(callback) {
        var state = this.state;

        if (state.playingSong) {
            this.deregisterPatternUpdateHandler();     
            PlayController.pause();
            this.setState({
                playingSong : 0
            });
        }
        else {
            callback && callback();
        }
    }


    like() {
        var modObject = this.state.modObject || this.props.modObject;
        PlayController.like(
            modObject.id_md5, 
            (rowData) => {
                this.state.fileRecord.like_value = 1;
                this.setState({});
            }
        );
    }

    dislike () {
        var modObject = this.state.modObject;


        PlayController.dislike(modObject.id_md5);
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