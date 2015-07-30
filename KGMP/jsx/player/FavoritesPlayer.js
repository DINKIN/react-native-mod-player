var React                = require('react-native'),
    MCModPlayerInterface = require('NativeModules').MCModPlayerInterface,
    ListPlayer           = require('./ListPlayer');


class ListPlayer extends ListPlayer {

    loadFile(record, callback) {

        this.patterns = {};
        this.forceUpdate();
        this.refs.webView.execJsCall('cls()');

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
                this.loading = false;

                callback && callback();

                this.refs.progressView.setState({
                    numberOfCells   : modObject.patternOrds.length,
                    highlightNumber : 0
                });

                this.modObject = modObject;
                modObject.fileName = record.file_name;

                this.patterns = modObject.patterns;
                this.onWkWebViewInit();
                this.playTrack();
            }
        );
    }

}

module.exports = ListPlayer;