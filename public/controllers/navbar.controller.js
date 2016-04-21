angular
  .module('surfSup')
  .controller('NavbarController', function($scope,$location, $rootScope, FriendService, UserService) {
    $scope.profilePage = profilePage;
    $scope.logout = logout;
    $scope.isLogin = isLogin;
    $scope.getRequestAmt = getRequestAmt;
    // $scope.getFriendsList = getFriendsList;
    $scope.getRequestList = getRequestList;
    $scope.getCurrentUser = getCurrentUser;
    $scope.denyFriendRequest = denyFriendRequest;
    $scope.acceptInvite = acceptInvite;

    // // GET FRIENDS LIST
    // function getFriendsList() {
    //   FriendService.friendsList()
    //     .success(function(data){
    //       console.log("FRINEDS LIST", data);
    //       $rootScope.myFriends = data.data;
    //       $rootScope.$broadcast('friendList:added', data.data);
    //     });
    // }
    // getFriendsList();
    //
    // // FRIENDS LIST AUTO UPDATE
    // $scope.$on('friendList:added', function(data) {
    //   FriendService.friendsList()
    //   .then(function(data) {
    //     $scope.friendsList = data.data;
    //   });
    // });

    // GET REQUEST AMOUNT
    function getRequestAmt() {
      FriendService.requestAmt()
        .then(function(data) {
          $rootScope.requests = data.data;
        });
    }
    getRequestAmt();

    // GET REQUEST LIST
    function getRequestList() {
      FriendService.requestList()
        .success(function(data) {
          $rootScope.requestList = data;
        })
        .error (function(err) {
          console.log(err);
        });
    }
    getRequestList();

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

    $scope.$on('requestAmt:added', function () {
      getCurrentUser();
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

    // GET CURRENT USER
    function getCurrentUser() {
      UserService.currentUser().then(function(data) {
        $scope.currentUser = data.data;
      });
    }
    getCurrentUser();

    // DENY FRIEND REQUEST
    function denyFriendRequest (id) {
      FriendService.denyRequest(id)
        .then(function(data) {
          var objId = id;
          var objPlace = $rootScope.requestList.findIndex (function(el,idx,arr){
            return el.id === objId;
          });
          $rootScope.requestList.splice (objPlace, 1);
          // console.log('sessions deleted', objPlace);
      });
    }

    // ACCEPT FRIEND INVITE
    function acceptInvite (username) {
      console.log(username);
      FriendService.acceptInvitation(username)
      .success(function(data) {
        // console.log('accept friends is working,', data);
        $rootScope.$broadcast('requestAmt:added',data.data);
      })
      .error (function(err) {
        console.log(err);
      });
    }




  }); // end of NavbarControler
