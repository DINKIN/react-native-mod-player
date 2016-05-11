
import React, {
    Component, 
    PropTypes
} from "react";

import {
    Navigator,
    PixelRatio,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    ActivityIndicatorIOS,
    Dimensions   
} from "react-native";



var winder       = Dimensions.get('window'),
    screenWidth  = window.width = winder.width,
    screenHeight = window.height = winder.height;


class Spinner extends Component {
    render() {
        // console.log('spinner render')
        return (
            <View style={styles.spinnerContainer}>
                <ActivityIndicatorIOS 
                    animating={true}
                    size={"large"}
                    color="#FFFF00"
                />
            </View>
        );
    }
}

var styles = StyleSheet.create({
    spinnerContainer : {
        height : screenHeight,
        width  : screenWidth,
        position : 'absolute',
        top : 0,
        left : 0,
        backgroundColor : 'rgba(0,0,0,.35)',
        // borderWidth: 1,
        // borderColor : '#FF0000',
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonFont : {
        fontFamily : 'fontello', 
        fontSize   : 60,
        color      : '#FFFFFF'
    },

    redSpinner : {
        color : '#FF0000'
    },

    greenSpinner : {
        color : '#00FF00'
    }
})


var chars = {
    like    : '\uE81C',
    dislike : '\uE81D'
}

class LikeSpinner extends Component {
    render() {
        return (
            <View style={styles.spinnerContainer}>
                <Text style={[styles.buttonFont, styles.greenSpinner]}>{chars['like']}</Text>
            </View>
        );
    }
}


class DislikeSpinner extends Component {
    render() {
        return (
            <View style={styles.spinnerContainer}>
                <Text style={[styles.buttonFont, styles.redSpinner]}>{chars['dislike']}</Text>
            </View>
        );
    }
}


module.exports = {
    Spinner        : Spinner,
    LikeSpinner    : LikeSpinner,
    DislikeSpinner : DislikeSpinner
}