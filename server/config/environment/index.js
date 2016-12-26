'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

var localConfig;
try {
  localConfig = require('../local.env');
} catch (e) {
  localConfig = {};
}
//special test env
if (process.env.NODE_ENV === 'test') {
  localConfig = {};
}

// All configurations will extend these options
// ============================================
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

var all = {
  env: process.env.NODE_ENV,
  // Root path of server
  root: path.normalize(__dirname + '/../../..'),
  contentfulFilePath: path.normalize(__dirname + '/../../../tmp/contentful.data.json'),
  //path to mongodb backups folder. for restore backup we can use https://github.com/hex7c0/mongodb-restore-cli
  backupFolder: path.normalize(__dirname + '/../../../mongodb_backups'),
  // Server port
  port: process.env.PORT || 9000,
  // Should we populate the DB with sample data?
  seedDB: false,
  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: '19f6d9ed40xyolmYnc2S',
    callbackRegistration: '9ec0d5f0501b481fb0692b97d9459abb'
  },
  // List of user roles
  userRoles: ['guest', 'user', 'admin'],
  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },
  facebook: {
    clientID: process.env.FACEBOOK_ID || 'id',
    clientSecret: process.env.FACEBOOK_SECRET || 'secret',
    callbackURL: (process.env.DOMAIN || '') + '/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_ID || 'id',
    clientSecret: process.env.TWITTER_SECRET || 'secret',
    callbackURL: (process.env.DOMAIN || '') + '/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || 'id',
    clientSecret: process.env.GOOGLE_SECRET || 'secret',
    callbackURL: (process.env.DOMAIN || '') + '/auth/google/callback'
  },
  signupSessionSecret: 'Signup secret key',
  loginTimeout: 60 * 24 * 30, // 30 days
  requestTimeout: 15000, // default 15000 milliseconds
  unsubscribeSecretKey: 'Unsubscribe secret key',
  cron: {
    /**
     * https://github.com/ncb000gt/node-cron#cron-ranges
     * Seconds: 0-59
     * Minutes: 0-59
     * Hours: 0-23
     * Day of Month: 1-31
     * Months: 0-11
     * Day of Week: 0-6
     */
    refreshContentfulCache: '0 0 */1 * * *', // every 60 minutes
  },
  recaptchaSiteKey: '6LcX1w8UAAAAAMRo6GiCBiG40D_PzJGZ-gkRMRJQ',
  recaptchaSecretKey: '6LcX1w8UAAAAAK5Iepk0shDY-7FyY9kotAWwsRqf'
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + (process.env.NODE_ENV || 'development') + '.js') || {},
  localConfig);
