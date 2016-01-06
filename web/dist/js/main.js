/// <reference path="../tools/typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var zIndex = 1;
var WindowDefaults = (function () {
    function WindowDefaults() {
    }
    WindowDefaults.width = function () {
        return Math.min($(window).width() * 0.7, 400);
    };
    WindowDefaults.height = function () {
        return Math.max(Math.min($(window).height() * 0.6, $(window).height() - $('#bar').height()), 120);
    };
    WindowDefaults.left = function () {
        return Math.max(20, $(window).width() / 2.5 - this.width() / 2);
    };
    WindowDefaults.top = function () {
        return Math.max(20, $(window).height() / 2.5 - this.height() / 2);
    };
    WindowDefaults.set = function (windowElement, plus) {
        plus = typeof plus === 'undefined' ? 0 : plus;
        windowElement.width(this.width()).height(this.height()).css({
            top: this.top() + plus,
            left: this.left() + plus
        }).find('.content').height(this.height() - 50);
    };
    return WindowDefaults;
})();
var DataConnector = (function () {
    function DataConnector(dataNamespace) {
        this.dataNamespace = dataNamespace;
        this.socket = io.connect('http://' + location.hostname + ':8000/' + this.dataNamespace);
    }
    DataConnector.prototype.get = function (action, data) {
        return $.ajax({
            url: this.dataNamespace + '/' + action,
            data: data,
            type: 'GET'
        });
    };
    DataConnector.prototype.post = function (action, data) {
        return $.ajax({
            url: this.dataNamespace + '/' + action,
            data: data,
            type: 'POST'
        });
    };
    DataConnector.prototype.on = function (action, callback) {
        return this.socket.on(action, callback);
    };
    DataConnector.prototype.emit = function (action, data) {
        return this.socket.emit.apply(this, arguments);
    };
    return DataConnector;
})();
var MenuIcon = (function () {
    function MenuIcon(icon, name) {
        this.element = $('<a></a>', {
            href: 'javascript:;',
            title: name
        }).append($('<i></i>', {
            addClass: 'fa ' + icon
        }));
        $('#bar ul').append($('<li></li>').append(this.element));
    }
    return MenuIcon;
})();
var WindowElement = (function () {
    function WindowElement(title) {
        var newWindowElement = $('<div></div>', {
            addClass: 'window'
        });
        this.titleElement = $('<span></span>', {
            addClass: 'title'
        }).text(title).append('<i class="fa fa-minus hide"></i>');
        this.contentElement = $('<div></div>', {
            addClass: 'content'
        });
        this.titleElement.on('dblclick', function (evt) {
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
            }
            else {
                WindowDefaults.set(windowElement, 0);
            }
        }).find('.hide').on('click', function () {
            $(this).closest('.window').hide();
        });
        newWindowElement.hide();
        newWindowElement.append(this.titleElement, this.contentElement).appendTo(document.body);
        WindowDefaults.set(newWindowElement, ($('.window').length - 1) * 35);
        newWindowElement.draggable({
            containment: 'body',
            handle: '.title',
            start: function () {
                var actualZIndex = $(this).css('zIndex');
                if (!$.isNumeric(actualZIndex) || parseInt(actualZIndex) != zIndex) {
                    $(this).css('zIndex', ++zIndex);
                }
            }
        });
        newWindowElement.resizable({
            resize: function () {
                $(this).find('.content').height($(this).height() - 50);
            },
            stop: function () {
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
    }
    return WindowElement;
})();
var Application = (function () {
    function Application() {
        var self = this;
        self.icon.element.click(function () {
            self.show();
        });
    }
    Application.prototype.show = function () {
        this.windows.forEach(function (windowElement) {
            windowElement.element.toggle();
        });
    };
    return Application;
})();
var FileManager = (function (_super) {
    __extends(FileManager, _super);
    function FileManager() {
        this.name = 'File Manager';
        this.server = new DataConnector('file-manager');
        this.main = new WindowElement(this.name);
        this.windows = [
            this.main
        ];
        this.icon = new MenuIcon('fa-folder', this.name);
        _super.call(this);
        this.mount();
        this.navigate('/');
    }
    FileManager.prototype.navigate = function (path) {
        var self = this;
        this.path = path;
        this.url.val(this.path);
        this.server.get('items', { path: this.path }).then(function (items) {
            self.items = items;
            self.render();
        });
    };
    FileManager.prototype.render = function () {
        var self = this;
        this.results.empty();
        this.items.forEach(function (item) {
            var result = $('<a></a>', {
                href: '#',
                addClass: 'button file-manager-item',
                text: item.name
            })
                .data('type', item.type)
                .data('path', self.path.replace(/\/$/, '') + '/' + item.name)
                .click(function () {
                if ($(this).data('type') === 'dir') {
                    self.navigate($(this).data('path'));
                }
            });
            self.results.append(result);
        });
    };
    FileManager.prototype.mount = function () {
        var self = this;
        this.main.contentElement.addClass('file-manager');
        this.url = $('<input/>', {
            rows: 1,
            addClass: 'file-manager-input'
        }).appendTo(this.main.contentElement);
        this.go = $('<button></button>', {
            text: 'Go',
            addClass: 'file-manager-button'
        }).appendTo(this.main.contentElement).click(function () {
            self.navigate(self.url.val());
        });
        this.results = $('<div></div>', {
            addClass: 'file-manager-results'
        }).appendTo(this.main.contentElement);
    };
    return FileManager;
})(Application);
var Calc = (function (_super) {
    __extends(Calc, _super);
    function Calc() {
        this.name = 'Calculator';
        this.main = new WindowElement(this.name);
        this.windows = [this.main];
        this.icon = new MenuIcon('fa-calculator', this.name);
        _super.call(this);
        this.mount();
    }
    Calc.prototype.mount = function () {
        this.main.contentElement.addClass('calc');
        this.input = $('<input/>', {
            rows: 1,
            addClass: 'calc-input'
        }).appendTo(this.main.contentElement);
        this.button = $('<button></button>', {
            text: 'Calc',
            addClass: 'calc-button'
        }).appendTo(this.main.contentElement).click(this.calculate.bind(this));
        this.results = $('<ul></ul>', {
            addClass: 'calc-results'
        }).appendTo(this.main.contentElement);
    };
    Calc.prototype.calculate = function (event) {
        var formula = this.input.val();
        var result = $('<li></li>');
        try {
            if (!formula.trim().length) {
                throw new Error('Empty formula');
            }
            var formulaElement = $('<span></span>', {
                addClass: 'info'
            });
            formulaElement.text(formula.replace(/([^A-Za-z0-9\.])/gi, ' $1 ').replace(/\s\s+/gi, ' ').trim());
            result.append(math.format(math.eval(formula)), formulaElement);
        }
        catch (err) {
            var errElement = $('<i></i>').text(err.message);
            result.append(errElement);
        }
        this.results.prepend(result);
    };
    return Calc;
})(Application);
new FileManager();
new Calc();

//# sourceMappingURL=main.js.map
