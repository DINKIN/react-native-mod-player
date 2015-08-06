var React         = require('react-native'),
    BrowseViewNav = require('./Browse/BrowseViewNavigator'),
    FavsViewNav   = require('./Browse/FavoritesViewNavigator'),
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
        width          : 210,
        height         : 35,
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
        fontSize   : 33, 
        fontWeight : 'bold',
        color      : '#EFEFEF'
    },

    titleRed : {
        fontFamily : 'PerfectDOSVGA437Win', 
        fontSize   : 45,
        fontWeight : 'bold',
        color      : '#FF0000'
    },

    titleGreen : {
        fontFamily : 'PerfectDOSVGA437Win', 
        fontSize   : 45,
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
        // setTimeout(()=> {
        //     this.onRandomPress();
        // }, 100);

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
                    // this.createButton(this.onSearchPress,    "Search"),
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
            window.main.showSpinner();

            window.db.clear();

            window.db.getNextRandom((rowData) => {
                // console.log(rowData);
                var filePath = window.bundlePath + decodeURIComponent(rowData.path) + decodeURIComponent(rowData.file_name);
                MCModPlayerInterface.loadFile(
                    filePath,
                    //failure
                    (data) => {
                        window.main.hideSpinner();
                        alert('Failure loading ' + rowData.file_name);
                        console.log(data);
                    },        
                    //success
                    (modObject) => {
                        // debugger;
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
      
                        window.main.hideSpinner();
                    }
                );

            });
           
        },
        
        onBrowsePress : function() {
            window.main.showSpinner();

            this.props.navigator.push({
                title          : 'Browse Groups',
                component      : BrowseViewNav,
                // transitionType : 'PushFromRight'
            });

            window.main.hideSpinner();

        },
        
        onFavoritesPress : function() {
            window.main.showSpinner();
            window.db.getFavorites((rowData) => {
                

                rowData.path = decodeURIComponent(rowData.path);
                rowData.file_name = decodeURIComponent(rowData.file_name);
                
                window.mainNavigator.push({
                    component       : FavsViewNav,
                    componentConfig : {
                        rowData : rowData
                    }
                });

                window.main.hideSpinner();
            });
                // console.log(rowData);
        },
        
        onAboutPress : function() {

            window.main.showSpinner();
            MCModPlayerInterface.loadModusAboutMod(
                //failure
                (data) => {
                    alert('Apologies. This file could not be loaded.');
                    console.log(data);
                },        
                //success
                (modObject) => {
                    // debugger;

                    modObject.path = decodeURIComponent(modObject.path);
                    modObject.file_name = decodeURIComponent(mod_object.file_name);

                    window.mainNavigator.push({
                        title           : 'About',
                        component       : AboutView,
                        componentConfig : {
                            modObject : modObject
                        }
                    });
                    window.main.hideSpinner();
                }
            );        
        },
        
        onSearchPress : function() {
            // this.props.onSearchPress();
        }
    }
});


module.exports = HomeMenu;
