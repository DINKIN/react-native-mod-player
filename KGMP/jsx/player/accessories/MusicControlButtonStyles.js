
var React         = require('react-native'),
    BaseComponent = require('../../BaseComponent'),
    deviceWidth   = 375,
    top           = 10, 
    {StyleSheet}  = React;
    
module.exports =  StyleSheet.create({

    playerText : {
        position : 'absolute',
        fontSize : 20
    },

    button : {
        width    : 50,
        height   : 34,
        position : 'absolute',
        top      : top,
        // borderWidth    : 1,
        // borderColor    : '#000000',

    },

    buttonInnerContainer : {
        width          : 49,
        flexDirection  : 'row',
        justifyContent : 'center',
        // borderWidth : 1,
        // borderColor : '#FF3300',
    },

    prevButton : {
        left : 95
    },
    prevButtonPressed : {
        left  : 95.5,
        top   : top
    },
  
    playButton : {
        left : 170
    },
    playButtonPressed : {
        left : 170.5,
        top  : top          
    },

    pauseButton : {
        left : 170
    },
    pauseButtonPressed : {
        left : 170.5,
        top  : top          
    },

    nextButton : {
        left : 240
    },
    nextButtonPressed : {
        left : 240.5,
        top  : top         
    },

    buttonPressedText : {
        color : '#FFFFFF'       
    },

    buttonFont : {
        fontFamily : 'fontello', 
        fontSize   : 30,
        color      : '#FEFEFE'
    },


    likeButtonFont : {
        fontFamily  : 'fontello', 
        fontSize    : 30,
        width       : 49,
        // borderWidth : 1,
        // borderColor : '#FF3300'
    },

    dislikeButton : {
        left : 15,
        top  : top
    },
    dislikeButtonPressed : {
        left : 15.5,
        top  : top
    },

    likeButton : {
        left : 310,
        top  : top
    },
    likeButtonPressed : {
        left : 310.5,
        top  : top
    },

});
