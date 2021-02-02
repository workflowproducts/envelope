//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    'use strict';

    addSnippet('<gs-jumbo>', '<gs-jumbo>', 'gs-jumbo>\n    ${0}\n</gs-jumbo>');
    addElement('gs-jumbo', '#layout_container_jumbo');

    window.designElementProperty_GSJUMBO = function () {
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    xtag.register('gs-jumbo', {});
});