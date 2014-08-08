[![Stories in Ready](https://badge.waffle.io/michaelerobertsjr/woMonitor.png?label=ready&title=Ready)](https://waffle.io/michaelerobertsjr/woMonitor)
# woMonitor

[woMonitor](https://github.com/jaredhanson/passport) strategy for authenticating
with [RunKeeper](http://runkeeper.com/) using the OAuth 2.0 API.

This module lets you view your activities from RunKeeper, using the HealthGraph API.

## Install

    $ npm install

## Usage

#### Configure

The app uses the Runkeeper-Passport lib, and authenticates users using a
RunKeeper account and OAuth 2.0 tokens.  It requires a `verify` callback,
which accepts these credentials and calls `done` providing a user, as well
as `options` specifying a client ID, client secret, and callback URL.

    passport.use(new RunKeeperStrategy({
        clientID: RUNKEEPER_CLIENT_ID,
        clientSecret: RUNKEEPER_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/runkeeper/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ runkeeperId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

## Credits

Runkeeper-Passport library was created by [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Runkeeper-Passport Copyright (c) 2011-2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>

woMonitor Copyright (c) 2014 Michael E Roberts Jr <[http://merobertsjr.us/](http://merobertsjr.us/)>
