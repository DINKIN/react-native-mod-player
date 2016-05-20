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
      ShuffleRow   = require('./ShuffleRow'),
      BaseView     = require('../BaseView');


var initialPaths,
    {
        MCModPlayerInterface,
        MCQueueManager
    } = require('NativeModules');

var getDirectories = function(path, callback) {
    if (path) {
        MCQueueManager.getFilesForDirectory(
            path,
            // failure
            () => {
                console.log('An Error Occurred');
            },
            // Success
            (response) =>  {
                callback(response)               
            }
        );
    }
    else {
        MCQueueManager.getDirectories(
            // failure
            () => {
                console.log('An Error Occurred');
            },
            // Success`
            (response) =>  {
                callback(response)               
  
            }
        );
    }
};
class BrowseView extends BaseView{

    setInitialState() {
        const props = this.props;

        this.state = {
            initialPaths : (props && props.initialPaths) ? props.initialPaths : null
        };

    }



    componentWillMount() {
        super.componentWillMount();
        var props = this.props;

        if (props.initialPaths) {
            return;
        }

        this._pressData = {};

        getDirectories(null, (directories) => {
            this.setState({
                initialPaths : directories
            });


            // Debug purposes. automates the showing of the player
            // setTimeout(() => {
            //     this.onRowPress(initialPaths[12], this.refs.navigator);

            //     setTimeout(() => {
            //         // debugger;
            //         this.onRowPress(loadedDirectories[8], this.refs.navigator);
            //         // PlayController.pause();

            //         setTimeout(() => {
            //             this.refs.modPlayer.show();
            //             PlayController.pause();
            //         }, 500);
            //     }, 500);
            // }, 500);
        });


    }



    getNewDataSource() {
        var props        = this.props,
            state        = this.state,
            initialPaths = props.initialPaths || state.initialPaths || [],
            dataSource   = new ListView.DataSource({
                rowHasChanged : function(r1, r2) {
                    return r1 !== r2;
                }
            });

            
        initialPaths.unshift({
            isShuffleRow : 1
        });

        return dataSource.cloneWithRows(initialPaths)
        
    }

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
        return ! (this.state.initialPaths || this.props.initialPaths);
    }

    render() {
        return (
            <ListView 
                enableEmptySections={false}
                style={[styles.listView, this.props.style]} 
                dataSource={this.getNewDataSource()} 
                initialListSize={10} 
                pageSize={50} 
                scrollRenderAheadDistance={150} 
                renderRow={this._renderRow}
            />
        );
    }

    onRowPress = (rowID) => {
        var props = this.props,
            state = this.state;

        props.onRowPress(state.initialPaths[rowID], props.navigator, this);
    };


    _renderRow = (rowData, sectionID, rowID) => {
                    
        if (rowData.isShuffleRow) {
            return <ShuffleRow onPress={this.onRowPress}/>
        }

        return rowData.number_files 
            ? 
                <DirectoryRow rowData={rowData} rowID={rowID} onPress={this.onRowPress}/>
            :
                <FileRow rowData={rowData} rowID={rowID} onPress={this.onRowPress}/>

    }

    
    removeRecord(record) {
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
    }

};



var styles = StyleSheet.create({
    listView : {
        paddingBottom : 50
        // backgroundColor : '#FFFFFF',
        // borderWidth : 1, borderColor : '#00FF00'
        // height          : window.height - 60
    },
   
});

module.exports = BrowseView;