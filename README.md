1. To get started use "npm i" in the terminal to download all of the packages

2. An env file should be created in the backend folder. It contains the following variables:
DB_USER=yourusername
DB_HOST=localhost
DB_NAME=strictlyalbums
DB_PASSWORD=yourpassword
DB_PORT=5432
JWT_SECRET=jwtpassword
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
PORT=5007
DB_FORCE_SYNC=false

SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET can be found by going on https://developer.spotify.com/
Create an app. You will be given a client_id and client_secret.
Add your localhost to the whitelist

3. To create tables for the database:
in psql createdb strictlyalbums
Go into strictlyalbums in psql
Paste the following:
CREATE TABLE Users (
id SERIAL PRIMARY KEY,
username VARCHAR(255) NOT NULL UNIQUE,
email VARCHAR(255) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
avatar_url VARCHAR(255),
description TEXT,
location VARCHAR(255),
favorite_genres TEXT[] DEFAULT ARRAY[]::TEXT[],
social_links JSONB DEFAULT '{}'::JSONB,
createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

4. To start the server use "npm run dev" in your Terminal
Make sure frontend is also active in order to use site.