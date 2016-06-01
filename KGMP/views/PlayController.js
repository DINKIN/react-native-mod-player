


import React, {
    Component, 
    PropTypes
} from "react";

import {

} from "react-native";

import EventEmitter from 'EventEmitter';
var RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');

var {
    MCModPlayerInterface,
    MCQueueManager
} = require('NativeModules');



class PlayController {
    isPlaying : false;
    isLoading : false;

    constructor() {
        this.eventEmitter = new EventEmitter();

        this.commandCenterEventHandler = RCTDeviceEventEmitter.addListener(
            'commandCenterEvent',
            (eventObject) => {
                var eventType = eventObject.eventType;

                if (eventType == 'fileLoad') {
                    this.emit('fileLoaded', {
                        modObject  : eventObject.modObject,
                        fileRecord : eventObject.fileRecord
                    });
                }
                else if (eventType == 'play' || eventType == 'playSleep') {
                    this.emitPlay();
                }
                else if (eventType == 'pause' || eventType == 'pauseSleep') {
                    this.emitPause();
                }



                // debugger;

                // this.emit('commandCenterEvent', eventObject)
            }
        );
    }

    setBrowseType(browseType) {
        MCQueueManager.setBrowseType(this.browseType = 0);
    }

    // Abstract method for less typing
    emit(eventName, eventData) {
        console.log(this.constructor.name, 'Emitting' , eventName/*, eventData*/)
        this.eventEmitter.emit(eventName, eventData);
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

        var filePath = window.bundlePath + unescape(fileRecord.directory) + unescape(fileRecord.name);

        // debugger;
        MCModPlayerInterface.loadFile(
            filePath,
            //failure
            (data) => {
                alert('failure in loading file ' + unescape(fileRecord.name));
                // console.log(data);

            },        
            //success
            (modObject) => {
                this.emit('fileLoaded', {
                    modObject  : modObject,
                    fileRecord : fileRecord
                });

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
                console.log('new file', fileRecord);

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

        console.log('previous');
        MCQueueManager.getPreviousFileFromCurrentSet((fileRecord)=> {
            
            this.loadFile(
                fileRecord,
                () => {
                    this.pause();
                }
            );
       
        });
    }

    emitPause = () => {
        this.isPlaying = false;
        this.emit('pause', null);
    }

    emitPlay = () => {
        this.isPlaying = true;
        this.emit('play', null);
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

}

module.exports = new PlayController();