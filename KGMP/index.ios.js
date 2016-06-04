import React, {
    Component, 
    PropTypes
} from "react";

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  StatusBar
} from "react-native";



window.styles = {
    baseBorderColor : '#363757',
    center          : 'center',
    backgroundColor : '#2b2e48',
    white           : '#FFFFFF'
}

console.disableYellowBox = true; 

const Main = require('./views/HomeTabView');

const { 
    MCFsTool,
    MCModPlayerInterface
} = require('NativeModules');


// CONTINUE: Start window.bundlePath;

// StatusBar.setBarStyle('light-content', true);

const KGMP = React.createClass({
    render : function() {
        window.isSimulator = this.props.isSimulator;
        return <Main/>;
    }
});

AppRegistry.registerComponent('KGMP', () => KGMP);