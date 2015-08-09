DROP TABLE IF EXISTS songs;
DROP TABLE IF EXISTS plays;
DROP INDEX IF EXISTS song_index;
DROP INDEX IF EXISTS directories;


CREATE TABLE songs (
    id_md5     TEXT, 
    song_name  TEXT,
    file_name  TEXT, 
    directory  TEXT, 
    like_value INT
);

CREATE TABLE directories (
    name         TEXT,
    number_files INT
);


CREATE TABLE plays (id_md5 TEXT, number_plays INT);

CREATE 
    INDEX 
        song_index 
    ON 
        songs(song_name, file_name) 
    WHERE 
        song_name 
    IS 
        NOT NULL; 
