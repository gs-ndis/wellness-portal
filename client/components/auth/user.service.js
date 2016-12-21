'use strict';

angular.module('wellness')
  .factory('User', function($resource) {
    return $resource('/api/users/:id/:controller', {id: '@_id'}, {
      changePassword: {
        method: 'PUT',
        params: {
          controller: 'password'
        }
      },
      query: {
        method: 'GET',
        isArray: false
      },
      get: {
        method: 'GET',
        params: {
          id: 'me'
        }
      },
      update: {
        method: 'PUT'
      },
      signup: {
        method: 'POST',
        params: {
          controller: 'signup'
        }
      },
      checkSignupToken: {
        method: 'POST',
        params: {
          controller: 'checkSignupToken'
        }
      },
      accept: {
        method: 'PUT',
        params: {
          id: 'me',
          controller: 'accept'
        }
      },
      forgotPassword: {
        method: 'POST',
        params: {
          controller: 'forgotPassword'
        }
      },
      resetPassword: {
        method: 'POST',
        params: {
          controller: 'resetPassword'
        }
      },
      createMailbox: {
        method: 'POST',
        params: {
          controller: 'createMailbox'
        }
      },
      fetchMailboxConfig: {
        method: 'GET',
        params: {
          controller: 'fetchMailboxConfig'
        }
      },
      fetchMailFormatsList: {
        method: 'GET',
        isArray: true,
        params: {
          controller: 'fetchMailFormatsList'
        }
      },
      shareLead: {
        method: 'POST',
        params: {
          controller: 'shareLead'
        }
      },
      updateSharedUser: {
        method: 'PUT',
        params: {
          controller: 'updateSharedUser'
        }
      },
      sharedUsers: {
        method: 'GET',
        isArray: true,
        params: {
          controller: 'sharedUsers'
        }
      },
      removeSharedUser: {
        method: 'DELETE',
        params: {
          controller: 'removeSharedUser'
        }
      },
      sendMessage: {
        method: 'POST',
        params: {
          controller: 'sendMessage'
        }
      },
      getExtensionNumber: {
        method: 'GET',
        params: {
          controller: 'getExtensionNumber'
        }
      },
      activate: {
        method: 'POST',
        params: {
          controller: 'activate'
        }
      }
    });
  });
