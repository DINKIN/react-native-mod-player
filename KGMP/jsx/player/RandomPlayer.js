var React = require('react-native');


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
                    window.main.hideSpinner();

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