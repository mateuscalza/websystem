# Master of Puppets
Control everything in Node, remotely. Using socket and Object.observe().

## Installation

```bash
$ npm install master-of-puppets --save
```

## Usage

```JavaScript
// Require MOP
var mop = require('./');

// Example using robotjs
var robot = require('robotjs');

// Create a group
mop.group('keyboard', 'Keyboard');

// Use group and define a puppet
mop.group('keyboard').puppet('space', 'Space', mop.jobs.Action, function(){
  robot.keyTap('space');
});

// Start socket communication
mop.startSocket();

// Start web server that provides control (socket dependent)
mop.startWebServer();
```

## Tests

```bash
$ npm test
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.1.0 Initial release
