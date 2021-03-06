
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View
} from 'react-native';



/* 
    This class and pattern for auto-binding methods was created before ReactNative 0.6.0rc, 
    where Babel was not the JS transpiler.  This "BaseComponent" is designed to be a stopgap for 
    a more elegant ES6-Style solution for binding methods using ES6-style classes.
*/

class BaseComponent extends React.Component {
    constructor(opts) {
        super(opts);   
        this.bindMethods();

        this.setInitialState && this.setInitialState();

    }   

    bindMethods() {
        if (! this.bindableMethods) {
            return;
        }

        for (var methodName in this.bindableMethods) {
            this[methodName] = this.bindableMethods[methodName].bind(this);
        }
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
}

module.exports = BaseComponent