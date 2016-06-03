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
      BaseView     = require('../BaseView'),
      PlayController = require('../PlayController');


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

class BrowseList extends BaseView{
    lastPlayedIndex : undefined;

    setInitialState() {
        const props = this.props,
              hasInitialPaths = !!props.initialPaths;

        this.state = {
            initialPaths    : hasInitialPaths ? props.initialPaths : null,
            hasInitialPaths : hasInitialPaths,
            dataSource      : this.getNewDataSource(props.initialPaths)
        };

    }



    componentWillMount() {
        super.componentWillMount();

        var props = this.props,
            state = this.state;

        if (state.hasInitialPaths) {
            return;
        }

        this._pressData = {};

        getDirectories(null, (directories) => {
            this.setState({
                dataSource : this.getNewDataSource(directories)
            });
        });

    }


    componentDidMount() {
        // super.componentDidMount();

        // This is for top-level directory list
        if (! this.state.hasInitialPaths) {
            return;
        }

        this.addListenersOn(PlayController.eventEmitter, {
            play : this.onPlayControllerPlay,

            pause : (eventObject) => {
                console.log(this.className, 'pause event', eventObject)

                // var state = this.state;
                // state.playingSong = 0;
                // this.setState(state);
            },

            commandCenterFileLoaded : (eventObj) => {
                console.log(this.className, 'commandCenterFileLoaded event')

                // debugger;
                // console.log('onCommandCenterEvent ' + eventObj.eventType);
                // console.log(eventObj);
                // debugger;
                // var eventType = eventObj.eventType;

                // if(eventType == 'playSleep') {
                //     this.setState({playingSong:1});
                // }
                // else if(eventType == 'pauseSleep') {
                //     this.setState({playingSong:0});
                // }
                // else {
                //     this.onButtonPress(eventObj.eventType);
                // }
            },

            fileLoaded : (config) => {
                console.log(this.className, 'Received fileLoaded');

                var fileRecord = config.fileRecord,
                    modObject  = config.modObject;
            } 
        });

    }

    onPlayControllerPlay = (eventObject) => {        
        
        var initialPaths = this.state.initialPaths,
            fileRecord   = eventObject.fileRecord;


        var i   = 0,
            len = initialPaths.length,
            fileObj;

        for (; i < len; i++) {
            fileObj = initialPaths[i];

            if (fileObj.id_md5 == fileRecord.id_md5) {
                fileObj.isPlaying = true;
            }
            else {
                fileObj.isPlaying = false;
            }
        }

        this.setState({
            dataSource : this.getNewDataSource(initialPaths)
        });
    };

    getNewDataSource(paths, fileRecord) {
        var props      = this.props,
            dataSource = new ListView.DataSource({
                rowHasChanged : function(r1, r2) {
                    return r1 !== r2;
                }
            });

        // debugger;
        paths = [].concat(paths || []);
        
        paths.unshift({
            isShuffleRow : 1,
            parentDir    : props.parentDir
        });

        // debugger;
        return dataSource.cloneWithRows(paths);
        
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
        console.log('rejected shouldComponentUpdate');
        var state = this.state;

        if (nextState.dataSource != state.dataSource) {
            return true;
        }

        return ! (state.initialPaths);
    }

    render() {
        return (
            <ListView 
                enableEmptySections={false}
                style={[styles.listView, this.props.style]} 
                dataSource={this.state.dataSource} 
                initialListSize={10} 
                pageSize={50} 
                overflow={'hidden'}
                scrollRenderAheadDistance={150} 
                renderRow={this.renderRow}
            />
        );
    }

    onRowPress = (rowData, rowID) => {
        var props = this.props,
            state = this.state;


        props.onRowPress(rowData, rowID, props.navigator, this);
    };


    renderRow = (rowData, sectionID, rowID) => {
                    
        if (rowData.isShuffleRow) {
            return <ShuffleRow onPress={this.onRowPress} rowData={rowData} rowID={'shuffleRow'}/>
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

module.exports = BrowseList;