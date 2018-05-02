DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS grave;
DROP TABLE IF EXISTS cementary;

CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    admin_permit BOOLEAN NOT NULL,
    activated BOOLEAN NOT NULL 
);

CREATE TABLE cementary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT UNIQUE NOT NULL,
    full_address TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL
);

CREATE TABLE grave (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    title TEXT NOT NULL,
    full_name_with_title TEXT NOT NULL,
    date_of_birth TEXT,
    date_of_death TEXT,
    cementary_id INTEGER NOT NULL,
    gps_lon FLOAT,
    gps_lat FLOAT, 
    FOREIGN KEY (cementary_id) REFERENCES cementary (id)
);




