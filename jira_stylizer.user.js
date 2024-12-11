// ==UserScript==
// @name            Jira's Supercharged Quantum-Powered Stylizer of Doom
// @version         1.0.0
// @description     Bring your Jira experience to new levels and boost your productivity
// @description:fr  Jira en tout pareil, mais c'est différent
// @author          Iron-Wolf (https://github.com/Iron-Wolf)
// @include         http*://jira.example.prod/*
// @grant           none
// @unwrap
// ==/UserScript==


// CSS Styles injected in the HEAD
var css_wait = `
.css_wait {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 100px;
  z-index: 1;
  opacity: 0.5;
  rotate: -20deg;
}
`;

var css_rainbow = `
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
}
`;

var css_shake = `
.css_shake {
  animation: tilt-n-move-shaking 0.50s infinite !important;
}

@keyframes tilt-n-move-shaking {
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(0, 0) rotate(2deg); }
  50% { transform: translate(0, 0) rotate(0deg); }
  75% { transform: translate(0, 0) rotate(-2deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}
`;

(function() {
    var cssWait = document.createElement("style");
    cssWait.textContent = css_wait;
    document.head.appendChild(cssWait);

    var cssRainbow = document.createElement("style");
    cssRainbow.textContent = css_rainbow;
    document.head.appendChild(cssRainbow);

     var cssShake = document.createElement("style");
    cssShake.textContent = css_shake;
    document.head.appendChild(cssShake);
})();

(new MutationObserver(check)).observe(document, {childList: true, subtree: true});

// can be dangerous : https://stackoverflow.com/a/507157
Element.prototype.insertChildAtIndex = function(child, index) {
  if (!index) index = 0;
  if (index >= this.children.length) {
    this.appendChild(child);
  } else {
    this.insertBefore(child, this.children[index]);
  }
}

function check(changes, observer) {
    // search node with the class "ghx-issue" and a specific child
    var nodeList = document.querySelectorAll("div.ghx-issue:has(span.ghx-extra-field-content)");
    const regexDays = /(ghx-days-)(\d+)/g;

    if(nodeList.length > 0) {
        //observer.disconnect(); // Panic Button if we want to debug the script
        nodeList.forEach(function(nodeItem) {
            // Jira Card that have a "Days" component at the bottom
            var nodeItemClass = nodeItem.classList;
            nodeItemClass.forEach(function(className) {
                // use "matchAll" to retrieve all groups of the regex
                const numberOfDays = Array.from(className.matchAll(regexDays), m => m[2])[0];
                if (numberOfDays > 100){
                    nodeItem.classList.add("css_shake");
                }
            });

            // Jira Card that have extra fields (class = "ghx-extra-field-content")
            var extraFieldNodeList = nodeItem.querySelectorAll("span.ghx-extra-field-content");
            extraFieldNodeList.forEach(function(eNodeItem) {
                if(eNodeItem.textContent.startsWith("Waiting")) {
                    nodeItem.style.background = "lightgray";
                    // check if our DIV is already there (otherwize, it will hug the CPU by creating infinite DOM elements)
                    if (nodeItem.querySelectorAll("div.css_wait").length <= 0) {
                        var div = document.createElement("div");
                        div.classList.add("css_wait");
                        div.innerHTML = "WAIT";
                        nodeItem.insertChildAtIndex(div, 0);
                    }
                }
                else if(eNodeItem.textContent.startsWith("A revoir")) {
                    nodeItem.style.background = "lightpink";
                }
                else if(eNodeItem.textContent.startsWith("Résolue")) {
                    nodeItem.classList.add("css_rainbow");
                }
            });
        });
    }
}

