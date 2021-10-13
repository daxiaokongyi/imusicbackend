CREATE TABLE users (
    username VARCHAR(25) PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL
        CHECK(position('@' IN email) > 1)
);

CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    song_id INTEGER NOT NULL,
    song_name TEXT NOT NULL,
    song_artist TEXT NOT NULL,
    song_genre_names TEXT
);

CREATE TABLE favorites (
    username VARCHAR(25) 
        REFERENCES users ON DELETE CASCADE,
    songs_id INTEGER 
        REFERENCES songs ON DELETE CASCADE,
    PRIMARY KEY (username, songs_id)
);