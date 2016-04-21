angular
  .module('surfSup')
  .controller('SessionController', function($scope, $location, SessionService, CacheEngine, $rootScope, UserService) {
    console.log("CALLING ALL SESH");
    $location.path() === "/login" || $location.path() === "/create" ? $rootScope.showBar = false : $rootScope.showBar = true;
    $scope.addSesh = addSesh;
    $scope.deleteSession = deleteSession;
    $scope.editSession = editSession;
    $scope.activeButtonSurf = activeButtonSurf;
    $scope.activeButtonSUP = activeButtonSUP;
    $scope.buttonsClicked = false;
    $scope.joinSession = joinSession;
    $scope.allGoingToSesh = allGoingToSesh;
    $scope.location = [];
    $scope.getCurrentUser = getCurrentUser;
    $scope.showMap = showMap;

    // CacheEngine
    // if (CacheEngine.get('seshActivity')){
    //   var cache = CacheEngine.get('seshActivity');
    //   $scope.seshActivity = cache.data;
    //   console.log('cache is working! seshActivity =', cache);
    // }
    // else {

        SessionService.getSession()
        .then(function(data) {
          CacheEngine.put('seshActivity', data);
          $scope.seshActivity = data.data;
        });
    // }

    // addSesh


    function addSesh () {
      console.log("SCOPE LOCATION", $scope.location);
      $scope.sessionObjs = {
        time: $scope.time ? $scope.time.toISOString().slice(0,19) : "",
        isSurf: $scope.suppy,
        //we'll need a LONG and LAT and maybe keep LOCATION for typing in
        location: $scope.location,
        lat: $scope.map.markers[0].coords.latitude,
        lon: $scope.map.markers[0].coords.longitude,
      };
        console.log("session obj", $scope.sessionObjs);
        SessionService.addSession($scope.sessionObjs).then(function(res){
        console.log('session created', res);
        $location.path('/sessions');
        // $scope.$apply();
      });
      // .error(function(err) {
      //   console.log('doh', err);
      //   $('#sessionTime').html('<div class="alert alert-danger" role="alert"><strong>Oh no!</strong> The username and password do not match. Try again.</div>');
      // });
    }

    // addSesh update
    $scope.$on('session:added', function() {
      SessionService.getSession()
      .then(function(data) {
        $scope.seshActivity = data.data;
        console.log('it was added!', data);
        console.log("Markers:, ", $scope.map.markers);
      });
    });

    // deleteSession
    function deleteSession(id) {
      console.log('this is id', id);
      SessionService.deleteSesh(id)
      .then(function(data) {
        var objId = id;
        var objPlace = $scope.seshActivity.findIndex (function(el,idx,arr){
          return el.id === objId;
        });
        $scope.seshActivity.splice (objPlace, 1);
        console.log('deny requests', objPlace);
      });
    }

    //Delete session update
    $scope.$on('session:deleted', function() {
      SessionService.getSession()
      .then(function(data) {
        $scope.seshActivity = data.data;
        console.log('it was deleted!', data);
      });
    });

    // EDIT SESSION
    function editSession(id,location) {
      console.log('location',location);
      SessionService.editSession(id,location);
    }

    //ONLY LET CURRENT USER EDIT SESSION


    //Changing Color when SUP/SURF is clicked
  	$scope.isActiveSurf = false;
    function activeButtonSurf () {
      $scope.buttonsClicked = true;
      $scope.isActiveSurf = !$scope.isActiveSurf;
    }
  	$scope.isActiveSUP = false;
    function activeButtonSUP () {
      $scope.buttonsClicked = true;
      $scope.isActiveSUP = !$scope.isActiveSUP;
    }

    function joinSession(id) {
      console.log('this is joinsession id:', id);
      SessionService.joinSesh(id)
        .then(function() {
          SessionService.getSession()
          .success(function(data) {
            CacheEngine.put('seshActivity', data);
            $scope.seshActivity = data.data;

          })
          .error(function(err) {
            console.log('you are already going to this sesh', err);
            $('.alreadyJoined').html('<div class="alert alert-danger" role="alert"><strong>Oh no!</strong> The username and password do not match. Try again.</div>');
          });
        });
    }

    function allGoingToSesh(id) {
      console.log('new person going to this sesh:', id);
      SessionService.getAllGoingToSesh(id)
        .then(function(data) {
          console.log('all going to sesh in ctrl:', data);
          $scope.usersGoingToSesh = data;
          $scope.usersGoingToSeshLength = data.data.length;
          // console.log('data', data.data.username);
        });
        // .then(function() {
        //   SessionService.getSession()
        //   .then(function(data) {
        //     CacheEngine.put('seshActivity', data);
        //     $scope.seshActivity = data.data;
        //   });
        // })

    }

//GOOGLE MAPS ON ADD SESSIONS PAGE
    $scope.map = {
      center: {
          latitude: 32.7799400,
          longitude:-79.9341970
      },
      zoom: 11,
      markers: [],
      events: {
      click: function (map, eventName, originalEventArgs) {
          $scope.$apply(function(){
          var e = originalEventArgs[0];
          var lat = e.latLng.lat(),lon = e.latLng.lng();
          var marker = {
              id: Date.now(),
              coords: {
                  latitude: lat,
                  longitude: lon
              }
          };
          // $scope.location.push({
          //   lat: lat,
          //   lon: lon
          // });
          console.log("location: ", $scope.location);
          $scope.map.markers.pop(); //only can add one marker
          $scope.map.markers.push(marker);
          console.log('MARKERS:', $scope.map.markers);
          window.glow = $scope.map.markers;
        });
      }
  }
  };

//GOOGLE MAPS ON SESSIONS PAGE

$scope.seshMarkers = [];
function showMap(id,name,type) {

  $scope.modalName = name;
  $scope.modalType = type;
   SessionService.getCoords(id)
   .then(function(response) {
     console.log("show map is working", response);

     var markers = response.data;

     markers.coords = {
      //  idKey: markers.id,
       id: markers.id,
       latitude: markers.lat,
       longitude: markers.lon,
    };

    console.log("marker coords, ", markers );
    $scope.seshMarkers = markers;
    $scope.seshMap = {
        center: {
          latitude: markers.lat,
          longitude: markers.lon},
          zoom: 13
    };
  });
}

// $scope.seshMarkers = [
//                {
//                  idKey: 583187,
//                  latitude: 46.7682,
//                  longitude: -71.3234,
//                  title: "title"
//                }
//              ];

// GET CURRENT USER
  function getCurrentUser() {
    UserService.currentUser().then(function(data) {
      $scope.currentUser = data.data;
      console.log("Current User: ", data.data);
    });
  }
  getCurrentUser();

  $scope.$on('requestAmt:added', function () {
    getCurrentUser();
  });

  }); // end of SessionController
