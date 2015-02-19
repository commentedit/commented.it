/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(["app/dom"], function($) {

    "use strict";

    // the block slider is used to choose which block is currently selected

    var article = $("article");
    var blocks;
    var slider, cursor;
    var current_position;

    var init = function(b) {
        blocks = b;

        slider = $.htmlify('<div id="slider"></div>');
        // slider position
        // there may be a better way (and we don't handle resizing for now)
        slider.style.left =
            ((article.getBoundingClientRect().right
              + $("#isso-thread").getBoundingClientRect().left) / 2
             - 10) + "px";
        article.insertAfter(slider);

        cursor = $.htmlify('<div id="cursor"></div>');
        slider.append(cursor);

        var first_block = blocks[0].getBoundingClientRect();
        // this is not good if block is is higher than the window
        setTimeout(function() {
            set_cursor_position((first_block.top + first_block.bottom) / 2);
        }, 0);
    };

    // cursor position
    var set_cursor_position = function(y) {
        var slider_rect = slider.getBoundingClientRect();
        var slider_height = slider_rect.bottom - slider_rect.top;
        var raw_position = y - slider_rect.top - 10;
        var corrected_position =
            (raw_position < 0) ?
            0 : ((raw_position > slider_height - 20) ?
                 slider_height - 20 : raw_position);
        cursor.style.top = corrected_position + "px";
        // current_position is useful to determine the current block
        current_position = y + slider_rect.top + 10;
    };

    // current block = block at current_position of slider
    var current_block = function() {
        var i = 0;
        while (i < blocks.length &&
            blocks[i].getBoundingClientRect().top <= current_position) {
            i++;
        }
        return blocks[i - 1];
    };

    return {
        init: init,
        current_block: current_block
    };

});
