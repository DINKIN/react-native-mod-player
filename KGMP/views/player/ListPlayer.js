var React = require('react-native'),
    AbstractPlayer       = require('./AbstractPlayer');

var {
        MCModPlayerInterface,
        MCQueueManager
    } = require('NativeModules');


class ListPlayer extends AbstractPlayer {

    previousTrack() {
        if (this.loading) {
            return;
        }

        this.loading = true;
        this.showSpinner();

        MCQueueManager.getPreviousFileFromCurrentSet((record)=> {
            this.pauseTrack(() => {
                this.loadFile(record);
            });
        });

    }
    
    // Todo: clean this up
    // Todo: read from local list (not have to poll the owner component)
    nextTrack() {
        if (this.loading) {
            return;
        }

        this.loading = true;
        this.showSpinner();


        MCQueueManager.getNextFileFromCurrentSet((record)=> {
            this.pauseTrack(() => {
                this.loadFile(record);
            });
        });

    }
    
}


module.exports = ListPlayer