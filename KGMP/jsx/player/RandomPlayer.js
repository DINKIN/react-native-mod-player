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
        window.main.showLikeSpinner();

        MCQueueManager.updateLikeStatus(1, this.modObject.id_md5, (rowData) => {
            setTimeout(function() {
                window.main.hideSpinner();
            }, 250);

            console.log(rowData)
        });
    }

    dislike () {
        window.main.showDislikeSpinner();

        MCQueueManager.updateLikeStatus(-1, this.modObject.id_md5, (rowData) => {
            this.loadFile(rowData);
        });
    }

    loadFile(rowData) {
        this.patterns = {};
        this.patternsRegistered = false;

        var filePath = window.bundlePath + unescape(rowData.directory) + unescape(rowData.name);

        this.deregisterPatternUpdateHandler();
        // debugger;
        MCModPlayerInterface.pause(() => {
            this.deregisterPatternUpdateHandler();
    
            // this.refs.webView.execJsCall('cls()');

            MCModPlayerInterface.loadFile(
                filePath,
                //failure
                (data) => {
                    alert('failure in loading file ' + rowData.name);
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

                    modObject.id_md5 = rowData.id_md5;

                    this.modObject = modObject;
                    modObject.fileName = rowData.name;

                    // this.forceUpdate();   

                    this.patterns = modObject.patterns;
                    this.onWkWebViewInit();
                    this.playTrack();
                    window.main.hideSpinner();
                }
            );
        });
    }


    // onWkWebViewPatternsRegistered() {
    //     console.log('onWkWebViewPatternsRegistered');
    //     this.patternsRegistered = true;
    //     this.onPatternUpdateEvent([this.modObject.patternOrds[0], 0,0]);
    //     // debugger;
    // }



}


module.exports = RandomPlayer