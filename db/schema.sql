DROP TABLE IF EXISTS songs;
DROP TABLE IF EXISTS plays;
DROP INDEX IF EXISTS song_index;


CREATE TABLE songs (
    id_md5     TEXT, 
    song_name  TEXT,
    file_name  TEXT, 
    path       TEXT, 
    like_value INT
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
