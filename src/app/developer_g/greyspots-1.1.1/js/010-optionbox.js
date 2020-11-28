//global xtag, window, document, registerDesignSnippet, designRegisterElement, addProp, encodeHTML
//global setOrRemoveTextAttribute, setOrRemoveBooleanAttribute, GS, addFlexProps
//jslint this

window.addEventListener('design-register-element', function () {
    registerDesignSnippet('<gs-optionbox>', '<gs-optionbox>', 'gs-optionbox column="${1}">\n' +
                                                              '    <gs-option value="${2}">${3}</gs-option>\n' +
                                                              '</gs-optionbox>');

    designRegisterElement('gs-optionbox', '/env/app/developer_g/greyspots-' + GS.version() + '/documentation/index.html#controls_optionbox');

    window.designElementProperty_GSOPTIONBOX = function (selectedElement) {
        addProp('Column', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('column') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'column', this.value);
        });

        addProp('Value', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('value') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'value', this.value);
        });

        addProp('Clearable', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('clearable') || '') + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'clearable', this.value === 'true', true);
        });

        addProp('Column In Querystring', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('qs') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'qs', this.value, false);
        });

        addProp('Mini', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('mini') || '') + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'mini', this.value === 'true', true);
        });

        addProp('No Targets', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('no-target') || '') + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'no-target', this.value === 'true', true);
        });

        // TITLE attribute
        addProp('Title', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('title') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'title', this.value);
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

        addProp('Visibility', true, '<gs-select class="target" value="' + strVisibilityAttribute + '" mini>' +
                                        '<option value="">Visible</option>' +
                                        '<option value="hidden">Invisible</option>' +
                                        '<option value="hide-on-desktop">Invisible at desktop size</option>' +
                                        '<option value="hide-on-tablet">Invisible at tablet size</option>' +
                                        '<option value="hide-on-phone">Invisible at phone size</option>' +
                                        '<option value="show-on-desktop">Visible at desktop size</option>' +
                                        '<option value="show-on-tablet">Visible at tablet size</option>' +
                                        '<option value="show-on-phone">Visible at phone size</option>' +
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

        //addFlexContainerProps(selectedElement);
        addFlexProps(selectedElement);
    };
    /*
    window.designElementProperty_GSOPTION = function(selectedElement) {
        addProp('Hidden Value:', true, '<gs-text class="target" value="' + (selectedElement.getAttribute('value') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'value', this.value);
        });

        // TITLE attribute
        addProp('Title', true, '<gs-text class="target" value="' + (selectedElement.getAttribute('title') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'title', this.value);
        });

        addFlexContainerProps(selectedElement);
        //addFlexProps(selectedElement);
    };*/
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // removes selected attribute from old selected option adds selected attribute to option
    function highlightOption(element, option, bolFocus) {
        var i;
        var len;
        var arrSelectedOptions;
        var arrAriaSelectedOptions;

        // clear previous selection
        arrSelectedOptions = xtag.query(element, 'gs-option[selected]');
        arrAriaSelectedOptions = xtag.query(element, 'gs-option');
        i = 0;
        len = arrSelectedOptions.length;
        while (i < len) {
            arrSelectedOptions[i].removeAttribute('selected');
            arrSelectedOptions[i].setAttribute('tabindex', '-1');
            i += 1;
        }

        i = 0;
        len = arrAriaSelectedOptions.length;
        while (i < len) {
            arrAriaSelectedOptions[i].setAttribute('aria-checked', 'false');
            i += 1;
        }

        // select/highlight the record that was provided
        if (option) {
            option.setAttribute('selected', '');
            option.setAttribute('tabindex', '0');
            option.setAttribute('aria-checked', 'true');
            if (bolFocus) {
                option.focus();
            }
        }
    }

    // loops through the options and finds a option using the parameter
    function findOptionFromString(element, strSearchString) {
        var i;
        var len;
        var matchedOption;
        var arrOptions = xtag.query(element, 'gs-option');

        // search exact text and search both the value attribute (if present) and the text content
        i = 0;
        len = arrOptions.length;
        while (i < len) {
            if (arrOptions[i].getAttribute('value') === strSearchString || arrOptions[i].textContent === strSearchString) {
                matchedOption = arrOptions[i];
                break;
            }
            i += 1;
        }

        return matchedOption;
    }

    function selectOption(element, handle, bolChange) {
        var option;
        var strOptionValue;
        var strOptionText;

        if (typeof handle === 'string') {
            option = findOptionFromString(element, handle);

            if (!option) {
                throw 'gs-optionbox Error: value: \'' + handle + '\' not found.';
            }
        } else {
            option = handle;
        }

        highlightOption(element, option, bolChange); //if bolChange is true, focus selected control

        if (option) {
            strOptionValue = option.getAttribute('value');
            strOptionText = option.textContent;
        } else {
            strOptionValue = '';
            strOptionText = '';
        }

        if (element.value !== (strOptionValue || strOptionText)) {
            element.innerValue = strOptionValue || strOptionText;
            element.innerSelectedOption = option;

            if (bolChange) {
                xtag.fireEvent(element, 'change', {bubbles: true, cancelable: true});
            }
        }
    }

    // #################################################################
    // ########################## USER EVENTS ##########################
    // #################################################################
    // handle behaviours on keydown
    function handleKeyDown(event) {
        //console.log('handleKeyDown', event, event.target);
        var element = GS.findParentTag(event.target, 'gs-optionbox');
        var intKeyCode = event.keyCode || event.which;
        var selectedOption;
        var selectedOptionIndex;
        var arrOptions;
        var i;
        var len;

        if (!element.hasAttribute('disabled') && event.target.tagName.toUpperCase() === 'GS-OPTION') {
            if ((intKeyCode === 40 || intKeyCode === 39 || intKeyCode === 38 || intKeyCode === 37) && !event.shiftKey && !event.metaKey && !event.ctrlKey && !element.error) {
                arrOptions = xtag.query(element, 'gs-option');

                i = 0;
                len = arrOptions.length;
                while (i < len) {
                    if (arrOptions[i].hasAttribute('selected')) {
                        selectedOptionIndex = i;
                        selectedOption = arrOptions[i];
                    }

                    if (selectedOption) {
                        break;
                    }

                    i += 1;
                }

                //console.log(selectedOption, selectedOptionIndex, arrOptions.length);

                if (selectedOption && selectedOptionIndex !== arrOptions.length - 1 && (intKeyCode === 40 || intKeyCode === 39)) {
                    selectOption(element, arrOptions[selectedOptionIndex + 1], true);
                } else if (selectedOption && selectedOptionIndex !== 0 && (intKeyCode === 38 || intKeyCode === 37)) {
                    selectOption(element, arrOptions[selectedOptionIndex - 1], true);
                // select first record
                } else if (intKeyCode === 40 || intKeyCode === 39) {
                    selectOption(element, arrOptions[0], true);
                // select last record
                } else if (intKeyCode === 38 || intKeyCode === 37) {
                    selectOption(element, arrOptions[arrOptions.length - 1], true);
                }
                event.preventDefault();
                event.stopPropagation();

            }
        } else if (event.target.tagName.toUpperCase() === 'GS-OPTION') {
            if (event.keyCode !== 9) {
                event.preventDefault();
                event.stopPropagation();
            }
        }

        //console.log('handleKeyDown', intKeyCode, event);
    }
    function handleKeyPress(event) {
        //console.log('handleKeyPress', event, event.target);
        var element = event.target;
        var intKeyCode = event.keyCode || event.which;

        if (!element.hasAttribute('disabled') && event.target.tagName.toUpperCase() === 'GS-OPTION') {
            if ((intKeyCode === 40 || intKeyCode === 39 || intKeyCode === 38 || intKeyCode === 37) && !event.shiftKey && !event.metaKey && !event.ctrlKey && !element.error) {
                event.preventDefault();
                event.stopPropagation();

            }
        } else if (event.target.tagName.toUpperCase() === 'GS-OPTION') {
            if (event.keyCode !== 9) {
                event.preventDefault();
                event.stopPropagation();
            }
        }

        //console.log('handleKeyDown', intKeyCode, event);
    }

    function getParentOption(element) {
        var currentElement = element;

        while (currentElement.nodeName !== 'GS-OPTION' && currentElement.nodeName !== 'HTML') {
            currentElement = currentElement.parentNode;
        }

        if (currentElement.nodeName !== 'GS-OPTION') {
            return undefined;
        }

        return currentElement;
    }

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
        i = 0;
        len = element.attributes.length;
        arrAttr = element.attributes;
        while (i < len) {
            jsnAttr = element.attributes[i];

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
                    element.setAttribute('value', strQSValue);
                }
            } else {
                element.value = strQSValue;
            }
        }

        element.internal.bolQSFirstRun = true;
    }

    function enhanceChildren(element) {
        var arrElement;
        var i;
        var len;

        arrElement = xtag.query(element, 'gs-option');

        i = 0;
        len = arrElement.length;
        while (i < len) {
            // this if allows the developer to define the icon position
            if (!arrElement[i].hasAttribute('icontop')
                    && !arrElement[i].hasAttribute('iconleft')
                    && !arrElement[i].hasAttribute('iconbottom')
                    && !arrElement[i].hasAttribute('iconright')) {
                arrElement[i].setAttribute('iconleft', '');
            }
            arrElement[i].setAttribute('icon', '');
            arrElement[i].setAttribute('role', 'radio');
            arrElement[i].setAttribute('tabindex', '-1');
            // arrElement[i].addEventListener('focus', function () {
            //     selectOption(element, this, true);
            // });
            i += 1;
        }
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
                // element.value = null;
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
            if (! element.hasAttribute('aria-label')) {
                element.setAttribute('aria-label', forElem.innerText);
            }
        }
    }

    //
    function elementInserted(element) {
        var strQSValue;
        var observer;

        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;
                element.internal = {};
                saveDefaultAttributes(element);

                if (!element.hasAttribute('role')) {
                    element.setAttribute('role', 'radiogroup');
                }

                //// allows the element to have focus
                //if (!element.hasAttribute('tabindex')) {
                //    element.setAttribute('tabindex', '0');
                //}

                if (element.getAttribute('value')) {
                    selectOption(element, element.getAttribute('value'), false);
                }

                if (element.getAttribute('qs')) {
                    //strQSValue = GS.qryGetVal(GS.getQueryString(), element.getAttribute('qs'));

                    //if (strQSValue !== '') {
                    //    selectOption(element, strQSValue, false);
                    //}
                    createPushReplacePopHandler(element);
                    window.addEventListener('pushstate',    function () { createPushReplacePopHandler(element); });
                    window.addEventListener('replacestate', function () { createPushReplacePopHandler(element); });
                    window.addEventListener('popstate',     function () { createPushReplacePopHandler(element); });
                }

                // if we are not [no-target]
                if (!element.hasAttribute('no-target')) {
                    enhanceChildren(element);

                    // put an observer on the option element to enhance new children

                    // create an observer instance
                    observer = new MutationObserver(function(mutations) {
                        var bolRefreshOptionList = true;

                        // check each mutation: if only option and optgroup tags were added: refersh option tags in select
                        mutations.forEach(function(mutation) {
                            var i;
                            var len;

                            i = 0;
                            len = mutation.addedNodes.length;
                            while (i < len) {
                                if (mutation.addedNodes[i].nodeName !== 'GS-OPTION') {
                                    bolRefreshOptionList = false;
                                }
                                i += 1;
                            }
                        });

                        if (bolRefreshOptionList) {
                            enhanceChildren(element);
                        }
                    });

                    // pass in the element node, as well as the observer options
                    observer.observe(element, {childList: true});
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

    xtag.register('gs-optionbox', {
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
                    if (strAttrName === 'value' && newValue !== oldValue) {
                        selectOption(element, newValue);
                    }
                }
            }
        },
        events: {
            'keydown': function (event) {
                var element = this;

                if (
                    !element.hasAttribute('suspend-created') &&
                    !element.hasAttribute('suspend-inserted')
                ) {
                    handleKeyDown(event);
                }
            },
            'keypress': function (event) {
                var element = this;

                if (
                    !element.hasAttribute('suspend-created') &&
                    !element.hasAttribute('suspend-inserted')
                ) {
                    handleKeyPress(event);
                }
            },

            'click': function (event) {
                var element = this;

                if (
                    !element.hasAttribute('suspend-created') &&
                    !element.hasAttribute('suspend-inserted') &&
                    !element.hasAttribute('readonly')
                ) {
                    var parentOption = getParentOption(event.target);

                    //console.log(parentOption);

                    //  else if (this.hasAttribute('clearable') && newValue === oldValue) {
                    //   //console.log('running');
                    //     selectOption(this, undefined);
                    // }

                    if (parentOption && !parentOption.hasAttribute('selected')) {
                        selectOption(element, parentOption, true);
                    } else if (parentOption && parentOption.hasAttribute('selected') && element.hasAttribute('clearable')) {
                        selectOption(element, undefined);
                    }
                }
            }
        },
        accessors: {
            value: {
                get: function () {
                    return this.innerValue;
                },
                set: function (strNewValue) {
                    selectOption(this, String(strNewValue));
                }
            },

            selectedOption: {
                get: function () {
                    return this.innerSelectedOption;
                },
                set: function (newValue) {
                    selectOption(this, newValue);
                }
            },

            textValue: {
                get: function () {
                    return this.innerSelectedOption.textContent;
                },
                set: function (newValue) {
                    selectOption(this, newValue);
                }
            }
        }
    });
});
