
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
    state = {
        selectedTab  : INITIAL_TAB,
        modObject    : null,
        initialPaths : []
    };

    styles = StyleSheet.create({
        tabBar : {
            height          : 65,
            width           : windowDimensions.width,
            backgroundColor : '#FFFFFF'
        },
        tabSelected : {
            backgroundColor : '#220000'
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

        getDirectories(null, (initialPaths) => {
            debugger;
            // this.refs.browselist.setState({
            //     rowData : initialPaths
            // });

            

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



    tabs = [
        // This sh*t is starting to get Sencha-like real quick!
        {
            title           : 'Home',
            icon            : 'ios-home-outline',
            child           : BrowseList,
            componentConfig : {
                bgColor : '#002200',
                ref     : 'browselist',
                text    : 'Home',
                style   : {
                    paddingTop : 60
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
        var styles                = this.styles,
            WrapperComponent      = BlurView,
            wrapperComponentProps = {blurType:'dark'};

        window.home = this;
        
        
        return (
            <TabNavigator tabBarStyle={styles.tabBar}
                          tabBarWrapperComponent={WrapperComponent}
                          tabBarWrapperComponentProps={wrapperComponentProps}
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


