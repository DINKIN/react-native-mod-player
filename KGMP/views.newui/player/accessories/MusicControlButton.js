'use strict';
import React, {
    Component, 
    PropTypes
} from "react";

import {
    TouchableWithoutFeedback,
    TouchableHighlight,
    StyleSheet,
    Text,
    View
} from "react-native";


var BaseView = require('../../BaseView'),
    styles        = require('./MusicControlButtonStyles.js');


class MusicControlButton extends BaseView {    
    setInitialState() {
        this.state = this.btnStates.up;
    }
  
    render() {
       
        var props           = this.props,
            btnChar         = props.btnChar,
            pressedState    = this.state.pressed,
            btnPressedStyle = pressedState ? styles[btnChar + 'ButtonPressed'] : '',
            txtPressedStyle = pressedState ? styles.buttonPressedText : {},
            fontStyle       = styles.buttonFont,
            likedStyle;
            // fontStyle       = props.isLikeBtn ? styles.likeButtonFont : styles.buttonFont;

        if (this.props.liked) {
            likedStyle = styles.greenColor;
        }

        return (
            <View style={[styles.button, styles[props.btnStyle], btnPressedStyle]}>
                <TouchableWithoutFeedback 
                    onPress={this.onButtonPress}
                    onPressIn={this.onButtonPressIn}
                    onPressOut={this.onButtonPressOut}>
                        {/* 
                            This nesting is setup as such to facilitate centering of the font,
                            while allowing for greater tap area than just the generic text element itself.
                            At the current writing of this application, TouchableWithoutFeedback does not allow
                            for styling. #sadface
                        */}
                        <View style={styles.buttonInnerContainer}>
                            <Text style={[fontStyle, txtPressedStyle, likedStyle]}>
                                {this.buttonChars[btnChar]}
                            </Text>
                        </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }
};

Object.assign(MusicControlButton.prototype, {
    plottersRegistered : null,

    intervalId : null,

    buttonChars : {
        play    : '\uE801', 
        pause   : '\uE802', 
        prev    : '\uE800', 
        next    : '\uE804', 
        like    : '\uE81C',
        dislike : '\uE81D'
    },

    props : {
        onPress   : React.PropTypes.func,
        btnChar   : React.PropTypes.string,
        btnStyle  : React.PropTypes.string,
        isLikeBtn : React.PropTypes.bool
    },

    btnStates : {
        down : {
            pressed : true
        },
        up : {
            pressed : false
        }
    },

    bindableMethods :{ 
        onButtonPress : function() {
            var props = this.props;
            props.onPress && props.onPress(props.btnChar);
        },
        
        onButtonPressIn : function() {
            this.setState(this.btnStates.down);
        },
        
        onButtonPressOut : function() {
            this.setState(this.btnStates.up);
        }
    }
});

module.exports  = MusicControlButton;

