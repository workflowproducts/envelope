//global GS, window, document, registerDesignSnippet, designRegisterElement, addProp, encodeHTML, setOrRemoveTextAttribute, setOrRemoveBooleanAttribute, addFlexProps

window.addEventListener('design-register-element', function () {

    registerDesignSnippet('<gs-number>', '<gs-number>', 'gs-number column="${1:name}"></gs-number>');
    registerDesignSnippet('<gs-number> With Label', '<gs-number>', 'label for="${1:text-insert-account-name}">${2:Account Name}:</label>\n' +
                                                               '<gs-number id="${1:date-insert-account-name}" column="${3:account_name}"></gs-number>');
    
    designRegisterElement('gs-number', '/env/app/developer_g/greyspots-' + GS.version() + '/documentation/index.html#controls_text');

    window.designElementProperty_GSTEXT = function (selectedElement) {
        addProp('Column', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('column') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'column', this.value);
        });

        addProp('Value', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('value') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'value', this.value);
        });

        addProp('Column In Querystring', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('qs') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'qs', this.value, false);
        });

        addProp('Placeholder', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('placeholder') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'placeholder', this.value);
        });

        addProp('Mini', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('mini')) + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'mini', (this.value === 'true'), true);
        });

        // TITLE attribute
        addProp('Title', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('title') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'title', this.value);
        });

        // TABINDEX attribute
        addProp('Tabindex', true, '<gs-number class="target" value="' + encodeHTML(selectedElement.getAttribute('tabindex') || '') + '" mini></gs-number>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'tabindex', this.value);
        });

        addProp('Max-length', true, '<gs-number class="target" value="' + encodeHTML(selectedElement.getAttribute('max-length') || '') + '" mini></gs-number>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'max-length', this.value);
        });

        addProp('Autocorrect', true, '<gs-checkbox class="target" value="' + (selectedElement.getAttribute('autocorrect') !== 'off') + '" mini></gs-checkbox>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'autocorrect', (this.value === 'false' ? 'off' : ''));
        });

        addProp('Autocapitalize', true, '<gs-checkbox class="target" value="' + (selectedElement.getAttribute('autocapitalize') !== 'off') + '" mini></gs-checkbox>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'autocapitalize', (this.value === 'false' ? 'off' : ''));
        });

        addProp('Autocomplete', true, '<gs-checkbox class="target" value="' + (selectedElement.getAttribute('autocomplete') !== 'off') + '" mini></gs-checkbox>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'autocomplete', (this.value === 'false' ? 'off' : ''));
        });

        addProp('Spellcheck', true, '<gs-checkbox class="target" value="' + (selectedElement.getAttribute('spellcheck') !== 'false') + '" mini></gs-checkbox>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'spellcheck', (this.value === 'false' ? 'false' : ''));
        });

        addProp('Show Caps Lock', true, '<gs-checkbox class="target" value="' + (selectedElement.getAttribute('show-caps') !== 'false') + '" mini></gs-checkbox>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'show-caps', (this.value === 'false' ? 'false' : ''));
        });

        // SUSPEND-CREATED attribute
        addProp('suspend-created', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('suspend-created') || '') + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'suspend-created', this.value === 'true', true);
        });

        // SUSPEND-INSERTED attribute
        addProp('suspend-inserted', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('suspend-inserted') || '') + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'suspend-inserted', this.value === 'true', true);
        });

        // visibility attributes
        var strVisibilityAttribute = '';
        if (selectedElement.hasAttribute('hidden')) {
            strVisibilityAttribute = 'hidden';
        }
        if (selectedElement.hasAttribute('hide-on-desktop')) {
            strVisibilityAttribute = 'hide-on-desktop';
        }
        if (selectedElement.hasAttribute('hide-on-tablet')) {
            strVisibilityAttribute = 'hide-on-tablet';
        }
        if (selectedElement.hasAttribute('hide-on-phone')) {
            strVisibilityAttribute = 'hide-on-phone';
        }
        if (selectedElement.hasAttribute('show-on-desktop')) {
            strVisibilityAttribute = 'show-on-desktop';
        }
        if (selectedElement.hasAttribute('show-on-tablet')) {
            strVisibilityAttribute = 'show-on-tablet';
        }
        if (selectedElement.hasAttribute('show-on-phone')) {
            strVisibilityAttribute = 'show-on-phone';
        }

        addProp('Visibility', true,
                '<gs-select class="target" value="' + strVisibilityAttribute + '" mini>' +
                '    <option value="">Visible</option>' +
                '    <option value="hidden">Invisible</option>' +
                '    <option value="hide-on-desktop">Invisible at desktop size</option>' +
                '    <option value="hide-on-tablet">Invisible at tablet size</option>' +
                '    <option value="hide-on-phone">Invisible at phone size</option>' +
                '    <option value="show-on-desktop">Visible at desktop size</option>' +
                '    <option value="show-on-tablet">Visible at tablet size</option>' +
                '    <option value="show-on-phone">Visible at phone size</option>' +
                '</gs-select>', function () {
            selectedElement.removeAttribute('hidden');
            selectedElement.removeAttribute('hide-on-desktop');
            selectedElement.removeAttribute('hide-on-tablet');
            selectedElement.removeAttribute('hide-on-phone');
            selectedElement.removeAttribute('show-on-desktop');
            selectedElement.removeAttribute('show-on-tablet');
            selectedElement.removeAttribute('show-on-phone');

            if (this.value) {
                selectedElement.setAttribute(this.value, '');
            }

            return selectedElement;
        });

        // DISABLED attribute
        addProp('Disabled', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('disabled') || '') + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'disabled', this.value === 'true', true);
        });
        
        addProp('Readonly', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('readonly') || '') + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'readonly', this.value === 'true', true);
        });

        addFlexProps(selectedElement);
    };
});

window.addEventListener('keydown', function (event) {
    window.caps = event.getModifierState && event.getModifierState( 'CapsLock' );
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
            element = GS.findParentTag(element, 'gs-number');
        }
        element.syncGetters();
        if (element.hasAttribute('max-length') && element.value.length >= element.getAttribute('max-length')) {
            if (element.value.length > element.getAttribute('max-length')) {
                element.value = element.value.substring(0,element.getAttribute('max-length'));
            }
            if (element.control.hasAttribute('tabindex') && xtag.query(document, '[tabindex="' + (parseInt(element.control.getAttribute('tabindex'), 10) + 1) + '"]').length > 0) {
                xtag.query(document, '[tabindex="' + (parseInt(element.control.getAttribute('tabindex'), 10) + 1) + '"]')[0].focus();
            // find next focusable element
            } else {
                focusNextElement();
            }
        }
    }
    
    function CapsLock(event) {
        var element = event.target;
        if (element.classList.contains('control')) {
            element = GS.findParentTag(element, 'gs-number');
        }
        var temp_caps = event.getModifierState && event.getModifierState( 'CapsLock' );
        if (temp_caps) {
            element.classList.add('caps');
        } else {
            if (element.classList.contains('caps')) {
                element.classList.remove('caps');
            }
        }
    }

    function focusFunction(event) {
        var element = event.target;
        if (element.classList.contains('focus')) {
            return;
        }
        
        element = element.parentNode;
        GS.triggerEvent(event.target.parentNode, 'focus');
        event.target.parentNode.classList.add('focus');
        if (window.caps) {
            element.classList.add('caps');
        }
    }

    // re-target blur event from control to element
    function blurFunction(event) {
        var element = event.target.parentNode;
        GS.triggerEvent(event.target.parentNode, 'blur');
        event.target.parentNode.classList.remove('focus');
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

    function elementInserted(element) {
        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;
                element.internal = {};
                saveDefaultAttributes(element);

                // handle control
                element.handleContents();

                // fill control
                element.syncView();

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

                // if this element is empty when it is inserted: initalize
                if (element.innerHTML.trim() === '') {
                    // handle control
                    element.handleContents();

                    // fill control
                    element.syncView();
                }
            }
        }

        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            if (element.hasAttribute('id')) {
                findFor(element);
            }
        }
    }

    xtag.register('gs-number', {
        lifecycle: {
            created: function () {
                elementCreated(this);
            },

            inserted: function () {
                elementInserted(this);
            },

            attributeChanged: function (strAttrName, oldValue, newValue) {
                var element = this;
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
                        currentValue = element.control.value;

                        // if there is a difference between the new value in the
                        //      attribute and the valued in the front end: refresh the front end
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
        },
        events: {
            // on keydown and keyup sync the value attribute and the control value
            'keydown': function (event) {
                var element = this;
                this.control.value = this.control.value.replace(/[^0-9\.]/g,'');
                if (!element.hasAttribute('readonly') && !element.hasAttribute('disabled')) {
                        element.syncGetters();
                }
            },
            'keyup': function () {
                var element = this;
                this.control.value = this.control.value.replace(/[^0-9\.]/g,'');
                if (!element.hasAttribute('readonly') && !element.hasAttribute('disabled')) {
                    element.syncGetters();
                }
            }
        },
        accessors: {
            value: {
                // get value straight from the input
                get: function () {
                    var element = this;
                    return this.getAttribute('value');
                },

                // set the value of the input and set the value attribute
                set: function (strNewValue) {
                    this.setAttribute('value', strNewValue);
                }
            }
        },
        methods: {
            focus: function () {
                var element = this;
                if (element.control) {
                    element.control.focus();
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

                // if the gs-number element has a tabindex: save the tabindex and remove the attribute
                if (element.hasAttribute('tabindex')) {
                    element.savedTabIndex = element.getAttribute('tabindex');
                    element.removeAttribute('tabindex');
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
                
                element.control.removeEventListener(evt.mouseout, mouseoverFunction);
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
            },

            syncView: function () {
                var element = this;
                element.control.value = ((element.getAttribute('value') === '\\N') ? '' : element.getAttribute('value') || '');
                element.initalized = true;
                
            },

            syncGetters: function () {
                var element = this;
                element.setAttribute('value', (element.control.value || '\\N'));
            }
        }
    });
});
