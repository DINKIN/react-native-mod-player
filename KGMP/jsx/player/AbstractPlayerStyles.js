'use strict';

var React = require('react-native');


var {StyleSheet, Image} = React;



var deviceWidth = 375;

module.exports = StyleSheet.create({

    soundFormat : {
        flexDirection  : 'row',
    },
    container : {
        backgroundColor : '#ffffff',
        paddingTop      : 45,
        flexDirection   : 'column',
        alignSelf       : 'stretch'
    },

    titleBar : {
        height         : 40,
        width          : 375,
        paddingTop     : 3,
        paddingLeft    : 3,
        flexDirection  : 'row',
        justifyContent : 'center'
    },



    gameImage : {
        alignSelf   : 'stretch',
        width       : 375,
        resizeMode  : Image.resizeMode.fit
    },
    
    controlsContainer : {
        height      : 60,
        width       : 375,
        borderTopWidth : 1,
        borderColor    : "#AEAEAE"
    },

    vizContainer : {
        height         : 50,
        width          : 375,
        flexDirection  : 'row',
        justifyContent : 'space-around',
    },
    vizItem : {
        width       : 187,
        alignSelf   : 'stretch'
    },

    playerText : {
        position : 'absolute',
        fontSize : 20
    },

    timeText : {
        position : 'absolute',
        // fontSize : 20
    },


    imageContainer : {
        height          : 498, 
        flexDirection   : 'row',
        overflow        : 'hidden',
        // width       : 375,
        alignSelf       : 'stretch',  // This doesn't effing work!
        borderTopWidth  : .5,
        borderColor     : '#AEAEAE',
        backgroundColor : '#000000'
    },

    rowNumberz  : {
        position         : 'absolute',
        top              : (508/2),
        width            : 20,
        borderRightWidth : .5,
        borderColor      : '#000000',
    },
    
    patternView : {
        // width    : 900,
        position  : 'absolute',
        top       : (508/2),
        left      : 20,
        alignSelf : 'stretch'
    },

    playerBarTop : {
        position    : 'absolute',
        height      : 1,
        width       : 375,
        top         : (508/2) -1,
        left        : 0,
        borderWidth : 1,
        borderColor : '#FF0000'
    },

    playerBarBottom : {
        position    : 'absolute',
        height      : 1,
        width       : 375,
        top         : (508/2) + 11,
        left        : 0,
        borderWidth : .5,
        borderColor : '#FF0000'
    }
  
});
