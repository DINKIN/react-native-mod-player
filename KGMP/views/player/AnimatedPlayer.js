
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
    hasShown        = false;
    isHidden        = true;
    restingPosition = -35;

    setInitialState() {

        this.state = {
            modObject    : null,
            fileRecord   : null,
            // opacity      : new Animated.Value(0),
            pan          : new Animated.ValueXY(),
            playerTop    : windowDimensions.height - 60
        };
    }

    componentWillMount() {
        super.componentWillMount();
    }

    configurePanResponder() {

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
                });
            },

            onPanResponderMove: Animated.event([ // Creates a function to handle the movement and set offsets
                null, 
                {dy: this.state.pan.y}
            ]), 

            onPanResponderRelease: (e, gestureState) => {
                this.state.pan.flattenOffset();
                let deltaY = gestureState.dy;
                console.log('gestureState.dy',gestureState.dy, 'this.isHidden', this.isHidden)


                if (this.isHidden) {
                    if (deltaY >= 200) {  // DOWN action
                        this.hide();
                    } 
                    else if (deltaY <= -150) { // UP action
                        this.show(true);
                    }
                    else {
                        this.hide()
                    }
                }
                
                else if (! this.isHidden) {
                    if (deltaY >= 125) { // DOWN action
                        this.hide();
                    }  
                    else if (deltaY <= -200) { // UP Action
                        this.show(true);
                    }
                    else {
                        this.show(true)
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
                this.show();

                setTimeout(() => {
                    this.show(true);
                }, 1000);
            }
        });     
    }



    show(force){
        if (! this.hasShown && ! force) {
            /* This is for the initial animation to show the toolbar */
            Animated.timing(this.state.pan.y, {
                duration : 150,
                toValue  : -37, //windowDimensions.height - 40
                easing   : Easing.inOut(Easing.quad)
            })
            .start(() => {
                this.setState({
                    pan       : this.props.pan,
                    playerTop : windowDimensions.height - 63
                });

                this.configurePanResponder();
                this.forceUpdate();
            });

            this.hasShown = true;   
        }
        else if (force) {
            /* Animate to reveal the entire screen */
            Animated.timing(this.state.pan.y, {
                duration : 150,
                toValue  : -(windowDimensions.height - 20),
                easing   : Easing.inOut(Easing.quad)
            }).start();

            this.isHidden = false;
        }

    }


    hide(){
        this.isHidden = true;
        Animated.timing(this.state.pan.y, {
            duration : 150,
            toValue  : this.restingPosition,
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
                // borderWidth : 1, borderColor : '#FF0000',
                width           : windowDimensions.width,
                height          : windowDimensions.height,
                backgroundColor : 'transparent',
                position        : 'absolute',
                top             : state.playerTop,
                transform       : [
                    { translateX : state.pan.x },
                    { translateY : state.pan.y }
                ]
            },
            draggableToolbarStyle = {
                height         : 40,
                flexDirection  : 'row',
                justifyContent : 'space-between',
                alignItems     : 'center',
                left           : 0,
                right          : 0,
                // bottom         : state.tabBarPosition
            },
            playerBodyStyle = {
                height  : windowDimensions.height * 2,
                // opacity : state.pan.y.interpolate({
                //     inputRange : [ 
                //         -(windowDimensions.height - 49),
                //         0
                //     ], 
                //     outputRange: [ 1, 0 ]
                // })
            };

        let modObject = state.modObject,
            fileName  = modObject && (modObject.name || modObject.file_name); 

        let targetWidth   = 60,
            mainImageDims = {
                height : Math.floor((464 / 700) * targetWidth),
                width  : targetWidth
            };

        let toolbarView;


        if (modObject) {
            let imgName = modObject.group,
                btnType = PlayController.isPlaying ? 'pause' : 'play',
                source  = {
                    uri    : UrlTool.getUrlForImage(imgName),
                    width  : mainImageDims.width,
                    height : mainImageDims.height
                },
                imgStyle = {
                    width       : mainImageDims.width, 
                    height      : mainImageDims.height,
                    marginRight : 10
                }; 
            
            toolbarView = (
                <View style={styles.topToolbarContainer}>
                    <AnimatedLazyImage source={source} style={imgStyle}/>
                    <View style={{flex:1, justifyContent : 'center', alignItems : 'center', height : 40}}>
                        <Text style={{fontSize:18, fontWeight : '300'}} numberOfLines={1}>
                            {imgName}
                        </Text>
                        <Text style={{fontSize:15, fontWeight : '300', color: '#888'}} numberOfLines={1}>
                            {fileName}
                        </Text>
                    </View>
                    <View style={{width:mainImageDims.width, height: 48, paddingTop: 2, justifyContent : 'center',  alignItems : 'center'}}>
                        <MusicControlButton onPress={this.onPlayPausePress} btnChar={btnType} style={{height: 40}}/>
                    </View>
                </View>
            )           
        }


        var panHandlers = this.panResponder && this.panResponder.panHandlers;

        return (
            <Animated.View style={animatedPlayerStyle}>
            
                <Animated.View style={draggableToolbarStyle} {...panHandlers}>
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
            height          : 65,
            backgroundColor : '#EFEFEF', 
            flexDirection : 'row',  
            justifyContent : 'center', 
            borderTopWidth: 1, 
            borderTopColor : '#EFEFEF', 
            padding : 5, 
            flex:1
        }
    })
}

module.exports = AnimatedPlayer;