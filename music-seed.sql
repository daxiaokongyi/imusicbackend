INSERT INTO users (username, password, first_name, last_name, email, is_admin) 
VALUES ('jj',
        '123',
        'Jason',
        'Jin',
        'jj@gmail.com',
        TRUE
        ),
        ('th',
         '123',
         'Tom',
         'Hanks',
         'th@gmail.com',
         FALSE
        ), (
        'jb',
        '123',
        'James',
        'Blunt',
        'jb@gmail.com',
        FALSE
        );

INSERT INTO songs (song_id, song_name, song_artist)
VALUES ('79029766', 'song1', 'artist1'), ('1119072024', 'song2', 'artist2'), ('538749492', 'song3', 'artist3'), ('311325738', 'song4', 'artist4'), ('1517801028', 'song5', 'artist5');

INSERT INTO favorites (username, songs_id)
VALUES 
    ('jj', 1), 
    ('jj', 2),
    ('jj', 3),
    ('th', 1),
    ('th', 2),
    ('jb', 5),
    ('jb', 4);
