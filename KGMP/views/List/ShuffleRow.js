import React, {
    Component, 
    PropTypes
} from "react";

import {
    Image,
    ListView,
    TouchableHighlight,
    StyleSheet,
    WebView,
    Text,
    View,
} from "react-native";

const Ionicons = require('react-native-vector-icons/Ionicons');

      
class ShuffleRow extends Component {


    render() {
        let styles = this.styles,
            props  = this.props;

        return (
            <TouchableHighlight key={'shuffleRow'} underlayColor={"#000"} onPress={this.onPress}>
                <View style={styles.rowContainer}>
                    <Text style={[styles.row, {color:'#999'}]}>
                        Shuffle
                    </Text>
                    <Ionicons name="ios-shuffle" size={16} color='#999'/>
                </View>
            </TouchableHighlight>
        );
    }

    onPress = () => {
        var props = this.props;

        props.onPress(props.rowData, props.rowID);
    }


    styles = StyleSheet.create({
        rowContainer : {
            flexDirection     :'row', 
            padding           : 14,
            backgroundColor   : '#FFFFFF',
            borderBottomWidth : 1,
            borderBottomColor : '#EEE',
            borderTopWidth : 1,
            borderTopColor : '#EEE',
        },

        row : {
            flex            : 1,
            flexDirection   : 'column',
            // justifyContent  : 'center',
            alignItems : 'flex-start',
            justifyContent : 'flex-start',
            // backgroundColor : '#F6F6F6',
        },
        
        separator  : {
            height          : 1,
            backgroundColor : '#222222',
        },

        rowText : {
            // flex       : 1,
            color    : '#000000',        
            fontSize : 16
        },


        songName : {
            // fontFamily : 'PerfectDOSVGA437Win',
            marginTop  : 4,
            color      : '#AAA',        
            fontSize   : 14
        },

    })
}

module.exports = ShuffleRow;