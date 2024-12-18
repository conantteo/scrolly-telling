gsap_init_js = """
gsap.registerPlugin(ScrollTrigger);
let bodyScrollBar = Scrollbar.init(document.body, {
    damping: 0.1,
    delegateTo: document,
});
ScrollTrigger.scrollerProxy(".scroller", {
    scrollTop(value) {
        if (arguments.length) {
            bodyScrollBar.scrollTop = value;
        }
        return bodyScrollBar.scrollTop;
    },
});
bodyScrollBar.addListener(ScrollTrigger.update);"""
