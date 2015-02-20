var requirejs = {
    paths: {
        "jquery": "lib/jquery/jquery-2.1.3.min",
        "diff_match_patch": "lib/diff_match_patch/diff_match_patch_uncompressed",
        "he": "lib/he/he",
        "text": "components/requirejs-text/text",
        "jade": "lib/requirejs-jade/jade",
        "libjs-jade": "components/jade/jade",
        "libjs-jade-runtime": "components/jade/runtime"
    },

    config: {
        text: {
            useXhr: function (url, protocol, hostname, port) {
                return true;
            }
        }
    }
};
