//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    'use strict';

    addSnippet(
        '<gs-font>',
        '<gs-font>',
        'gs-font min-width="${1}">\n' +
        '    ${0}\n' +
        '</gs-font>'
    );

    addElement('gs-font', '#layout_font_size');

    window.designElementProperty_GSFONT = function () {
        addText('V', 'Min-Width Media', 'min-width');
        addText('V', 'Media', 'media');
        addFlexProps();
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    var arrTakenFonts = [];

    //
    function elementInserted(element) {
        var styleElement;

        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;

                // if the style element for the container CSS doesn't exist: create it
                if (!document.getElementById('gs-dynamic-css')) {
                    styleElement = document.createElement('style');
                    styleElement.setAttribute('id', 'gs-dynamic-css');
                    styleElement.setAttribute('gs-dynamic', '');
                    document.head.appendChild(styleElement);
                }

                if (element.getAttribute('min-width')) {
                    element.handleMinWidthCSS();
                } else if (element.getAttribute('media')) {
                    element.handleMediaCSS();
                }
            }
        }
    }

    xtag.register('gs-font', {
        lifecycle: {
            inserted: function () {
                elementInserted(this);
            },

            attributeChanged: function (strAttrName, oldValue, newValue) {
                // if "suspend-inserted" has been removed: run inserted code
                if (
                    strAttrName === 'suspend-created' &&
                    strAttrName === 'suspend-inserted' &&
                    newValue === null
                ) {
                    elementInserted(this);

                } else if (!this.hasAttribute('suspend-created') && !this.hasAttribute('suspend-inserted')) {
                    // if the "min-width" attribute changed
                    if (strAttrName === 'min-width') {
                        this.handleMinWidthCSS();

                    // if the "media" attribute changed
                    } else if (strAttrName === 'media') {
                        this.handleMediaCSS();
                    }
                }
            }
        },
        events: {},
        accessors: {},
        methods: {
            handleMinWidthCSS: function () {
                var strMinWidth = this.getAttribute('min-width');
                var arrMinWidths;
                var strCSS;
                var i;
                var len;
                var arrClassesToRemove;
                var intContainerID;
                var arrParts;
                var strMedia;
                var strResult;

                // remove old classes
                arrClassesToRemove = String(this.classList).match(/font-id-[0-9]*/g) || [];

                for (i = 0, len = arrClassesToRemove.length; i < len; i += 1) {
                    this.classList.remove(arrClassesToRemove[i]);
                }

                // all {15px}; lrg {25px};
                // all {15px}; lrg {25px};
                // all {20px}; sml {25px}; med {30px}; lrg {35px};

                // all close curly braces, remove all whitespace, lowercase, trim off semicolons
                strMinWidth = GS.trim(strMinWidth.replace(/\}/g, '').replace(/\s+/g, '').toLowerCase(), ';');

                // replace shortcuts (lrg => 1200px)
                strMinWidth = strMinWidth.replace(/all/g, '0px')
                                         .replace(/small|sml/g, '768px')
                                         .replace(/medium|med/g, '992px')
                                         .replace(/large|lrg/g, '1200px');

                arrMinWidths = strMinWidth.split(';'); // seperate out layouts

                if (arrTakenFonts.indexOf(strMinWidth) === -1) {
                    arrTakenFonts.push(strMinWidth);
                    intContainerID = arrTakenFonts.length - 1;
                    strCSS = '';

                    for (i = 0, len = arrMinWidths.length; i < len; i += 1) {
                        arrParts = arrMinWidths[i].split('{');
                        strMedia = arrParts[0];
                        strResult = arrParts[1];

                        strCSS +=   '\n@media (min-width:' + strMedia + ') {\n' +
                                    '    gs-font.font-id-' + intContainerID + ' { font-size:' + strResult + '; }\n' +
                                    '}\n';
                    }

                    // append the column CSS
                    document.getElementById('gs-dynamic-css').innerHTML += '\n/* font #' + intContainerID + ' */\n' + strCSS;

                } else {
                    intContainerID = arrTakenFonts.indexOf(strMinWidth);
                }

                this.classList.add('font-id-' + intContainerID);
            },

            handleMediaCSS: function () {
                var strMedia = this.getAttribute('media');
                var arrMedias;
                var strCSS;
                var i;
                var len;
                var arrClassesToRemove;
                var arrParts;
                var strCurrentMedia;
                var strWidth;
                var intContainerID;

                // remove old classes
                arrClassesToRemove = String(this.classList).match(/font-id-[0-9]*/g) || [];

                for (i = 0, len = arrClassesToRemove.length; i < len; i += 1) {
                    this.classList.remove(arrClassesToRemove[i]);
                }

                // print {20px}; all and (max-width: 500px) {20px}; (min-width: 500px) {25px};

                // trim, remove all close curly braces, lowercase, trim off semicolons
                strMedia = GS.trim(strMedia.trim().replace(/\}/g, '').toLowerCase(), ';');

                // replace shortcuts (lrg => 1200px)
                strMedia = strMedia.replace(/all/g, '0px')
                                   .replace(/small|sml/g, '768px')
                                   .replace(/medium|med/g, '992px')
                                   .replace(/large|lrg/g, '1200px');

                arrMedias = strMedia.split(';'); // seperate out layouts

                if (arrTakenFonts.indexOf(strMedia) === -1) {
                    arrTakenFonts.push(strMedia);
                    intContainerID = arrTakenFonts.length - 1;
                    strCSS = '';

                    for (i = 0, len = arrMedias.length; i < len; i += 1) {
                        arrParts = arrMedias[i].split('{');
                        strCurrentMedia = arrParts[0].trim() || 'all';
                        strWidth = arrParts[1].trim() || '900px';

                        strCSS +=   '\n@media ' + strCurrentMedia + ' {\n' +
                                    '    gs-font.font-id-' + intContainerID + ' ' +
                                                '{ font-size: ' + strWidth + '; }\n' +
                                    '}\n';
                    }

                    // append the column CSS
                    document.getElementById('gs-dynamic-css').innerHTML += '\n/* font #' + intContainerID + ' */\n' + strCSS;
                } else {
                    intContainerID = arrTakenFonts.indexOf(strMinWidth);
                }

                this.classList.add('font-id-' + intContainerID);
            }
        }
    });
});