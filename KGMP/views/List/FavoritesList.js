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


const DirectoryRow = require('./DirectoryRow'),
      FileRow      = require('./FileRow'),
      ShuffleRow   = require('./ShuffleRow'),
      BaseView     = require('../BaseView'),
      PlayController = require('../PlayController'),
      BrowseList     = require('./BrowseList');


const FavoritesList extends BrowseList {

}


module.exports = FavoritesList;