
import React, {
    Component, 
    PropTypes
} from "react";

import {
    Animated,
    AppRegistry,
    Dimensions,
    Easing,
    Image,
    PanResponder,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";


import Navigation from './Navigation';
import AnimatedPlayer from './player/AnimatedPlayer';
import ListPlayer from './player/ListPlayer';
import EQView from './AnimatedModal/EQView';
import PlayListSelectorView from './AnimatedModal/PlayListSelectorView';


const INITIAL_TAB      = 2,
      Icon             = require('react-native-vector-icons/Ionicons'),
      BaseView         = require('./BaseView'),
      BrowseList       = require('./List/BrowseList'),
      Playlists        = require('./List/Playlists'),
      // FavsViewNav      = require('./List/FavoritesViewNavigator'),
      PlayController   = require('./PlayController'),
      TabNavigator     = require('react-native-tab-navigator').default,
      NavItem          = TabNavigator.Item,
      windowDimensions = require('Dimensions').get('window'),
      BlurView         = require('react-native-blur').BlurView;

let windowStyles = {
    white : '#FFFFFF',
    center : 'center',
    baseBorderColor : '#535486'
}


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
                callback(response);              
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
  
            }
        );
    }
};


const viewRegistry = {
    'BrowseList' : {
        view  : BrowseList,
        title : 'Browse'
    }
}



var tabBarBgImage;

StatusBar.setBarStyle('default', true);


class DummyView extends React.Component {
    render() {
        var style = {
            flex:1, 
            backgroundColor : this.props.bgColor || '#FF0000',
            justifyContent : 'center',
            alignItems : 'center'
        }

        return (
            <View style={style}>
                <Text style={{fontSize:  20, color : '#FFFFFF', fontWeight : '900'}}>
                    {this.props.text || "Dummy View"}
                </Text>
            </View>
        )
    }
}

class HomeTabView extends React.Component {
    tabs = null;

    state = {
        selectedTab  : INITIAL_TAB,
        modObject    : null,
        initialPaths : []
    };

    styles = StyleSheet.create({
        tabBar : {
            height          : 65,
            width           : windowDimensions.width,
            backgroundColor : '#DFDFDF',
            position        : 'absolute'
        },
        tabSelected : {
            backgroundColor : 'transparent'
        },
        title : {
            paddingBottom: 5,
            color        : '#222',
            fontSize     : 14
        },
        icon : {
            color        : '#000000',
            fontSize     : 30,
            marginBottom : 0,
        }
    });


    componentWillMount() {
        MCModPlayerInterface.pause(() => {});

        // Automation for debugotron
        setTimeout(() => {
            return;

            let song;
            // var song = {
            //     "id_md5": "c3151fcdafadb7836144bf60c5c15d5e",
            //     "song_name": "",
            //     "like_value": 0,
            //     "in_queue": 0,
            //     "directory": "CLASS/",
            //     "file_name_short": "Giants.%20Citizen%20Kabuto%20installer.it",
            //     "name": "CLASS%20-%20Giants.%20Citizen%20Kabuto%20installer.it"
            // };

            // const song = {
            //     "id_md5": "a2517f005c486abb152a13592d25fa64",
            //     "song_name": "http%3A//www.at4re.com",
            //     "like_value": 0,
            //     "in_queue": 0,
            //     "directory": "AT4RE/",
            //     "file_name_short": "Super%20Video%20to%20WMA%20Converter%201.01%20B-Forcer.it",
            //     "name": "AT4RE%20-%20Super%20Video%20to%20WMA%20Converter%201.01%20B-Forcer.it"
            // }

            song = {
                "id_md5": "f7c9fce68fbf2ff238533a7ed44db18b",
                "song_name": "make%20me%20love%20it",
                "like_value": 0,
                "in_queue": 0,
                "directory": "ACME/",
                "file_name_short": "Ancient%20Pledg%20intro.xm",
                "name": "ACME%20-%20Ancient%20Pledg%20intro.xm"
            };

            PlayController.loadFile(song);
            setTimeout(() => { 
                
                PlayController.pause(); 
            }, 500);

            setTimeout(function() {
                PlayController.emitShowPlaylistSelectorScreen(song);
            }, 1750);
        }, 1000)

        // debugger;

        this.tabs = [
            // This sh*t is starting to get Sencha-like real quick!
            {
                title           : 'Browse',
                icon            : 'ios-folder-outline',
                child           : BrowseList,
                componentConfig : {
                    onRowPress : this.onBrowseListRowPress,
                    style      : {
                        paddingTop : 60,
                    }
                }
            },
            {
                title           : 'Playlists',
                icon            : 'ios-list-outline',
                child           : Playlists,
                componentConfig : {
                    onRowPress : this.onPlaylistRowPress,
                    style      : {
                        paddingTop : 60,
                    }
                }
            },
            {
                title           : 'Search',
                icon            : 'ios-search',
                child           : DummyView,
                componentConfig : {
                    bgColor : '#220022',
                    text    : 'Search'
                }
            },
            {
                title : 'Settings',
                icon            : 'ios-settings',
                child           : DummyView,
                componentConfig : {
                    bgColor : '#000022',
                    text    : 'Settings'
                }
            }
        ];
    }

    onBrowseListRowPress = (fileRecord, rowID, childNavigator, ownerList) => {
        // Shuffle row
        if (fileRecord.isShuffleRow) {

            var parentDir = fileRecord.parentDir ? fileRecord.parentDir.name : null;
            console.log(parentDir)
            // console.log(rowData);

            PlayController.loadRandom(parentDir);
        }
        // For files and directories
        else {
            var title = unescape(fileRecord.name);

            getDirectories(fileRecord.name, (records)=> {

                var route = {
                    title           : title,
                    component       : BrowseList,
                    componentConfig : {
                        initialPaths : records,
                        onRowPress   : this.onFileSelectForPlay,
                        parentDir    : fileRecord,
                        style        : { 
                            paddingTop : 60,
                            flex       : 1
                        },
                    }
                };

                childNavigator.push(route);
            });
        }
    }

    onFileSelectForPlay = (fileRecord, rowID) => {
        PlayController.setBrowseType(0);
        // debugger;
        PlayController.loadFile(
            fileRecord,
            () => {
                // PlayController.pause();
                // this.refs.modPlayer.showForTheFirstTime();
            }
        );

    }

    onPlaylistRowPress = (fileRecord, rowID, childNavigator, ownerList) => {
        console.log('onPlaylistRowPress', fileRecord, rowID);

        MCModPlayerInterface.getSongsForPlaylist(fileRecord.id, (songs) => {
            console.log('songs', JSON.stringify(songs, undefined, 4));

        })
    }

    setTabState(tabNo) {
        let state = this.state;
        if (state.selectedTab == tabNo) {
            // Pop to top
            let currentTabRef = ('tab_' + this.state.selectedTab);
            currentTabRef = this.refs[currentTabRef];

            let nav = currentTabRef.navigator,
                routeStack = nav.state.routeStack;

            if (routeStack.length > 1) {
                nav.resetTo(routeStack[0]);
            }
        }
        else {
            this.setState({ selectedTab: tabNo });
        }

    }

    buildTab(tabConfig, tabNo) {
        var state        = this.state,
            styles       = this.styles,
            isSelected   = (state.selectedTab === tabNo),
            key          = 'tab_' + tabNo,
            renderIconFn = () =>  <Icon name={icon} style={styles.icon}/>,
            navRef       = key,
            {
                title,
                icon,
                child
            } = tabConfig;

        var initialRoute = {
            component       : child,
            componentConfig : tabConfig.componentConfig || {}
        }

        return (
            <NavItem selected={isSelected}
                     tabStyle={isSelected && styles.tabSelected}
                     title={title}
                     titleStyle={styles.title}
                     renderIcon={renderIconFn}
                     key={key}
                     onPress={() => this.setTabState(tabNo)}>

                <Navigation ref={navRef} initialRoute={initialRoute}/>
            </NavItem>
        );
    }



    render() {
        var styles = this.styles,
            tabs   = this.tabs;

        window.home = this;


        return (
            <View style={{flex:1}}>
                <TabNavigator style={{flex:1}}
                              tabBarStyle={styles.tabBar}
                              animatedPlayerView={AnimatedPlayer}
                              sceneStyle={{}}>

                    {this.tabs.map((tabConfig, index) => this.buildTab(tabConfig, index + 1))}
                </TabNavigator>
                <EQView/>
                <PlayListSelectorView/>
            </View>
        );
    }

    addToStack(route) {
        var currentTabRef = this.refs['tab_' + this.state.selectedTab];

        // If we don't have a sub navigator... push to the top-level navigator
        if (! currentTabRef.subNav) {
            // console.log('New navigator')
            var newRoute = {
                component       : Navigation,
                foo             : 'bar',
                sceneConfig     : route.sceneConfig,
                componentConfig : {
                    topNav        : currentTabRef,
                    initialRoute  : route,
                    showNavBar    : true,
                    ref           : (comp) => {
                        currentTabRef.subNav = comp;
                    }
                }                
            };

            currentTabRef.push(newRoute);
        }
        else {
            currentTabRef.subNav.push(route);
        }
    }

    showSubview(config) {
        var viewConfig = viewRegistry[config.viewType];
        // console.log('viewConfig', JSON.stringify(config, undefined, 4));

        if (config.props && config.props.title) {
            config.props.title = config.props.title.replace(/&AMP;/gi, '&');
        }
        this.addToStack({
            component       : viewConfig.view,
                            // or, or, or, or, or, or, or... :) --JG
            title           : viewConfig.title || config.title || config.props.title || 'NO TITLE',
            componentConfig : config.props
        });
    }

};


module.exports  = HomeTabView;


