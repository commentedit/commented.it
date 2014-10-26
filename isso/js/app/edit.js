
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(["app/dom", "app/i18n"], function($, i18n) {

    "use strict";

    var mode = "reading";
    var article = $("article");
    var original_article = article.innerHTML;
    var new_article = null;

    var init = function() {
        if (mode == "reading") {
            mode = "commenting";
            article.setAttribute("contenteditable", true);
            article.on("keyup", maybe_article_just_changed);
        }
    };

    var maybe_article_just_changed = function() {
        var current = article.innerHTML;
        if (current != original_article) {
            new_article = current;
        }
        else {
            new_article = null;
        }
    };

    var cancel = function() {
        if (mode == "commenting") {
            article.setAttribute("contenteditable", false);
            if (new_article != null) {
                article.innerHTML = original_article;
                new_article = null;
            }
            mode = "reading";
        }
    }

    return {
        init: init,
        new_article: function() {return new_article;},
        cancel: cancel
    };
});

