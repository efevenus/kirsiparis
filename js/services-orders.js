angular.module('noodlio.services-orders', [])


.factory('OrdersManager', function($q) {
  var self = this;

  self.OrdersData = {}; //cache
  self.OrdersDataArray = [];

  self.getOrders = function(uid) {
    var qGet = $q.defer();
    var ref = new Firebase(FBURL);
    var iter = 0;
    ref.child('orders').child(uid).on("value", function(snapshot) {

      self.OrdersData = snapshot.val();

      // we transform it into an array to handle the sorting
      snapshot.forEach(function(childSnapshot) {
        self.OrdersDataArray[iter] = {
          key: childSnapshot.key(),
          value: childSnapshot.val()
        };
        iter = iter+1;
      });

      qGet.resolve(self.OrdersDataArray);

    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
      qGet.reject(errorObject);
    });
    return qGet.promise;
  };
  
  self.getAllOrders = function() {
    var qGet = $q.defer();
    var ref = new Firebase(FBURL);
    var iter = 0;
    self.totalSales = {nb: 0, value: 0};
    ref.child('orders').on("value", function(snapshot) {

      self.OrdersData = snapshot.val();

      // we transform it into an array to handle the sorting
      snapshot.forEach(function(childSnapshot) {
        // 1
        var userId = childSnapshot.key();
        childSnapshot.forEach(function(subChildSnapshot){
          // 2
          var orderId = subChildSnapshot.key();
          self.OrdersDataArray[iter] = {
            key:    orderId,
            userId: userId,
            value:  subChildSnapshot.val()
          };
          self.totalSales["nb"]     = self.totalSales["nb"] + 1;
          self.totalSales["value"]  = self.totalSales["value"] + self.OrdersDataArray[iter].value.CachedTotal.total_value_incl;
          console.log(self.OrdersDataArray[iter])
          iter = iter+1;
        })
      });
      qGet.resolve(self.OrdersDataArray);
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
      qGet.reject(errorObject);
    });
    return qGet.promise;
  };

  
  
  // get user profile
  self.getUserProfile = function(userId) {
    var qLoad = $q.defer();
    var ref = new Firebase(FBURL);
    //
    ref.child("users").child(userId).on("value", function(snapshot) {
        qLoad.resolve(snapshot.val());
    }, function (errorObject) {
        qLoad.reject(errorObject);
    });
    return qLoad.promise;
  };
  
  

  return self;

});
