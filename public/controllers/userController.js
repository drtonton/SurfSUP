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



  }); // end of LoginController
