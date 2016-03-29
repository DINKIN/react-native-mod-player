'use strict';

var React = require('react-native');


var {
    StyleSheet,
    Text,
    View,
    ScrollView
} = React;


var deviceWidth = 375;

var styles = StyleSheet.create({
    patternContainer : {
        overflow        : 'hidden',
        backgroundColor : 'transparent',
    },

    patternRow : {
        fontFamily      : 'PerfectDOSVGA437Win',
        fontSize        : 11,
        width           : 999,
        backgroundColor : '#000000',
        color           : '#FFFFFF',
        fontWeight      : 'bold'
    },

    highlightedRow : {
        backgroundColor : '#99FF00'
    }
});


class PatternView extends React.Component {
    // mixins = [NativeMethodsMixin];

    setNativeProps(props) {
        // debugger;
        // return;
        this._root && this._root.setNativeProps(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        // console.log(nextProps.style[1]);
        // return true;
        return !(nextProps.pattern == this.props.pattern) ;//|| (nextProps.style[1].top != this.props.style[1].top);
    }

    onRef(component) {
        // debugger;
        this._root = component;
    }

    render() {
        var data  = this.props.pattern,
            state = this.state,
            i     = 0;

        if (! data) {
            return (
                <View>
                   <Text style={{fontSize:50, color:'#FFF'}}>"No Pattern in memory!"</Text>
                </View>
            );
        }

        var len     = data.length,
            items   = [],
            sixteen = 16,
            highlightedRowStyle,
            rowInHex;

        for (; i < len; i++) {
            items[i] = (
                <Text key={i} style={styles.patternRow} numberOfLines={1}>{data[i]}</Text>
            );
        }   

        return (
            <View style={[styles.patternContainer, this.props.style]}>
                {items}      
            </View>
        );
    }

}



module.exports  = PatternView;

