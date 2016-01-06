/// <reference path="../tools/typings/tsd.d.ts" />

interface MathJS {
    eval(formula: string): any
    format(input: any): string
}
declare var math: MathJS;

interface FileManagerItem {
    name: string;
    type: string;
}

var zIndex: number = 1;


class WindowDefaults {
    static width(): number {
        return Math.min($(window).width() * 0.7, 400);
    }

    static height(): number {
        return Math.max(Math.min($(window).height() * 0.6, $(window).height() - $('#bar').height()), 120)
    }

    static left(): number {
        return Math.max(20, $(window).width() / 2.5 - this.width() / 2);
    }

    static top(): number {
        return Math.max(20, $(window).height() / 2.5 - this.height() / 2);
    }

    static set(windowElement: JQuery, plus: number): void {
        plus = typeof plus === 'undefined' ? 0 : plus;
        windowElement.width(this.width()).height(this.height()).css({
            top: this.top() + plus,
            left: this.left() + plus
        }).find('.content').height(this.height() - 50);
    }
}

class DataConnector {

    dataNamespace: string;
    socket: SocketIOClient.Socket;

    constructor(dataNamespace: string) {
        this.dataNamespace = dataNamespace;
        this.socket = io.connect('http://' + location.hostname + ':8000/' + this.dataNamespace);
    }

    get(action: string, data?: Object): PromiseLike<Object> {
        return $.ajax({
            url: this.dataNamespace + '/' + action,
            data: data,
            type: 'GET'
        });
    }

    post(action: string, data?: Object): PromiseLike<Object> {
        return $.ajax({
            url: this.dataNamespace + '/' + action,
            data: data,
            type: 'POST'
        });
    }

    on(action: string, callback: Function): SocketIOClient.Emitter {
        return this.socket.on(action, callback);
    }

    emit(action: string, data?: Object): SocketIOClient.Emitter {
        return this.socket.emit.apply(this, arguments);
    }
}

class MenuIcon {
    element: JQuery;

    constructor(icon, name) {
        this.element = $('<a></a>', {
            href: 'javascript:;',
            title: name
        }).append($('<i></i>', {
            addClass: 'fa ' + icon
        }));
        $('#bar ul').append($('<li></li>').append(this.element));
    }
}

class WindowElement {
    element: JQuery;
    contentElement: JQuery;
    titleElement: JQuery;


    constructor(title: string) {
        var newWindowElement = $('<div></div>', {
            addClass: 'window'
        });
        this.titleElement = $('<span></span>', {
            addClass: 'title'
        }).text(title).append('<i class="fa fa-minus hide"></i>');
        this.contentElement = $('<div></div>', {
            addClass: 'content'
        });

        this.titleElement.on('dblclick', function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            let windowElement: JQuery = $(this).parent('.window');
            let height = $(window).height() - $('#bar').height();
            let width = $(window).width();

            if (windowElement.width() !== width && windowElement.height() !== height) {
                windowElement.width(width).height(height).css({
                    top: 0,
                    left: 0
                }).children('.content').height(height - 50);
            } else {
                WindowDefaults.set(windowElement, 0);
            }
        }).find('.hide').on('click', function() {
            $(this).closest('.window').hide();
        });

        newWindowElement.hide();

        newWindowElement.append(this.titleElement, this.contentElement).appendTo(document.body);

        WindowDefaults.set(newWindowElement, ($('.window').length - 1) * 35);

        newWindowElement.draggable({
            containment: 'body',
            handle: '.title',
            start() {
                let actualZIndex = $(this).css('zIndex');
                if (!$.isNumeric(actualZIndex) || parseInt(actualZIndex) != zIndex) {
                    $(this).css('zIndex', ++zIndex);
                }
            }
        });

        newWindowElement.resizable({
            resize: function() {
                $(this).find('.content').height($(this).height() - 50);
            },
            stop: function() {
                $(this).find('.content').height($(this).height() - 50);
            },
            handles: 'all',
            minHeight: 120,
            minWidth: 120
        });

        newWindowElement.on('click', function() {
            let actualZIndex = $(this).css('zIndex');
            if (!$.isNumeric(actualZIndex) || parseInt(actualZIndex) != zIndex) {
                $(this).css('zIndex', ++zIndex);
            }
        });

        this.element = newWindowElement;
    }
}

abstract class Application {
    name: string;
    windows: [WindowElement];
    icon: MenuIcon;

    constructor() {
        var self = this;

        self.icon.element.click(function() {
            self.show();
        });
    }

    show() {
        this.windows.forEach((windowElement) => {
            windowElement.element.toggle();
        });
    }
}

class FileManager extends Application {

    server: DataConnector;
    main: WindowElement;
    url: JQuery;
    go: JQuery;
    results: JQuery;
    items: [Object];
    path: string;

    constructor() {
        this.name = 'File Manager';

        this.server = new DataConnector('file-manager');

        this.main = new WindowElement(this.name);

        this.windows = [
            this.main
        ];
        this.icon = new MenuIcon('fa-folder', this.name);

        super();

        this.mount();
        this.navigate('/');
    }

    navigate(path: string){
        var self = this;

        this.path = path;
        this.url.val(this.path);

        this.server.get('items', {path: this.path}).then(function(items: [Object]){
            self.items = items;
            self.render();
        });
    }

    render(){
        var self = this;
        this.results.empty();
        this.items.forEach(function(item: FileManagerItem){
            let result = $('<a></a>', {
                href: '#',
                addClass: 'button file-manager-item',
                text: item.name
            })
            .data('type', item.type)
            .data('path', self.path.replace(/\/$/,'') + '/' + item.name)
            .click(function(){
                if($(this).data('type') === 'dir'){
                    self.navigate($(this).data('path'));
                }
            });
            self.results.append(result);
        });
    }

    mount() {
        var self = this;

        this.main.contentElement.addClass('file-manager');

        this.url = $('<input/>', {
            rows: 1,
            addClass: 'file-manager-input'
        }).appendTo(this.main.contentElement);

        this.go = $('<button></button>', {
            text: 'Go',
            addClass: 'file-manager-button'
        }).appendTo(this.main.contentElement).click(function(){
            self.navigate(self.url.val());
        });

        this.results = $('<div></div>', {
            addClass: 'file-manager-results'
        }).appendTo(this.main.contentElement);
    }

}

class Calc extends Application {

    main: WindowElement;
    input: JQuery;
    button: JQuery;
    results: JQuery;

    constructor() {
        this.name = 'Calculator';

        this.main = new WindowElement(this.name);

        this.windows = [this.main];
        this.icon = new MenuIcon('fa-calculator', this.name);

        super();

        this.mount();
    }

    mount() {
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
    }

    calculate(event: Event) {
        let formula: string = this.input.val();
        let result: JQuery = $('<li></li>');
        try {
            if (!formula.trim().length) {
                throw new Error('Empty formula');
            }
            let formulaElement: JQuery = $('<span></span>', {
                addClass: 'info'
            });
            formulaElement.text(formula.replace(/([^A-Za-z0-9\.])/gi, ' $1 ').replace(/\s\s+/gi, ' ').trim());
            result.append(math.format(math.eval(formula)), formulaElement);
        } catch (err) {
            let errElement = $('<i></i>').text(err.message);
            result.append(errElement);
        }

        this.results.prepend(result);
    }
}


new FileManager();
new Calc();
