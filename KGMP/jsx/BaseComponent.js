
React = require('React');

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
}

module.exports = BaseComponent