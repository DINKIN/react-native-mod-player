'use strict';

var React         = require('react-native'),
    BaseComponent = require('../BaseComponent');


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
        backgroundColor : '#000000',
    },

    patternRow : {
        fontFamily      : 'Courier',
        fontSize        : 11,
        backgroundColor : '#000000',
        color           : '#FFFFFF',
        fontWeight      : 'bold'
    },

    highlightedRow : {
        backgroundColor : '#99FF00'
    }
});

class PatternView extends BaseComponent {
    render() {
        var data  = this.props.rows,
            state = this.state,
            i     = 0;

        if (! data) {
            return (
                <View>
                   <Text>"No Pattern in memory!"</Text>
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
                <View key={i} style={styles.rowContainer}>
                    <Text style={styles.patternRow}>{data[i]}</Text>
                </View>
            );
        }   

        return (
            <View style={styles.patternContainer}>
                {items}      
            </View>
        );
    }

}


PatternView.propTypes = {
    rows : React.PropTypes.array
}

module.exports  = PatternView;

