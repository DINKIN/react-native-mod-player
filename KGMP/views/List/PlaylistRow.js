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

import DirectoryRow from './DirectoryRow';


      
class PlaylistRow extends DirectoryRow {


    render() {
        let styles  = this.styles,
            props   = this.props,
            rowID   = props.rowID,
            rowData = props.rowData;

        return (
            <TouchableHighlight key={rowID} underlayColor={"#000"} onPress={this.onPress}>
                <View style={styles.rowContainer}>
                    <View style={styles.row}>
                        <Text style={styles.rowText}>{rowData.playlistName}</Text>
                    </View>
                </View>
            </TouchableHighlight>
        );
    }
}

module.exports = PlaylistRow;