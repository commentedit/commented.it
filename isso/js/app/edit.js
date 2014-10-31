
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(["app/dom", "app/i18n", "diff_match_patch"], function($, i18n) {

    "use strict";

    var mode = "reading";
    var article = $("article");
    var original_article = article.innerHTML;
    var new_article = null;

    var original_button = $.htmlify("<button>" + i18n.translate("show-original") + "</button>");

    // make a diff_match_patch object once and for all
    var dmp = new diff_match_patch();

    var init = function() {
        if (mode === "reading") {
            mode = "commenting";
            article.setAttribute("contenteditable", true);
            article.on("keyup", maybe_article_just_changed);
        }
    };

    var maybe_article_just_changed = function() {
        var current = article.innerHTML;
        if (current !== original_article) {
            new_article = current;
        }
        else {
            new_article = null;
        }
    };

    var cancel = function() {
        if (mode === "commenting") {
            article.setAttribute("contenteditable", false);
            if (new_article !== null) {
                article.innerHTML = original_article;
                new_article = null;
            }
            mode = "reading";
        }
    };

    var show = function(comment) {
        // let's curry!
        return function() {
            if (mode === "reading") {
                article.innerHTML = comment.edit.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                original_button.show();
            }
        };
    };

    var show_original = function() {
        if (mode === "reading") {
            article.innerHTML = original_article;
            original_button.hide();
        }
    };

    original_button.on("click", show_original);
    original_button.hide();
    article.insertAfter(original_button);

    return {
        init: init,
        new_article: function() {return new_article.replace(/&lt;/g, "<").replace(/&gt;/g, ">");},
        cancel: cancel,
        show: show
    };
});

