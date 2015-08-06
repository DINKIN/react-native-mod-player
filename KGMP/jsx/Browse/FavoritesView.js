var React = require('react-native');

var { 
        MCFsTool,
        MCModPlayerInterface
    } = require('NativeModules');


var {
    Image,
    ListView,
    TouchableHighlight,
    StyleSheet,
    WebView,
    Text,
    View,
} = React;

var FavoritesView = React.createClass({
        
    data      : null,
    fileNames : null,

    extractNamesForRow : function(daters) {
        var rowData  = [],
            dir      = 'dir',
            len      = daters.length,
            i        = 0,
            dataItem,
            name;

        for (; i < len; i++) {
            dataItem = daters[i];
            name     = dataItem.file_name ? dataItem.file_name : dataItem.name;

            if (dataItem.type == dir) {
                name += '/';
            }

            rowData.push(name);
        }

        return rowData;
    },

    getInitialState: function() {
        var daters     = this.props.rowData,
            dataSource = new ListView.DataSource({
                rowHasChanged: function(r1, r2) {
                    var index = rowData.indexOf(r1);
                    return (typeof daters[index].isPlaying != 'undefined'); 
                }
            }),
            rowData;
            
        
        if (daters) {
            rowData = this.extractNamesForRow(daters);

            var dSrc = dataSource.cloneWithRows(rowData);
            
            return {
                dataSource : dSrc
            };
        }  

        return {};
    },

    setRecordIsPlaying: function(rowID, isPlaying) {
        // debugger;
        var rawData = this.props.rowData,
            record  = rawData[rowID],
            len     = rawData.length,
            i       = 0, 
            r,
            rowData;
            
        for (; i < len; i++) {
            if (rawData[i].isPlaying) {
                rawData[i].isPlaying = false;
            };
        }

        if (record) {
            record.isPlaying = isPlaying;

            rowData = this.extractNamesForRow(rawData);

            this.setState({
                dataSource : this.state.dataSource.cloneWithRows(rowData)
            });
        } 
    },

    componentWillMount: function() {
        this._pressData = {};
    },

    render: function() {
        var numRecords = this.state.dataSource.getRowCount(),
            shuffleButton;

        if (numRecords > 2) {
            shuffleButton = (
                <View style={{ height: 45,  backgroundColor: '#000000', justifyContent : 'center', borderTopWidth: .5, borderTopColor: '#222222'}}>
                    <View style={styles.touchableCt}>

                        <TouchableHighlight
                            activeOpacity={1}
                            animationVelocity={0}
                            underlayColor="rgb(150,150,00)" 
                            style={styles.highlightCt} 
                            onPress={this._pressShuffle}>
                                <Text style={styles.label}>{"Shuffle"}</Text>
                        </TouchableHighlight>

                    </View>
                </View>
            );
        }

        return (
            <View style={{height: window.height - 60, backgroundColor : '#0000FF'}}>
                <ListView 
                    style={styles.listView} 
                    dataSource={this.state.dataSource} 
                    initialListSize={30} 
                    pageSize={20} 
                    scrollRenderAheadDistance={100} 
                    renderRow={this._renderRow}
                />
                {shuffleButton}                
            </View>
        );
    },

    _renderRow: function(rowData, sectionID, rowID) {
        
        var record      = this.props.rowData[rowID],
            isDir       = (record.type == 'dir'),
            prefix      = null,
            folder      = '\uE805',
            vgmIcon     = '\uE80A',
            playingIcon = '\uE80D',
            emptyIcon   = '\uE999';

        if (isDir) {
            prefix = <Text style={styles.rowPrefix}>{folder}</Text> ;
        }
        else if (record.isPlaying) {
            prefix = <Text style={styles.rowPrefix}>{playingIcon}</Text>;
        }
        else {
            prefix = <Text style={styles.rowPrefixHidden}>{playingIcon}</Text>;
        }
       
        return (
            <TouchableHighlight key={rowID} underlayColor={"#FFFFFF"} onPress={() => this._pressRow(rowID)}>
                <View>
                    <View style={styles.row}>
                        {prefix}
                        
                        <Text style={styles.rowText}>{rowData}</Text>

                    </View>
                    <View style={styles.separator} />
                </View>
            </TouchableHighlight>
        );
    },

    getRowDataCount : function() {
        return this.props.rowData.length - 1;
    },
    
    getFirstRecord : function() {
        return this.props.rowData[0];
    },
    
    getLastRecord : function() {
        this.props.rowData[this.props.rowData.length - 1];
    },

    getPreviousRecord : function(rowID) {
        var record    = this.props.rowData[--rowID];
        
        if (record) {
            return record;
        }
        else {
            return null;
        }
    },

    getNextRecord : function(rowID) {
        var record    = this.props.rowData[++rowID];

        if (record) {
            return record;
        }
        else {
            return null;
        }
    },

    _pressRow: function(rowID) {
        var props = this.props;

        props.onRowPress(props.rowData[rowID], props.navigator, this);
    },

   _pressShuffle: function() {
        var props = this.props;
        props.onShufflePress();
    }
});



var styles = StyleSheet.create({
    listView : {
        // height : window.height - 105,
        // borderWidth : 1,
        // borderColor : '#FFF000'
        backgroundColor : '#000000',
        flex            : 1
    },

    row : {
        flexDirection   : 'row',
        justifyContent  : 'center',
        padding         : 10,
        backgroundColor : '#000000',
        // backgroundColor : '#F6F6F6',
    },
    
    separator  : {
        height          : 1,
        backgroundColor : '#222222',
    },

    rowText : {
        fontFamily : 'PerfectDOSVGA437Win',
        fontWeight : 'bold',
        color      : '#00FF00',
        flex       : 1,
        fontSize   : 18
    },
    
    rowPrefix : {
        fontFamily  : 'fontello',
        color       : '#FFFFFF', 
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
    },

    // Shuffle button
    highlightCt : {
        width          : 160,
        height         : 28,
        borderWidth    : .5,
        borderColor    : '#333333',
        // borderRadius   : 3,
        flexDirection  : 'row',
        justifyContent : 'center',
    },

    touchableCt : {
        flexDirection  : 'row',
        justifyContent : 'center',
        // marginTop      : 20,
        // marginBottom   : 20,
        backgroundColor : '#000000'
        // borderWidth    : 2,
        // borderColor    : '#FF0000'
    },  

    label : {
        fontFamily : 'PerfectDOSVGA437Win',
        fontSize   : 25, 
        fontWeight : 'bold',
        color      : '#EFEFEF'
    },
});

module.exports = FavoritesView;