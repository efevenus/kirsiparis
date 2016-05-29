angular.module('noodlio.services-settings', [])

.factory('Settings_Fees', function($q) {
  /**
  * List of pre-defined fees
  */
  var self = this;
  self.all = {};
  self.get = function() {
    var qCat = $q.defer();
    var ref = new Firebase(FBURL);
    //
    //console.log(filterNode, filterValue, limitValue)
    ref.child('settings').child("fees").on("value", function(snapshot) {
        self.all = snapshot.val();
        qCat.resolve(snapshot.val());
    }, function (errorObject) {
        qCat.reject(errorObject);
    });
    return qCat.promise;
  };
  
  self.set = function(FeesObj) {
    var qCat = $q.defer();
    var ref = new Firebase(FBURL);
    var onComplete = function(error) {
      if (error) {
          qCat.reject(error);
      } else {
          qCat.resolve();
      }
    };
    ref.child('settings').child("fees").set(FeesObj, onComplete);
    return qCat.promise;
  };
  
  return self;
});