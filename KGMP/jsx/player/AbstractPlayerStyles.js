'use strict';

var React = require('react-native');


var {StyleSheet, Image} = React;


//TODO: more fluid layouting!!!


var deviceWidth = 375,
    dosFont     = 'PerfectDOSVGA437Win',
    borderColor = '#AEAEAE',
    blackColor  = '#000000',
    whiteColor  = '#FFFFFF',
    row         = 'row',
    absolute    = 'absolute',
    stretch     = 'stretch'

module.exports = StyleSheet.create({

    soundFormat : {
        flexDirection  : row,
    },

    container : {
        backgroundColor : blackColor,
        // borderWidth     : .5,
        // borderColor     : blackColor,
        paddingTop      : 35,
        flexDirection   : 'column',
        flex : 1,
    },

    titleBar : {
        height            : 20,
        width             : 375,
        paddingTop        : 3,
        paddingLeft       : 3,
        borderTopWidth    : 1,
        borderBottomWidth : 1,
        borderColor       : borderColor,
        flexDirection  : row,
        justifyContent : 'center'
    },


    gameImage : {
        alignSelf   : stretch,
        width       : 375,
        resizeMode  : Image.resizeMode.fit
    },
    
    controlsContainer : {
        height      : 60,
        width       : 375,
        borderTopWidth : 1,
        borderColor    : borderColor
    },

    vizContainer : {
        height         : 50,
        width          : 375,
        flexDirection  : row,
        justifyContent : 'space-around',
    },
    vizItem : {
        width       : 187,
        alignSelf   : stretch
    },

    timeText : {
        position : absolute,
        // fontSize : 20
    },


    imageContainer : {
        height          : 498, 
        // flexDirection   : row,
        overflow        : 'hidden',
        // width       : 375,
        alignSelf       : stretch,  // This doesn't effing work!
        borderTopWidth  : .5,
        borderColor     : borderColor,
        backgroundColor : blackColor
    },

    rowNumberz  : {
        position         : absolute,
        top              : (508/2),
        width            : 20,
        borderRightWidth : .5,
        borderColor      : blackColor,
    },
    
    patternView : {
        // width    : 900,
        position  : absolute,
        top       : (508/2),
        left      : 20,
        alignSelf : stretch
    },

    playerBarTop : {
        position    : absolute,
        height      : 1,
        width       : 375,
        top         : (508/2) -1,
        left        : 0,
        borderWidth : 1,
        borderColor : '#FF0000'
    },

    playerBarBottom : {
        position    : absolute,
        height      : 1,
        width       : 375,
        top         : (508/2) + 11,
        left        : 0
    },

    songName : {
        fontFamily : dosFont,
        fontSize   : 16, 
        color      : whiteColor 
    },

    fileName : {
        fontFamily : dosFont,
        fontSize   : 12, 
        color      : whiteColor,
        fontWeight : 'bold'
    },
    progressView : {
        borderTopWidth : 1,
        borderTopColor : whiteColor,
        width  : 375
    },

    webView : {
        flex :  1
    },

    instrumentRow : {
        flexDirection : row
    },

    instrumentText : {
        fontFamily : dosFont,
        fontSize   : 16,
        color      : '#00FF00',
        width      : 30
    },


    instrumentsLabel : {
        fontFamily : dosFont,
        fontSize   : 16,
        color      : '#00FF00',
        width      : 150,
        fontWeight : 'bold'
    },

    instrumentName : {
        fontFamily : dosFont,
        fontSize   : 16,
        color      : '#FFFFFF',
        fontWeight : 'bold' 
    }

});
