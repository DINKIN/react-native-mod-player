import React, {
    Component, 
    PropTypes
} from "react";


var AbstractPlayer = require('./AbstractPlayer'),
    { 
        MCModPlayerInterface,
        MCQueueManager
    } = require('NativeModules');



class RandomPlayer extends AbstractPlayer {
    // Todo: clean this up
    nextTrack() {
        if (this.loading) {
            return;
        }

        this.loading = true;
        window.main.showSpinner();
        
        if (this.props.isFavorites) {
            MCQueueManager.getNextRandomFavorite((rowData, queueIndex) => {
                this.queueIndex = queueIndex;
                this.loadFile(rowData);
            });
        }
        else {
            MCQueueManager.getNextRandom((rowData) => {
                this.loadFile(rowData);
                // setTimeout(() => {
                //     this.nextTrack();

                // }, 1500);
            });
        }

    }

    previousTrack() {
        if (this.loading) {
            return;
        }

        this.loading = true;
        window.main.showSpinner();

        if (this.props.isFavorites) {
            MCQueueManager.getPrevRandomFavorite((rowData) => {
                if (! rowData) {

                    alert('Sorry. No more items in history.');
                    return;
                }
                
                this.loadFile(rowData);
            });
        }
        else {
            MCQueueManager.getPreviousRandom((rowData) => {
                this.loadFile(rowData);
            });
        }
    }    






}


module.exports = RandomPlayer