'use strict';

var React = require('react-native');



var {
    TouchableWithoutFeedback,
    TouchableHighlight,
    StyleSheet,
    Text,
    View
} = React;


var deviceWidth = 375,
    top = 10;

var styles = StyleSheet.create({

    playerText : {
        position : 'absolute',
        fontSize : 20
    },

    button : {
        width        : 50,
        height       : 50,
        // borderWidth  : 1,
        // borderRadius : 10,
        // borderColor  : '#CACACA',
        position     : 'absolute',
        top          : top
    },

    prevButton : {
        left : 100
    },
    prevButtonPressed : {
        left  : 100.5,
        top   : top
    },
  
    playButton : {
        left : 175
    },
    playButtonPressed : {
        left : 175.5,
        top  : top          
    },

    pauseButton : {
        left : 175
    },
    pauseButtonPressed : {
        left : 175.5,
        top  : top          
    },

    nextButton : {
        left : 255
    },
    nextButtonPressed : {
        left : 255.5,
        top  : top         
    },

    buttonPressedText : {
        color : '#AEAEAE'       
    },

    buttonFont : {
        fontFamily : 'fontello', 
        fontSize   : 30,
    },


    likeButtonFont : {
        fontFamily : 'fontello', 
        fontSize   : 20

    },

  

    dislikeButton : {
        left : 15,
        top  : 15
    },
    dislikeButtonPressed : {
        left : 15.5,
        top  : 15.5        
    },

    likeButton : {
        left : 345,
        top  : 15
    },
    likeButtonPressed : {
        left : 345.5,
        top  : 15.5
    },

});




module.exports = React.createClass({
    plottersRegistered : null,

    intervalId : null,

    buttonChars : {
        play    : '\uE801', //   >
        pause   : '\uE802', //  ||
        prev    : '\uE800', //  |<
        next    : '\uE804', //   >|
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

    getInitialState : function() {
        return this.btnStates.up;
    },

    render:  function() {
       
        var props           = this.props,
            btnChar         = props.btnChar,
            pressedState    = this.state.pressed,
            btnPressedStyle = pressedState ? styles[btnChar + 'ButtonPressed'] : '',
            txtPressedStyle = pressedState ? styles.buttonPressedText : {},
            fontStyle       = props.isLikeBtn ? styles.likeButtonFont : styles.buttonFont;


        return (
            <View style={[styles.button, styles[props.btnStyle], btnPressedStyle]}>
                <TouchableWithoutFeedback 
                    onPress={this.onButtonPress}
                    onPressIn={this.onButtonPressIn}
                    onPressOut={this.onButtonPressOut}>
                        <Text style={[fontStyle, txtPressedStyle]}>
                            {this.buttonChars[btnChar]}
                        </Text>
                </TouchableWithoutFeedback>
            </View>
        )
    },

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
});