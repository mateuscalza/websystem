/*export {
    window: {
        width: () => Math.min($(window).width() * 0.7, 400),
        height: () => Math.max(Math.min($(window).height() * 0.6, $(window).height() - $('#bar').height()), 120),
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
}*/

//# sourceMappingURL=WindowDefaults.js.map
