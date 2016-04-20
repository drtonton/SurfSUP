angular
  .module('surfSup')
  .controller('ProfileController', function($scope,$location, FriendService, $routeParams,$rootScope, UserService) {
    $location.path() === "/login" || $location.path() === "/create" ? $rootScope.showBar = false : $rootScope.showBar = true;

    $scope.sendInvite = sendInvite;
    $scope.hideAddButton = hideAddButton;

      // GET FRIENDS PROFILE & RUN HIDE ADD FRIEND BUTTON FUNCTION
      FriendService.getProfile($routeParams.id)
      .then(function(data) {
        $scope.profiles = data.data;
        FriendService.friendsList()
          .success(function(friends){
            var friendsIdList = _.map(friends, function(el) {
              return el.id;
            });
            if(friendsIdList.indexOf(+$routeParams.id) !== -1) {
              hideAddButton();
            } else {
                UserService.currentUser().then(function(data) {
                  $scope.currentUser = data.data;
                  if(+$routeParams.id === $scope.currentUser.id) {
                    hideAddButton();
                  };
                });
              };
          });
      },function(err) {
        console.log("THIS IS AN ERROR",err);
      });

      // HIDE ADD BUTTON ON FRIENDS PROFILE PAGE
      function hideAddButton () {
        console.log('in hide button');
        $scope.dontShowButton = true;
      }

      // SEND INVITATION TO FRIEND
      function sendInvite (username) {
        console.log("send invite is being pressed");
        FriendService.friendInvitation(username)
        .success(function(data) {
          console.log('send invite is working,', data);
        })
        .error (function(err) {
          console.log('this friend has already been invited', err);
          $('#requestFriendAlert').html('<div class="alert alert-danger" role="alert">You have already sent this friend a request.</div>');
        });
      }


  }); // end of FriendController
