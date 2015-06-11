var React = require('react-native');


var MCModPlayerInterface = require('NativeModules').MCModPlayerInterface,
    AbstractPlayer       = require('./AbstractPlayer');


class RandomPlayer extends AbstractPlayer {

    previousTrack() {
        window.db.getPrevRandom((rowData) => {
            if (! rowData) {
                alert('Sorry. No more items in history.');
                return;
            }
            
            this.loadFile(rowData);
        });
    }

    // Todo: clean this up
    nextTrack() {
        window.db.getNextRandom((rowData) => {
            this.loadFile(rowData);
        });
    }

    playTrack() {
        var props = this.props,
            state = this.state;
   
        // TODO: Merge logic into one block below
        if (! state.songLoaded) {
            // debugger;
            MCModPlayerInterface.resume(
                // SUCCESS callback
                () => {
                    state.songLoaded  = 1;
                    state.playingSong = 1;
                    this.registerPatternUpdateHandler();
                    this.setState(state);
                }
            );
            
        } 
        else {
            state.playingSong = 1;
            MCModPlayerInterface.resume(
                () => {
                    this.registerPatternUpdateHandler();
                    this.setState(state);
                }
            );
            
        }
      
    }

   
    pauseTrack(callback) {
        var state = this.state;

        if (state.playingSong) {
            this.deregisterPatternUpdateHandler();     
            MCModPlayerInterface.pause(() => {
                state.playingSong = 0;
                this.setState(state);


                if (callback) {
                    callback();
                }
            });
        }
        else {
            callback && callback();
        }
    }

    like() {
        window.db.updateLikeViaCurrentItem(1, (rowData) => {
            console.log(rowData)
        });
    }

    dislike () {
        window.db.updateLikeViaCurrentItem(-1, () => {
            window.db.getNewRandomCurrentItem((rowData) => {
                // var filePath = window.bundlePath + rowData.path + rowData.file_name;
                this.loadFile(rowData);
            });
        });
    }

    loadFile(rowData) {
        this.patterns = {};

        var filePath = window.bundlePath + rowData.path + rowData.file_name;

        MCModPlayerInterface.loadFile(
            filePath,
            //failure
            (data) => {
                alert('failure in loading file ' + rowData.file_name);
                console.log(data);
            },        
            //success
            (modObject) => {
                if (modObject) {
                    this.modObject = modObject;
                    modObject.fileName = rowData.file_name;

                    // this.forceUpdate();   

                    this.patterns = modObject.patterns;;

                    this.playTrack();
                }
            }
        );
    }
}


module.exports = RandomPlayer