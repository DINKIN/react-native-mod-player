'use strict';

var React      = require('react-native'),
    BrowseView = require('./BrowseView'),
    ListPlayer = require('../player/ListPlayer'),
    initialPaths;

var {
        AppRegistry,
        NavigatorIOS,
        View,
        Text,
        StyleSheet
    } = React;

var { 
        MCFsTool, // Deprecated
        MCModPlayerInterface,
        MCQueueManager
    } = require('NativeModules');

var getDirectories = function(path, callback) {
    console.log("DIRECTORY :: " + path)    
    if (path) {
        MCQueueManager.getFilesForDirectory(
            path,
            // failure
            () => {
                console.log('An Error Occurred');
            },
            // Success
            (response) =>  {
                callback(response)               

                // if (this.rowData) {
                //     this.state = this.getInitialState();
                //     this.forceUpdate();
                // }
            }
        );
    }
    else {
        MCQueueManager.getDirectories(
            // failure
            () => {
                console.log('An Error Occurred');
            },
            // Success
            (response) =>  {
                callback(response)               

                // if (this.rowData) {
                //     this.state = this.getInitialState();
                //     this.forceUpdate();
                // }
            }
        );
    }
};

getDirectories(null, function(rowData) {
    initialPaths = rowData;

    // var i = 0,
    //     len = rowData.length,
    //     dirStr = 'dir';

    // for (; i<len; i++) {
    //     rowData[i].type = dirStr
    // }

    // console.log('RowData')
    // console.log(rowData)
});


class BrowseViewNavigator extends React.Component{
    render() {
        var initialRoute = {
            title           : 'Browse',
            leftButtonTitle : 'Close',
            component       : BrowseView,
            passProps       : {
                rowData    : initialPaths,
                onRowPress : (record, childNavigator, ownerList) => {
                    // debugger;
                    this.onRowPress(record, childNavigator, ownerList);
                }
            },
            onLeftButtonPress : () => {
                var navigator = this.props.navigator;
                
                // This is a hack for ReactNative 0.8.0
                if (navigator.state.presentedIndex > 0) {
                    navigator.pop();
                }
            }
        };


        var navigatorIOS = React.createElement(NavigatorIOS, {
            style          : styles.container, 
            initialRoute   : initialRoute,
            tintColor      : "#FF0000",
            barTintColor   : "#000000",
            titleTextColor : "#00FF00",
            translucent    : false
        });

        return navigatorIOS;
    }

    onRowPress(record, childNavigator, ownerList) {
        // TODO: Setup color for selected item
        var isDir = !! record.number_files,
            title;


        if (isDir) {
            title = record.name + '/';
            window.main.showSpinner();
            getDirectories(record.name, (rowData)=> {
                var route = {
                    title     : title,
                    component : BrowseView,
                    passProps : {
                        rowData    : rowData,
                        onRowPress : (rec, childNav, ownrList) => {
                            this.onRowPress(rec, childNav, ownrList);
                        }
                    }
                };

                childNavigator.push(route);
                window.main.hideSpinner();
            });

        }
        else {
            // debugger;
            this.loadModFile(record, childNavigator, ownerList);                
        }

    }

    // Todo:  Clean this method up. Shit, it's a mess!
    loadModFile(record, childNavigator, ownerList) {
        window.main.showSpinner();
        var fileName = unescape (record.name);

        MCModPlayerInterface.loadFile(
            window.bundlePath + record.directory + fileName,
            //failure
            (data) => {
                window.main.hideSpinner();
                alert('Apologies. This file could not be loaded.');
                console.log(data);
            },        
            //success
            (modObject) => {

                modObject.fileName = fileName;

                var rowData = ownerList.props.rowData;
                
                this.props.navigator.push({
                    title            : 'Player',
                    component        : ListPlayer,
                    componentConfig  : {
                        ownerList : ownerList,
                        modObject : modObject,
                        patterns  : modObject.patterns,
                        rowData   : rowData,
                        rowID     : rowData.indexOf(record),
                        record    : record
                    }
                });
                window.main.hideSpinner();

            }
        );

    }
};


var styles = StyleSheet.create({
    container : {
        backgroundColor : '#000000',
        // borderWidth     : 3,
        // borderColor     : '#0000FF',
        // marginTop       : 20,
        overflow        : 'visible',
        flexDirection   : 'column',
        flex            : 1,
        alignSelf       : 'stretch'
    },

})
module.exports = BrowseViewNavigator;