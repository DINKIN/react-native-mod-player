
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


const Icon             = require('react-native-vector-icons/Ionicons'),
      BaseView         = require('./BaseView'),
      BrowseList       = require('./List/BrowseList'),
      FavsViewNav      = require('./List/FavoritesViewNavigator'),
      RandomPlayer     = require('./player/RandomPlayer'),
      PlayController   = require('./PlayController'),
      TabNavigator     = require('react-native-tab-navigator').default,
      NavItem          = TabNavigator.Item,
      windowDimensions = require('Dimensions').get('window'),
      BlurView         = require('react-native-blur').BlurView,
      INITIAL_TAB      = 1;

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
            // opacity         : .8,
            width           : windowDimensions.width,
            backgroundColor : '#DFDFDF',
            position : 'absolute'
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

        setTimeout(() => {
            PlayController.loadFile({
                "id_md5": "26381c7ee66e0ac960da09ab31cdfdc7",
                "song_name": "",
                "like_value": 0,
                "in_queue": 0,
                "directory": "%21Others/",
                "file_name_short": "ABANDON%20-%20Kick%20Off%202%20intro.xm",
                "name": "ABANDON%20-%20Kick%20Off%202%20intro.xm"
            })
        }, 1000)

        this.tabs = [
            // This sh*t is starting to get Sencha-like real quick!
            {
                title           : 'Browse',
                icon            : 'ios-folder-outline',
                child           : BrowseList,
                componentConfig : {
                    bgColor    : '#002200',
                    text       : 'Home',
                    onRowPress : this.onRowPress,
                    style      : {
                        paddingTop : 60,
                    }
                }
            },
            {
                title           : 'Playlists',
                icon            : 'ios-list-outline',
                child           : DummyView,
                componentConfig : {
                    bgColor : '#220000',
                    text    : 'Playlists'
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

    onRowPress = (record, childNavigator, ownerList) => {
        var isDir = !! record.number_files,
            title;



        if (isDir) {
            title = unescape(record.name);
            getDirectories(record.name, (records)=> {
                loadedDirectories = initialPaths; // for debug purposes


                var route = {
                    title     : title,
                    component : BrowseList,
                    componentConfig : {
                        initialPaths : records,
                        onRowPress   : this.onRowPress,
                        style        : { 
                            paddingTop : 60,
                            flex       : 1
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

    loadModFile = (fileRecord) => {

        PlayController.loadFile(fileRecord, () => {
            // PlayController.pause();
            // this.refs.modPlayer.showForTheFirstTime();
        });
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
        var state      = this.state,
            styles     = this.styles,
            isSelected = (state.selectedTab === tabNo),
            key        = 'tab_' + tabNo,
            navRef     = key,
            {
                title,
                icon,
                child
            } = tabConfig;

        var initialRoute = {
            component : child,
            componentConfig : tabConfig.componentConfig || {}
        }

        return (
            <NavItem selected={isSelected}
                     tabStyle={isSelected && styles.tabSelected}
                     title={title}
                     titleStyle={styles.title}
                     renderIcon={() =>  <Icon name={icon} style={styles.icon}/>}
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
            <TabNavigator tabBarStyle={styles.tabBar}
                          animatedPlayerView={AnimatedPlayer}
                          sceneStyle={{paddingBottom:0}}>

                {this.tabs.map((tabConfig, index) => this.buildTab(tabConfig, index + 1))}
            </TabNavigator>
        );
    }

    addToStack(route) {
        var currentTabRef = ('tab_' + this.state.selectedTab);
        // debugger;
        currentTabRef = this.refs[currentTabRef];

        // If we don't have a sub navigator... push to the top-level navigator
        if (! currentTabRef.subNav) {
            // console.log('New navigator')
            var newRoute = {
                component : Navigation,
                foo       : 'bar',
                componentConfig : {
                    topNav       : currentTabRef,
                    initialRoute : route,
                    showNavBar   : true,
                    ref          : (comp) => {
                        // console.log('here')
                        currentTabRef.subNav = comp;
                        // debugger;
                        // console.log('currentTabRef.refs', currentTabRef.refs);
                    }
                },
                sceneConfig : route.sceneConfig
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


