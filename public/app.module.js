var angular = require('angular');
require('angular-route');
require('angular-ui-mask');
require('./xeditable');
require('jquery');
require ('angular-google-maps');
require ('lodash');
require ('angular-simple-logger');
// require('moment');


angular
  .module('surfSup', [
    'ngRoute',
    'ui.mask',
    'xeditable',
    'uiGmapgoogle-maps'
    ])

  .config(function(uiGmapGoogleMapApiProvider, $routeProvider) {
    uiGmapGoogleMapApiProvider.configure({
       key: 'AIzaSyDMEhJv69yLhVNwUj0irIUPSbVCOnXNlYM',
      });
    $routeProvider
      .when('/home', {
        templateUrl: "templates/homepage.html",
        controller: "WeatherController",
      })
      .when('/', {
        redirectTo: '/login'
      })
      .when('/login', {
        templateUrl: "templates/login.html",
        controller: "UserController"
      })
      .when('/create', {
        templateUrl: "templates/createUser.html",
        controller: "UserController"
      })
      .when('/addSession', {
        templateUrl: "templates/addSession.html",
        controller: "SessionController"
      })
      .when('/sessions', {
        templateUrl: "templates/sessions.html",
        controller: "SessionController"
      })
      .when('/friend', {
        templateUrl: "templates/friendsList.html",
        controller: "FriendController"
      })
      .when('/profile/:id/', {
        templateUrl: "templates/profilePage.html",
        controller: "ProfileController"
      })
      .when('/profile', {
        templateUrl: "templates/userProfilePage.html",
        controller: "ProfileController"
      })
      .when('/maptest', {
        templateUrl: "templates/map.html",
        controller: "MapController"
      });
  })
  .run (function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

require('./services/userService');
require('./services/sessionService');
require('./services/friendService');
require('./services/weatherService');
require('./services/cacheEngineService');
require('./controllers/userController');
require('./controllers/sessionController');
require('./controllers/friendController');
require('./controllers/navbar.controller');
require('./controllers/profile.controller');
require('./controllers/weather.controller');
require('./controllers/mapController');
require ('./directives/sessionDirective');
require ('./directives/mapDirective');
