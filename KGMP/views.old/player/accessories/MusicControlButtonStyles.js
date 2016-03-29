
var React         = require('react-native'),
    BaseComponent = require('../../BaseComponent'),
    top           = 10, 
    {StyleSheet}  = React,
    deviceWidth   = window.width,
    isPhone6      = (deviceWidth > 320);
    



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
        left : isPhone6 ? 95 : 70
    },
    prevButtonPressed : {
        left  : isPhone6 ? 95.5 : 70.5,
        top   : top
    },
  
    playButton : {
        left : isPhone6 ? 170 : 140
    },
    playButtonPressed : {
        left : isPhone6 ? 170.5 : 140.5,
        top  : top          
    },

    pauseButton : {
        left : isPhone6 ? 170 : 140
    },
    pauseButtonPressed : {
        left : isPhone6 ? 170.5 : 140.5,
        top  : top          
    },

    nextButton : {
        left : isPhone6 ? 240 : 205
    },
    nextButtonPressed : {
        left : isPhone6 ? 240.5 : 205.5,
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
        left : isPhone6 ? 15 : 5,
        top  : top
    },
    dislikeButtonPressed : {
        left : isPhone6 ? 15.5 : 5.5,
        top  : top
    },

    likeButton : {
        left : isPhone6 ? 310 : 265,
        top  : top
    },
    likeButtonPressed : {
        left : isPhone6 ? 310.5 : 265.5,
        top  : top
    },

    greenColor : {
        color : '#00FF00',
        fontWeight : 'bold'
    }

});
