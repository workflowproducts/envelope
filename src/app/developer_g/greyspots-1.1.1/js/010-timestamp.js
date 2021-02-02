//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps, shimmed
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    'use strict';

    addSnippet(
        '<gs-timestamp>',
        '<gs-timestamp>',
        'gs-timestamp date-format="${0:isodate}" time-format=${1}></gs-timestamp>'
    );

    /*
    TODO: there is no documentation
    designRegisterElement('gs-timestamp', '');
    */

    window.designElementProperty_GSTIMESTAMP = function () {
        addGSControlProps();
        addText('V', 'Date Placeholder', 'date-placeholder');
        addText('V', 'Time Placeholder', 'time-placeholder');
        addCheck('V', 'Date Picker', 'no-date-picker');
        addSelect('V', 'Date Display Format', 'date-format', [
            {"val": "", "txt": "Default (01/01/2015)"},
            {"val": "shortdate", "txt": "Shortdate (1/1/15)"},
            {"val": "mediumdate", "txt": "Mediumdate (Jan 1, 2015)"},
            {"val": "longdate", "txt": "Longdate (January 1, 2015)"},
            {"val": "fulldate", "txt": "Fulldate (Thursday, January 1, 2015)"},
            {"val": "isodate", "txt": "Isodate (2015-01-01)"},
            {"val": "isodatetime", "txt": "Isodatetime (2015-01-01T00:00:00)"}
        ]);
        addCheck('V', 'Time Picker', 'no-time-picker');
        addSelect('V', 'Time Display Format', 'time-format', [
            {"val": "", "txt": "Regular (1:30 PM)"},
            {"val": "military", "txt": "Military (13:30)"}
        ]);
        addCheck('D', 'Time Non-Empty', 'time-non-empty');
        addCheck('V', 'Time Now Button', 'time-no-now-button');
        addText('O', 'Date Tabindex', 'date-tabindex');
        addText('O', 'Time Tabindex', 'time-tabindex');
        addAutocompleteProps();
        addFocusEvents();
        addFlexProps();
        addText('O', 'Column In QS', 'qs');
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

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
        } else if (strQSCol && GS.qryGetKeys(strQS).indexOf(strQSCol) > -1) {
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

    // for a given element, copy the control values with the value attribute
    function syncView(element) {
        var strDateValue = element.dateControl.value + ' ' + (element.timeControl.value === 'NULL' ? '00:00' : element.timeControl.value);
        var dateValue = new Date(strDateValue);
        var newValue = dateValue.getFullYear() + '-' + (dateValue.getMonth() + 1) + '-' + dateValue.getDate() + ' ' + dateValue.getHours() + ':' + dateValue.getMinutes();
        
        //console.log(element.dateControl.value);
        //console.log(element.timeControl.value === 'NULL' ? '00:00' : element.timeControl.value);
        //console.log(strDateValue);
        //console.log(dateValue);
        //console.log(newValue);
        
        element.setAttribute('value', newValue);
    }
    
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

    // re-target focus event from control to element
    function focusFunction(event) {
        GS.triggerEvent(event.target.parentNode, 'focus');
        event.target.parentNode.classList.add('focus');
    }

    // re-target blur event from control to element
    function blurFunction(event) {
        GS.triggerEvent(event.target.parentNode, 'blur');
        event.target.parentNode.classList.remove('focus');
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
    
    // dont do anything that modifies the element here
    function elementCreated(element) {
        // if "created" hasn't been suspended: run created code
        if (!element.hasAttribute('suspend-created')) {
            // if the value was set before the "created" lifecycle code runs: set attribute
            //      (discovered when trying to set a value of a date control in the after_open of a dialog)
            //      ("delete" keyword added because of firefox)
            if (element.value && new Date(element.value).getTime()) {
                element.setAttribute('value', element.value);
                delete element.value;
                //element.value = undefined;
                //element.value = null;
            }
        }
    }
    
    function elementInserted(element) {
        var dateValue = '';
        var timeValue = '';
        
        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;
                element.internal = {};
                saveDefaultAttributes(element);
                
                if (element.hasAttribute('value')) {
                    var arrValue = element.getAttribute('value').split(' ');
                    dateValue = new Date(arrValue[0] + ' 00:00:00');    // adding an empty time causes the date to not be iso format
                                                                        // this makes the browser choose the local timezone instead of GMT
                    timeValue = arrValue[1];
                }
                
                element.dateControl = document.createElement('gs-date');
                element.timeControl = document.createElement('gs-time');
                
                var arrPassthrough = ['mini', 'autocorrect', 'autocapitalize', 'autocomplete', 'spellcheck', 'disabled', 'readonly'];
                var arrDatePassthrough = ['date-placeholder', 'no-date-picker', 'date-format', 'date-tabindex'];
                var arrTimePassthrough = ['time-placeholder', 'no-time-picker', 'time-format', 'time-non-empty', 'time-no-now-button', 'time-tabindex'];
                var i;
                var len;
                
                for (i = 0, len = arrPassthrough.length; i < len; i += 1) {
                    if (element.hasAttribute(arrPassthrough[i])) {
                        element.dateControl.setAttribute(arrPassthrough[i], '');
                        element.timeControl.setAttribute(arrPassthrough[i], '');
                    }
                }
                for (i = 0, len = arrDatePassthrough.length; i < len; i += 1) {
                    if (element.hasAttribute(arrDatePassthrough[i])) {
                        element.dateControl.setAttribute(arrDatePassthrough[i].replace(/date\-/g, ''), element.getAttribute(arrDatePassthrough[i]) || '');
                    }
                }
                for (i = 0, len = arrTimePassthrough.length; i < len; i += 1) {
                    if (element.hasAttribute(arrTimePassthrough[i])) {
                        element.timeControl.setAttribute(arrTimePassthrough[i].replace(/time\-/g, ''), element.getAttribute(arrTimePassthrough[i]) || '');
                    }
                }
                
                element.dateControl.value = dateValue;
                element.timeControl.value = timeValue;
                
                element.dateControl.setAttribute('flex', '');
                element.timeControl.setAttribute('flex', '');
                
                element.dateControl.setAttribute('gs-dynamic', '');
                element.timeControl.setAttribute('gs-dynamic', '');
                
                element.dateControl.addEventListener('focus', focusFunction);
                element.timeControl.addEventListener('focus', focusFunction);

                element.dateControl.addEventListener('blur', blurFunction);
                element.timeControl.addEventListener('blur', blurFunction);

                element.dateControl.addEventListener(evt.mouseout, mouseoutFunction);
                element.timeControl.addEventListener(evt.mouseout, mouseoutFunction);
                
                element.dateControl.addEventListener(evt.mouseover, mouseoverFunction);
                element.timeControl.addEventListener(evt.mouseover, mouseoverFunction);
                
                element.dateControl.addEventListener('change', function (event) {
                    syncView(element);
                    event.stopPropagation();
                    GS.triggerEvent(element, 'change');
                });
                element.timeControl.addEventListener('change', function (event) {
                    syncView(element);
                    event.stopPropagation();
                    GS.triggerEvent(element, 'change');
                });
                
                //console.log(element.dateControl);
                //console.log(element.timeControl);
                
                element.appendChild(element.dateControl);
                element.appendChild(element.timeControl);
                
                //console.log(element.children);
                
                pushReplacePopHandler(element);
                window.addEventListener('pushstate',    function () { pushReplacePopHandler(element); });
                window.addEventListener('replacestate', function () { pushReplacePopHandler(element); });
                window.addEventListener('popstate',     function () { pushReplacePopHandler(element); });
            }
        }
    }
    
    xtag.register('gs-timestamp', {
        lifecycle: {
            created: function () {
                elementCreated(this);
            },
            
            inserted: function () {
                elementInserted(this);
            },
            
            attributeChanged: function (strAttrName, oldValue, newValue) {
                var dateValue = '';
                var timeValue = '';
                // if "suspend-created" has been removed: run created and inserted code
                if (strAttrName === 'suspend-created' && newValue === null) {
                    elementCreated(this);
                    elementInserted(this);
                    
                // if "suspend-inserted" has been removed: run inserted code
                } else if (strAttrName === 'suspend-inserted' && newValue === null) {
                    elementInserted(this);
                    
                } else if (!this.hasAttribute('suspend-created') && !this.hasAttribute('suspend-inserted')) {
                    if (strAttrName === 'value') {
                        if (newValue !== null) {
                            var arrValue = newValue.split(' ');
                            dateValue = new Date(arrValue[0]);
                            timeValue = arrValue[1];
                            
                            this.dateControl.value = dateValue;
                            this.timeControl.value = timeValue;
                        } else {
                            this.dateControl.value = null;
                            this.timeControl.value = null;
                        }
                    }
                }
            }
        },
        events: {},
        accessors: {
            value: {
                get: function () {
                    return this.getAttribute('value');
                },
                
                set: function (newValue) {
                    this.setAttribute('value', newValue);
                }
            }
        },
        methods: {
        }
    });
});