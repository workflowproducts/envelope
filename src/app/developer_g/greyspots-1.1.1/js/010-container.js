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
        '<gs-container>',
        '<gs-container>',
        (
            'gs-container min-width="${1:sml;med;lrg;}" ${2:padded}>\n' +
            '    ${0}\n' +
            '</gs-container>'
        )
    );

    addElement('gs-container', '#layout_container_jumbo');

    window.designElementProperty_GSCONTAINER = function () {
        addText('V', 'Min-Width Media', 'min-width');
        addText('V', 'Media', 'media');
        addCheck('V', 'Padded', 'padded');
        addFlexProps();
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    var arrTakenContainers = [];
    var intScrollBarWidth;

    function getScrollBarWidth() {
        var inner = document.createElement('div');
        var outer = document.createElement('div');
        var intWidth;

        inner.style.height = '200px';
        outer.style.position = 'absolute';
        outer.style.top = '0';
        outer.style.left = '0';
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.width = '50px';
        outer.style.height = '100px';
        outer.appendChild(inner);

        document.body.appendChild(outer);

        intWidth = (outer.offsetWidth - inner.offsetWidth);

        document.body.removeChild(outer);

        return intWidth;
    }

    intScrollBarWidth = getScrollBarWidth();

    function elementInserted(element) {
        var styleElement;

        // if "created" hasn't been suspended and "inserted" hasn't been
        //      suspended: run inserted code
        if (
            !element.hasAttribute('suspend-created') &&
            !element.hasAttribute('suspend-inserted')
        ) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;

                // if the style element for the container CSS doesn't exist:
                //      create it
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

    xtag.register('gs-container', {
        lifecycle: {
            inserted: function () {
                elementInserted(this);
            },

            attributeChanged: function (strAttrName, ignore, newValue) {
                if (
                    strAttrName === 'suspend-created' &&
                    strAttrName === 'suspend-inserted' &&
                    newValue === null
                ) {
                    elementInserted(this);

                } else if (
                    !this.hasAttribute('suspend-created') &&
                    !this.hasAttribute('suspend-inserted')
                ) {
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
                var intWidthNumber;
                var strWidthOperator;
                var strNewWidth;

                // remove old classes
                arrClassesToRemove = (
                    String(this.classList).match(/container-id-[0-9]*/g) || []
                );

                i = 0;
                len = arrClassesToRemove.length;
                while (i < len) {
                    this.classList.remove(arrClassesToRemove[i]);
                    i += 1;
                }

                // sml;med;lrg
                // medium
                // 100;200;300;400;500;600;700;800;900;1000;1100;1200

                // remove all whitespace, lowercase, trim off semicolons
                strMinWidth = (
                    GS.trim(strMinWidth.replace(/\s+/g, '').toLowerCase(), ';')
                );

                // replace shortcuts (lrg => 1200px)
                strMinWidth = (
                    strMinWidth
                        .replace(/small|sml/g, '768px')
                        .replace(/medium|med/g, '992px')
                        .replace(/large|lrg/g, '1200px')
                );

                arrMinWidths = strMinWidth.split(';'); // seperate out layouts

                if (arrTakenContainers.indexOf(strMinWidth) === -1) {
                    arrTakenContainers.push(strMinWidth);
                    intContainerID = arrTakenContainers.length - 1;
                    strCSS = '';

                    i = 0;
                    len = arrMinWidths.length;
                    while (i < len) {
                        intWidthNumber = parseInt(arrMinWidths[i]);
                        strWidthOperator = (
                            arrMinWidths[i].replace(/[0-9]/g, '')
                        );

                        if (strWidthOperator === 'px') {
                            intWidthNumber -= intScrollBarWidth;
                        } else if (strWidthOperator === 'em') {
                            intWidthNumber -= GS.pxToEm(
                                this.parentNode,
                                intScrollBarWidth
                            );
                        }

                        strNewWidth = intWidthNumber + strWidthOperator;

                        strCSS += (
                            '\n@media (min-width:' + arrMinWidths[i] + ') {\n' +
                            '    gs-container.container-id-' + intContainerID +
                            ' { ' +
                            'width:' + strNewWidth + '; ' +
                            'margin-left:auto; ' +
                            'margin-right:auto; ' +
                            '}\n' +
                            '}\n'
                        );

                        i += 1;
                    }

                    // append the column CSS
                    document.getElementById('gs-dynamic-css').innerHTML += (
                        '\n/* container #' + intContainerID + ' */\n' + strCSS
                    );
                } else {
                    intContainerID = arrTakenContainers.indexOf(strMinWidth);
                }

                this.classList.add('container-id-' + intContainerID);
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
                arrClassesToRemove = (
                    String(this.classList).match(/container-id-[0-9]*/g) || []
                );

                i = 0;
                len = arrClassesToRemove.length;
                while (i < len) {
                    this.classList.remove(arrClassesToRemove[i]);
                    i += 1;
                }

                // (min-width: 500) {small}; (max-width: 500) {50}
                // (max-width: small) {small}; (min-width: small) {small}
                // (max-width: small) {50}; (min-width: small) {500}

                // trim, remove all close curly braces, lowercase, trim off
                //      semicolons
                strMedia = GS.trim(
                    strMedia.trim().replace(/\}/g, '').toLowerCase(),
                    ';'
                );

                // replace shortcuts (lrg => 1200px)
                strMedia = (
                    strMedia
                        .replace(/small|sml/g, '768px')
                        .replace(/medium|med/g, '992px')
                        .replace(/large|lrg/g, '1200px')
                );

                // seperate out layouts
                arrMedias = strMedia.split(';');

                if (arrTakenContainers.indexOf(strMedia) === -1) {
                    arrTakenContainers.push(strMedia);
                    intContainerID = arrTakenContainers.length - 1;
                    strCSS = '';

                    i = 0;
                    len = arrMedias.length;
                    while (i < len) {
                        arrParts = arrMedias[i].split('{');
                        strCurrentMedia = arrParts[0].trim() || 'all';
                        strWidth = arrParts[1].trim() || '900px';

                        strCSS += (
                            '\n@media ' + strCurrentMedia + ' {\n' +
                            '    gs-container.container-id-' + intContainerID +
                            ' ' +
                            '{ ' +
                            'width:' + strWidth + '; ' +
                            'margin-left:auto; ' +
                            'margin-right:auto; ' +
                            '}\n' +
                            '}\n'
                        );
                        i += 1;
                    }

                    // append the column CSS
                    document.getElementById('gs-dynamic-css').innerHTML += (
                        '\n/* container #' + intContainerID + ' */\n' + strCSS
                    );

                } else {
                    intContainerID = arrTakenContainers.indexOf(strMedia);
                }

                this.classList.add('container-id-' + intContainerID);
            }
        }
    });
});