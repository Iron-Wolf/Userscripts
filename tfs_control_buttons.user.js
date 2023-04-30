// ==UserScript==
// @name         TFS control buttons
// @version      1.0.2
// @description  this script add "minimize" and "expand" buttons to modal popup in TFS
// @author       abcd
// @include      http*://*/tfs/*
// @grant        none
// @updateUrl    https://github.com/Iron-Wolf/Userscripts/raw/master/tfs_control_buttons.user.js
// @license      MIT
// ==/UserScript==

// 1.0.2 : add unique id for the button
// 1.0.1 : expand edit area

(function(){
    /* this script add "minimize" and "expand" control to modal popup in TFS */
  
    /* obeserver waiting for popup, since only one popup is displayed at a time */
    var targetDivObs = document.querySelector("body");
    var configObs = { attributes: true, childList: true, characterData: true };
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            
            /* callback for each mutation */
            for (var node of mutation.addedNodes) {
                /* test if node is our modal popup */
                if (node.tagName === "DIV" && node.classList.contains("ui-dialog")) {
                    /* get the reference on the div itself from the node */
                    var myDiv = node.querySelector("div.ui-dialog-titlebar > button.ui-button");
                    if (myDiv != null) {
                        /* expand button */
                        
                        /* set default id */
                        var id = "expandButton";
                        
                        /* search a unique ID for the button */
                        var mySpan = myDiv.parentNode.querySelector("span");
                        if (mySpan != null && mySpan.id != null) {
                            id += mySpan.id;
                        }
                        
                        createButton(myDiv.parentNode, "30px", id, function() {
                            if (this.className == "icon icon-enter-full-screen") {
                                /* expand popup */
                                node.style.top = 0;
                                node.style.left = 0;
                                node.style.height = "100%";
                                node.style.width = "100%";
                                /* expand content */
                                node.childNodes[1].style.height = "90%";
                                /* width is automatic */
                                
                                /* change button icon */
                                this.className = "icon icon-exit-full-screen";
                                
                                /* Misc : expand edit area */
                                var panel = node.querySelector("div.workitemcontrol > div > div[id^='witc_']");
                                if (panel != null) {
                                    panel.style.height = "200%";
                                }
                            }
                            else {
                                /* reduce popup */
                                node.style.top = "10%";
                                node.style.left = "5%";
                                node.style.height = "80%";
                                node.style.width = "90%";
                                /* reduce content */
                                node.childNodes[1].style.height = "90%";
                                /* width is automatic */
                                
                                /* change button icon */
                                this.className = "icon icon-enter-full-screen";
                                
                                /* Misc : reduce edit area */
                                var panel = node.querySelector("div.workitemcontrol > div > div[id^='witc_']");
                                if (panel != null) {
                                    panel.style.height = "100%";
                                }
                            }
                        });
            
                        /* todo : minimize button
                        createButton(myDiv.parentNode, "30px", id, function(){
                            alert("allo");
                        });*/
                    }
                    else {
                        console.log("error : retrieveing close button");
                    }
                }
            }
            
        });
    });
    
    observer.observe(targetDivObs, configObs);
    
}
)();


function createButton(context, marg, id, func) {
    /* check if button already exist */
    if (document.getElementById(id) != null)
        return;
    
    var button = document.createElement("span");
    button.id = id;
    /*button.type = "button";*/
    button.title = "im a button";
    /* style */
    button.style = "cursor: pointer; float: right; margin-top: 6px; margin-right: " + marg;
    button.className = "icon icon-enter-full-screen";
    /* business */
    button.onclick = func;
    context.insertBefore(button, context.childNodes[0]);
    /*leave here if needed : context.appendChild(button);*/
}


/*return reference to the stylesheet*/
function getStyleSheet(title) {
  for(var i=0; i<document.styleSheets.length; i++) {
    var sheet = document.styleSheets[i];
    if (sheet.href !== null && sheet.href.indexOf(title) > -1) {
      return sheet;
    }
  }
}

/*return reference to the selector*/
function getStyle(sheet, title) {
    for(var i=0; i<sheet.cssRules.length; i++) {
        var rule = sheet.cssRules[i];
        /* check if undefined and not null */
        if (typeof rule.selectorText != "undefined" && rule.selectorText !== null && rule.selectorText.endsWith(title)) {
            return rule;
        }
    }
}

function insertAfter(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}
