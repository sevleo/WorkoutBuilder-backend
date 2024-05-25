const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oidc");
// const FacebookStrategy = require("passport-facebook");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // console.log("test");
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL: "/oauth2/redirect/google",
      scope: ["profile"],
    },

    async (issuer, profile, done) => {
      try {
        // console.log(issuer);
        // console.log(profile);
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = new User({
            username: profile.displayName,
            googleId: profile.id,
            creationDate: new Date(),
            type: "google",
          });
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env["FACEBOOK_CLIENT_ID"],
//       clientSecret: process.env["FACEBOOK_CLIENT_SECRET"],
//       callbackURL: "/oauth2/redirect/facebook",
//       state: true,
//     },

//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ facebookId: profile.id });
//         console.log(profile);
//         if (!user) {
//           user = new User({
//             username: profile.displayName,
//             facebookId: profile.id,
//             creationDate: new Date(),
//             type: "facebook",
//           });
//           await user.save();
//         }
//         return done(null, user);
//       } catch (error) {
//         return done(error);
//       }
//     }
//   )
// );

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

module.exports = passport;
