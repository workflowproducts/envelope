//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps, shimmed
//jslint browser:true, maxlen:80, white:false, this:true

window.addEventListener('design-register-element', function () {
    "use strict";
    addSnippet('<gs-body>', '<gs-body>', 'gs-body padded>\n    $0\n</gs-body>');
    addElement('gs-body', '#layout_page');

    window.designElementProperty_GSBODY = function () {
        addCheck('V', 'Padded', 'padded');
        addFlexContainerProps();
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    xtag.register('gs-body', {
        lifecycle: {
            created: function () {
                if (
                    !this.hasAttribute('role') &&
                    !GS.findParentTag(this, 'gs-dialog')
                ) {
                    this.setAttribute('role', 'main');
                }
            }
        },
        events: {},
        accessors: {},
        methods: {}
    });
});