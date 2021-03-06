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
       
        this.setInitialState && this.setInitialState(opts);
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
        Subscribable.Mixin.componentWillUnmount.apply(this);
    }

}

module.exports = BaseView