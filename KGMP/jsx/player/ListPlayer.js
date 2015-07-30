var React = require('react-native'),
    MCModPlayerInterface = require('NativeModules').MCModPlayerInterface,
    AbstractPlayer       = require('./AbstractPlayer');


class ListPlayer extends AbstractPlayer {

    previousTrack() {
        if (this.loading) {
            return;
        }

        this.loading = true;

        var state     = this.state,
            rowID     = parseInt((this.rowID != null) ? this.rowID : this.props.rowID),
            ownerList = this.props.ownerList,
            record    = this.getPreviousRecord(rowID);

        if (! record) {
            rowID  = this.getRowDataCount();
            record = this.getLastRecord();

            // debugger;
            if (! record) {
                alert('Apologies! There are no more songs to play in this list.');
                // VibrationIOS.vibrate();
                return;
            }
        }

        this.pauseTrack(() => {
            this.patterns = {};
            this.loadFile(record, () => this.rowID = rowID - 1);
        });

    }
    
    // Todo: clean this up
    // Todo: read from local list (not have to poll the owner component)
    nextTrack() {

        if (this.loading) {
            return;
        }

        this.loading = true;

        var state     = this.state,
            rowID     = parseInt((this.rowID != null) ? this.rowID : this.props.rowID),
            ownerList = this.props.ownerList,
            record    = this.getNextRecord(rowID);

        if (! record) {
            rowID  = 0;
            record = this.getFirstRecord();

            if (! record) {
                debugger
                alert('Apologies! There are no more songs to play in this list.');
                VibrationIOS.vibrate();
                this.loading = false;
                return;
            }
        }

        this.pauseTrack(() => {
            this.patterns = {};
            this.loadFile(record, () => this.rowID = rowID + 1);
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

                ownerList.setRecordIsPlaying(rowID, false);    

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
        this.refs.webView.execJsCall('cls()');
        
        window.main.showSpinner();
        
        MCModPlayerInterface.loadFile(
            record.path,
            //failure
            (data) => {
                window.main.hideSpinner();
                var pathSplit = record.path.split('/');
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
                modObject.fileName = record.file_name;

                // this.forceUpdate();   

                this.patterns = modObject.patterns;
                this.onWkWebViewInit();
                this.playTrack();
                window.main.hideSpinner();

            }
        );
    }

    getRowDataCount() {
        return this.props.rowData.length - 1;
    }

    getFirstRecord() {
        return this.props.rowData[0];
    }

    getLastRecord() {
        return this.props.rowData[this.props.rowData.length - 1];
    }

    getPreviousRecord(rowID) {
        var record = this.props.rowData[--rowID];

        return record ? record : null;
    }

    getNextRecord(rowID) {
        var record = this.props.rowData[++rowID];

        return record ? record : null;
    }
}


module.exports = ListPlayer