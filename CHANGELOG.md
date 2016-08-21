<a name="6.1.1"></a>
## [6.1.1](https://github.com/knalli/angular-vertxbus/compare/6.1.0...v6.1.1) (2016-08-21)


### Bug Fixes

* **service:** add missing hasOwnProperty check ([834f95f](https://github.com/knalli/angular-vertxbus/commit/834f95f)), closes [#212](https://github.com/knalli/angular-vertxbus/issues/212)



<a name="6.1.0"></a>
# [6.1.0](https://github.com/knalli/angular-vertxbus/compare/6.0.0...v6.1.0) (2016-07-17)



<a name="6.0.0"></a>
# [6.0.0](https://github.com/knalli/angular-vertxbus/compare/5.0.0...v6.0.0) (2016-04-01)


### Bug Fixes

* **service:** ensure authHandler will be invoked on each request ([e692d36](https://github.com/knalli/angular-vertxbus/commit/e692d36))
* **service:** fix several serious invalid api signatures and docs #157 ([bf773fa](https://github.com/knalli/angular-vertxbus/commit/bf773fa)), closes [#157](https://github.com/knalli/angular-vertxbus/issues/157)

### Features

* **adapter:** introduce `vertxEventBus.applyDefaultHeaders(headers)` ([ced8e74](https://github.com/knalli/angular-vertxbus/commit/ced8e74))
* **demo:** add demo demostrating using headers and authHandler ([5a9345e](https://github.com/knalli/angular-vertxbus/commit/5a9345e))
* **dependencies:** allow vertx3-eventbus patch updates by spec ([9b7d437](https://github.com/knalli/angular-vertxbus/commit/9b7d437))
* **service:** internal ensure*Connection handlers returning promises now ([551f5c3](https://github.com/knalli/angular-vertxbus/commit/551f5c3))
* **service:** introduce authHandler ([0e8e036](https://github.com/knalli/angular-vertxbus/commit/0e8e036))


### BREAKING CHANGES

* service: The return of `vertxEventBusService.publish()` has changed from boolean to Promise (just like `send()` already).
* service: The argument `failureHandler` of `EventBus.send()` has been removed

This callback has been obsolete since vertx-eventbus 3.1.0+.
Solves #152
* service: Remove fallback in signatures again. `headers` is not skipable anymore.



<a name="5.0.0"></a>
# [5.0.0](https://github.com/knalli/angular-vertxbus/compare/4.0.0...v5.0.0) (2016-03-25)


### Features

* **bundle:** migrate tooling to webpack ([74c6100](https://github.com/knalli/angular-vertxbus/commit/74c6100))
* **service:** add support for headers (supported since vertxbus v3.1) ([1881de1](https://github.com/knalli/angular-vertxbus/commit/1881de1))


### BREAKING CHANGES

* service: The signature of `vertxEventBus.send()` has been changed!

Before, it was `address, message, replyHandler, failureHandler`. This has been changed to `address, message, headers, replyHandler, failureHandler`. Note the additional `headers`.

Actually, all method signatures of `vertxEventBus` and `vertxEventBusService` for sending, publishing, and registering/unregistering handlers have been changed to match the optional `headers` introduced in EventBus 3.1. But only in case of `.send()` it has a broken signature.



<a name="4.0.0"></a>
# [4.0.0](https://github.com/knalli/angular-vertxbus/compare/3.2.1...v4.0.0) (2016-02-13)


### Features

* upgrade baseline to Vert.x 3.2 (breaking changes) ([e06515b](https://github.com/knalli/angular-vertxbus/commit/e06515b))
* **adapter:** add support for `EventBus.onerror` ([5e93cde](https://github.com/knalli/angular-vertxbus/commit/5e93cde))
* **service:** add support for `failureHandler` on send ([bbec54c](https://github.com/knalli/angular-vertxbus/commit/bbec54c))
* **service:** add support for new `type=err` messages ([54c4b2b](https://github.com/knalli/angular-vertxbus/commit/54c4b2b))


### BREAKING CHANGES

* Due insuffcient support and breaking things, the feature `login` has been removed completely. It will come back supporting login on connect providers as well (i.e. JWT over BasicAuth).
* Due upgrading to Vert.x 3.2 (incl. 3.1), several things changed internally. Be aware of https://github.com/vert-x3/wiki/wiki/3.2.0-Breaking-changes
* Since Vert.x 3.1, the dependency has changed `vertx3bus` => `vertx-eventbus`. Also the file name itself has changed.
* Since Vert.x 3.1, the `EventBus` is a global now. No `vertx.` anymore.
* Since Vert.x 3.1, the message payload of a receiving message has changed being closer to NodeJS apis. The `vertxEventBusService` will handle this correct without a change, but `vertxEventBus` has changed the signature being compliant: `register('address', callback({address, message}))` => `register(callback(err, {address, message}))`



<a name="3.2.1"></a>
## [3.2.1](https://github.com/knalli/angular-vertxbus/compare/3.2.0...v3.2.1) (2016-01-24)


### Bug Fixes

* **adapter:** fix invalid delegating of SockJS.options ([43b93aa](https://github.com/knalli/angular-vertxbus/commit/43b93aa)), closes [#107](https://github.com/knalli/angular-vertxbus/issues/107)

### Features

* **build:** update test scope "AJS 1.5" using rc0 ([10ef138](https://github.com/knalli/angular-vertxbus/commit/10ef138))



<a name="3.2.0"></a>
# [3.2.0](https://github.com/knalli/angular-vertxbus/compare/3.1.0...v3.2.0) (2015-10-31)


### Bug Fixes

* **docs:** Fix invalid params descriptions ([1f85e52](https://github.com/knalli/angular-vertxbus/commit/1f85e52))
* **test:** fix incorrect redelcaration of a block scope variable ([6aa9572](https://github.com/knalli/angular-vertxbus/commit/6aa9572))
* **test:** fix internal babel-node scriptlets ([2acde13](https://github.com/knalli/angular-vertxbus/commit/2acde13))

### Features

* **adapter:** overload signature of EB.connect() returning promise ([df7cf0d](https://github.com/knalli/angular-vertxbus/commit/df7cf0d)), closes [#90](https://github.com/knalli/angular-vertxbus/issues/90)
* **build:** add .babelrc ([ce49603](https://github.com/knalli/angular-vertxbus/commit/ce49603))



<a name="3.1.0"></a>
# [3.1.0](https://github.com/knalli/angular-vertxbus/compare/3.0.2...v3.1.0) (2015-10-25)


### Bug Fixes

* **build:** fix invalid license header in artifacts' headers ([f0597fb](https://github.com/knalli/angular-vertxbus/commit/f0597fb))

### Features

* **wrapper:** introduce `.disableAutoConnect()` #71 ([ce3a0af](https://github.com/knalli/angular-vertxbus/commit/ce3a0af))



<a name="3.0.2"></a>
## [3.0.2](https://github.com/knalli/angular-vertxbus/compare/3.0.1...v3.0.2) (2015-10-08)


### Features

* **linting:** switch from JSHint to ESLint ([b70eea8](https://github.com/knalli/angular-vertxbus/commit/b70eea8))



<a name="3.0.1"></a>
## [3.0.1](https://github.com/knalli/angular-vertxbus/compare/3.0.0...v3.0.1) (2015-10-01)

### No functional changes

* This update changes only internals, structures and internal dependencies (patch only).


<a name="3.0.0"></a>
# [3.0.0](https://github.com/knalli/angular-vertxbus/compare/2.0.4...v3.0.0) (2015-08-29)


### Bug Fixes

* **package:** fix license attribute in package.json ([72dc32c](https://github.com/knalli/angular-vertxbus/commit/72dc32c))

### Features

* **compatiblity:** replace the dependencies sockjs/vertxbus to latest ([f56b4a6](https://github.com/knalli/angular-vertxbus/commit/f56b4a6)), closes [#42](https://github.com/knalli/angular-vertxbus/issues/42) [#61](https://github.com/knalli/angular-vertxbus/issues/61)
* **dependencies:** update internal (dev) dependency AJS 1.2 -> 1.4 ([57d07f5](https://github.com/knalli/angular-vertxbus/commit/57d07f5))
* **e2e test:** fix installing/configuration of e2e vertx3 server ([c3413fe](https://github.com/knalli/angular-vertxbus/commit/c3413fe))
* **provider:** add support for custom auth/login interceptor ([bc5f814](https://github.com/knalli/angular-vertxbus/commit/bc5f814))
* **wrapper:** add support for `eventbus.send()` arg `failureHandler` ([2f418bd](https://github.com/knalli/angular-vertxbus/commit/2f418bd))
* **wrapper:** recognize missing vertx.EventBus.login(), improve usage ([7c3bd49](https://github.com/knalli/angular-vertxbus/commit/7c3bd49))


### BREAKING CHANGES

* Since Vert.x 3 there is a dedicated bower dependency called `vertx3-eventbus-client` [available](https://github.com/vert-x3/vertx-bus-bower). This one will replace the old legacy one.
Additionally, this commit replaces the dependency for sockjs-client@0.3.4 in favor of the latest sockjs-client@1.0.3


<a name="2.0.4"></a>
## [2.0.4](https://github.com/knalli/angular-vertxbus/compare/2.0.3...2.0.4) (2015-06-22)


### Bug Fixes

* **service:** remove invalid debug console ([333520b](https://github.com/knalli/angular-vertxbus/commit/333520b))



<a name="2.0.3"></a>
## [2.0.3](https://github.com/knalli/angular-vertxbus/compare/2.0.2...2.0.3) (2015-06-22)


### Bug Fixes

* **demo:** Replace CoffeeScript w/ BabelJS runner ([4dc71a0](https://github.com/knalli/angular-vertxbus/commit/4dc71a0))
* **service:** fix doubled handler registration in special circumstances ([f3311ca](https://github.com/knalli/angular-vertxbus/commit/f3311ca))



<a name="2.0.2"></a>
## [2.0.2](https://github.com/knalli/angular-vertxbus/compare/2.0.1...2.0.2) (2015-06-15)


### Features

* **artifact:** provide a variant with polyfill included ([98e17aa](https://github.com/knalli/angular-vertxbus/commit/98e17aa))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/knalli/angular-vertxbus/compare/2.0.0...2.0.1) (2015-06-10)


### Bug Fixes

* **wrapper:** fix npe `Cannot read property 'CLOSED' of undefined` ([e369a7a](https://github.com/knalli/angular-vertxbus/commit/e369a7a))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/knalli/angular-vertxbus/compare/1.1.4...2.0.0) (2015-06-02)


### Bug Fixes

* **service:** fix possible internal npe on de-register ([53e5cfb](https://github.com/knalli/angular-vertxbus/commit/53e5cfb))



<a name="1.1.4"></a>
## [1.1.4](https://github.com/knalli/angular-vertxbus/compare/2.0.0-beta.6...1.1.4) (2015-05-01)


### Bug Fixes

* **service:** fix possible internal npe on de-register (also as 913ac74) ([6aa86bc](https://github.com/knalli/angular-vertxbus/commit/6aa86bc))

### Features

* **service:** change signature of <service>.send() #51 ([7534034](https://github.com/knalli/angular-vertxbus/commit/7534034))


### BREAKING CHANGES

* The arguments of vertxEventBusService.send() have
been restructured.
Instead of `send(address, message, timeout, expectReply)` it is now
`send(address, message, {timeout, expectReply})`.
Reasons for this improvement of api:
1. Both `address` and `message` are required, but the other ones are only
optional.
2. Long arguments are not a good api design
3. Using default timeout does not require an `undefined` argument or
even a missplaced `null` or `0`.


<a name="1.1.3"></a>
## [1.1.3](https://github.com/knalli/angular-vertxbus/compare/1.1.2...1.1.3) (2015-04-14)


### Bug Fixes

* **service:** after a reconnect the deconstructor does not work anymore ([5ebbfc4](https://github.com/knalli/angular-vertxbus/commit/5ebbfc4))



<a name="1.1.2"></a>
## [1.1.2](https://github.com/knalli/angular-vertxbus/compare/1.1.1...1.1.2) (2015-04-13)


### Bug Fixes

* **service:** fix edge case when deconstructor invoked multiple times ([7420087](https://github.com/knalli/angular-vertxbus/commit/7420087))
* **service:** fix possible internal npe on de-register ([913ac74](https://github.com/knalli/angular-vertxbus/commit/913ac74))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/knalli/angular-vertxbus/compare/1.1.0...1.1.1) (2015-04-09)


### Bug Fixes

* **wrapper:** ensure eventbus is online when removing a handler ([a3dd555](https://github.com/knalli/angular-vertxbus/commit/a3dd555)), closes [#48](https://github.com/knalli/angular-vertxbus/issues/48) [#52](https://github.com/knalli/angular-vertxbus/issues/52)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/knalli/angular-vertxbus/compare/1.0.0...1.1.0) (2015-04-06)


### Features

* **service:** add 4th arg `service.send()` for replyless sends ([849eb3a](https://github.com/knalli/angular-vertxbus/commit/849eb3a))
* **wrapper:** add `wrapper.reconnect(true)` allowing a reconnect asap ([bd0cc4a](https://github.com/knalli/angular-vertxbus/commit/bd0cc4a))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/knalli/angular-vertxbus/compare/0.11.2...1.0.0) (2015-03-01)


### Bug Fixes

* **protractor-$timeout:** use $interval service for reply timeouts so protractor tests can continue ([eed05bd](https://github.com/knalli/angular-vertxbus/commit/eed05bd))
* **service:** avoid duplicate broadcast events for (dis)connected ([0f56411](https://github.com/knalli/angular-vertxbus/commit/0f56411)), closes [#37](https://github.com/knalli/angular-vertxbus/issues/37)
* **wrapper:** avoid invalid host+port combination (CORS) ([e29def5](https://github.com/knalli/angular-vertxbus/commit/e29def5)), closes [#39](https://github.com/knalli/angular-vertxbus/issues/39)



<a name="0.11.2"></a>
## [0.11.2](https://github.com/knalli/angular-vertxbus/compare/0.11.1...0.11.2) (2015-01-16)


### Bug Fixes

* **service:** fix possible npe on re-registration of handlers after reconnect ([2225a8a](https://github.com/knalli/angular-vertxbus/commit/2225a8a))



<a name="0.11.1"></a>
## [0.11.1](https://github.com/knalli/angular-vertxbus/compare/0.11.0...0.11.1) (2015-01-09)


### Bug Fixes

* **service:** fix registering a callback again after disconnect ([483d2ee](https://github.com/knalli/angular-vertxbus/commit/483d2ee))



<a name="0.11.0"></a>
# [0.11.0](https://github.com/knalli/angular-vertxbus/compare/0.10.0...0.11.0) (2014-12-18)


### Features

* **service:** improve memory usage, remove empty arrays of handlers ([4b68002](https://github.com/knalli/angular-vertxbus/commit/4b68002))
* replace console w/ $log ([3c9be73](https://github.com/knalli/angular-vertxbus/commit/3c9be73))



<a name="0.10.0"></a>
# [0.10.0](https://github.com/knalli/angular-vertxbus/compare/0.9.0...0.10.0) (2014-12-14)




<a name="0.9.0"></a>
# [0.9.0](https://github.com/knalli/angular-vertxbus/compare/v0.8.1...0.9.0) (2014-11-23)


### Bug Fixes

* **package:** use non minified artifact as 'main' ([72b5165](https://github.com/knalli/angular-vertxbus/commit/72b5165)), closes [#27](https://github.com/knalli/angular-vertxbus/issues/27)

### Features

* **componentjs:** add support for componentjs and related builds ([9a763d6](https://github.com/knalli/angular-vertxbus/commit/9a763d6))
* **componentjs:** add support for componentjs and related builds ([d748944](https://github.com/knalli/angular-vertxbus/commit/d748944))
* **componentjs:** add support for componentjs and related builds ([2755038](https://github.com/knalli/angular-vertxbus/commit/2755038))
* improve debugger-readibility w/ fn.displayName ([8e5006e](https://github.com/knalli/angular-vertxbus/commit/8e5006e))



<a name="0.8.1"></a>
## [0.8.1](https://github.com/knalli/angular-vertxbus/compare/v0.8.0...v0.8.1) (2014-10-30)


### Bug Fixes

* **service:** fix npe if vertxEventBus is disabled (and null) ([7e4be4b](https://github.com/knalli/angular-vertxbus/commit/7e4be4b))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/knalli/angular-vertxbus/compare/v0.7.1...v0.8.0) (2014-10-16)


### Features

* **service:** use a simple map internally avoiding callbacks issues ([8a5bd54](https://github.com/knalli/angular-vertxbus/commit/8a5bd54)), closes [#23](https://github.com/knalli/angular-vertxbus/issues/23)



<a name="0.7.1"></a>
## [0.7.1](https://github.com/knalli/angular-vertxbus/compare/v0.7.0...v0.7.1) (2014-09-19)


### Features

* **tests:** introduce automatic tests against latest AJS 1.2 & 1.3 ([89d6a3d](https://github.com/knalli/angular-vertxbus/commit/89d6a3d))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/knalli/angular-vertxbus/compare/v0.6.0...v0.7.0) (2014-08-30)


### Bug Fixes

* **artifact:** (requirejs) add `angular` as a missing dependency ([a566c53](https://github.com/knalli/angular-vertxbus/commit/a566c53))
* **service:** Fix issue with registerHandler/unregisterHandler #18 ([e723185](https://github.com/knalli/angular-vertxbus/commit/e723185)), closes [#18](https://github.com/knalli/angular-vertxbus/issues/18)
* **service:** fix service.isValidSession() ([0cbfb10](https://github.com/knalli/angular-vertxbus/commit/0cbfb10))
* **service:** invalid promise on login (see also #17 & ca65a8d2) ([8e2cd8c](https://github.com/knalli/angular-vertxbus/commit/8e2cd8c))
* **wrapper:** fix typo in debug message ([0acd99b](https://github.com/knalli/angular-vertxbus/commit/0acd99b))

### Features

* **mock:** sockjs mock can emulate a login shake ([3618ede](https://github.com/knalli/angular-vertxbus/commit/3618ede))
* **service:** breaking change: service.send(addr, data, timeout) ([55716e4](https://github.com/knalli/angular-vertxbus/commit/55716e4)), closes [#19](https://github.com/knalli/angular-vertxbus/issues/19)
* **service:** send/publish will additionally check login state ([e16083f](https://github.com/knalli/angular-vertxbus/commit/e16083f))
* **service:** the service handles a login if defined ([7727da7](https://github.com/knalli/angular-vertxbus/commit/7727da7))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/knalli/angular-vertxbus/compare/v0.5.0...v0.6.0) (2014-05-19)


### Bug Fixes

* **vertxEventBusProvider:** avoid default options object mutations ([031871c](https://github.com/knalli/angular-vertxbus/commit/031871c))
* **vertxEventBusProvider:** make config functions chainable ([7b02eab](https://github.com/knalli/angular-vertxbus/commit/7b02eab))
* **vertxEventBusService:** on registerHandler, return function to unregister this handler ([1f1b6bd](https://github.com/knalli/angular-vertxbus/commit/1f1b6bd))
* **vertxEventBusService:** on unregistering a handler, the callback was called accidently itself ([2dfcd11](https://github.com/knalli/angular-vertxbus/commit/2dfcd11))

### Features

* **vertxEventBusService:** add opt-in feature buffering messages ([de0e134](https://github.com/knalli/angular-vertxbus/commit/de0e134))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/knalli/angular-vertxbus/compare/v0.4.5...v0.5.0) (2014-03-17)




<a name="0.4.5"></a>
## [0.4.5](https://github.com/knalli/angular-vertxbus/compare/2.0.0-beta.3...v0.4.5) (2013-12-24)




<a name="0.4.4"></a>
## [0.4.4](https://github.com/knalli/angular-vertxbus/compare/v0.4.3...v0.4.4) (2013-12-16)


### Bug Fixes

* fix issue with $q / typo ([4c45587](https://github.com/knalli/angular-vertxbus/commit/4c45587))



<a name="0.4.3"></a>
## [0.4.3](https://github.com/knalli/angular-vertxbus/compare/v0.4.2...v0.4.3) (2013-12-16)


### Bug Fixes

* fix another npe ([b1cf79c](https://github.com/knalli/angular-vertxbus/commit/b1cf79c))



<a name="0.4.2"></a>
## [0.4.2](https://github.com/knalli/angular-vertxbus/compare/v0.4.1...v0.4.2) (2013-12-16)


### Bug Fixes

* fix possible npe if event bus is disabled (was not fixed in 0.4.1) ([15c5832](https://github.com/knalli/angular-vertxbus/commit/15c5832))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/knalli/angular-vertxbus/compare/v0.4.0...v0.4.1) (2013-12-16)


### Bug Fixes

* fix possible npe if event bus is disabled ([600a090](https://github.com/knalli/angular-vertxbus/commit/600a090))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/knalli/angular-vertxbus/compare/v0.3.0...v0.4.0) (2013-12-16)


### Features

* fix use any angularjs 1.2.x ([35b4bc5](https://github.com/knalli/angular-vertxbus/commit/35b4bc5))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/knalli/angular-vertxbus/compare/v0.2.0...v0.3.0) (2013-12-15)


### Bug Fixes

* missing repository field in package.json ([1d4e888](https://github.com/knalli/angular-vertxbus/commit/1d4e888))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/knalli/angular-vertxbus/compare/cf3dc75...v0.2.0) (2013-12-15)


### Bug Fixes

* **grunt:** fix task order, missing coffee in chain ([cf3dc75](https://github.com/knalli/angular-vertxbus/commit/cf3dc75))



