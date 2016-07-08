


import React, {
    Component, 
    PropTypes
} from "react";

// import {} from "react-native";

import EventEmitter from 'EventEmitter';
var RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');

var {
    MCModPlayerInterface,
    MCQueueManager
} = require('NativeModules');



class PlayController {
    isPlaying   : false;
    isLoading   : false;
    eventObject : null;

    constructor() {
        this.eventEmitter = new EventEmitter();

        this.commandCenterEventHandler = RCTDeviceEventEmitter.addListener(
            'commandCenterEvent',
            (eventObject) => {
                var eventType = eventObject.eventType;

                if (eventType == 'fileLoad') {
                    this.eventObject = eventObject;

                    this.emit('fileLoaded', eventObject);
                }
                else if (eventType == 'play' || eventType == 'playSleep') {
                    this.emitPlay();
                }
                else if (eventType == 'pause' || eventType == 'pauseSleep') {
                    this.emitPause();
                }
            }
        );
    }

    setBrowseType(browseType) {
        MCQueueManager.setBrowseType(this.browseType = 0);
    }

    // Abstract method for less typing 
    // TODO: Figure out a better convention than eventData, otherEventData
    emit(eventName, eventData, otherEventData) {
        console.log(this.constructor.name, 'Emitting' , eventName, eventData, otherEventData)
        this.eventEmitter.emit(eventName, eventData, otherEventData);
    }

    toggle() {
        this[this.isPlaying ? 'pause' : 'resume']();
    }

    loadFile(fileRecord, callback) {
        if (this.isLoading) {
            return;
        }

        console.log("loadFile");
        console.log(JSON.stringify(fileRecord, undefined, 4));

        // var filePath = window.bundlePath + unescape(fileRecord.directory) + unescape(fileRecord.name);

        MCModPlayerInterface.loadFile(
            fileRecord,
            //failure
            (data) => {
                alert('failure in loading file ' + unescape(fileRecord.name));
                // console.log(data);

            },        
            //success
            (modObject) => {
                var eventObject = this.eventObject = {
                    modObject  : modObject,
                    fileRecord : fileRecord
                };

                this.emit('fileLoaded', eventObject);

                callback && callback(); // used for showing the player view for the 1st time
                this.isPlaying = true;
                this.isLoading = false;
            }
        );
    }


    loadRandom(path) {
        MCQueueManager.setBrowseType(2);

        MCQueueManager.getNextRandomAndClearQueue(
            path,
            (fileRecord) => {
                this.loadFile(fileRecord);
            }
        );
    }

    nextTrack() {
        if (this.isLoading) {
            return;
        }
        
        console.log(this.constructor.name, 'nextTrack');
        MCQueueManager.getNextFileFromCurrentSet((fileRecord)=> {
            this.loadFile(fileRecord);
        });
    }

    previousTrack() {
        if (this.isLoading) {
            return;
        }

        // console.log('previous');
        MCQueueManager.getPreviousFileFromCurrentSet((fileRecord)=> {            
            this.loadFile(fileRecord);
        });
    }

    emitPause = () => {
        this.isPlaying = false;
        this.emit('pause', this.eventObject);
    }

    emitPlay = () => {
        this.isPlaying = true;
        this.emit('play', this.eventObject);
    }

    emitShowEQScreen = (fileRecord, eqSettings) => {
        this.emit('showEQScreen', fileRecord, eqSettings);
    }

    emitShowPlaylistSelectorScreen = (fileRecord) => {
        this.emit('showPlaylistSelectorScreen', fileRecord);
    }

    like(id_md5, callback) {
        MCQueueManager.updateLikeStatus(
            1, 
            id_md5, 
            (rowData) => {
                this.emit('like', id_md5);
                callback && callback(rowData);
            }
        );
    }

    dislike(id_md5) {
        MCQueueManager.updateLikeStatus(
            -1, 
            id_md5, 
            (rowData) => {
                this.emit('dislike', id_md5);

                if (rowData) {
                    this.loadFile(rowData);                    
                }
                else {
                    alert('Apologies, there are no more files in the queue');
                }
            }
        );
    }

    pause() {
        MCModPlayerInterface.pause(this.emitPause);
    }

    resume() {
        MCModPlayerInterface.resume(this.emitPlay);
    }

    setOrder(order, callback) {
        MCModPlayerInterface.setOrder(order, callback);
    }

    persistEqSettings(eqSettings)  {
        MCModPlayerInterface.persistEQForSong(
            eqSettings,
            () => {
                delete eqSettings.fileRecord;
                this.emit('eqSettingsPersisted', eqSettings);
            }
        );        
    }

    addSongToPlaylist(id_md5, playlistId, forceAdd, callback) {
        MCModPlayerInterface.addSongToPlaylist(
            id_md5,
            playlistId,
            forceAdd,
            callback
        );

    }

    addNewPlaylist(playlistName, callback) {
        MCModPlayerInterface.addNewPlaylist(
            playlistName,
            (success) => {
                if (success) {
                    this.emit('playlistChange');
                }
                callback(success);
            }
        );
    }

}

module.exports = new PlayController();