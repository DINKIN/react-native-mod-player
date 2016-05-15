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


const DirectoryRow = require('./DirectoryRow'),
      FileRow      = require('./FileRow'),
      ShuffleRow   = require('./ShuffleRow');

var { 
        MCModPlayerInterface
    } = require('NativeModules');


var BrowseView = React.createClass({
        
    data      : null,
    fileNames : null,

    getInitialState: function() {
        var rowData    = this.props.rowData,
            dataSource = new ListView.DataSource({
                rowHasChanged : function(r1, r2) {
                    return r1 !== r2;
                }
            });
            
        rowData.unshift({
            isShuffleRow : 1
        });

        if (rowData) {
            return {
                dataSource : dataSource.cloneWithRows(rowData)
            };
        }  

        return {};
    },

    // setRecordIsPlaying: function(rowID, isPlaying) {
    //     // debugger;
    //     var rawData = this.props.rowData,
    //         record  = rawData[rowID],
    //         len     = rawData.length,
    //         i       = 0, 
    //         r,
    //         rowData;
            
    //     for (; i < len; i++) {
    //         if (rawData[i].isPlaying) {
    //             rawData[i].isPlaying = false;
    //         };
    //     }

    //     if (record) {
    //         record.isPlaying = isPlaying;

    //         rowData = this.extractNamesForRow(rawData);

    //         this.setState({
    //             dataSource : this.state.dataSource.cloneWithRows(rowData)
    //         });
    //     } 
    // },

    shouldComponentUpdate(nextProps, nextState) {
        return ! this.props.rowData;
    },

    componentWillMount: function() {
        this._pressData = {};
    },

    render: function() {
        return (
            <ListView 
                enableEmptySections={false}
                style={[styles.listView, this.props.style]} 
                dataSource={this.state.dataSource} 
                initialListSize={10} 
                pageSize={50} 
                scrollRenderAheadDistance={150} 
                renderRow={this._renderRow}
            />
        );
    },

    _renderRow: function(rowData, sectionID, rowID) {
            
        if (rowData.isShuffleRow) {
            return <ShuffleRow onPress={() => this._pressRow(rowID)}/>
        }

        return rowData.number_files 
            ? 
                <DirectoryRow rowData={rowData} rowID={rowID} onPress={() => this._pressRow(rowID)}/>
            :
                <FileRow rowData={rowData} rowID={rowID} onPress={() => this._pressRow(rowID)}/>

    },

    
    removeRecord : function(record) {
        var rowData  = this.props.rowData,
            rowIndex = rowData.indexOf(record);

        rowData.splice(rowIndex, 1);

        rowData = this.extractNamesForRow(rowData);
       
        var ds = new ListView.DataSource({
            rowHasChanged : function(r1, r2) {
                return r1 !== r2;
            }
        }).cloneWithRows(rowData);

        this.setState({
            dataSource : ds
        });
    },

    _pressRow: function(rowID) {
        var props = this.props;

        props.onRowPress(props.rowData[rowID], props.navigator, this);
    }
});



var styles = StyleSheet.create({
    listView : {
        paddingBottom : 50
        // backgroundColor : '#FFFFFF',
        // borderWidth : 1, borderColor : '#00FF00'
        // height          : window.height - 60
    },
   
});

module.exports = BrowseView;