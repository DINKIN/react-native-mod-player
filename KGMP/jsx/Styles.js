/**
* @providesModule Styles
* @flow
*/
'use strict';


var StyleSheet = require('react-native').StyleSheet;


module.exports = StyleSheet.create({
    container : {
        backgroundColor : '#ffffff',
        // borderWidth     : 3,
        // borderColor     : '#0000FF',
        marginTop : 20,
        overflow        : 'visible',
        flexDirection   : 'column',
        flex : 1,
        alignSelf      : 'stretch'
    },
    addNewItemContainer : {
        marginTop     : 20,
        flexDirection  : 'row',
        justifyContent : 'flex-end'
    },
    addNewItemText : {
        fontSize : 30
    },
    plusImageContainer : {
        marginLeft  : 50,
        marginRight : 20
    },
    plusImage : {
        height : 30,
        width  : 30
    },
    scrollViewContainer : {
        // borderWidth : 2,
        // borderColor : '#FF0000',
        alignSelf   : 'auto'
    }
});

