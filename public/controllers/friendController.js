angular
  .module('surfSup')
  .controller('FriendController', function($scope, $location, FriendService) {

    $scope.searchFriends = searchFriends;

    function searchFriends(friend) {
      console.log('this is a friend', friend);
      FriendService.findFriends(friend);
    }

    FriendService.findFriends()
    .then(function(data) {
      // CacheEngine.put('seshActivity', data);
      $scope.listFriends = data.data;
      window.glow = data;
      console.log('friends list is working,', data);
    });




  }); // end of FriendController
