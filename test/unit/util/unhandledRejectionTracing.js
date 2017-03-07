// https://github.com/angular-ui/ui-router/issues/2889#issuecomment-273944742
module.exports = function (angular, module) {

  if (angular.version.minor < 3) {
    // will work w/ AngularJS 1.3+
    return;
  }

  /* jshint ignore:start */
  // Decorate the $q service when app starts
  module.decorator('$q', ['$delegate', function ($delegate) {
    // Create a new promise object
    var promise = $delegate.when();

    // Access the `Promise` prototype (nonstandard, but works in Chrome)
    var proto = promise.__proto__;

    // Define a setter for `$$state` that creates a stacktrace
    // (string) and assigns it as a property of the internal `$$state` object.
    Object.defineProperty(proto, '$$state', {
      configurable : true,
      enumerable : true,
      set : function (val) {
        val.stack = new Error().stack;
        this._$$state = val;
      },
      get : function () {
        return this._$$state;
      }
    });

    return $delegate;
  }]);
  /* jshint ignore:end */
};
