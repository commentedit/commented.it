
/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function position(page_element_id, default_mode) {

    "use strict";

    /* Default mode can be "basic" or "column" */

    var page = document.getElementById(page_element_id);
    var isso = document.getElementById("isso-thread");
    var first_call = true;

    this.column = function() {
        if (first_call) {
            isso.style.position = "fixed";
        }
        else {
            var handler = function() {
                isso.style.position = "fixed";
                page.removeEventListener("transitionend", handler);
            };
            page.addEventListener("transitionend", handler);
        }
        page.style.marginLeft = "5%";
        isso.style.left = "calc(" + page.clientWidth + "px + 10%)";
        isso.style.right = "5%";
    };

    this.basic = function() {
        isso.style.position = "static";
        page.style.marginLeft = (window.innerWidth - page.clientWidth) / 2 + "px";
    };

    /* Switch to default mode before setting a transition */
    if (default_mode == "column") {
        this.column();
    }
    else {
        this.basic();
    }
    first_call = false;

    page.style.transition = "margin-left 1s";
};


