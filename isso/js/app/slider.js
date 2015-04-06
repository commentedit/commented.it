/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(["jquery"], function($) {

    "use strict";

    // the block slider is used to choose which block is currently selected

    var article = $("article");
    var blocks = article.find(".block");
    var slider, cursor;
    // current block = block at current_position of slider
    var current_position, current_block;
    var before, after; // functions

    var init = function(bef,aft) {
        before = bef; // what to do before changing of current block
        after = aft; // what to do after changing of current block
        // after takes the new block as argument

        slider = $('<div id="slider"></div>');
        // slider position
        // there may be a better way (and we don't handle resizing for now)
        slider.css("left",
            ((article.offset().left + article.width()
              + $("#isso-thread").offset().left) / 2
             - 10) + "px");
        slider.insertAfter(article);

        cursor = $('<div id="cursor"></div>');
        slider.append(cursor);

        // this is not good if block is is higher than the window
        setTimeout(function() {
            // compute on first block
            set_cursor_position(blocks.offset().top + blocks.height() / 2);
        }, 0);
    };

    // cursor position
    var set_cursor_position = function(y) {
        var slider_top = slider.offset().top;
        var slider_height = slider.height();
        var raw_position = y - slider_top - 10;
        var corrected_position =
            (raw_position < 0) ?
            0 : ((raw_position > slider_height - 20) ?
                 slider_height - 20 : raw_position);
        cursor.css("top", corrected_position + "px");
        // current_position is useful to determine the current block
        current_position = y + slider_top + 10;
    };

    var update_current_block = function() {
        var i = 0;
        while (i < blocks.length &&
            blocks.eq(i).offset().top - $(window).scrollTop()
              <= current_position) {
            i++;
        }
        var new_block = blocks.eq(i - 1);
        if (typeof(current_block) === "undefined" ||
            new_block.attr('id') !== current_block.attr('id')) {
            current_block_changed(new_block)
        }
    };

    var current_block_changed = function(new_block, smooth) {
        $(window).off("scroll");
        // To do before updating block
        before();
        // To do after updating block
        current_block = new_block;
        highlight_current_block();
        if (smooth) {
            $('html,body').animate({
                scrollTop: new_block.offset().top - current_position/2
            }, 1000);
        }
        window.setTimeout(function() {
            after(new_block[0]);
            $(window).scroll(update_current_block);
        }, smooth ? 1000 : 0);
    };

    var highlight_current_block = function() {
        blocks.removeClass("current-block");
        current_block.addClass("current-block");
    };

    // define events

    $(window).scroll(update_current_block);

    blocks.each(function() {
        $(this).on("click", function() {current_block_changed($(this), true)});
    });

    return {
        init: init,
        update_current_block: update_current_block
    };

});
