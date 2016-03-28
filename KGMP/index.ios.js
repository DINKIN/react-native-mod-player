
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  StatusBar
} from 'react-native';



var styles = require('./jsx/Styles'),
    Main   = require('./jsx/Main');




var { 
    MCFsTool,
    MCModPlayerInterface
} = require('NativeModules');


// CONTINUE: Start window.bundlePath;

// Cache the bundlepath globally so we can access it later =)
MCFsTool.getBundlePath((bundlepath) => {
    console.log(bundlepath)
    window.bundlePath = bundlepath;
});


StatusBar.setBarStyle('light-content', true);

var KGMP = React.createClass({
    render : function() {
        return (<Main />);
    }
});

AppRegistry.registerComponent('KGMP', () => KGMP);