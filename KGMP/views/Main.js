

const BaseView = require('./BaseView'),
      HomeMenu = require('./HomeMenu');



import React, {
    Navigator,
    PixelRatio,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    ActivityIndicatorIOS,
    Dimensions
} from 'react-native';





var styles = StyleSheet.create({
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
        var initialRoute = {
                component : HomeMenu
            },
            spinner,
            likeSpinner,
            dislikeSpinner;


        if (this.state.spinner) {
            spinner = React.createElement(Spinner);
        }

        if (this.state.likeSpinner) {
            likeSpinner = React.createElement(LikeSpinner);
        }

        if (this.state.dislikeSpinner) {
            dislikeSpinner = React.createElement(DislikeSpinner);
        }

        window.main = this;
        return (
            <View style={{flex: 1}}>
                <Navigator
                    style={styles.container}
                    initialRoute={initialRoute}
                    renderScene={this.renderScene}
                    configureScene={this.configureScene}
                />
                
                {spinner}
                {likeSpinner}
                {dislikeSpinner}
            </View>
        );
    }

    showSpinner() {
        // console.log('showSpinner')
        this.setState({spinner : true})
    }

    showLikeSpinner() {
        this.setState({likeSpinner : true})
    }

    showDislikeSpinner() {
        this.setState({dislikeSpinner : true})
    }

    hideSpinner() {
        // console.log('hideSpinner')
        this.setState({
            spinner        : false,
            likeSpinner    : false,
            dislikeSpinner : false
        });
    }
};

Main.prototype.navigator = null;


Main.external = true;

module.exports = Main;
