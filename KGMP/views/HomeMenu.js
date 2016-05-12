
import React, {
    Component, 
    PropTypes
} from "react";

import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TouchableOpacity
} from "react-native";


import Navigation from './Navigation';


var initialPaths,
    {
        MCModPlayerInterface,
        MCQueueManager
    } = require('NativeModules');


var getDirectories = function(path, callback) {
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


const Icon         = require('react-native-vector-icons/Ionicons'),
      BaseView     = require('./BaseView'),
      BrowseList   = require('./List/BrowseList'),
      FavsViewNav  = require('./List/FavoritesViewNavigator'),
      RandomPlayer = require('./player/RandomPlayer');

let windowStyles = {
    white : '#FFFFFF',
    center : 'center',
    baseBorderColor : '#535486'

}

class HomeMenu extends BaseView {
    state = {
        initialPaths : null
    };

    componentWillMount() {

        getDirectories(null, (initialPaths) => {
            this.setState({
                initialPaths : initialPaths
            })
        });
    }

    render() {
        let styles = this.styles,
            state  = this.state,
            innerView;

        if (state.initialPaths) {

            let initialRoute = {
                component       : BrowseList,
                title           : 'Browse',

                componentConfig : {
                    rowData    : state.initialPaths,
                    onRowPress : this.onRowPress,
                    style      : { 
                        paddingTop : 70,
                        flex : 1
                    },

                }
            }

            innerView =  <Navigation style={{flex:1}} showNavBar={true} ref={"navigator"} initialRoute={initialRoute}/>;
            // innerView = <BrowseList rowData={state.initialPaths} style={{flex:1}}/>
        }
        else {
            innerView = <View />
        }



        return (
            <View style={styles.container}>
                {innerView}
            </View>       
        )
    }


    onRowPress = (record, childNavigator, ownerList) => {
        // TODO: Setup color for selected item
        var isDir = !! record.number_files,
            title;


        if (isDir) {
            title = unescape(record.name);
            getDirectories(record.name, (rowData)=> {
                var route = {
                    title     : title,
                    component : BrowseList,
                    componentConfig : {
                        rowData    : rowData,
                        onRowPress : this.onRowPress,
                        style      : { 
                            paddingTop : 70,
                            flex : 1
                        },
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


    onRandomPress = () => {
        var  navigator = this.props.navigator;
        this.showSpinner();


        MCQueueManager.getNextRandomAndClearQueue((rowData) => {
            // console.log(rowData);
            var filePath = window.bundlePath + unescape(rowData.directory) + unescape(rowData.name);

            MCModPlayerInterface.loadFile(
                filePath,
                //failure
                (data) => {
                    this.hideSpinner();
                    alert('Failure loading ' + unescape(rowData.name));
                },       

                //success
                (modObject) => {
                    // debugger;
                    var fileName  = rowData.file_name,
                        rtBtnText,
                        rtBtnHandler;

                    modObject.id_md5 = rowData.id_md5;
                    modObject.fileName = fileName;
                    
                    window.mainNavigator.push({
                        title            : 'Player',
                        rightButtonTitle : rtBtnText,
                        component        : RandomPlayer,
                        componentConfig  : {
                            modObject  : modObject,
                            patterns   : modObject.patterns,
                            fileRecord : rowData
                        }
                    });
  
                    this.hideSpinner();
                }
            );

        });
       
    }
    
    
    onFavoritesPress  = () => {
        this.showSpinner();
        MCQueueManager.getFavorites((rowData) => {
            // console.log('Favorites:');
            // console.log(rowData);
            if (rowData.directory) {
                rowData = [rowData];
            }

            window.mainNavigator.push({
                component       : FavsViewNav,
                componentConfig : {
                    rowData : rowData
                }
            });

            this.hideSpinner();
        });
    };
    
    onWKWVDemo  = () => {

        this.showSpinner();
        MCModPlayerInterface.loadModusAboutMod(
            //failure
            (data) => {
                alert('Apologies. This file could not be loaded.');
                console.log(data);
            },        
            //success
            (modObject) => {

                modObject.directory = unescape(modObject.directory);
                modObject.file_name = unescape(modObject.file_name);

                window.mainNavigator.push({
                    title           : 'WKWVDemo',
                    component       : AboutWKWV,
                    componentConfig : {
                        modObject : modObject
                    }
                });
                this.hideSpinner();
            }
        ); 
    };

    onAboutPress = () => {

        // this.showSpinner();
        // MCModPlayerInterface.loadModusAboutMod(
        //     //failure
        //     (data) => {
        //         alert('Apologies. This file could not be loaded.');
        //         console.log(data);
        //     },        
        //     //success
        //     (modObject) => {

        //         modObject.directory = unescape(modObject.directory);
        //         modObject.file_name = unescape(modObject.file_name);

                window.mainNavigator.push({
                    title           : 'About',
                    component       : AboutView,
                    componentConfig : {
                        // modObject : modObject
                    }
                });
                // this.hideSpinner();
        //     }
        // );        
    };
    
    onSearchPress () {
        // this.props.onSearchPress();
    }


    styles = StyleSheet.create({
        container : {
            // paddingTop : 50,
            // paddingHorizontal : 10,
            flex:1
        },

        titleContainer : {
            alignItems   : windowStyles.center,
            marginBottom : 30,
            // borderWidth : 1, borderColor : '#AEAEAE'
        },

        titleText : {
            color    : windowStyles.white,
            fontSize : 60,
        },


        centerContainer : {
            flexDirection  : 'row',
            justifyContent : 'space-between',
            marginBottom   : 10
        },
    });
}

module.exports = HomeMenu