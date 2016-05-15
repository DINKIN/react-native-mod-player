/* Navigation.js */
var windowDims  = require('Dimensions').get('window'),
    FontHelper  = require('./utils/Font'),
    Icon        = require('react-native-vector-icons/Entypo'),
    Navigator   = require('./Navigator/Navigator');

import React, {
    Component, 
    PropTypes
} from "react";

import {
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback,
    TouchableHighlight,
    ScrollView,
    LayoutAnimation,
    TouchableOpacity,
    InteractionManager,
    Platform,
    PixelRatio
} from "react-native";

// const {   
//           BlurView,
//           VibrancyView
//       } = require('react-native-blur');

var defaultSceneConfig;
if (Platform.OS == 'ios') {
    defaultSceneConfig = Navigator.SceneConfigs.HorizontalSwipeJump;
}
else {
// Navigator.SceneConfigs.FadeAndroid;
    defaultSceneConfig = Object.assign({}, Navigator.SceneConfigs.HorizontalSwipeJump, {
        // Just appear
        // defaultTransitionVelocity: 3
    });
}



class NavButton extends React.Component {
    render() {
        return (
            <TouchableHighlight
                style={styles.button}
                underlayColor="#B5B5B5"
                onPress={this.props.onPress}>
                    <Text style={styles.buttonText}>{this.props.text}</Text>
            </TouchableHighlight>
        );
    }
}


var NavigationBarRouteMapper = {

    LeftButton: function(route, navigator, index, navState) {

        var stack = navState.routeStack,
            previousRoute = stack[index - 1],
            marginTop = (Platform.OS === 'ios') ? 7 : 15;
        
        if (navState.routeStack.length < 2) {
            return;
        }


        return (
            <TouchableOpacity   style={styles.navBarLeftButton}
                                onPress={function() {
                                    // console.log(navigator.state.routeStack.length, navigator.props)
                                    if (navigator.props.topNav && navigator.state.routeStack.length == 1) {
                                        // console.log('topnav pop')
                                        navigator.props.topNav.pop();
                                    }
                                    else {
                                        navigator.pop();
                                    }
                                }}>
               
                <Icon name="chevron-left" size={36} color={'#000'} style={{marginTop:marginTop}}/>
            </TouchableOpacity>
        );
    },

    RightButton: function(route, navigator, index, navState) {
        // console.log('navState', navState)
        if (! route.rightButtonText) {
            return;
        }

        return (
            <TouchableOpacity style={styles.navBarRightButton}>
                <Text style={[styles.navBarText, styles.navBarButtonText]}>
                    {route.rightButtonText}
                </Text>
            </TouchableOpacity>
        );
    },

    Title: function(route, navigator, index, navState) {
        // return null
        var props = this.props,
            hasSubtitle = !! route.subTitle,
            fontSize,
            marginTop,
            subtitle;

        if (! route.title) {
            return;
        }

        // if (route.title.length > 20) {
            // console.log('route.title.length', route.title.length)
            // fontSize = {fontSize:  16};
        // }

        if (hasSubtitle) {
            subtitle = (
                <Text style={styles.navBarSubTitleText}>
                    {route.subTitle}
                </Text>
            );
        }
        else {
            marginTop = { marginTop : (Platform.OS === 'ios') ? 15 : 10 }
        }

        return (
            <View style={{alignItems : 'center', flexDirection : 'column'}}>
                <Text style={[styles.navBarText, styles.navBarTitleText, marginTop, fontSize]}>
                    {route.title}
                </Text>

                {subtitle}
            </View>
        );
    },


};

var Navigation = React.createClass({

    
    componentDidMount : function() {
        // Todo : move to render scene
        InteractionManager.runAfterInteractions(() => {
            var cb = this.props.initialRoute.componentConfig.callback;

            cb && cb();
        });
    },

    componentWillMount: function() {
        this.navigator = this.props.navigator;
    },

    componentWillUnmount: function() {
        this._listeners && this._listeners.forEach(listener => listener.remove());
    },

    push: function(route) {
        route.sceneConfig = Navigator.SceneConfigs.FadeAndroid;
        // console.log('route', route);

        var navigator = this.navigator,
            state = this.state;

        // state.showNavBar = (navigator.state.routeStack.length + 1) >= 2;
        // debugger;
        // this.setState(state)
        navigator.push(route);
    },
    
    pop() {
        this.navigator.pop();
    },
    
    renderScene : function (route, navigator)  {
        this.navigator = navigator;
        navigator.topNav = this.props.topNav;
        // console.log('route', route);
   
        var baseObj = {
            navigator : navigator
        }

        if (route.componentConfig) {
            Object.assign(baseObj, route.componentConfig);
        }

        if (route.component) {
            // setTimeout(() => {
            //     this.setState({
            //         hideNavBar : route.__navigatorRouteID == 0
            //     })
            // }, 100)
            return React.createElement(route.component, baseObj);
        }
    },

    configureScene(route, stack) { 
        return defaultSceneConfig;
    },


    render : function() {
        var state         = this.state,
            NavigationBar = <Navigator.NavigationBar routeMapper={NavigationBarRouteMapper} style={styles.navBar}/>
            
        // TODO: Bind navigators together somehow
        // console.log('props', state)

        return (
            <Navigator
                style={[styles.appContainer, this.props.style]}
                initialRoute={this.props.initialRoute}
                renderScene={this.renderScene}
                navigationBar={NavigationBar}
                topNav={this.props.topNav}
                gestureActions={[]}
                hideNavBarForFirstScene={true}
                configureScene={(route, stack) => this.configureScene(route, stack)}
            />
        );
    },

});

var styles = StyleSheet.create({
    appContainer : {
        flex : 1,
        // borderWidth : 2, borderColor : '#FF0000'
    },
    messageText: {
        fontSize: FontHelper.getAppropriateFontSize(17),
        fontWeight: '500',
        padding: 15,
        marginTop: 50,
        marginLeft: 15,
    },
    button: {
        backgroundColor: 'white',
        padding: 15,
        borderBottomWidth: 1 / PixelRatio.get(),
        borderBottomColor: '#CDCDCD',
    },
    buttonText: {
        fontSize   : FontHelper.getAppropriateFontSize(18),
        fontWeight : '500'
    },
    navBar: {
        backgroundColor: 'transparent',
        height : 70,
    },

    navBarText: {
        // fontFamily: 'BankGothicBold',
        fontSize: FontHelper.getAppropriateFontSize(20)
    },
    navBarTitleText: {
        color: '#000',
        // fontSize : 20,
        justifyContent : 'center'
    },

    navBarSubTitleText: {
        color: '#78909C',
        fontSize: FontHelper.getAppropriateFontSize(12),
        justifyContent : 'center',
    },

    navBarLeftButton: {
        paddingLeft: 12,
        // alignItems : 'center'
        // marginTop : 7
    },
    navBarRightButton: {
        paddingRight: 10,
    },

    navBarButtonText: {
        color: '#78909C',
    },
    scene: {
        flex: 1,
        paddingTop: 20,
        backgroundColor: '#EAEAEA',
    },
});




module.exports  = Navigation;
