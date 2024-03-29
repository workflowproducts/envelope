//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps, shimmed
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    "use strict";
    addSnippet('<gs-text>', '<gs-text>', 'gs-text column="${1:name}"></gs-text>');
    addSnippet(
        '<gs-text> With Label',
        '<gs-text>',
        (
            'label for="${1:text-insert-account-name}">${2:Account Name}:</label>\n' +
            '<gs-text id="${1:date-insert-account-name}" column="${3:account_name}"></gs-text>'
        )
    );
    addElement('gs-text', '#controls_text');

    window.designElementProperty_GSTEXT = function (selectedElement) {
        addGSControlProps();
        addText('V', 'Placeholder', 'placeholder');
        addText('D', 'Encrypted', 'encrypted');
        addText('D', 'Max-length', 'max-length');
        addCheck('V', 'Disable Max-length auto-tab', 'no-auto-tab', 'true');
        addAutocompleteProps();
        addCheck('V', 'Show Caps Lock', 'show-caps', 'false');
        addFocusEvents();
        addFlexProps();
        addText('O', 'Column In QS', 'qs');
    };
});
// function getCaps() {
//     var event = document.createEvent("KeyboardEvent");
//   //console.log(event, event.getModifierState('CapsLock'));
//     var caps = event.getModifierState && event.getModifierState( 'CapsLock' );
//     window.caps = caps;
//   //console.log(window.caps);
// }

window.addEventListener('keydown', function (event) {
    window.caps = event.getModifierState && event.getModifierState( 'CapsLock' );
    //console.log(caps);
});

window.addEventListener('try-password', function (event) {
    var elemsToRetry = xtag.query(document, 'gs-text[encrypted="' + event.keyVariable + '"], gs-memo[encrypted="' + event.keyVariable + '"]');
  //console.log(elemsToRetry);
    var i = 0, len = elemsToRetry.length;
    while (i < len) {
        elemsToRetry[i].syncView();
        i++;
    }
});


document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // re-target change event from control to element
    function changeFunction(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.target.parentNode.syncGetters();//iphone sometimes doesn't do a key like with time wheels

        GS.triggerEvent(event.target.parentNode, 'change');

        return false;
    }

    function focusNextElement() {
        //add all elements we want to include in our selection
        var focussableElements = 'a:not([disabled]), button:not([disabled]), input:not([disabled]), gs-button:not([disabled])';
        if (document.activeElement) {
            var focussable = Array.prototype.filter.call(document.querySelectorAll(focussableElements),
            function (element) {
                //check for visibility while always include the current activeElement 
                return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
            });
            var index = focussable.indexOf(document.activeElement);
            if(index > -1) {
               var nextElement = focussable[index + 1] || focussable[0];
               nextElement.focus();
            }                    
        }
    }

    function checkMaxLength(event) {
        var element = event.target;
        if (element.classList.contains('control')) {
            element = GS.findParentTag(element, 'gs-text');
        }
        element.syncGetters();
        if (element.hasAttribute('max-length') && element.value.length >= element.getAttribute('max-length')) {
            if (element.value.length > element.getAttribute('max-length')) {
                element.value = element.value.substring(0,element.getAttribute('max-length'));
            }
            if (!element.hasAttribute('no-auto-tab') && element.control.hasAttribute('tabindex') && xtag.query(document, '[tabindex="' + (parseInt(element.control.getAttribute('tabindex'), 10) + 1) + '"]').length > 0) {
                xtag.query(document, '[tabindex="' + (parseInt(element.control.getAttribute('tabindex'), 10) + 1) + '"]')[0].focus();
            // find next focusable element
            } else if (!element.hasAttribute('no-auto-tab')) {
                focusNextElement();
            }
        }
    }

    function keydownFunction(event) {
        var element = event.target;
        if (element.classList.contains('control')) {
            element = GS.findParentTag(element, 'gs-text');
        }
        element.syncGetters();
        if (!element.hasAttribute('defer-insert')) {
            element.value = element.getAttribute('value');
        } else {
            element.value = CryptoJS.AES.encrypt(element.control.value, (window[element.getAttribute('encrypted')] || ''));
        }
    }
    
    function CapsLock(event) {
        var element = event.target;
        if (element.classList.contains('control')) {
            element = GS.findParentTag(element, 'gs-text');
        }
        var temp_caps = event.getModifierState && event.getModifierState( 'CapsLock' );
        //console.log(temp_caps);
        if (temp_caps) {
            element.classList.add('caps');
        } else {
            if (element.classList.contains('caps')) {
                element.classList.remove('caps');
            }
        }
    }

    function focusFunction(event) {
        // getCaps();
        //console.log(window.caps);
        var element = event.target;
        if (element.classList.contains('focus')) {
            return;
        }
        if (element.hasAttribute('defer-insert')) {
            if (focus_event.target.classList.contains('control')) {
                element = element.parentNode.parentNode;
            }
            element.removeEventListener('focus', focusFunction);
            element.classList.add('focus');
            element.addControl();
            if (element.control.value && element.control.value.length > 0) {
                if (element.bolSelect) {
                    element.control.setSelectionRange(0, element.control.value.length);
                } else {
                    element.control.setSelectionRange(element.control.value.length, element.control.value.length);
                }
            }
            element.bolSelect = true;
        } else {
            element = element.parentNode;
            GS.triggerEvent(event.target.parentNode, 'focus');
            event.target.parentNode.classList.add('focus');
        }
        if (element.hasAttribute('encrypted') && element.control) {
            element.control.addEventListener('keydown', keydownFunction);
        }
        if (window.caps) {
            element.classList.add('caps');
        }
    }

    // re-target blur event from control to element
    function blurFunction(event) {
        var element = event.target.parentNode;
        GS.triggerEvent(event.target.parentNode, 'blur');
        event.target.parentNode.classList.remove('focus');
        if (event.target.parentNode.hasAttribute('defer-insert')) {
            event.target.parentNode.removeControl();
        }
        if (element.hasAttribute('encrypted')) {
            event.target.removeEventListener('keydown', keydownFunction);
        }
        //remove icon
        if (element.classList.contains('caps')) {
            element.classList.remove('caps');
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
                //element.value = null;
            }
        }
    }

    function findFor(element) {
        var forElem;
        //console.log(element, element.previousElementSibling)
        if (element.previousElementSibling && element.previousElementSibling.tagName.toUpperCase() == 'LABEL'
            && element.previousElementSibling.hasAttribute('for')
            && element.previousElementSibling.getAttribute('for') == element.getAttribute('id')
        ) {
            forElem = element.previousElementSibling;
        } else if (xtag.query(document, 'label[for="' + element.getAttribute('id') + '"]').length > 0) {
            forElem = xtag.query(document, 'label[for="' + element.getAttribute('id') + '"]')[0];
        }
        //console.log(forElem);
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
        
        /*
            if (element.hasAttribute('id')) {
                findFor(element);
            }
        // please ensure that if the element has an id it is given an id
                if (element.hasAttribute('id')) {
                    element.control.setAttribute('id', element.getAttribute('id') + '_control');
                }
                if (element.hasAttribute('aria-labelledby')) {
                    element.control.setAttribute('aria-labelledby', element.getAttribute('aria-labelledby'));
                }
                if (element.hasAttribute('title')) {
                    element.control.setAttribute('title', element.getAttribute('title'));
                }
        */
    }

    function elementInserted(element) {
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

                    if (element.getAttribute('value')) {
                        if (element.hasAttribute('encrypted') && window[element.getAttribute('encrypted')]) {
                            element.innerHTML = CryptoJS.AES.decrypt(element.getAttribute('value'), (window[element.getAttribute('encrypted')] || '')).toString(CryptoJS.enc.Utf8);
                            element.syncGetters();
                        } else {
                            element.innerHTML = element.getAttribute('value');
                            element.syncGetters();
                        }
                    } else if (element.hasAttribute('placeholder')) {
                        element.innerHTML = '<span class="placeholder">' + element.getAttribute('placeholder') + '</span>';
                    }
    
                    element.addEventListener('keydown', CapsLock);
                    element.addEventListener('focus', focusFunction);
                    element.addEventListener('keyup', checkMaxLength);
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
                    // bind/handle query string
                    if (element.getAttribute('qs')) {
                        createPushReplacePopHandler(element);
                        window.addEventListener('pushstate', function () {
                            createPushReplacePopHandler(element);
                        });
                        window.addEventListener('replacestate', function () {
                            createPushReplacePopHandler(element);
                        });
                        window.addEventListener('popstate', function () {
                            createPushReplacePopHandler(element);
                        });
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
    
                    //var strQSValue;
    
                    // handle control
                    element.handleContents();
    
                    // fill control
                    element.syncView();
    
                    // bind/handle query string
                    if (element.getAttribute('qs')) {
                        //strQSValue = GS.qryGetVal(GS.getQueryString(), element.getAttribute('qs'));
    
                        //if (strQSValue !== '' || !element.getAttribute('value')) {
                        //    element.value = strQSValue;
                        //}
                        createPushReplacePopHandler(element);
                        window.addEventListener('pushstate', function () {
                            createPushReplacePopHandler(element);
                        });
                        window.addEventListener('replacestate', function () {
                            createPushReplacePopHandler(element);
                        });
                        window.addEventListener('popstate', function () {
                            createPushReplacePopHandler(element);
                        });
                    }
    
                    // if this element is empty when it is inserted: initalize
                    if (element.innerHTML.trim() === '') {
                        // handle control
                        element.handleContents();
    
                        // fill control
                        element.syncView();
                    }
                }
            }
        }
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            if (element.hasAttribute('id')) {
                //console.log('running');
                findFor(element);
            }
        }
    }

    xtag.register('gs-text', {
        lifecycle: {
            created: function () {
                elementCreated(this);
            },

            inserted: function () {
                elementInserted(this);
            },

            attributeChanged: function (strAttrName, oldValue, newValue) {
                var element = this;
                if (element.hasAttribute('defer-insert')) {
                    if (element.control) {
                        // if "suspend-created" has been removed: run created and inserted code
                        if (strAttrName === 'suspend-created' && newValue === null) {
                            elementCreated(element);
                            elementInserted(element);
    
                        // if "suspend-inserted" has been removed: run inserted code
                        } else if (strAttrName === 'suspend-inserted' && newValue === null) {
                            elementInserted(element);
    
                        } else if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
                            var currentValue;
    
                            if (strAttrName === 'disabled' || strAttrName === 'readonly') {
                            } else if (strAttrName === 'value' && element.initalized) {
                                if (element.hasAttribute('encrypted')) {
                                    currentValue = CryptoJS.AES.encrypt(element.control.value, (window[element.getAttribute('encrypted')] || ''));
                                } else {
                                    currentValue = element.control.value;
                                }
    
                                // if there is a difference between the new value in the
                                //      attribute and the valued in the front end: refresh the front end
                                newValue = this.hasAttribute('uppercase') ? newValue.toUpperCase() : newValue;
                                currentValue = this.hasAttribute('uppercase') ? currentValue.toUpperCase() : currentValue;
                                if (newValue !== currentValue) {
                                    element.syncView();
                                }
                            }
                            var arrPassThroughAttributes = [
                                    'placeholder', 'name', 'maxlength', 'autocorrect',
                                    'autocapitalize', 'autocomplete', 'autofocus', 'spellcheck',
                                    'readonly', 'disabled'
                                ];
                            if (element.hasAttribute(strAttrName) && arrPassThroughAttributes.indexOf(strAttrName) !== -1) {
                                element.control.setAttribute(strAttrName, newValue);
                            }
                            if (!element.hasAttribute(strAttrName) && element.control.hasAttribute(strAttrName) && arrPassThroughAttributes.indexOf(strAttrName) !== -1) {
                                element.control.removeAttribute(strAttrName);
                            }
                        }
                    }
                } else {
                    // if "suspend-created" has been removed: run created and inserted code
                    if (strAttrName === 'suspend-created' && newValue === null) {
                        elementCreated(element);
                        elementInserted(element);
    
                    // if "suspend-inserted" has been removed: run inserted code
                    } else if (strAttrName === 'suspend-inserted' && newValue === null) {
                        elementInserted(element);
    
                    } else if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
                        var currentValue;
    
                        if (strAttrName === 'disabled' || strAttrName === 'readonly') {
                            // handle control
                            element.handleContents();
    
                            // fill control
                            element.syncView();
    
                        } else if (strAttrName === 'value' && element.initalized) {
                            //if (element.hasAttribute('disabled')) {
                            //    currentValue = element.innerHTML;
                            //} else {
                                if (element.hasAttribute('encrypted')) {
                                    currentValue = CryptoJS.AES.encrypt(element.control.value, (window[element.getAttribute('encrypted')] || ''));
                                } else {
                                    currentValue = element.control.value;
                                }
                            //}
    
                            // if there is a difference between the new value in the
                            //      attribute and the valued in the front end: refresh the front end
                            newValue = this.hasAttribute('uppercase') ? newValue.toUpperCase() : newValue;
                            currentValue = this.hasAttribute('uppercase') ? currentValue.toUpperCase() : currentValue;
                            if (newValue !== currentValue) {
                                element.syncView();
                            }
                        }
                        var arrPassThroughAttributes = [
                                'placeholder', 'name', 'maxlength', 'autocorrect',
                                'autocapitalize', 'autocomplete', 'autofocus', 'spellcheck',
                                'readonly', 'disabled'
                            ];
                        if (element.control) {
                            if (element.hasAttribute(strAttrName) && arrPassThroughAttributes.indexOf(strAttrName) !== -1) {
                                element.control.setAttribute(strAttrName, newValue);
                            }
                            if (!element.hasAttribute(strAttrName) && element.control.hasAttribute(strAttrName) && arrPassThroughAttributes.indexOf(strAttrName) !== -1) {
                                element.control.removeAttribute(strAttrName);
                            }
                        }
                    }
                }
            }
        },
        events: {
            // on keydown and keyup sync the value attribute and the control value
            'keydown': function (event) {
                var element = this;
                if (!element.hasAttribute('readonly') && !element.hasAttribute('disabled')) {
                    element.syncGetters();
                }
            },
            'keyup': function () {
                var element = this;
                if (!element.hasAttribute('readonly') && !element.hasAttribute('disabled')) {
                    element.syncGetters();
                }
            }
        },
        accessors: {
            value: {
                // get value straight from the input
                // I (Nunzio) changed this on 2022-02-26
                // when it was all usint the attribute it was inconsistently not working in onchange event attributes
                // see below getter for full discussion with Michael
                get: function () {
                    if (this.hasAttribute('encrypted')) {
                        return this.getAttribute('value');
                    } else {
                        return this.control.value;
                    }
            //         var element = this;
            //         if (this.hasAttribute('defer-insert')) {
			         //   if (this.hasAttribute('encrypted')) {            
            //                 // return CryptoJS.AES.decrypt(this.getAttribute('value'), (window[element.getAttribute('encrypted')] || '')).toString(CryptoJS.enc.Utf8);
            //                 return this.getAttribute('value');
            //             } else {
            //                 return this.getAttribute('value');
            //             }
            //         } else {
            //             return this.getAttribute('value');
            //         }
                },
                // Nunzio: gs-text keyup ".value" is inconsistent
                // Nunzio: one page it worked as expected
                // Nunzio: another one it didn't get the new value
                // Nunzio: .control.value worked
                // Michael: interesting, what are the different circumstances?
                // Michael: attributes / containers
                // Nunzio: the one that didn't work was in a gs-switch but I don't think that should do anything
                // Nunzio: attributes were identical
                // Nunzio: I suspect it's because the value accessor reads the attribute instead of the control value
                // Nunzio: *********getter code***********
                // Nunzio: why is that?
                // Michael: wouldn't be surprised if that was because of some Firefox issue where the polyfill too time to get to the point where the element was sufficiently instantiated.
                // Michael: In dialogs, firefox has issues instantiating in time
                // Nunzio: firefox isn't polyfilled anymore (except my shim to get the old api to work)
                // Michael: interesting, might be a non-issue at this point.
                // Michael: If you decide to switch it, make sure to comment out the old way and leave a summary of our discussion, date, and your name
                // Nunzio: I'll add it to the list but I'm not dealing with it right now
                // Michael: k


                // set the value of the input and set the value attribute
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
                        this.syncView();
                    }
                }
            }
        },
        methods: {
            focus: function () {
                var element = this;
                if (element.hasAttribute('defer-insert')) {
                    element.bolSelect = false;
                    focusFunction({ target: element });
                    //GS.triggerEvent(element, 'focus');
                } else {
                    var element = this;
                    if (element.control) {
                        element.control.focus();
                    }
                }
            },

            handleContents: function () {
                var element = this;
                var arrPassThroughAttributes = [
                        'placeholder', 'name', 'maxlength', 'autocorrect',
                        'autocapitalize', 'autocomplete', 'autofocus', 'spellcheck',
                        'readonly', 'disabled'
                    ];
                var i;
                var len;

                // if the gs-text element has a tabindex: save the tabindex and remove the attribute
                if (element.hasAttribute('tabindex')) {
                    element.savedTabIndex = element.getAttribute('tabindex');
                    element.removeAttribute('tabindex');
                }

                // if the gs-text doesn't have a disabled attribute: use an input element
                // if (!element.hasAttribute('disabled')) {
                    // add control input and save it to a variable for later use
                    if (element.hasAttribute('show-caps')) {
                        if (element.hasAttribute('type')) {
                            element.setAttribute('input-type', element.getAttribute('type'));
                            element.removeAttribute('type');
                        }
                    }
                    element.innerHTML = '<input class="control" gs-dynamic type="' + ((element.getAttribute('input-type') || element.getAttribute('type')) || 'text') + '" />';
                    element.control = element.children[0];
                    if (element.hasAttribute('id')) {
                        element.control.setAttribute('id', element.getAttribute('id') + '_control');
                    }
                    if (element.hasAttribute('aria-labelledby')) {
                        element.control.setAttribute('aria-labelledby', element.getAttribute('aria-labelledby'));
                    }
                    if (element.hasAttribute('aria-label')) {
                        element.control.setAttribute('aria-label', element.getAttribute('aria-label'));
                    }
                    if (element.hasAttribute('title')) {
                        element.control.setAttribute('title', element.getAttribute('title'));
                    }

                    // bind event re-targeting functions
                    element.control.removeEventListener('keydown', CapsLock);
                    element.control.addEventListener('keydown', CapsLock);

                    element.control.removeEventListener('change', changeFunction);
                    element.control.addEventListener('change', changeFunction);

                    element.control.removeEventListener('focus', focusFunction);
                    element.control.addEventListener('focus', focusFunction);
                    
                    element.removeEventListener('keyup', checkMaxLength);
                    element.addEventListener('keyup', checkMaxLength);

                    element.control.removeEventListener('blur', blurFunction);
                    element.control.addEventListener('blur', blurFunction);

                    element.control.removeEventListener(evt.mouseout, mouseoutFunction);
                    element.control.addEventListener(evt.mouseout, mouseoutFunction);
                    
                    element.control.removeEventListener(evt.mouseover, mouseoverFunction);
                    element.control.addEventListener(evt.mouseover, mouseoverFunction);
                    
                    // copy passthrough attributes to control
                    i = 0;
                    len = arrPassThroughAttributes.length;
                    while (i < len) {
                        if (element.hasAttribute(arrPassThroughAttributes[i])) {
                            if (arrPassThroughAttributes[i] === 'disabled') {
                                element.control.setAttribute(
                                    'readonly',
                                    element.getAttribute(arrPassThroughAttributes[i]) || ''
                                );
                            } else {
                                element.control.setAttribute(
                                    arrPassThroughAttributes[i],
                                    element.getAttribute(arrPassThroughAttributes[i]) || ''
                                );
                            }
                        }
                        i += 1;
                    }

                    // if we saved a tabindex: apply the tabindex to the control
                    if (element.savedTabIndex !== undefined && element.savedTabIndex !== null) {
                        element.control.setAttribute('tabindex', element.savedTabIndex);
                    }

                // else if the gs-text is disabled: clear the control variable and empty the gs-text
                // } else {
                //     element.control = undefined;
                //     element.innerHTML = '';
                // }
            },

            removeControl: function () {
                var element = this;
                if (element.control) {
                    element.setAttribute('tabindex', element.control.getAttribute('tabindex'));
                }
                if (element.control.value) {
                    if (element.hasAttribute('encrypted')) {
                        if (element.hasAttribute('defer-insert')) {
                            element.innerHTML = element.control.value;
                        } else {
                            element.innerHTML = element.control.value;
                            element.syncGetters();
                        }
                    } else {
                        element.innerHTML = element.control.value;
                        element.syncGetters();
                    }
                } else if (element.hasAttribute('placeholder')) {
                    element.innerHTML = '<span class="placeholder">' + element.getAttribute('placeholder') + '</span>';
                } else {
                    element.innerHTML = ''
                }
                element.control = false;
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
                var elementValue = element.innerHTML;
                var elementWidth = element.offsetWidth;
                if (element.children.length > 0) {
                    elementValue = '';
                }
                // if the gs-text element has a tabindex: save the tabindex and remove the attribute
                if (element.hasAttribute('tabindex')) {
                    element.savedTabIndex = element.getAttribute('tabindex');
                    element.removeAttribute('tabindex');
                }
                // add control input and save it to a variable for later use
                element.innerHTML = '';
                element.innerHTML = '<input class="control" gs-dynamic type="' + (element.getAttribute('type') || 'text') + '" />';
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

                element.removeEventListener(evt.mouseout, mouseoutFunction);
                element.addEventListener(evt.mouseout, mouseoutFunction);

                element.removeEventListener(evt.mouseout, mouseoverFunction);
                element.addEventListener(evt.mouseover, mouseoverFunction);
                // copy passthrough attributes to control
                i = 0;
                len = arrPassThroughAttributes.length;
                while (i < len) {
                    if (element.hasAttribute(arrPassThroughAttributes[i])) {
                        if (arrPassThroughAttributes[i] === 'disabled') {
                            element.control.setAttribute(
                                'readonly',
                                element.getAttribute(arrPassThroughAttributes[i]) || ''
                            );
                        } else {
                            element.control.setAttribute(
                                arrPassThroughAttributes[i],
                                element.getAttribute(arrPassThroughAttributes[i]) || ''
                            );
                        }
                    }
                    i += 1;
                }

                element.control.value = elementValue;
                element.value = elementValue;
                // if we saved a tabindex: apply the tabindex to the control
                if (element.savedTabIndex !== undefined && element.savedTabIndex !== null) {
                    element.control.setAttribute('tabindex', element.savedTabIndex);
                }

                element.syncView();
                element.control.focus();
                element.addEventListener('focus', focusFunction);
                element.control.addEventListener('blur', blurFunction);
            },

            syncView: function () {
                var element = this;
                if (element.hasAttribute('defer-insert')) {
                    if (element.control) {
                        if (element.hasAttribute('encrypted')) {
                            var bytes = CryptoJS.AES.decrypt(element.getAttribute('value'), (window[element.getAttribute('encrypted')] || ''));
                            var plaintext = bytes.toString(CryptoJS.enc.Utf8) || '';
                            if (window[element.getAttribute('encrypted')] && plaintext == '' && element.control.value) {
                                GS.triggerEvent(element, 'password-error', {'reason': 'bad', 'keyVariable': element.getAttribute('encrypted')});
                            }
                            element.control.value = plaintext || '';
                        } else {
                            element.control.value = element.getAttribute('value');
                        }
                    } else {
                        if (element.value) {
                            if (element.hasAttribute('encrypted')) {
                                var bytes = CryptoJS.AES.decrypt(element.value, (window[element.getAttribute('encrypted')] || ''));
                                var plaintext = bytes.toString(CryptoJS.enc.Utf8) || '';
                                if (window[element.getAttribute('encrypted')] && plaintext == '' && element.control.value) {
                                    GS.triggerEvent(element, 'password-error', {'reason': 'bad', 'keyVariable': element.getAttribute('encrypted')});
                                }
                                element.innerHTML = plaintext;
                            } else {
                                element.innerHTML = element.value;
                            }
                        } else if (element.hasAttribute('placeholder')) {
                            element.innerHTML = '<span class="placeholder">' + element.getAttribute('placeholder') + '</span>';
                        }
                    }
                    element.initalized = true;
                } else {
                    var element = this;
                    //if (element.hasAttribute('disabled')) {
                    //    element.textContent = element.getAttribute('value') || element.getAttribute('placeholder');
                    //} else {
                        if (element.hasAttribute('encrypted')) {
                            if (!window[element.getAttribute('encrypted')] || !element.getAttribute('value')) {
                                
                            } else {
                                var bytes = CryptoJS.AES.decrypt(element.getAttribute('value'), (window[element.getAttribute('encrypted')] || ''));
                                var plaintext = bytes.toString(CryptoJS.enc.Utf8) || '';
                            if (window[element.getAttribute('encrypted')] && plaintext == '' && element.control.value) {
                                    GS.triggerEvent(element, 'password-error', {'reason': 'bad', 'keyVariable': element.getAttribute('encrypted')});
                                }
                            }
                            element.control.value = plaintext || '';
                        } else {
                            element.control.value = element.getAttribute('value') || '';
                        }
                    //}
                    element.initalized = true;
                }
                
            },

            syncGetters: function () {
                var element = this;
                if (element.hasAttribute('defer-insert')) {
                    if (element.control) {
                        if (element.hasAttribute('encrypted')) {
                            element.control.setAttribute('value', CryptoJS.AES.encrypt(element.hasAttribute('uppercase') ? element.control.value.toUpperCase() : element.control.value, (window[element.getAttribute('encrypted')] || '')));
                        } else {
                            element.setAttribute('value', element.hasAttribute('uppercase') ? element.control.value.toUpperCase() : element.control.value);
                        }
                    }
                } else {
                    if (element.hasAttribute('encrypted')) {
                        element.setAttribute('value', CryptoJS.AES.encrypt(element.hasAttribute('uppercase') ? element.control.value.toUpperCase() : element.control.value, (window[element.getAttribute('encrypted')] || '')));
                    } else {
                        element.setAttribute('value', element.hasAttribute('uppercase') ? element.control.value.toUpperCase() : element.control.value);
                    }
                }
                
            }
        }
    });
});
