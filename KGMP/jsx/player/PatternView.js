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


Object.assign(PatternView.prototype, {
    fileTypeObj : null,

    bindableMethods : {
        onRandomPress : function() {
            var  navigator = this.props.navigator;

            window.db.clear();

            window.db.getNextRandom((rowData) => {
                // console.log(rowData);
                var filePath = window.bundlePath + rowData.path + rowData.file_name;

                MCModPlayerInterface.loadFile(
                    filePath,
                    //failure
                    (data) => {
                        alert('Apologies. This file could not be loaded.');
                        console.log(data);
                    },        
                    //success
                    (modObject) => {
                        // debugger;

                        if (modObject) {
                            var fileName   = rowData.file_name,
                                rtBtnText,
                                rtBtnHandler;

                            modObject.fileName = fileName;
                           
                            var cmp = generatePlayer({
                                modObject : modObject,
                                patterns  : modObject.patterns
                            });

                            navigator.push({
                                title            : 'Player',
                                rightButtonTitle : rtBtnText,
                                component        : cmp,
                                // onRightButtonPress : rtBtnHandler
                            });
      
                        }
                        else {
                            alert('Woah. Something hit the fan!');
                        }

                    }
                );

            });
        },
        
        onBrowsePress : function() {
            this.props.navigator.push({
                title    : 'Browse Groups',
                component : ListView
            });
        },
        
        onFavoritesPress : function() {
            // this.props.onFavoritesPress();
        },
        
        onAboutPress : function() {
            // this.props.onAboutPress();
        },
        
        onSearchPress : function() {
            // this.props.onSearchPress();
        }
    }
})

PatternView.propTypes = {
    rows : React.PropTypes.array
}

module.exports  = PatternView;

