
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(["app/dom", "app/i18n"], function($, i18n) {

    "use strict";

    var mode = "reading";

    var init = function() {
        if (mode == "reading") {
            mode = "commenting";
            $("article").setAttribute("contenteditable", true);
        }
    };

    return {
        init: init
    };
});

