//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps, addFocusEvents
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    'use strict';

    addSnippet(
        '<gs-checkbox>',
        '<gs-checkbox>',
        'gs-checkbox type="smallint" column="${1:ready_to_ship}">${2}</gs-checkbox>'
    );
    addSnippet(
        '<gs-checkbox> With Label',
        '<gs-checkbox>',
        'label for="${1:date-insert-ready_to_ship}">${2:Ready To Ship?}:</label>\n' +
                '<gs-checkbox id="${1:date-insert-ready_to_ship}" type="smallint" column="${3:ready_to_ship}"></gs-checkbox>'
    );

    addElement('gs-checkbox', '#controls_checkbox');

    window.designElementProperty_GSCHECKBOX = function () {
        addGSControlProps();
        addCheck('D', 'Triple State', 'triplestate');
        addCheck('O', 'Column In QS', 'qs');
        addCheck('V', 'Inline', 'inline');
        addSelect('D', 'Type', 'type', [
            {"val": "", "txt": "Detect"},
            {"val": "smallint", "txt": "Smallint"},
            {"val": "boolean", "txt": "Boolean"}
        ]);
        addFocusEvents();
        addCornerRoundProps();
        addFlexProps();
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    function saveDefaultAttributes(element) {
        var i;
        var len;
        var jsnAttr;

        // we need a place to store the attributes
        element.internal.defaultAttributes = {};

        // loop through attributes and store them in the internal defaultAttributes object
        i = 0;
        len = element.attributes.length;
        while (i < len) {
            jsnAttr = element.attributes[i];

            element.internal.defaultAttributes[jsnAttr.nodeName] = (jsnAttr.value || '');

            i += 1;
        }
    }

    function pushReplacePopHandler(element) {
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
                element.internal.bolQSFirstRun = true;
                if (strQSValue !== '' || !element.getAttribute('value')) {
                    element.setAttribute('value', strQSValue);
                }
            } else {
                element.value = strQSValue;
            }
        }
    }

    // dont do anything that modifies the element here
    function elementCreated(element) {
        // if "created" hasn't been suspended: run created code
        if (!element.hasAttribute('suspend-created')) {
            if (!element.hasAttribute('role')) {
                element.setAttribute('role', 'checkbox');
            }
        }
    }

    function findFor(element) {
        var forElem;

        if (
            element.previousElementSibling &&
            element.previousElementSibling.tagName.toUpperCase() === 'LABEL' &&
            element.previousElementSibling.hasAttribute('for') &&
            element.previousElementSibling.getAttribute('for') === element.getAttribute('id')
        ) {
            forElem = element.previousElementSibling;
        } else if (xtag.query(document, 'label[for="' + element.getAttribute('id') + '"]').length > 0) {
            forElem = xtag.query(document, 'label[for="' + element.getAttribute('id') + '"]')[0];
        }

        if (forElem) {
            if (!element.hasAttribute('aria-label') && element.innerText.length === 0) {
                element.setAttribute('aria-label', forElem.innerText);
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

                if (element.hasAttribute('value')) {
                    //console.log(element.getAttribute('value'));
                    if (element.getAttribute('value') === 'true' || element.getAttribute('value') === '-1') {
                        element.setAttribute('aria-checked', 'true');
                    } else if (element.getAttribute('value') === 'false' || element.getAttribute('value') === '0') {
                        element.setAttribute('aria-checked', 'false');
                    } else {
                        element.setAttribute('aria-checked', 'mixed');
                    }
                }

                // save default attribute settings so that the qs code can access those values
                saveDefaultAttributes(element);

                // if this checkbox has the "qs" attribute: fill from querystring and bind to querystring
                if (element.hasAttribute('qs')) {
                    pushReplacePopHandler(element);

                    window.addEventListener('pushstate', function () {
                        pushReplacePopHandler(element);
                    });
                    window.addEventListener('replacestate', function () {
                        pushReplacePopHandler(element);
                    });
                    window.addEventListener('popstate', function () {
                        pushReplacePopHandler(element);
                    });
                }

                element.addEventListener('focus', function () {
                    element.classList.add('focus');
                });

                element.addEventListener('blur', function () {
                    element.classList.remove('focus');
                });

                element.addEventListener(evt.mouseout, function () {
                    element.classList.remove('hover');
                });

                element.addEventListener(evt.mouseover, function () {
                    element.classList.add('hover');
                });

                // default value to false
                if (element.getAttribute('type') === 'smallint') {
                    element.value = element.getAttribute('value') || 0;
                } else {
                    element.value = element.getAttribute('value') || false;
                }

                // // add a tabindex to allow focus
                // if (!element.hasAttribute('tabindex')) {
                //     element.tabIndex = 0;
                // }
                // add a tabindex to allow focus (if allowed)
                if (!element.hasAttribute('no-focus')) {
                    if ((!element.tabIndex) || element.tabIndex === -1) {
                        element.tabIndex = 0;
                    }
                } else {
                    element.removeAttribute('tabindex');
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

    xtag.register('gs-checkbox', {
        lifecycle: {
            created: function () {
                var element = this;
                // if the value was set before the "created" lifecycle code runs: set attribute
                //      (discovered when trying to set a value of a date control in the after_open of a dialog)
                //      ("delete" keyword added because of firefox)
                if (
                    !element.getAttribute('value') &&
                    element.value !== null &&
                    element.value !== undefined &&
                    (
                        typeof element.value === 'boolean' ||
                        element.value === '-1' ||
                        element.value === '0' ||
                        element.value === 'true' ||
                        element.value === 'false' ||
                        element.value === 'null' ||
                        element.value === 'n'
                    )
                ) {
                    element.setAttribute('value', element.value);
                    delete element.value;
                }

                elementCreated(element);
            },

            inserted: function () {
                elementInserted(this);
            },

            attributeChanged: function (strAttrName, ignore, newValue) {//oldValue
                // if "suspend-created" has been removed: run created and inserted code
                if (strAttrName === 'suspend-created' && newValue === null) {
                    elementCreated(this);
                    elementInserted(this);

                // if "suspend-inserted" has been removed: run inserted code
                } else if (strAttrName === 'suspend-inserted' && newValue === null) {
                    elementInserted(this);

                } else if (!this.hasAttribute('suspend-created') && !this.hasAttribute('suspend-inserted')) {
                    // attribute code
                    if (strAttrName === 'value') {
                        if ((newValue === 'true') || (newValue === '-1')) {
                            this.setAttribute('aria-checked', 'true');
                        } else if ((newValue === 'false') || (newValue === '0')) {
                            this.setAttribute('aria-checked', 'false');
                        } else {
                            this.setAttribute('aria-checked', 'mixed');
                        }
                    }
                }
            }
        },
        events: {
            'mousedown': function () {
                if (
                    !this.hasAttribute('suspend-created') &&
                    !this.hasAttribute('suspend-inserted') &&
                    !this.hasAttribute('readonly')
                ) {
                    this.classList.add('down');
                }
            },
            'mouseout': function () {
                if (!this.hasAttribute('suspend-created') && !this.hasAttribute('suspend-inserted')) {
                    if (this.classList.contains('down')) {
                        this.classList.remove('down');
                    }
                }
            },
            'click': function () {
                var bolTripleState;
                var strValue;
                var strType;

                if (
                    !this.hasAttribute('suspend-created') &&
                    !this.hasAttribute('suspend-inserted') &&
                    !this.hasAttribute('readonly')
                ) {
                    bolTripleState = this.hasAttribute('triplestate');
                    strValue = this.getAttribute('value').trim().toLowerCase();

                    // get type from type attribute
                    strType = this.getAttribute('type');

                    // if type is not valid, get type from current value
                    if (strType !== 'smallint' && strType !== 'boolean') {
                        if (strValue === 'false' || strValue === 'true' || strValue === 'null') {
                            strType = 'boolean';
                        } else if (strValue === '0' || strValue === '-1' || strValue === 'n') {
                            strType = 'smallint';
                    // else default to boolean (this is for backwards compatibility, we prefer smallint)
                        } else {
                            strType = 'boolean';
                        }
                    }

                    // resolve current value to the correct type
                    if (strType === 'smallint') {
                        if (strValue === '0' || strValue === 'false') {
                            strValue = '0';
                        } else if (strValue === '-1' || strValue === 'true') {
                            strValue = '-1';
                        } else if (strValue === 'n' || strValue === 'null') {
                            strValue = 'n';
                        } else {
                            strValue = '0';
                        }
                    } else if (strType === 'boolean') {
                        if (strValue === '0' || strValue === 'false') {
                            strValue = 'false';
                        } else if (strValue === '-1' || strValue === 'true') {
                            strValue = 'true';
                        } else if (strValue === 'n' || strValue === 'null') {
                            strValue = 'null';
                        } else {
                            strValue = 'false';
                        }
                    }

                    // get new value based on current value
                    if (strType === 'smallint') {
                        if (strValue === '0') {
                            if (bolTripleState) {
                                strValue = 'n';
                            } else {
                                strValue = '-1';
                            }
                        } else if (strValue === '-1') {
                            strValue = '0';
                        } else if (strValue === 'n') {
                            strValue = '-1';
                        }
                    } else if (strType === 'boolean') {
                        if (strValue === 'false') {
                            if (bolTripleState) {
                                strValue = 'null';
                            } else {
                                strValue = 'true';
                            }
                        } else if (strValue === 'true') {
                            strValue = 'false';
                        } else if (strValue === 'null') {
                            strValue = 'true';
                        }
                    }

                    // set new value
                    this.setAttribute('value', strValue);

                    this.classList.remove('down');
                    xtag.fireEvent(this, 'change', {bubbles: true, cancelable: true});
                }
            },
            'keydown': function (event) {
                if (
                    !this.hasAttribute('suspend-created') &&
                    !this.hasAttribute('suspend-inserted') &&
                    !this.hasAttribute('readonly')
                ) {
                    // if we pressed return (13) or space (32)
                    if (event.keyCode === 13 || event.keyCode === 32) {
                        // prevent default and stop propagation (to prevent scrolling of the page)
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    // if we are not disabled and we pressed return (13) or space (32): trigger click
                    if (!this.attributes.disabled && (event.keyCode === 13 || event.keyCode === 32)) {
                        xtag.fireEvent(this, 'click', {bubbles: true, cancelable: true});
                    }
                }
            }
        },
        accessors: {
            value: {
                // get value straight from the attribute
                get: function () {
                    return this.getAttribute('value');
                },

                // set the value attribute
                set: function (newValue) {
                    this.setAttribute('value', newValue);
                }
            },
            textValue: {
                // return a text representation of the value
                get: function () {
                    var currentValue = this.getAttribute('value');

                    // if value is true: return YES
                    if (currentValue === '-1' || currentValue === 'true') {
                        return 'YES';
                    }

                    // if value is false: return NO
                    if (currentValue === '0' || currentValue === 'false') {
                        return 'NO';
                    }

                    // if value is null: return empty string
                    return '';
                },

                // set the value attribute
                set: function (newValue) {
                    if (newValue === 'YES') {
                        newValue = 'true';
                    }
                    if (newValue === 'NO') {
                        newValue = 'false';
                    }
                    this.setAttribute('value', newValue);
                }
            }
        },
        methods: {

        }
    });
});