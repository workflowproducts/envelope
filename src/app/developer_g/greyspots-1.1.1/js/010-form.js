//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps, shimmed, HTMLTemplateElement
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    'use strict';
    addSnippet(
        '<gs-form>',
        '<gs-form>',
        'gs-form src="${1:test.tpeople}">\n' +
        '    <template>\n' +
        '        ${2}\n' +
        '    </template>\n' +
        '</gs-form>'
    );

    addElement('gs-form', '#record_form');

    window.designElementProperty_GSFORM = function (selectedElement) {
        addDataAttributes('select,update');
        addCheck('D', 'Save&nbsp;While&nbsp;Typing', 'save-while-typing');
        addCheck('D', 'Suppress<br />"No&nbsp;Record&nbsp;Found"<br />Error', 'suppress-no-record-found');
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
    // #################################################################
    // ########################### UTILITIES ###########################
    // #################################################################
    
    function removeMessage(element, strMessageName) {
        if (strMessageName === 'saving' && element.savingMessage) {
            element.removeChild(element.savingMessage);
            element.savingMessage = null;
            
        } else if (strMessageName === 'waiting' && element.waitingMessage) {
            element.removeChild(element.waitingMessage);
            element.waitingMessage = null;
        }
    }
    
    function addMessage(element, strMessageName) {
        if (strMessageName === 'saving') {
            if (element.savingMessage) {
                removeMessage(element, 'saving');
            }
            element.savingMessage = document.createElement('div');
            element.savingMessage.classList.add('message');
            element.savingMessage.innerHTML = 'Saving...';
            
            element.appendChild(element.savingMessage);
            
        } else if (strMessageName === 'waiting') {
            if (element.waitingMessage) {
                removeMessage(element, 'waiting');
            }
            element.waitingMessage = document.createElement('div');
            element.waitingMessage.classList.add('message');
            element.waitingMessage.innerHTML = 'Waiting<br />to save...';
            
            element.appendChild(element.waitingMessage);
        }
    }
    
    function columnParentsUntilForm(form, element) {
        var intColumnParents = 0;
        var currentElement = element;
        var maxLoops = 50;
        var i = 0;

        while (currentElement.parentNode !== form && currentElement.parentNode && i < maxLoops) {
            if (currentElement.parentNode.hasAttribute('column') === true //If something with a column attribute
                || currentElement.parentNode.hasAttribute('src') === true) { //or something with a src attribute
                intColumnParents += 1;
            }
            
            currentElement = currentElement.parentNode;
            i += 1;
        }

        return intColumnParents;
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
                  //console.log(element.getAttribute('value'));
                    if (strQSValue !== '' || !element.getAttribute('value')) {
                        element.setAttribute('where', 'id=' + (isNaN(strQSValue) ? '$WHEREQuoTE$' + strQSValue + '$WHEREQuoTE$' : strQSValue));
                        bolRefresh = true;
                    }
                } else {
                    element.setAttribute('where', 'id=' + (isNaN(strQSValue) ? '$WHEREQuoTE$' + strQSValue + '$WHEREQuoTE$' : strQSValue));
                    bolRefresh = true;
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
            
            if (GS.getQueryString() || element.hasAttribute('refresh-on-querystring-change') || element.hasAttribute('src')) {
                bolRefresh = true;
            }
        }
        
        if (bolRefresh && element.hasAttribute('src')) {
            getData(element);
        } else if (bolRefresh && !element.hasAttribute('src')) {
            console.warn('gs-combo Warning: element has "refresh-on-querystring-values" or "refresh-on-querystring-change", but no "src".', element);
        }
        
        element.internal.bolQSFirstRun = true;
    }
    
    function triggerBeforeSelect(element) {
        GS.triggerEvent(element, 'before_select');
        if (element.hasAttribute('onbefore_select')) {
            new Function(element.getAttribute('onbefore_select')).apply(element);
        }
    }

    function triggerAfterSelect(element) {
        GS.triggerEvent(element, 'after_select');
        if (element.hasAttribute('onafter_select')) {
            new Function(element.getAttribute('onafter_select')).apply(element);
        }
    }

    //this one doesn't seem to be working properly
    function triggerBeforeUpdate(element) {
        GS.triggerEvent(element, 'before_update');
        if (element.hasAttribute('onbefore_update')) {
            new Function(element.getAttribute('onbefore_update')).apply(element);
        }
    }

    function triggerAfterUpdate(element) {
        GS.triggerEvent(element, 'after_update');
        if (element.hasAttribute('onafter_update')) {
            new Function(element.getAttribute('onafter_update')).apply(element);
        } else if (element.hasAttribute('afterupdate')) {
            new Function(element.getAttribute('afterupdate')).apply(element);
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
    
    // ##################################################################
    // ######################## UPDATE FUNCTIONS ########################
    // ##################################################################
    
    function emergencyUpdate(element) {
        if (element.currentSaveAjax) {
            element.currentSaveAjax.abort();
        }
        element.bolCurrentlySaving = false;
        updateDataWithoutTemplate(element, false);
    }
    
    function updateData(element, updateElement, strColumn, newValue) {
        var parentRecord;
        var strID;
        var strHash;
        var srcParts = GS.templateWithQuerystring(element.getAttribute('update-src') || element.getAttribute('src')).split('.');
        var strSchema = srcParts[0];
        var strObject = srcParts[1];
        var strReturnCols = element.arrColumns.join('\t');
        var strHashCols = element.lockColumn;
        var strPk;
        var updateFrameData;
        var strRoles;
        var strColumns;
        var arrTotalRecords = [];

        parentRecord = GS.findParentElement(updateElement, '.form-record');

        strPk = element.getAttribute('pk') || 'id';
        strID = parentRecord.getAttribute('data-id');
        strHash = CryptoJS.MD5(parentRecord.getAttribute('data-' + element.lockColumn)).toString();

        strRoles   = 'pk\thash\tset';
        strColumns = strPk + '\thash\t' + GS.encodeForTabDelimited(strColumn);
        updateFrameData = strID + '\t' + strHash + '\t' + GS.encodeForTabDelimited(newValue);
        
        updateFrameData = (strRoles + '\n' + strColumns + '\n' + updateFrameData);
        
        triggerBeforeUpdate(element);
        //GS.triggerEvent(element, 'before_update');
        
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
        
        GS.requestUpdateFromSocket(
            getSocket(element), strSchema, strObject
          , strReturnCols, strHashCols, updateFrameData
            
          , function (data, error) { //, transactionID
                if (error) {
                    if (element.saveTimeout) {
                        clearTimeout(element.saveTimeout);
                    }
                    element.saveState = 'error';

                    getData(element);
                    GS.removeLoader(element);
                    GS.webSocketErrorDialog(data);
                }
            }
          , function (data, error, transactionID, commitFunction, rollbackFunction) {
                // removed by Nunzio on 2019-07-31 because there is no loader
                //GS.removeLoader(element);
                
                if (!error) {
                    if (data === 'TRANSACTION COMPLETED') {
                        if (element.saveTimeout) {
                            clearTimeout(element.saveTimeout);
                        }
                        element.saveState = 'saved';
                        
                        commitFunction();
                    } else {
                        var arrRecords;
                        var arrCells;
                        var i;
                        var len;
                        var cell_i;
                        var cell_len;

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
                    }
                    
                } else {
                    if (element.saveTimeout) {
                        clearTimeout(element.saveTimeout);
                    }
                    element.saveState = 'error';
                    
                    rollbackFunction();
                    getData(element);
                    GS.webSocketErrorDialog(data);
                }
            }
          , function (strAnswer, data, error) {
                var idIndex;
                var i;
                var len;

                //GS.removeLoader(element);

                if (!error) {
                    if (strAnswer === 'COMMIT') {
                        if (element.saveTimeout) {
                            clearTimeout(element.saveTimeout);
                        }
                        element.saveState = 'saved';

                        idIndex = element.lastSuccessData.arr_column.indexOf('id');
                        i = 0;
                        len = element.lastSuccessData.dat.length;
                        while (i < len) {
                            if (String(element.lastSuccessData.dat[i][idIndex]) === strID) {
                                element.lastSuccessData.dat[i] = arrTotalRecords[0];
                                break;
                            }
                            i += 1;
                        }

                        handleData(element, element.lastSuccessData);

                        triggerAfterUpdate(element);
                        //GS.triggerEvent(element, 'after_update');
                    } else {
                        getData(element);
                    }
                } else {
                    if (element.saveTimeout) {
                        clearTimeout(element.saveTimeout);
                    }
                    element.saveState = 'error';

                    getData(element);
                    GS.webSocketErrorDialog(data);
                }
            }
        );
    }
    
    function updateDataWithoutTemplate(element) {
        if (element.bolCurrentlySaving === false && !element.bolErrorOpen) {
            var strID;
            var strHash;
            var srcParts = GS.templateWithQuerystring(element.getAttribute('src')).split('.');
            var strSchema = srcParts[0];
            var strObject = srcParts[1];
            var strReturnCols = element.arrColumns.join('\t');
            var strHashCols = element.lockColumn;
            var updateFrameData;
            var strRoles;
            var strColumns;
            var arrTotalRecords = [];
            var functionUpdateRecord;
            var col_key;
            var key;
            var strColumn;
            var newValue;
            var idIndex;
            var i;
            var len;
            
            functionUpdateRecord = function (strID, strColumn, recordIndex, strParameters) {
                var strWhere;
                var strChangeStamp;
                var strValue;
                var strPk;
                
                element.bolCurrentlySaving = true;
                element.jsnUpdate[strID][strColumn] = undefined;
                
                // run ajax
                removeMessage(element, 'waiting');
                addMessage(element, 'saving');
                element.state = 'saving';
                
                element.saveTimeout = setTimeout(function () {
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
                
                strWhere        = GS.qryGetVal(strParameters, 'where');
                strColumn       = GS.qryGetVal(strParameters, 'column');
                strValue        = GS.qryGetVal(strParameters, 'value');
                strID           = GS.qryGetVal(strWhere,      'id');
                strChangeStamp  = GS.qryGetVal(strWhere,      element.lockColumn);
                strHash = CryptoJS.MD5(strChangeStamp).toString();
                strPk = element.getAttribute('pk') || 'id';

                strRoles   = 'pk\thash\tset';
                strColumns = strPk + '\thash\t' + GS.encodeForTabDelimited(strColumn);
                updateFrameData = strID + '\t' + strHash + '\t' + GS.encodeForTabDelimited(strValue);
                updateFrameData = (strRoles + '\n' + strColumns + '\n' + updateFrameData);
                
                GS.requestUpdateFromSocket(
                    getSocket(element), strSchema, strObject
                  , strReturnCols, strHashCols, updateFrameData
                    
                  , function (data, error, transactionID) {
                        if (error) {
                            getData(element);
                            GS.webSocketErrorDialog(data);
                        }
                    }
                  , function (data, error, transactionID, commitFunction, rollbackFunction) {
                        if (!error) {
                            if (data === 'TRANSACTION COMPLETED') {
                                commitFunction();
                            } else {
                                var arrRecords;
                                var arrCells;
                                var i;
                                var len;
                                var cell_i;
                                var cell_len;

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
                            }
                            
                        } else {
                            rollbackFunction();
                            getData(element);
                            GS.webSocketErrorDialog(data);
                        }
                    }
                  , function (strAnswer, data, error) {
                        var col_key;
                        var key;
                        var bolSaveWaiting;

                        removeMessage(element, 'saving');
                        element.state = 'saved';
                        if (element.saveTimeout) {
                            clearTimeout(element.saveTimeout);
                        }

                        GS.removeLoader(element);

                        if (!error) {
                            if (strAnswer === 'COMMIT') {
                                element.lastSuccessData.dat[recordIndex] = arrTotalRecords[0];
                                element.bolCurrentlySaving = false;

                                // if there is another save in the pipeline: bolSaveWaiting = true
                                for (key in element.jsnUpdate) {
                                    for (col_key in element.jsnUpdate[key]) {
                                        if (element.jsnUpdate[key][col_key] !== undefined) {
                                            bolSaveWaiting = true;
                                            break;
                                        }
                                    }
                                }

                                // if there is a save waiting: update again
                                if (bolSaveWaiting) {
                                    updateDataWithoutTemplate(element);
                                    
                                } else {
                                    triggerAfterUpdate(element);
                                }
                            } else {
                                getData(element);
                            }
                        } else {
                            GS.webSocketErrorDialog(data);
                        }
                    }
                );
            };
            
            // loop through the jsnUpdate variable and make one update for every record that needs an update
            for (key in element.jsnUpdate) {
                for (col_key in element.jsnUpdate[key]) {
                    if (element.jsnUpdate[key][col_key] !== undefined) {
                        strID = key;
                        strColumn = col_key;
                        newValue = element.jsnUpdate[key][col_key];
                        idIndex = element.lastSuccessData.arr_column.indexOf('id');
                        
                        i = 0;
                        len = element.lastSuccessData.dat.length;
                        while (i < len) {
                            if (String(element.lastSuccessData.dat[i][idIndex]) === strID) {
                                functionUpdateRecord(strID, strColumn, i,
                                            'where=' + encodeURIComponent(
                                                'id=' + strID +
                                                '&' + element.lockColumn + '=' + GS.envGetCell(element.lastSuccessData, i, element.lockColumn)
                                            ) +
                                            '&column=' + strColumn +
                                            '&value=' +  encodeURIComponent(newValue));
                                
                                break;
                            }
                            i += 1;
                        }
                        
                        break;
                    }
                }
            }
        }
    }
    
    
    // #################################################################
    // ######################### DATA HANDLING #########################
    // #################################################################

    function dataTemplateRecords(element, data) {
        var jsnTemplate;
        var strRet;
        
        jsnTemplate = GS.templateHideSubTemplates(element.templateHTML);
        
        strRet = GS.templateWithEnvelopeData('<div class="form-record" ' + (data.dat.length === 1 ? 'style="height: 100%;" ' : '') +
                                                'data-id="{{! row.id }}" data-' + element.lockColumn + '="{{! row.' + element.lockColumn + ' }}" gs-dynamic>' +
                                                jsnTemplate.templateHTML +
                                            '</div>',
                                            data);
        strRet = GS.templateShowSubTemplates(strRet, jsnTemplate);
        
        return strRet;
    }
    
    // handles data result from method function: getData 
    //      success:  template
    //      error:    add error classes
    function handleData(element, data, error) {
        var arrElements;
        var i;
        var len;
        var intColumnElementFocusNumber;
        var jsnSelection;
        var matchElement;
        var templateElement = document.createElement('template');
        var focusTimerID;
        var focusToElement;
        var timer_i;
        
        // clear any old error status
        element.classList.remove('error');
        
        if (!error && data.dat.length === 0 && !element.hasAttribute('limit') && !element.hasAttribute('suppress-no-record-found')) {
            templateElement.setAttribute('data-theme', 'error');
            templateElement.innerHTML = ml(function () {/*
                <gs-page>
                    <gs-header><center><h3>Error</h3></center></gs-header>
                    <gs-body padded>
                        <center>No record found</center>
                    </gs-body>
                    <gs-footer>
                        <gs-grid>
                            <gs-block><gs-button dialogclose>Cancel</gs-button></gs-block>
                            <gs-block><gs-button dialogclose listen-for-return bg-primary>Try Again</gs-button></gs-block>
                        </gs-grid>
                    </gs-footer>
                </gs-page>
            */});
            
            GS.openDialog(templateElement, '', function (ignore, strAnswer) {
                if (strAnswer === 'Try Again') {
                    element.refresh();
                }
            });
        }
        
        // if there was no error
        if (!error) {
            element.error = false;
            
            // save success data
            element.lastSuccessData = data;
            
            if (GS.findParentElement(document.activeElement, 'gs-form') === element) {
                //console.log('Hey');
                arrElements = xtag.query(element, '[column]');
                matchElement = GS.findParentElement(document.activeElement, '[column]');
                
                if (document.activeElement.nodeName === 'INPUT' || document.activeElement.nodeName === 'TEXTAREA') {
                    jsnSelection = GS.getInputSelection(document.activeElement);
                }
                
                if (matchElement) {
                    i = 0;
                    len = arrElements.length;
                    while (i < len) {
                        if (arrElements[i] === matchElement) {
                            intColumnElementFocusNumber = i;
                            break;
                        }
                        i += 1;
                    }
                }
            }
            
            //console.log(element.children);
            element.innerHTML = dataTemplateRecords(element, data);
            //console.log(element.children);
            
            // if template is not native: handle templates inside the form
            if (shimmed.HTMLTemplateElement) {
                HTMLTemplateElement.bootstrap(element);
            }
            
            // handle autofocus
            arrElements = xtag.query(element, '[autofocus]');
            
            if (arrElements.length > 0 && !evt.touchDevice) {
                arrElements[0].focus();
                
                if (arrElements.length > 1) {
                    console.warn('dialog Warning: Too many [autofocus] elements, defaulting to the first one. Please have only one [autofocus] element per form.');
                }
            }
            
            // if there is a intColumnElementFocusNumber: restore focus
            if (intColumnElementFocusNumber) {
                arrElements = xtag.query(element, '[column]');

                if (arrElements.length > intColumnElementFocusNumber) {
                    focusToElement = arrElements[intColumnElementFocusNumber];

                    // if element registration is not shimmed, we can just focus into the target element
                    if (shimmed.registerElement === false) {
                        focusToElement.focus();
                        if (jsnSelection) {
                            GS.setInputSelection(document.activeElement, jsnSelection.start, jsnSelection.end);
                        }

                    // else, we have to check on a loop to see if the element has been upgraded,
                    //      the reason I need to use a loop here is because there is no event for
                    //      when an element is upgraded (if there was then 1000 custom elements
                    //      would emit 1000 events, which is a lot and we don't want to bog the
                    //      browser down)
                    } else {
                        timer_i = 0;
                        focusTimerID = setInterval(function () {
                            if (focusToElement['__upgraded__'] || timer_i >= 10) {
                                clearTimeout(focusTimerID);
                            }
                            if (focusToElement['__upgraded__']) {
                                focusToElement.focus();
                                if (jsnSelection) {
                                    GS.setInputSelection(document.activeElement, jsnSelection.start, jsnSelection.end);
                                }
                            }
                            timer_i += 1;
                        }, 5);
                    }
                }
            }
            
            // trigger after_select
            triggerAfterSelect(element);
            //GS.triggerEvent(element, 'after_select');
            
        // else there was an error: add error class, title attribute
        } else {
            element.error = true;
            element.classList.add('error');
            element.innerHTML = 'This form encountered an error.';

            //GS.ajaxErrorDialog(event.detail.response);
            GS.ajaxErrorDialog(data);
        }
    }
    
    // handles fetching the data
    //      if bolInitalLoad === true then
    //          use: initialize query COALESCE TO source query
    //      else
    //          use: source query
    function getData(element) { //bolClearPrevious
        var strSrc     = GS.templateWithQuerystring(element.getAttribute('src'));
        var bolQuery   = strSrc[0] === '(';
        var srcParts   = strSrc[0] === '(' ? [strSrc, ''] : strSrc.split('.');
        var strSchema  = srcParts[0];
        var strObject  = srcParts[1];
        var strColumns = GS.templateWithQuerystring(element.getAttribute('cols') || '*').split(',').join('\t');
        var strWhere   = GS.templateWithQuerystring(element.getAttribute('where') || '');
        var strOrd     = GS.templateWithQuerystring(element.getAttribute('ord') || '');
        var strLimit   = GS.templateWithQuerystring(element.getAttribute('limit') || '1');
        var strOffset  = GS.templateWithQuerystring(element.getAttribute('offset') || '');
        var arrTotalRecords = [];
        
        triggerBeforeSelect(element);
        //GS.triggerEvent(element, 'before_select');
        
        GS.requestSelectFromSocket(getSocket(element), bolQuery ? '' : strSchema, bolQuery ? strSrc : strObject, strColumns
                                 , strWhere, strOrd, strLimit, strOffset
                                 , function (data, error) {
            var arrRecords;
            var arrCells;
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
                    element.arrColumns = data.arrColumnNames;

                    handleData(element, {
                        "arr_column": data.arrColumnNames
                      , "dat": arrTotalRecords
                      , "row_count": arrTotalRecords.length
                    }, '', 'load');
                }
            } else {
                GS.webSocketErrorDialog(data);
            }
        });
    }
    
    
    
    // #################################################################
    // ########################### LIFECYCLE ###########################
    // #################################################################
    
    // dont do anything that modifies the element here
    function elementCreated(element) {
        // if "created" hasn't been suspended: run created code
        if (!element.hasAttribute('suspend-created')) {
            
        }
    }
    
    function elementInserted(element) {
        var firstChildElement;
        var changeHandler;

        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            if (element.children.length === 0) {
                throw 'GS-Form Error: No template provided';
            }
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                // #############################################################################################
                // ###  ######################
                // #############################################################################################

                element.inserted = true;
                element.internal = {};
                saveDefaultAttributes(element);

                firstChildElement = element.children[0];


                // #############################################################################################
                // ### PREVENT CHANGES FROM BEING LOST WHEN NAVIGATING AWAY FROM THE PAGE ######################
                // #############################################################################################

                // if this form has the "save-while-typing" attribute
                if (element.hasAttribute('save-while-typing')) {
                    GS.addBeforeUnloadEvent(function () {
                        if (element.bolCurrentlySaving || element.saveTimerID) {
                            return 'The page has not finished saving.';
                        }
                    });
                } else {
                    // this prevents the issue where you type in a change but then unload
                    //      the page without causing a change event to fire, which means you lose your change
                    GS.addBeforeUnloadEvent(function () {
                        document.activeElement.blur();
                    });
                }


                // #############################################################################################
                // ### DEFAULT #################################################################################
                // #############################################################################################

                // lock attribute and defaulting
                element.lockColumn = element.getAttribute('lock') || 'change_stamp';


                // #############################################################################################
                // ### TEMPLATE SAVING #########################################################################
                // #############################################################################################

                // if the first child is a template element: save its HTML
                if (firstChildElement.nodeName === 'TEMPLATE') {
                    element.templateHTML = firstChildElement.innerHTML;

                // else: save the innerHTML of the form and send a warning
                } else {
                    console.warn('Warning: gs-form is now built to use a template element. ' +
                                 'Please use a template element to contain the template for this form. ' + // this warning was added: March 12th 2015
                                 'A fix has been included so that it is not necessary to use the template element, but that code may be removed at a future date.');

                    element.templateHTML = element.innerHTML;
                }

                // if there is no HTML: throw an error
                if (!element.templateHTML.trim()) { throw 'GS-FORM error: no template HTML.'; }

                if (element.templateHTML.indexOf('&gt;') > -1 || element.templateHTML.indexOf('&lt;') > -1) {
                    console.warn('GS-FORM WARNING: &gt; or &lt; detected in record template, this can have undesired effects on doT.js. Please use gt(x,y), gte(x,y), lt(x,y), or lte(x,y) to silence this warning.');
                }

                // add a doT.js coded "value" attribute to any element with a "column" attribute but no "value" attribute
                element.templateHTML = GS.templateColumnToValue(element.templateHTML);


                // #############################################################################################
                // ### "QS" ATTRIBUTE ##########################################################################
                // #############################################################################################
                
                // handle "qs" attribute
                if (
                    element.getAttribute('qs') ||
                    element.getAttribute('refresh-on-querystring-values') ||
                    element.hasAttribute('refresh-on-querystring-change')
                ) {
                    element.popValues = {};
                    pushReplacePopHandler(element);
                    window.addEventListener('pushstate',    function () { pushReplacePopHandler(element); });
                    window.addEventListener('replacestate', function () { pushReplacePopHandler(element); });
                    window.addEventListener('popstate',     function () { pushReplacePopHandler(element); });
                } else {
                    getData(element);
                }


                // #############################################################################################
                // ### ARROW FIELD NAVIGATION ##################################################################
                // #############################################################################################

                element.addEventListener('keydown', function (event) {
                    var intKeyCode = (event.which || event.keyCode);
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
                        jsnSelection = GS.getInputSelection(event.target);
                    }

                    if (
                        // Left arrow
                        (
                            intKeyCode === 37 &&
                            (!jsnSelection || jsnSelection.start === 0)
                        ) ||
                        // Right arrow
                        (
                            intKeyCode === 39 &&
                            (!jsnSelection || jsnSelection.end === event.target.value.length)
                        )
                    ) {
                        // Left arrow
                        if (
                            intKeyCode === 37 &&
                            (!jsnSelection || jsnSelection.start === 0)
                        ) {
                            arrElementsFocusable = xtag.query(
                                document,
                                'input:not([disabled]), ' +
                                'select:not([disabled]), ' +
                                'memo:not([disabled]), ' +
                                'button:not([disabled]), ' +
                                '[tabindex]:not([disabled]), ' +
                                '[column]'
                            );

                            i = 0;
                            len = arrElementsFocusable.length;
                            while (i < len) {
                                currentElement = arrElementsFocusable[i];

                                if (
                                    currentElement === event.target ||
                                    (
                                        (
                                            event.target.nodeName === 'INPUT' ||
                                            event.target.nodeName === 'TEXTAREA'
                                        ) &&
                                        currentElement === event.target.parentNode
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
                        } else if (
                            intKeyCode === 39 &&
                            (!jsnSelection || jsnSelection.end === event.target.value.length)
                        ) {
                            arrElementsFocusable = xtag.query(
                                document,
                                'input:not([disabled]), ' +
                                'select:not([disabled]), ' +
                                'memo:not([disabled]), ' +
                                'button:not([disabled]), ' +
                                '[tabindex]:not([disabled]), ' +
                                '[column]'
                            );
                            
                            i = 0;
                            len = arrElementsFocusable.length;
                            while (i < len) {
                                currentElement = arrElementsFocusable[i];
                                if (currentElement === event.target) {
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
                                GS.setInputSelection(document.activeElement, 0, document.activeElement.value.length);
                            }
                        }
                    }
                });
                
                // bind save code
                if (element.hasAttribute('save-while-typing')) {
                    element.bolCurrentlySaving = false;
                    element.jsnUpdate = {};
                    element.state = 'saved';
                    //element.currentSaveAjax = false;
                    
                    // possible states:
                    //      'saved'
                    //      'waiting to save'
                    //      'saving'
                    
                    // JSON object for holding columns to update
                    // on keydown, keyup, change add to JSON object
                    // keep updating until all columns have been saved (undefined marks an empty column)
                    
                    changeHandler = function (event) {
                        var newValue;
                        var targetColumnParent = GS.findParentElement(event.target, '[column]');
                        var parentRecordElement;
                        var strID;

                        if (targetColumnParent.getAttribute('column') && columnParentsUntilForm(element, targetColumnParent) === 0 &&
                            element.column(targetColumnParent.getAttribute('column')) !== targetColumnParent.value) {
                            
                            //event.stopPropagation();
                            if (element.saveTimerID) {
                                clearTimeout(element.saveTimerID);
                                element.saveTimerID = null;
                            }
                            
                            addMessage(element, 'waiting');
                            element.state = 'waiting to save';
                            
                            if (
                                targetColumnParent.value !== null &&
                                targetColumnParent.value !== null
                            ) {
                                newValue = targetColumnParent.value;
                            } else {
                                newValue = targetColumnParent.checked;
                            }
                            
                            parentRecordElement = GS.findParentElement(targetColumnParent, '.form-record[data-id]');
                            strID = parentRecordElement.getAttribute('data-id');
                            
                            if (!element.jsnUpdate[strID]) {
                                element.jsnUpdate[strID] = element.jsnUpdate[strID] = {};
                            }
                            element.jsnUpdate[strID][targetColumnParent.getAttribute('column')] = newValue;
                            
                            element.saveTimerID = setTimeout(function () {
                                updateDataWithoutTemplate(element);
                                element.saveTimerID = null;
                            }, 300);
                        }
                    };

                    element.addEventListener('keydown', changeHandler);
                    element.addEventListener('keyup', changeHandler);
                    element.addEventListener('change', changeHandler);
                    
                } else {
                    element.addEventListener('change', function (event) {
                        var newValue;
                        
                        if (event.target.getAttribute('column')
                                && columnParentsUntilForm(element, event.target) === 0
                                && GS.findParentTag(event.target, 'gs-form') === element) {
                            //event.stopPropagation();
                            
                            if (event.target.value !== null) {
                                newValue = event.target.value;
                            } else {
                                newValue = event.target.checked;
                            }
                            
                            updateData(element, event.target, event.target.getAttribute('column'), newValue);
                        }
                    });
                }
            }
        }
    }
    
    xtag.register('gs-form', {
        lifecycle: {
            created: function () {
                elementCreated(this);
            },
            
            inserted: function () {
                elementInserted(this);
            },
            
            attributeChanged: function (strAttrName, ignore, newValue) {//oldValue
                // if "suspend-created" has been removed: run created and inserted code
                if (strAttrName === 'suspend-created' && newValue === null) {
                    elementCreated(this);
                    elementInserted(this);
                    
                // if "suspend-inserted" has been removed: run inserted code
                } else if (strAttrName === 'suspend-inserted' && newValue === null) {
                    elementInserted(this);
                    
                } else if (!this.hasAttribute('suspend-created') && !this.hasAttribute('suspend-inserted')) {
                    // attribute code
                }
            },
            
            removed: function () {
                if (this.hasAttribute('save-while-typing') && this.saveTimerID) {
                    clearTimeout(this.saveTimerID);
                    emergencyUpdate(this);
                }
            }
        },
        events: {},
        accessors: {},
        methods: {
            refresh: function () {
                getData(this);
            },
            
            save: function () {
                updateDataWithoutTemplate(this, false);
            },
            
            column: function (strColumn) {
                //console.log(this.lastSuccessData);
                return GS.envGetCell(this.lastSuccessData, 0, strColumn);
            },
            
            addMessage: function (strMessageName) {
                return addMessage(this, strMessageName);
            },
            removeMessage: function (strMessageName) {
                return removeMessage(this, strMessageName);
            }
        }
    });
});