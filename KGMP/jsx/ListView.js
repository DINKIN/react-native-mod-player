var React    = require('react-native'),
    Player   = require('./player/Player');

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


var generateWebivew = function(cfg) {
    return React.createClass({
        render : function() {
            return (<WebView {...cfg}/>);
        }
    });
}

// TODO: Invesitgate this patttern. It seems *really dirty*
var generatePlayer = function(cfg) {
    return React.createClass({
        render : function() {
            return (<Player {...cfg}/>);
        }
    })
}

var generateView = function(cfg) {
    return React.createClass({
        
        data      : null,
        fileNames : null,

        getDirectories : function() {
            MCFsTool.getDirectoriesAsJson(
                cfg.path,
                // failure
                () => {
                    console.log('An Error Occurred');
                },
                // Success
                (response) =>  {
                    this.rowData = response;                    

                    if (this.rowData) {
                        this.state = this.getInitialState();
                        this.forceUpdate();
                    }
                }
            );
        },

        showWebView : function(url) {
            this.props.navigator.push({
                title     : 'Wikipedia',
                component : generateWebivew({
                    url : url
                })
            });
        },

        extractNamesForRow : function(daters) {
            var rowData  = [],
                itemType = 'dir',
                len      = daters.length,
                i        = 0,
                dataItem,
                name;

            for (; i < len; i++) {
                dataItem = daters[i];
                name     = dataItem.file_name ? dataItem.file_name : dataItem.name;

                if (dataItem.type == 'dir') {
                    name += '/';
                }

                rowData.push(name);
            }

            return rowData;

        },

        getInitialState: function() {
            var daters     = this.rowData,
                dataSource = new ListView.DataSource({
                    rowHasChanged: function(r1, r2) {
                        var index = rowData.indexOf(r1);
                        // debugger;
                        // if (daters[index].isPlaying) {
                            // console.log(daters[index]);
                        // }; 

                        return (typeof daters[index].isPlaying != 'undefined'); 
                    }
                }),
                rowData;
                

            
            if (daters) {
                rowData = this.extractNamesForRow(daters);
                
                return {
                    dataSource : dataSource.cloneWithRows(rowData),
                };

            }  

            return {};
        },

        setRecordIsPlaying: function(rowID, isPlaying) {
            // debugger;
            var rawData = this.rowData,
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

                // debugger;

                this.setState({
                    dataSource : this.state.dataSource.cloneWithRows(rowData)
                });
            } 
        },

        componentWillMount: function() {
            this._pressData = {};

            this.getDirectories();
        },

        render: function() {
            return (
                this.rowData ? 
                        <ListView dataSource={this.state.dataSource} initialListSize={20} pageSize={60} scrollRenderAheadDistance={500} renderRow={this._renderRow}/>
                    :
                        <Text>Loading...</Text>

            );
        },

        _renderRow: function(rowData, sectionID, rowID) {
            
            var record      = this.rowData[rowID],
                isDir       = (record.type == 'dir'),
                prefix      = null,
                folder      = '\uE805',
                vgmIcon     = '\uE80A',
                playingIcon = '\uE80D',
                emptyIcon   = '\uE999';
                // wikiIcon  = '\uE808',
                // picIcon   = '\uE809';


            if (! isDir) {
                // console.log((record.file_name || record.name) + ' ' + record.isPlaying);;

            }   

            if (isDir) {
                prefix = <Text style={styles.rowPrefix}>{folder}</Text> ;
            }

            else if (record.isPlaying) {
                // console.log('PLAYING');
                // console.log(record);
                prefix = <Text style={styles.rowPrefix}>{playingIcon}</Text>;
            }
            else {
                prefix = <Text style={styles.rowPrefixHidden}>{playingIcon}</Text>;
            }
           
            return (
                <TouchableHighlight key={rowID} onPress={() => this._pressRow(rowID)}>
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
            return this.rowData.length - 1;
        },
        getFirstRecord : function() {
            return this.rowData[0];
        },
        getLastRecord : function() {
            this.rowData[this.rowData.length - 1];
        },
        getPreviousRecord : function(rowID) {
            var record    = this.rowData[--rowID];
            
            if (record) {
                return record;
            }
            else {
                return null;
                // this.rowData[this.rowData.length - 1];
            }
        },

        getNextRecord : function(rowID) {
            // console.log(rowID);
            // console.log(this.rowData);
            var record    = this.rowData[++rowID];
            if (record) {
                return record;
            }
            else {
                return null;
                // this.rowData[0];
            }
        },
        _pressRow: function(rowID) {
            // TODO: Setup color for selected item
            var record    = this.rowData[rowID],
                isDir     = (record.type == 'dir'),
                navigator = this.props.navigator,
                cmp;

            // console.log(record);


            if (isDir) {
                title = record.name + '/';
                cmp   = generateView(record);

                navigator.push({
                    title     : title,
                    component : cmp
                });
            }
            else {
                this.loadModFile(record, rowID);                
            }
        },

        // Todo:  Clean this method up. Shit, it's a mess!
        loadModFile : function(record, rowID) {
            // console.log(files);
            //gger;
            
            var navigator = this.props.navigator;
            
            MCModPlayerInterface.loadFile(
                record.path,
                //failure
                (data) => {
                    alert('Apologies. This file could not be loaded.');
                    console.log(data);
                },        
                //success
                (modObject) => {
                    if (modObject) {

                        modObject.path = record.path;

                        var fileName = modObject.path.split('/'),
                            rtBtnText,
                            rtBtnHandler;

                        fileName = fileName[fileName.length - 1];

                        modObject.fileName = fileName;
                       
                        cmp = generatePlayer({
                            modObject : modObject,
                            rowID     : rowID,
                            ownerList : this,
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

        }
    });
};


var styles = StyleSheet.create({
    row : {
        flexDirection   : 'row',
        justifyContent  : 'center',
        padding         : 10,
        backgroundColor : '#F6F6F6',
    },
    
    separator  : {
        height          : 1,
        backgroundColor : '#CCCCCC',
    },

    thumb : {
        width  : 64,
        height : 64,
    },

    rowText : {
        flex     : 1,
        fontSize : 18
    },
    
    rowPrefix : {
        fontFamily  : 'fontello', 
        fontSize    : 15,
        marginRight : 5,
        marginTop   : 2
    },
    
    rowPrefixHidden : {
        fontFamily  : 'fontello', 
        fontSize    : 15,
        marginRight : 5,
        marginTop   : 2,
        color       : '#F6F6F6'
    },
    
    rowSuffix : {
        fontFamily  : 'fontello', 
        fontSize     : 10,
        marginLeft   : 5,
        paddingRight : 3,
        marginTop    : 2
    }
});

module.exports = generateView({
    path  : null 
});