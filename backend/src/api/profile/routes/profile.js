'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/profile', handler: 'profile.me' },
    { method: 'PUT', path: '/profile', handler: 'profile.update' },
  ],
};
