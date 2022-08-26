//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    'use strict';
    addSnippet('<gs-footer>', '<gs-footer>', 'gs-footer>$0</gs-footer>');

    addElement('gs-footer', '#layout_page');

    window.designElementProperty_GSFOOTER = function () {
        addFlexContainerProps();
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    xtag.register('gs-footer', {
        lifecycle: {
            created: function () {
                if (!this.hasAttribute('role') && !GS.findParentTag(this, 'gs-dialog')) {
                    this.setAttribute('role', 'contentinfo');
                }
            }
        },
        events: {},
        accessors: {},
        methods: {}
    });
});