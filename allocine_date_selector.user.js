// ==UserScript==
// @name         Allocine - date selector
// @version      1.0.0
// @description  Show date selector when scrolling
// @author       Iron-Wolf (https://github.com/Iron-Wolf)
// @grant        none
// @include      http*://www.allocine.fr/*
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    var targetSpan = document.querySelector("span#js-date-selector");
    if (targetSpan !== null){
        // add class
        targetSpan.classList.add("header-nav");
        // add style
        targetSpan.style.marginTop = "70px";
        targetSpan.style.zIndex = "1";
    }
})();
