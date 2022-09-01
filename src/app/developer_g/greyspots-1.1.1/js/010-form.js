//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp, shimmed
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
//          # CHANGE EVENTS
//          # KEY EVENTS
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
Event 'after_select_error'

class 'saving-warning-parent'
class 'saving-warning'
Attribute 'data-theme', 'error'

Attribute 'suppress-no-record-found'


*/


// ############################################################################
// ############################## SNIPPET/DESIGN ##############################
// ############################################################################

window.addEventListener('design-register-element', function () {
    'use strict';
    addSnippet(
        '<gs-form>',
        '<gs-form>',
        (
            'gs-form src="${1:test.tpeople}">\n' +
            '    <template>\n' +
            '        ${2}\n' +
            '    </template>\n' +
            '</gs-form>'
        )
    );

    addElement('gs-form', '#record_form');

    window.designElementProperty_GSFORM = function () {
        addDataAttributes('select,update');
        addCheck('D', 'Save&nbsp;While&nbsp;Typing', 'save-while-typing');
        addCheck(
            'D',
            'Suppress<br />"No&nbsp;Record&nbsp;Found"<br />Error',
            'suppress-no-record-found'
        );
        addDataEvents('select,update');
        addText('O', 'Column In QS', 'qs');
        addText('O', 'Refresh On QS Columns', 'refresh-on-querystring-values');
        addText('O', 'Refresh On QS Change', 'refresh-on-querystring-change');
        addFlexContainerProps();
        addFlexProps();
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
// ############################################################################
// ############################ FUNCTION SHORTCUTS ############################
// ############################################################################

    var qryKids = xtag.queryChildren;
    var qryAll = xtag.query;


// ############################################################################
// ########################## PAGE LEAVE PROTECTION ###########################
// ############################################################################

    // before the page unloads, we need to check to make sure there aren't any
    //      queued changes that have yet to be sent up the websocket. Also, if
    //      there are changes typed that haven't been committed, we want to
    //      focusout to get that update into the websocket. Once the update is
    //      in the websocket, we don't have to worry about leaving the page.
    GS.addBeforeUnloadEvent(function () {
        var arrElement;
        var i;
        var len;

        // trigger save on any incomplete controls
        document.activeElement.blur();

        // check for queued updates, or timed updates
        arrElement = qryAll(document.body, 'gs-form');

        i = 0;
        len = arrElement.length;
        while (i < len) {
            if (arrElement[i].internalData.updateQueue.length > 0) {
                return 'The page has not finished saving.';
            }
            if (arrElement[i].internalData.timerCount > 0) {
                return 'The page has not finished saving.';
            }

            i += 1;
        }
    });


// ############################################################################
// ############################ UTILITY FUNCTIONS #############################
// ############################################################################

    // we need to be able to execute event attributes (like onafter_select)
    //      while being able to reference the form as "this" in the code.
    function evalInContext(element, strJS) {
        var execFunc = function () {
            return eval(strJS);
        };

        execFunc.call(element);
    }

    // we want to standardize event triggering in this element.
    function triggerEvent(element, strEvent, jsnData) {
        var eventObject;

        eventObject = GS.triggerEvent(element, strEvent, jsnData);
        GS.triggerEvent(element, 'on' + strEvent, jsnData);
        if (
            element.hasAttribute('on' + strEvent) &&
            // onfocus and onblur attributes are handled automatically by the
            //      browser
            strEvent !== 'focus' &&
            strEvent !== 'blur'
        ) {
            evalInContext(element, element.getAttribute('on' + strEvent));
        }

        // if the user prevents the default on the "before_update"
        //      event, prevent the execution of the following update code
        if (eventObject.defaultPrevented) {
            return false;
        }

        return true;
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

    // we don't want to listen to column elements that are inside other elements
    //      so, this function allows us to exclude such elements in the change
    //      events
    function columnParentsUntilForm(form, element) {
        var intColumnParents = 0;
        var currentElement = element;
        var maxLoops = 50;
        var i = 0;

        while (
            currentElement.parentNode !== form &&
            currentElement.parentNode &&
            i < maxLoops
        ) {
            if (
                //If something with a column attribute
                currentElement.parentNode.hasAttribute('column') === true ||
                //or something with a src attribute
                currentElement.parentNode.hasAttribute('src') === true
            ) {
                intColumnParents += 1;
            }

            currentElement = currentElement.parentNode;
            i += 1;
        }

        return intColumnParents;
    }

    // we want to be able to easily access a record
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

    // we need to split object names into schema and object
    function splitObjectName(strObject) {
        var arrParts;

        // split "src" into "schema" and "object" attributes
        arrParts = strObject.split('.');

        // I don't know who added this. I don't inderstand why someone
        //      would put something like "biz.bar.foo" in the "src"
        //      attribute. That's the case that this code handles. If
        //      you added this code: PUT A COMMENT!!!! We have comments
        //      for a reason. Don't ruin this beautiful code. Only YOU
        //      can prevent spaghetti code.
        //  ~Michael
        // It appears to be a solution to quote idented object names
        //      that contain a period like this: test."test.asdf"
        //      The problem with this (other than being unclear) is that
        //      it wont work for schema names that contain a period.
        //      We need a better solution for this. Perhaps it's time to
        //      create a function that understands ident quoted names
        //      for real, using actual parsing.
        //  ~Also Michael
        if (arrParts[2]) {
            arrParts[1] = arrParts[1] + '.' + arrParts[2];
        }

        return {
            "schema": arrParts[0],
            "object": arrParts[1]
        };
    }

    function convertWSFormattoAjax(element) {
        var arrTotalRecords;
        var arrRecords;
        var i;
        var len;
        var arrCells;
        var cell_i;
        var cell_len;

        // convert data into something we can use
        arrTotalRecords = [];
        arrRecords = element.internalData.records;
        i = 0;
        len = arrRecords.length;
        while (i < len) {
            arrCells = arrRecords[i].split('\t');

            cell_i = 0;
            cell_len = arrCells.length;
            while (cell_i < cell_len) {
                arrCells[cell_i] = (
                    arrCells[cell_i] === '\\N'
                        ? null
                        : GS.decodeFromTabDelimited(arrCells[cell_i])
                );
                cell_i += 1;
            }

            arrTotalRecords.push(arrCells);
            i += 1;
        }

        return {
            "arr_column": element.internalData.columnNames,
            "dat": arrTotalRecords,
            "row_count": arrTotalRecords.length
        };
    }

    function refocusElement(row, strFocusColumn, jsnSelection) {
        var parentColumn;
        var refocusFunction;
        var timer_i;
        var focusTimerID;

        parentColumn = qryAll(row, '[column="' + strFocusColumn + '"]')[0];

        refocusFunction = function () {
            parentColumn.focus();
            if (
                parentColumn &&
                jsnSelection &&
                (
                    document.activeElement.nodeName === 'INPUT' ||
                    document.activeElement.nodeName === 'TEXTAREA'
                )
            ) {
                GS.setInputSelection(
                    document.activeElement,
                    jsnSelection.start,
                    jsnSelection.end
                );
            }
        };

        if (parentColumn) {
            // if element registration is not shimmed, we can just focus into
            //      the target element
            if (shimmed.customElements === false) {
                refocusFunction();

            // else, we have to check on a loop to see if the element has been
            //      upgraded, the reason I need to use a loop here is because
            //      there is no event for when an element is upgraded (if there
            //      was then 1000 custom elements would emit 1000 events, which
            //      is a lot and we don't want to bog the browser down)
            } else {
                timer_i = 0;
                focusTimerID = setInterval(function () {
                    if (parentColumn['__upgraded__'] || timer_i >= 10) {
                        clearTimeout(focusTimerID);
                    }
                    if (parentColumn['__upgraded__']) {
                        refocusFunction();
                    }
                    timer_i += 1;
                }, 5);
            }
        }
    }


// #############################################################################
// ############################# ELEMENT FUNCTIONS #############################
// #############################################################################

    // some attributes can't be used in their normal, dev-friendly format,
    //      this function translates those attributes to their final formats
    // some attributes need to be defaulted, even if they're not present
    function resolveElementAttributes(element) {
        var strSrc;
        var jsnParts;

        // GS-COMBO elements that are connected to Envelope need to have "pk"
        //      attribute
        if (element.getAttribute('src')) {
            strSrc = GS.templateWithQuerystring(element.getAttribute('src'));

            // if arbituary query
            if (strSrc.replace(/\s*/gi, '').indexOf('(') === 0) {//SELECT
                // save query as is
                element.setAttribute('select-query', strSrc);

            // else, it's just a table/view name
            } else {
                // split "src" into "schema" and "object" attributes
                jsnParts = splitObjectName(strSrc);

                // put the split sections of the object name into separate
                //      attributes
                element.setAttribute('select-schema', jsnParts.schema);
                element.setAttribute('select-object', jsnParts.object);

                element.setAttribute('update-schema', jsnParts.schema);
                element.setAttribute('update-object', jsnParts.object);
            }

            // "update-src" should always be a table or a view
            if (element.getAttribute('update-src')) {
                // split into "schema" and "object" attributes
                jsnParts = splitObjectName(element.getAttribute('update-src'));

                element.setAttribute('update-schema', jsnParts.schema);
                element.setAttribute('update-object', jsnParts.object);
            }

            // default insert, update, and delete
            if (jsnParts) {
                if (!element.hasAttribute('update-schema')) {
                    element.setAttribute('update-schema', jsnParts.schema);
                    element.setAttribute('update-object', jsnParts.object);
                }
            }

            // if we're missing update details, warn the developer
            if (
                !element.hasAttribute('update-schema') ||
                !element.hasAttribute('update-object')
            ) {
                console.warn(
                    'GS-FORM Warning: Cannot figure out what object to ' +
                    'update, please add an "update-src" attribute with the' +
                    ' view that needs to receive the update commands.'
                );
            }
        }

        // default null string attribute
        element.setAttribute(
            'null-string',
            (element.getAttribute('null-string') || '')
        );

        // default "pk" and "lock" attributes
        element.setAttribute(
            'pk',
            (element.getAttribute('pk') || 'id')
        );
        element.setAttribute(
            'lock',
            (element.getAttribute('lock') || 'change_stamp')
        );
    }

    // create internal structures and inner elements that persist through the
    //      whole lifetime of the element
    function prepareElement(element) {
        // we want a place to store elements
        element.elems = {};

        // we want a place to look to for data
        element.internalData = {
            "records": [],
            "columnNames": [],
            "columnTypes": [],
            "clearCache": false,
            "timer": {},
            "timerCount": 0,
            "saveState": "saved",
            "updateQueue": []
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
            "row": "",
            "rowIsSimple": false
        };

        // we need a place to store cell dimensions and other display
        //      related info
        // anything in here set to "undefined" is set that way because the dev
        //      may set it to 0 or [] and we need to be able to tell that it
        //      hasn't been set yet
        element.internalDisplay = {};

        // we need a place to store selection information
        element.internalSelection = {};

        // There are no persistent elements
    }

    // get attributes and templates and extract all necessary information
    function siphonElement(element) {
        var rowTemplate;
        var i;
        var len;
        var jsnAttr;

        // get each template element and save them to each their own variable,
        //      for easy access
        rowTemplate = qryKids(element, 'template')[0];

        // remove all templates from the dom to prevent reflows
        if (rowTemplate) {
            element.removeChild(rowTemplate);
        }

        // check for greater-than and less-than operators that will mess with
        //      the templating.
        if (
            rowTemplate &&
            (
                rowTemplate.innerHTML.indexOf('&gt;') > -1 ||
                rowTemplate.innerHTML.indexOf('&lt;') > -1
            )
        ) {
            console.warn(
                'GS-FORM WARNING: &gt; or &lt; detected in ' +
                'row template, this can have undesired ' +
                'effects on doT.js. Please use gt(x,y), gte(x,y), ' +
                'lt(x,y), or lte(x,y) to silence this warning.'
            );
        }

        // we want to use the least invasive templating possible, because its
        //      easier to maintain browser-maintained states (like focus, text
        //      selection, event paths) if we don't replace the html every
        //      update. So, if this is a "simple" template, meaning that it
        //      only uses "column" attributes to fill controls, mark it as
        //      "simple" so that we know to use the renderPartial function
        //      instead of the renderSingleRow function after an update.
        if (
            rowTemplate &&
            // no special Dot.js notation in template
            (
                rowTemplate.innerHTML.indexOf('{{') === -1 ||
                element.getAttribute('force-simple-template') === 'true'
            )
        ) {
            element.internalTemplates.rowIsSimple = true;
        }

        // pull in record template (for backwards compatibility, we need to be
        //      able to accept a template without a "for" attribute as the
        //      record template. Additionally, we need to be able to take a
        //      TABLE element here and convert it to gs-cell. Unless it's a
        //      static combobox. In which case, we convert it to static data
        //      and gs-cells.
        if (rowTemplate) {
            // add a doT.js coded "value" attribute to any element with a
            //      "column" attribute but no "value" attribute
            element.internalTemplates.row = GS.templateColumnToValue(
                rowTemplate.innerHTML
            );
        }

        // if we haven't found a template and there is no datasource to create
        //      a template from, error
        if (!element.internalTemplates.row && !element.hasAttribute('src')) {
            throw 'GS-FORM Error: No template provided.';
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

    // builds entire html of records from scratch
    function renderFull(element) {
        var jsnTemplate;
        var strTemplate;
        var strRet;
        var strStyle = '';
        var internalData;
        var strColPK;
        var strColLock;
        var data;

        var target;
        var parentForm;
        var parentRecord;
        var parentColumn;
        var intRowNumber;
        var strFocusColumn;
        var jsnSelection;

        // get column to focus back into
        target = document.activeElement;
        parentForm = GS.findParentTag(target, 'gs-form');
        parentRecord = GS.findParentElement(target, '.form-record');
        parentColumn = GS.findParentElement(target, '[column]');

        if (
            parentForm === element &&
            parentColumn
        ) {
            strFocusColumn = parentColumn.getAttribute('column');
            jsnSelection = GS.getInputSelection(target);
            intRowNumber = parentRecord.getAttribute('data-row');
        }

        // shortcut variables
        strTemplate = element.internalTemplates.row;
        internalData = element.internalData;

        // column attributes
        strColPK = element.getAttribute('pk');
        strColLock = element.getAttribute('lock');

        // if single record, take the full height of the form element
        if (internalData.records.length === 1) {
            strStyle = 'style="height: 100%;" ';
        }

        // convert data into something we can use
        data = convertWSFormattoAjax(element);

        // we don't want to template templates for inner elements (like
        //      comboboxes), so we hide the templates from Dot.
        jsnTemplate = GS.templateHideSubTemplates(strTemplate);

        // template
        strRet = GS.templateWithEnvelopeData(
            (
                '<div ' +
                    'class="form-record" ' +
                    strStyle +
                    'data-row="{{! i }}" ' +
                    'data-pk="{{! row.' + strColPK + ' }}" ' +
                  //'data-' + strColLock + '="{{! row.' + strColLock + ' }}" ' +
                    'gs-dynamic ' +
                '>' +
                    jsnTemplate.templateHTML +
                '</div>'
            ),
            data
        );

        // show the templates we hid earlier, and put HTML into the form
        element.innerHTML = GS.templateShowSubTemplates(strRet, jsnTemplate);

        // restore focus and text selection if possible
        if (strFocusColumn) {
            parentRecord = qryKids(
                element,
                '.form-record[data-row="' + intRowNumber + '"]'
            )[0];

            if (parentRecord) {
                refocusElement(parentRecord, strFocusColumn, jsnSelection);
            }
        }
    }

    // replaces html of a single record, used if we can't resolve the changes
    //      reliably (used after updates with non-simple templates)
    function renderSingleRow(element, intRow) {
        var row;
        //var strLockColumn;
        //var strLockValue;
        var data;
        var jsnTemplate;
        var strHTML;

        var strFocusColumn;
        var jsnSelection;
        var target;
        var parentForm;
        var parentRecord;
        var parentColumn;

        // get new lock value
        //strLockColumn = element.getAttribute('lock');
        //strLockValue = element.column(strLockColumn, intRow);

        // get the row we are going to rerender
        row = qryKids(element, '.form-record[data-row="' + intRow + '"]')[0];

        // get column to focus back into
        target = document.activeElement;
        parentForm = GS.findParentTag(target, 'gs-form');
        parentRecord = GS.findParentElement(target, '.form-record');
        parentColumn = GS.findParentElement(target, '[column]');

        if (
            parentForm === element &&
            parentRecord === row &&
            parentColumn
        ) {
            strFocusColumn = parentColumn.getAttribute('column');
            jsnSelection = GS.getInputSelection(target);
        }

        // update lock column
        //row.setAttribute('data-' + strLockColumn, strLockValue);

        // convert data into something we can use
        data = convertWSFormattoAjax(element);

        // we don't want to template templates for inner elements (like
        //      comboboxes), so we hide the templates from Dot.
        jsnTemplate = GS.templateHideSubTemplates(
            element.internalTemplates.row
        );

        // template row contents
        strHTML = GS.templateWithEnvelopeData(
            jsnTemplate.templateHTML,
            data,
            intRow
        );

        // set row contents
        row.innerHTML = GS.templateShowSubTemplates(strHTML, jsnTemplate);

        // restore focus and text selection if possible
        if (strFocusColumn) {
            refocusElement(row, strFocusColumn, jsnSelection);
        }
    }

    // replace values in controls that have been updated (for simple templates)
    function renderPartial(element, intRow) {
        var data;
        var arrElement;
        var i;
        var len;
        var strColumn;
        var strControlValue;
        var strDataValue;
        var parentDataElement;

        // convert data into something we can use
        data = convertWSFormattoAjax(element);

        // update all values that have changed
        arrElement = qryKids(
            element,
            '.form-record[data-row="' + intRow + '"] [column]'
        );
        i = 0;
        len = arrElement.length;
        while (i < len) {
            strColumn = arrElement[i].getAttribute('column');
            parentDataElement = GS.findParentElement(arrElement[i], '[src]');
            if (parentDataElement === element) {
                strControlValue = arrElement[i].value;
                strDataValue = GS.envGetCell(data, intRow, strColumn);

                if (strControlValue === null || strControlValue === undefined) {
                    strControlValue = '';
                }
                if (strDataValue === null || strDataValue === undefined) {
                    strDataValue = '';
                }

                if (
                    // if the value is different and
                    strControlValue !== strDataValue &&
                    // if the control is not focussed and
                    arrElement[i] !== document.activeElement &&
                    arrElement[i].control !== document.activeElement &&
                    // if there are no saves pending
                    element.internalData.timerCount === 0 &&
                    element.internalData.updateQueue.length === 0 &&
                    element.internalData.saveState !== 'saving'
                ) {
                    //if (arrElement[i].nodeName !== 'GS-ACE') {
                    arrElement[i].value = strDataValue;
                    //} else {
                        console.log('#############################################');
                        console.log('WOULDVE CAUSED FULL TEXT ERROR');
                        console.log(JSON.stringify(element.internalData, null, 4));
                        console.log(JSON.stringify(element.internalDisplay, null, 4));
                        console.log('#############################################');
                    //}
                }
            }

            i += 1;
        }
    }


// ############################################################################
// ############################## DATA FUNCTIONS ##############################
// ############################################################################

    function dataSELECTcallback(element) {
        var templateElement;

        element.internalData.loaded = true;

        if (
            element.internalData.records.length === 0 &&
            !element.hasAttribute('limit') &&
            !element.hasAttribute('suppress-no-record-found')
        ) {
            templateElement = document.createElement('template');
            templateElement.innerHTML = ml(function () {/*
                <gs-page>
                    <gs-header><center><h3>Error</h3></center></gs-header>
                    <gs-body padded>
                        <center>No record found</center>
                    </gs-body>
                    <gs-footer>
                        <gs-grid>
                            <gs-block>
                                <gs-button dialogclose>Cancel</gs-button>
                            </gs-block>
                            <gs-block>
                                <gs-button dialogclose listen-for-return
                                    bg-primary
                                >
                                    Try Again
                                </gs-button>
                            </gs-block>
                        </gs-grid>
                    </gs-footer>
                </gs-page>*/
            });

            GS.openDialog(templateElement, '', function (ignore, strAnswer) {
                if (strAnswer === 'Try Again') {
                    element.refresh();
                }
            });
        }

        renderFull(element);

        triggerEvent(element, 'after_select');
    }

    function dataUPDATEcallback(element, strMode, jsnUpdate) {
        if (element.hasAttribute('save-while-typing')) {
            renderPartial(element, jsnUpdate.data.recordNumber);
        } else if (strMode === 'single-cell') {
            // if the template is simple, we can just manually update the
            //      controls that don't match
            if (element.internalTemplates.rowIsSimple) {
                renderPartial(element, jsnUpdate.data.recordNumber);
            } else {
                renderSingleRow(element, jsnUpdate.data.recordNumber);
            }
        } else {
            renderFull(element);
        }

        // if there are updates queued, run the next one
        if (element.internalData.updateQueue.length > 0) {
            dataUPDATE(
                element,
                element.internalData.updateQueue[0].mode,
                element.internalData.updateQueue[0].update
            );

            element.internalData.updateQueue.shift();
        }
    }


    function databaseWSUPDATE(element, strMode, jsnUpdate) {
        var i;
        var len;
        var col_i;
        var col_len;

        var updateStep;
        var jsnCurrentData;

        var strSchema;
        var strObject;
        var strReturn;
        var strHashColumns;
        var strUpdateData;

        var intUpdateColumnIndex;
        var arrPK;
        var arrLock;
        var startingIndex;
        var arrRecordIndexes;

        var strRow;
        var jsnRow;
        var cell_i;
        var cell;
        var char;

        var strRoles;
        var strColumns;
        var arrColumnNames;
        var strHashString;
        var strTemp;
        var clearWarningFunction;

        // get schema and object attributes and get the return column list
        strSchema = GS.templateWithQuerystring(
            element.getAttribute('update-schema') || ''
        );
        strObject = GS.templateWithQuerystring(
            element.getAttribute('update-object') || ''
        );

        // the return column list must be defined the same as the column list
        //      that we store the data with, so we define strReturn using the
        //      column list
        strReturn = '';
        col_i = 0;
        col_len = element.internalData.columnNames.length;
        while (col_i < col_len) {
            strReturn += (
                strReturn
                    ? '\t'
                    : ''
            );
            strReturn += (
                element.internalData.columnNames[col_i].replace(/(\\)/g, '\\\\')
            );
            col_i += 1;
        }

        // save the column name array for speed and easy access
        arrColumnNames = element.internalData.columnNames;

        // if single cell update: we only need to gather the update info for
        //      one record
        if (strMode === 'single-cell') {
            jsnCurrentData = {
                "columnName": (
                    jsnUpdate.data.columnName.replace(/(\\)/g, '\\\\')
                ),
                "recordNumber": jsnUpdate.data.recordNumber,
                "oldValue": ""
            };
            strHashColumns = '';
            strUpdateData = '';
            startingIndex = '';

            // turn the updated column name into a column index so that we can
            //      fetch the old data from the data
            intUpdateColumnIndex = (
                element
                    .internalData
                    .columnNames
                    .indexOf(jsnUpdate.data.columnName)
            );

            // get the index of the record that will be updated
            startingIndex = jsnUpdate.data.recordNumber;

            // if you refresh between the update start and end, you might have
            //      an error here ##################

            // get the cell's old value so that when we emit before_update
            //      and after_update events we can provide the old data
            jsnCurrentData.oldValue = GS.decodeFromTabDelimited(
                (element.internalData
                    .records[startingIndex]
                    .split('\t')[intUpdateColumnIndex] || '')
            );

            // get primary key and lock column names into arrays so that we can
            //      use them for getting the PK and LOCK data and so that we
            //      can tell the websocket the names of the PK and LOCK columns
            if (element.getAttribute('pk')) {
                arrPK = (
                    GS.templateWithQuerystring(
                        element.getAttribute('pk') || ''
                    )
                ).split(/[\s]*,[\s]*/);
            } else {
                arrPK = [];
            }
            if (element.getAttribute('lock')) {
                arrLock = (
                    GS.templateWithQuerystring(
                        element.getAttribute('lock') || ''
                    )
                ).split(/[\s]*,[\s]*/);
            } else {
                arrLock = [];
            }

            // define "strHashColumns", "strRoles" and strColumns as empty so
            //      that we can append to them without worrying about an
            //      "undefined" appearing
            strHashColumns = '';
            strHashString = '';
            strRoles = '';
            strColumns = '';
            strUpdateData = '';

            // create record json so that we can easily get column values
            //      we need
            strRow = element.internalData.records[startingIndex];
            jsnRow = {};

            i = 0;
            len = strRow.length;
            cell_i = 0;
            cell = "";
            while (i < len) {
                char = strRow[i];

                if (char === "\t") {
                    jsnRow[arrColumnNames[cell_i]] =
                            GS.decodeFromTabDelimited(cell, '\\N');

                    cell = "";
                    cell_i += 1;
                } else {
                    cell += char;
                }
                i += 1;
            }
            jsnRow[arrColumnNames[cell_i]] =
                    GS.decodeFromTabDelimited(cell, '\\N');

            // build up column name/role list for websocket update headers
            //      using the PK columns and append pk values
            i = 0;
            len = arrPK.length;
            while (i < len) {
                strRoles += (
                    strRoles
                        ? '\t'
                        : ''
                );
                strRoles += 'pk';
                strColumns += (
                    strColumns
                        ? '\t'
                        : ''
                );
                strColumns += arrPK[i];
                strUpdateData += (
                    strUpdateData
                        ? '\t'
                        : ''
                );
                strUpdateData += jsnRow[arrPK[i]];
                i += 1;
            }

            // build up hash column name list for websocket update headers
            //      using the LOCK columns
            i = 0;
            len = arrLock.length;
            while (i < len) {
                strHashColumns += (
                    strHashColumns
                        ? '\t'
                        : ''
                );
                strHashColumns += arrLock[i];

                strHashString += (
                    strHashString
                        ? '\t'
                        : ''
                );
                strTemp = jsnRow[arrLock[i]];

                // the C encodes null values as empty string in the hash portion
                strHashString += (
                    strTemp === '\\N'
                        ? ''
                        : GS.encodeForTabDelimited(strTemp, '\\N')
                );
                i += 1;
            }

            if (strHashString) {
                strRoles += (
                    strRoles
                        ? '\t'
                        : ''
                );
                strRoles += 'hash';

                strColumns += (
                    strColumns
                        ? '\t'
                        : ''
                );
                strColumns += 'hash';

                strUpdateData += (
                    strUpdateData
                        ? '\t'
                        : ''
                );
                strUpdateData += GS.utfSafeMD5(strHashString).toString();
            }

            // build up column name/role list for websocket update headers
            //      using the update column
            strRoles += (
                strRoles
                    ? '\t'
                    : ''
            );
            strRoles += 'set';
            strColumns += (
                strColumns
                    ? '\t'
                    : ''
            );
            strColumns += jsnUpdate.data.columnName.replace(/(\\)/g, '\\\\');

            // append new value
            strUpdateData += (
                strUpdateData
                    ? '\t'
                    : ''
            );
            strUpdateData += GS.encodeForTabDelimited(jsnUpdate.data.newValue);

            // append an extra return to the end so just in case the C needs it
            strUpdateData += '\n';

            // prepend columns and roles
            strUpdateData = (
                strRoles + '\n' +
                strColumns + '\n' +
                strUpdateData
            );

            // add record index to the array
            arrRecordIndexes = [jsnUpdate.data.recordNumber];

        // else: invalid update type: throw an error
        } else {
            throw 'GS-FORM Error: Invalid update type. Update type "' +
                    strMode + '" is not valid, please use "single-cell" ' +
                    'or "cell-range".';
        }

        // if the user prevents the default on the "before_update"
        //      event, prevent the execution of the following update code
        if (
            !triggerEvent(
                element,
                'before_update',
                {
                    "schema": strSchema,
                    "object": strObject,
                    "updateMode": strMode,
                    "oldData": jsnCurrentData,
                    "newData": jsnUpdate.data
                }
            )
        ) {
            return;
        }

        // the update step is defined as a sub function because if there
        //      are multiple cells involved in this update, we want to open
        //      a dialog before we continue, else we want to immediatly
        //      update
        updateStep = function () {
            var updatedRecords;

            // define "updatedRecords" as empty so that we can append to it
            //      without worrying about an "undefined" at the beginning of
            //      the string
            updatedRecords = '';

            //// gotta let the user know that an update is in progress
            //addLoader(element, 'data-update', 'Updating Data...');

            element.internalData.saveState = 'saving';
            console.log('UPDATE CODE: saving');
            if (element.saveTimeout) {
                clearTimeout(element.saveTimeout);
            }

            // wait five seconds to warn the user if the update is taking too
            //      long.
            element.saveTimeout = setTimeout(
                function () {
                    var arrParentElement;
                    var parentElement;
                    var warningElement;

                    // we need to know if we've already opened a warning like
                    //      this. So, we'll select for warnings that already
                    //      exist.
                    arrParentElement = qryKids(
                        element,
                        '.saving-warning-parent'
                    );

                    if (
                        // if we haven't saved and
                        element.internalData.saveState !== 'saved' &&
                        // there isn't already a warning
                        arrParentElement.length === 0
                    ) {
                        element.internalData.saveState = 'error';

                        parentElement = document.createElement('center');
                        parentElement.setAttribute(
                            'class',
                            'saving-warning-parent'
                        );

                        warningElement = document.createElement('div');
                        warningElement.setAttribute(
                            'class',
                            'saving-warning'
                        );

                        warningElement.innerHTML = (
                            'YOUR CHANGES ARE NOT SAVED<br />' +
                            'WE HAVEN\'T HEARD BACK FROM THE SERVER<br />' +
                            'EITHER THE SAVING IS SLOW OR THERE\'S AN ERROR'
                        );

                        parentElement.appendChild(warningElement);
                        element.insertBefore(
                            parentElement,
                            element.children[0]
                        );
                    }
                },
                //10         // Uncomment to test
                (5 * 1000) // Uncomment for live
            );

            clearWarningFunction = function () {
                var arrErrorElement;

                // gather warning elements
                arrErrorElement = qryKids(
                    element,
                    '.saving-warning-parent'
                );

                // if there is a warning element, remove it
                if (arrErrorElement.length > 0) {
                    element.removeChild(arrErrorElement[0]);
                }
            };

            console.log('UPDATE CODE: START');
            // begin the websocket update
            GS.requestUpdateFromSocket(
                getSocket(element),
                strSchema,
                strObject,
                strReturn,
                strHashColumns,
                strUpdateData,
                // transaction start callback
                function (data, error) { //transID

                    // if the table element has been destroyed, stop execution
                    if (!element.internalData.columnNames) {
                        if (element.saveTimeout) {
                            clearTimeout(element.saveTimeout);
                        }
                        return;
                    }

                    // update failed: remove loader, popup an error
                    //      and reverse changes
                    if (error) {
                        if (element.saveTimeout) {
                            clearTimeout(element.saveTimeout);
                        }
                        element.internalData.saveState = 'error';

                        clearWarningFunction();
                        //removeLoader(element, 'data-update', 'Change Failed');
                        GS.webSocketErrorDialog(data);

                        // request fresh data
                        //getData(element);
                    }
                },
                // transaction ready for commit/rollback callback
                // "ignore" is a placeholder for "transID" and it tells JSLINT
                //      that it is an unused variable
                function (data, error, ignore, commit, rollback) {
                    if (!error) {
                        // update made it through: commit the update
                        if (data === 'TRANSACTION COMPLETED') {
                            if (element.saveTimeout) {
                                clearTimeout(element.saveTimeout);
                            }
                            console.log('UPDATE CODE: saved');

                            clearWarningFunction();
                            commit();

                        // else: we've just received a data packet containing
                        //      the updated records current version
                        } else {
                            // save this data so that we can use it to update
                            //      the internal data if the update makes it
                            //      through
                            //  ,----- data already comes back with an extra \n
                            // v
                            //updatedRecords += (updatedRecords ? '\n' : '');
                            updatedRecords += data;
                        }

                    // update failed: popup an error, rollback and
                    //      reverse change
                    } else {
                        if (element.saveTimeout) {
                            clearTimeout(element.saveTimeout);
                        }
                        element.internalData.saveState = 'error';

                        data.error_text = (
                            '\n\n' +
                            'Your unsaved value(s): ' +
                            strUpdateData.substring(
                                strUpdateData.indexOf('\n'),
                                strUpdateData.length
                            ) +
                            '\n\n' +
                            data.error_text
                        );

                        clearWarningFunction();
                        GS.webSocketErrorDialog(data);
                        rollback();
                        dataSELECT(element);
                    }
                },
                // transaction commit/rollback finished callback
                function (strAnswer, data, error) {
                    var arrRecords;

                    // if the table element has been destroyed, stop execution
                    if (!element.internalData.columnNames) {
                        if (element.saveTimeout) {
                            clearTimeout(element.saveTimeout);
                        }
                        return;
                    }

                    //// the over-the-network part of the update has finished,
                    ////      remove the loader now so that if there is an
                    ////      execution error below, the loader wont be stuck
                    ////      visible
                    //removeLoader(
                    //    element,
                    //    'data-update',
                    //    (
                    //        error
                    //            ? 'Change Failed'
                    //            : 'Change Saved'
                    //    )
                    //);

                    if (!error) {
                        // update was successfully commited: update internal
                        //      data and re-render
                        if (strAnswer === 'COMMIT') {
                            if (element.saveTimeout) {
                                clearTimeout(element.saveTimeout);
                            }
                            element.internalData.saveState = 'saved';

                            clearWarningFunction();

                            // refresh internal data by replace each internal
                            //      record that was affected with it's new
                            //      version
                            arrRecords = updatedRecords.split('\n');
                            i = 0;
                            len = arrRecords.length - 1; // the - 1 is because
                                                         //   of the extra \n at
                                                         //   the end of the
                                                         //   returned records
                            while (i < len) {
                                element.internalData
                                    .records[arrRecordIndexes[i]] = (
                                        arrRecords[i]
                                    );
                                i += 1;
                            }

                            dataUPDATEcallback(element, strMode, jsnUpdate);

                            // trigger an after update event
                            triggerEvent(element, 'after_update', {
                                "updateMode": strMode,
                                "oldData": jsnCurrentData,
                                "newData": jsnUpdate.data
                            });

                            // backwards compatibility
                            triggerEvent(element, 'afterupdate', {
                                "updateMode": strMode,
                                "oldData": jsnCurrentData,
                                "newData": jsnUpdate.data
                            });

                        // transaction was rolled back: reverse change
                        } else {
                            //getData(element);
                        }
                    // update failed: popup an error and reverse change
                    } else {
                        if (element.saveTimeout) {
                            clearTimeout(element.saveTimeout);
                        }
                        element.internalData.saveState = 'error';

                        clearWarningFunction();
                        GS.webSocketErrorDialog(data);
                    }
                }
            );
        };

        // begin the update
        updateStep();
    }

    function databaseWSSELECT(element) {
        var templateQS = GS.templateWithQuerystring;
        var arrRecords;
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
        };

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

        var returnCallback = function (data, error) {
            var i;
            var strRecord;
            var strMessage;
            var index;

            // sometimes, elements get removed during the wait for a
            //      callback
            if (!element.internalData.columnNames) {
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
            }
        };



        var socket = getSocket(element);
        var strSchema = templateQS(element.getAttribute('select-schema') || '');
        var strObject = templateQS(element.getAttribute('select-object') || '');
        var strReturn = strCols;
        var strWhere = templateQS(element.getAttribute('where') || '');
        var strOrd = templateQS(element.getAttribute('ord') || '');
        var strLimit = templateQS(element.getAttribute('limit') || '1');
        var strOffset = templateQS(element.getAttribute('offset') || '0');
        var strQuery = GS.templateWithQuerystring(
            element.getAttribute('select-query') || ''
        );

        // we need the user to know that the envelope is re-fetching data,
        //      so we'll put a loader on
        if (strQuery) {
            GS.requestArbitrarySelectFromSocket(
                socket,
                strQuery,
                strWhere,
                strOrd,
                strLimit,
                strOffset,
                returnCallback
            );
        } else {
            GS.requestSelectFromSocket(
                socket,
                strSchema,
                strObject,
                strReturn,
                strWhere,
                strOrd,
                strLimit,
                strOffset,
                returnCallback
            );
        }

        element.internalData.clearCache = false;
    }


    function dataSELECT(element) {
        triggerEvent(element, 'before_select');

        databaseWSSELECT(element);
    }

    function dataUPDATE(element, strMode, jsnUpdate) {
        triggerEvent(element, 'before_update');

        if (element.internalData.saveState === 'saving') {
            element.internalData.updateQueue.push({
                "mode": strMode,
                "update": jsnUpdate
            });
        } else {
            databaseWSUPDATE(element, strMode, jsnUpdate);
        }
    }


// #############################################################################
// ############################## EVENT FUNCTIONS ##############################
// #############################################################################

    // ############# QS EVENTS #############
    function unbindQuerystringEvents(element) {
        window.removeEventListener('pushstate', element.internalEvents.qsR);
        window.removeEventListener('replacestate', element.internalEvents.qsR);
        window.removeEventListener('popstate', element.internalEvents.qsR);
    }
    function bindQuerystringEvents(element) {
        //element.internalEvents.queryStringResolve
        element.internalEvents.qsR = function () {
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
                        'gs-form Warning: ' +
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
            element.internalEvents.qsR();
            window.addEventListener('pushstate', element.internalEvents.qsR);
            window.addEventListener('replacestate', element.internalEvents.qsR);
            window.addEventListener('popstate', element.internalEvents.qsR);
        }
    }

    // ############# CHANGE EVENTS #############
    function unbindChange(element) {
        // unbind save while typing
        element.removeEventListener('keydown', element.internalEvents.timed);
        element.removeEventListener('keyup', element.internalEvents.timed);
        element.removeEventListener('change', element.internalEvents.timed);

        // unbind regular save if bound
        element.removeEventListener('change', element.internalEvents.change);
    }
    function bindChange(element) {
        element.internalEvents.change = function (event) {
            var target = event.target;
            var columnParent = (
                target.hasAttribute('column')
                    ? target
                    : GS.findParentElement(target, '[column]')
            );
            var strColumn = columnParent.getAttribute('column');
            var newValue;
            var parentForm = GS.findParentTag(columnParent, 'gs-form');
            var parentRecord = GS.findParentElement(columnParent, '.form-record');
            var intRow;

            if (columnParent.value !== null) {
                // changed on 2022-06-11 by Nunzio
                // this is the behaviour of Microsoft Access, and Cross expected it
                newValue = columnParent.value === '' ? '\\N' : columnParent.value;
                // newValue = columnParent.value;
            } else {
                newValue = columnParent.checked;
            }

            if (parentRecord) {
                intRow = parseInt(parentRecord.getAttribute('data-row'), 10);
            }

            if (
                strColumn &&
                columnParentsUntilForm(element, columnParent) === 0 &&
                parentForm === element &&
                element.column(strColumn, intRow) !== newValue
            ) {
                //event.stopPropagation();

                // call the update function
                dataUPDATE(element, 'single-cell', {
                    "data": {
                        "columnName": strColumn,
                        "recordNumber": intRow,
                        "newValue": newValue
                    }
                });
            }
        };

        element.internalEvents.timed = function (event) {
            var target = event.target;
            var columnParent = (
                target.hasAttribute('column')
                    ? target
                    : GS.findParentElement(target, '[column]')
            );
            var strColumn = columnParent.getAttribute('column');
            var parentForm = GS.findParentTag(target, 'gs-form');
            var parentRecord = GS.findParentElement(target, '.form-record');
            var intRow = parseInt(parentRecord.getAttribute('data-row'), 10);
            var newValue = (
                columnParent.value !== null
                    // changed on 2022-06-11 by Nunzio
                    // this is the behaviour of Microsoft Access, and Cross expected it
                    ? (columnParent.value === '' ? '\\N' : columnParent.value)
                    // ? columnParent.value;
                    : columnParent.checked
            );
            
            console.log('triggered:', event.type, event.keyCode);

            if (
                strColumn &&
                columnParentsUntilForm(element, columnParent) === 0 &&
                parentForm === element &&
                // we don't want to send extra updates, but if someone was to
                //      delete and then undelete, we want it to count. So, if
                //      there is an update in the queue, run no matter what. If
                //      this is the only update, only run if it's actually
                //      different
                !(
                    element.internalData.timerCount === 0 &&
                    element.internalData.updateQueue.length === 0 &&
                    element.internalData.saveState !== 'saving' &&
                    element.column(strColumn, intRow) === newValue
                )
            ) {
                // cancel save timer if another update comes in before time runs
                //      out
                if (element.internalData.timer[strColumn]) {
                    clearTimeout(element.internalData.timer[strColumn]);
                    element.internalData.timerCount -= 1;
                    element.internalData.timer[strColumn] = null;
                }

                // if no more updates come in within the time allotted, commit
                element.internalData.timerCount += 1;
                element.internalData.timer[strColumn] = setTimeout(function () {
                    element.internalData.timerCount -= 1;
                    element.internalData.timer[strColumn] = null;
                    dataUPDATE(element, 'single-cell', {
                        "data": {
                            "columnName": strColumn,
                            "recordNumber": intRow,
                            "newValue": newValue
                        }
                    });
                }, 600);// used to be 300, but if you held a key down, then held
                //      a second key down at the same time, it would take enough
                //      time to switch letters to cause a save (but letters
                //      would still be being put in) hence, it would cause a
                //      partial rerender (because the value of the control is
                //      different from the database)
            }
        };

        // bind save code
        if (element.hasAttribute('save-while-typing')) {
            element.addEventListener('keydown', element.internalEvents.timed);
            element.addEventListener('keyup', element.internalEvents.timed);
            element.addEventListener('change', element.internalEvents.timed);
        } else {
            element.addEventListener('change', element.internalEvents.change);
        }
    }

    // ############# KEY EVENTS #############
    function unbindKey(element) {
        element.removeEventListener('keydown', element.internalEvents.keyNav);
    }
    function bindKey(element) {
        element.internalEvents.keyNav = function (event) {
            var target = event.target;
            var keyCode = (event.which || event.keyCode);
            var jsnSelection;
            var focusToElement;
            var i;
            var len;
            var arrElementsFocusable;
            var currentElement;

            if (
                document.activeElement.nodeName === 'INPUT' ||
                document.activeElement.nodeName === 'TEXTAREA'
            ) {
                jsnSelection = GS.getInputSelection(target);
            }

            if (
                // Left arrow
                (
                    keyCode === 37 &&
                    (!jsnSelection || jsnSelection.start === 0)
                ) ||
                // Right arrow
                (
                    keyCode === 39 &&
                    (!jsnSelection || jsnSelection.end === target.value.length)
                )
            ) {
                arrElementsFocusable = xtag.query(
                    document,
                    (
                        'input:not([disabled]), ' +
                        'select:not([disabled]), ' +
                        'memo:not([disabled]), ' +
                        'button:not([disabled]), ' +
                        '[tabindex]:not([disabled]), ' +
                        '[column]'
                    )
                );

                // Left arrow
                if (keyCode === 37) {
                    i = 0;
                    len = arrElementsFocusable.length;
                    while (i < len) {
                        currentElement = arrElementsFocusable[i];

                        if (
                            currentElement === target ||
                            (
                                (
                                    target.nodeName === 'INPUT' ||
                                    target.nodeName === 'TEXTAREA'
                                ) &&
                                currentElement === target.parentNode
                            )
                        ) {
                            if (i === 0) {
                                focusToElement = currentElement;
                            } else {
                                focusToElement = arrElementsFocusable[i - 1];
                            }
                            break;
                        }

                        i += 1;
                    }

                // Right arrow
                } else if (keyCode === 39) {
                    i = 0;
                    len = arrElementsFocusable.length;
                    while (i < len) {
                        currentElement = arrElementsFocusable[i];
                        if (currentElement === target) {
                            if (i === len) {
                                focusToElement = currentElement;
                            } else {
                                focusToElement = arrElementsFocusable[i + 1];
                            }
                            break;
                        }

                        i += 1;
                    }
                }

                if (
                    focusToElement &&
                    GS.isElementFocusable(focusToElement)
                ) {
                    event.preventDefault();
                    focusToElement.focus();

                    if (
                        document.activeElement.nodeName === 'INPUT' ||
                        document.activeElement.nodeName === 'TEXTAREA'
                    ) {
                        GS.setInputSelection(
                            document.activeElement,
                            0,
                            document.activeElement.value.length
                        );
                    }
                }
            }
        };

        element.addEventListener('keydown', element.internalEvents.keyNav);
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
        unbindChange(element);
        unbindKey(element);
        unbindDeveloper(element);
    }
    function bindElement(element) {
        bindQuerystringEvents(element);
        bindChange(element);
        bindKey(element);
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
            renderFull(element);
            dataSELECT(element);
            triggerEvent(element, 'initialized');
        }
    }

    xtag.register('gs-form', {

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
                    var arrAttributes = [];
                    if (attr === 'value' || arrAttributes.indexOf(attr) > -1) {

                    }
                }
            }
        },

// #############################################################################
// ############################# ELEMENT ACCESSORS #############################
// #############################################################################

        accessors: {},

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

            // allow the user to take columns related to the single record
            'column': function (strColumn, intRow) {
                var element = this;
                var jsnRecord;
                var templateFunc;

                intRow = intRow || 0;

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
            },

            'refresh': function () {
                dataSELECT(this);
            },

            'save': function () {
                //updateDataWithoutTemplate(this, false);
            },

            'addMessage': function (/*strMessageName*/) {
                //return addMessage(this, strMessageName);
            },

            'removeMessage': function (/*strMessageName*/) {
                //return removeMessage(this, strMessageName);
            }
        }
    });
});






// //global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
// //global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
// //global addControlProps, addFlexContainerProps, addProp
// //global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
// //global addIconProps, shimmed, HTMLTemplateElement, addDataAttributes
// //global addDataEvents
// //jslint browser:true, white:false, this:true
// //, maxlen:80

// window.addEventListener('design-register-element', function () {
//     'use strict';
//     addSnippet(
//         '<gs-form>',
//         '<gs-form>',
//         (
//             'gs-form src="${1:test.tpeople}">\n' +
//             '    <template>\n' +
//             '        ${2}\n' +
//             '    </template>\n' +
//             '</gs-form>'
//         )
//     );

//     addElement('gs-form', '#record_form');

//     window.designElementProperty_GSFORM = function () {
//         addDataAttributes('select,update');
//         addCheck('D', 'Save&nbsp;While&nbsp;Typing', 'save-while-typing');
//         addCheck('D', 'Suppress<br />"No&nbsp;Record&nbsp;Found"<br />Error', 'suppress-no-record-found');
//         addDataEvents('select,update');
//         addText('O', 'Column In QS', 'qs');
//         addText('O', 'Refresh On QS Columns', 'refresh-on-querystring-values');
//         addText('O', 'Refresh On QS Change', 'refresh-on-querystring-change');
//         addFlexContainerProps();
//         addFlexProps();
//     };
// });

// document.addEventListener('DOMContentLoaded', function () {
//     'use strict';
//     // #################################################################
//     // ########################### UTILITIES ###########################
//     // #################################################################

//     function removeMessage(element, strMessageName) {
//         if (strMessageName === 'saving' && element.savingMessage) {
//             element.removeChild(element.savingMessage);
//             element.savingMessage = null;

//         } else if (strMessageName === 'waiting' && element.waitingMessage) {
//             element.removeChild(element.waitingMessage);
//             element.waitingMessage = null;
//         }
//     }

//     function addMessage(element, strMessageName) {
//         if (strMessageName === 'saving') {
//             if (element.savingMessage) {
//                 removeMessage(element, 'saving');
//             }
//             element.savingMessage = document.createElement('div');
//             element.savingMessage.classList.add('message');
//             element.savingMessage.innerHTML = 'Saving...';

//             element.appendChild(element.savingMessage);

//         } else if (strMessageName === 'waiting') {
//             if (element.waitingMessage) {
//                 removeMessage(element, 'waiting');
//             }
//             element.waitingMessage = document.createElement('div');
//             element.waitingMessage.classList.add('message');
//             element.waitingMessage.innerHTML = 'Waiting<br />to save...';

//             element.appendChild(element.waitingMessage);
//         }
//     }

//     function columnParentsUntilForm(form, element) {
//         var intColumnParents = 0;
//         var currentElement = element;
//         var maxLoops = 50;
//         var i = 0;

//         while (currentElement.parentNode !== form && currentElement.parentNode && i < maxLoops) {
//             if (
//                 //If something with a column attribute
//                 currentElement.parentNode.hasAttribute('column') === true ||
//                 //or something with a src attribute
//                 currentElement.parentNode.hasAttribute('src') === true
//             ) {
//                 intColumnParents += 1;
//             }

//             currentElement = currentElement.parentNode;
//             i += 1;
//         }

//         return intColumnParents;
//     }

//     function saveDefaultAttributes(element) {
//         var i;
//         var len;
//         var arrAttr;
//         var jsnAttr;

//         // we need a place to store the attributes
//         element.internal.defaultAttributes = {};

//         // loop through attributes and store them in the internal defaultAttributes object
//         arrAttr = element.attributes;
//         i = 0;
//         len = arrAttr.length;
//         while (i < len) {
//             jsnAttr = arrAttr[i];

//             element.internal.defaultAttributes[jsnAttr.nodeName] = (jsnAttr.value || '');

//             i += 1;
//         }
//     }

//     function pushReplacePopHandler(element) {
//         var i;
//         var len;
//         var strQS = GS.getQueryString();
//         var strQSCol = element.getAttribute('qs');
//         var strQSValue;
//         var strQSAttr;
//         var arrQSParts;
//         var arrAttrParts;
//         var arrPopKeys;
//         var currentValue;
//         var bolRefresh;
//         var strOperator;

//         if (strQSCol) {
//             if (strQSCol.indexOf('=') !== -1) {
//                 arrAttrParts = strQSCol.split(',');
//                 i = 0;
//                 len = arrAttrParts.length;
//                 while (i < len) {
//                     strQSCol = arrAttrParts[i];

//                     if (strQSCol.indexOf('!=') !== -1) {
//                         strOperator = '!=';
//                         arrQSParts = strQSCol.split('!=');
//                     } else {
//                         strOperator = '=';
//                         arrQSParts = strQSCol.split('=');
//                     }

//                     strQSCol = arrQSParts[0];
//                     strQSAttr = arrQSParts[1] || arrQSParts[0];

//                     // if the key is not present or we've got the negator: go to the attribute's default or remove it
//                     if (strOperator === '!=') {
//                         // if the key is not present: add the attribute
//                         if (GS.qryGetKeys(strQS).indexOf(strQSCol) === -1) {
//                             element.setAttribute(strQSAttr, '');
//                         // else: remove the attribute
//                         } else {
//                             element.removeAttribute(strQSAttr);
//                         }
//                     } else {
//                         // if the key is not present: go to the attribute's default or remove it
//                         if (GS.qryGetKeys(strQS).indexOf(strQSCol) === -1) {
//                             if (element.internal.defaultAttributes[strQSAttr] !== undefined) {
//                                 element.setAttribute(strQSAttr, (element.internal.defaultAttributes[strQSAttr] || ''));
//                             } else {
//                                 element.removeAttribute(strQSAttr);
//                             }
//                         // else: set attribute to exact text from QS
//                         } else {
//                             element.setAttribute(strQSAttr, (
//                                 GS.qryGetVal(strQS, strQSCol) ||
//                                 element.internal.defaultAttributes[strQSAttr] ||
//                                 ''
//                             ));
//                         }
//                     }
//                     i += 1;
//                 }
//             } else if (GS.qryGetKeys(strQS).indexOf(strQSCol) > -1) {
//                 strQSValue = GS.qryGetVal(strQS, strQSCol);

//                 if (element.internal.bolQSFirstRun !== true) {
//                   //console.log(element.getAttribute('value'));
//                     if (strQSValue !== '' || !element.getAttribute('value')) {
//                         element.setAttribute(
//                             'where',
//                             (
//                                 (element.getAttribute('pk') || 'id') + '=' +
//                                 (
//                                     isNaN(strQSValue)
//                                         ? '$WHEREQuoTE$' + strQSValue + '$WHEREQuoTE$'
//                                         : strQSValue
//                                 )
//                             )
//                         );
//                         bolRefresh = true;
//                     }
//                 } else {
//                     element.setAttribute(
//                         'where',
//                         (
//                             (element.getAttribute('pk') || 'id') + '=' +
//                             (
//                                 isNaN(strQSValue)
//                                     ? '$WHEREQuoTE$' + strQSValue + '$WHEREQuoTE$'
//                                     : strQSValue
//                             )
//                         )
//                     );
//                     bolRefresh = true;
//                 }
//             }
//         }

//         // handle "refresh-on-querystring-values" and "refresh-on-querystring-change" attributes
//         if (element.internal.bolQSFirstRun === true) {
//             if (element.hasAttribute('refresh-on-querystring-values')) {
//                 arrPopKeys = element.getAttribute('refresh-on-querystring-values').split(/\s*,\s*/gim);

//                 i = 0;
//                 len = arrPopKeys.length;
//                 while (i < len) {
//                     currentValue = GS.qryGetVal(strQS, arrPopKeys[i]);

//                     if (element.popValues[arrPopKeys[i]] !== currentValue) {
//                         bolRefresh = true;
//                     }

//                     element.popValues[arrPopKeys[i]] = currentValue;
//                     i += 1;
//                 }
//             } else if (element.hasAttribute('refresh-on-querystring-change')) {
//                 bolRefresh = true;
//             }
//         } else {
//             if (element.hasAttribute('refresh-on-querystring-values')) {
//                 arrPopKeys = element.getAttribute('refresh-on-querystring-values').split(/\s*,\s*/gim);

//                 i = 0;
//                 len = arrPopKeys.length;
//                 while (i < len) {
//                     element.popValues[arrPopKeys[i]] = GS.qryGetVal(strQS, arrPopKeys[i]);
//                     i += 1;
//                 }
//             }

//             if (GS.getQueryString() || element.hasAttribute('refresh-on-querystring-change') || element.hasAttribute('src')) {
//                 bolRefresh = true;
//             }
//         }

//         if (bolRefresh && element.hasAttribute('src')) {
//             getData(element);
//         } else if (bolRefresh && !element.hasAttribute('src')) {
//             console.warn('gs-combo Warning: element has "refresh-on-querystring-values" or "refresh-on-querystring-change", but no "src".', element);
//         }

//         element.internal.bolQSFirstRun = true;
//     }

//     function triggerBeforeSelect(element) {
//         GS.triggerEvent(element, 'before_select');
//         if (element.hasAttribute('onbefore_select')) {
//             new Function(element.getAttribute('onbefore_select')).apply(element);
//         }
//     }

//     function triggerAfterSelect(element) {
//         GS.triggerEvent(element, 'after_select');
//         if (element.hasAttribute('onafter_select')) {
//             new Function(element.getAttribute('onafter_select')).apply(element);
//         }
//     }

//     function triggerAfterSelectError(element) {
//         GS.triggerEvent(element, 'after_select_error');
//         if (element.hasAttribute('onafter_select_error')) {
//             new Function(element.getAttribute('onafter_select_error')).apply(element);
//         }
//     }

//     //this one doesn't seem to be working properly
//     function triggerBeforeUpdate(element) {
//         GS.triggerEvent(element, 'before_update');
//         if (element.hasAttribute('onbefore_update')) {
//             new Function(element.getAttribute('onbefore_update')).apply(element);
//         }
//     }

//     function triggerAfterUpdate(element) {
//         GS.triggerEvent(element, 'after_update');
//         if (element.hasAttribute('onafter_update')) {
//             new Function(element.getAttribute('onafter_update')).apply(element);
//         } else if (element.hasAttribute('afterupdate')) {
//             new Function(element.getAttribute('afterupdate')).apply(element);
//         }
//     }

//     // the user needs to be able to set a custom websocket for this element,
//     //      so this function will use an attribute to find out what socket to
//     //      use (and it'll default to "GS.envSocket")
//     function getSocket(element) {
//         if (element.getAttribute('socket')) {
//             return GS[element.getAttribute('socket')];
//         }
//         return GS.envSocket;
//     }

//     // ##################################################################
//     // ######################## UPDATE FUNCTIONS ########################
//     // ##################################################################

//     function emergencyUpdate(element) {
//         if (element.currentSaveAjax) {
//             element.currentSaveAjax.abort();
//         }
//         element.bolCurrentlySaving = false;
//         updateDataWithoutTemplate(element, false);
//     }

//     function updateData(element, updateElement, strColumn, newValue) {
//         var parentRecord;
//         var strID;
//         var strHash;
//         var srcParts = GS.templateWithQuerystring(element.getAttribute('update-src') || element.getAttribute('src')).split('.');
//         var strSchema = srcParts[0];
//         var strObject = srcParts[1];
//         var strReturnCols = element.arrColumns.join('\t');
//         var strHashCols = element.lockColumn;
//         var strPk;
//         var updateFrameData;
//         var strRoles;
//         var strColumns;
//         var arrTotalRecords = [];

//         console.log(strColumn, newValue);

//         parentRecord = GS.findParentElement(updateElement, '.form-record');

//         strPk = element.getAttribute('pk') || 'id';
//         strID = parentRecord.getAttribute('data-pk');
//         strHash = CryptoJS.MD5(parentRecord.getAttribute('data-' + element.lockColumn)).toString();

//         strRoles = 'pk\thash\tset';
//         strColumns = strPk + '\thash\t' + GS.encodeForTabDelimited(strColumn);
//         updateFrameData = strID + '\t' + strHash + '\t' + GS.encodeForTabDelimited(newValue);

//         updateFrameData = (strRoles + '\n' + strColumns + '\n' + updateFrameData);

//         triggerBeforeUpdate(element);
//         //GS.triggerEvent(element, 'before_update');

//         element.saveState = 'saving';
//         if (element.saveTimeout) {
//             clearTimeout(element.saveTimeout);
//         }
//         element.saveTimeout = setTimeout(function () {
//             if (element.saveState !== 'saved' && xtag.query(element, '.saving-warning-parent').length === 0) {
//                 element.saveState = 'error';
//                 var parentElement = document.createElement('center');
//                 parentElement.setAttribute('class', 'saving-warning-parent');

//                 var warningElement = document.createElement('div');
//                 warningElement.setAttribute('class', 'saving-warning');

//                 // warningElement.innerHTML = 'CHANGES ARE NOT SAVED<br />CLICK HERE TO TRY AGAIN';
//                 warningElement.innerHTML = (
//                     'YOUR CHANGES ARE NOT SAVED<br />' +
//                     'WE HAVEN\'T HEARD BACK FROM THE SERVER<br />' +
//                     'EITHER THE SAVING IS SLOW OR THERE\'S AN ERROR'
//                 );

//                 parentElement.appendChild(warningElement);
//                 element.insertBefore(parentElement, element.children[0]);

//                 // element.appendChild(parentElement);
//                 /*
//                 warningElement.addEventListener('click', function () {
//                     saveFile(element, strPath, changeStamp, strContent, callbackSuccess, callbackFail);
//                 });
//                 */
//             }
//         }, /*30*/ 5 * 1000);

//         GS.requestUpdateFromSocket(
//             getSocket(element),
//             strSchema,
//             strObject,
//             strReturnCols,
//             strHashCols,
//             updateFrameData,
//             function (data, error) { //, transactionID
//                 if (error) {
//                     if (element.saveTimeout) {
//                         clearTimeout(element.saveTimeout);
//                     }
//                     element.saveState = 'error';

//                     getData(element);
//                     GS.removeLoader(element);
//                     GS.webSocketErrorDialog(data);
//                 }
//             },
//             function (data, error, ignore, commitFunction, rollbackFunction) { //transactionID
//                 // removed by Nunzio on 2019-07-31 because there is no loader
//                 //GS.removeLoader(element);

//                 if (!error) {
//                     if (data === 'TRANSACTION COMPLETED') {
//                         if (element.saveTimeout) {
//                             clearTimeout(element.saveTimeout);
//                         }
//                         element.saveState = 'saved';

//                         commitFunction();
//                     } else {
//                         var arrRecords;
//                         var arrCells;
//                         var i;
//                         var len;
//                         var cell_i;
//                         var cell_len;

//                         arrRecords = GS.trim(data, '\n').split('\n');

//                         i = 0;
//                         len = arrRecords.length;
//                         while (i < len) {
//                             arrCells = arrRecords[i].split('\t');

//                             cell_i = 0;
//                             cell_len = arrCells.length;
//                             while (cell_i < cell_len) {
//                                 arrCells[cell_i] = (
//                                     arrCells[cell_i] === '\\N'
//                                         ? null
//                                         : GS.decodeFromTabDelimited(arrCells[cell_i])
//                                 );
//                                 cell_i += 1;
//                             }

//                             arrTotalRecords.push(arrCells);
//                             i += 1;
//                         }
//                     }

//                 } else {
//                     if (element.saveTimeout) {
//                         clearTimeout(element.saveTimeout);
//                     }
//                     element.saveState = 'error';

//                     rollbackFunction();
//                     getData(element);
//                     GS.webSocketErrorDialog(data);
//                 }
//             },
//             function (strAnswer, data, error) {
//                 var idIndex;
//                 var i;
//                 var len;

//                 //GS.removeLoader(element);

//                 if (!error) {
//                     if (strAnswer === 'COMMIT') {
//                         if (element.saveTimeout) {
//                             clearTimeout(element.saveTimeout);
//                         }
//                         element.saveState = 'saved';

//                         idIndex = element.lastSuccessData.arr_column.indexOf(element.getAttribute('pk') || 'id');
//                         i = 0;
//                         len = element.lastSuccessData.dat.length;
//                         while (i < len) {
//                             if (String(element.lastSuccessData.dat[i][idIndex]) === strID) {
//                                 element.lastSuccessData.dat[i] = arrTotalRecords[0];
//                                 break;
//                             }
//                             i += 1;
//                         }

//                         handleData(element, element.lastSuccessData);

//                         triggerAfterUpdate(element);
//                         //GS.triggerEvent(element, 'after_update');
//                     } else {
//                         getData(element);
//                     }
//                 } else {
//                     if (element.saveTimeout) {
//                         clearTimeout(element.saveTimeout);
//                     }
//                     element.saveState = 'error';

//                     getData(element);
//                     GS.webSocketErrorDialog(data);
//                 }
//             }
//         );
//     }

//     function updateDataWithoutTemplate(element) {

//         console.log(strColumn, newValue);
//         if (element.bolCurrentlySaving === false && !element.bolErrorOpen) {
//             var strID;
//             var strHash;
//             var srcParts = GS.templateWithQuerystring(element.getAttribute('src')).split('.');
//             var strSchema = srcParts[0];
//             var strObject = srcParts[1];
//             var strReturnCols = element.arrColumns.join('\t');
//             var strHashCols = element.lockColumn;
//             var updateFrameData;
//             var strRoles;
//             var strColumns;
//             var arrTotalRecords = [];
//             var functionUpdateRecord;
//             var col_key;
//             var key;
//             var strColumn;
//             var newValue;
//             var idIndex;
//             var i;
//             var len;

//             functionUpdateRecord = function (strID, strColumn, recordIndex, strParameters) {
//                 var strWhere;
//                 var strChangeStamp;
//                 var strValue;
//                 var strPk;

//                 element.bolCurrentlySaving = true;
//                 element.jsnUpdate[strID][strColumn] = undefined;

//                 // run ajax
//                 removeMessage(element, 'waiting');
//                 addMessage(element, 'saving');
//                 element.state = 'saving';

//                 element.saveTimeout = setTimeout(function () {
//                     if (element.saveState !== 'saved' && xtag.query(element, '.saving-warning-parent').length === 0) {
//                         element.saveState = 'error';
//                         var parentElement = document.createElement('center');
//                         parentElement.setAttribute('class', 'saving-warning-parent');

//                         var warningElement = document.createElement('div');
//                         warningElement.setAttribute('class', 'saving-warning');

//                         // warningElement.innerHTML = 'CHANGES ARE NOT SAVED<br />CLICK HERE TO TRY AGAIN';
//                         warningElement.innerHTML = (
//                             'YOUR CHANGES ARE NOT SAVED<br />' +
//                             'WE HAVEN\'T HEARD BACK FROM THE SERVER<br />' +
//                             'EITHER THE SAVING IS SLOW OR THERE\'S AN ERROR'
//                         );

//                         parentElement.appendChild(warningElement);
//                         element.insertBefore(parentElement, element.children[0]);

//                         // element.appendChild(parentElement);
//                         /*
//                         warningElement.addEventListener('click', function () {
//                             saveFile(element, strPath, changeStamp, strContent, callbackSuccess, callbackFail);
//                         });
//                         */
//                     }
//                 }, /*30*/ 5 * 1000);

//                 strWhere = GS.qryGetVal(strParameters, 'where');
//                 strColumn = GS.qryGetVal(strParameters, 'column');
//                 strValue = GS.qryGetVal(strParameters, 'value');
//                 strID = GS.qryGetVal(strWhere, 'pk');
//                 strChangeStamp = GS.qryGetVal(strWhere, element.lockColumn);
//                 strHash = CryptoJS.MD5(strChangeStamp).toString();
//                 strPk = element.getAttribute('pk') || 'id';

//                 strRoles = 'pk\thash\tset';
//                 strColumns = strPk + '\thash\t' + GS.encodeForTabDelimited(strColumn);
//                 updateFrameData = strID + '\t' + strHash + '\t' + GS.encodeForTabDelimited(strValue);
//                 updateFrameData = (strRoles + '\n' + strColumns + '\n' + updateFrameData);

//                 GS.requestUpdateFromSocket(
//                     getSocket(element),
//                     strSchema,
//                     strObject,
//                     strReturnCols,
//                     strHashCols,
//                     updateFrameData,
//                     function (data, error) { // , transactionID
//                         if (error) {
//                             getData(element);
//                             GS.webSocketErrorDialog(data);
//                         }
//                     },
//                     function (data, error, ignore, commitFunction, rollbackFunction) { //transactionID
//                         if (!error) {
//                             if (data === 'TRANSACTION COMPLETED') {
//                                 commitFunction();
//                             } else {
//                                 var arrRecords;
//                                 var arrCells;
//                                 var rec_i;
//                                 var rec_len;
//                                 var cell_i;
//                                 var cell_len;

//                                 arrRecords = GS.trim(data, '\n').split('\n');

//                                 rec_i = 0;
//                                 rec_len = arrRecords.length;
//                                 while (rec_i < rec_len) {
//                                     arrCells = arrRecords[rec_i].split('\t');

//                                     cell_i = 0;
//                                     cell_len = arrCells.length;
//                                     while (cell_i < cell_len) {
//                                         arrCells[cell_i] = (
//                                             arrCells[cell_i] === '\\N'
//                                                 ? null
//                                                 : GS.decodeFromTabDelimited(arrCells[cell_i])
//                                         );
//                                         cell_i += 1;
//                                     }

//                                     arrTotalRecords.push(arrCells);
//                                     rec_i += 1;
//                                 }
//                             }

//                         } else {
//                             rollbackFunction();
//                             getData(element);
//                             GS.webSocketErrorDialog(data);
//                         }
//                     },
//                     function (strAnswer, data, error) {
//                         var col_key;
//                         var key;
//                         var bolSaveWaiting;

//                         removeMessage(element, 'saving');
//                         element.state = 'saved';
//                         if (element.saveTimeout) {
//                             clearTimeout(element.saveTimeout);
//                         }

//                         GS.removeLoader(element);

//                         if (!error) {
//                             if (strAnswer === 'COMMIT') {
//                                 element.lastSuccessData.dat[recordIndex] = arrTotalRecords[0];
//                                 element.bolCurrentlySaving = false;

//                                 // if there is another save in the pipeline: bolSaveWaiting = true
//                                 for (key in element.jsnUpdate) {
//                                     for (col_key in element.jsnUpdate[key]) {
//                                         if (element.jsnUpdate[key][col_key] !== undefined) {
//                                             bolSaveWaiting = true;
//                                             break;
//                                         }
//                                     }
//                                 }

//                                 // if there is a save waiting: update again
//                                 if (bolSaveWaiting) {
//                                     updateDataWithoutTemplate(element);

//                                 } else {
//                                     triggerAfterUpdate(element);
//                                 }
//                             } else {
//                                 getData(element);
//                             }
//                         } else {
//                             GS.webSocketErrorDialog(data);
//                         }
//                     }
//                 );
//             };

//             // loop through the jsnUpdate variable and make one update for every record that needs an update
//             for (key in element.jsnUpdate) {
//                 for (col_key in element.jsnUpdate[key]) {
//                     if (element.jsnUpdate[key][col_key] !== undefined) {
//                         strID = key;
//                         strColumn = col_key;
//                         newValue = element.jsnUpdate[key][col_key];
//                         idIndex = element.lastSuccessData.arr_column.indexOf(element.getAttribute('pk') || 'id');

//                         i = 0;
//                         len = element.lastSuccessData.dat.length;
//                         while (i < len) {
//                             if (String(element.lastSuccessData.dat[i][idIndex]) === strID) {
//                                 functionUpdateRecord(
//                                     strID,
//                                     strColumn,
//                                     i,
//                                     (
//                                         'where=' + encodeURIComponent(
//                                             'pk=' + strID +
//                                             '&' + element.lockColumn + '=' + GS.envGetCell(element.lastSuccessData, i, element.lockColumn)
//                                         ) +
//                                         '&column=' + strColumn +
//                                         '&value=' + encodeURIComponent(newValue)
//                                     )
//                                 );

//                                 break;
//                             }
//                             i += 1;
//                         }

//                         break;
//                     }
//                 }
//             }
//         }
//     }


//     // #################################################################
//     // ######################### DATA HANDLING #########################
//     // #################################################################

//     function dataTemplateRecords(element, data) {
//         var jsnTemplate;
//         var strRet;
//         var strStyle = '';

//         if (data.dat.length === 1) {
//             strStyle = 'style="height: 100%;" ';
//         }

//         jsnTemplate = GS.templateHideSubTemplates(element.templateHTML);

//         strRet = GS.templateWithEnvelopeData(
//             (
//                 '<div ' +
//                     'class="form-record" ' + strStyle +
//                     'data-pk="{{! row.' + (element.getAttribute('pk') || 'id') + ' }}" ' +
//                     'data-' + element.lockColumn + '="{{! row.' + element.lockColumn + ' }}" ' +
//                     'gs-dynamic' +
//                 '>' +
//                     jsnTemplate.templateHTML +
//                 '</div>'
//             ),
//             data
//         );
//         strRet = GS.templateShowSubTemplates(strRet, jsnTemplate);

//         return strRet;
//     }

//     // handles data result from method function: getData
//     //      success:  template
//     //      error:    add error classes
//     function handleData(element, data, error) {
//         var arrElements;
//         var i;
//         var len;
//         var intColumnElementFocusNumber;
//         var jsnSelection;
//         var matchElement;
//         var templateElement = document.createElement('template');
//         var focusTimerID;
//         var focusToElement;
//         var timer_i;

//         // clear any old error status
//         element.classList.remove('error');

//         if (!error && data.dat.length === 0 && !element.hasAttribute('limit') && !element.hasAttribute('suppress-no-record-found')) {
//             templateElement.setAttribute('data-theme', 'error');
//             templateElement.innerHTML = ml(function () {/*
//                 <gs-page>
//                     <gs-header><center><h3>Error</h3></center></gs-header>
//                     <gs-body padded>
//                         <center>No record found</center>
//                     </gs-body>
//                     <gs-footer>
//                         <gs-grid>
//                             <gs-block><gs-button dialogclose>Cancel</gs-button></gs-block>
//                             <gs-block><gs-button dialogclose listen-for-return bg-primary>Try Again</gs-button></gs-block>
//                         </gs-grid>
//                     </gs-footer>
//                 </gs-page>*/
//             });

//             GS.openDialog(templateElement, '', function (ignore, strAnswer) {
//                 if (strAnswer === 'Try Again') {
//                     element.refresh();
//                 }
//             });
//         }

//         // if there was no error
//         if (!error) {
//             element.error = false;

//             // save success data
//             element.lastSuccessData = data;

//             if (GS.findParentElement(document.activeElement, 'gs-form') === element) {
//                 //console.log('Hey');
//                 arrElements = xtag.query(element, '[column]');
//                 matchElement = GS.findParentElement(document.activeElement, '[column]');

//                 if (document.activeElement.nodeName === 'INPUT' || document.activeElement.nodeName === 'TEXTAREA') {
//                     jsnSelection = GS.getInputSelection(document.activeElement);
//                 }

//                 if (matchElement) {
//                     i = 0;
//                     len = arrElements.length;
//                     while (i < len) {
//                         if (arrElements[i] === matchElement) {
//                             intColumnElementFocusNumber = i;
//                             break;
//                         }
//                         i += 1;
//                     }
//                 }
//             }

//             //console.log(element.children);
//             element.innerHTML = dataTemplateRecords(element, data);
//             //console.log(element.children);

//             // if template is not native: handle templates inside the form
//             if (shimmed.HTMLTemplateElement) {
//                 HTMLTemplateElement.bootstrap(element);
//             }

//             // handle autofocus
//             arrElements = xtag.query(element, '[autofocus]');

//             if (arrElements.length > 0 && !evt.touchDevice) {
//                 arrElements[0].focus();

//                 if (arrElements.length > 1) {
//                     console.warn('dialog Warning: Too many [autofocus] elements, defaulting to the first one. Please have only one [autofocus] element per form.');
//                 }
//             }

//             // if there is a intColumnElementFocusNumber: restore focus
//             if (intColumnElementFocusNumber) {
//                 arrElements = xtag.query(element, '[column]');

//                 if (arrElements.length > intColumnElementFocusNumber) {
//                     focusToElement = arrElements[intColumnElementFocusNumber];

//                     // if element registration is not shimmed, we can just focus into the target element
//                     if (shimmed.customElements === false) {
//                         focusToElement.focus();
//                         if (jsnSelection) {
//                             GS.setInputSelection(document.activeElement, jsnSelection.start, jsnSelection.end);
//                         }

//                     // else, we have to check on a loop to see if the element has been upgraded,
//                     //      the reason I need to use a loop here is because there is no event for
//                     //      when an element is upgraded (if there was then 1000 custom elements
//                     //      would emit 1000 events, which is a lot and we don't want to bog the
//                     //      browser down)
//                     } else {
//                         timer_i = 0;
//                         focusTimerID = setInterval(function () {
//                             if (focusToElement['__upgraded__'] || timer_i >= 10) {
//                                 clearTimeout(focusTimerID);
//                             }
//                             if (focusToElement['__upgraded__']) {
//                                 focusToElement.focus();
//                                 if (jsnSelection) {
//                                     GS.setInputSelection(document.activeElement, jsnSelection.start, jsnSelection.end);
//                                 }
//                             }
//                             timer_i += 1;
//                         }, 5);
//                     }
//                 }
//             }

//             // trigger after_select
//             triggerAfterSelect(element);
//             //GS.triggerEvent(element, 'after_select');

//         // else there was an error: add error class, title attribute
//         } else {
//             element.error = true;
//             element.classList.add('error');
//             element.innerHTML = 'This form encountered an error.';

//             //GS.ajaxErrorDialog(event.detail.response);
//             GS.ajaxErrorDialog(data);

//             // trigger after_select_error
//             triggerAfterSelectError(element);
//         }
//     }

//     // handles fetching the data
//     //      if bolInitalLoad === true then
//     //          use: initialize query COALESCE TO source query
//     //      else
//     //          use: source query
//     function getData(element) { //bolClearPrevious
//         var strSrc = GS.templateWithQuerystring(element.getAttribute('src'));
//         var bolQuery = strSrc[0] === '(';
//         var srcParts = (
//             strSrc[0] === '('
//                 ? [strSrc, '']
//                 : strSrc.split('.')
//         );
//         var strSchema = srcParts[0];
//         var strObject = srcParts[1];
//         var strColumns = GS.templateWithQuerystring(element.getAttribute('cols') || '*').split(',').join('\t');
//         var strWhere = GS.templateWithQuerystring(element.getAttribute('where') || '');
//         var strOrd = GS.templateWithQuerystring(element.getAttribute('ord') || '');
//         var strLimit = GS.templateWithQuerystring(element.getAttribute('limit') || '1');
//         var strOffset = GS.templateWithQuerystring(element.getAttribute('offset') || '');
//         var arrTotalRecords = [];

//         triggerBeforeSelect(element);
//         //GS.triggerEvent(element, 'before_select');

//         GS.requestSelectFromSocket(
//             getSocket(element),
//             (
//                 bolQuery
//                     ? ''
//                     : strSchema
//             ),
//             (
//                 bolQuery
//                     ? strSrc
//                     : strObject
//             ),
//             strColumns,
//             strWhere,
//             strOrd,
//             strLimit,
//             strOffset,
//             function (data, error) {
//                 var arrRecords;
//                 var arrCells;
//                 var i;
//                 var len;
//                 var cell_i;
//                 var cell_len;

//                 if (!error) {
//                     if (data.strMessage !== 'TRANSACTION COMPLETED') {
//                         arrRecords = GS.trim(data.strMessage, '\n').split('\n');

//                         i = 0;
//                         len = arrRecords.length;
//                         while (i < len) {
//                             arrCells = arrRecords[i].split('\t');

//                             cell_i = 0;
//                             cell_len = arrCells.length;
//                             while (cell_i < cell_len) {
//                                 arrCells[cell_i] = (
//                                     arrCells[cell_i] === '\\N'
//                                         ? null
//                                         : GS.decodeFromTabDelimited(arrCells[cell_i])
//                                 );
//                                 cell_i += 1;
//                             }

//                             arrTotalRecords.push(arrCells);
//                             i += 1;
//                         }
//                     } else {
//                         element.arrColumns = data.arrColumnNames;

//                         handleData(
//                             element,
//                             {
//                                 "arr_column": data.arrColumnNames,
//                                 "dat": arrTotalRecords,
//                                 "row_count": arrTotalRecords.length
//                             },
//                             '',
//                             'load'
//                         );
//                     }
//                 } else {
//                     GS.webSocketErrorDialog(data);

//                     // trigger after_select_error
//                     triggerAfterSelectError(element);
//                 }
//             }
//         );
//     }



//     // #################################################################
//     // ########################### LIFECYCLE ###########################
//     // #################################################################

//     // dont do anything that modifies the element here
//     function elementCreated(element) {
//         // if "created" hasn't been suspended: run created code
//         if (!element.hasAttribute('suspend-created')) {

//         }
//     }

//     function elementInserted(element) {
//         var firstChildElement;
//         var changeHandler;

//         // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
//         if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
//             if (element.children.length === 0) {
//                 throw 'GS-Form Error: No template provided';
//             }
//             // if this is the first time inserted has been run: continue
//             if (!element.inserted) {
//                 // #############################################################################################
//                 // ###  ######################
//                 // #############################################################################################

//                 element.inserted = true;
//                 element.internal = {};
//                 saveDefaultAttributes(element);

//                 firstChildElement = element.children[0];


//                 // #############################################################################################
//                 // ### PREVENT CHANGES FROM BEING LOST WHEN NAVIGATING AWAY FROM THE PAGE ######################
//                 // #############################################################################################

//                 // if this form has the "save-while-typing" attribute
//                 if (element.hasAttribute('save-while-typing')) {
//                     GS.addBeforeUnloadEvent(function () {
//                         if (
//                             (
//                                 element.bolCurrentlySaving ||
//                                 element.saveTimerID
//                             ) &&
//                             document.body.contains(element)
//                         ) {
//                             return 'The page has not finished saving.';
//                         }
//                     });
//                 } else {
//                     // this prevents the issue where you type in a change but then unload
//                     //      the page without causing a change event to fire, which means you lose your change
//                     GS.addBeforeUnloadEvent(function () {
//                         document.activeElement.blur();
//                     });
//                 }


//                 // #############################################################################################
//                 // ### DEFAULT #################################################################################
//                 // #############################################################################################

//                 // lock attribute and defaulting
//                 element.lockColumn = element.getAttribute('lock') || 'change_stamp';


//                 // #############################################################################################
//                 // ### TEMPLATE SAVING #########################################################################
//                 // #############################################################################################

//                 // if the first child is a template element: save its HTML
//                 if (firstChildElement.nodeName === 'TEMPLATE') {
//                     element.templateHTML = firstChildElement.innerHTML;

//                 // else: save the innerHTML of the form and send a warning
//                 } else {
//                     console.warn(
//                         'Warning: gs-form is now built to use a template element. ' +
//                         'Please use a template element to contain the template for this form. ' + // this warning was added: March 12th 2015
//                         'A fix has been included so that it is not necessary to use the template element, but that code may be removed at a future date.'
//                     );

//                     element.templateHTML = element.innerHTML;
//                 }

//                 // if there is no HTML: throw an error
//                 if (!element.templateHTML.trim()) {
//                     throw 'GS-FORM error: no template HTML.';
//                 }

//                 if (element.templateHTML.indexOf('&gt;') > -1 || element.templateHTML.indexOf('&lt;') > -1) {
//                     console.warn('GS-FORM WARNING: &gt; or &lt; detected in record template, this can have undesired effects on doT.js. Please use gt(x,y), gte(x,y), lt(x,y), or lte(x,y) to silence this warning.');
//                 }

//                 // add a doT.js coded "value" attribute to any element with a "column" attribute but no "value" attribute
//                 element.templateHTML = GS.templateColumnToValue(element.templateHTML);


//                 // #############################################################################################
//                 // ### "QS" ATTRIBUTE ##########################################################################
//                 // #############################################################################################

//                 // handle "qs" attribute
//                 if (
//                     element.getAttribute('qs') ||
//                     element.getAttribute('refresh-on-querystring-values') ||
//                     element.hasAttribute('refresh-on-querystring-change')
//                 ) {
//                     element.popValues = {};
//                     pushReplacePopHandler(element);
//                     window.addEventListener('pushstate', function () {
//                         pushReplacePopHandler(element);
//                     });
//                     window.addEventListener('replacestate', function () {
//                         pushReplacePopHandler(element);
//                     });
//                     window.addEventListener('popstate', function () {
//                         pushReplacePopHandler(element);
//                     });
//                 } else {
//                     getData(element);
//                 }


//                 // #############################################################################################
//                 // ### ARROW FIELD NAVIGATION ##################################################################
//                 // #############################################################################################

//                 element.addEventListener('keydown', function (event) {
//                     var intKeyCode = (event.which || event.keyCode);
//                     var jsnSelection;
//                     var focusToElement;
//                     var i;
//                     var len;
//                     var arrElementsFocusable;
//                     var currentElement;

//                     if (
//                         document.activeElement.nodeName === 'INPUT' ||
//                         document.activeElement.nodeName === 'TEXTAREA'
//                     ) {
//                         jsnSelection = GS.getInputSelection(event.target);
//                     }

//                     if (
//                         // Left arrow
//                         (
//                             intKeyCode === 37 &&
//                             (!jsnSelection || jsnSelection.start === 0)
//                         ) ||
//                         // Right arrow
//                         (
//                             intKeyCode === 39 &&
//                             (!jsnSelection || jsnSelection.end === event.target.value.length)
//                         )
//                     ) {
//                         // Left arrow
//                         if (
//                             intKeyCode === 37 &&
//                             (!jsnSelection || jsnSelection.start === 0)
//                         ) {
//                             arrElementsFocusable = xtag.query(
//                                 document,
//                                 (
//                                     'input:not([disabled]), ' +
//                                     'select:not([disabled]), ' +
//                                     'memo:not([disabled]), ' +
//                                     'button:not([disabled]), ' +
//                                     '[tabindex]:not([disabled]), ' +
//                                     '[column]'
//                                 )
//                             );

//                             i = 0;
//                             len = arrElementsFocusable.length;
//                             while (i < len) {
//                                 currentElement = arrElementsFocusable[i];

//                                 if (
//                                     currentElement === event.target ||
//                                     (
//                                         (
//                                             event.target.nodeName === 'INPUT' ||
//                                             event.target.nodeName === 'TEXTAREA'
//                                         ) &&
//                                         currentElement === event.target.parentNode
//                                     )
//                                 ) {
//                                     if (i === 0) {
//                                         focusToElement = currentElement;
//                                     } else {
//                                         focusToElement = arrElementsFocusable[i - 1];
//                                     }
//                                     break;
//                                 }

//                                 i += 1;
//                             }

//                         // Right arrow
//                         } else if (
//                             intKeyCode === 39 &&
//                             (!jsnSelection || jsnSelection.end === event.target.value.length)
//                         ) {
//                             arrElementsFocusable = xtag.query(
//                                 document,
//                                 (
//                                     'input:not([disabled]), ' +
//                                     'select:not([disabled]), ' +
//                                     'memo:not([disabled]), ' +
//                                     'button:not([disabled]), ' +
//                                     '[tabindex]:not([disabled]), ' +
//                                     '[column]'
//                                 )
//                             );

//                             i = 0;
//                             len = arrElementsFocusable.length;
//                             while (i < len) {
//                                 currentElement = arrElementsFocusable[i];
//                                 if (currentElement === event.target) {
//                                     if (i === len) {
//                                         focusToElement = currentElement;
//                                     } else {
//                                         focusToElement = arrElementsFocusable[i + 1];
//                                     }
//                                     break;
//                                 }

//                                 i += 1;
//                             }
//                         }

//                         if (
//                             focusToElement &&
//                             GS.isElementFocusable(focusToElement)
//                         ) {
//                             event.preventDefault();
//                             focusToElement.focus();

//                             if (
//                                 document.activeElement.nodeName === 'INPUT' ||
//                                 document.activeElement.nodeName === 'TEXTAREA'
//                             ) {
//                                 GS.setInputSelection(document.activeElement, 0, document.activeElement.value.length);
//                             }
//                         }
//                     }
//                 });

//                 // bind save code
//                 if (element.hasAttribute('save-while-typing')) {
//                     element.bolCurrentlySaving = false;
//                     element.jsnUpdate = {};
//                     element.state = 'saved';
//                     //element.currentSaveAjax = false;

//                     // possible states:
//                     //      'saved'
//                     //      'waiting to save'
//                     //      'saving'

//                     // JSON object for holding columns to update
//                     // on keydown, keyup, change add to JSON object
//                     // keep updating until all columns have been saved (undefined marks an empty column)

//                     changeHandler = function (event) {
//                         var newValue;
//                         var targetColumnParent = GS.findParentElement(event.target, '[column]');
//                         var parentRecordElement;
//                         var strID;

//                         if (
//                             targetColumnParent.getAttribute('column') &&
//                             columnParentsUntilForm(element, targetColumnParent) === 0 &&
//                             element.column(targetColumnParent.getAttribute('column')) !== targetColumnParent.value
//                         ) {
//                             //event.stopPropagation();
//                             if (element.saveTimerID) {
//                                 clearTimeout(element.saveTimerID);
//                                 element.saveTimerID = null;
//                             }

//                             addMessage(element, 'waiting');
//                             element.state = 'waiting to save';

//                             if (targetColumnParent.value !== null) {
//                                 newValue = targetColumnParent.value;
//                             } else {
//                                 newValue = targetColumnParent.checked;
//                             }

//                             parentRecordElement = GS.findParentElement(targetColumnParent, '.form-record[data-pk]');
//                             strID = parentRecordElement.getAttribute('data-pk');

//                             if (!element.jsnUpdate[strID]) {
//                                 element.jsnUpdate[strID] = {};
//                             }
//                             element.jsnUpdate[strID][targetColumnParent.getAttribute('column')] = newValue;

//                             element.saveTimerID = setTimeout(function () {
//                                 updateDataWithoutTemplate(element);
//                                 element.saveTimerID = null;
//                             }, 300);
//                         }
//                     };

//                     element.addEventListener('keydown', changeHandler);
//                     element.addEventListener('keyup', changeHandler);
//                     element.addEventListener('change', changeHandler);

//                 } else {
//                     element.addEventListener('change', function (event) {
//                         var newValue;

//                         if (
//                             event.target.getAttribute('column') &&
//                             columnParentsUntilForm(element, event.target) === 0 &&
//                             GS.findParentTag(event.target, 'gs-form') === element
//                         ) {
//                             //event.stopPropagation();

//                             if (event.target.value !== null) {
//                                 newValue = event.target.value;
//                             } else {
//                                 newValue = event.target.checked;
//                             }

//                             updateData(element, event.target, event.target.getAttribute('column'), newValue);
//                         }
//                     });
//                 }
//             }
//         }
//     }

//     xtag.register('gs-form', {
//         lifecycle: {
//             created: function () {
//                 elementCreated(this);
//             },
//             inserted: function () {
//                 elementInserted(this);
//             },

//             attributeChanged: function (strAttrName, ignore, newValue) {//oldValue
//                 // if "suspend-created" has been removed: run created and inserted code
//                 if (strAttrName === 'suspend-created' && newValue === null) {
//                     elementCreated(this);
//                     elementInserted(this);

//                 // if "suspend-inserted" has been removed: run inserted code
//                 } else if (strAttrName === 'suspend-inserted' && newValue === null) {
//                     elementInserted(this);

//                 } else if (!this.hasAttribute('suspend-created') && !this.hasAttribute('suspend-inserted')) {
//                     // attribute code
//                 }
//             },

//             removed: function () {
//                 if (this.hasAttribute('save-while-typing') && this.saveTimerID) {
//                     clearTimeout(this.saveTimerID);
//                     emergencyUpdate(this);
//                 }
//             }
//         },
//         events: {},
//         accessors: {},
//         methods: {
//             refresh: function () {
//                 getData(this);
//             },

//             save: function () {
//                 updateDataWithoutTemplate(this, false);
//             },

//             column: function (strColumn) {
//                 return GS.envGetCell(this.lastSuccessData, 0, strColumn);
//             },

//             addMessage: function (strMessageName) {
//                 return addMessage(this, strMessageName);
//             },

//             removeMessage: function (strMessageName) {
//                 return removeMessage(this, strMessageName);
//             }
//         }
//     });
// });