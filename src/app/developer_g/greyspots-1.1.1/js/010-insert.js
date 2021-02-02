//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps, addDataEvents, addDataAttributes
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    "use strict";
    addSnippet(
        '<gs-insert>',
        '<gs-insert>',
        'gs-insert src="${1:test.tpeople}">\n    ${2}\n</gs-insert>'
    );
    addElement('gs-insert', '#record_insert');

    window.designElementProperty_GSINSERT = function (selectedElement) {
        addDataAttributes('insert');
        addText('D', 'Additional&nbsp;Values', 'addin');
        addDataEvents('insert');
        addFlexContainerProps(selectedElement);
        addFlexProps(selectedElement);
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    // the user needs to be able to set a custom websocket for this element,
    //      so this function will use an attribute to find out what socket to
    //      use (and it'll default to "GS.envSocket")
    function getSocket(element) {
        if (element.getAttribute('socket')) {
            return GS[element.getAttribute('socket')];
        }
        return GS.envSocket;
    }

    xtag.register('gs-insert', {
        lifecycle: {},
        events: {},
        accessors: {},
        methods: {
            submit: function (callback) {
                var element = this;

                GS.triggerEvent(element, 'before_insert');
                GS.triggerEvent(element, 'onbefore_insert');
                if (element.hasAttribute('onbefore_insert')) {
                    new Function(element.getAttribute('onbefore_insert')).apply(element);
                }

                var srcParts = GS.templateWithQuerystring(element.getAttribute('src') || '').split('.');
                var strSchema = srcParts[0];
                var strObject = srcParts[1];
                var strSeqCols;
                var strPkCols;
                var strAddIn;
                var strColumns = '';
                var strResponseColumns;
                var strInsertRecord = '';
                var strInsertData;
                var arrElement;
                var arrKey;
                var arrValue;
                var i;
                var len;
                var strResponse;
                var parentSrcElement;

                // addin insert data
                strAddIn = GS.templateWithQuerystring(element.getAttribute('addin') || '');
                if (strAddIn) {
                    arrKey = GS.qryGetKeys(strAddIn);
                    arrValue = GS.qryGetVals(strAddIn);
                    if (!(arrKey.length === 1 && arrKey[0] === '')) {
                        i = 0;
                        len = arrKey.length;
                        while (i < len) {
                            strColumns += (strColumns ? '\t' : '') + GS.encodeForTabDelimited(arrKey[i]);
                            strInsertRecord += (strInsertRecord ? '\t' : '') + GS.encodeForTabDelimited(arrValue[i]);
                            i += 1;
                        }
                    }
                }

                // control insert data
                arrElement = xtag.query(element, '[column]');
                i = 0;
                len = arrElement.length;
                while (i < len) {
                    parentSrcElement = GS.findParentElement(arrElement[i].parentNode, '[src]');
                    if (
                        parentSrcElement === element &&
                        (
                            arrElement[i].value !== undefined &&
                            arrElement[i].value !== null &&
                            arrElement[i].value !== ''
                        )
                    ) {
                        strColumns += (strColumns ? '\t' : '') + GS.encodeForTabDelimited(arrElement[i].getAttribute('column'));
                        strInsertRecord += (strInsertRecord ? '\t' : '') + GS.encodeForTabDelimited(arrElement[i].value);
                    }
                    i += 1;
                }

                strPkCols = GS.templateWithQuerystring(element.getAttribute('pk') || 'id');
                strSeqCols = GS.templateWithQuerystring(element.getAttribute('seq') || '');
                strInsertData = (strColumns + '\n' + strInsertRecord);
                strResponseColumns = (strPkCols + (strPkCols ? '\t' : '') + strColumns);

                GS.requestInsertFromSocket(
                    getSocket(element),
                    strSchema,
                    strObject,
                    strResponseColumns,
                    strPkCols,
                    strSeqCols,
                    strInsertData,
                    // beginCallback
                    function () {},

                    // confirmCallback
                    function (data, error, ignore, commitFunction, rollbackFunction) { //transactionID
                        if (data !== 'TRANSACTION COMPLETED') {
                            if (!error) {
                                strResponse = data;
                                //commitFunction();
                            } else {
                                GS.webSocketErrorDialog(data);
                                rollbackFunction();
                            }
                        } else {
                            commitFunction();
                        }
                    },

                    // finalCallback
                    function (strType) { //, data, error
                        var arrColumns;
                        var arrCells;
                        var jsnRow = {};
                        var col_i;
                        var col_len;

                        if (strType === 'COMMIT') {
                            arrColumns = strResponseColumns.split('\t');
                            arrCells = (strResponse || '').split('\n')[0].split('\t');

                            if (arrColumns.length !== arrCells.length) {
                                throw 'gs-insert Error: Insert API call isn\'t returning correctly. (' + arrColumns.join(',') + ') -> (' + arrCells.join(',') + ')';
                            }

                            col_i = 0;
                            col_len = arrColumns.length;
                            while (col_i < col_len) {
                                jsnRow[GS.decodeFromTabDelimited(arrColumns[col_i])] = GS.decodeFromTabDelimited(arrCells[col_i]);
                                col_i += 1;
                            }

                            GS.triggerEvent(element, 'after_insert');
                            GS.triggerEvent(element, 'onafter_insert');
                            if (element.hasAttribute('onafter_insert')) {
                                new Function(element.getAttribute('onafter_insert')).apply(element);
                            }

                            if (typeof callback === 'function') {
                                callback(GS.decodeFromTabDelimited(arrCells[0]), jsnRow);
                            }
                        }
                    }
                );
            }
        }
    });
});