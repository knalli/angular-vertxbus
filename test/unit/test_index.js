// load all specs into one bundle
var testsContext = require.context('.', true, /spec\.js$/);
testsContext.keys().forEach(testsContext);
