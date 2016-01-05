'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var defaults = {
    window: {
        width: function width() {
            return Math.min($(window).width() * 0.7, 400);
        },
        height: function height() {
            return Math.max(Math.min($(window).height() * 0.6, $(window).height() - $('#bar').height()), 120);
        },
        left: function left() {
            return Math.max(20, $(window).width() / 2.5 - this.width() / 2);
        },
        top: function top() {
            return Math.max(20, $(window).height() / 2.5 - this.height() / 2);
        },
        set: function set(windowElement) {
            var plus = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

            windowElement.width(defaults.window.width()).height(defaults.window.height()).css({
                top: defaults.window.top() + plus,
                left: defaults.window.left() + plus
            }).find('.content').height(defaults.window.height() - 50);
        }
    }
};

var zIndex = 1;

var MenuIcon = function MenuIcon(icon, name) {
    _classCallCheck(this, MenuIcon);

    this.element = $('<a></a>', {
        href: 'javascript:;',
        title: name
    }).append($('<i></i>', {
        addClass: 'fa ' + icon
    }));
    $('#bar ul').append($('<li></li>').append(this.element));
};

var WindowElement = function WindowElement(title, content) {
    _classCallCheck(this, WindowElement);

    var newWindowElement = $('<div></div>', {
        addClass: 'window'
    });
    var titleElement = $('<span></span>', {
        addClass: 'title'
    }).text(title).append('<i class="fa fa-minus hide"></i>');
    var contentElement = $('<div></div>', {
        addClass: 'content'
    }).append(content);

    titleElement.on('dblclick', function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var windowElement = $(this).parent('.window');
        var height = $(window).height() - $('#bar').height();
        var width = $(window).width();

        if (windowElement.width() !== width && windowElement.height() !== height) {
            windowElement.width(width).height(height).css({
                top: 0,
                left: 0
            }).children('.content').height(height - 50);
        } else {
            defaults.window.set(windowElement);
        }
    }).find('.hide').on('click', function () {
        $(this).closest('.window').hide();
    });

    newWindowElement.hide();

    newWindowElement.append(titleElement, contentElement).appendTo(document.body);

    defaults.window.set(newWindowElement, ($('.window').length - 1) * 35);

    newWindowElement.draggable({
        containment: 'body',
        handle: '.title',
        start: function start() {
            var actualZIndex = $(this).css('zIndex');
            if (!$.isNumeric(actualZIndex) || parseInt(actualZIndex) != zIndex) {
                $(this).css('zIndex', ++zIndex);
            }
        }
    });

    newWindowElement.resizable({
        resize: function resize() {
            $(this).find('.content').height($(this).height() - 50);
        },
        stop: function stop() {
            $(this).find('.content').height($(this).height() - 50);
        },
        handles: 'all',
        minHeight: 120,
        minWidth: 120
    });

    newWindowElement.on('click', function () {
        var actualZIndex = $(this).css('zIndex');
        if (!$.isNumeric(actualZIndex) || parseInt(actualZIndex) != zIndex) {
            $(this).css('zIndex', ++zIndex);
        }
    });

    this.element = newWindowElement;
};

var FileManager = (function () {
    function FileManager() {
        _classCallCheck(this, FileManager);

        var self = this;

        self.windows = [new WindowElement('File Manager', 'Arquivos aqui...')];

        var icon = new MenuIcon('fa-folder', 'File Manager');

        icon.element.click(function () {
            self.show();
        });
    }

    _createClass(FileManager, [{
        key: 'show',
        value: function show() {
            this.windows.forEach(function (windowElement) {
                windowElement.element.toggle();
            });
        }
    }]);

    return FileManager;
})();

new FileManager();
new FileManager();
new FileManager();
//# sourceMappingURL=app.js.map
