// ==UserScript==
// @name            Jira Commentary Remover
// @version         2.0.0
// @description     Remove unwanted comments from Jira
// @description:fr  Supprime les commentaires inutiles dans l'interface Jira
// @author          Iron-Wolf (https://github.com/Iron-Wolf)
// @updateUrl       https://github.com/Iron-Wolf/Userscripts/raw/master/jira_commentary_remover.user.js
// @supportURL      https://github.com/Iron-Wolf/Userscripts/issues
// @license         MIT
// @include         http*://jira.open-groupe.com/*
// @icon            https://jira.open-groupe.com/jira-favicon-hires.png
// @icon            https://www.google.com/s2/favicons?domain=open-groupe.com
// @updateUrl       https://openuserjs.org/meta/abcd/Jira_Commentary_Remover.meta.js
// @grant           none
// ==/UserScript==

const SRV_ACCOUNT_NAME = 'srv_jira_boost';


// Wait until an element exists
function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function removeRows() {
    // search all element whose ID attribute value begins with 'comment'
    var commentRows = document.querySelectorAll("div[id^='comment']")
    commentRows.forEach(function(item) {
        console.log(item.innerHTML);
        // check if the element contains our string
        if (typeof item.innerHTML !== 'undefined' &&
            item.innerHTML.includes(SRV_ACCOUNT_NAME)) {
            item.remove()

            // use commented code below
            // to collapse the item instead of removing it
            //item.classList.remove('expanded')
            //item.classList.add('collapsed')
        }
    })
}

function mCallback(mutations) {
    mutations.forEach(function(mutation) {
        // callback for each mutation
        if (mutation.type === 'childList') {
            // a child node has been added or removed
            removeRows()
        }
    })
}


(function() {
    waitForElm('#issue_actions_container').then((iac) => {
        console.log('Element is ready');

        // setup the observer, to handle comments added with XHR request
        var configObs = { childList: true }
        var observer = new MutationObserver(mCallback)
        observer.observe(iac, configObs)

        // Load all collapsed elements if possible.
        // With Jira v9, we need to click multiple time on the button :
        // - first time : load 10 more comments
        // - second time : load ALL comments with the shift + clic on the button, but
        //    - pressing key on behalf of the user is REALY NOT easy
        //    - setTimout is not executed preperly in Tampermonkey
        // We just load the firt round of comments, for now...
        var collapsedRows = document.querySelectorAll("div.message-container > button");
        collapsedRows.forEach(function(item) {
            item.click();
        });

        // remove loaded comments
        removeRows()
    });

})();
