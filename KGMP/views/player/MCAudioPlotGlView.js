/**
 */
'use strict';

var NativeMethodsMixin = require('NativeMethodsMixin');
var PropTypes = require('ReactPropTypes');
var Platform = require('Platform');

var RCTUIManager = require('NativeModules').UIManager;
var React = require('React');
var ReactNativeStyleAttributes = require('ReactNativeStyleAttributes');
var ReactNativeViewAttributes = require('ReactNativeViewAttributes');
var StyleSheetPropType = require('StyleSheetPropType');

var requireNativeComponent = require('requireNativeComponent');
var processColor = require('processColor');

var View = React.createClass({
    mixins: [NativeMethodsMixin],

    viewConfig: {
        uiViewClassName: 'MCGLPlotView',
        validAttributes: ReactNativeViewAttributes.RCTView
    },


    propTypes : {
        registered   : React.PropTypes.bool,
        side         : React.PropTypes.string,
        lineColor    : React.PropTypes.string,
        plotterType  : React.PropTypes.string,
        shouldFill   : React.PropTypes.bool,
        shouldMirror : React.PropTypes.bool,
    },

    getDefaultProps() {
        return {
            plotterType     : 'buffer',
            lineColor       : '#000',
            backgroundColor : 'transparent',
            shouldFill      : true,
            sholdFill       : false
        }
    },

    render: function() {
        var props = Object.assign({}, this.props);
        props.lineColor = processColor(props.lineColor);
        props.backgroundColor = processColor(props.backgroundColor); 

        return <MCPlotGlView {...props}/>;
    },

    setPlotterRegistered : function(channel) {  
        console.log('setPlotterRegistered ' + channel)      
        this.setNativeProps({registered : channel});
    },

    setPlotterUnRegistered : function(channel) {  
        console.log('setPlotterUnRegistered ' + channel)      
        this.setNativeProps({registered : channel});
    }
});

var MCPlotGlView = requireNativeComponent('MCPlotGlView', View, {
    // nativeOnly: {onChange: true, onPress: true}
});

module.exports = View;
