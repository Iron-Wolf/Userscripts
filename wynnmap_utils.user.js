// ==UserScript==
// @name         WynnMap Utils
// @version      0.0.3
// @description  Enhance your wynncraft map experience with custom controls
// @author       Iron-Wolf (https://github.com/Iron-Wolf)
// @license      MIT
// @include      http*://www.wynndata.tk/map/*
// @icon         https://www.wynndata.tk/assets/images/nav/map.png
// @updateUrl    https://github.com/Iron-Wolf/Userscripts/raw/master/wynnmap_utils.user.js
// @require      https://cdn.jsdelivr.net/gh/xxjapp/xdialog@3/xdialog.min.js
// @resource     XDIAG_CSS  https://cdn.jsdelivr.net/gh/xxjapp/xdialog@3/xdialog.min.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

/* ~~~ RESSOURCES ~~~ */
var cssXdiag = GM_getResourceText ("XDIAG_CSS");
GM_addStyle (cssXdiag);

// global variables (initialised in "initLoop" method)
var leafMap = null;
//var markerArray = [] // list of saved marker
var defaultIcon = null;
var questIcon = null;

// custom sleep (doesn't exit in JS)
const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

/*
Init variable AFTER the js of the website has finished loading.
This method must be declared before actually using it.
*/
async function initLoop() {
    // wait for objects to be initialised
    while (typeof L === typeof undefined) {
        console.log('Wait objetcs init...');
        await sleepNow(100); // in milliseconds
    }

    leafMap = map; // retrieve map created by the website
    defaultIcon = L.icon({
        iconUrl: 'https://cdn.wynncraft.com/img/ico/ms-icon-150x150.png',
        iconSize: [20, 20]
    });
    questIcon = L.icon({
        iconUrl: 'https://cdn.wynncraft.com/img/help/modals/HELPCONTENT_Quests.png',
        iconSize: [20, 20]
    });
    //console.log(leafMap)

    main();
}


/* ~~~ MAIN ~~~ */
(function() {
    'use strict'
    initLoop();
})()

/* Start main logic */
function main() {
    var bodyNode = document.querySelector('body');
    createButton(bodyNode, 'markButton', function(){
        xdialog.open({
            title: 'Place a marker on the map',
            body: '\
<style>\
.diag-row { text-align: center; }\
.diag-row label { text-align: right; margin-right: 0.5em; }\
.diag-validated input { border: green 2px solid; }\
.diag-validated input:invalid { border: red 2px solid; }\
</style>\
<div id="coord-form">\
<table style="width:90%">\
<tr>\
    <td><div class="diag-row"><label id="label-x" for="coord-x">X : </label><input id="coord-x" tabindex="1" type="number" required></div></td>\
    <td colspan="2"><div class="diag-row">\
        <select id="selectIcons" tabindex="3">\
            <option value="defaultIcon">Default</option>\
            <option value="questIcon">Quest</option>\
        </select>\
    </div></td>\
</tr>\
<tr>\
    <td><div class="diag-row"><label for="coord-z">Z : </label><input id="coord-z" tabindex="2" type="number" required></div></td>\
</tr>\
</table>\
</div>',
            buttons: { ok: 'Add', cancel: 'Cancel' },
            aftershow: function() {
                // set focus after the transition animation (0,3s)
                window.setTimeout(function (){
                    document.getElementById('coord-x').focus();
                }, 300)
            },
            onok: function() {
                // add validation style
                document.getElementById('coord-form').classList.add('diag-validated')
                // check coords
                var coordX = document.getElementById('coord-x').value
                var coordZ = document.getElementById('coord-z').value
                if (!coordX || !coordZ) {
                    // error: keep dialog open
                    return false
                }
                // init marker icon
                var selectedIcon = document.getElementById('selectIcons').value
                var icon;
                switch(selectedIcon){
                    case 'questIcon':
                        icon = questIcon
                        break;
                }
                // add marker
                var latLng = convertToCoord(coordX,coordZ)
                var marker = createMarker(latLng, icon)
                addToMarkerList(marker)
                leafMap.panTo(latLng)
            }
        })
    })

    // create the list of markers
    var markerList = document.createElement('ul')
    markerList.id = 'markerList'
    markerList.style = 'cursor: pointer; position: absolute; z-index: 401; margin-top: 2em; background: black; padding: 1em; list-style: none'
    bodyNode.insertBefore(markerList, bodyNode.childNodes[0])
}


/* ~~~ METHODS ~~~ */
/* Create a marker */
function createMarker(coord, icon=defaultIcon, popup = null) {
    var newMarker = L.marker(coord, {icon:icon})
    newMarker.addTo(leafMap)

    if (popup) {
        newMarker.bindPopup(popup)
    }
    return newMarker
}

/* Add marker to the list */
function addToMarkerList(marker) {
    var li = document.createElement('LI')
    var span = document.createElement('SPAN')
    span.style = 'display: inline'
    var xz = convertToXZ(marker._latlng.lat, marker._latlng.lng)
    var t = document.createTextNode(xz)
    span.appendChild(t)
    li.appendChild(span)

    // center map on click
    span.onclick = function() {
        leafMap.panTo(marker._latlng)
    }
    // close button
    var spanClose = document.createElement('SPAN')
    spanClose.style = 'display: inline; margin-left: 1em'
    spanClose.setAttribute('onmouseover', 'this.style.color="red"')
    spanClose.setAttribute('onmouseout', 'this.style.color="white"')
    var txt = document.createTextNode('\u00D7')
    spanClose.appendChild(txt)
    li.appendChild(spanClose)
    spanClose.onclick = function() {
        //var m = markerArray[marker._leaflet_id]
        leafMap.removeLayer(marker)
        li.style.display = 'none'
    }

    markerList.appendChild(li)
    //markerArray[marker._leaflet_id] = marker
}

/* Add button in DOM element */
function createButton(context, id, func) {
    // check if button already exist
    if (document.getElementById(id) != null) {
        return;
    }

    var button = document.createElement('button')
    button.id = id
    button.type = 'button'
    button.innerHTML = 'Add marker'
    // style
    button.style = 'cursor: pointer; position: absolute; z-index: 401; color: black;'
    //button.className = 'icon icon-enter-full-screen';
    // business
    button.onclick = func
    context.insertBefore(button, context.childNodes[0])
    //context.appendChild(button)
}

/*
Convert Wynncraft coord to leafletjs coord
 x => lng
 z => lat

wynncraft coord
 ---> X : 80
 |
 V Z

leafletjs coord
 Λ lat
 |
 ---> lng : 10
*/
function convertToCoord(x, z) {
    var lat = -(z / 8)
    var lng = x / 8
    return [lat,lng]
}

function convertToXZ(lat, lng) {
    var x = lng * 8
    var z = -(lat * 8)
    return [x,z]
}

