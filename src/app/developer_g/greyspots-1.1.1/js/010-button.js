//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps

(function () {
    'use strict';

    function defineButton(strTagName, strDocLink, arrDisableWhenEmptyAttributes, designAdditionalFunction, clickFunction) {
        strDocLink = strDocLink || '#controls_buttons_toggle';
        designAdditionalFunction = designAdditionalFunction || function () {};
        clickFunction = clickFunction || function () {};

        window.addEventListener('design-register-element', function () {
            addSnippet(
                '<' + strTagName + '>',
                '<' + strTagName + '>',
                strTagName + '>${1}</' + strTagName + '>'
            );

            addElement(strTagName, strDocLink);

            window['designElementProperty_' + strTagName.replace(/[^a-z0-9]/gi, '').toUpperCase()] = function (selectedElement) {
                addCheck('D', 'Disabled', 'disabled');
                addCheck('O', 'No Focus', 'no-focus');
                addCheck('V', 'Inline', 'inline');
                addCheck('V', 'Jumbo', 'jumbo');
                addCheck('V', 'Mini', 'mini');
                addText('O', 'Hot Key', 'key');
                addCheck('O', 'No Modifier For Hot Key', 'no-modifier-key');
                designAdditionalFunction(selectedElement);
                addFocusEvents('static');
                addText('O', 'Column In QS', 'qs');
                addIconProps();
                addBasicThemingProps();
                addCornerRoundProps();
                addFlexProps();
            };
        });

        document.addEventListener('DOMContentLoaded', function () {
            function handleDisable(element) {
                var i, len;

                element.removeAttribute('disabled');

                for (i = 0, len = arrDisableWhenEmptyAttributes.length; i < len; i += 1) {
                    if (!element.getAttribute(arrDisableWhenEmptyAttributes[i])) {
                        element.setAttribute('disabled', '');
                        break;
                    }
                }
            }

            //function pushReplacePopHandler(element) {
            //    var strQueryString = GS.getQueryString(), strQSCol = element.getAttribute('qs');

            //    if (GS.qryGetKeys(strQueryString).indexOf(strQSCol) > -1) {
            //        element.setAttribute('value', GS.qryGetVal(strQueryString, strQSCol));
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
                        element.setAttribute('value', strQSValue);
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

            //
            function elementInserted(element) {
                var strKey, strQSValue;

                if (element.tagName.toUpperCase() === 'GS-DELETE-BUTTON' && !element.hasAttribute('src')) {
                    console.warn(element, 'gs-delete-button needs a [src=""] attribute!');
                }

                // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
                if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
                    // if this is the first time inserted has been run: continue
                    if (!element.inserted) {
                        element.inserted = true;
                        element.internal = {};
                        saveDefaultAttributes(element);

                        if (element.getAttribute('qs')) {
                            //strQSValue = GS.qryGetVal(GS.getQueryString(), element.getAttribute('qs'));
                            //if (strQSValue !== '' || !element.getAttribute('value')) {
                            //    element.setAttribute('value', strQSValue);
                            //}
                            pushReplacePopHandler(element);
                            window.addEventListener('pushstate',    function () { pushReplacePopHandler(element); });
                            window.addEventListener('replacestate', function () { pushReplacePopHandler(element); });
                            window.addEventListener('popstate',     function () { pushReplacePopHandler(element); });
                        }

                        // add a tabindex to allow focus (if allowed)
                        if (!element.hasAttribute('no-focus')) {
                            if ((!element.tabIndex) || element.tabIndex === -1) {
                                element.tabIndex = 0;
                            }
                        } else {
                            element.removeAttribute('tabindex');
                        }
                        
                        if (!evt.touchDevice) {
                            element.addEventListener('focus', function (event) {
                                element.classList.add('focus');
                            });
                            
                            element.addEventListener('blur', function (event) {
                                element.classList.remove('focus');
                            });
                            
                            
                            element.addEventListener(evt.mousedown, function (event) {
                                element.classList.add('down');
                            });
                            
                            element.addEventListener(evt.mouseout, function (event) {
                                element.classList.remove('down');
                                element.classList.remove('hover');
                            });
                            
                            element.addEventListener(evt.mouseover, function (event) {
                                element.classList.remove('down');
                                element.classList.add('hover');
                            });
                            
                            element.addEventListener('keydown', function (event) {
                                if (!element.hasAttribute('disabled') && !element.classList.contains('down') &&
                                    (event.keyCode === 13 || event.keyCode === 32)) {
                                    
                                    element.classList.add('down');
                                }
                                
                                if (element.hasAttribute('disabled')) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    return true;
                                }
                            });
                            
                            element.addEventListener('keyup', function (event) {
                                // if we are not disabled and we pressed return (13) or space (32): trigger click
                                if (!element.hasAttribute('disabled') && element.classList.contains('down') &&
                                    (event.keyCode === 13 || event.keyCode === 32)) {
                                    GS.triggerEvent(element, 'click');
                                }
                            });
                        }

                        element.addEventListener('click', function (event) {
                            element.classList.remove('down');
                            if (!element.hasAttribute('disabled')) {
                                clickFunction(element);
                            } else {
                                event.preventDefault();
                                event.stopPropagation();
                                event.stopImmediatePropagation();
                            }
                        });
                        
                        element.addEventListener('keypress', function (event) {
                            // if we pressed return (13) or space (32): prevent default and stop propagation (to prevent scrolling of the page)
                            if (event.keyCode === 13 || event.keyCode === 32) {
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        });
                        
                        if (element.getAttribute('key')) {
                            strKey = element.getAttribute('key');
                            
                            if (GS.keyCode(strKey)) {
                                if (strKey.match(/[arfcvxzntypq]/gim)) {
                                    console.warn('gs-skype-button Warning: by setting the hot key of this button to "' + strKey + '" you may be overriding browser functionality.', element);
                                }
                                
                                window.addEventListener('keydown', function (event) {
                                    if (String(event.keyCode || event.which) === GS.keyCode(strKey) &&
                                        (
                                            (element.hasAttribute('no-modifier-key') && !event.metaKey && !event.ctrlKey)
                                            || (!element.hasAttribute('no-modifier-key') && (event.metaKey || event.ctrlKey))
                                        )) {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        
                                        element.focus();
                                        GS.triggerEvent(element, 'click');
                                    }
                                });
                                
                            } else if (strKey.length > 1) {
                                console.error('gs-skype-button Error: \'key="' + strKey + '"\' is not a valid hot-key.', element);
                            }
                        }
                        
                        handleDisable(element);
                    }
                }
            }
            
            xtag.register(strTagName, {
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
                            if (strAttrName === 'no-focus') {
                                if (!this.hasAttribute('no-focus')) {
                                    if ((!this.tabIndex) || this.tabIndex === -1) {
                                        this.tabIndex = 0;
                                    }
                                } else {
                                    this.removeAttribute('tabindex');
                                }
                            } else if (strAttrName === 'disabled') {
                                this.classList.remove('down');
                            } else if (arrDisableWhenEmptyAttributes.indexOf(strAttrName) > -1) {
                                handleDisable(this);
                            }
                        }
                    }
                },
                accessors: {
                    value: {
                        get: function () {
                            return this.getAttribute('value');
                        },
                        set: function (newValue) {
                            this.setAttribute('value', newValue);
                        }
                    }
                }
            });
        });
    }
    
    
    
    defineButton('gs-email-button', '', ['value'], '', function (element) {
        var emailAddress = element.getAttribute('value'), linkIframe, loadHandler;
        
        if (emailAddress) {
            linkIframe = document.createElement('iframe');
            document.body.appendChild(linkIframe);
            
            loadHandler = function () {
                document.body.removeChild(linkIframe);
                document.removeEventListener('mousedown', loadHandler);//'mousedown'
            };
            
            document.addEventListener('mousedown', loadHandler);//'mousedown'
            // linkIframe.setAttribute('onLoad', 'console.log(\'runnin\'); loadHandler();');
            linkIframe.setAttribute('style', 'display: none;');
            linkIframe.setAttribute('src', 'mailto:' + emailAddress);
        }
    });
    
    defineButton('gs-facetime-button', '', ['value'], '', function (element) {
        var appleID = element.getAttribute('value');
        
        if (appleID) {
            window.open('facetime:' + appleID);
        }
    });

    defineButton('gs-map-button', '', ['value'], '', function (element) {
        var strLocation = encodeURIComponent(element.getAttribute('value'));

        if (strLocation) {
            if (element.hasAttribute('google') === true) {
                window.open('https://maps.google.com/maps?q=' + strLocation);
            } else if (element.hasAttribute('bing') === true) {
                window.open('http://www.bing.com/maps/default.aspx?q=' + strLocation);
            } else {
                window.open('https://maps.google.com/maps?q=' + strLocation);
            }
        }
    });

    defineButton('gs-phone-button', '', ['value'], '', function (element) {
        var phoneNumber = element.getAttribute('value');

        if (phoneNumber) {
            if (evt.deviceType === 'phone') {
                window.open('tel:' + phoneNumber);
            } else {
                GS.msgbox('Phone Number', '<center>' + phoneNumber + '</center>', ['Done']);
            }
        }
    });

    defineButton('gs-tracking-button', '', ['value'], function () {
        addAttributeSwitcherProp('D', 'Service', [
            {"val": "", "txt": "None"},
            {"val": "usps", "txt": "USPS"},
            {"val": "ups", "txt": "UPS"},
            {"val": "fedex", "txt": "FEDEX"},
            {"val": "royal", "txt": "Royal Mail"},
            {"val": "amz", "txt": "Amazon"}
        ]);

    }, function (element) {
        var strTrackingNumber = element.getAttribute('value');

        if (strTrackingNumber) {
            if (element.hasAttribute('usps') === true) {
                window.open('https://tools.usps.com/go/TrackConfirmAction?tLabels=' + strTrackingNumber);

            } else if (element.hasAttribute('ups') === true) {
                // window.open('http://www.ups.com/WebTracking/processInputRequest?tracknum=' + strTrackingNumber);
                window.open('https://www.ups.com/track?loc=en_US&tracknum=' + strTrackingNumber + '&requester=MB/trackdetails');

            } else if (element.hasAttribute('fedex') === true) {
                window.open('https://www.fedex.com/apps/fedextrack/index.html?tracknumbers=' + strTrackingNumber);

            } else if (element.hasAttribute('royal') === true) {
                window.open('https://www.royalmail.com/track-your-item?trackNumber=' + strTrackingNumber);

            } else if (element.hasAttribute('amz') === true) {
                window.open(decodeURIComponent(strTrackingNumber));

            } else {
                GS.msgbox('Please Choose...',
                          '<center>Please Choose UPS, USPS, Fedex, Royal Mail or Amazon</center>',
                          ['UPS', 'USPS', 'Fedex', 'Royal Mail', 'Amazon'],
                          function (strAnswer) {
                    if (strAnswer === 'UPS') {
                        window.open('http://www.ups.com/WebTracking/processInputRequest?tracknum=' + strTrackingNumber);
                    } else if (strAnswer === 'USPS') {
                         window.open('https://tools.usps.com/go/TrackConfirmAction?tLabels=' + strTrackingNumber);
                    } else if (strAnswer === 'Fedex') {
                         window.open('https://www.fedex.com/apps/fedextrack/index.html?tracknumbers=' + strTrackingNumber);
                    } else if (strAnswer === 'Royal Mail') {
                         window.open('https://www.royalmail.com/track-your-item?trackNumber' + strTrackingNumber);
                    } else if (strAnswer === 'Amazon') {
                         window.open(strTrackingNumber);
                    }
                });
            }
        }
    });

    defineButton('gs-skype-button', '', ['value'], '', function (element) {
        if (element.getAttribute('value')) {
            window.open('skype:' + element.getAttribute('value'));
        }
    });

    defineButton('gs-delete-button',
                 '/env/app/developer_g/greyspots-' + GS.version() + '/documentation/doc-elem-delete-button.html',
                 ['value', 'src'],
                 function () {
        addText('D', 'Source', 'src');
        addText('D', 'Delete Action', 'action-delete');
    }, function (element) {
        if (element.getAttribute('value')) {
            var arrSrcParts = element.getAttribute('src').split('.');
            var strSchema = arrSrcParts[0];
            var strObject = arrSrcParts[1];
            var strPkColumn, strLockColumn;
            var deleteRecordData;
            var strHashColumns;
            var strRoles;
            var strColumns;
            var strRecord;
            var strDeleteData;
            var strHash;
            var strPkValue;
            var strLockValue;

            element.classList.remove('down');

            strPkColumn = element.getAttribute('column') || 'id';
            strLockColumn = strPkColumn;
            strHashColumns = strLockColumn;

            strPkValue = GS.encodeForTabDelimited(element.getAttribute('value') || '');
            strLockValue = element.getAttribute('value') || '';

            strRoles = 'pk\thash';
            strColumns = strPkColumn + '\thash';

            strHash = CryptoJS.MD5(strLockValue === 'NULL' ? '' : strLockValue).toString();

            strDeleteData = strPkValue + '\t' + strHash + '\n';
            strDeleteData = strRoles + '\n' + strColumns + '\n' + strDeleteData;

            // create delete transaction
            GS.addLoader(element, 'Creating Delete Transaction...');
            GS.requestDeleteFromSocket(
                GS.envSocket, strSchema, strObject, strHashColumns, strDeleteData
                , function (data, error, transactionID) {
                    if (error) {
                        GS.removeLoader(element);
                        GS.webSocketErrorDialog(data);
                    }
                }
                , function (data, error, transactionID, commitFunction, rollbackFunction) {
                    var arrElements, i, len, templateElement;
                    GS.removeLoader(element);

                    if (!error) {
                        if (data !== 'TRANSACTION COMPLETED') {

                        } else {
                            templateElement = document.createElement('template');
                            templateElement.innerHTML = ml(function () {/*
                                <gs-page>
                                    <gs-header><center><h3>Are you sure...</h3></center></gs-header>
                                    <gs-body padded>
                                        <center>Are you sure you want to delete?</center>
                                    </gs-body>
                                    <gs-footer>
                                        <gs-grid>
                                            <gs-block><gs-button dialogclose>No</gs-button></gs-block>
                                            <gs-block><gs-button id="datasheet-focus-me" dialogclose bg-primary tabindex="0">Yes</gs-button></gs-block>
                                        </gs-grid>
                                    </gs-footer>
                                </gs-page>
                            */});

                            GS.openDialog(templateElement, function () {
                                document.getElementById('datasheet-focus-me').focus();

                            }, function (event, strAnswer) {
                                if (strAnswer === 'Yes') {
                                    commitFunction();
                                    GS.addLoader(element, 'Commiting Delete Transaction...');
                                } else {
                                    rollbackFunction();
                                    GS.addLoader(element, 'Rolling Back Delete Transaction...');
                                }
                            });
                        }

                    } else {
                        rollbackFunction();
                        GS.webSocketErrorDialog(data);
                    }
                }
                , function (strAnswer, data, error) {
                    var arrElements, i, len;
                    GS.removeLoader(element);

                    if (!error) {
                        if (strAnswer === 'COMMIT') {
                            GS.triggerEvent(element, 'success');
                            if (element.hasAttribute('onsuccess')) {
                                new Function(element.getAttribute('onsuccess')).apply(element);
                            }
                        }

                    } else {
                        getData(element);
                        GS.webSocketErrorDialog(data);
                    }
                }
            );
        }
    });

    defineButton('gs-option',
                 '/env/app/developer_g/greyspots-' + GS.version() + '/documentation/doc-elem-optionbox.html',
                 [],
                 function () {},
                 function (element) {});


    window.addEventListener('design-register-element', function () {
        addSnippet('<gs-dialog-button> With Template', '<gs-dialog-button>', '' +
              'template id="$1">\n' +
              '    <gs-page>\n' +
              '        <gs-header>\n' +
              '            <center><h3>$3</h3></center>\n' +
              '        </gs-header>\n' +
              '        <gs-body padded>\n' +
              '            $4\n' +
              '        </gs-body>\n' +
              '        <gs-footer>\n' +
              '            <gs-grid gutter>\n' +
              '                <gs-block>\n' +
              '                    <gs-button dialogclose>Cancel</gs-button>\n' +
              '                </gs-block>\n' +
              '                <gs-block>\n' +
              '                    <gs-button dialogclose bg-primary>Save</gs-button>\n' +
              '                </gs-block>\n' +
              '            </gs-grid>\n' +
              '        </gs-footer>\n' +
              '    </gs-page>\n' +
              '</template>\n' +
              '<gs-dialog-button template="$1" before-open="$5" after-open="$6" before-close="$7" after-close="$8">' +
              '$2' +
              '</gs-dialog-button>' +
              '\n\n');
    });

    defineButton('gs-dialog-button',
        '/env/app/developer_g/greyspots-' + GS.version() + '/documentation/doc-elem-dialog-button.html',
        [],
        function () {
            addText('O', 'Template', 'template');
            addText('O', 'Attach To Element', 'target-element');
            addSelect('O', 'Attachment Direction', 'direction', [
                {"val": "", "txt": "Default"},
                {"val": "left", "txt": "Left"},
                {"val": "right", "txt": "Right"},
                {"val": "up", "txt": "Up"},
                {"val": "down", "txt": "Down"}
            ]);
            addText('E', 'Before Open', 'before-open');
            addText('E', 'After Open', 'after-open');
            addText('E', 'Before Close', 'before-close');
            addText('E', 'After Close', 'after-close');
        },
        function (element) {// on click
            var targetElement0;
            var strTemplate = element.getAttribute('template');
            var templateElement;
            var strTargetSelector = element.getAttribute('target');
            var strDirection = element.getAttribute('direction');
            var strBeforeOpen = element.getAttribute('before-open');
            var strAfterOpen = element.getAttribute('after-open');
            var strBeforeClose = element.getAttribute('before-close');
            var strAfterClose = element.getAttribute('after-close');
            var afterOpenFunction;
            var beforeCloseFunction;
            var afterCloseFunction;

            templateElement = (strTemplate ? document.getElementById(strTemplate) : xtag.queryChildren(element, 'template')[0]);

            if (templateElement) {
                if (strBeforeOpen) {
                    new Function(strBeforeOpen).apply(element);
                }
                GS.triggerEvent(element, 'before-open');

                afterOpenFunction = function () {
                    if (strAfterOpen) {
                        new Function(strAfterOpen).apply(this);
                    }
                    GS.triggerEvent(element, 'after-open');
                };

                beforeCloseFunction = function (event, strAnswer) {
                    // if there is a before close function: run the code
                    if (strBeforeClose) {
                        // append a definition for the "strAnswer" variable before the code (the replace calls are to make the string safe)
                        new Function('var strAnswer = \'' + strAnswer.replace(/'/g, 'donTGueSsThiSUniTokEN1975') + '\'' +
                                                    '.replace(/donTGueSsThiSUniTokEN1975/g, \'\\\'\');\n' + strBeforeClose).apply(this);
                    }
                    GS.triggerEvent(element, 'before-close', {'strAnswer': strAnswer});
                };

                afterCloseFunction = function (event, strAnswer) {
                    // if there is a after close function: run the code
                    if (strAfterClose) {
                        // append a definition for the "strAnswer" variable before the code (the replace calls are to make the string safe)
                        new Function('var strAnswer = \'' + strAnswer.replace(/'/g, 'donTGueSsThiSUniTokEN1975') + '\'' +
                                                    '.replace(/donTGueSsThiSUniTokEN1975/g, \'\\\'\');\n' + strAfterClose).apply(element);
                    }
                    GS.triggerEvent(element, 'after-close', {'strAnswer': strAnswer});
                };

                if (strTargetSelector || element.hasAttribute('target')) {
                    strTargetSelector = (strTargetSelector || 'this');
                    targetElement = (
                        strTargetSelector === 'this'
                            ? element
                            : document.querySelector(strTargetSelector)
                    );
                    strDirection = (strDirection || 'down');

                    GS.openDialogToElement(
                        targetElement,
                        templateElement,
                        strDirection,
                        afterOpenFunction,
                        beforeCloseFunction,
                        afterCloseFunction
                    );
                } else {
                    GS.openDialog(
                        templateElement,
                        afterOpenFunction,
                        beforeCloseFunction,
                        afterCloseFunction
                    );
                }
            }
        });
})();














window.addEventListener('design-register-element', function () {
    "use strict";

    addSnippet('<gs-button>', '<gs-button>', 'gs-button>${1}</gs-button>');

    addElement('gs-button', '#controls_buttons_toggle');

    window.designElementProperty_GSBUTTON = function(selectedElement) {
        addCheck('D', 'Disabled', 'disabled');
        addCheck('O', 'No Focus', 'no-focus');
        addCheck('V', 'Inline', 'inline');
        addCheck('V', 'Jumbo', 'jumbo');
        addCheck('V', 'Mini', 'mini');
        addText('O', 'Hot Key', 'key');
        addCheck('O', 'No Modifier For Hot Key', 'no-modifier-key');
        addText('O', 'Href', 'href');
        addSelect('O', 'Target', 'target', [
            {"val": "", "txt": "Default"},
            {"val": "_self", "txt": "Current Window"},
            {"val": "_blank", "txt": "New Window"}
        ]);
        addCheck('O', 'Dialog Close', 'dialogclose');
        addFocusEvents('static');
        addText('O', 'Column In QS', 'qs');
        addIconProps();
        addBasicThemingProps();
        addCornerRoundProps();
        addFlexProps();
    };
});


document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    
    function refreshAnchor(element) {
        var strLink = element.getAttribute('href') || element.getAttribute('value');

        if (element.anchorElement) {
            element.removeChild(element.anchorElement);
        }

        var strInner = element.innerText;
        
        if (strLink) {
            element.anchorElement = document.createElement('a');
            element.anchorElement.setAttribute('gs-dynamic', '');
            element.anchorElement.setAttribute('target', element.getAttribute('target') || '_blank');
            element.anchorElement.setAttribute('href', strLink);
            
            if (element.getAttribute('onclick')) {
                //element.anchorElement.setAttribute('onclick', element.getAttribute('onclick'));
            }
            
            if (element.hasAttribute('download')) {
                element.anchorElement.setAttribute('download', element.getAttribute('download'));
            }
            
            if (element.hasAttribute('dialogclose')) {
                element.anchorElement.setAttribute('dialogclose', element.getAttribute('dialogclose'));
            }
            
            element.anchorElement.innerText = strInner;
            
            element.appendChild(element.anchorElement);
        }
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
                element.setAttribute('value', strQSValue);
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
            }
        }
    }
    
    //
    function elementInserted(element) {
        var strKey;
        
        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;
                element.internal = {};
                saveDefaultAttributes(element);

                if (element.getAttribute('qs')) {
                    //var strQSValue = GS.qryGetVal(GS.getQueryString(), element.getAttribute('qs'));
                    //if (strQSValue !== '' || !element.getAttribute('value')) {
                    //    element.setAttribute('value', strQSValue);
                    //}
                    pushReplacePopHandler(element);
                    window.addEventListener('pushstate',    function () { pushReplacePopHandler(element); });
                    window.addEventListener('replacestate', function () { pushReplacePopHandler(element); });
                    window.addEventListener('popstate',     function () { pushReplacePopHandler(element); });
                }
                
                // add a tabindex to allow focus (if allowed)
                if (!element.hasAttribute('no-focus')) {
                    if ((!element.tabIndex) || element.tabIndex === -1) {
                        element.tabIndex = 0;
                    }
                } else {
                    element.removeAttribute('tabindex');
                }


                if (element.hasAttribute('disabled')) {
                    element.setAttribute('aria-disabled', 'true');
                }

                element.classList.remove('down');
                element.classList.remove('hover');

                if (element.onclick) {
                    // This is because the general 'onclick' attribute doesn't respect the 'disabled' attribute
                    element.oldOnClick = element.onclick;
                    element.onclick = function () {
                        if (!element.hasAttribute('disabled')) {
                            element.oldOnClick.apply(element, arguments);
                        }
                    };
                }
                
                element.addEventListener('click', function (event) {
                    element.classList.remove('down');
                    if (element.hasAttribute('disabled')) {
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                    }
                });
                
                if (!evt.touchDevice) {
                    element.addEventListener('focus', function (event) {
                        element.classList.add('focus');
                    });
                    
                    element.addEventListener('blur', function (event) {
                        element.classList.remove('focus');
                    });
                    
                    element.addEventListener(evt.mousedown, function (event) {
                        element.classList.add('down');
                    });
                    
                    element.addEventListener(evt.mouseout, function (event) {
                        element.classList.remove('down');
                        element.classList.remove('hover');
                    });
                    
                    element.addEventListener(evt.mouseover, function (event) {
                        element.classList.remove('down');
                        element.classList.add('hover');
                    });
                    
                    element.addEventListener('keydown', function (event) {
                        if (!element.hasAttribute('disabled') &&
                            (event.keyCode === 13 || event.keyCode === 32)) {
                            element.classList.add('down');
                        }
                    });
                    
                    element.addEventListener('keyup', function (event) {
                        // if we are not disabled and we pressed return (13) or space (32): trigger click
                        if (!element.hasAttribute('disabled') && element.classList.contains('down') &&
                            (event.keyCode === 13 || event.keyCode === 32)) {
                            GS.triggerEvent(element, 'click');
                        }
                    });
                }
                
                refreshAnchor(element);
                
                element.addEventListener('click', function (event) {
                    element.classList.remove('down');
                });
                
                element.addEventListener('keypress', function (event) {
                    // if we pressed return (13) or space (32): prevent default and stop propagation (to prevent scrolling of the page)
                    if (event.keyCode === 13 || event.keyCode === 32) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                });
                
                strKey = element.getAttribute('key');
                
                if (strKey) {
                    if (GS.keyCode(strKey)) {
                        if (strKey.match(/[arfcvxzntypq]/gim)) {
                            console.warn('gs-button Warning: by setting the hot key of this button to "' + strKey + '" you may be overriding browser functionality.', element);
                        }
                        
                        window.addEventListener('keydown', function (event) {
                            if (
                                    String(event.keyCode || event.which) === GS.keyCode(strKey) &&
                                    (
                                        (
                                            element.hasAttribute('no-modifier-key') &&
                                            !event.metaKey &&
                                            !event.ctrlKey
                                        ) ||
                                        (
                                            !element.hasAttribute('no-modifier-key') &&
                                            (event.metaKey || event.ctrlKey)
                                        )
                                    )
                                ) {
                                event.preventDefault();
                                event.stopPropagation();
                                
                                element.focus();
                                GS.triggerEvent(element, 'click');
                            }
                        });
                        
                    } else if (strKey.length > 1) {
                        console.error('gs-button Error: \'key="' + strKey + '"\' is not a valid hot-key.', element);
                    }
                }
            }
        }
    }
    
    xtag.register('gs-button', {
        lifecycle: {
            created: function () {
                elementCreated(this);
            },
            
            inserted: function () {
                elementInserted(this);
            },
            
            attributeChanged: function (strAttrName, oldValue, newValue) {
                //console.log('attributeChanged', strAttrName, oldValue, newValue);
                // if "suspend-created" has been removed: run created and inserted code
                if (strAttrName === 'suspend-created' && newValue === null) {
                    elementCreated(this);
                    elementInserted(this);
                    
                // if "suspend-inserted" has been removed: run inserted code
                } else if (strAttrName === 'suspend-inserted' && newValue === null) {
                    elementInserted(this);
                    
                } else if (!this.hasAttribute('suspend-created') && !this.hasAttribute('suspend-inserted')) {
                    if (strAttrName === 'no-focus') {
                        if (!this.hasAttribute('no-focus') && !this.hasAttribute('tabindex')) {
                            this.setAttribute('tabindex', 0);
                        } else if (this.hasAttribute('no-focus')) {
                            this.removeAttribute('tabindex');
                        }
                    } else if (strAttrName === 'disabled') {
                        this.classList.remove('down');
                        if (newValue) {
                            this.setAttribute('aria-disabled', 'true');
                        } else {
                            this.removeAttribute('aria-disabled');
                        }
                    } else if (strAttrName === 'href' || strAttrName === 'target' || strAttrName === 'onclick' || strAttrName === 'download') {
                        refreshAnchor(this);
                    }
                }
            }
        },
        events: {},
        accessors: {},
        methods: {}
    });
});