![commented.it](http://unkilodeplumes.fr/images/commentedit.png)
============

A comment and edit system which can be integrated into any website or blog.

Installation
------------

###Generic instructions

commented.it is built upon Isso.
If you can follow the instructions for installing from source on the official Isso documentation
(http://posativ.org/isso/docs/install/#install-from-source and http://posativ.org/isso/docs/quickstart/),
you should be able to install commented.it as well. Start with:
```
git clone https://github.com/commentedit/commented.it
```
Just note that the editable content on a page must be wrapped inside ```<article></article>``` tags.

###Specific step-by-step instructions for installing on OpenShift

There is a [wiki page](https://github.com/commentedit/commented.it/wiki/How-to-install-on-OpenShift) containing detailed instructions for running
commented.it on OpenShift.
If you just want it running somewhere without getting a headache, this might be just what you need.

###Using CKEditor with commented.it

[CKEditor](http://ckeditor.com/) provides a WYSIWYG web text editor which integrates nicely with commented.it.
It will give your users more comfort when editing your main text.
If you wish to use CKEditor just add the script from [their CDN](http://ckeditor.com/download#cdn-row)
in your webpage, just before loading the script for commented.it. Example:
```
<script src="//cdn.ckeditor.com/4.4.6/standard/ckeditor.js"></script>
<script data-isso="//comments.example.tld/"
        src="//comments.example.tld/js/embed.min.js"></script>
<section id="isso-thread"></section>
```

License
-------

Copyright 2014, Jules and Théo Zimmermann and others.

This software is a **free software** available under the terms of the MPL 2.0 (Mozilla Public License 2.0).
The text of the license is provided in the [LICENSE](LICENSE) file.

If you don't know what the MPL 2.0 is, then we suggest you have a look at the
[official FAQ](https://www.mozilla.org/MPL/2.0/FAQ.html).

Acknowledgements
----------------

This software is built upon several other open-source software or libraries.
Please refer to the [ACKNOWLEDGEMENTS.md](ACKNOWLEDGEMENTS.md) file for the list,
original copyright notices and licenses.


