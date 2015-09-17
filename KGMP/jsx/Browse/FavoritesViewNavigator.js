'use strict';

var React         = require('react-native'),
    FavoritesList = require('./FavoritesList'),
    ListPlayer    = require('../player/ListPlayer'),
    RandomPlayer  = require('../player/RandomPlayer'),
    BaseComponent = require('../BaseComponent');

var {
        AppRegistry,
        NavigatorIOS,
        View,
        Text,
        StyleSheet
    } = React;

var { 
        MCModPlayerInterface,
        MCQueueManager
    } = require('NativeModules');


class FavoritesListNavigator extends BaseComponent{
    render() {
        var initialRoute = {
            title           : 'Favorites',
            leftButtonTitle : 'Close',
            component       : FavoritesList,
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
        this.showSpinner();


        MCQueueManager.getFavoritesRandomized((record) => {
            // console.log(rowData);  
            var filePath = window.bundlePath + unescape(record.directory) + unescape(record.name);

            MCModPlayerInterface.loadFile(
                filePath,
                //failure
                (data) => {
                    this.hideSpinner();
                    alert('Failure loading ' + record.file_name);
                    console.log(data);
                },        
                //success
                (modObject) => {
                    // debugger;
                    var rtBtnText,
                        rtBtnHandler;

                    modObject.fileName = record.name;
                    modObject.id_md5   = record.id_md5;
                    modObject.record   = record;

                    window.mainNavigator.replace({
                        title            : 'Player',
                        rightButtonTitle : rtBtnText,
                        component        : ListPlayer,
                        componentConfig  : {
                            modObject   : modObject,
                            isFavorites : true,
                            patterns    : modObject.patterns
                        }
                    });
  
                    this.hideSpinner();
                }
            );

        });
       
    }

    // Todo:  Clean this method up. Shit, it's a mess!
    loadModFile(record, childNavigator, ownerList) {
        this.showSpinner();


        var fileName = unescape(record.name);

        MCModPlayerInterface.loadFile(
            window.bundlePath + unescape(record.directory) + fileName,
            //failure
            (data) => {
                this.hideSpinner();
                alert('Apologies. This file could not be loaded.');
                console.log(data);
            },        
            //success
            (modObject) => {

                modObject.directory = record.directory;

                modObject.fileName = fileName;

                var rowData = ownerList.props.rowData,
                    index = rowData.indexOf(record);


                modObject.record = record;
                modObject.id_md5 = record.id_md5;
                modObject.record = record;

                this.props.navigator.push({
                    title            : 'Player',
                    component        : ListPlayer,
                    componentConfig  : {
                        ownerList : ownerList,
                        modObject : modObject,
                        patterns  : modObject.patterns,
                        rowData   : rowData,
                        rowID     : index,
                        record    : record
                    }
                });
                
                this.hideSpinner();

                MCQueueManager.setQueueIndex(index);

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
module.exports = FavoritesListNavigator;