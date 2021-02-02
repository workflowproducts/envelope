//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps, addFocusEvents, addBasicThemingProps
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    "use strict";
    addSnippet(
        '<gs-toggle>',
        '<gs-toggle>',
        'gs-toggle column="${1}">${2}</gs-toggle>'
    );

    addElement('gs-toggle', '#controls_buttons_toggle');

    window.designElementProperty_GSTOGGLE = function () {
        addGSControlProps();
        addCheck('O', 'No Focus', 'no-focus');
        addCheck('V', 'Inline', 'inline');
        addCheck('V', 'Jumbo', 'jumbo');
        //addText('O', 'Hot Key', 'key');
        //addCheck('O', 'No Modifier For Hot Key', 'no-modifier-key');
        addFocusEvents();
        addText('O', 'Column In QS', 'qs');
        addIconProps();
        addBasicThemingProps();
        addCornerRoundProps();
        addFlexProps();
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
        arrAttr = element.attributes;
        i = 0;
        len = arrAttr.length;
        while (i < len) {
            jsnAttr = arrAttr[i];

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
                if (strQSValue !== '' || !element.getAttribute('value')) {
                    element.setAttribute('value', strQSValue);
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
            if (!element.hasAttribute('role')) {
                element.setAttribute('role', 'button');
                element.setAttribute('aria-pressed', '');
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
                saveDefaultAttributes(element);

                if (!evt.touchDevice) {
                    element.addEventListener('focus', function () {
                        element.classList.add('focus');
                    });

                    element.addEventListener('blur', function () {
                        element.classList.remove('focus');
                    });

                    element.addEventListener(evt.mousedown, function () {
                        element.classList.add('down');
                    });

                    element.addEventListener(evt.mouseout, function () {
                        element.classList.remove('down');
                        element.classList.remove('hover');
                    });

                    element.addEventListener(evt.mouseover, function () {
                        element.classList.remove('down');
                        element.classList.add('hover');
                    });

                    element.addEventListener('keydown', function (event) {
                        if (
                            !element.hasAttribute('disabled') &&
                            !element.classList.contains('down') &&
                            (event.keyCode === 13 || event.keyCode === 32)
                        ) {
                            element.classList.add('down');
                        }
                    });

                    element.addEventListener('keyup', function (event) {
                        // if we are not disabled and we pressed return (13) or space (32): trigger click
                        if (
                            !element.hasAttribute('disabled') &&
                            element.classList.contains('down') &&
                            (event.keyCode === 13 || event.keyCode === 32)
                        ) {
                            GS.triggerEvent(element, 'click');
                        }
                    });
                }

                // add a tabindex to allow focus
                if (!element.hasAttribute('tabindex')) {
                    element.tabIndex = 0;
                }

                if (typeof element.getAttribute('value') === 'string') {
                    if (element.getAttribute('value') === 'true' || element.getAttribute('value') === '-1') {
                        element.setAttribute('selected', '');

                        element.setAttribute('aria-pressed', 'true');
                    } else {
                        element.setAttribute('aria-pressed', 'false');
                    }
                } else {
                    element.setAttribute('aria-pressed', 'false');
                }

                // handle "qs" attribute
                if (element.getAttribute('qs')) {
                    //var strQSValue = GS.qryGetVal(GS.getQueryString(), element.getAttribute('qs'));
                    //if (strQSValue !== '' || !element.getAttribute('value')) {
                    //    element.value = strQSValue;
                    //}
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
            }
        }
    }

    xtag.register('gs-toggle', {
        lifecycle: {
            created: function () {
                // if the value was set before the "created" lifecycle code runs: set attribute
                //      (discovered when trying to set a value of a date control in the after_open of a dialog)
                //      ("delete" keyword added because of firefox)
                if (this.value) {
                    this.setAttribute('value', this.value);
                    delete this.value;
                    //this.value = null;
                }

                elementCreated(this);
            },

            inserted: function () {
                elementInserted(this);
            },

            attributeChanged: function (strAttrName, ignore, newValue) {
                // if "suspend-created" has been removed: run created and inserted code
                if (strAttrName === 'suspend-created' && newValue === null) {
                    elementCreated(this);
                    elementInserted(this);

                // if "suspend-inserted" has been removed: run inserted code
                } else if (strAttrName === 'suspend-inserted' && newValue === null) {
                    elementInserted(this);

                } else if (!this.hasAttribute('suspend-created') && !this.hasAttribute('suspend-inserted')) {
                    // attribute code
                }
            }
        },
        events: {
            'click': function () {
                if (!this.hasAttribute('suspend-created') && !this.hasAttribute('suspend-inserted')) {
                    this.classList.remove('down');

                    if (this.hasAttribute('selected')) {
                        this.removeAttribute('selected');

                        if (this.getAttribute('value') === 'true') {
                            this.setAttribute('value', 'false');
                        } else if (this.getAttribute('value') === '-1') {
                            this.setAttribute('value', '0');
                        }

                        this.setAttribute('aria-pressed', 'false');

                    } else {
                        this.setAttribute('selected', '');

                        if (this.getAttribute('value') === 'false') {
                            this.setAttribute('value', 'true');
                        } else if (this.getAttribute('value') === '0') {
                            this.setAttribute('value', '-1');
                        }

                        this.setAttribute('aria-pressed', 'true');
                    }

                    xtag.fireEvent(this, 'change', {
                        bubbles: true,
                        cancelable: true
                    });
                }
            }
        },
        accessors: {
            'value': {
                'get': function () {
                    // I don't know if the Boolean return is important, so for now, we'll put in a patch
                    if (this.hasAttribute('attrvalue')) {
                        return this.getAttribute('value');
                    }

                    return this.hasAttribute('selected'); //this.classList.contains('down');
                },

                'set': function (newValue) {
                    if (newValue === true || newValue === 'true') {
                        this.setAttribute('selected', '');
                        this.setAttribute('aria-pressed', 'true');
                    } else {
                        this.removeAttribute('selected');
                        this.setAttribute('aria-pressed', 'false');
                    }
                }
            },

            'textValue': {
                'get': function () {
                    return (
                        this.hasAttribute('selected')
                            ? 'YES'
                            : 'NO'
                    );
                },

                'set': function (newValue) {
                    if (newValue === true || newValue === 'true' || newValue === 'YES') {
                        this.setAttribute('selected', '');
                        this.setAttribute('aria-pressed', 'true');
                    } else {
                        this.removeAttribute('selected');
                        this.setAttribute('aria-pressed', 'false');
                    }
                }
            }
        },
        methods: {

        }
    });
});