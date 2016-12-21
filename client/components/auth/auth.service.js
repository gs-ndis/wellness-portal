'use strict';

angular.module('wellness')
  .factory('Auth', function Auth($location, $rootScope, $http, User, ipCookie, $stateParams) {
    var currentUser = {};

    var getPermissions = function() {
      $rootScope.permissions = (currentUser._role ? currentUser._role.permissions : currentUser.permissions) || {};
      return $rootScope.permissions;
    };

    var setCurrentUser = function(user) {
      currentUser = user;
      getPermissions();
    };

//    if (ipCookie('token')) {
//      currentUser = User.get(function(user) {
//        setCurrentUser(user);
//      }, function(result) {
//        if (result.status === 423) {
//          setCurrentUser(result.data);
//        }
//      });
//    }
    var roles = ['guest', 'contact', 'user', 'manager', 'admin'];

    return {
      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      login: function(user, callback) {
        var cb = callback || angular.noop;

        return $http.post('/auth/local', {
          email: user.email,
          password: user.password
        }).then(function(result) {
          var data = result.data;
          ipCookie('token', data.token, {expires: 30});
          currentUser = User.get();

          return currentUser.$promise.then(function(user) {
            setCurrentUser(user);
            $rootScope.$emit('leadUpdated', {});
            cb();
            return data;
          }, function(result) {
            if (result.status === 423) {
              setCurrentUser(result.data);
            }
            cb();
            return result.data;
          });
        },
          function(err) {
            this.logout();

            cb(err && err.data ? err.data : err);

            throw err && err.data ? err.data : err;
          }.bind(this));
      },
      loginApiKey: function(apikey, callback) {
        var cb = callback || angular.noop;

        return $http.post('/auth/apikey', {
          apikey: apikey
        }).then(function(result) {
          var data = result.data;
          ipCookie('token', data.token, {path: '/'});
          currentUser = User.get();

          return currentUser.$promise.then(function(user) {
            setCurrentUser(user);
            $rootScope.$emit('leadUpdated', {});
            cb();
            return user;
          }, function() {
            cb();
            return data;
          });
        },
          function(err) {
            this.logout();

            cb(err && err.data ? err.data : err);

            throw err && err.data ? err.data : err;
          }.bind(this));
      },
      /**
       * Delete access token and user info
       *
       * @param  {Function}
       */
      logout: function() {
        ipCookie.remove('token');
        setCurrentUser({});
        delete $rootScope.currentUser;
        delete $rootScope.pendingUser;
      },
      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      createUser: function(user, callback) {
        var cb = callback || angular.noop;

        return User.signup({token: $stateParams.token}, user,
          function(data) {
            ipCookie('token', data.token, {expires: 30});
            currentUser = User.get(function(user) {
              setCurrentUser(user);
            }, function(result) {
              if (result.status === 423) {
                setCurrentUser(result.data);
              }
            });
            setCurrentUser(currentUser);
            return cb(user);
          },
          function(err) {
            this.logout();
            return cb(err);
          }.bind(this)).$promise;
      },
      activateUser: function(user, callback) {
        var cb = callback || angular.noop;
        return User.activate({token: $stateParams.token}, user,
          function(data) {
            ipCookie('token', data.token, {expires: 30});
            currentUser = User.get(function(user) {
              setCurrentUser(user);
            }, function(result) {
              if (result.status === 423) {
                setCurrentUser(result.data);
              }
            });
            setCurrentUser(currentUser);
            return cb(user);
          },
          function(err) {
            this.logout();
            return cb(err);
          }.bind(this)).$promise;
      },
      /**
       * Change password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
      changePassword: function(oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;

        return User.changePassword({id: currentUser._id}, {
          oldPassword: oldPassword,
          newPassword: newPassword
        }, function(user) {
          return cb(user);
        }, function(err) {
          return cb(err);
        }).$promise;
      },
      /**
       * Gets all available info on authenticated user
       *
       * @return {Object} user
       */
      getCurrentUser: function() {
        return currentUser;
      },
      updateCurrentUserAsync: function() {
        currentUser = User.get();
        return currentUser.$promise.then(function(user) {
          setCurrentUser(user);
          $rootScope.$emit('leadUpdated', {});
          return;
        }, function(result) {
          if (result.status === 423) {
            setCurrentUser(result.data);
          }
          return result.data;
        });
      },
      setCurrentUser: setCurrentUser,
      /**
       * Check if a user is logged in
       *
       * @return {Boolean}
       */
      isLoggedIn: function() {
        return currentUser.hasOwnProperty('role');
      },
      /**
       * Waits for currentUser to resolve before checking if user is logged in
       */
      isLoggedInAsync: function(cb) {
        if (currentUser.hasOwnProperty('$promise')) {
          currentUser.$promise.then(function() {
            $rootScope.currentUser = currentUser;
            cb(true);
          }).catch(function(result) {
            if (result.status === 423) {
              $rootScope.pendingUser = true;
              cb(false);
              return;
            }
            cb(false);
          });
        } else if (currentUser.hasOwnProperty('role')) {
          $rootScope.currentUser = currentUser;
          cb(true);
        } else {
          cb(false);
        }
      },
      isPending: function() {
        return currentUser.active === false;
      },
      /**
       * Check if a user is an admin
       *
       * @return {Boolean}
       */
      isAdmin: function() {
        return currentUser.role === 'admin';
      },
      /**
       * Check if user has requried role
       * @param {String} roleRequired
       * @returns {Boolean}
       */
      hasRole: function(roleRequired) {
        return roles.indexOf(currentUser.role) >= roles.indexOf(roleRequired);
      },
      hasAccess: function(permissionsRequired) {
        return _.get(getPermissions(), permissionsRequired);
      },
      hasAnyAccess: function(permissionsRequired) {
        return _.find(permissionsRequired, function(required) {
          return _.get(getPermissions(), required);
        });
      },
      getHomepage: function() {
        return currentUser.homepage || '/';
      },
      /**
       * Get auth token
       */
      getToken: function() {
        return ipCookie('token');
      },
      /**
       * Get Permissions asynchronously
       */
      getPermissions: getPermissions,
      /**
       * Get Permissions asynchronously
       */
      getPermissionsAsync: function() {
        var promise = currentUser.$promise || Promise.resolve();

        return promise.then(function() {
          return getPermissions();
        });
      }
    };
  });
