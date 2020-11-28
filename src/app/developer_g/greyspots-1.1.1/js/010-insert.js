//global GS, ml, xtag, window, document, registerDesignSnippet, designRegisterElement, addProp, encodeHTML, setOrRemoveTextAttribute, addFlexContainerProps, addFlexProps
//jslint this
window.addEventListener('design-register-element', function () {
    "use strict";
    registerDesignSnippet('<gs-insert>', '<gs-insert>', 'gs-insert src="${1:test.tpeople}">\n    ${2}\n</gs-insert>');
    designRegisterElement('gs-insert', '/env/app/developer_g/greyspots-' + GS.version() + '/documentation/index.html#record_insert');

    window.designElementProperty_GSINSERT = function (selectedElement) {
        addProp(
            'Source&nbsp;Query',
            true,
            '<gs-memo rows="1" autoresize class="target" value="' + encodeHTML(selectedElement.getAttribute('src') || selectedElement.getAttribute('source') || '') + '" mini></gs-memo>',
            function () {
                return setOrRemoveTextAttribute(selectedElement, 'src', this.value);
            }
        );

        addProp('Additional&nbsp;Values', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('addin') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'addin', this.value);
        });

        // TITLE attribute
        addProp('Title', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('title') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'title', this.value);
        });

        addProp('Primary Keys', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('pk') || '') + '" mini></gs-text>',
                function () {
            return setOrRemoveTextAttribute(selectedElement, 'pk', this.value);
        });

        addProp('Sequences', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('seq') || '') + '" mini></gs-text>',
                function () {
            return setOrRemoveTextAttribute(selectedElement, 'seq', this.value);
        });

        addProp('Before Select', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('onbefore_select') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'onbefore_select', this.value);
        });

        addProp('After Select', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('onafter_select') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'onafter_select', this.value);
        });

        addProp('Before Insert', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('onbefore_insert') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'onbefore_insert', this.value);
        });

        addProp('After Insert', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('onafter_insert') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'onafter_insert', this.value);
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

        addProp(
            'Visibility',
            true,
            (
                '<gs-select class="target" value="' + strVisibilityAttribute + '" mini>' +
                    '<option value="">Visible</option>' +
                    '<option value="hidden">Invisible</option>' +
                    '<option value="hide-on-desktop">Invisible at desktop size</option>' +
                    '<option value="hide-on-tablet">Invisible at tablet size</option>' +
                    '<option value="hide-on-phone">Invisible at phone size</option>' +
                    '<option value="show-on-desktop">Visible at desktop size</option>' +
                    '<option value="show-on-tablet">Visible at tablet size</option>' +
                    '<option value="show-on-phone">Visible at phone size</option>' +
                '</gs-select>'
            ),
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

        addFlexContainerProps(selectedElement);
        addFlexProps(selectedElement);
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
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
                    GS.envSocket,
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