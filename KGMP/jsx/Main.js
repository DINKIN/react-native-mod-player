var React         = require('react-native'),
    BaseComponent = require('./BaseComponent'),
    HomeMenu      = require('./HomeMenu'),
    Dimensions    = require('Dimensions');

var {
  Navigator,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  ActivityIndicatorIOS,
} = React;

var winder       = Dimensions.get('window'),
    screenWidth  = winder.width,
    screenHeight = winder.height;


var styles = StyleSheet.create({
    scene    : {
        flex            : 1,
        paddingTop      : 20,
        backgroundColor : '#EAEAEA',

    },
    spinnerContainer : {
        height : screenHeight,
        width  : screenWidth,
        position : 'absolute',
        top : 0,
        left : 0,
        backgroundColor : 'rgba(0,0,0,.25)',
        // borderWidth: 1,
        // borderColor : '#FF0000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinnerIndicator : {

    }
});

class Spinner extends BaseComponent {
    render() {
        console.log('spinner render')
        return (
            <View style={styles.spinnerContainer}>
                <ActivityIndicatorIOS 
                    style={styles.spinnerIndicator}
                    animating={true}
                    size={"large"}
                    color="#FFFF00"
                />
            </View>
        );
    }
}

class Main extends BaseComponent  {
    setInitialState() {
        this.state = {
            spinner : false
        };
    }

    renderScene(route, nav) {
        window.mainNavigator = nav;

        var baseObj = {
            navigator : nav
        }

        // debugger;


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
            spinner;


        if (this.state.spinner) {
            spinner = React.createElement(Spinner);
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
            </View>
        );
    }

    showSpinner() {
        console.log('showSpinner')
        this.setState({spinner : true})

    }

    hideSpinner() {
        console.log('hideSpinner')

        this.setState({spinner : false})
    }

};

Main.prototype.navigator = null;


Main.external = true;

module.exports = Main;
