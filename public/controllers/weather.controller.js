angular
  .module('surfSup')
  .controller('WeatherController', function($scope, $location, $rootScope, WeatherService) {
    $location.path() === "/login" || $location.path() === "/create" ? $rootScope.showBar = false : $rootScope.showBar = true;

    $scope.getWeatherData = getWeatherData;
    $scope.getTideData = getTideData;
    $scope.isClicked = function(city) {
      console.log('isClicked is being clicked');
      $scope.clicky = city;
    }

    // CITY VARIABLES FOR WEATHER AND TIDE FUNCTIONS
    $scope.pawleys = 'Pawleys'
    $scope.iop = 'IOP';
    $scope.washout = 'Washout';
    $scope.pawley = 'Pawley';

    //GET WEATHER DATA
    function getWeatherData(city) {
      WeatherService.getWeather(city)
        .then(function(data) {
          console.log('in getWeatherData',data);
          $scope.weatherData = data.data;
        });
    }
    getWeatherData($scope.iop);

    //GET TIDE DATA
    function getTideData(city) {
      WeatherService.getTides(city)
        .then(function(data) {
          console.log('in getTideData',data);
          $scope.tideData = data.data.extremes;
        });
    }
    getTideData($scope.iop);


  }); // end of WeatherController
