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
                this.loadFile(record, () => {
                    this.hideSpinner();
                });
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
                this.loadFile(record, () => {
                    this.hideSpinner();
                });
            });
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

                    //TODO: Show "now Playing" in top toolbar
                    //this.props.navigator.navigationContext.currentRoute
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
            MCModPlayerInterface.pause(() => {
                state.playingSong = 0;
                this.setState(state);

                var props     = this.props,
                    ownerList = props.ownerList,
                    rowID     = parseInt((this.rowID != null) ? this.rowID : props.rowID);

                this.deregisterPatternUpdateHandler();     

                callback && callback();
            }); 
        }
        else {
            callback && callback();
        }
    }


    loadFile(record, callback) {

        this.patterns = {};
        this.forceUpdate();
        
        this.showSpinner();
            
        var fileName = unescape (record.name);

        MCModPlayerInterface.loadFile(
            window.bundlePath + unescape(record.directory) + fileName,
            //failure
            (data) => {
                this.hideSpinner();
                var pathSplit = record.directory.split('/');
                alert('Failure in loading file ' + pathSplit[pathSplit.length - 1]);
                console.log(data);
            },        
            //success
            (modObject) => {
                this.loading = false;
                callback && callback();

                this.refs.progressView.setState({
                    numberOfCells   : modObject.patternOrds.length,
                    highlightNumber : 0
                });

                this.modObject = modObject;
                modObject.fileName = fileName;
                modObject.record = record;
                // this.forceUpdate();   

                this.patterns = modObject.patterns;
                this.onWkWebViewInit();
                this.playTrack();
                this.hideSpinner();

            }
        );
    }

    like(rowData) {
        this.showLikeSpinner();

        setTimeout(() => {
            MCQueueManager.updateLikeStatus(
                1,
                this.modObject.id_md5,
                this.hideSpinner
            );
        }, 250);
    }

    dislike () {
        this.showDislikeSpinner();

        MCQueueManager.updateLikeStatus(
            -1,
            this.modObject.id_md5,
            (record) => {
                this.props.ownerList.removeRecord(this.modObject.record);
                
                if (record) {
                    this.loadFile(record);    
                }
                else {
                    alert('No more files in the list')

                }
                
            }
        );
    }
}


module.exports = ListPlayer