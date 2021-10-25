## Summary of Server
* Including database with table of users, songs, and favorites as a replationship used for users to add songs as favorites
* Routes includes auths, users, and songs used to handle the request from client side and return the responses
* Songs route is also used to fetch and handle the data from the third part API, which is Apple Music API in this applicaion
* Middleware can be used to authenticate an user, ensure the user tries to log in is the correct one, or ensure the user is authorized 
* Schema is used to validate the input data
* For more details, also check the front end link: https://github.com/daxiaokongyi/imusicfrontend

## Testing
* psql < music_test.sql
* npm run test

## Install the packages
* npm install

## Create Database
* psql < music.sql

### Github link: 
    https://github.com/daxiaokongyi/imusicbackend
### API: 
    https://developer.apple.com/documentation/applemusicapi/
### Website Link:
    https://boiling-scene.surge.sh/