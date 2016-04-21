angular
  .module('surfSup')
  .controller('FriendController', function($scope,$q, $location, FriendService, $rootScope,SessionService) {
    $location.path() === "/login" || $location.path() === "/create" ? $rootScope.showBar = false : $rootScope.showBar = true;

    console.log("WE ARE IN FRIEND CONTROLLER");


    $scope.searchFriends = searchFriends;
    $scope.deleteFriendFromList = deleteFriendFromList;
    // $scope.requestList = requestList;
    $scope.getFriendsList = getFriendsList;

    // SEARCH FRIENDS
    function searchFriends(friend) {
      FriendService.findFriends(friend);
    }

    // GET FRIENDS LIST
    function getFriendsList() {
      FriendService.friendsList()
        .success(function(data){
          console.log("FRINEDS LIST", data);
          $rootScope.myFriends = data.data;
          $rootScope.$broadcast('friendList:added', data.data);
        });
    }
    getFriendsList();

    // FRIENDS LIST AUTO UPDATE
    $scope.$on('friendList:added', function(data) {
      FriendService.friendsList()
      .then(function(data) {
        $scope.friendsList = data.data;
      });
    });

    // FIND FRIENDS (USERS)
    FriendService.findFriends()
    .then(function(data) {
      // CacheEngine.put('seshActivity', data);
      $scope.listUsers = data.data;
      // console.log('users list is working,', data);
    });

    // DELETE FRIEND FROM FRIEND LIST
    function deleteFriendFromList(id) {
        console.log('id of friend to be deleted', id);
        FriendService.deleteFriend(id)
        .then(function(data) {
          console.log('data from delete friend', data);
          var objId = id;
          var objPlace = $scope.friendsList.findIndex (function(el,idx,arr){
            return el.id === objId;
          });
          // $rootScope.friendsList.splice (objPlace, 1);
          // console.log('sessions deleted', objPlace);
      });
      }

      // DELETE FRIEND AUTO UPDATE
      $scope.$on('friend:deleted', function() {
        FriendService.friendsList()
        .then(function(data) {
          $scope.friendsList = data.data;
          // $rootScope.$apply();
        });
      });

      // GET USER PROFILE FOR PROFILE PAGE
      function profilePage(id) {
        console.log('ID', id);
        $location.path('/profile/' + id);
      }

  }); // end of FriendController
