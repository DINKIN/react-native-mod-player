var React    = require('react-native'),
    Player   = require('./player/Player'),
    files    = require('./files');



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
        
        data : null,

        getDirectories : function() {
            this.rowData = files;

            this.state = this.getInitialState();

            // MCFsTool.getDirectoriesAsJson(
            //     cfg.directory,
            //     // failure
            //     () => {
            //         console.log('An Error Occurred');
            //     },
            //     // Success
            //     (response) =>  {
            //         this.rowData = response;                    

            //         if (this.rowData) {
            //             this.state = this.getInitialState();
            //             this.forceUpdate();
            //         }

            //     }
            // );
        },

        showWebView : function(url) {
            this.props.navigator.push({
                title     : 'Wikipedia',
                component : generateWebivew({
                    url : url
                })
            });
        },

        getInitialState: function() {
            alert('getInitialState')
            var dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
                daters     = files;

            
            if (daters) {
                var rowData  = [],
                    itemType = 'dir',
                    len      = daters.length,
                    i        = 0,
                    dataItem,
                    name;


                for (; i < len; i++) {
                    dataItem = daters[i];
                    name     = dataItem.name;

                    if (dataItem.type == 'dir') {
                        name += '/';
                    }

                    rowData.push(name);
                }

                return {
                    dataSource : dataSource.cloneWithRows(rowData),
                };

            }  

            return {};
        },

        componentWillMount: function() {
            this._pressData = {};
            this.rowData = files;
            this.state = this.getInitialState();

            // this.getDirectories();
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
            
            var record    = this.rowData[rowID],
                isDir     = (record.type == 'dir'),
                prefix    = null,
                wpSuffix  = null,
                imgSuffix = null,
                folder    = '\uE805',
                vgmIcon   = '\uE80A';
                // wikiIcon  = '\uE808',
                // picIcon   = '\uE809';


            if (isDir) {
                prefix = <Text style={styles.rowPrefix}>{folder}</Text> ;
            }
            else {

                prefix = <Text style={styles.rowPrefix}>{vgmIcon}</Text>;
                
            }
           
            return (
                <TouchableHighlight onPress={() => this._pressRow(rowID)}>
                    <View>
                        <View style={styles.row}>
                            {prefix}
                            
                            <Text style={styles.rowText}>{rowData}</Text>
                            
                            {wpSuffix}
                            {imgSuffix}
                        </View>
                        <View style={styles.separator} />
                    </View>
                </TouchableHighlight>
            );
        },
        getPreviousRecord : function(rowID) {
            var record    = this.rowData[--rowID];
            
            if (record) {
                return record;
            }
            else {
                return null;
            }
        },
        getNextRecord : function(rowID) {
            console.log(rowID);
            // console.log(this.rowData);
            var record    = this.rowData[++rowID];
            if (record) {
                return record;
            }
            else {
                return null;
            }

        },
        _pressRow: function(rowID) {
            // console.log('Pressed ' + rowID);

            var record    = this.rowData[rowID],
                isDir     = (record.type == 'dir'),
                navigator = this.props.navigator,
                cmp,
                title;

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
                title = record.name;
                
                // console.log(record.directory)
                MCModPlayerInterface.getFileInfo(
                    record.directory,
                    //failure
                    (data) => {
                        alert('Apologies. This file could not be loaded.');
                        console.log(data);
                    },        
                    //success
                    (modObject) => {
                        // console.log(data);


                        if (modObject) {
                            modObject.directory = record.directory;

                            var fileName = modObject.directory.split('/');
                            fileName = fileName[fileName.length - 1];

                            modObject.fileName = fileName;

                            var rtBtnText,
                                rtBtnHandler;
                       
                          

                            cmp = generatePlayer({
                                modObject : modObject,
                                rowID     : rowID,
                                ownerList : this
                            });

                            navigator.push({
                                title            : 'Player',
                                rightButtonTitle : rtBtnText,
                                component        : cmp,
                                // onRightButtonPress : rtBtnHandler
                            });
                          

                            

                        }

                    }
                );
            }
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