
var Dimensions   = require('Dimensions'),
    winder       = Dimensions.get('window'),
    screenWidth  = window.width = winder.width,
    screenHeight = window.height = winder.height;

var React         = require('react-native'),
    BaseComponent = require('./BaseComponent'),
    HomeMenu      = require('./HomeMenu');

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



var styles = StyleSheet.create({
    scene    : {
        // flex            : 1,
        paddingTop      : 20,
        backgroundColor : '#EAEAEA',

    },
    spinnerContainer : {
        height : screenHeight,
        width  : screenWidth,
        position : 'absolute',
        top : 0,
        left : 0,
        backgroundColor : 'rgba(0,0,0,.35)',
        // borderWidth: 1,
        // borderColor : '#FF0000',
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonFont : {
        fontFamily : 'fontello', 
        fontSize   : 60,
        color      : '#FFFFFF'
    }
});

class Spinner extends BaseComponent {
    render() {
        // console.log('spinner render')
        return (
            <View style={styles.spinnerContainer}>
                <ActivityIndicatorIOS 
                    animating={true}
                    size={"large"}
                    color="#FFFF00"
                />
            </View>
        );
    }
}


var chars = {
    like    : '\uE81C',
    dislike : '\uE81D'
}
class LikeSpinner extends BaseComponent {
    render() {
        return (
            <View style={styles.spinnerContainer}>
                <Text style={styles.buttonFont}>{chars['like']}</Text>
            </View>
        );
    }
}


class DislikeSpinner extends BaseComponent {
    render() {
        return (
            <View style={styles.spinnerContainer}>
                <Text style={styles.buttonFont}>{chars['dislike']}</Text>
            </View>
        );
    }
}
class Main extends BaseComponent  {
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
