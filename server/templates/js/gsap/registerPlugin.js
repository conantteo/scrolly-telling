document.addEventListener("DOMContentLoaded", (event) => {
    if (typeof gsap !== "undefined") {
        // Example: register any additional GSAP plugins here if needed.
        gsap.registerPlugin("{{ plugin_name }}")
    } else {
        console.error("GSAP not found. Ensure gsap.min.js is loaded before this script.");
    }
});