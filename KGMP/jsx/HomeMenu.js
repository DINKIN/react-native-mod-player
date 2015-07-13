var React         = require('react-native'),
    BrowseView    = require('./Browse/BrowseViewNavigator'),
    RandomPlayer  = require('./player/RandomPlayer'),
    BaseComponent = require('./BaseComponent'),
    AboutView     = require('./about/AboutView.js');



var { 
        MCFsTool,
        MCModPlayerInterface
    } = require('NativeModules');



var {
    TouchableHighlight,
    StyleSheet,
    Text,
    StatusBarIOS,
    View
} = React;


var deviceWidth = 375;

var styles = StyleSheet.create({

    mainCt : {
        flex           : 1,
        flexDirection  : 'column',
        justifyContent : 'center',
        backgroundColor : '#000000',
        // borderWidth    : 2,
        // borderColor    : '#00FF00'
    },

    highlightCt : {
        width          : 175,
        borderWidth    : .5,
        borderColor    : '#333333',
        // borderRadius   : 3,
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
        fontFamily : 'PerfectDOSVGA437Win',
        fontSize   : 28, 
        fontWeight : 'bold',
        color      : '#EFEFEF'
    },

    titleRed : {
        fontFamily : 'PerfectDOSVGA437Win', 
        fontSize   : 30,
        fontWeight : 'bold',
        color      : '#FF0000'
    },

    titleGreen : {
        fontFamily : 'PerfectDOSVGA437Win', 
        fontSize   : 30,
        color      : '#00FF00'
    }
});


class HomeMenu extends BaseComponent {

    createButton(fn, text) {
        return (
            <View style={styles.touchableCt} key={text}>
                <TouchableHighlight
                    activeOpacity={1}
                    animationVelocity={0}
                    underlayColor="rgb(00,200,00)" 
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
                <View style={{flexDirection:'row', justifyContent : 'center'}}>
                    <Text style={styles.titleRed}>K</Text>
                    <Text style={styles.titleGreen}>ey</Text>
                    <Text style={styles.titleRed}>G</Text>
                    <Text style={styles.titleGreen}>en</Text>
                    <Text style={[styles.titleRed, {marginLeft: 10}]}>M</Text>
                    <Text style={styles.titleGreen}>usic</Text>
                </View>
                <View style={{flexDirection:'row', justifyContent : 'center', marginBottom : 30}}>
                    <Text style={styles.titleRed}>P</Text>
                    <Text style={styles.titleGreen}>layer</Text>
                </View>
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

HomeMenu.propTypes = {
    onRandomPress    : React.PropTypes.func,
    onBrowsePress    : React.PropTypes.func,
    onFavoritesPress : React.PropTypes.func,
    onAboutPress     : React.PropTypes.func,
    onSearchPress    : React.PropTypes.func
};

Object.assign(HomeMenu.prototype, {
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
                            var fileName  = rowData.file_name,
                                rtBtnText,
                                rtBtnHandler;

                            modObject.fileName = fileName;
                            
                            window.mainNavigator.push({
                                title            : 'Player',
                                rightButtonTitle : rtBtnText,
                                component        : RandomPlayer,
                                componentConfig  : {
                                    modObject : modObject,
                                    patterns  : modObject.patterns
                                }
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
                title          : 'Browse Groups',
                component      : BrowseView,
                // transitionType : 'PushFromRight'
            });
        },
        
        onFavoritesPress : function() {
            // this.props.onFavoritesPress();
        },
        
        onAboutPress : function() {


            MCModPlayerInterface.loadModusAboutMod(
                //failure
                (data) => {
                    alert('Apologies. This file could not be loaded.');
                    console.log(data);
                },        
                //success
                (modObject) => {
                    // debugger;
                    if (modObject) {
                        window.mainNavigator.push({
                            title           : 'About',
                            component       : AboutView,
                            componentConfig : {
                                modObject : modObject
                            }
                        });

                    }
                    else {
                        alert('Woah. Something hit the fan!');
                    }

                }
            );        
        },
        
        onSearchPress : function() {
            // this.props.onSearchPress();
        }
    }
});


module.exports = HomeMenu;

