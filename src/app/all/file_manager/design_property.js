//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global replaceCurrentTag, jsnTagData
//jslint browser:true, maxlen:80, white:false, this:true

// # CODE INDEX:          <- (use "find" (CTRL-f or CMD-f) to skip to a section)
//      # TOP             <- (this just brings you back this index)
//      # GLOBAL/CONFIG
//      # UTILITIES
//      # PROPERTY LINE ADD
//      # BULK PROPERTIES
//      # RENDER PROPS LIST
//      # INSTANTIATION
//      # STANDARD ELEMENTS
//          # A ELEMENT
//          # BR ELEMENT
//          # CENTER ELEMENT
//          # DIV ELEMENT
//          # FORM ELEMENT
//          # H1-H6 ELEMENT
//          # HR ELEMENT
//          # IFRAME ELEMENT
//          # IMG ELEMENT
//          # INPUT ELEMENT
//          # LABEL ELEMENT
//          # LINK ELEMENT
//          # META ELEMENT
//          # OPTION ELEMENT
//          # PRE ELEMENT
//          # SCRIPT ELEMENT
//          # SELECT ELEMENT
//          # SPAN ELEMENT
//          # STYLE ELEMENT
//          # TABLE ELEMENT
//          # TBODY ELEMENT
//          # TD ELEMENT
//          # TEMPLATE ELEMENT
//          # TEXTAREA ELEMENT
//          # TH ELEMENT
//          # THEAD ELEMENT
//          # TR ELEMENT
//      # JSLINT
//
// For code that needs to be completed:
//      # NEED CODING


// #############################################################################
// ############################### GLOBAL/CONFIG ###############################
// #############################################################################

// this contains the latest "code" version of the selected element
var codeElement;

// this contains the version of the selected element that we edit
var liveElement;

// this contains all the current properties in array form.
var arrProps;

// this contains the currently viewed tab
var strTab = 'A';

// the code editor is in flux, we've moved as much property pane code to this
//      file as possible, this contains the ID of the element where we want to
//      put the property pane. For quick modification.
var strPropertyPane = 'property-panel-scroll-container';


// #############################################################################
// ################################# UTILITIES #################################
// #############################################################################

// we want to display an intelligent name at the top of the property pane, in
//      the style of a CSS selector. This function takes an element and returns
//      the best CSS selector it can come up with that fits in a small space.
function selectorTitleForElement(element) {
    "use strict";
    var i;
    var len;
    var strSelector;
    var strTemp;

    // if there is an ID attribute
    if (element.getAttribute('id')) {
        return '#' + element.getAttribute('id');
    }

    // first class that
    //      is not equal to "selected" and
    //      is not equal to "designMode" and
    //      is not equal to "design-mark" and
    //      is not equal to "template-container"
    if (element.classList.length > 0) {
        i = 0;
        len = element.classList.length;
        while (i < len) {
            if (
                element.classList[i] !== 'selected' &&
                element.classList[i] !== 'designMode' &&
                element.classList[i] !== 'design-mark' &&
                element.classList[i] !== 'template-container'
            ) {
                return '.' + element.classList[i];
            }
            i += 1;
        }
    }

    // first attribute that
    //      is not class and
    //      is not style and
    //      is not id and
    //      is (when combined with the tagname) less than 25 chars long
    //          (including square braces)
    if (element.attributes.length > 0) {
        i = 0;
        len = element.attributes.length;
        while (i < len) {
            if (element.attributes[i].value) {
                strSelector = (
                    '[' + element.attributes[i].nodeName + '=' +
                    '"' + element.attributes[i].value + '"]'
                );
            } else {
                strSelector = '[' + element.attributes[i].nodeName + ']';
            }

            strTemp = (element.nodeName + strSelector);

            if (
                element.attributes[i].nodeName !== 'class' &&
                element.attributes[i].nodeName !== 'style' &&
                element.attributes[i].nodeName !== 'id' &&
                strTemp.length < 25
            ) {
                return strSelector;
            }
            i += 1;
        }
    }

    return '';
}

// we want a shortcut for adding a text attribute, or removing it if we have no
//      value to set it to.
function setOrRemoveTextAttribute(element, strAttr, strValue) {
    "use strict";
    if (strValue || strValue === 0) {
        element.setAttribute(strAttr, encodeHTML(strValue));
    } else {
        element.removeAttribute(strAttr);
    }
    return element;
}

// we want a shortcut for adding or removing a boolean attribute depending on
//      checkbox state
function setOrRemoveBooleanAttribute(element, attr, checked, trueState, value) {
    "use strict";
    if (checked === trueState) {
        element.setAttribute(attr, (value || ''));
    } else {
        element.removeAttribute(attr);
    }
    return element;
}

// we don't want to show CSS properties for elements that aren't meant to be
//      seen, so this is the central place where we determine if the live
//      element is CSS worthy
function liveElementVisible() {
    "use strict";
    var strTag = liveElement.nodeName.toLowerCase();

    return (
        strTag !== 'html' && strTag !== 'head' && strTag !== 'meta' &&
        strTag !== 'title' && strTag !== 'link' && strTag !== 'script' &&
        strTag !== 'template'
    );
}


// #############################################################################
// ############################# PROPERTY LINE ADD #############################
// #############################################################################

// general property pane addition
function addProp(strCategory, strTitle, bolTable, strHTML, changeFunction) {
    "use strict";
    arrProps.push({
        "category": strCategory,
        "title": strTitle,
        "table": bolTable,
        "html": strHTML,
        "callback": changeFunction
    });
}

// we want as little property pane code in the elements as possible. add text
//      field to property pane
function addText(strCategory, strTitle, strAttr) {
    "use strict";
    var strHTML = (
        '<gs-text class="target" value="' + encodeHTML(
            liveElement.getAttribute(strAttr) || ''
        ) + '" mini></gs-text>'
    );

    addProp(strCategory, strTitle, true, strHTML, function () {
        return setOrRemoveTextAttribute(liveElement, strAttr, this.value);
    });
}

// we want as little property pane code in the elements as possible. add
//      checkbox field to property pane
function addCheck(strCategory, strTitle, strAttr, setVal) {
    "use strict";
    var strHTML = (
        '<gs-checkbox class="target" ' +
        'value="' + (liveElement.hasAttribute(strAttr)) + '" ' +
        'mini></gs-checkbox>'
    );

    addProp(strCategory, strTitle, true, strHTML, function () {
        var func = setOrRemoveBooleanAttribute;
        return func(liveElement, strAttr, this.value === 'true', true, setVal);
    });
}

// we want as little property pane code in the elements as possible. add
//      selectbox field to property pane
function addSelect(strCategory, strTitle, attr, arrValues) {
    "use strict";
    var i;
    var len;
    var strHTML;

    strHTML = '';
    i = 0;
    len = arrValues.length;
    while (i < len) {
        if (typeof arrValues[i] === 'string') {
            strHTML += '<option>' + arrValues[i] + '</option>';
        } else {
            strHTML += (
                '<option value="' + arrValues[i].val + '">' +
                    arrValues[i].txt +
                '</option>'
            );
        }
        i += 1;
    }

    strHTML = (
        '<gs-select class="target" ' +
        'value="' + encodeHTML(liveElement.getAttribute(attr) || '') + '" ' +
        'mini>' +
            strHTML +
        '</gs-select>'
    );

    addProp(strCategory, strTitle, true, strHTML, function () {
        return setOrRemoveTextAttribute(liveElement, attr, this.value);
    });
}

// some attributes allow free-form content while having some reserved options
function addCombo(strCategory, strTitle, attr, arrValues) {
    "use strict";
    var i;
    var len;
    var strHTML;

    strHTML = '';
    i = 0;
    len = arrValues.length;
    while (i < len) {
        if (typeof arrValues[i] === 'string') {
            strHTML += (
                '<tr value="' + arrValues[i] + '">' +
                    '<td>' + arrValues[i] + '</td>' +
                '</tr>'
            );
        } else {
            strHTML += (
                '<tr value="' + arrValues[i].val + '">' +
                    '<td>' + arrValues[i].txt + '</td>' +
                '</tr>'
            );
        }
        i += 1;
    }

    strHTML = (
        '<gs-combo class="target" ' +
        'value="' + encodeHTML(liveElement.getAttribute(attr) || '') + '" ' +
        'mini>' +
            '<template>' +
                '<table>' +
                    '<tbody>' +
                        strHTML +
                    '</tbody>' +
                '</table>' +
            '</template>' +
        '</gs-combo>'
    );

    addProp(strCategory, strTitle, true, strHTML, function () {
        return setOrRemoveTextAttribute(liveElement, attr, this.value);
    });
}

function addAttributeSwitcherProp(strCategory, strTitle, arrAttributes) {
    "use strict";
    var i;
    var len;
    var strCurr;
    var strHTML;

    // sometimes, we want to control the label of "no attributes"
    if (arrAttributes[0] === '' || arrAttributes[0].val === '') {
        strHTML = '';

    // other times, we just want to automatically add an "empty" option
    } else {
        strHTML = '<option></option>';
    }

    i = 0;
    len = arrAttributes.length;
    while (i < len) {
        // build up option list
        if (typeof arrAttributes[i] === 'string') {
            strHTML += '<option>' + arrAttributes[i] + '</option>';

            // we need to know what attribute is currently set
            if (liveElement.hasAttribute(arrAttributes[i])) {
                strCurr = arrAttributes[i];
            }
        } else {
            strHTML += (
                '<option value="' + arrAttributes[i].val + '">' +
                    arrAttributes[i].txt +
                '</option>'
            );

            // we need to know what attribute is currently set
            if (liveElement.hasAttribute(arrAttributes[i].val)) {
                strCurr = arrAttributes[i].val;
            }
        }

        i += 1;
    }

    strHTML = (
        '<gs-select class="target" ' +
        'value="' + encodeHTML(strCurr || '') + '" mini>' +
            strHTML +
        '</gs-select>'
    );

    addProp(strCategory, strTitle, true, strHTML, function () {
        // clear all listed attributes
        i = 0;
        len = arrAttributes.length;
        while (i < len) {
            if (typeof arrAttributes[i] === 'string') {
                liveElement.removeAttribute(arrAttributes[i]);
            } else {
                liveElement.removeAttribute(arrAttributes[i].val);
            }
            i += 1;
        }

        // if we chose an attribute, set it
        if (this.value) {
            liveElement.setAttribute(this.value, '');
        }

        // return element
        return liveElement;
    });
}


// #############################################################################
// ############################## BULK PROPERTIES ##############################
// #############################################################################

function addGlobalProps() {
    "use strict";
    addText('O', 'ID', 'id');
    addText('O', 'Classes', 'class');
    addText('V', 'Style', 'style');
    addText('V', 'Tooltip', 'title');
    addText('O', 'Tabindex', 'tabindex');

    // visiblity
    if (liveElementVisible()) {
        addAttributeSwitcherProp('V', 'Visibility', [
            {"val": "", "txt": "Visible"},
            {"val": "hidden", "txt": "Hidden"},
            {"val": "hide-on-desktop", "txt": "Hidden on desktop"},
            {"val": "hide-on-tablet", "txt": "Hidden on tablet"},
            {"val": "hide-on-phone", "txt": "Hidden on phone"},
            {"val": "show-on-desktop", "txt": "Visible on desktop"},
            {"val": "show-on-tablet", "txt": "Visible on tablet"},
            {"val": "show-on-phone", "txt": "Visible on phone"}
        ]);
    }

    // global events, can't have events unless the element is visible
    if (liveElementVisible()) {
        addText('E', 'On Click', 'onclick');
        addText('E', 'On Mousedown', 'onmousedown');
        addText('E', 'On Mouseup', 'onmouseup');
        addText('E', 'On Mousemove', 'onmousemove');
        addText('E', 'On Keydown', 'onkeydown');
        addText('E', 'On Keyup', 'onkeyup');
        addText('E', 'On Keypress', 'onkeypress');
    }
}

function addDataAttributes(strModes) {
    "use strict";
    strModes = strModes || '';
    strModes = strModes.toLowerCase();

    addText('D', 'Socket', 'socket'); //encodeURIComponent
    addText('D', 'Source', 'src');    //encodeURIComponent

    if (strModes.indexOf('select') > -1) {
        addText('D', 'Columns', 'cols');
        addText('D', 'Where', 'where');
        addText('D', 'Order By', 'ord');
        addText('D', 'Limit', 'limit');
        addText('D', 'Offset', 'offset');
    }
    if (
        strModes.indexOf('update') > -1 ||
        strModes.indexOf('delete') > -1 ||
        strModes.indexOf('insert') > -1
    ) {
        addText('D', 'Primary Keys', 'pk');
    }
    if (
        strModes.indexOf('update') > -1 ||
        strModes.indexOf('delete') > -1
    ) {
        addText('D', 'Lock Columns', 'lock');
    }
    if (strModes.indexOf('insert') > -1) {
        addText('D', 'Sequences', 'seq');
    }
    if (strModes.indexOf('parent-child') > -1) {
        addText('D', 'Parent Column', 'column');
        addText('D', 'Line Column', 'child-column');
    }
}

function addAutocompleteProps() {
    "use strict";
    addSelect('O', 'Autocorrect', 'autocorrect', [
        {"val": "", "txt": "On"},
        {"val": "off", "txt": "Off"}
    ]);
    addSelect('O', 'Autocapitalize', 'autocapitalize', [
        {"val": "", "txt": "On"},
        {"val": "off", "txt": "Off"}
    ]);
    addSelect('O', 'Autocomplete', 'autocomplete', [
        {"val": "", "txt": "On"},
        {"val": "off", "txt": "Off"}
    ]);
    addSelect('O', 'Spellcheck', 'spellcheck', [
        {"val": "", "txt": "On"},
        {"val": "off", "txt": "Off"}
    ]);
}

//function addQSProps() {
//    "use strict";
//
//}

function addFocusEvents(strModes) {
    "use strict";
    strModes = strModes || '';
    strModes = strModes.toLowerCase();

    addText('E', 'On Focus', 'onfocus');
    addText('E', 'On Blur', 'onblur');
    if (strModes.indexOf('static') === -1) {
        addText('E', 'On Change', 'onchange');
    }
}

function addDataEvents(strModes) {
    "use strict";
    strModes = strModes || '';
    strModes = strModes.toLowerCase();

    if (strModes.indexOf('select') > -1) {
        addText('E', 'Before Select', 'onbefore_select');
        addText('E', 'After Select', 'onafter_select');
    }
    if (strModes.indexOf('insert') > -1) {
        addText('E', 'Before Insert', 'onbefore_insert');
        addText('E', 'After Insert', 'onafter_insert');
    }
    if (strModes.indexOf('update') > -1) {
        addText('E', 'Before Update', 'onbefore_update');
        addText('E', 'After Update', 'onafter_update');
    }
    if (strModes.indexOf('delete') > -1) {
        addText('E', 'Before Delete', 'onbefore_delete');
        addText('E', 'After Delete', 'onafter_delete');
    }
}

function addControlProps() {
    "use strict";
    addText('V', 'Placeholder', 'placeholder');
    addText('D', 'Column', 'column');
    addText('D', 'Value', 'value');
    addText('D', 'Name', 'name');
    addCheck('D', 'Disabled', 'disabled');
    addCheck('D', 'Readonly', 'readonly');
}

function addGSControlProps() {
    "use strict";
    addText('D', 'Column', 'column');
    addText('D', 'Value', 'value');
    addCheck('D', 'Disabled', 'disabled');
    addCheck('D', 'Readonly', 'readonly');
    addCheck('V', 'Mini', 'mini');
}

function addFlexContainerProps() {
    "use strict";
    addCheck('V', 'Flex Vertical', 'flex-vertical');
    addCheck('V', 'Flex Horizontal', 'flex-horizontal');
    addCheck('V', 'Flex Fill', 'flex-fill');
}

function addFlexProps() {
    "use strict";
    addCheck('V', 'Flex', 'flex');
}

function addStandardGSProps() {
    "use strict";
    addCheck('O', 'suspend-created', 'suspend-created');
    addCheck('O', 'suspend-inserted', 'suspend-inserted');
}

function addIconProps() {
    "use strict";
    var strIcon = (liveElement.getAttribute('icon') || '');
    addProp(
        'V',
        'Icon',
        true,
        (
            '<div flex-horizontal>' +
            '<gs-text id="prop-icon-input" class="target" mini flex ' +
            'value="' + strIcon + '"></gs-text>' +
            '<gs-button id="icon-btn" mini icononly icon="list" ' +
            'onclick="iconPopup()"></gs-button>' +
            '<style>#icon-btn:after {font-size: 1em;}</style>' +
            '</div>'
        ),
        function () {
            return setOrRemoveTextAttribute(
                liveElement,
                'icon',
                this.value,
                false
            );
        }
    );

    window.iconPopup = function () {
        var i;
        var len;
        var html;
        var arrIcons = GS.iconList();
        var strName;
        var templateElement;

        i = 0;
        len = arrIcons.length;
        html = '';
        while (i < len) {
            strName = arrIcons[i].name;
            html += (
                '<gs-block>' +
                    '<gs-button iconleft icon="' + strName + '" dialogclose>' +
                        strName +
                    '</gs-button>' +
                '</gs-block>'
            );
            i += 1;
        }

        templateElement = document.createElement('template');
        templateElement.setAttribute('data-max-width', '1100px');

        templateElement.innerHTML = ml(function () {/*
            <gs-page>
                <gs-header><center><h3>Choose An Icon</h3></center></gs-header>
                <gs-body padded>
                    <gs-grid widths="1,1,1,1" reflow-at="767px">
                        {{HTML}}
                    </gs-grid>
                </gs-body>
                <gs-footer><gs-button dialogclose>Cancel</gs-button></gs-footer>
            </gs-page>*/
        }).replace('{{HTML}}', html);

        GS.openDialog(templateElement, '', function (ignore, strAnswer) {
            var propInput = document.getElementById('prop-icon-input');

            if (strAnswer !== 'Cancel') {
                propInput.value = strAnswer;
                GS.triggerEvent(propInput, 'change');
            }
        });
    };

    addAttributeSwitcherProp('V', 'Icon&nbsp;Position', [
        {"val": "", "txt": "Default"},
        {"val": "iconleft", "txt": "Left"},
        {"val": "iconright", "txt": "Right"},
        {"val": "icontop", "txt": "Top"},
        {"val": "iconbottom", "txt": "Bottom"},
        {"val": "icononly", "txt": "Icononly"}
    ]);
    addAttributeSwitcherProp('V', 'Icon&nbsp;Rotation', [
        {"val": "", "txt": "None"},
        {"val": "iconrotateright", "txt": "90 degrees"},
        {"val": "iconrotatedown", "txt": "180 degrees"},
        {"val": "iconrotateleft", "txt": "270 degrees"}
    ]);
}

function addBasicThemingProps() {
    "use strict";
    addAttributeSwitcherProp('V', 'Font Color', [
        {"val": "", "txt": "Default"},
        {"val": "txt-primary", "txt": "Primary"},
        {"val": "txt-success", "txt": "Success"},
        {"val": "txt-info", "txt": "Info"},
        {"val": "txt-warning", "txt": "Warning"},
        {"val": "txt-danger", "txt": "Danger"}
    ]);
    addAttributeSwitcherProp('V', 'Background Color', [
        {"val": "", "txt": "Default"},
        {"val": "bg-primary", "txt": "Primary"},
        {"val": "bg-success", "txt": "Success"},
        {"val": "bg-info", "txt": "Info"},
        {"val": "bg-warning", "txt": "Warning"},
        {"val": "bg-danger", "txt": "Danger"}
    ]);
}

function addCornerRoundProps() {
    "use strict";
    var bolTopLeft = !(
        liveElement.hasAttribute('remove-all') ||
        liveElement.hasAttribute('remove-top') ||
        liveElement.hasAttribute('remove-left') ||
        liveElement.hasAttribute('remove-top-left')
    );
    var bolTopRight = !(
        liveElement.hasAttribute('remove-all') ||
        liveElement.hasAttribute('remove-top') ||
        liveElement.hasAttribute('remove-right') ||
        liveElement.hasAttribute('remove-top-right')
    );
    var bolBottomLeft = !(
        liveElement.hasAttribute('remove-all') ||
        liveElement.hasAttribute('remove-bottom') ||
        liveElement.hasAttribute('remove-left') ||
        liveElement.hasAttribute('remove-bottom-left')
    );
    var bolBottomRight = !(
        liveElement.hasAttribute('remove-all') ||
        liveElement.hasAttribute('remove-bottom') ||
        liveElement.hasAttribute('remove-right') ||
        liveElement.hasAttribute('remove-bottom-right')
    );

    addProp(
        'V',
        'Corners',
        true,
        (
            '<center class="target">' +
                '<gs-checkbox value="' + bolTopLeft + '" ' +
                '    remove-right remove-bottom id="tl-crnr" inline>' +
                '</gs-checkbox>' +
                '<gs-checkbox value="' + bolTopRight + '" ' +
                '    remove-left remove-bottom id="tr-crnr" inline>' +
                '</gs-checkbox><br />' +
                '<gs-checkbox value="' + bolBottomLeft + '" ' +
                '    remove-right remove-top id="bl-crnr" inline>' +
                '</gs-checkbox>' +
                '<gs-checkbox value="' + bolBottomRight + '" ' +
                '    remove-left remove-top id="br-crnr" inline>' +
                '</gs-checkbox>' +
            '</center>'
        ),
        function () {
            var topLeft;
            var topRight;
            var bottomLeft;
            var bottomRight;
            var arrAttr = [];
            var i;
            var len;

            topLeft = document.getElementById('tl-crnr').value === 'true';
            topRight = document.getElementById('tr-crnr').value === 'true';
            bottomLeft = document.getElementById('bl-crnr').value === 'true';
            bottomRight = document.getElementById('br-crnr').value === 'true';

            liveElement.removeAttribute('remove-all');
            liveElement.removeAttribute('remove-top');
            liveElement.removeAttribute('remove-bottom');
            liveElement.removeAttribute('remove-left');
            liveElement.removeAttribute('remove-right');
            liveElement.removeAttribute('remove-top-left');
            liveElement.removeAttribute('remove-top-right');
            liveElement.removeAttribute('remove-bottom-left');
            liveElement.removeAttribute('remove-bottom-right');

            if (!topLeft && !topRight && !bottomLeft && !bottomRight) {
                arrAttr.push('remove-all');
            } else if (!topLeft && !topRight) {
                arrAttr.push('remove-top');
            } else if (!bottomLeft && !bottomRight) {
                arrAttr.push('remove-bottom');
            } else if (!topLeft && !bottomLeft) {
                arrAttr.push('remove-left');
            } else if (!topRight && !bottomRight) {
                arrAttr.push('remove-right');
            }

            if (!topLeft && !bottomLeft && arrAttr[0] !== 'remove-all') {
                arrAttr.push('remove-left');
            } else if (!topLeft && topRight) {
                arrAttr.push('remove-top-left');
            } else if (!bottomLeft && bottomRight) {
                arrAttr.push('remove-bottom-left');
            }

            if (!topRight && !bottomRight && arrAttr[0] !== 'remove-all') {
                arrAttr.push('remove-right');
            } else if (topLeft && !topRight) {
                arrAttr.push('remove-top-right');
            } else if (bottomLeft && !bottomRight) {
                arrAttr.push('remove-bottom-right');
            }

            i = 0;
            len = arrAttr.length;
            while (i < len) {
                liveElement.setAttribute(arrAttr[i], '');
                i += 1;
            }

            return liveElement;
        }
    );
}


// #############################################################################
// ############################# RENDER PROPS LIST #############################
// #############################################################################

function renderProps() {
    "use strict";
    var i;
    var len;
    var newRecord;
    var newDiv;
    var sandboxElem = document.getElementById('sandbox');
    var listElem = document.getElementById('element-property-table-tbody');
    var sectionElem = document.getElementById('element-after-section');
    var target;
    var strTitle;
    var bolTable;
    var strHTML;
    var changeFunction;
    var bindTarget;
    var strCategory;
    var buildCategory;

    // .category
    // V = Display
    // D = Data
    // E = Event
    // O = Other

    listElem.innerHTML = '';
    sectionElem.innerHTML = '';

    bindTarget = function (target, changeFunction) {
        target.addEventListener('change', function (event) {
            var replacementElement = changeFunction.apply(this, [event]);

            if (!replacementElement) {
                throw (
                    'property list error: changeFunction() ' +
                    'must return an element.'
                );
            }

            replaceCurrentTag(
                GS.cloneElement(
                    replacementElement,
                    sandboxElem.contentWindow.document
                ),
                codeElement
            );
        });
    };

    buildCategory = function (filterCat) {
        i = 0;
        len = arrProps.length;
        while (i < len) {
            strCategory = arrProps[i].category.toUpperCase();

            if (filterCat === strCategory || filterCat === 'A') {
                strTitle = arrProps[i].title;
                bolTable = arrProps[i].table;
                strHTML = arrProps[i].html;
                changeFunction = arrProps[i].callback;

                if (bolTable === true) {
                    newRecord = document.createElement('tr');
                    newRecord.innerHTML = (
                        '<th>' + strTitle + '</th>' +
                        '<td>' + strHTML + '</td>'
                    );
                    target = xtag.query(newRecord, '.target')[0];
                    listElem.appendChild(newRecord);
                } else {
                    newDiv = document.createElement('div');
                    newDiv.innerHTML = strHTML;
                    target = xtag.query(newDiv, '.target')[0];
                    sectionElem.appendChild(newDiv);
                }

                bindTarget(target, changeFunction);
            }

            i += 1;
        }
    };

    if (strTab === 'A') {
        buildCategory('O');
        buildCategory('D');
        buildCategory('E');
        buildCategory('V');
    } else {
        buildCategory(strTab);
    }
}


// #############################################################################
// ############################### INSTANTIATION ###############################
// #############################################################################

// this is the function used by the file editor to update the property list. If
//      an element is selected, it'll send it. If no element is selected, it'll
//      send nothing.
function propertyList(selected, currentElement) {
    "use strict";
    var propertyPane = document.getElementById(strPropertyPane);
    var docLink;
    var strPropertyFunction;
    var tagName;

    // reset property list array
    arrProps = [];
    //strTab = 'A';

    // if no selected element, destroy property pane and disable
    if (!selected) {
        propertyPane.innerHTML = (
            '<br />' +
            '<br />' +
            '<center><i>Nothing Selected</i></center>'
        );
        propertyPane.setAttribute('disabled', '');
        return false;
    }

    // else, we have an element to edit, let's set everything up
    propertyPane.innerHTML = ml(function () {/*
        <center class="section-heading">
            <a id="element-documentation-link" target="_blank">
                <h5 id="element-property-title"></h5>
            </a>
            <gs-button hidden>Documentation</gs-button>
        </center>
        <gs-optionbox
            id="tab-option"
            onchange="strTab = this.value; renderProps();"
            value="{{TAB}}"
            no-target
        >
            <gs-grid>
                <gs-block><gs-option value="V">Display</gs-option></gs-block>
                <gs-block><gs-option value="D">Data</gs-option></gs-block>
                <gs-block><gs-option value="E">Event</gs-option></gs-block>
                <gs-block><gs-option value="O">Other</gs-option></gs-block>
                <gs-block><gs-option value="A">All</gs-option></gs-block>
            </gs-grid>
        </gs-optionbox>
        <div id="element-property-section">
            <table><tbody id="element-property-table-tbody"></tbody></table>
            <br />
            <div id="element-after-section"></div>
        </div>
        <style>
            #element-documentation-link {
                color: #000;
                text-decoration: none;
            }
            #tab-option gs-option {
                box-shadow: 0 0 0 0 #000 !important;
                border: 2px solid #ccc;
                border-right: 0 none;
                color: #000;
                font-weight: normal;
                font-size: 0.9em;
                line-height: 0.8em;
                border-bottom: 0 none;
            }
            #tab-option gs-option[selected] {
                background-color: #feffcb !important;
            }
            #tab-option gs-block:last-child gs-option {
                border-right: 2px solid #ccc;
            }
        </style>*/
    }).replace(/\{\{TAB\}\}/gi, strTab);
    propertyPane.removeAttribute('disabled', '');

    // set global element variables
    codeElement = currentElement;
    liveElement = GS.cloneElement(
        selected,
        document.getElementById('sandbox').contentWindow.document
    );

    // set tag name at top of property pane
    tagName = selected.nodeName;

    document.getElementById('element-property-title').innerHTML = (
        '<span class="tag-name">' +
            encodeHTML(tagName) +
        '</span>' +
        '<span class="tag-selector">' +
            encodeHTML(selectorTitleForElement(liveElement)) +
        '</span><br />' +
        '<span class="line-number">' +
            'Line #: ' + codeElement.linenumber +
        '</span>'
    );

    // if we have a documentation link, set documentation anchor
    docLink = document.getElementById('element-documentation-link');

    if (jsnTagData[tagName] && jsnTagData[tagName].documentation) {
        docLink.setAttribute('href', jsnTagData[tagName].documentation);
    }

    // time to add properties
    addGlobalProps();

    // get element specific property list (if it exists)
    strPropertyFunction = (
        'designElementProperty_' +
        tagName.replace(/[\-\_]*/gi, '')
    );

    if (window[strPropertyFunction]) {
        window[strPropertyFunction](liveElement);
    }

    // now that all the element specific props have been added, if the element
    //      is a GS element, add the standard GS props
    if (tagName.indexOf('GS') === 0) {
        addStandardGSProps();
    }

    // now that all the properties have been added, it's time to add them to the
    //      HTML. We want to be able to sort and filter the list, so we wait
    //      until all the properties have been added to show them.
    renderProps();
}

// this is to set the default property list and to convice JSLINT that we use
//      the propertyList function.
window.addEventListener('load', function () {
    "use strict";
    propertyList();
});


// #############################################################################
// ############################# STANDARD ELEMENTS #############################
// #############################################################################

// ### A ELEMENT ###
function designElementProperty_A() {
    "use strict";
    addText('O', 'Href', 'href');
    addSelect('O', 'Target', 'target', [
        {'val': '', 'txt': 'Default'},
        {'val': '_self', 'txt': 'Current Window'},
        {'val': '_blank', 'txt': 'New Window'}
    ]);
    addCheck('O', 'Download', 'download');
    addFlexProps();
}

// ### BR ELEMENT ###
function designElementProperty_BR() {
    "use strict";
}

// ### CENTER ELEMENT ###
function designElementProperty_CENTER() {
    "use strict";
    addFlexContainerProps();
    addFlexProps();
}

// ### DIV ELEMENT ###
function designElementProperty_DIV() {
    "use strict";
    addCheck('D', 'Disabled', 'disabled');
    addFlexContainerProps();
    addFlexProps();
}

// ### FORM ELEMENT ###
function designElementProperty_FORM() {
    "use strict";
    addText('D', 'Name', 'name');
    addText('D', 'Action', 'action');
    addSelect('O', 'Method', 'method', [
        {'val': '', 'txt': 'Default'},
        {'val': 'get', 'txt': 'Get'},
        {'val': 'post', 'txt': 'Post'}
    ]);
    addSelect('O', 'Target', 'target', [
        {'val': '', 'txt': 'Default'},
        {'val': '_self', 'txt': 'Current Window'},
        {'val': '_blank', 'txt': 'New Window'},
        {'val': '_top', 'txt': 'Top Window'},
        {'val': '_parent', 'txt': 'Parent Window'}
    ]);
    addFlexContainerProps();
    addFlexProps();
}

// ### H1-H6 ELEMENT ###
function designElementProperty_H1() {
    "use strict";
    addFlexContainerProps();
    addFlexProps();
}
function designElementProperty_H2() {
    "use strict";
    addFlexContainerProps();
    addFlexProps();
}
function designElementProperty_H3() {
    "use strict";
    addFlexContainerProps();
    addFlexProps();
}
function designElementProperty_H4() {
    "use strict";
    addFlexContainerProps();
    addFlexProps();
}
function designElementProperty_H5() {
    "use strict";
    addFlexContainerProps();
    addFlexProps();
}
function designElementProperty_H6() {
    "use strict";
    addFlexContainerProps();
    addFlexProps();
}

// ### HR ELEMENT ###
function designElementProperty_HR() {
    "use strict";
}

// ### IFRAME ELEMENT ###
function designElementProperty_IFRAME() {
    "use strict";
    addText('D', 'Source', 'src');
    addFlexProps();
}

// ### IMG ELEMENT ###
function designElementProperty_IMG() {
    "use strict";
    addText('D', 'Source', 'src');
    addText('V', 'Alt Text', 'alt');
    addFlexProps();
}

// ### INPUT ELEMENT ###
function designElementProperty_INPUT() {
    "use strict";
    addControlProps();
    addSelect('D', 'Type', 'type', [
        'button', 'checkbox', 'color', 'date', 'datetime', 'datetime', 'email',
        'file', 'hidden', 'image', 'month', 'number', 'password', 'radio',
        'range', 'reset', 'search', 'submit', 'tel', 'text', 'time', 'url',
        'week'
    ]);
    addText('D', 'Maxlength', 'maxlength');
    addCheck('O', 'Autofocus', 'autofocus');
    addAutocompleteProps();
    addFlexContainerProps();
    addFlexProps();
}

// ### LABEL ELEMENT ###
function designElementProperty_LABEL() {
    "use strict";
    addText('O', 'For', 'for');
    addCheck('V', 'Mini', 'mini');
    addFlexContainerProps();
    addFlexProps();
}

// ### LINK ELEMENT ###
function designElementProperty_LINK() {
    "use strict";
    addText('D', 'Href', 'href');
    addSelect('D', 'Relation', 'rel', [
        'stylesheet', 'alternate', 'author', 'dns-prefetch', 'help', 'icon',
        'license', 'next', 'pingback', 'preconnect', 'prefetch', 'preload',
        'prerender', 'prev', 'search'
    ]);
    addSelect('D', 'Type', 'type', ['', 'text/css']);
}

// ### META ELEMENT ###
function designElementProperty_META() {
    "use strict";
    addCombo('D', 'Name', 'name', [
        "abstract", "apple-mobile-web-app-capable",
        "apple-mobile-web-app-status-bar-style", "apple-mobile-web-app-title",
        "apple-touch-fullscreen", "author", "category", "Classification",
        "copyright", "coverage", "date", "description", "designer", "directory",
        "distribution", "format-detection", "HandheldFriendly",
        "identifier-URL", "keywords", "language", "medium", "MobileOptimized",
        "owner", "pagename", "rating", "reply-to", "revised", "revisit-after",
        "robots", "search_date", "subject", "subtitle", "summary", "target",
        "topic", "url", "viewport"
    ]);
    addText('D', 'Content', 'content');
    addCombo('D', 'HTTP Header', 'http-equiv', [
        'Content-Security-Policy', 'Content-Type', 'Default-Style', 'Refresh',
        'Expires', 'Pragma', 'Cache-Control', 'imagetoolbar',
        'x-dns-prefetch-control'
    ]);
    addSelect('D', 'Charset', 'charset', [
        {"val": "utf-8", "txt": "UTF-8 (COMMON)"},
        {"val": "US-ASCII", "txt": "US-ASCII"},
        {"val": "ISO-8859-1", "txt": "ISO-8859-1"},
        {"val": "ISO-8859-2", "txt": "ISO-8859-2"},
        {"val": "ISO-8859-3", "txt": "ISO-8859-3"},
        {"val": "ISO-8859-4", "txt": "ISO-8859-4"},
        {"val": "ISO-8859-5", "txt": "ISO-8859-5"},
        {"val": "ISO-8859-6", "txt": "ISO-8859-6"},
        {"val": "ISO-8859-7", "txt": "ISO-8859-7"},
        {"val": "ISO-8859-8", "txt": "ISO-8859-8"},
        {"val": "ISO-8859-9", "txt": "ISO-8859-9"},
        {"val": "ISO-8859-10", "txt": "ISO-8859-10"},
        {"val": "ISO_6937-2-add", "txt": "ISO_6937-2-add"},
        {"val": "JIS_X0201", "txt": "JIS_X0201"},
        {"val": "JIS_Encoding", "txt": "JIS_Encoding"},
        {"val": "Shift_JIS", "txt": "Shift_JIS"},
        {"val": "EUC-JP", "txt": "EUC-JP"},
        {
            "val": "Extended_UNIX_Code_Fixed_Width_for_Japanese",
            "txt": "Extended_UNIX_Code_Fixed_Width_for_Japanese"
        },
        {"val": "BS_4730", "txt": "BS_4730"},
        {"val": "SEN_850200_C", "txt": "SEN_850200_C"},
        {"val": "IT", "txt": "IT"},
        {"val": "ES", "txt": "ES"},
        {"val": "DIN_66003", "txt": "DIN_66003"},
        {"val": "NS_4551-1", "txt": "NS_4551-1"},
        {"val": "NF_Z_62-010", "txt": "NF_Z_62-010"},
        {"val": "ISO-10646-UTF-1", "txt": "ISO-10646-UTF-1"},
        {"val": "ISO_646.basic:1983", "txt": "ISO_646.basic:1983"},
        {"val": "INVARIANT", "txt": "INVARIANT"},
        {"val": "ISO_646.irv:1983", "txt": "ISO_646.irv:1983"},
        {"val": "NATS-SEFI", "txt": "NATS-SEFI"},
        {"val": "NATS-SEFI-ADD", "txt": "NATS-SEFI-ADD"},
        {"val": "NATS-DANO", "txt": "NATS-DANO"},
        {"val": "NATS-DANO-ADD", "txt": "NATS-DANO-ADD"},
        {"val": "SEN_850200_B", "txt": "SEN_850200_B"},
        {"val": "KS_C_5601-1987", "txt": "KS_C_5601-1987"},
        {"val": "ISO-2022-KR", "txt": "ISO-2022-KR"},
        {"val": "EUC-KR", "txt": "EUC-KR"},
        {"val": "ISO-2022-JP", "txt": "ISO-2022-JP"},
        {"val": "ISO-2022-JP-2", "txt": "ISO-2022-JP-2"},
        {"val": "JIS_C6220-1969-jp", "txt": "JIS_C6220-1969-jp"},
        {"val": "JIS_C6220-1969-ro", "txt": "JIS_C6220-1969-ro"},
        {"val": "PT", "txt": "PT"},
        {"val": "greek7-old", "txt": "greek7-old"},
        {"val": "latin-greek", "txt": "latin-greek"},
        {"val": "NF_Z_62-010_(1973)", "txt": "NF_Z_62-010_(1973)"},
        {"val": "Latin-greek-1", "txt": "Latin-greek-1"},
        {"val": "ISO_5427", "txt": "ISO_5427"},
        {"val": "JIS_C6226-1978", "txt": "JIS_C6226-1978"},
        {"val": "BS_viewdata", "txt": "BS_viewdata"},
        {"val": "INIS", "txt": "INIS"},
        {"val": "INIS-8", "txt": "INIS-8"},
        {"val": "INIS-cyrillic", "txt": "INIS-cyrillic"},
        {"val": "ISO_5427:1981", "txt": "ISO_5427:1981"},
        {"val": "ISO_5428:1980", "txt": "ISO_5428:1980"},
        {"val": "GB_1988-80", "txt": "GB_1988-80"},
        {"val": "GB_2312-80", "txt": "GB_2312-80"},
        {"val": "NS_4551-2", "txt": "NS_4551-2"},
        {"val": "videotex-suppl", "txt": "videotex-suppl"},
        {"val": "PT2", "txt": "PT2"},
        {"val": "ES2", "txt": "ES2"},
        {"val": "MSZ_7795.3", "txt": "MSZ_7795.3"},
        {"val": "JIS_C6226-1983", "txt": "JIS_C6226-1983"},
        {"val": "greek7", "txt": "greek7"},
        {"val": "ASMO_449", "txt": "ASMO_449"},
        {"val": "iso-ir-90", "txt": "iso-ir-90"},
        {"val": "JIS_C6229-1984-a", "txt": "JIS_C6229-1984-a"},
        {"val": "JIS_C6229-1984-b", "txt": "JIS_C6229-1984-b"},
        {"val": "JIS_C6229-1984-b-add", "txt": "JIS_C6229-1984-b-add"},
        {"val": "JIS_C6229-1984-hand", "txt": "JIS_C6229-1984-hand"},
        {"val": "JIS_C6229-1984-hand-add", "txt": "JIS_C6229-1984-hand-add"},
        {"val": "JIS_C6229-1984-kana", "txt": "JIS_C6229-1984-kana"},
        {"val": "ISO_2033-1983", "txt": "ISO_2033-1983"},
        {"val": "ANSI_X3.110-1983", "txt": "ANSI_X3.110-1983"},
        {"val": "T.61-7bit", "txt": "T.61-7bit"},
        {"val": "T.61-8bit", "txt": "T.61-8bit"},
        {"val": "ECMA-cyrillic", "txt": "ECMA-cyrillic"},
        {"val": "CSA_Z243.4-1985-1", "txt": "CSA_Z243.4-1985-1"},
        {"val": "CSA_Z243.4-1985-2", "txt": "CSA_Z243.4-1985-2"},
        {"val": "CSA_Z243.4-1985-gr", "txt": "CSA_Z243.4-1985-gr"},
        {"val": "ISO-8859-6-E", "txt": "ISO-8859-6-E"},
        {"val": "ISO-8859-6-I", "txt": "ISO-8859-6-I"},
        {"val": "T.101-G2", "txt": "T.101-G2"},
        {"val": "ISO-8859-8-E", "txt": "ISO-8859-8-E"},
        {"val": "ISO-8859-8-I", "txt": "ISO-8859-8-I"},
        {"val": "CSN_369103", "txt": "CSN_369103"},
        {"val": "JUS_I.B1.002", "txt": "JUS_I.B1.002"},
        {"val": "IEC_P27-1", "txt": "IEC_P27-1"},
        {"val": "JUS_I.B1.003-serb", "txt": "JUS_I.B1.003-serb"},
        {"val": "JUS_I.B1.003-mac", "txt": "JUS_I.B1.003-mac"},
        {"val": "greek-ccitt", "txt": "greek-ccitt"},
        {"val": "NC_NC00-10:81", "txt": "NC_NC00-10:81"},
        {"val": "ISO_6937-2-25", "txt": "ISO_6937-2-25"},
        {"val": "GOST_19768-74", "txt": "GOST_19768-74"},
        {"val": "ISO-8859-supp", "txt": "ISO-8859-supp"},
        {"val": "ISO_10367-box", "txt": "ISO_10367-box"},
        {"val": "latin-lap", "txt": "latin-lap"},
        {"val": "JIS_X0212-1990", "txt": "JIS_X0212-1990"},
        {"val": "DS_2089", "txt": "DS_2089"},
        {"val": "us-dk", "txt": "us-dk"},
        {"val": "dk-us", "txt": "dk-us"},
        {"val": "KSC5636", "txt": "KSC5636"},
        {"val": "UNICODE-1-1-UTF-7", "txt": "UNICODE-1-1-UTF-7"},
        {"val": "ISO-2022-CN", "txt": "ISO-2022-CN"},
        {"val": "ISO-2022-CN-EXT", "txt": "ISO-2022-CN-EXT"},
        {"val": "ISO-8859-13", "txt": "ISO-8859-13"},
        {"val": "ISO-8859-14", "txt": "ISO-8859-14"},
        {"val": "ISO-8859-15", "txt": "ISO-8859-15"},
        {"val": "ISO-8859-16", "txt": "ISO-8859-16"},
        {"val": "GBK", "txt": "GBK"},
        {"val": "GB18030", "txt": "GB18030"},
        {"val": "OSD_EBCDIC_DF04_15", "txt": "OSD_EBCDIC_DF04_15"},
        {"val": "OSD_EBCDIC_DF03_IRV", "txt": "OSD_EBCDIC_DF03_IRV"},
        {"val": "OSD_EBCDIC_DF04_1", "txt": "OSD_EBCDIC_DF04_1"},
        {"val": "ISO-11548-1", "txt": "ISO-11548-1"},
        {"val": "KZ-1048", "txt": "KZ-1048"},
        {"val": "ISO-10646-UCS-2", "txt": "ISO-10646-UCS-2"},
        {"val": "ISO-10646-UCS-4", "txt": "ISO-10646-UCS-4"},
        {"val": "ISO-10646-UCS-Basic", "txt": "ISO-10646-UCS-Basic"},
        {"val": "ISO-10646-Unicode-Latin1", "txt": "ISO-10646-Unicode-Latin1"},
        {"val": "ISO-10646-J-1", "txt": "ISO-10646-J-1"},
        {"val": "ISO-Unicode-IBM-1261", "txt": "ISO-Unicode-IBM-1261"},
        {"val": "ISO-Unicode-IBM-1268", "txt": "ISO-Unicode-IBM-1268"},
        {"val": "ISO-Unicode-IBM-1276", "txt": "ISO-Unicode-IBM-1276"},
        {"val": "ISO-Unicode-IBM-1264", "txt": "ISO-Unicode-IBM-1264"},
        {"val": "ISO-Unicode-IBM-1265", "txt": "ISO-Unicode-IBM-1265"},
        {"val": "UNICODE-1-1", "txt": "UNICODE-1-1"},
        {"val": "SCSU", "txt": "SCSU"},
        {"val": "UTF-7", "txt": "UTF-7"},
        {"val": "UTF-16BE", "txt": "UTF-16BE"},
        {"val": "UTF-16LE", "txt": "UTF-16LE"},
        {"val": "UTF-16", "txt": "UTF-16"},
        {"val": "CESU-8", "txt": "CESU-8"},
        {"val": "UTF-32", "txt": "UTF-32"},
        {"val": "UTF-32BE", "txt": "UTF-32BE"},
        {"val": "UTF-32LE", "txt": "UTF-32LE"},
        {"val": "BOCU-1", "txt": "BOCU-1"},
        {"val": "UTF-7-IMAP", "txt": "UTF-7-IMAP"},
        {
            "val": "ISO-8859-1-Windows-3.0-Latin-1",
            "txt": "ISO-8859-1-Windows-3.0-Latin-1"
        },
        {
            "val": "ISO-8859-1-Windows-3.1-Latin-1",
            "txt": "ISO-8859-1-Windows-3.1-Latin-1"
        },
        {
            "val": "ISO-8859-2-Windows-Latin-2",
            "txt": "ISO-8859-2-Windows-Latin-2"
        },
        {
            "val": "ISO-8859-9-Windows-Latin-5",
            "txt": "ISO-8859-9-Windows-Latin-5"
        },
        {"val": "hp-roman8", "txt": "hp-roman8"},
        {"val": "Adobe-Standard-Encoding", "txt": "Adobe-Standard-Encoding"},
        {"val": "Ventura-US", "txt": "Ventura-US"},
        {"val": "Ventura-International", "txt": "Ventura-International"},
        {"val": "DEC-MCS", "txt": "DEC-MCS"},
        {"val": "IBM850", "txt": "IBM850"},
        {"val": "PC8-Danish-Norwegian", "txt": "PC8-Danish-Norwegian"},
        {"val": "IBM862", "txt": "IBM862"},
        {"val": "PC8-Turkish", "txt": "PC8-Turkish"},
        {"val": "IBM-Symbols", "txt": "IBM-Symbols"},
        {"val": "IBM-Thai", "txt": "IBM-Thai"},
        {"val": "HP-Legal", "txt": "HP-Legal"},
        {"val": "HP-Pi-font", "txt": "HP-Pi-font"},
        {"val": "HP-Math8", "txt": "HP-Math8"},
        {"val": "Adobe-Symbol-Encoding", "txt": "Adobe-Symbol-Encoding"},
        {"val": "HP-DeskTop", "txt": "HP-DeskTop"},
        {"val": "Ventura-Math", "txt": "Ventura-Math"},
        {"val": "Microsoft-Publishing", "txt": "Microsoft-Publishing"},
        {"val": "Windows-31J", "txt": "Windows-31J"},
        {"val": "GB2312", "txt": "GB2312"},
        {"val": "Big5", "txt": "Big5"},
        {"val": "macintosh", "txt": "macintosh"},
        {"val": "IBM037", "txt": "IBM037"}, {"val": "IBM038", "txt": "IBM038"},
        {"val": "IBM273", "txt": "IBM273"}, {"val": "IBM274", "txt": "IBM274"},
        {"val": "IBM275", "txt": "IBM275"}, {"val": "IBM277", "txt": "IBM277"},
        {"val": "IBM278", "txt": "IBM278"}, {"val": "IBM280", "txt": "IBM280"},
        {"val": "IBM281", "txt": "IBM281"}, {"val": "IBM284", "txt": "IBM284"},
        {"val": "IBM285", "txt": "IBM285"}, {"val": "IBM290", "txt": "IBM290"},
        {"val": "IBM297", "txt": "IBM297"}, {"val": "IBM420", "txt": "IBM420"},
        {"val": "IBM423", "txt": "IBM423"}, {"val": "IBM424", "txt": "IBM424"},
        {"val": "IBM437", "txt": "IBM437"}, {"val": "IBM500", "txt": "IBM500"},
        {"val": "IBM851", "txt": "IBM851"}, {"val": "IBM852", "txt": "IBM852"},
        {"val": "IBM855", "txt": "IBM855"}, {"val": "IBM857", "txt": "IBM857"},
        {"val": "IBM860", "txt": "IBM860"}, {"val": "IBM861", "txt": "IBM861"},
        {"val": "IBM863", "txt": "IBM863"}, {"val": "IBM864", "txt": "IBM864"},
        {"val": "IBM865", "txt": "IBM865"}, {"val": "IBM868", "txt": "IBM868"},
        {"val": "IBM869", "txt": "IBM869"}, {"val": "IBM870", "txt": "IBM870"},
        {"val": "IBM871", "txt": "IBM871"}, {"val": "IBM880", "txt": "IBM880"},
        {"val": "IBM891", "txt": "IBM891"}, {"val": "IBM903", "txt": "IBM903"},
        {"val": "IBM904", "txt": "IBM904"}, {"val": "IBM905", "txt": "IBM905"},
        {"val": "IBM918", "txt": "IBM918"},
        {"val": "IBM1026", "txt": "IBM1026"},
        {"val": "EBCDIC-AT-DE", "txt": "EBCDIC-AT-DE"},
        {"val": "EBCDIC-AT-DE-A", "txt": "EBCDIC-AT-DE-A"},
        {"val": "EBCDIC-CA-FR", "txt": "EBCDIC-CA-FR"},
        {"val": "EBCDIC-DK-NO", "txt": "EBCDIC-DK-NO"},
        {"val": "EBCDIC-DK-NO-A", "txt": "EBCDIC-DK-NO-A"},
        {"val": "EBCDIC-FI-SE", "txt": "EBCDIC-FI-SE"},
        {"val": "EBCDIC-FI-SE-A", "txt": "EBCDIC-FI-SE-A"},
        {"val": "EBCDIC-FR", "txt": "EBCDIC-FR"},
        {"val": "EBCDIC-IT", "txt": "EBCDIC-IT"},
        {"val": "EBCDIC-PT", "txt": "EBCDIC-PT"},
        {"val": "EBCDIC-ES", "txt": "EBCDIC-ES"},
        {"val": "EBCDIC-ES-A", "txt": "EBCDIC-ES-A"},
        {"val": "EBCDIC-ES-S", "txt": "EBCDIC-ES-S"},
        {"val": "EBCDIC-UK", "txt": "EBCDIC-UK"},
        {"val": "EBCDIC-US", "txt": "EBCDIC-US"},
        {"val": "UNKNOWN-8BIT", "txt": "UNKNOWN-8BIT"},
        {"val": "MNEMONIC", "txt": "MNEMONIC"},
        {"val": "MNEM", "txt": "MNEM"},
        {"val": "VISCII", "txt": "VISCII"},
        {"val": "VIQR", "txt": "VIQR"},
        {"val": "KOI8-R", "txt": "KOI8-R"},
        {"val": "HZ-GB-2312", "txt": "HZ-GB-2312"},
        {"val": "IBM866", "txt": "IBM866"},
        {"val": "IBM775", "txt": "IBM775"},
        {"val": "KOI8-U", "txt": "KOI8-U"},
        {"val": "IBM00858", "txt": "IBM00858"},
        {"val": "IBM00924", "txt": "IBM00924"},
        {"val": "IBM01140", "txt": "IBM01140"},
        {"val": "IBM01141", "txt": "IBM01141"},
        {"val": "IBM01142", "txt": "IBM01142"},
        {"val": "IBM01143", "txt": "IBM01143"},
        {"val": "IBM01144", "txt": "IBM01144"},
        {"val": "IBM01145", "txt": "IBM01145"},
        {"val": "IBM01146", "txt": "IBM01146"},
        {"val": "IBM01147", "txt": "IBM01147"},
        {"val": "IBM01148", "txt": "IBM01148"},
        {"val": "IBM01149", "txt": "IBM01149"},
        {"val": "Big5-HKSCS", "txt": "Big5-HKSCS"},
        {"val": "IBM1047", "txt": "IBM1047"},
        {"val": "PTCP154", "txt": "PTCP154"},
        {"val": "Amiga-1251", "txt": "Amiga-1251"},
        {"val": "KOI7-switched", "txt": "KOI7-switched"},
        {"val": "BRF", "txt": "BRF"},
        {"val": "TSCII", "txt": "TSCII"},
        {"val": "CP51932", "txt": "CP51932"},
        {"val": "windows-874", "txt": "windows-874"},
        {"val": "windows-1250", "txt": "windows-1250"},
        {"val": "windows-1251", "txt": "windows-1251"},
        {"val": "windows-1252", "txt": "windows-1252"},
        {"val": "windows-1253", "txt": "windows-1253"},
        {"val": "windows-1254", "txt": "windows-1254"},
        {"val": "windows-1255", "txt": "windows-1255"},
        {"val": "windows-1256", "txt": "windows-1256"},
        {"val": "windows-1257", "txt": "windows-1257"},
        {"val": "windows-1258", "txt": "windows-1258"},
        {"val": "TIS-620", "txt": "TIS-620"},
        {"val": "CP50220", "txt": "CP50220"}
    ]);
}

// ### OPTION ELEMENT ###
function designElementProperty_OPTION() {
    "use strict";
    addCheck('D', 'Disabled', 'disabled');
    addCheck('D', 'Selected', 'selected');
    addCheck('D', 'Value', 'value');
    addFlexContainerProps();
    addFlexProps();
}

// ### PRE ELEMENT ###
function designElementProperty_PRE() {
    "use strict";
    addFlexContainerProps();
    addFlexProps();
}

// ### SCRIPT ELEMENT ###
function designElementProperty_SCRIPT() {
    "use strict";
    addText('D', 'Source', 'src');
}

// ### SELECT ELEMENT ###
function designElementProperty_SELECT() {
    "use strict";
    addControlProps();
    addCheck('O', 'Multiple', 'multiple');
    addFlexProps();
}

// ### SPAN ELEMENT ###
function designElementProperty_SPAN() {
    "use strict";
    addFlexProps();
}

// ### STYLE ELEMENT ###
function designElementProperty_STYLE() {
    "use strict";
}

// ### TABLE ELEMENT ###
function designElementProperty_TABLE() {
    "use strict";
    addFlexProps();
}

// ### TBODY ELEMENT ###
function designElementProperty_TBODY() {
    "use strict";
}

// ### TD ELEMENT ###
function designElementProperty_TD() {
    "use strict";
    addText('O', 'Heading', 'heading');
    addText('O', 'Colspan', 'colspan');
    addText('O', 'Rowspan', 'rowspan');
    addFlexContainerProps();
}

// ### TEMPLATE ELEMENT ###
function designElementProperty_TEMPLATE() {
    "use strict";
    addText('O', 'For', 'for');
}

// ### TEXTAREA ELEMENT ###
function designElementProperty_TEXTAREA() {
    "use strict";
    addControlProps();
    addText('O', 'Maxlength', 'maxlength');
    addText('O', 'Rows', 'rows');
    addText('O', 'Cols', 'cols');
    addFlexProps();
}

// ### TH ELEMENT ###
function designElementProperty_TH() {
    "use strict";
    addText('O', 'Heading', 'heading');
    addText('O', 'Colspan', 'colspan');
    addText('O', 'Rowspan', 'rowspan');
    addFlexContainerProps();
}

// ### THEAD ELEMENT ###
function designElementProperty_THEAD() {
    "use strict";
}

// ### TR ELEMENT ###
function designElementProperty_TR() {
    "use strict";
}

// #############################################################################
// ################################## JSLINT ###################################
// #############################################################################

// this is to get JSLINT to shut up about unused functions
window.addEventListener('nevagonnahappen', function () {
    "use strict";
    designElementProperty_A();
    designElementProperty_BR();
    designElementProperty_CENTER();
    designElementProperty_DIV();
    designElementProperty_FORM();
    designElementProperty_H1();
    designElementProperty_H2();
    designElementProperty_H3();
    designElementProperty_H4();
    designElementProperty_H5();
    designElementProperty_H6();
    designElementProperty_HR();
    designElementProperty_IFRAME();
    designElementProperty_IMG();
    designElementProperty_INPUT();
    designElementProperty_LABEL();
    designElementProperty_LINK();
    designElementProperty_META();
    designElementProperty_OPTION();
    designElementProperty_PRE();
    designElementProperty_SCRIPT();
    designElementProperty_SELECT();
    designElementProperty_SPAN();
    designElementProperty_STYLE();
    designElementProperty_TABLE();
    designElementProperty_TBODY();
    designElementProperty_TD();
    designElementProperty_TEMPLATE();
    designElementProperty_TEXTAREA();
    designElementProperty_TH();
    designElementProperty_THEAD();
    designElementProperty_TR();
    addGSControlProps();
    addIconProps();
    addCornerRoundProps();
    addFocusEvents();
    addDataEvents();
    addDataAttributes();
    addBasicThemingProps();
});

