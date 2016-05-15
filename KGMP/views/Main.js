

const BaseView = require('./BaseView'),
      HomeMenu = require('./HomeMenu');

import React, {
    Component, 
    PropTypes
} from "react";

import {
    Navigator,
    PixelRatio,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    ActivityIndicatorIOS,
    Dimensions    
} from "react-native";




var styles = StyleSheet.create({
    container : { 
        flex : 1
    },
    scene    : {
        // flex            : 1,
        paddingTop      : 20,
        backgroundColor : '#EAEAEA',
    }
});



class Main extends BaseView  {
    setInitialState() {
        this.state = {
            spinner        : false,
            likeSpinner    : false,
            dislikeSpinner : false
        };
    }

    renderScene(route, nav) {
        window.mainNavigator = nav;

        var baseObj = {
            navigator : nav
        }


        if (route.componentConfig) {
            Object.assign(baseObj, route.componentConfig);
        }

        if (route.component) {
            return React.createElement(route.component, baseObj);
        }

        switch (route.id) {
            case 'navbar':
            // return <NavigationBarSample navigator={nav} />;
            case 'breadcrumbs':
            // return <BreadcrumbNavSample navigator={nav} />;
            case 'jumping':
            // return <JumpingNavSample navigator={nav} />;
            default:
                return React.createElement(HomeMenu, baseObj);

                // return (
                //     <MainView navigator={navigator}/>
                // );
        }
    }

    configureScene(route) {
        // debugger;
        if (typeof route.transitionType == 'string') {
            return Navigator.SceneConfigs[route.transitionType];
        }

        if (route.sceneConfig) {
            return route.sceneConfig;
        }

        return Navigator.SceneConfigs.FloatFromBottom;
    }

    render() {
        let state = this.state,
            initialRoute = {
                component : HomeMenu
            };


      

        return (
            <Navigator
                style={styles.container}
                initialRoute={initialRoute}
                renderScene={this.renderScene}
                configureScene={this.configureScene}
            />
        );
    }

};

Main.prototype.navigator = null;


Main.external = true;

module.exports = Main;
