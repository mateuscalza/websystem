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
var activatedWindow: WindowElement;


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
    watch: any;

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

        var self = this;
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
                    activatedWindow = self;
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

        this.watch = {
            keydown: [],
            keyup: [],
            keypress: []
        };
        this.element = newWindowElement;
        this.events();
    }

    events(): void {
        var self = this;
        $(document).keydown(function(evt){
            if(!$(evt.target).closest('input, textarea, select').length && self === activatedWindow){
                var selfEvent = this;
                self.watch['keydown'].forEach(function(callback){
                    callback.call(selfEvent, evt);
                });
            }
        });

        $(document).keyup(function(evt){
            if(!$(evt.target).closest('input, textarea, select').length && self === activatedWindow){
                var selfEvent = this;
                self.watch['keypress'].forEach(function(callback){
                    callback.call(selfEvent, evt);
                });
            }
        });

        $(document).keypress(function(evt){
            if(!$(evt.target).closest('input, textarea, select').length && self === activatedWindow){
                var selfEvent = this;
                self.watch['keyup'].forEach(function(callback){
                    callback.call(selfEvent, evt);
                });
            }
        });
    }

    on(name, callback): void {
        if(!this.watch[name]) this.watch[name] = [];
        this.watch[name].push(callback);
    }
}

abstract class Application {
    name: string;
    windows: [WindowElement];
    icon: MenuIcon;

    constructor() {
        var self = this;

        self.icon.element.click(function() {
            self.toggle();
            activatedWindow = self.windows[0];
        });
    }

    toggle() {
        this.windows.forEach((windowElement) => {
            windowElement.element.toggle();
        });
    }
}

class FileManagerWindow extends WindowElement {

    server: DataConnector;
    url: JQuery;
    go: JQuery;
    results: JQuery;
    items: [Object];
    path: string;

    constructor(title: string, server: DataConnector) {
        this.server = server;

        super(title);

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

    back(){
        console.log('go back bitches!');
    }

    render(){
        var self = this;
        this.results.empty();
        this.items.forEach(function(item: FileManagerItem){
            let path = self.path.replace(/\/$/,'') + '/' + item.name;
            let result = $('<a></a>', {
                href: item.type === 'dir' ? '#' : '/download?file=' + encodeURI(path),
                addClass: 'button file-manager-item',
                text: item.name
            })
            .data('type', item.type)
            .data('path', path)
            .click(function(){
                if($(this).data('type') === 'dir'){
                    self.navigate($(this).data('path'));
                }
            });

            if(item.type !== 'dir'){
                result.attr('download', 'download');
                result.prepend('<i class="fa fa-file"></i> ');
            } else {
                result.prepend('<i class="fa fa-folder"></i> ');
            }

            self.results.append(result);
        });
    }

    mount() {
        var self = this;

        this.contentElement.addClass('file-manager');

        this.url = $('<input/>', {
            rows: 1,
            addClass: 'file-manager-input'
        }).appendTo(this.contentElement);

        this.go = $('<button></button>', {
            text: 'Go',
            addClass: 'file-manager-button'
        }).appendTo(this.contentElement).click(function(){
            self.navigate(self.url.val());
        });

        this.results = $('<div></div>', {
            addClass: 'file-manager-results'
        }).appendTo(this.contentElement);

        this.on('keypress', function(evt){
            evt.preventDefault();
            evt.stopPropagation();
            self.back();
        });
    }

}

class FileManager extends Application {

    main: FileManagerWindow;
    server: DataConnector;

    constructor() {
        this.name = 'File Manager';

        this.server = new DataConnector('file-manager');

        this.windows = [
            new FileManagerWindow(this.name, this.server)
        ];

        this.icon = new MenuIcon('fa-folder', this.name);

        super();
    }

    newWindow(){
        this.windows.push(new FileManagerWindow(this.name, this.server));
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

var applicationManager = {
    open(){

    },
    close(){

    }
};

new FileManager();
new Calc();
