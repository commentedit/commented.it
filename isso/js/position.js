
/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var position = function(page_element_id) {

    "use strict";

    var page = document.getElementById(page_element_id);
    var isso = document.getElementById("isso-thread");

    var column = function() {
        page.style.margin-left = "5%";
        isso.style.position = "fixed";
        isso.style.left = "calc(" + page.offsetWidth + "px + 5%)";
    }

    var basic = function() {
        page.style.margin-left = "auto";
        isso.style.position = "static";
    }

    return {
        column: column,
        basic: basic
    };

};


