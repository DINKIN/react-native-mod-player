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
      
class DirectoryRow extends Component {


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
            songName = decodeURI(unescape(rowData.song_name));
            songName = `"${songName}"`;
            songName = <Text style={styles.songName}>{songName}</Text>;
        }


        name = decodeURI(name);

        // console.log(JSON.stringify(rowData, undefined, 4));
       
        // console.log(source.uri)
        return (
            <TouchableHighlight key={rowID} underlayColor={"#FFFFFF"} onPress={() => {props.onPress(rowID)}}>
                <View style={styles.rowContainer}>
                    <View style={styles.row}>
                        <Text style={styles.rowText} numberOfLines={1}>{name}</Text>
                        {songName}
                    </View>
                </View>
            </TouchableHighlight>
        );
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

module.exports = DirectoryRow;