angular
  .module('surfSup')
  .controller('NavbarController', function($scope,$location, $rootScope, FriendService, UserService) {
    $scope.profilePage = profilePage;
    $scope.logout = logout;
    $scope.isLogin = isLogin;

    function isLogin() {
      return $location.path() !== '/login' && $location.path() !== '/create';
    }
    $scope.$on('requestAmt:added', function(data) {
      FriendService.requestAmt();
      FriendService.requestList()
      .then(function(data) {
        $rootScope.requests = data.data;
        $rootScope.requestList = data.data;
        // $rootScope.$apply();
      });
    });
    $scope.$on('requestAmt:added', function(data) {
      FriendService.requestAmt()
      .then(function(data) {
        $rootScope.requests = data.data;
        // $rootScope.$apply();
      });
    });
    function profilePage(id) {
      console.log('ID', id);
      $location.path('/profile/' + id);
    }
    function logout() {
      UserService.logoutUser();
      console.log('logging out');
      $location.path('/login');
    }


  }); // end of NavbarControler
