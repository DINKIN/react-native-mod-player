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

const  Subscribable = require('Subscribable');


class BaseView extends Component {
    constructor(opts) {
        super(opts);   
        this.className = this.constructor.name;

        
        this.setInitialState && this.setInitialState();
    }   


    addListenerOn() {
        Subscribable.Mixin.addListenerOn.apply(this, arguments);
    }

    addListenersOn(emitter, events) {
        var eventName;

        for (eventName in events) {
            this.addListenerOn(emitter, eventName, events[eventName]);
        }
    }

    componentWillMount() {
        Subscribable.Mixin.componentWillMount.apply(this);
    }

    componentWillUnmount() {
        Subscribable.Mixin.componentWillUnMount.apply(this);
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