//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps, addFocusEvents, addDataEvents, addDataAttributes
//global addAutocompleteProps
//jslint browser:true, maxlen:80, white:false, this:true

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


// ############################################################################
// ########################## ELEMENT DOCUMENTATION ###########################
// ############################################################################




// ############################################################################
// ############################### NOTES/IDEAS ################################
// ############################################################################
/*

FOCUS/BLUR/CHANGE stablize:
Detecting when focus enters/leaves a combo is tricky for a couple reasons.
        First, there's multiple elements capable of recieving the focus (the
        combo itself, the control, and the button. Second, the blur and focus
        events are timed such that document.activeElement isn't reliable. So,
        perhaps we should have a global event listener that handles keeping
        track of that and notifies the combobox elements when they've lost or
        gained the focus. After that, we intercept and stop propagation of all
        focus events unless it's triggered by the combo because of our global
        code (which we can do by putting a modifier on the event to mark it as
        free to pass). Stabilizing this will help stablize the change event.
        At the moment, it seems fine, but we can simplify the code if this
        works.

CODE ORGANIZATION ADJUSTMENT:
The dropdown code is under the "UTILITY FUNCTIONS" section at the moment, it
        would be better to move it to it's own section.

*/


// ############################################################################
// ############################## SNIPPET/DESIGN ##############################
// ############################################################################

window.addEventListener('design-register-element', function () {
    'use strict';

    addSnippet(
        '<gs-combo>',
        '<gs-combo>',
        ml(function () {/*gs-combo src="test.rtime_copy_datasheet">
    <template for="header">
        <gs-cell>${1}</gs-cell>
    </template>
    <template for="row">
        <gs-cell>${2}</gs-cell>
    </template>
</gs-combo>*/
        })
    );

    addElement('gs-combo', '#controls_combo');

    // DEFINE PROPERTIES
    window.designElementProperty_GSCOMBO = function (selected) {
        addGSControlProps();
        addDataAttributes('select');
        addText('V', 'Dropdown Width', 'dropdown-width');
        addText('V', 'Hide Columns', 'hide');
        addText('D', 'Null String', 'null-string');
        addFocusEvents();
        addDataEvents('select');
        addCheck('D', 'Allow Empty', 'allow-empty');
        addCheck('D', 'Limit&nbsp;To&nbsp;List', 'limit-to-list');
        addAutocompleteProps();
        addText('O', 'Column In QS', 'qs');
        addText('O', 'Refresh On QS Columns', 'refresh-on-querystring-values');
        addCheck('O', 'Refresh On QS Change', 'refresh-on-querystring-change');
        addFlexProps(selected);
    };
});

//var renderSeq = 0;
document.addEventListener('DOMContentLoaded', function () {
    'use strict';
// ############################################################################
// ############################ FUNCTION SHORTCUTS ############################
// ############################################################################

    var cmbQryKids = xtag.queryChildren;


// ############################################################################
// ############################ UTILITY FUNCTIONS #############################
// ############################################################################

    function extractAndConvertTableTemplate(element, templateElement) {
        // some genericly profound comment explaining the virtue of
        //      keeping the variable declarations at the top of the
        //      function while simultaniously being captivating and
        //      barely entertaining in a long run-on sentence.
        // That's it, that's the tweet.
        // Few will get this.
        // Tell your sons this.
        // Will not explain.
        var tableElement;
        var strHeaders;
        var strCells;
        var strData;
        var arrRows;
        var arrCells;

        var arrHeaders;
        var arrTypes;
        var arrRecords;

        var firstCell;
        var firstCellNumber;
        var i;
        var len;
        var cell_i;
        var cell_len;
        var cell;
        var strNullString;

        // we need to have the table element handy, because we'll be doing our
        //      selections to get the cells from there.
        tableElement = templateElement.content.children[0];

        // we need to know how we differentiate null strings for tab encoding
        strNullString = element.getAttribute('null-string');

        // some people, use th in the first field for a row number or other
        //      non-display information. We want to skip the first field if
        //      the first data field is a TH.
        firstCell = cmbQryKids(tableElement, 'tbody th, tbody td')[0];
        firstCellNumber = 0;
        if (firstCell.nodeName === 'TH') {
            firstCellNumber = 1;
        }

        // gather headers
        strHeaders = '';
        arrCells = cmbQryKids(tableElement, 'thead th, thead td');
        i = firstCellNumber;
        len = arrCells.length;
        while (i < len) {
            strHeaders += '<gs-cell>' + arrCells[i].innerHTML + '</gs-cell>';
            i += 1;
        }

        // if we didn't find any headers, create blank ones
        if (!strHeaders) {
            arrCells = cmbQryKids(
                tableElement,
                'tbody tr:first-child th, tbody tr:first-child td'
            );
            i = firstCellNumber;
            len = arrCells.length;
            while (i < len) {
                strHeaders += (
                    '<gs-cell>' +
                        (arrCells[i].getAttribute('heading') || '') +
                    '</gs-cell>'
                );
                i += 1;
            }
        }

        // gather rows
        arrHeaders = [];
        arrTypes = [];
        arrRecords = [];

        strData = '';
        strCells = '';

        arrRows = cmbQryKids(tableElement, 'tbody tr');
        i = 0;
        len = arrRows.length;
        while (i < len) {
            arrCells = cmbQryKids(arrRows[i], 'td, th');
            cell_i = firstCellNumber;
            cell_len = arrCells.length;
            while (cell_i < cell_len) {
                cell = arrCells[cell_i];
                // NOTE: If there is no source, then we do the static data stuff
                // Nunzio on 2021-09-20

                // if there's only one record, just use it as the template.
                if (i === 0 && len === 1 && element.hasAttribute('src')) {
                    strCells += (
                        '<gs-cell ' + (
                            arrRows[i].getAttribute('value')
                                ? 'value="' + encodeHTML(
                                    arrRows[i].getAttribute('value')
                                ) + '"'
                                : ''
                        ) + '>' +
                            arrCells[cell_i].innerHTML +
                        '</gs-cell>'
                    );

                // else, we have more than one record and we're making up a
                //      template for the developer. We use {{= because the data
                //      is going to contain the cell html in it. So, we don't
                //      want to html encode the developer's html with {{!
                } else if (i === 0 && (len > 1 || !element.hasAttribute('src'))) {
                    if (
                        cell_i === firstCellNumber &&
                        arrRows[i].hasAttribute('value')
                    ) {
                        arrHeaders.push('column_id');
                        arrTypes.push('text');
                        strCells += (
                            '<gs-cell value="{{= row.column_id }}">' +
                                '<label>' +
                                    '{{= row.column_' + cell_i + ' }}' +
                                '</label>' +
                            '</gs-cell>'
                        );
                    } else {
                        strCells += (
                            '<gs-cell>' +
                                '<label>' +
                                    '{{= row.column_' + cell_i + ' }}' +
                                '</label>' +
                            '</gs-cell>'
                        );
                    }

                    arrHeaders.push('column_' + cell_i);
                    arrTypes.push('text');
                }

                // if there's more than one record, we need to start storing
                //      data, because the developer has opted for a local
                //      combobox, not one that loads from the database
                if (len > 1 || !element.hasAttribute('src')) {
                    if (
                        cell_i === firstCellNumber &&
                        arrRows[i].hasAttribute('value')
                    ) {
                        strData += GS.encodeForTabDelimited(
                            arrRows[i].getAttribute('value'),
                            strNullString
                        ) + '\t';
                    } else if (cell_i > firstCellNumber) {
                        strData += '\t';
                    }
                    strData += GS.encodeForTabDelimited(
                        arrCells[cell_i].innerHTML,
                        strNullString
                    );
                }

                cell_i += 1;
            }
            if (strData) {
                arrRecords.push(strData);
                strData = '';
            }

            i += 1;
        }

        if (strHeaders) {
            element.internalTemplates.header = strHeaders;
        }
        if (strCells) {
            element.internalTemplates.row = strCells;
        }
        if (arrRecords.length > 0) {
            element.internalData.staticHeaders = arrHeaders;
            element.internalData.staticTypes = arrTypes;
            element.internalData.staticRecords = arrRecords;
        }
    }

    // there are multiple places where we check if we need to trigger a change
    //      event.
    function triggerChangeIfNeeded(element) {
        var jsnDisp;
        var control;

        // change events should not be triggered if the combo is not editable
        // if this combo aint gonna break, yeet outta this funky town
        if (
            element.hasAttribute('disabled') ||
            element.hasAttribute('readonly')
        ) {
            return false;
        }

        // shorcut variables
        jsnDisp = element.internalDisplay;
        control = element.elems.control;
        //console.log('lastPublishedIndex', jsnDisp.lastPublishedIndex
        //    , 'lastVerifiedIndex', jsnDisp.lastVerifiedIndex);
        //console.log('lastPublishedValue', jsnDisp.lastPublishedValue
        //    , 'lastVerifiedValue', jsnDisp.lastVerifiedValue);
        //console.log('lastPublishedDisplay', jsnDisp.lastPublishedDisplay
        //    , 'lastVerifiedDisplay', jsnDisp.lastVerifiedDisplay);

        // the published value is always filled with the last verified value on
        //      entering the field, if the verified value is different from the
        //      published value, trigger the change
        if (
            jsnDisp.lastPublishedIndex !== jsnDisp.lastVerifiedIndex ||
            jsnDisp.lastPublishedValue !== jsnDisp.lastVerifiedValue ||
            jsnDisp.lastPublishedDisplay !== jsnDisp.lastVerifiedDisplay
        ) {
            // update the last published value
            jsnDisp.lastPublishedIndex = jsnDisp.lastVerifiedIndex;
            jsnDisp.lastPublishedValue = jsnDisp.lastVerifiedValue;
            jsnDisp.lastPublishedDisplay = jsnDisp.lastVerifiedDisplay;

            // update control value and attribute value
            control.value = jsnDisp.lastVerifiedDisplay;
            element.setAttribute('value', jsnDisp.lastVerifiedValue);

            //console.log('4:', control.value);
            //console.log('5:', element.value);
            //console.log('6:', element.getAttribute('value'));
/*
            if (
                element.hasAttribute('limit-to-list') &&
                jsnDisp.lastVerifiedIndex === null &&
                jsnDisp.lastVerifiedDisplay !== ''
            ) {
                alert('The text you entered is not in the list');
                openDropDown(element);
                GS.setInputSelection(control, 0, control.value.length);
            }
*/

            // ############ cross' version 2 ############
            // if limit to list, and no value has been selected from the list
            if (
                element.hasAttribute('limit-to-list') &&
                jsnDisp.lastVerifiedIndex === null
            ) {
                if (element.hasAttribute('allow-empty')) {
                    // if the "allow-empty" attribute has a value, that is the
                    //      default "empty" value, otherwise, set to empty
                    //      string
                    control.value = (element.getAttribute('allow-empty') || '');
                    element.value = (element.getAttribute('allow-empty') || '');

                } else if (jsnDisp.lastVerifiedDisplay !== '') {
                    alert('The text you entered is not in the list.');
                    openDropDown(element);
                    GS.setInputSelection(control, 0, control.value.length);

                    // if we have a limit to list error, we want to exit the
                    //      function to prevent the change event from triggering
                    //      and causing a database update when we have an
                    //      invalid value
                    return;
                }
            }

            // we don't want to trigger a change if it's empty, when limit to
            //      list is triggered, because it will cause an update to the
            //      database, which (if the column doesn't allow empty string)
            //      could cause a database error on top of the limit-to-list
            //      error, stacking errors when the first error is all the user
            //      needs.
            if (
                !element.hasAttribute('limit-to-list') ||
                element.hasAttribute('allow-empty') ||
                element.value
            ) {
                // trigger event
                GS.triggerEvent(element, 'change');
            }
        }
    }

    // we need to be able to execute event attributes (like onafter_select)
    //      while being able to reference the combobox as "this" in the code.
    function evalInContext(element, strJS) {
        var execFunc = function () {
            return eval(strJS);
        };

        execFunc.call(element);
    }

    // we want to standardize event triggering in this element.
    function triggerEvent(element, strEvent) {
        GS.triggerEvent(element, strEvent);
        GS.triggerEvent(element, 'on' + strEvent);
        if (
            element.hasAttribute('on' + strEvent) &&
            // onfocus and onblur attributes are handled automatically by the
            //      browser
            strEvent !== 'focus' &&
            strEvent !== 'blur'
        ) {
            evalInContext(element, element.getAttribute('on' + strEvent));
        }
    }

    // the user needs to be able to set a custom websocket for this element,
    //      so this function will use an attribute to find out what socket to
    //      use (and it'll default to "GS.envSocket")
    function getSocket(element) {
        if (element.getAttribute('socket')) {
            return GS[element.getAttribute('socket')];
        }
        return GS.envSocket;
    }

    function recordToJSON(element, strRecord) {
        var col_i;
        var col_len;
        var decodeTab = GS.decodeFromTabDelimited;
        var arrRecord;
        var jsnRecord;
        var strCell;
        var delim;
        var strNull;
        var arrColNames;

        // we need the null-string in order to properly decode WS data
        strNull = element.getAttribute('null-string');

        // save the column name array for quick and easy access
        arrColNames = element.internalData.columnNames;

        // create cell array for this record
        strRecord = strRecord + '\t';
        arrRecord = [];
        col_i = 0;
        col_len = element.internalData.columnNames.length;//9999;
        while (col_i < col_len) {
            delim = strRecord.indexOf('\t');
            strCell = strRecord.substring(0, delim);
            strRecord = strRecord.substring(delim + 1);
            arrRecord.push(decodeTab(strCell, strNull));
            col_i += 1;
        }

        // create record JSON from the cell array
        col_i = 0;
        col_len = arrRecord.length;
        jsnRecord = {};
        while (col_i < col_len) {
            jsnRecord[arrColNames[col_i]] = arrRecord[col_i];
            col_i += 1;
        }

        return jsnRecord;
    }

    // There are various times that we need to find a record with a string
    function findRecord(element, strValue, strDisplay, bolPartial) {
        var i;
        var len;

        var bolFound;
        var jsnRecord;
        var currValue;
        var currDisplay;

        var valueTemplate;
        var displayTemplate;
        var valueFunc;
        var displayFunc;
        var valueRendered;
        var displayRendered;

        // we need the current hidden and display values. The attribute is the
        //      only way of setting the value of the combobox internally and
        //      externally. useing the .value accessor on the combo is just a
        //      window to setting the attribute. We'll also grab the current
        //      display value. If the hidden and display values are the same as
        //      the last verified value, we don't need to continue.
        currValue = strValue || '';
        currDisplay = strDisplay || '';

        // if partial search, lowercase
        if (bolPartial) {
            currValue = currValue.toLowerCase();
            currDisplay = currDisplay.toLowerCase();
        }

        // we need to template the hidden and display values. so, let's
        //      create the template function.
        valueTemplate = element.internalTemplates.valueText;
        displayTemplate = element.internalTemplates.valueDisplay;
        valueFunc = doT.template(
            '{{var row = jo; ' +
            'var i = jo.internal_you_cant_guess_i; ' +
            'var len = jo.internal_you_cant_guess_len; ' +
            'var row_number = jo.internal_you_cant_guess_row_number;}}' +
            valueTemplate
        );
        displayFunc = doT.template(
            '{{var row = jo; ' +
            'var i = jo.internal_you_cant_guess_i; ' +
            'var len = jo.internal_you_cant_guess_len; ' +
            'var row_number = jo.internal_you_cant_guess_row_number;}}' +
            displayTemplate
        );

        //// for now, we want to keep an eye on the render timer. We don't
        ////      want this getting slow.
        //renderSeq += 1;
        //console.time('Render (' + renderSeq + ')');

        // we're going to do a record by record search
        valueRendered = '';
        displayRendered = '';
        i = 0;
        len = element.internalData.records.length;
        while (i < len) {
            jsnRecord = recordToJSON(element, element.internalData.records[i]);
            jsnRecord.internal_you_cant_guess_row_number = (i + 1);
            jsnRecord.internal_you_cant_guess_i = i;
            jsnRecord.internal_you_cant_guess_len = len;

            // if the value or display matches (if we have a hidden value,
            //      that must match, else, we can match on display)
            if (valueTemplate) {
                valueRendered = valueFunc(jsnRecord);
            }
            displayRendered = displayFunc(jsnRecord);

            // if not partial, perform exact match
            if (
                !bolPartial &&
                (
                    (valueTemplate && valueRendered === currValue) ||
                    (displayRendered === currDisplay) ||
                    (displayRendered === currValue)
                )
            ) {
                bolFound = true;
            }

            // if partial, perform startswith match
            // Nunzio commented out the value search on 2021-10-13
            // this is because if the value column is hidden,
            //      it should not be searched
            if (
                bolPartial &&
                (
                    // (
                    //     valueTemplate &&
                    //     valueRendered.toLowerCase().indexOf(currValue) === 0
                    // ) ||
                    displayRendered.toLowerCase().indexOf(currDisplay) === 0
                )
            ) {
                bolFound = true;
            }

            // we don't want to keep searching if we've found our value.
            if (bolFound) {
                break;
            }

            i += 1;
        }

        // if nothing is found, we don't want to send a row number
        if (!bolFound) {
            bolFound = false;
            i = null;
            valueRendered = null;
            displayRendered = null;
        }

        //// report the search time
        //console.timeEnd('Render (' + renderSeq + ')');

        return {
            "found": bolFound,
            "index": i,
            "value": valueRendered,
            "display": displayRendered
        };
    }

    // to get the selected row number from the dropdown GS-TABLE, there's a lot
    //      of things that need to be in place. To prevent repeated code, we
    //      handle all those checks here.
    function getSelectedRowFromDropdown(element) {
        var gsTable;
        var arrRanges;
        var jsnRange;
        var jsnStart;
        var intRow;

        gsTable = element.elems.gsTable;
        if (!gsTable) {
            return null;
        }

        arrRanges = gsTable.internalSelection.ranges;
        if (!arrRanges) {
            return null;
        }

        jsnRange = arrRanges[0];
        if (!jsnRange) {
            return null;
        }

        jsnStart = jsnRange.start;
        if (!jsnStart) {
            return null;
        }

        intRow = jsnStart.row;
        if (typeof intRow !== 'number') {
            return null;
        }

        return intRow;
    }

    // in multiple places, we want to set the value based on the current
    //      selection of the GS-TABLE in the dropdown. Here, we try to set the
    //      control, "value" attribute and record as verified. We return true
    //      if we were able to find a value, false if weren't able to find a
    //      value.
    function setValueFromDropdown(element) {
        var intRow;
        var valueTemplate;
        var displayTemplate;
        var valueFunc;
        var displayFunc;
        var valueRendered;
        var displayRendered;
        var finalValue;
        var finalDisplay;
        var jsnRecord;
        //console.log(element);

        // get selected row number from table
        intRow = getSelectedRowFromDropdown(element);
        //console.log(
        //    intRow,
        //    element.elems.gsTable.internalSelection.ranges,
        //    element.elems.gsTable.internalData.records,
        //    element.internalData.records
        //);

        // we don't want to do anything if there's no selection we can use
        if (intRow === null) {
            // report failure
            return false;
        }

        // we need to template the hidden and display values. so, let's
        //      create the template function.
        valueTemplate = element.internalTemplates.valueText;
        displayTemplate = element.internalTemplates.valueDisplay;
        valueFunc = doT.template(
            '{{var row = jo; ' +
            'var i = jo.internal_you_cant_guess_i; ' +
            'var len = jo.internal_you_cant_guess_len; ' +
            'var row_number = jo.internal_you_cant_guess_row_number;}}' +
            valueTemplate
        );
        displayFunc = doT.template(
            '{{var row = jo; ' +
            'var i = jo.internal_you_cant_guess_i; ' +
            'var len = jo.internal_you_cant_guess_len; ' +
            'var row_number = jo.internal_you_cant_guess_row_number;}}' +
            displayTemplate
        );

        jsnRecord = recordToJSON(
            element,
            element.internalData.records[intRow]
        );

        jsnRecord.internal_you_cant_guess_i = intRow;
        jsnRecord.internal_you_cant_guess_len = (
            element.internalData.records.length
        );
        jsnRecord.internal_you_cant_guess_row_number = (intRow + 1);

        // if the value or display matches (if we have a hidden value,
        //      that must match, else, we can match on display)
        if (valueTemplate) {
            valueRendered = valueFunc(jsnRecord);
        }
        displayRendered = displayFunc(jsnRecord);
        //console.log(valueRendered, displayRendered);

        finalValue = (valueRendered || displayRendered);
        finalDisplay = (displayRendered);

        element.internalDisplay.lastVerifiedIndex = intRow;
        element.internalDisplay.lastVerifiedValue = finalValue;
        element.internalDisplay.lastVerifiedDisplay = finalDisplay;
        element.elems.control.value = finalDisplay;
        element.setAttribute('value', finalValue);

        // report success
        return true;
    }

    // when we close the dropdown, we need to unbind it so that we don't
    //      start stacking events because we never unbind anything.
    function unbindDropDown(element) {
        window.removeEventListener(
            'resize',
            element.internalEvents.closeHandler
        );
        window.removeEventListener(
            'orientationchange',
            element.internalEvents.closeHandler
        );
        window.removeEventListener(
            'mousewheel',
            element.internalEvents.closeHandler
        );
        window.removeEventListener(
            'comboclose',
            element.internalEvents.closeHandler
        );
        document.body.removeEventListener(
            'click',
            element.internalEvents.closeHandler
        );

        element.elems.gsTable.removeEventListener(
            'selection_change',
            element.internalEvents.selectionHandler
        );
    }

    // close combobox dropdown
    function closeDropDown(element) {
        // no sense in closing what's already closed
        if (element.internalDisplay.open) {
            // unbind dropdown events
            unbindDropDown(element);

            // destroy GS-TABLE, if it's there
            if (element.elems.gsTable) {
                element.elems.gsTable.destroy();
                element.elems.scrollContainer.removeChild(
                    element.elems.gsTable
                );
            }

            // remove dropdown from DOM
            document.body.removeChild(element.elems.dropDownContainer);

            // remove "open" combo status
            element.classList.remove('open');
            element.internalDisplay.open = false;

            // THIS BROKE THE COMBO!!!!
            //    WTF? IT WON'T TRIGGER A CHANGE IF YOU HAVE THIS?!!!!
            //    WHY!?!?!?!?!?!??! 7/1/22 -cross
            // make sure focus is in control
            // element.elems.control.focus();
        }
    }

    // when the dropdown is open, we bind a bunch of stuff to the window to
    //      detect when it's time to automatically close the dropdown. It's
    //      self contained, so it's not in the event functions, with are
    //      targeted to the combo itself.
    function bindDropDown(element) {
        // handle dropdown close
        element.internalEvents.closeHandler = function (event) {
            var target = event.target;
            var dropDownContainer = element.elems.dropDownContainer;
            var container = GS.findParentElement(target, dropDownContainer);
            var body = GS.findParentElement(target, 'body');

            // we've had issues where a gs-cell from the gs-table is taken
            //      out of the dom before we get to this mouse event, because
            //      we were scrolling too fast. So, if the element that
            //      triggered the mousewheel is still in the dom, and it's not
            //      in the dropdown, that's when we trigger the close.
            if (body && container !== dropDownContainer && !event.gs) {
                closeDropDown(element);
            }
        };

        window.addEventListener(
            'resize',
            element.internalEvents.closeHandler
        );
        window.addEventListener(
            'orientationchange',
            element.internalEvents.closeHandler
        );
        window.addEventListener(
            'mousewheel',
            element.internalEvents.closeHandler
        );
        window.addEventListener(
            'comboclose',
            element.internalEvents.closeHandler
        );
        document.body.addEventListener(
            'click',
            element.internalEvents.closeHandler
        );

        // handle dropdown selection
        element.internalEvents.selectionHandler = function () {
            // set control, value attribute, and record as verified
            if (setValueFromDropdown(element)) {
                // we want the dropdown to close when we've successfully
                //      selected a record
                closeDropDown(element);

                // if we chose a record, trigger a change
                triggerChangeIfNeeded(element);
            }
        };

        element.elems.gsTable.addEventListener(
            'selection_change',
            element.internalEvents.selectionHandler
        );
    }

    // the position of the dropdown is dynamic, so we need to separate out
    //      opening and positioning the dropdown box.
    function positionDropdown(element) {
        var dropDownContainer;
        var positionContainer;

        var jsnComboPos;
        var intComboHeight;
        var intComboWidth;
        var intComboTop;
        var intComboLeft;
        var intWindowHeight;
        var intWindowWidth;
        var intComboToBottom;
        var intComboToTop;

        var intDropdownWidth;

        var strWidth = '';
        var strHeight = '';
        var strLeft = '';
        var strTop = '';
        var strBottom = '';

        // element shortcuts, we want to keep the code readable
        dropDownContainer = element.elems.dropDownContainer;
        positionContainer = element.elems.positionContainer;

        // gather position variables. These are all the factors we pay
        //      attention to when deciding what the best display would be
        //      for the dropdown box.
        jsnComboPos = GS.getElementOffset(element);
        intComboHeight = element.offsetHeight;
        intComboWidth = element.offsetWidth;
        intComboTop = jsnComboPos.top;
        intComboLeft = jsnComboPos.left;
        intWindowHeight = window.innerHeight;
        intWindowWidth = window.innerWidth;
        intComboToBottom = (intWindowHeight - (intComboTop + intComboHeight));
        intComboToTop = intComboTop;

        // time to calculate the optimum styles for the dropdown container

        // let's calculate height and vertical position

        // if window is smol af, go full height
        if (intWindowHeight < 500) {
            strHeight = intWindowHeight + 'px';
            strTop = '0px';

        // open below combo, with constrained height
        } else if (intComboToBottom > 300) {
            strHeight = '200px';
            strTop = (intComboToTop + intComboHeight) + 'px';

        // open above combo, with constrained height
        } else if (intComboToTop > 300) {
            strHeight = '200px';
            strBottom = (intComboToBottom + intComboHeight) + 'px';

        // go from combo to bottom of screen
        } else if (intComboToBottom > 200) {
            strHeight = intComboToBottom + 'px';
            strTop = (intComboToTop + intComboHeight) + 'px';

        // go from combo to top of screen
        } else if (intComboToTop > 200) {
            strHeight = intComboToTop + 'px';
            strBottom = (intComboToBottom + intComboHeight) + 'px';

        // if nothing works, default to full height
        } else {
            strHeight = intWindowHeight + 'px';
            strTop = '0px';
        }

        // let's calculate width and horizontal position

        // we need to try to expand the box depending on total width of columns

        // If we got lots of room, cap the width
        if (element.internalDisplay.definedDropdownWidth) {
            intDropdownWidth = GS.sizeToPx(
                element,
                element.internalDisplay.definedDropdownWidth
            );
            intDropdownWidth = Math.min(intDropdownWidth, intWindowWidth);

            strWidth = intDropdownWidth + 'px';
            strLeft = Math.max(
                ((intComboLeft + intComboWidth) - intDropdownWidth),
                0
            ) + 'px';

        } else if (intWindowWidth > 400 && intComboWidth > 400) {
            strWidth = intComboWidth + 'px';
            strLeft = Math.max(intComboLeft, 0) + 'px';

        } else if (intWindowWidth > 400) {
            strWidth = '300px';
            strLeft = Math.max(
                ((intComboLeft + intComboWidth) - 300),
                0
            ) + 'px';

        // else full width
        } else {
            strWidth = '100%';
            strLeft = '0px';
        }

        // set position and size to what we determined, anything not set will
        //      be set to '' because that's the initial value in the variable.
        positionContainer.style.top = strTop;
        positionContainer.style.bottom = strBottom;
        positionContainer.style.left = strLeft;
        positionContainer.style.width = strWidth;
        positionContainer.style.height = strHeight;

        // we display differently if the dropdown opens below or above
        //      the combo
        if (strTop) {
            dropDownContainer.classList.add('below');
            dropDownContainer.classList.remove('above');
        } else {
            dropDownContainer.classList.add('above');
            dropDownContainer.classList.remove('below');
        }
    }

    // open combobox dropdown, this function will handle the position and
    //      filling of the dropped down portion.
    function openDropDown(element) {
        var strHeader;
        var strRow;
        var gsTable;
        var arrHeights;
        var i;
        var len;
        var intMaxTop;
        var control;
        var strHeight;
        var recordHeight;

        // no sense opening the dropdown twice, also no sense opening the
        //      dropdown to a disabled/readonly combobox
        if (
            element.internalDisplay.open === false &&
            !element.hasAttribute('disabled') &&
            !element.hasAttribute('readonly') &&
            element.internalDisplay.opening === false
        ) {
            // takes a moment to open the dropdown, don't want to open twice.
            element.internalDisplay.opening = true;

            // we cache selects that have the same parameters. This is because
            //      we might have a thousand combos in the same list. So,
            //      running a refresh is basically free unless the select
            //      parameters have changed. In which case, you'd want to
            //      refresh anyway.
            element.refresh(function () {
                // we want to focus the control, so that we can immediately
                //      start typing or so we can close the dropdown when they
                //      leave the field
                if (!evt.touchDevice) {
                    control = element.elems.control;
                    control.focus();

                    // select all text for easy override
                    GS.setInputSelection(control, 0, control.value.length);
                }

                // There may be another combobox open, trigger event to close
                //      all open combo dropdowns
                GS.triggerEvent(window, 'comboclose');

                // time to shine, get the dropdown into the DOM, it's appended
                //      to the body becuase it has to display in front of
                //      everything else. It's basically a modal dialog. POTENIAL
                //      IMPROVEMENT: we could potentially replace this a
                //      GS-DIALOG.
                document.body.appendChild(element.elems.dropDownContainer);

                // resize dropdown, we may want to re-position the dropdown at
                //      any given moment, so it's been moved into it's own
                //      function.
                positionDropdown(element);

                // gather templates
                strHeader = element.internalTemplates.header;
                strRow = element.internalTemplates.row;
                if (element.hasAttribute('default-cell-height')) {
                    strHeight = 'default-cell-height="' + element.getAttribute('default-cell-height') + '"';
                } else {
                    strHeight = '';
                }



                // fill dropdown with table, we use the GS-TABLE here so that
                //      we don't have to code table rendering all over again.
                //      This will also make it easy to handle 100000s of records
                //      worth of data
                element.elems.scrollContainer.appendChild(
                    GS.stringToElement(
                        ml(function () {/*
                            <gs-table
                                id="combo-dropdown-table"
                                selection-mode="single-row"
                                no-x-overscroll    no-y-overscroll
                                no-resize-record   no-resize-column
                                no-column-reorder  no-context-menu
                                column-auto-resize no-column-dropdown
                                no-force-select    no-copy
                                {{STRHEIGHT}}
                            >
                                <template for="header-record">
                                    {{HEADER}}
                                </template>
                                <template for="data-record">
                                    {{DATA}}
                                </template>
                            </gs-table>*/
                        })
                            .replace(/\{\{HEADER\}\}/gi, strHeader)
                            .replace(/\{\{DATA\}\}/gi, strRow)
                            .replace(/\{\{STRHEIGHT\}\}/gi, strHeight)
                    )
                );

                // get gs-table element
                gsTable = element.elems.scrollContainer.children[0];
                element.elems.gsTable = gsTable;

                // load data/columns/display info into table
                intMaxTop = 0;
                arrHeights = [];
                recordHeight = gsTable.internalDisplay.defaultRecordHeight;
                i = 0;
                len = element.internalData.records.length;
                while (i < len) {
                    intMaxTop += recordHeight;
                    arrHeights.push(recordHeight);
                    i += 1;
                }

                gsTable.internalData.records = element.internalData.records;
                gsTable.internalDisplay.recordHeights = arrHeights;
                gsTable.internalData.columnNames = (
                    element.internalData.columnNames
                );
                gsTable.internalData.columnTypes = (
                    element.internalData.columnTypes
                );
                gsTable.internalData.bolFirstLoadFinished = true;
                gsTable.internalScroll.maxTop = intMaxTop;

                // if there is a selected record
                if (element.internalDisplay.lastVerifiedIndex) {
                    // load selection into table
                    // scroll to the selected record (if any)
                    gsTable.goToLine(
                        element.internalDisplay.lastVerifiedIndex + 1
                    );
                }

                // render table now that we have everything inside it
                gsTable.refresh();
                gsTable.render();
                gsTable.renderSelection();

                // we want to close the dropdown if we scroll the window, or
                //      if we click out, scroll with the mousewheel, etc.
                bindDropDown(element);

                // we are now open, tell the world!
                element.classList.add('open');
                element.internalDisplay.open = true;
                element.internalDisplay.opening = false;
            });
        }
    }

    // toggle combobox dropdown, this function will handle making sure we don't
    //      open the dropdown twice.
    function toggleDropdown(element) {
        // no sense opening the dropdown twice
        if (element.internalDisplay.open === false) {
            openDropDown(element);

        // if we're already open, close the dropdown
        } else {
            closeDropDown(element);
        }
    }

    // now that we have the templates, we need to figure out the id and
    //      display columns. Sometimes, they're the same column, but not
    //      every time. In table templates, the display column is a dot.js
    //      template in the "value" attribute of the tr. In gs-cell
    //      templates, it's in the "value" attribute in the first gs-cell.
    function getValueAndDisplayTemplates(element) {
        var firstCell = GS.stringToElement(element.internalTemplates.row);
        var strValueAttribute;
        var strTextContent;

        strValueAttribute = firstCell.getAttribute('value');
        strTextContent = firstCell.textContent;

        // most HTML display should be HTML encoded. If that's what the
        //      developer did, we need to make sure we change it to unencoded
        //      for the value display because the input element will display the
        //      exact text we give it
        if (strTextContent.indexOf('{{!') > -1) {
            strTextContent = strTextContent.replace(/\{\{!/gi, '{{=');
        }

        element.internalTemplates.valueText = (
            strValueAttribute ||
            strTextContent
        );

        element.internalTemplates.valueDisplay = strTextContent;
    }


// #############################################################################
// ############################# ELEMENT FUNCTIONS #############################
// #############################################################################

    // some attributes can't be used in their normal, dev-friendly format,
    //      this function translates those attributes to their final formats
    // some attributes need to be defaulted, even if they're not present
    function resolveElementAttributes(element) {
        var arrParts;

        // GS-COMBO elements that are connected to Envelope need to have "pk"
        //      attribute
        if (element.getAttribute('src')
                && element.getAttribute('src')[0] !== '(') {
            // split "src" into "schema" and "object" attributes
            arrParts = GS.templateWithQuerystring(
                element.getAttribute('src')
            ).split('.');

            // I don't know who added this. I don't inderstand why someone
            //      would put something like "biz.bar.foo" in the "src"
            //      attribute. That's the case that this code handles. If
            //      you added this code: PUT A COMMENT!!!! We have comments
            //      for a reason. Don't ruin this beautiful code. Only YOU
            //      can prevent spaghetti code.
            //  ~Michael
            // It appears to be a solution to quote idented object names that
            //      contain a period like this: test."test.asdf"
            //      The problem with this solution (other than being unclear)
            //      is that it wont work for schema names that contain a period.
            //      We need a better solution for this. Perhaps it's time to
            //      create a function that understands ident quoted names for
            //      real, using actual parsing.
            //  ~Also Michael
            if (arrParts[2]) {
                arrParts[1] = arrParts[1] + '.' + arrParts[2];
            }

            // put the split sections of the object name into separate
            //      attributes
            element.setAttribute('schema', arrParts[0]);
            element.setAttribute('object', arrParts[1]);
        } else if (element.getAttribute('src')
                && element.getAttribute('src')[0] === '(') {
            element.setAttribute('object', GS.templateWithQuerystring(
                element.getAttribute('src')
            ));
        }

        // default null string attribute
        element.setAttribute(
            'null-string',
            (element.getAttribute('null-string') || '')
        );
    }

    // create internal structures and inner elements that persist through the
    //      whole lifetime of the element
    function prepareElement(element) {
        var rootElement;
        var dropDownContainer;
        var positionContainer;
        var scrollContainer;

        // we want a place to store elements
        element.elems = {};

        // we want a place to look to for data
        element.internalData = {
            "records": [],
            "columnNames": [],
            "columnTypes": [],
            "staticHeaders": [],
            "staticTypes": [],
            "staticRecords": [],
            "clearCache": false
        };

        // we need a place to store event functions because, to unbind a
        //      specific event javascript requires that you have the
        //      original function that was bound to that event
        element.internalEvents = {};

        // Some events need persistent storage of a related variable. This
        //      bucket will hold that info.
        element.internalEventData = {
            "defaultAttributes": {}
        };

        // we need a place to store our templates, so we'll create an
        //      element.internalTemplates JSON object and store each
        //      template under a unique name
        element.internalTemplates = {
            "header": "",
            "row": "",
            "valueText": "",
            "valueDisplay": ""
        };

        // we need a place to store cell dimensions and other display
        //      related info
        // anything in here set to "undefined" is set that way because the dev
        //      may set it to 0 or [] and we need to be able to tell that it
        //      hasn't been set yet
        element.internalDisplay = {
            // we always want to know if the dropdown is open or not.
            "open": false,
            "opening": false,

            // when user leaves combo or chooses item from dropdown, we compare
            //      to these to see if the verified values are different from
            //      when they entered the field. If they are, that means that
            //      it's time to trigger a change event. We set these on
            //      entering the combobox. That way, the latest published value
            //      is always fresh.
            "lastPublishedIndex": undefined,
            "lastPublishedValue": undefined,
            "lastPublishedDisplay": undefined,

            // If the combo has a "value" attribute and we find the related
            //      record and display, that's a verified value. If the user
            //      is in the middle of typing, that's not a verified value.
            //      Verified values are the latest savepoint.
            "lastVerifiedIndex": undefined,
            "lastVerifiedValue": undefined,
            "lastVerifiedDisplay": undefined,

            // we want to maintain information about the last search
            "lastNotFoundSearch": undefined,

            "definedDropdownWidth": undefined
        };

        // we need a place to store selection information
        element.internalSelection = {};

        // we need to make the persistent elements
        rootElement = document.createElement('div');
        rootElement.setAttribute('gs-dynamic', '');
        rootElement.classList.add('root');

        rootElement.innerHTML = (
            '<input role="textbox" aria-autocomplete="none" ' +
                'gs-dynamic class="control" type="text" />' +
            '<gs-button gs-dynamic aria-label="Open the Combo box" ' +
                'alt="Open the Combo box" class="drop_down_button" ' +
                'icononly icon="angle-down" tabindex="9999"></gs-button>'
            // the [tabindex="9999"] is because the blur event will only
            //      tell us where the focus went if the element that stole
            //      the focus can take focus. While it needs to accept
            //      focus for the blur event to work the way it does, we
            //      don't want users to have to tab twice in every combobox.
            //      So the combo buttons are the last thing to be tabbed to.
        );

        // We create a fresh dropdown element every time.
        dropDownContainer = document.createElement('div');

        // create and store the dropdown's children
        dropDownContainer.classList.add('gs-combo-dropdown-container');
        dropDownContainer.setAttribute('gs-dynamic', '');
        dropDownContainer.innerHTML = (
            '<div class="gs-combo-positioning-container" gs-dynamic>' +
            '    <div class="gs-combo-scroll-container" gs-dynamic></div>' +
            '</div>'
        );
        positionContainer = dropDownContainer.children[0];
        scrollContainer = positionContainer.children[0];

        // gather element shortcuts
        element.elems.root = rootElement;
        element.elems.control = rootElement.children[0];
        element.elems.button = rootElement.children[1];
        element.elems.dropDownContainer = dropDownContainer;
        element.elems.positionContainer = positionContainer;
        element.elems.scrollContainer = scrollContainer;

        // for backwards compatibility:
        element.control = element.elems.control;

        // append root
        element.appendChild(element.elems.root);
    }

    // get attributes and templates and extract all necessary information
    function siphonElement(element) {
        var headerTemplate;
        var rowTemplate;
        var unnamedTemplate;
        var i;
        var len;
        var jsnAttr;
        var arrAttributes;
        var prevElem;
        var forElem;

        // get each template element and save them to each their own variable,
        //      for easy access
        headerTemplate = cmbQryKids(element, '[for="header"]')[0];
        rowTemplate = cmbQryKids(element, '[for="row"]')[0];

        // some people put incorrect "for" attributes on templates. We need to
        //      get any unnamed or unrecognized template and assume it's old
        //      school.
        unnamedTemplate = cmbQryKids(
            element,
            (
                'template:not([for]),' +
                'template:not([for="header"]):not([for="row"])'
            )
        )[0];

        // remove all templates from the dom to prevent reflows
        if (headerTemplate) {
            element.removeChild(headerTemplate);
        }
        if (rowTemplate) {
            element.removeChild(rowTemplate);
        }
        if (unnamedTemplate) {
            element.removeChild(unnamedTemplate);
        }

        if (
            headerTemplate &&
            (
                headerTemplate.innerHTML.indexOf('&gt;') > -1 ||
                headerTemplate.innerHTML.indexOf('&lt;') > -1
            )
        ) {
            console.warn(
                'GS-TABLE WARNING: &gt; or &lt; detected in ' +
                'header template, this can have undesired ' +
                'effects on doT.js. Please use gt(x,y), gte(x,y), ' +
                'lt(x,y), or lte(x,y) to silence this warning.'
            );
        }
        if (
            rowTemplate &&
            (
                rowTemplate.innerHTML.indexOf('&gt;') > -1 ||
                rowTemplate.innerHTML.indexOf('&lt;') > -1
            )
        ) {
            console.warn(
                'GS-TABLE WARNING: &gt; or &lt; detected in ' +
                'row template, this can have undesired ' +
                'effects on doT.js. Please use gt(x,y), gte(x,y), ' +
                'lt(x,y), or lte(x,y) to silence this warning.'
            );
        }
        if (
            unnamedTemplate &&
            (
                unnamedTemplate.innerHTML.indexOf('&gt;') > -1 ||
                unnamedTemplate.innerHTML.indexOf('&lt;') > -1
            )
        ) {
            console.warn(
                'GS-TABLE WARNING: &gt; or &lt; detected in ' +
                'template, this can have undesired ' +
                'effects on doT.js. Please use gt(x,y), gte(x,y), ' +
                'lt(x,y), or lte(x,y) to silence this warning.'
            );
        }

        // pull in header template. because the header template is a straight
        //      passthrough to the gs-table we'll use for the dropdown, we just
        //      need to save the text of the template.
        if (headerTemplate) {
            element.internalTemplates.header = headerTemplate.innerHTML;
        }

        // pull in record template (for backwards compatibility, we need to be
        //      able to accept a template without a "for" attribute as the
        //      record template. Additionally, we need to be able to take a
        //      TABLE element here and convert it to gs-cell. Unless it's a
        //      static combobox. In which case, we convert it to static data
        //      and gs-cells.
        if (rowTemplate) {
            if (rowTemplate.content.children[0].nodeName === 'TABLE') {
                extractAndConvertTableTemplate(element, rowTemplate);
            } else {
                element.internalTemplates.row = rowTemplate.innerHTML;
            }
        }

        if (unnamedTemplate) {
            if (unnamedTemplate.content.children[0].nodeName === 'TABLE') {
                extractAndConvertTableTemplate(element, unnamedTemplate);
            } else {
                element.internalTemplates.row = unnamedTemplate.innerHTML;
            }
        }

        // if we haven't found a template and there is no datasource to create
        //      a template from, error
        if (!element.internalTemplates.row && !element.hasAttribute('src')) {
            throw 'GS-COMBO Error: No template provided.';
        }

        // if we have the templates, extract the value and display templates
        if (element.internalTemplates.row) {
            getValueAndDisplayTemplates(element);
        }

        // if the developer has set a tabindex, we need to transfer that to the
        //      control because that's where the focus is going to go
        if (element.hasAttribute('tabindex')) {
            element.elems.control.setAttribute(
                'tabindex',
                element.getAttribute('tabindex')
            );
            element.removeAttribute('tabindex');
        }

        // some attributes are always directly passed through to the control
        arrAttributes = [
            'placeholder', 'name', 'maxlength', 'autofocus', 'readonly', 'title'
        ];

        i = 0;
        len = arrAttributes.length;
        while (i < len) {
            if (element.hasAttribute(arrAttributes[i])) {
                element.elems.control.setAttribute(
                    arrAttributes[i],
                    (element.getAttribute(arrAttributes[i]) || '')
                );
            }
            i += 1;
        }

        // autocomplete attributes
        if (element.hasAttribute('autocorrect')) {
            element.elems.control.setAttribute('autocorrect', 'off');
        }
        if (element.hasAttribute('autocapitalize')) {
            element.elems.control.setAttribute('autocapitalize', 'off');
        }
        if (element.hasAttribute('autocomplete')) {
            element.elems.control.setAttribute('autocomplete', 'off');
        }
        if (element.hasAttribute('spellcheck')) {
            element.elems.control.setAttribute('spellcheck', 'false');
        }

        // we allow users to define the dropdown width
        if (element.hasAttribute('dropdown-width')) {
            element.internalDisplay.definedDropdownWidth = (
                element.getAttribute('dropdown-width')
            );
        }

        // if this combobox has an id, the control should have a related id
        if (element.hasAttribute('id')) {
            element.elems.control.setAttribute(
                'id',
                element.getAttribute('id') + '_control'
            );
        }

        // if this combobox has an id attribute, check and update label
        //      association
        if (element.hasAttribute('id')) {
            prevElem = element.previousElementSibling;
            if (
                prevElem &&
                prevElem.tagName.toUpperCase() === 'LABEL' &&
                prevElem.hasAttribute('for') &&
                prevElem.getAttribute('for') === element.getAttribute('id')
            ) {
                forElem = prevElem;
            } else {
                forElem = xtag.query(
                    document,
                    'label[for="' + element.getAttribute('id') + '"]'
                )[0];
            }

            if (forElem) {
                forElem.setAttribute(
                    'for',
                    element.getAttribute('id') + '_control'
                );
            }
        }

        // we need to store the defaults of the attributes in case of QS
        //      binding. Because we'll need to retemplate the initial attribute
        //      setting every time.
        i = 0;
        len = element.attributes.length;
        while (i < len) {
            jsnAttr = element.attributes[i];

            element.internalEventData.defaultAttributes[jsnAttr.nodeName] = (
                jsnAttr.value ||
                ''
            );
            i += 1;
        }
    }

// #############################################################################
// ############################# RENDER FUNCTIONS ##############################
// #############################################################################

    // the display value isn't always the same as the "value" attribute. If the
    //      hidden value is different from the display value, we need to search
    //      the data to render the display value.
    function renderControl(element, bolFullRerender) {
        var bolLimitToList;
        var bolLoaded;
        var jsnFound;

        var currValue;
        var currDisplay;
        var lastValue;
        var lastDisplay;
        var finalValue;
        var finalDisplay;
        var bolValueChange;
        var bolDisplayChange;

        // if no value has been set, skip
        if (!element.hasAttribute('value')) {
            return;
        }

        // if no control, this has been called too early, cancel
        if (!element.elems || !element.elems.root) {
            return;
        }

        // we need the current hidden and display values. The attribute is the
        //      only way of setting the value of the combobox internally and
        //      externally. useing the .value accessor on the combo is just a
        //      window to setting the attribute. We'll also grab the current
        //      display value. If the hidden and display values are the same as
        //      the last verified value, we don't need to continue.
        currValue = element.getAttribute('value') || '';
        currDisplay = element.elems.control.value || '';
        lastValue = element.internalDisplay.lastVerifiedValue || '';
        lastDisplay = element.internalDisplay.lastVerifiedDisplay || '';
        bolValueChange = (lastValue !== currValue);
        bolDisplayChange = (lastDisplay !== currDisplay);

        // we don't want to search if the value hasn't changed
        if (bolValueChange || bolDisplayChange || bolFullRerender) {
            // we need the null-string in order to properly decode WS data
            bolLimitToList = element.hasAttribute('limit-to-list');

            // we do things differently if the data isn't loaded yet
            bolLoaded = element.internalData.loaded;

            // find record by current value
            jsnFound = findRecord(element, currValue, currDisplay);

            // We found the record, set attribute and display text to the new
            //      values
            if (jsnFound.found) {
                finalValue = jsnFound.value;
                finalDisplay = jsnFound.display;

            // if we're not limit to list, and the display has been changed, or
            //      we have a display, set value and display to display.
            } else if (!bolLimitToList && (bolDisplayChange || currDisplay)) {
                finalValue = currDisplay;
                finalDisplay = currDisplay;

            // if we're not limit to list, and the value has been changed, or
            //      we have a value, set value and display to value.
            } else if (!bolLimitToList && (bolValueChange || currValue)) {
                finalValue = currValue;
                finalDisplay = currValue;

            // we got nothing. clear out combo
            } else {
                finalValue = '';
                finalDisplay = '';
            }

            // if there's no hidden value, coalesce to display value
            finalValue = (finalValue || finalDisplay);

            // we've verified the values, let's save them so that we can prevent
            //      re-searching through lots of data
            element.internalDisplay.lastVerifiedIndex = jsnFound.index;
            element.internalDisplay.lastVerifiedValue = finalValue;
            element.internalDisplay.lastVerifiedDisplay = finalDisplay;

            // finally, set the attribute and the display (display first,
            //      because we compare the last verified display to the current
            //      display in order to prevent recursion, and setting the
            //      attribute causes a re-render).
            if (!bolLimitToList || bolLoaded) {//bolFound || bolLoaded
                element.elems.control.value = finalDisplay;
                element.setAttribute('value', finalValue);
            }
        }

        var arrAttributes = [
            'placeholder', 'name', 'maxlength', 'autofocus', 'readonly', 'title'
        ];

        var i = 0;
        var len = arrAttributes.length;
        while (i < len) {
            if (element.hasAttribute(arrAttributes[i])) {
                element.elems.control.setAttribute(
                    arrAttributes[i],
                    (element.getAttribute(arrAttributes[i]) || '')
                );
            } else {
                element.elems.control.removeAttribute(arrAttributes[i]);
            }
            i += 1;
        }
    }


// ############################################################################
// ############################## DATA FUNCTIONS ##############################
// ############################################################################

    function dataSELECTcallback(element) {
        element.internalData.loaded = true;

        renderControl(element, true);

        triggerEvent(element, 'after_select');
    }

    function databaseWSSELECT(element) {
        var templateQS = GS.templateWithQuerystring;
        var arrRecords;
        var strHeaderCells;
        var strRecordCells;
        var arrHide;
        var arrCols;
        var strCols;
        var arrColNames;
        var saveColumns;

        // we need to get the column names and types
        saveColumns = function (data) {
            var i;
            var len;
            var strCol;
            var strType;

            element.internalData.columnNames = [];
            element.internalData.columnTypes = [];
            arrColNames = data.arrDecodedColumnNames;

            i = 0;
            len = arrColNames.length;
            while (i < len) {
                strCol = arrColNames[i];
                strType = data.arrDecodedColumnTypes[i];

                element.internalData.columnNames.push(strCol);
                element.internalData.columnTypes.push(strType);
                i += 1;
            }

            // if we don't have a template, it's because the developer expects
            //      the combo to build it's own template from the data. the
            //      "hide" attribute is a comma separated list of columns to
            //      ignore when building the template.
            if (!element.internalTemplates.row) {
                strHeaderCells = '';
                strRecordCells = '';
                i = 0;
                len = arrColNames.length;
                while (i < len) {
                    // if this column is not hidden
                    if (
                        arrHide.indexOf((i + 1) + '') === -1 &&
                        arrHide.indexOf(arrColNames[i]) === -1
                    ) {
                        strHeaderCells += (
                            '<gs-cell gs-dynamic>' +
                                encodeHTML(arrColNames[i]) +
                            '</gs-cell>'
                        );

                        // first cell needs to have the first data column as
                        //      it's hidden value attribute. This is how it was
                        //      in the old combo.
                        if (!strRecordCells) {
                            strRecordCells += (
                                '<gs-cell gs-dynamic value="' +
                                    '{{! row[\'' + arrColNames[0] + '\']}}' +
                                '">' +
                                    '{{! row[\'' + arrColNames[i] + '\'] }}' +
                                '</gs-cell>'
                            );
                        } else {
                            strRecordCells += (
                                '<gs-cell gs-dynamic>' +
                                    '{{! row[\'' + arrColNames[i] + '\'] }}' +
                                '</gs-cell>'
                            );
                        }
                    }
                    i += 1;
                }

                element.internalTemplates.header = strHeaderCells;
                element.internalTemplates.row = strRecordCells;

                // we need to know how to extract the value and display values
                getValueAndDisplayTemplates(element);
            }
        };

        // create an array of hidden column names/numbers
        arrHide = (element.getAttribute('hide') || '');
        arrHide = arrHide.split(/[\s]*,[\s]*/);

        // limit column list
        if (element.getAttribute('cols')) {
            arrCols = templateQS(element.getAttribute('cols') || '').trim();
            arrCols = arrCols.split(/[\s]*,[\s]*/);
            strCols = arrCols.join('\t');
        } else {
            strCols = '*';
        }

        // we need to make sure that no old data persists across select calls,
        //      so we'll clear out the internal data object
        element.internalData.records = [];

        // storing references to the arrays for faster access
        arrRecords = element.internalData.records;

        // we need the user to know that the envelope is re-fetching data,
        //      so we'll put a loader on
        GS.requestCachingSelect(
            getSocket(element),                                // Socket
            templateQS(element.getAttribute('schema') || ''),  // Schema
            templateQS(element.getAttribute('object') || ''),  // Object
            strCols,                                           // Columns
            templateQS(element.getAttribute('where') || ''),   // Where
            templateQS(element.getAttribute('ord') || ''),     // Order
            templateQS(element.getAttribute('limit') || ''),   // Limit
            templateQS(element.getAttribute('offset') || '0'), // Offset
            function (data, error) {
                var i;
                var strRecord;
                var strMessage;
                var index;

                // sometimes, elements get removed during the wait for a
                //      callback
                if (!element.elems.root) {
                    return false;
                }

                if (!error) {
                    // we need to get the column names and types
                    if (data.intCallback === 0) {
                        saveColumns(data);
                    }

                    // if we see the last message of the select: render
                    if (data.strMessage === 'TRANSACTION COMPLETED') {
                        element.classList.remove('error');
                        element.elems.button.setAttribute('title', '');
                        element.elems.button.setAttribute(
                            'icon',
                            'angle-down'
                        );
                        dataSELECTcallback(element);

                    // we need to capture the records and columns and store
                    //      them in the internal data
                    } else {
                        // we need to parse the TSV into records and push them
                        //      to the internalData "records" array
                        // with Envelope Websocket data all we have to is split
                        //      on \n. Also, it always ends in \n so the loop
                        //      doesn't need to do anything special to get the
                        //      last record
                        strMessage = data.strMessage;
                        strRecord = '';

                        i = 0;
                        while (i < 15) {
                            index = strMessage.indexOf('\n');
                            strRecord = strMessage.substring(0, index);
                            strMessage = strMessage.substring(index + 1);

                            if (strRecord !== '' || strMessage !== '') {
                                arrRecords.push(strRecord);
                            } else {
                                break;
                            }
                            i += 1;
                        }
                    }

                // we need to make sure that the user knows that the select
                //      failed and we need to prevent using any old select
                //      info, so we'll re-render, remove the loader and pop
                //      up an error
                } else {
                    dataSELECTcallback(element);
                    //GS.webSocketErrorDialog(data);
                    element.internalData.errorData = data;
                    element.classList.add('error');
                    element.elems.button.setAttribute(
                        'title',
                        'This combobox has failed to load.'
                    );
                    element.elems.button.setAttribute(
                        'icon',
                        'exclamation-circle'
                    );
                }
            },
            element.internalData.clearCache
        );

        element.internalData.clearCache = false;
    }

    function internalSELECT(element) {
        element.internalData.columnNames = element.internalData.staticHeaders;
        element.internalData.columnTypes = element.internalData.staticTypes;
        element.internalData.records = element.internalData.staticRecords;
        dataSELECTcallback(element);
    }

    function dataSELECT(element) {
        triggerEvent(element, 'before_select');

        if (element.hasAttribute('src')) {
            databaseWSSELECT(element);
        } else {
            internalSELECT(element);
        }
    }


// #############################################################################
// ############################## EVENT FUNCTIONS ##############################
// #############################################################################

    // ############# QS EVENTS #############
    function unbindQuerystringEvents(element) {
        window.removeEventListener(
            'pushstate',
            element.internalEvents.queryStringResolve
        );
        window.removeEventListener(
            'replacestate',
            element.internalEvents.queryStringResolve
        );
        window.removeEventListener(
            'popstate',
            element.internalEvents.queryStringResolve
        );
    }
    function bindQuerystringEvents(element) {
        element.internalEvents.queryStringResolve = function () {
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
            var jsnDefaultAttr;

            if (strQSCol) {
                jsnDefaultAttr = element.internalEventData.defaultAttributes;

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

                        // if the key is not present or we've got the negator:
                        //      go to the attribute's default or remove it
                        if (strOperator === '!=') {
                            // if the key is not present: add the attribute
                            if (GS.qryGetKeys(strQS).indexOf(strQSCol) === -1) {
                                element.setAttribute(strQSAttr, '');
                            // else: remove the attribute
                            } else {
                                element.removeAttribute(strQSAttr);
                            }
                        } else {
                            // if the key is not present:
                            //      go to the attribute's default or remove it
                            if (GS.qryGetKeys(strQS).indexOf(strQSCol) === -1) {
                                if (jsnDefaultAttr[strQSAttr] !== undefined) {
                                    element.setAttribute(
                                        strQSAttr,
                                        (jsnDefaultAttr[strQSAttr] || '')
                                    );
                                } else {
                                    element.removeAttribute(strQSAttr);
                                }
                            // else: set attribute to exact text from QS
                            } else {
                                element.setAttribute(strQSAttr, (
                                    GS.qryGetVal(strQS, strQSCol) ||
                                    jsnDefaultAttr[strQSAttr] ||
                                    ''
                                ));
                            }
                        }
                        i += 1;
                    }
                } else if (GS.qryGetKeys(strQS).indexOf(strQSCol) > -1) {
                    strQSValue = GS.qryGetVal(strQS, strQSCol);

                    if (element.internalData.bolQSFirstRun !== true) {
                        if (
                            strQSValue !== '' ||
                            !element.getAttribute('value')
                        ) {
                            element.setAttribute('value', strQSValue);
                        }
                    } else {
                        element.value = strQSValue;
                    }
                }
            }

            // handle
            //      "refresh-on-querystring-values" and
            //      "refresh-on-querystring-change" attributes
            if (element.internalData.bolQSFirstRun === true) {
                if (element.hasAttribute('refresh-on-querystring-values')) {
                    arrPopKeys = (
                        element.getAttribute('refresh-on-querystring-values')
                            .split(/\s*,\s*/gim)
                    );

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

                } else if (
                    element.hasAttribute('refresh-on-querystring-change')
                ) {
                    bolRefresh = true;
                }

                if (bolRefresh && element.hasAttribute('src')) {
                    element.refresh();

                } else if (bolRefresh && !element.hasAttribute('src')) {
                    console.warn(
                        'gs-table Warning: ' +
                                'element has "refresh-on-querystring-values" ' +
                                'or "refresh-on-querystring-change", but no ' +
                                '"src".',
                        element
                    );
                }
            } else {
                if (element.hasAttribute('refresh-on-querystring-values')) {
                    arrPopKeys = (
                        element.getAttribute('refresh-on-querystring-values')
                            .split(/\s*,\s*/gim)
                    );

                    i = 0;
                    len = arrPopKeys.length;
                    while (i < len) {
                        element.popValues[arrPopKeys[i]] = (
                            GS.qryGetVal(strQS, arrPopKeys[i])
                        );
                        i += 1;
                    }
                }
            }

            element.internalData.bolQSFirstRun = true;
        };

        if (
            element.getAttribute('qs') ||
            element.getAttribute('refresh-on-querystring-values') ||
            element.hasAttribute('refresh-on-querystring-change')
        ) {
            element.popValues = {};

            element.internalEvents.queryStringResolve();
            window.addEventListener(
                'pushstate',
                element.internalEvents.queryStringResolve
            );
            window.addEventListener(
                'replacestate',
                element.internalEvents.queryStringResolve
            );
            window.addEventListener(
                'popstate',
                element.internalEvents.queryStringResolve
            );
        }
    }


    // ############# FOCUS EVENTS #############
    function unbindFocus(element) {
        element.elems.root.removeEventListener(
            'focus',
            element.internalEvents.rootFocus,
            true
        );
        element.control.removeEventListener(
            evt.mouseout,
            element.internalEvents.mouseOut
        );
        element.control.removeEventListener(
            evt.mouseover,
            element.internalEvents.mouseOver
        );
    }
    function bindFocus(element) {
        element.internalEvents.rootFocus = function () {
            // retarget event
            event.stopPropagation();
            triggerEvent(element, 'focus');

            // save last verified value so that we can trigger a change
            //      event if we change verified value after they leave
            element.internalDisplay.lastPublishedIndex = (
                element.internalDisplay.lastVerifiedIndex
            );
            element.internalDisplay.lastPublishedValue = (
                element.internalDisplay.lastVerifiedValue
            );
            element.internalDisplay.lastPublishedDisplay = (
                element.internalDisplay.lastVerifiedDisplay
            );

            // focus display
            element.classList.add('focus');
        };

        element.elems.root.addEventListener(
            'focus',
            element.internalEvents.rootFocus,
            true
        );

        // we want the combo to get some visual depth when the user hovers
        //      their mouse over
        element.internalEvents.mouseOut = function () {
            element.classList.remove('hover');
        };
        element.internalEvents.mouseOver = function () {
            element.classList.add('hover');
        };

        element.control.addEventListener(
            evt.mouseout,
            element.internalEvents.mouseOut
        );
        element.control.addEventListener(
            evt.mouseover,
            element.internalEvents.mouseOver
        );
    }

    // ############# BLUR EVENTS #############
    function unbindBlur(element) {
        element.elems.root.removeEventListener(
            'blur',
            element.internalEvents.rootBlur,
            true
        );
    }
    function bindBlur(element) {
        element.internalEvents.rootBlur = function () {
            event.stopPropagation();

            // if the currently focused element is the dropdown button, the
            //      combobox hasn't actually lost focus.
            if (
                event.relatedTarget !== element.elems.button &&
                event.relatedTarget !== element.elems.control &&
                event.relatedTarget !== element
            ) {
                // retarget event
                triggerEvent(element, 'blur');

                // may need to trigger a change event
                triggerChangeIfNeeded(element);

                // remove focus css
                element.classList.remove('focus');
            }
        };

        element.elems.root.addEventListener(
            'blur',
            element.internalEvents.rootBlur,
            true
        );
    }

    // ############# CHANGE EVENTS #############
    function unbindChange(element) {
        element.elems.control.removeEventListener(
            'change',
            element.internalEvents.change
        );
    }
    function bindChange(element) {
        element.internalEvents.change = function () {
            event.preventDefault();
            event.stopPropagation();
            // Nunzio added this on 2021-10-12, see below
            if (!element.hasAttribute('limit-to-list')
                    && element.internalDisplay.lastVerifiedDisplay !==
                    element.control.value) {
                element.internalDisplay.lastVerifiedDisplay =
                        element.control.value;
            }

            // Nunzio added this on 2021-07-03
            // Change events weren't getting triggered when
            // typing instead of selecting from the dropdown
            triggerChangeIfNeeded(element);
        };
        element.elems.control.addEventListener(
            'change',
            element.internalEvents.change
        );
    }

    // ############# KEY EVENTS #############
    function unbindKey(element) {
        element.elems.control.removeEventListener(
            'keydown',
            element.internalEvents.keydown
        );
        element.elems.control.removeEventListener(
            'keyup',
            element.internalEvents.keyup
        );
        element.elems.control.removeEventListener(
            'paste',
            element.internalEvents.paste
        );
    }
    function bindKey(element) {
        element.internalEvents.keydown = function (event) {
            var key = (event.keyCode || event.which);
            var shft = event.shiftKey;
            var mod = (event.metaKey || event.ctrlKey);
            var del = (key === 46 || key === 8);
            var keyLeft = (key === 37);
            var keyUp = (key === 38);
            var keyRight = (key === 39);
            var keyDown = (key === 40);
            var arr = (keyLeft || keyUp || keyRight || keyDown);
            var control = element.elems.control;
            var intRow;
            var intMaxRow;

            // When the combo is disabled, only allow the tab key, or keyboard
            //      shortcuts
            if (
                (
                    element.hasAttribute('disabled') ||
                    element.hasAttribute('readonly')
                ) &&
                key !== 9 &&
                !(event.metaKey || event.ctrlKey)
            ) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }

            // vertical arrow, no error, no modifier keys
            if ((keyUp || keyDown) && !mod) {
                // dropdown not open, time to open
                if (!element.internalDisplay.open) {
                    toggleDropdown(element);

                // else, move selection
                } else {
                    // we used up the key event, nothing else should get it
                    event.preventDefault();
                    event.stopPropagation();

                    // get selected row, stop if any item we need is unavailable
                    intRow = getSelectedRowFromDropdown(element);
                    intMaxRow = (element.internalData.records.length - 1);

                    // don't move forward unless we found a row.
                    if (intRow === null) {
                        intRow = 0;

                    // next record or loop to first if already at the end
                    } else if (keyUp) {
                        if (intRow === 0) {
                            intRow = intMaxRow;
                        } else {
                            intRow -= 1;
                        }

                    // prev record or loop to first if already at the end
                    } else if (keyDown) {
                        if (intRow === intMaxRow) {
                            intRow = 0;
                        } else {
                            intRow += 1;
                        }
                    }

                    // set selection and render
                    element.elems.gsTable.goToLine(intRow + 1);

                    // set control, value attribute, and record as verified
                    if (setValueFromDropdown(element)) {
                        // select the whole value so that the user can delete
                        GS.setInputSelection(control, 0, control.value.length);
                    }
                }

            // right arrow, return, tab, no control keys, close dropdown
            } else if ((keyRight || key === 13 || key === 9) && !mod) {
                if (element.internalDisplay.open) {
                    closeDropDown(element);
                    triggerChangeIfNeeded(element);
                }

            // if the esc key is pressed
            } else if (key === 27) {
                // restore the previous value
                element.internalDisplay.lastVerifiedIndex = (
                    element.internalDisplay.lastPublishedIndex
                );
                element.internalDisplay.lastVerifiedValue = (
                    element.internalDisplay.lastPublishedValue
                );
                element.internalDisplay.lastVerifiedDisplay = (
                    element.internalDisplay.lastPublishedDisplay
                );

                // apply values
                element.elems.control.value = (
                    element.internalDisplay.lastVerifiedDisplay
                );
                element.setAttribute(
                    'value',
                    element.internalDisplay.lastVerifiedValue
                );

                // close the dropdown
                if (element.internalDisplay.open) {
                    closeDropDown(element);
                }

            // (not modifier, delete or arrow keys) OR (paste)
            } else if (
                (!mod && !del && !arr) ||
                // allow paste otherwise pasting a value and leaving the combo
                //      won't trigger resize because the verified value wont be
                //      updated.
                (!shft && mod && key === 86 && event.pasteEvent) // CMD/CTRL - V
            ) {
                // we only want to search the records on keyup, because it
                //      can be resource intensive. So, if we're not using a
                //      modifier key, delete key, or arrow key, then we want
                //      to search on the next keyup.
                element.internalEvents.searchNextKeyUp = true;

            // if delete key
            } else if (del) {
                // we only want to search the records on keyup, because it
                //      can be resource intensive. So, if we're not using a
                //      modifier key, delete key, or arrow key, then we want
                //      to search on the next keyup.
                element.internalEvents.searchNextKeyUpDelete = true;
            }
        };
        element.internalEvents.paste = function () {
            var controlElem = this;
            setTimeout(function() {
                console.log('this.value: ' + controlElem.value);
                console.log('element.control.value: ' + element.control.value);
                GS.triggerEvent(controlElem, 'keydown', {
                    "keyCode": 86,
                    "metaKey": true,
                    "pasteEvent": true
                });
                GS.triggerEvent(controlElem, 'keyup', {
                    "keyCode": 86,
                    "metaKey": true,
                    "pasteEvent": true
                });
            }, 5);
        };
        element.internalEvents.keyup = function () {
            var intLastIndex;
            var strLastDisplay;
            var strSearch;
            var jsnSelection;
            var jsnSearch;
            var gsTable;
            var strValue;
            var strDisplay;

            // get search string
            strSearch = element.elems.control.value;

            // get current selection
            jsnSelection = GS.getInputSelection(element.elems.control);

            // get last verified display value
            intLastIndex = element.internalDisplay.lastVerifiedIndex;
            strLastDisplay = element.internalDisplay.lastVerifiedDisplay;

            console.log('strSearch: ' + strSearch);
            console.log('jsnSelection: ' + jsnSelection);
            console.log('intLastIndex: ' + intLastIndex);
            console.log('strLastDisplay: ' + strLastDisplay);
            // we want to prevent extra searching if we can, because with lots
            //      of data it can get pretty intensive
            if (
                element.internalEvents.searchNextKeyUp &&
                intLastIndex !== null &&
                intLastIndex !== undefined &&
                strLastDisplay &&
                strSearch &&
                strLastDisplay.indexOf(strSearch) === 0
            ) {
                //console.log('prefill the rest of the value');
                // prefill the rest of the value
                element.elems.control.value = strLastDisplay;

                // make sure to select the added text so that it can be
                //      overridden easily
                GS.setInputSelection(
                    element.elems.control,
                    strSearch.length,
                    strLastDisplay.length
                );

            // if we want to search on the next keyup
            } else if (
                element.internalEvents.searchNextKeyUp &&
                // only search when we have a search string
                strSearch &&
                // only search when at the end of the field
                jsnSelection.start === strSearch.length &&
                // we don't want to search if a string that started this way
                //      already failed
                strSearch.indexOf(
                    element.internalDisplay.lastNotFoundSearch
                ) === -1
            ) {
                //console.log('perform partial search through our data');
                // perform partial search through our data
                jsnSearch = findRecord(element, strSearch, strSearch, true);

                if (jsnSearch.found) {
                    strValue = jsnSearch.value;
                    strDisplay = jsnSearch.display;
                } else {
                    strValue = strSearch;
                    strDisplay = strSearch;

                    // we don't want to search next key if this search didn't
                    //      find anything
                    element.internalDisplay.lastNotFoundSearch = strSearch;
                }

                // save search results as the last verified value, this will be
                //      important if we try to trigger a change
                element.internalDisplay.lastVerifiedIndex = jsnSearch.index;
                element.internalDisplay.lastVerifiedValue = strValue;
                element.internalDisplay.lastVerifiedDisplay = strDisplay;

                // prefill the rest of the value
                element.elems.control.value = strDisplay;
                element.setAttribute('value', strValue);

                //make sure to select the added text so that it can be
                //      overridden easily
                GS.setInputSelection(
                    element.elems.control,
                    strSearch.length,
                    strDisplay.length
                );

                // we want the dropdown table to stay up to date if it's open
                if (element.internalDisplay.open) {
                    gsTable = element.elems.gsTable;

                    if (jsnSearch.found) {
                        gsTable.goToLine(jsnSearch.index + 1);
                    } else {
                        // if there's no match, we want to scroll to top and
                        //      deselect all records
                        gsTable.goToLine(0);
                        gsTable.internalSelection.ranges = [];
                        gsTable.renderSelection();
                    }
                }

            // not in the list, no searching
            } else if (element.internalEvents.searchNextKeyUp) {
                //console.log('save current display value for the changeevent');
                // save current display value for the change event
                strLastDisplay = element.elems.control.value;
                element.internalDisplay.lastVerifiedIndex = null;
                element.internalDisplay.lastVerifiedValue = strLastDisplay;
                element.internalDisplay.lastVerifiedDisplay = strLastDisplay;

            // if we are clearing the field
            } else if (!strSearch) {
                //console.log('save current display value for the changeevent');
                // save current display value for the change event
                strLastDisplay = element.elems.control.value;
                element.internalDisplay.lastVerifiedIndex = null;
                element.internalDisplay.lastVerifiedValue = strLastDisplay;
                element.internalDisplay.lastVerifiedDisplay = strLastDisplay;
                element.value = '';

            // on delete, we want to search for items in case they match the
            //      list
            } else if (element.internalEvents.searchNextKeyUpDelete) {
                // // get search string
                // strSearch = element.elems.control.value;

                // // perform partial search through our data (exact was looking
                // //  for a complete match, not the start matching up)
                // jsnSearch = findRecord(element, strSearch, strSearch, true);

                // if (jsnSearch.found) {
                //     strValue = jsnSearch.value;
                //     strDisplay = jsnSearch.display;
                // } else {
                //     strValue = strSearch;
                //     strDisplay = strSearch;

                //     // we don't want to search next key if this search didn't
                //     //      find anything
                //     element.internalDisplay.lastNotFoundSearch = strSearch;
                // }

                // // save search results as the last verified value, this will be
                // //      important if we try to trigger a change
                // element.internalDisplay.lastVerifiedIndex = jsnSearch.index;
                // element.internalDisplay.lastVerifiedValue = strValue;
                // element.internalDisplay.lastVerifiedDisplay = strDisplay;

                // // prefill the rest of the value
                // // might need to comment out these two lines below, might've
                // //      been misbehaving due to previous exact search which we
                // //      have now changed to partial - Michael/Cross 6/6/2022
                // element.elems.control.value = strDisplay;
                // element.setAttribute('value', strValue);
                // element.internalEvents.searchNextKeyUpDelete = false;

                // if we are deleting, we shouldnt be autocompleting
                //      - Michael 7/1/2022
                strSearch = element.elems.control.value;
                element.internalDisplay.lastVerifiedIndex = null;
                element.internalDisplay.lastVerifiedValue = strSearch;
                element.internalDisplay.lastVerifiedDisplay = strSearch;
            }

            // reset for next cycle
            element.internalEvents.searchNextKeyUp = false;
            element.internalEvents.searchNextKeyUpDelete = false;
        };

        element.elems.control.addEventListener(
            'keydown',
            element.internalEvents.keydown
        );
        element.elems.control.addEventListener(
            'keyup',
            element.internalEvents.keyup
        );
        element.elems.control.addEventListener(
            'paste',
            element.internalEvents.paste
        );
    }

    // ############# DROPDOWN EVENTS #############
    function unbindDropdown(element) {
        element.removeEventListener(
            'click',
            element.internalEvents.dropdownClick
        );
    }
    function bindDropdown(element) {
        element.internalEvents.dropdownClick = function () {
            // if this click propagates/bubbles, it triggers the close drop down
            //      code. Because, we want to close the dropdown after the first
            //      registered click.
            //event.stopPropagation();
            // for some reason, in a gs-table the stopPropagation is not enough
            // Nunzio on 2022-01-10
            //event.preventDefault();

            // prevent this event from bubbling up and triggering the dropdown
            //      close code (we exclude events that have "gs" set to true
            event.gs = true;

            // time to toggle
            toggleDropdown(element);
        };

        element.elems.button.addEventListener(
            'click',
            element.internalEvents.dropdownClick
        );

        // for an unknown reason, clicking on the dropdown causes a click on the
        //      control. It cannot bubble up to it, but it's there, and it
        //      causes the dropdown to close. So, we're tagging it as a GS
        //      event to prevent it from closing the dropdown in GS tables.
        element.internalEvents.dropdownClick2 = function () {
            //event.stopPropagation();
            //event.preventDefault();
            event.gs = true;
        };

        element.elems.control.addEventListener(
            'click',
            element.internalEvents.dropdownClick2
        );
    }

    // ############# DEVELOPER EVENTS #############
    function unbindDeveloper(element) {
        element.removeEventListener(
            evt.mousedown,
            element.internalEvents.developerMouseDown
        );
    }
    function bindDeveloper(element) {
        element.internalEvents.developerMouseDown = function (event) {
            var bolCMDorCTRL = (event.ctrlKey || event.metaKey);
            var bolShift = (event.shiftKey);
            var strHTML;
            var arrAttr;
            var jsnAttr;
            var i;
            var len;

            if (bolCMDorCTRL && bolShift) {
                event.preventDefault();
                event.stopPropagation();

                strHTML = '';
                arrAttr = element.attributes;
                i = 0;
                len = arrAttr.length;
                while (i < len) {
                    jsnAttr = arrAttr[i];

                    strHTML += (
                        '<b>Attribute "' + encodeHTML(jsnAttr.name) + '":</b>' +
                        '<pre>' + encodeHTML(jsnAttr.value) + '</pre>'
                    );

                    i += 1;
                }

                GS.msgbox('Developer Info', strHTML, ['Ok']);
            }
        };

        element.addEventListener(
            evt.mousedown,
            element.internalEvents.developerMouseDown
        );
    }


    // ############# HIGH LEVEL BINDING #############
    function unbindElement(element) {
        unbindQuerystringEvents(element);
        unbindFocus(element);
        unbindBlur(element);
        unbindChange(element);
        unbindKey(element);
        unbindDropdown(element);
        unbindDeveloper(element);
    }
    function bindElement(element) {
        bindQuerystringEvents(element);
        bindFocus(element);
        bindBlur(element);
        bindChange(element);
        bindKey(element);
        bindDropdown(element);
        bindDeveloper(element);
    }


// #############################################################################
// ############################## XTAG DEFINITION ##############################
// #############################################################################

    function elementInserted(element) {
        if (
            // if "created"/"inserted" are not suspended: continue
            !element.hasAttribute('suspend-created') &&
            !element.hasAttribute('suspend-inserted') &&
            // if this is the first time inserted has been run: continue
            !element.inserted
        ) {
            element.inserted = true;

            resolveElementAttributes(element);
            prepareElement(element);
            siphonElement(element);
            bindElement(element);
            renderControl(element);
            dataSELECT(element);
            triggerEvent(element, 'initialized');
        }
    }

    xtag.register('gs-combo', {

// #############################################################################
// ############################# ELEMENT LIFECYCLE #############################
// #############################################################################

        lifecycle: {
            'inserted': function () {
                elementInserted(this);
            },

            'removed': function () {
                this.destroy();
            },

            'attributeChanged': function (attr) {//, oldValue, newValue
                var element = this;

                // if suspend attribute: run inserted event
                if (attr === 'suspend-created' || attr === 'suspend-inserted') {
                    elementInserted(element);

                // if the element is not suspended: handle attribute changes
                } else if (
                    !element.hasAttribute('suspend-created') &&
                    !element.hasAttribute('suspend-inserted')
                ) {
                    var arrAttributes = [
                        'placeholder', 'name', 'maxlength', 'autofocus', 'readonly', 'title'
                    ];
                    if (attr === 'value' || arrAttributes.indexOf(attr) > -1) {
                        renderControl(element);
                    }
                }
            }
        },

// #############################################################################
// ############################# ELEMENT ACCESSORS #############################
// #############################################################################

        accessors: {
            // the "value" attribute is the master location for the hidden value
            //      anything else would lead to confusion. So, the .value
            //      accessor just sets the attribute.
            'value': {
                'get': function () {
                    return this.getAttribute('value');
                },
                'set': function (newValue) {
                    if (newValue === null || newValue === '') {
                        this.elems.control.value = '';
                        this.setAttribute('value', '');
                    } else {
                        this.setAttribute('value', newValue);
                    }
                }
            },

            // the "textValue" is the value that the user sees, not the hidden
            //      value
            'textValue': {
                'get': function () {
                    return this.elems.control.value;
                },
                'set': function (newValue) {
                    this.setAttribute('value', newValue);
                }
            },

            // sometimes, we want to know if the current value is custom from
            //      the user or found in the dropdown list, this accessor
            //      returns true if the value is found in the dropdown
            'valueIsFromDropdown': {
                'get': function () {
                    return this.internalDisplay.lastVerifiedIndex !== null;
                },
                'set': function () {//newValue
                    //this.setAttribute('value', newValue);
                }
            }
        },

// #############################################################################
// ############################## ELEMENT METHODS ##############################
// #############################################################################

        methods: {
            // we don't want a bunch of data hanging in memory, so this allows
            //      the browser to forget everything and use that memory for
            //      other things. This is especially important if the combo has
            //      a boatload of data.
            'destroy': function () {
                var element = this;

                // sometimes, the element is destroyed before it's initialized
                // sometimes, the element gets destroyed multiple times.
                //      we don't want to cause any errors when this happens.
                if (element.elems && element.elems.control) {
                    //close the dropdown
                    closeDropDown(this);

                    // prevent the element from recieving any events
                    unbindElement(element);

                    // this is the fastest way to destroy all of the data
                    element.internalData = {};
                    element.internalEvents = {};
                    element.internalEventData = {};
                    element.internalTemplates = {};
                    element.internalDisplay = {};
                    element.internalSelection = {};

                    // destroy element store
                    element.elems = {};

                    // empty innerHTML
                    element.innerHTML = '';
                }
            },

            // allow the user to refetch the data
            // needs to force a reload, instead of accessing cache
            'refresh': function (callback) {
                var singleUseEvent;

                // we want to run a callback without binding to every
                //      after_select. So, it'll unbind itself after the first
                //      call.
                if (callback) {
                    singleUseEvent = function () {
                        callback();
                        this.removeEventListener('after_select', singleUseEvent);
                    };
                    this.addEventListener('after_select', singleUseEvent);
                }

                // we cache select results for comboboxes. So, we need to make
                //      sure to clear the cache before we reselect.
                this.internalData.clearCache = true;
                dataSELECT(this);
            },

            // "getData" is an alias for refresh
            'getData': function () {
                this.refresh();
            },

            // open combobox dropdown
            'open': function () {
                openDropDown(this);
            },

            // close combobox dropdown
            'close': function () {
                closeDropDown(this);
            },

            // we want to focus the control, not the combobox
            'focus': function () {
                this.elems.control.focus();
            },

            // allow the user to take columns related to the selected record
            'column': function (strColumn) {
                var element = this;
                var jsnRecord;
                var templateFunc;
                var intRow;

                intRow = element.internalDisplay.lastVerifiedIndex;

                if (typeof intRow === 'number') {
                    jsnRecord = recordToJSON(
                        element,
                        element.internalData.records[intRow]
                    );
                    templateFunc = doT.template(
                        '{{var row = jo;}}' +
                        '{{! row[\'' + strColumn + '\'] }}'
                    );

                    return templateFunc(jsnRecord);
                }
                return null;
            }
        }
    });
});
