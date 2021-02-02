



    function unbindHUD(element) {
        //element.elems.topHudContainer.removeEventListener(
        //    'click',
        //    element.internalEvents.hudClick
        //);
        //element.elems.bottomHudContainer.removeEventListener(
        //    'click',
        //    element.internalEvents.hudClick
        //);

        //element.elems.topHudContainer.removeEventListener(
        //    'change',
        //    element.internalEvents.hudChange
        //);
        //element.elems.bottomHudContainer.removeEventListener(
        //    'change',
        //    element.internalEvents.hudChange
        //);
    }
    function bindHUD(element) {
        // because the hud accepts custom DOM elements, we use event
        //      delegation to capture the events and then we just call
        //      whatever we need based on the class of the item that
        //      was clicked
        // element.internalEvents.hudClick = function (event) {
        //     var target = event.target;
        //     var classList = target.classList;
        //     var intCurrentRecord;
        //     var intMinColumn;
        //     var intMaxRecord;
        //     var arrDataColumns;
        //     var arrColumnOrders;
        //     var strNewSort;
        //     var i;
        //     var len;

        //     if (classList.contains("button-insert")) {
        //         openInsertDialog(element);

        //     // if the delete button was clicked: delete selected records
        //     } else if (classList.contains("button-delete")) {
        //         deleteSelectedRecords(element);

        //     // if the delete button was clicked: delete selected records
        //     } else if (classList.contains("button-scroll-insert")) {
        //         scrollCellIntoView(element, 'insert', '0', 'top');

        //     } else if (classList.contains("button-refresh")) {
        //         dataSELECT(element);

        //     } else if (classList.contains("button-prefs")) {
        //         openSettingsDialog(element, target);

        //     } else if (classList.contains("button-fullscreen")) {
        //         // using a class like this doesn't work on iOS (other things
        //         //      z-index over it), we need to move the element to the
        //         //      last element in the body and then apply the class.
        //         // ### NEED CODING ###
        //         if (element.classList.contains('table-fullscreen')) {
        //             element.classList.remove('table-fullscreen');

        //             if (target.getAttribute('icon') === 'compress') {
        //                 target.setAttribute('icon', 'expand');
        //             }
        //         } else {
        //             element.classList.add('table-fullscreen');

        //             if (target.getAttribute('icon') === 'expand') {
        //                 target.setAttribute('icon', 'compress');
        //             }
        //         }
        //         renderScrollDimensions(element);

        //     // if a sort button was clicked
        //     } else if (
        //         classList.contains("button-sort-asc") ||
        //         classList.contains("button-sort-desc") ||
        //         classList.contains("button-sort-clear")
        //     ) {
        //         // we need to deduce the new orderby string based on
        //         //      the button that was clicked
        //         if (classList.contains("button-sort-asc")) {
        //             strNewSort = 'asc';
        //         } else if (classList.contains("button-sort-desc")) {
        //             strNewSort = 'desc';
        //         } else if (classList.contains("button-sort-clear")) {
        //             strNewSort = 'neutral';
        //         }

        //         // we need the column orderby array
        //         arrColumnOrders = (
        //             element.internalData.columnOrders
        //         );

        //         // loop through each selected data column and set the orderby
        //         arrDataColumns = getSelectedDataColumns(element);
        //         i = 0;
        //         len = arrDataColumns.length;
        //         while (i < len) {
        //             arrColumnOrders[
        //                 arrDataColumns[i]
        //             ] = strNewSort;

        //             i += 1;
        //         }

        //         // refresh the table
        //         dataSELECT(element);

        //     // if the filter clear button was clicked
        //     } else if (
        //         classList.contains("button-filter-clear")
        //     ) {
        //         //TODO: michael is this correct?
        //         element.internalData.columnFilters = [];
        //         element.internalData.columnListFilters = {};

        //         // refresh the table
        //         dataSELECT(element);

        //     // if a selection navigation button was clicked
        //     } else if (
        //         classList.contains("button-select-first-record") ||
        //         classList.contains("button-select-prev-record") ||
        //         classList.contains("button-select-next-record") ||
        //         classList.contains("button-select-last-record")
        //     ) {
        //         intCurrentRecord = (
        //             element.internalSelection.originRecord || 0
        //         );
        //         intMinColumn = (
        //             element.internalDisplay.recordSelectorVisible
        //                 ? -1
        //                 : 0
        //         );
        //         intMaxRecord = (
        //             element.internalData.records.length - 1
        //         );

        //         // set current record based on which button was clicked
        //         if (classList.contains("button-select-first-record")) {
        //             intCurrentRecord = 0;
        //         } else if (classList.contains("button-select-prev-record")) {
        //             intCurrentRecord -= 1;
        //         } else if (classList.contains("button-select-next-record")) {
        //             intCurrentRecord += 1;
        //         } else if (classList.contains("button-select-last-record")) {
        //             intCurrentRecord = intMaxRecord;
        //         }

        //         // prevent invalid record numbers

        //// if the new record is past the last record, go to last record
        //         if (intCurrentRecord > intMaxRecord) {
        //             intCurrentRecord = intMaxRecord;
        //         }

        //         // if the new record is a negative number, go to first record
        //         if (intCurrentRecord < 0) {
        //             intCurrentRecord = 0;
        //         }

        //         // if there are no records, clear new record
        //         if (intMaxRecord === -1) {
        //             intCurrentRecord = undefined;
        //         }

        //         // override all current ranges to select the new record
        //         if (intCurrentRecord !== undefined) {
        //             element.internalSelection.ranges = [
        //                 {
        //                     "start": {
        //                         "row": intCurrentRecord,
        //                         "column": intMinColumn
        //                     },
        //                     "end": {
        //                         "row": intCurrentRecord,
        //                         "column": intMinColumn
        //                     },
        //                     "negator": false
        //                 }
        //             ];
        //         } else {
        //             element.internalSelection.ranges = [];
        //         }

        //         // render selection and scroll into view
        //         renderSelection(element);
        //         scrollSelectionIntoView(element, 'top');
        //     }
        // };

        // element.elems.topHudContainer.addEventListener(
        //     'click',
        //     element.internalEvents.hudClick
        // );

        // element.elems.bottomHudContainer.addEventListener(
        //     'click',
        //     element.internalEvents.hudClick
        // );

        // because the hud accepts custom DOM elements, we use event
        //      delegation to capture the events and then we just call
        //      whatever we need based on the class of the item that
        //      was changed
        // element.internalEvents.hudChange = function (event) {
        //     var target = event.target;
        //     var classList = target.classList;
        //     var strValue;
        //     var intValue;
        //     var intMinColumn;
        //     var intMaxRecord;

        //     if (classList.contains("text-selection-status")) {
        //         strValue = target.value;
        //         intValue = parseInt(strValue, 10);
        //         intMaxRecord = element.internalData.records.length;

        //         intMinColumn = (
        //             element.internalDisplay.recordSelectorVisible
        //                 ? -1
        //                 : 0
        //         );

        //         // if we couldn't extract a record number from the
        //         //      user's value, go to the first record
        //         if (isNaN(intValue)) {
        //             intValue = 1;
        //         }

        //         if (intMaxRecord === 0) {
        //             intValue = undefined;
        //         }

        //         // prevent intValue from being greater than the number
        //         //      of records
        //         if (intValue > intMaxRecord) {
        //             intValue = intMaxRecord;
        //         }

        //         // intValue is from a user and therefore one-based
        //         if (!isNaN(intValue)) {
        //             // correct one-based by subtracting one
        //             intValue -= 1;
        //         }

        //         //console.log(strValue);

        //         // override all current ranges to select the new record
        //         if (intValue !== undefined) {
        //             element.internalSelection.ranges = [
        //                 {
        //                     "start": {
        //                         "row": intValue,
        //                         "column": intMinColumn
        //                     },
        //                     "end": {
        //                         "row": intValue,
        //                         "column": intMinColumn
        //                     },
        //                     "negator": false
        //                 }
        //             ];
        //         } else {
        //             element.internalSelection.ranges = [];
        //         }

        //         // render selection and scroll into view
        //         renderSelection(element);
        //         scrollSelectionIntoView(element, 'top');
        //     }
        // };

        // element.elems.topHudContainer.addEventListener(
        //     'change',
        //     element.internalEvents.hudChange
        // );
        // element.elems.bottomHudContainer.addEventListener(
        //     'change',
        //     element.internalEvents.hudChange
        // );
    }



















        //var arrUnselected;
        //var arrSelected;
        //var i;
        //var len;
        //var bolSelectInsertRecord;

        //var intOriginRecord;

        //var cell;
        //var intCellRow;
        //var intCellColumn;

        //var arrRanges;
        //var range;
        //var rangeStartRow;
        //var rangeStartColumn;
        //var rangeEndRow;
        //var rangeEndColumn;
        //var range_i;
        //var range_len;

        //// the way we determine what cells need to be selected is this:
        ////      step 1: we fill "arrUnselected" with all the cells that are
        ////                  visible in the viewport
        ////      step 2: cache all cell row and column numbers so that we don't
        ////                  have to recalculate them multiple times
        ////      step 3: we loop through each selection
        ////                  if the current selection is not a negator:
        ////                      move cells from "arrUnselected" to "arrSelected"
        ////                  if the current selection is a negator:
        ////                      move cells from "arrSelected" to "arrUnselected"
        ////      step 4: we loop through each cell in "arrSelected"
        ////                  and we add the "selected" attribute
        ////      step 5: we loop through each cell in "arrUnselected"
        ////                  and we remove the "selected" attribute

        //// step 1: we fill "arrUnselected" with all the cells that are
        ////      visible in the viewport
        //arrUnselected = xtag.query(element.elems.dataViewport, 'gs-cell');
        //arrSelected = [];

        //// step 2: cache all row and column numbers so that we don't
        ////      have to recalculate them multiple times
        //i = 0;
        //len = arrUnselected.length;
        //while (i < len) {
        //    cell = arrUnselected[i];

        //    intCellRow = parseInt(
        //        cell.getAttribute('data-row-number'),
        //        10
        //    );
        //    intCellColumn = parseInt(
        //        cell.getAttribute('data-col-number'),
        //        10
        //    );

        //    if (cell.classList.contains('table-all-selector')) {
        //        intCellRow = -1;
        //        intCellColumn = -1;
        //    } else if (cell.classList.contains('table-header')) {
        //        intCellRow = -1;
        //    } else if (cell.classList.contains('table-record-selector')) {
        //        intCellColumn = -1;
        //    } else if (cell.classList.contains('table-insert')) {
        //        intCellRow = 0;
        //    } else if (cell.classList.contains('table-insert-selector')) {
        //        intCellRow = 0;
        //        intCellColumn = -1;
        //    }

        //    cell.internalRow = intCellRow;
        //    cell.internalColumn = intCellColumn;

        //    cell.insertOnly = false;
        //    if (
        //        cell.classList.contains('table-insert') ||
        //        cell.classList.contains('table-insert-selector')
        //    ) {
        //        cell.insertOnly = true;
        //    }

        //    i += 1;
        //}

        //// step 2.5: we loop through each cell in "arrUnselected"
        ////      and we remove the "origin-record" and "auto-selected"
        ////      attributes
        //i = 0;
        //len = arrUnselected.length;
        //while (i < len) {
        //    arrUnselected[i].removeAttribute('origin-record');
        //    arrUnselected[i].removeAttribute('auto-selected');
        //    i += 1;
        //}

        //// step 3: we loop through each selection
        //arrRanges = element.internalSelection.ranges;
        //bolSelectInsertRecord = element.internalSelection.insertRecord;
        //range_i = 0;
        //range_len = arrRanges.length;
        //while (range_i < range_len) {
        //    range = arrRanges[range_i];

        //    // because the end of the selection may be above and to the left
        //    //      of the start of the selection, we need to make sure that:
        //    //          the start row/column is the top-left
        //    //          the end row/column is the bottom-right
        //    rangeStartRow = Math.min(range.start.row, range.end.row);
        //    rangeStartColumn = Math.min(range.start.column, range.end.column);
        //    rangeEndRow = Math.max(range.start.row, range.end.row);
        //    rangeEndColumn = Math.max(range.start.column, range.end.column);

        //    // if this is the first selection, add origin attribute to all
        //    //      the cells in the first row. also, save the origin record
        //    //      number for future reference
        //    if (range_i === 0) {
        //        // the header can't be the origin record
        //        if (rangeStartRow === -1) {
        //            intOriginRecord = 0;
        //        } else {
        //            intOriginRecord = rangeStartRow;
        //        }

        //        // because this is the first iteration, all cells are in the
        //        //      unselected array
        //        i = 0;
        //        len = arrUnselected.length;
        //        while (i < len) {
        //            cell = arrUnselected[i];

        //            // if the cell belongs to the origin row, add an
        //            //      attribute
        //            if (
        //                cell.internalRow === intOriginRecord &&
        //                bolSelectInsertRecord === false &&
        //                !cell.insertOnly
        //            ) {
        //                arrUnselected[i].setAttribute('origin-record', '');
        //            }

        //            i += 1;
        //        }

        //        // save origin record internally
        //        element.internalSelection.originRecord = intOriginRecord;
        //    }

        //    // if the current selection is not a negator:
        //    //      move cells from "arrUnselected" to "arrSelected"
        //    if (range.negator === false) {
        //        i = 0;
        //        len = arrUnselected.length;
        //        while (i < len) {
        //            cell = arrUnselected[i];

        //            // testing to see if a cell is in the current range
        //            if (
        //                (
        //                    // if the cell is within the row range
        //                    (
        //                        cell.internalRow >= rangeStartRow &&
        //                        cell.internalRow <= rangeEndRow
        //                    ) ||
        //                    // or the range starts and ends in the header
        //                    (
        //                        rangeStartRow === -1 &&
        //                        rangeEndRow === -1
        //                    )
        //                ) &&
        //                (
        //                    // if the cell is within the column range
        //                    (
        //                        cell.internalColumn >= rangeStartColumn &&
        //                        cell.internalColumn <= rangeEndColumn
        //                    ) ||
        //                    // or the range starts and ends on a record selector
        //                    (
        //                        rangeStartColumn === -1 &&
        //                        rangeEndColumn === -1
        //                    )
        //                ) &&
        //                (
        //                    // if selection is an insert record selection and
        //                    //      cell is an insert cell
        //                    (
        //                        bolSelectInsertRecord === false &&
        //                        !cell.insertOnly
        //                    ) ||
        //                    // if selection is not an insert record selection
        //                    //      and cell is not an insert cell
        //                    (
        //                        bolSelectInsertRecord === true &&
        //                        cell.insertOnly
        //                    )
        //                )
        //            ) {
        //                // remove cell from "arrUnselected"
        //                arrUnselected.splice(i, 1);

        //                // decrement i and len to account for removing the cell
        //                i -= 1;
        //                len -= 1;

        //                // append cell to "arrSelected"
        //                arrSelected.push(cell);
        //            }

        //            i += 1;
        //        }
        //    // if the current selection is a negator:
        //    //      move cells from "arrSelected" to "arrUnselected"
        //    } else {
        //        i = 0;
        //        len = arrSelected.length;
        //        while (i < len) {
        //            cell = arrSelected[i];

        //            if (
        //                (
        //                    // if the cell is within the row range
        //                    (
        //                        cell.internalRow >= rangeStartRow &&
        //                        cell.internalRow <= rangeEndRow
        //                    ) ||
        //                    // or the range starts and ends in the header
        //                    (
        //                        rangeStartRow === -1 &&
        //                        rangeEndRow === -1
        //                    )
        //                ) &&
        //                (
        //                    // if the cell is within the column range
        //                    (
        //                        cell.internalColumn >= rangeStartColumn &&
        //                        cell.internalColumn <= rangeEndColumn
        //                    ) ||
        //                    // or the range starts and ends on a record selector
        //                    (
        //                        rangeStartColumn === -1 &&
        //                        rangeEndColumn === -1
        //                    )
        //                )
        //            ) {

        //                // remove cell from "arrSelected"
        //                arrSelected.splice(i, 1);

        //                // decrement i and len to account for removing the cell
        //                i -= 1;
        //                len -= 1;

        //                // append cell to "arrUnselected"
        //                arrUnselected.push(cell);
        //            }

        //            i += 1;
        //        }
        //    }

        //    range_i += 1;
        //}

        //// step 4: we loop through each cell in "arrSelected"
        ////      and we add the "selected" attribute
        //i = 0;
        //len = arrSelected.length;
        //while (i < len) {
        //    arrSelected[i].setAttribute('selected', '');
        //    i += 1;
        //}

        //// step 5: we loop through each cell in "arrUnselected"
        ////      and we remove the "selected" attribute
        //i = 0;
        //len = arrUnselected.length;
        //while (i < len) {
        //    arrUnselected[i].removeAttribute('selected');
        //    i += 1;
        //}


        //// we need to know what cells are selected, so we'll create an
        ////      array of strings that represent the list of cells and each
        ////      cell will either be the character "X" or "Y". X will
        ////      represent a non-selected cell whereas Y will represent a
        ////      selected cell
        //var row_i;
        //var row_len;
        //var col_i;
        //var col_len;

        //var arrSelection;
        //var arrColumns;
        //var arrRows;
        //var strRow;
        //var intMaxColumns;
        //var arrColumnWidths;

        //// we need to calculate what rows and columns need to be copied, so
        ////      first we'll define an array of rows with one letter "N" for
        ////      each column (the "N" stands for "No, Not Copied")
        //strRow = '';
        //i = 0;
        //len = element.internalDisplay.columnWidths.length;
        //while (i < len) {
        //    strRow += 'N';
        //    i += 1;
        //}

        //// we need one copy of strRow for each record in the datasheet
        //arrSelection = [];
        //i = 0;

        //// because the insert record is only one record, if the insert record
        ////      is selected: only create one record for selection
        //if (element.internalSelection.insertRecord) {
        //    len = 1;
        //} else {
        //    len = element.internalData.records.length;
        //}

        //while (i < len) {
        //    arrSelection.push(strRow);
        //    i += 1;
        //}

        ////console.log(arrSelection);

        //// now we'll loop through each selection range and we'll flip cells
        ////      from "N" to "Y" and vice versa depending on the ranges the
        ////      "Y" stands for "Yes, Copied"
        //arrRanges = element.internalSelection.ranges;
        //arrColumnWidths = element.internalDisplay.columnWidths;
        //range_i = 0;
        //range_len = arrRanges.length;
        //while (range_i < range_len) {
        //    range = arrRanges[range_i];

        //    // because the end of the selection may be above and to the left
        //    //      of the start of the selection, we need to make sure that:
        //    //          the start row/column is the top-left
        //    //          the end row/column is the bottom-right
        //    rangeStartRow = Math.min(range.start.row, range.end.row);
        //    rangeStartColumn = Math.min(range.start.column, range.end.column);
        //    rangeEndRow = Math.max(range.start.row, range.end.row);
        //    rangeEndColumn = Math.max(range.start.column, range.end.column);


        //    // if the current selection is not a negator:
        //    //      move cells from "N" to "Y"
        //    if (range.negator === false) {
        //        row_i = 0;
        //        row_len = arrSelection.length;
        //        while (row_i < row_len) {
        //            strRow = arrSelection[row_i];

        //            // if the row is in range or all rows are in the range:
        //            //      iterate through cells in the row
        //            if (
        //                (
        //                    row_i >= rangeStartRow &&
        //                    row_i <= rangeEndRow
        //                ) ||
        //                (
        //                    rangeStartRow === -1 &&
        //                    rangeEndRow === -1
        //                )
        //            ) {
        //                col_i = 0;
        //                col_len = strRow.length;
        //                while (col_i < col_len) {
        //                    // testing to see if th cell is in the current
        //                    //      selection range or that the whole record is
        //                    //      selected
        //                    if (
        //                        (
        //                            (
        //                                col_i >= rangeStartColumn &&
        //                                col_i <= rangeEndColumn
        //                            ) ||
        //                            (
        //                                rangeStartColumn === -1 &&
        //                                rangeEndColumn === -1
        //                            )
        //                        ) &&
        //                        // we don't want to copy hidden columns
        //                        arrColumnWidths[col_i] > 0
        //                    ) {
        //                        strRow = arrSelection[row_i];
        //                        // set cell to "Y" because it is in the
        //                        //      selection range
        //                        arrSelection[row_i] = (
        //                            strRow.substr(0, col_i) +
        //                            'Y' +
        //                            strRow.substr(col_i + 1)
        //                        );
        //                    }
        //                    col_i += 1;
        //                }
        //            }

        //            row_i += 1;
        //        }
        //    // if the current selection is a negator:
        //    //      move cells from "arrSelected" to "arrUnselected"
        //    } else {
        //        row_i = 0;
        //        row_len = arrSelection.length;
        //        while (row_i < row_len) {
        //            // if the row is in range or all rows are in the range:
        //            //      iterate through cells in the row
        //            if (
        //                (
        //                    row_i >= rangeStartRow &&
        //                    row_i <= rangeEndRow
        //                ) ||
        //                (
        //                    rangeStartRow === -1 &&
        //                    rangeEndRow === -1
        //                )
        //            ) {
        //                col_i = 0;
        //                col_len = arrSelection[row_i].length;
        //                while (col_i < col_len) {
        //                    // testing to see if th cell is in the current
        //                    //      selection range or that the whole record is
        //                    //      selected
        //                    if (
        //                        (
        //                            (
        //                                col_i >= rangeStartColumn &&
        //                                col_i <= rangeEndColumn
        //                            ) ||
        //                            (
        //                                rangeStartColumn === -1 &&
        //                                rangeEndColumn === -1
        //                            )
        //                        ) &&
        //                        // we don't want to copy hidden columns
        //                        arrColumnWidths[col_i] > 0
        //                    ) {
        //                        strRow = arrSelection[row_i];
        //                        // set cell to "N" because it is not in the
        //                        //      selection range
        //                        arrSelection[row_i] = (
        //                            strRow.substr(0, col_i) +
        //                            'N' +
        //                            strRow.substr(col_i + 1)
        //                        );
        //                    }
        //                    col_i += 1;
        //                }
        //            }

        //            row_i += 1;
        //        }
        //    }

        //    range_i += 1;
        //}

        //// now, we'll convert the array of rows to an array of record numbers
        ////      that will be copied (arrRows)
        //arrRows = [];
        //row_i = 0;
        //row_len = arrSelection.length;
        //while (row_i < row_len) {
        //    if (arrSelection[row_i].indexOf('Y') !== -1) {
        //        arrRows.push(row_i);
        //    }
        //    row_i += 1;
        //}

        //// we'll loop through every row that has a "Y" in it (arrRows) and
        ////      for every "Y" we'll add the column number (if it's not
        ////      already present) to our column array we'll break out of
        ////      the loop if all columns are included
        //arrColumns = [];
        //intMaxColumns = element.internalClip.columnList.length;
        //row_i = 0;
        //row_len = arrRows.length;
        //while (row_i < row_len) {
        //    strRow = arrSelection[arrRows[row_i]];
        //    col_i = 0;
        //    col_len = strRow.length;
        //    while (col_i < col_len) {
        //        if (strRow[col_i] === 'Y' && arrColumns.indexOf(col_i) === -1) {
        //            arrColumns.push(col_i);
        //        }
        //        col_i += 1;
        //    }

        //    if (arrColumns.length >= intMaxColumns) {
        //        break;
        //    }

        //    row_i += 1;
        //}

        //// store selection variables internally for future reference
        //element.internalSelection.resolvedSelection = arrSelection;
        //element.internalSelection.rows = arrRows;
        //element.internalSelection.columns = arrColumns;

        ////console.log(
        ////    arrSelection,
        ////    arrRows,
        ////    arrColumns
        ////);

        //// you are not allowed to deselect everything, if you have, we'll
        ////      select what we can and then re-render the selection
        //if (arrRows.length === 0 || arrColumns.length === 0) {
        //    // if there is data and the current range is not already selecting
        //    //      the first cell, select the first cell
        //    if (
        //        element.internalData.records.length > 0 && (
        //            element.internalSelection.ranges.length !== 1 ||
        //            element.internalSelection.ranges.start.row !== 0 ||
        //            element.internalSelection.ranges.start.column !== 0 ||
        //            element.internalSelection.ranges.end.row !== 0 ||
        //            element.internalSelection.ranges.end.column !== 0 ||
        //            element.internalSelection.ranges.negator !== false
        //        )
        //    ) {
        //        element.internalSelection.ranges = [
        //            {
        //                "start": {
        //                    "row": 0,
        //                    "column": 0
        //                },
        //                "end": {
        //                    "row": 0,
        //                    "column": 0
        //                },
        //                "negator": false
        //            }
        //        ];

        //        // if we are currently selecting with the mouse, stop the
        //        //      selection
        //        if (element.internalSelection.currentlySelecting) {
        //            element.internalEvents.selectDragEnd();
        //        }

        //        // rerender the selection so that the user can see it
        //        renderSelection(element);

        //        // stop execution because we'll be re-running this function
        //        //      anyway
        //        return;
        //    }
        //}

        //// <br />

        //// sometimes, the user selects some cells without selecting the
        ////      record selectors and/or headers. in this case, we want
        ////      to highlight the record selectors and headers of the
        ////      selected range
        //i = 0;
        //len = arrUnselected.length;
        //while (i < len) {
        //    cell = arrUnselected[i];
        //    if (
        //        cell.classList.contains('table-record-selector') &&
        //        arrRows.indexOf(cell.internalRow) > -1
        //    ) {
        //        cell.setAttribute('auto-selected', '');

        //    } else if (
        //        cell.classList.contains('table-header') &&
        //        arrColumns.indexOf(cell.internalColumn) > -1
        //    ) {
        //        cell.setAttribute('auto-selected', '');
        //    }
        //    i += 1;
        //}






//            var templateElement;
//            var columnElement;
//            var columnIndex;
//            var strColumn;
//            var intRecord;
//            var intColumn;
//            var strValue;
//
//
//            if (parentCell && parentCell.nodeName === 'GS-CELL') {
//                // we need to know what column the current column is
//                columnElement = xtag.query(parentCell, '[column]')[0];
//
//                // we need to know what record we're working with
//                intRecord = parseInt(
//                    parentCell.getAttribute('data-row-number'),
//                    10
//                );
//
//                // we need to know what record we're working with
//                intColumn = parseInt(
//                    parentCell.getAttribute('data-col-number'),
//                    10
//                );
//
//                // now that we associate display columns and their data
//                //      columns, we can get the value even if there's no
//                //      columnElement, but we do need a record number
//                strColumn = (
//                    element.internalDisplay.dataColumnName[intColumn]
//                );
//                if (strColumn && !isNaN(intRecord)) {
//                    // we need the index of the column we're working with
//                    columnIndex = (
//                        element.internalData.columnNames.indexOf(strColumn)
//                    );
//
//                    // we need to know what value the current cell is so
//                    //      that we can do filters
//                    strValue = getCell(
//                        element,
//                        strColumn,
//                        intRecord,
//                        true,
//                        // we need to know if we're dealing with NULL
//                        'gsTAbleINTERNALNULLSTRING'
//                    );
//
//                    // only get the column name, index and value if
//                    //      the cell the user right-clicked on had a
//                    //      column element
//                    if (columnElement) {
//                        // if strValue matches columnElement's value, use
//                        //      the text selection (if availible) of the
//                        //      columnElement's control and substring the
//                        //      strValue
//                        //strValue = columnElement.value;
//                        // ### NEED CODING ###
//                    }
//                }
//
//                // we want a function specifically for contextmenus,
//                //      however, currently we dont have one so we'll
//                //      use the GS.openDialogToElement function
//                templateElement = document.createElement('template');
//                templateElement.setAttribute('data-max-width', '15em');
//                templateElement.setAttribute('data-overlay-close', 'true');
//                templateElement.innerHTML = ml(function () {/*
//                    <gs-page gs-dynamic class="gs-table-contextmenu">
//                        <gs-body padded>
//    <div class="gs-table-requires-column">
//        <gs-button dialogclose remove-bottom
//                    iconleft icon="sort-alpha-asc"
//                    class="button-sort-asc">
//            Sort A to Z
//        </gs-button>
//        <gs-button dialogclose remove-all
//                    iconleft icon="sort-alpha-desc"
//                    class="button-sort-desc">
//            Sort Z to A
//        </gs-button>
//        <gs-button dialogclose remove-top
//                    iconleft icon="trash-o"
//                    class="button-sort-clear">
//            Clear Sort
//        </gs-button>
//        <hr />
//    </div>
//    <!--<gs-button dialogclose remove-bottom
//                iconleft icon="text-width"
//                class="button-column-width">
//        Column Width
//    </gs-button>
//    remove-all
//    ### NEED CODING ###
//    -->
//    <gs-button dialogclose remove-bottom
//                iconleft icon="eye-slash"
//                class="button-column-hide">
//        Hide Column(s)
//    </gs-button>
//    <gs-button dialogclose remove-top
//                iconleft icon="eye"
//                class="button-column-unhide">
//        Unhide Columns
//    </gs-button>
//    <div class="gs-table-requires-column gs-table-requires-one-cell">
//        <hr />
//        <gs-button dialogclose remove-bottom
//                    iconleft icon="filter"
//                    class="button-filter-include">
//            Filter By Selection
//        </gs-button>
//        <gs-button dialogclose remove-all
//                    iconleft icon="filter"
//                    class="button-filter-exclude">
//            Filter Excluding Selection
//        </gs-button>
//        <gs-button dialogclose remove-all
//                    iconleft icon="search"
//                    class="button-filter-text">
//            Text Filters
//        </gs-button>
//        <gs-button dialogclose remove-all
//                    iconleft icon="toggle-off"
//                    class="button-filter-toggle">
//            Toggle Filters
//        </gs-button>
//        <gs-button dialogclose remove-top
//                    iconleft icon="trash-o"
//                    class="button-filter-clear">
//            Clear Filters
//        </gs-button>
//    </div>
//                        </gs-body>
//                    </gs-page>
//                */
//                });
//
//                GS.openDialogToElement(
//                    parentCell,
//                    templateElement,
//                    'down',
//                    function () {
//                        var dialog = this;
//                        var filterToggleButton;
//                        var strStatus;
//                        var arrElements;
//                        var i;
//                        var len;
//
//                        // we want the top gs-page to have corner rounding
//                        dialog.classList.add('gs-table-contextmenu');
//
//                        // we want the "toggle filter" button to reflect
//                        //      the current status of the column filter
//                        //      on/off
//                        filterToggleButton = xtag.query(
//                            dialog,
//                            '.button-filter-toggle'
//                        )[0];
//
//                        strStatus = (
//                            element.internalData
//                                .columnFilterStatuses[columnIndex]
//                        );
//
//                        if (strStatus === 'on') {
//                            filterToggleButton.textContent = (
//                                'Toggle Filters Off'
//                            );
//                            filterToggleButton.setAttribute(
//                                'icon',
//                                'toggle-on'
//                            );
//                        } else {
//                            filterToggleButton.textContent = (
//                                'Toggle Filters On'
//                            );
//                            filterToggleButton.setAttribute(
//                                'icon',
//                                'toggle-off'
//                            );
//                        }
//
//                        // sometimes, we can't figure out what column the
//                        //      right-clicked cell represents
//                        // sometimes, the user right-clicks on a header or
//                        //      insert record
//                        // if there's no column or no record number, hide
//                        //      options that require knowing the columns
//                        if (!strColumn || isNaN(intRecord)) {
//                            arrElements = xtag.query(
//                                dialog,
//                                '.gs-table-requires-column'
//                            );
//                            i = 0;
//                            len = arrElements.length;
//                            while (i < len) {
//                                arrElements[i].setAttribute('hidden', '');
//                                i += 1;
//                            }
//                        }
//
//                        // sometimes, multiple cells are selected. we need
//                        //      to hide options that require that only one
//                        //      column be selected
//                        if (
//                            element.internalClip.cache.columns.length > 1 ||
//                            element.internalClip.cache.rows.length > 1
//                        ) {
//                            arrElements = xtag.query(
//                                dialog,
//                                '.gs-table-requires-one-cell'
//                            );
//                            i = 0;
//                            len = arrElements.length;
//                            while (i < len) {
//                                arrElements[i].setAttribute('hidden', '');
//                                i += 1;
//                            }
//                        }
//                    },
//                    function (event, strAnswer) {
//                        var strWhere;
//                        var targetElement;
//                        var buttonElement;
//                        var i;
//                        var len;
//                        var intColumn;
//
//                        // when you close the dialog by clicking on the
//                        //      overlay, there is no event.
//                        if (event && event.target) {
//                            targetElement = event.target;
//                        }
//
//                        // when you close the dialog by clicking on the
//                        //      overlay, there is no target.
//                        if (targetElement) {
//                            // we may need to position a second dialog to a
//                            //      button, so here we get the button that
//                            //      was clicked.
//                            if (targetElement.nodeName === 'GS-BUTTON') {
//                                buttonElement = targetElement;
//                            } else {
//                                buttonElement = GS.findParentTag(
//                                    targetElement,
//                                    'gs-button'
//                                );
//                            }
//                        }
//
//                        //console.log(event, buttonElement, targetElement);
//
//                        // there's extra whitespace around the answer
//                        strAnswer = strAnswer.trim();
//
//                        //console.log(
//                        //    parentCell,
//                        //    buttonElement,
//                        //    strAnswer,
//                        //    columnIndex,
//                        //    strColumn,
//                        //    strValue
//                        //);
//
//                        if (strAnswer === 'Sort A to Z') {
//                            element.internalData
//                                .columnOrders[columnIndex] = 'asc';
//                            dataSELECT(element);
//
//                        } else if (strAnswer === 'Sort Z to A') {
//                            element.internalData
//                                .columnOrders[columnIndex] = 'desc';
//                            dataSELECT(element);
//
//                        } else if (strAnswer === 'Clear Sort') {
//                            element.internalData
//                                .columnOrders[columnIndex] = 'neutral';
//                            dataSELECT(element);
//
//                        } else if (strAnswer === 'Column Width') {
//                            //
//
//                        } else if (strAnswer === 'Hide Column(s)') {
//                            i = 0;
//                            len = (
//                                element.internalClip.cache.columns.length
//                            );
//                            while (i < len) {
//                                intColumn = (
//                                    element.internalClip.cache.columns[i]
//                                );
//
//                                // we don't want to hide the record selector
//                                if (intColumn >= 0) {
//                                    // hide the column by making it zero
//                                    //      width
//                                    element.internalDisplay
//                                        .columnWidths[intColumn] = 0;
//                                }
//
//                                i += 1;
//                            }
//
//                            // partial re-render might not know how to
//                            //      remove columns in the middle of the
//                            //      viewport
//                            element.internalDisplay
//                                .fullRenderRequired = true;
//                            renderLocation(element);
//
//                        } else if (strAnswer === 'Unhide Columns') {
//                            openColumnHideDialog(element, buttonElement);
//                            event.preventDefault();
//
//                        } else if (strAnswer === 'Filter By Selection') {
//                            // sometimes the user want's to filter for nulls
//                            if (strValue === 'gsTAbleINTERNALNULLSTRING') {
//                                strWhere = (strColumn + ' IS NULL');
//                            } else {
//                                strWhere = (
//                                    'CAST(' +
//                                        strColumn + ' AS ' +
//                                        GS.database.type.text +
//                                    ') = $$' + strValue + '$$'
//                                );
//                            }
//
//                            element.internalData
//                                .columnFilters[columnIndex].push(
//                                    {
//                                        "text": strWhere,
//                                        "name": 'equals "' + strValue + '"'
//                                    }
//                                );
//                            dataSELECT(element);
//
//                        } else if (
//                            strAnswer === 'Filter Excluding Selection'
//                        ) {
//                            // sometimes the user want's to filter out nulls
//                            if (strValue === 'gsTAbleINTERNALNULLSTRING') {
//                                strWhere = (strColumn + ' IS NOT NULL');
//                            } else {
//                                strWhere = (
//                                    'CAST(' +
//                                        strColumn + ' AS ' +
//                                        GS.database.type.text +
//                                    ') != $$' + strValue + '$$'
//                                );
//                            }
//
//                            element.internalData
//                                .columnFilters[columnIndex].push(
//                                    {
//                                        "text": strWhere,
//                                        "name": "doesn't equal " +
//                                                "\"" + strValue + "\""
//                                    }
//                                );
//                            dataSELECT(element);
//
//                        } else if (strAnswer === 'Text Filters') {
//                            element.internalEvents.textFilterContextMenu(
//                                buttonElement,
//                                columnIndex,
//                                strColumn,
//                                strValue
//                            );
//                            event.preventDefault();
//
//                        } else if (strAnswer === 'Toggle Filters On') {
//                            element.internalData
//                                .columnFilterStatuses[columnIndex] = (
//                                    'on'
//                                );
//                            dataSELECT(element);
//
//                        } else if (strAnswer === 'Toggle Filters Off') {
//                            element.internalData
//                                .columnFilterStatuses[columnIndex] = (
//                                    'off'
//                                );
//                            dataSELECT(element);
//
//                        } else if (strAnswer === 'Clear Filters') {
//                            element.internalData
//                                .columnFilters[columnIndex] = [];
//                            dataSELECT(element);
//                        }
//                    }
//                );
//
//                event.preventDefault();
//            }





        //var arrFoundRowIndexes;
        //var arrMissingRowIndexes;
        //var jsnFoundColIndexes;
        //var jsnMissingColIndexes;

        // finding out the missing records
        //arrFoundRowIndexes = [];
        //arrMissingRowIndexes = [];
        //jsnFoundColIndexes = {};
        //jsnMissingColIndexes = {};
        //arrCell = xtag.queryChildren(element.elems.dataViewport, '.table-cell');
        //cell_i = 0;
        //cell_len = arrCell.length;
        //while (cell_i < cell_len) {
        //    intRowNumber = parseInt(
        //                       arrCell[cell_i].getAttribute('data-row-number'),
        //                       10
        //                   );
        //    if (arrFoundRowIndexes.indexOf(intRowNumber) === -1) {
        //        arrFoundRowIndexes.push(intRowNumber);
        //    }
        //    cell_i += 1;
        //}
        //row_i = fromRecord;
        //row_len = (toRecord - 1);
        //while (row_i < row_len) {
        //    if (arrFoundRowIndexes.indexOf(row_i) === -1) {
        //        arrMissingRowIndexes.push(row_i);
        //    }
        //    row_i += 1;
        //}

        //console.log('arrFoundRowIndexes: ', arrFoundRowIndexes);
        //console.log('arrMissingRowIndexes: ', arrMissingRowIndexes);







        //var currentFromColumn;
        //var currentToColumn;
        //var currentFromRecord;
        //var currentToRecord;

        //var col_i;
        //var col_len;
        //var row_i;
        //var row_len;

        //var strSelector;

        //var arrColumnNames;
        //var strHeaderTemplate;
        //var strDataTemplate;
        //var strInsertTemplate;

        //var strRecord;
        //var arrRecord;
        //var jsnRecord;
        //var jsnQS;
        //var intTotalRecords;
        //var strNullString;
        //var strChar;
        //var strCell;
        //var strHTML;
        //var strCSS;


        //// reposition the remaining elements
        //arrCell = xtag.queryChildren(element.elems.dataViewport, '.table-cell');

        //// calculate starting left/right
        //intCellLeft = intCellOriginLeft;
        //intCellTop = intRecordOriginTop;

        //// handle column placement
        //intRowNumber =
        //    parseInt(
        //        arrCell[0].getAttribute('data-row-number'),
        //        10
        //    );
        //arrRow = xtag.queryChildren(
        //    element.elems.dataViewport,
        //    '[data-row-number="' + intRowNumber + '"]'
        //);
        //row_i = 0;
        //row_len = arrRow.length;
        //while (row_i < row_len) {
        //    intColNumber =
        //        parseInt(
        //            arrRow[row_i].getAttribute('data-col-number'),
        //            10
        //        );

        //    arrCol = xtag.queryChildren(
        //        element.elems.dataViewport,
        //        '[data-col-number="' + intColNumber + '"]'
        //    );

        //    col_i = 0;
        //    col_len = arrCol.length;
        //    while (col_i < col_len) {
        //        arrCol[col_i].style.left = intCellLeft + 'px';
        //        col_i += 1;
        //    }

        //    intCellLeft += arrColumnWidths[intColNumber];
        //    intCellLeft += columnBorderWidth;
        //    row_i += 1;
        //}

        //// handle record placement
        //intColNumber =
        //    parseInt(
        //        arrCell[0].getAttribute('data-col-number'),
        //        10
        //    );
        //arrCol = xtag.queryChildren(
        //    element.elems.dataViewport,
        //    '[data-col-number="' + intColNumber + '"]'
        //);
        //col_i = 0;
        //col_len = arrCol.length;
        //while (col_i < col_len) {
        //    intRowNumber =
        //        parseInt(
        //            arrCol[col_i].getAttribute('data-row-number'),
        //            10
        //        );

        //    arrRow = xtag.queryChildren(
        //        element.elems.dataViewport,
        //        '[data-row-number="' + intRowNumber + '"]'
        //    );

        //    row_i = 0;
        //    col_len = arrRow.length;
        //    while (row_i < col_len) {
        //        arrRow[row_i].style.top = intCellTop + 'px';
        //        row_i += 1;
        //    }

        //    intCellTop += arrRecordHeights[intRowNumber];
        //    intCellTop += recordBorderHeight;
        //    col_i += 1;
        //}


/*
        // if there's a header: build column headings (second so that they're
        //      above cells)
        if (strInsertTemplate) {
            strRecord = strInsertTemplate;
            col_i = fromColumn;
            col_len = toColumn;
            intCellLeft = intCellOriginLeft;
            while (col_i < col_len) {
                strCSS = 'bottom:0;' +
                     'left:' + intCellLeft + 'px;' +
                     'width:' + arrColumnWidths[col_i] + 'px;' +
                     'height:' + intInsertRecordHeight + 'px;';

                strRecord = strRecord.replace(
                    '$$CSSREPLACETOKEN$$',
                    strCSS
                );

                intCellLeft += arrColumnWidths[col_i];
                intCellLeft += columnBorderWidth;
                col_i += 1;
            }

            strHTML += strRecord;
        }

        // if record selectors haven't been disabled: build record selectors
        //      (third so that they're above cells)
        if (!element.hasAttribute('no-record-selector')) {
            i = fromRecord;
            len = toRecord;
            intRecordTop = intRecordOriginTop;
            while (i < len) {
                strCSS = 'top:' + intRecordTop + 'px;' +
                         'left:0;' +
                         'width:' + intRecordSelectorWidth + 'px;' +
                         'height:' + arrRecordHeights[i] + 'px;';

                strHTML +=
                    '<gs-cell class="table-record-selector" ' +
                             'style="' + strCSS + '" ' +
                             'data-row-number="' + i +'">' +
                        (i + 1) +
                    '</gs-cell>';

                intRecordTop += arrRecordHeights[i];
                intRecordTop += recordBorderHeight;
                i += 1;
            }
        }
*/







        //// we need to get the current from/to row/column so that we know what
        ////      cell elements to delete
        //arrCell = xtag.query(element.elems.dataViewport, '.table-cell');
        //currentFromColumn =
        //    parseInt(
        //        arrCell[0].getAttribute('data-col-number'),
        //        10
        //    );
        //currentFromRecord =
        //    parseInt(
        //        arrCell[0].getAttribute('data-row-number'),
        //        10
        //    );
        //currentToColumn =
        //    parseInt(
        //        arrCell[arrCell.length - 1].getAttribute('data-col-number'),
        //        10
        //    );
        //currentToRecord =
        //    parseInt(
        //        arrCell[arrCell.length - 1].getAttribute('data-row-number'),
        //        10
        //    );
        
        //strSelector = '';

        //// left-side columns
        //col_i = 0;
        //col_len = (fromColumn - currentFromColumn);
        //while (col_i < col_len) {
        //    strSelector +=
        //        (strSelector ? ',' : '') +
        //        '[data-col-number="' + (col_i + currentFromColumn) + '"]';
        //    col_i += 1;
        //}

        //// right-side columns
        //col_i = 0;
        //col_len = (currentToColumn - toColumn);
        //while (col_i < col_len) {
        //    strSelector +=
        //        (strSelector ? ',' : '') +
        //        '[data-col-number="' + (currentToColumn - col_i) + '"]';
        //    col_i += 1;
        //}

        //// top-side records
        //row_i = 0;
        //row_len = (fromRecord - currentFromRecord);
        //while (row_i < row_len) {
        //    strSelector +=
        //        (strSelector ? ',' : '') +
        //        '[data-row-number="' + (row_i + currentFromRecord) + '"]';
        //    row_i += 1;
        //}

        //// right-side columns
        //row_i = 0;
        //row_len = (currentToRecord - toRecord);
        //while (row_i < row_len) {
        //    strSelector +=
        //        (strSelector ? ',' : '') +
        //        '[data-row-number="' + (currentToRecord - row_i) + '"]';
        //    row_i += 1;
        //}

        ////console.log('selector: ', strSelector);

        //// use the selector created above to select each doomed cell and then
        ////      delete it
        //arrCell = xtag.query(element.elems.dataViewport, strSelector);
        //cell_i = 0;
        //cell_len = arrCell.length;
        //while (cell_i < cell_len) {
        //    element.elems.dataViewport.removeChild(arrCell[cell_i]);
        //    cell_i += 1;
        //}

        // reposition all of the remaining cells from the new origin point


        //var arrColumn;
        //var col_i;
        //var col_len;
        //var arrRow;
        //var row_i;
        //var row_len;
        //var arrCell;
        //var cell_i;
        //var cell_len;
        //var intElementPos;
        //var intElementSize;
        //var intElementExtreme;

        //var scrollDirection;

        //var scrollTop;
        //var scrollLeft;
        //var prevScrollTop;
        //var prevScrollLeft;

        //var scrollTopDifference;
        //var scrollLeftDifference;

        //var scrollTopOffset;
        //var scrollLeftOffset;
        //var scrollBottomOffset;
        //var scrollRightOffset;

        //// saving the scroll variables so that we get shorter lines when we use
        ////      them
        //scrollTop = element.internalScroll.top;
        //prevScrollTop = element.internalScroll.prevTop;
        //scrollLeft = element.internalScroll.left;
        //prevScrollLeft = element.internalScroll.prevLeft;

        //// save the scroll differences so that we dont need to calculate them
        ////      more than once
        //scrollTopDifference = (scrollTop - prevScrollTop);
        //scrollLeftDifference = (scrollLeft - prevScrollLeft);

        //// save the scroll offsets to variables so that it's easier to use them
        //scrollTopOffset = element.internalScrollOffsets.top;
        //scrollLeftOffset = element.internalScrollOffsets.left;
        //scrollBottomOffset = element.internalScrollOffsets.bottom;
        //scrollRightOffset = element.internalScrollOffsets.right;

        //// we need to determine the scroll direction in order to more
        ////      efficiently delete, update and create the correct elements
        //scrollDirection = '';

        //if (scrollTop > prevScrollTop) {
        //    scrollDirection += 'down';
        //} else if (scrollTop < prevScrollTop) {
        //    scrollDirection += 'up';
        //}

        //if (scrollLeft > prevScrollLeft) {
        //    scrollDirection += 'left';
        //} else if (scrollLeft < prevScrollLeft) {
        //    scrollDirection += 'right';
        //}

        //// scrollDirection can only be a certain set of values:
        ////      'up'
        ////      'down'
        ////      'left'
        ////      'right'
        ////      'downleft'
        ////      'downright'
        ////      'upleft'
        ////      'upright'

        //// we need to delete the elements that are now out of the the viewport
        ////      so, here we determine what elements need to be removed depending
        ////      on the scrollDirection

        //// handle top rows deletion
        //if (scrollDirection.indexOf('up') !== -1) {
        //    // get the cells from the first column and loop through them until
        //    //      you get to one that's staying in the viewport
        //    arrColumn = xtag.query(
        //                    element.elems.dataViewport,
        //                    '[data-col-number="0"]'
        //                );
        //    col_i = 0;
        //    col_len = arrColumn.length;
        //    while (col_i < col_len) {
        //        intElementPos = parseInt(arrColumn[col_i].style.top, 10);
        //        intElementSize = parseInt(arrColumn[col_i].style.height, 10);
        //        intElementExtreme = (
        //            intElementPos +
        //            intElementSize +
        //            scrollTopDifference
        //        );

        //        if (intElementExtreme <= scrollTopOffset) {
        //            arrRow = xtag.query(
        //                element.elems.dataViewport,
        //                '[data-row-number="' +
        //                    arrColumn[col_i].getAttribute('data-row-number') +
        //                '"]'
        //            );
        //            row_i = 0;
        //            row_len = arrRow.length;
        //            while (row_i < row_len) {
        //                element.elems.dataViewport.removeChild(arrRow[row_i]);
        //                row_i += 1;
        //            }
        //        } else {
        //            break;
        //        }

        //        col_i += 1;
        //    }
        //}

        //// handle bottom rows deletion
        //if (scrollDirection.indexOf('down') !== -1) {
        //    
        //}

        //// handle left columns deletion
        //if (scrollDirection.indexOf('left') !== -1) {
        //    
        //}

        //// handle right columns deletion
        //if (scrollDirection.indexOf('right') !== -1) {
        //    
        //}

        //// we need to update the locations of the elements that remain

        //// handle updating rows Y positioning
        //if (scrollDirection.indexOf('up') !== -1 ||
        //    scrollDirection.indexOf('down') !== -1) {
        //    arrCell = xtag.query(
        //        element.elems.dataViewport,
        //        '.table-cell, .table-record-selector'
        //    );
        //    cell_i = 0;
        //    cell_len = arrCell.length;
        //    while (cell_i < cell_len) {
        //        intElementPos = parseInt(arrCell[cell_i].style.top, 10);
        //        //console.log(intElementPos, scrollTopDifference);
        //        arrCell[cell_i].style.top = (
        //                                        intElementPos +
        //                                        scrollTopDifference
        //                                    ) + 'px';
        //        cell_i += 1;
        //    }
        //}

        //// handle updating columns X positioning
        //if (scrollDirection.indexOf('left') !== -1 ||
        //    scrollDirection.indexOf('right') !== -1) {
        //    
        //}

        // we need to create the elements that are now in the viewport
        