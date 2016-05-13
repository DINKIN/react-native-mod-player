
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


            setTimeout(() => {
                this.onRowPress(initialPaths[1], this.refs.navigator);
                setTimeout(() => {
                    this.onRowPress(loadedDirectories[2], this.refs.navigator);

                    setTimeout(() => {
                        this.refs.modPlayer.show();
                    }, 1000);
                }, 500)
            }, 500)
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

            innerView = <Navigation style={{flex:1}} showNavBar={true} ref={"navigator"} initialRoute={initialRoute}/>;
            // innerView = <BrowseList rowData={state.initialPaths} style={{flex:1}}/>
        }
        else {
            innerView = <View />
        }


        // TODO Abstract
        // var animatedPlayerStyle = {
        //         width           : windowDimensions.width,
        //         height          : windowDimensions.height,
        //         backgroundColor : 'rgba(0,0,255,.25)',//'transparent',
        //         position        : 'absolute',
        //         top             : windowDimensions.height,
        //         transform       : [
        //             { translateX : state.pan.x },
        //             { translateY : state.pan.y }
        //         ]
        //     },
        //     draggableToolbarStyle = {
        //         height            : 40,
        //         flexDirection     : 'row',
        //         justifyContent    : 'space-between',
        //         backgroundColor   : 'rgba(255, 255, 255, .7)',
        //         alignItems        : 'center',
        //         left              : 0,
        //         right             : 0,
        //         bottom            : state.tabBarPosition
        //     },

        //     playerBodyStyle = {
        //         opacity : state.pan.y.interpolate({
        //             inputRange : [ 
        //                 -(windowDimensions.height - 49),
        //                 0
        //             ], 
        //             outputRange: [ 1, 0 ]
        //         })
        //     }

        return (
            <View style={styles.container}>
                {innerView}
                
                <AnimatedPlayer ref={'modPlayer'}/>
                {/* TODO: move to separate component */}

                {/*
                <Animated.View style={animatedPlayerStyle}>
                
                    <Animated.View style={draggableToolbarStyle} {...this.panResponder.panHandlers}>
                        <Text>Drag me!</Text>
                    </Animated.View>
                
                    <Animated.View style={playerBodyStyle}>
                        <ListPlayer ref="modPlayer" style={{height:windowDimensions.height - 40}}/>                        
                    </Animated.View>
        
                </Animated.View>


                */}
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
        else {
            // debugger;
            this.loadModFile(record, childNavigator, ownerList);                
        }

    }

    // Todo:  Clean this method up. Shit, it's a mess!
    loadModFile = (record, childNavigator, ownerList) => {
        // window.main.showSpinner();
        var fileName = unescape(record.name);

        MCModPlayerInterface.loadFile(
            window.bundlePath + unescape(record.directory) + fileName,
            //failure
            (data) => {
                // window.main.hideSpinner();
                alert('Apologies. This file could not be loaded.');
                // console.log(data);
            },        
            //success
            (modObject) => {
                this.refs.modPlayer.setState({
                    modObject  : modObject,
                    fileRecord : record 
                });

                this.refs.modPlayer.showForTheFirstTime();
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

                // window.main.hideSpinner();

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