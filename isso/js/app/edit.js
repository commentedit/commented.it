
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(["app/dom", "app/i18n", "app/utils", "diff_match_patch"], function($, i18n, utils) {

    "use strict";

    // mode can take values "reading", "reading_modification" and "commenting"
    var mode = "reading";
    // if mode is "reading_modification", currently_showing stores id of comment
    var currently_showing;

    var article = $("article");
    var original_article = utils.clean_html(article.innerHTML);
    var new_article = null;

    var original_button = $.htmlify("<button>" + i18n.translate("show-original") + "</button>");

    // make a diff_match_patch object once and for all
    var dmp = new diff_match_patch();

    // will contain buttons for commenting area
    var cancel_button;

    var init = function(comment_postbox) {
        var comment_field = $(".textarea", comment_postbox);
        // let's curry!
        return function() {
            show_original();
            if (mode === "reading" && comment_field.innerHTML !== "") {
                mode = "commenting";
                article.setAttribute("contenteditable", true);
                // first time : create cancel button and associate event
                if (!cancel_button) {
                    cancel_button = $(".post-action", comment_postbox).prepend(
                      '<input type="reset" value="' + i18n.translate("postbox-cancel") + '"></input>');
                    cancel_button.on("click", function(e) {
                        if (confirm(i18n.translate("postbox-confirm-cancel"))) {
                            comment_field.innerHTML = "";
                            cancel();
                        }
                    });
                }
                else {
                  cancel_button.show();
                }
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
            cancel_button.hide();
            mode = "reading";
        }
    };

    var show = function(el, comment) {
        // let's curry!
        return function() {
            if (mode === "reading" || mode === "reading_modification") {
                if (currently_showing === comment.id) {
                    show_original();
                }
                else {
                    // print diffs
                    var array = JSON.parse(utils.tags_from_text(comment.edit));
                    var html = dmp.diff_prettyHtml(array);
                    article.innerHTML = html;

                    // add button to go back to standard reading mode
                    original_button.show();

                    // display selected comment in green and all others are set back to default
                    var comments = $(".isso-comment", null, false);
                    for (var i = 0; i < comments.length; i++) {
                        comments[i].style.background = "transparent";
                    }
                    el.style.background = "#e6ffe6";

                    mode = "reading_modification";
                    currently_showing = comment.id;
                }
            }
        };
    };

    var show_original = function() {
        if (mode === "reading_modification") {
            // restore original display
            article.innerHTML = original_article;
            original_button.hide();
            var comments = $(".isso-comment", null, false);
            for (var i = 0; i < comments.length; i++) {
                comments[i].style.background = "transparent";
            }
            mode = "reading";
            currently_showing = null;
        }
    };

    // define events
    original_button.on("click", show_original);
    article.on("keyup", maybe_article_just_changed);

    // add html elements
    original_button.hide();
    article.insertAfter(original_button);

    return {
        init: init,
        new_article: function() {
            if (new_article === null) {
                return null;
            }
            // otherwise we apply some pre-treatment before returning
            var new_text = utils.tags_from_text(new_article);
            var diffs = dmp.diff_main(original_article, new_text);
            dmp.diff_cleanupSemantic(diffs);
            return JSON.stringify(diffs);
        },
        cancel: cancel,
        show: show
    };
});

