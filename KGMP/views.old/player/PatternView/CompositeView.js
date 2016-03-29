'use strict';

var React = require('react-native'),
    PatternView = require('./PatternView'),
    RowNumberView = require('./RowNumberView');


var {
    StyleSheet,
    Text,
    View,
    ScrollView
} = React;


var deviceWidth = 375;



class CompositeView extends React.Component {
    styles = StyleSheet.create({

    })
    setNativeProps(props) {
        this._root && this._root.setNativeProps(props);
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     return !(nextProps.pattern == this.props.pattern);
    // }

    onRef(component) {
        this._root = component;
    }

    render() {
        var props = this.props,
            pattern = props.pattern;

        // debugger;
        //console.log('pattern', pattern)
        if (! pattern) {
            return <View />;
        }
        return (
            <View ref={this.onRef.bind(this)} style={[{flexDirection : 'row'}]}>
                <RowNumberView numRows={pattern.length} style={{width:30}}/>
                <PatternView pattern={pattern} style={{flex:1}}/>
            </View>
        );
    }

}



module.exports  = CompositeView;

