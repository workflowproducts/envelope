//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    "use strict";
    addSnippet(
        'Centered Header',
        '<gs-header>',
        '<gs-header><center><h3>$0</h3></center></gs-header>'
    );
    addSnippet(
        'Header',
        '<gs-header>',
        '<gs-header><h3>$0</h3></gs-header>'
    );
    addSnippet(
        '<gs-header>',
        '<gs-header>',
        'gs-header><h3>$0</h3></gs-header>'
    );

    addElement('gs-header', '#layout_page');

    window.designElementProperty_GSHEADER = function () {
        addFlexContainerProps();
    };
});

// document.addEventListener('DOMContentLoaded', function () {
//     xtag.register('gs-header', {
//         lifecycle: {
//             /*inserted: function () {
//                 if (this.border_line) {
//                     this.removeChild(this.border_line);
//                 }
//
//                 this.border_line = document.createElement('div');
//                 this.border_line.classList.add('border-line');
//                 this.border_line.setAttribute('gs-dynamic', '');
//
//                 this.appendChild(this.border_line);
//             },
//             removed: function () {
//                 if (this.border_line.parentNode === this) {
//                     this.removeChild(this.border_line);
//                 }
//             }*/
//         },
//         events: {},
//         accessors: {},
//         methods: {}
//     });
// });
document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    xtag.register('gs-header', {
        lifecycle: {
            created: function () {
                if (
                    !this.hasAttribute('role') &&
                    !GS.findParentTag(this, 'gs-dialog')
                ) {
                    this.setAttribute('role', 'banner');
                }
            }
        },
        events: {},
        accessors: {},
        methods: {}
    });
});