// ==UserScript==
// @name            Jira - Gitlab
// @version         1.0.0
// @description     Add clickable link in GitLab MR views, to Jira 
// @description:fr  Ajoute un lien cliquable dans l'interface GitLab, vers Jira
// @author          Iron-Wolf (https://github.com/Iron-Wolf)
// @updateUrl       https://github.com/Iron-Wolf/Userscripts/raw/master/gitlab_link_to_jira.user.js
// @supportURL      https://github.com/Iron-Wolf/Userscripts/issues
// @license         MIT
// @include         http*://gitlab.example.prod/*
// @grant           none
// ==/UserScript==

const JIRA_BASE_URL = "https://jira.example.com/browse/";
const REGEX_JIRA_ID = /\[MEL-\d{4}\]/;

(function() {
    // mr list
    var mrRows = document.querySelectorAll("div.merge-request-title a");
    // mr page
    if (mrRows.length == 0) {
        mrRows = document.querySelectorAll("h1.title");
    }

    mrRows.forEach(function(item) {
        const jiraIdArray = item.innerHTML.match(REGEX_JIRA_ID);
        if (jiraIdArray != null) {
            // get the first match and remove the brackets (to use it in the href)
            const jiraId = jiraIdArray[0].replace(/\[|\]/g, "");
            console.log(jiraId);
            const jiraLink = JIRA_BASE_URL + jiraId;

            var newHtml = item.innerHTML.replace(REGEX_JIRA_ID, `<a href="${jiraLink}" style="background: cyan;">${jiraIdArray[0]}</a>`);
            item.innerHTML = newHtml;
        }
    });
})();
