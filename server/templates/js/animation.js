document.addEventListener("DOMContentLoaded", () => {
    // Check that GSAP and ScrollTrigger are loaded
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        console.error("GSAP or ScrollTrigger not loaded. Animation setup aborted.");
        return;
    }

    // Optional: Integrate smooth-scrollbar if you are using a container with class .scroller
    let scroller = document.querySelector('.scroller');
    let scrollbar = null;

    if (scroller && typeof Scrollbar !== "undefined") {
        scrollbar = Scrollbar.init(scroller, {
            damping: 0.1,
            alwaysShowTracks: true
        });

        // Let ScrollTrigger know how to handle proxying scroll methods
        ScrollTrigger.scrollerProxy(scroller, {
            scrollTop(value) {
                if (arguments.length) {
                    scrollbar.scrollTop = value;
                }
                return scrollbar.scrollTop;
            },
            getBoundingClientRect() {
                return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
            }
        });

        // Whenever the scrollbar updates, tell ScrollTrigger to update too
        scrollbar.addListener(ScrollTrigger.update);
    }

    // A helper to easily get the correct scroller reference for ScrollTrigger
    const scrollerRef = scroller ? ".scroller" : window;

    // Example: fade-in animations for components
    document.querySelectorAll(".component[data-animation='fade-in']").forEach((component) => {
        gsap.from(component, {
            scrollTrigger: {
                trigger: component,
                scroller: scrollerRef,
                start: "top 80%",      // adjust based on design
                end: "bottom 20%",    // adjust as needed
                toggleActions: "play none none reverse"
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: "power2.out"
        });
    });

    // Example: slide-up animations for components
    document.querySelectorAll(".component[data-animation='slide-up']").forEach((component) => {
        gsap.from(component, {
            scrollTrigger: {
                trigger: component,
                scroller: scrollerRef,
                start: "top 90%",
                end: "bottom 10%",
                toggleActions: "play none none reverse"
            },
            opacity: 0,
            y: 100,
            duration: 0.8,
            ease: "power2.out"
        });
    });

    // Example: pinning sections
    document.querySelectorAll("[data-pin-section='true']").forEach((section) => {
        ScrollTrigger.create({
            trigger: section,
            scroller: scrollerRef,
            start: "top top",
            end: () => "+=" + (section.offsetHeight * 2), // Adjust end distance as needed
            pin: true,
            pinSpacing: false
        });
    });

    // Refresh all ScrollTriggers after setup
    ScrollTrigger.refresh();
});
