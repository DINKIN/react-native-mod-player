'use strict';

var React      = require('react-native'),
    FavoritesView = require('./FavoritesView'),
    ListPlayer = require('../player/ListPlayer');

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
            titleTextColor : "#00FF00"
        });
    }

    onRowPress(record, childNavigator, ownerList) {
        // TODO: Setup color for selected item

        this.loadModFile(record, childNavigator, ownerList);                

    }

    // Todo:  Clean this method up. Shit, it's a mess!
    loadModFile(record, childNavigator, ownerList) {
        window.main.showSpinner();
        MCModPlayerInterface.loadFile(
            bundlePath + record.path + record.file_name,
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
module.exports = FavoritesViewNavigator;