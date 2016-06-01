#!/usr/local/bin/node

var fs         = require('fs'),
    console    = require('console'),
    execSync   = require('child_process').execSync,
    util       = require('util'),
    // modFiles   = require('./mod_files.in'),
    sqlFile    = 'data_to_insert.sql',
    insertSongsSQL = 'INSERT INTO songs VALUES("%s", "%s", "%s", "%s", "%s", 0, 0);\n',
    insertDirSQL   = 'INSERT INTO directories VALUES("%s", "%s");\n';



var modFiles = JSON.parse(fs.readFileSync('mod_files.in.json').toString());;

fs.writeFileSync(sqlFile, '');


var rootCmd = '%s "../KEYGENMUSiC MusicPack/%s/%s"',
    cmd,
    md5; 

for (var dir in modFiles) {
    var keys    = Object.keys(dir),
        dirObj  = modFiles[dir],
        numGood = 0;

    if (keys.length < 1) {
        console.log(dir);
    }


    for (var fileName in dirObj) {
        fileObj =  dirObj[fileName];

        fileName = fileName.replace('$', '\\$', 'g');
        
        delete fileObj.path;

        if (fileObj.bad) {
            var cmd = util.format(rootCmd, 'rm -f', dir, fileName);
            // console.log(cmd);
            console.log('DELETE %s/%s', dir, fileName);

            execSync(cmd); 
            continue;
        }

        cmd = util.format(rootCmd, 'md5 -q', dir, fileName);

        md5 = execSync(cmd).toString();
        md5 = md5.trim();
        // console.log(fileObj)
        // console.log('[%s] %s', md5, fileName);
        
        statement = util.format(insertSongsSQL, md5, escape(fileObj.songName), escape(fileName), escape(fileObj.file_name_short), escape(dir + '/'));
        fs.appendFileSync(sqlFile, statement);
        numGood++;

        // console.log('INSERT %s/%s', dir, fileName);
        // console.log(statement)
    }

    statement = util.format(insertDirSQL, escape(dir + '/'), numGood);
    fs.appendFileSync(sqlFile, statement);

}


execSync('sqlite3 keygenmusicplayer.db < schema.sql');
execSync('sqlite3 keygenmusicplayer.db < ' + sqlFile);


console.log('DONE');