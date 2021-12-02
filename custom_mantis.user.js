// ==UserScript==
// @name            Custom Mantis
// @version         2.0.0
// @description     Customize mantis dashboard
// @description:fr  Customise l'interface mantis. Inclus un moteur de filtrage et de coloration syntaxique fait maison.
// @author          Iron-Wolf (https://github.com/Iron-Wolf)
// @supportURL      https://github.com/Iron-Wolf/Userscripts/issues
// @license         MIT
// @include         http*://mantis.cnc.fr/*
// @grant           none
// @run-at          document-end
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
    main();
})();

function main() {
    var tableColumn = document.querySelectorAll("table#buglist > thead > tr > th");
    var tableRows = document.querySelectorAll("table#buglist > tbody > tr");

    console.log("eee");
    /* === delete row from the table === */
    for (const stringColRow of removeStringColRow) {
        var colTitle = stringColRow[0];
        var rowString = stringColRow[1];

        // find index of the column
        var colIndex = 0;
        for (const columnItem of tableColumn) {
            if (columnItem.innerHTML.includes(colTitle)) {
                // loop on all row, and remove those that contain the string to be deleted
                configStatusColumn(tableRows, rowString, colIndex, function(item){
                    item.remove();
                });
                // stop process
                break;
            }
            colIndex++;
        }
    }

    /* === change style of elements === */
    for (const colorItem of mappingColors) {
        var className = colorItem[0];
        var colorString = colorItem[1];

        configStatusColumn(tableRows, className, null, function(item){
            item.style.backgroundColor = colorString;
        });
    }
}

/* ~~~ METHODS ~~~ */
function configStatusColumn(rowList, match, colIndex, callback) {
    var itemToCallBack;

    for (const rowItem of rowList) {
        if (colIndex === null) {
            // colIndex is not specified, we search inside the entire row item
            if (typeof rowItem !== typeof undefined &&
                typeof rowItem.innerHTML !== typeof undefined &&
                rowItem.innerHTML.includes(match))
            {
                itemToCallBack = rowItem;
            }
        }
        else {
            // some row have ghost column in childNodes,
            // we need to rebuild the list of childNodes
            var tdListforRow = [];
            for (const childItem of rowItem.childNodes) {
                if (childItem.tagName === "TD") {
                    tdListforRow.push(childItem);
                }
            }

            // check if inner element contains the string
            var elem = tdListforRow[colIndex];
            if (typeof elem !== typeof undefined &&
                typeof elem.innerHTML !== typeof undefined &&
                elem.innerHTML.includes(match))
            {
                itemToCallBack = rowItem;
            }
        }
    }

    if (itemToCallBack !== undefined &&
        callback!== null && isFunction(callback)) {
        // the element is found, we execute the callback
        callback(itemToCallBack);
    }
}

// see test perf here : https://jsperf.com/alternative-isfunction-implementations
function isFunction(object) {
    return !!(object && object.constructor && object.call && object.apply);
}
