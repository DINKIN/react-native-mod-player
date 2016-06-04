
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
    StatusBar
} from "react-native";

const windowDimensions = Dimensions.get('window');

const BaseView = require('./BaseView'),
      PlayController = require('./PlayController');

const Slider = require('react-native-slider'),
      Ionicons = require('react-native-vector-icons/Ionicons'),
      { 
          BlurView,
          VibrancyView
      } = require('react-native-blur');


class EQView extends BaseView {
    isHidden = true;
    restingPosition = windowDimensions.height;

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

    componentDidMount() {
        this.addListenersOn(PlayController.eventEmitter, {
            showEQScreen : this.show
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

        // onSlidingStart={this.onSlidingStart}
        // onSlidingComplete={this.onSliderChangeComplete}

        return (
            <Animated.View  style={containerStyle}>
                <BlurView blurType="light" style={{flex:1, paddingTop : 30}}>
                    <TouchableOpacity onPress={this.hide}>
                        <Text>Close</Text>
                    </TouchableOpacity>
                    {/* EQ Stuff here*/}

                    <View style={{justifyContent : 'center', alignItems: 'center', flex:1}}>
                        <Slider minimumValue={0}
                                value={.5}
                                maximumValue={1}
                                trackStyle={styles.sliderTrack}
                                thumbStyle={styles.sliderThumb}
                                minimumTrackTintColor={'#666'}
                                style={{width:windowDimensions.width - 50, marginVertical:10}}
                                step={.05}/>

                        <Slider minimumValue={0}
                                value={.5}
                                maximumValue={1}
                                trackStyle={styles.sliderTrack}
                                thumbStyle={styles.sliderThumb}
                                minimumTrackTintColor={'#666'}
                                style={{width:windowDimensions.width - 50, marginVertical:10}}
                                step={.05}/>

                        <Slider minimumValue={0}
                                value={.5}
                                maximumValue={1}
                                trackStyle={styles.sliderTrack}
                                thumbStyle={styles.sliderThumb}
                                minimumTrackTintColor={'#666'}
                                style={{width:windowDimensions.width - 50, marginVertical:10}}
                                step={.05}/>
                    </View>
                </BlurView>
            </Animated.View>
        )
    }


}


module.exports = EQView;