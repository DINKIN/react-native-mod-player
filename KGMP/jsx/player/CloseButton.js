'use strict';

var React         = require('react-native'),
    BaseComponent = require('../BaseComponent'),
    styles        = require('./CloseButtonStyles.js');

var {
    TouchableWithoutFeedback,
    TouchableHighlight,
    StyleSheet,
    Text,
    View
} = React;


/*
<TouchableWithoutFeedback style={{width : 100}}>
                    <View style={styles.closeButtonContainer}>
                        <Text style={styles.closeButton}>Close</Text>
                    </View>
                </TouchableWithoutFeedback>
*/


class CloseButton extends BaseComponent {    
    setInitialState() {
        this.state = this.btnStates.up;
    }
  
    render() {
       
        var props           = this.props,
            pressedState    = this.state.pressed,
            txtPressedStyle = pressedState ? styles.buttonPressedText : {},

            fontStyle       = styles.buttonFont;
            // fontStyle       = props.isLikeBtn ? styles.likeButtonFont : styles.buttonFont;

        return (
            <View style={styles.button}>
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
                            <Text style={[fontStyle, txtPressedStyle]}>
                                Close
                            </Text>
                        </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }
};

Object.assign(CloseButton.prototype, {
    props : {
        onPress   : React.PropTypes.func
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
            props.onPress && props.onPress();
        },
        
        onButtonPressIn : function() {
            this.setState(this.btnStates.down);
        },
        
        onButtonPressOut : function() {
            this.setState(this.btnStates.up);
        }
    }
});

module.exports  = CloseButton;

