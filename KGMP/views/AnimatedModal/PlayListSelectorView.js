
import React, {
    Component, 
    PropTypes
} from "react";

import {
    Navigator,
    PixelRatio,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TouchableHighlight,
    ActivityIndicatorIOS,
    Dimensions,
    Animated,
    Easing,
    StatusBar,
    ActionSheetIOS,
    ListView,
    AlertIOS
} from "react-native";

const AnimatedModal = require('./AnimatedModal');

const {
    MCModPlayerInterface,
    MCQueueManager
} = require('NativeModules');

const windowDimensions = Dimensions.get('window');

const PlayController = require('../PlayController');

const Slider   = require('react-native-slider'),
      Ionicons = require('react-native-vector-icons/Ionicons');




      
class PlaylistRow extends Component {
    render() {
        let styles   = this.styles,
            props    = this.props,
            rowID    = props.rowID,
            rowData  = props.rowData;


        return (
            <TouchableOpacity key={rowID} underlayColor={"#000"} onPress={this.onPress}>
                <View style={styles.rowContainer}>
                    <View style={styles.row}>
                        <Text style={styles.rowText} numberOfLines={1}>{rowData.playlistName}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    onPress = () => {
        var props = this.props;

        props.onPress(props.rowData, props.rowID);
    }

    styles = StyleSheet.create({
        rowContainer : {
            flexDirection:'row', 
            padding : 14,
            backgroundColor : 'transparent',
            borderBottomWidth : 1,
            borderBottomColor : '#999',
        },

        row : {
            flex            : 1,
            flexDirection   : 'column',
            // justifyContent  : 'center',
            paddingHorizontal       : 10,
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
            fontSize : 16
        },


        songName : {
            // fontFamily : 'PerfectDOSVGA437Win',
            marginTop  : 4,
            color      : '#AAA',        
            fontSize   : 14
        },

    })
}


class PlaylistSelectorView extends AnimatedModal {
    isHidden = true;
    restingPosition = windowDimensions.height;
    title = 'Select a playlist';
    startingEqSettings = null;
    fileRecord = null;


    styles = StyleSheet.create({
        sliderTrack: {
            height: 2,
            borderRadius: 0,
            backgroundColor: '#666',
        },
        sliderThumb: {
            width: 10,
            height: 20,
            borderRadius: 0,
            backgroundColor: '#666',
        },
        slider : {
            width : windowDimensions.width - 160,
            // borderWidth:1
        },

        sliderRow : {
            flexDirection  : 'row', 
            justifyContent : 'space-between', 
            alignItems     : 'center',
            alignSelf      : 'stretch',
            marginVertical : 0,
            // borderWidth    :1
        }
    });


    setInitialState() {
        super.setInitialState();

        var state = Object.assign({
                dataSource : this.getNewDataSource([])
            }, this.state);

        this.state = state;
    }

    componentDidMount() {

        this.addListenersOn(PlayController.eventEmitter, {
            showPlaylistSelectorScreen : this.onShowPlaylistSelectorScreen
        });
    }

    onShowPlaylistSelectorScreen = (fileRecord) => {
        this.fileRecord = fileRecord;
        this.refreshList(() => {
            setTimeout(() => {
                this.show();
            }, 100)
        });
                    
    }

    refreshList(callback) {
        MCModPlayerInterface.getPlaylists((playlists) => {
            console.log('playlists', JSON.stringify(playlists, undefined, 4))
            this.setState({
                dataSource : this.getNewDataSource(playlists)
            });
            callback && callback();
        });
    }

    getNewDataSource(playlists) {
        var props      = this.props,
            dataSource = new ListView.DataSource({
                rowHasChanged : function(r1, r2) {
                    return r1 !== r2;
                }
            });


        return dataSource.cloneWithRows(playlists);
        
    }

    renderRow = (rowData, sectionID, rowID) => {
        return <PlaylistRow onPress={this.onEQPresetPress} rowData={rowData} rowID={'shuffleRow'}/>
    }



    renderCenter() {
        return (
            <ListView 
                style={{padding:20}} 
                dataSource={this.state.dataSource} 
                initialListSize={10} 
                pageSize={50} 
                overflow={'hidden'}
                scrollRenderAheadDistance={150} 
                renderRow={this.renderRow}
            />
        );
    }

    onEQPresetPress = (rowData) => {
        // console.log('onEQPresetPress', rowData, this.fileRecord);
        // debugger
        PlayController.addSongToPlaylist(
            this.fileRecord.id_md5,
            rowData.id,
            false,
            (success) => {
                // debugger;
                if (! success) {
                     AlertIOS.alert(
                        'Song already exists',
                        'Do you want to add it anyway?',
                        [
                            {
                                text : 'Cancel',
                                onPress : () => {}
                            },
                            {
                                text    : 'OK',
                                onPress : () => {
                                    PlayController.addSongToPlaylist(
                                        this.fileRecord.id_md5,
                                        rowData.id,
                                        true,
                                        () => { 
                                            setTimeout(() => { this.hide()}, 100);
                                         }
                                    );
                                }
                            }

                        ]
                    )
                }
                else {
                    setTimeout(() => { this.hide()}, 100);

                }
            }
        )

       
    }


    onValueChange = (value, index) => { 
        var newState =  { isCustomized : true };

        newState.eqSettings = Object.assign({}, this.state.eqSettings);

        newState.eqSettings[freqNameKeyMap[index]] = value;

        this.setState(newState);

        MCModPlayerInterface.setEQ(index, value);
    }

    getEQValues() {
        return this.state.eqSettings; // Values are stored directly in state for simplicity.
    }

    // renderActionButton(text, handler, color) {
    //     return <TouchableOpacity onPress={handler} style={{justifyContent : 'center', alignItems:'center', flexDirection:'row', padding:10}}>
    //                 <Text style={{fontSize : 18, color:color}}>
    //                     {text}
    //                 </Text>
    //             </TouchableOpacity>
    // }

    renderActionButton(iconType, handler, color) {
        return <TouchableOpacity onPress={handler} style={{justifyContent : 'center', alignItems:'center', flexDirection:'row', padding:10}}>
                    <Ionicons name={iconType} size={30} color={color}/>

                </TouchableOpacity>
    }

    renderCancelButton() {
        return this.renderActionButton('ios-close', this.onClose, '#F66')
    }

    renderSaveButton() {
        return this.renderActionButton('ios-plus', this.onNewPlaylist, '#4D4'); 
    }

    // renderCancelButton() {
    //     return this.renderActionButton('Close', this.onClose, '#F66')
    // }

    // renderSaveButton() {
    //     return this.renderActionButton('New Playlist', this.onNewPlaylist, '#4D4'); 
    // }

    onClose = () => {
        this.hide();
    }

    onNewPlaylist = (msg) => {
        // this.hide();
        AlertIOS.prompt(
            'Enter new Playlist',
            null,
            [
                {
                    text : 'Cancel',
                    onPress : () => {}
                },
                {
                    text    : 'OK',
                    onPress : this.onPromptOKPress
                }
            ]
        )
    }

    onPromptOKPress = (value) => {
        PlayController.addNewPlaylist(value, (success) => {
            if (! success) {
                this.onNewPlaylist(value + ' already exists. Enter a new name.');
            }
            else {
                this.refreshList();
                // Todo: Refresh the inner list       
            }
        });
    }

}


module.exports = PlaylistSelectorView;