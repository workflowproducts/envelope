
window.addEventListener('design-register-element', function () {
    registerDesignSnippet('<gs-search>', '<gs-search>', 'gs-search id="${1}"></gs-search>');

    designRegisterElement('gs-search', '/env/app/developer_g/greyspots-' + GS.version() + '/documentation/doc-elem-search.html');

    window.designElementProperty_GSSEARCH = function(selectedElement) {
        addProp('Placeholder', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('placeholder') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'placeholder', this.value);
        });

        //console.log(selectedElement.hasAttribute('mini'));

        addProp('Mini', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('mini')) + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'mini', (this.value === 'true'), true);
        });

        // TITLE attribute
        addProp('Title', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('title') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'title', this.value);
        });

        addProp('Column In Querystring', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('qs') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'qs', this.value, false);
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
        if (selectedElement.hasAttribute('hidden'))                   { strVisibilityAttribute = 'hidden'; }
        if (selectedElement.hasAttribute('hide-on-desktop'))  { strVisibilityAttribute = 'hide-on-desktop'; }
        if (selectedElement.hasAttribute('hide-on-tablet'))   { strVisibilityAttribute = 'hide-on-tablet'; }
        if (selectedElement.hasAttribute('hide-on-phone'))    { strVisibilityAttribute = 'hide-on-phone'; }
        if (selectedElement.hasAttribute('show-on-desktop'))   { strVisibilityAttribute = 'show-on-desktop'; }
        if (selectedElement.hasAttribute('show-on-tablet'))    { strVisibilityAttribute = 'show-on-tablet'; }
        if (selectedElement.hasAttribute('show-on-phone'))     { strVisibilityAttribute = 'show-on-phone'; }

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
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    var singleLineTemplateElement = document.createElement('template');
    var singleLineTemplate;

    singleLineTemplateElement.innerHTML = '<input class="control" gs-dynamic type="text" placeholder="Search..." />';
    singleLineTemplate = singleLineTemplateElement.content;

    // re-target change event from control to element
    function changeFunction(event) {
        event.preventDefault();
        event.stopPropagation();

        GS.triggerEvent(event.target.parentNode, 'change');
    }

    // re-target focus event from control to element
    function focusFunction(event) {
        var element = event.target;
        if (event.target.classList.contains('control')) {
            element = element.parentNode.parentNode;
        }
        if (element.hasAttribute('defer-insert')) {
            // if (element.hasAttribute('in-cell')) {
            //     var cellElem = GS.findParentTag(element, "gs-cell");
            //     var tableElem = GS.findParentTag(cellElem, "gs-table");
            //     var row = cellElem.getAttribute('data-row-number');
            //     if (row === 'insert') {
            //         row = tableElem.internalData.records.length;
            //     } else {
            //         row = parseInt(row, 10);
            //     }
            //     tableElem.internalSelection.ranges[0].start = {
            //         "row": row,
            //         "column": parseInt(cellElem.getAttribute('data-col-number'), 10)
            //     };
            //     tableElem.internalSelection.ranges[0].end = {
            //         "row": row,
            //         "column": parseInt(cellElem.getAttribute('data-col-number'), 10)
            //     };
            //     tableElem.render();
            // }
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
            GS.triggerEvent(event.target.parentNode, 'focus');
            event.target.parentNode.classList.add('focus');
        }
    }

    // re-target blur event from control to element
    function blurFunction(event) {
        var element = event.target;
        if (event.target.classList.contains('control')) {
            element = element.parentNode.parentNode;
        }
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

    //function loadPushReplacePopHandler(element) {
    //    var strQueryString = GS.getQueryString();
    //    var strQSCol = element.getAttribute('qs') || element.getAttribute('id');

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

    function loadPushReplacePopHandler(element) {
        var i;
        var len;
        var strQS = GS.getQueryString();
        var strQSCol = element.getAttribute('qs');
        var strQSValue;
        var strQSAttr;
        var arrQSParts;
        var arrAttrParts;
        var strOperator;

        if (strQSCol && strQSCol.indexOf('=') !== -1) {
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
                if (strQSValue !== element.getAttribute('value') && (strQSValue !== '' || !element.getAttribute('value'))) {
                    element.setAttribute('value', strQSValue);
                }
            } else {
                if (strQSValue !== element.getAttribute('value')) {
                    element.value = strQSValue;
                }
            }
        }

        element.internal.bolQSFirstRun = true;
    }



    // dont do anything that modifies the element here
    function elementCreated(element) {
        // if "created" hasn't been suspended: run created code
        if (!element.hasAttribute('suspend-created')) {

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

                if (element.hasAttribute('defer-insert')) {
                    if (!element.hasAttribute('tabindex')) {
                        element.setAttribute('tabindex', '0');
                    }
                    element.bolSelect = true;
    
                    // if (GS.findParentTag(element, "gs-cell") && GS.findParentTag(element, "gs-cell").tagName.toUpperCase() === "GS-CELL") {
                    //     element.setAttribute('in-cell', '');
                    // }
    
                    if (element.getAttribute('value')) {
                        element.innerHTML = element.getAttribute('value');
                        element.syncGetters();
                    } else if (element.hasAttribute('placeholder')) {
                        element.innerHTML = '<span class="placeholder">' + element.getAttribute('placeholder') + '</span>';
                    }
    
                    element.addEventListener('focus', focusFunction);
                    if (evt.touchDevice) {
                        element.addEventListener(evt.click, focusFunction);
                        element.addEventListener(evt.mousedown, function (event) {
                            //if event.target is the control
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
                            }
                        });
                    }
                } else {
                    if (element.hasAttribute('tabindex')) {
                        element.oldTabIndex = element.getAttribute('tabindex');
                        element.removeAttribute('tabindex');
                    }

                    element.refresh();
                }

                loadPushReplacePopHandler(element);
                window.addEventListener('pushstate',    function () { loadPushReplacePopHandler(element); });
                window.addEventListener('replacestate', function () { loadPushReplacePopHandler(element); });
                window.addEventListener('popstate',     function () { loadPushReplacePopHandler(element); });
            }
        }
    }

    xtag.register('gs-search', {
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
                    if (strAttrName === 'disabled') {
                        element.refresh();
                    } else if (strAttrName === 'value' && newValue !== oldValue) {
                        element.value = newValue;
                    }
                }
            }
        },
        events: {
            // on keydown and keyup sync the value attribute and the control value
            'keydown': function (event) {
                var element = this;
                if (element.hasAttribute('insert-defer')) {
                    if (!element.hasAttribute('readonly') && !element.hasAttribute('disabled')) {
                        element.syncGetters();
                    }
                } else {
                    if (!this.hasAttribute('readonly')) {
                        if (this.hasAttribute('disabled') && event.keyCode !== 9) {
                            event.preventDefault();
                            event.stopPropagation();
                        } else {
                            this.syncView();
                        }
                    }
                }
            },
            'keyup': function () {
                var element = this;
                if (element.hasAttribute('insert-defer')) {
                    if (!element.hasAttribute('readonly') && !element.hasAttribute('disabled')) {
                        element.syncGetters();
                    }
                } else {
                    if (!this.hasAttribute('readonly')) {
                        this.syncView();
                    }
                }
            },
            'change': function () {
                var strQueryString = GS.getQueryString(), strColumn = (this.getAttribute('qs') || this.getAttribute('id'));
                
                if ((GS.qryGetVal(strQueryString, strColumn) || '') !== (this.control.value || '')) {
                    GS.pushQueryString(strColumn + '=' + encodeURIComponent(this.control.value));
                }
            }
        },
        accessors: {
            value: {
                // get value straight from the input
                get: function () {
                    if (this.control) {
                        return this.control.value;
                    } else {
                        if (this.hasAttribute('defer-insert')) {
                            return this.getAttribute('value');
                        } else {
                            return this.innerHTML;
                        }
                    }
                },

                // set the value of the input and set the value attribute
                set: function (strNewValue) {
                    var element = this;
                    if (element.hasAttribute('defer-insert')) {
                        element.setAttribute('value', strNewValue);
                        element.syncView();
                    } else {
                        if (element.control) {
                            if (element.control.value !== strNewValue) {
                                element.control.value = strNewValue;
                            }
                        } else {
                            element.innerHTML = strNewValue;
                        }
                        element.syncView();
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
                    if (this.control) {
                        this.control.focus();
                    }
                }
            },

            removeControl: function () {
                var element = this;
                if (element.control) {
                    element.setAttribute('tabindex', element.control.getAttribute('tabindex'));
                }
                if (element.control.value) {
                    element.innerHTML = element.control.value;
                    element.syncGetters();
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
                //console.log(element.innerHTML, element.children);
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
                //console.log(elementValue);
                element.control.value = elementValue;
                element.value = elementValue;
                // if we saved a tabindex: apply the tabindex to the control
                if (element.savedTabIndex !== undefined && element.savedTabIndex !== null) {
                    element.control.setAttribute('tabindex', element.savedTabIndex);
                }
                //element.style.width = elementWidth - 7 + 'px';
                console.log(element.style.width, elementWidth + 'px');
                element.syncView();
                element.control.focus();
                element.addEventListener('focus', focusFunction);
            },

            // adapt gs-input element to whatever control is in it and
            //      set the value of the control to the value attribute (if there is a value attribute) and
            //      resize the resize to text
            refresh: function () {
                var element = this;
                var arrPassThroughAttributes;
                var i;
                var len;

                element.innerHTML = '';
                element.appendChild(singleLineTemplate.cloneNode(true));
                if (element.oldTabIndex) {
                    xtag.query(element, '.control')[0].setAttribute('tabindex', element.oldTabIndex);
                }

                // set a variable with the control element for convenience and speed
                element.control = xtag.query(element, '.control')[0];

                element.control.removeEventListener('change', changeFunction);
                element.control.addEventListener('change', changeFunction);

                element.control.removeEventListener('focus', focusFunction);
                element.control.addEventListener('focus', focusFunction);

                element.control.removeEventListener('blur', blurFunction);
                element.control.addEventListener('blur', blurFunction);

                element.control.removeEventListener(evt.mouseout, mouseoutFunction);
                element.control.addEventListener(evt.mouseout, mouseoutFunction);

                element.control.removeEventListener(evt.mouseout, mouseoverFunction);
                element.control.addEventListener(evt.mouseover, mouseoverFunction);

                // if there is a value already in the attributes of the element: set the control value
                if (element.hasAttribute('value')) {
                    element.control.value = element.getAttribute('value');
                }

                // copy passthrough attributes to control
                arrPassThroughAttributes = [
                    'placeholder', 'name', 'type', 'maxlength', 'autocorrect',
                    'autocapitalize', 'autocomplete', 'autofocus', 'spellcheck',
                    'readonly'
                ];
                for (i = 0, len = arrPassThroughAttributes.length; i < len; i += 1) {
                    if (element.hasAttribute(arrPassThroughAttributes[i])) {
                        element.control.setAttribute(arrPassThroughAttributes[i], element.getAttribute(arrPassThroughAttributes[i]) || '');
                    }
                }
            },

            syncView: function () {
                var element = this;
                if (element.hasAttribute('defer-insert')) {
                    if (element.control) {
                        if (element.getAttribute('value') !== element.control.value) {
                            element.setAttribute('value', element.control.value);
                        }
                    } else {
                        if (element.value) {
                            element.innerHTML = element.value;
                        } else if (element.hasAttribute('placeholder')) {
                            element.innerHTML = '<span class="placeholder">' + element.getAttribute('placeholder') + '</span>';
                        }
                    }
                    element.initalized = true;
                } else {
                    if (this.control) {
                        if (this.getAttribute('value') !== this.control.value) {
                            this.setAttribute('value', this.control.value);
                        }
                    } else {
                        this.innerHTML = this.control.value;
                    }
                }
            },

            syncGetters: function () {
                if (this.control) {
                    this.setAttribute('value', this.control.value);
                }
            }
        }
    });
});