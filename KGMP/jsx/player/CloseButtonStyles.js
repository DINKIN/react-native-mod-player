
var React         = require('react-native'),
    BaseComponent = require('../BaseComponent'),
    {StyleSheet}  = React;
    
module.exports =  StyleSheet.create({


    closeButton : {
        width       : 70,
        marginLeft  : 10,

        fontSize    : 20
    },

    closeButtonContainer : {
        width       : 100,
        // borderWidth : 1,
        // borderColor : '#FF0000',
    },

    button : {
        width    : 100,
        height      : 30,

        // position : 'absolute',
        // top      : 50,
        // borderWidth    : 1,
        // borderColor    : '#FFFFFF',

    },

    buttonPressedText : {
        color : '#FFFFFF'
    },

    buttonInnerContainer : {
        width          : 80,
        flexDirection  : 'row',
        justifyContent : 'center',
        // borderWidth : 1,
        // borderColor : '#FF3300',
    },

    buttonFont : {
        fontFamily : 'PerfectDOSVGA437Win',
        fontSize   : 20,
        width      : 75,
        color      : '#FF0000',
        marginLeft : 20
    }
});