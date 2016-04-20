angular
  .module('surfSup')
  .service('WeatherService', function($http) {

    // var key = '05b02278d73272e0e716626de5b875e4';
    // var weatherUrl = 'http://magicseaweed.com/api/' + key + '/forecast/?spot_id=760';
    var weatherUrl = '/weather';
    var tidesUrl = '/tides';

    function getWeather(city) {
      return $http.get(weatherUrl + city);
    }

    function getTides(city) {
      return $http.get(tidesUrl + city);
    }

    return {
      getWeather: getWeather,
      getTides: getTides
    };

  });

   /* Your API details are below:

   IOP id 760

  Key: 05b02278d73272e0e716626de5b875e4
  Secret: 8248d895c72901217ebffc525c305533

  Documentation can be found here: http://magicseaweed.com/developer/forecast-api

  Here's an example URL showing the forecast for Newquay: http://magicseaweed.com/api/05b02278d73272e0e716626de5b875e4/forecast/?spot_id=1 */
