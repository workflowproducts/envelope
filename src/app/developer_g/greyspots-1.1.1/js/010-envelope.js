//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps, addDataEvents, addAutocompleteProps
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function (event) {
    'use strict';

    addSnippet(
        '<gs-envelope>',
        '<gs-envelope>',
        'gs-envelope src="${1:test.tpeople}">\n' +
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
        '</gs-envelope>'
    );

    /*
    TODO: there is no documentation
    addElement('gs-envelope', '');
    */

    window.designElementProperty_GSENVELOPE = function () {
        addDataAttributes('select,insert,update,delete,parent-child');
        addText('V', 'Reflow At', 'reflow-at');
        addCheck('V', 'Scroll To Bottom', 'scroll-to-bottom');
        addCheck('V', 'HUD Orderby', 'no-hudorderby');
        addCheck('V', 'HUD Limit', 'no-hudlimit');
        addCheck('V', 'HUD Refresh', 'no-hudrefresh');
        addCheck('V', 'HUD Delete', 'no-huddelete');
        addText('V', 'Expand&nbsp;To&nbsp;Content', 'expand-to-content');
        addText('D', 'Select Action', 'action-select');
        addText('D', 'Insert Action', 'action-insert');
        addText('D', 'Update Action', 'action-update');
        addText('D', 'Delete Action', 'action-delete');
        addDataEvents('select,insert,update,delete');
        addCheck('D', 'Disable Insert', 'no-insert');
        addCheck('D', 'Disable Update', 'no-update');
        addText('D', 'Record Template', 'template');
        addText('O', 'Column In QS', 'qs');
        addText('O', 'Refresh On QS Columns', 'refresh-on-querystring-values');
        addText('O', 'Refresh On QS Change', 'refresh-on-querystring-change');
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // ####################################################################
    // ############################## LOADER ##############################
    // ####################################################################

    function addLoader(element, strText) {
        element.loaderContainer = GS.stringToElement('<div class="loader-container" style="top: ' + element.scrollContainerElement.scrollTop + 'px;"></div>');
        element.scrollContainerElement.appendChild(element.loaderContainer);

        GS.addLoader(element.loaderContainer, strText);
    }

    function removeLoader(element) {
        if (element.loaderContainer && element.loaderContainer.parentNode === element.scrollContainerElement) {
            element.scrollContainerElement.removeChild(element.loaderContainer);
        }
        GS.removeLoader(element.loaderContainer);
    }

    // ###################################################################
    // ########################## DRAG HANDLING ##########################
    // ###################################################################

    function selectHandler(element, dragOrigin, dragCurrentCell, dragMode) {
        var bolThead;
        var bolFirstTh;
        var arrRecords;
        var arrCells;
        var arrRecordsToAffect = [];
        var arrCellsToAffect = [];
        var arrNewSelection = [];
        var arrCellsToRemoveFromSelection = [];
        var i;
        var len;
        var intFrom;
        var intTo;

        arrRecords = xtag.query(element.scrollContainerElement, 'tr');
        arrCells = xtag.query(element.scrollContainerElement, 'td, th');

        if (arrRecords.length > 0) {
            bolThead = Boolean(element.theadElement);

            if ((bolThead && arrRecords.length > 1) || (!bolThead && arrRecords > 0)) {
                if (bolThead) {
                    bolFirstTh = arrRecords[1].children[0].nodeName === 'TH';
                } else {
                    bolFirstTh = arrRecords[0].children[0].nodeName === 'TH';
                }
            }

            // if origin & currentCell are both the top-left cell and the cell is a heading: select all cells
            if (
                bolThead &&
                bolFirstTh &&
                dragOrigin.parentNode.rowIndex === 0 &&
                dragCurrentCell.parentNode.rowIndex === 0 &&
                dragOrigin.cellIndex === 0 &&
                dragCurrentCell.cellIndex === 0
            ) {
                arrCellsToAffect = arrCells;

            // else if origin & currentCell are both first ths: select the records from origin to currentCell
            } else if (bolFirstTh && dragOrigin.cellIndex === 0 && dragCurrentCell.cellIndex === 0) {
                arrRecordsToAffect = arrRecords.slice(
                    Math.min(dragOrigin.parentNode.rowIndex, dragCurrentCell.parentNode.rowIndex),
                    Math.max(dragOrigin.parentNode.rowIndex, dragCurrentCell.parentNode.rowIndex) + 1
                );

                i = 0;
                len = arrRecordsToAffect.length;
                while (i < len) {
                    Array.prototype.push.apply(arrCellsToAffect, xtag.toArray(arrRecordsToAffect[i].children));
                    i += 1;
                }

            // else if origin & currentCell are both headings: select the columns from origin to currentCell
            } else if (bolThead && dragOrigin.parentNode.rowIndex === 0 && dragCurrentCell.parentNode.rowIndex === 0) {
                intFrom = Math.min(dragOrigin.cellIndex, dragCurrentCell.cellIndex);
                intTo = Math.max(dragOrigin.cellIndex, dragCurrentCell.cellIndex) + 1;

                i = 0;
                len = arrRecords.length;
                while (i < len) {
                    Array.prototype.push.apply(arrCellsToAffect, xtag.toArray(arrRecords[i].children).slice(intFrom, intTo));
                    i += 1;
                }

            //// else if origin & currentCell are the same cell: select the record
            //} else if (dragOrigin === dragCurrentCell) {
            //    arrRecordsToAffect = arrRecords.slice(dragOrigin.parentNode.rowIndex, dragOrigin.parentNode.rowIndex + 1);
            //
            //    for (i = 0, len = arrRecordsToAffect.length; i < len; i += 1) {
            //        Array.prototype.push.apply(arrCellsToAffect, xtag.toArray(arrRecordsToAffect[i].children));
            //    }

            // else select cells from origin to currentCell
            } else {
                arrRecordsToAffect = arrRecords.slice(
                    Math.min(dragOrigin.parentNode.rowIndex, dragCurrentCell.parentNode.rowIndex),
                    Math.max(dragOrigin.parentNode.rowIndex, dragCurrentCell.parentNode.rowIndex) + 1
                );

                intFrom = Math.min(dragOrigin.cellIndex, dragCurrentCell.cellIndex);
                intTo = Math.max(dragOrigin.cellIndex, dragCurrentCell.cellIndex) + 1;

                i = 0;
                len = arrRecordsToAffect.length;
                while (i < len) {
                    Array.prototype.push.apply(arrCellsToAffect, xtag.toArray(arrRecordsToAffect[i].children).slice(intFrom, intTo));
                    i += 1;
                }
            }

            if (dragOrigin !== dragCurrentCell) {
                element.scrollContainerElement.removeAttribute('allow-text-selection');
                element.copyFocusTargetElement.focus();
                GS.setInputSelection(element.copyFocusTargetElement, 0, 'firefox...'.length);
            } else {
                element.scrollContainerElement.setAttribute('allow-text-selection', '');
            }

            if (dragMode === 'select') {

                // add new cells to element.selectionSelectedCells
                i = 0;
                len = element.selectionSelectedCells.length;
                while (i < len) {
                    if (arrCellsToAffect.indexOf(element.selectionSelectedCells[i]) === -1) {
                        arrCellsToRemoveFromSelection.push(element.selectionSelectedCells[i]);
                    }
                    i += 1;
                }
                element.selectionSelectedCells = arrCellsToAffect;

                // add new cells to element.selectedCells
                arrNewSelection = element.selectedCells;
                i = 0;
                len = arrCellsToAffect.length;
                while (i < len) {
                    GS.listAdd(arrNewSelection, arrCellsToAffect[i]);
                    i += 1;
                }
                i = 0;
                len = arrCellsToRemoveFromSelection.length;
                while (i < len) {
                    arrNewSelection.splice(arrNewSelection.indexOf(arrCellsToRemoveFromSelection[i]), 1);
                    i += 1;
                }
                element.selectedCells = arrNewSelection;

                //element.selectionSelectedCells = arrCellsToAffect;
                //element.selectedCells = arrCellsToAffect;

            } else { // implied if: dragMode === 'deselect'
                // deselect cells from arrCellsToAffect
                arrNewSelection = element.selectedCells;

                i = 0;
                len = arrCellsToAffect.length;
                while (i < len) {
                    if (arrNewSelection.indexOf(arrCellsToAffect[i]) > -1) {
                        arrNewSelection.splice(arrNewSelection.indexOf(arrCellsToAffect[i]), 1);
                    }
                    i += 1;
                }
                element.selectedCells = arrNewSelection;
            }
        }
    }

    // #######################################################################
    // ############################ DATA HANDLING ############################
    // #######################################################################
    // the user needs to be able to set a custom websocket for this element,
    //      so this function will use an attribute to find out what socket to
    //      use (and it'll default to "GS.envSocket")
    function getSocket(element) {
        if (element.getAttribute('socket')) {
            return GS[element.getAttribute('socket')];
        }
        return GS.envSocket;
    }


    // get data and send it off to be templated
    function getData(element) {
        GS.triggerEvent(element, 'before_select');
        GS.triggerEvent(element, 'onbefore_select');
        if (element.hasAttribute('onbefore_select')) {
            new Function(element.getAttribute('onbefore_select')).apply(element);
        }

        element.refreshing = true;
        var strSrc = GS.templateWithQuerystring(element.getAttribute('src') || element.getAttribute('source') || '');
        var srcParts = strSrc[0] === '(' ? [strSrc, ''] : strSrc.split('.');
        var strSchema = srcParts[0];
        var strObject = srcParts[1];
        var strWhere = GS.templateWithQuerystring(element.getAttribute('where') || '');
        var strOrd = GS.templateWithQuerystring(element.getAttribute('ord') || '');
        var strLimit = GS.templateWithQuerystring(element.getAttribute('limit') || '');
        var strOffset = GS.templateWithQuerystring(element.getAttribute('offset') || '');
        var response_i = 0;
        var response_len = 0;
        var arrTotalRecords = [];
        var strWhereColumn;
        var i;
        var len;

        // if there is a column attribute on element: combine the where attribute with a where generated by value
        if ((element.getAttribute('column') || element.getAttribute('qs')) && element.value) {
            strWhereColumn = element.getAttribute('child-column') || element.getAttribute('column') || element.getAttribute('qs');

            if (isNaN(element.value)) {
                strWhere =  'CAST(' + strWhereColumn + ' AS ' + GS.database.type.text + ') = ' +
                            'CAST($WhereQUOTE$' + (element.value) + '$WhereQUOTE$ AS ' + GS.database.type.text + ')' +
                            (strWhere !== '' ? ' AND (' + strWhere + ')' : '');
            } else {
                strWhere = strWhereColumn + '=' + (element.value) + (strWhere !== '' ? ' AND (' + strWhere + ')' : '');
            }

        // else: just use the where attribute
        }

        // if the user has set an order by: use the user order bys
        if (element.user_order_bys && element.user_order_bys.columns.length > 0) {
            i = 0;
            len = element.user_order_bys.columns.length;
            strOrd = '';
            while (i < len) {
                strOrd += (strOrd !== '' ? ', ' : '') + element.user_order_bys.columns[i] + ' ' + element.user_order_bys.directions[i].toUpperCase();
                i += 1;
            }

        // else: use the order by attribute
        }

        // save the old scrolltop (so that we can scroll back to it)
        element.oldScrollTop = element.scrollContainerElement.scrollTop;

        addLoader(element, 'Loading...');

        GS.requestCachingSelect(getSocket(element), strSchema, strObject, '*'
                                 , strWhere, strOrd, strLimit, strOffset
                                 , function (data, error) {
            element.refreshing = false;
            var arrRecords;
            var arrCells;
            var envData;
            var i;
            var len;
            var cell_i;
            var cell_len;

            if (!error) {
                if (data.strMessage !== 'TRANSACTION COMPLETED') {
                    arrRecords = GS.trim(data.strMessage, '\n').split('\n');

                    i = 0;
                    len = arrRecords.length;
                    while (i < len) {
                        arrCells = arrRecords[i].split('\t');

                        cell_i = 0;
                        cell_len = arrCells.length;
                        while (cell_i < cell_len) {
                            arrCells[cell_i] = arrCells[cell_i] === '\\N' ? null : GS.decodeFromTabDelimited(arrCells[cell_i]);
                            cell_i += 1;
                        }

                        arrTotalRecords.push(arrCells);
                        i += 1;
                    }
                } else {
                    removeLoader(element);
                    element.arrColumnNames = data.arrColumnNames;

                    envData = {'arr_column': element.arrColumnNames, 'dat': arrTotalRecords};

                    handleData(element, envData);
                }
            } else {
                handleData(element, data, error);
                //GS.removeLoader(element);
            }
        }, true);
    }

    function handleData(element, data, error) {
        var strHeaderHTML, strFixedHeaderHTML, tableElement, theadElement, tbodyElement,
            strBodyHTML, tableTemplateElement, arrCells, i, len,
            bolHeaderTextFound = false, strCurrentHeadingText, bolInitalSuccess;

        if (!error) {
            bolInitalSuccess = !element.lastSuccessData;

            // remove old error class
            element.classList.remove('error');

            // save data
            element.lastSuccessData = data;

            // create HTMl for header
            tableTemplateElement = document.createElement('template');
            tableTemplateElement.innerHTML = element.tableTemplate;

            tableElement = xtag.query(tableTemplateElement.content, 'table')[0];
            theadElement = xtag.queryChildren(tableElement, 'thead')[0];
            tbodyElement = xtag.queryChildren(tableElement, 'tbody')[0];

            // if there is a limit button
            if (element.limitButtonElement) {
                element.limitButtonElement.textContent = data.dat.length + ' records';
                element.limitButtonElement.setAttribute('class', 'row_count_btn');
            }

            //console.log(tableTemplateElement, element.tableTemplate, theadElement, tbodyElement);

            if (!theadElement) {
                arrCells = tbodyElement.getElementsByTagName('tr')[0].children;

                i = 0;
                len = arrCells.length;
                strHeaderHTML = '';
                strFixedHeaderHTML = '';
                while (i < len) {
                    strCurrentHeadingText = encodeHTML(GS.templateWithQuerystring(arrCells[i].getAttribute('heading') || ''));

                    if (strCurrentHeadingText) {
                        bolHeaderTextFound = true;
                    }

                    strHeaderHTML += '<th gs-dynamic>' + strCurrentHeadingText + '</th>';
                    strFixedHeaderHTML += '<div class="fixed-header-cell" gs-dynamic>' + strCurrentHeadingText + '</div>';
                    i += 1;
                }

                if (bolHeaderTextFound) {
                    strHeaderHTML = '<thead gs-dynamic><tr gs-dynamic>' + strHeaderHTML + '</tr></thead>';

                } else {
                    strHeaderHTML = '';
                    strFixedHeaderHTML = '';
                }
            } else {
                strHeaderHTML = theadElement.outerHTML;
                arrCells = theadElement.getElementsByTagName('tr')[0].children;

                i = 0;
                len = arrCells.length;
                strFixedHeaderHTML = '';
                while (i < len) {
                    strFixedHeaderHTML += '<div class="fixed-header-cell" gs-dynamic>' + encodeHTML(arrCells[i].textContent || '') + '</div>';
                    i += 1;
                }
            }

            element.fixedHeaderContainerElement.innerHTML = strFixedHeaderHTML;

            // create HTMl for body using the templated data
            strBodyHTML = '<tbody gs-dynamic>' + dataTemplateRecords(element, data) + '</tbody>';



            // this following observer code was added so that firefox would adjust it's headers at the right time
            //      I belive that the problem firefox had was that comboboxes were changing their width after
            //      refreshFixedHeader was being called, so this observer will call it after the childlist of the
            //      scrollcontainer changes
            // if there is already an observer: disconnect it
            if (element.headerRefreshObserver) {
                element.headerRefreshObserver.disconnect();
                element.headerRefreshObserver = undefined;
            }

            // fixed header mutation observer
            element.headerRefreshObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    //console.log('1***');
                    element.refreshFixedHeader();
                });
            });

            // pass in the target node, as well as the observer options
            element.headerRefreshObserver.observe(element.scrollContainerElement, {'childList': true});


            // set scroll container html
            element.scrollContainerElement.innerHTML = '<table gs-dynamic>' +
                                                        strHeaderHTML +
                                                        strBodyHTML +
                                                    '</table>';

            element.theadElement = xtag.query(element.scrollContainerElement, 'thead')[0];
            element.tbodyElement = xtag.query(element.scrollContainerElement, 'tbody')[0];

            element.refreshFixedHeader();

            // refresh height and reflow status
            element.refreshHeight();
            element.refreshReflow();

            // set scrolltop to the old scrolltop
            element.scrollContainerElement.scrollTop = element.oldScrollTop;

            if (element.hasAttribute('scroll-to-bottom')) {
                element.scrollContainerElement.scrollTop = element.scrollContainerElement.scrollHeight;
            }

            // this is triggered after the scrolling is set so that if someone wants to scroll
            // to a record after select they aren't going to encounter a problem
            GS.triggerEvent(element, 'after_select');
            GS.triggerEvent(element, 'onafter_select');
            if (element.hasAttribute('onafter_select')) {
                new Function(element.getAttribute('onafter_select')).apply(element);
            }

        } else {
            // add error class
            element.classList.add('error');

            // error dialog
            GS.ajaxErrorDialog(data, function () {
                getData(element);
            });
        }
    }


    function updateRecord(element, record, strColumn, newValue) {
        var srcParts = GS.templateWithQuerystring(element.getAttribute('src') || element.getAttribute('source') || '').split('.');
        var strSchema = srcParts[0];
        var strObject = srcParts[1];
        var strHashCols = '';
        var strHashData = '';
        var strPk = element.getAttribute('pk') || 'id';
        var strPKValue = GS.envGetCell(
            element.lastSuccessData,
            parseInt(record.getAttribute('data-rownum'), 10),
            strPk
        );
        var strUpdateData = (
            'pk\tset\thash\n' +
            strPk + '\t' + GS.encodeForTabDelimited(strColumn) + '\thash\n' +
            GS.encodeForTabDelimited(strPKValue) + '\t' + GS.encodeForTabDelimited(newValue) + '\t'
        );
        var i;
        var len;
        var arrTotalRecords = [];
        var callbackFunction;

        GS.triggerEvent(element, 'before_update');
        GS.triggerEvent(element, 'onbefore_update');
        if (element.hasAttribute('onbefore_update')) {
            new Function(element.getAttribute('onbefore_update')).apply(element);
        }

        i = 0;
        len = element.arrWhereColumns.length;
        while (i < len) {
            if (element.arrWhereColumns[i] != 'id') {
                if (strHashCols.length > 0) {
                    strHashCols += '\t';
                    strHashData += '\t';
                }
                strHashCols += GS.encodeForTabDelimited(element.arrWhereColumns[i]);

                strHashData += GS.encodeForTabDelimited(record.getAttribute('data-' + element.arrWhereColumns[i]));
            }

            i += 1;
        }

        strUpdateData += CryptoJS.MD5(strHashData);

        element.saveState = 'saving';
        if (element.saveTimeout) {
            clearTimeout(element.saveTimeout);
        }
        //console.log('wait five seconds');
        element.saveTimeout = setTimeout(function () {
            //console.log('element.saveState', element.saveState);
            if (element.saveState !== 'saved' && xtag.query(element, '.saving-warning-parent').length === 0) {
                element.saveState = 'error';
                var parentElement = document.createElement('center');
                parentElement.setAttribute('class', 'saving-warning-parent');
                
                var warningElement = document.createElement('div');
                warningElement.setAttribute('class', 'saving-warning');
    
                // warningElement.innerHTML = 'CHANGES ARE NOT SAVED<br />CLICK HERE TO TRY AGAIN';
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
        
        addLoader(element, 'Updating Record...');
        GS.requestUpdateFromSocket(getSocket(element), strSchema, strObject, '*', strHashCols, strUpdateData, function (data, error, transactionID) {
            if (error) {
                if (element.saveTimeout) {
                    clearTimeout(element.saveTimeout);
                }
                element.saveState = 'error';
                if (xtag.query(element, '.saving-warning-parent').length > 0) {
                    element.removeChild(xtag.query(element, '.saving-warning-parent')[0]);
                }
                
                removeLoader(element);
                GS.webSocketErrorDialog(data);
            }
        }, function (data, error, transactionID, commitFunction, rollbackFunction) {
            var arrRecords;
            var arrCells;
            var envData;
            var i;
            var len;
            var cell_i;
            var cell_len;

            if (!error) {
                if (data !== 'TRANSACTION COMPLETED') {
                    if (element.saveTimeout) {
                        clearTimeout(element.saveTimeout);
                    }
                    element.saveState = 'saved';
                    if (xtag.query(element, '.saving-warning-parent').length > 0) {
                        element.removeChild(xtag.query(element, '.saving-warning-parent')[0]);
                    }

                    arrRecords = GS.trim(data, '\n').split('\n');

                    i = 0;
                    len = arrRecords.length;
                    while (i < len) {
                        arrCells = arrRecords[i].split('\t');

                        cell_i = 0;
                        cell_len = arrCells.length;
                        while (cell_i < cell_len) {
                            arrCells[cell_i] = arrCells[cell_i] === '\\N' ? null : GS.decodeFromTabDelimited(arrCells[cell_i]);
                            cell_i += 1;
                        }

                        arrTotalRecords.push(arrCells);
                        i += 1;
                    }

                } else {
                    commitFunction();
                }

            } else {
                if (element.saveTimeout) {
                    clearTimeout(element.saveTimeout);
                }
                element.saveState = 'error';
                if (xtag.query(element, '.saving-warning-parent').length > 0) {
                    element.removeChild(xtag.query(element, '.saving-warning-parent')[0]);
                }
                
                removeLoader(element);
                rollbackFunction();
                GS.webSocketErrorDialog(data);
            }
        }, function (strAnswer, data, error) {
            var arrElements, i, len;

            if (!error) {
                if (strAnswer === 'COMMIT') {
                    if (element.saveTimeout) {
                        clearTimeout(element.saveTimeout);
                    }
                    element.saveState = 'saved';
                    if (xtag.query(element, '.saving-warning-parent').length > 0) {
                        element.removeChild(xtag.query(element, '.saving-warning-parent')[0]);
                    }
                    // console.log(arrTotalRecords);
                    callbackFunction({
                        detail: {
                            response: arrTotalRecords[0],
                            error: error
                        }
                    });
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
        });

        callbackFunction = function (event) {
            var jsnData, i, len, idIndex, tbodyElement, recordIndex, focusElement = document.activeElement
              , focusElementTag, focusElementRecord, focusElementCell, focusElementRecordIndex, focusElementCellIndex
              , focusElementIndex, focusElementCell, elementWalkResult, arrElements, arrSelection, newRecord, jsnTextSelection
              , newRecordData;
            //console.log(event);

            removeLoader(element);

            if (focusElement.hasAttribute('gs-dynamic') && focusElement.classList.contains('control')) {
                focusElement = focusElement.parentNode;
            }
            focusElementCell = getCellFromTarget(focusElement);
          //console.log(focusElement, focusElementCell);

            if (focusElementCell) {
                focusElementTag = focusElement.nodeName.toLowerCase();
                focusElementRecord = GS.findParentTag(focusElementCell, 'tr'); // getParentRecord(focusElementCell);

                focusElementRecordIndex = focusElementRecord.rowIndex;
                focusElementCellIndex = focusElementCell.cellIndex;
                focusElementIndex = xtag.query(focusElementRecord, focusElement.nodeName.toLowerCase()).indexOf(focusElement);
              //console.log(focusElementRecordIndex, focusElementCellIndex, focusElementIndex);

                //console.log(focusElementRecord,
                //            xtag.query(focusElementRecord, '*'),
                //            xtag.query(focusElementRecord, '*').indexOf(focusElement),
                //            xtag.query(focusElementRecord, focusElement.nodeName.toLowerCase()).indexOf(focusElement));
            }

            // if no error: refresh just the updated record
            if (!event.detail.error) {
                GS.triggerEvent(element, 'after_update');
                newRecordData = JSON.parse(JSON.stringify(event.detail.response));

                if (newRecordData.length > 0) {
                    // refresh record in lastSuccessData
                    idIndex = element.lastSuccessData.arr_column.indexOf('id');

                    i = 0;
                    len = element.lastSuccessData.dat.length;
                    // console.log(element.lastSuccessData.dat, idIndex, newRecordData);
                    while (i < len) {
                        // console.log(i, element.lastSuccessData.dat[i][idIndex], record.getAttribute('data-id'));
                        // if (String(element.lastSuccessData.dat[i][idIndex]) === String(record.getAttribute('data-id'))) {
                        if (String(element.lastSuccessData.dat[i][idIndex]) === String(newRecordData[idIndex])) {
                            recordIndex = i;
                            element.lastSuccessData.dat[i] = JSON.parse(JSON.stringify(event.detail.response));

                            break;
                        }
                        i += 1;
                    }

                    // save text selection status
                    if (document.activeElement.nodeName === 'INPUT' || document.activeElement.nodeName === 'TEXTAREA') {
                        jsnTextSelection = GS.getInputSelection(document.activeElement);
                    }

                    // save selection status of the cells in "record"
                    arrElements = xtag.query(record, 'td, th');
                    arrSelection = [];

                    i = 0;
                    len = arrElements.length;
                    while (i < len) {
                        if (arrElements[i].hasAttribute('selected-secondary')) {
                            arrSelection.push('selected-secondary');
                        } else if (arrElements[i].hasAttribute('selected')) {
                            arrSelection.push('selected');
                        } else {
                            arrElements.push('');
                        }
                        i += 1;
                    }

                    // replace "record" with new templated record
                    tbodyElement = document.createElement('tbody');
                    tbodyElement.innerHTML = dataTemplateRecords(element, element.lastSuccessData, recordIndex, 1); // jsnData // dataTemplate
                    newRecord = xtag.queryChildren(tbodyElement, 'tr')[0];
                    record.parentNode.replaceChild(newRecord, record);

                    // use saved selection status to select the cells in the new record
                    arrElements = xtag.query(newRecord, 'td, th');

                    i = 0;
                    len = arrElements.length;
                    while (i < len) {
                        if (arrSelection[i]) {
                            arrElements[i].setAttribute(arrSelection[i], '');
                        }
                        i += 1;
                    }

                    // refocus
                    if (focusElementCell) {
                        elementWalkResult = xtag.query(element.scrollContainerElement, 'tr')[focusElementRecordIndex];
                      //console.log(elementWalkResult);

                        if (elementWalkResult) {
                            elementWalkResult = xtag.query(elementWalkResult, focusElementTag)[focusElementIndex];
                          //console.log(elementWalkResult, focusElementTag, focusElementIndex);

                            if (elementWalkResult) {
                              //console.log('test');
                                elementWalkResult.focus();
                            }

                            //elementWalkResult = xtag.queryChildren(elementWalkResult, 'th, td')[focusElementCellIndex];
                            //
                            //if (elementWalkResult) {
                            //    elementWalkResult = xtag.query(elementWalkResult, '*')[1];
                            //
                            //    if (elementWalkResult) {
                            //        elementWalkResult.focus();
                            //    }
                            //}
                        }
                    }

                    // use saved text selection status to select active element
                    if (jsnTextSelection) {
                        GS.setInputSelection(document.activeElement, jsnTextSelection.start, jsnTextSelection.end);
                    }
                } else {
                    element.selectedCells = [];
                    record.parentNode.removeChild(record);
                }

                element.refreshFixedHeader();
                element.refreshHeight();

                GS.triggerEvent(element, 'after_update');
                GS.triggerEvent(element, 'onafter_update');
                if (element.hasAttribute('onafter_update')) {
                    new Function(element.getAttribute('onafter_update')).apply(element);
                }

            // else: errorDialog
            } else {
                // create addin to error response
                event.detail.response.error_addin = '<b gs-dynamic>Your Unsaved Value:</b> "' + newValue + '"';

                GS.ajaxErrorDialog(event.detail.response, function () {
                    updateRecord(element, record, strColumn, newValue);
                }, function () {
                    // revert
                    idIndex = element.lastSuccessData.arr_column.indexOf('id');

                    i = 0;
                    len = element.lastSuccessData.dat.length;
                    while (i < len) {
                        if (String(element.lastSuccessData.dat[i][idIndex]) === String(record.getAttribute('data-id'))) {
                            recordIndex = i;
                            break;
                        }
                        i += 1;
                    }

                    tbodyElement = document.createElement('tbody');
                    tbodyElement.innerHTML = dataTemplateRecords(element, element.lastSuccessData, recordIndex, 1);
                    record.parentNode.replaceChild(xtag.queryChildren(tbodyElement, 'tr')[0], record);
                });
            }
        };
    }

    function deleteRecords(element, arrID, arrRecord) {
        var srcParts = GS.templateWithQuerystring(element.getAttribute('src') || element.getAttribute('source') || '').split('.');
        var strSchema = srcParts[0];
        var strObject = srcParts[1];
        var strHashCols = '';
        var strHashData = '';
        var strPk = element.getAttribute('pk') || 'id';
        var strDeleteData = (
            'pk\thash\n' +
            strPk + '\thash\n'
        );
        var i;
        var len;
        var j;
        var len2;
        var arrTotalRecords = [];
        var callbackFunction;

        j = 0;
        len2 = element.arrWhereColumns.length;
        while (j < len2) {
            if (element.arrWhereColumns[j] != 'id') {
                if (strHashCols.length > 0) {
                    strHashCols += '\t';
                }
                strHashCols += GS.encodeForTabDelimited(element.arrWhereColumns[j]);
            }
            j += 1;
        }

        i = 0;
        len = arrID.length;
        while (i < len) {
            j = 0;
            len2 = element.arrWhereColumns.length;
            while (j < len2) {
                if (element.arrWhereColumns[j] != 'id') {
                    if (strHashData.length > 0) {
                        strHashData += '\t';
                    }

                    strHashData += GS.encodeForTabDelimited(arrRecord[i].getAttribute('data-' + element.arrWhereColumns[j]));
                }// else {
                //    strDeleteData += GS.encodeForTabDelimited(arrRecord[i].getAttribute('data-id'));
                //}
                j += 1;
            }
            //console.log(strHashData);
            strDeleteData += (
                GS.envGetCell(
                    element.lastSuccessData,
                    parseInt(arrRecord[i].getAttribute('data-rownum'), 10),
                    strPk
                ) +
                '\t' + CryptoJS.MD5(strHashData) + '\n'
            );
            strHashData = '';
            i += 1;
        }

        addLoader(element, 'Creating Delete Transaction...');
        GS.requestDeleteFromSocket(
            getSocket(element),
            strSchema,
            strObject,
            strHashCols,
            strDeleteData,
            function (data, error, transactionID) {
                if (error) {
                    removeLoader(element);
                    GS.webSocketErrorDialog(data);
                }
            },
            function (data, error, transactionID, commitFunction, rollbackFunction) {
                var arrElements;
                var i;
                var len;
                var templateElement;
                if (!error) {
                    if (data === 'TRANSACTION COMPLETED') {
                        // We have already confimed with the user that we are going to delete
                        commitFunction();
                    }

                } else {
                    rollbackFunction();
                    GS.webSocketErrorDialog(data);
                }
            },
            function (strAnswer, data, error) {
                var i;
                var len;
                var idColIndex;
                var deleteIndex;
                removeLoader(element);

                if (!error) {
                    if (strAnswer === 'COMMIT') {
                        GS.triggerEvent(element, 'after_delete');
                        GS.triggerEvent(element, 'onafter_delete');
                        if (element.hasAttribute('onafter_delete')) {
                            new Function(element.getAttribute('onafter_delete')).apply(element);
                        }

                        i = 0;
                        len = arrRecord.length;
                        while (i < len) {
                            arrRecord[i].parentNode.removeChild(arrRecord[i]);
                            i += 1;
                        }

                        idColIndex = element.lastSuccessData.arr_column.indexOf('id');

                        if (element.hasAttribute('limit') || element.lastSuccessData.dat.length === arrID.length) {
                            element.refresh();

                        } else {
                            // remove the record data from our stored data and
                            //      stop looping when we have deleted all the ones we are supposed to
                            i = 0;
                            len = element.lastSuccessData.dat.length;
                            while (i < len) {
                                // (arrID should only have strings so we cast the current id to string)
                                deleteIndex = arrID.indexOf(String(element.lastSuccessData.dat[i][idColIndex]));

                                if (deleteIndex > -1) {
                                    element.lastSuccessData.dat.splice(i, 1);
                                    arrID.splice(deleteIndex, 1);
                                    len -= 1;
                                    i -= 1;
                                }

                                if (arrID.length === 0) {
                                    break;
                                }
                                i += 1;
                            }

                            handleData(element, element.lastSuccessData);
                        }
                    }

                } else {
                    getData(element);
                    GS.webSocketErrorDialog(data);
                }
            }
        );
    }

    function insertRecord(element, dialog, strInsertString) {
        var srcParts = GS.templateWithQuerystring(element.getAttribute('src') || element.getAttribute('source') || '').split('.');
        var strSchema = srcParts[0];
        var strObject = srcParts[1];
        var arrInsertKeys;
        var arrInsertValues;
        var strWSInsertColumns;
        var strWSInsertData;
        var i;
        var len;
        var strPk = element.getAttribute('pk') || 'id';
        var strSeq = element.getAttribute('seq') || '';

        // if there is a column attribute on this element: append child column (or column) and the value to the insert string
        if (element.getAttribute('column') || element.getAttribute('qs')) {
            strInsertString += (strInsertString ? '&' : '') + (element.getAttribute('child-column') || element.getAttribute('column') || element.getAttribute('qs')) + '=' + (element.value);
        }

        //console.log(strInsertString);

        arrInsertKeys = GS.qryGetKeys(strInsertString);
        arrInsertValues = GS.qryGetVals(strInsertString);

        i = 0;
        len = arrInsertKeys.length;
        strWSInsertColumns = '';
        while (i < len) {
            strWSInsertColumns += arrInsertKeys[i] + ((i + 1) === len ? '\n' : '\t');
            i += 1;
        }
        i = 0;
        len = arrInsertValues.length;
        strWSInsertData = '';
        while (i < len) {
            strWSInsertData += arrInsertValues[i] + ((i + 1) === len ? '\n' : '\t');
            i += 1;
        }

        addLoader(element, 'Inserting Record...');

        GS.requestInsertFromSocket(
            getSocket(element),
            strSchema,
            strObject,
            strWSInsertColumns,
            strPk,
            strSeq,
            strWSInsertColumns + strWSInsertData,
            function (data, error, transactionID) {
                if (error) {
                    removeLoader(element);
                    GS.webSocketErrorDialog(data);
                }
            },
            function (data, error, transactionID, commitFunction, rollbackFunction) {
                var arrElements;
                var i;
                var len;
                var templateElement;

                if (!error) {
                    if (data === 'TRANSACTION COMPLETED') {
                        commitFunction();
                    }
                } else {
                    removeLoader(element);
                    rollbackFunction();
                    GS.webSocketErrorDialog(data);
                }
            },
            function (action) {
                removeLoader(element);
                if (action === 'COMMIT') {
                    GS.triggerEvent(element, 'after_insert');
                    GS.triggerEvent(element, 'onafter_insert');
                    if (element.hasAttribute('onafter_insert')) {
                        new Function(element.getAttribute('onafter_insert')).apply(element);
                    }
                    GS.closeDialog(dialog, 'Ok');
                }
                getData(element, true);
            }
        );
    }


    // ##################################################################
    // ########################### UI REFRESH ###########################
    // ##################################################################

    function refreshHud(element) {
        var elementHudTopContainer;
        var elementHudBottomContainer;
        var divElement = document.createElement('div');
        var hudInsertButton;
        var hudRefreshButton;
        var hudDeleteButton;
        var hudOrderbyButton;
        var hudLimitButton;
        var intOffset;
        var intLimit;
        var jsnOrderByCopy;
        var i;
        var len;
        var customHudTemplate;
        var customHudElements;

        elementHudTopContainer = element.hudTopElement;
        elementHudBottomContainer = element.hudBottomElement;

        elementHudTopContainer.innerHTML = '';
        elementHudBottomContainer.innerHTML = '';

        // insert hud button
        if (element.insertTemplate && !element.hasAttribute('no-insert')) {
            divElement.innerHTML = '<gs-button inline icononly icon="plus" no-focus gs-dynamic>Insert</gs-button>';

            hudInsertButton = divElement.childNodes[0];

            elementHudTopContainer.appendChild(hudInsertButton);
        }

        // refresh hud button
        if (!element.hasAttribute('no-hudrefresh')) {
            divElement.innerHTML = '<gs-button inline icononly icon="refresh" no-focus gs-dynamic>Refresh</gs-button>';

            hudRefreshButton = divElement.childNodes[0];

            elementHudTopContainer.appendChild(hudRefreshButton);
        }

        // delete hud button
        if (!element.hasAttribute('no-huddelete')) {
            divElement.innerHTML = '<gs-button inline icononly icon="times" no-focus gs-dynamic>Delete</gs-button>';

            hudDeleteButton = divElement.childNodes[0];

            elementHudTopContainer.appendChild(hudDeleteButton);
        }

        // custom hud buttons (trim so that just whitespace doesn't count)
        if (element.hudTemplate && element.hudTemplate.trim()) {
            customHudTemplate = document.createElement('template');
            customHudTemplate.innerHTML = element.hudTemplate;

            elementHudTopContainer.appendChild(customHudTemplate.content.cloneNode(true));

            // V------ you can't use .children on a template.content
            //customHudElements = customHudTemplate.content.childNodes;
            //
            //for (i = 0, len = customHudElements.length; i < len; i += 1) {
            //    //customHudElements[i].setAttribute('inline', '');
            //    elementHudTopContainer.appendChild(customHudElements[0]);
            //}
            //elementHudTopContainer.innerHTML += element.hudTemplate; <-- this causes events to be lost in the hud-top container
        }

        // order by hud button
        if (!element.hasAttribute('no-hudorderby')) {
            divElement.innerHTML = '<gs-button inline icononly icon="sort-amount-asc" no-focus gs-dynamic>Order By</gs-button>';

            hudOrderbyButton = divElement.childNodes[0];

            elementHudBottomContainer.appendChild(hudOrderbyButton);
        }

        // limit hud button
        element.limitButtonElement = '';
        if (!element.hasAttribute('no-hudlimit')) {
            //console.log(element, element.lastSuccessData);
            divElement.innerHTML = '<span flex></span><gs-button inline no-focus>Limit</gs-button>';

            hudLimitButton = divElement.childNodes[1];

            element.limitButtonElement = hudLimitButton;

            elementHudBottomContainer.appendChild(divElement.childNodes[0]);
            elementHudBottomContainer.appendChild(divElement.childNodes[0]);
        }

        if (elementHudTopContainer.innerHTML === '') {
            elementHudTopContainer.style.display = 'none';
        } else {
            elementHudTopContainer.style.display = '';
        }

        if (elementHudBottomContainer.innerHTML === '') {
            elementHudBottomContainer.style.display = 'none';
        } else {
            elementHudBottomContainer.style.display = '';
        }


        // bind hud buttons
        if (hudInsertButton) {
            hudInsertButton.addEventListener('click', function (event) {
                var templateElement = document.createElement('template');

                templateElement.innerHTML = ml(function () {/*
                    <gs-page gs-dynamic>
                        <gs-header gs-dynamic><center gs-dynamic><h3 gs-dynamic>Insert</h3></center></gs-header>
                        <gs-body padded gs-dynamic>
                            <div id="insert-dialog-content-container" gs-dynamic>{{HTML}}</div>
                        </gs-body>
                        <gs-footer gs-dynamic>
                            <gs-grid gs-dynamic widths="1,1" class="width-2">
                                <gs-block gs-dynamic width="1">
                                    <gs-button dialogclose gs-dynamic>Cancel</gs-button>
                                </gs-block>
                                <gs-block gs-dynamic width="1">
                                    <gs-button class="dialog-envelope-insert" listen-for-return bg-primary gs-dynamic>Ok</gs-button>
                                </gs-block>
                            </gs-grid>
                        </gs-footer>
                    </gs-page>
                */}).replace('{{HTML}}', element.insertTemplate);

                GS.openDialog(templateElement, function () {
                    var dialog = this;

                    GS.triggerEvent(element, 'insert_dialog_open');

                    xtag.query(dialog, '.dialog-envelope-insert')[0].addEventListener('click', function () {
                        var insertContainer = document.getElementById('insert-dialog-content-container');
                        var controls;
                        var i;
                        var len;
                        var strInsertString;
                        var currentValue;

                        GS.triggerEvent(element, 'before_insert');
                        GS.triggerEvent(element, 'onbefore_insert');
                        if (element.hasAttribute('onbefore_insert')) {
                            new Function(element.getAttribute('onbefore_insert')).apply(element);
                        }

                        controls = xtag.query(insertContainer, '[column]');

                        i = 0;
                        len = controls.length;
                        strInsertString = '';
                        while (i < len) {
                            currentValue = controls.checked !== undefined ? controls.checked : controls[i].value;

                            if (currentValue === undefined || currentValue === null) {
                                currentValue = '';
                            }

                            currentValue = encodeURIComponent(currentValue);

                            if (currentValue !== undefined && currentValue !== null && currentValue !== '') {
                                strInsertString += (strInsertString === '' ? '' : '&') +
                                                    controls[i].getAttribute('column') + '=' + currentValue;
                            }
                            i += 1;
                        }

                        insertRecord(element, dialog, strInsertString);
                    });
                });
            });
        }

        if (hudRefreshButton) {
            element.hudRefreshButton = hudRefreshButton;
            hudRefreshButton.addEventListener('click', function (event) {
                getData(element, true);
            });
        }

        if (hudDeleteButton) {
            element.hudDeleteButton = hudDeleteButton;
            //console.log('binding click on', hudDeleteButton);
            hudDeleteButton.addEventListener('click', function (event) {
                var i, len, arrRecord = element.selectedRecords, arrID = [];

                // loop through the selected cells and create an array of ids
                i = 0;
                len = arrRecord.length;
                while (i < len) {
                    arrID.push(String(arrRecord[i].dataset.id));
                    i += 1;
                }

                if (arrID.length > 0) {
                    GS.triggerEvent(element, 'before_delete');
                    GS.triggerEvent(element, 'onbefore_delete');
                    if (element.hasAttribute('onbefore_delete')) {
                        new Function(element.getAttribute('onbefore_delete')).apply(element);
                    }
                    GS.msgbox(  'Are you sure...',
                                    '<br gs-dynamic />' +
                                    '<center gs-dynamic>' +
                                        'Are you sure you want to delete ' + (arrID.length > 1 ? 'these records' : 'this record') + '?' +
                                    '</center>' +
                                    '<br gs-dynamic />',
                                ['No', 'Yes'],
                                function (strAnswer) {
                                    if (strAnswer === 'Yes') {
                                        deleteRecords(element, arrID, arrRecord);
                                    }
                                });

                } else {
                    GS.msgbox('Nothing Selected.',
                              '<br gs-dynamic /><center gs-dynamic>Nothing is selected. Please select something to delete.</center><br />',
                              ['Ok']);
                }
            });
        }

        if (hudOrderbyButton) {
            element.hudOrderbyButton = hudOrderbyButton;
            hudOrderbyButton.addEventListener('click', function (event) {
                var templateElement = document.createElement('template');

                jsnOrderByCopy = JSON.parse(JSON.stringify(element.user_order_bys));

                // TESTING LINE!!! COMMENT OUT WHEN NOT IN USE!!!
                //jsnOrderByCopy = {'columns': ['billable', 'taxable', 'id', 'user_name'], 'directions': ['asc', 'desc', 'asc', 'asc']};
                // TESTING LINE!!! COMMENT OUT WHEN NOT IN USE!!!

                templateElement.setAttribute('data-mode', 'touch');
                templateElement.innerHTML = ml(function () {/*
                    <gs-page gs-dynamic>
                        <gs-header gs-dynamic>
                            <center gs-dynamic><h3 gs-dynamic>Sorted Columns</h3></center>
                            <gs-button id="order-by-dialog-add-column" gs-dynamic>Add A Column To Sort</gs-button>
                        </gs-header>
                        <gs-body padded gs-dynamic>
                            <div id="order-by-dialog-ghost-container" gs-dynamic></div>
                            <div id="order-by-dialog-used-columns" gs-dynamic></div>
                        </gs-body>
                        <gs-footer gs-dynamic>
                            <gs-grid>
                                <gs-block><gs-button gs-dynamic dialogclose>Cancel</gs-button></gs-block>
                                <gs-block><gs-button gs-dynamic dialogclose>Ok</gs-button></gs-block>
                            </gs-grid>
                        </gs-footer>
                    </gs-page>
                */});

                GS.openDialog(templateElement, function () {
                    document.getElementById('order-by-dialog-add-column').addEventListener('click', function (event) {
                        var dialog, dialogButtons, templateElement2 = document.createElement('template');

                        templateElement2.innerHTML = ml(function () {/*
                            <gs-page gs-dynamic>
                                <gs-header gs-dynamic>
                                    <center gs-dynamic><h3 gs-dynamic>Unsorted Columns</h3></center>
                                </gs-header>
                                <gs-body padded gs-dynamic>
                                    <div id="order-by-dialog-unused-columns" gs-dynamic></div>
                                </gs-body>
                                <gs-footer gs-dynamic>
                                    <gs-button dialogclose gs-dynamic>Cancel</gs-button>
                                </gs-footer>
                            </gs-page>
                        */});

                        dialog = GS.openDialog(templateElement2, function () {
                                    var unusedColumnsContainer = document.getElementById('order-by-dialog-unused-columns');
                                    var unusedColumnTapHandler;
                                    var columnElements;
                                    var i;
                                    var len;
                                    var strHTML;

                                    i = 0;
                                    len = element.lastSuccessData.arr_column.length;
                                    strHTML = '';
                                    while (i < len) {
                                        if (jsnOrderByCopy.columns.indexOf(element.lastSuccessData.arr_column[i]) === -1) {
                                            strHTML +=  '<div class="order_by_column" data-column="' + element.lastSuccessData.arr_column[i] + '" gs-dynamic>' +
                                                            '<gs-button mini style="padding: 0.25em;" dialogclose class="column_name" gs-dynamic>' + GS.strToTitle(element.lastSuccessData.arr_column[i]) + '</gs-button>' +
                                                        '</div>';
                                        }
                                        i += 1;
                                    }

                                    unusedColumnsContainer.innerHTML = strHTML;

                                    unusedColumnTapHandler = function (event) {
                                        if (event.target.classList.contains('column_name')) {
                                            jsnOrderByCopy.columns.push(event.target.parentNode.getAttribute('data-column'));
                                        } else {
                                            jsnOrderByCopy.columns.push(event.target.getAttribute('data-column'));
                                        }
                                        jsnOrderByCopy.directions.push('asc');

                                        // refresh the column list
                                        refreshOrderBys();
                                    };

                                    columnElements = unusedColumnsContainer.getElementsByClassName('order_by_column');

                                    i = 0;
                                    len = columnElements.length;
                                    while (i < len) {
                                        columnElements[i].addEventListener('click', unusedColumnTapHandler);
                                        i += 1;
                                    }
                                });

                        dialogButtons = dialog.getElementsByTagName('gs-button');
                    });

                    var refreshOrderBys = function () {
                        var usedColumnsElement = document.getElementById('order-by-dialog-used-columns'),
                            ghostContainerElement = document.getElementById('order-by-dialog-ghost-container'),
                            strHTML, i, len, sortButtons, sortMousedownHandler, deleteButtons,
                            deleteTapHandler, directionButtons, directionTapHandler;


                        i = 0;
                        len = jsnOrderByCopy.columns.length;
                        strHTML = '';
                        while (i < len) {
                            strHTML +=  '<div class="order_by_column" flex-horizontal data-column="' + jsnOrderByCopy.columns[i] + '" data-direction="' + jsnOrderByCopy.directions[i] + '" gs-dynamic>' +
                                            '<gs-button inline remove-all icononly icon="bars" class="sort" gs-dynamic></gs-button>' +
                                            '<div class="column_name" flex gs-dynamic>' + GS.strToTitle(jsnOrderByCopy.columns[i]) + '</div>' +
                                            '<gs-button inline remove-all icononly icon="times" class="delete" gs-dynamic></gs-button>' +
                                            '<gs-button inline remove-all icononly icon="sort-amount-' + jsnOrderByCopy.directions[i] + '" class="direction" gs-dynamic></gs-button>' +
                                        '</div>';
                            i += 1;
                        }

                        usedColumnsElement.innerHTML = strHTML;

                        // bind sort buttons
                        sortMousedownHandler = function () {
                            var columns = usedColumnsElement.getElementsByClassName('order_by_column');
                            var offsetsCache = [];
                            var i;
                            var len;
                            var currentElement = this.parentNode;
                            var currentlyMarkedElement;
                            var markerElement;
                            var bolLast = false;
                            var intToIndex;
                            var currentElementClone;
                            var intCloneoffset;
                            var intFromIndex;
                            var sortMousemoveHandler;
                            var sortMouseupHandler;
                            var strColumn = currentElement.getAttribute('data-column');
                            var strDirection = currentElement.getAttribute('data-direction');

                            markerElement = document.createElement('div');
                            markerElement.classList.add('drop_marker');
                            markerElement.setAttribute('gs-dynamic', '');

                            currentElementClone = currentElement.cloneNode(true);
                            ghostContainerElement.appendChild(currentElementClone);
                            intCloneoffset = GS.getElementOffset(ghostContainerElement).top + (currentElementClone.offsetHeight / 2);

                            i = 0;
                            len = columns.length;
                            while (i < len) {
                                offsetsCache.push({
                                    'element': columns[i],
                                    'top': GS.getElementOffset(columns[i]).top,
                                    'height': columns[i].offsetHeight//, 'iscurrentelement': columns[i] === currentElement
                                });

                                if (columns[i] === currentElement) {
                                    intFromIndex = i;
                                }

                                i += 1;
                            }

                            sortMousemoveHandler = function (event) {
                                var i;
                                var len;
                                var matchedElement;
                                var bolNewLast;
                                var intTop;

                                event.preventDefault();
                                event.stopPropagation();

                                if (event.which === 0 && !evt.touchDevice) {
                                    sortMouseupHandler();

                                } else {
                                    intTop = GS.mousePosition(event).top + usedColumnsElement.parentNode.scrollTop;

                                    currentElementClone.style.top = (intTop - intCloneoffset) + 'px';

                                    //console.log('mousemove', GS.mousePosition(event).top, usedColumnsElement.parentNode.scrollTop);

                                    if (offsetsCache[0].top > intTop) {
                                        matchedElement = offsetsCache[0].element;
                                        bolNewLast = false;

                                    } else {
                                        i = 0;
                                        len = offsetsCache.length;
                                        while (i < len) {
                                            if (offsetsCache[i + 1]) {
                                                if (offsetsCache[i].top <= intTop &&
                                                    offsetsCache[i].top + ((offsetsCache[i + 1].top - offsetsCache[i].top) / 2) > intTop) {

                                                    matchedElement = offsetsCache[i].element;
                                                    bolNewLast = false;
                                                    intToIndex = i;
                                                    break;

                                                } else if (offsetsCache[i].top <= intTop &&
                                                            offsetsCache[i].top + ((offsetsCache[i + 1].top - offsetsCache[i].top) / 2) <= intTop &&
                                                            offsetsCache[i + 1].top > intTop) {

                                                    matchedElement = offsetsCache[i + 1].element;
                                                    bolNewLast = false;
                                                    intToIndex = i + 1;
                                                    break;
                                                }
                                            } else {
                                                if (offsetsCache[i].top + (offsetsCache[i].height / 2) >= intTop) {
                                                    matchedElement = offsetsCache[i].element;
                                                    bolNewLast = false;
                                                    intToIndex = i;
                                                    break;

                                                } else if (offsetsCache[i].top + (offsetsCache[i].height / 2) <= intTop) {
                                                    matchedElement = offsetsCache[i].element;
                                                    bolNewLast = true;
                                                    intToIndex = i;
                                                    break;
                                                }
                                            }
                                            i += 1;
                                        }
                                    }

                                    if (matchedElement !== currentlyMarkedElement || bolNewLast !== bolLast) {
                                        if (bolNewLast === true) {
                                            if (markerElement) {
                                                markerElement.parentNode.removeChild(markerElement);
                                            }
                                            matchedElement.parentNode.appendChild(markerElement);

                                        } else {
                                            matchedElement.parentNode.insertBefore(markerElement, matchedElement);
                                        }

                                        currentlyMarkedElement = matchedElement;
                                        bolLast = bolNewLast;

                                        //console.log(currentlyMarkedElement, bolLast);
                                    }

                                    //console.log('mousemove', intTop);
                                }
                            };

                            document.body.addEventListener(evt.mousemove, sortMousemoveHandler);

                            sortMouseupHandler = function (event) {
                                intToIndex = (intToIndex > intFromIndex ? intToIndex - 1: intToIndex);

                                // if we have valid to and from indexes:
                                if (intFromIndex !== intToIndex && intToIndex !== undefined) {

                                    if (intFromIndex !== undefined && intFromIndex !== '') {
                                        jsnOrderByCopy.columns.splice(intFromIndex, 1);
                                        jsnOrderByCopy.directions.splice(intFromIndex, 1);
                                    }

                                    jsnOrderByCopy.columns.splice(intToIndex, 0, strColumn);
                                    jsnOrderByCopy.directions.splice(intToIndex, 0, strDirection);

                                    // refresh the column list
                                    refreshOrderBys();
                                } else {
                                    markerElement.parentNode.removeChild(markerElement);
                                }

                                //console.log(intFromIndex, intToIndex);
                                ghostContainerElement.innerHTML = '';
                                document.body.removeEventListener(evt.mousemove, sortMousemoveHandler);
                                document.body.removeEventListener(evt.mouseup, sortMouseupHandler);
                            };

                            document.body.addEventListener(evt.mouseup, sortMouseupHandler);

                            //console.log('sortMousedownHandler');
                        };
                        sortButtons = usedColumnsElement.getElementsByClassName('sort');

                        i = 0;
                        len = sortButtons.length;
                        while (i < len) {
                            sortButtons[i].addEventListener(evt.mousedown, sortMousedownHandler);
                            i += 1;
                        }
                        //console.log(usedColumnsElement.getElementsByClassName('sort'));

                        // bind delete buttons
                        deleteTapHandler = function () {
                            var indexToDelete = jsnOrderByCopy.columns.indexOf(this.parentNode.getAttribute('data-column'));

                            jsnOrderByCopy.columns.splice(indexToDelete, 1);
                            jsnOrderByCopy.directions.splice(indexToDelete, 1);

                            refreshOrderBys();
                            //console.log('deleteTapHandler');
                        };
                        deleteButtons = usedColumnsElement.getElementsByClassName('delete');

                        i = 0;
                        len = deleteButtons.length;
                        while (i < len) {
                            deleteButtons[i].addEventListener('click', deleteTapHandler);
                            i += 1;
                        }
                        //console.log(usedColumnsElement.getElementsByClassName('delete'));


                        // bind direction buttons
                        directionTapHandler = function () {
                            var indexToFlip = jsnOrderByCopy.columns.indexOf(this.parentNode.getAttribute('data-column'));

                            if (jsnOrderByCopy.directions[indexToFlip] === 'asc') {
                                jsnOrderByCopy.directions[indexToFlip] = 'desc';
                            } else {
                                jsnOrderByCopy.directions[indexToFlip] = 'asc';
                            }

                            refreshOrderBys();
                            //console.log('directionTapHandler');
                        };
                        directionButtons = usedColumnsElement.getElementsByClassName('direction');

                        i = 0;
                        len = directionButtons.length;
                        while (i < len) {
                            directionButtons[i].addEventListener('click', directionTapHandler);
                            i += 1;
                        }
                        //console.log(usedColumnsElement.getElementsByClassName('direction'));
                    }

                    refreshOrderBys();
                }, function (event, strAnswer) {
                    if (strAnswer === 'Ok') {
                        element.user_order_bys = JSON.parse(JSON.stringify(jsnOrderByCopy));
                        getData(element, true);
                    }
                });
            });
        }

        if (hudLimitButton) {
            element.hudLimitButton = hudLimitButton;
            hudLimitButton.addEventListener('click', function (event) {
                var intLimit, intOffset, bolShowAll, fromValue, toValue,
                    templateElement = document.createElement('template');

                if (element.getAttribute('limit') && element.getAttribute('offset')) {
                    intOffset = parseInt(element.getAttribute('offset'), 10);
                    intLimit = parseInt(element.getAttribute('limit'), 10);

                    fromValue = intOffset;
                    toValue = intOffset + intLimit;
                    bolShowAll = false;

                } else if (element.getAttribute('limit')) {
                    fromValue = '0';
                    toValue = element.getAttribute('limit');
                    bolShowAll = false;

                } else if (element.old_offset && element.old_limit) {
                    intOffset = parseInt(element.old_offset, 10);
                    intLimit = parseInt(element.old_limit, 10);

                    fromValue = intOffset;
                    toValue = intOffset + intLimit;
                    bolShowAll = true;

                } else if (element.old_limit) {
                    fromValue = '0';
                    toValue = element.old_limit;
                    bolShowAll = true;

                } else {
                    fromValue = '0';
                    toValue = '';
                    bolShowAll = true;
                }

                templateElement.setAttribute('id', 'template-envelope-limit');
                templateElement.innerHTML = ml(function () {/*
                    <gs-page gs-dynamic>
                        <gs-header><center><h3>Limit</h3></center></gs-header>
                        <gs-body padded>
                            <gs-optionbox id="limit-dialog-choice" value="{{OPTION}}">
                                <gs-option value="range">
                                    Show Range:
                                    <gs-grid gutter>
                                        <gs-block>
                                            <b>From:</b>
                                            <gs-text id="limit-dialog-from" value="{{FROM}}" {{DISABLE}}></gs-text>
                                        </gs-block>
                                        <gs-block>
                                            <b>To:</b>
                                            <gs-text id="limit-dialog-to" value="{{TO}}" {{DISABLE}}></gs-text>
                                        </gs-block>
                                    </gs-grid>
                                </gs-option>
                                <gs-option value="all">Show All</gs-option>
                            </gs-optionbox>
                        </gs-body>
                        <gs-footer>
                            <gs-grid>
                                <gs-block><gs-button dialogclose>Cancel</gs-button></gs-block>
                                <gs-block><gs-button dialogclose listen-for-return bg-primary>Ok</gs-button></gs-block>
                            </gs-grid>
                        </gs-footer>
                    </gs-page>
                */}).replace('{{OPTION}}', (bolShowAll === true ? 'all' : 'range'))
                    .replace(/\{\{DISABLE\}\}/gim, (bolShowAll === true ? 'disabled' : ''))
                    .replace('{{FROM}}', fromValue)
                    .replace('{{TO}}', toValue);

                GS.openDialog(templateElement, function () {
                    var choiceElement, showAllElement, fromElement, toElement, intLimit, intOffset, bolShowAll, fromValue, toValue;

                    choiceElement = document.getElementById('limit-dialog-choice');
                    fromElement = document.getElementById('limit-dialog-from');
                    toElement = document.getElementById('limit-dialog-to');

                    choiceElement.addEventListener('change', function (event) {
                        if (this.value === 'all') {
                            fromElement.setAttribute('disabled', '');
                            toElement.setAttribute('disabled', '');
                            GS.closeDialog('template-envelope-limit', 'Ok');
                        } else {
                            fromElement.removeAttribute('disabled');
                            toElement.removeAttribute('disabled');
                        }
                    });

                }, function (event, strAnswer) {
                    var dialog = this, choiceElement, showAllElement, fromElement, toElement, intLimit, intOffset;

                    if (strAnswer === 'Ok') {
                        choiceElement = document.getElementById('limit-dialog-choice');
                        showAllElement = document.getElementById('limit-dialog-show-all');
                        fromElement = document.getElementById('limit-dialog-from');
                        toElement = document.getElementById('limit-dialog-to');

                        if (choiceElement.value === 'all') {
                            if (element.getAttribute('limit')) {
                                element.old_limit = element.getAttribute('limit');
                                element.removeAttribute('limit');
                            }
                            if (element.getAttribute('offset')) {
                                element.old_offset = element.getAttribute('offset');
                                element.removeAttribute('offset');
                            }

                        } else {
                            if (fromElement.value) {
                                element.setAttribute('offset', fromElement.value);
                            }
                            if (toElement.value) {
                                element.setAttribute('limit', parseInt(toElement.value, 10) - parseInt(fromElement.value, 10));
                            }
                        }

                        getData(element);
                    }
                });
            });
        }
    }


    // #################################################################
    // ########################### UTILITIES ###########################
    // #################################################################

    function handleClipboardData(event, strCopyString) {
        var clipboardData = event.clipboardData || window.clipboardData, strMime;

        if (!clipboardData) {
            return;
        }
        if (!clipboardData.setData) {
            return;
        }

        if (window.clipboardData && window.clipboardData.getData) { // IE
            strMime = 'Text';
        } else if (event.clipboardData && event.clipboardData.getData) {
            strMime = 'text/plain';
        }

        if (strCopyString) {
            return clipboardData.setData(strMime, strCopyString) !== false;
        } else {
            return clipboardData.getData(strMime);
        }
    }

    function dataTemplateRecords(element, data, intStartRecordNumber, intNumberOfRecords) {
        var tableTemplateElement = document.createElement('template'), jsnTemplate, strRet, strStart, strEnd;

        tableTemplateElement.innerHTML = element.tableTemplate;

        //strStart = '<table><tbody>';
        //strEnd = '</tbody></table>';
        //jsnTemplate = GS.templateHideSubTemplates(strStart + xtag.query(tableTemplateElement.content, 'tbody')[0].innerHTML + strEnd);
        jsnTemplate = GS.templateHideSubTemplates(xtag.query(tableTemplateElement.content, 'tbody')[0].innerHTML, true);

        //jsnTemplate.templateHTML = jsnTemplate.templateHTML.substring(strStart.length, jsnTemplate.templateHTML.length - strEnd.length);
        //console.log(jsnTemplate.templateHTML);

        strRet = GS.templateWithEnvelopeData(jsnTemplate.templateHTML, data, intStartRecordNumber, intStartRecordNumber + intNumberOfRecords);

        strRet = GS.templateShowSubTemplates(strRet, jsnTemplate);

        return strRet;
    }



    // ########################################################################################
    // ########################################################################################
    // ########################################################################################
    // ########################################################################################
    // ########################################################################################
    // ########################################################################################
    // ########################################################################################
    // ########################################################################################
    // ########################################################################################

    function getCellFromTarget(element) {
        var currentElement = element;

        while (currentElement.nodeName !== 'TD' && currentElement.nodeName !== 'TH' && currentElement.nodeName !== 'HTML') {
            currentElement = currentElement.parentNode;
        }

        if (currentElement.nodeName !== 'TD' && currentElement.nodeName !== 'TH') {
            return undefined;
        }

        return currentElement;
    }

    //function pushReplacePopHandler(element) {
    //    var i, len, arrPopKeys, bolRefresh = false, currentValue, strQueryString = GS.getQueryString(), strQSCol = element.getAttribute('qs');
    //
    //    if (strQSCol && GS.qryGetKeys(strQueryString).indexOf(strQSCol) > -1) {
    //        element.value = GS.qryGetVal(strQueryString, strQSCol);
    //    }
    //
    //    if (element.hasAttribute('refresh-on-querystring-values')) {
    //        arrPopKeys = element.getAttribute('refresh-on-querystring-values').split(',');
    //
    //        for (i = 0, len = arrPopKeys.length; i < len; i += 1) {
    //            currentValue = GS.qryGetVal(strQueryString, arrPopKeys[i]);
    //
    //            if (element.popValues[arrPopKeys[i]] !== currentValue) {
    //                bolRefresh = true;
    //            }
    //
    //            element.popValues[arrPopKeys[i]] = currentValue;
    //        }
    //    } else if (element.hasAttribute('refresh-on-querystring-change')) {
    //        bolRefresh = true;
    //    }
    //
    //    if (bolRefresh) {
    //        element.refresh();
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
              //console.log('pushReplacePopHandler: getData', element);
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

    // dont do anything that modifies the element here
    function elementCreated(element) {
        // if "created" hasn't been suspended: run created code
        if (!element.hasAttribute('suspend-created')) {

        }
    }

    //
    function elementInserted(element) {
        var hudTemplateElement, tableTemplateElement, tableTemplateElementCopy, insertTemplateElement,
            recordElement, divElement, oldRootElement, i, len, arrElement, arrColumnElement, arrTemplates, arrWhereColumns,
            strQueryString = GS.getQueryString(), currentElement, strQSValue;

        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;
                element.internal = {};
                saveDefaultAttributes(element);

                GS.addBeforeUnloadEvent(function () {
                    document.activeElement.blur();
                });

                // handle "qs" attribute
                if (element.getAttribute('qs') ||
                        element.getAttribute('refresh-on-querystring-values') ||
                        element.hasAttribute('refresh-on-querystring-change')) {
                    element.popValues = {};
                    //strQSValue = GS.qryGetVal(strQueryString, element.getAttribute('qs'));
                    //
                    //if (strQSValue !== '' || !element.getAttribute('value')) {
                    //    element.setAttribute('value', strQSValue);
                    //}
                    pushReplacePopHandler(element);
                    window.addEventListener('pushstate',    function () { pushReplacePopHandler(element); });
                    window.addEventListener('replacestate', function () { pushReplacePopHandler(element); });
                    window.addEventListener('popstate',     function () { pushReplacePopHandler(element); });
                }

                // primary keys attribute and defaulting
                if (element.getAttribute('lock')) {
                    arrWhereColumns = element.getAttribute('lock').split(/\s*,\s*/gim);
                    if (arrWhereColumns.length === 0) {
                        arrWhereColumns = ['change_stamp'];
                    }
                } else {
                    arrWhereColumns = ['change_stamp'];
                }
                element.arrWhereColumns = arrWhereColumns;

                // set user order bys to default to empty
                element.user_order_bys = {
                    'columns': [],
                    'directions': []
                };

                // if there is an old root element: delete it
                oldRootElement = xtag.queryChildren(element, '.root');

                if (oldRootElement.length > 0) {
                    i = 0;
                    len = oldRootElement.length;
                    while (i < len) {
                        element.removeChild(oldRootElement[i]);
                        i += 1;
                    }
                }

                // selecting for template elements
                hudTemplateElement    = xtag.queryChildren(element, 'template[for="hud"]')[0];
                tableTemplateElement  = xtag.queryChildren(element, 'template[for="table"]' + (element.hasAttribute('template') ? '[id="' + element.getAttribute('template') + '"': ''))[0];
                if (!tableTemplateElement && element.hasAttribute('template')) {
                    console.warn('ENVELOPE WARNING: Hey! You used the name of a non-existant record template!');
                    tableTemplateElement  = xtag.queryChildren(element, 'template[for="table"]')[0];
                }
                insertTemplateElement = xtag.queryChildren(element, 'template[for="insert"]')[0];
                
                if (
                    hudTemplateElement &&
                    (
                        hudTemplateElement.innerHTML.indexOf('&gt;') > -1 ||
                        hudTemplateElement.innerHTML.indexOf('&lt;') > -1
                    )
                ) {
                    console.warn('GS-ENVELOPE WARNING: &gt; or &lt; detected in HUD template, this can have undesired effects on doT.js. Please use gt(x,y), gte(x,y), lt(x,y), or lte(x,y) to silence this warning.');
                }
                if (
                    tableTemplateElement &&
                    (
                        tableTemplateElement.innerHTML.indexOf('&gt;') > -1 ||
                        tableTemplateElement.innerHTML.indexOf('&lt;') > -1
                    )
                ) {
                    console.warn('GS-ENVELOPE WARNING: &gt; or &lt; detected in table template, this can have undesired effects on doT.js. Please use gt(x,y), gte(x,y), lt(x,y), or lte(x,y) to silence this warning.');
                }
                if (
                    insertTemplateElement &&
                    (
                        insertTemplateElement.innerHTML.indexOf('&gt;') > -1 ||
                        insertTemplateElement.innerHTML.indexOf('&lt;') > -1
                    )
                ) {
                    console.warn('GS-ENVELOPE WARNING: &gt; or &lt; detected in insert template, this can have undesired effects on doT.js. Please use gt(x,y), gte(x,y), lt(x,y), or lte(x,y) to silence this warning.');
                }

                element.templates = {};
                xtag.queryChildren(element, 'template[for="table"]').forEach(function (cur, i) {
                    if (i === 0) {
                        element.templates['default'] = cur;
                    }
                    if (cur.hasAttribute('id')) {
                        element.templates[cur.getAttribute('id')] = cur;
                    }
                });

                // checking/saving template elements
                if (hudTemplateElement) {
                    element.hudTemplate = hudTemplateElement.innerHTML;
                }

                if (tableTemplateElement) {
                    tableTemplateElementCopy = document.createElement('template');
                    tableTemplateElementCopy.innerHTML = tableTemplateElement.innerHTML;

                    recordElement = xtag.query(xtag.query(tableTemplateElementCopy.content, 'tbody')[0], 'tr')[0];

                    if (recordElement) {
                        recordElement.setAttribute('data-rownum', '{{! i }}');
                        // add a data- attribute for all where columns (most of the time: id and change_stamp)
                        i = 0;
                        len = element.arrWhereColumns.length;
                        while (i < len) {
                            recordElement.setAttribute('data-' + element.arrWhereColumns[i], '{{! row.' + element.arrWhereColumns[i] + ' }}');
                            i += 1;
                        }

                        // add a doT.js coded "value" attribute to any element with a "column" attribute but no "value" attribute
                        element.tableTemplate = GS.templateColumnToValue(tableTemplateElementCopy.innerHTML);
                    }
                } else {
                    throw 'Envelope error: table template is required.';
                }
                if (insertTemplateElement) {
                    element.insertTemplate = insertTemplateElement.innerHTML;
                }

                // clear element content
                element.innerHTML = '';

                // creating/setting root
                divElement = document.createElement('div');
                divElement.classList.add('root');
                divElement.setAttribute('flex-fill', '');
                divElement.setAttribute('flex-vertical', '');
                divElement.setAttribute('gs-dynamic', '');

                element.appendChild(divElement);
                element.root = divElement;

                // filling root with containers
                element.root.innerHTML = '<div class="hud-container-top" gs-dynamic></div>' +
                                         '<div class="fixed-header-container" gs-dynamic></div>' +
                                         '<div class="scroll-container" flex gs-dynamic></div>' +
                                         '<div class="hud-container-bottom" flex-horizontal gs-dynamic></div>' +
                                         '<input title="Hidden control" class="gs-envelope-copy-focus-target" value="Firefox compatibility input" gs-dynamic />';

                element.hudTopElement =                 xtag.queryChildren(element.root, '.hud-container-top')[0];
                element.fixedHeaderContainerElement =   xtag.queryChildren(element.root, '.fixed-header-container')[0];
                element.scrollContainerElement =        xtag.queryChildren(element.root, '.scroll-container')[0];
                element.hudBottomElement =              xtag.queryChildren(element.root, '.hud-container-bottom')[0];
                element.copyFocusTargetElement =        xtag.queryChildren(element.root, '.gs-envelope-copy-focus-target')[0];

                element.scrollContainerElement.setAttribute('allow-text-selection', '');

                ////REFPOINT
                //element.addEventListener('focus', function (event) {
                //    //console.log(document.activeElement, element, event.target, element.copyFocusTargetElement);
                //    if (document.activeElement === element) { // event.target
                //        element.copyFocusTargetElement.focus();
                //        GS.setInputSelection(element.copyFocusTargetElement, 0, 'firefox...'.length);
                //    }
                //});

                // binding events
                element.scrollContainerElement.addEventListener('change', function (event) {
                    var newValue, parentTr;

                    if (event.target.getAttribute('column')) {
                        if (event.target.value !== null) {
                            // changed on 2022-06-11 by Nunzio
                            // this is the behaviour of Microsoft Access, and Cross expected it
                            newValue = event.target.value === '' ? '\\N' : event.target.value;
                            // newValue = event.target.value;
                        } else {
                            newValue = event.target.checked;
                        }

                        parentTr = GS.findParentTag(event.target, 'tr');

                        // if the control is a direct child of this envelope (fixes sub envelope update)
                        if (
                            parentTr.parentNode.parentNode.parentNode === element.scrollContainerElement &&
                            !element.hasAttribute('no-update')
                        ) {
                            updateRecord(element, parentTr, event.target.getAttribute('column'), newValue);
                        }
                    }
                });
                
                // if td is clicked, and there is only one child, focus it
                element.addEventListener('click', function (event) {
                    if (event.target.tagName.toUpperCase() === 'TD' && event.target.children.length === 1) {
                        event.target.children[0].focus();
                    }
                });

                // META-SHIFT-CLICK
                if (!evt.touchDevice) {
                    element.addEventListener('click', function (event) {
                        var templateElement;

                        if (event.metaKey && event.shiftKey) {
                            templateElement = document.createElement('template');


                            var strOrderBy = '', strRelWhere = '', strElemWhere, strWhereColumn, strUserOrderBy = '', strLimit, strOffset,
                                strSource = GS.templateWithQuerystring((element.getAttribute('src') || '')),
                                strCols = GS.templateWithQuerystring(element.getAttribute('cols') || ''), strElemOrderBy;

                            // if there is a column attribute on element element: combine the where attribute with a where generated by value
                            if ((element.getAttribute('column') || element.getAttribute('qs')) && element.value) {
                                strWhereColumn = element.getAttribute('child-column') || element.getAttribute('column') || element.getAttribute('qs');

                                if (isNaN(element.value)) {
                                    strRelWhere =
                                        'CAST(' + strWhereColumn + ' AS ' + GS.database.type.text + ') = ' +
                                        'CAST($WhereQUOTE$' + (element.value) + '$WhereQUOTE$ AS ' + GS.database.type.text + ')';
                                } else {
                                    strRelWhere = strWhereColumn + '=' + (element.value);
                                }
                            }

                            strElemWhere = GS.templateWithQuerystring((element.getAttribute('where') || ''));
                            strLimit = GS.templateWithQuerystring((element.getAttribute('limit') || ''));
                            strOffset = GS.templateWithQuerystring((element.getAttribute('offset') || ''));

                            // if the user has set an order by: use the user order bys
                            if (element.user_order_bys && element.user_order_bys.columns.length > 0) {
                                i = 0;
                                len = element.user_order_bys.columns.length;
                                strUserOrderBy = '';
                                while (i < len) {
                                    strUserOrderBy += (strUserOrderBy !== '' ? ', ' : '') + element.user_order_bys.columns[i] + ' ' + element.user_order_bys.directions[i].toUpperCase();
                                    i += 1;
                                }
                            }

                            strElemOrderBy = GS.templateWithQuerystring((element.getAttribute('ord') || ''));


                            templateElement.innerHTML = ml(function () {/*
                                <gs-page>
                                    <gs-header><h3>GS-Envelope Details</h3></gs-header>
                                    <gs-body padded>
                                        <b>Source: </b>{{SOURCE}}<br />
                                        <b>Columns: </b>{{COLS}}<br />
                                        <b>Element Where: </b>{{ELEMWHERE}}<br />
                                        <b>Relationship Where: </b>{{RELWHERE}}<br />
                                        <b>Limit: </b>{{LIMIT}}<br />
                                        <b>Offset: </b>{{OFFSET}}<br />
                                        <b>Element Order By: </b>{{ELEMORD}}<br />
                                        <b>User Order By: </b>{{USERORD}}
                                    </gs-body>
                                    <gs-footer>
                                        <gs-button dialogclose>Done</gs-button>
                                    </gs-footer>
                                </gs-page>
                            */}).replace(/\{\{SOURCE\}\}/gi, strSource)
                                .replace(/\{\{COLS\}\}/gi, strCols)
                                .replace(/\{\{ELEMWHERE\}\}/gi, strElemWhere)
                                .replace(/\{\{RELWHERE\}\}/gi, strRelWhere)
                                .replace(/\{\{LIMIT\}\}/gi, strLimit)
                                .replace(/\{\{OFFSET\}\}/gi, strOffset)
                                .replace(/\{\{ELEMORD\}\}/gi, strElemOrderBy)
                                .replace(/\{\{USERORD\}\}/gi, strUserOrderBy);

                            GS.openDialog(templateElement);
                        }
                    });
                }

                // if we are not on a touch device: cell by cell selection
                if (!evt.touchDevice) {
                    // mousedown (on selected and unselected) + drag
                    //      clear previous selection(s)
                    //      select cells from origin cell to current cell
                    //
                    // shift + mousedown (on selected and unselected) + drag
                    //      alter previous selection
                    //      select cells from previous origin cell to current cell
                    //
                    // command + mousedown (on unselected) + drag
                    //      maintain previous selection(s)
                    //      select cells from origin cell to current cell
                    //
                    // command + mousedown (on selected) + drag
                    //      maintain previous selection(s)
                    //      deselect cells from origin cell to current cell
                    //
                    // collision handling
                    //      when colliding with previous selections: dont treat them different
                    //
                    // copy handling
                    //      selection ("X" marks selected cells (imagine all cells contain the letter "a")):
                    //          1  2  3  4  5
                    //          -------------
                    //          a  a  a  a  a
                    //          a  X  X  a  a
                    //          a  a  X  X  a
                    //          a  a  a  a  a
                    //
                    //      yields ("'" marks an empty cell):
                    //          2  3  4
                    //          --------
                    //          a  a  '
                    //          '  a  a

                    element.addEventListener(evt.mousedown, function (event) {
                        var target = event.target, cellFromTarget = getCellFromTarget(target), closestCell, arrSelectedCells, i, len;

                        if (GS.findParentTag(event.target, 'table') || target.classList.contains('fixed-header-cell')) {
                            if (cellFromTarget) {
                                closestCell = cellFromTarget;
                            } else if (target.classList.contains('fixed-header-cell')) {
                                closestCell = element.theadElement.children[0].children[xtag.toArray(target.parentNode.children).indexOf(target)];
                            }

                            if (closestCell) {
                                element.dragAllowed = true;
                                element.dragCurrentCell = closestCell;
                                element.selectionSelectedCells = [];

                                // if shift is down and there is a previous origin: use previous origin for current origin
                                if (event.shiftKey && element.selectionPreviousOrigin) {

                                    // if there are previously selected cells: deselect the previous selected cells
                                    if (element.selectionPreviousSelectedCells) {
                                        arrSelectedCells = element.selectedCells;

                                        i = 0;
                                        len = element.selectionPreviousSelectedCells.length;
                                        while (i < len) {
                                            arrSelectedCells.splice(arrSelectedCells.indexOf(element.selectionPreviousSelectedCells[i]), 1);
                                            i += 1;
                                        }

                                        element.selectedCells = arrSelectedCells;
                                    }

                                    element.dragOrigin = element.selectionPreviousOrigin;
                                    element.dragMode = 'select';

                                // else if ctrl or cmd is down and the target cell is not selected: select cells from target cell to current cell
                                } else if (!event.shiftKey && (event.metaKey || event.ctrlKey) && !closestCell.hasAttribute('selected')) {
                                    element.dragOrigin = closestCell;
                                    element.dragMode = 'select';

                                // else if ctrl or cmd is down and the target cell is selected: deselect cells from target cell to current cell
                                } else if (!event.shiftKey && (event.metaKey || event.ctrlKey) && closestCell.hasAttribute('selected')) {
                                    element.dragOrigin = closestCell;
                                    element.dragMode = 'deselect';

                                // else: deselect all cells and start new selection
                                } else {
                                    element.selectedCells = [];
                                    element.dragOrigin = closestCell;
                                    element.dragMode = 'select';
                                }

                                selectHandler(element, element.dragOrigin, element.dragCurrentCell, element.dragMode);
                            }
                        }
                    });
                    element.addEventListener(evt.mousemove, function (event) {
                        var target, closestCell, cellFromTarget;

                        // if mouse is down
                        if (event.which !== 0) {
                            target = event.target;
                            cellFromTarget = getCellFromTarget(target);

                            if (cellFromTarget) {
                                closestCell = cellFromTarget;
                            } else if (target.classList.contains('fixed-header-cell')) {
                                closestCell =
                                    element.theadElement.children[0].children[xtag.toArray(target.parentNode.children).indexOf(target)];
                            }

                            // if selection is allowed at this point and closestCell is different from element.dragCurrentCell
                            if (closestCell && element.dragAllowed && element.dragCurrentCell !== closestCell) {
                                element.dragCurrentCell = getCellFromTarget(closestCell);
                                selectHandler(element, element.dragOrigin, element.dragCurrentCell, element.dragMode);
                            }
                        } else {
                            element.dragAllowed = false;
                            element.selectionPreviousOrigin = element.dragOrigin;
                            element.selectionPreviousSelectedCells = element.selectionSelectedCells;
                        }
                    });
                    element.addEventListener(evt.mouseup, function (event) {
                        element.dragAllowed = false;

                        if (element.dragMode === 'select') {
                            element.selectionPreviousOrigin = element.dragOrigin;
                            element.selectionPreviousSelectedCells = element.selectionSelectedCells;
                        }
                    });

                // else we are on a touch device: record selection
                } else {
                    element.root.addEventListener(evt.mousedown, function (event) {
                        if (event.target.nodeName === 'TD' || event.target.nodeName === 'TH' || getCellFromTarget(event.target)) {
                            element.selectedCells = [];

                            // if there is a parent record to the target: select all of the cells in the record
                            if (GS.findParentTag(event.target, 'tr')) {
                                element.selectedCells = GS.findParentTag(event.target, 'tr').children;
                            }
                        }
                    });
                }

                window.addEventListener('resize', function () {
                    element.refreshFixedHeader();
                    element.refreshHeight();
                    element.refreshReflow();
                });
                window.addEventListener('orientationchange', function () {
                    element.refreshFixedHeader();
                    element.refreshHeight();
                    element.refreshReflow();
                });
                element.addEventListener('size-changed', function (event) {
                    element.refreshFixedHeader();
                    element.refreshHeight();
                    //element.refreshReflow();
                });

                // key navigation
                element.addEventListener('keydown', function (event) {
                    var target = event.target, intKeyCode = event.which || event.keyCode, jsnSelection, bolCursorElement, i, len,
                        focusElement, tbodyElement, recordElement, cellElement, cellElements, tempElement;

                    if (target !== element) {
                        bolCursorElement = target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA';

                        if (bolCursorElement) {
                            jsnSelection = GS.getInputSelection(target);
                        } else {
                            jsnSelection = {};
                        }

                        // up arrow
                        if (intKeyCode === 38) {
                            //console.log('if there is a record before this one: focus the same column in the previous record');

                            cellElement = getCellFromTarget(target);
                            recordElement = cellElement.parentNode;
                            tbodyElement = recordElement.parentNode;

                            if (recordElement.rowIndex > 1) { // recordIndex > 0
                                recordElement = tbodyElement.children[recordElement.rowIndex - 2];

                                focusElement = xtag.query(recordElement.children[cellElement.cellIndex], '[column]')[0];
                            }

                        // down arrow
                        } else if (intKeyCode === 40) {
                            //console.log('if there is another record after this one: focus the same column in the next record');

                            cellElement = getCellFromTarget(target);
                            recordElement = cellElement.parentNode;
                            tbodyElement = recordElement.parentNode;

                            if (recordElement.rowIndex < tbodyElement.children.length) {
                                recordElement = tbodyElement.children[recordElement.rowIndex];

                                //focusElement = recordElement.children[cellElement.cellIndex].children[0];
                                focusElement = xtag.query(recordElement.children[cellElement.cellIndex], '[column]')[0];
                            }

                        // if left or right arrow
                        } else if (intKeyCode === 37 || intKeyCode === 39) {
                            // left arrow and (at the beginning of the target OR target has no selected)
                            if (intKeyCode === 37 && (bolCursorElement === false || jsnSelection.start === 0)) {
                                //console.log('previous control if possible');

                                cellElement = getCellFromTarget(target);
                                recordElement = cellElement.parentNode;
                                tbodyElement = recordElement.parentNode;

                                cellElements = xtag.query(tbodyElement, 'tr > td, tr > th');

                                // loop through previous cells looking for something focusable
                                i = cellElements.indexOf(cellElement) - 1;
                                while (i > -1) {
                                    //console.log(i);

                                    tempElement = xtag.query(cellElements[i], '[column]')[0];

                                    if (tempElement && GS.isElementFocusable(tempElement)) { // tempElement.control
                                        focusElement = tempElement; // tempElement.control

                                        break;
                                    }
                                    i -= 1;
                                }

                            // right arrow and (at the end of the target OR target has no selected)
                            } else if (intKeyCode === 39 && (bolCursorElement === false || jsnSelection.end === target.value.length)) {
                                cellElement = getCellFromTarget(target);
                                recordElement = cellElement.parentNode;
                                tbodyElement = recordElement.parentNode;

                                cellElements = xtag.query(tbodyElement, 'tr > td, tr > th');

                                // loop through previous cells looking for something focusable
                                i = cellElements.indexOf(cellElement) + 1;
                                len = cellElements.length;
                                while (i < len) { // - 1
                                    tempElement = xtag.query(cellElements[i], '[column]')[0];

                                    if (tempElement && GS.isElementFocusable(tempElement)) { // tempElement.control
                                        focusElement = tempElement; // tempElement.control
                                        break;
                                    }
                                    i += 1;
                                }
                            }
                        }

                        if (focusElement && GS.isElementFocusable(focusElement)) {
                            event.preventDefault();

                            focusElement.focus();

                            if (document.activeElement.nodeName === 'INPUT' || document.activeElement.nodeName === 'TEXTAREA') {
                                GS.setInputSelection(document.activeElement, 0, document.activeElement.value.length);
                            }

                            element.selectedRecords = GS.findParentTag(focusElement, 'TR');
                        }
                    }
                });

                // copy event
                element.tabIndex = 0;
                document.body.addEventListener('copy', function (event) {//console.log('test');
                    var elementClosestEnvelope = GS.findParentTag(document.activeElement, 'gs-envelope'), strCopyString,
                        i, len, cell_i, cell_len, arrSelected, intFromRecord = 9999999, intFromCell = 9999999, intToRecord = 0, intToCell = 0,
                        strCellText, arrRecords, arrCells, strRecordString;

                    if (elementClosestEnvelope === element &&
                        (
                            document.activeElement.classList.contains('gs-envelope-copy-focus-target') ||
                            document.activeElement.selectionStart === document.activeElement.selectionEnd
                        )) {
                        arrSelected = element.selectedCells;

                        // loop through the selected cells and create a tsv string using the text of the cell
                        if (arrSelected.length > 0) {
                            i = 0;
                            len = arrSelected.length;
                            while (i < len) {
                                if (arrSelected[i].parentNode.rowIndex < intFromRecord) {
                                    intFromRecord = arrSelected[i].parentNode.rowIndex;
                                }
                                if (arrSelected[i].cellIndex < intFromCell) {
                                    intFromCell = arrSelected[i].cellIndex;
                                }
                                if (arrSelected[i].parentNode.rowIndex + 1 > intToRecord) {
                                    intToRecord = arrSelected[i].parentNode.rowIndex + 1;
                                }
                                if (arrSelected[i].cellIndex + 1 > intToCell) {
                                    intToCell = arrSelected[i].cellIndex + 1;
                                }
                                i += 1;
                            }

                            arrRecords = xtag.query(element.scrollContainerElement, 'tr');
                            strCopyString = '';

                            i = intFromRecord;
                            len = intToRecord;
                            while (i < len) {
                                arrCells = arrRecords[i].children;

                                cell_i = intFromCell;
                                cell_len = intToCell;
                                strRecordString = '';
                                while (cell_i < cell_len) {
                                    if (arrCells[cell_i].hasAttribute('selected')) {
                                        if (arrCells[cell_i].lastElementChild) {
                                            strCellText = arrCells[cell_i].lastElementChild.textValue ||
                                                          arrCells[cell_i].lastElementChild.value ||
                                                          (arrCells[cell_i].lastElementChild.checked || '').toString();
                                        } else {
                                            strCellText = arrCells[cell_i].textContent.trim();
                                        }
                                    } else {
                                        strCellText = '';
                                    }

                                    strRecordString += (cell_i !== intFromCell ? '\t' : '') + (strCellText || '');
                                    cell_i += 1;
                                }
                                if (strRecordString.trim()) {
                                    strCopyString += strRecordString;
                                }
                                if (i + 1 !== len && strRecordString.trim()) {
                                    strCopyString += '\n';
                                }
                                i += 1;
                            }
                        }

                        if (strCopyString) {
                            if (handleClipboardData(event, strCopyString)) {
                                event.preventDefault(event);
                            }
                        }
                    }
                });

                // getData
                refreshHud(element);
                getData(element);
            }
        }
    }

    xtag.register('gs-envelope', {
        lifecycle: {
            created: function () {
                //console.log(this.outerHTML);
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

                } else if (strAttrName === 'template') {
                    var tableTemplateElement, tableTemplateElementCopy, recordElement, element = this, i, len;
                    tableTemplateElement  = element.templates[element.getAttribute('template') || 'default'];
                    //console.log(tableTemplateElement);
                    if (!tableTemplateElement && element.hasAttribute('template')) {
                        console.warn('ENVELOPE WARNING: Hey! You used the name of a non-existant record template!');
                        tableTemplateElement = element.templates['default'];
                    }
                    //console.log(tableTemplateElement);

                    if (tableTemplateElement) {
                        //console.log(tableTemplateElement);
                        tableTemplateElementCopy = document.createElement('template');
                        tableTemplateElementCopy.innerHTML = tableTemplateElement.innerHTML;

                        recordElement = xtag.query(xtag.query(tableTemplateElementCopy.content, 'tbody')[0], 'tr')[0];

                        if (recordElement) {
                            // add a data- attribute for all where columns (most of the time: id and change_stamp)
                            i = 0;
                            len = element.arrWhereColumns.length;
                            while (i < len) {
                                recordElement.setAttribute('data-' + element.arrWhereColumns[i], '{{! row.' + element.arrWhereColumns[i] + ' }}');
                                i += 1;
                            }

                            // add a doT.js coded "value" attribute to any element with a "column" attribute but no "value" attribute
                            element.tableTemplate = GS.templateColumnToValue(tableTemplateElementCopy.innerHTML);
                        }
                    } else {
                        throw 'Envelope error: table template is required.';
                    }
                } else if (!this.hasAttribute('suspend-created') && !this.hasAttribute('suspend-inserted')) {
                    if (strAttrName === 'no-hudlimit' ||
                        strAttrName === 'no-hudorderby' ||
                        strAttrName === 'no-huddelete' ||
                        strAttrName === 'no-hudrefresh') {
                        refreshHud(this);

                    // this.root is here becuase of an issue where refresh was called before the envelope was initialized
                    } else if (strAttrName === 'value' && this.root) {
                        this.refresh();
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
                    getData(this);
                }
            },
            selectedCells: {
                get: function () {
                    return xtag.query(this.scrollContainerElement, '[selected]');
                },

                set: function (newValue) {
                    var i, len, intIdIndex, arrCells = xtag.query(this.scrollContainerElement, '[selected]'), arrRecords, cell_i, cell_len,
                        fixedHeaderCells = xtag.queryChildren(this.fixedHeaderContainerElement, '.fixed-header-cell');

                    //console.log(arrRecords);

                    // clear old selection
                    i = 0;
                    len = fixedHeaderCells.length;
                    while (i < len) {
                        fixedHeaderCells[i].removeAttribute('selected');
                        i += 1;
                    }
                    i = 0;
                    len = arrCells.length;
                    while (i < len) {
                        arrCells[i].removeAttribute('selected');
                        i += 1;
                    }

                    arrCells = xtag.query(this.scrollContainerElement, '[selected-secondary]');
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

                    // set new selection
                    i = 0;
                    len = arrCells.length;
                    while (i < len) {
                        arrCells[i].setAttribute('selected', '');

                        if (arrCells[i].parentNode.parentNode.nodeName === 'THEAD') {
                            fixedHeaderCells[arrCells[i].cellIndex].setAttribute('selected', '');
                        }

                        i += 1;
                    }

                    arrRecords = this.selectedRecords;

                    i = 0;
                    len = arrRecords.length;
                    while (i < len) {
                        arrCells = arrRecords[i].children;
                        cell_i = 0;
                        cell_len = arrCells.length;
                        while (cell_i < cell_len) {
                            if (!arrCells[cell_i].hasAttribute('selected')) {
                                arrCells[cell_i].setAttribute('selected-secondary', '');
                            }
                            cell_i += 1;
                        }
                        i += 1;
                    }

                    GS.triggerEvent(this, 'after_selection');
                }
            },
            selectedRecords: {
                get: function () {
                    var i, len, intRecordIndex = -1, arrRecord = [], selected = this.selectedCells;

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
                    var intIdIndex;
                    var arrCells = this.selectedCells;
                    var arrRecords;
                    var arrCellChildren;
                    var fixedHeaderCells = xtag.queryChildren(this.fixedHeaderContainerElement, '.fixed-header-cell');

                    // clear old selection
                    i = 0;
                    len = arrCells.length;
                    while (i < len) {
                        arrCells[i].removeAttribute('selected');

                        if (arrCells[i].parentNode.parentNode.nodeName === 'THEAD') {
                            fixedHeaderCells[arrCells[i].cellIndex].removeAttribute('selected', '');
                        }

                        i += 1;
                    }

                    arrCells = xtag.query(this.scrollContainerElement, '[selected-secondary]');
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
                    i = 0;
                    len = arrRecords.length;
                    arrCells = [];
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

                    GS.triggerEvent(this, 'after_selection');
                }
            },
            selectedIds: {
                get: function () {
                    var i;
                    var len;
                    var arrID = [];
                    var selected = this.selectedRecords;

                    // loop through the selected records and create an array of ids
                    i = 0;
                    len = selected.length;
                    while (i < len) {
                        arrID.push(String(selected[i].dataset.id));
                        //arrID.push(String(selected[i].parentNode.dataset.id));
                        i += 1;
                    }

                    return arrID;
                },

                set: function (newValue) {
                    var i;
                    var len;
                    var cell_i;
                    var cell_len;
                    var arrCells = this.selectedCells; // intIdIndex,
                    var arrRecords = xtag.query(this.scrollContainerElement, 'tbody > tr');

                    //console.log(arrRecords);

                    // clear old selection
                    i = 0;
                    len = arrCells.length;
                    while (i < len) {
                        arrCells[i].removeAttribute('selected');
                        i += 1;
                    }

                    arrCells = xtag.query(this.scrollContainerElement, '[selected-secondary]');
                    i = 0;
                    len = arrCells.length;
                    while (i < len) {
                        arrCells[i].removeAttribute('selected-secondary');
                        i += 1;
                    }

                    // if newValue is not an array: make it an array
                    if (typeof newValue !== 'object') {
                        newValue = [String(newValue)];

                    // else: cast all new values to strings
                    } else {
                        i = 0;
                        len = newValue.length;
                        while (i < len) {
                            newValue[i] = String(newValue[i]);
                            i += 1;
                        }
                    }

                    // set new selection
                    i = 0;
                    len = arrRecords.length;
                    while (i < len) {

                        if (newValue.indexOf(arrRecords[i].getAttribute('data-id')) > -1) {//String(.dataset.id) === String()
                            arrCells = arrRecords[i].children;

                            cell_i = 0;
                            cell_len = arrCells.length;
                            while (cell_i < cell_len) {
                                arrCells[cell_i].setAttribute('selected', '');
                                cell_i += 1;
                            }
                        }
                        i += 1;
                    }

                    GS.triggerEvent(this, 'after_selection');
                }
            }
        },
        methods: {
            // just a semantic alias to the getData function
            refresh: function () {
                getData(this);
            },

            refreshReflow: function () {
                var intEnvelopeWidth = this.scrollContainerElement.clientWidth + 1,
                    bolCurrentlyReflowed,
                    intWindowWidth = window.innerWidth,
                    intReflowAt = parseInt(this.getAttribute('reflow-at'), 10);

                if (this.reflowBreakPoint === undefined) {
                    this.reflowBreakPoint = 0;
                }

                //console.log('check for reflow', window.innerWidth, this.reflowBreakPoint,
                // this.scrollContainerElement.clientWidth < this.scrollContainerElement.scrollWidth);

                bolCurrentlyReflowed = this.classList.contains('reflow');
                this.classList.remove('reflow');

                //console.log(intEnvelopeWidth, this.scrollContainerElement.scrollWidth);
                //console.log('envWidth    ', intEnvelopeWidth);
                //console.log('scrollWidth ', this.scrollContainerElement.scrollWidth);
                //console.log('reflowAt    ', this.hasAttribute('reflow-at'));
                //console.log('intReflowAt ', intReflowAt);

                //if (intWindowWidth > this.reflowBreakPoint) {
                if ((
                        intEnvelopeWidth < this.scrollContainerElement.scrollWidth &&
                        !this.hasAttribute('reflow-at')
                    ) ||
                    (
                        !isNaN(intReflowAt) &&
                        intEnvelopeWidth < intReflowAt
                    )) {
                    if (!bolCurrentlyReflowed) {
                        this.selectedCells = [];
                    }

                    this.reflowBreakPoint = intWindowWidth;
                    this.classList.add('reflow');

                } else {
                    if (bolCurrentlyReflowed) {
                        this.selectedCells = [];
                    }

                    this.reflowBreakPoint = 0;
                    this.classList.remove('reflow');
                }
            },

            refreshFixedHeader: function () {
                var elementFixedHeaderCells = xtag.queryChildren(this.fixedHeaderContainerElement, '.fixed-header-cell'),
                    theadCellElements, i, len, intLeft;

                if (this.theadElement && GS.getStyle(this.theadElement, 'display') !== 'none') {
                    //Why isn't this after we set the widths of the fixed header? -Joseph 10-01-15
                    this.fixedHeaderContainerElement.removeAttribute('hidden');
                    theadCellElements = xtag.query(this.theadElement, 'th, td');

                    i = 0;
                    len = theadCellElements.length;
                    intLeft = 0;
                    while (i < len) {
                        elementFixedHeaderCells[i].style.height = (theadCellElements[i].offsetHeight + 1) + 'px';
                        elementFixedHeaderCells[i].style.width = theadCellElements[i].offsetWidth + 'px';
                        elementFixedHeaderCells[i].style.left = (intLeft - this.scrollContainerElement.scrollLeft) + 'px';

                        intLeft += theadCellElements[i].offsetWidth;
                        i += 1;
                    }
                } else {
                    this.fixedHeaderContainerElement.setAttribute('hidden', '');
                }
            },

            refreshHeight: function () {
                var intHeight = 0;

                //console.log('1*** refreshHeight');

                // if this envelope is zero height: add expand to content automatically
                if (this.clientHeight === 0) {
                    this.setAttribute('expand-to-content', '');
                }

                //console.log('1-1*', this);
                //console.log('1-2*', this.hasAttribute('expand-to-content'));
                if (this.hasAttribute('expand-to-content')) {
                    //console.log('2***');
                    this.style.height = '';

                    intHeight += this.hudTopElement.scrollHeight;
                    //console.log('3***');
                    //intHeight += this.fixedHeaderContainerElement.scrollHeight;
                    intHeight += this.scrollContainerElement.scrollHeight;
                    intHeight += this.hudBottomElement.scrollHeight;
                    //console.log('4***', intHeight);

                    this.style.height = (intHeight + 5) + 'px'; // used to add 2
                    //console.log('5***', this.style.height);
                }
            }
        }
    });
});