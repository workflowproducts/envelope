//global GS, ml, encodeHTML, addProp, registerDesignSnippet, designRegisterElement, xtag, window, document, setOrRemoveTextAttribute, setOrRemoveBooleanAttribute
//jslint this


window.addEventListener('design-register-element', function () {
    "use strict";
    window.designElementProperty_GSFOLDER = function (selectedElement) {
        addProp('Column In Querystring', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('qs') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'qs', this.value, false);
        });

        addProp('Path', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('path') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'path', this.value);
        });

        addProp('Hide Folders', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('no-folders')) + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'no-folders', (this.value === 'true'), true);
        });

        addProp('Hide Files', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('no-files')) + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'no-files', (this.value === 'true'), true);
        });

        addProp('Side-By-Side', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('horizontal')) + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'horizontal', (this.value === 'true'), true);
        });

        addProp('Mini', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('mini')) + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'mini', (this.value === 'true'), true);
        });

        addProp('Disabled', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('mini')) + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'disabled', (this.value === 'true'), true);
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

        addProp('Before Update', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('onbefore_update') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'onbefore_update', this.value);
        });

        addProp('After Update', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('onafter_update') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'onafter_update', this.value);
        });

        addProp('Before Delete', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('onbefore_delete') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'onbefore_delete', this.value);
        });

        addProp('After Delete', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('onafter_delete') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'onafter_delete', this.value);
        });
    };

    registerDesignSnippet('<gs-folder>', '<gs-folder>', 'gs-folder path="${0:/}" folder="${1:role}"></gs-folder>');

    designRegisterElement('gs-folder', '/env/app/developer_g/greyspots-' + GS.version() + '/documentation/index.html#controls_folder');
});

(function () {
    'use strict';

    // #################################################################################################
    // ############################################ UTILITY ############################################
    // #################################################################################################

    function getPath(element) {
        var strAttributePath = GS.trim(GS.templateWithQuerystring(element.getAttribute('path') || ''), '/');
        var strInnerPath = element.arrPath.join('/');
        var strRet;

        if (strAttributePath && strInnerPath) {
            strRet = '/' + strAttributePath + '/' + strInnerPath + '/';
        } else if (strAttributePath) {
            strRet = '/' + strAttributePath + '/';
        } else if (strInnerPath) {
            strRet = '/' + strInnerPath + '/';
        }

        return strRet || '/';
    }

    function getRealPath(element) {
        var strAttributePath = GS.trim(GS.templateWithQuerystring(element.getAttribute('path') || ''), '/');
        var arrPath = element.arrPath;
        var strInnerPath;
        var strRet;
        var strPrefix;

        if (element.arrPath[0] === 'app' || strAttributePath.indexOf('app') === 0) {
            strPrefix = '/env';
        } else if (element.arrPath[0] === 'role' || strAttributePath.indexOf('role') === 0) {
            strPrefix = '/env';
        } else if (element.arrPath[0] === 'web_root' || strAttributePath.indexOf('web_root') === 0) {
            strPrefix = '';
            arrPath.splice(0, 1);
        }

        strInnerPath = arrPath.join('/');

        if (strAttributePath && strInnerPath) {
            strRet = '/' + strAttributePath + '/' + strInnerPath + '/';
        } else if (strAttributePath) {
            strRet = '/' + strAttributePath + '/';
        } else if (strInnerPath) {
            strRet = '/' + strInnerPath + '/';
        }

        return (strPrefix || '') + (strRet || '/');
    }

    function getData(element) {
        GS.triggerEvent(element, 'before_select');
        GS.triggerEvent(element, 'onbefore_select');
        if (element.hasAttribute('onbefore_select')) {
            new Function(element.getAttribute('onbefore_select')).apply(element);
        }

        var strPath = getPath(element);
        var bolFolders = !element.hasAttribute('no-folders');
        var bolFiles = !element.hasAttribute('no-files');
        var strHeader;
        var intResponseNumber;
        var arrAllPaths = [];

        element.folderList.innerHTML = '';
        element.fileList.innerHTML = '';

        strHeader = GS.trim('/' + element.arrPath.join('/'), '/');

        // if there is something in the header: wrap it with slashes
        if (strHeader) {
            strHeader = '/' + strHeader + '/';
        }

        element.pathTitle.textContent = strHeader;

        if (element.arrPath.length > 0) {
            element.backButton.removeAttribute('disabled');
        } else {
            element.backButton.setAttribute('disabled', '');
        }
        element.arrFile = [];
        element.arrFolder = [];
        intResponseNumber = 0;
        GS.requestFromSocket(GS.envSocket, 'FILE\tLIST\t' + GS.encodeForTabDelimited(strPath), function (data, error, errorData) {
            var arrPaths;
            var strName;
            var strType;
            var arrCells;
            var i;
            var len;
            var divElement;
            var arrFiles = [];
            var arrFolders = [];

            if (!error && data.trim() && data.indexOf('Failed to get canonical path') === -1) {
                if (data !== 'TRANSACTION COMPLETED') {
                    arrPaths = GS.trim(data, '\n').split('\n');
                    if (intResponseNumber === 0) {
                        element.folderList.innerHTML = '';
                        element.fileList.innerHTML = '';
                    }
                    i = 0;
                    len = arrPaths.length;
                    while (i < len) {
                        arrAllPaths.push(arrPaths[i]);
                        i += 1;
                    }

                    element.arrFile = arrFiles;
                    element.arrFolder = arrFolders;
                    GS.triggerEvent(element, 'change');
                    GS.triggerEvent(element, 'after_select');
                    GS.triggerEvent(element, 'onafter_select');
                    if (element.hasAttribute('onafter_select')) {
                        new Function(element.getAttribute('onafter_select')).apply(element);
                    }

                } else {
                    arrAllPaths.sort();
                    i = 0;
                    len = arrAllPaths.length;
                    while (i < len) {
                        arrCells = arrAllPaths[i].split('\t');
                        strType = GS.decodeFromTabDelimited(arrCells[1]);
                        strName = GS.trim(GS.decodeFromTabDelimited(arrCells[0]), '/');

                        if ((strType === 'folder' && bolFolders) || (strType === 'file' && bolFiles)) {
                            divElement = document.createElement('div');
                            divElement.setAttribute('flex-horizontal', '');
                            divElement.setAttribute('flex-fill', '');
                            divElement.setAttribute('class', strType + '-line');
                            divElement.setAttribute('data-name', strName);

                            if (strType === 'file') {
                                arrFiles.push(element.arrPath.join('/') + '/' + strName);
                                divElement.innerHTML = (
                                    '<gs-button class="more-file" icononly icon="bars" remove-right>File Options</gs-button>' +
                                    '<gs-button class="open-file" flex remove-left>' + encodeHTML(strName) + '</gs-button>'
                                );

                                element.fileList.appendChild(divElement);
                            }

                            if (strType === 'folder') {
                                arrFolders.push(element.arrPath.join('/') + '/' + strName);
                                divElement.innerHTML = (
                                    '<gs-button class="more-folder" icononly icon="bars" remove-right>Folder Options</gs-button>' +
                                    '<gs-button class="open-folder" flex remove-left>' + encodeHTML(strName) + '</gs-button>'
                                );

                                element.folderList.appendChild(divElement);
                            }
                        }
                        i += 1;
                    }
                    
                    if (element.folderList.innerHTML === '') {
                        element.folderList.innerHTML = '<center prevent-text-selection><h4><small>No Folders.</small></h4></center>';
                    }

                    if (element.fileList.innerHTML === '') {
                        element.fileList.innerHTML = '<center prevent-text-selection><h4><small>No Files.</small></h4></center>';
                    }
                }
            } else if (error) {
                if (!element.hasAttribute('no-list-error')) {
                    GS.webSocketErrorDialog(errorData);
                } else {
                    GS.triggerEvent(element, 'after_select');
                    GS.triggerEvent(element, 'onafter_select');
                    if (element.hasAttribute('onafter_select')) {
                        new Function(element.getAttribute('onafter_select')).apply(element);
                    }
                }
            }

            intResponseNumber += 1;
        });
    }

    function prepareElement(element) {
        element.innerHTML = ml(function () {/*
            <div class="root" flex-vertical flex-fill gs-dynamic>
                <span class="path-title"></span>
                <div class="list-container" flex-fill>
                    <div class="folder-list-container" flex-vertical flex-fill flex>
                        <div class="folder-list-header" flex-horizontal>
                            <b flex prevent-text-selection>Folders:</b>
                            <gs-button class="button-back-folder" icon="long-arrow-left" icononly remove-bottom disabled no-focus></gs-button>
                            <gs-button class="button-new-folder" icon="plus" icononly remove-bottom no-focus></gs-button>
                        </div>
                        <div class="folder-list" flex></div>
                    </div>
                    <div class="file-list-container" flex-vertical flex-fill flex>
                        <div class="file-list-header" flex-horizontal>
                            <b flex prevent-text-selection>Files:</b>
                            <gs-button class="button-new-file" icon="plus" icononly remove-bottom no-focus></gs-button>
                            <gs-button class="button-upload-file" icon="upload" icononly remove-bottom no-focus></gs-button>
                        </div>
                        <div class="file-list" flex></div>
                    </div>
                </div>
            </div>*/
        });

        element.root = xtag.queryChildren(element, '.root')[0];
        element.folderListHeader = xtag.query(element.root, '.folder-list-header')[0];
        element.fileListHeader = xtag.query(element.root, '.file-list-header')[0];

        element.folderList = xtag.query(element.root, '.folder-list')[0];
        element.fileList = xtag.query(element.root, '.file-list')[0];

        element.newFolderButton = xtag.query(element.root, '.button-new-folder')[0];
        element.newFileButton = xtag.query(element.root, '.button-new-file')[0];
        element.uploadFileButton = xtag.query(element.root, '.button-upload-file')[0];
        element.backButton = xtag.query(element.root, '.button-back-folder')[0];

        element.pathTitle = xtag.query(element.root, '.path-title')[0];

        element.arrPath = [];
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
        var strQSAttr;
        var arrQSParts;
        var arrAttrParts;
        var strOperator;

        if (strQSCol && strQSCol.indexOf('=') !== -1) {
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
        } else {
            if (element.internal.bolQSFirstRun === true && GS.qryGetKeys(strQS).indexOf(strQSCol) > -1) {
                getData(element);
            }
        }

        element.internal.bolQSFirstRun = true;
    }

    function fileUpload(element) {
        var templateElement = document.createElement('template');
        var strHTML;

        strHTML = ml(function () {/*
            <gs-page>
                <gs-header><center><h3>Upload a File</h3></center></gs-header>
                <gs-body padded>
                    <form class="upload-form" action="/env/upload" method="POST" target="upload_response_gs_folder"
                                enctype="multipart/form-data">*/
        });

        if (element.hasAttribute('upload-choose-file-name')) {
            strHTML += ml(function () {/*
                        <br />
                        <label>File Name:</label>
                        <gs-text class="upload-name" disabled autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false"></gs-text>*/
            });
        } else {
            strHTML += ml(function () {/*
                        <gs-text class="upload-name" hidden></gs-text>*/
            });
        }

        strHTML += ml(function () {/*
                        <input class="upload-path" name="file_name" hidden />

                        <label>File:</label>
                        <gs-text class="upload-file" name="file_content" type="file"></gs-text>
                    </form>
                    <iframe class="upload-frame" name="upload_response_gs_folder" hidden></iframe>
                </gs-body>
                <gs-footer>
                    <gs-grid>
                        <gs-block><gs-button dialogclose>Cancel</gs-button></gs-block>
                        <gs-block><gs-button class="upload-button">Upload File</gs-button></gs-block>
                    </gs-grid>
                </gs-footer>
            </gs-page>*/
        });

        templateElement.innerHTML = strHTML;

        GS.openDialog(templateElement, function () {
            var dialog = this;
            var formElement = xtag.query(dialog, '.upload-form')[0];
            var fileControl = xtag.query(dialog, '.upload-file')[0];
            var nameControl = xtag.query(dialog, '.upload-name')[0];
            var pathControl = xtag.query(dialog, '.upload-path')[0];
            var uploadButton = xtag.query(dialog, '.upload-button')[0];
            var responseFrame = xtag.query(dialog, '.upload-frame')[0];
            var strFileExtension;

            // upload existing file
            uploadButton.addEventListener('click', function () {
                GS.triggerEvent(element, 'before_insert');
                GS.triggerEvent(element, 'onbefore_insert');
                if (element.hasAttribute('onbefore_insert')) {
                    new Function(element.getAttribute('onbefore_insert')).apply(element);
                }

                var strFile = fileControl.value;
                var strName = nameControl.value;

                //console.log(element.innerPath + nameControl.value);
                pathControl.setAttribute('value', getPath(element) + nameControl.value + '.' + strFileExtension);

                if (strName === '' && strFile === '') { // no values (no file and no file name)
                    GS.msgbox('Error', 'No values in form. Please fill in the form.', 'okonly');

                } else if (strFile === '') { // one value missing (no file)
                    GS.msgbox('Error', 'No file selected. Please select a file using the file input.', 'okonly');

                } else if (strName === '') { // one value missing (no file name)
                    GS.msgbox('Error', 'No value in file path textbox. Please fill in file name textbox.', 'okonly');

                } else { // values are filled in submit the form
                    responseFrame.loadListen = true;
                    formElement.submit();
                    GS.addLoader('file-upload', 'Uploading file...');
                }
            });

            fileControl.addEventListener('change', function () {
                var strValue = this.value;

                strFileExtension = strValue.substring(strValue.lastIndexOf('.') + 1);

                nameControl.removeAttribute('disabled');
                nameControl.value = strValue.substring(strValue.lastIndexOf('\\') + 1, strValue.lastIndexOf('.')) || 'filename';
                nameControl.focus();
            });

            nameControl.addEventListener('keydown', function (event) {
                if (event.keyCode === 13) {
                    GS.triggerEvent('click', uploadButton);
                }
            });

            // response frame binding
            responseFrame.addEventListener('load', function () {
                var strResponseText = responseFrame.contentWindow.document.body.textContent;
                var jsnResponse;
                var strResponse;
                var bolError;
                var strError;

                if (responseFrame.loadListen === true) {
                    // get error text
                    try {
                        jsnResponse = JSON.parse(strResponseText);
                    } catch (err) {
                        strResponse = strResponseText;
                    }

                    if (strResponse.trim() === 'Upload Succeeded') {
                        GS.closeDialog(dialog, 'cancel');
                    } else {
                        if (jsnResponse) {
                            if (jsnResponse.stat === true) {
                                bolError = false;
                            } else {
                                bolError = true;
                                if (jsnResponse.dat && jsnResponse.dat.error) {
                                    strError = jsnResponse.dat.error;
                                } else {
                                    strError = jsnResponse.dat;
                                }
                            }
                        } else {
                            bolError = true;
                            strError = strResponse;
                        }

                        // if no error destroy new file popup
                        if (!bolError) {
                            GS.closeDialog(dialog, 'cancel');

                        // if error open error popup
                        } else {
                            GS.msgbox('Error', strError, 'okonly');
                        }
                    }

                    getData(element);
                    GS.removeLoader('file-upload');
                    GS.triggerEvent(element, 'upload-complete');
                    GS.triggerEvent(element, 'after_insert');
                    GS.triggerEvent(element, 'onafter_insert');
                    if (element.hasAttribute('onafter_insert')) {
                        new Function(element.getAttribute('onafter_insert')).apply(element);
                    }
                }
            });
        });
    }


    // ################################################################################################
    // ####################################### FOLDER FUNCTIONS #######################################
    // ################################################################################################

    function folderRename(element, target, strOldPath, strFolderName) {
        var templateElement = document.createElement('template');

        templateElement.setAttribute('data-overlay-close', 'true');
        templateElement.setAttribute('data-max-width', '250px');
        templateElement.innerHTML = ml(function () {/*
            <gs-body padded>
                <label for="gs-file-manager-text-folder-name">Folder Name:</label>
                <gs-text id="gs-file-manager-text-folder-name"></gs-text>
                <hr />
                <gs-grid>
                    <gs-block><gs-button dialogclose style="border-right: 0 none;" remove-right>Cancel</gs-button></gs-block>
                    <gs-block><gs-button dialogclose remove-left>Rename</gs-button></gs-block>
                </gs-grid>
            </gs-body>*/
        });

        GS.openDialogToElement(
            target,
            templateElement,
            'right',
            function () {
                document.getElementById('gs-file-manager-text-folder-name').value = strFolderName;
            },
            function (ignore, strAnswer) { //event
                var strNewPath;

                if (strAnswer === 'Rename') {
                    GS.triggerEvent(element, 'before_update');
                    GS.triggerEvent(element, 'onbefore_update');
                    if (element.hasAttribute('onbefore_update')) {
                        new Function(element.getAttribute('onbefore_update')).apply(element);
                    }
                    strNewPath = getPath(element) + document.getElementById('gs-file-manager-text-folder-name').value;

                    GS.requestFromSocket(
                        GS.envSocket,
                        (
                            'FILE\tMOVE\t' +
                            GS.encodeForTabDelimited(strOldPath) + '\t' +
                            GS.encodeForTabDelimited(strNewPath) + '\n'
                        ),
                        function (data, error, errorData) {
                            if (!error && data.trim() && data.indexOf('Failed to get canonical path') === -1) {
                                if (data === 'TRANSACTION COMPLETED') {
                                    GS.triggerEvent(element, 'after_update');
                                    GS.triggerEvent(element, 'onafter_update');
                                    if (element.hasAttribute('onafter_update')) {
                                        new Function(element.getAttribute('onafter_update')).apply(element);
                                    }
                                    getData(element);
                                }
                            } else if (error) {
                                GS.webSocketErrorDialog(errorData);
                            }
                        }
                    );
                }
            }
        );
    }

    function folderDelete(element, target, strPath, strFolderName) {
        var templateElement = document.createElement('template');

        templateElement.setAttribute('data-overlay-close', 'true');
        templateElement.setAttribute('data-max-width', '250px');
        templateElement.innerHTML = ml(function () {/*
            <gs-body padded>
                Are you sure you want to delete the folder: "<b>{{STRPATH}}</b>"?
                <hr />
                <gs-grid>
                    <gs-block><gs-button dialogclose remove-right style="border-right: 0 none;" listen-for-return>No</gs-button></gs-block>
                    <gs-block><gs-button dialogclose remove-left>Yes</gs-button></gs-block>
                </gs-grid>
            </gs-body>*/
        }).replace(/\{\{STRPATH\}\}/gi, strFolderName);

        GS.openDialogToElement(target, templateElement, 'right', '', function (ignore, strAnswer) { //event
            if (strAnswer === 'Yes') {
                GS.triggerEvent(element, 'before_delete');
                GS.triggerEvent(element, 'onbefore_delete');
                if (element.hasAttribute('onbefore_delete')) {
                    new Function(element.getAttribute('onbefore_delete')).apply(element);
                }
                GS.requestFromSocket(
                    GS.envSocket,
                    'FILE\tDELETE\t' + GS.encodeForTabDelimited(strPath) + '\n',
                    function (data, error, errorData) {
                        if (!error && data.trim() && data.indexOf('Failed to get canonical path') === -1) {
                            if (data === 'TRANSACTION COMPLETED') {
                                GS.triggerEvent(element, 'after_delete');
                                GS.triggerEvent(element, 'onafter_delete');
                                if (element.hasAttribute('onafter_delete')) {
                                    new Function(element.getAttribute('onafter_delete')).apply(element);
                                }
                                getData(element);
                            }
                        } else if (error) {
                            GS.webSocketErrorDialog(errorData);
                        }
                    }
                );
            }
        });
    }

    function newFolder(element, target) {
        var templateElement = document.createElement('template');

        templateElement.setAttribute('data-overlay-close', 'true');
        templateElement.setAttribute('data-max-width', '250px');
        templateElement.innerHTML = ml(function () {/*
            <gs-body padded>
                <label for="gs-file-manager-text-folder-name">New Folder Name:</label>
                <gs-text id="gs-file-manager-text-folder-name"></gs-text>
                <hr />
                <gs-grid>
                    <gs-block><gs-button dialogclose style="border-right: 0 none;" remove-right listen-for-return>Cancel</gs-button></gs-block>
                    <gs-block><gs-button dialogclose remove-left>Create</gs-button></gs-block>
                </gs-grid>
            </gs-body>*/
        });

        GS.openDialogToElement(target, templateElement, 'down', '', function (ignore, strAnswer) { //event
            var strPath;

            if (strAnswer === 'Create') {
                GS.triggerEvent(element, 'before_insert');
                GS.triggerEvent(element, 'onbefore_insert');
                if (element.hasAttribute('onbefore_insert')) {
                    new Function(element.getAttribute('onbefore_insert')).apply(element);
                }
                strPath = getPath(element) + document.getElementById('gs-file-manager-text-folder-name').value;
                GS.requestFromSocket(
                    GS.envSocket,
                    'FILE\tCREATE_FOLDER\t' + GS.encodeForTabDelimited(strPath) + '\n',
                    function (data, error, errorData) {
                        if (!error && data.trim() && data.indexOf('Failed to get canonical path') === -1) {
                            if (data === 'TRANSACTION COMPLETED') {
                                GS.triggerEvent(element, 'after_insert');
                                GS.triggerEvent(element, 'onafter_insert');
                                if (element.hasAttribute('onafter_insert')) {
                                    new Function(element.getAttribute('onafter_insert')).apply(element);
                                }
                                getData(element);
                            }
                        } else if (error) {
                            GS.webSocketErrorDialog(errorData);
                        }
                    }
                );
            }
        });
    }

    function folderOpen(element, target) {
        var lineElement = GS.findParentElement(target, '.folder-line');

        element.arrPath.push(lineElement.getAttribute('data-name'));
        getData(element);
    }

    function backFolder(element) {
        element.arrPath.pop();
        getData(element);
    }

    function folderMenu(element, target) {
        var lineElement = GS.findParentElement(target, '.folder-line');
        var strFolderName = lineElement.getAttribute('data-name');
        var strPath = (getPath(element) + strFolderName);
        var templateElement = document.createElement('template');

        templateElement.setAttribute('data-overlay-close', 'true');
        templateElement.setAttribute('data-max-width', '250px');
        templateElement.innerHTML = ml(function () {/*
            <gs-body padded>
                <gs-button dialogclose remove-bottom style="border-bottom: 0 none;">Rename Folder</gs-button>
                <gs-button dialogclose remove-top>Delete Folder</gs-button>
                <hr />
                <gs-button dialogclose listen-for-return>Cancel</gs-button>
            </gs-body>*/
        });

        GS.openDialogToElement(target, templateElement, 'right', '', function (ignore, strAnswer) { //event
            if (strAnswer === 'Rename Folder') {
                folderRename(element, target, strPath, strFolderName);
            } else if (strAnswer === 'Delete Folder') {
                folderDelete(element, target, strPath, strFolderName);
            }
        });
    }

    // ################################################################################################
    // ######################################## FILE FUNCTIONS ########################################
    // ################################################################################################

    function fileRename(element, target, strOldPath, strFileName) {
        var templateElement = document.createElement('template');

        templateElement.setAttribute('data-overlay-close', 'true');
        templateElement.setAttribute('data-max-width', '250px');
        templateElement.innerHTML = ml(function () {/*
            <gs-body padded>
                <label for="gs-file-manager-text-file-name">File Name:</label>
                <gs-text id="gs-file-manager-text-file-name"></gs-text>
                <hr />
                <gs-grid>
                    <gs-block><gs-button dialogclose style="border-right: 0 none;" remove-right>Cancel</gs-button></gs-block>
                    <gs-block><gs-button dialogclose remove-left>Rename</gs-button></gs-block>
                </gs-grid>
            </gs-body>*/
        });

        GS.openDialogToElement(
            target,
            templateElement,
            'right',
            function () {
                document.getElementById('gs-file-manager-text-file-name').value = strFileName;
            },
            function (ignore, strAnswer) {//event
                var strNewPath;

                if (strAnswer === 'Rename') {
                    GS.triggerEvent(element, 'before_update');
                    GS.triggerEvent(element, 'onbefore_update');
                    if (element.hasAttribute('onbefore_update')) {
                        new Function(element.getAttribute('onbefore_update')).apply(element);
                    }
                    strNewPath = getPath(element) + document.getElementById('gs-file-manager-text-file-name').value;

                    GS.requestFromSocket(
                        GS.envSocket,
                        (
                            'FILE\tMOVE\t' +
                            GS.encodeForTabDelimited(strOldPath) + '\t' +
                            GS.encodeForTabDelimited(strNewPath) + '\n'
                        ),
                        function (data, error, errorData) {
                            if (!error && data.trim() && data.indexOf('Failed to get canonical path') === -1) {
                                if (data === 'TRANSACTION COMPLETED') {
                                    GS.triggerEvent(element, 'after_update');
                                    GS.triggerEvent(element, 'onafter_update');
                                    if (element.hasAttribute('onafter_update')) {
                                        new Function(element.getAttribute('onafter_update')).apply(element);
                                    }
                                    getData(element);
                                }
                            } else if (error) {
                                GS.webSocketErrorDialog(errorData);
                            }
                        }
                    );
                }
            }
        );
    }

    function fileDelete(element, target, strPath, strFileName) {
        var templateElement = document.createElement('template');

        templateElement.setAttribute('data-overlay-close', 'true');
        templateElement.setAttribute('data-max-width', '250px');
        templateElement.innerHTML = ml(function () {/*
            <gs-body padded>
                Are you sure you want to delete the file: "<b>{{STRPATH}}</b>"?
                <hr />
                <gs-grid>
                    <gs-block><gs-button dialogclose style="border-right: 0 none;" remove-right listen-for-return>No</gs-button></gs-block>
                    <gs-block><gs-button dialogclose remove-left>Yes</gs-button></gs-block>
                </gs-grid>
            </gs-body>*/
        }).replace(/\{\{STRPATH\}\}/gi, strFileName);

        GS.openDialogToElement(target, templateElement, 'right', '', function (ignore, strAnswer) { //event
            if (strAnswer === 'Yes') {
                GS.triggerEvent(element, 'before_delete');
                GS.triggerEvent(element, 'onbefore_delete');
                if (element.hasAttribute('onbefore_delete')) {
                    new Function(element.getAttribute('onbefore_delete')).apply(element);
                }
                GS.requestFromSocket(
                    GS.envSocket,
                    'FILE\tDELETE\t' + GS.encodeForTabDelimited(strPath) + '\n',
                    function (data, error, errorData) {
                        if (!error && data.trim() && data.indexOf('Failed to get canonical path') === -1) {
                            if (data === 'TRANSACTION COMPLETED') {
                                GS.triggerEvent(element, 'after_delete');
                                GS.triggerEvent(element, 'onafter_delete');
                                if (element.hasAttribute('onafter_delete')) {
                                    new Function(element.getAttribute('onafter_delete')).apply(element);
                                }
                                getData(element);
                            }
                        } else if (error) {
                            GS.webSocketErrorDialog(errorData);
                        }
                    }
                );
            }
        });
    }

    function fileEdit(strPath) {
        window.open('/env/app/all/file_manager/file_edit.html?socket=true&link=' + encodeURIComponent(strPath));
    }

    function newFile(element, target) {
        var templateElement = document.createElement('template');

        templateElement.setAttribute('data-overlay-close', 'true');
        templateElement.setAttribute('data-max-width', '250px');
        templateElement.innerHTML = ml(function () {/*
            <gs-body padded>
                <label for="gs-file-manager-text-file-name">New File Name:</label>
                <gs-text id="gs-file-manager-text-file-name"></gs-text>
                <hr />
                <gs-grid>
                    <gs-block><gs-button dialogclose style="border-right: 0 none;" remove-right>Cancel</gs-button></gs-block>
                    <gs-block><gs-button dialogclose remove-left>Create</gs-button></gs-block>
                </gs-grid>
            </gs-body>*/
        });

        GS.openDialogToElement(target, templateElement, 'down', '', function (ignore, strAnswer) {//event
            var strPath;
            var strName = document.getElementById('gs-file-manager-text-file-name').value || '';

            if (strAnswer === 'Create' && strName) {
                GS.triggerEvent(element, 'before_insert');
                GS.triggerEvent(element, 'onbefore_insert');
                if (element.hasAttribute('onbefore_insert')) {
                    new Function(element.getAttribute('onbefore_insert')).apply(element);
                }
                strPath = getPath(element) + strName;

                if (document.getElementById('gs-file-manager-text-file-name').value.trim()) {
                    GS.requestFromSocket(
                        GS.envSocket,
                        'FILE\tCREATE_FILE\t' + GS.encodeForTabDelimited(strPath) + '\n',
                        function (data, error, errorData) {
                            if (!error && data.trim() && data.indexOf('Failed to get canonical path') === -1) {
                                if (data === 'TRANSACTION COMPLETED') {
                                    GS.triggerEvent(element, 'after_insert');
                                    GS.triggerEvent(element, 'onafter_insert');
                                    if (element.hasAttribute('onafter_insert')) {
                                        new Function(element.getAttribute('onafter_insert')).apply(element);
                                    }
                                    getData(element);
                                }
                            } else if (error) {
                                GS.webSocketErrorDialog(errorData);
                            }
                        }
                    );
                }
            }
        });
    }

    function fileOpen(element, target) {
        var lineElement = GS.findParentElement(target, '.file-line');

        window.open(location.protocol + '//' + location.host + getRealPath(element) + '' + lineElement.getAttribute('data-name'));
    }

    function fileMenu(element, target) {
        var lineElement = GS.findParentElement(target, '.file-line');
        var strFileName = lineElement.getAttribute('data-name');
        var strPath = getPath(element) + strFileName;
        var templateElement = document.createElement('template');

        templateElement.setAttribute('data-overlay-close', 'true');
        templateElement.setAttribute('data-max-width', '250px');
        templateElement.innerHTML = ml(function () {/*
            <gs-body padded>
                <gs-button dialogclose remove-bottom style="border-bottom: 0 none;">Rename File</gs-button>
                <gs-button dialogclose remove-all style="border-bottom: 0 none;">Delete File</gs-button>
                <gs-button dialogclose remove-top>Edit File</gs-button>
                <hr />
                <gs-button dialogclose listen-for-return>Cancel</gs-button>
            </gs-body>*/
        });

        GS.openDialogToElement(target, templateElement, 'right', '', function (ignore, strAnswer) { //event
            if (strAnswer === 'Rename File') {
                fileRename(element, target, strPath, strFileName);
            } else if (strAnswer === 'Delete File') {
                fileDelete(element, target, strPath, strFileName);
            } else if (strAnswer === 'Edit File') {
                fileEdit(strPath);
            }
        });
    }


    // ################################################################################################
    // ############################################# XTAG #############################################
    // ################################################################################################

    function bindElement(element) {
        if (element.hasAttribute('qs')) {
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

        element.addEventListener('click', function (event) {
            var target = event.target;

            if (target.classList.contains('button-new-folder')) {
                newFolder(element, target);
            } else if (target.classList.contains('button-new-file')) {
                newFile(element, target);
            } else if (target.classList.contains('open-file')) {
                fileOpen(element, target);
            } else if (target.classList.contains('open-folder')) {
                folderOpen(element, target);
            } else if (target.classList.contains('button-back-folder')) {
                backFolder(element, target);
            } else if (target.classList.contains('more-folder')) {
                folderMenu(element, target);
            } else if (target.classList.contains('more-file')) {
                fileMenu(element, target);
            } else if (target.classList.contains('button-upload-file')) {
                fileUpload(element, target);
            }
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

                prepareElement(element);
                bindElement(element);

                //// if no "qs" set or "qs" key set in query string <- non-standard behaviour, you could want
                //if ((!element.hasAttribute('qs') || GS.qryGetVal(GS.getQueryString(), element.getAttribute('qs')))) {
                //    getData(element);
                //}

                getData(element);
                //pushReplacePopHandler(element);
            }
        }
    }

    xtag.register('gs-folder', {
        lifecycle: {
            inserted: function () {
                elementInserted(this);
            },

            attributeChanged: function (strAttrName, ignore, newValue) { //oldValue
                // if "suspend-created" has been removed: run created and inserted code
                if (strAttrName === 'suspend-created' && newValue === null) {
                    elementInserted(this);

                // if "suspend-inserted" has been removed: run inserted code
                } else if (strAttrName === 'suspend-inserted' && newValue === null) {
                    elementInserted(this);

                }// else if (!this.hasAttribute('suspend-created') && !this.hasAttribute('suspend-inserted')) {

                //}
            }
        },
        events: {},
        accessors: {},
        methods: {
            refresh: function () {
                getData(this);
            }
        }
    });
}());