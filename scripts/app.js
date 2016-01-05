var defaults = {
    window: {
        width: () => $(window).width() * 0.70,
        height: () => Math.max(Math.min($(window).height() * 0.5, $(window).height() - $('#bar').height()), 120),
        left() {
            return Math.max(20, $(window).width() / 2.5 - this.width() / 2);
        },
        top() {
            return Math.max(20, $(window).height() / 2.5 - this.height() / 2);
        },
        set(windowElement, plus = 0) {
            windowElement.width(defaults.window.width()).height(defaults.window.height()).css({
                top: defaults.window.top() + plus,
                left: defaults.window.left() + plus
            }).find('.content').height(defaults.window.height() - 50);
        }
    }
};

var zIndex = 1;

class MenuIcon {
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
    constructor(title, content) {
        var newWindowElement = $('<div></div>', {
            addClass: 'window'
        });
        let titleElement = $('<span></span>', {
            addClass: 'title'
        }).text(title).append('<i class="fa fa-minus hide"></i>');
        let contentElement = $('<div></div>', {
            addClass: 'content'
        }).append(content);

        titleElement.on('dblclick', function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            let windowElement = $(this).parent('.window');
            let height = $(window).height() - $('#bar').height();
            let width = $(window).width();

            if (windowElement.width() !== width && windowElement.height() !== height) {
                windowElement.width(width).height(height).css({
                    top: 0,
                    left: 0
                }).children('.content').height(height - 50);
            } else {
                defaults.window.set(windowElement);
            }
        }).find('.hide').on('click', function() {
            $(this).closest('.window').hide();
        });

        newWindowElement.hide();

        newWindowElement.append(titleElement, contentElement).appendTo(document.body);

        defaults.window.set(newWindowElement, ($('.window').length - 1) * 35);

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


class FileManager {
    constructor(){
        var self = this;

        self.windows = [
            new WindowElement('File Manager', 'Arquivos aqui...')
        ];

        let icon = new MenuIcon('fa-folder', 'File Manager');

        icon.element.click(function () {
            self.show();
        });
    }

    show(){
        this.windows.forEach((windowElement) => {
            windowElement.element.toggle();
        });
    }
}

new FileManager();
new FileManager();
new FileManager();
