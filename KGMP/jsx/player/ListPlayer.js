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
                    var index = this.props.rowData.indexOf(record);
                    
                });
            });
        });

    
    }
    
   


    // loadFile(record, callback) {

    //     this.patterns = {};
    //     this.forceUpdate();
        
    //     this.showSpinner();
            
    //     var fileName = unescape (record.name);

    //     MCModPlayerInterface.loadFile(
    //         window.bundlePath + unescape(record.directory) + fileName,
    //         //failure
    //         (data) => {
    //             this.hideSpinner();
    //             var pathSplit = record.directory.split('/');
    //             alert('Failure in loading file.');
    //             console.log(data);
    //         },        
    //         //success
    //         (modObject) => {
    //             this.loading = false;
    //             callback && callback();

    //             this.refs.progressView.setState({
    //                 numberOfCells   : modObject.patternOrds.length,
    //                 highlightNumber : 0
    //             });

    //             this.modObject = modObject;
    //             modObject.fileName = fileName;
    //             modObject.record = record;
    //             // this.forceUpdate();   

    //             this.patterns = modObject.patterns;
    //             this.onWkWebViewInit();
    //             this.playTrack();
    //             this.hideSpinner();
    //         }
    //     );
    // }

    
}


module.exports = ListPlayer