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


module.exports  = React.createClass({
    fileTypeObj : null, // used for wiki reading

    props : {
        rows : React.PropTypes.number
    },


    render : function() {
        var numRows  = this.props.rows,
            state = this.state,
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
                rowInHex = '0'+rowInHex;
            }

            items[i] = (
                <Text key={rowInHex} style={styles.patternRow}>{rowInHex}</Text>
            );
        }   

        return (
            <View style={styles.rowContainer}>
                {items}      
            </View>
        );



    }
});
