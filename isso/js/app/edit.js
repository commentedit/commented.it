/* Copyright Théo Zimmermann 2014
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(["app/dom", "app/i18n", "app/utils", "he", "diff_match_patch"], function($, i18n, utils, he) {

    "use strict";

    // ATTRIBUTES

    // mode can take values "reading", "reading_modification" and "commenting"
    var mode = "reading";
    // if mode is "reading_modification", currently_showing stores id of comment
    var currently_showing;

    // there must be only one <article> on the page
    var article = $("article");
    // but there can be many blocks in an article
    var blocks = $(".block", article, false);
    // in the case there is no block, current_block will always represent the full article
    var current_block = article;

    var original_content, new_content;

    // button to show the original version
    var original_button = $.htmlify('<button type="button">' + i18n.translate("show-original") + '</button>');

    // remember some of the DOM elements
    var cancel_button, comment_field;

    // INITIALIZE LIBRARIES

    // make a diff_match_patch object once and for all
    var dmp = new diff_match_patch();

    // CKEDITOR is not required thus we must check if it is available
    if (typeof CKEDITOR !== "undefined") {
        // turn off automatic editor creation once and for all
        CKEDITOR.disableAutoInline = true;
    }
    var editor;

    // AUXILIARY FUNCTIONS

    var highlight_current_block = function() {
        for (var i = 0; i < blocks.length; i++) {
            blocks[i].style.background = "transparent";
        }
        current_block.style.background = "rgba(211,211,211,0.5)";
    };

    // content after CKEditor reformatting
    // after decoding html entities
    // and after removing extra whitespace and new lines
    var getEditorContent = function() {
        return utils.clean_html(editor.getData());
    };

    var getBlockContent = function() {
        return utils.clean_html(current_block.innerHTML);
    }

    // FUNCTIONS WHICH ENABLE COMMENTING AND EDITING

    var init = function(comment_postbox) {
        comment_field = $(".textarea", comment_postbox);
        // let's curry!
        return function() {
            show_original();
            if (mode === "reading" && comment_field.innerHTML !== "") {
                mode = "commenting";
                original_content = getBlockContent();
                new_content = null;
                current_block.setAttribute("contenteditable", true);
                if (typeof CKEDITOR !== "undefined") {
                    editor = CKEDITOR.inline(current_block);
                    editor.on("instanceReady", function() {
                        editor.dataProcessor.writer.setRules("p", {
                            ident: false,
                            breakBeforeOpen: false,
                            breakAfterOpen: false,
                            breakBeforeClose: false,
                            breakAfterClose: false
                        });
                        original_content = getEditorContent();
                    });
                    editor.on("change", maybe_article_just_changed);
                }
                // first time : create cancel button and associate event
                if (!cancel_button) {
                    cancel_button = $(".post-action", comment_postbox).prepend(
                      '<input type="reset" value="' + i18n.translate("postbox-cancel") + '"></input>');
                    cancel_button.on("click", function(e) {
                        if (new_content === null ||
                            confirm(i18n.translate("postbox-confirm-cancel"))) {
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
                                           && new_content === null) {
                cancel();
            }
        };
    };

    var maybe_article_just_changed = function() {
        var current = typeof CKEDITOR === "undefined" ?
                        getBlockContent() :
                        getEditorContent();
        if (current !== original_content) {
            new_content = current;
        }
        else {
            new_content = null;
            if (comment_field.innerHTML === i18n.translate("postbox-text") ||
                comment_field.innerHTML === "") {
                current_block.blur();
                cancel();
            }
        }
    };

    var cancel = function() {
        if (mode === "commenting") {
            if (typeof editor !== "undefined") {
                editor.destroy();
            }
            current_block.setAttribute("contenteditable", false);
            if (new_content !== null) {
                current_block.innerHTML = original_content;
                new_content = null;
            }
            cancel_button.hide();
            mode = "reading";
        }
    };

    // FUNCTIONS TO SHOW COMMENTS / EDITS

    var show_block_comments = function() {
        // when showing an edit or commenting, the current block is locked
        // this function is useless if there are no blocks
        if (mode == "reading" && blocks !== null) {
            // current block = block in the middle
            var center = window.pageYOffset + window.innerHeight/2;
            var i = 0;
            while (i < blocks.length && blocks[i].offsetTop <= center) { i++; }
            current_block = blocks[i - 1];
            highlight_current_block();
        }
    };

    var show_edit = function(el, comment) {
        // let's curry!
        return function() {
            if (mode === "reading" || mode === "reading_modification") {
                if (currently_showing === comment.id) {
                    show_original();
                }
                else {
                    var previous_block = current_block;

                    // first check that the block associated with the comment
                    // exists or that there is no associated block simply
                    // because the page has no blocks
                    if (comment.block === "") {
                        if (blocks !== null) { return; }
                    }
                    else {
                        if (blocks === null) { return; }
                        var i = 0;
                        while (
                            i < blocks.length &&
                            blocks[i].id !== comment.block
                        ) { i++; }
                        if (i === blocks.length) { return; }
                        current_block = blocks[i];
                        highlight_current_block();
                    }

                    // save original content for later if it was not already
                    if (mode === "reading") {
                        original_content = getBlockContent();
                    }
                    else if (previous_block !== current_block) {
                        // restore original content for previous block
                        previous_block.innerHTML = original_content;
                        original_content = getBlockContent();
                    }

                    mode = "reading_modification";
                    currently_showing = comment.id;

                    // print diffs
                    var array = JSON.parse(he.decode(comment.edit));
                    var html = dmp.diff_prettyHtml(array);
                    current_block.innerHTML = html;

                    // add button to go back to standard reading mode
                    original_button.style.visibility = "visible";

                    // display selected comment in green and all others are set back to default
                    var comments = $(".isso-comment", null, false);
                    for (var i = 0; i < comments.length; i++) {
                        comments[i].classList.remove("selected");
                    }
                    el.classList.add("selected");

                    // scroll to block then to first change
                    var edit_top = $("#edit");
                    if (!edit_top.topIsVisible()) {
                        current_block.scrollIntoView();
                    }
                    if (!edit_top.topIsVisible()) {
                        edit_top.scrollIntoView();
                    }
                }
            }
        };
    };

    var show_original = function() {
        if (mode === "reading_modification") {
            // restore original display
            current_block.innerHTML = original_content;
            original_button.style.visibility = "hidden";
            var comments = $(".isso-comment", null, false);
            for (var i = 0; i < comments.length; i++) {
                comments[i].classList.remove("selected");
            }
            mode = "reading";
            currently_showing = null;
            // now show the current block like if we had just scrolled
            show_block_comments();
        }
    };

    // DEFINE EVENTS

    original_button.on("click", show_original);

    // fallback if we cannot use CKEditor change event
    if (typeof CKEDITOR === "undefined") {
        article.on("keyup", maybe_article_just_changed);
    }

    document.addEventListener("keydown", function(e) {
        if (e.keyCode === 27) {
            show_original();
        }
    });

    window.addEventListener("scroll", show_block_comments);

    // ADD HTML ELEMENTS
    original_button.style.visibility = "hidden";
    $("#isso-thread").prepend(original_button);

    // FIRST CALLS
    show_block_comments();

    // PUBLIC METHODS

    return {
        init: init,
        new_content: function() {
            if (new_content === null) {
                return null;
            }
            // otherwise we apply some pre-treatment before returning
            var splitted = dmp.diff_wordsToChars_(original_content, new_content);
            var diffs = dmp.diff_main(splitted.chars1, splitted.chars2);
            dmp.diff_cleanupSemantic(diffs);
            dmp.diff_charsToLines_(diffs, splitted.wordArray);
            return JSON.stringify(diffs);
        },
        block_id: function() { return current_block.id; },
        cancel: cancel,
        show: show_edit,
        show_original: show_original
    };
});

