/*
 * Copyright Théo Zimmermann 2014
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.

 * The original copyright notice follows
 * (applies only to part of this source code):

 * Copyright 2014, Martin Zimmermann <info@posativ.org>. All rights reserved.
 * Distributed under the MIT license
 */

require(["app/lib/ready", "app/config", "app/i18n", "app/api", "app/isso", "app/edit", "app/count", "app/dom", "app/text/css", "app/text/svg", "app/jade"], function(domready, config, i18n, api, isso, edit, count, $, css, svg, jade) {

    "use strict";

    jade.set("conf", config);
    jade.set("i18n", i18n.translate);
    jade.set("pluralize", i18n.pluralize);
    jade.set("svg", svg);

    domready(function() {

        if (config["css"]) {
            var style = $.new("style");
            style.type = "text/css";
            style.textContent = css.inline;
            $("head").append(style);
        }

        var isso_thread = $("#isso-thread");
        if (isso_thread === null) {
            return console.log("abort, #isso-thread is missing");
        }

        isso_thread.append(new isso.Postbox(null));
        isso_thread.append('<div id="isso-root"></div>');

        api.fetch(isso_thread.getAttribute("data-isso-id"),
            config["max-comments-top"],
            config["max-comments-nested"]).then(
            function(rv) {

                var lastcreated = 0;
                rv.replies.forEach(function(comment) {
                    isso.insert(comment, false);
                    if(comment.created > lastcreated) {
                        lastcreated = comment.created;
                    }
                });

                // now that all comments are inserted we can mask those
                // which are not associated with the current block
                edit.show_block_comments();

                if(rv.hidden_replies > 0) {
                    isso.insert_loader(rv, lastcreated);
                }

                if (window.location.hash.length > 0) {
                    $(window.location.hash).scrollIntoView();
                }
            },
            function(err) {
                console.log(err);
            }
        );
    });
});
