
import React, {
    Component, 
    PropTypes
} from "react";

import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Animated,
    PanResponder,
    Dimensions,
    Easing
} from "react-native";


import Navigation from './Navigation';
import AnimatedPlayer from './player/AnimatedPlayer';
import ListPlayer from './player/ListPlayer';

const windowDimensions = Dimensions.get('window');

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
            // Success`
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

const Icon           = require('react-native-vector-icons/Ionicons'),
      BaseView       = require('./BaseView'),
      BrowseList     = require('./List/BrowseList'),
      FavsViewNav    = require('./List/FavoritesViewNavigator'),
      RandomPlayer   = require('./player/RandomPlayer'),
      PlayController = require('./PlayController');

let windowStyles = {
    white : '#FFFFFF',
    center : 'center',
    baseBorderColor : '#535486'

}

var loadedDirectories; // debug purposes

class HomeMenu extends BaseView {
    state = {
        modObject    : null
    };

    componentWillMount() {
        MCModPlayerInterface.pause(() => {});

        getDirectories(null, (initialPaths) => {
            this.setState({
                initialPaths : initialPaths
            });

            // Debug purposes. automates the showing of the player
            // setTimeout(() => {
            //     this.onRowPress(initialPaths[12], this.refs.navigator);

            //     setTimeout(() => {
            //         // debugger;
            //         this.onRowPress(loadedDirectories[8], this.refs.navigator);
            //         // PlayController.pause();

            //         setTimeout(() => {
            //             this.refs.modPlayer.show();
            //             PlayController.pause();
            //         }, 500);
            //     }, 500);
            // }, 500);
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
                        flex       : 1
                    },

                }
            }

            innerView = <Navigation style={{flex:1}} showNavBar={true} ref={"navigator"} initialRoute={initialRoute}/>;
            // innerView = <BrowseList rowData={state.initialPaths} style={{flex:1}}/>
        }
        else {
            innerView = <View />
        }


        return (
            <View style={styles.container}>
                {innerView}
                
                <AnimatedPlayer ref={'modPlayer'}/>
            </View>       
        )
    }


    onRowPress = (record, childNavigator, ownerList) => {
        var isDir = !! record.number_files,
            title;

        if (isDir) {
            title = unescape(record.name);
            getDirectories(record.name, (rowData)=> {
                loadedDirectories = rowData; // for debug purposes
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
        else if (record.isShuffleRow) {
            alert('This feature is not ready ;)')
        }
        else {
            // debugger;
            this.loadModFile(record, childNavigator, ownerList);                
        }

    }

    // Todo:  Clean this method up. Shit, it's a mess!
    loadModFile = (fileRecord) => {
        // window.main.showSpinner();
        // var fileName = unescape(fileRecord.name);


        PlayController.loadFile(fileRecord, () => {
            this.refs.modPlayer.showForTheFirstTime();
        });

        return;
        MCModPlayerInterface.loadFile(
            window.bundlePath + unescape(record.directory) + fileName,
            //failure
            (data) => {
                alert('Apologies. This file could not be loaded.');
            },        
            //success
            (modObject) => {
                this.refs.modPlayer.setState({
                    modObject  : modObject,
                    fileRecord : record 
                });

                
                // this.showPlayerForTheFirstTime();

                // MCModPlayerInterface.resume(() => {})
                // var rowData = ownerList.props.rowData,
                //     rowID = rowData.indexOf(record);

                
                // MCQueueManager.setQueueIndex(rowID);

                // modObject.fileName = fileName;
                // modObject.id_md5   = record.id_md5;
                // modObject.record   = record;
                // this.props.navigator.push({
                //     title            : 'Player',
                //     component        : ListPlayer,
                //     componentConfig  : {
                //         ownerList  : ownerList,
                //         modObject  : modObject,
                //         patterns   : modObject.patterns,
                //         rowData    : rowData,
                //         rowID      : rowID,
                //         fileRecord : record
                //     }
                // });


            }
        );

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