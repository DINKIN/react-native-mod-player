'use strict';

var React           = require('react-native'),
    FavoritesView   = require('./FavoritesView'),
    FavoritesPlayer = require('../player/FavoritesPlayer'),
    RandomPlayer    = require('../player/RandomPlayer');

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


class FavoritesViewNavigator extends React.Component{
    render() {
        var initialRoute = {
            title           : 'Favorites',
            leftButtonTitle : 'Close',
            component       : FavoritesView,
            passProps       : {
                rowData    : this.props.rowData,
                onRowPress : (record, childNavigator, ownerList) => {
                    this.onRowPress(record, childNavigator, ownerList);
                },
                onShufflePress : () => {
                    this.onShufflePress();
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


        return React.createElement(NavigatorIOS, {
            style          : styles.container, 
            initialRoute   : initialRoute,
            tintColor      : "#FF0000",
            barTintColor   : "#000000",
            titleTextColor : "#00FF00",
            translucent    : false
        });
    }

    onRowPress(record, childNavigator, ownerList) {
        // TODO: Setup color for selected item
        this.loadModFile(record, childNavigator, ownerList);
    }

    onShufflePress() {
        var  navigator = this.props.navigator;
        window.main.showSpinner();

        window.db.clear();

        window.db.getNextRandomFavorite((rowData) => {
            // console.log(rowData);
           
            var filePath = window.bundlePath + decodeURIComponent(rowData.path) + decodeURIComponent(rowData.file_name);
            MCModPlayerInterface.loadFile(
                filePath,
                //failure
                (data) => {
                    window.main.hideSpinner();
                    alert('Failure loading ' + rowData.file_name);
                    console.log(data);
                },        
                //success
                (modObject) => {
                    // debugger;
                    var fileName  = rowData.file_name,
                        rtBtnText,
                        rtBtnHandler;

                    modObject.fileName = fileName;
                    
                    window.mainNavigator.push({
                        title            : 'Player',
                        rightButtonTitle : rtBtnText,
                        component        : RandomPlayer,
                        componentConfig  : {
                            modObject   : modObject,
                            isFavorites : true,
                            patterns    : modObject.patterns
                        }
                    });
  
                    window.main.hideSpinner();
                }
            );

        });
       
    }

    // Todo:  Clean this method up. Shit, it's a mess!
    loadModFile(record, childNavigator, ownerList) {
        window.main.showSpinner();
        MCModPlayerInterface.loadFile(
            bundlePath + decodeURIComponent(record.path) + decodeURIComponent(record.file_name),
            //failure
            (data) => {
                window.main.hideSpinner();
                alert('Apologies. This file could not be loaded.');
                console.log(data);
            },        
            //success
            (modObject) => {

                modObject.path = record.path;

                var fileName = modObject.path.split('/');

                modObject.fileName = fileName[fileName.length - 1];
                // var cn = childNavigator;
                // var ol = ownerList;
                // debugger;
                var rowData = ownerList.props.rowData;
                
                this.props.navigator.push({
                    title            : 'Player',
                    component        : FavoritesPlayer,
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
        backgroundColor : '#00FF00',
        // borderWidth     : 3,
        // borderColor     : '#FF00FF',
        // marginTop       : 20,
        // overflow        : 'visible',
        // flexDirection   : 'column',
        flex            : 1,
        // alignSelf       : 'stretch'
    },

})
module.exports = FavoritesViewNavigator;