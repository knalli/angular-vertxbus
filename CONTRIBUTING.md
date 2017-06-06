# Contributing Guide
Contributing to this repo is fairly easy. This document shows you how to
get the project, run all provided tests and generate a production ready build.

It also covers provided grunt tasks, that help you developing on this repo.

## Dependencies
To make sure the following instructions work, please install the following dependencies
on you machine:

- Node.js
- npm
- Git

If you install node through the binary installation file, **npm** will be already there.

## Installation
To get the source of this project clone the git repository via:

````
$ git clone https://github.com/knalli/angular-vertxbus
````

This will clone the complete source to your local machine. Navigate to the project folder
and install all needed dependencies via **npm** and **bower**:

````
$ npm install
````

(This will invoke a `bower install` automatically.)

This commands installs everything which is required for building and testing the project.

## Testing
Internally `angular-vertxbus` depends on **Grunt** and **Webpack**, however there have been been masked all steps behind 
simple tasks processed by **npm**.

### Source linting: `npm run lint`
`npm run lint` performs a lint for all (also part of `test`).

### Unit testing: `npm run test`
`npm run test` executes (as you might think) the unit tests, which are located
in `test/unit`. The task uses **karma**, the spectacular test runner, to execute the tests with 
the **jasmine testing framework**.

#### Testing of different scopes: `npm run test-scopes`
Because `angular-vertxbus` supports multiple different versions of AngularJS 1.x, you should run the tests the code against these also.

`npm run test-scopes` performs a `npm run test` against each registered scope which can be found at `/test_scopes/*`.

#### Testing headless: `npm run test-headless`
Just like `npm run test`, the command `npm run test-headless` performs the test against a headless PhantomJS. Maybe 
useful in case of automatic tests.

## Building
### Standard build
You will probably being never required using the command `npm run build`, because it will create a production-ready 
build of `angular-vertxbus`. This task will also **lint**, **test** and **minify** the
source. After running this task, you'll find the following files in a generated
`/dist`folder:

````
dist/angular-vertxbus.js
dist/angular-vertxbus.min.js
dist/angular-vertxbus.withpolyfill.js
dist/angular-vertxbus.withpolyfill.min.js
````

### Compile only
The command `npm run compile` creates production-ready files at `/dist`, also part of `npm run build`.

````
dist/angular-vertxbus.js
dist/angular-vertxbus.min.js
dist/angular-vertxbus.withpolyfill.js
dist/angular-vertxbus.withpolyfill.min.js
````

## Developing
The *local test environment* starts and utilizes a full Vert.x node and a NodeJS based web server.

**Easy:** Just run `npm run -s start-server` and open `http://localhost:3000/` in your preferred browser.

If you have changed something, just invoke `npm run -s compile` in parallel and refresh the browser.

Alternatively:

1. `npm run install-it-vertx-server` downloads and installs a Vert.x locally. This will store a cached download artifact at `test/e2e//vertx/`.
2. `npm run start-it-vertx-server` starts an Vert.x on port `8080`.
3. `npm run start-it-web-server` starts a web server on port `3000`.
4. Ensure at least `npm run -s compile` has been invoked so there is a `dist/angular-vertxbus.js`.
5. Open http://localhost:3000/ in your browser.

## Contributing/Submitting changes

Note: In general, pull requests should be based on the `canary` branch. Most likely, `canary` will be most of time newer than the stable `master`. Therefor, you can make your changes based on `master` -- but you have to do it *always* based on `canary` in order to make a pull request.

- Checkout a new branch based on <code>canary</code> and name it to what you intend to do:
  - Example:
    ````
    $ git checkout -b BRANCH_NAME
    ````
  - Use one branch per fix/feature
- Make your changes
  - Make sure to provide a spec for unit tests.
  - Run your tests with either <code>karma start karma.conf.js</code> or simply <code>grunt test</code>.
  - In order to verify everything will work in the other test scopes (different AngularJS version), please run `npm run test-scopes`. If you are getting dependency resolution issue, run `npm run clean-test-scopes` and try again.
  - When all tests pass, everything's fine.
- Commit your changes
  - Please provide a git message which explains what you've done.
  - This repo uses [Brian's conventional-changelog task](https://github.com/btford/grunt-conventional-changelog) so please make sure your commits follow the [conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit).
  - Commit to the forked repository.
- Make a pull request
  - Make sure you send the PR to the <code>canary</code> branch.
  - Travis CI and a Hound are watching you!

If you follow these instructions, your PR will land pretty safety in the main repo!
