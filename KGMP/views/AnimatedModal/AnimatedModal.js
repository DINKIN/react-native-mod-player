
import React, {
    Component, 
    PropTypes
} from "react";

import {
    Navigator,
    PixelRatio,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicatorIOS,
    Dimensions,
    Animated,
    Easing,
    StatusBar,
    PanResponder
} from "react-native";

const windowDimensions = Dimensions.get('window');

const BaseView = require('../BaseView'),
      Slider = require('react-native-slider'),
      Ionicons = require('react-native-vector-icons/Ionicons'),
      { 
          BlurView,
          VibrancyView
      } = require('react-native-blur');


class AnimatedModal extends BaseView {
    isHidden = true;
    restingPosition = windowDimensions.height;
    panResponder = null;


    setInitialState() {
        this.state = {
            pan          : new Animated.ValueXY(),
            containerTop : windowDimensions.height,
        };
    }

    componentWillMount() {
        super.componentWillMount();
        this.configurePanResponder();
  
    }    

   configurePanResponder() {
        console.log('configurePanResponder ----------------------------------------------------------');

        this.panResponder = PanResponder.create({
            onMoveShouldSetResponderCapture     : () => true, //Tell iOS that we are allowing the movement
            onMoveShouldSetPanResponderCapture  : () => true, //Same here, tell iOS that we allow dragging
            
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
                // console.log('gestureState.dy',gestureState.dy)

                console.log('deltaY', deltaY)
                if (deltaY >= 200) {
                    this.hide();
                } 
                else if (deltaY <= -150) {
                    this.show(true);
                }
                else {
                    this.show(true);
                }
            }
        });  
    }

    show() {
        

        Animated.timing(this.state.pan.y, {
            duration : 300,
            toValue  : -windowDimensions.height,
            easing   : Easing.inOut(Easing.quad)
        })
        .start(() => {
            StatusBar.setHidden(true, 'slide');
        });

        isHidden = false;
    }
    
    hide = () => {
        // debugger;
        this.isHidden = true;

        Animated.timing(this.state.pan.y, {
            duration : 300,
            toValue  : this.restingPosition,
            easing   : Easing.inOut(Easing.quad)
        })
        .start(() => {
            // PlayController.persistEQ();
            StatusBar.setHidden(false, 'slide');
        });;
    }

    renderCenter() {
        return <View/>;
    }

    render() {
        var state = this.state,
            styles = this.styles,
            containerStyle = {
                width           : windowDimensions.width,
                height          : windowDimensions.height,
                backgroundColor : 'rgba(255,255,255, .5)',
                position        : 'absolute',
                top             : state.containerTop,
                transform       : [
                    { translateX : state.pan.x },
                    { translateY : state.pan.y }
                ]
            };

      


        return (
            // <Animated.View style={containerStyle} {...this.panResponder.panHandlers}>
            <Animated.View style={containerStyle}>
                <BlurView blurType="light" style={{flex:1, paddingTop : 15}}>
                    {/* EQ Stuff here*/}
                    <Text style={{fontWeight:'100', fontSize:30, textAlign : 'center', marginBottom : 15}} >
                        {this.title}
                    </Text>

                    <View style={{flex:1}}>
                        {this.renderCenter()}
                    </View>
                    
                    <View style={{ flexDirection : "row", justifyContent : 'space-around', marginTop : 10, paddingBottom:15}}>
                        {this.renderCancelButton()}
                        {this.renderSaveButton()}
                    </View>
                </BlurView>
            </Animated.View>
        )
    }


}


module.exports = AnimatedModal;