var expect = require('chai').expect,
    mop = require('../index')
    Browser = require('zombie');

Feature('WebServer', function() {

  Scenario('Creating groups', function() {

    Given('a request to start web server', function() {
      mop.startWebServer();
    });

    When('the user goes to site', function() {
      this.browser = new Browser({site: 'http://localhost:' + mop.settings().web.port});
    });

    Then('it gonna be accessible', function(done) {
      this.browser.visit('/', done);
    });

  });

});
