
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

const BaseView = require('./BaseView'),
      PlayController = require('./PlayController'),
      EQView = require('./EQView');

const Slider = require('react-native-slider'),
      Ionicons = require('react-native-vector-icons/Ionicons'),
      { 
          BlurView,
          VibrancyView
      } = require('react-native-blur');


class AnimatedModal extends BaseView {
    isHidden = true;
    restingPosition = windowDimensions.height;
    panResponder = null;

    styles = StyleSheet.create({
        sliderTrack: {
            height: 2,
            borderRadius: 0,
            backgroundColor: '#666',
        },
        sliderThumb: {
            width: 10,
            height: 20,
            borderRadius: 0,
            backgroundColor: '#666',
        }

    });


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

    componentDidMount() {

        this.addListenersOn(PlayController.eventEmitter, {
            showEQScreen : this.show
        });

        // setTimeout(() => {
        //     this.show(true);
        // }, 1000);
    }

   configurePanResponder() {
        console.log('configurePanResponder ----------------------------------------------------------')
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
                // console.log('gestureState.dy',gestureState.dy)

                console.log('deltaY', deltaY)
                if (deltaY >= 200) {
                    this.hide();
                    // console.log('this.hide()')
                } 
                else if (deltaY <= -150) {
                    // console.log('this.show();()')
                    this.show(true);
                }
                // TODO : This has a bug. fix.
                else {
                    // if (deltaY > 0) {
                        this.show(true);
                    // }
                    // else {
                    //     this.hide();
                    // }

                }
            }
        });  
    }

    show = () => {
        StatusBar.setHidden(true, true);

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
                        Equalizer
                    </Text>

                    <View style={{flex:1}}>
                        <EQView style={{flex:1}}/>
                    </View>
                    
                    <TouchableOpacity onPress={this.hide} style={{marginTop : 10, paddingBottom:12, justifyContent : 'center', alignItems:'center', flexDirection:'row'}}>
                        <Text style={{fontSize : 18, color:'#666'}}>
                            Close
                        </Text>
                    </TouchableOpacity>
                </BlurView>
            </Animated.View>
        )
    }


}


module.exports = AnimatedModal;