var sqlite       = require('react-native-sqlite'),
    randomSQL    = "SELECT * FROM songs where like_value IS NOT '-1' ORDER BY RANDOM() LIMIT 1;",
    randomFavSQL = "SELECT * FROM songs where like_value IS '1' ORDER BY RANDOM() LIMIT 1;",
    favoritesSQL = "SELECT * FROM songs where like_value IS '1' ORDER BY name;",
    emptyArray   = [],
    emptyFn      = function() {};

module.exports = {
    stack    : [],
    revStack : [],

    currentRecord : null, // used for popping items on the stack for forward navigation

    clear : function() {
        this.stack.length = 0;
        this.revStack.length = 0;
    },
    
    getRandom : function (successCallback) {
        this.execQuery(randomSQL, successCallback);
    },

    getRandomFavorite : function (successCallback) {
        this.execQuery(randomFavSQL, successCallback);
    },

    getNewRandomCurrentItem : function(cb) {
        this.getRandom((item) => {
            this.currentItem = item;
            cb(item);
        });
    },

    getByColumn : function(column, value, successCallback) {
        var query = "SELECT * FROM songs WHERE " + column + " like '" + value + "';";

        this.execQuery(query, successCallback);

    },

    getNextRandom : function(successCallback) {
        this.getRandom((rowData) => {
            if (this.currentItem) {
                this.stack.push(this.currentItem);
            }
         
            this.currentItem = rowData;
         
            successCallback(rowData, this.stack.length);
        });
    },

    getNextRandomFavorite : function(successCallback) {
        this.getRandomFavorite((rowData) => {
            if (this.currentItem) {
                this.stack.push(this.currentItem);
            }
         
            this.currentItem = rowData;
         
            successCallback(rowData, this.stack.length);
        });
    },


    // TODO : Reverse random stack
    getPrevRandomFavorite : function(successCallback) {
        var stack = this.stack;

        if (stack.length <= 0) {
            successCallback(null);
            return;
        }

        var item = stack.pop();
        successCallback(item);
        this.currentItem = item; 
    },

    // TODO : Reverse random stack
    getPrevRandom : function(successCallback) {
        var stack = this.stack;

        if (stack.length <= 0) {
            successCallback(null);
            return;
        }

        var item = stack.pop();
        successCallback(item);
        this.currentItem = item; 
    },

    getFavorites : function(successCallback) {
        this.execQuery(favoritesSQL, successCallback);
    },


    updateLikeViaCurrentItem : function(likeValue, successCallback) {
        var id_md5 = this.currentItem.id_md5,
            query  = 'UPDATE songs SET like_value = ' + likeValue + ' WHERE id_md5 = "' + id_md5 + '";'

        this.execQuery(query, function() {
            successCallback();
        });
    },

    updateLikeViaFileName : function(fileName, likeValue, successCallback) {
        var query  = 'UPDATE songs SET like_value = ' + likeValue + ' WHERE file_name = "' + fileName + '";'
        // debugger;
        this.execQuery(query, function() {
            successCallback();
        });
    },

    execQuery : function(query, successCallback) {
        // debugger;
        var database = sqlite.open("keygenmusicplayer.db", function (error, database) {
            if (error) {
                console.log("Failed to open database:", error);
            }
            console.log(query);

            var data = [],
                rowCallback = function (rowData) {
                    data.push(rowData);
                },
                completeCallback = function (error) {
                    // debugger;
                    if (error) {
                        console.log("Failed to execute query:", error);
                        return
                    }
                                    
                    database.close(function (error) {
                        if (error) {
                            console.log("Failed to close database:", error);
                            return
                        }
                    });

                    var ret = data.length == 1 ? data[0] : data;
                    successCallback(ret);
                };

            database.executeSQL(query, emptyArray, rowCallback, completeCallback);

        });
    }
}