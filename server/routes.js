/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var auth = require('./auth/auth.service');
var errorSender = require('./util/errorSender');
var errorHandler = require('errorhandler');
var config = require('./config/environment');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/users', require('./api/user'));
  app.use('/api/surveys', require('./api/survey'));
  app.use('/api/results', require('./api/result'));

  app.use('/auth', require('./auth'));
  app.use(function(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      console.log('UnauthorizedError:', err.message);
      res.status(401).send('UnauthorizedError: ' + err.message);
    } else {
      if (config.env !== 'development' && config.env !== 'test') {
        errorSender.handleError(res, err);
      } else {
        errorHandler()(err, req, res, next);
      }
    }
  });
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*').get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
