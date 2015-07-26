var React         = require('react-native'),
    BaseComponent = require('../BaseComponent');


var {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
    VibrationIOS,
    TouchableWithoutFeedback
} = React;

class ProgressView extends BaseComponent {

    render() {
        var children = [],
            numItems = this.state.numberOfCells,
            hNum     = this.state.highlightNumber,
            i        = 0,
            highlighted;

        for (; i < numItems; i++) {
            highlighted = (i == hNum) ? styles.highlighted : null;

            children[i]=(
                <View key={i} style={[styles.item, highlighted]}/>
            );
        }


        return (
            <View style={styles.container}>
                {children}
            </View>
        );
    }

}


ProgressView.propTypes = {
    numItems : React.PropTypes.number
}

Object.assign(ProgressView.prototype, {
    numItems : 0,
    state    : {
        numberOfCells   : 0,
        highlightNumber : 0
    }
});


var white = '#FFFFFF';

var styles = StyleSheet.create({
    container : {
        flexDirection : 'row',
        height : 5,
        borderTopWidth : .5,
        borderTopColor : white,
        // borderBottomWidth : .5,
        // borderBottomColor : white
    },

    item : {
        // borderLeftWidth  : .5,
        // borderLeftColor  : white,
        // borderRightWidth : .5,
        // borderRightColor : white,
        flex             : 1
    },

    highlighted : {
        backgroundColor : '#00FF00'
    }

});

module.exports = ProgressView;