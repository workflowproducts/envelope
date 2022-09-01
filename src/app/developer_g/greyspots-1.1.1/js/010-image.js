//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    'use strict';

    addSnippet('<gs-img>', '<gs-img>', 'gs-img src="${1}"></gs-img>');
    addElement('gs-img', '#layout_image');

    window.designElementProperty_GSIMG = function(selectedElement) {
        addText('D', 'Source', 'src');
        addText('V', 'Min-Width Media', 'min-width');
        addText('V', 'Media', 'media');
        addSelect('V', 'Alignment', 'align', [
            {"val": "", "txt": "Center (Default)"},
            {"val": "left", "txt": "Left"},
            {"val": "right", "txt": "Right"}
        ]);
        addCheck('V', 'Image Cover', 'image-cover');
        addFlexProps();
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    var arrTakenlayouts = [];

    //
    function elementInserted(element) {
        var styleElement;

        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;

                // if the style element for the grid column CSS doesn't exist: create it
                if (!document.getElementById('gs-dynamic-css')) {
                    styleElement = document.createElement('style');
                    styleElement.setAttribute('id', 'gs-dynamic-css');
                    styleElement.setAttribute('gs-dynamic', '');
                    document.head.appendChild(styleElement);
                }

                element.handleSrc();

                if (element.getAttribute('min-width')) {
                    element.handleMinWidthCSS();
                } else if (element.getAttribute('media')) {
                    element.handleMediaCSS();
                }

                if (element.hasAttribute('alt')) {
                    element.setAttribute('aria-label', element.getAttribute('alt'));
                    element.removeAttribute('alt');
                }
            }
        }
    }

    xtag.register('gs-img', {
        lifecycle: {
            inserted: function () {
                elementInserted(this);
            },
            attributeChanged: function (strAttrName, oldValue, newValue) {
                // if "suspend-created" has been removed: run created and inserted code
                if (
                    (
                        strAttrName === 'suspend-created' ||
                        strAttrName === 'suspend-inserted'
                    ) &&
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

                    // if the "src" attribute changed
                    } else if (strAttrName === 'src') {
                        this.handleSrc();
                    }
                }
            }
        },
        events: {},
        accessors: {},
        methods: {
            handleSrc: function () {
                var strSrc = this.getAttribute('src');
                
                if (strSrc) {
                    this.style.backgroundImage = 'url("' + strSrc + '")';
                } else {
                    this.style.backgroundImage = '';
                }
            },
            
            handleMinWidthCSS: function () {
                var strMinWidth = this.getAttribute('min-width'), arrLayouts, strCSS, strCurrentMinWidth,
                    i, len, arrClassesToRemove, intImageID, arrParts, strDimensions, strWidth, strHeight;
                
                // remove old classes
                arrClassesToRemove = String(this.classList).match(/image-id-[0-9]*/g) || [];
                
                for (i = 0, len = arrClassesToRemove.length; i < len; i += 1) {
                    this.classList.remove(arrClassesToRemove[i]);
                }
                
                // all {150px}; lrg {75px};
                // all {150px, 75px}; lrg {75px, 150px};
                
                // remove all whitespace, remove all close curly braces, lowercase, trim off semicolons
                strMinWidth = GS.trim(strMinWidth.replace(/\s+/g, '').replace(/\}/g, '').toLowerCase(), ';');
                
                // replace shortcuts (lrg => 1200px)
                strMinWidth = strMinWidth.replace(/all/g, '0px')
                                         .replace(/small|sml/g, '768px')
                                         .replace(/medium|med/g, '992px')
                                         .replace(/large|lrg/g, '1200px');
                
                // seperate out layouts
                arrLayouts = strMinWidth.split(';');
                
                //console.log(strMinWidth, arrLayouts);
                
                if (arrTakenlayouts.indexOf(strMinWidth) === -1) {
                    arrTakenlayouts.push(strMinWidth);
                    intImageID = arrTakenlayouts.length - 1;
                    strCSS = '';
                    
                    for (i = 0, len = arrLayouts.length; i < len; i += 1) {
                        arrParts = arrLayouts[i].split('{');
                        strCurrentMinWidth = arrParts[0] || '0px';
                        strDimensions = arrParts[1];
                        
                        if (strDimensions.indexOf(',') === -1) {
                            strWidth = strDimensions;
                            strHeight = strDimensions;
                        } else {
                            arrParts = strDimensions.split(',');
                            strWidth = arrParts[0];
                            strHeight = arrParts[1];
                        }
                        
                        strCSS +=   '\n@media (min-width:' + strCurrentMinWidth + ') {\n' +
                                    '    gs-img.image-id-' + intImageID + ' { width:' + strWidth + '; height: ' + strHeight + '; }\n' +
                                    '}\n';
                    }
                    
                    //console.log(strCSS);
                    
                    // append the column CSS
                    document.getElementById('gs-dynamic-css').innerHTML += '\n/* image #' + intImageID + ' */\n' + strCSS;
                    
                } else {
                    intImageID = arrTakenlayouts.indexOf(strMinWidth);
                }
                
                this.classList.add('image-id-' + intImageID);
            },
            
            handleMediaCSS: function () {
                var strMedia = this.getAttribute('media'), arrLayouts, strCSS, i, len,
                    arrClassesToRemove, arrParts, strCurrentMedia, strWidth, intImageID,
                    arrParts, strCurrentMedia, strDimensions, strWidth, strHeight;
                
                // remove old classes
                arrClassesToRemove = String(this.classList).match(/image-id-[0-9]*/g) || [];
                
                for (i = 0, len = arrClassesToRemove.length; i < len; i += 1) {
                    this.classList.remove(arrClassesToRemove[i]);
                }
                
                // print {200px}; all and (max-width: 500px) {500px}; (min-width 500px) {600px};
                
                // trim, remove all close curly braces, lowercase, trim off semicolons
                strMedia = GS.trim(strMedia.trim().replace(/\}/g, '').toLowerCase(), ';');
                
                // replace shortcuts (lrg => 1200px)
                strMedia = strMedia.replace(/small|sml/g, '768px').replace(/medium|med/g, '992px').replace(/large|lrg/g, '1200px');
                
                arrLayouts = strMedia.split(';'); // seperate out layouts
                
                //console.log(strMedia, arrLayouts);
                
                if (arrTakenlayouts.indexOf(strMedia) === -1) {
                    arrTakenlayouts.push(strMedia);
                    intImageID = arrTakenlayouts.length - 1;
                    strCSS = '';
                    
                    for (i = 0, len = arrLayouts.length; i < len; i += 1) {
                        arrParts = arrLayouts[i].split('{');
                        strCurrentMedia = arrParts[0].trim() || 'all';
                        strDimensions = arrParts[1].trim();
                        
                        if (strDimensions.indexOf(',') === -1) {
                            strWidth = strDimensions;
                            strHeight = strDimensions;
                        } else {
                            arrParts = strDimensions.split(',');
                            strWidth = arrParts[0];
                            strHeight = arrParts[1];
                        }
                        
                        strCSS +=   '\n@media ' + strCurrentMedia + ' {\n' +
                                    '    gs-img.image-id-' + intImageID + ' { width:' + strWidth + '; height: ' + strHeight + '; }\n' +
                                    '}\n';
                    }
                    
                    //console.log(strCSS);
                    
                    // append the column CSS
                    document.getElementById('gs-dynamic-css').innerHTML += '\n/* image #' + intImageID + ' */\n' + strCSS;
                    
                } else {
                    intImageID = arrTakenlayouts.indexOf(strMinWidth);
                }
                
                this.classList.add('image-id-' + intImageID);
            }
        }
    });
});