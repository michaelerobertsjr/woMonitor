var express = require('express')
  , http = require('http')
  , passport = require('passport')
  , util = require('util')
  , RunKeeperStrategy = require('passport-runkeeper').Strategy
  , config = require('./config');

// Client keys are setup in config file.
var RUNKEEPER_CLIENT_ID = config.rk_id;
var RUNKEEPER_CLIENT_SECRET = config.rk_secret;
var myAccessToken = "";

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete RunKeeper profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the RunKeeperStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and RunKeeper
//   profile), and invoke a callback with a user object.
passport.use(new RunKeeperStrategy({
    clientID: RUNKEEPER_CLIENT_ID,
    clientSecret: RUNKEEPER_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/runkeeper/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
        myAccessToken = "Bearer " + accessToken;
      // To keep the example simple, the user's RunKeeper profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the RunKeeper account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));



var app = express();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
    // The header includes the required access token that was provided 
    // after authentication by runkeeper via passport.
    var options = {
        host: 'api.runkeeper.com',
        path: '/fitnessActivities',
        headers: {
            'Authorization' : myAccessToken,
            'Accept' : '*/*'
        }
    };
    
    // Make another actual request for data.
    http.get(options, function (response) {
        var body = '';
        // Assemble the data in chunks in case it is a lot of data
        // it will be streamed until we reach the end.
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            // log the output to the consolue
            // TODO: parse and display the response data.
            console.log(body);
        });
    }).on('error', function (e) {
        console.log("Got error: " + e.message);
    });

    res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/test', function (req, res) {
    //TODO: Test requests/responses
    res.render('test', { user: req.user });
});  


// GET /auth/runkeeper
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in RunKeeper authentication will involve
//   redirecting the user to runkeeper.com.  After authorization, RunKeeper
//   will redirect the user back to this application at /auth/runkeeper/callback
app.get('/auth/runkeeper',
  passport.authenticate('runkeeper'),
  function(req, res){
    // The request will be redirected to RunKeeper for authentication, so this
    // function will not be called.
  });


// GET /auth/runkeeper/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/runkeeper/callback', 
  passport.authenticate('runkeeper', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3000);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
