/// <reference path="../tools/typings/tsd.d.ts" />

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

class MenuIcon {
    element: JQuery;
    
    constructor(icon, name){
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
    windows: Array <WindowElement>;
    icon: MenuIcon;
    
    constructor(){
        var self = this;
        
        self.icon.element.click(function () {
            self.show();
        });
    }

    show(){
        this.windows.forEach((windowElement) => {
            windowElement.element.toggle();
        });
    }
}

class FileManager extends Application {
   
    constructor(){
        this.name = 'File Manager';
        
        this.windows = [
            new WindowElement(this.name)
        ];
        this.icon = new MenuIcon('fa-folder', this.name);
        
        super();
    }
    
}

class Calc extends Application {
    
    main: WindowElement;        
    input: JQuery;    
    button: JQuery;
    results: JQuery;
    
    constructor(){
        this.name = 'Calculator';

        this.main = new WindowElement(this.name);

        this.windows = [this.main];
        this.icon = new MenuIcon('fa-calculator', this.name);
        
        super();
        
        this.mount();
    }
    
    mount(){
        this.input = $('<textarea></textarea>', {
            rows: 1
        }).appendTo(this.main.contentElement);
        
        this.button = $('<button></button>', {
            text: 'Calc'
        }).appendTo(this.main.contentElement).click(this.calculate.bind(this));
        
        this.results = $('<ul></ul>').appendTo(this.main.contentElement);
    }
    
    calculate(event: Event){
        let result: JQuery = $('<li></li>');
        result.text(Function('return ' + this.input.val())());
        this.results.prepend(result);
    }
    
}


new FileManager();
new Calc();
