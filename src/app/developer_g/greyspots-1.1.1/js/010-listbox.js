//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps, addFocusEvents, addDataAttributes
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    "use strict";
    addSnippet(
        'Static Template <gs-listbox>',
        '<gs-listbox>',
        (
            'gs-listbox>\n' +
            '    <template>\n' +
            '        <table>\n' +
            '            <tbody>\n' +
            '                <tr value="${1}">\n' +
            '                    <td>${0}</td>\n' +
            '                </tr>\n' +
            '            </tbody>\n' +
            '        </table>\n' +
            '    </template>\n' +
            '</gs-listbox>'
        )
    );
    addSnippet(
        'Custom Template <gs-listbox>',
        '<gs-listbox>',
        (
            'gs-listbox src="${1:test.tpeople}">\n' +
            '    <template>\n' +
            '        <table>\n' +
            '            <tbody>\n' +
            '                <tr value="{{! row.id }}">\n' +
            '                    <td>{{! row.${3:name} }}</td>\n' +
            '                </tr>\n' +
            '            </tbody>\n' +
            '        </table>\n' +
            '    </template>\n' +
            '</gs-listbox>'
        )
    );
    addSnippet(
        'Dynamic Template <gs-listbox>',
        '<gs-listbox>',
        'gs-listbox src="${1:test.tpeople}"></gs-listbox>'
    );
    addSnippet(
        '<gs-listbox>',
        '<gs-listbox>',
        'gs-listbox src="${1:test.tpeople}"></gs-listbox>'
    );
    addElement('gs-listbox', '#controls_listbox');

    window.designElementProperty_GSLISTBOX = function () {
        addGSControlProps();
        addDataAttributes('select');
        addText('V', 'Hide Columns', 'hide');
        addText('O', 'Column In QS', 'qs');
        addFocusEvents();
        addCheck('D', 'Dissallow&nbsp;Select', 'no-select');
        addCheck('V', 'Letter&nbsp;Scrollbar', 'letter-scrollbar');
        addCheck('V', 'Letter Dividers', 'letter-dividers');
        addText('O', 'Refresh On QS Columns', 'refresh-on-querystring-values');
        addCheck('O', 'Refresh On QS Change', 'refresh-on-querystring-change');
        addFlexProps();
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // removes selected class from old selected records adds class selected to record
    function highlightRecord(element, record) { //TODO: XLD
        var i;
        var len;
        var arrSelectedTrs;

        if (element.tableElement && xtag.queryChildren(element.tableElement, 'tbody')[0]) {
            // clear previous selection
            arrSelectedTrs = xtag.queryChildren(xtag.queryChildren(element.tableElement, 'tbody')[0], 'tr[selected]');

            i = 0;
            len = arrSelectedTrs.length;
            while (i < len) {
                arrSelectedTrs[i].removeAttribute('selected');
                arrSelectedTrs[i].removeAttribute('aria-selected');
                i += 1;
            }
        }

        // select/highlight the record that was provided
        if (record) {
            if (record.length >= 0) {

                i = 0;
                len = record.length;
                while (i < len) {
                    record[i].setAttribute('selected', '');
                    record[i].setAttribute('aria-selected', 'true');
                    i += 1;
                }
            } else {
                record.setAttribute('selected', '');
                var strHiddenValue = record.firstElementChild.textContent || ' ';

                //element.hiddenFocusControl.value = strHiddenValue || 'blank';
                //element.hiddenFocusControl.setAttribute('value', strHiddenValue || ' ');
                element.hiddenFocusControl.value = ',';
                element.hiddenFocusControl.setAttribute('aria-label', strHiddenValue || ' ');
                //GS.setInputSelection(element.hiddenFocusControl, 0, strHiddenValue.length);
                record.setAttribute('aria-selected', 'true');
                element.scrollContainer.setAttribute(
                    'aria-activedescendant',
                    'box-list-' + element.internal.id + '-item-' + (parseInt(record.getAttribute('data-record_no'), 10) - 1)
                );
            }
        }
    }

    // loops through the records and finds a record using the parameter
    function findRecordFromValue(element, searchValue) {
        var i;
        var len;
        var matchedRecord;
        var arrTrs;
        var strSearchString;

        if (element.tableElement && xtag.queryChildren(element.tableElement, 'tbody')[0]) {
            arrTrs = xtag.queryChildren(xtag.queryChildren(element.tableElement, 'tbody')[0], 'tr');
            strSearchString = String(searchValue);
            // #######################################################################################################################
            // #######################################################################################################################
            // #######################################################################################################################
            // #######################################################################################################################
            // #######################################################################################################################
            // #######################################################################################################################
            // #######################################################################################################################
            // ############## if this function is trying to find a td that doesn't exist uncomment the next three lines ##############
            // #######################################################################################################################
            // #######################################################################################################################
            // #######################################################################################################################
            // #######################################################################################################################
            // #######################################################################################################################
            // #######################################################################################################################
            // #######################################################################################################################
            // uncommented on 2022-02-02 by Nunzio
            // FTA was having an issue on a search screen that uses a Listbox
            // allegedly this was made redundant by using a thead, but it seems to still be necessary
            // looking at the page in question, there is a thead, but the first row of the tbody
            // still has the headers
            if (arrTrs[0]
                && arrTrs[0].children[0]
                && arrTrs[0].children[0].nodeName.toUpperCase() === 'TH') {
                arrTrs.splice(0,1);
            }
            // search exact text and search both the value attribute (if present) and the first td text
            i = 0;
            len = arrTrs.length;
            while (i < len) {
                if (arrTrs[i].getAttribute('value') === strSearchString || xtag.queryChildren(arrTrs[i], 'td')[0].textContent === strSearchString) {
                    matchedRecord = arrTrs[i];
                    break;
                }
                i += 1;
            }
        }

        return matchedRecord;
    }

    function getTRFromTarget(element) {
        var currentElement = element;

        while (currentElement.nodeName !== 'TR') {
            currentElement = currentElement.parentNode;
        }

        return currentElement;
    }

    function addTableAria(element) {
        var elemTable = xtag.query(element, 'table')[0];
        //var elemThead = xtag.query(elemTable, 'thead')[0];
        var elemTbody = xtag.query(elemTable, 'tbody')[0];
        //var elemTheadTRs = elemThead ? xtag.query(elemThead, 'tr') : null;
        var elemTbodyTRs = xtag.query(elemTbody, 'tr');
        //var cellElements;
        var i;
        var len;
        //var cell_i;
        //var cell_len;

        //elemTable.setAttribute('role', 'grid');
        //elemTheadTRs[0].setAttribute('role', 'row');

        //cellElements = xtag.toArray(elemTheadTRs[0].children);
        //i = 0;
        //len = cellElements.length;
        //while (i < len) {
        //    cellElements[i].setAttribute('role', '');

        //    i += 1;
        //}

        i = 0;
        len = elemTbodyTRs.length;
        while (i < len) {
            elemTbodyTRs[i].setAttribute('id', 'box-list-' + element.internal.id + '-item-' + i);

            elemTbodyTRs[i].setAttribute('role', 'option');
            if (elemTbodyTRs[i].children[0].nodeName === 'TH') {
                elemTbodyTRs[i].setAttribute('aria-label', elemTbodyTRs[i].children[1].textContent);
            } else {
                elemTbodyTRs[i].setAttribute('aria-label', elemTbodyTRs[i].children[0].textContent);
            }

            //cellElements = xtag.toArray(elemTbodyTRs[0].children);
            //cell_i = 0;
            //cell_len = cellElements.length;
            //while (cell_i < cell_len) {
            //    cellElements[i].setAttribute('role', '');

            //    cell_i += 1;
            //}

            i += 1;
        }
    }

    //boladd should be true if event.metaKey is true

    //if boladd is true:
    //  selected records that were clicked become non-selected
    //  non-select records that were clicked become selected

    // if bolShift is true and not negative:
    //  select from element.lastClicked to the clicked record
    // if bolShift is true and negative:
    //  de-select from element.lastClicked to the clicked record
    //
    //

    function selectRecord(element, handle, bolChange, bolAdd, strType, bolShift) {
        var i;
        var len;
        var arrRecords;
        var record;
        var arrSelectedRecords;
        var clickFrom;
        var newClicked;
        var arrOrigins;
        var arrAllRecords;
        var bolDeselect;
        var intDistanceBetween;
        var intSelected;
        var bolRemoveClicked;
        var arrRecordsToAffect;

        if (!element.hasAttribute('no-select') && element.tableElement) {
            arrSelectedRecords = xtag.queryChildren(xtag.queryChildren(element.tableElement, 'tbody')[0], 'tr[selected], tr[selected-secondary]');

            if (!bolAdd && !bolShift) {
                arrRecords = xtag.query(xtag.queryChildren(element.tableElement, 'tbody')[0], 'tr');
                element.secondLastClicked = null;
                i = 0;
                len = arrRecords.length;
                while (i < len) {
                    arrRecords[i].removeAttribute('selected');
                    arrRecords[i].removeAttribute('aria-selected');
                    if (arrRecords[i].classList.contains('originTR')) {
                        arrRecords[i].classList.remove('originTR');
                    }
                    i += 1;
                }
            }

            if (typeof handle === 'string' || typeof handle === 'number') {
                record = findRecordFromValue(element, handle);
                if (!record && handle !== '') {
                    console.warn('Listbox warning: record not found' + (typeof handle === 'string' ? ': "' + handle + '"' : ''));
                }
            } else {
                record = handle;
            }

            if (element.hasAttribute('multi-select')) {
                if (handle.length >= 0) {
                    record = record;
                } else {
                    record = [record];
                }
            }

            if (bolShift && strType === 'down') {
                arrOrigins = xtag.query(xtag.queryChildren(element.tableElement, 'tbody')[0], 'tr.originTR');
                arrAllRecords = xtag.query(xtag.queryChildren(element.tableElement, 'tbody')[0], 'tr');
                intDistanceBetween = 0;
                intSelected = 0;
                bolRemoveClicked = false;

                //if we have a lastClicked
                //    use that
                //else if we have an originTR
                //    use that
                //else if there is one selected record
                //    use that
                if (element.lastClicked) {
                    clickFrom = element.lastClicked;
                } else if (arrOrigins.length === 1) {
                    clickFrom = arrOrigins[0].getAttribute('data-record_no');
                } else if (arrSelectedRecords.length === 1) {
                    clickFrom = arrSelectedRecords[0].getAttribute('data-record_no');
                }

                //get the record that was just clicked
                if (typeof handle === 'object' && handle.tagName) {
                    newClicked = parseInt(handle.getAttribute('data-record_no'), 10);
                }

                if (newClicked) {
                    //find how many are selected between clickFrom and newClicked
                    if (clickFrom < newClicked) {
                        i = clickFrom;
                        len = newClicked;
                        while (i < len) {
                            if (handle.hasAttribute('selected') || handle.hasAttribute('selected-secondary')) {
                                intSelected += 1;
                            }
                            i += 1;
                        }
                    } else {
                        i = newClicked - 1;
                        len = clickFrom - 1;
                        while (i < len) {
                            if (handle.hasAttribute('selected') || handle.hasAttribute('selected-secondary')) {
                                intSelected += 1;
                            }
                            i += 1;
                        }
                    }

                    if (clickFrom < newClicked) {
                        intDistanceBetween = newClicked - clickFrom;
                    } else {
                        intDistanceBetween = clickFrom - newClicked;
                    }

                    //if all of the records are selected
                    //    bolDeselect = true
                    //else
                    //    bolDeselect = false
                    if (intDistanceBetween <= intSelected) {
                        bolDeselect = true;
                    } else {
                        bolDeselect = false;
                    }


                    //console.log(bolDeselect, intDistanceBetween, intSelected);
                    //if clickFrom is higher in the list than newClicked
                    //    select down from clickFrom to newClicked
                    //else
                    //    select down from newClicked to clickFrom
                    if (clickFrom < newClicked) {
                        if (bolDeselect) {
                            clickFrom -= 1;
                            newClicked -= 1;
                        }
                        i = clickFrom;
                        len = newClicked;
                        while (i < len) {
                            if (bolDeselect) {
                                if (arrAllRecords[i].hasAttribute('selected')) {
                                    arrAllRecords[i].removeAttribute('selected');
                                    arrAllRecords[i].removeAttribute('aria-selected');
                                }
                                if (arrAllRecords[i].hasAttribute('selected-secondary')) {
                                    arrAllRecords[i].removeAttribute('selected-secondary');
                                }
                            } else {
                                arrAllRecords[i].setAttribute('selected', '');
                                arrAllRecords[i].setAttribute('aria-selected', 'true');
                            }
                            arrAllRecords[i].classList.remove('originTR');
                            i += 1;
                        }
                    } else {
                        if (bolDeselect) {
                            newClicked += 1;
                            clickFrom += 1;
                        }
                        i = newClicked - 1;
                        len = clickFrom;
                        while (i < len) {
                            if (bolDeselect) {
                                if (arrAllRecords[i].hasAttribute('selected')) {
                                    arrAllRecords[i].removeAttribute('selected');
                                    arrAllRecords[i].removeAttribute('aria-selected');
                                }
                                if (arrAllRecords[i].hasAttribute('selected-secondary')) {
                                    arrAllRecords[i].removeAttribute('selected-secondary');
                                }
                            } else {
                                arrAllRecords[i].setAttribute('selected', '');
                                arrAllRecords[i].setAttribute('aria-selected', 'true');
                            }
                            arrAllRecords[i].classList.remove('originTR');
                            i += 1;
                        }
                    }
                }


                //if bolDeselect is false
                //    deselect from clickFrom to the first non-selected record
                if (!bolDeselect) {
                    if (clickFrom < newClicked) {
                        if (element.secondLastClicked > clickFrom && element.secondLastClicked < newClicked) {
                            bolRemoveClicked = true;
                        }
                    } else {
                        if (element.secondLastClicked < clickFrom && element.secondLastClicked > newClicked) {
                            bolRemoveClicked = true;
                        }
                    }

                    if (bolRemoveClicked) {
                        if (clickFrom < newClicked) {
                            i = element.secondLastClicked - 2;
                            while (i > 0) {
                                arrAllRecords[i].classList.remove('originTR');

                                if (arrAllRecords[i].hasAttribute('selected')) {
                                    arrAllRecords[i].removeAttribute('selected');
                                    arrAllRecords[i].removeAttribute('aria-selected');
                                } else if (arrAllRecords[i].hasAttribute('selected-secondary')) {
                                    arrAllRecords[i].removeAttribute('selected-secondary');
                                } else {
                                    break;
                                }

                                i -= 1;
                            }
                        } else {
                            i = element.secondLastClicked;
                            len = arrAllRecords.length;
                            while (i < len) {
                                arrAllRecords[i].classList.remove('originTR');
                                if (arrAllRecords[i].hasAttribute('selected')) {
                                    arrAllRecords[i].removeAttribute('selected');
                                    arrAllRecords[i].removeAttribute('aria-selected');
                                } else if (arrAllRecords[i].hasAttribute('selected-secondary')) {
                                    arrAllRecords[i].removeAttribute('selected-secondary');
                                } else {
                                    break;
                                }

                                i += 1;
                            }
                        }
                    }
                }

            } else if (strType === 'down') {
                element.originTR = record[0];

                if (bolAdd && handle.hasAttribute('selected') && arrSelectedRecords.length > 1) {
                    handle.removeAttribute('selected');
                    handle.removeAttribute('aria-selected');
                    if (handle.classList.contains('originTR')) {
                        handle.classList.remove('originTR');
                    }
                } else {
                    element.originTR.setAttribute('selected-secondary', '');
                }
            } else if (strType === 'move' && !bolShift) {
                var arrSelectedTrs = xtag.queryChildren(xtag.queryChildren(element.tableElement, 'tbody')[0], 'tr[selected-secondary]');

                arrRecords = xtag.query(xtag.queryChildren(element.tableElement, 'tbody')[0], 'tr');
                arrRecordsToAffect = arrRecords.slice(
                    (Math.min(element.originTR.getAttribute('data-record_no'), record[0].getAttribute('data-record_no')) - 1),
                    (Math.max(element.originTR.getAttribute('data-record_no'), record[0].getAttribute('data-record_no')))
                );

                i = 0;
                len = arrRecordsToAffect.length;
                while (i < len) {
                    arrRecordsToAffect[i].setAttribute('selected-secondary', '');
                    i += 1;
                }

            } else if (strType === 'up') {
                if (element.tableElement && xtag.queryChildren(element.tableElement, 'tbody')[0]) {
                    // clear previous selection
                    arrSelectedTrs = xtag.queryChildren(xtag.queryChildren(element.tableElement, 'tbody')[0], 'tr[selected-secondary]');

                    i = 0;
                    len = arrSelectedTrs.length;
                    while (i < len) {
                        arrSelectedTrs[i].removeAttribute('selected-secondary');
                        arrSelectedTrs[i].setAttribute('selected', '');
                        arrSelectedTrs[i].setAttribute('aria-selected', 'true');
                        i += 1;
                    }
                }
                if (record[0]) {
                    //console.trace('triggerchange 1');
                    element.triggerChange();
                }
            } else if (record) {
                // highlightRecord has its own checking for no record supplied,
                // so this deselects any rows then selects the supplied record or none
                if (element.hasAttribute('multi-select')) {
                    i = 0;
                    len = record.length;
                    while (i < len) {
                        record[i].setAttribute('selected', '');
                        record[i].setAttribute('aria-selected', 'true');
                        i += 1;
                    }
                } else {
                    record.setAttribute('selected', '');
                    var strHiddenValue = record.firstElementChild.textContent || ' ';
                    if (element.hiddenFocusControl) {
                        //element.hiddenFocusControl.value = strHiddenValue || 'blank';
                        //element.hiddenFocusControl.setAttribute('value', strHiddenValue || ' ');
                        element.hiddenFocusControl.value = ',';
                        element.hiddenFocusControl.setAttribute('aria-label', strHiddenValue || ' ');
                        //GS.setInputSelection(element.hiddenFocusControl, 0, strHiddenValue.length);
                    }
                    record.setAttribute('aria-selected', 'true');
                }
                //highlightRecord(element, record);
                element.triggerChange();
            } else if (!record && handle === '\\N') {
                element.setAttribute('value', '\\N');
                
            }

            if (element.originTR) {
                element.originTR.classList.add('originTR');
            }

            //Save last clicked tr no for Shift-selecting
            if (typeof handle === 'object' && handle.tagName && strType === 'down') {
                if (element.lastClicked) {
                    element.secondLastClicked = element.lastClicked;
                }
                element.lastClicked = parseInt(handle.getAttribute('data-record_no'), 10);
            }
        }
    }


    // #################################################################
    // ########################## USER EVENTS ##########################
    // #################################################################

    // handle behaviours on keydown
    function handleKeyDown(event) {
        var element = event.target;
        var intKeyCode = event.keyCode || event.which;
        var selectedTr;
        var trs;
        var i;
        var len;
        var selectedRecordIndex;

        if (element.tagName.toUpperCase() !== 'GS-LISTBOX') {
            element = GS.findParentTag(event.target, 'gs-listbox');
        }

        if (!element.hasAttribute('disabled')) {
            if (!element.hasAttribute('no-select')) {
                if ((intKeyCode === 40 || intKeyCode === 38) && (!event.shiftKey) && !event.metaKey && !event.ctrlKey && !element.error) {
                    trs = xtag.query(xtag.queryChildren(element.tableElement, 'tbody')[0], 'tr:not(.divider)');

                    i = 0;
                    len = trs.length;
                    while (i < len) {
                        if (trs[i].hasAttribute('selected')) {
                            selectedRecordIndex = i;
                            selectedTr = trs[i];
                            trs[i].removeAttribute('selected');
                            trs[i].removeAttribute('aria-selected');

                            break;
                        }
                        i += 1;
                    }

                    if (intKeyCode === 40) {// next record or circle to first record or start selection at the first
                        if (!selectedTr || selectedRecordIndex === trs.length - 1) {
                            highlightRecord(element, trs[0]);
                            selectedTr = trs[0];

                        } else {
                            highlightRecord(element, trs[selectedRecordIndex + 1]);
                            selectedTr = trs[selectedRecordIndex + 1];
                        }

                    } else if (intKeyCode === 38) {// prev record or circle to last record or start selection at the last
                        if (!selectedTr || selectedRecordIndex === 0) {
                            highlightRecord(element, trs[trs.length - 1]);
                            selectedTr = trs[trs.length - 1];

                        } else {
                            highlightRecord(element, trs[selectedRecordIndex - 1]);
                            selectedTr = trs[selectedRecordIndex - 1];
                        }
                    }

                    //GS.scrollIntoView(selectedTr);
                    element.scrollToSelectedRecord();
                    event.preventDefault();
                    event.stopPropagation();

                } else if (event.keyCode === 13) {
                    selectedTr = xtag.query(xtag.query(element.tableElement, 'tbody')[0], 'tr[selected]')[0];

                    if (element.tableElement && selectedTr) {
                        selectRecord(element, selectedTr, true);
                    }
                }
            }
        } else {
            if (event.keyCode !== 9) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }

    function handleFocusout(event) {
        //TODO: XLD
        /*
        var element = event.target, selectedTr;

        if (element.tableElement) {
            selectedTr = xtag.queryChildren(xtag.queryChildren(element.tableElement, 'tbody')[0], 'tr[selected]')[0];

            if (selectedTr) {
                selectRecord(element, selectedTr, true);
            }
        }
        */
    }


    // #################################################################
    // ######################### DATA HANDLING #########################
    // #################################################################

    // the user needs to be able to set a custom websocket for this element,
    //      so this function will use an attribute to find out what socket to
    //      use (and it'll default to "GS.envSocket")
    function getSocket(element) {
        if (element.getAttribute('socket')) {
            return GS[element.getAttribute('socket')];
        }
        return GS.envSocket;
    }

    // handles fetching the data
    //      if bolInitalLoad === true then
    //          use: initialize query COALESCE TO source query
    //      else
    //          use: source query
    function getData(element, callback, bolInitalLoad, bolClearPrevious) {
        var strSrc = GS.templateWithQuerystring(
            (bolInitalLoad && element.getAttribute('initialize'))
                ? element.getAttribute('initialize')
                : element.getAttribute('src')
        );
        var srcParts = strSrc[0] === '(' ? [strSrc, ''] : strSrc.split('.');
        var strSchema = srcParts[0];
        var strObject = srcParts[1];
        var strColumns = GS.templateWithQuerystring(element.getAttribute('cols') || '*').split(',').join('\t');
        var strWhere = GS.templateWithQuerystring(element.getAttribute('where') || '');
        var strOrd = GS.templateWithQuerystring(element.getAttribute('ord') || '');
        var strLimit = GS.templateWithQuerystring(element.getAttribute('limit') || '');
        var strOffset = GS.templateWithQuerystring(element.getAttribute('offset') || '');
        var response_i = 0;
        var response_len = 0;
        var arrTotalRecords = [];

        GS.triggerEvent(element, 'before_select');
        GS.triggerEvent(element, 'onbefore_select');
        if (element.hasAttribute('onbefore_select')) {
            new Function(element.getAttribute('onbefore_select')).apply(element);
        }

        GS.addLoader(element, 'Loading...');
        GS.requestSelectFromSocket(
            getSocket(element),
            strSchema,
            strObject,
            strColumns,
            strWhere,
            strOrd,
            strLimit,
            strOffset,
            function (data, error) {
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
                        GS.removeLoader(element);
                        element.arrColumnNames = data.arrColumnNames;

                        envData = {'arr_column': element.arrColumnNames, 'dat': arrTotalRecords};

                        handleData(element, bolInitalLoad, envData);
                        GS.triggerEvent(element, 'after_select');
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }
                } else {
                    handleData(element, bolInitalLoad, data, error);
                    GS.removeLoader(element);
                }
            }
        );
    }

    // handles data result from method function: getData
    //      success:  template
    //      error:    add error classes
    function handleData(element, bolInitalLoad, data, error) {
        var strTemplate;
        var divElement;
        var tableElement;
        var theadElement;
        var theadCellElements;
        var tbodyElement;
        var tbodyCellElements;
        var lastRecordElement;
        var recordElements;
        var recordElement;
        var currentCellLabelElement;
        var template;
        var i;
        var len;
        var arrHeaders = [];
        var arrHide;
        var intVisibleColumns;
        var strHeaderCells;
        var strRecordCells;
        var jsnTemplate;
        var strHTML;

        // clear any old error status
        element.classList.remove('error');
        element.setAttribute('title', '');

        // if there was no error
        if (!error) {
            element.error = false;

            if (element.tableTemplate) {// element.tableTemplateElement
                strTemplate = element.tableTemplate;// element.tableTemplateElement
            } else {
                // create an array of hidden column numbers
                arrHide = (element.getAttribute('hide') || '').split(/[\s]*,[\s]*/);

                var strTableID = element.getAttribute('id');
                if (! strTableID) {
                    strTableID = GS.GUID();
                }

                // build up the header cells variable and the record cells variable
                strHeaderCells = '';
                strRecordCells = '';
                intVisibleColumns = 0;
                i = 0;
                len = data.arr_column.length;
                while (i < len) {
                    // if this column is not hidden
                    if (arrHide.indexOf((i + 1) + '') === -1 && arrHide.indexOf(data.arr_column[i]) === -1) {
                        // append a new cell to each of the header cells and record cells variables
                        strHeaderCells += '<th id="' + strTableID + '_' + data.arr_column[i] + '" gs-dynamic>' + encodeHTML(data.arr_column[i]) + '</th> ';
                        strRecordCells += '<td headers="' + strTableID + '_' + data.arr_column[i] + '" gs-dynamic>{{! row[\'' + data.arr_column[i] + '\'] }}</td> ';
                        intVisibleColumns += 1;
                    }
                    i += 1;
                }

                // put everything together
                strTemplate = '<table gs-dynamic>';

                if (intVisibleColumns > 1) { // data.arr_column.length (didn't take into account hidden columns)
                    strTemplate +=  '<thead gs-dynamic>' +
                                        '<tr gs-dynamic>' +
                                            strHeaderCells +
                                        '</tr>' +
                                    '</thead>';
                }

                strTemplate +=      '<tbody gs-dynamic>' +
                                        '<tr data-record_no="{{! row.row_number }}" value="{{! row[\'' + data.arr_column[0] + '\'] }}" gs-dynamic>' +
                                            strRecordCells +
                                        '</tr>' +
                                    '</tbody>' +
                                '</table>';
            }

            divElement = document.createElement('div');
            divElement.innerHTML = strTemplate;

            tableElement = xtag.queryChildren(divElement, 'table')[0];
            theadElement = xtag.queryChildren(tableElement, 'thead')[0];
            tbodyElement = xtag.queryChildren(tableElement, 'tbody')[0];

            // if there is a tbody
            if (tbodyElement) {
                recordElement = xtag.queryChildren(tbodyElement, 'tr')[0];

                // if there is a record: template
                if (recordElement) {

                    // if there is a thead element: add reflow cell headers to the tds
                    if (theadElement) {
                        theadCellElements = xtag.query(theadElement, 'td, th');
                        tbodyCellElements = xtag.query(tbodyElement, 'td, th');

                        i = 0;
                        len = theadCellElements.length;
                        while (i < len) {
                            currentCellLabelElement = document.createElement('b');
                            currentCellLabelElement.classList.add('cell-label');
                            currentCellLabelElement.setAttribute('data-text', (theadCellElements[i].textContent || '') + ':');

                            if (tbodyCellElements[i].childNodes) {
                                tbodyCellElements[i].insertBefore(currentCellLabelElement, tbodyCellElements[i].childNodes[0]);
                            } else {
                                tbodyCellElements[i].insertChild(currentCellLabelElement);
                            }
                            i += 1;
                        }
                    }

                    // template
                    jsnTemplate = GS.templateHideSubTemplates(tbodyElement.innerHTML, true);
                    strHTML = GS.templateWithEnvelopeData(jsnTemplate.templateHTML, data);
                    tbodyElement.innerHTML = GS.templateShowSubTemplates(strHTML, jsnTemplate);

                    element.tableElement = tableElement;
                    element.syncView();
                    element.internalData.records = data;
                }
            }

            if (theadElement && tbodyElement && theadElement.children[0] && theadElement.children[0].children) {
                tbodyElement.insertBefore(theadElement.children[0].cloneNode(true), tbodyElement.children[0]);
                var cols_i = 0;
                var cols_len = theadElement.children[0].children.length;
                element.tbodyheader = xtag.query(tbodyElement, 'tr:not([data-record_no])')[0];
                element.tbodyElement = tbodyElement;
                element.theadElement = theadElement;
                while (cols_i < cols_len) {
                    theadElement.children[0].children[cols_i].setAttribute(
                        'style',
                        'width: ' + element.tbodyheader.children[cols_i].clientWidth + 'px !important; padding-right: 0; padding-left: 0;'
                    );
                    cols_i++;
                }
            }

            if (bolInitalLoad && !element.getAttribute('value') && element.hasAttribute('select-first')) {
                selectRecord(element, xtag.query(element, 'tbody tr')[0].getAttribute('value'), false);
                element.scrollToSelectedRecord();
            }

            GS.triggerEvent(element, 'after_select');
            GS.triggerEvent(element, 'onafter_select');
            if (element.hasAttribute('onafter_select')) {
                new Function(element.getAttribute('onafter_select')).apply(element);
            }

        // else there was an error: add error class, title attribute
        } else {
            element.error = true;
            element.classList.add('error');
            element.setAttribute('title', 'This listbox has failed to load.');

            element.setAttribute('disabled', '');

            GS.ajaxErrorDialog(data);
        }
    }

    function getParentCell(element) {
        var currentElement = element;

        while (currentElement.nodeName !== 'TD' && currentElement.nodeName !== 'TH' && currentElement.nodeName !== 'HTML') {
            currentElement = currentElement.parentNode;
        }

        if (currentElement.nodeName !== 'TD' && currentElement.nodeName !== 'TH') {
            return undefined;
        }

        return currentElement;
    }

    function windowResizeHandler() {
        var i;
        var len;
        var arrElement;
        var element;
        var cols_i;
        var cols_len;

        arrElement = document.getElementsByTagName('gs-listbox');

        i = 0;
        len = arrElement.length;
        while (i < len) {
            if (GS.pxToEm(document.body, this.oldWidth) !== GS.pxToEm(document.body, this.offsetWidth) && // <== if the width (in ems) changes
                arrElement[i].hasAttribute('letter-scrollbar') &&
                arrElement[i].tableElement) {

                if (arrElement[i].hasAttribute('letter-dividers') || arrElement[i].hasAttribute('letter-scrollbar')) {
                    arrElement[i].refreshDividingPoints();
                }
                arrElement[i].letterScrollbarHandler();
                this.oldWidth = this.offsetWidth;
            }
            element = arrElement[i];
            if (element.theadElement && element.tbodyElement) {
                cols_i = 0;
                cols_len = element.theadElement.children[0].children.length;
                while (cols_i < cols_len) {
                    element.theadElement.children[0].children[cols_i].setAttribute('style', 'width: ' + element.tbodyheader.children[cols_i].clientWidth + 'px !important; padding-right: 0; padding-left: 0;');
                    cols_i++;
                }
            }
            i += 1;
        }
    }

    window.addEventListener('resize', windowResizeHandler);  // I want to debounce this event but that would require a timer -michael
    window.addEventListener('orientationchange', windowResizeHandler);

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

        element.supressChange = false;

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
                        element.supressChange = true;
                        element.setAttribute('value', strQSValue);
                    }
                } else if (element.value !== strQSValue) {
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
                console.warn('gs-listbox Warning: element has "refresh-on-querystring-values" or "refresh-on-querystring-change", but no "src".', element);
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
            // if the value was set before the "created" lifecycle code runs: set attribute
            //      (discovered when trying to set a value of a date control in the after_open of a dialog)
            //      ("delete" keyword added because of firefox)
            if (element.value && !element.getAttribute('value')) {
                element.setAttribute('value', element.value);
                delete element.value;
                //element.value = null;
            }

            if (!element.hasAttribute('role')) {
                element.setAttribute('role', 'listbox');
            }
        }
    }

    // ############# COPY EVENTS #############
    function unbindCopy(element) {
        element.removeEventListener(
            'copy',
            element.copySelection
        );
    }
    function bindCopy(element) {
        element.copySelection = function (event) {
            var jsnCopyString = {};
            var focusedElement;
            var i;
            var len;

            // saving the currently focused element for easy/quick access
            focusedElement = document.activeElement;

            // if the focus is on the hidden focus control of if the text
            //      selection of the currently focused element is not
            //      selecting multiple characters
            if (
                focusedElement.classList.contains('hidden-focus-control') ||
                focusedElement.selectionStart === focusedElement.selectionEnd
            ) {
                console.time('copy');

                // focus the hidden focus control and select all of it's text so
                //      that Firefox will allow us to override the clipboard
                focusedElement = element.hiddenFocusControl;
                focusedElement.focus();

                GS.setInputSelection(
                    focusedElement,
                    0,
                    focusedElement.value.length
                );

                jsnCopyString.text = '';
                jsnCopyString.html = '';

                // we want to override the text and HTML mime type clipboards,
                //      so we get the copy text for both types
                var selectedRecords = element.selectedRecord;
                if (selectedRecords[0]) {
                    i = 0;
                    len = selectedRecords.length;
                    while (i < len) {
                        if (i < 1) {
                            jsnCopyString.text += selectedRecords[i].innerText;
                            //jsnCopyString.html += selectedRecords[i].innerHTML;
                        } else {
                            jsnCopyString.text += '\n' + selectedRecords[i].innerText;
                            //jsnCopyString.html += '\n' + selectedRecords[i].innerHTML;
                        }
                        i += 1;
                    }
                //not multi-select
                } else {
                    jsnCopyString.text = selectedRecords.innerText;
                    //jsnCopyString.html = selectedRecords.innerHTML;
                }

                // override clipboard (prevent event default if we are
                //      successful)
                if (handleClipboardData(event, jsnCopyString.text, 'text')) {
                    event.preventDefault(event);
                }
                // if (handleClipboardData(event, jsnCopyString.html, 'html')) {
                //     event.preventDefault(event);
                // }

                console.timeEnd('copy');
            }
        };

        element.hiddenFocusControl.addEventListener(
            'copy',
            element.copySelection
        );
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
            throw 'handleClipboardData Error: Type "' + strType + '" not ' +
                    'recognized, recognized types are "text" and "html".';
        }

        if (strMime) {
            if (strCopyString && strMime) {
                return clipboardData.setData(strMime, strCopyString) !== false;
            } else {
                return clipboardData.getData(strMime);
            }
        }
    }

    function findFor(element) {
        var forElem;
        ////console.log(element, element.previousElementSibling)
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

    var intListID = 0;
    function elementInserted(element) {
        var tableTemplateElement;
        var arrElement;
        var recordElement;
        var tableTemplateElementCopy;
        var strQSValue;
        var i;
        var len;
        var currentElement;
        var trSet;
        var cols_i_1;
        var cols_len_1;

        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;
                element.error = false;
                element.internal = {};
                element.internalData = {};

                element.internal.id = intListID;
                intListID += 1;

                saveDefaultAttributes(element);
                // handle "qs" attribute
                if (
                    element.hasAttribute('qs') ||
                    element.hasAttribute('refresh-on-querystring-values') ||
                    element.hasAttribute('refresh-on-querystring-change')
                ) {
                    element.popValues = {};
                    //strQSValue = GS.qryGetVal(GS.getQueryString(), element.getAttribute('qs'));
                    //
                    //if (strQSValue !== '' || !element.getAttribute('value')) {
                    //    element.setAttribute('value', strQSValue);
                    //}

                    pushReplacePopHandler(element);
                    window.addEventListener('pushstate',    function () { pushReplacePopHandler(element); });
                    window.addEventListener('replacestate', function () { pushReplacePopHandler(element); });
                    window.addEventListener('popstate',     function () { pushReplacePopHandler(element); });
                    //element.popValues = GS.qryToJSON(GS.getQueryString());
                }

                // allows the element to have focus
                if (!element.hasAttribute('tabindex')) {
                    element.setAttribute('tabindex', '0');
                }

                element.skipFocus = false;

                // select for template
                tableTemplateElement = xtag.queryChildren(element, 'template')[0];
                if (tableTemplateElement && (tableTemplateElement.innerHTML.indexOf('&gt;') > -1 || tableTemplateElement.innerHTML.indexOf('&lt;') > -1)) {
                    console.warn('GS-LISTBOX WARNING: &gt; or &lt; detected in table template, this can have undesired effects on doT.js. Please use gt(x,y), gte(x,y), lt(x,y), or lte(x,y) to silence this warning.');
                }

                if (element.getAttribute('src') || element.getAttribute('source')) {
                    if (element.innerHTML.trim() !== '') {
                        trSet = xtag.query(tableTemplateElement.content, 'tbody > tr');//:not(.divider)');
                        i = 0;
                        len = trSet.length;
                        while (i < len) {
                            trSet[i].setAttribute('data-record_no', '{{! row.row_number }}');
                            i += 1;
                        }
                    }
                }

                if (tableTemplateElement) {
                    // add a doT.js coded "value" attribute to any element with a "column" attribute but no "value" attribute
                    element.tableTemplate = GS.templateColumnToValue(tableTemplateElement.innerHTML);
                }

                if (element.getAttribute('src') || element.getAttribute('source')) {
                    getData(element, '', true);
                } else {
                    if (tableTemplateElement) {
                        //developer provided template
                        element.tableElement = xtag.query(tableTemplateElement.content, 'table')[0];
                    } else if (xtag.queryChildren(element, 'table')[0]) {
                        element.tableElement = xtag.queryChildren(element, 'table')[0];
                    } else {
                        element.tableElement = document.createElement('table');
                    }

                    // loop through and add the data-record_no attribute
                    trSet = xtag.query(tableTemplateElement.content, 'tr');//:not(.divider)');
                    i = 0;
                    len = trSet.length;
                    while (i < len) {
                        trSet[i].setAttribute('data-record_no', i);
                        i += 1;
                    }

                    element.syncView();

                    var theadElement = xtag.query(element.tableElement, 'thead')[0];
                    var tbodyElement = xtag.query(element.tableElement, 'tbody')[0];
                    if (theadElement && tbodyElement && theadElement.children[0]) {
                        tbodyElement.insertBefore(theadElement.children[0].cloneNode(true), tbodyElement.children[0]);
                        //tbodyElement.innerHTML = theadElement.innerHTML + '' + tbodyElement.innerHTML;
                        cols_i_1 = 0;
                        cols_len_1 = theadElement.children[0].children.length;
                        element.tbodyheader = xtag.query(tbodyElement, 'tr[data-record_no="0"]')[0];
                        element.tbodyheader.removeAttribute('data-record_no');
                        element.tbodyElement = tbodyElement;
                        element.theadElement = theadElement;
                        while (cols_i_1 < cols_len_1) {
                            theadElement.children[0].children[cols_i_1].setAttribute('style', 'width: ' + element.tbodyheader.children[cols_i_1].clientWidth + 'px !important; padding-right: 0; padding-left: 0;');
                            cols_i_1++;
                        }
                    }
                }
            }
        }
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            if (element.hasAttribute('id')) {
                findFor(element);
            }
        }
    }

    xtag.register('gs-listbox', {
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
                    if (strAttrName === 'value' && newValue !== oldValue) {
                        this.value = newValue;
                    }
                }
            }
        },
        events: {},
        accessors: {
            value: {
                get: function () {
                    var element = this;
                    var arrResult = [];
                    var i;
                    var len;

                    if (element.tableElement) {
                        var arrRecords = xtag.queryChildren(xtag.queryChildren(element.tableElement, 'tbody')[0], 'tr[selected]');//:not(.divider)
                        if (element.getAttribute('value') === '\\N') {
                            return '\\N';
                        }
                        if (element.hasAttribute('multi-select')) {
                            if (element.internalData.records) {
                                i = 0;
                                len = arrRecords.length;
                                while (i < len) {
                                    if (element.internalData.records.dat[arrRecords[i].getAttribute('data-record_no') - 1]) {
                                        arrResult.push(element.internalData.records.dat[arrRecords[i].getAttribute('data-record_no') - 1][0]);
                                    }
                                    i += 1;
                                }
                                return arrResult;
                            } else {
                                return element.getAttribute('value');
                            }
                        }

                        // not multi-select
                        if (arrRecords.length > 0) {
                            if (element.internalData.records) {
                                if (element.internalData.records.dat[arrRecords[0].getAttribute('data-record_no') - 1]) {
                                    return element.internalData.records.dat[arrRecords[0].getAttribute('data-record_no') - 1][0];
                                }
                            } else {
                                return element.getAttribute('value');
                            }
                        }
                    }
                },

                set: function (strNewValue) {
                    selectRecord(this, strNewValue);
                    this.scrollToSelectedRecord();
                }
            },

            selectedRecord: {
                get: function () {
                    var element = this;
                    if (element.tableElement) {
                        var arrRecords = xtag.queryChildren(xtag.queryChildren(element.tableElement, 'tbody')[0], 'tr[selected]');

                        if (this.hasAttribute('multi-select')) {
                            return arrRecords;
                        } else {
                            return arrRecords[0];
                        }
                    }
                },

                set: function (newValue) {
                    selectRecord(this, newValue);
                    this.scrollToSelectedRecord();
                }
            },

            textValue: {
                get: function () {
                    var element = this;
                    var strResult;
                    var i;
                    var len;

                    if (element.tableElement) {
                        var arrRecords = xtag.queryChildren(xtag.queryChildren(element.tableElement, 'tbody')[0], 'tr[selected]');

                        if (this.hasAttribute('multi-select')) {
                            i = 0;
                            len = arrRecords.length;
                            while (i < len) {
                                if (xtag.queryChildren(arrRecords[i], 'td').length > 0) {
                                    strResult += xtag.queryChildren(arrRecords[i], 'td')[0].textContent;
                                }
                                i += 1;
                            }
                            return strResult;
                        } else {
                            return arrRecords[0].textContent;
                        }
                    }
                },

                set: function () {
                    selectRecord(this, strNewValue);
                    this.scrollToSelectedRecord();
                }
            }
        },
        methods: {
            // just a semantic alias to the getData function
            refresh: function (callback) {
                getData(this, callback);
            },

            column: function (strColumn) {
                var element = this;
                var arrStrResult = [];
                var i;
                var len;

                if (this.hasAttribute('multi-select')) {
                    i = 0;
                    len = this.selectedRecord.length;
                    while (i < len) {
                        arrStrResult.push(this.internalData.records.dat[this.selectedRecord[i].rowIndex][this.internalData.records.arr_column.indexOf(strColumn)]);
                        i += 1;
                    }
                    return arrStrResult;
                } else {
                    return this.internalData.records.dat[parseInt(this.selectedRecord.getAttribute('data-record_no'), 10) - 1][this.internalData.records.arr_column.indexOf(strColumn)];
                }
            },

            // #################################################################
            // ########### SELECTION / HIGHLIGHTING / RECORD / VALUE ###########
            // #################################################################

            // scroll the dropdown to the selected record
            scrollToSelectedRecord: function () {
                var selectedTr;

                if (this.tableElement) {
                    selectedTr = xtag.query(this.tableElement, 'tr[selected]')[0];

                    if (selectedTr) {
                        GS.scrollIntoView(selectedTr);
                    }
                }
            },

            // ################################################################
            // ####################### LETTER SCROLLBAR #######################
            // ################################################################

            letterScrollbarHandler: function () {
                var element = this;
                var i;
                var len;
                var intTextHeight;
                var intLettersDropped;
                var intSkipperHeight;
                var intElementHeight;
                var intDistance;
                var strHTML;
                var arrSkippers;

                // if there is no letter scrollbar container: create it
                if (xtag.queryChildren(element, '.letter-scrollbar-container').length === 0) {
                    element.letterScrollbarContainer = document.createElement('div');
                    element.letterScrollbarContainer.classList.add('letter-scrollbar-container');
                    element.letterScrollbarContainer.setAttribute('gs-dynamic', '');
                    element.appendChild(element.letterScrollbarContainer);

                // else: clear out the old letterScrollbarContainer
                } else {
                    element.letterScrollbarContainer.innerHTML = '';
                }

                if (element.clientHeight < element.scrollContainer.scrollHeight) {
                    intTextHeight = GS.getTextHeight(element.letterScrollbarContainer);
                    intSkipperHeight = intTextHeight * this.arrDividingPoints.length;
                    intElementHeight = element.clientHeight / this.arrDividingPoints.length;

                    if (intElementHeight < intTextHeight) {
                        intElementHeight = intTextHeight;
                    }

                    if (intSkipperHeight > element.clientHeight) {
                        intLettersDropped = 0;
                        while (intSkipperHeight > element.clientHeight && intLettersDropped < 100) {
                            intSkipperHeight -= intTextHeight;
                            intLettersDropped += 1;
                        }
                        intDistance = Math.ceil(this.arrDividingPoints.length / intLettersDropped);
                    }

                    i = 0;
                    len = this.arrDividingPoints.length;
                    strHTML = '';
                    while (i < len) {
                        if (intLettersDropped === undefined || (intLettersDropped > 0 && i % intDistance !== 0)) {
                            strHTML += '<div class="skipper" gs-dynamic ' +
                                            'style="height: ' + intElementHeight + 'px; line-height: ' + intElementHeight + 'px;" ' +
                                            'data-target-offset="' + this.arrDividingPoints[i].offset + '">' +
                                            '<span gs-dynamic>' + this.arrDividingPoints[i].letter + '</span>' +
                                        '</div>';
                        }
                        i += 1;
                    }

                    element.letterScrollbarContainer.innerHTML = strHTML;

                    if (element.paddingElement && element.paddingElement.parentNode === element.scrollContainer) {
                        element.scrollContainer.removeChild(element.paddingElement);
                    }

                    element.paddingElement = document.createElement('div');
                    element.paddingElement.setAttribute('gs-dynamic', '');
                    if (this.arrDividingPoints.length > 0) {
                    element.paddingElement.style.height = (element.clientHeight -
                                                        (element.scrollContainer.scrollHeight - parseInt(this.arrDividingPoints[this.arrDividingPoints.length - 1].offset, 10))) + 'px';
                    }
                    element.scrollContainer.appendChild(element.paddingElement);

                    // bind skipper click, mousedown-then-drag
                    arrSkippers = element.letterScrollbarContainer.children;

                    if (element.mousedownHandler) {
                        window.removeEventListener(evt.mousedown, element.mousedownHandler);
                        window.removeEventListener(evt.mousemove, element.mousemoveHandler);
                        window.removeEventListener(evt.mouseup, element.mouseupHandler);
                    }

                    element.clickHandler = function () {
                        element.style.webkitOverflowScrolling = 'initial';
                        element.scrollContainer.scrollTop = parseInt(this.getAttribute('data-target-offset'), 10);
                        element.style.webkitOverflowScrolling = 'touch';

                        //element.scrollContainer.className = element.scrollContainer.className;
                        //element.scrollContainer.style.outline = '1px solid #000000';
                        //element.scrollContainer.style.outline = '';
                    };
                    element.mousedownHandler = function (event) { // event
                        window.addEventListener(evt.mousemove, element.mousemoveHandler);
                        if (event.target.classList.contains('skipper') && evt.touchDevice) {
                            element.style.webkitOverflowScrolling = 'initial';
                        }
                        //element.mousemoveHandler(event);
                    };
                    element.mousemoveHandler = function (event) {
                        var jsnMousePosition, targetElement;

                        if (event.which !== 0 || evt.touchDevice) {
                            jsnMousePosition = GS.mousePosition(event);
                            targetElement = document.elementFromPoint(jsnMousePosition.left, jsnMousePosition.top);

                            if (targetElement) {
                                if (targetElement.nodeName === 'SPAN') {
                                    targetElement = targetElement.parentNode;
                                }

                                if (targetElement.classList.contains('skipper')) {
                                    element.style.webkitOverflowScrolling = 'initial';
                                    event.preventDefault();
                                    element.scrollContainer.scrollTop = parseInt(targetElement.getAttribute('data-target-offset'), 10);
                                }
                            }
                        } else {
                            window.removeEventListener(evt.mousemove, element.mousemoveHandler);
                        }
                    };
                    element.mouseupHandler = function () {
                        element.style.webkitOverflowScrolling = 'touch';
                        window.removeEventListener(evt.mousemove, element.mousemoveHandler);
                    };

                    element.addEventListener(evt.mousedown, element.mousedownHandler);
                    element.addEventListener(evt.mouseup, element.mouseupHandler);

                    i = 0;
                    len = arrSkippers.length;
                    while (i < len) {
                        arrSkippers[i].addEventListener('click', element.clickHandler);
                        i += 1;
                    }
                }
            },


            // #################################################################
            // ########################### UTILITIES ###########################
            // #################################################################

            refreshDividingPoints: function () {
                var tbodyElement, arrElement, arrLetter, dividerElement, strLetter, intOffset, numColumns, theadElement, i, len;

                tbodyElement = xtag.queryChildren(this.tableElement, 'tbody')[0];

                arrElement = xtag.queryChildren(tbodyElement, 'tr.divider');

                i = 0;
                len = arrElement.length;
                while (i < len) {
                    tbodyElement.removeChild(arrElement[i]);
                    i += 1;
                }

                this.arrDividingPoints = [];

                arrElement = xtag.queryChildren(tbodyElement, 'tr');

                if (arrElement.length > 0) {
                    numColumns = arrElement[0].children.length;

                    theadElement = xtag.queryChildren(this.tableElement, 'thead')[0];
                    intOffset = (theadElement ? theadElement.offsetHeight : 0);

                    arrLetter = [];
                    i = 0;
                    len = arrElement.length;
                    while (i < len) {
                        strLetter = xtag.queryChildren(arrElement[i], 'td')[0].textContent.substring(0, 1).toUpperCase();

                        if (arrLetter.indexOf(strLetter) === -1) {
                            this.arrDividingPoints.push({
                                'letter': strLetter,
                                'offset': intOffset
                            });

                            if (this.hasAttribute('letter-dividers')) {
                                dividerElement = document.createElement('tr');
                                dividerElement.classList.add('divider');
                                dividerElement.setAttribute('gs-dynamic', '');
                                dividerElement.setAttribute('data-target-offset', intOffset);
                                //if (!this.hasAttribute('letter-dividers')) { <== messed with odd and even record colors when letter-scrollbar but not letter-dividers -michael
                                //    dividerElement.setAttribute('hidden', '');
                                //}

                                dividerElement.innerHTML = '<td colspan="' + numColumns + '" gs-dynamic>' + encodeHTML(strLetter) + '</td>';

                                tbodyElement.insertBefore(dividerElement, arrElement[i]);

                                intOffset += dividerElement.offsetHeight;
                            }

                            arrLetter.push(strLetter);
                        }

                        intOffset += arrElement[i].offsetHeight;
                        i += 1;
                    }
                }
            },

            syncView: function () {
                var element = this, tbodyElement, i, len, arrElements, clickHandler, mousedownHandler, mousemoveHandler, mouseupHandler, mouseoutHandler, mouseoverHandler;

                element.removeEventListener('keydown', handleKeyDown);
                element.addEventListener('keydown', handleKeyDown);

                element.removeEventListener('focusout', handleFocusout);
                element.addEventListener('focusout', handleFocusout);

                element.innerHTML = '';

                element.scrollContainer = document.createElement('div');
                element.scrollContainer.setAttribute('gs-dynamic', '');
                element.scrollContainer.classList.add('root');
                element.scrollContainer.classList.add('scroll-container');
                element.scrollContainer.setAttribute('id', 'box-list-container-' + element.internal.id);
                element.scrollContainer.appendChild(element.tableElement);

                if (!element.hasAttribute('src')) {
                    var tableElement = element.tableElement;

                    if (element.hasAttribute('caption')) {
                        var objCaption = document.createElement('caption');
                        objCaption.innerHTML = '<center><h4>' + element.getAttribute('caption') + '</h4></center>';
                        tableElement.insertBefore(objCaption, tableElement.children[0]);
                    }
                }

                element.appendChild(element.scrollContainer);
                tbodyElement = xtag.queryChildren(element.tableElement, 'tbody')[0];

                addTableAria(element);

                // add dividers
                if (element.hasAttribute('letter-dividers') || element.hasAttribute('letter-scrollbar')) {
                    element.refreshDividingPoints();

                    // if we have the letter-scrollbar attribute: add the letter scrollbar
                    if (element.hasAttribute('letter-scrollbar')) {
                        element.letterScrollbarHandler();
                    }
                }

                // this fixes the fact that this function was clearing the selection
                if (this.getAttribute('value')) {
                    selectRecord(this, this.getAttribute('value'));
                    this.scrollToSelectedRecord();
                }

                // click handling code
                // get list of record elements
                arrElements = xtag.toArray(tbodyElement.children);

                if (element.hasAttribute('multi-select')) {
                    // if we are not on a touch device: hover and down events
                    if (!evt.touchDevice) {
                        var mouseIsDown = false;
                        mousedownHandler = function (event) {
                            mouseIsDown = true;
                            this.classList.add('down');
                            element.addEventListener(evt.mousemove, mousemoveHandler);
                            window.addEventListener(evt.mouseup, mouseupHandler);
                            selectRecord(element, this, true, (event.ctrlKey || event.metaKey), 'down', event.shiftKey);
                        };
                        mousemoveHandler = function (event) {
                            if (mouseIsDown) {
                                selectRecord(element, getTRFromTarget(event.target), true, (event.ctrlKey || event.metaKey), 'move', event.shiftKey);
                            }
                        };
                        mouseupHandler = function (event) {
                            mouseIsDown = false;
                            selectRecord(element, this, true, (event.ctrlKey || event.metaKey), 'up', event.shiftKey);
                            element.removeEventListener(evt.mousemove, mousemoveHandler);
                            window.removeEventListener(evt.mouseup, mouseupHandler);
                        };
                        mouseoutHandler = function () {
                            this.classList.remove('down');
                            this.classList.remove('hover');
                        };
                        mouseoverHandler = function () {
                            this.classList.remove('down');
                            this.classList.add('hover');
                        };

                        // add click event with click event function to all record elements that are not dividers
                        i = 0;
                        len = arrElements.length;
                        while (i < len) {
                            if (!arrElements[i].classList.contains('divider')) {
                                arrElements[i].addEventListener(evt.mousedown, mousedownHandler);
                                arrElements[i].addEventListener(evt.mouseout, mouseoutHandler);
                                arrElements[i].addEventListener(evt.mouseover, mouseoverHandler);
                            }
                            i += 1;
                        }
                    } else {
                        //TODO: toggle
                        // create click event function
                        clickHandler = function (event) {
                            this.classList.remove('down');
                            selectRecord(element, this, true);
                        };
                    }
                } else {
                    // create click event function
                    clickHandler = function (event) {
                       //console.log(this, event);
                        this.classList.remove('down');
                        selectRecord(element, this, true);
                    };

                    // add click event with click event function to all record elements that are not dividers
                    i = 0;
                    len = arrElements.length;
                    while (i < len) {
                        if (!arrElements[i].classList.contains('divider')) {
                            arrElements[i].addEventListener('click', clickHandler);
                        }
                        i += 1;
                    }

                    // if we are not on a touch device: hover and down events
                    if (!evt.touchDevice) {
                        mousedownHandler = function () {
                            this.classList.add('down');
                        };
                        mouseoutHandler = function () {
                            this.classList.remove('down');
                            this.classList.remove('hover');
                        };
                        mouseoverHandler = function () {
                            this.classList.remove('down');
                            this.classList.add('hover');
                        };

                        // add click event with click event function to all record elements that are not dividers
                        i = 0;
                        len = arrElements.length;
                        while (i < len) {
                            if (!arrElements[i].classList.contains('divider')) {
                                arrElements[i].addEventListener(evt.mousedown, mousedownHandler);
                                arrElements[i].addEventListener(evt.mouseout, mouseoutHandler);
                                arrElements[i].addEventListener(evt.mouseover, mouseoverHandler);
                            }
                            i += 1;
                        }
                    }
                }

                var focusElement = document.createElement('textarea');
                focusElement.classList.add('hidden-focus-control');
                if (element.querySelector('tr[selected] td')) {
                    focusElement.setAttribute('value', element.querySelector('tr[selected] td').textContent || ' ');
                }
                focusElement.setAttribute('aria-owns', 'box-list-container-' + element.internal.id);

                element.appendChild(focusElement);
                element.hiddenFocusControl = focusElement;

                element.addEventListener('focus', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (event.target !== element.hiddenFocusControl) {
                        element.hiddenFocusControl.focus();
                        GS.triggerEvent(element.hiddenFocusControl, 'focus');
                        element.skipFocus = true;
                    }
                });
                bindCopy(element);
            },

            triggerChange: function () {
                if (this.supressChange === true) {
                    this.supressChange = false;
                } else {
                    xtag.fireEvent(this, 'change', {
                        bubbles: true,
                        cancelable: true
                    });
                }
            }
        }
    });
});