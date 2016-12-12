var express = require('express');
var passport = require('passport');
// var Strategy = require('passport-facebook').Strategy;
var Strategy = require('passport-google-oauth20').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var users = require('./db/users.js');


var googleId = '758299757620-r484urkkrfemnrmq41urash7n0mclt83.apps.googleusercontent.com';
var googleSecret = 'QZNUUmJ2B7mWOMXTBV3UWfRB';

//for google-oauth2
passport.use(new Strategy({
        clientID: googleId || process.env.CLIENT_ID,
        clientSecret: googleSecret || process.env.CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/login/google/callback'
    },
    function (accessToken, refreshToken, profile, cb) {
        return cb(null, profile);
    }));


//local login
passport.use(new LocalStrategy(function (username, password, done) {

//look for user in user list
    var user = users.find(function (u) {
        return (u.user_name.toLowerCase() === username.toLowerCase() && u.password.toLowerCase() === password.toLowerCase() );
    });

    if (!user) {

        return done(null, false, {message: 'Username or Password incorrect'});
    } else {
        return done(null, user);
    }


}));


passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('express-session')({secret: 'keyboard cat', resave: true, saveUninitialized: true}));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
    function (req, res) {
        res.render('home', {user: req.user});
    });

app.get('/login',
    function (req, res) {
        res.render('login');
    });

app.get('/login/google',
    // passport.authenticate('google',{scope:['profile']});
    passport.authenticate('google', {scope: ['profile']}));

app.get('/login/google/callback',
    passport.authenticate('google', {failureRedirect: '/login'}),
    function (req, res) {
        res.redirect('/');
    });


//local login
app.post('/local_login',
    passport.authenticate('local', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlush: true
    }));


app.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        res.render('profile', {user: req.user});
    });

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
})


app.listen(3000);
