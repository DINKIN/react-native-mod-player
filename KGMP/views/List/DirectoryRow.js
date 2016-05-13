import React, {
    Component, 
    PropTypes
} from "react";

import {
    Image,
    ListView,
    TouchableHighlight,
    StyleSheet,
    WebView,
    Text,
    View,
} from "react-native";


const AnimatedLazyImage = require('../common/AnimatedLazyImage');
      
class DirectoryRow extends Component {


    render() {
        let styles  = this.styles,
            props   = this.props,
            rowID   = props.rowID,
            rowData = props.rowData,
            split   = unescape(rowData.name).split(' - '),
            name    = split[1] ? split[1] : rowData.name,
            tunes   = rowData.number_files ? <Text style={styles.numTunes}>{rowData.number_files} songs</Text> : null;
 


        let imgName   = name.replace('/','','g'),
            imgWidth  = 70,
            imgHeight = 40,
            source    = {
                uri    : `http://localhost/kgmp_images/${imgName}.png`,
                width  : imgWidth,
                height : imgHeight
            },
            imgStyle = {
                width         : imgWidth, 
                height        : imgHeight,
                borderRadius  : 5,
                shadowColor   : '#000',
                shadowOpacity : 1,
                shadowRadius  : 5,
                shadowOffset  : {
                    width  : 0,
                    height : 0
                }
            };

        name = decodeURI(name);

       
        // console.log(source.uri)
        return (
            <TouchableHighlight key={rowID} underlayColor={"#FFFFFF"} onPress={() => {props.onPress(rowID)}}>
                <View style={styles.rowContainer}>
                    <AnimatedLazyImage style={imgStyle} source={source}/>
                    <View style={styles.row}>
                        <Text style={styles.rowText}>{name}</Text>
                        {tunes}
                    </View>
                </View>
            </TouchableHighlight>
        );
    }

    styles = StyleSheet.create({
        rowContainer : {
            flexDirection:'row', 
            padding : 14,
            backgroundColor : '#FFFFFF',
            borderBottomWidth : 1,
            borderBottomColor : '#EEE',
        },

        row : {
            flex            : 1,
            flexDirection   : 'column',
            // justifyContent  : 'center',
            paddingHorizontal       : 15,
            alignItems : 'flex-start',
            justifyContent : 'flex-start',
            // backgroundColor : '#F6F6F6',
        },
        
        separator  : {
            height          : 1,
            backgroundColor : '#222222',
        },

        rowText : {
            // flex       : 1,
            color    : '#000000',        
            fontSize : 18
        },


        numTunes : {
            // fontFamily : 'PerfectDOSVGA437Win',
            marginTop  : 3,
            color      : '#AAA',        
            fontSize   : 13
        },

        rowPrefix : {
            fontFamily  : 'fontello',
            color       : 'white', 
            fontSize    : 15,
            marginRight : 5,
            marginTop   : 2
        },
        
        rowPrefixHidden : {
            fontFamily  : 'fontello', 
            fontSize    : 15,
            marginRight : 5,
            marginTop   : 2,
            color       : '#000000'
            // color       : '#F6F6F6'
        },
        
        rowSuffix : {
            fontFamily  : 'fontello', 
            fontSize     : 10,
            marginLeft   : 5,
            paddingRight : 3,
            marginTop    : 2
        }
    })
}

module.exports = DirectoryRow;