'use strict';

var React      = require('react-native'),
    BrowseView = require('./BrowseView'),
    ListPlayer = require('./player/ListPlayer'),
    initialPaths;

var {
        AppRegistry,
        NavigatorIOS,
        View,
        Text,
        StyleSheet
    } = React;

var { 
        MCFsTool,
        MCModPlayerInterface
    } = require('NativeModules');

var getDirectories = function(path, callback) {
    MCFsTool.getDirectoriesAsJson(
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
};

getDirectories(null, function(rowData) {
    initialPaths = rowData;
});


class BrowseViewNavigator extends React.Component{
    render() {
        var initialRoute = {
            title           : 'KeyGen Music Player',
            leftButtonTitle : 'Close',
            component       : BrowseView,
            passProps       : {
                rowData    : initialPaths,
                onRowPress : (record, childNavigator, ownerList) => {
                    this.onRowPress(record, childNavigator, ownerList);
                }
            },
            onLeftButtonPress : () => {
                this.props.navigator.pop();
            }
        };


        var navigatorIOS = React.createElement(NavigatorIOS, {
            style          : styles.container, 
            initialRoute   : initialRoute,
            tintColor      : "#FF0000",
            barTintColor   : "#000000",
            titleTextColor : "#00FF00"
        });

        return navigatorIOS;
    }

    onRowPress(record, childNavigator, ownerList) {
        // TODO: Setup color for selected item
        var isDir = (record.type == 'dir'),
            title;

        if (isDir) {
            title = record.name + '/';
            
            getDirectories(record.path, (rowData)=> {
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
            });

        }
        else {
            // debugger;
            this.loadModFile(record, childNavigator, ownerList);                
        }

    }

    // Todo:  Clean this method up. Shit, it's a mess!
    loadModFile(record, childNavigator, ownerList) {
        MCModPlayerInterface.loadFile(
            record.path,
            //failure
            (data) => {
                alert('Apologies. This file could not be loaded.');
                console.log(data);
            },        
            //success
            (modObject) => {
                if (modObject) {

                    modObject.path = record.path;

                    var fileName = modObject.path.split('/');

                    modObject.fileName = fileName[fileName.length - 1];
                   
                    childNavigator.push({
                        title            : 'Player',
                        component        : ListPlayer,
                        passProps  : {
                            ownerList : ownerList,
                            modObject : modObject,
                            patterns  : modObject.patterns
                        }
                    });

                }
                else {
                    alert('Woah. Something hit the fan!');
                }

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