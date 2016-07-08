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


const PlaylistRow    = require('./PlaylistRow'),
      FileRow        = require('./FileRow'),
      ShuffleRow     = require('./ShuffleRow'),
      BaseView       = require('../BaseView'),
      PlayController = require('../PlayController');


var initialPaths,
    {
        MCModPlayerInterface,
        MCQueueManager
    } = require('NativeModules');

var getPlaylists = function(playlistId, callback) {
    if (playlistId) {
        MCQueueManager.getFilesForPlaylist(
            playlistId,
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
         MCModPlayerInterface.getPlaylists((playlists) => {
            console.log('playlists', JSON.stringify(playlists, undefined, 4))
            // this.setState({
            //     dataSource : this.getNewDataSource(playlists)
            // });
            callback(playlists);
        });
    }
};




class Playlists extends BaseView{
    lastPlayedIndex : undefined;

    setInitialState() {
        const props = this.props

        this.state = {
            dataSource : this.getNewDataSource(props.initialPaths)
        };

    }

    componentWillMount() {
        super.componentWillMount();

        var props = this.props,
            state = this.state;


        getPlaylists(null, (directories) => {
            // debugger;
            this.setState({
                dataSource : this.getNewDataSource(directories)
            });
        });

    }


    componentDidMount() {
        this.addListenersOn(PlayController.eventEmitter, {
            play           : this.onPlayControllerPlay,
            pause          : this.onPlayControllerPause,
            dislike        : this.onPlayControllerDislike,
            playlistChange : this.onPlaylistChange
        });

    }

    onPlaylistChange = () => {
        getPlaylists(null, (directories) => {
            // debugger;
            this.setState({
                dataSource : this.getNewDataSource(directories)
            });
        });
    }

    onPlayControllerPause = (eventObject) => {
        return
        var initialPaths = this.state.initialPaths,
            fileRecord   = eventObject.fileRecord;

        var i   = 0,
            len = initialPaths.length;

        for (; i < len; i++) {
            initialPaths[i].isPlaying = false;
        }

        this.setState({
            dataSource : this.getNewDataSource(initialPaths)
        });
    };

    onPlayControllerDislike = (id_md5) => {        
        return
        var initialPaths = this.state.initialPaths,
            i            = 0,
            len          = initialPaths.length,
            fileObj;

        for (; i < len; i++) {
            fileObj = initialPaths[i];

            if (fileObj.id_md5 == id_md5) {
                console.log('removed', i, fileObj.name);
                initialPaths.splice(i, 1);
                break;
            }
        }

        this.setState({
            dataSource : this.getNewDataSource(initialPaths)
        });
    };

    onPlayControllerPlay = (eventObject) => {        
        return;

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

        paths = [].concat(paths || []);
        
        paths.unshift({
            isShuffleRow : 1,
            parentDir    : props.parentDir
        });

        return dataSource.cloneWithRows(paths);
        
    }


    shouldComponentUpdate(nextProps, nextState) {
        return true
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
        console.log(rowData)

        if (rowData.isShuffleRow) {
            return <ShuffleRow onPress={this.onRowPress} rowData={rowData} rowID={'shuffleRow'}/>
        }

        return rowData.playlistName 
            ? 
                <PlaylistRow rowData={rowData} rowID={rowID} onPress={this.onRowPress}/>
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

module.exports = Playlists;