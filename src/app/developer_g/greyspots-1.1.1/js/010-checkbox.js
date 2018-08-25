//global addProp, encodeHTML, window, GS, setOrRemoveBooleanAttribute, setOrRemoveTextAttribute, addFlexProps, registerDesignSnippet, designRegisterElement

window.addEventListener('design-register-element', function () {
    'use strict';

    registerDesignSnippet(
        '<gs-checkbox>',
        '<gs-checkbox>',
        'gs-checkbox type="smallint" column="${1:ready_to_ship}">${2}</gs-checkbox>'
    );
    registerDesignSnippet(
        '<gs-checkbox> With Label',
        '<gs-checkbox>',
        'label for="${1:date-insert-ready_to_ship}">${2:Ready To Ship?}:</label>\n' +
                '<gs-checkbox id="${1:date-insert-ready_to_ship}" type="smallint" column="${3:ready_to_ship}"></gs-checkbox>'
    );

    designRegisterElement(
        'gs-checkbox',
        '/env/app/developer_g/greyspots-' + GS.version() + '/documentation/doc-elem-checkbox.html'
    );

    window.designElementProperty_GSCHECKBOX = function (selectedElement) {
        var strVisibilityAttribute;

        addProp('Column', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('column') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'column', this.value);
        });

        addProp('Value', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('value') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'value', this.value);
        });

        addProp('Triple State', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('triplestate')) + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'triplestate', (this.value === 'true'), true);
        });

        addProp('Column In Querystring', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('qs') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'qs', this.value, false);
        });

        addProp('Mini', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('mini')) + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'mini', (this.value === 'true'), true);
        });

        addProp('Inline', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('inline')) + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'inline', (this.value === 'true'), true);
        });

        // TITLE attribute
        addProp('Title', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('title') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'title', this.value);
        });

        // TABINDEX attribute
        addProp('Tabindex', true, '<gs-number class="target" value="' + encodeHTML(selectedElement.getAttribute('tabindex') || '') + '" mini></gs-number>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'tabindex', this.value);
        });

        addProp('Type', true, '<gs-select class="target" value="' + encodeHTML(selectedElement.getAttribute('type') || '') + '" mini>' +
                                        '<option value="">Detect</option>' +
                                        '<option value="smallint">Smallint</option>' +
                                        '<option value="boolean">Boolean</option>' +
                                    '</gs-select>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'type', this.value);
        });

        // visibility attributes
        strVisibilityAttribute = '';
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

        addProp(
            'Visibility',
            true,
            '<gs-select class="target" value="' + strVisibilityAttribute + '" mini>' +
                    '    <option value="">Visible</option>' +
                    '    <option value="hidden">Invisible</option>' +
                    '    <option value="hide-on-desktop">Invisible at desktop size</option>' +
                    '    <option value="hide-on-tablet">Invisible at tablet size</option>' +
                    '    <option value="hide-on-phone">Invisible at phone size</option>' +
                    '    <option value="show-on-desktop">Visible at desktop size</option>' +
                    '    <option value="show-on-tablet">Visible at tablet size</option>' +
                    '    <option value="show-on-phone">Visible at phone size</option>' +
                    '</gs-select>',
            function () {
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
            }
        );

        // DISABLED attribute
        addProp(
            'Disabled',
            true,
            '<gs-checkbox class="target" value="' + (
                selectedElement.hasAttribute('disabled') || ''
            ) +
                    '" mini></gs-checkbox>',
            function () {
                return setOrRemoveBooleanAttribute(selectedElement, 'disabled', this.value === 'true', true);
            }
        );

        // READONLY attribute
        addProp(
            'Readonly',
            true,
            '<gs-checkbox class="target" value="' + (
                selectedElement.hasAttribute('readonly') || ''
            ) +
                    '" mini></gs-checkbox>',
            function () {
                return setOrRemoveBooleanAttribute(selectedElement, 'readonly', this.value === 'true', true);
            }
        );

        // addProp('Corners', true, '<div class="target">' +
        //             '<gs-checkbox value="' + (!(selectedElement.hasAttribute('remove-all') ||
        //                                         selectedElement.hasAttribute('remove-top') ||
        //                                         selectedElement.hasAttribute('remove-left') ||
        //                                         selectedElement.hasAttribute('remove-top-left'))).toString() + 
        //                     '" remove-right remove-bottom id="round-top-left-corner________" inline></gs-checkbox>' +

        //             '<gs-checkbox value="' + (!(selectedElement.hasAttribute('remove-all') ||
        //                                         selectedElement.hasAttribute('remove-top') ||
        //                                         selectedElement.hasAttribute('remove-right') ||
        //                                         selectedElement.hasAttribute('remove-top-right'))).toString() + 
        //                     '" remove-left remove-bottom id="round-top-right-corner________" inline></gs-checkbox><br />' +

        //             '<gs-checkbox value="' + (!(selectedElement.hasAttribute('remove-all') ||
        //                                         selectedElement.hasAttribute('remove-bottom') ||
        //                                         selectedElement.hasAttribute('remove-left') ||
        //                                         selectedElement.hasAttribute('remove-bottom-left'))).toString() + 
        //                     '" remove-right remove-top id="round-bottom-left-corner________" inline></gs-checkbox>' +

        //             '<gs-checkbox value="' + (!(selectedElement.hasAttribute('remove-all') ||
        //                                         selectedElement.hasAttribute('remove-bottom') ||
        //                                         selectedElement.hasAttribute('remove-right') ||
        //                                         selectedElement.hasAttribute('remove-bottom-right'))).toString() + 
        //                     '" remove-left remove-top id="round-bottom-right-corner________" inline></gs-checkbox>' +
        //         '</div>', function () {
        //     var topLeft = document.getElementById('round-top-left-corner________').value === 'true';
        //     var topRight = document.getElementById('round-top-right-corner________').value === 'true';
        //     var bottomLeft = document.getElementById('round-bottom-left-corner________').value === 'true';
        //     var bottomRight = document.getElementById('round-bottom-right-corner________').value === 'true';
        //     var arrStrAttr = [];
        //     var i;
        //     var len;

        //     selectedElement.removeAttribute('remove-all');
        //     selectedElement.removeAttribute('remove-top');
        //     selectedElement.removeAttribute('remove-bottom');
        //     selectedElement.removeAttribute('remove-left');
        //     selectedElement.removeAttribute('remove-right');
        //     selectedElement.removeAttribute('remove-top-left');
        //     selectedElement.removeAttribute('remove-top-right');
        //     selectedElement.removeAttribute('remove-bottom-left');
        //     selectedElement.removeAttribute('remove-bottom-right');

        //     if (!topLeft && !topRight && !bottomLeft && !bottomRight) {
        //         arrStrAttr.push('remove-all');
        //     } else if (!topLeft && !topRight) {
        //         arrStrAttr.push('remove-top');
        //     } else if (!bottomLeft && !bottomRight) {
        //         arrStrAttr.push('remove-bottom');
        //     } else if (!topLeft && !bottomLeft) {
        //         arrStrAttr.push('remove-left');
        //     } else if (!topRight && !bottomRight) {
        //         arrStrAttr.push('remove-right');
        //     }

        //     if (!topLeft && !bottomLeft && arrStrAttr[0] !== 'remove-all') {
        //         arrStrAttr.push('remove-left');
        //     } else if (!topLeft && topRight) {
        //         arrStrAttr.push('remove-top-left');
        //     } else if (!bottomLeft && bottomRight) {
        //         arrStrAttr.push('remove-bottom-left');
        //     }

        //     if (!topRight && !bottomRight && arrStrAttr[0] !== 'remove-all') {
        //         arrStrAttr.push('remove-right');
        //     } else if (topLeft && !topRight) {
        //         arrStrAttr.push('remove-top-right');
        //     } else if (bottomLeft && !bottomRight) {
        //         arrStrAttr.push('remove-bottom-right');
        //     }

        //     i = 0;
        //     len = arrStrAttr.length;
        //     while (i < len) {
        //         selectedElement.setAttribute(arrStrAttr[i], '');
        //         i += 1;
        //     }

        //     return selectedElement;
        // });

        //addFlexContainerProps(selectedElement);
        addFlexProps(selectedElement);

        //// SUSPEND-CREATED attribute
        //addProp('suspend-created', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('suspend-created') || '') + '" mini></gs-checkbox>', function () {
        //    return setOrRemoveBooleanAttribute(selectedElement, 'suspend-created', this.value === 'true', true);
        //});

        // SUSPEND-INSERTED attribute
        addProp('suspend-inserted', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('suspend-inserted') || '') + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'suspend-inserted', this.value === 'true', true);
        });
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    function saveDefaultAttributes(element) {
        var i;
        var len;
        var arrAttr;
        var jsnAttr;

        // we need a place to store the attributes
        element.internal.defaultAttributes = {};

        // loop through attributes and store them in the internal defaultAttributes object
        i = 0;
        len = element.attributes.length;
        arrAttr = element.attributes;
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
        // console.log(element, element.previousElementSibling)
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
            if (! element.hasAttribute('aria-label') && element.innerText.length === 0) {
                element.setAttribute('aria-label', forElem.innerText);
            }
        }
    }

    //
    function elementInserted(element) {
        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;
                element.internal = {};
                

                if (element.hasAttribute('value')) {
                    // console.log(element.getAttribute('value'));
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

                    window.addEventListener('pushstate',    function () { pushReplacePopHandler(element); });
                    window.addEventListener('replacestate', function () { pushReplacePopHandler(element); });
                    window.addEventListener('popstate',     function () { pushReplacePopHandler(element); });
                }

                element.addEventListener('focus', function (event) {
                    element.classList.add('focus');
                });

                element.addEventListener('blur', function (event) {
                    element.classList.remove('focus');
                });

                element.addEventListener(evt.mouseout, function (event) {
                    element.classList.remove('hover');
                });

                element.addEventListener(evt.mouseover, function (event) {
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
                // console.log('running');
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

            attributeChanged: function (strAttrName, oldValue, newValue) {
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
                if (!this.hasAttribute('suspend-created') &&
                    !this.hasAttribute('suspend-inserted') &&
                    !this.hasAttribute('readonly')) {
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
            'click': function (event) {
                var bolTripleState;
                var strValue;
                var strType;

                if (!this.hasAttribute('suspend-created') &&
                    !this.hasAttribute('suspend-inserted') &&
                    !this.hasAttribute('readonly')) {
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
                    // else default to boolean (backwards compatibility)
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

                    //// here be dragons
                    //if (strValue === 'false') {
                    //    this.setAttribute('value', 'true');
                    //} else if (strValue === 'true') {
                    //    if (bolTripleState) {
                    //        this.setAttribute('value', 'null');
                    //    } else {
                    //        this.setAttribute('value', 'false');
                    //    }
                    //} else if (strValue === 'null') {
                    //    this.setAttribute('value', 'false');
                    //} else if (strValue === '0') {
                    //    this.setAttribute('value', '-1');
                    //} else if (strValue === '-1') {
                    //    if (bolTripleState) {
                    //        this.setAttribute('value', 'n');
                    //    } else {
                    //        this.setAttribute('value', '0');
                    //    }
                    //} else if (strValue === 'n') {
                    //    this.setAttribute('value', '0');
                    //} else if (strValue === 0) {
                    //    this.setAttribute('value', -1);
                    //} else if (strValue === -1) {
                    //    if (bolTripleState) {
                    //        this.setAttribute('value', 'n');
                    //    } else {
                    //        this.setAttribute('value', 0);
                    //    }
                    //} else if (strValue === 'n') {
                    //    this.setAttribute('value', 0);
                    //} else if (strValue === false) {
                    //    this.setAttribute('value', true);
                    //} else if (strValue === true) {
                    //    if (bolTripleState) {
                    //        this.setAttribute('value', null);
                    //    } else {
                    //        this.setAttribute('value', false);
                    //    }
                    //} else if (strValue === null) {
                    //    //this.setAttribute('value', false);
                    //    if (this.getAttribute('type') === 'smallint') {
                    //        this.setAttribute('value', '-1');
                    //    } else {
                    //        this.setAttribute('value', 'true');
                    //    }
                    //} else {
                    //    if (this.getAttribute('type') === 'smallint') {
                    //        this.setAttribute('value', '-1');
                    //    } else {
                    //        this.setAttribute('value', 'true');
                    //    }
                    //}

                    this.classList.remove('down');
                    xtag.fireEvent(this, 'change', {bubbles: true, cancelable: true});
                }
            },
            'keydown': function (event) {
                if (!this.hasAttribute('suspend-created') &&
                    !this.hasAttribute('suspend-inserted') &&
                    !this.hasAttribute('readonly')) {
                    // if we pressed return (13) or space (32)
                    if (event.keyCode === 13 || event.keyCode === 32) {
                        // prevent default and stop propagation (to prevent scrolling of the page)
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    // if we are not disabled and we pressed return (13) or space (32): trigger click
                    if (!this.attributes.disabled && (event.keyCode === 13 || event.keyCode === 32)) {
                        xtag.fireEvent(this, 'click', { bubbles: true, cancelable: true });
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