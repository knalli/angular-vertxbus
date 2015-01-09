<a name="0.11.1"></a>
### 0.11.1 (2015-01-09)


#### Bug Fixes

* **service:** fix registering a callback again after disconnect ([483d2ee0](http://github.com/knalli/angular-vertxbus/commit/483d2ee062f8090c0682e8c678d35e7e4485e93b))


<a name="0.11.0"></a>
## 0.11.0 (2014-12-18)


#### Features

* replace console w/ $log ([3c9be73c](http://github.com/knalli/angular-vertxbus/commit/3c9be73c7d41f22b4b46a0dbf17880063bddf7a9))
* **service:** improve memory usage, remove empty arrays of handlers ([4b680026](http://github.com/knalli/angular-vertxbus/commit/4b68002622ac7390584596a4ef0ef1e34088a9b5))


<a name="0.10.0"></a>
## 0.10.0 (2014-12-14)

No functional modifications.

* update internal dependencies and tooling (CoffeeScript 1.8)
* improve debugging using more fn.displayName

#### Package

* provide support range AngularJS 1.2 - 1.3

<a name="v0.9.0"></a>
## v0.9.0 (2014-11-23)


#### Bug Fixes

* **package:** use non minified artifact as 'main' ([72b51654](http://github.com/knalli/angular-vertxbus/commit/72b51654618d6d3e0519845b2a8f35c83b7e9c98), closes [#27](http://github.com/knalli/angular-vertxbus/issues/27))


#### Features

* improve debugger-readibility w/ fn.displayName ([8e5006e7](http://github.com/knalli/angular-vertxbus/commit/8e5006e73ac0bc6d1157ffc4d7d2334ac7b2df4a))
* **componentjs:**
  * add support for componentjs and related builds ([9a763d6f](http://github.com/knalli/angular-vertxbus/commit/9a763d6f90ba2633cae8510e1f0370128b4c7b0b)) ([d748944d](http://github.com/knalli/angular-vertxbus/commit/d748944dae9e10c5332f046904f8a4ee331e6125)) ([2755038e](http://github.com/knalli/angular-vertxbus/commit/2755038ee618f939ee58d78e5cc7642072eb1297))


#### Breaking Changes

* The bower dependency for SockJS has been changed from 'sockjs' to 'sockjs-client' officially supported since https://github.com/sockjs/sockjs-client/commit/3cbe21423e7f2c93f4b6853059f38ae1a7b2a2b2
 ([86b06b6d](http://github.com/knalli/angular-vertxbus/commit/86b06b6d583353965f74bacf2a7995c9830e474d))

<a name="v0.8.1"></a>
### v0.8.1 (2014-10-30)


#### Bug Fixes

* **service:** fix npe if vertxEventBus is disabled (and null) ([7e4be4bb](http://github.com/knalli/angular-vertxbus/commit/7e4be4bb723058b5b1191c3cc9d0f1df3a0b33d5))

<a name="v0.8.0"></a>
## v0.8.0 (2014-10-16)


#### Features

* **service:** use a simple map internally avoiding callbacks issues ([8a5bd54e](http://github.com/knalli/angular-vertxbus/commit/8a5bd54ef33d8cbc90dc139d693e34b3340f70c2))

<a name="v0.7.1"></a>
### v0.7.1 (2014-09-19)

No new features, but a fixed package release.


#### Features

* **tests:** introduce automatic tests against latest AJS 1.2 & 1.3 ([89d6a3d6](http://github.com/knalli/angular-vertxbus/commit/89d6a3d6d63dbd5eab4b7c44188a670b6d1ee9da))


#### Breaking Changes

* The name of the artifact in `dist/` is without version suffix now.
 ([339a6aa3](http://github.com/knalli/angular-vertxbus/commit/339a6aa33d97a3c6a9a4c3ba91c4bb3f07657497))

<a name="v0.7.0"></a>
## v0.7.0 (2014-08-30)


#### Bug Fixes

* **artifact:** (requirejs) add `angular` as a missing dependency ([a566c537](http://github.com/knalli/angular-vertxbus/commit/a566c537a81da5ec9994bbd74e9c2cad21e44ccf))
* **service:**
  * fix service.isValidSession() ([0cbfb105](http://github.com/knalli/angular-vertxbus/commit/0cbfb105f4e9f80247b5e069c78db8a7fadc78f7))
  * Fix issue with registerHandler/unregisterHandler #18 ([e7231850](http://github.com/knalli/angular-vertxbus/commit/e72318507be4649b6c8f7362b559de0b5b08a35a))
  * invalid promise on login (see also #17 & ca65a8d2) ([8e2cd8c8](http://github.com/knalli/angular-vertxbus/commit/8e2cd8c895d4e57a7d038fe4d7ae92ba4a14eede))
* **wrapper:** fix typo in debug message ([0acd99bc](http://github.com/knalli/angular-vertxbus/commit/0acd99bc69d7d403ddb638ba70b5d21eaeb469b9))


#### Features

* **mock:** sockjs mock can emulate a login shake ([3618edef](http://github.com/knalli/angular-vertxbus/commit/3618edef25997e845c95e3afd9a086e32da2a192))
* **service:**
  * breaking change: service.send(addr, data, timeout) ([55716e46](http://github.com/knalli/angular-vertxbus/commit/55716e46796bf51d593671262272d73b74592981))
  * send/publish will additionally check login state ([e16083fa](http://github.com/knalli/angular-vertxbus/commit/e16083faf85d71284048726523c96eb6c0427658))
  * the service handles a login if defined ([7727da73](http://github.com/knalli/angular-vertxbus/commit/7727da73c5426ae69466dd88ff7dd40fa6773762))

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

