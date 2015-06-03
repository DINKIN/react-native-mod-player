'use strict';

var React = require('react-native');


var {
    TouchableHighlight,
    StyleSheet,
    Text,
    View
} = React;


var deviceWidth = 375;

var styles = StyleSheet.create({

    soundFormat : {
        flexDirection  : 'row',
        // justifyContent : '',       
    },

    fileSummary : {
        alignSelf  : 'stretch',

        // height : 374,
        width   : 375,
        padding : 20
    },
    text : {
        fontSize : 18
    },
    textLink : {
        fontSize : 18,
        color    : '#0000FF'
    }
});


module.exports  = React.createClass({

    props : {
        data    : React.PropTypes.object,
        onPress : React.PropTypes.func
    },


    onFormatPress : function() {
        this.props.onPress && this.props.onPress(this.fileTypeObj);
    },

    render : function() {
        var data        = this.props.data;



        return (
            <View style={styles.fileSummary}>
                <Text style={styles.text}>Name: {data.name}</Text>
                <Text style={styles.text}>Type: {data.type}</Text>
                <Text style={styles.text}>Patterns: {data.numPatterns}</Text>
                <Text style={styles.text}>Tracks: {data.tracks}</Text>
                <Text style={styles.text}>Instruments: {data.instruments}</Text>
                <Text style={styles.text}>Samples: {data.samples}</Text>
                <Text style={styles.text}>Speed: {data.speed}</Text>
                <Text style={styles.text}>BPM: {data.bpm}</Text>
                <Text style={styles.text}>Length: {data.length}</Text>

                {/* 
                <View style={styles.soundFormat}>
                    <Text style={styles.text}>Format: </Text>
                    <TouchableHighlight 
                        onPress={this.onFormatPress}
                        underlayColor="rgb(210, 230, 255)">
                            <Text style={styles.textLink}>
                                {formatText}
                            </Text>
                    </TouchableHighlight>
                </View>
                {copyright}
                */}
            </View>
        );

    }
});
