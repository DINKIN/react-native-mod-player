'use strict';

var React        = require('react-native'),
    ListView     = require('./ListView'),
    RandomPlayer = require('./player/RandomPlayer'),
    BaseComponent = require('./BaseComponent');



var { 
        MCFsTool,
        MCModPlayerInterface
    } = require('NativeModules');



var {
    Image,
    TouchableHighlight,
    StyleSheet,
    Text,
    View
} = React;


var deviceWidth = 375;

var styles = StyleSheet.create({

    mainCt : {
        paddingTop     : 150,
        alignSelf      : 'stretch',
        flexDirection  : 'column',
        justifyContent : 'center',
        // borderWidth    : 2,
        // borderColor    : '#00FF00'
    },

    highlightCt : {
        width          : 140,
        borderWidth    : .1,
        borderColor    : '#9E9E9E',
        borderRadius   : 3,
        flexDirection  : 'row',
        justifyContent : 'center',
    },

    touchableCt : {
        flexDirection  : 'row',
        justifyContent : 'center',
        marginTop      : 20,
        marginBottom   : 20,
        // borderWidth    : 2,
        // borderColor    : '#FF0000'
    },  

    label : {
        fontSize : 30
    }

});


var generatePlayer = function(cfg) {
    return React.createClass({
        render : function() {
            return (<RandomPlayer {...cfg}/>);
        }
    });
}

class MainView extends BaseComponent {

    createButton(fn, text) {
        return (
            <View style={styles.touchableCt} key={text}>
                <TouchableHighlight
                    activeOpacity={1}
                    animationVelocity={0}
                    underlayColor="rgb(210, 230, 255)" 
                    style={styles.highlightCt} 
                    onPress={fn}>
                        <Text style={styles.label}>{text}</Text>
                </TouchableHighlight>
            </View>
        );
    }
     
    render() {
        return (
            <View style={styles.mainCt}>
                {[
                    this.createButton(this.onRandomPress,    "Random"),
                    this.createButton(this.onBrowsePress,    "Browse"),
                    this.createButton(this.onFavoritesPress, "Favorites"),
                    this.createButton(this.onSearchPress,    "Search"),
                    this.createButton(this.onAboutPress,     "About")
                ]}
            </View>
        );
    }


}

MainView.propTypes = {
    onRandomPress    : React.PropTypes.func,
    onBrowsePress    : React.PropTypes.func,
    onFavoritesPress : React.PropTypes.func,
    onAboutPress     : React.PropTypes.func,
    onSearchPress    : React.PropTypes.func
};

Object.assign(MainView.prototype, {
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
});


module.exports = MainView;

