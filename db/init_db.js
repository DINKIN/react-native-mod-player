#!/usr/local/bin/node

var fs         = require('fs'),
    console    = require('console'),
    execSync   = require('child_process').execSync,
    util       = require('util'),
    modFiles   = require('./mod_files.full.json'),
    sqlFile    = 'data_to_insert.sql',
    insertRoot = 'INSERT INTO songs VALUES("%s", "%s", "%s", "%s", 0);\n';

fs.writeFileSync(sqlFile, '');

x=0; 
for (var md5Value in modFiles) {
    var modFile   = modFiles[md5Value],
        statement = util.format(insertRoot, md5Value, encodeURIComponent(modFile.modInfo.name), modFile.fileName, modFile.path);
    console.log(x + ' ' + md5Value)
    fs.appendFileSync(sqlFile, statement);
    x++;
}

execSync('sqlite3 keygenmusicplayer.db < schema.sql');
execSync('sqlite3 keygenmusicplayer.db < ' + sqlFile);


console.log('DONE');