


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

    loadFile(fileRecord) {

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
            }
        );
    }

    nextTrack() {
        console.log(this.constructor.name, 'nextTrack');

        //TODO: Refactor
        MCModPlayerInterface.pause(() => {
            this.emit('pause');

            MCQueueManager.getNextFileFromCurrentSet((fileRecord)=> {
                this.loadFile(fileRecord);
            });
        })
    }

    previousTrack() {
        console.log('previous');

        MCModPlayerInterface.pause(() => {
            this.emit('pause');

            MCQueueManager.getPreviousFileFromCurrentSet((fileRecord)=> {
                this.emit('fileLoaded', fileRecord);
            });

        });
    }

    pause() {
        MCModPlayerInterface.pause(() => {
            this.emit('pause', null);
        });
    }

    resume() {
        MCModPlayerInterface.resume(
            () => {
                this.emit('play', null);          
            }
        );
    }

}

module.exports = new PlayController();