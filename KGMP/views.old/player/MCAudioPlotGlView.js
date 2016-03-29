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


var View = React.createClass({
    mixins: [NativeMethodsMixin],

    viewConfig: {
        uiViewClassName: 'MCGLPlotView',
        validAttributes: ReactNativeViewAttributes.RCTView
    },


    propTypes : {
        registered : React.PropTypes.bool,
        side       : React.PropTypes.string
    },

    render: function() {
        return <MCPlotGlView {...this.props}/>;
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
    nativeOnly: {onChange: true, onPress: true}
});

module.exports = MCPlotGlView;
