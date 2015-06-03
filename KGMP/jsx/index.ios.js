/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @providesModule KGMP
 * @flow
 */
'use strict';

var React    = require('react-native'),
    styles   = require('./Styles'),
    MainView = require('./MainView'),
    sqlite   = require('react-native-sqlite');

window.db = require('./db.js');

var {
    AppRegistry,
    NavigatorIOS,
    View,
    Text
} = React;



var { 
        MCFsTool,
        MCModPlayerInterface
    } = require('NativeModules');


// Cache the bundlepath globally so we can access it later =)
MCFsTool.getBundlePath((bundlepath) => {
    window.bundlePath = bundlepath;
});

class KGMP extends React.Component{
    render() {
        var initialRoute = {
            title     : 'KeyGen Music Player',
            component : MainView
        };

        return (
            <NavigatorIOS style={styles.container} initialRoute={initialRoute}/>            
        );
    }
};


AppRegistry.registerComponent('KGMP', () => KGMP);

module.exports = KGMP;