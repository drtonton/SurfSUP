angular
  .module('surfSup')
  .controller('UserController', function($scope, $location, UserService, $rootScope, WeatherService) {
    $location.path() === "/login" || $location.path() === "/create" ? $rootScope.showBar = false : $rootScope.showBar = true;
    $scope.loginObj = {
      username: '',
      password: ''
    };
    $scope.login = login;
    $scope.acctObj = {};
    $scope.submitForm = submitForm;
    $scope.getWeatherData = getWeatherData;
    $scope.getTideData = getTideData;
    $scope.getCurrentUser = getCurrentUser;


    // LOGIN PAGE
    function login() {
      console.log('login object:', $scope.loginObj);
      UserService.loginUser($scope.loginObj).success(function (res) {
        $rootScope.$broadcast('requestAmt:added');
        console.log('we can redirect here if so', res);
        $location.path('/home');
      })
      .error(function (err) {
        console.log('doh');
        $('#userNameAlert').html('<div class="alert alert-danger" role="alert"><strong>Oh no!</strong> The username and password do not match. Try again.</div>');
      });
    }

    // CREATE USER FORM
    function submitForm() {
      console.log('account object:', $scope.acctObj);
      UserService.addAcct($scope.acctObj).success(function(res){
        console.log('create works');
        $location.path('/home');
      })
      .error (function (err) {
        console.log('create not working');
      });
    }

    // GET CURRENT USER
    function getCurrentUser() {
      UserService.currentUser().then(function(data) {
        $scope.currentUser = data.data;
      });
    }
    getCurrentUser();

    $scope.$on('requestAmt:added', function () {
      getCurrentUser();
    });

    // CITY VARIABLES FOR WEATHER AND TIDE FUNCTIONS
    $scope.pawleys = 'Pawleys'
    $scope.iop = 'IOP';
    $scope.washout = 'Washout';
    $scope.pawley = 'Pawley';

    //GET WEATHER DATA
    function getWeatherData(city) {
      WeatherService.getWeather(city)
        .then(function(data) {
          console.log(data);
          // window.glob = data.data;
          $scope.weatherData = data.data;
        });
    }
    getWeatherData($scope.iop);

    //GET TIDE DATA
    function getTideData(city) {
      console.log('in getTideData', city);
      WeatherService.getTides(city)
        .then(function(data) {
          console.log('tide data',data, 'city ', city);
          window.glob = data.data.extremes;
          $scope.tideData = data.data.extremes;
        });
    }
    getTideData($scope.iop);


  }); // end of LoginController
