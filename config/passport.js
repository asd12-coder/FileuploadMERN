var passport = require("passport");
var User = require("../models/userModel");
var LocalStrategy = require("passport-local").Strategy;

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id, { password: 0, email: 0 }, (err, user) => {
    if (err) done(err, null);
    else done(null, user);
  });
});

passport.use(
  "local.signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, email, password, done) {
      User.findOne({ email: email }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, false,{ message: "User already registered" });
        }
        var newUser = new User();

        newUser.email = email;
        newUser.password = newUser.encrpytPassword(password);
        newUser.name = req.body.name;
        newUser.save((err, result) => {
          if (err) return done(err);
          newUser.password = null;
          return done(null, newUser, { message: "successfully registered" });
        });
      });
    }
  )
);

passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, email, password, done) {
      User.findOne({ email: email }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: "User not registered please signup",
          });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: "Password invalid" });
        }

        req.logIn(user, function (err) {
          if (err) {
            return done(err);
          }
          return done(null, user, { message: "login success" });
        });
      });
    }
  )
);
