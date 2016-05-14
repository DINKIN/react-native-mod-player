
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

import ListPlayer from './ListPlayer';

import PlayController from '../PlayController';


const windowDimensions = Dimensions.get('window');

class AnimatedPlayer extends Component {
    state = {
        modObject    : null,
        fileRecord   : null,
        opacity      : new Animated.Value(0),
        pan          : new Animated.ValueXY(),
    };

    componentWillMount() {

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
                
                if (gestureState.dy >= 100) {
                    this.hide();
                    // console.log('this.hide()')
                } 
                else {
                    // console.log('this.show();()')
                    this.show();
                }
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
            toValue  : -(windowDimensions.height),
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



    render() {
        var state = this.state,
            props = this.props;

        var animatedPlayerStyle = {
                width           : windowDimensions.width,
                height          : windowDimensions.height,
                backgroundColor : 'rgba(0,0,255,.25)',//'transparent',
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
                backgroundColor   : 'rgba(255, 255, 255, .7)',
                alignItems        : 'center',
                left              : 0,
                right             : 0,
                bottom            : state.tabBarPosition
            },

            playerBodyStyle = {
                height:windowDimensions.height - 40,
                opacity : state.pan.y.interpolate({
                    inputRange : [ 
                        -(windowDimensions.height - 49),
                        0
                    ], 
                    outputRange: [ 1, 0 ]
                })
            }

        // console.log('AnimatedPlayer state', state)

        return (
            <Animated.View style={animatedPlayerStyle}>
            
                <Animated.View style={draggableToolbarStyle} {...this.panResponder.panHandlers}>
                    <Text>Drag me!</Text>
                </Animated.View>
            
                <Animated.View style={playerBodyStyle} {...this.panResponder.panHandlers}>
                    <ListPlayer modObject={state.modObject}
                                fileRecord={state.fileRecord} 
                                style={{height:windowDimensions.height - 40}}/>                        
                </Animated.View>
    
            </Animated.View>
        )
    }
}

module.exports = AnimatedPlayer;