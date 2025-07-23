// ==UserScript==
// @name            Jira's Supercharged Quantum-Powered Stylizer of Doom
// @version         1.2.1
// @description     Bring your Jira experience to new levels and boost your productivity
// @description:fr  Jira en tout pareil, mais c'est différent
// @author          Iron-Wolf (https://github.com/Iron-Wolf)
// @include         http*://jira.example.prod/*
// @grant           none
// @unwrap
// ==/UserScript==


// ===============
//      CONFIG
// ===============
const CONFIG = {
    dayThreshold: 100,
    matchers: {
        waiting: 'Waiting',
        toReview: 'A revoir',
        resolved: 'Résolue'
    },
    debug: false,
    foilMaxFps: 60,
};


// ===============
//      STYLES
// ===============
const css_wait = `
.css_wait {
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 100px;
    z-index: 1;
    opacity: 0.5;
    rotate: -20deg;
}`;

const css_rainbow = `
.css_rainbow {
    background: linear-gradient(124deg, #ff2400, #e81d1d, #e8b71d, #e3e81d, #1de840, #1ddde8, #2b1de8, #dd00f3, #dd00f3);
    background-size: 300% 300%;
    -webkit-animation: rainbow 18s ease infinite !important;
}

@-webkit-keyframes rainbow {
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
}
@-moz-keyframes rainbow {
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
}
@-o-keyframes rainbow {
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
}
@keyframes rainbow {
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
}`;

const css_shake = `
.css_shake {
    animation: tilt-n-move-shaking 1s ease-in-out infinite;
}

@keyframes tilt-n-move-shaking {
    0% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(0, 0) rotate(2deg); }
    75% { transform: translate(0, 0) rotate(-2deg); }
    100% { transform: translate(0, 0) rotate(-0.3deg); }
}`;

const css_hover = `
.hover-in{
    transition: .3s ease-out;
}
.hover-out{
    transition: .3s ease-out;
}`;

const css_foil = `
.foil {
    pointer-events: none;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(
        115deg,
        rgba(255, 0, 255, 0.15),
        rgba(0, 255, 255, 0.15),
        rgba(255, 255, 0, 0.15),
        rgba(0, 255, 127, 0.15),
        rgba(127, 0, 255, 0.15)
    );
    background-size: 400% 400%;
    animation: foilShift 8s ease-in-out infinite;
    /*mix-blend-mode: screen;*/
    opacity: 0.6;
    z-index: 10;
    border-radius: inherit;
    filter: brightness(1.2) contrast(0.8) saturate(2);
    transition: opacity 0.5s ease;
}

@keyframes foilShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}`;


// ===============
//    UTILITIES
// ===============

const log = (...args) =>
    CONFIG.debug
    && console.log('[Jira Customizer]', ...args);

// styles : list of text block to add in the HEAD of the page
function injectStyles(...styles) {
    styles.forEach(styleText => {
        const el = document.createElement('style');
        el.textContent = styleText;
        document.head.appendChild(el);
    });
};

function insertChildAtIndex(parent, child, index = 0) {
    if (index >= parent.children.length) {
        parent.appendChild(child);
    } else {
        parent.insertBefore(child, parent.children[index]);
    }
}

function wrapAndGetParent(container) {
    const wrapper = document.createElement("div");
    // add wrapper before the container
    container.parentNode.insertBefore(wrapper, container);
    // add the container inside it
    wrapper.appendChild(container);
    return wrapper;
}


// ===============
//      MAIN
// ===============
(function() {
    // inject CSS in the HEAD, to be accessible any time !
    injectStyles(css_wait,
                 css_rainbow,
                 css_shake,
                 css_hover,
                 css_foil);

    // observe the page, and call the "check" method
    new MutationObserver(check).observe(document, {childList: true, subtree: true});
})();


function createShine() {
    // create "shine" effect, displayed with the 3D movement
    let shine = document.createElement("div");
    shine.classList.add("shine");

    Object.assign(shine.style, {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        transform: "translateZ(1px)",
        zIndex: 9,
        pointerEvents: "none",
    });
    return shine;
}

// addapted from : https://codepen.io/MuriloFeranti/pen/JrgRJo?editors=1111
function apply3d(container) {
    if (!container || !(container instanceof HTMLElement)) {
        console.warn("[apply3DEffect] invalid param", container);
        return;
    }

    // do nothing if already set on the element
    if (container.dataset.hover3dApplied === "true") return;
    container.dataset.hover3dApplied = "true";

    const settings = {
        perspective: 1000,
        sensitivity: 10,
        invert: true,
        shine: true,
        hoverInClass: "hover-in",
        hoverOutClass: "hover-out"
    };

    // small "hack" to add the container inside a root DIV
    const outer = wrapAndGetParent(container);
    const inner = container;

    // need carrefull setup to have a true perspective
    outer.style.perspective = settings.perspective + "px"; // add perspective ONLY to the outer div
    inner.style.transformStyle = "preserve-3d";

    // create "shine" effect
    const shine = createShine()

    function hoverIn() {
        if (settings.shine) {
            inner.appendChild(shine);
        }

        inner.classList.add(settings.hoverInClass, settings.hoverClass);
        setTimeout(() => {
            inner.classList.remove(settings.hoverInClass);
        }, 1000);
    }
    container.addEventListener("mouseenter", hoverIn);

    let lastFoilUpdate = 0;
    function hoverMove(e) {
        const rect = inner.getBoundingClientRect();
        const w = inner.offsetWidth;
        const h = inner.offsetHeight;
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const rotateY = settings.invert
            ? (w / 2 - offsetX) / settings.sensitivity
            : -(w / 2 - offsetX) / settings.sensitivity;

        const rotateX = settings.invert
            ? -(h / 2 - offsetY) / settings.sensitivity
            : (h / 2 - offsetY) / settings.sensitivity;

        const dx = offsetX - w / 2;
        const dy = offsetY - h / 2;
        let angle = (180 * Math.atan2(dy, dx)) / Math.PI - 90;
        if (angle < 0) angle += 360;

        inner.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;

        if (shine) {
            // start with a strong white opacity
            const startOpacity = (offsetY / h) * 0.9;
            // end with a light gray opacity (make the effect more visible on white backgrounds)
            let endOpacity = 0.1;
            const foilDiv = container.querySelector(".foil");
            if (foilDiv) {
                // cancel the opacity, to not interact with the "foil" effect
                endOpacity = 0;
            }
            // create the effect with a 0% to 80% gradient
            shine.style.background = `linear-gradient(${angle}deg,
                                      rgba(255,255,255,${startOpacity}) 0%,
                                      rgba(010,010,010,${endOpacity}) 80%)`;
        }

        // don't update the effect for each pixel !
        const now = Date.now();
        if (now - lastFoilUpdate > CONFIG.foilMaxFps) {
            updateFoilHoverMove(container, e);
            lastFoilUpdate = now;
        }
    }
    container.addEventListener("mousemove", hoverMove);

    function hoverOut() {
        // TODO : use the same detection logic for "foil" and "shine"
        if (settings.shine) {
            // remove the effect
            inner.removeChild(shine);
        }
        const foilDiv = container.querySelector(".foil");
        if (foilDiv) {
            // remove the overriding effect
            foilDiv.style.removeProperty("background");
        }

        // reset positions
        inner.style.transform = `rotateX(0deg) rotateY(0deg)`;

        inner.classList.add(settings.hoverOutClass);
        setTimeout(() => {
            inner.classList.remove(settings.hoverOutClass);
        }, 1000);
    }
    container.addEventListener("mouseleave", hoverOut);
}

// add the "foil" effect on the container
function applyFoilEffect(container) {
    if (container.querySelector('.foil')) return;

    const foil = document.createElement('div');
    foil.classList.add('foil');
    container.style.position = 'relative';
    container.appendChild(foil);
}

// update effect with mouse interaction
function updateFoilHoverMove(container, event) {
    const foilDiv = container.querySelector('.foil');
    if (!foilDiv) return;

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);

    // override Background according to mouse movement
    // (can be removed, to return to the initial state)
    foilDiv.style.background =
        `linear-gradient(
        ${angle}deg,
        rgba(255, 0, 255, 0.15),
        rgba(0, 255, 255, 0.15),
        rgba(255, 255, 0, 0.15),
        rgba(0, 255, 127, 0.15),
        rgba(127, 0, 255, 0.15))`;
}


// Entrypoint method to apply ALL the effects
function addEffects(nodeItem) {
    apply3d(nodeItem);

    // Jira Card that have a "Days" component at the bottom
    const regexDays = /(ghx-days-)(\d+)/g;
    let nodeItemClass = nodeItem.classList;
    nodeItemClass.forEach(function(className) {
        // use "matchAll" to retrieve all groups of the regex
        const numberOfDays = Array.from(className.matchAll(regexDays), m => m[2])[0];
        if (numberOfDays > CONFIG.dayThreshold){
            nodeItem.classList.add("css_shake");
        }
    });

    // Jira Card that have extra fields (class = "ghx-extra-field-content")
    let extraFieldNodeList = nodeItem.querySelectorAll("span.ghx-extra-field-content");
    extraFieldNodeList.forEach(function(eNodeItem) {
        if(eNodeItem.textContent.startsWith(CONFIG.matchers.waiting)) {
            nodeItem.style.background = "lightgray";
            // check if our DIV is already there (otherwize, it will hug the CPU by creating infinite DOM elements)
            if (nodeItem.querySelectorAll("div.css_wait").length <= 0) {
                let div = document.createElement("div");
                div.classList.add("css_wait");
                div.innerHTML = "WAIT";
                insertChildAtIndex(nodeItem, div, 0);
            }
        }
        else if(eNodeItem.textContent.startsWith(CONFIG.matchers.toReview)) {
            nodeItem.style.background = "lightpink";
        }
        else if(eNodeItem.textContent.startsWith(CONFIG.matchers.resolved)) {
            //nodeItem.classList.add("css_rainbow");
            applyFoilEffect(nodeItem);
        }
    });
}


// Method called for each DOM element update. Then call "addEffects()" on all nodes.
// This requires verification code in other methods, but it allows us to actually catch ALL elements every time.
function check(changes, observer) {
    //observer.disconnect(); // Panic Button if we want to debug the script
    log("Observer hit");

    // search node with the class "ghx-issue" and a specific child
    const nodeList = document.querySelectorAll('div.ghx-issue:has(span.ghx-extra-field-content)');
    nodeList.forEach(addEffects);
}
