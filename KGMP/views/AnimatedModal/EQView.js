
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

const AnimatedModal = require('./AnimatedModal');


const {
    MCModPlayerInterface,
    MCQueueManager
} = require('NativeModules');

const windowDimensions = Dimensions.get('window');

const PlayController = require('../PlayController');

const Slider = require('react-native-slider'),
      Ionicons = require('react-native-vector-icons/Ionicons');




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


class EQView extends AnimatedModal {
    isHidden = true;
    restingPosition = windowDimensions.height;
    title = 'Equalizer';
    startingEqSettings = null;


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
            marginVertical : 0,
            // borderWidth    :1
        }
    });


    setInitialState() {
        super.setInitialState();

        var defaultPreset = Object.assign({}, MCModPlayerInterface.eqPresets[0]),
            state = Object.assign({
                isCustomized : false,
                eqSettings : defaultPreset,
            }, this.state);

        this.state = state;
    }

    componentDidMount() {

        this.addListenersOn(PlayController.eventEmitter, {
            showEQScreen : this.onShowEQScreen
        });
    }

    onShowEQScreen = (fileRecord, eqSettings) => {
        this.startingEqSettings = eqSettings;

        this.setState({
            eqSettings : eqSettings || Object.assign({}, MCModPlayerInterface.eqPresets[0]),
            fileRecord : fileRecord           
        });

        this.show();
    }

    

    buildSlider(frequency, index) {
        var styles = this.styles
            value  = +this.state.eqSettings[freqNameKeyMap[index]];

        // console.log(index, freqNameKeyMap[index], value, state);

        return (
            <View style={styles.sliderRow} key={index}>
                <Text style={{marginLeft:10, fontWeight:'100', width:47}}>
                    {frequency}:
                </Text>
                <Text style={{fontSize:10, fontWeight:'100'}}>-10db</Text>

                <Slider minimumValue={-10}
                        value={value}
                        maximumValue={10}
                        trackStyle={styles.sliderTrack}
                        thumbStyle={styles.sliderThumb}
                        minimumTrackTintColor={'#666'}
                        style={styles.slider}
                        step={.05}
                        animationType={'spring'}
                        animateTransitions={true}
                        onValueChange={(value) => { this.onValueChange(value, index)}}
                        />

                <Text style={{marginRight:12, fontSize:10, fontWeight:'100'}}>+10db</Text>
            </View>
        )
    }

    renderCenter() {
        var state   = this.state,
            styles  = this.styles,
            name    = state.eqSettings.name,
            sliders = [];

        // onSlidingStart={this.onSlidingStart}
        // onSlidingComplete={this.onSliderChangeComplete}

        for (let i = 0, len = frequencies.length; i < 10; i ++)  {
            sliders.push(this.buildSlider(frequencies[i], i));
        }

        var presetName = state.isCustomized ? ('*' + name) : name,
            labelColor = state.isCustomized ? '#000' : '#666';

        // console.log('sliders', sliders)

        return (
            <View style={[this.props.style, {justifyContent : 'space-between', alignItems: 'center', flex:1}]}>
                <TouchableOpacity onPress={this.onEQPresetPress} style={{marginTop: 5, marginBottom:10, flexDirection:'row', alignItems:'center'}}>
                    <Text style={{color: labelColor}}>
                        Preset: {presetName}
                    </Text>
                    <Ionicons name="ios-arrow-down" size={15} color={labelColor} style={{marginLeft:5}}/>
                </TouchableOpacity>
                {sliders}
            </View>
        )
    }

    onEQPresetPress = () => {
        var buttons = [],
            i  = 0,
            presets = MCModPlayerInterface.eqPresets,
            len = presets.length,
            presets;

        // debugger;
        if (this.startingEqSettings) {
            presets = [this.startingEqSettings].concat(presets);
        }            

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
        var startingEqSettings = this.startingEqSettings,
            chosenPreset;


        if (startingEqSettings && buttonIndex == 0) {
            chosenPreset = startingEqSettings;
        }
        else if (startingEqSettings && buttonIndex > 0) {
            chosenPreset = MCModPlayerInterface.eqPresets[buttonIndex - 1];
        }
        else {
            chosenPreset = MCModPlayerInterface.eqPresets[buttonIndex];
        }

        if (! chosenPreset) {
            return;
        }

        // console.log('chosenPreset', JSON.stringify(chosenPreset, undefined, 4));

        MCModPlayerInterface.setEqBasedOnParams(chosenPreset, () => {
            // var state = Object.assign({ isCustomized : false }, chosenPreset);
            this.setState({
                isCustomized : false, 
                eqSettings   : chosenPreset 
            });
        });
    }

    onValueChange = (value, index) => { 
        var newState =  { isCustomized : true };

        newState.eqSettings = Object.assign({}, this.state.eqSettings);

        newState.eqSettings[freqNameKeyMap[index]] = value;

        this.setState(newState);

        MCModPlayerInterface.setEQ(index, value);
    }

    getEQValues() {
        return this.state.eqSettings; // Values are stored directly in state for simplicity.
    }

    renderActionButton(iconType, handler, color) {
        return <TouchableOpacity onPress={handler} style={{justifyContent : 'center', alignItems:'center', flexDirection:'row', padding:10}}>
                    <Ionicons name={iconType} size={30} color={color}/>

                </TouchableOpacity>
    }

    renderCancelButton() {
        return this.renderActionButton('ios-close', this.onCancel, '#F66')
    }

    renderSaveButton() {
        return this.renderActionButton('ios-checkmark', this.onSave, '#4D4'); 
    }

    onCancel = () => {
        let startingEqSettings = this.startingEqSettings,
            chosenPreset;

        if (startingEqSettings) {
            chosenPreset = startingEqSettings;
        }
        else if (!this.startingEqSettings && this.isCustomized)  {
            chosenPreset = this.state.eqSettings;
        }
        else {
            chosenPreset = MCModPlayerInterface.eqPresets[0];
        }

        // debugger;
        // console.log('chosenPreset', JSON.stringify(chosenPreset, undefined, 4));

        MCModPlayerInterface.setEqBasedOnParams(chosenPreset, function() {});
        this.hide();
    }

    onSave = () => {
        var state = this.state,
            eqSettings = this.state.eqSettings;
        
        eqSettings.id_md5 = state.fileRecord.id_md5;

        console.log('isCustomized', this.state.isCustomized);
        console.log(JSON.stringify(eqSettings, undefined, 4))

        this.hide();

        // We can defer persisting the data until after the view clears.
        setTimeout(() => {
            if (! eqSettings.name.match('Custom ')) {
                var newName = 'Custom ' + eqSettings.name;

                eqSettings = Object.assign({} , eqSettings);
                eqSettings.name = newName;
            }

            PlayController.persistEqSettings(eqSettings);

            this.setState({
                isCustomized : false, 
                eqSettings   : eqSettings
            });
        }, 1000);

    }

}


module.exports = EQView;