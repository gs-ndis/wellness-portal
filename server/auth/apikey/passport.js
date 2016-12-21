var passport = require('passport');
var LocalAPIKeyStrategy = require('passport-localapikey').Strategy;

exports.setup = function(User, config) {
  passport.use(new LocalAPIKeyStrategy(
    function(apikey, done) {
      User.findOne({apikey: apikey}, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false);
        }
        if (user.hashedPassword) {
          return done('passwordExists', false);
        }
        return done(null, user);
      });
    }
  ));
};
