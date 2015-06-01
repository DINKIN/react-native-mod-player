/**
 */
'use strict';

var NativeMethodsMixin     = require('NativeMethodsMixin'),
    NativeModules          = require('NativeModules'),
    PropTypes              = require('ReactPropTypes'),
    React                  = require('React'),
    ReactIOSViewAttributes = require('ReactIOSViewAttributes'),
    StyleSheetPropType     = require('StyleSheetPropType'),
    ViewStylePropTypes     = require('ViewStylePropTypes'),
    merge                  = require('merge');


var StyleConstants = NativeModules.UIManager.StyleConstants;

var createReactIOSNativeComponentClass = require('createReactIOSNativeComponentClass');

var stylePropType = StyleSheetPropType(ViewStylePropTypes);



var CommonImageViewAttributes = merge(ReactIOSViewAttributes.UIView, {

});

var View = React.createClass({
    statics : {
        pointerEvents: StyleConstants.PointerEventsValues,
        stylePropType
    },

    mixins: [NativeMethodsMixin],

    viewConfig: {
        uiViewClassName: 'MCPlotGlView',
        validAttributes: CommonImageViewAttributes
    },

    render: function() {
        return <MCPlotGlView {...this.props}/>;
    },
    setPlotterRegistered : function(channel) {  
        // console.log('setPlotterRegistered ' + channel)      
        this.setNativeProps({plotterRegistered : channel});
    },
    setPlotterUnRegistered : function(channel) {  
        // console.log('setPlotterUnRegistered ' + channel)      
        this.setNativeProps({plotterUnRegistered : channel});
    }
});


var MCPlotGlView = createReactIOSNativeComponentClass({
    validAttributes: CommonImageViewAttributes,
    uiViewClassName: 'MCPlotGlView',
});

var ViewToExport = MCPlotGlView;
if (__DEV__) {
  ViewToExport = View;
}

ViewToExport.pointerEvents = View.pointerEvents;
ViewToExport.stylePropType = stylePropType;

module.exports = ViewToExport;
