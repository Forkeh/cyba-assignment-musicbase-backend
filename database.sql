DROP DATABASE IF EXISTS music_base_db;

CREATE DATABASE music_base_db;

USE music_base_db;

-- CREATE TABLES

CREATE TABLE Artists(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    image VARCHAR(1000) DEFAULT 'anon-billed'
);

CREATE TABLE  Tracks (
    id  INT PRIMARY KEY  AUTO_INCREMENT NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration INT NOT NULL
);

CREATE TABLE Albums (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    title VARCHAR(255) UNIQUE,
    year_of_release INT,
    image VARCHAR(1000) DEFAULT 'anon-billed'
);


CREATE TABLE Artists_Tracks(
    artist_id INT,
    track_id INT,
    PRIMARY KEY (artist_id, track_id),
    FOREIGN KEY (artist_id) REFERENCES artists(id),
    FOREIGN KEY (track_id) REFERENCES tracks(id)
);

CREATE TABLE Artists_Albums(
    artist_id INT,
    album_id INT,
    PRIMARY KEY (artist_id, album_id),
    FOREIGN KEY (artist_id) REFERENCES artists(id),
    FOREIGN KEY (album_id) REFERENCES albums(id)

);

CREATE TABLE Albums_Tracks(
    album_id INT,
    track_id INT,
    PRIMARY KEY (album_id, track_id),
    FOREIGN KEY (album_id) REFERENCES albums(id),
    FOREIGN KEY (track_id) REFERENCES tracks(id)
);

-- INSERT DATA
-- Insert artists
INSERT INTO Artists (name, image)
VALUES ('Daft Punk', 'https://i.discogs.com/nfDBJRXENXyNXvNtszxObIj7Kz8-0fs3w25SYqRJkvA/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9BLTEyODkt/MTQzMjIyODY1NS01/MjcyLmpwZWc.jpeg'),
       ('Norah Jones', 'https://i.discogs.com/Q0bQiyRI4nFojIOMbXLdkmmofeOwsV6WSCh9SDReeuY/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9BLTE0NzAz/MS0xMzM3MjczMDEy/LTI3NTIuanBlZw.jpeg'),
       ('Metallica', 'https://i.discogs.com/ZVoyyAMF573Q6dx3Te1ko9rN5Zrr9rfYJt1x0wIoGmM/rs:fit/g:sm/q:90/h:600/w:462/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9BLTE4ODM5/LTE1OTk3NjM3NjYt/MjMxNi5qcGVn.jpeg'),
       ('Drake', 'https://i.discogs.com/Dlt-kor5Zqfen9tulh91C9XYLtmwO9Qt-a6UHeeAAzw/rs:fit/g:sm/q:90/h:340/w:396/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9BLTE1MTE5/OS0xNTA1ODQ4MDQ4/LTI0OTguanBlZw.jpeg'),
       ('Rihanna', 'https://i.discogs.com/xDR38kBBYDzZQRDribN1MkPXC0vwfGRnU8ccweTuDAA/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9BLTMyMTEy/OC0xNjY3MTU0NjUy/LTE1NjQuanBlZw.jpeg'),
       ('Eminem', 'https://i.discogs.com/KZbEwJb2z2t0eg82m4BvBJwnXb8Dp82Iwks7WMdtZVM/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9BLTM4NjYx/LTE1MzYyMDA2NTIt/NzMwNS5qcGVn.jpeg');

-- Insert albums
INSERT INTO Albums (title, year_of_release, image) VALUES
    ('Discovery', 2001, 'https://i.discogs.com/6gMPje3DUKa1LMojsHtGTE5o4fIQon5lYaIJvALlvVM/rs:fit/g:sm/q:90/h:600/w:592/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTI4Nzkt/MTIzNjAzNTQ3Mi5q/cGVn.jpeg'),
    ('Random Access Memories', 2013, 'https://i.discogs.com/zFVZE4s0zSXUIM7OMl2UDckSq0zlopdHBHRz23zqMJk/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTQ1NzAz/NjYtMTUzOTI5NTA5/Mi02MDg3LnBuZw.jpeg'),
    ('Come Away with Me', 2002, 'https://i.discogs.com/Z-IZUVBVixzQ9Yo0Tc9CzZa3xyfkb3FIs2emNqKcBOs/rs:fit/g:sm/q:90/h:531/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTE1NTMw/MTAtMTY5MjIzMDMz/Ny03MDkxLmpwZWc.jpeg'),
    ('Feels Like Home', 2004, 'https://i.discogs.com/GD_jkgW-2Ti5aZF-yXlCzXQXUKMyJZhU3IQApYNnrnk/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTkyNDE1/Ni0xMjA3NjkwOTMw/LmpwZWc.jpeg'),
    ('Master of Puppets', 1986, 'https://i.discogs.com/WIcmVaAsfOwxgaKApPMciVitogXJEkSAl1TyIhxTNRw/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTE1NDk2/MzYtMTI2NTk0ODA5/NC5qcGVn.jpeg'),
    ('Metallica (The Black Album)', 1991, 'https://i.discogs.com/pdMNQWauOC2x1jJt-F1tlsKRb_89hdMKXXWzfGOi48I/rs:fit/g:sm/q:90/h:600/w:598/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTExMjc2/MzUwLTE1MTMyNTYy/NzItNTUxOC5qcGVn.jpeg'),
    ('Take Care', 2011, 'https://i.discogs.com/AXsHLi1NYQL0XfJ9KW0fHGeteMJP6TSj6iqb3EhJuPI/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTM2Mzcz/OTEtMTQ1ODM3OTA2/NS03NjkzLmpwZWc.jpeg'),
    ('Views', 2016, 'https://i.discogs.com/bBrgtJ_6yoRytb3xwokc0LTv7p14y5c1YYzfGfBjylQ/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTg0NTI4/ODAtMTY1ODUzNTM5/My04ODU0LmpwZWc.jpeg'),
    ('Good Girl Gone Bad', 2007, 'https://i.discogs.com/PKYH6I2b2lf0YjEkTjkDec-L3I4AmBydZXUENort1bI/rs:fit/g:sm/q:90/h:597/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTEwMjI4/MzUtMTM1MTEwMTgy/My0zNDI2LmpwZWc.jpeg'),
    ('Loud', 2010, 'https://i.discogs.com/cgYjUelHu_1lNhpjHEglhMDrYKPJ3x1NCSVG4HGps7Y/rs:fit/g:sm/q:90/h:596/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTI1Njc3/NTktMTI5NTcxODE4/My5qcGVn.jpeg'),
    ('Recovery', 2010, 'https://i.discogs.com/8ZeskgkSlrdrepcAA-FMDtEhkFsjf93EEhNVouNzx2k/rs:fit/g:sm/q:90/h:600/w:596/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTI0MDE3/ODAtMTMwNDYyNjUz/NS5qcGVn.jpeg');

-- Insert tracks
INSERT INTO Tracks (title, duration) VALUES
    ('One More Time', 235),
    ('Digital Love', 314),
    ('Harder, Better, Faster, Stronger', 223),
    ('Get Lucky', 248),
    ('Instant Crush', 315),
    ('Lose Yourself to Dance', 347),
    ('Don/''t Know Why', 193),
    ('Come Away with Me', 212),
    ('Turn Me On', 160),
    ('Sunrise', 200),
    ('What Am I to You?', 213),
    ('Toes', 172),
    ('Battery', 312),
    ('Master of Puppets', 516),
    ('Welcome Home (Sanitarium)', 391),
    ('Enter Sandman', 332),
    ('The Unforgiven', 387),
    ('Sad But True', 330),
    ('Over My Dead Body', 252),
    ('Take Care', 263),
    ('Marvins Room', 289),
    ('One Dance', 173),
    ('Hotline Bling', 267),
    ('Controlla', 221),
    ('Umbrella', 261),
    ('Don\'t Stop the Music', 240),
    ('Shut Up and Drive', 196),
    ('Only Girl (In the World)', 235),
    ('What\'s My Name?', 243),
    ('S&M', 243),
    ('Love The Way You Lie', 255),
    ('Not Afraid', 248),
    ('Cinderella Man', 279),
    ('Cold Wind Blows', 304);


-- Link artists to their albums and tracks
INSERT INTO Artists_Albums (artist_id, album_id) VALUES
    (1, 1),  -- Daft Punk - Discovery
    (1, 2),  -- Daft Punk - Random Access Memories
    (2, 3),  -- Norah Jones - Come Away with Me
    (2, 4),  -- Norah Jones - Feels Like Home
    (3, 5),  -- Metallica - Master of Puppets
    (3, 6),  -- Metallica - Metallica (The Black Album)
    (4, 7),  -- Drake - Take Care
    (4, 8),  -- Drake - Views
    (5, 9),   -- Rihanna - Good Girl Gone Bad
    (5, 10),  -- Rihanna - Loud
    (6, 11); -- Eminem - Recovery

INSERT INTO Artists_Tracks (artist_id, track_id) VALUES
    (1, 1),  -- Daft Punk - One More Time
    (1, 2),  -- Daft Punk - Digital Love
    (1, 3),  -- Daft Punk - Harder, Better, Faster, Stronger
    (1, 4),  -- Daft Punk - Get Lucky
    (1, 5),  -- Daft Punk - Instant Crush
    (1, 6),  -- Daft Punk - Lose Yourself to Dance
    (2, 7),   -- Norah Jones - Don't Know Why
    (2, 8),   -- Norah Jones - Come Away with Me
    (2, 9),   -- Norah Jones - Turn Me On
    (2, 10),  -- Norah Jones - Sunrise
    (2, 11),  -- Norah Jones - What Am I to You?
    (2, 12),  -- Norah Jones - Toes
    (3, 13),  -- Metallica - Battery
    (3, 14),  -- Metallica - Master of Puppets
    (3, 15),  -- Metallica - Welcome Home (Sanitarium)
    (3, 16),  -- Metallica - Enter Sandman
    (3, 17),  -- Metallica - The Unforgiven
    (3, 18),  -- Metallica - Sad But True
    (4, 19),  -- Drake - Over My Dead Body
    (4, 20),  -- Drake - Take Care
    (4, 21),  -- Drake - Marvins Room
    (4, 22),  -- Drake - One Dance
    (4, 23),  -- Drake - Hotline Bling
    (4, 24),  -- Drake - Controlla
    (5, 25),  -- Rihanna - Umbrella
    (5, 26),  -- Rihanna - Don't Stop the Music
    (5, 27),  -- Rihanna - Shut Up and Drive
    (5, 28),  -- Rihanna - Only Girl (In the World)
    (5, 29),  -- Rihanna - What's My Name?
    (5, 30),  -- Rihanna - S&M
    (5, 13),  -- Rihanna - Battery
    (5, 31),  -- Rihanna - Love the way you lie
    (6, 31),  -- Eminem - Love the way you lie
    (6, 32),  -- Eminem - Not Afraid
    (6, 33),  -- Eminem - Cinderella Man
    (6, 34);  -- Eminem - Cold Wind Blows

-- Insert track_id and album_id into Albums_Tracks table
INSERT INTO Albums_Tracks (track_id, album_id)
VALUES
    (1, 1),   -- One More Time - Discovery
    (2, 1),   -- Digital Love - Discovery
    (3, 1),   -- Harder, Better, Faster, Stronger - Discovery
    (4, 2),   -- Get Lucky - Random Access Memories
    (5, 2),   -- Instant Crush - Random Access Memories
    (6, 2),   -- Lose Yourself to Dance - Random Access Memories
    (7, 3),   -- Don't Know Why - Come Away with Me
    (8, 3),   -- Come Away with Me - Come Away with Me
    (9, 3),   -- Turn Me On - Come Away with Me
    (10, 4),  -- Sunrise - Feels Like Home
    (11, 4),  -- What Am I to You? - Feels Like Home
    (12, 4),  -- Toes - Feels Like Home
    (13, 5),  -- Battery - Master of Puppets
    (14, 5),  -- Master of Puppets - Master of Puppets
    (15, 5),  -- Welcome Home (Sanitarium) - Master of Puppets
    (16, 6),  -- Enter Sandman - Metallica (The Black Album)
    (17, 6),  -- The Unforgiven - Metallica (The Black Album)
    (18, 6),  -- Sad But True - Metallica (The Black Album)
    (19, 7),  -- Over My Dead Body - Take Care
    (20, 7),  -- Take Care - Take Care
    (21, 7),  -- Marvins Room - Take Care
    (22, 8),  -- One Dance - Views
    (23, 8),  -- Hotline Bling - Views
    (24, 8),  -- Controlla - Views
    (25, 9),  -- Umbrella - Good Girl Gone Bad
    (26, 9),  -- Don't Stop the Music - Good Girl Gone Bad
    (27, 9),  -- Shut Up and Drive - Good Girl Gone Bad
    (28, 10),  -- Only Girl (In the World) - Loud
    (29, 10),  -- What's My Name? - Loud
    (30, 10),  -- S&M - Loud;
    (31, 11),  -- Love The Way You Lie - Recovery
    (32, 11),  -- Not Afraid - Recovery
    (33, 11),  -- Cinderella Man - Recovery
    (34, 11);  -- Cold Wind Blows - Recovery