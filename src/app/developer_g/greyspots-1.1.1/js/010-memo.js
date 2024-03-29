//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    "use strict";
    designRegisterElement('gs-memo', '#controls_memo');

    window.designElementProperty_GSMEMO = function (selectedElement) {
        addGSControlProps();
        addText('O', 'Column In QS', 'qs');
        addText('V', 'Placeholder', 'placeholder');
        addText('V', 'Rows', 'rows');
        addText('D', 'Encrypted', 'encrypted');
        addText('D', 'Max-length', 'max-length');
        addAutocompleteProps();
        addCheck('D', 'Show Caps Lock', 'show-caps', 'false');
        addFocusEvents();
        addFlexProps();
    };
});

// trigger resize to text on window resize
window.addEventListener('resize', function () {
    var i, len, arrElements = document.getElementsByTagName('gs-memo');
    
    for (i = 0, len = arrElements.length; i < len; i += 1) {
        //if (arrElements[i].control.clientHeight < arrElements[i].control.scrollHeight) {
        arrElements[i].handleResizeToText();
        //}
    }
});


if (!evt.touchDevice) {
    window.gsmemoNew = {};
    window.gsmemoNew.bolFirstMouseMoveWhileDown = true;
    window.gsmemoNew.currentMouseTarget = null;
    
    window.addEventListener('mousemove', function (event) {
        var mousePosition, intWhich;// = GS.mousePosition(event);
        
        // firefox sometimes doesn't permit access to "event.which"
        //      so this try/catch statement will prevent the error and nothing will run
        try {
            intWhich = event.which;
        } catch (e) {}
        
        if (window.bolFirstMouseMoveWhileDown === true && intWhich !== undefined && intWhich !== 0) {
            mousePosition = GS.mousePosition(event);
            
            window.bolFirstMouseMoveWhileDown = false;
            window.gsmemoNew.currentMouseTarget = document.elementFromPoint(mousePosition.x, mousePosition.y);
            
        } else if (intWhich !== undefined && intWhich === 0) {
            window.bolFirstMouseMoveWhileDown = true;
        }
        
        if (window.gsmemoNew.currentMouseTarget &&
            intWhich !== undefined && intWhich !== 0 &&
            window.gsmemoNew.currentMouseTarget.nodeName === 'TEXTAREA' &&
            window.gsmemoNew.currentMouseTarget.parentNode.nodeName === 'GS-MEMO' && //event.target === element.control &&
            window.bolFirstMouseMoveWhileDown === false &&
                (window.gsmemoNew.currentMouseTarget.lastWidth !== window.gsmemoNew.currentMouseTarget.clientWidth ||
                window.gsmemoNew.currentMouseTarget.lastHeight !== window.gsmemoNew.currentMouseTarget.clientHeight)) {// && //element.control === window.lastMouseDownElement) {
            
            //GS.triggerEvent(window.gsmemoNew.currentMouseTarget.parentNode, 'size-changed');
            
            window.gsmemoNew.currentMouseTarget.style.margin = '';
            window.gsmemoNew.currentMouseTarget.style.marginLeft = '';
            window.gsmemoNew.currentMouseTarget.style.marginRight = '';
            window.gsmemoNew.currentMouseTarget.style.marginTop = '';
            window.gsmemoNew.currentMouseTarget.style.marginBottom = '';
            window.gsmemoNew.currentMouseTarget.lastWidth  = window.gsmemoNew.currentMouseTarget.clientWidth;
            window.gsmemoNew.currentMouseTarget.lastHeight = window.gsmemoNew.currentMouseTarget.clientHeight;
            
            GS.triggerEvent(window.gsmemoNew.currentMouseTarget.parentNode, 'size-changed');
            
        }
    });
    
    window.addEventListener('mouseup', function (event) {
        //var mousePosition = GS.mousePosition(event);
        
        window.bolFirstMouseMoveWhileDown = true;
        //window.lastMouseDownElement = element.control;
    });
}

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    
    var multiLineTemplateElement = document.createElement('template'),
        multiLineTemplate;
    
    multiLineTemplateElement.innerHTML = '<textarea class="control" gs-dynamic></textarea>';
    
    multiLineTemplate = multiLineTemplateElement.content;
    
    // re-target change event from control to element
    function changeFunction(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.target.parentNode.syncGetters();
        
        GS.triggerEvent(event.target.parentNode, 'change');
    }

    // re-target focus event from control to element
    function focusFunction(event) {
        var element = event.target;
        if (element.hasAttribute('defer-insert')) {
            if (event.target.classList.contains('control')) {
                element = element.parentNode.parentNode;
            }
            element.removeEventListener('focus', focusFunction);
            element.classList.add('focus');
            element.appendChild(multiLineTemplate.cloneNode(true));
            if (element.control.value && element.control.value.length > 0) {
                if (element.bolSelect) {
                    element.control.setSelectionRange(0, element.control.value.length);
                } else {
                    element.control.setSelectionRange(element.control.value.length, element.control.value.length);
                }
            }
            element.bolSelect = true;
        } else {
            GS.triggerEvent(event.target.parentNode, 'focus');
            event.target.parentNode.classList.add('focus');
        }
    }

    // re-target blur event from control to element
    function blurFunction(event) {
                                
        GS.triggerEvent(event.target.parentNode, 'blur');
        event.target.parentNode.classList.remove('focus');
        if (event.target.parentNode.hasAttribute('defer-insert')) {
            event.target.parentNode.removeControl();
        }
    }

    // mouseout, remove hover class
    function mouseoutFunction(event) {
        GS.triggerEvent(event.target.parentNode, evt.mouseout);
        event.target.parentNode.classList.remove('hover');
    }

    // mouseover, add hover class
    function mouseoverFunction(event) {
        GS.triggerEvent(event.target.parentNode, evt.mouseover);
        event.target.parentNode.classList.add('hover');
    }

    
    //
    function keydownFunction(event) {
        var element = event.target;
        if (!element.hasAttribute('readonly')) {
            if (element.hasAttribute('disabled') && !(event.keyCode === 122 && event.metaKey)) {
                event.preventDefault();
                event.stopPropagation();
            } else if (event.keyCode === 9 && element.parentNode.hasAttribute('allow-tab-char') === true) {
                event.preventDefault();
                event.stopPropagation();
                var cursor_pos_memo = parseInt(element.selectionStart, 10);
                element.value = element.value.substring(0, cursor_pos_memo) + '\t' + element.value.substring(cursor_pos_memo, element.value.length);
                GS.setInputSelection(element, parseInt(cursor_pos_memo, 10) + 1, parseInt(cursor_pos_memo, 10) + 1);
            } else {
                //this.parentNode.syncView();
                if (element.parentNode.hasAttribute('encrypted')) {
                    element.parentNode.setAttribute('value', CryptoJS.AES.encrypt(element.value, (window[element.parentNode.getAttribute('encrypted')] || '')));
                } else {
                    element.parentNode.setAttribute('value', element.value);
                }
                element.parentNode.handleResizeToText();
            }
        }
        // if (element.classList.contains('control')) {
        //     element = GS.findParentTag(element, 'gs-memo');
        // }
        // if (element.hasAttribute('encrypted')) {
        //     element.syncGetters();
        //     if (!element.hasAttribute('defer-insert')) {
        //         element.value = element.getAttribute('value');
        //     } else {
        //         element.value = CryptoJS.AES.encrypt(element.control.value, (window[element.getAttribute('encrypted')] || ''));
        //     }
        // }
    }
    
    //
    function keyupFunction(event) {
        var element = event.target;
        if (!element.hasAttribute('readonly')) {
            //this.parentNode.syncView();
            if (element.parentNode.hasAttribute('encrypted')) {
                element.parentNode.setAttribute('value', CryptoJS.AES.encrypt(element.value, (window[element.parentNode.getAttribute('encrypted')] || '')));
            } else {
                element.parentNode.setAttribute('value', element.value);
            }
            element.parentNode.handleResizeToText();
        }
    }
    
    function insertFunction(event) {
                                
        var element = event.target;
        element.parentNode.handleResizeToText();
    }
    
    ////
    //function createPushReplacePopHandler(element) {
    //    var strQueryString = GS.getQueryString(), strQSCol = element.getAttribute('qs');
    //    
    //    if (GS.qryGetKeys(strQueryString).indexOf(strQSCol) > -1) {
    //        element.value = GS.qryGetVal(strQueryString, strQSCol);
    //    }
    //}
    
    function saveDefaultAttributes(element) {
        var i;
        var len;
        var arrAttr;
        var jsnAttr;

        // we need a place to store the attributes
        element.internal.defaultAttributes = {};

        // loop through attributes and store them in the internal defaultAttributes object
        arrAttr = element.attributes;
        i = 0;
        len = arrAttr.length;
        while (i < len) {
            jsnAttr = arrAttr[i];

            element.internal.defaultAttributes[jsnAttr.nodeName] = (jsnAttr.value || '');

            i += 1;
        }
    }

    function createPushReplacePopHandler(element) {
        var i;
        var len;
        var strQS = GS.getQueryString();
        var strQSCol = element.getAttribute('qs');
        var strQSValue;
        var strQSAttr;
        var arrQSParts;
        var arrAttrParts;
        var strOperator;

        if (strQSCol.indexOf('=') !== -1) {
            arrAttrParts = strQSCol.split(',');
            i = 0;
            len = arrAttrParts.length;
            while (i < len) {
                strQSCol = arrAttrParts[i];

                if (strQSCol.indexOf('!=') !== -1) {
                    strOperator = '!=';
                    arrQSParts = strQSCol.split('!=');
                } else {
                    strOperator = '=';
                    arrQSParts = strQSCol.split('=');
                }

                strQSCol = arrQSParts[0];
                strQSAttr = arrQSParts[1] || arrQSParts[0];

                // if the key is not present or we've got the negator: go to the attribute's default or remove it
                if (strOperator === '!=') {
                    // if the key is not present: add the attribute
                    if (GS.qryGetKeys(strQS).indexOf(strQSCol) === -1) {
                        element.setAttribute(strQSAttr, '');
                    // else: remove the attribute
                    } else {
                        element.removeAttribute(strQSAttr);
                    }
                } else {
                    // if the key is not present: go to the attribute's default or remove it
                    if (GS.qryGetKeys(strQS).indexOf(strQSCol) === -1) {
                        if (element.internal.defaultAttributes[strQSAttr] !== undefined) {
                            element.setAttribute(strQSAttr, (element.internal.defaultAttributes[strQSAttr] || ''));
                        } else {
                            element.removeAttribute(strQSAttr);
                        }
                    // else: set attribute to exact text from QS
                    } else {
                        element.setAttribute(strQSAttr, (
                            GS.qryGetVal(strQS, strQSCol) ||
                            element.internal.defaultAttributes[strQSAttr] ||
                            ''
                        ));
                    }
                }
                i += 1;
            }
        } else if (GS.qryGetKeys(strQS).indexOf(strQSCol) > -1) {
            strQSValue = GS.qryGetVal(strQS, strQSCol);

            if (element.internal.bolQSFirstRun !== true) {
                if (strQSValue !== '' || !element.getAttribute('value')) {
                    element.value = strQSValue;
                }
            } else {
                element.value = strQSValue;
            }
        }

        element.internal.bolQSFirstRun = true;
    }

    // dont do anything that modifies the element here
    function elementCreated(element) {
        // if "created" hasn't been suspended: run created code
        if (!element.hasAttribute('suspend-created')) {
            // if the value was set before the "created" lifecycle code runs: set attribute
            //      (discovered when trying to set a value of a date control in the after_open of a dialog)
            //      ("delete" keyword added because of firefox)
            if (element.value) {
                element.setAttribute('value', element.value);
                delete element.value;
            }
        }
    }

    function findFor(element) {
        var forElem;
        if (element.previousElementSibling && element.previousElementSibling.tagName.toUpperCase() == 'LABEL'
            && element.previousElementSibling.hasAttribute('for')
            && element.previousElementSibling.getAttribute('for') == element.getAttribute('id')
        ) {
            forElem = element.previousElementSibling;
        } else if (xtag.query(document, 'label[for="' + element.getAttribute('id') + '"]').length > 0) {
            forElem = xtag.query(document, 'label[for="' + element.getAttribute('id') + '"]')[0];
        }
        if (forElem) {
            forElem.setAttribute('for', element.getAttribute('id') + '_control');
            if (element.control) {
                element.control.setAttribute('id', element.getAttribute('id') + '_control');
                if (element.hasAttribute('aria-labelledby')) {
                    element.control.setAttribute('aria-labelledby', element.getAttribute('aria-labelledby'));
                }
                if (element.hasAttribute('title')) {
                    element.control.setAttribute('title', element.getAttribute('title'));
                }
            }
        }
    }

    //
    function elementInserted(element) {
        //var strQSValue;
        if (element.hasAttribute('encrypted') && !window[element.getAttribute('encrypted')] && !window['getting' + element.getAttribute('encrypted')]) {
            window['getting' + element.getAttribute('encrypted')] = true;
            GS.triggerEvent(element, 'password-error', {'reason': 'no', 'keyVariable': element.getAttribute('encrypted')});
        }
        if (element.hasAttribute('defer-insert')) {
            // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
            if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
                // if this is the first time inserted has been run: continue
                if (!element.inserted) {
                    element.inserted = true;
                    element.internal = {};
                    saveDefaultAttributes(element);

                    if (!element.hasAttribute('tabindex')) {
                        element.setAttribute('tabindex', '0');
                    }
                    element.bolSelect = true;
                    element.skip = false;
                    var elementValue = (element.getAttribute('value') || '');
                    if (elementValue) {
                        if (element.hasAttribute('encrypted') && window[element.getAttribute('encrypted')]) {
                            elementValue = CryptoJS.AES.decrypt(element.getAttribute('value'), (window[element.getAttribute('encrypted')] || '')).toString(CryptoJS.enc.Utf8);
                            element.syncGetters();
                        } else if (element.hasAttribute('encrypted')) {
                            element.skip = true;
                        }
                        element.innerHTML = '<span class="control" gs-dynamic>' + elementValue + '</span>';
                        element.control = element.children[0];
                        if (element.hasAttribute('id')) {
                            element.control.setAttribute('id', element.getAttribute('id') + '_control');
                        }
                        if (element.hasAttribute('aria-labelledby')) {
                            element.control.setAttribute('aria-labelledby', element.getAttribute('aria-labelledby'));
                        }
                        if (element.hasAttribute('title')) {
                            element.control.setAttribute('title', element.getAttribute('title'));
                        }
                        if (!element.skip) {
                            element.control.value = elementValue;
                        }
                        element.syncGetters();
                    } else if (element.hasAttribute('placeholder')) {
                        element.innerHTML = '<span class="placeholder">' + element.getAttribute('placeholder') + '</span>';
                        element.control = false;
                    } else {
                        element.innerHTML = '<span class="control" gs-dynamic>' + elementValue + '</span>';
                        element.control = element.children[0];
                        if (element.hasAttribute('id')) {
                            element.control.setAttribute('id', element.getAttribute('id') + '_control');
                        }
                        if (element.hasAttribute('aria-labelledby')) {
                            element.control.setAttribute('aria-labelledby', element.getAttribute('aria-labelledby'));
                        }
                        if (element.hasAttribute('title')) {
                            element.control.setAttribute('title', element.getAttribute('title'));
                        }
                        if (!element.skip) {
                            element.control.value = elementValue;
                        }
                        element.syncGetters();
                    }
                    if (!element.hasAttribute('autoresize')) {
                        element.style.height = ((element.getAttribute('rows') || 2) * 1.2) + 'em';
                    }
                    if (element.control) {
                        element.control.lastWidth = element.control.clientWidth;
                        element.control.lastHeight = element.control.clientHeight;
                        element.syncView();
                    }
                    
                    element.addEventListener('focus', focusFunction);
                    if (evt.touchDevice) {
                        element.addEventListener(evt.click, focusFunction);
                        element.addEventListener(evt.mousedown, function (event) {
                            //alert(event.touches[0].clientX);
                            element.startX = event.touches[0].clientX;
                            element.startY = event.touches[0].clientY;
                            element.addEventListener('touchmove', function (event) {
                                //alert(event.touches[0].clientX);
                                element.lastX = event.touches[0].clientX;
                                element.lastY = event.touches[0].clientY;
                                
                            });
                        });
                        element.addEventListener(evt.mouseup, function (event) {
                            var element = event.target;
                            //alert(element.outerHTML);
                            //alert(element.startX + ' : ' + element.lastX + ' : ' + element.startY + ' : ' + element.lastY);
                            if (element.lastX && element.lastY &&
                                (parseInt(element.lastX, 10) > (parseInt(element.startX, 10) + 10) ||
                                parseInt(element.lastX, 10) < (parseInt(element.startX, 10) - 10) ||
                                parseInt(element.lastY, 10) > (parseInt(element.startY, 10) + 10) ||
                                parseInt(element.lastY, 10) < (parseInt(element.startY, 10) - 10))
                            ) {
                            } else {
                                focusFunction(event);
                            }
                            
                            /*//if event.target is the control
                            if (event.target.tagName === 'GS-TEXT') {
                                var element = event.target;
                                //alert(event.target.outerHTML);
                                //focus it
                                focusFunction(event);
                                //if we focused it prevent click event from happening
                                if (document.activeElement == element.control) {
                                    event.stopImmediatePropagation();
                                    event.stopPropagation();
                                    event.preventDefault();
                                }
                                //else the click event happens trying again
                            }*/
                        });
                    }
                    if (element.getAttribute('qs')) {
                        //strQSValue = GS.qryGetVal(GS.getQueryString(), element.getAttribute('qs'));
                        //
                        //if (strQSValue !== '' || !element.getAttribute('value')) {
                        //    element.value = strQSValue;
                        //}
    
                        createPushReplacePopHandler(element);
                        window.addEventListener('pushstate',    function () { createPushReplacePopHandler(element); });
                        window.addEventListener('replacestate', function () { createPushReplacePopHandler(element); });
                        window.addEventListener('popstate',     function () { createPushReplacePopHandler(element); });
                    }
                }
            }
        } else {
            // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
            if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
                // if this is the first time inserted has been run: continue
                if (!element.inserted) {
                    element.inserted = true;
                    element.internal = {};
                    saveDefaultAttributes(element);
                    
                    if (element.hasAttribute('tabindex')) {
                        element.setAttribute('data-tabindex', element.getAttribute('tabindex'));
                        element.removeAttribute('tabindex');
                    }
                    if (!element.children[0] || !element.children[0].classList.contains('control')) {
                        element.appendChild(multiLineTemplate.cloneNode(true));
                    }
                    if (element.hasAttribute('data-tabindex')) {
                        xtag.query(element, '.control')[0].setAttribute('tabindex', element.getAttribute('data-tabindex'));
                    }
                    // set a variable with the control element for convenience and speed
                    element.control = xtag.queryChildren(element, '.control')[0];
                    if (element.hasAttribute('id')) {
                        element.control.setAttribute('id', element.getAttribute('id') + '_control');
                    }
                    if (element.hasAttribute('aria-labelledby')) {
                        element.control.setAttribute('aria-labelledby', element.getAttribute('aria-labelledby'));
                    }
                    if (element.hasAttribute('title')) {
                        element.control.setAttribute('title', element.getAttribute('title'));
                    }
                    // console.log(element, element.getAttribute('rows'));
                    if (!element.hasAttribute('autoresize')) {
                        element.style.height = ((element.getAttribute('rows') || 2) * 1.2) + 'em';
                    }
                    // console.log(element, element.style.height);

                    element.control.lastWidth = element.control.clientWidth;
                    element.control.lastHeight = element.control.clientHeight;
                    element.syncView();

                    if (element.getAttribute('qs')) {
                        //strQSValue = GS.qryGetVal(GS.getQueryString(), element.getAttribute('qs'));
                        //
                        //if (strQSValue !== '' || !element.getAttribute('value')) {
                        //    element.value = strQSValue;
                        //}

                        createPushReplacePopHandler(element);
                        window.addEventListener('pushstate',    function () { createPushReplacePopHandler(element); });
                        window.addEventListener('replacestate', function () { createPushReplacePopHandler(element); });
                        window.addEventListener('popstate',     function () { createPushReplacePopHandler(element); });
                    }
                }
            }
        }
        if (element.hasAttribute('id')) {
            findFor(element);
        }
    }

    xtag.register('gs-memo', {
        lifecycle: {
            created: function () {
                elementCreated(this);
            },

            inserted: function () {
                elementInserted(this);
            },

            attributeChanged: function (strAttrName, oldValue, newValue) {
                // if "suspend-created" has been removed: run created and inserted code
                if (strAttrName === 'value' && this.initalized && oldValue !== newValue) {
                    var currentValue = this.control.value;
                    var newCryptedValue = newValue;
                    // if there is a difference between the new value in the
                    //      attribute and the valued in the front end: refresh the front end
                    newCryptedValue = this.hasAttribute('uppercase') ? newCryptedValue.toUpperCase() : newCryptedValue;
                    currentValue = this.hasAttribute('uppercase') ? currentValue.toUpperCase() : currentValue;
                    if (newCryptedValue !== currentValue) {
                        this.setAttribute('value', newCryptedValue);
                        if (this.hasAttribute('encrypted')) {
                        } else {
                            this.control.value = newCryptedValue;
                        }
                    } else {
                        this.setAttribute('value', currentValue);
                        if (this.hasAttribute('encrypted')) {
                        } else {
                            this.control.value = currentValue;
                        }
                    }
                } else if (strAttrName === 'suspend-created' && newValue === null) {
                    elementCreated(this);
                    elementInserted(this);
                    
                // if "suspend-inserted" has been removed: run inserted code
                } else if (strAttrName === 'suspend-inserted' && newValue === null) {
                    elementInserted(this);
                    
                } else if (!this.hasAttribute('suspend-created') && !this.hasAttribute('suspend-inserted')) {
                    if (strAttrName === 'disabled' && newValue !== null) {
                        this.innerHTML = this.getAttribute('value') || this.getAttribute('placeholder');
                    } else if (strAttrName === 'disabled' && newValue === null) {
                        this.innerHTML = '';
                        this.appendChild(multiLineTemplate.cloneNode(true));
                        if (this.hasAttribute('data-tabindex')) {
                            xtag.query(this, '.control')[0].setAttribute('tabindex', this.getAttribute('data-tabindex'));
                        }
                        // set a variable with the control element for convenience and speed
                        this.control = xtag.queryChildren(this, '.control')[0];
                        if (this.hasAttribute('id')) {
                            this.control.setAttribute('id', this.getAttribute('id') + '_control');
                        }
                        if (this.hasAttribute('aria-labelledby')) {
                            this.control.setAttribute('aria-labelledby', this.getAttribute('aria-labelledby'));
                        }
                        if (this.hasAttribute('title')) {
                            this.control.setAttribute('title', this.getAttribute('title'));
                        }
                        
                        this.control.lastWidth = this.control.clientWidth;
                        this.control.lastHeight = this.control.clientHeight;
                        this.syncView();
                    }
                }
            }
        },
        events: {},
        accessors: {
            value: {
                // get value straight from the input
                get: function () {
                    if (this.hasAttribute('defer-insert')) {
                        return this.getAttribute('value');
                    } else {
                        return this.getAttribute('value');
                    }
                },

                set: function (strNewValue) {
                    if (this.hasAttribute('defer-insert')) {
                        if (this.hasAttribute('encrypted')) {
                            if (CryptoJS.AES.decrypt(this.hasAttribute('uppercase') ? strNewValue.toUpperCase() : strNewValue, (window[this.getAttribute('encrypted')] || '')).toString(CryptoJS.enc.Utf8) === '') {
                                this.setAttribute('value', CryptoJS.AES.encrypt(this.hasAttribute('uppercase') ? strNewValue.toUpperCase() : strNewValue, (window[this.getAttribute('encrypted')] || '')));
                            } else {
                                this.setAttribute('value', this.hasAttribute('uppercase') ? strNewValue.toUpperCase() : strNewValue);
                            }
                        } else {
                            this.setAttribute('value', this.hasAttribute('uppercase') ? strNewValue.toUpperCase() : strNewValue);
                            this.syncView();
                        }
                    } else {
                        this.setAttribute('value', this.hasAttribute('uppercase') ? strNewValue.toUpperCase() : strNewValue);
                    }
                }
            },
            textValue: {
                // get value straight from the input
                get: function () {
                    if (this.hasAttribute('defer-insert')) {
                        if (this.control) {
                            return this.hasAttribute('uppercase') ? this.control.value.toUpperCase() : this.control.value;
                        } else {
                            return '';
                        }
                    } else {
                        if (this.control) {
                            return this.hasAttribute('uppercase') ? this.control.value.toUpperCase() : this.control.value;
                        } else {
                            return this.hasAttribute('uppercase') ? this.innerHTML.toUpperCase() : this.innerHTML;
                        }
                    }
                },
                
                // set the value attribute
                set: function (newValue) {
                    //this.setAttribute('value', newValue);
                    // this.value = newValue;
                
                    if (this.control) {
                        this.control.value = this.hasAttribute('uppercase') ? newValue.toUpperCase() : newValue;
                    } else {
                        this.innerHTML = this.hasAttribute('uppercase') ? newValue.toUpperCase() : newValue;
                    }
                }
            }
        },
        methods: {
            focus: function () {
                if (this.hasAttribute('defer-insert')) {
                    var element = this;
                    element.bolSelect = false;
                    focusFunction({ target: element });
                } else {
                    if (this.control) {
                        this.control.focus();
                    }
                }
                //GS.triggerEvent(element, 'focus');
            },

            removeControl: function () {
                var element = this;
                var elementHeight = element.control.clientHeight;
                var elementValue = element.control.value
                // if (element.hasAttribute('encrypted')) {
                //     elementValue = CryptoJS.AES.decrypt(elementValue, (window[this.getAttribute('encrypted')] || '')).toString(CryptoJS.enc.Utf8);
                // }
                if (element.control) {
                    element.setAttribute('tabindex', element.control.getAttribute('tabindex'));
                }
                if (element.control.value) {
                    element.innerHTML = '<span style="white-space: pre-wrap;" class="control" gs-dynamic></span>';
                    element.control = element.children[0];
                    
                    if (element.hasAttribute('id')) {
                        element.control.setAttribute('id', element.getAttribute('id') + '_control');
                    }
                    if (element.hasAttribute('aria-labelledby')) {
                        element.control.setAttribute('aria-labelledby', element.getAttribute('aria-labelledby'));
                    }
                    if (element.hasAttribute('title')) {
                        element.control.setAttribute('title', element.getAttribute('title'));
                    }
                    element.control.textContent = elementValue;
                    element.control.value = elementValue;
                    element.syncGetters();
                } else if (element.hasAttribute('placeholder')) {
                    element.innerHTML = '<span class="placeholder">' + element.getAttribute('placeholder') + '</span>';
                } else {
                    element.innerHTML = '<span style="white-space: pre-wrap;" class="control" gs-dynamic></span>';
                    element.control = element.children[0];
                    if (element.hasAttribute('id')) {
                        element.control.setAttribute('id', element.getAttribute('id') + '_control');
                    }
                    if (element.hasAttribute('aria-labelledby')) {
                        element.control.setAttribute('aria-labelledby', element.getAttribute('aria-labelledby'));
                    }
                    if (element.hasAttribute('title')) {
                        element.control.setAttribute('title', element.getAttribute('title'));
                    }
                    element.control.textContent = elementValue;
                    element.control.value = elementValue;
                    element.syncGetters();
                }
                element.style.height = elementHeight + 'px';
            },

            addControl: function () {
                var element = this;
                var arrPassThroughAttributes = [
                    'placeholder', 'name', 'maxlength', 'autocorrect',
                    'autocapitalize', 'autocomplete', 'autofocus', 'spellcheck',
                    'readonly', 'disabled'
                ];
                var i;
                var len;
                var elementValue = element.textContent || element.value || '';
                if (element.children[0] && element.children[0].classList.contains('placeholder')) {
                    elementValue = '';
                }
                // if the gs-text element has a tabindex: save the tabindex and remove the attribute
                if (element.hasAttribute('tabindex')) {
                    element.savedTabIndex = element.getAttribute('tabindex');
                    element.removeAttribute('tabindex');
                }
                // add control input and save it to a variable for later use
                element.innerHTML = '';
                element.innerHTML = '<textarea class="control" gs-dynamic></textarea>';//'<input class="control" gs-dynamic type="' + (element.getAttribute('type') || 'text') + '" />';
                element.control = element.children[0];
                if (element.hasAttribute('id')) {
                    element.control.setAttribute('id', element.getAttribute('id') + '_control');
                }
                if (element.hasAttribute('aria-labelledby')) {
                    element.control.setAttribute('aria-labelledby', element.getAttribute('aria-labelledby'));
                }
                if (element.hasAttribute('title')) {
                    element.control.setAttribute('title', element.getAttribute('title'));
                }

                // bind event re-targeting functions
                element.control.removeEventListener('change', changeFunction);
                element.control.addEventListener('change', changeFunction);


                element.control.removeEventListener('blur', blurFunction);
                element.control.addEventListener('blur', blurFunction);

                element.removeEventListener(evt.mouseout, mouseoutFunction);
                element.addEventListener(evt.mouseout, mouseoutFunction);

                element.removeEventListener(evt.mouseout, mouseoverFunction);
                element.addEventListener(evt.mouseover, mouseoverFunction);
                // copy passthrough attributes to control
                i = 0;
                len = arrPassThroughAttributes.length;
                while (i < len) {
                    // console.log(arrPassThroughAttributes[i]);
                    if (element.hasAttribute(arrPassThroughAttributes[i])) {
                        // console.log('found', arrPassThroughAttributes[i]);
                        if (arrPassThroughAttributes[i] === 'disabled') {
                        // console.log('setting', 'readonly');
                            element.control.setAttribute(
                                'readonly',
                                element.getAttribute(arrPassThroughAttributes[i]) || ''
                            );
                        } else {
                            // console.log('setting', arrPassThroughAttributes[i]);
                            element.control.setAttribute(
                                arrPassThroughAttributes[i],
                                element.getAttribute(arrPassThroughAttributes[i]) || ''
                            );
                        }
                    }
                    i += 1;
                }
                element.control.value = elementValue;
                if (element.hasAttribute('encrypted')) {
                    element.value = CryptoJS.AES.encrypt(elementValue, (window[element.getAttribute('encrypted')] || ''));
                } else {
                    element.value = elementValue;
                }
                // if we saved a tabindex: apply the tabindex to the control
                if (element.savedTabIndex !== undefined && element.savedTabIndex !== null) {
                    element.control.setAttribute('tabindex', element.savedTabIndex);
                }
                //element.syncView();
                element.control.style.height = element.style.minHeight;
                element.control.focus();
                element.addEventListener('focus', focusFunction);
            },
            
            // sync control and resize to text
            syncView: function () {
                                
                var element = this, arrPassThroughAttributes, i, len;
                
                /*
                if (this.innerHTML === '') {
                    this.appendChild(multiLineTemplate.cloneNode(true));
                }
                */
                /*
                if ((! this.hasAttribute('disabled')) && (! this.control)) {
                    this.appendChild(multiLineTemplate.cloneNode(true));
                    // set a variable with the control element for convenience and speed
                    this.control = xtag.queryChildren(this, '.control')[0];
                    
                    this.control.lastWidth = this.control.clientWidth;
                    this.control.lastHeight = this.control.clientHeight;
                }
                */
                
                if (this.hasAttribute('rows')) {
                    if (this.control) {
                        this.control.setAttribute('rows', this.getAttribute('rows'));
                    }
                }
                
                if (this.control) {
                    this.control.removeEventListener('change', changeFunction);
                    this.control.addEventListener('change', changeFunction);
                    
                    this.control.removeEventListener('focus', focusFunction);
                    this.control.addEventListener('focus', focusFunction);
                    
                    this.control.removeEventListener('blur', blurFunction);
                    this.control.addEventListener('blur', blurFunction);

                    this.control.removeEventListener(evt.mouseout, mouseoutFunction);
                    this.control.addEventListener(evt.mouseout, mouseoutFunction);
                    
                    this.control.removeEventListener(evt.mouseout, mouseoverFunction);
                    this.control.addEventListener(evt.mouseover, mouseoverFunction);
                    
                    this.control.removeEventListener('keydown', keydownFunction);
                    this.control.addEventListener('keydown', keydownFunction);
                    
                    this.control.removeEventListener('keyup', keyupFunction);
                    this.control.addEventListener('keyup', keyupFunction);
                    
                    this.control.removeEventListener('insert', insertFunction);
                    this.control.addEventListener('insert', insertFunction);
                }
                //console.log(this.control.nodeName);
                if (this.control && this.control.nodeName === 'TEXTAREA') {
                    if (this.hasAttribute('encrypted')) {
                        if (window[this.getAttribute('encrypted')] && this.control.value !== this.getAttribute('value')) {
                            this.control.value = CryptoJS.AES.decrypt(this.getAttribute('value') || '', (window[this.getAttribute('encrypted')] || '')).toString(CryptoJS.enc.Utf8);
                            // this.innerHTML = CryptoJS.AES.decrypt(this.getAttribute('value') || '', (window[this.getAttribute('encrypted')] || '')).toString(CryptoJS.enc.Utf8);
                          //console.log(this.control.value);
                        } else {
                        }
                    } else {
                        this.control.value = this.getAttribute('value');
                    }
                } else {
                  //console.log(this.outerHTML);
                    if (this.hasAttribute('encrypted')) {
                        if (window[this.getAttribute('encrypted')] && this.control.value !== this.getAttribute('value')) {
                            this.control.innerHTML = CryptoJS.AES.decrypt(this.getAttribute('value'), (window[this.getAttribute('encrypted')] || '')).toString(CryptoJS.enc.Utf8) || this.getAttribute('placeholder') || '';
                        }
                    } else {
                        this.control.innerHTML = this.getAttribute('value') || this.getAttribute('placeholder') || '';
                    }
                    
                }
                    
                if (this.getAttribute('value')) {
                    this.handleResizeToText();
                }
                
                if (this.control) {
                    arrPassThroughAttributes = [
                        'placeholder',
                        'name',
                        'maxlength',
                        'autocorrect',
                        'autocapitalize',
                        'autocomplete',
                        'autofocus',
                        'rows',
                        'spellcheck',
                        'readonly'
                    ];
                    for (i = 0, len = arrPassThroughAttributes.length; i < len; i += 1) {
                        if (this.hasAttribute(arrPassThroughAttributes[i])) {
                            this.control.setAttribute(arrPassThroughAttributes[i], this.getAttribute(arrPassThroughAttributes[i]) || '');
                        }
                    }
                }
                this.initalized = true;
                
                // copy passthrough attributes to control
            },
            
            syncGetters: function () {
                if (this.control) {
                    if (this.hasAttribute('encrypted')) {
                        if (window[this.getAttribute('encrypted')]) {
                            this.setAttribute('value', CryptoJS.AES.encrypt(this.hasAttribute('uppercase') ? this.control.value.toUpperCase() : this.control.value, (window[this.getAttribute('encrypted')] || '')));
                        }
                    } else {
                        this.setAttribute('value', this.hasAttribute('uppercase') ? this.control.value.toUpperCase() : this.control.value);
                    }
                    
                }
            },
            
            // if element is multiline and autoresize is not turned off: resize the element to fit the content
            handleResizeToText: function () {
                var element = this, intMinHeight;
                
                if (element.control) {
                    if (element.hasAttribute('autoresize')) {
                        element.control.style.height = '';
                        intMinHeight = element.control.offsetHeight;
                        element.control.style.height = ''; // '0';
                        
                        if (element.control.scrollHeight > intMinHeight) {
                            element.control.style.height = (element.control.scrollHeight + 1) + 'px';
                        } else {
                            element.control.style.height = (intMinHeight + 1) + 'px';
                        }
                        
                        if (element.hasAttribute('defer-insert')) {
                            element.style.height = (parseInt(element.control.style.height.replace('px','')) + 2) + 'px';
                        }
                    }
                    
                    
                    if (element.control.lastWidth !== element.control.clientWidth && element.control.lastHeight !== element.control.clientHeight) {
                        element.control.lastWidth = element.control.clientWidth;
                        element.control.lastHeight = element.control.clientHeight;
                        
                        GS.triggerEvent(element, 'size-changed');
                    }
                }
            }
        }
    });
});