
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
    ActionSheetIOS
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



const frequencies = [
    '32Hz',
    '64Hz',
    '125Hz',
    '250Hz',
    '500Hz',
    '1kHz',
    '2kHz',
    '4kHz',
    '8kHz',
    '16kHz',
]

const freqNameKeyMap = [
    'freq32Hz',
    'freq64Hz',
    'freq125Hz',
    'freq250Hz',
    'freq500Hz',
    'freq1kHz',
    'freq2kHz',
    'freq4kHz',
    'freq8kHz',
    'freq16kHz'
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
            width : windowDimensions.width - 160,
            // borderWidth:1
        },

        sliderRow : {
            flexDirection  : 'row', 
            justifyContent : 'space-between', 
            alignItems     : 'center',
            alignSelf      : 'stretch',
            marginVertical :0,
            // borderWidth    :1
        }
    });


    setInitialState() {
        var defaultPreset = MCModPlayerInterface.eqPresets[0],
            state = Object.assign({}, defaultPreset);

        this.state = state;
    }

    buildSlider(frequency, index) {
        var state = this.state,
            styles = this.styles,
            value  = +state[freqNameKeyMap[index]];

        // console.log(index, freqNameKeyMap[index], value, state);

        return (
            <View style={styles.sliderRow} key={index}>
                <Text style={{marginLeft:10, fontWeight:'100', width:47}}>
                    {frequency}:
                </Text>
                <Text style={{fontSize:10, fontWeight:'100'}}>-15db</Text>

                <Slider minimumValue={-15}
                        value={value}
                        maximumValue={15}
                        trackStyle={styles.sliderTrack}
                        thumbStyle={styles.sliderThumb}
                        minimumTrackTintColor={'#666'}
                        style={styles.slider}
                        step={.05}
                        onValueChange={(value) => { MCModPlayerInterface.setEQ(index, value);}}
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

        // console.log('sliders', sliders)

        return (
            <View style={[this.props.style, {justifyContent : 'space-between', alignItems: 'center'}]}>
                <TouchableOpacity onPress={this.onEQPresetPress} style={{marginVertical: 5,flexDirection:'row', alignItems:'center'}}>
                    <Text style={{color:'#666'}}>
                        Preset: {this.state.name}
                    </Text>
                    <Ionicons name="ios-arrow-down" size={15} color='#666' style={{marginLeft:5}}/>
                </TouchableOpacity>
                {sliders}
            </View>
        )
    }

    onEQPresetPress = () => {
        var buttons = [],
            i  = 0,
            presets = MCModPlayerInterface.eqPresets,
            len = presets.length;

        for (; i < len; i++) {
            buttons.push(presets[i].name);
        }

        buttons.push('Cancel');

        ActionSheetIOS.showActionSheetWithOptions(
            {
                options           : buttons,
                cancelButtonIndex : buttons.length - 1
            }, 
            this.onEqPresetChosen
        );
    }

    onEqPresetChosen = (buttonIndex) => {
        console.log(buttonIndex);

        var chosenPreset = MCModPlayerInterface.eqPresets[buttonIndex];
        console.log('chosenPreset', JSON.stringify(chosenPreset, undefined, 4));

        MCModPlayerInterface.setEQBasedOnPreset(chosenPreset.name, () => {
            this.setState(chosenPreset);
        });
    }


}


module.exports = EQView;