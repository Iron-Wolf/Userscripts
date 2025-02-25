// ==UserScript==
// @name         Better Omnis Bibliotheca
// @version      2025-02-25
// @description  thème clair OMG ENFIN !!!
// @match        https://omnis-bibliotheca.com/*
// @icon         https://omnis-bibliotheca.com/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    // ---------------------
    //  tag-specific styles
    // ---------------------
    var divContent = document.querySelector("#content");
    divContent.style.setProperty('background', '#f2f2f2', 'important'); // everyone's background

    var tableNodes = document.getElementsByTagName("table");
    for (const tab of tableNodes) {
        // some table can have a "metal-table" class style that contains hard-coded font color...
        // this is to much of a hassle to handle here, so we set a dark-ish color palette and call it a day !
        tab.style.setProperty('background', '#312e46'); // static color for table
        tab.style.setProperty('color', '#C8C8C8'); // font color
    }

    // -------------------------
    //  global variables styles
    // -------------------------
    const root = document.querySelector(':root');
    root.style.setProperty('--default-title-color', '#0089dd'); // header color (need to work on white AND black background...)
    root.style.setProperty('--default-text-color', 'black'); // font color

    // use this to debug :
    //const color = getComputedStyle(root).getPropertyValue('--default-title-color');
})();
