var NativeMethodsMixin = require('NativeMethodsMixin');
var PropTypes = require('ReactPropTypes');
var React = require('React');
var StyleSheet = require('StyleSheet');
var View = require('View');

var requireNativeComponent = require('requireNativeComponent');

console.log('MCAudioPlot required');

var PlotView = React.createClass({
    mixins: [NativeMethodsMixin],

    propTypes: {
        ...View.propTypes,
    },

    // getDefaultProps: function() {
    //     return {

    //     };
    // },

    

    render: function() {
        var props = this.props;
        return (
            <MCAudioPlot style={props.style}>
                
            </MCAudioPlot>
        );
    }
});


var MCAudioPlot = requireNativeComponent('MCAudioPlot', PlotView, {
    nativeOnly: { onChange: true },
});

module.exports = PlotView;
