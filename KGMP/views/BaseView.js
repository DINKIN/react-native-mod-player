import React, {
    Component, 
    PropTypes
} from "react";

import {
    View, 
    Text, 
    StyleSheet, 
    TouchableHighlight, 
    TextInput
} from "react-native";


class BaseView extends Component {
    constructor(opts) {
        super(opts);   
        this.className = this.constructor.name;

        this.setInitialState && this.setInitialState();
    }   

    render() {
        return <View><Text style={{fontSize: 50, color : 'white'}}>{this.className}</Text></View>
    }

    showSpinner() {
       window.main.showSpinner();
    }

    showLikeSpinner() {
        window.main.showLikeSpinner()
    }

    showDislikeSpinner() {
        window.main.showDislikeSpinner();
    }

    hideSpinner() {
        window.main.hideSpinner();
    }

    // log()
}

module.exports = BaseView