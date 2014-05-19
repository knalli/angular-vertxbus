<a name="v0.6.0"></a>
## v0.6.0 (2014-05-19)


#### Bug Fixes

* **vertxEventBusProvider:**
  * avoid default options object mutations ([031871cf](http://github.com/knalli/angular-vertxbus/commit/031871cf345cdfc375b5a81c41a2ab1142fb5642))
  * make config functions chainable ([7b02eab6](http://github.com/knalli/angular-vertxbus/commit/7b02eab6124bd5fb5e4b0cd2fe433b1af787ff74))
* **vertxEventBusService:**
  * on registerHandler, return function to unregister this handler ([1f1b6bd7](http://github.com/knalli/angular-vertxbus/commit/1f1b6bd7394ad1a4716db8fc3703a5e9c337b2c2))
  * on unregistering a handler, the callback was called accidently itself ([2dfcd112](http://github.com/knalli/angular-vertxbus/commit/2dfcd1128d250b587496f6fb33d5419cd9b69e29))


#### Features

* **vertxEventBusService:** add opt-in feature buffering messages ([de0e1345](http://github.com/knalli/angular-vertxbus/commit/de0e1345687fa21a94cc40e7b2fef783b312a4b2))

<a name="v0.5.0"></a>
## v0.5.0 (2014-03-17)

#### Breaking changes

All options have been moved into a dedicated options object
`angularVertxBusOptions` which MAY be injected or modified. However, the
new module provider `vertxEventBus` provides shortcuts to all options (6b71de33).

For instance:

```javascript
var app = angular.module('app', ['knalli.vertx-eventbus']
.config(function(vertxEventBus){
  vertxEventBus.useDebug(true).useUrlPath('/eventbus');
});
```

<a name="v0.4.5"></a>
### v0.4.5 (2013-12-24)

<a name="v0.4.4"></a>
### v0.4.4 (2013-12-16)


#### Bug Fixes

* fix issue with $q / typo ([4c455878](http://github.com/knalli/angular-vertxbus/commit/4c4558785b3cf729511909545f7ddf65f92478d8))

<a name="v0.4.3"></a>
### v0.4.3 (2013-12-16)


#### Bug Fixes

* fix another npe ([b1cf79c2](http://github.com/knalli/angular-vertxbus/commit/b1cf79c250e6926bcde916fc848450677f274782))

<a name="v0.4.2"></a>
### v0.4.2 (2013-12-16)


#### Bug Fixes

* fix possible npe if event bus is disabled (was not fixed in 0.4.1) ([15c58325](http://github.com/knalli/angular-vertxbus/commit/15c5832512a1fc1e00fc6ff7e487c172a5178a71))

<a name="v0.4.1"></a>
### v0.4.1 (2013-12-16)


#### Bug Fixes

* fix possible npe if event bus is disabled ([600a0907](http://github.com/knalli/angular-vertxbus/commit/600a0907f556a0ec402b6041a1b1977990c9ffaa))

<a name="v0.4.0"></a>
## v0.4.0 (2013-12-16)


#### Features

* fix use any angularjs 1.2.x ([35b4bc56](http://github.com/knalli/angular-vertxbus/commit/35b4bc56fa5ae035b66ae17c3fc1be2df9b104d6))

<a name="v0.3.0"></a>
## v0.3.0 (2013-12-15)


#### Bug Fixes

* missing repository field in package.json ([1d4e8885](http://github.com/knalli/angular-vertxbus/commit/1d4e88855298f06df91b4237f38f289a576b5f82))

