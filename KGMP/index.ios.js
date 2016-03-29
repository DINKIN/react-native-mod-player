
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  StatusBar
} from 'react-native';




// var styles = require('./jsx/Styles'),


const Main = require('./views/Main');

const { 
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

const KGMP = React.createClass({
    render : function() {
        return <Main/>;
    }
});

AppRegistry.registerComponent('KGMP', () => KGMP);