//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps, addDataEvents, addDataAttributes
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    'use strict';
    addSnippet(
        '<gs-datasheet>',
        '<gs-datasheet>',
        (
            'gs-datasheet src="${1:test.tpeople}">\n' +
            '    <template for="hud"></template>\n' +
            '    <template for="table">\n' +
            '        <table>\n' +
            '            <tbody>\n' +
            '                <tr>\n' +
            '                    <th heading="#">' +
            '<gs-static column="row_number"></gs-static>' +
            '</th>\n' +
            '                    <td heading="">$0</td>\n' +
            '                </tr>\n' +
            '            </tbody>\n' +
            '        </table>\n' +
            '    </template>\n' +
            '    <template for="insert"></template>\n' +
            '</gs-datasheet>'
        )
    );

    addElement('gs-datasheet', '#record_datasheet');

    window.designElementProperty_GSDATASHEET = function () {
        addDataAttributes('select,insert,update,delete,parent-child');
        addDataEvents('select,insert,update,delete');
        addText('V', 'Reflow At', 'reflow-at');
        addText('V', 'Scroll To Bottom', 'scroll-to-bottom');
        addText('V', 'HUD Paginate', 'no-hudpaginate');
        addText('V', 'HUD Refresh', 'no-hudrefresh');
        addText('V', 'HUD Delete', 'no-huddelete');
        addText('V', 'Expand&nbsp;To&nbsp;Content', 'expand-to-content');
        addText('D', 'Null String', 'null-string');
        addText('V', 'Filter Popup', 'no-filter');
        addText('O', 'Column In QS', 'qs');
        addText('O', 'Refresh On QS Columns', 'refresh-on-querystring-values');
        addText('O', 'Refresh On QS Change', 'refresh-on-querystring-change');
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    var KEY_RETURN = 13;
    var KEY_TAB = 9;
    var KEY_BACKSPACE = 8;
    var KEY_DELETE = 46;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;
    var KEY_LEFT = 37;

    function deleteSelection(element) {
        var strSchema = GS.templateWithQuerystring(element.getAttribute('schema'));
        var strObject = GS.templateWithQuerystring(element.getAttribute('object'));
        var arrSelectRecords = element.selectedRecords;
        var deleteRecord;
        var deleteRecordData;
        var arrPk;
        var arrLock;
        var strHashColumns;
        var strRoles;
        var strColumns;
        var strRecord;
        var strRecordToHash;
        var strDeleteData;
        var strTemp;
        var i;
        var len;
        var col_i;
        var col_len;

        // if the first record is the header: remove it from the selection
        if (arrSelectRecords[0] && arrSelectRecords[0].parentNode.nodeName === 'THEAD') {
            arrSelectRecords.splice(0, 1);
        }

        if (
            element.numberOfSelections === 1 &&
            arrSelectRecords.length > 0 &&
            arrSelectRecords[0].children[0].hasAttribute('selected') &&
            !element.deleteButton.hasAttribute('disabled')
        ) {
            GS.triggerEvent(element, 'before_delete');
            GS.triggerEvent(element, 'onbefore_delete');
            if (element.hasAttribute('onbefore_delete')) {
                new Function(element.getAttribute('onbefore_delete')).apply(element);
            }

            // generate the information to send to the websocket
            arrPk = (element.getAttribute('pk') || '').split(/[\s]*,[\s]*/);
            arrLock = (element.getAttribute('lock') || '').split(/[\s]*,[\s]*/);

            i = 0;
            len = arrPk.length;
            strRoles = '';
            strColumns = '';
            while (i < len) {
                strRoles += (
                    (
                        strRoles
                            ? '\t'
                            : ''
                    ) + 'pk'
                );
                strColumns += (
                    (
                        strColumns
                            ? '\t'
                            : ''
                    ) + arrPk[i]
                );
                i += 1;
            }

            i = 0;
            len = arrLock.length;
            strHashColumns = '';
            while (i < len) {
                strHashColumns += (
                    (
                        strHashColumns
                            ? '\t'
                            : ''
                    ) + arrLock[i]
                );
                i += 1;
            }

            strRoles += (
                (
                    strRoles
                        ? '\t'
                        : ''
                ) + 'hash'
            );
            strColumns += (
                (
                    strColumns
                        ? '\t'
                        : ''
                ) + 'hash'
            );

            i = 0;
            len = arrSelectRecords.length;
            strDeleteData = '';
            while (i < len) {
                strRecord = '';
                deleteRecord = arrSelectRecords[i];
                deleteRecordData = element.internalData.arrRecords[parseInt(deleteRecord.getAttribute('data-index'), 10)];

                // get 'pk' columns
                col_i = 0;
                col_len = arrPk.length;
                while (col_i < col_len) {
                    strRecord += (
                        strRecord
                            ? '\t'
                            : ''
                    );
                    strRecord += GS.encodeForTabDelimited(deleteRecordData[element.internalData.arrColumnNames.indexOf(arrPk[col_i])], element.nullString);
                    col_i += 1;
                }

                // get 'hash' columns
                strRecordToHash = '';
                col_i = 0;
                col_len = arrLock.length;
                while (col_i < col_len) {
                    strRecordToHash += (
                        strRecordToHash
                            ? '\t'
                            : ''
                    );
                    strTemp = deleteRecordData[element.internalData.arrColumnNames.indexOf(arrLock[col_i])];

                    // I believe that this needs to use the null-string instead of 'NULL'
                    strRecordToHash += (
                        strTemp === 'NULL'
                            ? ''
                            : strTemp
                    );
                    col_i += 1;
                }

                strDeleteData += (
                    strRecord +
                    (
                        strRecord
                            ? '\t'
                            : ''
                    ) +
                    GS.utfSafeMD5(strRecordToHash).toString() + '\n'
                );
                arrSelectRecords[i].classList.add('bg-red');
                i += 1;
            }

            strDeleteData = (strRoles + '\n' + strColumns + '\n' + strDeleteData);

            // create delete transaction
            GS.addLoader(element, 'Creating Delete Transaction...');
            GS.requestDeleteFromSocket(
                getSocket(element),
                strSchema,
                strObject,
                strHashColumns,
                strDeleteData,
                function (data, error) {//, transactionID
                    if (error) {
                        getData(element);
                        GS.removeLoader(element);
                        GS.webSocketErrorDialog(data);
                    }
                },
                function (data, error, ignore, commitFunction, rollbackFunction) {//transactionID
                    var arrElements;
                    //var i;
                    //var len;
                    var templateElement;
                    GS.removeLoader(element);

                    if (!error) {
                        if (data !== 'TRANSACTION COMPLETED') {
                            arrElements = xtag.query(element, '.bg-red');

                            i = 0;
                            len = arrElements.length;
                            while (i < len) {
                                arrElements[i].classList.remove('bg-red');
                                arrElements[i].classList.add('bg-amber');
                                i += 1;
                            }

                        // open confirm message box
                        } else {
                            templateElement = document.createElement('template');
                            templateElement.innerHTML = ml(function () {/*
                                <gs-page>
                                    <gs-header><center><h3>Are you sure...</h3></center></gs-header>
                                    <gs-body padded>
                                        <center>Are you sure you want to delete {{numberofrecords}} records?</center>
                                    </gs-body>
                                    <gs-footer>
                                        <gs-grid>
                                            <gs-block><gs-button dialogclose>No</gs-button></gs-block>
                                            <gs-block><gs-button id="datasheet-focus-me" dialogclose bg-primary tabindex="0">Yes</gs-button></gs-block>
                                        </gs-grid>
                                    </gs-footer>
                                </gs-page>*/
                            }).replace(/\{\{numberofrecords\}\}/gi, xtag.query(element, '.bg-amber').length);

                            GS.openDialog(
                                templateElement,
                                function () {
                                    document.getElementById('datasheet-focus-me').focus();
                                },
                                function (ignore, strAnswer) {//event
                                    if (strAnswer === 'Yes') {
                                        commitFunction();
                                        GS.addLoader(element, 'Commiting Delete Transaction...');
                                    } else {
                                        rollbackFunction();
                                        GS.addLoader(element, 'Rolling Back Delete Transaction...');
                                    }
                                }
                            );
                        }
                    } else {
                        rollbackFunction();
                        getData(element);
                        GS.webSocketErrorDialog(data);
                    }
                },
                // final result callback, because we need to handle the commit/rollback response
                function (strAnswer, data, error) {
                    var arrElements;
                    //var i;
                    //var len;
                    GS.removeLoader(element);

                    if (!error) {
                        if (strAnswer === 'COMMIT') {
                            // remove amber records, because the amber records have now been deleted
                            removeRecords(element, 'bg-amber');

                            // clear internal variables for selection now that the selected records have been deleted,
                            //      because if you try to shift-select to extend the selection and the origin cell has
                            //      been deleted this may cause an error
                            clearSelection(element);

                            // trigger after_delete so that developers can react to a successful delete
                            GS.triggerEvent(element, 'after_delete');
                            GS.triggerEvent(element, 'onafter_delete');
                            if (element.hasAttribute('onafter_delete')) {
                                new Function(element.getAttribute('onafter_delete')).apply(element);
                            }

                        } else {
                            // clear bg-amber class and don't add a green fade
                            clearRecordColor(element, 'bg-amber', false);
                        }

                        // update record selector numbers to reflect current record numbers
                        //      because after you delete records there may be a gap in the numbers and that is not acceptable
                        arrElements = xtag.query(element, 'tbody > tr');

                        i = 0;
                        len = arrElements.length;
                        while (i < len) {
                            if (!arrElements[i].classList.contains('insert-record')) {
                                arrElements[i].children[0].textContent = (i + 1);
                            }
                            i += 1;
                        }

                    // if an error occurred
                    } else {
                        // get new data, because after an error we don't know the current state
                        //      of the data so a re-fetch will help mitigate inaccurate data errors
                        getData(element);

                        // open an error dialog so that the user knows there was an error
                        GS.webSocketErrorDialog(data);
                    }
                }
            );
        }
    }

    function insertDialog(element) {
        var templateElement = document.createElement('template');
        var strAddin;

        // if there is a column attribute on this element: append child column (or column) and
        //      the value to the insert string so that we can have parent-child relationships
        if (element.getAttribute('column') || element.getAttribute('qs')) {
            strAddin = (
                element.getAttribute('child-column') ||
                element.getAttribute('column') ||
                element.getAttribute('qs')
            ) + '=' + element.value;
        }

        templateElement.innerHTML = ml(function () {/*
            <gs-page gs-dynamic>
                <gs-header>
                    <center><h3>Insert</h3></center>
                </gs-header>
                <gs-body padded>
                    <gs-insert id="insert-dialog-content-container" src="{{SRC}}" addin="{{ADDIN}}">{{HTML}}</gs-insert>
                </gs-body>
                <gs-footer>
                    <gs-grid widths="1,1" class="width-2">
                        <gs-block width="1">
                            <gs-button dialogclose>Cancel</gs-button>
                        </gs-block>
                        <gs-block width="1">
                            <gs-button class="dialog-envelope-insert" listen-for-return bg-primary>Ok</gs-button>
                        </gs-block>
                    </gs-grid>
                </gs-footer>
            </gs-page>*/
        })
            .replace('{{HTML}}', element.insertTemplate)
            .replace('{{SRC}}', encodeHTML(element.getAttribute('src')))
            .replace('{{ADDIN}}', encodeHTML(strAddin || ''));

        GS.openDialog(templateElement, function () {
            var dialog = this;

            // if gs-datasheet has sequence attribute: add sequence attribute to gs-insert
            if (element.getAttribute('seq')) {
                document.getElementById('insert-dialog-content-container').setAttribute('seq', element.getAttribute('seq'));
            }

            GS.triggerEvent(element, 'insert_dialog_open');

            xtag.query(dialog, '.dialog-envelope-insert')[0].addEventListener('click', function () {
                var insertContainer = document.getElementById('insert-dialog-content-container');

                GS.triggerEvent(element, 'before_insert');
                GS.triggerEvent(element, 'onbefore_insert');
                if (element.hasAttribute('onbefore_insert')) {
                    new Function(element.getAttribute('onbefore_insert')).apply(element);
                }

                insertContainer.submit(function () { //lastval, jsnRow
                    getData(element);
                    GS.triggerEvent(element, 'after_insert');
                    GS.triggerEvent(element, 'onafter_insert');
                    if (element.hasAttribute('onafter_insert')) {
                        new Function(element.getAttribute('onafter_insert')).apply(element);
                    }
                    GS.closeDialog(dialog, 'Ok');
                });
            });
        });
    }

    function clearSelection(element) {
        element.savedSelection = [];
        element.savedSelectionCopy = [];
        element.dragOrigin = null;
        element.dragCurrentCell = null;
        element.selectionPreviousOrigin = null;
        element.numberOfSelections = 0;
        element.selectedCells = [];
    }

    function templateRecordsForInsert(element, strRecords, strClasses) {
        var arrRecords;
        var arrCells;
        var i;
        var len;
        var cell_i;
        var cell_len;
        var col_len;
        var strHTML;
        var intRowNumberAdd;

        // calculate the number of cells across
        if (element.getAttribute('cols')) {
            col_len = (element.getAttribute('cols') || '').split(/[\s]*,[\s]*/).length;
        }

        arrRecords = strRecords.split('\n');

        // calculate how much to add to the row numbers
        intRowNumberAdd = xtag.query(element, 'tr:not(.bg-red):not(.insert-record)').length - 1;

        i = 1;
        len = arrRecords.length - 1;
        strHTML = '';
        while (i < len) {
            arrCells = arrRecords[i].split('\t');

            strHTML += (
                '<tr ' +
                (
                    strClasses
                        ? ' class="' + strClasses + '"'
                        : ''
                )
            );

            cell_i = 0;
            cell_len = arrCells.length;
            while (cell_i < cell_len) {
                strHTML += (
                    'data-' + element.internalData.arrColumnNames[cell_i] +
                    '="' + encodeHTML(GS.decodeFromTabDelimited(arrCells[cell_i], element.nullString)) + '"'
                );
                cell_i += 1;
            }

            strHTML += '><th>' + (intRowNumberAdd + (i)) + '</th>';

            cell_i = 0;
            cell_len = (col_len || arrCells.length);
            while (cell_i < cell_len) {
                strHTML += (
                    '<td><textarea rows="1" column="' + element.internalData.arrColumnNames[cell_i] + '">' +
                        encodeHTML(GS.decodeFromTabDelimited(arrCells[cell_i], element.nullString) || '') +
                    '</textarea></td>'
                );
                cell_i += 1;
            }

            strHTML += '</tr>';
            i += 1;
        }

        //    strHTML = GS.templateWithEnvelopeData(element.tableTemplate.templateHTML, {
        //                        'arr_column': data.arrColumnNames
        //                      , 'dat': element.internalData.arrRecords
        //              }, intStart, element.internalData.arrRecords.length);
        //    strHTML = GS.templateShowSubTemplates(strHTML, element.tableTemplate);
        //
        //trMaker.children[0].classList.add('insert-record');

        return strHTML;
    }

    function synchronizeHeaderWidths(element) {
        var guideTR;
        var targetTR;
        var arrChildren;
        var i;
        var len;
        var subtractPadding;

        if (element.scrollCaption) {
            element.scrollCaption.style.width = (element.clientWidth) + 'px';
        }
        if (element.headerCaption) {
            element.headerCaption.style.width = (element.clientWidth) + 'px';
        }

        targetTR = element.headerTR;
        if (element.scrollContainer) {
            guideTR = xtag.query(element.scrollContainer, 'tr')[0];

            if (guideTR) {
                arrChildren = xtag.toArray(guideTR.children);
                subtractPadding = 0; //GS.emToPx(element.headerContainer, 0.2);

                if (element.scrollContainer.scrollHeight > element.scrollContainer.clientHeight) {
                    element.headerContainer.classList.add('scroll');
                } else {
                    element.headerContainer.classList.remove('scroll');
                }

                i = 0;
                len = arrChildren.length;
                while (i < len) {
                    targetTR.children[i].style.width = (arrChildren[i].clientWidth - subtractPadding) + 'px';
                    i += 1;
                }
            }
        }
    }
    function synchronizeHeaderScroll(element) {
        if (element.headerContainer && element.scrollContainer) {
            if (element.scrollContainer.scrollTop > 0) {
                element.headerContainer.classList.add('shadow');
            } else {
                element.headerContainer.classList.remove('shadow');
            }
            element.headerContainer.scrollLeft = element.scrollContainer.scrollLeft;
        }
    }

    function handleData(element, data, bolFirstLoad, bolManualRefresh) {
        var strHTML;
        var i;
        var len;
        var cell_i;
        var cell_len;
        var arrRecords;
        var arrCells;
        var disabled;
        var arrColumns;
        var arrElements;
        var tbodyElement;
        var trMaker;
        var intStart;
        var bolHeader;
        var strWidth;
        var numberOffset;

        // calculate the number of cells across
        if (element.getAttribute('cols')) {
            arrColumns = (element.getAttribute('cols') || '').split(/[\s]*,[\s]*/);

            i = 0;
            len = arrColumns.length;
            while (i < len) {
                arrColumns[i] = data.arrColumnNames.indexOf(arrColumns[i]);
                i += 1;
            }
        }

        disabled = element.hasAttribute('disabled') || !element.hasAttribute('pk');

        var strCaption = '';

        if (element.hasAttribute('caption')) {
            strCaption = '<caption><center><h4>' + element.getAttribute('caption') + '</h4></center></caption>';
        }

        // if first callback: table and header
        if (data.intCallback === 0) {
            if (!element.hasAttribute('lock')) {
                element.setAttribute('lock', data.arrColumnNames.join(','));
            }
            if (!element.hasAttribute('cols')) {
                element.setAttribute('cols', data.arrColumnNames.join(','));
            }
            if (disabled) {
                element.deleteButton.setAttribute('disabled', '');
            } else {
                element.deleteButton.removeAttribute('disabled');
            }

            element.internalData = {
                'arrColumnNames': data.arrColumnNames || [],
                'arrColumnTypes': data.arrColumnTypes || [],
                'arrRecords': []
            };

            if (element.headerTemplateRecord) {
                strHTML = GS.templateWithQuerystring(element.headerTemplateRecord);
                element.scrollContainer.innerHTML = '<table role="grid">' + strCaption + '<thead>' + strHTML + '</thead><tbody></tbody></table>';

            } else {
                arrElements = xtag.queryChildren(element.tableTemplateRecord, 'td, th');
                i = 0;
                len = arrElements.length;
                strHTML = '';
                while (i < len) {
                    strHTML += '<th scope="col" role="columnheader">' + encodeHTML(arrElements[i].getAttribute('heading') || '') + '</th>';

                    bolHeader = Boolean(arrElements[i].hasAttribute('heading') || '') || bolHeader;
                    i += 1;
                }
                strHTML = '<tr role="row">' + strHTML + '</tr>';

                if (bolHeader) {
                    element.scrollContainer.innerHTML = '<table role="grid">' + strCaption + '<thead>' + strHTML + '</thead><tbody></tbody></table>';
                } else {
                    element.scrollContainer.innerHTML = '<table role="grid">' + strCaption + '<thead hidden>' + strHTML + '</thead><tbody></tbody></table>';
                }
            }
        }

        // if not last callback: append data to end of table
        if (data.strMessage !== 'TRANSACTION COMPLETED') {
            arrRecords = data.strMessage.split('\n');

            intStart = element.internalData.arrRecords.length;

            i = 0;
            len = arrRecords.length - 1;
            strHTML = '';
            while (i < len) {
                arrCells = arrRecords[i].split('\t');

                cell_i = 0;
                cell_len = arrCells.length;
                while (cell_i < cell_len) {
                    arrCells[cell_i] = GS.decodeFromTabDelimited(arrCells[cell_i], element.nullString);
                    cell_i += 1;
                }

                element.internalData.arrRecords.push(arrCells);
                i += 1;
            }

            if (element.paginated === true && !isNaN(element.getAttribute('offset'))) {
                numberOffset = parseInt(element.getAttribute('offset'), 10);
            } else {
                numberOffset = 0;
            }

            strHTML = GS.templateWithEnvelopeData(
                element.tableTemplate.templateHTML,
                {
                    'arr_column': data.arrColumnNames,
                    'dat': element.internalData.arrRecords
                },
                intStart,
                element.internalData.arrRecords.length,
                numberOffset
            );

            strHTML = GS.templateShowSubTemplates(strHTML, element.tableTemplate);

            trMaker = document.createElement('tbody');
            trMaker.innerHTML = strHTML;
            tbodyElement = xtag.query(element.scrollContainer, 'tbody')[0];

            arrElements = xtag.toArray(trMaker.children);
            i = 0;
            len = arrElements.length;
            while (i < len) {
                tbodyElement.appendChild(arrElements[i]);
                i += 1;
            }
            //xtag.query(element.scrollContainer, 'tbody')[0].innerHTML += strHTML;

        // if last callback: insert record
        } else {
            arrElements = xtag.query(element.scrollContainer, 'tbody tr');

            if (arrElements[0] && arrElements[0].children[0].nodeName === 'TH' && !isNaN(arrElements[0].children[0].textContent)) {
                strWidth = (
                    GS.pxToEm(
                        element.hudContainer,
                        GS.getTextWidth(
                            element.hudContainer,
                            String(element.internalData.arrRecords.length + 1)
                        )
                    ) + 1
                ) + 'em';

                xtag.query(element.scrollContainer, 'thead th')[0].style.width = strWidth;
                xtag.query(element.scrollContainer, 'tbody th')[0].style.width = strWidth;
            }

            if (parseInt((element.getAttribute('limit') || '0'), 10) > arrElements.length) {
                element.pageRightButton.setAttribute('disabled', '');
            } else {
                element.pageRightButton.removeAttribute('disabled');
            }

            //if (element.insertRecordElement) {
            //    trMaker = document.createElement('tbody');
            //    trMaker.innerHTML = element.insertRecordElement.outerHTML;
            //    trMaker.children[0].classList.add('insert-record');
            //    tbodyElement = xtag.query(element.scrollContainer, 'tbody')[0];
            //
            //    //if (tbodyElement.children[0]) {
            //    //    tbodyElement.insertBefore(trMaker.children[0], tbodyElement.children[0]);
            //    //} else {
            //    tbodyElement.appendChild(trMaker.children[0]);
            //    //}
            //}

            arrElements = xtag.query(element.scrollContainer, 'tr');

            if (arrElements[0].parentNode.hasAttribute('hidden')) {
                element.headerContainer.innerHTML = '<table role="grid">' + strCaption + '<thead hidden>' + arrElements[0].outerHTML + '</thead></table>';
            } else {
                element.headerContainer.innerHTML = '<table role="grid">' + strCaption + '<thead>' + arrElements[0].outerHTML + '</thead></table>';
            }

            element.headerTR = xtag.query(element.headerContainer, 'thead')[0].children[0];
            element.scrollCaption = xtag.query(element.scrollContainer, 'caption')[0];
            element.headerCaption = xtag.query(element.headerContainer, 'caption')[0];

            refreshReflow(element);
            refreshHeight(element);
            synchronize(element, undefined, true, bolManualRefresh);
            synchronizeHeaderWidths(element);
            synchronizeHeaderScroll(element);

            if (bolFirstLoad && element.hasAttribute('scroll-to-bottom')) {
                element.scrollContainer.scrollTop = element.scrollContainer.scrollHeight;
            }

            GS.triggerEvent(element, 'after_select');
        }
    }

    // get return column list
    function getReturn(element) {
        var arrColumns = [];
        var arrSupplementalColumns = [];
        var arrColsAttr;
        var strColumns;
        var arrPK;
        var arrLock;
        var i;
        var len;

        // pk
        arrPK = (element.getAttribute('pk') || '').split(/[\s]*,[\s]*/);
        i = 0;
        len = arrPK.length;
        while (i < len) {
            if (arrPK[i]) {
                GS.listAdd(arrSupplementalColumns, arrPK[i]);
            }
            i += 1;
        }

        // lock
        arrLock = (element.getAttribute('lock') || '').split(/[\s]*,[\s]*/);
        i = 0;
        len = arrLock.length;
        while (i < len) {
            if (arrLock[i]) {
                GS.listAdd(arrSupplementalColumns, arrLock[i]);
            }
            i += 1;
        }

        if (element.internalData && element.internalData.arrColumnNames) {
            i = 0;
            len = element.internalData.arrColumnNames.length;
            while (i < len) {
                GS.listAdd(arrColumns, element.internalData.arrColumnNames[i]);
                i += 1;
            }
        } else if (element.getAttribute('cols')) {
            arrColsAttr = element.getAttribute('cols').split(/[\s]*,[\s]*/);
            i = 0;
            len = arrColsAttr.length;
            while (i < len) {
                GS.listAdd(arrColumns, arrColsAttr[i]);
                i += 1;
            }
        }

        if (arrColumns.length === 0 || (arrColumns.length === 1 && arrColumns[0] === '*')) {
            strColumns = '*';

        } else {
            i = 0;
            len = arrSupplementalColumns.length;
            while (i < len) {
                GS.listAdd(arrColumns, arrSupplementalColumns[i]);
                i += 1;
            }

            strColumns = arrColumns.join('\t');
        }

        return strColumns;
    }

    function valueListToHTML(element, valueText, fieldDelimiter, recordDelimiter, ignore, quoteCharacter, decodeFunction) { //bolFirstContainsHeadings
        var i = 0;
        var len = valueText.length;
        var col_i;
        var col_len;
        var arrRecords = [];
        var arrRecord = [];
        var bolInQuote = false;
        var strCell = '';
        var strRecord;
        var strHTML = '';
        var strPreviousChar;

        // if there is a recordDelimiter at the beginning: add 1 to "i" to skip over it
        if (valueText[0] === recordDelimiter) {
            i += 1;
        }

        // make sure there is a recordDelimiter at the end
        if (valueText[len - 1] !== recordDelimiter) {
            valueText += recordDelimiter;
            len = valueText.length;
        }

        // looper
        while (i < len) {
            if (
                valueText[i] === quoteCharacter &&
                bolInQuote === false &&
                (
                    strPreviousChar === fieldDelimiter ||
                    strPreviousChar === recordDelimiter ||
                    strPreviousChar === undefined
                )
            ) {
                bolInQuote = true;

            } else if (valueText[i] === quoteCharacter && bolInQuote === true) {
                bolInQuote = false;

            } else if (valueText[i] === fieldDelimiter && bolInQuote === false) {
                arrRecord.push(decodeFunction(strCell, element.nullString));
                strCell = '';

            } else if (valueText[i] === recordDelimiter && bolInQuote === false) {
                arrRecord.push(decodeFunction(strCell, element.nullString));
                strCell = '';

                arrRecords.push(arrRecord);
                arrRecord = [];

            } else {
                strCell += valueText[i];
            }

            strPreviousChar = valueText[i];
            i += 1;
        }

        // data structure to html
        i = 0;
        len = arrRecords.length;
        while (i < len) {
            strRecord = '';
            col_i = 0;
            col_len = arrRecords[i].length;
            while (col_i < col_len) {
                strRecord += '<td>' + encodeHTML(arrRecords[i][col_i]) + '</td>';
                col_i += 1;
            }
            strHTML += '<tr>' + strRecord + '</tr>';
            i += 1;
        }

        return '<table>' + strHTML + '</table>';
    }

    /*function quoteIdent(strValue) {
        strValue = strValue || '';

        // if first char is not a lowercase letter or there is a character that is not a lowercase letter, underscore or number
        if (!(/[a-z]/).test(strValue[0]) || (/[^a-z_]/).test(strValue)) {
            strValue = '"' + strValue.replace(/\"/gim, '""') + '"';
        }

        return strValue;
    }*/

    /* // disfated's answer at: http://stackoverflow.com/questions/202605/repeat-string-javascript
    function stringRepeat(pattern, count) {
        if (count < 1) {
            return '';
        }
        var result = '';
        while (count > 1) {
            if (count & 1) result += pattern;
            count >>= 1, pattern += pattern;
        }
        return result + pattern;
    }*/
    function stringRepeat(pattern, count) {
        var result = '';

        count += 1;
        while (count > 1) {
            result += pattern;
            count -= 1;
        }

        return result;
    }

    function getSocket(element) {
        if (element.getAttribute('socket')) {
            return GS[element.getAttribute('socket')];
        }
        return GS.envSocket;
    }

    function getData(element, refocusSelector, refocusSelection, bolFirstLoad, bolManualRefresh) {
        GS.triggerEvent(element, 'before_select');
        GS.triggerEvent(element, 'onbefore_select');
        if (element.hasAttribute('onbefore_select')) {
            new Function(element.getAttribute('onbefore_select')).apply(element);
        }

        var strSchema = GS.templateWithQuerystring(element.getAttribute('schema') || '');
        var strObject = GS.templateWithQuerystring(element.getAttribute('object') || '');
        var strReturn = getReturn(element) || '';
        var strWhere = GS.templateWithQuerystring(element.getAttribute('where') || '1=1');
        var strOrd = GS.templateWithQuerystring(element.getAttribute('ord') || '');
        var strLimit = GS.templateWithQuerystring(element.getAttribute('limit') || '');
        var strOffset = GS.templateWithQuerystring(element.getAttribute('offset') || '0');
        var strWhereColumn;

        // add in user where, if any
        if (element.getAttribute('user-where')) {
            strWhere = (
                '(' + element.getAttribute('user-where') + ')' +
                (
                    strWhere
                        ? ' AND ' + strWhere
                        : ''
                )
            );
        }

        // add in a column or qs where, if any

        // if there is a column attribute on element element: combine the where attribute with a where generated by value
        if ((element.getAttribute('column') || element.getAttribute('qs')) && element.value) {
            strWhereColumn = element.getAttribute('child-column') || element.getAttribute('column') || element.getAttribute('qs');

            if (isNaN(element.value)) {
                strWhere = (
                    'CAST(' + strWhereColumn + ' AS ' + GS.database.type.text + ') = ' +
                    'CAST($WhereQUOTE$' + (element.value) + '$WhereQUOTE$ AS ' + GS.database.type.text + ')' +
                    (
                        strWhere !== ''
                            ? ' AND (' + strWhere + ')'
                            : ''
                    )
                );
            } else {
                strWhere = (
                    strWhereColumn + '=' + (element.value) +
                    (
                        strWhere !== ''
                            ? ' AND (' + strWhere + ')'
                            : ''
                    )
                );
            }
        }

        // disabled, hide or not the pageinate buttons
        if (strLimit === '') {
            element.pageLeftButton.setAttribute('hidden', '');
            element.pageRightButton.setAttribute('hidden', '');
        } else if (strOffset === '' || strOffset === '0') {
            element.pageLeftButton.setAttribute('disabled', '');
        }

        GS.addLoader(element, 'Loading...');
        GS.requestSelectFromSocket(
            getSocket(element),
            strSchema,
            strObject,
            strReturn,
            strWhere,
            strOrd,
            strLimit,
            strOffset,
            function (data, error) {
                var refocusElement;

                if (!error) {
                    handleData(element, data, bolFirstLoad, bolManualRefresh);

                    if (data.strMessage === 'TRANSACTION COMPLETED') {
                        GS.removeLoader(element);
                        GS.triggerEvent(element, 'after_select');
                        GS.triggerEvent(element, 'onafter_select');
                        if (element.hasAttribute('onafter_select')) {
                            new Function(element.getAttribute('onafter_select')).apply(element);
                        }
                    }

                    if (data.strMessage === 'TRANSACTION COMPLETED' && refocusSelector) {
                        refocusElement = xtag.query(element, refocusSelector)[0];

                        if (refocusElement) {
                            refocusElement.focus();

                            if (refocusSelection) {
                                GS.setInputSelection(refocusElement, refocusSelection.start, refocusSelection.end);
                            }
                        }
                    }

                } else {
                    GS.removeLoader(element);
                    if (!element.scrollContainer.innerHTML) {
                        element.scrollContainer.innerHTML = '<' + 'center><h2>Couldn\'t Load Data.</h2></' + 'center>';
                    }
                    GS.webSocketErrorDialog(data);
                }
            }
        );
    }


    function getSelectedCopyHTML(element) {
        var strHTMLCopyString;
        var intFromRecord;
        var intToRecord;
        var intFromCell = 9999999;
        var intToCell = 0;
        var i;
        var len;
        var cell_i;
        var cell_len;
        var arrSelected;
        var strCellHTML;
        var arrRecords;
        var arrCells;
        var strHTMLRecordString;

        arrSelected = element.selectedCells;

        // loop through the selected cells and create an html string using the text of the cell
        if (arrSelected.length > 0) {
            intFromRecord = arrSelected[0].parentNode.rowIndex;
            intToRecord = arrSelected[arrSelected.length - 1].parentNode.rowIndex + 1;

            i = 0;
            len = arrSelected.length;
            while (i < len) {
                if (arrSelected[i].cellIndex < intFromCell) {
                    intFromCell = arrSelected[i].cellIndex;
                    intFromCell = (
                        intFromCell === 0
                            ? 1
                            : intFromCell
                    );
                }
                if (arrSelected[i].cellIndex + 1 > intToCell) {
                    intToCell = arrSelected[i].cellIndex + 1;
                }
                i += 1;
            }

            arrRecords = xtag.query(element, 'tr');
            strHTMLCopyString = '';

            i = intFromRecord;
            len = intToRecord;
            while (i < len) {
                arrCells = arrRecords[i].children;
                strHTMLRecordString = '';

                if (!arrRecords[i].classList.contains('insert-record')) {
                    cell_i = intFromCell;
                    cell_len = intToCell;
                    while (cell_i < cell_len) {
                        strCellHTML = '';

                        if (arrCells[cell_i].hasAttribute('selected')) {
                            if (arrCells[cell_i].lastElementChild) {
                                strCellHTML = (
                                    arrCells[cell_i].lastElementChild.textValue ||
                                    arrCells[cell_i].lastElementChild.value ||
                                    (arrCells[cell_i].lastElementChild.checked || '').toString()
                                );
                            } else {
                                strCellHTML = arrCells[cell_i].textContent.trim();
                            }

                            strCellHTML = encodeHTML(strCellHTML).replace(/\n/gim, '<br />');
                        }

                        strCellHTML = '<' + 'td rowspan="1" colspan="1">' + (strCellHTML || '') + '</td>';

                        strHTMLRecordString += (
                            cell_i === intFromCell
                                ? '<' + 'tr>'
                                : ''
                        );
                        strHTMLRecordString += (strCellHTML || '');
                        strHTMLRecordString += (
                            cell_i === (intToCell - 1)
                                ? '<' + '/tr>'
                                : ''
                        );
                        cell_i += 1;
                    }
                }
                if (strHTMLRecordString.trim()) {
                    strHTMLCopyString += strHTMLRecordString;
                }
                i += 1;
            }

            if (strHTMLCopyString) {
                strHTMLCopyString = (
                    '<' + 'style>' +
                        'br { mso-data-placement:same-cell; } ' +
                        'th, td { white-space: pre-wrap; }' +
                    '<' + '/style>' +
                    '<' + 'table border="0" cellpadding="0" cellspacing="0">' + strHTMLCopyString + '<' + '/table>'
                );
            }
        }

        return strHTMLCopyString || '';
    }

    function getSelectedCopyText(element) {
        var strTextCopyString;
        var intFromRecord;
        var intToRecord;
        var intFromCell = 9999999;
        var intToCell = 0;
        var i;
        var len;
        var cell_i;
        var cell_len;
        var arrSelected;
        var strCellText;
        var arrRecords;
        var arrCells;
        var strTextRecordString;

        arrSelected = element.selectedCells;

        // loop through the selected cells and create a tsv string using the text of the cell
        if (arrSelected.length > 0) {
            intFromRecord = arrSelected[0].parentNode.rowIndex;
            intToRecord = arrSelected[arrSelected.length - 1].parentNode.rowIndex + 1;

            i = 0;
            len = arrSelected.length;
            while (i < len) {
                if (arrSelected[i].cellIndex < intFromCell) {
                    intFromCell = arrSelected[i].cellIndex;
                    intFromCell = (
                        intFromCell === 0
                            ? 1
                            : intFromCell
                    );
                }
                if (arrSelected[i].cellIndex + 1 > intToCell) {
                    intToCell = arrSelected[i].cellIndex + 1;
                }
                i += 1;
            }

            arrRecords = xtag.query(element, 'tr');
            strTextCopyString = '';

            i = intFromRecord;
            len = intToRecord;
            while (i < len) {
                arrCells = arrRecords[i].children;
                strTextRecordString = '';

                cell_i = intFromCell;
                cell_len = intToCell;
                while (cell_i < cell_len) {
                    if (!arrCells[cell_i].parentNode.classList.contains('insert-record')) {
                        strCellText = '';

                        if (arrCells[cell_i].hasAttribute('selected')) {
                            if (arrCells[cell_i].lastElementChild) {
                                strCellText = (
                                    arrCells[cell_i].lastElementChild.textValue ||
                                    arrCells[cell_i].lastElementChild.value ||
                                    (arrCells[cell_i].lastElementChild.checked || '').toString()
                                );
                            } else {
                                strCellText = arrCells[cell_i].textContent.trim();
                            }

                            strCellText = strCellText.replace(/\"/gim, '""');
                        }

                        strTextRecordString += (
                            cell_i !== intFromCell
                                ? '\t'
                                : ''
                        );
                        strTextRecordString += (strCellText || '');
                    }
                    cell_i += 1;
                }
                //if (strTextRecordString.trim()) {
                strTextCopyString += strTextRecordString;
                //}
                if (i + 1 !== len) { //&& strTextRecordString.trim()
                    strTextCopyString += '\n';
                }
                i += 1;
            }
        }

        return strTextCopyString || '';
    }

    function handleClipboardData(event, strCopyString, strType) {
        var clipboardData = event.clipboardData || window.clipboardData;
        var strMime;

        if (!clipboardData) {
            return;
        }
        if (!clipboardData.setData) {
            return;
        }

        if (strType === 'text') {
            if (window.clipboardData && window.clipboardData.getData) { // IE
                strMime = 'Text';
            } else if (event.clipboardData && event.clipboardData.getData) {
                strMime = 'text/plain';
            }

        } else if (strType === 'html') {
            if (window.clipboardData && window.clipboardData.getData) { // IE
                strMime = '';
            } else if (event.clipboardData && event.clipboardData.getData) {
                strMime = 'text/html';
            }

        } else {
            throw 'handleClipboardData Error: Type "' + strType + '" not recognized, recognized types are "text" and "html".';
        }

        if (strMime) {
            if (strCopyString && strMime) {
                return clipboardData.setData(strMime, strCopyString) !== false;
            } else {
                return clipboardData.getData(strMime);
            }
        }
    }


    function synchronize(element, bolScroll, bolOnLoad, bolManualRefresh) {
        var arrRecords = xtag.query(element, 'tr');
        var selectCells = [];
        var i;
        var len;
        var arrParts;
        var focusedElement;
        var recordIndex;
        var cellIndex;

        // selection
        if (element.savedSelection) {
            // loop through savedSelection
            i = 0;
            len = element.savedSelection.length;
            while (i < len) {
                // any cell position that is in saved selection gets added to the selectCells
                arrParts = element.savedSelection[i].split(',');
                recordIndex = parseInt(arrParts[0], 10);
                cellIndex = parseInt(arrParts[1], 10);

                if (recordIndex < arrRecords.length && cellIndex < arrRecords[0].children.length) {
                    selectCells.push(arrRecords[recordIndex].children[cellIndex]);
                }
                i += 1;
            }

            // select cells
            element.selectedCells = selectCells;
        }

        // focus
        if (element.lastFocusedControl) {
            element.lastFocusedControl.focus();
            focusedElement = element.lastFocusedControl;
        } else if (!bolOnLoad || bolManualRefresh) {
            focusedElement = element.copyControl;
            element.copyControl.focus();
        }

        // if there was no control to focus and
        //      there is a selection and
        //      bolScroll is true: scroll to selected
        if (!element.lastFocusedControl && element.selectedCells.length > 0 && bolScroll) {
            GS.scrollIntoView(element.selectedCells[0].parentNode);
        }

        // if there was a control and bolScroll is true: scroll to focused record
        if (focusedElement && bolScroll) {
            GS.scrollIntoView(GS.findParentElement(document.activeElement, 'tr'));
        }

        if (focusedElement && element.lastTextSelection) {
            GS.setInputSelection(focusedElement, element.lastTextSelection.start, element.lastTextSelection.end);
        }
    }

    function selectHandler(element, dragOriginCell, dragCurrentCell, dragMode) {
        var arrRecords = xtag.query(element, 'tr');
        var dragOriginRecord = dragOriginCell.parentNode;
        var dragCurrentRecord = dragCurrentCell.parentNode;
        var intStartRecordIndex;
        var intStartCellIndex;
        var intEndRecordIndex;
        var intEndCellIndex;
        var i;
        var len;
        var col_i;
        var col_len;
        var selectionIndex;

        // if origin & currentCell are both the top-left cell and the cell is a heading: select all cells
        if (
            dragOriginRecord.rowIndex === 0 &&
            dragCurrentRecord.rowIndex === 0 &&
            dragOriginCell.cellIndex === 0 &&
            dragCurrentCell.cellIndex === 0
        ) {
            intStartRecordIndex = 0;
            intStartCellIndex = 0;
            intEndRecordIndex = arrRecords.length - 1;
            intEndCellIndex = arrRecords[0].children.length - 1;

        // else if origin is a first th: select the records from origin to currentCell
        } else if (dragOriginCell.cellIndex === 0) {
            intStartRecordIndex = Math.min(dragOriginRecord.rowIndex, dragCurrentRecord.rowIndex);
            intStartCellIndex = 0;
            intEndRecordIndex = Math.max(dragOriginRecord.rowIndex, dragCurrentRecord.rowIndex);
            intEndCellIndex = arrRecords[0].children.length - 1;

        // else if origin is a heading: select the columns from origin to currentCell
        } else if (dragOriginRecord.rowIndex === 0) {
            intStartRecordIndex = 0;
            intStartCellIndex = Math.min(dragOriginCell.cellIndex, dragCurrentCell.cellIndex);
            intEndRecordIndex = arrRecords.length - 1;
            intEndCellIndex = Math.max(dragOriginCell.cellIndex, dragCurrentCell.cellIndex);

        // else select cells from origin to currentCell
        } else {
            intStartRecordIndex = Math.min(dragOriginRecord.rowIndex, dragCurrentRecord.rowIndex);
            intStartCellIndex = Math.min(dragOriginCell.cellIndex, dragCurrentCell.cellIndex);
            intEndRecordIndex = Math.max(dragOriginRecord.rowIndex, dragCurrentRecord.rowIndex);
            intEndCellIndex = Math.max(dragOriginCell.cellIndex, dragCurrentCell.cellIndex);
        }

        element.savedSelection = element.savedSelectionCopy.slice(0);

        if (dragMode === 'select') {
            i = intStartRecordIndex;
            len = intEndRecordIndex + 1;
            while (i < len) {
                col_i = intStartCellIndex;
                col_len = intEndCellIndex + 1;
                while (col_i < col_len) {
                    if (element.savedSelection.indexOf(i + ',' + col_i) === -1) {
                        element.savedSelection.push(i + ',' + col_i);
                    }
                    col_i += 1;
                }
                i += 1;
            }

        } else { // implied if: dragMode === 'deselect'
            i = intStartRecordIndex;
            len = intEndRecordIndex + 1;
            while (i < len) {
                col_i = intStartCellIndex;
                col_len = intEndCellIndex + 1;
                while (col_i < col_len) {
                    selectionIndex = element.savedSelection.indexOf(i + ',' + col_i);

                    if (selectionIndex > -1) {
                        element.savedSelection.splice(selectionIndex, 1);
                    }
                    col_i += 1;
                }
                i += 1;
            }
        }

        synchronize(element);
    }

    function clearRecordColor(element, strClass, bolGreenFade) {
        var arrElements = xtag.query(element, 'tr.' + strClass);
        var i;
        var len;

        if (bolGreenFade) {
            i = 0;
            len = arrElements.length;
            while (i < len) {
                arrElements[i].classList.remove(strClass);
                arrElements[i].classList.add('bg-green-fade');
                i += 1;
            }

            setTimeout(function () {
                i = 0;
                len = arrElements.length;
                while (i < len) {
                    arrElements[i].classList.remove('bg-green-fade');
                    i += 1;
                }
            }, 1000);

        } else {
            i = 0;
            len = arrElements.length;
            while (i < len) {
                arrElements[i].classList.remove(strClass);
                i += 1;
            }
        }
    }

    function removeRecords(element, strClass) {
        var arrElements = xtag.query(element, 'tr.' + strClass);
        var i;
        var len;

        i = 0;
        len = arrElements.length;
        while (i < len) {
            arrElements[i].parentNode.removeChild(arrElements[i]);
            i += 1;
        }
    }

    function insertRecords(element, strColumns, strInsertData, strLocalData, bolDialog) {
        var strSchema = GS.templateWithQuerystring(element.getAttribute('schema'));
        var strObject = GS.templateWithQuerystring(element.getAttribute('object'));
        var templateElement;
        var strSeq;
        var arrSeq;
        var strPk;
        var arrPk;
        var strColumn;
        var arrColumns;
        var i;
        var len;
        var tbodyElement;
        var arrElements;
        var insertRecord;

        arrSeq = (GS.templateWithQuerystring(element.getAttribute('seq') || '')).split(/[\s]*,[\s]*/);
        arrPk = (GS.templateWithQuerystring(element.getAttribute('pk') || '')).split(/[\s]*,[\s]*/);

        arrColumns = strColumns.split('\t');
        i = 0;
        len = arrColumns.length;
        while (i < len) {
            strColumn = GS.decodeFromTabDelimited(arrColumns[i], element.nullString);

            if (arrSeq.indexOf(strColumn) > -1) {
                arrSeq[arrSeq.indexOf(strColumn)] = '';
            }
            i += 1;
        }

        // template local record data
        tbodyElement = document.createElement('tbody');
        tbodyElement.innerHTML = templateRecordsForInsert(element, strColumns + '\n' + strLocalData, 'bg-red');

        // add local records to the table before the insert record
        arrElements = xtag.toArray(tbodyElement.children);
        insertRecord = xtag.query(element, 'tr.insert-record')[0];

        i = 0;
        len = arrElements.length;
        while (i < len) {
            insertRecord.parentNode.insertBefore(arrElements[i], insertRecord);
            i += 1;
        }

        // scroll all the way down
        element.scrollContainer.scrollTop = element.scrollContainer.scrollHeight;

        // get pk and sequence values
        strPk = '';
        i = 0;
        len = arrPk.length;
        while (i < len) {
            strPk += (
                (
                    strPk
                        ? '\t'
                        : ''
                ) +
                GS.encodeForTabDelimited(arrPk[i], element.nullString)
            );
            i += 1;
        }

        strSeq = '';
        i = 0;
        len = arrSeq.length;
        while (i < len) {
            if (arrColumns.indexOf(arrPk[i]) > -1) {
                strSeq += (
                    i === 0
                        ? ''
                        : '\t'
                );
            } else {
                strSeq += (
                    (
                        i === 0
                            ? ''
                            : '\t'
                    ) +
                    GS.encodeForTabDelimited(arrSeq[i], element.nullString)
                );
            }
            i += 1;
        }

        strInsertData = strColumns + '\n' + strInsertData;

        GS.triggerEvent(element, 'before_insert');
        GS.triggerEvent(element, 'onbefore_insert');
        if (element.hasAttribute('onbefore_insert')) {
            new Function(element.getAttribute('onbefore_insert')).apply(element);
        }

        GS.addLoader(element, 'Creating Insert Transaction...');
        GS.requestInsertFromSocket(
            getSocket(element),
            strSchema,
            strObject,
            getReturn(element),
            strPk,
            strSeq,
            strInsertData,
            function (data, error) {
                if (error) {
                    removeRecords(element, 'bg-red');
                    GS.removeLoader(element);
                    GS.webSocketErrorDialog(data);
                }
            },
            function (data, error, ignore, commitFunction, rollbackFunction) { //transactionID
                //var tbodyElement;
                //var arrElements;
                var arrReplaceElements;
                //var i;
                //var len;
                //var templateElement;

                GS.removeLoader(element);

                if (!error) {
                    if (data !== 'TRANSACTION COMPLETED') {
                        data = getReturn(element) + '\n' + data;

                        // replace red records with amber records
                        tbodyElement = document.createElement('tbody');
                        tbodyElement.innerHTML = templateRecordsForInsert(element, data, 'bg-amber');
                        arrElements = xtag.toArray(tbodyElement.children);
                        arrReplaceElements = xtag.query(element, 'tr.bg-red');

                        i = 0;
                        len = arrElements.length;
                        while (i < len) {
                            arrReplaceElements[i].parentNode.replaceChild(arrElements[i], arrReplaceElements[i]);
                            i += 1;
                        }

                    // open confirm message box
                    } else {
                        if (bolDialog) {
                            templateElement = document.createElement('template');
                            templateElement.innerHTML = ml(function () {/*
                                <gs-page>
                                    <gs-header><center><h3>Are you sure...</h3></center></gs-header>
                                    <gs-body padded>
                                        <center>Are you sure you want create {{numberofrecords}} records?</center>
                                    </gs-body>
                                    <gs-footer>
                                        <gs-grid>
                                            <gs-block><gs-button dialogclose>No</gs-button></gs-block>
                                            <gs-block><gs-button id="datasheet-focus-me" dialogclose bg-primary tabindex="0">Yes</gs-button></gs-block>
                                        </gs-grid>
                                    </gs-footer>
                                </gs-page>*/
                            }).replace(/\{\{numberofrecords\}\}/gi, xtag.query(element, '.bg-amber').length);

                            GS.openDialog(
                                templateElement,
                                function () {
                                    document.getElementById('datasheet-focus-me').focus();
                                },
                                function (ignore, strAnswer) { //event
                                    if (strAnswer === 'Yes') {
                                        commitFunction();
                                        GS.addLoader(element, 'Commiting Insert...');
                                    } else {
                                        rollbackFunction();
                                        GS.addLoader(element, 'Rolling Back Insert...');
                                    }
                                }
                            );
                        } else {
                            commitFunction();
                        }
                    }
                } else {
                    removeRecords(element, 'bg-red');
                    rollbackFunction();
                    GS.webSocketErrorDialog(data);
                }
            },
            function (strAnswer, data, error) {
                GS.removeLoader(element);

                if (!error) {
                    if (strAnswer === 'COMMIT') {
                        clearRecordColor(element, 'bg-amber', true);
                        GS.triggerEvent(element, 'after_insert');
                        GS.triggerEvent(element, 'onafter_insert');
                        if (element.hasAttribute('onafter_insert')) {
                            new Function(element.getAttribute('onafter_insert')).apply(element);
                        }
                    } else {
                        removeRecords(element, 'bg-amber');
                    }
                } else {
                    removeRecords(element, 'bg-red');
                    GS.webSocketErrorDialog(data);
                }
            }
        );
    }


    function refreshRecordsAfterUpdate(element, arrRecordsToUpdate, data) {
        var arrColumns;
        var arrRecords;
        var arrValues;
        var i;
        var len;
        var record_i;
        var record_len;
        var col_i;
        var col_len;
        var controlElement;

        // if last character is a \n: remove it
        if (data[data.length - 1] === '\n') {
            data = data.substring(0, data.length - 1);
        }

        // split records
        arrRecords = data.split('\n');

        // seperate first record (for column names)
        arrColumns = arrRecords[0].split('\t');
        arrRecords.splice(0, 1);

        // loop through each record
        len = arrRecordsToUpdate.length;
        record_len = arrRecords.length;
        i = 0;
        record_i = 0;
        while (i < len && record_i < record_len) {
            if (arrRecordsToUpdate[i].classList.contains('bg-red') && arrRecords[record_i]) {
                arrRecordsToUpdate[i].classList.remove('bg-red');
                arrRecordsToUpdate[i].classList.add('bg-amber');

                // build json row
                arrValues = arrRecords[record_i].split('\t');
                col_i = 0;
                col_len = arrValues.length;
                while (col_i < col_len) {
                    arrRecordsToUpdate[i].setAttribute('data-' + arrColumns[col_i], GS.decodeFromTabDelimited(arrValues[col_i], element.nullString));

                    controlElement = xtag.query(arrRecordsToUpdate[i], '[column="' + arrColumns[col_i] + '"]')[0];
                    if (controlElement) {
                        controlElement.value = GS.decodeFromTabDelimited(arrValues[col_i], element.nullString);
                    }
                    col_i += 1;
                }
                record_i += 1;
            }
            i += 1;
        }
    }

    function updateRecords(element, strHashColumns, strUpdateData, arrUpdateRecords, bolDialog) {
        GS.triggerEvent(element, 'before_update');
        GS.triggerEvent(element, 'onbefore_update');
        if (element.hasAttribute('onbefore_update')) {
            new Function(element.getAttribute('onbefore_update')).apply(element);
        }

        var strSchema = GS.templateWithQuerystring(element.getAttribute('schema'));
        var strObject = GS.templateWithQuerystring(element.getAttribute('object'));
        var templateElement;
        var i;
        var len;
        var refreshData;

        i = 0;
        len = arrUpdateRecords.length;
        while (i < len) {
            arrUpdateRecords[i].classList.add('bg-red');
            i += 1;
        }

        element.saveState = 'saving';
        if (element.saveTimeout) {
            clearTimeout(element.saveTimeout);
        }

        element.saveTimeout = setTimeout(function () {
            if (element.saveState !== 'saved' && xtag.query(element, '.saving-warning-parent').length === 0) {
                element.saveState = 'error';
                var parentElement = document.createElement('center');
                parentElement.setAttribute('class', 'saving-warning-parent');

                var warningElement = document.createElement('div');
                warningElement.setAttribute('class', 'saving-warning');

                warningElement.innerHTML = 'YOUR CHANGES ARE NOT SAVED<br />WE HAVEN\'T HEARD BACK FROM THE SERVER<br />EITHER THE SAVING IS SLOW OR THERE\'S AN ERROR';

                parentElement.appendChild(warningElement);
                element.insertBefore(parentElement, element.children[0]);

                // element.appendChild(parentElement);
                /*
                warningElement.addEventListener('click', function () {
                    saveFile(element, strPath, changeStamp, strContent, callbackSuccess, callbackFail);
                });
                */
            }
        }, /*30*/ 5 * 1000);

        // create transaction
        GS.addLoader(element, 'Creating Update Transaction...');
        GS.requestUpdateFromSocket(
            getSocket(element),
            strSchema,
            strObject,
            getReturn(element),
            strHashColumns,
            strUpdateData,
            function (data, error) {//, transactionID
                if (error) {
                    if (element.saveTimeout) {
                        clearTimeout(element.saveTimeout);
                    }
                    element.saveState = 'error';
                    if (xtag.query(element, '.saving-warning-parent').length > 0) {
                        element.removeChild(xtag.query(element, '.saving-warning-parent')[0]);
                    }

                    getData(element);
                    GS.removeLoader(element);
                    GS.webSocketErrorDialog(data);
                }
            },
            function (data, error, ignore, commitFunction, rollbackFunction) { //transactionID
                GS.removeLoader(element);
                if (!error) {
                    if (data !== 'TRANSACTION COMPLETED') {
                        refreshData = data;
                        data = getReturn(element) + '\n' + data;

                        // make the records amber and refresh their data
                        refreshRecordsAfterUpdate(element, arrUpdateRecords, data);

                    // open confirm message box
                    } else {
                        if (element.saveTimeout) {
                            clearTimeout(element.saveTimeout);
                        }
                        element.saveState = 'saved';
                        if (xtag.query(element, '.saving-warning-parent').length > 0) {
                            element.removeChild(xtag.query(element, '.saving-warning-parent')[0]);
                        }

                        if (bolDialog) {
                            templateElement = document.createElement('template');
                            templateElement.innerHTML = ml(function () {/*
                                <gs-page>
                                    <gs-header><center><h3>Are you sure...</h3></center></gs-header>
                                    <gs-body padded>
                                        <center>Are you sure you want to update {{numberofrecords}} records?</center>
                                    </gs-body>
                                    <gs-footer>
                                        <gs-grid>
                                            <gs-block><gs-button dialogclose>No</gs-button></gs-block>
                                            <gs-block><gs-button id="datasheet-focus-me" dialogclose bg-primary tabindex="0">Yes</gs-button></gs-block>
                                        </gs-grid>
                                    </gs-footer>
                                </gs-page>*/
                            }).replace(/\{\{numberofrecords\}\}/gi, xtag.query(element, '.bg-amber').length);

                            GS.openDialog(
                                templateElement,
                                function () {
                                    document.getElementById('datasheet-focus-me').focus();
                                },
                                function (ignore, strAnswer) { //event
                                    if (strAnswer === 'Yes') {
                                        commitFunction();
                                        GS.addLoader(element, 'Commiting Update...');
                                    } else {
                                        rollbackFunction();
                                        GS.addLoader(element, 'Rolling Back Update...');
                                    }
                                }
                            );
                        } else {
                            commitFunction();
                        }
                    }

                } else {
                    if (element.saveTimeout) {
                        clearTimeout(element.saveTimeout);
                    }
                    element.saveState = 'error';
                    if (xtag.query(element, '.saving-warning-parent').length > 0) {
                        element.removeChild(xtag.query(element, '.saving-warning-parent')[0]);
                    }

                    rollbackFunction();
                    getData(element);
                    GS.webSocketErrorDialog(data);
                }
            },
            function (strAnswer, data, error) {
                var arrRecords;
                var arrCells;
                var recordIndex;
                //var i;
                //var len;
                var col_i;
                var col_len;

                GS.removeLoader(element);

                if (!error) {
                    if (strAnswer === 'COMMIT') {
                        if (element.saveTimeout) {
                            clearTimeout(element.saveTimeout);
                        }
                        element.saveState = 'saved';
                        if (xtag.query(element, '.saving-warning-parent').length > 0) {
                            element.removeChild(xtag.query(element, '.saving-warning-parent')[0]);
                        }

                        clearRecordColor(element, 'bg-amber', true);

                        // refresh internal data
                        arrRecords = refreshData.split('\n');

                        i = 0;
                        len = arrUpdateRecords.length;
                        while (i < len) {
                            arrCells = arrRecords[i].split('\t');
                            recordIndex = parseInt(arrUpdateRecords[i].getAttribute('data-index'), 10);

                            col_i = 0;
                            col_len = arrCells.length;
                            while (col_i < col_len) {
                                element.internalData.arrRecords[recordIndex][col_i] = GS.decodeFromTabDelimited(arrCells[col_i], element.nullString);
                                col_i += 1;
                            }
                            i += 1;
                        }
                        GS.triggerEvent(element, 'after_update');
                        GS.triggerEvent(element, 'onafter_update');
                        if (element.hasAttribute('onafter_update')) {
                            new Function(element.getAttribute('onafter_update')).apply(element);
                        }

                    } else {
                        getData(element);
                    }
                } else {
                    if (element.saveTimeout) {
                        clearTimeout(element.saveTimeout);
                    }
                    element.saveState = 'error';
                    if (xtag.query(element, '.saving-warning-parent').length > 0) {
                        element.removeChild(xtag.query(element, '.saving-warning-parent')[0]);
                    }

                    getData(element);
                    GS.webSocketErrorDialog(data);
                }
            }
        );
    }

    function pasteHandler(element, event) {
        var clipboardData = (event.clipboardData || window.clipboardData);
        var templateElement = document.createElement('template');
        var pasteHTML;
        var pastePlain;
        var arrPasteRecords;
        var arrSelectRecords;
        var arrSetColumns;
        var strColumn;
        var strColumns;
        var i;
        var len;
        var col_i;
        var col_len;
        var cell;
        var arrPk;
        var arrLock;
        var strRecord;
        var strInsertData;
        var strLocalData;
        var strLeftPad;
        var strRightPad;
        var strTemp;
        var strRecordToHash;
        var strHashColumns;
        var strRoles;
        var strUpdateData;
        var arrUpdateRecords;
        var arrUpdateColumns;
        var updateRecord;
        var updateRecordData;
        var pasteElement;

        if (window.clipboardData) {
            pastePlain = clipboardData.getData('Text');
        } else {
            pasteHTML = clipboardData.getData('text/html');
            pastePlain = clipboardData.getData('Text');
        }

        // if no html: build HTML using plain
        if (!pasteHTML || (pasteHTML.indexOf('<' + 'table') === -1 && pasteHTML.indexOf('<' + 'tr') === -1)) {
            pasteHTML = valueListToHTML(element, pastePlain, '\t', '\n', false, '"', GS.decodeFromTabDelimited);
        }

        //console.log('HTML:', pasteHTML);
        //console.log('PLAIN:', pastePlain);

        // put HTML into a template element for traversal
        templateElement.innerHTML = pasteHTML;

        arrPasteRecords = xtag.query(xtag.query(templateElement.content, 'table')[0], 'tr');
        arrSelectRecords = element.selectedRecords;

        // if the first record is the header: remove it from the selection
        if (arrSelectRecords[0] && arrSelectRecords[0].parentNode.nodeName === 'THEAD') {
            arrSelectRecords.splice(0, 1);
        }

        if (element.numberOfSelections === 1) {
            arrSetColumns = xtag.query(arrSelectRecords[0], 'td[selected]');

            // if the selection starts on the insert record
            if (arrSelectRecords[0].classList.contains('insert-record')) {
                strColumns = '';
                i = 0;
                len = Math.min(arrSetColumns.length, arrPasteRecords[0].children.length);
                while (i < len) {
                    strColumn = arrSetColumns[i].children[0].getAttribute('column');
                    strColumns += (
                        (
                            strColumns
                                ? '\t'
                                : ''
                        ) +
                        strColumn
                    );
                    i += 1;
                }

                // extract data from paste HTML
                strLeftPad = stringRepeat('\t', arrSetColumns[0].cellIndex - 1);
                strRightPad = stringRepeat('\t', (element.internalData.arrColumnNames.length - ((arrSetColumns[0].cellIndex - 1) + arrSetColumns.length)));

                i = 0;
                len = arrPasteRecords.length;
                strInsertData = '';
                strLocalData = '';
                while (i < len) {
                    col_i = 0;
                    col_len = arrSetColumns.length;
                    strRecord = '';
                    while (col_i < col_len) {
                        cell = arrPasteRecords[i].children[col_i];
                        strRecord += (
                            (
                                strRecord
                                    ? '\t'
                                    : ''
                            ) +
                            GS.encodeForTabDelimited(cell.innerText || cell.textContent, element.nullString)
                        );
                        col_i += 1;
                    }

                    strInsertData += strRecord + '\n';
                    strLocalData += strLeftPad + strRecord + strRightPad + '\n';
                    i += 1;
                }

                insertRecords(element, strColumns, strInsertData, strLocalData, (arrPasteRecords.length > 1));

            // else (if the selection starts on an update record)
            } else {
                // if the last record is the insert: remove it from the selection
                if (arrSelectRecords[arrSelectRecords.length - 1].parentNode.nodeName === 'THEAD') {
                    arrSelectRecords.pop();
                }

                arrPk = (GS.templateWithQuerystring(element.getAttribute('pk') || '')).split(/[\s]*,[\s]*/);
                arrLock = (GS.templateWithQuerystring(element.getAttribute('lock') || '')).split(/[\s]*,[\s]*/);

                // gathering update headers
                strRoles = '';
                strColumns = '';
                i = 0;
                len = arrPk.length;
                while (i < len) {
                    strRoles += (
                        strRoles
                            ? '\t'
                            : ''
                    ) + 'pk';
                    strColumns += (
                        strColumns
                            ? '\t'
                            : ''
                    ) + arrPk[i];
                    i += 1;
                }

                i = 0;
                len = arrLock.length;
                strHashColumns = '';
                while (i < len) {
                    strHashColumns += (
                        strHashColumns
                            ? '\t'
                            : ''
                    ) + arrLock[i];
                    i += 1;
                }
                strRoles += (
                    strRoles
                        ? '\t'
                        : ''
                ) + 'hash';
                strColumns += (
                    strColumns
                        ? '\t'
                        : ''
                ) + 'hash';

                arrUpdateColumns = [];
                i = 0;
                len = Math.min(arrSetColumns.length, arrPasteRecords[0].children.length);
                while (i < len) {
                    pasteElement = xtag.query(arrSetColumns[i], '[column]')[0];//arrSetColumns[i].children[0];

                    if (pasteElement) {
                        strColumn = pasteElement.getAttribute('column');

                        strRoles += (
                            strRoles
                                ? '\t'
                                : ''
                        ) + 'set';
                        strColumns += (
                            strColumns
                                ? '\t'
                                : ''
                        ) + strColumn;

                        arrUpdateColumns.push(strColumn);
                    }
                    i += 1;
                }

                arrUpdateRecords = [];
                strUpdateData = '';
                i = 0;
                len = Math.min(arrSelectRecords.length, arrPasteRecords.length);
                while (i < len) {
                    strRecord = '';
                    updateRecord = arrSelectRecords[i];
                    updateRecordData = element.internalData.arrRecords[parseInt(updateRecord.getAttribute('data-index'), 10)];

                    // get 'pk' columns
                    col_i = 0;
                    col_len = arrPk.length;
                    while (col_i < col_len) {
                        strRecord += (strRecord ? '\t' : '');
                        strRecord += GS.encodeForTabDelimited(updateRecordData[element.internalData.arrColumnNames.indexOf(arrPk[col_i])], element.nullString);
                        col_i += 1;
                    }

                    // get 'hash' columns
                    strRecordToHash = '';
                    col_i = 0;
                    col_len = arrLock.length;
                    while (col_i < col_len) {
                        strRecordToHash += (
                            strRecordToHash
                                ? '\t'
                                : ''
                        );
                        strTemp = updateRecordData[element.internalData.arrColumnNames.indexOf(arrLock[col_i])];
                        strRecordToHash += (
                            strTemp === 'NULL'
                                ? ''
                                : strTemp
                        );
                        col_i += 1;
                    }

                    strRecord += (
                        strRecord
                            ? '\t'
                            : ''
                    ) + GS.utfSafeMD5(strRecordToHash).toString();

                    // get 'set' columns
                    col_i = 0;
                    col_len = arrSetColumns.length;
                    while (col_i < col_len) {
                        pasteElement = xtag.query(arrSetColumns[col_i], '[column]')[0];

                        if (pasteElement) {
                            cell = arrPasteRecords[i].children[col_i];
                            strRecord += (
                                strRecord
                                    ? '\t'
                                    : ''
                            ) + GS.encodeForTabDelimited(cell.innerText || cell.textContent, element.nullString);
                        }
                        col_i += 1;
                    }

                    strUpdateData += strRecord + '\n';
                    arrUpdateRecords.push(arrSelectRecords[i]);
                    i += 1;
                }

                strUpdateData = (strRoles + '\n' + strColumns + '\n' + strUpdateData);
                updateRecords(element, strHashColumns, strUpdateData, arrUpdateRecords, (arrPasteRecords.length > 1));
            }
        }
    }

    function refreshHeight(element) {
        var intHeight;

        if (
            element.hasAttribute('expand-to-content') &&
            element.hudContainer &&
            element.scrollContainer &&
            element.scrollContainer.children[0]
        ) {
            element.style.height = '';

            intHeight = (
                element.hudContainer.scrollHeight +
                element.scrollContainer.children[0].scrollHeight
            );

            element.style.height = intHeight + 'px';
            element.style.height = (intHeight + (element.scrollContainer.scrollHeight - element.scrollContainer.clientHeight)) + 'px';
        }
    }

    function refreshReflow(element) {
        var strReflowAt = GS.templateWithQuerystring(element.getAttribute('reflow-at') || '');
        var intReflowAt;
        var intElementWidth;

        if (strReflowAt) {
            intElementWidth = element.offsetWidth;
            intReflowAt = parseInt(strReflowAt, 10);

            if (intElementWidth < intReflowAt) {
                element.dataContainer.classList.add('grid-reflow');
            } else {
                element.dataContainer.classList.remove('grid-reflow');
            }
        } else {
            element.dataContainer.classList.remove('grid-reflow');
        }
    }


    // clean the slate and set initial html
    function prepareElement(element) {
        var tableTemplateElement;
        var HUDTemplateElement;
        var strHTML;
        var recordElement;
        var insertTemplateElement;
        var arrParts;
        var headerRecordElement;
        var i;
        var len;
        var arrElements;
        var arrHeaderElements;
        var tempTemplateElement;

        // default pk and lock
        if (!element.hasAttribute('pk')) {
            element.setAttribute('pk', 'id');
        }
        if (!element.hasAttribute('lock')) {
            element.setAttribute('lock', 'change_stamp');
        }

        // harvest the templates, error if problems
        tableTemplateElement = xtag.query(element, 'template[for="table"]')[0];
        HUDTemplateElement = xtag.query(element, 'template[for="hud"]')[0];
        insertTemplateElement = xtag.query(element, 'template[for="insert"]')[0];

        if (
            HUDTemplateElement &&
            (
                HUDTemplateElement.innerHTML.indexOf('&gt;') > -1 ||
                HUDTemplateElement.innerHTML.indexOf('&lt;') > -1
            )
        ) {
            console.warn('GS-DATASHEET WARNING: &gt; or &lt; detected in HUD template, this can have undesired effects on doT.js. Please use gt(x,y), gte(x,y), lt(x,y), or lte(x,y) to silence this warning.');
        }
        if (
            tableTemplateElement &&
            (
                tableTemplateElement.innerHTML.indexOf('&gt;') > -1 ||
                tableTemplateElement.innerHTML.indexOf('&lt;') > -1
            )
        ) {
            console.warn('GS-DATASHEET WARNING: &gt; or &lt; detected in table template, this can have undesired effects on doT.js. Please use gt(x,y), gte(x,y), lt(x,y), or lte(x,y) to silence this warning.');
        }
        if (
            insertTemplateElement &&
            (
                insertTemplateElement.innerHTML.indexOf('&gt;') > -1 ||
                insertTemplateElement.innerHTML.indexOf('&lt;') > -1
            )
        ) {
            console.warn('GS-DATASHEET WARNING: &gt; or &lt; detected in insert template, this can have undesired effects on doT.js. Please use gt(x,y), gte(x,y), lt(x,y), or lte(x,y) to silence this warning.');
        }

        if (!tableTemplateElement || tableTemplateElement.nodeName !== 'TEMPLATE') {
            throw 'gs-datasheet error: No table template provided.';
        }

        // V----- cannot do .children on template.content
        //if (tableTemplateElement.content.children[0].nodeName !== 'TABLE') {
        //    throw 'gs-datasheet error: Table is not the first element in the provided table template.';
        //}

        // make header template
        headerRecordElement = xtag.query(tableTemplateElement.content, 'thead tr')[0];
        if (headerRecordElement) {

            arrHeaderElements = xtag.query(headerRecordElement, 'td, th');
            arrElements = xtag.query(tableTemplateElement.content, 'tbody td, tbody th');

            headerRecordElement.setAttribute('role', 'row');

            i = 0;
            len = arrHeaderElements.length;
            while (i < len) {
                arrHeaderElements[i].setAttribute('role', 'columnheader');
                arrHeaderElements[i].setAttribute('scope', 'col');
                i += 1;
            }

            i = 0;
            len = arrHeaderElements.length;
            while (i < len) {
                if (!arrElements[i].hasAttribute('role')) {
                    if (i === 0) {
                        arrElements[i].setAttribute('role', 'rowheader');
                        arrElements[i].setAttribute('scope', 'row');
                    } else {
                        arrElements[i].setAttribute('role', 'gridcell');
                    }
                }
                if (!arrElements[i].hasAttribute('heading')) {
                    arrElements[i].setAttribute('heading', arrHeaderElements[i].textContent);
                }
                i += 1;
            }

            element.headerTemplateRecord = headerRecordElement.outerHTML;
        }

        // make table template
        recordElement = xtag.query(tableTemplateElement.content, 'tbody tr')[0];
        recordElement.setAttribute('role', 'row');
        recordElement.setAttribute('data-index', '{{= i }}');


        var arrCells = xtag.toArray(recordElement.children);

        i = 0;
        len = arrCells.length;
        while (i < len) {
            if (!arrCells[i].hasAttribute('role')) {
                if (i === 0) {
                    arrCells[i].setAttribute('role', 'rowheader');
                    arrCells[i].setAttribute('scope', 'row');
                } else {
                    arrCells[i].setAttribute('role', 'gridcell');
                }
            }
            i += 1;
        }


        strHTML = GS.templateColumnToValue(tableTemplateElement.innerHTML);
        tempTemplateElement = document.createElement('template');
        tempTemplateElement.innerHTML = strHTML;
        recordElement = xtag.query(tempTemplateElement.content, 'tbody tr')[0];



        element.tableTemplate = GS.templateHideSubTemplates(recordElement.outerHTML, true);
        element.tableTemplateRecord = recordElement;

        if (insertTemplateElement && insertTemplateElement.innerHTML) {
            element.insertTemplate = insertTemplateElement.innerHTML;
        }

        // split schema and object
        arrParts = GS.templateWithQuerystring(element.getAttribute('src')).split('.');

        element.setAttribute('schema', arrParts[0]);
        element.setAttribute('object', arrParts[1]);

        // replace element inner html and create element variables
        strHTML = ml(function () {/*
            <div class="root" flex-vertical flex-fill>
                <div class="hud-container">
                    <gs-button icon="refresh" aria-label="Refresh Data." remove-right icononly no-focus title="Refresh Data." class="refresh-button"></gs-button>
                    <gs-button icon="times" aria-label="Delete Selected Records." remove-left icononly no-focus title="Delete Selected Records." class="delete-button"></gs-button>

                    <gs-button icon="plus" aria-label="Create Record." icononly no-focus title="Create Record." class="insert-button"></gs-button>

                    <gs-button icon="backward" aria-label="Go to previous page." remove-right icononly no-focus title="Go to previous page." class="paginate-left"></gs-button>
                    <gs-button icon="forward" aria-label="Go to next page." remove-left icononly no-focus title="Go to next page." class="paginate-right"></gs-button>

                    {{HUDHTML}}

                    <gs-button icon="filter" icononly no-focus title="Edit Filters." class="filter-button" hidden></gs-button>
                    <textarea title="Hidden control" class="hidden-focus-control">Focus Control</textarea>
                </div>
                <div class="data-container" flex>
                    <div class="data-flex-reset">
                        <div class="scroll-container"></div>
                        <div class="header-container"></div>
                        <div class="insert-container"></div>
                    </div>
                </div>
            </div>*/
        });

        if (HUDTemplateElement) {
            strHTML = strHTML.replace(/\{\{HUDHTML\}\}/gi, HUDTemplateElement.innerHTML);
        } else {
            strHTML = strHTML.replace(/\{\{HUDHTML\}\}/gi, '');
        }

        element.innerHTML = strHTML;

        element.root = element.children[0];

        element.hudContainer = element.root.children[0];
        element.dataContainer = element.root.children[1];

        element.dataFlexReset = element.dataContainer.children[0];

        element.scrollContainer = element.dataFlexReset.children[0];
        element.headerContainer = element.dataFlexReset.children[1];
        element.insertContainer = element.dataFlexReset.children[2];

        element.refreshButton = xtag.queryChildren(element.hudContainer, '.refresh-button')[0];
        element.deleteButton = xtag.queryChildren(element.hudContainer, '.delete-button')[0];
        element.insertButton = xtag.queryChildren(element.hudContainer, '.insert-button')[0];
        element.pageLeftButton = xtag.queryChildren(element.hudContainer, '.paginate-left')[0];
        element.pageRightButton = xtag.queryChildren(element.hudContainer, '.paginate-right')[0];
        element.copyControl = xtag.queryChildren(element.hudContainer, '.hidden-focus-control')[0];
        element.filterButton = xtag.queryChildren(element.hudContainer, '.filter-button')[0];

        if (element.hasAttribute('no-huddelete') && element.hasAttribute('no-hudrefresh')) {
            element.hudContainer.removeChild(element.refreshButton);//.setAttribute('hidden', '');
            element.hudContainer.removeChild(element.deleteButton);//.setAttribute('hidden', '');

        } else if (element.hasAttribute('no-huddelete')) {
            element.hudContainer.removeChild(element.deleteButton);//.setAttribute('hidden', '');
            element.refreshButton.removeAttribute('remove-right');

        } else if (element.hasAttribute('no-hudrefresh')) {
            element.hudContainer.removeChild(element.refreshButton);//.setAttribute('hidden', '');
            element.deleteButton.removeAttribute('remove-left');
        }

        if (element.hasAttribute('no-hudpaginate')) {
            element.hudContainer.removeChild(element.pageLeftButton);//.setAttribute('hidden', '');
            element.hudContainer.removeChild(element.pageRightButton);//.setAttribute('hidden', '');
        }

        if (!element.insertTemplate) {
            element.insertButton.setAttribute('hidden', '');
        }
    }

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
        var arrPopKeys;
        var currentValue;
        var bolRefresh;
        var strOperator;

        if (strQSCol) {
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
        }

        // handle "refresh-on-querystring-values" and "refresh-on-querystring-change" attributes
        if (element.internal.bolQSFirstRun === true) {
            if (element.hasAttribute('refresh-on-querystring-values')) {
                arrPopKeys = element.getAttribute('refresh-on-querystring-values').split(/\s*,\s*/gim);

                i = 0;
                len = arrPopKeys.length;
                while (i < len) {
                    currentValue = GS.qryGetVal(strQS, arrPopKeys[i]);

                    if (element.popValues[arrPopKeys[i]] !== currentValue) {
                        bolRefresh = true;
                    }

                    element.popValues[arrPopKeys[i]] = currentValue;
                    i += 1;
                }
            } else if (element.hasAttribute('refresh-on-querystring-change')) {
                bolRefresh = true;
            }

            if (bolRefresh && element.hasAttribute('src')) {
                getData(element);
            } else if (bolRefresh && !element.hasAttribute('src')) {
                console.warn('gs-combo Warning: element has "refresh-on-querystring-values" or "refresh-on-querystring-change", but no "src".', element);
            }
        } else {
            if (element.hasAttribute('refresh-on-querystring-values')) {
                arrPopKeys = element.getAttribute('refresh-on-querystring-values').split(/\s*,\s*/gim);

                i = 0;
                len = arrPopKeys.length;
                while (i < len) {
                    element.popValues[arrPopKeys[i]] = GS.qryGetVal(strQS, arrPopKeys[i]);
                    i += 1;
                }
            }
        }

        element.internal.bolQSFirstRun = true;
    }


    // bind delegating events
    function bindElement(element) {
        // handle "qs" attribute
        if (
            element.getAttribute('qs') ||
            element.getAttribute('refresh-on-querystring-values') ||
            element.hasAttribute('refresh-on-querystring-change')
        ) {
            element.popValues = {};
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

        // on focus control: set oldvalue for update
        element.addEventListener('focus', function (event) {
            if (event.target.hasAttribute('column')) {
                event.target.strOldValue = event.target.value;
            }
        }, true);

        if (!evt.touchDevice) {
            // focus copy control
            element.addEventListener('mousedown', function (event) {
                var parentDatasheet = GS.findParentTag(event.target, 'gs-datasheet');

                // we dont want to override the focus if the currently focused
                //      element is inside the gs-datasheet and is capable of being focus
                if (
                    !GS.isElementFocusable(event.target) ||
                    !parentDatasheet ||
                    parentDatasheet.nodeName !== 'GS-DATASHEET'
                ) {
                    element.copyControl.focus();
                }
            });
        }

        // copy
        element.copyControl.addEventListener('copy', function (event) {
            var strTextCopyString;
            var strHTMLCopyString;

            if (
                document.activeElement.classList.contains('hidden-focus-control') ||
                document.activeElement.selectionStart === document.activeElement.selectionEnd
            ) {

                GS.setInputSelection(
                    document.activeElement,
                    document.activeElement.value.length,
                    document.activeElement.value.length
                );

                strTextCopyString = getSelectedCopyText(element);
                strHTMLCopyString = getSelectedCopyHTML(element);

                if (strTextCopyString && strHTMLCopyString) {
                    if (handleClipboardData(event, strTextCopyString, 'text')) {
                        event.preventDefault(event);
                    }
                    if (handleClipboardData(event, strHTMLCopyString, 'html')) {
                        event.preventDefault(event);
                    }
                }

                GS.setInputSelection(document.activeElement, 0, document.activeElement.value.length);
            }
        });

        // focus
        window.addEventListener('focus', function () {//element
            if (GS.findParentTag(document.activeElement, 'gs-datasheet') === element) {
                element.lastFocusedControl = document.activeElement;
            } else {
                element.lastFocusedControl = null;
            }
        });//, true

        // paste
        element.addEventListener('paste', function (event) {
            if (document.activeElement === element.copyControl) {
                event.preventDefault();
                pasteHandler(element, event);
            }
        });

        // selection
        if (!evt.touchDevice) {
            element.dragAllowed = false;
            element.numberOfSelections = 0;

            // on mousedown (event delagation style)
            element.addEventListener('mousedown', function (event) {
                var target = GS.findParentElement(event.target, 'th,td');
                var originalTarget = event.target;

                // if target is a cell: begin selection
                if (target && (target.nodeName === 'TH' || target.nodeName === 'TD')) {
                    if (GS.findParentElement(target, 'div').classList.contains('header-container')) {
                        target = xtag.query(element.scrollContainer, 'th, td')[target.cellIndex];
                        originalTarget = target;
                    }

                    // if shift key is down and there is currently a selection to connect to
                    element.dragOrigin = target;
                    if (event.shiftKey && xtag.query(element, '[selected]').length > 0) {
                        element.dragOrigin = element.selectionPreviousOrigin;
                    }

                    // if ctrl and cmd are not down: deselect all cells
                    if (!event.metaKey && !event.ctrlKey) {
                        element.selectedCells = [];
                        element.savedSelection = [];
                        element.numberOfSelections = 0;
                    }

                    element.savedSelectionCopy = element.savedSelection.slice(0);
                    element.dragAllowed = true;
                    element.dragCurrentCell = target;
                    element.numberOfSelections += 1;

                    element.dragMode = 'select';
                    if (target.hasAttribute('selected')) {
                        element.dragMode = 'deselect';
                    }

                    // if the original target is a cell or if the dragOrigin isn't the target cell or
                    //      if there are already selected cells: blur focused element and prevent default
                    if (
                        originalTarget.nodeName === 'TH' ||
                        originalTarget.nodeName === 'TD' ||
                        element.dragOrigin !== target ||
                        element.selectedCells.length > 0
                    ) {
                        element.lastFocusedControl = null;
                        element.copyControl.focus();
                        GS.triggerEvent(element.copyControl, 'focus');
                        event.preventDefault();
                    }

                    selectHandler(element, element.dragOrigin, element.dragCurrentCell, element.dragMode);
                }
            });

            element.addEventListener('mousemove', function (event) {
                var cellFromTarget;

                // if mouse is down
                if (event.which !== 0) {
                    cellFromTarget = GS.findParentElement(event.target, 'th,td');

                    // if selection is allowed at this point and closestCell is different from element.dragCurrentCell
                    if (cellFromTarget && element.dragAllowed && element.dragCurrentCell !== cellFromTarget) {
                        element.lastFocusedControl = null;
                        element.copyControl.focus();
                        GS.triggerEvent(element.copyControl, 'focus');

                        element.dragCurrentCell = cellFromTarget;
                        selectHandler(element, element.dragOrigin, element.dragCurrentCell, element.dragMode);
                        event.preventDefault();
                    }
                } else {
                    element.dragAllowed = false;
                    element.selectionPreviousOrigin = element.dragOrigin;
                }
            });

            element.addEventListener('mouseup', function () {
                if (element.dragAllowed) {
                    if (document.activeElement === element || document.activeElement === document.body) {
                        element.copyControl.focus();
                        GS.triggerEvent(element.copyControl, 'focus');
                    }
                    element.dragAllowed = false;
                    element.selectionPreviousOrigin = element.dragOrigin;
                }
            });
        } else {
            element.dragAllowed = false;
            element.numberOfSelections = 0;

            // on touchdown (event delagation style)
            element.addEventListener('click', function (event) {
                var target = GS.findParentElement(event.target, 'th,td');
                var originalTarget = event.target;

                // if target is a cell: begin selection
                if (target && (target.nodeName === 'TH' || target.nodeName === 'TD')) {
                    if (GS.findParentElement(target, 'div').classList.contains('header-container')) {
                        target = xtag.query(element.scrollContainer, 'th, td')[target.cellIndex];
                        originalTarget = target;
                    }

                    // if shift key is down and there is currently a selection to connect to
                    element.dragOrigin = target;
                    if (event.shiftKey && xtag.query(element, '[selected]').length > 0) {
                        element.dragOrigin = element.selectionPreviousOrigin;
                    }

                    // deselect all cells
                    element.selectedCells = [];
                    element.savedSelection = [];
                    element.numberOfSelections = 0;

                    element.savedSelectionCopy = element.savedSelection.slice(0);
                    element.dragAllowed = true;
                    element.dragCurrentCell = target;
                    element.numberOfSelections += 1;

                    element.dragMode = 'select';
                    if (target.hasAttribute('selected')) {
                        element.dragMode = 'deselect';
                    }

                    // if the original target is a cell or if the dragOrigin isn't the target cell or
                    //      if there are already selected cells: blur focused element and prevent default
                    if (
                        originalTarget.nodeName === 'TH' ||
                        originalTarget.nodeName === 'TD' ||
                        element.dragOrigin !== target ||
                        element.selectedCells.length > 0
                    ) {
                        element.lastFocusedControl = null;
                        element.copyControl.focus();
                        GS.triggerEvent(element.copyControl, 'focus');
                        event.preventDefault();
                    }

                    selectHandler(element, element.dragOrigin, element.dragCurrentCell, element.dragMode);
                }
            });
        }

        if (!element.hasAttribute('no-filter')) {
            // filter edit button
            element.filterButton.addEventListener('click', function () {
                var templateElement = document.createElement('template');

                templateElement.setAttribute('data-max-width', '300px');
                templateElement.setAttribute('data-overlay-close', 'true');

                templateElement.innerHTML = ml(function () {/*
                    <gs-body padded>
                        <label for="memo-datagrid-filters">Filters:</label>
                        <gs-memo id="memo-datagrid-filters" rows="6" no-resize-handle></gs-memo>
                        <br />
                        <gs-grid>
                            <gs-block><gs-button dialogclose remove-right>Cancel</gs-button></gs-block>
                            <gs-block><gs-button dialogclose remove-all style="border-left: 0 none;">Clear Filters</gs-button></gs-block>
                            <gs-block><gs-button dialogclose remove-left style="border-left: 0 none;">Update Filters</gs-button></gs-block>
                        </gs-grid>
                    </gs-body>*/
                });

                GS.openDialogToElement(
                    element.filterButton,
                    templateElement,
                    'down',
                    function () {
                        document.getElementById('memo-datagrid-filters').value = element.getAttribute('user-where').replace(/\sAND\s/gi, '\nAND ');
                    },
                    function (ignore, strAnswer) { //event
                        var strValue = document.getElementById('memo-datagrid-filters').value;

                        if (strAnswer === 'Clear Filters' || (strAnswer === 'Update Filters' && strValue.trim() === '')) {
                            element.removeAttribute('user-where');
                            element.filterButton.setAttribute('hidden', '');
                            getData(element);

                        } else if (strAnswer === 'Update Filters') {
                            element.setAttribute('user-where', strValue);
                            getData(element);
                        }
                    }
                );
            });

            // filter popup
            var cellFloatingButtonFunction = function (targetCell) {
                var jsnElementPosition = GS.getElementPositionData(targetCell);
                var strHTML;

                // targetCell is a th or if targetCell doesn't have a child with the "column" attribute:
                //      remove the floating button if it exists
                if (targetCell.nodeName === 'TH' || xtag.query(targetCell, '[column]').length === 0) {
                    if (element.cellFloatingButtonContainer && element.cellFloatingButtonContainer.parentNode) {
                        element.cellFloatingButtonContainer.parentNode.removeChild(element.cellFloatingButtonContainer);
                        element.cellFloatingButtonContainer = null;
                    }

                // else: add the floating button
                } else {
                    // if no floating button exists for this grid: create/append/bind one
                    if (!element.cellFloatingButtonContainer || !element.cellFloatingButtonContainer.parentNode) {
                        element.cellFloatingButtonContainer = document.createElement('div');
                        element.cellFloatingButtonContainer.classList.add('floating-button-container');

                        element.cellFloatingButtonContainer.innerHTML = (
                            '<gs-button icononly icon="filter" inline bg-primary no-focus></gs-button>'
                        );

                        //element.scrollContainer.appendChild(element.cellFloatingButtonContainer);
                        element.dataFlexReset.appendChild(element.cellFloatingButtonContainer);

                        element.cellFloatingButtonContainer.addEventListener(evt.mousedown, function () {
                            element.cellFloatingButtonContainer.targetControl.bolSubstring = (
                                document.activeElement === element.cellFloatingButtonContainer.targetControl
                            );
                        });

                        element.cellFloatingButtonContainer.addEventListener('click', function () {
                            var targetControl = element.cellFloatingButtonContainer.targetControl;
                            var jsnSelection;
                            var strMatchText = targetControl.value || targetControl.textContent;
                            var templateElement = document.createElement('template');

                            //console.log(targetControl, targetControl.value, strMatchText);

                            if (targetControl.nodeName === 'INPUT' || targetControl.nodeName === 'TEXTAREA') {
                                jsnSelection = GS.getInputSelection(element.cellFloatingButtonContainer.targetControl);
                            }

                            if (targetControl.bolSubstring && jsnSelection && jsnSelection.start !== jsnSelection.end) {
                                strMatchText = strMatchText.substring(jsnSelection.start, jsnSelection.end);
                            }

                            templateElement.setAttribute('data-max-width', '250px');
                            templateElement.setAttribute('data-overlay-close', 'true');

                            strHTML = '<gs-body padded>';

                            if (evt.touchDevice) {
                                strHTML += '<gs-button class="text-left" dialogclose>Select Range</gs-button>';
                                strHTML += '<gs-button class="text-left" dialogclose>Select Records</gs-button><hr />';
                            }

                            strHTML += (
                                '<gs-button class="text-left" dialogclose>Equals "<u>{{VALUE}}</u>"</gs-button>' +
                                '<gs-button class="text-left" dialogclose>Doesn\'t Equal "<u>{{VALUE}}</u>"</gs-button>' +
                                '<gs-button class="text-left" dialogclose>Contains "<u>{{VALUE}}</u>"</gs-button>' +
                                '<gs-button class="text-left" dialogclose>Doesn\'t Contain "<u>{{VALUE}}</u>"</gs-button>' +
                                '<gs-button class="text-left" dialogclose>Starts With "<u>{{VALUE}}</u>"</gs-button>' +
                                '<gs-button class="text-left" dialogclose>Ends With "<u>{{VALUE}}</u>"</gs-button>'
                            );

                            strHTML += '</gs-body>';

                            strHTML = strHTML.replace(/\{\{VALUE\}\}/gim, encodeHTML(strMatchText));

                            templateElement.innerHTML = strHTML;

                            GS.openDialogToElement(element.cellFloatingButtonContainer, templateElement, 'left', '', function (ignore, strAnswer) { //event
                                var clickFunction;
                                var addUserWhere = function (strNewWhere) {
                                    var strWhere = element.getAttribute('user-where');

                                    strWhere = (
                                        strWhere
                                            ? (strWhere + ' AND ' + strNewWhere)
                                            : strNewWhere
                                    );

                                    element.setAttribute('user-where', strWhere);
                                    element.filterButton.removeAttribute('hidden');
                                    getData(element);
                                };
                                var control = element.cellFloatingButtonContainer.targetCell.children[0];

                                if (strAnswer === 'Select Range' || strAnswer === 'Select Records') {
                                    if (strAnswer === 'Select Records') {
                                        element.dragOrigin = element.cellFloatingButtonContainer.targetCell.parentNode.children[0];
                                    } else if (strAnswer === 'Select Range') {
                                        element.dragOrigin = element.cellFloatingButtonContainer.targetCell;
                                    }

                                    element.selectedCells = [];
                                    clickFunction = function (event) {
                                        var target;

                                        if (strAnswer === 'Select Records') {
                                            target = GS.findParentElement(event.target, 'tr');
                                            element.dragCurrentCell = target.children[0];

                                        } else if (strAnswer === 'Select Range') {
                                            target = GS.findParentElement(event.target, 'td,th');
                                            element.dragCurrentCell = target;
                                        }

                                        if (target) {
                                            element.selectionPreviousOrigin = element.dragOrigin;
                                            element.savedSelection = [];
                                            element.savedSelectionCopy = [];
                                            element.numberOfSelections = 1;
                                            element.dragMode = 'select';

                                            selectHandler(element, element.dragOrigin, element.dragCurrentCell, element.dragMode);

                                            document.activeElement.blur();
                                            event.preventDefault();
                                            element.removeEventListener('click', clickFunction, true);
                                        }
                                    };

                                    element.addEventListener('click', clickFunction, true);

                                } else if (strAnswer.indexOf('Equals') === 0) {
                                    addUserWhere(
                                        'CAST(' + control.getAttribute('column') + ' AS ' + GS.database.type.text + ') ' +
                                        '= $$' + strMatchText + '$$'
                                    );

                                } else if (strAnswer.indexOf('Doesn\'t Equal') === 0) {
                                    addUserWhere(
                                        'CAST(' + control.getAttribute('column') + ' AS ' + GS.database.type.text + ') ' +
                                        '!= $$' + strMatchText + '$$'
                                    );

                                } else if (strAnswer.indexOf('Contains') === 0) {
                                    addUserWhere(
                                        'CAST(' + control.getAttribute('column') + ' AS ' + GS.database.type.text + ') ' +
                                        'LIKE $$%' + strMatchText + '%$$'
                                    );

                                } else if (strAnswer.indexOf('Doesn\'t Contain') === 0) {
                                    addUserWhere(
                                        'CAST(' + control.getAttribute('column') + ' AS ' + GS.database.type.text + ') ' +
                                        'NOT LIKE $$%' + strMatchText + '%$$'
                                    );

                                } else if (strAnswer.indexOf('Starts With') === 0) {
                                    addUserWhere(
                                        'CAST(' + control.getAttribute('column') + ' AS ' + GS.database.type.text + ') ' +
                                        'LIKE $$' + strMatchText + '%$$'
                                    );

                                } else if (strAnswer.indexOf('Ends With') === 0) {
                                    addUserWhere(
                                        'CAST(' + control.getAttribute('column') + ' AS ' + GS.database.type.text + ') ' +
                                        'LIKE $$%' + strMatchText + '$$'
                                    );
                                }
                            });
                        });
                    }

                    // hover center next to the cell
                    element.cellFloatingButtonContainer.targetCell = targetCell;
                    element.cellFloatingButtonContainer.targetControl = xtag.query(targetCell, '[column]')[0];
                    element.cellFloatingButtonContainer.children[0].removeAttribute('remove-top-left');
                    element.cellFloatingButtonContainer.children[0].removeAttribute('remove-top-right');
                    element.cellFloatingButtonContainer.children[0].removeAttribute('remove-bottom-left');
                    element.cellFloatingButtonContainer.children[0].removeAttribute('remove-bottom-right');

                    // top left
                    if (
                        jsnElementPosition.intRoomAbove > element.cellFloatingButtonContainer.clientHeight &&
                        jsnElementPosition.intRoomLeft > element.cellFloatingButtonContainer.clientWidth
                    ) {
                        element.cellFloatingButtonContainer.setAttribute(
                            'style',
                            (
                                'left: ' + ((jsnElementPosition.intElementLeft - element.cellFloatingButtonContainer.clientWidth) + 4) + 'px;' +
                                'top: ' + ((jsnElementPosition.intElementTop - element.cellFloatingButtonContainer.clientHeight) + 4) + 'px;'
                            )
                        );

                        element.cellFloatingButtonContainer.children[0].setAttribute('remove-bottom-right', '');

                    // top right
                    } else if (
                        jsnElementPosition.intRoomAbove > element.cellFloatingButtonContainer.clientHeight &&
                        jsnElementPosition.intRoomRight > element.cellFloatingButtonContainer.clientWidth
                    ) {
                        element.cellFloatingButtonContainer.setAttribute(
                            'style',
                            (
                                'left: ' + ((jsnElementPosition.intElementLeft + jsnElementPosition.intElementWidth) - 4) + 'px;' +
                                'top: ' + ((jsnElementPosition.intElementTop - element.cellFloatingButtonContainer.clientHeight) + 4) + 'px;'
                            )
                        );

                        element.cellFloatingButtonContainer.children[0].setAttribute('remove-bottom-left', '');

                    // bottom left
                    } else if (
                        jsnElementPosition.intRoomBelow > element.cellFloatingButtonContainer.clientHeight &&
                        jsnElementPosition.intRoomLeft > element.cellFloatingButtonContainer.clientWidth
                    ) {
                        element.cellFloatingButtonContainer.setAttribute(
                            'style',
                            (
                                'left: ' + ((jsnElementPosition.intElementLeft - element.cellFloatingButtonContainer.clientWidth) + 4) + 'px;' +
                                'top: ' + ((jsnElementPosition.intElementTop + jsnElementPosition.intElementHeight) - 4) + 'px;'
                            )
                        );

                        element.cellFloatingButtonContainer.children[0].setAttribute('remove-top-right', '');

                    // bottom right
                    } else if (
                        jsnElementPosition.intRoomBelow > element.cellFloatingButtonContainer.clientHeight &&
                        jsnElementPosition.intRoomRight > element.cellFloatingButtonContainer.clientWidth
                    ) {
                        element.cellFloatingButtonContainer.setAttribute(
                            'style',
                            (
                                'left: ' + ((jsnElementPosition.intElementLeft + jsnElementPosition.intElementWidth) - 4) + 'px;' +
                                'top: ' + ((jsnElementPosition.intElementTop + jsnElementPosition.intElementHeight) - 4) + 'px;'
                            )
                        );

                        element.cellFloatingButtonContainer.children[0].setAttribute('remove-top-left', '');
                    }
                }
            };

            element.addEventListener('after_selection', function () {
                var arrSelected = element.selectedCells;

                if (arrSelected.length === 1) {
                    cellFloatingButtonFunction(element.dragCurrentCell || arrSelected[arrSelected.length - 1]);

                } else if (element.cellFloatingButtonContainer && element.cellFloatingButtonContainer.parentNode) {
                    element.cellFloatingButtonContainer.parentNode.removeChild(element.cellFloatingButtonContainer);
                    element.cellFloatingButtonContainer = null;
                }
            });

            element.addEventListener('focus', function (event) {
                if (event.target.hasAttribute('column')) {
                    cellFloatingButtonFunction(event.target.parentNode);
                }
            }, true);// this true is for making it so that the focus event (which doesn't bubble) gets captured

            // on mousewheel: remove floating button (scroll version of this is in the handleData function)
            element.addEventListener('mousewheel', function () {
                if (element.cellFloatingButtonContainer && element.cellFloatingButtonContainer.parentNode) {
                    element.cellFloatingButtonContainer.parentNode.removeChild(element.cellFloatingButtonContainer);
                    element.cellFloatingButtonContainer = null;
                }
            });
            element.scrollContainer.addEventListener('scroll', function () {
                if (element.cellFloatingButtonContainer && element.cellFloatingButtonContainer.parentNode) {
                    element.cellFloatingButtonContainer.parentNode.removeChild(element.cellFloatingButtonContainer);
                    element.cellFloatingButtonContainer = null;
                }
            });
        }

        // ################################################################
        // #################### TOUCH DEVICE CLIPBOARD ####################
        // ################################################################

        if (evt.touchDevice) {
            var rangeFloatingButtonFunction = function (arrSelected) {
                var i;
                var len;
                var jsnElementPosition;
                var intTopBoundry;
                var intBottomBoundry;
                var intLeftBoundry;
                var intRightBoundry;

                // if no floating button exists for this grid: create/append/bind one
                if (!element.rangeFloatingButtonContainer || !element.rangeFloatingButtonContainer.parentNode) {
                    element.rangeFloatingButtonContainer = document.createElement('div');
                    element.rangeFloatingButtonContainer.classList.add('floating-button-container');

                    element.rangeFloatingButtonContainer.innerHTML = (
                        '<gs-button icononly icon="clipboard" inline bg-primary no-focus></gs-button>' +
                        '<div contenteditable="true" style=" position: fixed;  border: 0 none;' +
                                                            'margin: 0;        padding: 0;' +
                                                            'z-index: -5000;   opacity: 0.00000001;' +
                                                            '-webkit-appearance: none;' +
                                                            '-moz-appearance: none;"></div>'
                    );

                    element.scrollContainer.appendChild(element.rangeFloatingButtonContainer);

                    element.rangeFloatingButtonContainer.control = element.rangeFloatingButtonContainer.children[1];

                    element.rangeFloatingButtonContainer.addEventListener('click', function () {
                        element.rangeFloatingButtonContainer.control.innerHTML = getSelectedCopyHTML(element) || 'Nothing To Copy';
                        element.rangeFloatingButtonContainer.control.focus();
                        document.execCommand('selectAll', false, null);
                    });

                    element.rangeFloatingButtonContainer.control.addEventListener('cut', function () {
                        GS.triggerEvent(element, 'before_update');
                        GS.triggerEvent(element, 'onbefore_update');
                        if (element.hasAttribute('onbefore_update')) {
                            new Function(element.getAttribute('onbefore_update')).apply(element);
                        }

                        var strSchema = GS.templateWithQuerystring(element.getAttribute('schema'));
                        var strObject = GS.templateWithQuerystring(element.getAttribute('object'));
                        var strUpdateData = '';
                        var strRecord;
                        var arrSetColumnElements;
                        var strHashColumns;
                        var arrSetColumns = [];
                        var arrPk;
                        var arrLock;
                        var arrRecords;
                        //var i;
                        //var len;
                        var col_i;
                        var col_len;
                        var arrRecordsToRefresh = [];
                        var strColumns = '';
                        var strRoles = '';
                        var strColumn;
                        var strRecordToHash;
                        var strTemp;

                        // gathering variables for select traversal
                        arrRecords = element.selectedRecords;

                        // if the first record is the header: remove it
                        if (arrRecords[0] && arrRecords[0].parentNode.nodeName === 'THEAD') {
                            arrRecords[0].splice(0, 1);
                        }

                        arrSetColumnElements = xtag.query(arrRecords[0], '[selected]:not(th)');

                        arrPk = (element.getAttribute('pk') || '').split(/[\s]*,[\s]*/);
                        arrLock = (element.getAttribute('lock') || '').split(/[\s]*,[\s]*/);

                        // gathering update headers
                        i = 0;
                        len = arrPk.length;
                        while (i < len) {
                            strRoles += (
                                strRoles
                                    ? '\t'
                                    : ''
                            ) + 'pk';
                            strColumns += (
                                strColumns
                                    ? '\t'
                                    : ''
                            ) + arrPk[i];
                            i += 1;
                        }

                        strHashColumns = '';
                        i = 0;
                        len = arrLock.length;
                        while (i < len) {
                            strHashColumns += (
                                strHashColumns
                                    ? '\t'
                                    : ''
                            ) + arrLock[i];
                            i += 1;
                        }
                        strRoles += (
                            strRoles
                                ? '\t'
                                : ''
                        ) + 'hash';
                        strColumns += (
                            strColumns
                                ? '\t'
                                : ''
                        ) + 'hash';

                        i = 0;
                        len = arrSetColumnElements.length;
                        while (i < len) {
                            strColumn = arrSetColumnElements[i].children[0].getAttribute('column');

                            strRoles += (
                                strRoles
                                    ? '\t'
                                    : ''
                            ) + 'set';
                            strColumns += (
                                strColumns
                                    ? '\t'
                                    : ''
                            ) + strColumn;
                            arrSetColumns.push(strColumn);
                            i += 1;
                        }

                        i = 0;
                        len = arrRecords.length;
                        while (i < len) {
                            strRecord = '';

                            // get 'pk' columns
                            col_i = 0;
                            col_len = arrPk.length;
                            while (col_i < col_len) {
                                strRecord += (
                                    strRecord
                                        ? '\t'
                                        : ''
                                );
                                strRecord += GS.encodeForTabDelimited(arrRecords[i].getAttribute('data-' + arrPk[col_i]), element.nullString);
                                col_i += 1;
                            }

                            // get 'hash' columns
                            strRecordToHash = '';
                            col_i = 0;
                            col_len = arrLock.length;
                            while (col_i < col_len) {
                                strRecordToHash += (
                                    strRecordToHash
                                        ? '\t'
                                        : ''
                                );
                                strTemp = arrRecords[i].getAttribute('data-' + arrLock[col_i]);
                                strRecordToHash += (
                                    strTemp === 'NULL'
                                        ? ''
                                        : strTemp
                                );
                                col_i += 1;
                            }

                            strRecord += (
                                strRecord
                                    ? '\t'
                                    : ''
                            ) + GS.utfSafeMD5(strRecordToHash).toString();

                            // get 'set' columns
                            col_i = 0;
                            col_len = arrSetColumns.length;
                            while (col_i < col_len) {
                                strRecord += (
                                    strRecord
                                        ? '\t'
                                        : ''
                                );
                                col_i += 1;
                            }

                            strRecord += '\n';
                            strUpdateData += strRecord;
                            arrRecordsToRefresh.push(arrRecords[i]);

                            // make the records red
                            arrRecords[i].classList.add('bg-red');
                            i += 1;
                        }

                        strUpdateData = (strRoles + '\n' + strColumns + '\n' + strUpdateData);

                        // create update transaction
                        GS.addLoader(element, 'Creating Update Transaction...');
                        GS.requestUpdateFromSocket(
                            getSocket(element),
                            strSchema,
                            strObject,
                            getReturn(element),
                            strHashColumns,
                            strUpdateData,
                            function (data, error) { //transactionID
                                if (error) {
                                    getData(element);
                                    GS.removeLoader(element);
                                    GS.webSocketErrorDialog(data);
                                }
                            },
                            function (data, error, ignore, commitFunction, rollbackFunction) { //transactionID
                                GS.removeLoader(element);

                                if (!error) {
                                    if (data !== 'TRANSACTION COMPLETED') {
                                        data = getReturn(element) + '\n' + data;

                                        // make the records amber and refresh their data
                                        refreshRecordsAfterUpdate(element, arrRecordsToRefresh, data);////
                                    } else {
                                        commitFunction();
                                    }

                                } else {
                                    rollbackFunction();
                                    getData(element);
                                    GS.webSocketErrorDialog(data);
                                }
                            },
                            function (strAnswer, data, error) {
                                GS.removeLoader(element);

                                if (!error) {
                                    if (strAnswer === 'COMMIT') {
                                        clearRecordColor(element, 'bg-amber', true);
                                        GS.triggerEvent(element, 'after_update');
                                        GS.triggerEvent(element, 'onafter_update');
                                        if (element.hasAttribute('onafter_update')) {
                                            new Function(element.getAttribute('onafter_update')).apply(element);
                                        }

                                    } else {
                                        getData(element);
                                    }
                                } else {
                                    getData(element);
                                    GS.webSocketErrorDialog(data);
                                }
                            }
                        );
                    });
                    element.rangeFloatingButtonContainer.control.addEventListener('copy', function () {
                        setTimeout(function () {
                            element.rangeFloatingButtonContainer.control.blur();
                            element.rangeFloatingButtonContainer.control.innerHTML = '';
                        }, 1);
                    });
                    element.rangeFloatingButtonContainer.control.addEventListener('paste', function (event) {
                        pasteHandler(element, event);
                        setTimeout(function () {
                            element.rangeFloatingButtonContainer.control.blur();
                            element.rangeFloatingButtonContainer.control.innerHTML = '';
                        }, 1);
                    });
                }

                // position button
                intTopBoundry = 99999999;
                intBottomBoundry = 99999999;
                intLeftBoundry = 99999999;
                intRightBoundry = 99999999;

                i = 0;
                len = arrSelected.length;
                while (i < len) {
                    jsnElementPosition = GS.getElementPositionData(arrSelected[i]);

                    if (jsnElementPosition.intElementTop < intTopBoundry) {
                        intTopBoundry = jsnElementPosition.intElementTop;
                    }
                    if (jsnElementPosition.intElementBottom < intBottomBoundry) {
                        intBottomBoundry = jsnElementPosition.intElementBottom;
                    }
                    if (jsnElementPosition.intElementLeft < intLeftBoundry) {
                        intLeftBoundry = jsnElementPosition.intElementLeft;
                    }
                    if (jsnElementPosition.intElementRight < intRightBoundry) {
                        intRightBoundry = jsnElementPosition.intElementRight;
                    }
                    i += 1;
                }

                // top right
                if (intTopBoundry >= 0 && intRightBoundry >= 0) {
                    element.rangeFloatingButtonContainer.style.top = (intTopBoundry + 4) + 'px';
                    element.rangeFloatingButtonContainer.style.right = (intRightBoundry + 4) + 'px';

                // top left
                } else if (intTopBoundry >= 0 && intLeftBoundry >= 0) {
                    element.rangeFloatingButtonContainer.style.top = (intTopBoundry + 4) + 'px';
                    element.rangeFloatingButtonContainer.style.left = (intLeftBoundry + 4) + 'px';

                // bottom right
                } else if (intBottomBoundry >= 0 && intRightBoundry >= 0) {
                    element.rangeFloatingButtonContainer.style.bottom = (intBottomBoundry + 4) + 'px';
                    element.rangeFloatingButtonContainer.style.right = (intRightBoundry + 4) + 'px';

                // bottom left
                } else if (intBottomBoundry >= 0 && intLeftBoundry >= 0) {
                    element.rangeFloatingButtonContainer.style.bottom = (intBottomBoundry + 4) + 'px';
                    element.rangeFloatingButtonContainer.style.left = (intLeftBoundry + 4) + 'px';
                }
            };

            element.addEventListener('after_selection', function () {
                var arrSelected = element.selectedCells;

                if (arrSelected.length > 0 && element.numberOfSelections === 1) {
                    rangeFloatingButtonFunction(arrSelected);

                } else if (element.rangeFloatingButtonContainer && element.rangeFloatingButtonContainer.parentNode) {
                    element.rangeFloatingButtonContainer.parentNode.removeChild(element.rangeFloatingButtonContainer);
                    element.rangeFloatingButtonContainer = null;
                }
            });

            element.scrollContainer.addEventListener('scroll', function () {
                if (element.rangeFloatingButtonContainer && element.rangeFloatingButtonContainer.parentNode) {
                    element.rangeFloatingButtonContainer.parentNode.removeChild(element.rangeFloatingButtonContainer);
                    element.rangeFloatingButtonContainer = null;
                }
            });
        }

        // ######################################################################################################
        // ######################################################################################################
        // ######################################################################################################

        // delete, refresh, page left and page right buttons
        element.addEventListener('click', function (event) {
            var target = event.target;
            var intOffset;
            var intLimit;

            // delete button
            if (target.classList.contains('delete-button')) {
                deleteSelection(element);

            // refresh button
            } else if (target.classList.contains('refresh-button')) {
                getData(element, undefined, undefined, undefined, true);

            // refresh button
            } else if (target.classList.contains('insert-button')) {
                insertDialog(element);

            } else if (target.classList.contains('paginate-left') || target.classList.contains('paginate-right')) {
                intLimit = parseInt(element.getAttribute('limit'), 10);
                intOffset = parseInt(element.getAttribute('offset') || '0', 10);

                if (target.classList.contains('paginate-left')) {
                    intOffset -= intLimit;
                } else {
                    intOffset += intLimit;
                }

                if (intOffset <= 0) {
                    intOffset = 0;
                    element.pageLeftButton.setAttribute('disabled', '');
                } else {
                    element.pageLeftButton.removeAttribute('disabled');
                }

                element.setAttribute('offset', intOffset);
                element.paginated = true;
                getData(element);
            }
        });

        if (!evt.touchDevice) {
            element.addEventListener('keydown', function (event) {
                var intKeyCode = (event.which || event.keyCode);

                if (!element.hasAttribute('no-huddelete')) {
                    if (event.target === element.copyControl && (intKeyCode === KEY_BACKSPACE || intKeyCode === KEY_DELETE)) {
                        deleteSelection(element);
                        event.preventDefault();
                    }
                }
            });
        }

        // manuel update
        var updateFromEntry = function (target) {
            var updateRecord = GS.findParentElement(target, 'tr');
            var updateRecordData = element.internalData.arrRecords[parseInt(updateRecord.getAttribute('data-index'), 10)];
            var arrPk;
            var arrLock;
            var i;
            var len;
            var col_i;
            var col_len;
            var strRoles;
            var strColumns;
            var strHashColumns;
            var strRecordToHash;
            var strTemp;
            var strRecord;
            var strUpdateData;

            arrPk = (element.getAttribute('pk') || '').split(/[\s]*,[\s]*/);
            arrLock = (element.getAttribute('lock') || '').split(/[\s]*,[\s]*/);

            // gathering update headers
            i = 0;
            len = arrPk.length;
            strRoles = '';
            strColumns = '';
            while (i < len) {
                strRoles += (
                    strRoles
                        ? '\t'
                        : ''
                ) + 'pk';
                strColumns += (
                    strColumns
                        ? '\t'
                        : ''
                ) + arrPk[i];
                i += 1;
            }

            i = 0;
            len = arrLock.length;
            strHashColumns = '';
            while (i < len) {
                strHashColumns += (
                    strHashColumns
                        ? '\t'
                        : ''
                ) + arrLock[i];
                i += 1;
            }
            strRoles += (
                strRoles
                    ? '\t'
                    : ''
            ) + 'hash';
            strColumns += (
                strColumns
                    ? '\t'
                    : ''
            ) + 'hash';

            strRoles += (
                strRoles
                    ? '\t'
                    : ''
            ) + 'set';
            strColumns += (
                strColumns
                    ? '\t'
                    : ''
            ) + target.getAttribute('column');

            // get update data
            strRecord = '';

            // get 'pk' columns
            col_i = 0;
            col_len = arrPk.length;
            while (col_i < col_len) {
                strRecord += (
                    strRecord
                        ? '\t'
                        : ''
                );
                strRecord += GS.encodeForTabDelimited(updateRecordData[element.internalData.arrColumnNames.indexOf(arrPk[col_i])], element.nullString);
                col_i += 1;
            }

            // get 'hash' columns
            strRecordToHash = '';
            col_i = 0;
            col_len = arrLock.length;
            while (col_i < col_len) {
                strRecordToHash += (
                    strRecordToHash
                        ? '\t'
                        : ''
                );
                strTemp = updateRecordData[element.internalData.arrColumnNames.indexOf(arrLock[col_i])];
                strRecordToHash += (
                    strTemp === 'NULL'
                        ? ''
                        : strTemp
                );
                col_i += 1;
            }

            strRecord += (
                strRecord
                    ? '\t'
                    : ''
            ) + GS.utfSafeMD5(strRecordToHash).toString();

            // get 'set' column
            strRecord += (
                strRecord
                    ? '\t'
                    : ''
            ) + GS.encodeForTabDelimited(target.value, element.nullString);
            console.log(target.value, element.nullString, GS.encodeForTabDelimited(target.value, element.nullString));

            strUpdateData = (strRoles + '\n' + strColumns + '\n' + strRecord + '\n');
            updateRecords(element, strHashColumns, strUpdateData, [updateRecord], false);
        };

        element.addEventListener('change', function (event) {
            var target = event.target;

            if (
                target.hasAttribute('column') &&
                !GS.findParentElement(target, 'tr').classList.contains('insert-record') &&
                !event.shiftKey
            ) {
                updateFromEntry(target);
            }
        });

        // manuel insert
        var insertFromInsertRecord = function () {
            var arrElements = xtag.query(element, 'tr.insert-record > td > [column]');
            var i;
            var len;
            var strColumns;
            var strInsertData;
            var strLocalData;

            strColumns = '';
            strInsertData = '';
            strLocalData = '';
            i = 0;
            len = arrElements.length;
            while (i < len) {
                strColumns += (
                    strColumns
                        ? '\t'
                        : ''
                ) + arrElements[i].getAttribute('column');
                strInsertData += (
                    strInsertData
                        ? '\t'
                        : ''
                ) + GS.encodeForTabDelimited(arrElements[i].value || 'NULL', element.nullString);
                strLocalData += (
                    strLocalData
                        ? '\t'
                        : ''
                ) + GS.encodeForTabDelimited(arrElements[i].value || '', element.nullString);
                arrElements[i].value = '';
                i += 1;
            }

            insertRecords(element, strColumns, strInsertData + '\n', strLocalData + '\n', false);
        };

        element.addEventListener('keydown', function (event) {
            var intKeyCode = (event.which || event.keyCode);
            var target = event.target;

            if (target.hasAttribute('column') && GS.findParentElement(target, 'tr').classList.contains('insert-record') && !event.shiftKey) {
                if (intKeyCode === KEY_RETURN) {
                    insertFromInsertRecord();
                    event.preventDefault();
                }
            }
        });

        // arrow navigation, key selection
        if (!evt.touchDevice) {
            element.addEventListener('keydown', function (event) {
                var intKeyCode = (event.which || event.keyCode);
                var target = event.target;
                var targetValue = target.value || '';
                var bolNavigateMode = false;
                var parentCell;
                var parentRecord;
                var parentTBody;
                var jsnCursorPos;
                var intCursorPosition;
                var bolSelect;
                var bolFullSelection;
                var bolCursorAtFirst;
                var bolCursorAtTop;
                var bolCursorAtLast;
                var bolCursorAtBottom;
                var arrSelected;
                var arrRecords;
                var focusElement;

                //event.stopPropagation();

                // find out if we are in focus mode
                // if we are in a cell control: we might be in focus mode (we need to check further)
                if (
                    (event.target.nodeName === 'INPUT' || event.target.nodeName === 'TEXTAREA') &&
                    !target.classList.contains('hidden-focus-control')
                ) {
                    jsnCursorPos = GS.getInputSelection(event.target);

                    // if fill text selection and shift is down: not focus mode
                    if (!(jsnCursorPos.start === 0 && jsnCursorPos.end === event.target.value.length && event.shiftKey)) {
                        bolNavigateMode = true;
                    }
                } else if (target.hasAttribute('column')) {
                    jsnCursorPos = {'start': 0, 'end': targetValue.length};
                    if (!event.shiftKey) {
                        bolNavigateMode = true;
                    }
                }

                // if we're in navigate mode: change focused cell
                if (bolNavigateMode) {
                    if (target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA') {
                        jsnCursorPos = GS.getInputSelection(target);
                    } else {
                        jsnCursorPos = {'start': 0, 'end': targetValue.length};
                    }

                    parentCell = GS.findParentElement(target, 'th,td');
                    parentRecord = parentCell.parentNode;
                    parentTBody = parentRecord.parentNode;

                    bolFullSelection = (jsnCursorPos.start === 0 && jsnCursorPos.end === targetValue.length);

                    // if we don't have a full selection and the selection is one character position
                    if (!bolFullSelection && jsnCursorPos.start === jsnCursorPos.end) {
                        // find out where the cursor is
                        intCursorPosition = jsnCursorPos.start;
                        bolCursorAtFirst = (intCursorPosition === 0);
                        bolCursorAtTop = (
                            intCursorPosition < (targetValue.indexOf('\n') === -1
                                ? targetValue.length + 1
                                : targetValue.indexOf('\n') + 1)
                        ) || (intCursorPosition === 0);
                        bolCursorAtLast = (intCursorPosition === targetValue.length);
                        bolCursorAtBottom = (intCursorPosition > targetValue.lastIndexOf('\n'));
                    }

                    // if left arrow and (full selection or the cursor is at the first character)
                    if (intKeyCode === KEY_LEFT && (bolFullSelection || bolCursorAtFirst)) {
                        if (parentCell.previousElementSibling && parentCell.previousElementSibling.nodeName !== 'TH') {
                            focusElement = parentCell.previousElementSibling;
                            bolSelect = true;

                        } else if (parentRecord.previousElementSibling) {
                            focusElement = parentRecord.previousElementSibling.lastElementChild;
                            bolSelect = true;
                        }

                    // if up arrow and (full selection or the cursor is in the top line)
                    } else if (intKeyCode === KEY_UP && (bolFullSelection || bolCursorAtTop)) {
                        if (parentRecord.previousElementSibling) {
                            focusElement = parentRecord.previousElementSibling.children[parentCell.cellIndex];
                            bolSelect = true;

                        } else if (parentCell.previousElementSibling && parentCell.previousElementSibling.nodeName !== 'TH') {
                            focusElement = parentTBody.lastElementChild.children[parentCell.cellIndex - 1];
                            bolSelect = true;
                        }

                    // if right arrow and (full selection or the cursor is at the last character)
                    } else if (intKeyCode === KEY_RIGHT && (bolFullSelection || bolCursorAtLast)) {
                        if (parentCell.nextElementSibling && parentCell.nextElementSibling.nodeName !== 'TH') {
                            focusElement = parentCell.nextElementSibling;
                            parentCell.nextElementSibling.children[0].focus();
                            bolSelect = true;

                        } else if (parentRecord.nextElementSibling) {
                            focusElement = parentRecord.nextElementSibling.children[1];
                            bolSelect = true;
                        }

                    // if down arrow  and (full selection or the cursor is in the last line)
                    } else if (intKeyCode === KEY_DOWN && (bolFullSelection || bolCursorAtBottom)) {
                        if (parentRecord.nextElementSibling) {
                            focusElement = parentRecord.nextElementSibling.children[parentCell.cellIndex];
                            bolSelect = true;

                        } else if (parentCell.nextElementSibling && parentCell.nextElementSibling.nodeName !== 'TH') {
                            focusElement = parentTBody.firstElementChild.children[parentCell.cellIndex + 1];
                            bolSelect = true;
                        }
                    }

                    // if something was selected
                    if (bolSelect) {
                        // set selected cells
                        element.savedSelection = [];
                        element.savedSelectionCopy = [];
                        element.dragOrigin = GS.findParentElement(focusElement, 'td, th');
                        element.dragCurrentCell = element.dragOrigin;
                        element.selectionPreviousOrigin = element.dragOrigin;
                        element.numberOfSelections = 1;
                        element.dragMode = 'select';

                        selectHandler(element, element.dragOrigin, element.dragCurrentCell, element.dragMode);

                        // this makes it so that the keyup doesn't happen,
                        //      allowing the new text selection to stay
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    if (focusElement) {
                        focusElement = xtag.query(focusElement, 'input, textarea, select, [tabindex]')[0];
                        if (focusElement) {
                            focusElement.focus();

                            // select all the text and scroll into view
                            if (focusElement !== window) {
                                if (focusElement.nodeName === 'INPUT' || focusElement.nodeName === 'TEXTAREA') {
                                    GS.setInputSelection(focusElement, 0, focusElement.value.length);
                                }
                                parentRecord = GS.findParentTag(focusElement, 'tr');

                                if (parentRecord && parentRecord.nodeName === 'TR') {
                                    GS.scrollIntoView(parentRecord);
                                }
                            }
                        }
                    }

                // else: change selection
                } else if (
                    event.target === element ||
                    event.target.hasAttribute('column') ||
                    event.target.classList.contains('hidden-focus-control')
                ) {
                    // if mouse selection is not happening right now
                    if (!element.dragAllowed) {
                        arrSelected = element.selectedCells;

                        // if the key was tab
                        if (intKeyCode === KEY_TAB) {
                            // if is a selection origin: focus the inner control
                            if (element.dragOrigin) {
                                element.dragOrigin.children[0].focus();

                                // this makes it so that the keyup doesn't happen,
                                //      allowing the new text selection to stay
                                event.preventDefault();
                            }

                        // else if the key was return
                        } else if (intKeyCode === KEY_RETURN) {
                            // if there is only one cell selected: go into the cell control
                            if (arrSelected.length === 1) {
                                arrSelected[0].children[0].focus();
                            } else {
                                element.dragOrigin.children[0].focus();
                            }

                            GS.setInputSelection(document.activeElement, document.activeElement.value.length);
                            GS.scrollIntoView(GS.findParentTag(document.activeElement, 'tr'));

                            // this makes it so that the keyup doesn't happen,
                            //      allowing the new text selection to stay
                            event.preventDefault();

                        // else if an arrow key was pressed
                        } else if (intKeyCode === KEY_UP || intKeyCode === KEY_DOWN || intKeyCode === KEY_LEFT || intKeyCode === KEY_RIGHT) {
                            arrRecords = xtag.query(element, 'tr');
                            element.dragMode = 'select';

                            // if no selection: select first editable cell
                            if (arrSelected.length === 0) {
                                //console.log('2***');
                                element.savedSelection = [];
                                element.savedSelectionCopy = [];
                                element.dragOrigin = xtag.query(element, 'tbody td')[0];
                                element.dragCurrentCell = element.dragOrigin;
                                element.selectionPreviousOrigin = element.dragOrigin;
                                element.numberOfSelections = 1;

                                bolSelect = true;

                            // if shift: expand current selection
                            } else if (event.shiftKey) {
                                //console.log('3***', element.dragCurrentCell);
                                element.dragOrigin = element.selectionPreviousOrigin;
                                parentRecord = element.dragCurrentCell.parentNode;

                                // if left arrow
                                if (intKeyCode === 37 && element.dragCurrentCell.previousElementSibling) {
                                    element.dragCurrentCell = element.dragCurrentCell.previousElementSibling;

                                // if up arrow
                                } else if (intKeyCode === 38 && arrRecords[parentRecord.rowIndex - 1]) {
                                    element.dragCurrentCell = arrRecords[parentRecord.rowIndex - 1].children[element.dragCurrentCell.cellIndex];

                                // if right arrow
                                } else if (intKeyCode === 39 && element.dragCurrentCell.nextElementSibling) {
                                    element.dragCurrentCell = element.dragCurrentCell.nextElementSibling;

                                // if down arrow
                                } else if (intKeyCode === 40 && arrRecords[parentRecord.rowIndex + 1]) {
                                    element.dragCurrentCell = arrRecords[parentRecord.rowIndex + 1].children[element.dragCurrentCell.cellIndex];
                                }

                                bolSelect = true;

                            // else: move selected cell based on origin cell
                            } else {
                                //console.log('4***', arrSelected.length);
                                if (arrSelected.length > 1) {
                                    element.dragCurrentCell = element.selectionPreviousOrigin;
                                }

                                parentRecord = element.dragCurrentCell.parentNode;

                                // if left arrow
                                if (intKeyCode === 37 && element.dragCurrentCell.previousElementSibling) {
                                    element.dragCurrentCell = element.dragCurrentCell.previousElementSibling;

                                // if up arrow
                                } else if (intKeyCode === 38 && arrRecords[parentRecord.rowIndex - 1]) {
                                    element.dragCurrentCell = arrRecords[parentRecord.rowIndex - 1].children[element.dragCurrentCell.cellIndex];

                                // if right arrow
                                } else if (intKeyCode === 39 && element.dragCurrentCell.nextElementSibling) {
                                    element.dragCurrentCell = element.dragCurrentCell.nextElementSibling;

                                // if down arrow
                                } else if (intKeyCode === 40 && arrRecords[parentRecord.rowIndex + 1]) {
                                    element.dragCurrentCell = arrRecords[parentRecord.rowIndex + 1].children[element.dragCurrentCell.cellIndex];
                                }

                                element.savedSelection = [];
                                element.savedSelectionCopy = [];
                                element.dragOrigin = element.dragCurrentCell;
                                element.selectionPreviousOrigin = element.dragCurrentCell;
                                element.numberOfSelections = 1;

                                bolSelect = true;
                            }

                            // if the above code has produced the info for a selection: call the select handler
                            if (bolSelect) {
                                //console.log('5***', element, element.dragOrigin, element.dragCurrentCell, element.dragMode);

                                element.lastFocusedControl = null;
                                element.copyControl.focus();

                                selectHandler(element, element.dragOrigin, element.dragCurrentCell, element.dragMode);
                                GS.scrollIntoView(element.dragCurrentCell.parentNode);
                                event.preventDefault();
                            }
                        }
                    }
                }
            });
        }


        element.addEventListener('mousewheel', function () {
            synchronizeHeaderScroll(element);
        });
        element.scrollContainer.addEventListener('scroll', function () {
            synchronizeHeaderScroll(element);
        });
        window.addEventListener('resize', function () {
            refreshReflow(element);
            refreshHeight(element);
            synchronizeHeaderWidths(element);
        });
    }

    function elementInserted(element) {
        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;
                element.internal = {};
                saveDefaultAttributes(element);

                if (element.hasAttribute('null-string')) {
                    element.nullString = element.getAttribute('null-string') || '';
                } else {
                    element.nullString = '';
                }

                prepareElement(element);
                bindElement(element);
                getData(element, '', '', true);
            }
        }
    }

    xtag.register('gs-datasheet', {
        lifecycle: {
            created: function () {},

            inserted: function () {
                elementInserted(this);
            },

            attributeChanged: function (strAttrName, ignore, newValue) { //oldValue
                var element = this;

                // if "suspend-created" has been removed: run created and inserted code
                if (strAttrName === 'suspend-created' && newValue === null) {
                    elementInserted(element);

                // if "suspend-inserted" has been removed: run inserted code
                } else if (strAttrName === 'suspend-inserted' && newValue === null) {
                    elementInserted(element);

                } else if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
                    if (strAttrName === 'value' && this.root) {
                        this.refresh();
                    }
                }
            }
        },
        events: {},
        accessors: {
            selectedCells: {
                get: function () {
                    return xtag.query(this.scrollContainer, '[selected]');
                },

                set: function (newValue) {
                    var i;
                    var len;
                    var arrCells = xtag.query(this, '[selected]');
                    var arrRowIndexes = [];
                    var arrHeaderIndexes = [];
                    var arrRecordSelectors;
                    var arrHeaders;

                    // clear old selection
                    i = 0;
                    len = arrCells.length;
                    while (i < len) {
                        arrCells[i].removeAttribute('selected');
                        i += 1;
                    }

                    arrCells = xtag.query(this, '[selected-secondary]');
                    i = 0;
                    len = arrCells.length;
                    while (i < len) {
                        arrCells[i].removeAttribute('selected-secondary');
                        i += 1;
                    }

                    // if newValue is not an array: make it an array
                    if (typeof newValue === 'object' && newValue.length === undefined) {
                        arrCells = [newValue];
                    } else {
                        arrCells = newValue;
                    }

                    // if this call is the result of a javascript ".selectedCells = ARRAY" call and there are more than zero cells to set
                    if (!this.dragAllowed && arrCells.length > 0) {
                        this.dragOrigin = arrCells[0];
                        this.dragCurrentCell = arrCells[arrCells.length - 1];
                    }
                    if (!this.savedSelection) {
                        this.savedSelection = [];
                    }

                    // set new selection
                    i = 0;
                    len = arrCells.length;
                    while (i < len) {
                        GS.listAdd(arrRowIndexes, arrCells[i].parentNode.rowIndex);
                        GS.listAdd(arrHeaderIndexes, arrCells[i].cellIndex);

                        this.savedSelection.push(arrCells[i].parentNode.rowIndex + ',' + arrCells[i].cellIndex);

                        arrCells[i].setAttribute('selected', '');
                        i += 1;
                    }

                    // highlight non-selected headers and row selectors

                    arrRecordSelectors = xtag.query(this, 'tbody th, thead th:first-child');
                    i = 0;
                    len = arrRecordSelectors.length;
                    while (i < len) {
                        if (arrRowIndexes.indexOf(i) !== -1 && !arrRecordSelectors[i].hasAttribute('selected')) {
                            arrRecordSelectors[i].setAttribute('selected-secondary', '');
                        }
                        i += 1;
                    }

                    arrHeaders = xtag.query(this, 'thead th');
                    i = 0;
                    len = arrHeaders.length;
                    while (i < len) {
                        if (arrHeaderIndexes.indexOf(i) !== -1 && !arrHeaders[i].hasAttribute('selected')) {
                            arrHeaders[i].setAttribute('selected-secondary', '');
                        }
                        i += 1;
                    }

                    GS.triggerEvent(this, 'after_selection');
                }
            },

            selectedRecords: {
                get: function () {
                    var i;
                    var len;
                    var intRecordIndex = -1;
                    var arrRecord = [];
                    var selected = this.selectedCells;

                    // loop through the selected cells and create an array of trs
                    i = 0;
                    len = selected.length;
                    while (i < len) {
                        if (selected[i].parentNode.rowIndex > intRecordIndex && selected[i].parentNode.parentNode.nodeName !== 'THEAD') {
                            intRecordIndex = selected[i].parentNode.rowIndex;
                            arrRecord.push(selected[i].parentNode);
                        }
                        i += 1;
                    }

                    return arrRecord;
                },

                set: function (newValue) {
                    var i;
                    var len;
                    var cell_i;
                    var cell_len;
                    var arrCells = this.selectedCells;
                    var arrRecords;
                    var arrCellChildren;

                    // clear old selection
                    i = 0;
                    len = arrCells.length;
                    while (i < len) {
                        arrCells[i].removeAttribute('selected');
                        i += 1;
                    }

                    arrCells = xtag.query(this, '[selected-secondary]');
                    i = 0;
                    len = arrCells.length;
                    while (i < len) {
                        arrCells[i].removeAttribute('selected-secondary');
                        i += 1;
                    }

                    // if newValue is not an array: make it an array
                    if (typeof newValue === 'object' && newValue.length === undefined) {
                        arrRecords = [newValue];
                    } else {
                        arrRecords = newValue;
                    }

                    // set new selection
                    arrCells = [];
                    i = 0;
                    len = arrRecords.length;
                    while (i < len) {
                        arrCellChildren = arrRecords[i].children;

                        cell_i = 0;
                        cell_len = arrCellChildren.length;
                        while (cell_i < cell_len) {
                            arrCells.push(arrCellChildren[cell_i]);
                            cell_i += 1;
                        }
                        i += 1;
                    }

                    this.selectedCells = arrCells;
                }
            },

            value: {
                get: function () {
                    return this.getAttribute('value');
                },

                set: function (newValue) {
                    return this.setAttribute('value', newValue);
                }
            }
        },
        methods: {
            'refresh': function () {
                getData(this);
            },

            'refreshFixedHeader': function () {
                synchronizeHeaderScroll(this);
                synchronizeHeaderWidths(this);
            },

            'refreshReflow': function () {
                refreshReflow(this);
            }
        }
    });
});