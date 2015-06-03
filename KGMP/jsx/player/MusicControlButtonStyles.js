
var React         = require('react-native'),
    BaseComponent = require('../BaseComponent'),
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
        height   : 50,
        position : 'absolute',
        top      : top
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
