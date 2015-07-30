var React = require('react-native');


var MCModPlayerInterface = require('NativeModules').MCModPlayerInterface,
    AbstractPlayer       = require('./AbstractPlayer');


class RandomPlayer extends AbstractPlayer {

    previousTrack() {
        if (this.loading) {
            return;
        }

        this.loading = true;
        window.main.showSpinner();
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
        if (this.loading) {
            return;
        }

        this.loading = true;
        window.main.showSpinner();
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

                callback && callback();
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
        this.patternsRegistered = false;
        var filePath = window.bundlePath + rowData.path + rowData.file_name;

        this.deregisterPatternUpdateHandler();
        MCModPlayerInterface.pause(() => {
            this.deregisterPatternUpdateHandler();
    
            this.refs.webView.execJsCall('cls()');

            MCModPlayerInterface.loadFile(
                filePath,
                //failure
                (data) => {
                    alert('failure in loading file ' + rowData.file_name);
                    console.log(data);
                    this.loading = false;

                },        
                //success
                (modObject) => {
                    this.loading = false;

                    this.refs.progressView.setState({
                        numberOfCells   : modObject.patternOrds.length,
                        highlightNumber : 0
                    });

                    this.modObject = modObject;
                    modObject.fileName = rowData.file_name;

                    // this.forceUpdate();   

                    this.patterns = modObject.patterns;
                    this.onWkWebViewInit();
                    this.playTrack();
                    window.main.hideSpinner();
                }
            );
        });
    }


    onWkWebViewPatternsRegistered() {
        console.log('onWkWebViewPatternsRegistered');
        this.patternsRegistered = true;
        this.onPatternUpdateEvent([this.modObject.patternOrds[0], 0,0]);
        // debugger;
    }



}


module.exports = RandomPlayer