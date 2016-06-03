import React, {
    Component, 
    PropTypes
} from "react";

var AbstractPlayer = require('./AbstractPlayer');

var {
        MCModPlayerInterface,
        MCQueueManager
    } = require('NativeModules');


// Todo: remove
class ListPlayer extends AbstractPlayer {
    
}


module.exports = ListPlayer