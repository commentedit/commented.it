/* Copyright Théo Zimmermann 2014
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(["app/dom", "app/i18n", "app/utils", "diff_match_patch"], function($, i18n, utils) {

    "use strict";

    // mode can take values "reading", "reading_modification" and "commenting"
    var mode = "reading";
    // if mode is "reading_modification", currently_showing stores id of comment
    var currently_showing;

    // there must be only one <article> on the page
    var article = $("article");
    // but there can be many blocks in an article
    var blocks = $(".block", article, false);

    var original_article = utils.clean_html(article.innerHTML);
    var new_article = null;

    var original_content, new_content;

    // button to show the original version
    var original_button = $.htmlify('<button type="button">' + i18n.translate("show-original") + '</button>');

    // make a diff_match_patch object once and for all
    var dmp = new diff_match_patch();

    // remember some of the DOM elements
    var cancel_button, comment_field;

    // FUNCTION WHICH ENABLE COMMENTING AND EDITING

    var init = function(comment_postbox) {
        comment_field = $(".textarea", comment_postbox);
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
                  cancel_button.style.display = "inline";
                }
            }
            else if (mode === "commenting" && comment_field.innerHTML === ""
                                           && new_article === null) {
                cancel();
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
            if (comment_field.innerHTML === "") {
                cancel();
            }
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

    // FUNCTIONS TO SHOW COMMENTS / EDITS

    var show_block_comments = function() {
        // current block = block in the middle
        var center = window.pageYOffset + window.innerHeight/2;
        var i = 0;
        while (i < blocks.length && blocks[i].offsetTop <= center) { i++; }
        i--; // current block is block i
        blocks[i].style.backgroundColor = "gray";
    };

    var show_edit = function(el, comment) {
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
                    original_button.style.visibility = "visible";

                    // display selected comment in green and all others are set back to default
                    var comments = $(".isso-comment", null, false);
                    for (var i = 0; i < comments.length; i++) {
                        comments[i].style.background = "transparent";
                    }
                    el.style.background = "#e6ffe6";

                    // scroll to first change
                    $("#edit").scrollIntoView();

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
            original_button.style.visibility = "hidden";
            var comments = $(".isso-comment", null, false);
            for (var i = 0; i < comments.length; i++) {
                comments[i].style.background = "transparent";
            }
            mode = "reading";
            currently_showing = null;
        }
    };

    // DEFINE EVENTS

    original_button.on("click", show_original);

    article.on("keyup", maybe_article_just_changed);
    document.addEventListener("keydown", function(e) {
        if (e.keyCode === 27) {
            show_original();
        }
    });

    window.addEventListener("scroll", show_block_comments);

    // ADD HTML ELEMENTS
    original_button.style.visibility = "hidden";
    $("#isso-thread").prepend(original_button);

    // PUBLIC METHODS

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
        show: show_edit
    };
});

