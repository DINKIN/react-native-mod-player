


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
                this.emit('commandCenterFileLoaded', eventObject)
            }
        );
    }

    // Abstract method for less typing
    emit(eventName, eventData) {
        console.log(this.constructor.name, 'Emitting', eventName, eventData)
        this.eventEmitter.emit(eventName, eventData);
    }

    toggle() {
        this[this.isPlaying ? 'pause' : 'resume']();
    }

    loadFile(fileRecord, callback) {
        if (this.isLoading) {
            return;
        }

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

    nextTrack() {
        if (this.isLoading) {
            return;
        }
        
        console.log(this.constructor.name, 'nextTrack');
        
        //TODO: Refactor so that we don't need to pause between tracks (ObjC layer)
        this.pause();
            
        MCQueueManager.getNextFileFromCurrentSet((fileRecord)=> {
            this.loadFile(fileRecord);
        });
    }

    previousTrack() {
        console.log('previous');
        if (this.isLoading) {
            return;
        }

        this.pause();
        MCQueueManager.getPreviousFileFromCurrentSet((fileRecord)=> {
            this.loadFile(fileRecord);
        });
    }

    pause() {
        MCModPlayerInterface.pause(() => {
            this.isPlaying = false;

            this.emit('pause', null);
        });
    }

    resume() {
        MCModPlayerInterface.resume(() => {
            this.isPlaying = true;
            this.emit('play', null);
        });
    }

}

module.exports = new PlayController();