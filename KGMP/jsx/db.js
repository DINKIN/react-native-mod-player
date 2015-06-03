var sqlite   = require('react-native-sqlite');


module.exports = {
    stack    : [],
    revStack : [],

    currentRecord : null, // used for popping items on the stack for forward navigation

    clear : function() {
        this.stack.length = 0;
        this.revStack.length = 0;
    },
    
    getRandom : function (successCallback) {
        var database = sqlite.open("keygenmusicplayer.db", function (error, database) {
            if (error) {
                console.log("Failed to open database:", error);
            }

            var sql = "SELECT * FROM songs where like_value IS NOT '-1' ORDER BY RANDOM() LIMIT 1;";
            
            database.executeSQL(sql, [], rowCallback, completeCallback);
            
            function rowCallback(rowData) {
                successCallback(rowData);
                // console.log("Got row data:", rowData);
            }
            
            function completeCallback(error) {
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
            }
        });
    },

    getNewRandomCurrentItem : function(cb) {
        this.getRandom((item) => {
            this.currentItem = item;
            cb(item);
        });
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

    updateLikeViaCurrentItem : function(likeValue, successCallback) {
        var id_md5 = this.currentItem.id_md5;

        var database = sqlite.open("keygenmusicplayer.db", function (error, database) {
            if (error) {
                console.log("Failed to open database:", error);
            }

            var query = 'UPDATE songs SET like_value = ' + likeValue + ' WHERE id_md5 = "' + id_md5 + '";';
            console.log(query);

            database.executeSQL(query, [], function() {}, completeCallback);
            
            
            function completeCallback(error) {
                if (error) {
                    console.log("Failed to execute query:", error);
                    return
                }
                                
                successCallback();


                database.close(function (error) {
                    if (error) {
                        console.log("Failed to close database:", error);
                        return
                    }
                });
            }
        });
    }
}