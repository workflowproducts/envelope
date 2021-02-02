//global window, addProp, addFlexProps, GS, ml, xtag, registerDesignSnippet
//global setOrRemoveBooleanAttribute, setOrRemoveTextAttribute, CryptoJS
//global encodeHTML, designRegisterElement, evt, ace
//jslint browser:true, white:false, this:true
//maxlen:80

// # CODE INDEX:          <- (use "find" (CTRL-f or CMD-f) to skip to a section)
//      # TOP             <- (this just brings you back this index)
//      # ELEMENT DOCUMENTATION
//      # NOTES/IDEAS
//      # SNIPPET/DESIGN
//      # FUNCTION SHORTCUTS
//      # UTILITY FUNCTIONS
//      # ELEMENT FUNCTIONS
//      # RENDER FUNCTIONS
//      # DATA FUNCTIONS
//      # EVENT FUNCTIONS
//          # QS EVENTS
//          # FOCUS EVENTS
//          # BLUR EVENTS
//          # CHANGE EVENTS
//          # KEY EVENTS
//          # DROPDOWN EVENTS
//          # DEVELOPER EVENTS
//          # HIGH LEVEL BINDING
//      # XTAG DEFINITION
//      # ELEMENT LIFECYCLE
//      # ELEMENT ACCESSORS
//      # ELEMENT METHODS
//
// For code that needs to be completed:
//      # NEED CODING






window.addEventListener('design-register-element', function () {
    "use strict";
    registerDesignSnippet(
        '<gs-ace>',
        '<gs-ace>',
        'gs-ace column="${1:name}"></gs-ace>'
    );
    registerDesignSnippet(
        '<gs-ace> With Label',
        '<gs-ace>',
        (
            'label for="${1:ace-insert-note}">${2:Notes}:</label>\n' +
            '<gs-ace id="${1:ace-insert-note}" column="${3:note}"></gs-ace>'
        )
    );

    designRegisterElement(
        'gs-ace',
        '/env/app/developer_g/greyspots-' + GS.version() +
                '/documentation/index.html#controls_ace'
    );

    window.designElementProperty_GSACE = function (selected) {
        // DEFINE HELPER FUNCTIONS
        var txt = function (strAttribute) {
            return (
                '<gs-text class="target" value="' + encodeHTML(
                    selected.getAttribute(strAttribute) || ''
                ) + '" mini></gs-text>'
            );
        };
        var chk = function (strAttribute) {
            return (
                '<gs-checkbox class="target" ' +
                'value="' + (selected.hasAttribute(strAttribute)) + '" ' +
                'mini></gs-checkbox>'
            );
        };
        var line = function (strTitle, strHTML, changeFunction, bolGlobal) {//as
            addProp(strTitle, true, strHTML, changeFunction, bolGlobal);
        };
        var setTxt = function (strAttr, strValue) {
            return setOrRemoveTextAttribute(selected, strAttr, strValue);
        };
        var setChk = function (strAttr, strVal) {
            var func = setOrRemoveBooleanAttribute;
            return func(selected, strAttr, strVal === 'true', true);
        };

        // DEFINE PROPERTIES
        line('Column', txt('column'), function () {
            return setTxt('column', this.value);
        });
        line('Encrypted', txt('encrypted'), function () {
            return setTxt('encrypted', this.value);
        });
        line('Value', txt('value'), function () {
            return setTxt('value', this.value);
        });
        line('Column In Querystring', txt('qs'), function () {
            return setTxt('qs', this.value);
        });
        line('Theme', txt('theme'), function () {
            return setTxt('theme', this.value);
        });
        line('Mode', txt('mode'), function () {
            return setTxt('mode', this.value);
        });
        line('Rows', txt('rows'), function () {
            return setTxt('rows', this.value);
        });
        line('Autoresize', chk('autoresize'), function () {
            return setChk('autoresize', this.value);
        });
        addProp('Tabindex', true, txt('tabindex'), function () {
            return setTxt('tabindex', this.value);
        });
        line('suspend-created', chk('suspend-created'), function () {
            return setChk('suspend-created', this.value);
        });
        line('suspend-inserted', chk('suspend-inserted'), function () {
            return setChk('suspend-inserted', this.value);
        });
        line('Disabled', chk('disabled'), function () {
            return setChk('disabled', this.value);
        });
        line('Readonly', chk('readonly'), function () {
            return setChk('readonly', this.value);
        });
        addFlexProps(selected);
    };
});









window.hasLoadedAce = false;
// trigger resize to text on window resize
window.addEventListener('resize', function () {
    "use strict";
    var i;
    var len;
    var arrElements = document.getElementsByTagName('gs-ace');

    i = 0;
    len = arrElements.length;
    while (i < len) {
        arrElements[i].handleResizeToText();
        i += 1;
    }
});

window.addEventListener('try-password', function (event) {
    "use strict";
    var elemsToRetry = xtag.query(document, 'gs-ace[encrypted="' + event.keyVariable + '"]');
    var i;
    var len;

    i = 0;
    len = elemsToRetry.length;
    while (i < len) {
        elemsToRetry[i].editor.setValue(
            (
                CryptoJS.AES.decrypt(
                    elemsToRetry[i].getAttribute('value'),
                    (window[elemsToRetry[i].getAttribute('encrypted')] || '')
                ).toString(CryptoJS.enc.Utf8) ||
                elemsToRetry[i].getAttribute('placeholder')
            ),
            elemsToRetry[i].editor.session.doc.positionToIndex(
                elemsToRetry[i].editor.selection.getCursor()
            )
        );
        i += 1;
    }
});

if (!evt.touchDevice) {
    window.gsace = {};
    window.gsace.bolFirstMouseMoveWhileDown = true;
    window.gsace.currentMouseTarget = null;

    window.addEventListener('mousemove', function (event) {
        "use strict";
        var mousePosition;
        var intWhich;

        // firefox sometimes doesn't permit access to "event.which"
        //      so this try/catch statement will prevent the error and nothing will run
        try {
            intWhich = event.which;
        } catch (e) {}

        if (window.bolFirstMouseMoveWhileDown === true && intWhich !== undefined && intWhich !== 0) {
            mousePosition = GS.mousePosition(event);

            window.bolFirstMouseMoveWhileDown = false;
            window.gsace.currentMouseTarget = document.elementFromPoint(mousePosition.x, mousePosition.y);

        } else if (intWhich !== undefined && intWhich === 0) {
            window.bolFirstMouseMoveWhileDown = true;
        }

        if (
            window.gsace.currentMouseTarget &&
            intWhich !== undefined && intWhich !== 0 &&
            window.gsace.currentMouseTarget.nodeName === 'TEXTAREA' &&
            window.gsace.currentMouseTarget.parentNode.nodeName === 'GS-ACE' &&
            //event.target === element.control &&
            window.bolFirstMouseMoveWhileDown === false &&
            (
                window.gsace.currentMouseTarget.lastWidth !== window.gsace.currentMouseTarget.clientWidth ||
                window.gsace.currentMouseTarget.lastHeight !== window.gsace.currentMouseTarget.clientHeight
            )
        ) {

            window.gsace.currentMouseTarget.style.margin = '';
            window.gsace.currentMouseTarget.style.marginLeft = '';
            window.gsace.currentMouseTarget.style.marginRight = '';
            window.gsace.currentMouseTarget.style.marginTop = '';
            window.gsace.currentMouseTarget.style.marginBottom = '';
            window.gsace.currentMouseTarget.lastWidth = window.gsace.currentMouseTarget.clientWidth;
            window.gsace.currentMouseTarget.lastHeight = window.gsace.currentMouseTarget.clientHeight;

            GS.triggerEvent(window.gsace.currentMouseTarget.parentNode, 'size-changed');
        }
    });

    window.addEventListener('mouseup', function () {
        "use strict";
        window.bolFirstMouseMoveWhileDown = true;
    });
}

document.addEventListener('DOMContentLoaded', function () {
    "use strict";
    var multiLineTemplateElement = document.createElement('template');
    var multiLineTemplate;

    multiLineTemplateElement.innerHTML = '<div class="editor control" gs-dynamic></div>';

    multiLineTemplate = multiLineTemplateElement.content;

    // re-target change event from control to element
    function changeFunction(ignore, element) {//event
        var gsace = element.container.parentNode;
        GS.triggerEvent(window, 'resize');
        clearTimeout(element.intTimerID);
        element.intTimerID = setTimeout(function () {
            gsace.editor.removeEventListener('change', changeFunction);
            if (gsace.hasAttribute('encrypted')) {
                gsace.setAttribute('value', CryptoJS.AES.encrypt((element.getValue() || ''), (window[gsace.getAttribute('encrypted')] || '')));
            } else {
                gsace.setAttribute('value', element.getValue());
            }
            gsace.editor.addEventListener('change', changeFunction);
            GS.triggerEvent(gsace, 'change');
            element.intTimerID = null;
        }, 2000, gsace);
    }

    // re-target focus event from control to element
    function focusFunction(event) {
        var gsace = GS.findParentElement(event.target, 'gs-ace');
        GS.triggerEvent(gsace, 'focus');
        gsace.classList.add('focus');
    }

    // re-target blur event from control to element
    function blurFunction(event) {
        var element = GS.findParentElement(event.target, 'gs-ace');
        GS.triggerEvent(element, 'blur');
        element.classList.remove('focus');
        GS.triggerEvent(element, 'change');
    }

    // mouseout, remove hover class
    function mouseoutFunction(event) {
        var gsace = GS.findParentElement(event.target, 'gs-ace');
        GS.triggerEvent(gsace, evt.mouseout);
        gsace.classList.remove('hover');
    }

    // mouseover, add hover class
    function mouseoverFunction(event) {
        var gsace = GS.findParentElement(event.target, 'gs-ace');
        GS.triggerEvent(gsace, evt.mouseover);
        gsace.classList.add('hover');
    }

    function keydownFunction(event) {
        var gsace = GS.findParentElement(event.target, 'gs-ace');
        var element = gsace.editor;
        if (!gsace.hasAttribute('readonly')) {
            if (gsace.getAttribute('disabled') !== null && !(event.keyCode === 122 && event.metaKey)) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                //this.parentNode.syncView();
                if (gsace.hasAttribute('encrypted')) {
                    gsace.setAttribute('value', CryptoJS.AES.encrypt((element.getValue() || ''), (window[gsace.getAttribute('encrypted')] || '')));
                } else {
                    gsace.setAttribute('value', element.getValue());
                }
                gsace.handleResizeToText();
            }
        }
    }

    function insertFunction(event) {
        var gsace = GS.findParentElement(event.target, 'gs-ace');
        gsace.handleResizeToText();
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
                    if (element.hasAttribute('encrypted')) {
                        element.value = CryptoJS.AES.encrypt(strQSValue, (window[element.getAttribute('encrypted')] || ''));
                    } else {
                        element.value = strQSValue;
                    }
                }
            } else {
                if (element.hasAttribute('encrypted')) {
                    element.value = CryptoJS.AES.encrypt(strQSValue, (window[element.getAttribute('encrypted')] || ''));
                } else {
                    element.value = strQSValue;
                }
            }
        }

        element.internal.bolQSFirstRun = true;
    }

    function createAce(element) {
        element.editor = ace.edit(element.control);
        element.editor.setTheme('ace/theme/' + (element.getAttribute('theme') || 'eclipse') + '');
        element.editor.getSession().setMode('ace/mode/' + (element.getAttribute('mode') || 'text') + '');
        element.editor.setShowPrintMargin(false);
        element.editor.setDisplayIndentGuides(true);
        element.editor.setShowFoldWidgets(false);
        element.editor.session.setUseWrapMode('free');
        element.editor.setBehavioursEnabled(false);
        element.editor.$blockScrolling = Infinity; // <== blocks a warning
        if (element.hasAttribute('value')) {
            if (element.hasAttribute('encrypted')) {
                element.editor.setValue(CryptoJS.AES.decrypt(element.getAttribute('value'), (window[element.getAttribute('encrypted')] || '')).toString(CryptoJS.enc.Utf8), 0);
            } else {
                element.editor.setValue(element.getAttribute('value'), 0);
            }
        }
        if (element.hasAttribute('rows')) {
            element.editor.container.style.height = (element.getAttribute('rows') * element.editor.renderer.lineHeight + element.editor.renderer.scrollBar.getWidth()) + 'px';
        }
        if (element.hasAttribute('disabled') || element.hasAttribute('readonly')) {
            element.editor.setReadOnly(true);
        }
        element.editor.addEventListener('change', changeFunction);
        element.editor.addEventListener('focus', focusFunction);
        element.editor.addEventListener('blur', blurFunction);
        element.editor.addEventListener(evt.mouseout, mouseoutFunction);
        element.editor.addEventListener(evt.mouseover, mouseoverFunction);
        element.editor.addEventListener('keydown', keydownFunction);
        element.editor.addEventListener('insert', insertFunction);
        if (element.hasAttribute('data-tabindex')) {
            xtag.query(element, '.ace_text-input')[0].setAttribute('tabindex', element.getAttribute('data-tabindex'));
        }

        if (!element.hasAttribute('autoresize') && !element.hasAttribute('rows')) {
            element.style.height = '100%';
            element.children[0].style.height = '100%';
        }
        GS.triggerEvent(window, 'resize');
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

    //
    function elementInserted(element) {
        if (element.hasAttribute('encrypted') && !window[element.getAttribute('encrypted')] && !window['getting' + element.getAttribute('encrypted')]) {
            window['getting' + element.getAttribute('encrypted')] = true;
            GS.triggerEvent(element, 'password-error', {'reason': 'no', 'keyVariable': element.getAttribute('encrypted')});
        }
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

                element.appendChild(multiLineTemplate.cloneNode(true));
                // set a variable with the control element for convenience and speed
                element.control = xtag.queryChildren(element, '.editor')[0];

                element.control.lastWidth = element.control.clientWidth;
                element.control.lastHeight = element.control.clientHeight;
                element.syncView();
                var acejs;
                if (!window.hasInsertedAce) {
                    acejs = document.createElement('script');
                    acejs.src = '/js/ace/ace.js';
                    acejs.setAttribute('data-ace-base', '/js/ace/');
                    acejs.onload = function () {
                        var file_names = ["ext-language_tools.js", "ext-searchbox.js"];
                        var i = 0;
                        var len = file_names.length;
                        while (i < len) {
                            acejs = document.createElement('script');
                            acejs.src = '/js/ace/' + file_names[i] + '';
                            acejs.setAttribute('data-ace-base', '/js/ace/');
                            if (i === (len - 1)) {
                                acejs.onload = function () {
                                    GS.triggerEvent(window, 'ace-loaded');
                                    window.hasLoadedAce = true;
                                    createAce(element);
                                };
                            }
                            document.head.appendChild(acejs);
                            i += 1;
                        }
                    };
                    document.head.appendChild(acejs);
                    window.hasInsertedAce = true;
                } else if (window.hasInsertedAce && window.hasLoadedAce) {
                    createAce(element);
                } else if (window.hasInsertedAce) {
                    window.addEventListener('ace-loaded', function () {
                        createAce(element);
                    }, {"once": true});
                }

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
    }

    xtag.register('gs-ace', {
        lifecycle: {
            created: function () {
                elementCreated(this);
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
                    if (strAttrName === 'disabled' && newValue !== null) {
                        if (this.hasAttribute('encrypted')) {
                            this.innerHTML = CryptoJS.AES.decrypt(this.getAttribute('value'), (window[this.getAttribute('encrypted')] || '')).toString(CryptoJS.enc.Utf8) || this.getAttribute('placeholder');
                        } else {
                            this.innerHTML = this.getAttribute('value') || this.getAttribute('placeholder');
                        }
                    } else if (strAttrName === 'disabled' && newValue === null) {
                        this.innerHTML = '';
                        this.appendChild(multiLineTemplate.cloneNode(true));
                        if (this.hasAttribute('data-tabindex')) {
                            xtag.query(this, '.control')[0].setAttribute('tabindex', this.getAttribute('data-tabindex'));
                        }
                        // set a variable with the control element for convenience and speed
                        this.control = xtag.queryChildren(this, '.control')[0];

                        this.control.lastWidth = this.control.clientWidth;
                        this.control.lastHeight = this.control.clientHeight;
                        this.syncView();
                    } else if (strAttrName === 'value' && newValue !== oldValue) {
                        if (this.hasAttribute('encrypted')) {
                            if (
                                (
                                    CryptoJS.AES.decrypt(this.getAttribute('value'), (window[this.getAttribute('encrypted')] || '')).toString(CryptoJS.enc.Utf8) ||
                                    this.getAttribute('placeholder')
                                ) &&
                                (
                                    this.editor.getValue() !== CryptoJS.AES.decrypt(this.getAttribute('value'), (window[this.getAttribute('encrypted')] || '')).toString(CryptoJS.enc.Utf8) ||
                                    this.getAttribute('placeholder')
                                )
                            ) {
                                //console.log(this.editor.session.doc.positionToIndex(this.editor.selection.getCursor()));
                                var pos = this.editor.session.selection.toJSON();
                                this.editor.setValue(CryptoJS.AES.decrypt(newValue, (window[this.getAttribute('encrypted')] || '')).toString(CryptoJS.enc.Utf8) || this.getAttribute('placeholder'), this.editor.session.doc.positionToIndex(this.editor.selection.getCursor()));
                                this.editor.session.selection.fromJSON(pos);
                            }
                        } else {
                            // this.editor.setValue(newValue, this.editor.session.doc.positionToIndex(this.editor.selection.getCursor()));
                        }
                    }
                }
            }
        },
        events: {},
        accessors: {
            value: {
                // get value straight from the input
                get: function () {
                    if (this.editor) {
                        if (this.hasAttribute('encrypted')) {
                            //the value attribute is already encrypted
                            return this.getAttribute('value');
                        } else {
                            return this.editor.getValue();
                        }
                    }
                },

                // set the value of the input and set the value attribute
                set: function (strNewValue) {
                    if (this.getAttribute('value') !== strNewValue) {
                        if (this.hasAttribute('encrypted')) {
                            if (typeof strNewValue == 'string') {
                                this.setAttribute('value', CryptoJS.AES.encrypt(strNewValue, (window[this.getAttribute('encrypted')] || '')));
                            }
                        } else {
                            this.setAttribute('value', strNewValue);
                        }
                    }
                    if (this.editor) {
                        if (this.hasAttribute('encrypted')) {
                            this.editor.setValue(strNewValue, this.editor.session.doc.positionToIndex(this.editor.selection.getCursor()));
                        } else {
                            this.editor.setValue(strNewValue, -1);
                        }
                        this.syncView();
                    }
                }
            }
        },
        methods: {
            focus: function () {
                if (this.control) {
                    this.control.focus();
                }
            },

            // sync control and resize to text
            syncView: function () {
                if (this.editor) {
                    this.editor.removeEventListener('change', changeFunction);
                    this.editor.addEventListener('change', changeFunction);

                    this.editor.container.removeEventListener('focus', focusFunction);
                    this.editor.container.addEventListener('focus', focusFunction);

                    this.editor.container.removeEventListener('blur', blurFunction);
                    this.editor.container.addEventListener('blur', blurFunction);

                    this.editor.container.removeEventListener(evt.mouseout, mouseoutFunction);
                    this.editor.container.addEventListener(evt.mouseout, mouseoutFunction);

                    this.editor.container.removeEventListener(evt.mouseout, mouseoverFunction);
                    this.editor.container.addEventListener(evt.mouseover, mouseoverFunction);

                    this.editor.container.removeEventListener('keydown', keydownFunction);
                    this.editor.container.addEventListener('keydown', keydownFunction);

                    this.editor.container.removeEventListener('insert', insertFunction);
                    this.editor.container.addEventListener('insert', insertFunction);
                    if (this.hasAttribute('encrypted') && this.editor.getValue()) {
                        this.value = CryptoJS.AES.encrypt(this.editor.getValue(), (window[this.getAttribute('encrypted')] || ''));
                    }
                }
                if (this.getAttribute('value')) {
                    this.handleResizeToText();
                }
            },

            // if element is multiline and autoresize is not turned off: resize the element to fit the content
            handleResizeToText: function () {
                var element = this;

                if (element.hasAttribute('autoresize') && element.editor) {
                    element.editor.container.style.height = (
                        (
                            element.editor
                                .getSession()
                                .documentToScreenPosition(
                                    element.editor
                                        .getSession()
                                        .getDocument()
                                        .getLength(),
                                    0
                                ).row + 1
                        ) *
                        element.editor.renderer.lineHeight +
                        element.editor.renderer.scrollBar.getWidth()
                    ) + 'px';
                }

                if (
                    element.lastWidth !== element.clientWidth &&
                    element.lastHeight !== element.clientHeight
                ) {
                    element.lastWidth = element.clientWidth;
                    element.lastHeight = element.clientHeight;
                    GS.triggerEvent(element, 'size-changed');
                }
            }
        }
    });
});