// 8-3-17
// This file sets up the port and listener for the server, as well as defines server configuration
// Routing is done in ./responseHandler.js
var express = require('express');
var bodyparser = require('body-parser');
var handler = require('./responseHandler.js');
var path = require('path');
var passport = require('./passport.js')
var browserify = require('browserify-middleware');
var cors = require('cors');
var session = require('express-session');

var app = express();

//set static folders
app.use(express.static('static'));

//open CORS
app.use(cors());
//parse incoming data as JSON
app.use(bodyparser.json());
//start a local session
app.use(session({
	secret: 'mrspancakes',
}));
//start passport and tell it to use the local session
app.use(passport.initialize());
app.use(passport.session());


//Routing
//create bundle file for HTML
app.get('/bundle.js', browserify('./client/index.js', {
  transform: [ [ require('babelify'), { presets: [ 'es2015', 'react' ] } ] ]
}));

//root route - feed the static files
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../static/', 'index.html'));
});

//Passport's google auth link. Sends API scopes to Google
app.get('/auth/google',
	passport.authenticate('google', { accessType: 'offline', scope: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/plus.login', 'email'] })
);

app.get('/auth/google/other',
	passport.authenticate('google', { accessType: 'offline', scope: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/plus.login', 'email'], prompt: 'select_account' })
);

//The Google automatically hits this callback URL (as defined in passport.js)
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
  	res.redirect('/');
  }
);

//Simple auth which makes the user be logged in before being allowed to do any calls in the app
function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
        // next();
    }
}

//ROUTES
app.get('/session', loggedIn, (req,res) => {
	res.status(200).send(req.session);
});

//adds or creates a new user based on email address
app.get('/users/user/:email', loggedIn, handler.addOrFindUser);

//creates a new Group associated to the current user
app.post('/groups/create', loggedIn, handler.createGroup);

//gets all of the (non-Contact) groups for a user
//userid = user._id
app.get('/groups/user/:userid', loggedIn, handler.getGroups);

//gets the Contact List for a user
app.get('/contacts/user/:userid', loggedIn, handler.getContactGroup);

//adds a contact(user record) to a Group
app.post('/groups/user/add', loggedIn, handler.addToGroup);

//removes a contact(user record) from a Group
app.post('/groups/user/remove', loggedIn, handler.removeFromGroup);

//deletes a Group from the database
app.post('/groups/delete', loggedIn, handler.deleteGroup);

//pulls a new Access Token for a User and saves the token to the user record, returns that user
app.get('/users/reauth/:userid', loggedIn, handler.reauth);

//destroys the session and logs the user out
app.get('/logout', handler.logout);

//set the port for the server to be either the environment port var or 8000
var port = process.env.PORT || 8000;

app.listen(port, () => {
	console.log('Open on port: ',port);
});
