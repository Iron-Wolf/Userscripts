// ==UserScript==
// @name         RedMine ScrumBoard
// @version      1.0.1
// @description  Hide peer reviewers in Redmine
// @author       Iron-Wolf (https://github.com/Iron-Wolf)
// @grant        none
// @include      http*://redmine*.com/sprints*
// @updateUrl    https://github.com/Iron-Wolf/Userscripts/raw/master/redmine_scrumboard.user.js
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    /*this script hide unwanted project version, from the Sprint view, in RedMine*/
    var hrefLink46 = 'https://img.shields.io/badge/-4.6-brightgreen.svg';

    /* not usefull anymore, with the new Board */
    /* toggle_vis("pbi_13164_row", hrefLink46); /* 4.7 */
    /* toggle_vis("pbi_13146_row", hrefLink46); /* TMA */

    /*hidde peer reviewers*/
    var sheet = getStyleSheet("scrum.css");
    var rule = getStyle(sheet, ".doers-reviewers-post-its-container");
    rule.style.visibility = "collapse";

    /* reduce size of all modal dialog */
    var targetDivObs = document.querySelector("body");
    var configObs = { attributes: true, childList: true, characterData: true };
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            /* callback for each mutation */
            for (var node of mutation.addedNodes) {
                /* reset the style every time the modal is displayed */
                var targetDivModal = document.querySelector("div#ajax-modal");
                targetDivModal.style.height = "80vh";
            }
        });
    });
    observer.observe(targetDivObs, configObs);
})();

/*swap visibility of given element id*/
function toggle_vis(id, hrefLink) {
 var e = document.getElementById(id);
 if(e.style.visibility == 'visible' || e.style.visibility == '') {
  e.style.visibility = 'collapse';
  change_img(hrefLink);
 }
 else {
  e.style.visibility = 'visible';
  change_img('https://redmine.open-groupe.com/favicon.ico');
 }
}

function change_img(hrefLink) {
 var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
 link.type = 'image/x-icon';
 link.rel = 'shortcut icon';
 link.href = hrefLink;
 document.getElementsByTagName('head')[0].appendChild(link);
}

/*return reference to the stylesheet*/
function getStyleSheet(title) {
  for(var i=0; i<document.styleSheets.length; i++) {
    var sheet = document.styleSheets[i];
    if (sheet.href !== null && sheet.href.endsWith(title)){
      return sheet;
    }
  }
}

/*return reference to the selector*/
function getStyle(sheet, title) {
  for(var i=0; i<sheet.cssRules.length; i++) {
    var rule = sheet.cssRules[i];
    if (toType(rule) != "cssimportrule" && toType(rule) != "cssmediarule"
        && rule.selectorText !== null && rule.selectorText.endsWith(title)){
      return rule;
    }
  }
}

function toType(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}
