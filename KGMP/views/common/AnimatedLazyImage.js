'use strict';

import React, {
    Component, 
    PropTypes
} from "react";

import {
    Image,
    LayoutAnimation,
    ListView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    InteractionManager,
    Dimensions,
    ScrollView,
    Animated
} from "react-native";



const placeholderMedium = require('./imgs/gr_placeholder_flag_medium.jpg'),
      placeholderTiny   = require('./imgs/gr_placeholder_flag_tiny.jpg');


class AnimatedLazyImage extends Component {
    state = {
        error    : false,
        loading  : false,
        progress : 0,
        opacity  : new Animated.Value(0)
    };

    error(e) {
        // console.log('ERROR')
        // console.log(this.props.source)
        this.setState({
            error   : e.nativeEvent.error, 
            loading : false
        });
    }


    onAfterLoad = () => {
        Animated.timing(                          
            this.state.opacity,                 
            {
                duration : 500,
                toValue  : 1                         
            }
        )
        .start();
    }

    render() {
        let props = this.props,
            placeholder = props.tinyPlaceholder ? placeholderTiny : placeholderMedium,
            animatedStyle = {
                position  : 'absolute', 
                top       : 0, 
                left      : 0,
                opacity   : this.state.opacity
            }

        // console.log(this.props.source)
        //TODO: Fade in image

        // onLoadStart={(e) => this.setState({loading: true})}
        // onError={(e) => this.error(e)}
        // onProgress={(e) => this.setState({progress: Math.round(100 * e.nativeEvent.loaded / e.nativeEvent.total)})}
        // onLoad={() => this.setState({loading: false, error: false})}

        return (
            <View style={props.style}>
                <Image  style={props.style}
                        defaultSource={placeholder}
                        source={placeholder}
                        />
                        
                <Animated.Image 
                        style={[animatedStyle, props.style]}
                        source={props.source} 
                        onLoad={this.onAfterLoad}
                        tinyPlaceholder={true}/>
                
            </View>
        );

    }
};


module.exports = AnimatedLazyImage;






