
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(["app/dom", "app/i18n", "app/utils", "diff_match_patch"], function($, i18n, utils) {

    "use strict";

    var mode = "reading";
    var article = $("article");
    var original_article = utils.clean_html(article.innerHTML);
    var new_article = null;

    var original_button = $.htmlify("<button>" + i18n.translate("show-original") + "</button>");

    // make a diff_match_patch object once and for all
    var dmp = new diff_match_patch();

    var init = function(comment_field) {
        // let's curry!
        return function() {
            if (mode === "reading" && comment_field.innerHTML !== "") {
                mode = "commenting";
                article.setAttribute("contenteditable", true);
                article.on("keyup", maybe_article_just_changed);
            }
            else if (mode === "commenting" && comment_field.innerHTML === ""
                                           && new_article === null) {
                mode = "reading";
                article.setAttribute("contenteditable", false);
            }
        };
    };

    var maybe_article_just_changed = function() {
        var current = utils.clean_html(article.innerHTML);
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
            if (mode === "reading" || mode === "reading_modification") {
                var array = JSON.parse(utils.tags_from_text(comment.edit));
                var html = dmp.diff_prettyHtml(array);
                article.innerHTML = utils.tags_from_text(html);
		original_button.show();
                mode = "reading_modification";
            }
        };
    };

    var show_original = function() {
        if (mode === "reading_modification") {
            article.innerHTML = original_article;
            original_button.hide();
            mode = "reading";
        }
    };

    original_button.on("click", show_original);
    original_button.hide();
    article.insertAfter(original_button);

    return {
        init: init,
        new_article: function() {
            var new_text = utils.tags_from_text(new_article);
            return JSON.stringify(dmp.diff_main(original_article,new_text));
        },
        cancel: cancel,
        show: show
    };
});

