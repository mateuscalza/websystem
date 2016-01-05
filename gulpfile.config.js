'use strict';
var GulpConfig = (function () {
    function gulpConfig() {
        this.sourceApp = './scripts/';

        this.tsOutputPath = './web/dist/js';
        this.allJavaScript = ['./web/dist/js/**/*.js'];
        this.allTypeScript = this.sourceApp + '/**/*.ts';
        this.allPostCSS = './styles/**/*.css';

        this.typings = './tools/typings/';
        this.libraryTypeScriptDefinitions = './tools/typings/**/*.ts';
    }
    return gulpConfig;
})();
module.exports = GulpConfig;
