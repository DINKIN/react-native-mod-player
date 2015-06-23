var React = require('react-native'),
    HomeMenu = require('./HomeMenu');

var {
  Navigator,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
} = React;

/*
  <NavButton
    onPress={() => {
      this.props.navigator.push({
        message: 'Swipe down to dismiss',
        sceneConfig: Navigator.SceneConfigs.FloatFromRight,

        sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      });
    }}
    text="Float in from bottom"
  />
*/

/*
    this.props.navigator.pop();
    this.props.navigator.popToTop();
    this.props.navigator.push({ id: 'navbar' });
*/


var styles = StyleSheet.create({
    scene    : {
        flex            : 1,
        paddingTop      : 20,
        backgroundColor : '#EAEAEA',
    }
});



class Main extends React.Component  {

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
        var initialRoute ={
            message   : 'dafug',
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
