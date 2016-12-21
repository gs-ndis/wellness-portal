///* global io */
//'use strict';
//
//angular.module('wellness').factory('socket', function(socketFactory, Auth) {
//
//  // socket.io now auto-configures its connection when we ommit a connection url
//  var ioSocket = io('', {
//    // Send auth token on connection, you will need to DI the Auth service above
//    'query': 'token=' + Auth.getToken(),
//    path: '/socket.io-client'
//  });
//
//  var socket = socketFactory({
//    ioSocket: ioSocket
//  });
//  return socket;
//});
