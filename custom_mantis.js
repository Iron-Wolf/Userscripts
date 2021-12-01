// ==UserScript==
// @name            Custom Mantis
// @version         2.0.0
// @description     Customize mantis dashboard
// @description:fr  Regardez des vidéos YouTube avec des restrictions d'âge sans vous inscrire et sans confirmer votre âge :)
// @author          Iron-Wolf (https://github.com/Iron-Wolf)
// @supportURL      https://github.com/Iron-Wolf/Userscripts/issues
// @license         MIT
// @match           http*://mantis.cnc.fr/*
// @grant           none
// @run-at          document-end
// @compatible      chrome Chrome + Tampermonkey or Violentmonkey
// @compatible      firefox Firefox + Greasemonkey or Tampermonkey or Violentmonkey
// @compatible      opera Opera + Tampermonkey or Violentmonkey
// @compatible      edge Edge + Tampermonkey or Violentmonkey
// @compatible      safari Safari + Tampermonkey or Violentmonkey
// ==/UserScript==


/* ~~~ CONFIG ~~~ */

/* Mapping array containing all string thats need to be removed from the Table. 
You must follow the format : ["column title", "string to remove"] */
var removeStringColRow = [
	["État", "Nouvelle fiche"]
];

/* Mapping array to specify how the row should be styled.
You must follow the format : ["class element", "color"]
The "class element" can be retrived in the <i> tag of the column. */
var mappingColors = [
	["status-70-fg", "#ff9999"],
	["status-20-fg", "lightcyan"]
];


/* ~~~ MAIN ~~~ */
(function() {
	var tableColumn = document.querySelectorAll("table#buglist > thead > tr > th");
	var tableRows = document.querySelectorAll("table#buglist > tbody > tr");
	
	/* === delete row from the table === */
	for (const stringColRow of removeStringColRow) {
		var colTitle = stringColRow[0];
		var rowString = stringColRow[1];
		
		/* find index of the column */
		var colIndex = 0;
		tableColumn.forEach(function(columnItem) {
			if (columnItem.innerHTML.includes(colTitle)) {
				/* loop on all row, and remove those that contain the string to be deleted */
				configStatusColumn(tableRows, rowString, colIndex, function(item){
					item.remove();
				});
				/* stop process */
				return;
			}
			colIndex++;
		});
	}
	
	/* === change style of elements === */
	for (const colorItem of mappingColors) {
		var className = colorItem[0];
		var colorString = colorItem[1];
		
		configStatusColumn(tableRows, className, 6, function(item){
			item.style.backgroundColor = colorString;
		});
	}
})();


/* ~~~ METHODS ~~~ */
function configStatusColumn(elementList, match, colIndex, callback) {
    elementList.forEach(function(item) {
        /*check if inner element contains the string */
        var elem = item.childNodes[colIndex];
        if (elem !== null && elem.innerHTML.includes(match)){
            /* the element is found, we execute the callback */
            if (callback!== null && isFunction(callback)) {
				callback(item);
			}
        }
    });
}

/* see test perf here : https://jsperf.com/alternative-isfunction-implementations */
function isFunction(object) {
    return !!(object && object.constructor && object.call && object.apply);
}
