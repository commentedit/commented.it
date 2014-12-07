
/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function position(page_element_id, default_mode) {

    "use strict";

    /* Default mode can be "basic" or "column" */

    var page = document.getElementById(page_element_id);
    var isso = document.getElementById("isso-thread");

    this.column = function() {
        page.style.marginLeft = "5%";
        isso.style.position = "fixed";
        isso.style.left = "calc(" + page.clientWidth + "px + 10%)";
    };

    this.basic = function() {
        page.style.marginLeft = (window.innerWidth - page.clientWidth) / 2 + "px";
        isso.style.position = "static";
    };

    /* Switch to default mode before setting transition */
    if (default_mode == "column") {
        this.column();
    }
    else {
        this.basic();
    }

    page.style.transition = "margin-left 1s";
};


