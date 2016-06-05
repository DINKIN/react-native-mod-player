
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


const {
    MCModPlayerInterface,
    MCQueueManager
} = require('NativeModules');

const windowDimensions = Dimensions.get('window');

const BaseView = require('./BaseView'),
      PlayController = require('./PlayController');

const Slider = require('react-native-slider'),
      Ionicons = require('react-native-vector-icons/Ionicons'),
      { 
          BlurView,
          VibrancyView
      } = require('react-native-blur');



var frequencies = [
    '32hz',
    '64hz',
    '125hz',
    '250hz',
    '500hz',
    '1Khz',
    '2Khz',
    '4Khz',
    '8Khz',
    '16Khz',
]

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
        },
        slider : {
            width : windowDimensions.width - 175,
            // borderWidth:1
        },

        sliderRow : {
            flexDirection  : 'row', 
            justifyContent : 'space-between', 
            alignItems     : 'center',
            alignSelf      : 'stretch',
            marginVertical : 5
        }
    });


    setInitialState() {
        this.state = {
          
        };
    }

    componentDidMount() {
       
    }

    buildSlider(frequency, index) {
        var state = this.state,
            styles = this.styles;


        return (
            <View style={styles.sliderRow} key={index}>
                <Text style={{marginLeft:10,marginRight:5, fontWeight:'100', width:50}}>
                    {frequency}:
                </Text>
                <Text style={{fontSize:10, fontWeight:'100'}}>-15db</Text>

                <Slider minimumValue={-5}
                        value={0}
                        maximumValue={5}
                        trackStyle={styles.sliderTrack}
                        thumbStyle={styles.sliderThumb}
                        minimumTrackTintColor={'#666'}
                        style={styles.slider}
                        step={.05}
                        onValueChange={(value) => { MCModPlayerInterface.setEQ(index, value); console.log(frequency, value)}}
                        />

                <Text style={{marginRight:12, fontSize:10, fontWeight:'100'}}>+15db</Text>
            </View>
        )
    }

    render() {
        var state   = this.state,
            styles  = this.styles,
            sliders = [];

        // onSlidingStart={this.onSlidingStart}
        // onSlidingComplete={this.onSliderChangeComplete}

        for (let i = 0, len = frequencies.length; i < 10; i ++)  {
            sliders.push(this.buildSlider(frequencies[i], i));
        }

        console.log('sliders', sliders)

        return (
            <View style={{justifyContent : 'center', alignItems: 'center', flex:1}}>
                {sliders}
            </View>
        )
    }


}


module.exports = EQView;