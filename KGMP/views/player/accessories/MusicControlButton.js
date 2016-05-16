'use strict';
import React, {
    Component, 
    PropTypes
} from "react";

import {
    TouchableWithoutFeedback,
    TouchableHighlight,
    TouchableOpacity,
    StyleSheet,
    Text,
    View
} from "react-native";


var BaseView = require('../../BaseView');


class MusicControlButton extends BaseView {    
    plottersRegistered = null;

    intervalId = null;

    buttonChars = {
        play    : '\uE801', 
        pause   : '\uE802', 
        prev    : '\uE800', 
        next    : '\uE804', 
        like    : '\uE81C',
        dislike : '\uE81D'
    };


    btnStates = {
        down : {
            pressed : true
        },
        up : {
            pressed : false
        }
    };

    state = {
        pressed : false
    };
  
    render() {
       
        var styles          = this.styles,
            props           = this.props,
            btnChar         = props.btnChar,
            pressedState    = this.state.pressed,
            fontStyle       = styles.buttonFont,
            likedStyle;
            // fontStyle       = props.isLikeBtn ? styles.likeButtonFont : styles.buttonFont;

        if (this.props.liked) {
            likedStyle = styles.greenColor;
        }

        // TODO: Clean this up!
        return (
            <TouchableOpacity 
                style={[styles.button, this.props.style]}
                onPress={this.onButtonPress}
                onPressIn={this.onButtonPressIn}
                onPressOut={this.onButtonPressOut}>
                    {/* 
                        This nesting is setup as such to facilitate centering of the font,
                        while allowing for greater tap area than just the generic text element itself.
                        At the current writing of this application, TouchableWithoutFeedback does not allow
                        for styling. #sadface (RN 26-rc1)
                    */}
                    <View style={styles.buttonInnerContainer}>
                        <Text style={[fontStyle, likedStyle, this.props.fontStyle]}>
                            {this.buttonChars[btnChar]}
                        </Text>
                    </View>
            </TouchableOpacity>
        )
    }

    onButtonPress = () => {
        var props = this.props;
        props.onPress && props.onPress(props.btnChar);
    };
    
    onButtonPressIn = () => {
        this.setState(this.btnStates.down);
    };
    
    onButtonPressOut = () => {
        this.setState(this.btnStates.up);
    };

    styles = StyleSheet.create({
        button : {
            width    : 50,
            height   : 34,
            // borderWidth : 1,
            borderColor : '#0000FF',
            justifyContent : 'center',
            alignItems     : 'center',
            // position : 'absolute',
            // top      : top,
            // borderWidth    : 1,
            // borderColor    : '#FF0000',

        },

        buttonInnerContainer : {
            width          : 49,
            flexDirection  : 'row',
            // borderWidth    : 1, borderColor : '#FF0000',
            justifyContent : 'center',
            alignItems     : 'center',
            // borderWidth : 1,
            // borderColor : '#FF3300',
        },

        buttonFont : {
            fontFamily : 'fontello', 
            fontSize   : 22,
            fontWeight : '300',
            color      : '#111'
        },


        likeButtonFont : {
            fontFamily  : 'fontello', 
            fontSize    : 22
        },

        greenColor : {
            color : '#00FF00',
            // fontWeight : 'bold'
        }

    });
};

module.exports  = MusicControlButton;

