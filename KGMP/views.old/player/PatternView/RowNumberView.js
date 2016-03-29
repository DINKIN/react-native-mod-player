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
    patternRow : {
        fontFamily     : 'PerfectDOSVGA437Win',
        fontSize        : 11,
        backgroundColor : '#000000',
        color           : '#66FF66'
        // alignSelf  : 'stretch'
    },
 
    rowContainer : {
        backgroundColor : '#000000',
    }
   
});


const RowNumberView = React.createClass({
    render : function() {
        var numRows  = this.props.numRows,
            state = this.state,
            zeroStr = '0',
            i     = 0;

        if (typeof numRows == 'undefined') {
            return <View><Text style={styles.patternRow}>0</Text></View>;
        }

        var items = [],
            sixteen = 16,
            rowInHex;

        for (; i < numRows; i++) {
            rowInHex = i.toString(sixteen).toUpperCase();

            if (i < sixteen) {
                rowInHex = zeroStr + rowInHex;
            }

            items[i] = (
                <Text key={rowInHex} style={styles.patternRow}>{rowInHex}</Text>
            );
        }   

        return (
            <View style={[styles.rowContainer, this.props.style]}>
                {items}      
            </View>
        );
    }
});

module.exports  = RowNumberView;
