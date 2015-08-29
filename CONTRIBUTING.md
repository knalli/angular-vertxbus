# Contributing Guide

Contributing to this repo is fairly easy. This document shows you how to
get the project, run all provided tests and generate a production ready build.

It also covers provided grunt tasks, that help you developing on this repo.

## Dependencies

To make sure, that the following instructions work, please install the following dependencies
on you machine:

- Node.js
- npm
- Git

If you install node through the binary installation file, **npm** will be already there.
When **npm** is installed, use it to install the needed npm packages:

- grunt-cli <code>npm install -g grunt-cli</code>

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

The project is now installed and ready to be built.

## Building

This repo comes with a few **grunt tasks** which help you to automate
the development process. The following grunt tasks are provided:

#### <code>grunt</code>

Running <code>grunt</code> without any parameters, will actually execute the registered
default task. This includes a default linter and CoffeeScript transpiling.

#### <code>grunt test</code>

<code>grunt test</code> executes (as you might thought) the unit tests, which are located
in <code>test/unit</code>. The task uses **karma** the spectacular test runner to executes
the tests with the **jasmine testing framework**.

#### <code>grunt build</code>

You only have to use this task, if you want to generate a production ready build of
this project. This task will also **lint**, **test** and **minify** the
source. After running this task, you'll find the following files in a generated
<code>dist</code> folder:

````
dist/angular-vertxbus.js
dist/angular-vertxbus.min.js
````

#### <code>grunt watch</code>

This task will watch all relevant files. When it notice a change, it'll run the
**lint** and **test** task. Use this task while developing on the source
to make sure, everytime you make a change you get notified if your code is incosistent
or doesn't pass the tests.

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
