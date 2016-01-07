/// <reference path="../tools/typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var zIndex = 1;
var activatedWindow;
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
        var self = this;
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
                    activatedWindow = self;
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
        this.watch = {
            keydown: [],
            keyup: [],
            keypress: []
        };
        this.element = newWindowElement;
        this.events();
    }
    WindowElement.prototype.events = function () {
        var self = this;
        $(document).keydown(function (evt) {
            if (!$(evt.target).closest('input, textarea, select').length && self === activatedWindow) {
                var selfEvent = this;
                self.watch['keydown'].forEach(function (callback) {
                    callback.call(selfEvent, evt);
                });
            }
        });
        $(document).keyup(function (evt) {
            if (!$(evt.target).closest('input, textarea, select').length && self === activatedWindow) {
                var selfEvent = this;
                self.watch['keypress'].forEach(function (callback) {
                    callback.call(selfEvent, evt);
                });
            }
        });
        $(document).keypress(function (evt) {
            if (!$(evt.target).closest('input, textarea, select').length && self === activatedWindow) {
                var selfEvent = this;
                self.watch['keyup'].forEach(function (callback) {
                    callback.call(selfEvent, evt);
                });
            }
        });
    };
    WindowElement.prototype.on = function (name, callback) {
        if (!this.watch[name])
            this.watch[name] = [];
        this.watch[name].push(callback);
    };
    return WindowElement;
})();
var Application = (function () {
    function Application() {
        var self = this;
        self.icon.element.click(function () {
            self.toggle();
            activatedWindow = self.windows[0];
        });
    }
    Application.prototype.toggle = function () {
        this.windows.forEach(function (windowElement) {
            windowElement.element.toggle();
        });
    };
    return Application;
})();
var FileManagerWindow = (function (_super) {
    __extends(FileManagerWindow, _super);
    function FileManagerWindow(title, server) {
        this.server = server;
        _super.call(this, title);
        this.mount();
        this.navigate('/');
    }
    FileManagerWindow.prototype.navigate = function (path) {
        var self = this;
        this.path = path;
        this.url.val(this.path);
        this.server.get('items', { path: this.path }).then(function (items) {
            self.items = items;
            self.render();
        });
    };
    FileManagerWindow.prototype.back = function () {
        console.log('go back bitches!');
    };
    FileManagerWindow.prototype.render = function () {
        var self = this;
        this.results.empty();
        this.items.forEach(function (item) {
            var path = self.path.replace(/\/$/, '') + '/' + item.name;
            var result = $('<a></a>', {
                href: item.type === 'dir' ? '#' : '/download?file=' + encodeURI(path),
                addClass: 'button file-manager-item',
                text: item.name
            })
                .data('type', item.type)
                .data('path', path)
                .click(function () {
                if ($(this).data('type') === 'dir') {
                    self.navigate($(this).data('path'));
                }
            });
            if (item.type !== 'dir') {
                result.attr('download', 'download');
                result.prepend('<i class="fa fa-file"></i> ');
            }
            else {
                result.prepend('<i class="fa fa-folder"></i> ');
            }
            self.results.append(result);
        });
    };
    FileManagerWindow.prototype.mount = function () {
        var self = this;
        this.contentElement.addClass('file-manager');
        this.url = $('<input/>', {
            rows: 1,
            addClass: 'file-manager-input'
        }).appendTo(this.contentElement);
        this.go = $('<button></button>', {
            text: 'Go',
            addClass: 'file-manager-button'
        }).appendTo(this.contentElement).click(function () {
            self.navigate(self.url.val());
        });
        this.results = $('<div></div>', {
            addClass: 'file-manager-results'
        }).appendTo(this.contentElement);
        this.on('keypress', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            self.back();
        });
    };
    return FileManagerWindow;
})(WindowElement);
var FileManager = (function (_super) {
    __extends(FileManager, _super);
    function FileManager() {
        this.name = 'File Manager';
        this.server = new DataConnector('file-manager');
        this.windows = [
            new FileManagerWindow(this.name, this.server)
        ];
        this.icon = new MenuIcon('fa-folder', this.name);
        _super.call(this);
    }
    FileManager.prototype.newWindow = function () {
        this.windows.push(new FileManagerWindow(this.name, this.server));
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
var applicationManager = {
    open: function () {
    },
    close: function () {
    }
};
new FileManager();
new Calc();

//# sourceMappingURL=main.js.map
