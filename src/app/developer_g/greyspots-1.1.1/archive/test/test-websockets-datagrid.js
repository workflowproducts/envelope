/* request samples
##############################################################
########################### SELECT ###########################
##############################################################

SELECT	public	cust
RETURN	id	email	cust_id	binary_data	change_stamp	test\ttest

where	order by	limit	offset
id=303	id ASC	500	0

##############################################################
########################### INSERT ###########################
##############################################################

INSERT	public	cust
RETURN	id	email	cust_id	binary_data	change_stamp	test\ttest

email	cust_id
asdf	1
fads	2
ewer	3

##############################################################
########################### UPDATE ###########################
##############################################################

UPDATE	public	cust
RETURN	id	email	cust_id	binary_data	change_stamp	test\ttest

pk	lock	set	set
id	change_stamp	email	cust_id
333	5-15-15	asdf	1
333	5-15-15	fads	2
333	5-15-15	ewer	3

##############################################################
########################### DELETE ###########################
##############################################################

DELETE	public	cust

pk	lock
id	change_stamp
333	5-15-15
333	5-15-15
333	5-15-15
*/

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    
    // ########################################################################################## //
    // ######################################### SELECT ######################################### //
    // ########################################################################################## //
    
    function getData(element, bolTestFirst) {
        var arrKeywords, arrValues, endSelectFunction;
        
        endSelectFunction = function () {
            var bolFirst = true;
            
            GS.addLoader(element, 'Loading...<gs-button onclick="GS.rebootSocket(GS.envSocket); GS.removeLoader(element);" no-focus>Stop</gs-button>');
            GS.requestFromSocket(
                    GS.envSocket,
                    'SELECT\t' + encodeForTabDelimited(element.getAttribute('schema')) + '\t' +
                                 encodeForTabDelimited(element.getAttribute('object')) + '\n' +
                        'RETURN\t' + getReturn(element) + '\n\n' +
                        'WHERE\t' +
                        (element.getAttribute('ord') ? 'ORDER BY\t' : '') +
                        'LIMIT\t' +
                        'OFFSET\n' +
                        (encodeForTabDelimited(element.getAttribute('where') || 'TRUE')) + '\t' +
                        (element.getAttribute('ord') ? (encodeForTabDelimited(element.getAttribute('ord'))) + '\t' : '') +
                        (encodeForTabDelimited(element.getAttribute('limit') || 'ALL')) + '\t' +
                        (encodeForTabDelimited(element.getAttribute('offset') || '0')),
                    function (data, error, errorData) {
                //console.log(data);
                if (data === '\\.') {
                    //console.log(data);
                    GS.removeLoader(element);
                }
                
                if (!error) {
                    handleData(element, data, bolFirst);
                    bolFirst = false;
                } else {
                    element.innerHTML = '<center><h2>Couldn\'t Load Data.</h2></center>';
                    
                    GS.webSocketErrorDialog(errorData);
                }
            });
        };
        
        //console.log(bolTestFirst);
        
        if (bolTestFirst) {
            GS.addLoader(element, 'Loading...');
            GS.requestFromSocket(
                    GS.envSocket,
                    'SELECT\t' + encodeForTabDelimited(element.getAttribute('schema')) + '\t' +
                                 encodeForTabDelimited(element.getAttribute('object')) + '\n' +
                        'RETURN\t' + getReturn(element) + '\n\n' +
                        'WHERE\t' +
                        (element.getAttribute('ord') ? 'ORDER BY\t' : '') +
                        'LIMIT\t' +
                        'OFFSET\n' +
                        (encodeForTabDelimited(element.getAttribute('where') || 'TRUE')) + '\t' +
                        (element.getAttribute('ord') ? (encodeForTabDelimited(element.getAttribute('ord'))) + '\t' : '') +
                        encodeForTabDelimited('1') + '\t' + encodeForTabDelimited('0'),
                    function (data, error, errorData) {
                GS.removeLoader(element);
                
                if (!error) {
                    endSelectFunction();
                } else {
                    GS.webSocketErrorDialog(errorData);
                }
            });
        } else {
            endSelectFunction();
        }
        
        //var data = 'id\temail\tcust_id\n' +
        //           'integer\ttext\tinteger\n' +
        //           '89400\tjoseph@wfprod.com\t16\n' +
        //           '80425\tmichael@tocci.org\t16\n' +
        //           '80416\tmichael@tocci.org\t16\n' +
        //           '80387\tmichael@tocci.org\t16\n' +
        //           '80388\tmichael@tocci.org\t16\n' +
        //           '80386\tjustin@tocci.org\t23\n' +
        //           '80392\tjustin@tocci.org\t15\n' +
        //           '80397\tjustin@tocci.org\t23\n' +
        //           '78741\tjustin@tocci.org\t23\n' +
        //           '78742\tjoseph@wfprod.com\t16\n';
        //
        //console.log(data);
        //handleData(element, data);
    }
    
    function handleData(element, data, bolFirst) {
        var i, len, col_i, col_len, arrRecords, arrRecord, arrColumns, arrColumnTypes, strRecords,
            strHeader, selectRecordHTML, insertRecordHTML, strHTML, intAddToRecordNumber, tbodyElement,
            arrElements;
        
        // if last character is a \n: remove it
        if (data[data.length - 1] === '\n') {
            data = data.substring(0, data.length - 1);
        }
        
        //// save the data for reference
        //element.dataStore = data;
        
        // split records
        arrRecords = data.split('\n');
        //console.log(arrRecords);
        
        // if this is the first part of the response: set up toolbar, header record and insert record
        if (bolFirst) {
            // seperate first record (for column names)
            arrColumns = arrRecords[0].split('\t');
            arrRecords.splice(0, 1);
            
            // if there is no user columnn list ready: create it
            if (!element.arrUserColumnList) {
                element.arrUserColumnList = arrColumns.slice(0);
            }
            
            // seperate second record (for column types)
            arrColumnTypes = arrRecords[0].split('\t');
            arrRecords.splice(0, 1);
            
            // save column list and column types so that other operations can use it
            element.arrColumns = arrColumns;
            element.arrColumnTypes = arrColumnTypes;
            
            // get primary key and lock column lists
            element.arrPk = [];//'id'];
            element.arrLock = [];//'change_stamp']; //'id', 'email', 'cust_id', 'binary_data', 'change_stamp', 'test\\ttest'];
            
            if (element.getAttribute('pk')) {
                element.arrPk = element.getAttribute('pk').split(/[\s]*,[\s]*/);
            }
            
            if (element.getAttribute('lock')) {
                element.arrLock = element.getAttribute('lock').split(/[\s]*,[\s]*/);
            }
            
            // if pk is empty or lock is empty: lock on all columns
            if (element.arrPk.length === 0 || element.arrLock.length === 0) {
                element.arrLock = element.arrColumns.slice(0);
            }
            
            //console.log(element.arrPk, element.arrLock);
            
            // template and append toolbar, header record and insert record
            for (i = 0, len = arrColumns.length, strHeader = '', insertRecordHTML = ''; i < len; i += 1) {
                strHeader += '<th>' +
                                encodeHTML(decodeFromTabDelimited(arrColumns[i])) + '<br />' +
                                '<b class="small">' + encodeHTML(arrColumnTypes[i]) + '</b>' +
                            '</th>';
                
                insertRecordHTML +=
                    '<td>' +
                        '<textarea class="insert-control" column="' + encodeHTML(arrColumns[i]) + '"' +
                                ' rows="1" placeholder="*' + encodeHTML(arrColumns[i]) + '">' +
                        '</textarea>' +
                    '</td>';
            }
            
            strHeader = '<th style="width: ' + (GS.pxToEm(element,
                                                    GS.getTextWidth(element, String(arrRecords.length + 1))
                                                ) + 1) + 'em;">#</th>' +
                        strHeader;
            
            insertRecordHTML = '<th>&gt;</th>' + insertRecordHTML;
            
            strHTML = 
                    '<div class="toolbar">' +
                        '<div flex-horizontal class="sync-target">' +
                            '<gs-button icononly inline icon="refresh" no-focus></gs-button>' +
                            '<gs-button icononly inline icon="times" no-focus disabled></gs-button>' +
                            '<span flex></span>' +
                            '<gs-button class="button-column-list" icononly inline icon="cog" no-focus></gs-button>' +
                        '</div>' +
                        '<gs-grid class="clauses" min-width="all{reflow}; 750px{2,2,1};">' +
                            '<gs-block>' +
                                '<textarea class="where-control" ' + (evt.touchDevice ? 'rows="1"' : 'style="height: 3.79em;"') +
                                                ' placeholder="WHERE">' +
                                    (element.getAttribute('where') || '') +
                                '</textarea>' +
                            '</gs-block>' +
                            '<gs-block>' +
                                '<textarea class="ord-control" ' + (evt.touchDevice ? 'rows="1"' : 'style="height: 3.79em;"') +
                                                ' placeholder="ORDER BY">' +
                                    (element.getAttribute('ord') || '') +
                                '</textarea>' +
                            '</gs-block>' +
                            '<gs-block>' +
                                '<gs-grid min-width="all{1,1}; 750px{reflow};">' +
                                    '<gs-block>' +
                                        '<textarea class="limit-control" rows="1" placeholder="LIMIT" ' +
                                                        (evt.touchDevice ? '' : 'style="margin-bottom: 0.25em;"') + '>' +
                                            (element.getAttribute('limit') || '') +
                                        '</textarea>' +
                                    '</gs-block>' +
                                    '<gs-block>' +
                                        '<textarea class="offset-control" rows="1" placeholder="OFFSET">' +
                                            (element.getAttribute('offset') || '') +
                                        '</textarea>' +
                                    '</gs-block>' +
                                '</gs-grid>' +
                            '</gs-block>' +
                        '</gs-grid>' +
                    '</div>' +
                    '<textarea class="hidden-focus-control">Focus Control</textarea>' +
                    '<div class="table-container">' +
                        '<table>' +
                            '<thead><tr>' + strHeader + '</tr></thead>' +
                            '<tbody>' +
                                '<tr class="insert-record">' + insertRecordHTML + '</tr>'
                            '</tbody>' +
                        '</table>' +
                    '</div>';
            
            // remove all children from the element except for the loader
            arrElements = xtag.toArray(element.children);
            for (i = 0, len = arrElements.length; i < len; i += 1) {
                if (arrElements[i].nodeName !== 'GS-LOADER') {
                    element.removeChild(arrElements[i]);
                }
            }
            
            // append the root
            element.root = document.createElement('div');
            element.root.classList.add('root');
            element.appendChild(element.root);
            
            // fill the root
            element.root.innerHTML = strHTML;
            
            // gather variables for elements
            element.toolbar = element.root.children[0];
            element.hiddenFocusElement = element.root.children[1];
            element.tableContainer = element.root.children[2];
            
            element.tableTbody = element.tableContainer.children[0].children[1];
            element.tableInsertRecord = element.tableTbody.children[0];
            
            element.refreshButton = element.toolbar.children[0].children[0];
            element.deleteButton = element.toolbar.children[0].children[1];
            
            element.whereControl   = xtag.query(element.toolbar, '.where-control')[0];
            element.ordControl     = xtag.query(element.toolbar, '.ord-control')[0];
            element.limitControl   = xtag.query(element.toolbar, '.limit-control')[0];
            element.offsetControl  = xtag.query(element.toolbar, '.offset-control')[0];
            
            element.columnButton   = xtag.query(element.toolbar, '.button-column-list')[0];
            
            //console.log(element.refreshButton, element.deleteButton, element.undoButton, element.redoButton);
            
            // synchronize selection
            synchronize(element, true);
            
            //
            element.root.style.paddingTop = (GS.pxToEm(element, element.toolbar.offsetHeight) + 0.25) + 'em';
            
            
            // ###############################
            // ########### TOOLBAR ###########
            // ###############################
            
            // refresh button
            element.refreshButton.addEventListener('click', function (event) {
                getData(element);
            });
            
            // delete button
            element.deleteButton.addEventListener('click', function (event) {
                deleteSelected(element);
            });
            
            // column button
            element.columnButton.addEventListener('click', function (event) {
                //console.log('4***');
                //alert('test');
                columnPopup(element);
            });
            
            // clause controls
            element.whereControl.addEventListener('change', function (event) {
                element.setAttribute('where', this.value);
                getData(element, true);
            });
            
            element.whereControl.addEventListener('keydown', function (event) {
                if ((event.keyCode || event.which) === 13) {
                    this.blur();
                    event.preventDefault();
                }
            });
            
            
            element.ordControl.addEventListener('change', function (event) {
                element.setAttribute('ord', this.value);
                getData(element, true);
            });
            
            element.ordControl.addEventListener('keydown', function (event) {
                if ((event.keyCode || event.which) === 13) {
                    this.blur();
                    event.preventDefault();
                }
            });
            
            
            element.limitControl.addEventListener('change', function (event) {
                element.setAttribute('limit', this.value);
                getData(element);
            });
            
            element.limitControl.addEventListener('keydown', function (event) {
                var intKeyCode = (event.keyCode || event.which), bolGoodKey = false;
                
                if (intKeyCode === 13) {
                    this.blur();
                }
                
                if ((intKeyCode >= 96 && intKeyCode <= 105) || // numpad numbers
                    (intKeyCode >= 48 && intKeyCode <= 57) || // other numbers
                    intKeyCode === 8 || intKeyCode === 46 || // delete
                    (intKeyCode >= 37 && intKeyCode <= 40) || // arrows
                    event.shiftKey || event.ctrlKey || event.metaKey) { // shift, control, command
                    bolGoodKey = true;
                }
                
                if (bolGoodKey === false) {
                    event.preventDefault();
                }
            });
            
            
            element.offsetControl.addEventListener('change', function (event) {
                element.setAttribute('offset', this.value);
                getData(element);
            });
            
            element.offsetControl.addEventListener('keydown', function (event) {
                var intKeyCode = (event.keyCode || event.which), bolGoodKey = false;
                
                if (intKeyCode === 13) {
                    this.blur();
                }
                
                if ((intKeyCode >= 96 && intKeyCode <= 105) || // numpad numbers
                    (intKeyCode >= 48 && intKeyCode <= 57) || // other numbers
                    intKeyCode === 8 || intKeyCode === 46 || // delete
                    (intKeyCode >= 37 && intKeyCode <= 40) || // arrows
                    event.shiftKey || event.ctrlKey || event.metaKey) { // shift, control, command
                    bolGoodKey = true;
                }
                
                if (bolGoodKey === false) {
                    event.preventDefault();
                }
            });
            
            // ############################
            // ########### COPY ###########
            // ############################
            
            if (!evt.touchDevice) {
                element.hiddenFocusElement.addEventListener('focus', function (event) {
                    this.value = 'Focus Control';
                    GS.setInputSelection(this, 0, this.value.length);
                    //console.log('1*** focus');
                });
                
                // selection copy
                element.hiddenFocusElement.addEventListener('copy', function (event) {
                    var strTextCopyString, strHTMLCopyString;
                    
                    //console.log('2*** copy');
                    
                    if (document.activeElement.classList.contains('hidden-focus-control') ||
                        document.activeElement.selectionStart === document.activeElement.selectionEnd) {
                        
                        GS.setInputSelection(document.activeElement, document.activeElement.value.length,
                                                    document.activeElement.value.length);
                        
                        strTextCopyString = getSelectedCopyText(element);
                        strHTMLCopyString = getSelectedCopyHTML(element);
                        
                        //console.log(strTextCopyString);
                        //console.log(strHTMLCopyString);
                        
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
            }
            
            // #####################################################
            // ########### SCROLL REMOVE FLOATING BUTTON ###########
            // #####################################################
            
            element.tableContainer.addEventListener('scroll', function (event) {
                if (element.cellFloatingButtonContainer && element.cellFloatingButtonContainer.parentNode) {
                    element.cellFloatingButtonContainer.parentNode.removeChild(element.cellFloatingButtonContainer);
                    element.cellFloatingButtonContainer = null;
                }
                
                //if (element.rangeFloatingButtonContainer && element.rangeFloatingButtonContainer.parentNode) {
                //    element.rangeFloatingButtonContainer.parentNode.removeChild(element.rangeFloatingButtonContainer);
                //    element.rangeFloatingButtonContainer = null;
                //}
            });
            
            
            // #####################################################
            // ############## PASTE (INSERT & UPDATE) ##############
            // #####################################################
            if (!evt.touchDevice) {
                // update and insert paste
                element.hiddenFocusElement.addEventListener('paste', function (event) {
                    pasteHandler(element, event);
                });
            }
            
        // else: template and add records
        } else if (arrRecords[0] !== '\\.') {
            intAddToRecordNumber = element.tableTbody.children.length;
            
            // build json object
            for (i = 0, len = arrRecords.length; i < len; i += 1) {
                arrRecord = arrRecords[i].split('\t');
                
                arrRecords[i] = {};
                arrRecords[i].grid_record_number = i + intAddToRecordNumber;
                
                for (col_i = 0, col_len = arrRecord.length; col_i < col_len; col_i += 1) {
                    arrRecords[i][element.arrColumns[col_i]] = decodeFromTabDelimited(arrRecord[col_i]);
                }
            }
            
            // build select contents
            for (i = 0, len = element.arrColumns.length, selectRecordHTML = ''; i < len; i += 1) {
                selectRecordHTML +=
                    '<td>' +
                        '<textarea column="' + encodeHTML(element.arrColumns[i]) + '" rows="1">' +
                            '{{! row[\'' + element.arrColumns[i].replace(/\'/gim, '\\\'') + '\'] }}' +
                        '</textarea>' +
                    '</td>';
            }
            
            selectRecordHTML = '<th>{{! row.grid_record_number }}</th>' + selectRecordHTML;
            
            // build tbody contents
            strRecords = doT.template(
                                '{{ var row, i, len, qs = GS.qryToJSON(GS.getQueryString());\n' +
                                '\n' +
                                'for (i = 0, len = jo.length; i < len; i += 1) {\n' +
                                '    row = jo[i]; }}\n' +
                                '    <tr>' + selectRecordHTML + '</tr>\n' +
                                '{{ } }}')(arrRecords);
            
            //console.log(strRecords);
            
            // create virtual tbody, put templated records inside it, transfer records to actual tbody
            tbodyElement = document.createElement('tbody');
            
            tbodyElement.innerHTML = strRecords;
            
            for (i = 0, len = tbodyElement.children.length; i < len; i += 1) {
                element.tableTbody.insertBefore(tbodyElement.children[0], element.tableInsertRecord);
            }
        }
    }
    
    // ########################################################################################## //
    // ######################################### INSERT ######################################### //
    // ########################################################################################## //
    
    function templateRecordsForInsert(element, data, attributeAddin) {
        var i, len, col_i, col_len, arrRecords, arrRecord, arrColumns,
            arrColumnTypes, selectRecordHTML, intRowNumberAdd;
        
        // if last character is a \n: remove it
        len = data.length;
        if (data[len - 1] === '\n') {
            data = data.substring(0, len - 1);
        }
        
        // split records
        arrRecords = data.split('\n');
        
        // seperate first record (for column names)
        arrColumns = arrRecords[0].split('\t');
        arrRecords.splice(0, 1);
        
        // calculate how much to add to the row numbers
        intRowNumberAdd = xtag.query(element, 'tr:not(.insert-record):not(.insert-temporary)').length;
        
        // build json objects
        for (i = 0, len = arrRecords.length; i < len; i += 1) {
            arrRecord = arrRecords[i].split('\t');
            
            arrRecords[i] = {};
            arrRecords[i].grid_record_number = i + intRowNumberAdd;
            
            for (col_i = 0, col_len = arrRecord.length; col_i < col_len; col_i += 1) {
                arrRecords[i][arrColumns[col_i]] = decodeFromTabDelimited(arrRecord[col_i]);
            }
            //console.log(arrRecords);
        }
        
        // build record template
        for (i = 0, len = arrColumns.length, selectRecordHTML = ''; i < len; i += 1) {
            selectRecordHTML +=
                '<td>' +
                    '<textarea column="' + encodeHTML(arrColumns[i]) + '" rows="1">' +
                        '{{! row[\'' + arrColumns[i].replace(/\'/gim, '\\\'') + '\'] }}' +
                    '</textarea>' +
                '</td>';
        }
        
        selectRecordHTML = '<th>{{! row.grid_record_number }}</th>' + selectRecordHTML;
        
        //console.log(selectRecordHTML);
        
        // build tbody contents
        selectRecordHTML = doT.template(
                            '{{ var row, i, len, qs = GS.qryToJSON(GS.getQueryString());\n' +
                            '\n' +
                            'for (i = 0, len = jo.length; i < len; i += 1) {\n' +
                            '    row = jo[i]; }}\n' +
                            '    <tr ' + (attributeAddin || '') + '>' + selectRecordHTML + '</tr>\n' +
                            '{{ } }}')(arrRecords);
        
        //console.log(selectRecordHTML);
        
        return selectRecordHTML;
    }
    
    // ########################################################################################## //
    // ######################################### UPDATE ######################################### //
    // ########################################################################################## //
    
    function refreshRecordsAfterUpdate(element, arrRecordsToUpdate, data, targetClass, classToAdd) {
        var arrColumns, arrRecords, arrValues, arrElements, arrColumnTypes,
            row, i, len, record_i, record_len, col_i, col_len;
        
        // if last character is a \n: remove it
        if (data[data.length - 1] === '\n') {
            data = data.substring(0, data.length - 1);
        }
        
        // split records
        arrRecords = data.split('\n');
        
        // seperate first record (for column names)
        arrColumns = arrRecords[0].split('\t');
        arrRecords.splice(0, 1);
        
        //// seperate second record (for column types)
        //arrColumnTypes = arrRecords[0].split('\t');
        //arrRecords.splice(0, 1);
        
        // loop through each record
        len = arrRecordsToUpdate.length;
        record_len = arrRecords.length;
        i = 0;
        record_i = 0;
        while (i < len && record_i < record_len) {
            //console.log(arrRecordsToUpdate[i], targetClass);
            if ((arrRecordsToUpdate[i].classList.contains(targetClass) || !targetClass) && arrRecords[record_i]) {
                // build json row
                arrValues = arrRecords[record_i].split('\t');
                row = {};
                for (col_i = 0, col_len = arrValues.length; col_i < col_len; col_i += 1) {
                    row[arrColumns[col_i]] = decodeFromTabDelimited(arrValues[col_i]);
                }
                
                //console.log(row);
                
                // if there is a targetClass
                if (targetClass) {
                    arrRecordsToUpdate[i].classList.remove(targetClass);
                }
                
                // if there is a class to add
                if (classToAdd) {
                    arrRecordsToUpdate[i].classList.add(classToAdd);
                }
                
                // loop through controls and full
                arrElements = xtag.query(arrRecordsToUpdate[i], '[column]');
                //console.log(arrValues.length, arrValues);
                //console.log(arrElements.length, arrElements);
                for (col_i = 0, col_len = arrValues.length; col_i < col_len; col_i += 1) {
                    arrElements[col_i].value = row[arrElements[col_i].getAttribute('column')];
                }
                
                record_i += 1;
            }
            i += 1;
        }
        console.log(i, len, record_i, record_len);
        
        //// loop through each record
        //for (i = 0, len = arrRecordsToUpdate.length; i < len; i += 1) {
        //    // build json row
        //    arrValues = arrRecords[i].split('\t');
        //    row = {};
        //    for (col_i = 0, col_len = arrValues.length; col_i < col_len; col_i += 1) {
        //        row[arrColumns[col_i]] = decodeFromTabDelimited(arrValues[col_i]);
        //    }
        //    
        //    // if there is a class to add
        //    if (classToAdd) {
        //        arrRecordsToUpdate[i].classList.add(classToAdd);
        //    }
        //    
        //    // loop through controls and full
        //    arrElements = xtag.query(arrRecordsToUpdate[i], '[column]');
        //    //console.log(arrValues.length, arrValues);
        //    //console.log(arrElements.length, arrElements);
        //    for (col_i = 0, col_len = arrValues.length; col_i < col_len; col_i += 1) {
        //        arrElements[col_i].value = row[arrElements[col_i].getAttribute('column')];
        //    }
        //}
        
        //console.log(arrRecords, data);
    }
    
    // ########################################################################################## //
    // ######################################### DELETE ######################################### //
    // ########################################################################################## //
    
    function deleteSelected(element) {
        var strCurrentRecord, arrRecords, i, len, col_i, col_len, bolDelete = true,
            strRoles = '', strColumns = '', strTypes = '', strValues = '', arrColumns = [];
        
        arrRecords = element.selectedRecords;
        
        for (i = 0, len = arrRecords.length; i < len; i += 1) {
            if (!arrRecords[i].children[0].hasAttribute('selected')) {
                bolDelete = false;
                break;
            }
        }
        
        //console.log(arrRecords[0]);
        
        if (arrRecords.length === 0 || arrRecords[0].classList.contains('insert-record')) {
            bolDelete = false;
        }
        
        if (bolDelete) {
            for (i = 0, len = element.arrPk.length; i < len; i += 1) {
                strRoles   += (strRoles   ? '\t' : '') + 'pk';
                strColumns += (strColumns ? '\t' : '') + element.arrPk[i];
                //strTypes   += (strTypes   ? '\t' : '') + element.arrColumnTypes[element.arrColumns.indexOf(element.arrPk[i])];
                arrColumns.push(element.arrPk[i]);
            }
            
            for (i = 0, len = element.arrLock.length; i < len; i += 1) {
                strRoles   += (strRoles   ? '\t' : '') + 'lock';
                strColumns += (strColumns ? '\t' : '') + element.arrLock[i];
                //strTypes   += (strTypes   ? '\t' : '') + element.arrColumnTypes[element.arrColumns.indexOf(element.arrLock[i])];
                arrColumns.push(element.arrLock[i]);
            }
            
            for (i = 0, len = arrRecords.length; i < len; i += 1) {
                if (!arrRecords[i].classList.contains('insert-record') &&
                    arrRecords[i].parentNode.nodeName !== 'THEAD') {
                    strCurrentRecord = '';
                    
                    arrRecords[i].classList.add('bg-red');
                    
                    for (col_i = 0, col_len = arrColumns.length; col_i < col_len; col_i += 1) {
                        strCurrentRecord += 
                                (strCurrentRecord ? '\t' : '') +
                                encodeForTabDelimited(
                                    xtag.query(arrRecords[i], '[column="' +
                                            encodeForTabDelimited(arrColumns[col_i]) + '"]')[0].value
                                );
                    }
                    
                    strCurrentRecord += '\n';
                    strValues += strCurrentRecord;
                }
            }
            
            //console.log(strRoles);
            //console.log(strColumns);
            //console.log(strValues);
            //console.log(arrColumns);
            
            GS.addLoader(element, 'Creating Delete Transaction...');
            GS.requestFromSocket(GS.envSocket, 'BEGIN', function (data, error, errorData) {
                var transactionID;
                GS.removeLoader(element);
                
                if (!error) {
                    transactionID = parseInt(data.substring('transactionid = '.length, data.indexOf('\n')));
                    GS.addLoader(element, 'Creating Delete Transaction...');
                    
                    GS.requestFromSocket(GS.envSocket,
                                        'transactionid = ' + transactionID + '\n' +
                                        'DELETE\t' + encodeForTabDelimited(element.getAttribute('schema')) + '\t' +
                                                     encodeForTabDelimited(element.getAttribute('object')) + '\n\n' +
                                           strRoles + '\n' + strColumns + '\n' + strValues,
                                        function (data, error, errorData) {
                        var transactionID, arrElements, i, len;
                        
                        GS.removeLoader(element);
                        
                        if (!error) {
                            transactionID = parseInt(data.substring('transactionid = '.length, data.indexOf('\n')));
                            arrElements = xtag.query(element, '.bg-red');
                            
                            for (i = 0, len = arrElements.length; i < len; i += 1) {
                                arrElements[i].classList.remove('bg-red');
                                arrElements[i].classList.add('bg-amber');
                            }
                            GS.msgbox('Are you sure...',
                                      'Are you sure you want to delete?',
                                      ['No', 'Yes'],
                                      function (strAnswer) {
                                
                                GS.addLoader(element, (strAnswer === 'Yes' ? 'Commiting' : 'Rolling Back') + ' Delete Transaction...');
                                GS.requestFromSocket(GS.envSocket,
                                                    'transactionid = ' + transactionID + '\n' +
                                                        (strAnswer === 'Yes' ? 'COMMIT' : 'ROLLBACK'),
                                                    function (data, error, errorData) {
                                    var arrElements, i, len;
                                    
                                    GS.removeLoader(element);
                                    
                                    if (!error) {
                                        arrElements = xtag.query(element, '.bg-amber');
                                        
                                        if (strAnswer === 'Yes') {
                                            for (i = 0, len = arrElements.length; i < len; i += 1) {
                                                arrElements[i].parentNode.removeChild(arrElements[i]);
                                            }
                                            clearSelection(element);
                                        } else {
                                            for (i = 0, len = arrElements.length; i < len; i += 1) {
                                                arrElements[i].classList.remove('bg-amber');
                                            }
                                        }
                                        
                                        // fix record selector numbers
                                        arrElements = xtag.query(element, 'tbody > tr');
                                        
                                        for (i = 0, len = arrElements.length; i < len; i += 1) {
                                            if (!arrElements[i].classList.contains('insert-record')) {
                                                arrElements[i].children[0].textContent = (i + 1);
                                            }
                                        }
                                        
                                    } else {
                                        GS.webSocketErrorDialog(errorData);
                                    }
                                });
                            });
                        } else {
                            arrElements = xtag.query(element, '.bg-red');
                            
                            for (i = 0, len = arrElements.length; i < len; i += 1) {
                                arrElements[i].classList.remove('bg-red');
                            }
                            
                            GS.webSocketErrorDialog(errorData);
                        }
                    });
                    
                } else {
                    GS.webSocketErrorDialog(errorData);
                }
            });
        }
    }
    
    // ########################################################################################## //
    // ###################################### COPY / PASTE ###################################### //
    // ########################################################################################## //
    
    function getSelectedCopyHTML(element) {
        var strHTMLCopyString, intFromRecord = 9999999, intFromCell = 9999999, intToRecord = 0,
            intToCell = 0, i, len, cell_i, cell_len, arrSelected, strCellHTML, arrRecords, arrCells,
            strHTMLRecordString;
        
        arrSelected = element.selectedCells;
        
        // loop through the selected cells and create a tsv string using the text of the cell
        if (arrSelected.length > 0) {
            for (i = 0, len = arrSelected.length; i < len; i += 1) {
                if (arrSelected[i].parentNode.rowIndex < intFromRecord) {
                    intFromRecord = arrSelected[i].parentNode.rowIndex;
                }
                if (arrSelected[i].cellIndex < intFromCell) {
                    intFromCell = arrSelected[i].cellIndex;
                    if (intFromCell === 0) {
                        intFromCell = 1;
                    }
                }
                if (arrSelected[i].parentNode.rowIndex + 1 > intToRecord) {
                    intToRecord = arrSelected[i].parentNode.rowIndex + 1;
                }
                if (arrSelected[i].cellIndex + 1 > intToCell) {
                    intToCell = arrSelected[i].cellIndex + 1;
                }
            }
            
            arrRecords = xtag.query(element, 'tr');
            strHTMLCopyString = '';
            
            for (i = intFromRecord, len = intToRecord; i < len; i += 1) {
                arrCells = arrRecords[i].children;
                strHTMLRecordString = '';
                
                for (cell_i = intFromCell, cell_len = intToCell; cell_i < cell_len; cell_i += 1) {
                    if (!arrCells[cell_i].parentNode.classList.contains('insert-record')) {
                        if (arrCells[cell_i].hasAttribute('selected')) {
                            if (arrCells[cell_i].children[0] && arrCells[cell_i].children[0].nodeName === 'TEXTAREA') { 
                                strCellHTML = '<td rowspan="1" colspan="1">' +
                                                    encodeHTML(arrCells[cell_i].lastElementChild.value)
                                                        .replace(/\n/gim, '<br />') +
                                              '</td>';
                                
                            } else if (arrCells[cell_i].children[0] && arrCells[cell_i].children[0].nodeName === 'BR') {
                                strCellHTML = '<td rowspan="1" colspan="1">' +
                                                    encodeHTML(arrCells[cell_i].childNodes[0].textContent) +
                                              '</td>';
                                
                            } else {
                                strCellHTML = '<td rowspan="1" colspan="1">' +
                                                    encodeHTML(arrCells[cell_i].textContent) +
                                              '</td>';
                            }
                            // <pre></pre>
                        } else {
                            strCellHTML = '<td rowspan="1" colspan="1"></td>';
                        }
                        
                        strHTMLRecordString += (cell_i === intFromCell ? '<tr>' : '');
                        strHTMLRecordString += (strCellHTML || '');
                        strHTMLRecordString += (cell_i === (intToCell - 1) ? '</tr>' : '');
                    }
                }
                if (strHTMLRecordString.trim()) {
                    strHTMLCopyString += strHTMLRecordString;
                }
            }
            
            if (strHTMLCopyString) {
                strHTMLCopyString = '<style>' +
                                        'br { mso-data-placement:same-cell; }' +
                                        'th, td { white-space: pre-wrap; }' +
                                    '</style>' +
                                    '<table border="0" cellpadding="0" cellspacing="0">' + strHTMLCopyString + '</table>';
            }
        }
        
        //console.log(strHTMLCopyString);
        
        return strHTMLCopyString || '';
    }
    
    function getSelectedCopyText(element) {
        var strTextCopyString, intFromRecord = 9999999, intFromCell = 9999999, intToRecord = 0, intToCell = 0,
            i, len, cell_i, cell_len, arrSelected, strCellText, arrRecords, arrCells, strTextRecordString;
        
        arrSelected = element.selectedCells;
        
        // loop through the selected cells and create a tsv string using the text of the cell
        if (arrSelected.length > 0) {
            for (i = 0, len = arrSelected.length; i < len; i += 1) {
                if (arrSelected[i].parentNode.rowIndex < intFromRecord) {
                    intFromRecord = arrSelected[i].parentNode.rowIndex;
                }
                if (arrSelected[i].cellIndex < intFromCell) {
                    intFromCell = arrSelected[i].cellIndex;
                    if (intFromCell === 0) {
                        intFromCell = 1;
                    }
                }
                if (arrSelected[i].parentNode.rowIndex + 1 > intToRecord) {
                    intToRecord = arrSelected[i].parentNode.rowIndex + 1;
                }
                if (arrSelected[i].cellIndex + 1 > intToCell) {
                    intToCell = arrSelected[i].cellIndex + 1;
                }
            }
            
            arrRecords = xtag.query(element, 'tr');
            strTextCopyString = '';
            
            for (i = intFromRecord, len = intToRecord; i < len; i += 1) {
                arrCells = arrRecords[i].children;
                strTextRecordString = '';
                
                for (cell_i = intFromCell, cell_len = intToCell; cell_i < cell_len; cell_i += 1) {
                    if (!arrCells[cell_i].parentNode.classList.contains('insert-record')) {
                        if (arrCells[cell_i].hasAttribute('selected')) {
                            if (arrCells[cell_i].children[0] && arrCells[cell_i].children[0].nodeName === 'TEXTAREA') { 
                                strCellText = '"' + arrCells[cell_i].lastElementChild.value.replace(/\"/gim, '""') + '"';
                                
                            } else if (arrCells[cell_i].children[0] && arrCells[cell_i].children[0].nodeName === 'BR') {
                                strCellText = '"' + arrCells[cell_i].childNodes[0].textContent.replace(/\"/gim, '""') + '"';
                                
                            } else {
                                strCellText = '"' + arrCells[cell_i].textContent.replace(/\"/gim, '""') + '"';
                            }
                            // <pre></pre>
                        } else {
                            strCellText = '';
                        }
                        
                        strTextRecordString += (cell_i !== intFromCell ? '\t' : '');
                        strTextRecordString += (strCellText || '');
                    }
                }
                if (strTextRecordString.trim()) {
                    strTextCopyString += strTextRecordString;
                }
                if (i + 1 !== len && strTextRecordString.trim()) {
                    strTextCopyString += '\n';
                }
            }
        }
        
        //console.log(strTextCopyString);
        return strTextCopyString || '';
    }
    
    function handleClipboardData(event, strCopyString, strType) {
        var clipboardData = event.clipboardData || window.clipboardData, strMime;
        
        //console.log(event.dataTransfer);
        
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
                //console.log('howdy hey');
                return clipboardData.setData(strMime, strCopyString) !== false;
            } else {
                return clipboardData.getData(strMime);
            }
        }
    }
    
    function pasteHandler(element, event) {
        var clipboardData = (event.clipboardData || window.clipboardData),
            pasteHTML, pastePlain, dataText,
            templateElement = document.createElement('template'), tableElement, arrPasteRecords,
            strUpdateData = '', strInsertData = '', strCurrentRecord, arrSetColumnElements, arrSetColumns = [],
            arrLocalRecords = [], strLocalData, strBeforeColumns, strAfterColumns, insertRecord,
            
            tr_len, i, len, col_i, col_len, colIndex, arrRecordsToRefresh = [], updateFunction,
            arrLines, arrRecords, tbodyElement, arrElements,
            strColumns = '', strRoles = '', arrColumns = [], strColumn;
        
        //console.log(clipboardData, event.clipboardData, window.clipboardData);
        
        if (window.clipboardData) {
            pastePlain = clipboardData.getData('Text');
        } else {
            pasteHTML = clipboardData.getData('text/html');
            pastePlain = clipboardData.getData('Text');
        }
        
        dataText = pasteHTML || pastePlain;
        
        //console.log('HTML:', pasteHTML);
        //console.log('PLAIN:', pastePlain);
        
        // if html and plain options are availible
        if (pasteHTML && pastePlain) {
            templateElement.innerHTML = pasteHTML;
            
            // if html contains table
            if (xtag.query(templateElement.content, 'table').length >= 1) {
                // use html for dataText
                dataText = pasteHTML;
                
            // else (html doesn't contain a table)
            } else {
                // build html for dataText using plain
                dataText = valueListToHTML(pastePlain, '\t', '\n', false, '"', decodeFromTabDelimited);
            }
        } else if (pastePlain) {
            //console.log(pastePlain);
            //console.log(valueListToHTML(pastePlain, '\t', '\n', false, '"', decodeFromTabDelimited));
            
            dataText = valueListToHTML(pastePlain, '\t', '\n', false, '"', decodeFromTabDelimited);
        }
        
        // gathering variables for paste table traversal
        templateElement.innerHTML = dataText;
        tableElement = xtag.query(templateElement.content, 'table')[0];
        arrPasteRecords = xtag.query(tableElement, 'tr');
        
        // gathering variables for select traversal
        arrRecords = element.selectedRecords;
        
        // if the first record is the header: remove it
        if (arrRecords[0] && arrRecords[0].parentNode.nodeName === 'THEAD') {
            arrRecords[0].splice(0, 1);
        }
        
        //alert(arrPasteRecords.length + ' ' + arrRecords.length);
        
        arrSetColumnElements = xtag.query(arrRecords[0], '[selected]:not(th)'); // 
        
        // if contiguous
        if (element.numberOfSelections === 1) {
            // if insert
            if (arrRecords[0].classList.contains('insert-record')) {
                //console.log('paste insert');
                
                for (i = 0, len = Math.min(arrSetColumnElements.length, arrPasteRecords[0].children.length); i < len; i += 1) {
                    strColumn = arrSetColumnElements[i].children[0].getAttribute('column');
                    
                    strColumns += (strColumns ? '\t' : '');
                    strColumns += strColumn;
                    
                    arrSetColumns.push(strColumn);
                }
                
                //console.log(strColumns);
                
                // #####################################################################################
                // #####################################################################################
                // ################# DANGEROUS TRIM IN THIS CODE, MUST BE REMOVED SOON #################
                // #####################################################################################
                // #####################################################################################
                for (i = 0, len = arrPasteRecords.length; i < len; i += 1) {
                    strCurrentRecord = '';
                    
                    // extract data from paste HTML
                    for (col_i = 0, col_len = arrSetColumns.length; col_i < col_len; col_i += 1) {
                        strCurrentRecord += (strCurrentRecord ? '\t' : '');
                        strCurrentRecord += encodeForTabDelimited(arrPasteRecords[i].children[col_i].innerText.trim());
                    }
                    
                    strCurrentRecord += '\n';
                    strInsertData += strCurrentRecord;
                }
                
                //console.log(strColumns + '\n' + strInsertData);
                
                // build local record data
                colIndex = element.arrColumns.indexOf(arrSetColumns[0]);
                strBeforeColumns = stringRepeat('\t', colIndex);
                strAfterColumns = stringRepeat('\t', element.arrColumns.length - (colIndex + tr_len));
                arrLocalRecords = strInsertData.split('\n');
                
                strLocalData = element.arrColumns.join('\t') + '\n';
                for (i = 0, len = arrLocalRecords.length; i < len; i += 1) {
                    if (arrLocalRecords[i]) {
                        strLocalData += strBeforeColumns;
                        strLocalData += arrLocalRecords[i];
                        strLocalData += strAfterColumns;
                        strLocalData += '\n';
                    }
                }
                
                // template local record data
                tbodyElement = document.createElement('tbody');
                tbodyElement.innerHTML = templateRecordsForInsert(element, strLocalData, 'class="insert-temporary bg-red"');
                
                // add local records to the table before the insert record
                arrElements = xtag.toArray(tbodyElement.children);
                insertRecord = xtag.query(element, 'tr.insert-record')[0];
                
                for (i = 0, len = arrElements.length; i < len; i += 1) {
                    insertRecord.parentNode.insertBefore(arrElements[i], insertRecord);
                }
                
                // scroll all the way down
                element.tableContainer.scrollTop = element.tableContainer.scrollHeight;
                
                
                // begin transaction
                GS.addLoader(element, 'Creating Insert Transaction...');
                GS.requestFromSocket(GS.envSocket, 'BEGIN', function (data, error, errorData) {
                    var transactionID;
                    GS.removeLoader(element);
                    
                    if (!error) {
                        transactionID = parseInt(data.substring('transactionid = '.length, data.indexOf('\n')));
                        GS.addLoader(element, 'Creating Insert Transaction...');
                        
                        // request insert
                        GS.requestFromSocket(GS.envSocket,
                                             'transactionid = ' + transactionID + '\n' +
                                             'INSERT\t' + encodeForTabDelimited(element.getAttribute('schema')) + '\t' +
                                                          encodeForTabDelimited(element.getAttribute('object')) + '\n' +
                                             'RETURN\t' + getReturn(element) + '\n\n' +
                                             strColumns + '\n' + strInsertData,
                                             function (data, error, errorData) {
                            var i, len, arrElements, arrReplaceElements, tbodyElement, transactionID, newData;
                            
                            GS.removeLoader(element);
                            
                            if (!error) {
                                transactionID = parseInt(data.substring('transactionid = '.length, data.indexOf('\n')));
                                newData = data.substring(data.indexOf('\n') + 1);
                                //console.log(transactionID, data);
                                
                                if (newData !== '\\.') {
                                    newData = getReturn(element) + '\n' + newData;
                                    
                                    // replace red records with amber records
                                    tbodyElement = document.createElement('tbody');
                                    tbodyElement.innerHTML = templateRecordsForInsert(element, newData, 'class="insert-waiting bg-amber"');
                                    arrElements = xtag.toArray(tbodyElement.children);
                                    arrReplaceElements = xtag.query(element, 'tr.insert-temporary');
                                    
                                    for (i = 0, len = arrElements.length; i < len; i += 1) {
                                        arrReplaceElements[i].parentNode.replaceChild(arrElements[i], arrReplaceElements[i]);
                                    }
                                    
                                } else {
                                    // open confirm message box
                                    GS.msgbox('Are you sure...',
                                              'Are you sure you want create these records?',
                                              ['No', 'Yes'],
                                              function (strAnswer) {
                                        var arrWaitingRecords, i, len;
                                        
                                        // if confirm:
                                        if (strAnswer === 'Yes') {
                                            // send COMMIT
                                            GS.addLoader(element, 'Commiting Insert Transaction...');
                                            GS.requestFromSocket(GS.envSocket, 'transactionid = ' + transactionID + '\nCOMMIT',
                                                                function (data, error, errorData) {
                                                var arrRecords, arrNewColumns, arrCells, i, len, col_i, col_len, intColIndex;
                                                
                                                GS.removeLoader(element);
                                                
                                                if (!error) {
                                                    //// update internal data
                                                    //
                                                    //// split on returns
                                                    //arrRecords = newData.split('\n');
                                                    //
                                                    //// get columns
                                                    //arrNewColumns = arrRecords[0].split('\t');
                                                    //arrRecords.splice(0, 1);
                                                    //
                                                    //// remove types
                                                    //arrRecords.splice(0, 1);
                                                    //
                                                    //// loop through records
                                                    //for (i = 0, len = arrRecords.length; i < len; i += 1) {
                                                    //    // add records to internal data one cell at a time
                                                    //    arrCells = arrRecords[i].split('\t');
                                                    //    
                                                    //    if (arrRecords[i]) {
                                                    //        for (col_i = 0, col_len = element.arrColumns.length; col_i < col_len; col_i += 1) {
                                                    //            intColIndex = arrNewColumns.indexOf(element.arrColumns[col_i]);
                                                    //            
                                                    //            if (intColIndex !== -1) {
                                                    //                element.dataStore += (col_i === 0 ? '\n' : '\t');
                                                    //                element.dataStore += arrCells[intColIndex];
                                                    //            }
                                                    //        }
                                                    //    }
                                                    //}
                                                    
                                                    // turn records green and fade to default colors
                                                    arrWaitingRecords = xtag.query(element, '.insert-waiting');
                                                    
                                                    for (i = 0, len = arrWaitingRecords.length; i < len; i += 1) {
                                                        arrWaitingRecords[i].classList.remove('insert-waiting');
                                                        arrWaitingRecords[i].classList.remove('bg-amber');
                                                        arrWaitingRecords[i].classList.add('bg-green-fade');
                                                    }
                                                    waitAndClearGreen(arrWaitingRecords);
                                                    
                                                } else {
                                                    GS.webSocketErrorDialog(errorData);
                                                }
                                            });
                                            
                                        // if cancel:
                                        } else {
                                            // send ROLLBACK
                                            GS.addLoader(element, 'Rolling Back Insert Transaction...');
                                            GS.requestFromSocket(GS.envSocket, 'transactionid = ' + transactionID + '\nROLLBACK',
                                                                 function (data, error, errorData) {
                                                GS.removeLoader(element);
                                                
                                                if (!error) {
                                                    // remove records
                                                    arrWaitingRecords = xtag.query(element, '.insert-waiting');
                                                    
                                                    for (i = 0, len = arrWaitingRecords.length; i < len; i += 1) {
                                                        arrWaitingRecords[i].parentNode.removeChild(arrWaitingRecords[i]);
                                                    }
                                                } else {
                                                    GS.webSocketErrorDialog(errorData);
                                                }
                                            });
                                        }
                                    });
                                }
                            } else {
                                arrElements = xtag.query(element, 'tr.insert-temporary');
                                
                                for (i = 0, len = arrElements.length; i < len; i += 1) {
                                    arrElements[i].parentNode.removeChild(arrElements[i]);
                                }
                                
                                GS.webSocketErrorDialog(errorData);
                            }
                        });
                    }
                });
                
            // else (update)
            } else {
                // gathering update headers
                for (i = 0, len = element.arrPk.length; i < len; i += 1) {
                    strRoles += (strRoles ? '\t' : '');
                    strRoles += 'pk';
                    
                    strColumns += (strColumns ? '\t' : '');
                    strColumns += element.arrPk[i];
                    
                    arrColumns.push(element.arrPk[i]);
                }
                
                for (i = 0, len = element.arrLock.length; i < len; i += 1) {
                    strRoles += (strRoles ? '\t' : '');
                    strRoles += 'lock';
                    
                    strColumns += (strColumns ? '\t' : '');
                    strColumns += element.arrLock[i];
                    
                    arrColumns.push(element.arrLock[i]);
                }
                
                for (i = 0, len = Math.min(arrSetColumnElements.length, arrPasteRecords[0].children.length); i < len; i += 1) {
                    strColumn = arrSetColumnElements[i].children[0].getAttribute('column');
                    
                    strRoles += (strRoles ? '\t' : '');
                    strRoles += 'set';
                    
                    strColumns += (strColumns ? '\t' : '');
                    strColumns += strColumn;
                    
                    arrSetColumns.push(strColumn);
                }
                
                //console.log(strRoles);
                //console.log(strColumns);
                //console.log(arrColumns);
                //console.log(arrSetColumns);
                //console.log(arrPasteRecords);
                
                // #####################################################################################
                // #####################################################################################
                // ################# DANGEROUS TRIM IN THIS CODE, MUST BE REMOVED SOON #################
                // #####################################################################################
                // #####################################################################################
                for (i = 0, len = Math.min(arrRecords.length, arrPasteRecords.length); i < len; i += 1) {
                    strCurrentRecord = '';
                    
                    // get 'pk' and 'lock' columns
                    for (col_i = 0, col_len = arrColumns.length; col_i < col_len; col_i += 1) {
                        strCurrentRecord += (strCurrentRecord ? '\t' : '');
                        strCurrentRecord += encodeForTabDelimited(
                                                xtag.query(arrRecords[i], '[column="' +
                                                    encodeForTabDelimited(arrColumns[col_i]) + '"]')[0].value
                                            );
                    }
                    
                    // get 'set' columns
                    for (col_i = 0, col_len = arrSetColumns.length; col_i < col_len; col_i += 1) {
                        strCurrentRecord += (strCurrentRecord ? '\t' : '');
                        strCurrentRecord += encodeForTabDelimited(arrPasteRecords[i].children[col_i].innerText.trim());
                    }
                    
                    strCurrentRecord += '\n';
                    strUpdateData += strCurrentRecord;
                    arrRecordsToRefresh.push(arrRecords[i]);
                    
                    // make the records red
                    arrRecords[i].classList.add('bg-red');
                }
                
                //console.log(strUpdateData); //pasteText);
                
                // create transaction
                GS.addLoader(element, 'Creating Update Transaction...');
                GS.requestFromSocket(GS.envSocket, 'BEGIN', function (data, error, errorData) {
                    var transactionID;
                    GS.removeLoader(element);
                    
                    if (!error) {
                        transactionID = parseInt(data.substring('transactionid = '.length, data.indexOf('\n')));
                        GS.addLoader(element, 'Creating Update Transaction...');
                        
                        // request update
                        GS.requestFromSocket(GS.envSocket,
                                             'transactionid = ' + transactionID + '\n' +
                                                'UPDATE\t' + encodeForTabDelimited(element.getAttribute('schema')) + '\t' +
                                                             encodeForTabDelimited(element.getAttribute('object')) + '\n' +
                                                'RETURN\t' + getReturn(element) + '\n\n' +
                                                strRoles + '\n' + strColumns + '\n' + strUpdateData,
                                            function (data, error, errorData) {
                            var transactionID, commitFunction, arrElements, i, len;
                            
                            GS.removeLoader(element);
                            
                            if (!error) {
                                transactionID = parseInt(data.substring('transactionid = '.length, data.indexOf('\n')));
                                data = data.substring(data.indexOf('\n') + 1);
                                
                                if (data !== '\\.') {
                                    data = getReturn(element) + '\n' + data;
                                    
                                    //// remove red from records
                                    //arrElements = xtag.query(element, '.bg-red');
                                    //for (i = 0, len = arrElements.length; i < len; i += 1) {
                                    //    arrElements[i].classList.remove('bg-red');
                                    //}
                                    
                                    // make the records amber and refresh their data
                                    refreshRecordsAfterUpdate(element, arrRecordsToRefresh, data, 'bg-red', 'bg-amber');
                                    
                                } else {
                                    commitFunction = function () {
                                        GS.addLoader(element, 'Commiting Update Transaction...');
                                        GS.requestFromSocket(GS.envSocket,
                                                            'transactionid = ' + transactionID + '\nCOMMIT',
                                                            function (data, error, errorData) {
                                            GS.removeLoader(element);
                                            
                                            if (!error) {
                                                arrElements = xtag.query(element, '.bg-amber');
                                                for (i = 0, len = arrElements.length; i < len; i += 1) {
                                                    arrElements[i].classList.remove('bg-amber');
                                                    arrElements[i].classList.add('bg-green-fade');
                                                }
                                                waitAndClearGreen(arrElements);
                                                
                                            } else {
                                                GS.webSocketErrorDialog(errorData);
                                            }
                                        });
                                    };
                                    
                                    // msgbox if more than one record will be updated
                                    if (arrRecordsToRefresh.length === 1) {
                                        commitFunction();
                                    } else {
                                        GS.msgbox('Are you sure...', 'Are you sure you want to update these records?',
                                                  ['No', 'Yes'], function (strAnswer) {
                                            GS.removeLoader(element);
                                            
                                            if (strAnswer === 'Yes') {
                                                commitFunction();
                                            } else {
                                                GS.addLoader(element, 'Rolling Back Update Transaction...');
                                                GS.requestFromSocket(GS.envSocket, 'transactionid = ' + transactionID + '\nROLLBACK',
                                                                    function (data, error, errorData) {
                                                    var arrElements, i, len;
                                                    
                                                    if (!error) {
                                                        getData(element);
                                                        
                                                    } else {
                                                        GS.webSocketErrorDialog(errorData);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                                
                            } else {
                                arrElements = xtag.query(element, 'tr.bg-red');
                                
                                for (i = 0, len = arrElements.length; i < len; i += 1) {
                                    arrElements[i].classList.remove('bg-red');
                                }
                                
                                GS.webSocketErrorDialog(errorData);
                            }
                        });
                    }
                });
            }
        }
    }
    
    
    // ########################################################################################## //
    // ###################################### COLUMN POPUP ###################################### //
    // ########################################################################################## //
    
    function columnPopup(element) {
        var templateElement = document.createElement('template');
        templateElement.setAttribute('data-max-width', '400px');
        templateElement.setAttribute('data-overlay-close', 'true');
        templateElement.innerHTML = '<div id="datagrid-column-list"></div>';
        
        // open column dialog
        GS.openDialogToElement(element.columnButton, templateElement, 'left', function () {
            var i, len, strHTML, sortColumnHandler, invis_i, vis_i;
            
            // build column list HTML
            strHTML = '';
            
            for (vis_i = 0, len = element.arrColumns.length; vis_i < len; vis_i += 1) {
                strHTML +=  '<div class="drag-line" flex-horizontal ' +
                                        'data-column="' + encodeHTML(element.arrColumns[vis_i]) + '" ' +
                                        'data-originally="' + vis_i + '">' +
                                '<gs-button class="drag-handle" no-focus icononly inline icon="bars"></gs-button>' +
                                '<b flex>&nbsp;' + encodeHTML(element.arrColumns[vis_i]) + '</b>' +
                                '<gs-button data-originally="visible" data-now="visible" ' +
                                            'style="width: 6em;">Hide</gs-button>' +
                            '</div>';
            }
            
            for (invis_i = 0, len = element.removedColumnList.length; invis_i < len; invis_i += 1) {
                strHTML +=  '<div class="drag-line" flex-horizontal ' +
                                        'data-column="' + encodeHTML(element.removedColumnList[invis_i]) + '" ' +
                                        'data-originally="' + (vis_i + invis_i) + '">' +
                                '<gs-button class="drag-handle" no-focus icononly inline icon="bars"></gs-button>' +
                                '<b flex>&nbsp;' + encodeHTML(element.removedColumnList[invis_i]) + '</b>' +
                                '<gs-button data-originally="invisible" data-now="invisible" ' +
                                            'bg-info style="width: 6em;">Show</gs-button>' +
                            '</div>';
            }
            
            // fill column list container
            document.getElementById('datagrid-column-list').innerHTML = strHTML;
            
            // bind hide/show toggles
            document.getElementById('datagrid-column-list').addEventListener('click', function (event) {
                if (event.target.hasAttribute('data-now')) {
                    if (event.target.getAttribute('data-now') === 'visible') {
                        event.target.setAttribute('data-now', 'invisible');
                        event.target.setAttribute('bg-info', '');
                        event.target.textContent = 'Show';
                        
                    } else {
                        event.target.setAttribute('data-now', 'visible');
                        event.target.removeAttribute('bg-info', '');
                        event.target.textContent = 'Hide';
                    }
                }
            });
            
            // create sort handle function
            sortColumnHandler = function (dragParent, event) {
                var intTop = GS.mousePosition(event).top, matchedElement, bolMatchedLast, i, len,
                    offsetsCache = dragParent.offsetsCache, borderElement = dragParent.dragBorderElement,
                    ghostElement = dragParent.dragGhostElement;
                
                ghostElement.style.top = (intTop - (ghostElement.offsetHeight / 2)) + 'px';
                
                if (offsetsCache[0].top > intTop) {
                    matchedElement = offsetsCache[0].element;
                    bolMatchedLast = false;
                    
                } else {
                    for (i = 0, len = offsetsCache.length; i < len; i += 1) {
                        if (offsetsCache[i + 1]) {
                            if (offsetsCache[i].top <= intTop &&
                                offsetsCache[i].top + ((offsetsCache[i + 1].top - offsetsCache[i].top) / 2) > intTop) {
                                
                                matchedElement = offsetsCache[i].element;
                                break;
                                
                            } else if (offsetsCache[i].top <= intTop &&
                                        offsetsCache[i].top + ((offsetsCache[i + 1].top - offsetsCache[i].top) / 2) <= intTop &&
                                        offsetsCache[i + 1].top > intTop) {
                                matchedElement = offsetsCache[i + 1].element;
                                break;
                            }
                        } else {
                            if (offsetsCache[i].top + (offsetsCache[i].height / 2) >= intTop) {
                                matchedElement = offsetsCache[i].element;
                                break;
                                
                            } else if (offsetsCache[i].top + (offsetsCache[i].height / 2) <= intTop) {
                                matchedElement = offsetsCache[i].element;
                                break;
                            }
                        }
                    }
                    bolMatchedLast = (i === (len - 1));
                }
                
                //console.log(bolMatchedLast); //matchedElement,
                
                if (matchedElement !== dragParent.matchedElement || bolMatchedLast !== dragParent.bolMatchedLast) {
                    if (bolMatchedLast === true) {
                        dragParent.removeChild(borderElement);
                        dragParent.appendChild(borderElement);
                        
                    } else {
                        dragParent.insertBefore(borderElement, matchedElement);
                    }
                    
                    dragParent.matchedElement = matchedElement;
                    dragParent.bolMatchedLast = bolMatchedLast;
                }
                
                //console.log('sort', intTop);//, event, ghostElement);
            };
            
            // bind sort handles
            document.getElementById('datagrid-column-list').addEventListener(evt.mousedown, function (event) {
                var dragParent = this, dragLine, mousemoveHandler, mouseupHandler, arrElements, i, len;
                
                if (event.target.classList.contains('drag-handle')) {
                    // save drag line
                    dragLine = event.target.parentNode;
                    
                    // save a cache of line offsets
                    arrElements = xtag.toArray(dragParent.children);
                    dragParent.offsetsCache = [];
                    for (i = 0, len = arrElements.length; i < len; i += 1) {
                        dragParent.offsetsCache.push({
                            'element': arrElements[i],
                            'top': GS.getElementOffset(arrElements[i]).top,
                            'height': arrElements[i].offsetHeight
                        });
                    }
                    
                    // create and save ghost
                    dragParent.dragGhostElement = document.createElement('div');
                    dragParent.dragGhostElement.appendChild(dragLine.cloneNode(true));
                    dragParent.dragGhostElement.setAttribute('style', 'position: absolute;' +
                                                                      'left: 0.25em; top: 0px;' +
                                                                      'padding: 2px; opacity: 0.6;' +
                                                                      'background-color: #F0F0F0;' +
                                                                      'border: 1px solid #000000;' +
                                                                      'width: ' + (dragLine.clientWidth - 6) + 'px;');
                    
                    dragParent.appendChild(dragParent.dragGhostElement);
                    
                    // create and save border element
                    dragParent.dragBorderElement = document.createElement('div');
                    dragParent.dragBorderElement.setAttribute('style', 'position:relative;');
                    dragParent.dragBorderElement.innerHTML = '<div style="position: absolute;' +
                                                                          'top: -2px; left: -2px;' +
                                                                          'width: 100%; padding: 2px;' +
                                                                          'background-color: #00CC00;"></div>';
                    
                    dragParent.appendChild(dragParent.dragBorderElement);
                    
                    // call sort handler
                    sortColumnHandler(dragParent, event);
                    
                    // bind mousemove and mouseup
                    mousemoveHandler = function (event) {
                        if (event.which === 0 && !evt.touchDevice) {
                            mouseupHandler(event);
                            
                        } else {
                            sortColumnHandler(dragParent, event);
                            event.preventDefault();
                        }
                    };
                    
                    mouseupHandler = function (event) {
                        if (dragParent.bolMatchedLast) {
                            dragParent.removeChild(dragLine);
                            dragParent.appendChild(dragLine);
                        } else {
                            dragParent.insertBefore(dragLine, dragParent.matchedElement);
                        }
                        
                        document.body.removeEventListener(evt.mousemove, mousemoveHandler);
                        document.body.removeEventListener(evt.mouseup, mouseupHandler);
                        dragParent.removeChild(dragParent.dragGhostElement);
                        dragParent.removeChild(dragParent.dragBorderElement);
                    };
                    
                    document.body.addEventListener(evt.mousemove, mousemoveHandler);
                    document.body.addEventListener(evt.mouseup, mouseupHandler);
                }
            });
            
            
        }, function (event, strAnswer) {
            var i, len, arrElements, bolRefresh = false;
            
            arrElements = xtag.query(document.getElementById('datagrid-column-list'), '[data-now]');
            
            element.arrUserColumnList = [];
            element.removedColumnList = [];
            
            for (i = 0, len = arrElements.length; i < len; i += 1) {
                if (arrElements[i].getAttribute('data-now') === 'visible') {
                    element.arrUserColumnList.push(arrElements[i].parentNode.getAttribute('data-column'));
                } else {
                    element.removedColumnList.push(arrElements[i].parentNode.getAttribute('data-column'));
                }
                
                if (arrElements[i].getAttribute('data-originally') !== arrElements[i].getAttribute('data-now') ||
                    parseInt(arrElements[i].parentNode.getAttribute('data-originally'), 10) !== i) {
                    bolRefresh = true;
                }
            }
            
            if (bolRefresh) {
                getData(element);
            }
        });
    }
    
    
    // ########################################################################################## //
    // ##################################### CELL SELECTION ##################################### //
    // ########################################################################################## //
    
    function selectHandler(element, dragOriginCell, dragCurrentCell, dragMode) {
        var arrRecords = xtag.query(element, 'tr'), arrCells = xtag.query(element, 'td, th'),
            dragOriginRecord = dragOriginCell.parentNode,
            dragCurrentRecord = dragCurrentCell.parentNode,
            intStartRecordIndex, intStartCellIndex, intEndRecordIndex, intEndCellIndex,
            i, len, col_i, col_len, selectionIndex;
        
        //console.log(element, dragOriginCell, dragCurrentCell);
        
        // if origin & currentCell are both the top-left cell and the cell is a heading: select all cells
        if (dragOriginRecord.rowIndex === 0 && dragCurrentRecord.rowIndex === 0 &&
            dragOriginCell.cellIndex === 0 && dragCurrentCell.cellIndex === 0) {
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
        
        //console.log(dragMode);
        if (dragMode === 'select') {
            for (i = intStartRecordIndex, len = intEndRecordIndex + 1; i < len; i += 1) {
                for (col_i = intStartCellIndex, col_len = intEndCellIndex + 1; col_i < col_len; col_i += 1) {
                    if (element.savedSelection.indexOf(i + ',' + col_i) === -1) {
                        element.savedSelection.push(i + ',' + col_i);
                    }
                }
            }
            
        } else { // implied if: dragMode === 'deselect'
            for (i = intStartRecordIndex, len = intEndRecordIndex + 1; i < len; i += 1) {
                for (col_i = intStartCellIndex, col_len = intEndCellIndex + 1; col_i < col_len; col_i += 1) {
                    selectionIndex = element.savedSelection.indexOf(i + ',' + col_i);
                    
                    if (selectionIndex > -1) {
                        element.savedSelection.splice(selectionIndex, 1);
                    }
                }
            }
        }
        
        //console.log(intStartRecordIndex, intEndRecordIndex, intStartCellIndex, intEndCellIndex);
        //console.log(element.savedSelection);
        
        synchronize(element);
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
    
    // ########################################################################################## //
    // ########################################## MISC ########################################## //
    // ########################################################################################## //
    
    // after animation finishes: remove green class
    function waitAndClearGreen(arrRecords) {
        setTimeout(function () {
            var i, len;
            
            for (i = 0, len = arrRecords.length; i < len; i += 1) {
                arrRecords[i].classList.remove('bg-green-fade');
            }
        }, 1000);
    }
    
    // get return column list
    function getReturn(element) {
        return (
                    (element.arrUserColumnList || []).join('\t') ||
                    (element.getAttribute('cols') || '').split(/\s{0,},\s{0,}/gim).join('\t') ||
                    '*'
                );
    }
    
    function synchronize(element, bolScroll) {
        var arrRecords = xtag.query(element, 'tr'), selectCells = [], i, len,
            arrParts, arrTextareas, focusedElement, recordIndex, cellIndex;
        
        // selection
        if (element.savedSelection) {
            // loop through savedSelection
            for (i = 0, len = element.savedSelection.length; i < len; i += 1) {
                // any cell position that is in saved selection gets added to the selectCells
                arrParts = element.savedSelection[i].split(',');
                recordIndex = parseInt(arrParts[0], 10);
                cellIndex = parseInt(arrParts[1], 10);
                
                if (recordIndex < arrRecords.length && cellIndex < arrRecords[0].children.length) {
                    selectCells.push(arrRecords[recordIndex].children[cellIndex]);
                }
            }
            
            // select cells
            element.selectedCells = selectCells;
        }
        
        // focus
        if (element.lastFocusedControl) { // element.lastFocusedControl > -1
            //arrTextareas = xtag.query(element, 'textarea');
            
            //if (arrTextareas[element.lastFocusedControl]) {
            //console.log(arrTextareas[element.lastFocusedControl]);
            
            //if (element.lastFocusedControl !== document.activeElement) { // arrTextareas[element.lastFocusedControl]
            //arrTextareas[element.lastFocusedControl].focus();
            
            element.lastFocusedControl.focus();
            focusedElement = element.lastFocusedControl; //arrTextareas[element.lastFocusedControl];
            
            //} else { // if (bolScroll) {
            //    //arrTextareas[element.lastFocusedControl].blur();
            //    //arrTextareas[element.lastFocusedControl].focus();
            //    
            //    //element.lastFocusedControl.blur();
            //    //element.lastFocusedControl.focus();
            //    focusedElement = element.lastFocusedControl; //arrTextareas[element.lastFocusedControl];
            //}
            
            //console.log(focusedElement);
            //}
        }
        
        // if there was no control to focus and
        //      there is a selection and
        //      bolScroll is true: scroll to selected
        //console.log(element.lastFocusedControl, element.selectedCells, bolScroll);
        if (!element.lastFocusedControl && element.selectedCells.length > 0 && bolScroll) {
            //console.log(element.selectedCells[0]);
            GS.scrollIntoView(element.selectedCells[0].parentNode);
        }
        
        // if there was a control and bolScroll is true: scroll to focused record
        if (focusedElement && bolScroll) {
            GS.scrollIntoView(GS.findParentElement(document.activeElement, 'tr'));
        }
        
        //console.log(focusedElement, element.lastTextSelection);
        if (focusedElement && element.lastTextSelection) {
            GS.setInputSelection(focusedElement, element.lastTextSelection.start, element.lastTextSelection.end);
        }
    }
    
    
    
    
    
    
    
    
    
    
    
    
    // dont do anything that modifies the element here
    function elementCreated(element) {
        // if "created" hasn't been suspended: run created code
        if (!element.hasAttribute('suspend-created')) {
            
        }
    }
    
    //
    function elementInserted(element) {
        var styleElement;
        
        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;
                element.tabIndex = 0;
                element.removedColumnList = [];
                
                getData(element);
                
                
                // ################################################################
                // ######################## KEY NAVIGATION ########################
                // ################################################################
                
                if (!evt.touchDevice) {
                    element.addEventListener('keydown', function (event) {
                        var intKeyCode = (event.which || event.keyCode), intCursorPostition, jsnCursorPos,
                            bolCursorAtFirst, bolCursorAtTop, bolCursorAtLast, bolCursorAtBottom, strCurrVal,
                            parentCell, parentRecord, parentTBody, bolSelect, bolFullSelection, arrSelected,
                            arrRecords, bolFocusMode;
                        
                        //console.log(event.target);
                        
                        // find out if we are in focus mode
                        // if we are in a cell control: we might be in focus mode (we need to check further)
                        if (event.target.hasAttribute('column')) {
                            jsnCursorPos = GS.getInputSelection(event.target);
                            
                            // if fill text selection and shift is down: not focus mode
                            if (jsnCursorPos.start === 0 && jsnCursorPos.end === event.target.value.length && event.shiftKey) {
                                bolFocusMode = false;
                                
                            // else: focus mode
                            } else {
                                bolFocusMode = true;
                            }
                        } else {
                            bolFocusMode = false;
                        }
                        
                        // if we're in focus mode: change focused cell
                        if (bolFocusMode) {
                            jsnCursorPos = GS.getInputSelection(event.target);
                            strCurrVal = event.target.value;
                            
                            parentCell = GS.findParentElement(event.target, 'th,td');
                            parentRecord = parentCell.parentNode;
                            parentTBody = parentRecord.parentNode;
                            
                            bolFullSelection = (jsnCursorPos.start === 0 && jsnCursorPos.end === event.target.value.length);
                            
                            // if we don't have a full selection and the selection is one character position
                            if (!bolFullSelection && jsnCursorPos.start === jsnCursorPos.end) {
                                // find out where the cursor is
                                intCursorPostition = jsnCursorPos.start;
                                bolCursorAtFirst = (intCursorPostition === 0);
                                bolCursorAtTop = (intCursorPostition < (strCurrVal.indexOf('\n') === -1 ?
                                                            strCurrVal.length :
                                                            strCurrVal.indexOf('\n'))) ||
                                                 (intCursorPostition === 0);
                                bolCursorAtLast = (intCursorPostition === strCurrVal.length);
                                bolCursorAtBottom = (intCursorPostition > strCurrVal.lastIndexOf('\n'));
                            }
                            
                            // if left arrow and (full selection or the cursor is at the first character)
                            if (intKeyCode === 37 && (bolFullSelection || bolCursorAtFirst)) {
                                //console.log('1***');
                                if (parentCell.previousElementSibling && parentCell.previousElementSibling.nodeName !== 'TH') {
                                    parentCell.previousElementSibling.children[0].focus();
                                    bolSelect = true;
                                    
                                } else if (parentRecord.previousElementSibling) {
                                    parentRecord.previousElementSibling.lastElementChild.children[0].focus();
                                    bolSelect = true;
                                }
                                
                            // if up arrow and (full selection or the cursor is in the top line)
                            } else if (intKeyCode === 38 && (bolFullSelection || bolCursorAtTop)) {
                                //console.log('2***');
                                if (parentRecord.previousElementSibling) {
                                    parentRecord.previousElementSibling.children[parentCell.cellIndex].children[0].focus();
                                    bolSelect = true;
                                    
                                } else if (parentCell.previousElementSibling &&
                                           parentCell.previousElementSibling.nodeName !== 'TH') {
                                    parentTBody.lastElementChild.children[parentCell.cellIndex - 1].children[0].focus();
                                    bolSelect = true;
                                }
                                
                            // if right arrow and (full selection or the cursor is at the last character)
                            } else if (intKeyCode === 39 && (bolFullSelection || bolCursorAtLast)) {
                                //console.log('3***');
                                if (parentCell.nextElementSibling && parentCell.nextElementSibling.nodeName !== 'TH') {
                                    parentCell.nextElementSibling.children[0].focus();
                                    bolSelect = true;
                                    
                                } else if (parentRecord.nextElementSibling) {
                                    parentRecord.nextElementSibling.children[1].children[0].focus();
                                    bolSelect = true;
                                }
                                
                            // if down arrow  and (full selection or the cursor is in the last line)
                            } else if (intKeyCode === 40 && (bolFullSelection || bolCursorAtBottom)) {
                                //console.log('4***');
                                if (parentRecord.nextElementSibling) {
                                    parentRecord.nextElementSibling.children[parentCell.cellIndex].children[0].focus();
                                    bolSelect = true;
                                } else if (parentCell.nextElementSibling &&
                                           parentCell.nextElementSibling.nodeName !== 'TH') {
                                    parentTBody.firstElementChild.children[parentCell.cellIndex + 1].children[0].focus();
                                    bolSelect = true;
                                }
                            }
                            
                            // if something was selected
                            if (bolSelect) {
                                // set selected cells
                                element.savedSelection = [];
                                element.savedSelectionCopy = [];
                                element.dragOrigin = document.activeElement.parentNode;
                                element.dragCurrentCell = element.dragOrigin;
                                element.selectionPreviousOrigin = element.dragOrigin;
                                element.numberOfSelections = 1;
                                element.dragMode = 'select';
                                
                                selectHandler(element, element.dragOrigin, element.dragCurrentCell, element.dragMode);
                                
                                // select all the text and scroll into view
                                GS.setInputSelection(document.activeElement, 0, document.activeElement.value.length);
                                GS.scrollIntoView(GS.findParentTag(document.activeElement, 'tr'));
                                
                                //console.log(document.activeElement);
                                
                                // this makes it so that the keyup doesn't happen,
                                //      allowing the new text selection to stay
                                event.preventDefault();
                            }
                            
                        // else: change selection
                        } else if (event.target === element ||
                                   event.target.hasAttribute('column') ||
                                   event.target.classList.contains('hidden-focus-control')) {
                            //console.log('1***', element.dragAllowed, intKeyCode);
                            
                            // if mouse selection is not happening right now
                            if (!element.dragAllowed) {
                                arrSelected = element.selectedCells;
                                
                                // if the key was return
                                if (intKeyCode === 13) {
                                    // if there is only one cell selected: go into the cell control
                                    if (arrSelected.length === 1) {
                                        arrSelected[0].children[0].focus();
                                    }
                                    
                                    GS.setInputSelection(document.activeElement, document.activeElement.value.length);
                                    GS.scrollIntoView(GS.findParentTag(document.activeElement, 'tr'));
                                    
                                    // this makes it so that the keyup doesn't happen,
                                    //      allowing the new text selection to stay
                                    event.preventDefault();
                                    
                                // else if an arrow key was pressed
                                } else if (intKeyCode === 37 || intKeyCode === 38 || intKeyCode === 39 || intKeyCode === 40) {
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
                                            element.dragCurrentCell = arrRecords[parentRecord.rowIndex - 1]
                                                                            .children[element.dragCurrentCell.cellIndex];
                                            
                                        // if right arrow
                                        } else if (intKeyCode === 39 && element.dragCurrentCell.nextElementSibling) {
                                            element.dragCurrentCell = element.dragCurrentCell.nextElementSibling;
                                            
                                        // if down arrow
                                        } else if (intKeyCode === 40 && arrRecords[parentRecord.rowIndex + 1]) {
                                            element.dragCurrentCell = arrRecords[parentRecord.rowIndex + 1]
                                                                            .children[element.dragCurrentCell.cellIndex];
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
                                            element.dragCurrentCell = arrRecords[parentRecord.rowIndex - 1]
                                                                            .children[element.dragCurrentCell.cellIndex];
                                            
                                        // if right arrow
                                        } else if (intKeyCode === 39 && element.dragCurrentCell.nextElementSibling) {
                                            element.dragCurrentCell = element.dragCurrentCell.nextElementSibling;
                                            
                                        // if down arrow
                                        } else if (intKeyCode === 40 && arrRecords[parentRecord.rowIndex + 1]) {
                                            element.dragCurrentCell = arrRecords[parentRecord.rowIndex + 1]
                                                                            .children[element.dragCurrentCell.cellIndex];
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
                                        element.hiddenFocusElement.focus();
                                        
                                        selectHandler(element, element.dragOrigin, element.dragCurrentCell, element.dragMode);
                                        GS.scrollIntoView(element.dragCurrentCell.parentNode);
                                        event.preventDefault();
                                    }
                                }
                            }
                        }
                    });
                }
                
                
                // ###############################################################
                // ########################## SELECTION ##########################
                // ###############################################################
                
                if (!evt.touchDevice) {
                    element.dragAllowed = false;
                    element.numberOfSelections = 0;
                    
                    // on mousedown (event delagation style)
                    element.addEventListener('mousedown', function (event) {
                        var target = GS.findParentElement(event.target, 'th,td'),
                            originalTarget = event.target;
                        
                        // if target is a cell: begin selection
                        //console.log('1***', event.target);
                        if (target && (target.nodeName === 'TH' || target.nodeName === 'TD')) {
                            //console.log('2***', event.target, event);
                            
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
                            
                            //console.log(element.selectedCells, element.selectedCells.length);
                            
                            // if the original target is a cell or if the dragOrigin isn't the target cell or
                            //      if there are already selected cells: blur focused element and prevent default
                            if (originalTarget.nodeName === 'TH' || originalTarget.nodeName === 'TD' ||
                                element.dragOrigin !== target || element.selectedCells.length > 0) {
                                element.lastFocusedControl = null;
                                document.activeElement.blur();
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
                            //console.log('1***', cellFromTarget === element.dragCurrentCell, element.dragAllowed);
                            
                            // if selection is allowed at this point and closestCell is different from element.dragCurrentCell
                            if (cellFromTarget && element.dragAllowed && element.dragCurrentCell !== cellFromTarget) {
                                //console.log('2***', element.hiddenFocusElement);
                                //document.activeElement.blur();
                                
                                element.lastFocusedControl = null;
                                element.hiddenFocusElement.focus();
                                
                                element.dragCurrentCell = cellFromTarget;
                                selectHandler(element, element.dragOrigin, element.dragCurrentCell, element.dragMode);
                                event.preventDefault();
                            }
                        } else {
                            element.dragAllowed = false;
                            element.selectionPreviousOrigin = element.dragOrigin;
                        }
                    });
                    
                    element.addEventListener('mouseup', function (event) {
                        if (element.dragAllowed) {
                            //console.log(document.activeElement);
                            if (document.activeElement === element || document.activeElement === document.body) {
                                element.hiddenFocusElement.focus();
                            }
                            element.dragAllowed = false;
                            element.selectionPreviousOrigin = element.dragOrigin;
                        }
                    });
                }
                
                // ##############################################################
                // ########################### DELETE ###########################
                // ##############################################################
                
                if (!evt.touchDevice) {
                    element.addEventListener('keydown', function (event) {
                        //console.log(event.keyCode);
                        
                        if ((event.keyCode === 8 || event.keyCode === 46) && event.target.parentNode.nodeName !== 'TD') {
                            deleteSelected(element);
                        }
                    });
                }
                
                
                // ################################################################
                // ############################ UPDATE ############################ paste version is in 
                // ################################################################     the "PASTE (INSERT & UPDATE)" section
                
                // on focus: save old value
                element.addEventListener('focus', function (event) {
                    //console.log(event.target);
                    if (event.target.hasAttribute('column')) {
                        //console.log('focus:', event.target.value);
                        event.target.strOldValue = event.target.value;
                    }
                }, true);// this true is for making it so that the focus event (which doesn't bubble) gets captured
                
                // update focusout and return
                var updateFunction = function (event) {
                    var strRoles = '', strColumns = '', strValues = '', updateRecordElement,
                        i, len, strUpdateColumn = event.target.getAttribute('column');
                    
                    //console.log('update "' + strUpdateColumn + '": ' + event.target.value);
                    
                    updateRecordElement = GS.findParentTag(event.target, 'tr');
                    
                    for (i = 0, len = element.arrPk.length; i < len; i += 1) {
                        strRoles   += (strRoles   ? '\t' : '') + 'pk';
                        strColumns += (strColumns ? '\t' : '') + element.arrPk[i];
                        
                        strValues += (strValues  ? '\t' : '');
                        
                        // if the set column is the same as the current pk column: use the old value
                        if (event.target.getAttribute('column') === encodeForTabDelimited(element.arrPk[i])) {
                            strValues += encodeForTabDelimited(event.target.strOldValue);
                        } else {
                            strValues += encodeForTabDelimited(
                                            xtag.query(updateRecordElement,
                                                       '[column="' + encodeForTabDelimited(element.arrPk[i]) + '"]')[0].value);
                        }
                    }
                    
                    //console.log(element.arrLock);
                    for (i = 0, len = element.arrLock.length; i < len; i += 1) {
                        strRoles   += (strRoles   ? '\t' : '') + 'lock';
                        strColumns += (strColumns ? '\t' : '') + element.arrLock[i];
                        
                        strValues += (strValues  ? '\t' : '');
                        
                        // if the set column is the same as the current lock column: use the old value
                        if (event.target.getAttribute('column') === encodeForTabDelimited(element.arrLock[i])) {
                            strValues += encodeForTabDelimited(event.target.strOldValue);
                        } else {
                            strValues += encodeForTabDelimited(
                                            xtag.query(updateRecordElement,
                                                       '[column="' + encodeForTabDelimited(element.arrLock[i]) + '"]')[0].value);
                        }
                    }
                    
                    strRoles += '\tset';
                    strColumns += '\t' + strUpdateColumn;
                    strValues += '\t' + encodeForTabDelimited(event.target.value);
                    
                    //console.log(strRoles);
                    //console.log(strColumns);
                    //console.log(strValues);
                    
                    // create transaction
                    GS.addLoader(element, 'Creating Update Transaction...');
                    GS.requestFromSocket(GS.envSocket, 'BEGIN', function (data, error, errorData) {
                        var transactionID;
                        GS.removeLoader(element);
                        
                        if (!error) {
                            transactionID = parseInt(data.substring('transactionid = '.length, data.indexOf('\n')));
                            GS.addLoader(element, 'Creating Update Transaction...');
                            
                            // request update
                            GS.requestFromSocket(GS.envSocket,
                                                 'transactionid = ' + transactionID + '\n' +
                                                    'UPDATE\t' + encodeForTabDelimited(element.getAttribute('schema')) + '\t' +
                                                                 encodeForTabDelimited(element.getAttribute('object')) + '\n' +
                                                    'RETURN\t' + getReturn(element) + '\n\n' +
                                                        strRoles + '\n' + strColumns + '\n' + strValues + '\n',
                                                 function (data, error, errorData) {
                                var transactionID, refreshData;
                                
                                GS.removeLoader(element);
                                
                                if (!error) {
                                    transactionID = parseInt(data.substring('transactionid = '.length, data.indexOf('\n')));
                                    refreshData = data.substring(data.indexOf('\n') + 1);
                                    
                                    GS.addLoader(element, 'Commiting Update Transaction...');
                                    GS.requestFromSocket(GS.envSocket, 'transactionid = ' + transactionID + '\nCOMMIT',
                                                        function (data, error, errorData) {
                                        GS.removeLoader(element);
                                        
                                        if (!error) {
                                            refreshRecordsAfterUpdate(element, [updateRecordElement], refreshData);
                                            
                                        } else {
                                            GS.webSocketErrorDialog(errorData);
                                        }
                                    });
                                    
                                } else {
                                    GS.webSocketErrorDialog(errorData);
                                }
                            });
                        }
                    });
                }
                
                // on focusout if the control is a cell control and the value was changed: update
                element.addEventListener('focusout', function (event) {
                    if (event.target.hasAttribute('column') && event.target.value !== event.target.strOldValue &&
                        !event.target.classList.contains('insert-control')) {
                        updateFunction(event);
                        
                        event.target.strOldValue = event.target.value;
                    }
                });
                
                // on keydown if the control is a cell control and
                //      the value was changed and
                //      shift is not pressed and
                //      the return/enter key was pressed: update
                element.addEventListener('keydown', function (event) {
                    if (event.target.hasAttribute('column') && event.target.value !== event.target.strOldValue &&
                        !event.target.classList.contains('insert-control') && (!event.shiftKey && event.keyCode === 13)) {
                        
                        updateFunction(event);
                        event.target.strOldValue = event.target.value;
                    }
                    
                    if (!event.target.classList.contains('insert-control') && !event.shiftKey && event.keyCode === 13) {
                        event.preventDefault();
                    }
                });
                
                
                // ################################################################
                // ############################ INSERT ############################ paste version is in 
                // ################################################################     the "PASTE (INSERT & UPDATE)" section
                
                element.addEventListener('keydown', function (event) {
                    var strInsert, strColumns, strNewRecord, arrElements, i, len;
                    
                    if (event.target.classList.contains('insert-control') && !event.shiftKey && event.keyCode === 13) {
                        arrElements = xtag.query(element, '.insert-control');
                        
                        for (i = 0, len = arrElements.length, strColumns = '', strNewRecord = ''; i < len; i += 1) {
                            if (arrElements[i].value) {
                                strColumns += (strColumns ? '\t' : '') + arrElements[i].getAttribute('column');
                                strNewRecord += (strNewRecord ? '\t' : '') + encodeForTabDelimited(arrElements[i].value);
                                arrElements[i].value = '';
                            }
                        }
                        
                        strInsert = 'INSERT\t' + encodeForTabDelimited(element.getAttribute('schema')) + '\t' +
                                                 encodeForTabDelimited(element.getAttribute('object')) + '\n' +
                                    'RETURN\t' + getReturn(element) + '\n\n' +
                                    strColumns + '\n' +
                                    strNewRecord + '\n';
                        
                        //console.log('insert:\n' + strInsert);
                        
                        // request insert
                        
                        // begin transaction
                        GS.addLoader(element, 'Creating Insert Transaction...');
                        GS.requestFromSocket(GS.envSocket, 'BEGIN', function (data, error, errorData) {
                            var transactionID;
                            GS.removeLoader(element);
                            
                            if (!error) {
                                transactionID = parseInt(data.substring('transactionid = '.length, data.indexOf('\n')));
                                GS.addLoader(element, 'Creating Insert Transaction...');
                                
                                // request insert
                                GS.requestFromSocket(GS.envSocket,
                                                     'transactionid = ' + transactionID + '\n' + strInsert,
                                                     function (data, error, errorData) {
                                    var i, len, arrElements, arrReplaceElements, tbodyElement, newData, transactionID;
                                    
                                    GS.removeLoader(element);
                                    
                                    if (!error) {
                                        transactionID = parseInt(data.substring('transactionid = '.length, data.indexOf('\n')));
                                        newData = data.substring(data.indexOf('\n') + 1);
                                        //console.log(transactionID, data);
                                        
                                        if (newData !== '\\.') {
                                            newData = getReturn(element) + '\n' + newData;
                                            
                                            // create record elements
                                            tbodyElement = document.createElement('tbody');
                                            tbodyElement.innerHTML = templateRecordsForInsert(element, newData, '');
                                            
                                            // append before the insert record
                                            arrElements = xtag.toArray(tbodyElement.children);
                                            
                                            for (i = 0, len = arrElements.length; i < len; i += 1) {
                                                element.tableTbody.insertBefore(arrElements[i], element.tableInsertRecord);
                                            }
                                            
                                            // scroll all the way down
                                            element.tableContainer.scrollTop = element.tableContainer.scrollHeight;
                                            
                                        } else {
                                            // send COMMIT
                                            GS.addLoader(element, 'Commiting Insert Transaction...');
                                            GS.requestFromSocket(GS.envSocket,
                                                                 'transactionid = ' + transactionID + '\nCOMMIT',
                                                                 function (data, error, errorData) {
                                                var tbodyElement, insertRecord, arrElements, arrRecords, arrNewColumns, arrCells,
                                                    col_i, col_len, i, len, intColIndex;
                                                
                                                GS.removeLoader(element);
                                                
                                                if (!error) {
                                                    //// update internal data
                                                    //
                                                    //// split on returns
                                                    //arrRecords = newData.split('\n');
                                                    //
                                                    //// get columns
                                                    //arrNewColumns = arrRecords[0].split('\t');
                                                    //arrRecords.splice(0, 1);
                                                    //
                                                    //// remove types
                                                    //arrRecords.splice(0, 1);
                                                    //
                                                    //// loop through records
                                                    //for (i = 0, len = arrRecords.length; i < len; i += 1) {
                                                    //    // add records to internal data one cell at a time
                                                    //    arrCells = arrRecords[i].split('\t');
                                                    //    
                                                    //    if (arrRecords[i]) {
                                                    //        for (col_i = 0, col_len = element.arrColumns.length; col_i < col_len; col_i += 1) {
                                                    //            intColIndex = arrNewColumns.indexOf(element.arrColumns[col_i]);
                                                    //            
                                                    //            if (intColIndex !== -1) {
                                                    //                element.dataStore += (col_i === 0 ? '\n' : '\t');
                                                    //                element.dataStore += arrCells[intColIndex];
                                                    //            }
                                                    //        }
                                                    //    }
                                                    //}
                                                    //
                                                    ////console.log(element.dataStore);
                                                    
                                                } else {
                                                    GS.webSocketErrorDialog(errorData);
                                                }
                                            });
                                        }
                                        
                                    } else {
                                        GS.webSocketErrorDialog(errorData);
                                    }
                                });
                            }
                        });
                        
                        event.preventDefault();
                    }
                });
                
                
                // ###############################################################
                // ############## FOCUS AND TEXT SELECTION TRACKING ##############
                // ###############################################################
                
                // on focus: save currently focused element
                element.addEventListener('focus', function (event) {
                    //var arrTextareas;
                    
                    if (event.target.nodeName === 'TEXTAREA') {
                        //arrTextareas = xtag.query(element, 'textarea');
                        //element.lastFocusedControl = arrTextareas.indexOf(event.target);
                        
                        element.lastFocusedControl = event.target;
                    }
                }, true);// this true is for making it so that the focus event (which doesn't bubble) gets captured
                
                // on focusout: save current text selection
                element.addEventListener('focusout', function (event) {
                    //console.log('focusout');
                    if (document.activeElement.nodeName === 'TEXTAREA') {
                        element.lastTextSelection = GS.getInputSelection(document.activeElement);
                    } else {
                        element.lastTextSelection = null;
                    }
                });
                
                
                // #################################################################
                // ########################## SYNCHRONIZE ##########################
                // #################################################################
                
                element.addEventListener('click', function (event) {
                    //console.log('1***');
                    if (event.target.classList.contains('sync-target')) {
                        synchronize(element, true);
                        event.preventDefault();
                        event.stopPropagation();
                    }
                });
                
                
                // #################################################################
                // ######################### DELETE BUTTON #########################
                // #################################################################
                
                // on focus: save currently focused element
                element.addEventListener('after_select', function (event) {
                    var arrRecords = element.selectedRecords, i, len, bolDelete = true;
                    
                    for (i = 0, len = arrRecords.length; i < len; i += 1) {
                        if (!arrRecords[i].children[0].hasAttribute('selected') ||
                            !arrRecords[i].lastElementChild.hasAttribute('selected')) {
                            bolDelete = false;
                            break;
                        }
                    }
                    
                    if (arrRecords.length === 0 || arrRecords[0].classList.contains('insert-record')) {
                        bolDelete = false;
                    }
                    
                    if (bolDelete === false) {
                        element.deleteButton.setAttribute('disabled', '');
                    } else {
                        element.deleteButton.removeAttribute('disabled');
                    }
                });
                
                
                // #################################################################
                // ######################### WINDOW RESIZE #########################
                // #################################################################
                
                window.addEventListener('resize', function (event) {
                    element.root.style.paddingTop = (GS.pxToEm(element, element.toolbar.offsetHeight) + 0.25) + 'em';
                });
                
                
                // ################################################################
                // ##################### FLOATING CELL BUTTON #####################
                // ################################################################
                
                var cellFloatingButtonFunction = function (targetCell) {
                    var jsnElementPosition = GS.getElementPositionData(targetCell), strHTML;
                    
                    // targetCell is a th: remove the floating button if it exists
                    if (targetCell.nodeName === 'TH') {
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
                            
                            element.cellFloatingButtonContainer.innerHTML =
                                            '<gs-button icononly icon="bars" inline bg-primary no-focus></gs-button>';
                            
                            element.tableContainer.appendChild(element.cellFloatingButtonContainer);
                            
                            element.cellFloatingButtonContainer.addEventListener(evt.mousedown, function () {
                                //console.log(GS.getInputSelection(element.cellFloatingButtonContainer.targetControl));
                                element.cellFloatingButtonContainer.targetControl.bolSubstring =
                                    document.activeElement === element.cellFloatingButtonContainer.targetControl;
                            });
                            
                            element.cellFloatingButtonContainer.addEventListener('click', function () {
                                var jsnSelection = GS.getInputSelection(element.cellFloatingButtonContainer.targetControl),
                                    templateElement = document.createElement('template'),
                                    strMatchText = element.cellFloatingButtonContainer.targetControl.value;
                                
                                //console.log(jsnSelection);
                                
                                if (element.cellFloatingButtonContainer.targetControl.bolSubstring &&
                                    jsnSelection.start !== jsnSelection.end) {
                                    strMatchText = strMatchText.substring(jsnSelection.start, jsnSelection.end);
                                }
                                
                                templateElement.setAttribute('data-max-width', '250px');
                                templateElement.setAttribute('data-overlay-close', 'true');
                                
                                strHTML = '<gs-body padded>';
                                
                                if (evt.touchDevice) {
                                    strHTML += '<gs-button class="text-left" dialogclose>Select Range</gs-button>';
                                    strHTML += '<gs-button class="text-left" dialogclose>Select Records</gs-button><hr />';
                                }
                                
                                strHTML +=
                                    '<gs-button class="text-left" dialogclose>Equals "<u>{{VALUE}}</u>"</gs-button>' +
                                    '<gs-button class="text-left" dialogclose>Doesn\'t Equal "<u>{{VALUE}}</u>"</gs-button>' +
                                    '<gs-button class="text-left" dialogclose>Contains "<u>{{VALUE}}</u>"</gs-button>' +
                                    '<gs-button class="text-left" dialogclose>Doesn\'t Contain "<u>{{VALUE}}</u>"</gs-button>' +
                                    '<gs-button class="text-left" dialogclose>Starts With "<u>{{VALUE}}</u>"</gs-button>' +
                                    '<gs-button class="text-left" dialogclose>Ends With "<u>{{VALUE}}</u>"</gs-button>';
                                
                                strHTML += '</gs-body>';
                                
                                strHTML = strHTML.replace(/\{\{VALUE\}\}/gim, encodeHTML(strMatchText));
                                
                                templateElement.innerHTML = strHTML;
                                
                                GS.openDialogToElement(element.cellFloatingButtonContainer, templateElement, 'left', '',
                                                                                                function (event, strAnswer) {
                                    var addWhere, control, clickFunction;
                                    
                                    control = element.cellFloatingButtonContainer.targetCell.children[0];
                                    
                                    addWhere = function (strNewWhere) {
                                        var strWhere = element.getAttribute('where');
                                        
                                        if (strWhere) {
                                            strWhere = '(' + strWhere + ') AND ' + strNewWhere;
                                        } else {
                                            strWhere = strNewWhere;
                                        }
                                        
                                        element.setAttribute('where', strWhere);
                                        getData(element, true);
                                    };
                                    
                                    if (strAnswer === 'Select Range') {
                                        element.dragOrigin = element.cellFloatingButtonContainer.targetCell;
                                        element.selectedCells = [];
                                        clickFunction = function (event) {
                                            //console.log('2***');
                                            var target = GS.findParentElement(event.target, 'td,th');
                                            
                                            if (target) {
                                                element.dragCurrentCell = target;
                                                element.selectionPreviousOrigin = element.dragOrigin;
                                                element.savedSelection = [];
                                                element.savedSelectionCopy = [];
                                                element.numberOfSelections = 1;
                                                element.dragMode = 'select';
                                                
                                                selectHandler(element, element.dragOrigin,
                                                                element.dragCurrentCell, element.dragMode);
                                                
                                                document.activeElement.blur();
                                                event.preventDefault();
                                                element.removeEventListener('click', clickFunction, true);
                                            }
                                        };
                                        
                                        element.addEventListener('click', clickFunction, true);
                                        
                                    } else if (strAnswer === 'Select Records') {
                                        element.dragOrigin = element.cellFloatingButtonContainer.targetCell.parentNode.children[0];
                                        element.selectedCells = [];
                                        clickFunction = function (event) {
                                            //console.log('3***');
                                            var target = GS.findParentElement(event.target, 'tr');
                                            
                                            if (target) {
                                                element.dragCurrentCell = target.children[0];
                                                element.selectionPreviousOrigin = element.dragOrigin;
                                                element.savedSelection = [];
                                                element.savedSelectionCopy = [];
                                                element.numberOfSelections = 1;
                                                element.dragMode = 'select';
                                                
                                                selectHandler(element, element.dragOrigin,
                                                                element.dragCurrentCell, element.dragMode);
                                                
                                                document.activeElement.blur();
                                                event.preventDefault();
                                                element.removeEventListener('click', clickFunction, true);
                                            }
                                        };
                                        
                                        element.addEventListener('click', clickFunction, true);
                                        
                                    } else if (strAnswer.indexOf('Equals') === 0) {
                                        addWhere(control.getAttribute('column') + '::text = $$' + strMatchText + '$$');
                                        
                                    } else if (strAnswer.indexOf('Doesn\'t Equal') === 0) {
                                        addWhere(control.getAttribute('column') + '::text != $$' + strMatchText + '$$');
                                        
                                    } else if (strAnswer.indexOf('Contains') === 0) {
                                        addWhere(control.getAttribute('column') + '::text LIKE $$%' + strMatchText + '%$$');
                                        
                                    } else if (strAnswer.indexOf('Doesn\'t Contain') === 0) {
                                        addWhere(control.getAttribute('column') + '::text NOT LIKE $$%' + strMatchText + '%$$');
                                        
                                    } else if (strAnswer.indexOf('Starts With') === 0) {
                                        addWhere(control.getAttribute('column') + '::text LIKE $$' + strMatchText + '%$$');
                                        
                                    } else if (strAnswer.indexOf('Ends With') === 0) {
                                        addWhere(control.getAttribute('column') + '::text LIKE $$%' + strMatchText + '$$');
                                    }
                                });
                            });
                        }
                        
                        // hover center next to the cell
                        
                        element.cellFloatingButtonContainer.targetCell = targetCell;
                        element.cellFloatingButtonContainer.targetControl = targetCell.children[0];
                        element.cellFloatingButtonContainer.children[0].removeAttribute('remove-top-left');
                        element.cellFloatingButtonContainer.children[0].removeAttribute('remove-top-right');
                        element.cellFloatingButtonContainer.children[0].removeAttribute('remove-bottom-left');
                        element.cellFloatingButtonContainer.children[0].removeAttribute('remove-bottom-right');
                        
                        // top left
                        if (jsnElementPosition.intRoomAbove > element.cellFloatingButtonContainer.clientHeight &&
                            jsnElementPosition.intRoomLeft > element.cellFloatingButtonContainer.clientWidth) {
                            element.cellFloatingButtonContainer.setAttribute('style',
                                        'left: ' + ((jsnElementPosition.intElementLeft -
                                                        element.cellFloatingButtonContainer.clientWidth) + 4) + 'px;' +
                                        'top: ' + ((jsnElementPosition.intElementTop -
                                                        element.cellFloatingButtonContainer.clientHeight) + 4) + 'px;');
                            
                            element.cellFloatingButtonContainer.children[0].setAttribute('remove-bottom-right', '');
                            
                        // top right
                        } else if (jsnElementPosition.intRoomAbove > element.cellFloatingButtonContainer.clientHeight &&
                                   jsnElementPosition.intRoomRight > element.cellFloatingButtonContainer.clientWidth) {
                            element.cellFloatingButtonContainer.setAttribute('style',
                                        'left: ' + ((jsnElementPosition.intElementLeft +
                                                        jsnElementPosition.intElementWidth) - 4) + 'px;' +
                                        'top: ' + ((jsnElementPosition.intElementTop -
                                                        element.cellFloatingButtonContainer.clientHeight) + 4) + 'px;');
                            
                            element.cellFloatingButtonContainer.children[0].setAttribute('remove-bottom-left', '');
                            
                        // bottom left
                        } else if (jsnElementPosition.intRoomBelow > element.cellFloatingButtonContainer.clientHeight &&
                                   jsnElementPosition.intRoomLeft > element.cellFloatingButtonContainer.clientWidth) {
                            element.cellFloatingButtonContainer.setAttribute('style',
                                        'left: ' + ((jsnElementPosition.intElementLeft -
                                                        element.cellFloatingButtonContainer.clientWidth) + 4) + 'px;' +
                                        'top: ' + ((jsnElementPosition.intElementTop +
                                                        jsnElementPosition.intElementHeight) - 4) + 'px;');
                            
                            element.cellFloatingButtonContainer.children[0].setAttribute('remove-top-right', '');
                            
                        // bottom right
                        } else if (jsnElementPosition.intRoomBelow > element.cellFloatingButtonContainer.clientHeight &&
                                   jsnElementPosition.intRoomRight > element.cellFloatingButtonContainer.clientWidth) {
                            element.cellFloatingButtonContainer.setAttribute('style',
                                        'left: ' + ((jsnElementPosition.intElementLeft +
                                                        jsnElementPosition.intElementWidth) - 4) + 'px;' +
                                        'top: ' + ((jsnElementPosition.intElementTop +
                                                        jsnElementPosition.intElementHeight) - 4) + 'px;');
                            
                            element.cellFloatingButtonContainer.children[0].setAttribute('remove-top-left', '');
                        }
                    }
                    //console.log(targetCell, jsnElementPosition);
                };
                
                element.addEventListener('after_select', function (event) {
                    var arrSelected = element.selectedCells;
                    
                    if (arrSelected.length === 1) {
                        cellFloatingButtonFunction(element.dragCurrentCell || arrSelected[arrSelected.length - 1]);
                        
                    } else if (element.cellFloatingButtonContainer && element.cellFloatingButtonContainer.parentNode) {
                        element.cellFloatingButtonContainer.parentNode.removeChild(element.cellFloatingButtonContainer);
                        element.cellFloatingButtonContainer = null;
                    }
                    //console.log('after_select', arrSelected[arrSelected.length - 1]);
                });
                
                element.addEventListener('focus', function (event) {
                    //var arrSelected = element.selectedCells;
                    
                    if (event.target.hasAttribute('column')) { // && arrSelected.length <= 1
                        //alert('focus');
                        cellFloatingButtonFunction(event.target.parentNode);
                        //console.log('focus', event.target);
                    }
                }, true);// this true is for making it so that the focus event (which doesn't bubble) gets captured
                
                // on mousewheel: remove floating button (scroll version of this is in the handleData function)
                element.addEventListener('mousewheel', function (event) {
                    if (element.cellFloatingButtonContainer && element.cellFloatingButtonContainer.parentNode) {
                        element.cellFloatingButtonContainer.parentNode.removeChild(element.cellFloatingButtonContainer);
                        element.cellFloatingButtonContainer = null;
                    }
                });
                
                // ################################################################
                // #################### TOUCH DEVICE CLIPBOARD ####################
                // ################################################################
                
                if (evt.touchDevice) {
                    var rangeFloatingButtonFunction = function (arrSelected) {
                        var i, len, targetCell, arrSelectedRecords, bolCenter = true, jsnElementPosition,
                            intTopBoundry, intBottomBoundry, intLeftBoundry, intRightBoundry;
                        
                        // if no floating button exists for this grid: create/append/bind one
                        if (!element.rangeFloatingButtonContainer || !element.rangeFloatingButtonContainer.parentNode) {
                            element.rangeFloatingButtonContainer = document.createElement('div');
                            element.rangeFloatingButtonContainer.classList.add('floating-button-container');
                            
                            element.rangeFloatingButtonContainer.innerHTML =
                                            '<gs-button icononly icon="clipboard" inline bg-primary no-focus></gs-button>' +
                                            //'<input type="text" value="targetcontrol" style="border: 0 none; width: 1px; height: 1px; overflow: hidden;" />';
                                            '<div contenteditable="true" style="position: fixed;' +
                                                                                'border: 0 none;' +
                                                                                'margin: 0;' +
                                                                                'padding: 0;' +
                                                                                'z-index: -5000;' +
                                                                                'opacity: 0.00000001;' +
                                                                                '-webkit-appearance: none;' +
                                                                                '-moz-appearance: none;"></div>';
                            
                            //readonly="readonly"
                            
                            element.tableContainer.appendChild(element.rangeFloatingButtonContainer);
                            
                            element.rangeFloatingButtonContainer.control = element.rangeFloatingButtonContainer.children[1];
                            
                            element.rangeFloatingButtonContainer.addEventListener('click', function () {
                                element.rangeFloatingButtonContainer.control.innerHTML =
                                                getSelectedCopyHTML(element) || 'Nothing To Copy';
                                //alert(getSelectedCopyHTML(element));
                                //console.log(element.rangeFloatingButtonContainer.children[1].innerHTML);
                                
                                element.rangeFloatingButtonContainer.control.focus();
                                
                                //GS.setInputSelection(element.rangeFloatingButtonContainer.control, 0, 999999999);
                                
                                document.execCommand('selectAll', false, null);
                            });
                            
                            element.rangeFloatingButtonContainer.control.addEventListener('cut', function () {
                                var strUpdateData = '', strInsertData = '', strCurrentRecord, arrSetColumnElements,
                                    arrSetColumns = [],
                                    tr_len, i, len, col_i, col_len, colIndex, arrRecordsToRefresh = [], updateFunction,
                                    arrLines, arrRecords, tbodyElement, arrElements,
                                    strColumns = '', strRoles = '', arrColumns = [], strColumn;
                                
                                
                                // gathering variables for select traversal
                                arrRecords = element.selectedRecords;
                                
                                // if the first record is the header: remove it
                                if (arrRecords[0] && arrRecords[0].parentNode.nodeName === 'THEAD') {
                                    arrRecords[0].splice(0, 1);
                                }
                                
                                arrSetColumnElements = xtag.query(arrRecords[0], '[selected]:not(th)');
                                
                                // gathering update headers
                                for (i = 0, len = element.arrPk.length; i < len; i += 1) {
                                    strRoles += (strRoles ? '\t' : '');
                                    strRoles += 'pk';
                                    
                                    strColumns += (strColumns ? '\t' : '');
                                    strColumns += element.arrPk[i];
                                    
                                    arrColumns.push(element.arrPk[i]);
                                }
                                
                                for (i = 0, len = element.arrLock.length; i < len; i += 1) {
                                    strRoles += (strRoles ? '\t' : '');
                                    strRoles += 'lock';
                                    
                                    strColumns += (strColumns ? '\t' : '');
                                    strColumns += element.arrLock[i];
                                    
                                    arrColumns.push(element.arrLock[i]);
                                }
                                
                                for (i = 0, len = arrSetColumnElements.length; i < len; i += 1) {
                                    strColumn = arrSetColumnElements[i].children[0].getAttribute('column');
                                    
                                    strRoles += (strRoles ? '\t' : '');
                                    strRoles += 'set';
                                    
                                    strColumns += (strColumns ? '\t' : '');
                                    strColumns += strColumn;
                                    
                                    arrSetColumns.push(strColumn);
                                }
                                
                                //console.log(strRoles);
                                //console.log(strColumns);
                                //console.log(arrColumns);
                                //console.log(arrSetColumns);
                                
                                for (i = 0, len = arrRecords.length; i < len; i += 1) {
                                    strCurrentRecord = '';
                                    
                                    // get 'pk' and 'lock' columns
                                    for (col_i = 0, col_len = arrColumns.length; col_i < col_len; col_i += 1) {
                                        strCurrentRecord += (strCurrentRecord ? '\t' : '');
                                        strCurrentRecord += encodeForTabDelimited(
                                                                xtag.query(arrRecords[i], '[column="' +
                                                                    encodeForTabDelimited(arrColumns[col_i]) + '"]')[0].value
                                                            );
                                    }
                                    
                                    // get 'set' columns
                                    for (col_i = 0, col_len = arrSetColumns.length; col_i < col_len; col_i += 1) {
                                        strCurrentRecord += (strCurrentRecord ? '\t' : '');
                                    }
                                    
                                    strCurrentRecord += '\n';
                                    strUpdateData += strCurrentRecord;
                                    arrRecordsToRefresh.push(arrRecords[i]);
                                    
                                    // make the records red
                                    arrRecords[i].classList.add('bg-red');
                                }
                                
                                //console.log(strUpdateData);
                                
                                // create transaction
                                GS.addLoader(element, 'Creating Update Transaction...');
                                GS.requestFromSocket(GS.envSocket, 'BEGIN', function (data, error, errorData) {
                                    var transactionID;
                                    GS.removeLoader(element);
                                    
                                    if (!error) {
                                        transactionID = parseInt(data.substring('transactionid = '.length, data.indexOf('\n')));
                                        GS.addLoader(element, 'Creating Update Transaction...');
                                        
                                        // request update
                                        GS.requestFromSocket(GS.envSocket,
                                                             'transactionid = ' + transactionID + '\n' +
                                                    'UPDATE\t' + encodeForTabDelimited(element.getAttribute('schema')) + '\t' +
                                                                 encodeForTabDelimited(element.getAttribute('object')) + '\n' +
                                                    'RETURN\t' + getReturn(element) + '\n\n' +
                                                        strRoles + '\n' + strColumns + '\n' + strUpdateData,
                                                    function (data, error, errorData) {
                                            var transactionID, commitFunction, arrElements, i, len;
                                            
                                            GS.removeLoader(element);
                                            
                                            if (!error) {
                                                transactionID = parseInt(data.substring('transactionid = '.length, data.indexOf('\n')));
                                                data = data.substring(data.indexOf('\n') + 1);
                                                
                                                //// remove red from records
                                                //arrElements = xtag.query(element, '.bg-red');
                                                //for (i = 0, len = arrElements.length; i < len; i += 1) {
                                                //    arrElements[i].classList.remove('bg-red');
                                                //}
                                                
                                                // make the records amber and refresh their data
                                                refreshRecordsAfterUpdate(element, arrRecordsToRefresh, data, 'bg-red', 'bg-amber');
                                                
                                                GS.addLoader(element, 'Commiting Update Transaction...');
                                                GS.requestFromSocket(GS.envSocket,
                                                                    'transactionid = ' + transactionID + '\nCOMMIT',
                                                                    function (data, error, errorData) {
                                                    GS.removeLoader(element);
                                                    
                                                    if (!error) {
                                                        arrElements = xtag.query(element, '.bg-amber');
                                                        for (i = 0, len = arrElements.length; i < len; i += 1) {
                                                            arrElements[i].classList.remove('bg-amber');
                                                            arrElements[i].classList.add('bg-green-fade');
                                                        }
                                                        waitAndClearGreen(arrElements);
                                                        
                                                    } else {
                                                        GS.webSocketErrorDialog(errorData);
                                                    }
                                                });
                                                
                                            } else {
                                                arrElements = xtag.query(element, 'tr.bg-red');
                                                
                                                for (i = 0, len = arrElements.length; i < len; i += 1) {
                                                    arrElements[i].classList.remove('bg-red');
                                                }
                                                
                                                GS.webSocketErrorDialog(errorData);
                                            }
                                        });
                                    }
                                });
                                
                                //element.rangeFloatingButtonContainer.control.blur();
                                //element.rangeFloatingButtonContainer.control.innerHTML = '';
                            });
                            element.rangeFloatingButtonContainer.control.addEventListener('copy', function (event) {
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
                        //arrSelectedRecords = element.selectedRecords;
                        intTopBoundry = 99999999;
                        intBottomBoundry = 99999999;
                        intLeftBoundry = 99999999;
                        intRightBoundry = 99999999;
                        
                        for (i = 0, len = arrSelected.length; i < len; i += 1) {
                            jsnElementPosition = GS.getElementPositionData(arrSelected[i]);
                            //console.log(jsnElementPosition);
                            
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
                            
                            //if (bolCenter &&
                            //        (
                            //            jsnElementPosition.intRoomAbove < 0 ||
                            //            jsnElementPosition.intRoomBelow < 0 ||
                            //            jsnElementPosition.intRoomLeft < 0 ||
                            //            jsnElementPosition.intRoomRight < 0
                            //        )) {
                            //    bolCenter = false;
                            //}
                        }
                        
                        //console.log(bolCenter);
                        //console.log(intTopBoundry, intBottomBoundry, intLeftBoundry, intRightBoundry);
                        
                        //// if the center of the selection is visible:
                        //if (bolCenter) {
                        //    // position the button in the middle of the selection
                        //    element.rangeFloatingButtonContainer.style.left =
                        //                    (intLeftBoundry + (((window.innerWidth - intLeftBoundry) - intRightBoundry) / 2) -
                        //                        (element.rangeFloatingButtonContainer.clientWidth / 2)) + 'px';
                        //    
                        //    element.rangeFloatingButtonContainer.style.top =
                        //                    (intTopBoundry + (((window.innerHeight - intTopBoundry) - intBottomBoundry) / 2) -
                        //                        (element.rangeFloatingButtonContainer.clientHeight / 2)) + 'px';
                        //    
                        //// else:
                        //} else {
                        // find a visible corner
                        // position the button over or inside the visible corner
                        
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
                        //}
                    };
                    
                    element.addEventListener('after_select', function (event) {
                        var arrSelected = element.selectedCells;
                        
                        if (arrSelected.length > 0 && element.numberOfSelections === 1) {
                            rangeFloatingButtonFunction(arrSelected);
                            
                        } else if (element.rangeFloatingButtonContainer && element.rangeFloatingButtonContainer.parentNode) {
                            element.rangeFloatingButtonContainer.parentNode.removeChild(element.rangeFloatingButtonContainer);
                            element.rangeFloatingButtonContainer = null;
                        }
                    });
                }
            }
        }
    }
    
    xtag.register('gs-datagrid', {
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
                    
                }
            }
        },
        events: {},
        accessors: {
            selectedCells: {
                get: function () {
                    return xtag.query(this, '[selected]');
                },
                
                set: function (newValue) {
                    var i, len, intIdIndex, arrCells = xtag.query(this, '[selected]'),
                        cell_i, cell_len, arrRowIndexes = [], arrHeaderIndexes = [],
                        arrRecordSelectors, arrHeaders;
                    
                    // clear old selection
                    for (i = 0, len = arrCells.length; i < len; i += 1) {
                        arrCells[i].removeAttribute('selected');
                    }
                    
                    arrCells = xtag.query(this, '[selected-secondary]');
                    for (i = 0, len = arrCells.length; i < len; i += 1) {
                        arrCells[i].removeAttribute('selected-secondary');
                    }
                    
                    // if newValue is not an array: make it an array
                    if (typeof newValue === 'object' && newValue.length === undefined) {
                        arrCells = [newValue];
                    } else {
                        arrCells = newValue;
                    }
                    
                    // set new selection
                    for (i = 0, len = arrCells.length; i < len; i += 1) {
                        GS.listAdd(arrRowIndexes, arrCells[i].parentNode.rowIndex);
                        GS.listAdd(arrHeaderIndexes, arrCells[i].cellIndex);
                        arrCells[i].setAttribute('selected', '');
                    }
                    
                    // highlight non-selected headers and row selectors
                    
                    arrRecordSelectors = xtag.query(this, 'tbody th, thead th:first-child');
                    for (i = 0, len = arrRecordSelectors.length; i < len; i += 1) {
                        if (arrRowIndexes.indexOf(i) !== -1 && !arrRecordSelectors[i].hasAttribute('selected')) {
                            arrRecordSelectors[i].setAttribute('selected-secondary', '');
                        }
                    }
                    
                    arrHeaders = xtag.query(this, 'thead th');
                    for (i = 0, len = arrHeaders.length; i < len; i += 1) {
                        if (arrHeaderIndexes.indexOf(i) !== -1 && !arrHeaders[i].hasAttribute('selected')) {
                            arrHeaders[i].setAttribute('selected-secondary', '');
                        }
                    }
                    
                    //console.log(arrRecordSelectors, arrHeaders, arrRowIndexes, arrHeaderIndexes);
                    
                    GS.triggerEvent(this, 'after_select');
                }
            },
            
            selectedRecords: {
                get: function () {
                    var i, len, intRecordIndex = -1, arrRecord = [], selected = this.selectedCells;
                    
                    // loop through the selected cells and create an array of trs
                    for (i = 0, len = selected.length; i < len; i += 1) {
                        if (selected[i].parentNode.rowIndex > intRecordIndex && selected[i].parentNode.parentNode.nodeName !== 'THEAD') {
                            intRecordIndex = selected[i].parentNode.rowIndex;
                            
                            arrRecord.push(selected[i].parentNode);
                        }
                    }
                    
                    return arrRecord;
                },
                
                set: function (newValue) {
                    var i, len, cell_i, cell_len, intIdIndex, arrCells = this.selectedCells, arrRecords, arrCellChildren;
                    
                    // clear old selection
                    for (i = 0, len = arrCells.length; i < len; i += 1) {
                        arrCells[i].removeAttribute('selected');
                    }
                    
                    arrCells = xtag.query(this, '[selected-secondary]');
                    for (i = 0, len = arrCells.length; i < len; i += 1) {
                        arrCells[i].removeAttribute('selected-secondary');
                    }
                    
                    // if newValue is not an array: make it an array
                    if (typeof newValue === 'object' && newValue.length === undefined) {
                        arrRecords = [newValue];
                    } else {
                        arrRecords = newValue;
                    }
                    
                    // set new selection
                    for (i = 0, len = arrRecords.length, arrCells = []; i < len; i += 1) {
                        arrCellChildren = arrRecords[i].children;
                        
                        for (cell_i = 0, cell_len = arrCellChildren.length; cell_i < cell_len; cell_i += 1) {
                            arrCells.push(arrCellChildren[cell_i]);
                        }
                    }
                    
                    this.selectedCells = arrCells;
                }
            }
        },
        methods: {
            
        }
    });
});

// ########################################################################################## //
// #################################### STRING FUNCTIONS #################################### //
// ########################################################################################## //

function valueListToHTML(valueText, fieldDelimiter, recordDelimiter, bolFirstContainsHeadings, quoteCharacter, decodeFunction) {
    var i = 0, len = valueText.length, col_i, col_len,
        arrHeadings = [], arrRecords = [], arrRecord = [],
        bolInQuote = false,
        strCell = '',
        strRecord,
        strHTML = '';
    
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
    for (; i < len; i += 1) {
        if (valueText[i] === quoteCharacter && bolInQuote === false) { //"\t or "\n?
            //console.log('1***', valueText[i]);
            bolInQuote = true;
            
        } else if (valueText[i] === quoteCharacter && bolInQuote === true) {
            //console.log('2***', valueText[i]);
            bolInQuote = false;
            
        } else if (valueText[i] === fieldDelimiter && bolInQuote === false) {
            //console.log('3***', valueText[i]);
            arrRecord.push(decodeFunction(strCell));
            strCell = '';
            
        } else if (valueText[i] === recordDelimiter && bolInQuote === false) {
            //console.log('4***', valueText[i]);
            arrRecord.push(decodeFunction(strCell));
            strCell = '';
            
            arrRecords.push(arrRecord);
            arrRecord = [];
            
        } else {
            //console.log('5***', valueText[i]);
            strCell += valueText[i];
        }
    }
    
    //console.log(arrRecords);
    
    // data structure to html
    for (i = 0, len = arrRecords.length; i < len; i += 1) {
        strRecord = '';
        
        for (col_i = 0, col_len = arrRecords[i].length; col_i < col_len; col_i += 1) {
            strRecord += '<td>';
            strRecord += encodeHTML(arrRecords[i][col_i]);
            strRecord += '</td>';
        }
        
        strHTML += '<tr>';
        strHTML += strRecord;
        strHTML += '</tr>';
    }
    
    return '<table>' + strHTML + '</table>';
}

function quoteIdent(strValue) {
    var arrReservedWords = [
            'a', 'abort', 'abs', 'absent', 'absolute',
            'access', 'according', 'action', 'ada', 'add',
            'admin', 'after', 'aggregate', 'all', 'allocate',
            'also', 'alter', 'always', 'analyse', 'analyze',
            'and', 'any', 'are', 'array', 'array_agg',
            'array_max_cardinality', 'as', 'asc', 'asensitive', 'assertion',
            'assignment', 'asymmetric', 'at', 'atomic', 'attribute',
            'attributes', 'authorization', 'avg', 'backward', 'base64',
            'before', 'begin', 'begin_frame', 'begin_partition', 'bernoulli',
            'between', 'bigint', 'binary', 'bit', 'bit_length',
            'blob', 'blocked', 'bom', 'boolean', 'both',
            'breadth', 'by', 'c', 'cache', 'call',
            'called', 'cardinality', 'cascade', 'cascaded', 'case',
            'cast', 'catalog', 'catalog_name', 'ceil', 'ceiling',
            'chain', 'char', 'character', 'characteristics', 'characters',
            'character_length', 'character_set_catalog', 'character_set_name', 'character_set_schema', 'char_length',
            'check', 'checkpoint', 'class', 'class_origin', 'clob',
            'close', 'cluster', 'coalesce', 'cobol', 'collate',
            'collation', 'collation_catalog', 'collation_name', 'collation_schema', 'collect',
            'column', 'columns', 'column_name', 'command_function', 'command_function_code',
            'comment', 'comments', 'commit', 'committed', 'concurrently',
            'condition', 'condition_number', 'configuration', 'connect', 'connection',
            'connection_name', 'constraint', 'constraints', 'constraint_catalog', 'constraint_name',
            'constraint_schema', 'constructor', 'contains', 'content', 'continue',
            'control', 'conversion', 'convert', 'copy', 'corr',
            'corresponding', 'cost', 'count', 'covar_pop', 'covar_samp',
            'create', 'cross', 'csv', 'cube', 'cume_dist',
            'current', 'current_catalog', 'current_date', 'current_default_transform_group', 'current_path',
            'current_role', 'current_row', 'current_schema', 'current_time', 'current_timestamp',
            'current_transform_group_for_type', 'current_user', 'cursor', 'cursor_name', 'cycle',
            'data', 'database', 'datalink', 'date', 'datetime_interval_code',
            'datetime_interval_precision', 'day', 'db', 'deallocate', 'dec',
            'decimal', 'declare', 'default', 'defaults', 'deferrable',
            'deferred', 'defined', 'definer', 'degree', 'delete',
            'delimiter', 'delimiters', 'dense_rank', 'depth', 'deref',
            'derived', 'desc', 'describe', 'descriptor', 'deterministic',
            'diagnostics', 'dictionary', 'disable', 'discard', 'disconnect',
            'dispatch', 'distinct', 'dlnewcopy', 'dlpreviouscopy', 'dlurlcomplete',
            'dlurlcompleteonly', 'dlurlcompletewrite', 'dlurlpath', 'dlurlpathonly', 'dlurlpathwrite',
            'dlurlscheme', 'dlurlserver', 'dlvalue', 'do', 'document',
            'domain', 'double', 'drop', 'dynamic', 'dynamic_function',
            'dynamic_function_code', 'each', 'element', 'else', 'empty',
            'enable', 'encoding', 'encrypted', 'end', 'end-exec',
            'end_frame', 'end_partition', 'enforced', 'enum', 'equals',
            'escape', 'every', 'except', 'exception', 'exclude',
            'excluding', 'exclusive', 'exec', 'execute', 'exists',
            'exp', 'explain', 'expression', 'extension', 'external',
            'extract', 'false', 'family', 'fetch', 'file',
            'filter', 'final', 'first', 'first_value', 'flag',
            'float', 'floor', 'following', 'for', 'force',
            'foreign', 'fortran', 'forward', 'found', 'frame_row',
            'free', 'freeze', 'from', 'fs', 'full',
            'function', 'functions', 'fusion', 'g', 'general',
            'generated', 'get', 'global', 'go', 'goto',
            'grant', 'granted', 'greatest', 'group', 'grouping',
            'groups', 'handler', 'having', 'header', 'hex',
            'hierarchy', 'hold', 'hour', 'id', 'identity',
            'if', 'ignore', 'ilike', 'immediate', 'immediately',
            'immutable', 'implementation', 'implicit', 'import', 'in',
            'including', 'increment', 'indent', 'index', 'indexes',
            'indicator', 'inherit', 'inherits', 'initially', 'inline',
            'inner', 'inout', 'input', 'insensitive', 'insert',
            'instance', 'instantiable', 'instead', 'int', 'integer',
            'integrity', 'intersect', 'intersection', 'interval', 'into',
            'invoker', 'is', 'isnull', 'isolation', 'join',
            'k', 'key', 'key_member', 'key_type', 'label',
            'lag', 'language', 'large', 'last', 'last_value',
            'lateral', 'lc_collate', 'lc_ctype', 'lead', 'leading',
            'leakproof', 'least', 'left', 'length', 'level',
            'library', 'like', 'like_regex', 'limit', 'link',
            'listen', 'ln', 'load', 'local', 'localtime',
            'localtimestamp', 'location', 'locator', 'lock', 'lower',
            'm', 'map', 'mapping', 'match', 'matched',
            'max', 'maxvalue', 'max_cardinality', 'member', 'merge',
            'message_length', 'message_octet_length', 'message_text', 'method', 'min',
            'minute', 'minvalue', 'mod', 'mode', 'modifies',
            'module', 'month', 'more', 'move', 'multiset',
            'mumps', 'name', 'names', 'namespace', 'national',
            'natural', 'nchar', 'nclob', 'nesting', 'new',
            'next', 'nfc', 'nfd', 'nfkc', 'nfkd',
            'nil', 'no', 'none', 'normalize', 'normalized',
            'not', 'nothing', 'notify', 'notnull', 'nowait',
            'nth_value', 'ntile', 'null', 'nullable', 'nullif',
            'nulls', 'number', 'numeric', 'object', 'occurrences_regex',
            'octets', 'octet_length', 'of', 'off', 'offset',
            'oids', 'old', 'on', 'only', 'open',
            'operator', 'option', 'options', 'or', 'order',
            'ordering', 'ordinality', 'others', 'out', 'outer',
            'output', 'over', 'overlaps', 'overlay', 'overriding',
            'owned', 'owner', 'p', 'pad', 'parameter',
            'parameter_mode','parameter_name','parameter_ordinal_position','parameter_specific_catalog','parameter_specific_name',
            'parameter_specific_schema', 'parser', 'partial', 'partition', 'pascal',
            'passing', 'passthrough', 'password', 'path', 'percent',
            'percentile_cont', 'percentile_disc', 'percent_rank', 'period', 'permission',
            'placing', 'plans', 'pli', 'portion', 'position',
            'position_regex', 'power', 'precedes', 'preceding', 'precision',
            'prepare', 'prepared', 'preserve', 'primary', 'prior',
            'privileges', 'procedural', 'procedure', 'public', 'quote',
            'range', 'rank', 'read', 'reads', 'real',
            'reassign', 'recheck', 'recovery', 'recursive', 'ref',
            'references', 'referencing', 'regr_avgx', 'regr_avgy', 'regr_count',
            'regr_intercept', 'regr_r2', 'regr_slope', 'regr_sxx', 'regr_sxy',
            'regr_syy', 'reindex', 'relative', 'release', 'rename',
            'repeatable', 'replace', 'replica', 'requiring', 'reset',
            'respect', 'restart', 'restore', 'restrict', 'result',
            'return', 'returned_cardinality', 'returned_length', 'returned_octet_length', 'returned_sqlstate',
            'returning', 'returns', 'revoke', 'right', 'role',
            'rollback', 'rollup', 'routine', 'routine_catalog', 'routine_name',
            'routine_schema', 'row', 'rows', 'row_count', 'row_number',
            'rule', 'savepoint', 'scale', 'schema', 'schema_name',
            'scope', 'scope_catalog', 'scope_name', 'scope_schema', 'scroll',
            'search', 'second', 'section', 'security', 'select',
            'selective', 'self', 'sensitive', 'sequence', 'sequences',
            'serializable', 'server', 'server_name', 'session', 'session_user',
            'set', 'setof', 'sets', 'share', 'show',
            'similar', 'simple', 'size', 'smallint', 'snapshot',
            'some', 'source', 'space', 'specific', 'specifictype',
            'specific_name', 'sql', 'sqlcode', 'sqlerror', 'sqlexception',
            'sqlstate', 'sqlwarning', 'sqrt', 'stable', 'standalone',
            'start', 'state', 'statement', 'static', 'statistics',
            'stddev_pop', 'stddev_samp', 'stdin', 'stdout', 'storage',
            'strict', 'strip', 'structure', 'style', 'subclass_origin',
            'submultiset', 'substring', 'substring_regex', 'succeeds', 'sum',
            'symmetric', 'sysid', 'system', 'system_time', 'system_user',
            't', 'table', 'tables', 'tablesample', 'tablespace',
            'table_name', 'temp', 'template', 'temporary', 'text',
            'then', 'ties', 'time', 'timestamp', 'timezone_hour',
            'timezone_minute', 'to', 'token', 'top_level_count', 'trailing',
            'transaction', 'transactions_committed', 'transactions_rolled_back', 'transaction_active', 'transform',
            'transforms', 'translate', 'translate_regex', 'translation', 'treat',
            'trigger', 'trigger_catalog', 'trigger_name', 'trigger_schema', 'trim',
            'trim_array', 'true', 'truncate', 'trusted', 'type',
            'types', 'uescape', 'unbounded', 'uncommitted', 'under',
            'unencrypted', 'union', 'unique', 'unknown', 'unlink',
            'unlisten', 'unlogged', 'unnamed', 'unnest', 'until',
            'untyped', 'update', 'upper', 'uri', 'usage',
            'user', 'user_defined_type_catalog', 'user_defined_type_code', 'user_defined_type_name', 'user_defined_type_schema',
            'using', 'vacuum', 'valid', 'validate', 'validator',
            'value', 'values', 'value_of', 'varbinary', 'varchar',
            'variadic', 'varying', 'var_pop', 'var_samp', 'verbose',
            'version', 'versioning', 'view', 'volatile', 'when',
            'whenever', 'where', 'whitespace', 'width_bucket', 'window',
            'with', 'within', 'without', 'work', 'wrapper',
            'write', 'xml', 'xmlagg', 'xmlattributes', 'xmlbinary',
            'xmlcast', 'xmlcomment', 'xmlconcat', 'xmldeclaration', 'xmldocument',
            'xmlelement', 'xmlexists', 'xmlforest', 'xmliterate', 'xmlnamespaces',
            'xmlparse', 'xmlpi', 'xmlquery', 'xmlroot', 'xmlschema',
            'xmlserialize', 'xmltable', 'xmltext', 'xmlvalidate', 'year',
            'yes', 'zone'
        ];
    
    strValue = strValue || '';
    
    // if first char is not a lowercase letter or there is a character that is not a lowercase letter, underscore or number
    if (!(/[a-z]/).test(strValue[0]) || (/[^a-z_]/).test(strValue) || arrReservedWords.indexOf(strValue) > -1) {
        strValue = '"' + strValue.replace(/\"/gim, '""') + '"';
    }
    
    return strValue;
}

// disfated's answer at: http://stackoverflow.com/questions/202605/repeat-string-javascript
function stringRepeat(pattern, count) {
    if (count < 1) return '';
    var result = '';
    while (count > 1) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
    }
    return result + pattern;
}

// encodeForTabDelimited('asdf\\asdf\\asdf\r\nasdf\r\nasdf\tasdf\tasdf')
function encodeForTabDelimited(strValue) {
    return  strValue === '\\N' ? strValue :
            strValue.replace(/\\/g, '\\\\') // double up backslashes
                    .replace(/\n/g, '\\n')  // replace newline with the text representation '\n'
                    .replace(/\r/g, '\\r')  // replace carriage return with the text representation '\r'
                    .replace(/\t/g, '\\t')  // replace tab with the text representation '\t'
                    .replace(/^NULL$/g, '\\N');
}

// decodeFromTabDelimited('asdf\\\\asdf\\\\asdf\\r\\nasdf\\r\\nasdf\\tasdf\\tasdf')
function decodeFromTabDelimited(strValue) {
    return strValue.replace(/\\\\/g, '\\')
                   .replace(/\\n/g, '\n')
                   .replace(/\\r/g, '\r')
                   .replace(/\\t/g, '\t')
                   .replace(/\\N/g, 'NULL');
}

//window.addEventListener('load', function () {
//    console.log('0*** PRESENT');
//    document.body.addEventListener(evt.mousedown, function () {
//        console.trace('1*** DOWN', new Date().getTime());
//    });
//    
//    document.body.addEventListener(evt.mouseup, function () {
//        console.trace('2*** UP', new Date().getTime());
//    });
//    
//    document.body.addEventListener('click', function () {
//        console.trace('3*** CLICK', new Date().getTime());
//    });
//});