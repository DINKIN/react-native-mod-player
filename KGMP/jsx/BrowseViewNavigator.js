'use strict';

var React      = require('react-native'),
    BrowseView = require('./BrowseView');

var {
        AppRegistry,
        NavigatorIOS,
        View,
        Text,
        StyleSheet
    } = React;

var { 
        MCFsTool,
        MCModPlayerInterface
    } = require('NativeModules');


class BrowseViewNavigator extends React.Component{
    render() {
        var initialRoute = {
            title             : 'KeyGen Music Player',
            component         : BrowseView,
            leftButtonTitle   : 'Close',
            onLeftButtonPress : () => {
                this.props.navigator.pop();
            }
        };

        return (
            <NavigatorIOS 
                style={styles.container} 
                initialRoute={initialRoute}
                tintColor="#FF0000"
                barTintColor="#000000"
                titleTextColor="#00FF00"
            />            
        );
    }
};


var styles = StyleSheet.create({
    container : {
        backgroundColor : '#000000',
        // borderWidth     : 3,
        // borderColor     : '#0000FF',
        // marginTop       : 20,
        overflow        : 'visible',
        flexDirection   : 'column',
        flex            : 1,
        alignSelf       : 'stretch'
    },

})
module.exports = BrowseViewNavigator;