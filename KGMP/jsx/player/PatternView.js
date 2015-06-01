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
        // alignSelf : 'stretch',
        overflow  : 'hidden',
        backgroundColor : '#000000',
        // color           : '#FF0000',

        // borderWidth : .5,
        // borderColor : '#FF0000'
    },

    patternRow : {
        fontFamily      : 'Courier',
        fontSize        : 11,
        backgroundColor : '#000000',
        color           : '#FFFFFF',
        fontWeight      : 'bold'
        // alignSelf  : 'stretch'
    },

    highlightedRow : {
        backgroundColor : '#99FF00'
    },
    rowContainer : {
        // width : '2000'
    }
   
});


// TODO: Convert to ES6 class
module.exports  = React.createClass({
    fileTypeObj : null, // used for wiki reading

    props : {
        rows : React.PropTypes.array
    },

    render : function() {
        var data  = this.props.rows,
            state = this.state,
            i     = 0;

        if (! data) {
            return <View><Text>"No Pattern in memory!"</Text></View>;
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
});
