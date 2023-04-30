// ==UserScript==
// @name         RedMine Wiki
// @version      1.0.0
// @description  extend the display arrea of the redmine modification wiki page
// @author       Iron-Wolf (https://github.com/Iron-Wolf)
// @include      http*://redmine*.com/*/wiki/*/edit
// @grant        none
// @updateUrl    https://github.com/Iron-Wolf/Userscripts/raw/master/redmine_wiki.user.js
// @license      MIT
// ==/UserScript==

(function() {
    /*this script extend the display arrea of the redmine modification wiki page*/
    setTimeout(function(){
        document.getElementById("cke_1_contents").style.height = '1000px';
    }, 1000);

})();
