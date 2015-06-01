var React = require('react-native');


var MCModPlayerInterface = require('NativeModules').MCModPlayerInterface,
    AbstractPlayer       = require('./AbstractPlayer');


class Player extends AbstractPlayer {

    previousTrack() {
        var state     = this.state,
            rowID     = parseInt((this.rowID != null) ? this.rowID : this.props.rowID),
            ownerList = this.props.ownerList,
            record    = ownerList.getPreviousRecord(rowID);

        if (! record) {
            rowID  = ownerList.getRowDataCount();
            record = ownerList.getLastRecord();

            if (! record) {
                alert('Apologies! There are no more songs to play in this list.');
                VibrationIOS.vibrate();
                return;
            }
        }

        this.pauseTrack(() => {
            this.patterns = {};
            this.loadFile(record, () => this.rowID = rowID - 1);
        });

    }
    
    // Todo: clean this up
    nextTrack() {
        var state = this.state,
            rowID = parseInt((this.rowID != null) ? this.rowID : this.props.rowID),
            ownerList = this.props.ownerList,
            record = ownerList.getNextRecord(rowID);

        // console.log('nextTrack :: ' + rowID);

        if (! record) {
            rowID  = 0;
            record = ownerList.getFirstRecord();

            if (! record) {
                alert('Apologies! There are no more songs to play in this list.');
                VibrationIOS.vibrate();
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
                    this.registerPatternUpdateHandler();

                    state.songLoaded  = 1;
                    state.playingSong = 1;

                    this.setState(state);

                    var ownerList = props.ownerList,
                        rowID     = parseInt((this.rowID != null) ? this.rowID : props.rowID);

                    ownerList.setRecordIsPlaying(rowID, true);
                }
            );

            
        } 
        else {
            state.playingSong = 1;
            MCModPlayerInterface.resume(
                () => {
                    this.registerPatternUpdateHandler();
                    this.setState(state);
                    
                    var ownerList = props.ownerList,
                        rowID     = parseInt((this.rowID != null) ? this.rowID : props.rowID);

                    ownerList.setRecordIsPlaying(rowID, true);
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
        MCModPlayerInterface.loadFile(
            record.path,
            //failure
            (data) => {
                var pathSplit = record.path.split('/');
                alert('Failure in loading file ' + pathSplit[pathSplit.length - 1]);
                console.log(data);
            },        
            //success
            (modObject) => {

                if (modObject) {
                    callback && callback();
                    this.modObject = modObject;
                    modObject.fileName = record.file_name;

                    // this.forceUpdate();   

                    this.patterns = modObject.patterns;;

                    this.playTrack();

                }
            }
        );
    }
}


module.exports = Player