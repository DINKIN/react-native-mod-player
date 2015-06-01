'use strict';

var React = require('react-native');


var { StyleSheet, Image} = React;



var deviceWidth = 375;

module.exports = StyleSheet.create({

    soundFormat : {
        flexDirection  : 'row',
        // justifyContent : '',       
    },
    container : {
        backgroundColor : '#ffffff',
        // borderWidth     : 3,
        // borderColor     : '#0000FF',
        // overflow      : 'visible',
        paddingTop    : 45,
        flexDirection : 'column',
        alignSelf     : 'stretch'
    },

    titleBar : {
        height         : 40,
        width          : 375,
        paddingTop     : 3,
        paddingLeft    : 3,
        flexDirection  : 'row',
        justifyContent : 'center'
        // borderWidth  : 1,
        // borderColor  : '#00FF00'
    },



    gameImage : {
        // height      : 500,
        alignSelf   : 'stretch',

        width       : 375,
        // borderWidth : 1,
        // borderColor: "#0000FF",
        resizeMode  : Image.resizeMode.fit
    },
    
    controlsContainer : {
        height      : 60,
        width       : 375,
        borderTopWidth : 1,
        borderColor    : "#AEAEAE"
        // borderWidth : 1,
        // borderColor: "#0000FF"
    },

    vizContainer : {
        height         : 50,
        width          : 375,
        // borderWidth    : 1,
        flexDirection  : 'row',
        justifyContent : 'space-around',
        // flex           : 'stretch',
        // borderColor    : "#00FF00"
    },
    vizItem : {
        // borderWidth : 1,
        width       : 187,
        // borderColor : '#FF0000',
        alignSelf   : 'stretch'
    },
    // vizSeparator : {
    //     borderWidth : .5, 
    //     borderColor : '#000000', 
    //     width       : 1
    // },

    playerText : {
        position : 'absolute',
        fontSize : 20
    },

    timeText : {
        position : 'absolute',
        // fontSize : 20
    },


    imageContainer : {
        height          : 508,
        flexDirection   : 'row',
        overflow        : 'hidden',
        // width       : 375,
        alignSelf       : 'stretch',
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
