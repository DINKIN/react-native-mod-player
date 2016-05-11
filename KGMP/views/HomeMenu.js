
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


const Icon          = require('react-native-vector-icons/Ionicons'),
      BaseView      = require('./BaseView'),
      BrowseViewNav = require('./List/BrowseViewNavigator'),
      FavsViewNav   = require('./List/FavoritesViewNavigator'),
      RandomPlayer  = require('./player/RandomPlayer');

let windowStyles = {
    white : '#FFFFFF',
    center : 'center',
    baseBorderColor : '#535486'

}

class HomeMenu extends BaseView {
    render() {
        let styles = this.styles;

        return (
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>KEYGEN</Text>
                    <Text style={styles.titleText}>MUSiC</Text>
                    <Text style={styles.titleText}>PLAYER</Text>
                </View>

                <View style={styles.centerContainer}>
                    <TouchableOpacity style={styles.squareButton} onPress={this.onBrowsePress}>
                        <Text style={styles.menuItemTitle}>BROWSE</Text>
                        <Icon name={'ios-list-outline'} style={styles.icon}/>
                      
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.squareButton} onPress={() => {}}>
                        <Text style={styles.menuItemTitle}>FAVORiTES</Text>
                        <Icon name={'android-favorite'} style={styles.icon}/>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.randomButton} onPress={this.onRandomPress}>
                    <Text style={styles.horizontalButtonTitle}>RANDOM SONG</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.aboutAppButton}>
                    <Text style={styles.horizontalButtonTitle}>ABOUT THE APP</Text>
                </TouchableOpacity>

                <View style={styles.logoContainer}>
                    <Text style={{color:'white',fontSize:20}}>MODUS CREATE LOGO</Text>
                </View>
            </View>
        )
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
    
    onBrowsePress  = () =>{
        this.showSpinner();

        setTimeout(() => {
            this.props.navigator.push({
                component      : BrowseViewNav,
                // transitionType : 'PushFromRight'
            });

            this.hideSpinner();
        }, 50)

    };
    
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
            paddingTop : 50,
            paddingHorizontal : 10,
            flex:1
        },

        titleContainer : {
            alignItems : windowStyles.center,
            marginBottom : 30,
            // borderWidth : 1, borderColor : '#AEAEAE'
        },

        titleText : {
            color      : windowStyles.white,
            fontFamily : 'PerfectDOSVGA437Win', 
            fontSize   : 60,
        },


        centerContainer : {
            flexDirection : 'row',
            justifyContent : 'space-between',
            marginBottom : 10
        },
        menuItemTitle : {
            fontFamily : 'PerfectDOSVGA437Win',
            fontSize: 20,
            color : windowStyles.white
        },
        icon : {
            fontSize:  75,
            color : windowStyles.white
        },


        squareButton : {
            width          : 165,
            height         : 125,
            alignItems     : windowStyles.center,
            justifyContent : windowStyles.center,
            borderWidth    : 2,
            borderRadius   : 5,
            borderColor    : windowStyles.baseBorderColor,
            alignItems     : windowStyles.center
        },

        horizontalButtonTitle : {
            fontSize : 24,
            color    : windowStyles.white,
            fontFamily : 'PerfectDOSVGA437Win',


        },
        randomButton : {
            height         : 100,
            flex           : 1,
            borderWidth    : 2,
            borderRadius   : 5,
            borderColor    : windowStyles.baseBorderColor,
            alignItems     : windowStyles.center, 
            justifyContent : windowStyles.center, 

        },

        aboutAppButton : {
            height         : 75,
            flex           : 1,
            borderWidth    : 2,
            borderRadius   : 5,
            borderColor    : windowStyles.baseBorderColor,
            marginTop      : 10,
            alignItems     : windowStyles.center, 
            justifyContent : windowStyles.center, 
        },

        logoContainer : {
            flex           : 1, 
            alignItems     : windowStyles.center, 
            justifyContent : 'flex-end', 
            paddingBottom  : 10
        }
    });
}

module.exports = HomeMenu