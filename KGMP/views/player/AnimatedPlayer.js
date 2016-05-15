
import React, {
    Component, 
    PropTypes
} from "react";

import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Animated,
    PanResponder,
    Dimensions,
    Easing,
} from "react-native";

import ListPlayer         from './ListPlayer';
import PlayController     from '../PlayController';
import BaseView           from '../BaseView';
import AnimatedLazyImage  from '../common/AnimatedLazyImage';
import MusicControlButton from './accessories/MusicControlButton';

const UrlTool          = require('../utils/UrlTool'),
      windowDimensions = Dimensions.get('window');

class AnimatedPlayer extends BaseView {
    state = {
        modObject    : null,
        fileRecord   : null,
        opacity      : new Animated.Value(0),
        pan          : new Animated.ValueXY(),
    };

    componentWillMount() {
        super.componentWillMount();

        this.panResponder = PanResponder.create({
            onMoveShouldSetResponderCapture     : () => true, //Tell iOS that we are allowing the movement
            onMoveShouldSetPanResponderCapture  : () => true, // Same here, tell iOS that we allow dragging
            
            onPanResponderGrant                 : (e, gestureState) => {
                let pan = this.state.pan;
                // debugger;

                pan.setOffset({
                    x: pan.x.__getAnimatedValue(), 
                    y: pan.y.__getAnimatedValue()
                });
                
                pan.setValue({
                    x: 0, 
                    y: 0
                }); //Initial value
            },

            onPanResponderMove: Animated.event([ // Creates a function to handle the movement and set offsets
                null, 
                {dy: this.state.pan.y}
            ]), 

            onPanResponderRelease: (e, gestureState) => {
                this.state.pan.flattenOffset();
                let deltaY = gestureState.dy;
                console.log('gestureState.dy',gestureState.dy)
                if (deltaY >= 150) {
                    this.hide();
                    // console.log('this.hide()')
                } 
                else if (deltaY <= -100) {
                    // console.log('this.show();()')
                    this.show();
                }
                else {
                    if (deltaY > 0) {
                        this.show();
                    }
                    else {
                        this.hide();
                    }

                }
            }
        });  
    }

    componentDidMount() {

        this.addListenersOn(PlayController.eventEmitter, {
            fileLoaded : (dataObj) => {
                this.setState({
                    modObject : dataObj.modObject
                });
            },

            pause : () => {
                this.forceUpdate();

            },

            play : () => {
                this.forceUpdate();
            }
        });     
    }

    showForTheFirstTime() {
        Animated.timing(this.state.pan.y, {
            duration : 150,
            toValue  : -40, //windowDimensions.height - 40
            easing   : Easing.inOut(Easing.quad)
        }).start();
    }

    show(){
        Animated.timing(this.state.pan.y, {
            duration : 150,
            toValue  : -(windowDimensions.height + 40),
            easing   : Easing.inOut(Easing.quad)
        }).start();
    }

    hide(){
        Animated.timing(this.state.pan.y, {
            duration : 150,
            toValue  : -40,
            easing   : Easing.inOut(Easing.quad)
        }).start();
    }

    onPlayPausePress = () => {
        PlayController.toggle();
    }


    render() {
        var state  = this.state,
            styles = this.styles, 
            props  = this.props;

        var animatedPlayerStyle = {
                width           : windowDimensions.width,
                height          : windowDimensions.height,
                backgroundColor : 'transparent',
                // backgroundColor : 'rgba(255,255,255,.9)',//'transparent',
                position        : 'absolute',
                top             : windowDimensions.height,
                transform       : [
                    { translateX : state.pan.x },
                    { translateY : state.pan.y }
                ]
            },
            draggableToolbarStyle = {
                height            : 40,
                flexDirection     : 'row',
                justifyContent    : 'space-between',
                // backgroundColor   : 'rgba(255, 255, 255, .7)',
                alignItems        : 'center',
                left              : 0,
                right             : 0,
                bottom            : state.tabBarPosition
            },

            playerBodyStyle = {
                height  : windowDimensions.height * 2,
            }

        let modObject = state.modObject,
            fileName  = modObject && (modObject.name || modObject.file_name); 

        let targetWidth   = 50,
            mainImageDims = {
                height : Math.floor((464 / 700) * targetWidth),
                width  : targetWidth
            };

        let toolbarView;

        if (modObject) {
            let imgName   = modObject.group,
                btnType   = PlayController.isPlaying ? 'pause' : 'play',
                source    = {
                    uri    : UrlTool.getUrlForImage(imgName),
                    width  : mainImageDims.width,
                    height : mainImageDims.height
                },
                imgStyle = {
                    width         : mainImageDims.width, 
                    height        : mainImageDims.height,
                    marginRight   : 10,
                    shadowColor   : '#000',
                    shadowOpacity : .5,
                    shadowRadius  : 2,
                    shadowOffset  : {
                        width  : 0,
                        height : 2
                    }
                }; 
            
            toolbarView = (
                <View style={styles.topToolbarContainer}>
                    <AnimatedLazyImage source={source} style={imgStyle}/>
                    <View style={{flex:1, justifyContent : 'center', alignItems : 'center', height : 28}}>
                        <Text style={{fontSize:16}}>
                            {imgName}
                        </Text>
                        <Text style={{fontSize:12, fontWeight : '300', color: '#888'}}>
                            {fileName}
                        </Text>
                    </View>
                    <View style={{width:mainImageDims.width, marginHorizontal : 5, height: 30, paddingTop: 2}}>
                        <MusicControlButton onPress={this.onPlayPausePress} btnChar={btnType} style={{height: 30}}/>
                    </View>
                </View>
            )           
        }



        return (
            <Animated.View style={animatedPlayerStyle}>
            
                <Animated.View style={draggableToolbarStyle} {...this.panResponder.panHandlers}>
                    {toolbarView}
                </Animated.View>
            
                <Animated.View style={playerBodyStyle} >
                    <ListPlayer modObject={state.modObject}
                                panResponderScope={this.panResponder}
                                fileRecord={state.fileRecord} 
                                style={{height:windowDimensions.height - 40}}/>                        
                </Animated.View>
    
            </Animated.View>
        )
    }

    styles = StyleSheet.create({
        topToolbarContainer : {
            height          : 50,
            backgroundColor : '#EFEFEF', 
            flexDirection : 'row',  
            justifyContent : 'center', 
            borderTopWidth: 1, 
            borderTopColor : '#AEAEAE', 
            borderBottomWidth : 5, 
            borderBottomColor : '#AEAEAE',
            padding : 5, 
            flex:1
        }
    })
}

module.exports = AnimatedPlayer;