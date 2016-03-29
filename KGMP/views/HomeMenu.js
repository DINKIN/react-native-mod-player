
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View
} from 'react-native';



const BaseComponent = require('./BaseView');

class HomeMenu extends BaseComponent {
    render() {
        console.log();
        return <View><Text style={{fontSize: 50, color : 'white'}}>{this.constructor.name}</Text></View>
    }
}

module.exports = HomeMenu