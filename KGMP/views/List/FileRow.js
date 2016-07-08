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


const AnimatedLazyImage = require('../common/AnimatedLazyImage');
const Ionicons = require('react-native-vector-icons/Ionicons');

      
class FileRow extends Component {


    render() {
        let styles   = this.styles,
            props    = this.props,
            rowID    = props.rowID,
            rowData  = props.rowData,
            name     = rowData.file_name_short,
            songName = null;

        if (rowData.song_name) {
            // console.log(rowData.song_name);
            // console.log('\t', decodeURI(rowData.song_name));
            songName = decodeURI(unescape(rowData.song_name)).trim();
            songName = `"${songName}"`;
            songName = <Text style={styles.songName}>{songName}</Text>;
        }

        var iconColor = rowData.isPlaying ? '#000' : 'transparent';

        name = decodeURI(name);

        return (
            <TouchableHighlight key={rowID} underlayColor={"#000"} onPress={this.onPress}>
                <View style={styles.rowContainer}>
                    <Ionicons name='ios-volume-high' size={30} style={{width:20, color:iconColor}}/>
                    <View style={styles.row}>
                        <Text style={styles.rowText} numberOfLines={1}>{name}</Text>
                        {songName}
                    </View>
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
            flexDirection:'row', 
            padding : 14,
            backgroundColor : '#FFFFFF',
            borderBottomWidth : 1,
            borderBottomColor : '#EEE',
        },

        row : {
            flex            : 1,
            flexDirection   : 'column',
            // justifyContent  : 'center',
            paddingHorizontal       : 15,
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

module.exports = FileRow;