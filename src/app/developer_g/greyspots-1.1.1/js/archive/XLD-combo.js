//global GS, ml, evt, window, document, xtag, MutationObserver, registerDesignSnippet, designRegisterElement, addProp, encodeHTML, setOrRemoveTextAttribute, setOrRemoveBooleanAttribute, addFlexContainerProps, addFlexProps
//jslint this

window.addEventListener('design-register-element', function () {
    'use strict';

    registerDesignSnippet('<gs-combo>', '<gs-combo>', 'gs-combo src="${1:test.tpeople}" column="${2}"></gs-combo>');

    designRegisterElement('gs-combo', '/env/app/developer_g/greyspots-' + GS.version() + '/documentation/index.html#controls_combo');

    window.designElementProperty_GSCOMBO = function (selectedElement) {
        addProp(
            'Source',
            true,
            ('<gs-memo class="target" value="' + encodeHTML(decodeURIComponent(selectedElement.getAttribute('src') || selectedElement.getAttribute('source') || '')) + '" mini></gs-memo>'),
            function () {
                return setOrRemoveTextAttribute(selectedElement, 'src', encodeURIComponent(this.value));
            }
        );

        addProp('Columns', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('cols') || '') + '" mini></gs-text>',
                function () {
            return setOrRemoveTextAttribute(selectedElement, 'cols', this.value);
        });

        addProp('Initialize Source', true,
                '<gs-memo class="target" value="' + encodeHTML(decodeURIComponent(selectedElement.getAttribute('initialize') || '')) + '" mini></gs-memo>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'initialize', encodeURIComponent(this.value));
        });

        addProp('Hide Columns', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('hide') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'hide', this.value);
        });

        addProp('Where', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('where') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'where', this.value);
        });

        addProp('Order By', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('ord') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'ord', this.value);
        });

        addProp('Limit', true, '<gs-number class="target" value="' + encodeHTML(selectedElement.getAttribute('limit') || '') + '" mini></gs-number>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'limit', this.value);
        });

        addProp('Offset', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('offset') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'offset', this.value);
        });

        addProp('Column', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('column') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'column', this.value);
        });

        addProp('Value', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('value') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'value', this.value);
        });

        addProp('Column In Querystring', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('qs') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'qs', this.value, false);
        });

        addProp('Allow Empty', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('allow-empty')) + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'allow-empty', (this.value === 'true'), true);
        });

        addProp('Limit&nbsp;To&nbsp;List', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('limit-to-list')) + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'limit-to-list', (this.value === 'true'), true);
        });

        addProp('Mini', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('mini')) + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'mini', (this.value === 'true'), true);
        });

        // TITLE attribute
        addProp('Title', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('title') || '') + '" mini></gs-text>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'title', this.value);
        });

        // TABINDEX attribute
        addProp('Tabindex', true, '<gs-number class="target" value="' + encodeHTML(selectedElement.getAttribute('tabindex') || '') + '" mini></gs-number>', function () {
            return setOrRemoveTextAttribute(selectedElement, 'tabindex', this.value);
        });

        addProp('Autocorrect', true, '<gs-checkbox class="target" value="' + String(selectedElement.getAttribute('autocorrect') !== 'off') + '" mini></gs-checkbox>', function () {
            return setOrRemoveTextAttribute(
                selectedElement,
                'autocorrect',
                (
                    this.value === 'false'
                        ? 'off'
                        : ''
                )
            );
        });

        addProp('Autocapitalize', true, '<gs-checkbox class="target" value="' + String(selectedElement.getAttribute('autocapitalize') !== 'off') + '" mini></gs-checkbox>', function () {
            return setOrRemoveTextAttribute(
                selectedElement,
                'autocapitalize',
                (
                    this.value === 'false'
                        ? 'off'
                        : ''
                )
            );
        });

        addProp('Autocomplete', true, '<gs-checkbox class="target" value="' + String(selectedElement.getAttribute('autocomplete') !== 'off') + '" mini></gs-checkbox>', function () {
            return setOrRemoveTextAttribute(
                selectedElement,
                'autocomplete',
                (
                    this.value === 'false'
                        ? 'off'
                        : ''
                )
            );
        });

        addProp('Spellcheck', true, '<gs-checkbox class="target" value="' + String(selectedElement.getAttribute('spellcheck') !== 'false') + '" mini></gs-checkbox>', function () {
            return setOrRemoveTextAttribute(
                selectedElement,
                'spellcheck',
                (
                    this.value === 'false'
                        ? 'false'
                        : ''
                )
            );
        });

        // visibility attributes
        var strVisibilityAttribute = '';
        if (selectedElement.hasAttribute('hidden')) {
            strVisibilityAttribute = 'hidden';
        }
        if (selectedElement.hasAttribute('hide-on-desktop')) {
            strVisibilityAttribute = 'hide-on-desktop';
        }
        if (selectedElement.hasAttribute('hide-on-tablet')) {
            strVisibilityAttribute = 'hide-on-tablet';
        }
        if (selectedElement.hasAttribute('hide-on-phone')) {
            strVisibilityAttribute = 'hide-on-phone';
        }
        if (selectedElement.hasAttribute('show-on-desktop')) {
            strVisibilityAttribute = 'show-on-desktop';
        }
        if (selectedElement.hasAttribute('show-on-tablet')) {
            strVisibilityAttribute = 'show-on-tablet';
        }
        if (selectedElement.hasAttribute('show-on-phone')) {
            strVisibilityAttribute = 'show-on-phone';
        }

        addProp(
            'Visibility',
            true,
            (
                '<gs-select class="target" value="' + strVisibilityAttribute + '" mini>' +
                    '<option value="">Visible</option>' +
                    '<option value="hidden">Invisible</option>' +
                    '<option value="hide-on-desktop">Invisible at desktop size</option>' +
                    '<option value="hide-on-tablet">Invisible at tablet size</option>' +
                    '<option value="hide-on-phone">Invisible at phone size</option>' +
                    '<option value="show-on-desktop">Visible at desktop size</option>' +
                    '<option value="show-on-tablet">Visible at tablet size</option>' +
                    '<option value="show-on-phone">Visible at phone size</option>' +
                '</gs-select>'
            ),
            function () {
                selectedElement.removeAttribute('hidden');
                selectedElement.removeAttribute('hide-on-desktop');
                selectedElement.removeAttribute('hide-on-tablet');
                selectedElement.removeAttribute('hide-on-phone');
                selectedElement.removeAttribute('show-on-desktop');
                selectedElement.removeAttribute('show-on-tablet');
                selectedElement.removeAttribute('show-on-phone');

                if (this.value) {
                    selectedElement.setAttribute(this.value, '');
                }

                return selectedElement;
            }
        );

        // DISABLED attribute
        addProp('Disabled', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('disabled') || '') + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'disabled', this.value === 'true', true);
        });

        // READONLY attribute
        addProp('Readonly', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('readonly') || '') + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'readonly', this.value === 'true', true);
        });

        addProp('Refresh On Querystring Columns', true, '<gs-text class="target" value="' + encodeHTML(selectedElement.getAttribute('refresh-on-querystring-values') || '') + '" mini></gs-text>', function () {
            this.removeAttribute('refresh-on-querystring-change');
            return setOrRemoveTextAttribute(selectedElement, 'refresh-on-querystring-values', this.value);
        });

        addProp('Refresh On Querystring Change', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('refresh-on-querystring-change')) + '" mini></gs-checkbox>', function () {
            this.removeAttribute('refresh-on-querystring-values');
            return setOrRemoveBooleanAttribute(selectedElement, 'refresh-on-querystring-change', this.value === 'true', true);
        });

        //addFlexContainerProps(selectedElement);
        addFlexProps(selectedElement);

        //// SUSPEND-CREATED attribute
        //addProp('suspend-created', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('suspend-created') || '') + '" mini></gs-checkbox>', function () {
        //    return setOrRemoveBooleanAttribute(selectedElement, 'suspend-created', this.value === 'true', true);
        //});

        // SUSPEND-INSERTED attribute
        addProp('suspend-inserted', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('suspend-inserted') || '') + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'suspend-inserted', this.value === 'true', true);
        });
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    // scroll the dropdown to the selected record
    function scrollToSelectedRecord(element) {
        var positioningContainer;
        var scrollingContainer;
        var arrTrs;
        var i;
        var len;
        var intScrollTop;
        var bolFoundSelected = false;

        if (element.currentDropDownContainer) {
            positioningContainer = xtag.queryChildren(element.currentDropDownContainer, '.gs-combo-positioning-container')[0];
            scrollingContainer = xtag.queryChildren(positioningContainer, '.gs-combo-scroll-container')[0];
            arrTrs = xtag.query(element.dropDownTable, 'tr');

            i = 0;
            intScrollTop = 0;
            len = arrTrs.length;
            while (i < len) {
                if (arrTrs[i].hasAttribute('selected')) {
                    intScrollTop += arrTrs[i].offsetHeight / 2;
                    bolFoundSelected = true;
                    break;
                }
                intScrollTop += arrTrs[i].offsetHeight;

                i += 1;
            }

            if (bolFoundSelected) {
                intScrollTop = intScrollTop - scrollingContainer.offsetHeight / 2;
            } else {
                intScrollTop = 0;
            }

            scrollingContainer.scrollTop = intScrollTop;
        }
    }

    // removes selected class from old selected records
    function clearSelection(element) {
        var i;
        var len;
        var arrSelectedTrs;

        // clear previous selection
        arrSelectedTrs = xtag.queryChildren(xtag.queryChildren(element.dropDownTable, 'tbody')[0], 'tr[selected]');

        i = 0;
        len = arrSelectedTrs.length;
        while (i < len) {
            arrSelectedTrs[i].removeAttribute('selected');
            i += 1;
        }

        // web-aria
        if (element.control && element.control.hasAttribute('aria-owns')) {
            element.control.removeAttribute('aria-activedescendant');
        }
    }

    // clears old selection and adds selected class to record
    function highlightRecord(element, record) {
        // clear previous selection
        clearSelection(element);

        // select/highlight the record that was provided
        record.setAttribute('selected', '');

        // web-aria
        if (element.control && element.control.hasAttribute('aria-owns')) {
            element.control.setAttribute('aria-activedescendant', record.getAttribute('id'));
        }
    }

    // loops through the records and finds a record using the parameter (if bolPartialMatchAllowed === true then only search the first td text)
    function findRecordFromString(element, strSearchString, bolPartialMatchAllowed) {
        var i;
        var len;
        var matchedRecord;
        var arrTrs = xtag.queryChildren(xtag.queryChildren(element.dropDownTable, 'tbody')[0], 'tr');

        if (
            arrTrs &&
            arrTrs[0] &&
            arrTrs[0].children[0].nodeName.toUpperCase() === 'TH' &&
            (
                arrTrs[0].children[1]
                    ? arrTrs[0].children[1].nodeName.toUpperCase() === 'TH'
                    : true
            )
        ) {
            arrTrs.splice(0, 1);
        }

        // if bolPartialMatchAllowed is true: only search the first td text (case insensitive)
        if (bolPartialMatchAllowed === true) {
            strSearchString = strSearchString.toLowerCase();

            i = 0;
            len = arrTrs.length;
            while (i < len) {
                if (xtag.queryChildren(arrTrs[i], 'td')[0].textContent.toLowerCase().indexOf(strSearchString) === 0) {
                    matchedRecord = arrTrs[i];
                    break;
                }
                i += 1;
            }

        // else: search exact text and search both the value attribute (if present) and the first td text
        } else {
            i = 0;
            len = arrTrs.length;
            while (i < len) {
                if (
                    arrTrs[i].getAttribute('value') === strSearchString ||
                    xtag.queryChildren(arrTrs[i], 'td')[0].textContent === strSearchString
                ) {
                    matchedRecord = arrTrs[i];
                    break;
                }
                i += 1;
            }
        }

        return matchedRecord;
    }

    function handleChange(element, bolChange) {
        var arrSelectedTrs;
        var strHiddenValue = '';
        var strTextValue = '';
        var beforechangeevent;
        var oldRecord;
        var oldInnerValue = element.innerValue;
        var oldControlValue = element.control.value;
        var firstTd;
        var lastChild;

        if (element.dropDownTable) {
            arrSelectedTrs = xtag.queryChildren(xtag.queryChildren(element.dropDownTable, 'tbody')[0], 'tr[selected]');

            // if there is a selected record
            if (arrSelectedTrs.length > 0) {
                // gather values from the selected record
                strHiddenValue = arrSelectedTrs[0].getAttribute('value');
                firstTd = xtag.queryChildren(arrSelectedTrs[0], 'td')[0];
                lastChild = firstTd.lastElementChild;
                if (lastChild && lastChild.tagName.substring(0, 3) === 'GS-') {
                    strTextValue = lastChild.textValue || lastChild.value || lastChild.textContent;
                } else {
                    strTextValue = firstTd.textContent;
                }

            } else {
                strTextValue = element.control.value;
            }

        } else {
            strTextValue = element.control.value;
        }

        if (bolChange) {
            //console.trace('test');
            //console.log('### arrSelectedTrs:', arrSelectedTrs);
            //console.log('### strHiddenValue:', strHiddenValue);
            //console.log('### strTextValue:  ', strTextValue);
            //console.log('### bolChange:     ', bolChange);
        }

        // set innervalue and control value using the values we gather from the record
        element.innerValue = strHiddenValue || strTextValue;
        if (element.control.tagName.toUpperCase() === 'SPAN') {
            element.control.value = strTextValue || strHiddenValue;
            element.control.innerHTML = strTextValue || strHiddenValue;
        } else {
            element.control.value = strTextValue || strHiddenValue;
        }

        if (bolChange) {
            if (document.createEvent) {
                beforechangeevent = document.createEvent('HTMLEvents');
                beforechangeevent.initEvent('beforechange', true, true);
            } else {
                beforechangeevent = document.createEventObject();
                beforechangeevent.eventType = 'beforechange';
            }

            beforechangeevent.eventName = 'beforechange';

            if (document.createEvent) {
                element.dispatchEvent(beforechangeevent);
            } else {
                element.fireEvent("on" + beforechangeevent.eventType, beforechangeevent);
            }

            // xtag.fireEvent(element, 'beforechange', { bubbles: true, cancelable: true });

            //console.log(beforechangeevent.defaultPrevented);
            if (beforechangeevent.defaultPrevented !== true) {
                xtag.fireEvent(element, 'change', {bubbles: true, cancelable: true});

            } else {
                element.innerValue = oldInnerValue;
                element.control.value = oldControlValue;

                oldRecord = findRecordFromString(element, oldInnerValue, false);

                if (oldRecord) {
                    highlightRecord(element, oldRecord);
                } else {
                    clearSelection(element);
                }
            }

            element.ignoreChange = false;
        }
    }

    // highlights record, sets value of the combobox using record
    function selectRecord(element, record, bolChange) {
        // add the yellow selection to the record
        highlightRecord(element, record);

        element.selectedRecord = record;

        handleChange(element, bolChange);
    }

    // bind dropdown events
    function bindDropDown(element) {
        var selectableTrs;
        var closeDropDownHandler;
        var selectRecordHandler;
        var i;
        var len;
        var unbindDropDownEvents;
        var wheelHandler;

        wheelHandler = function (event) {
            var tableElement = GS.findParentElement(event.target, '.gs-combo-dropdown-container');

            if (tableElement !== element.currentDropDownContainer) {
                closeDropDownHandler();
            }
        };

        // unbind function
        unbindDropDownEvents = function () {
            var tr_i;
            var tr_len;

            tr_i = 0;
            tr_len = selectableTrs.length;
            while (tr_i < tr_len) {
                selectableTrs[tr_i].removeEventListener('click', selectRecordHandler);
                tr_i += 1;
            }

            window.removeEventListener('resize', closeDropDownHandler);
            window.removeEventListener('orientationchange', closeDropDownHandler);
            window.removeEventListener('mousewheel', wheelHandler);
            document.body.removeEventListener('click', closeDropDownHandler);
        };

        // handle record click
        selectableTrs = xtag.queryChildren(xtag.queryChildren(element.dropDownTable, 'tbody')[0], 'tr');

        selectRecordHandler = function (event) {
            selectRecord(element, GS.findParentTag(event.target, 'tr'), true);
            closeDropDownHandler();
        };

        i = 0;
        len = selectableTrs.length;
        while (i < len) {
            selectableTrs[i].addEventListener('click', selectRecordHandler);
            i += 1;
        }

        // handle dropdown close
        closeDropDownHandler = function () {//event
            if (!element.ignoreClick) {
                closeDropDown(element);
                unbindDropDownEvents();
            }
            element.ignoreClick = false;
        };

        window.addEventListener('resize', closeDropDownHandler);
        window.addEventListener('orientationchange', closeDropDownHandler);
        window.addEventListener('mousewheel', wheelHandler);
        document.body.addEventListener('click', closeDropDownHandler);
    }

    function dropDownSize(element) {
        var dropDownContainer = element.currentDropDownContainer;
        var positioningContainer = xtag.queryChildren(dropDownContainer, '.gs-combo-positioning-container')[0];
        var scrollContainer = xtag.queryChildren(positioningContainer, '.gs-combo-scroll-container')[0];
        var jsnComboOffset;
        var intComboHeight;
        var intComboWidth;
        var intViewportHeight;
        var intFromControlToBottomHeight;
        var intFromControlToTopHeight;
        var intContentHeight;
        var intNewWidth;
        var strWidth = '';
        var strHeight = '';
        var strLeft = '';
        var strTop = '';
        var strBottom = '';

        // set variables needed for position calculation
        intComboHeight = element.offsetHeight;
        intComboWidth = element.offsetWidth;
        intViewportHeight = window.innerHeight;
        jsnComboOffset = GS.getElementOffset(element);
        intContentHeight = (scrollContainer.scrollHeight + 2);
        intFromControlToBottomHeight = intViewportHeight - (jsnComboOffset.top + intComboHeight);
        intFromControlToTopHeight = jsnComboOffset.top;

        // set position, height and (top or bottom) variables
        // if desktop:
        if (!evt.touchDevice) {
            // if viewport is too small go full page
            if (
                window.innerHeight < 500 &&
                intContentHeight > intFromControlToTopHeight &&
                intContentHeight > intFromControlToBottomHeight
            ) {
                strHeight = window.innerHeight + 'px';
                strTop = '0px';

            // try 200px
            } else if (intContentHeight < 500) {
                strHeight = '200px';

                if (intFromControlToBottomHeight > intFromControlToTopHeight || intFromControlToBottomHeight > 200) {
                    strTop = (intFromControlToTopHeight + intComboHeight) + 'px';
                } else {
                    strBottom = (intFromControlToBottomHeight + intComboHeight) + 'px';
                }

            // try height from control to bottom of viewport
            } else if (intFromControlToBottomHeight >= intFromControlToTopHeight) {
                strHeight = intFromControlToBottomHeight + 'px';
                strTop = (intFromControlToTopHeight + intComboHeight) + 'px';

            // else height from control to top of viewport
            } else {// if (intFromControlToTopHeight >= intFromControlToBottomHeight) {
                strHeight = intFromControlToTopHeight + 'px';
                strBottom = (intFromControlToBottomHeight + intComboHeight) + 'px';
            }

        // else mobile:
        } else {
            // try 200px bottom
            if (intFromControlToBottomHeight > 200 && intContentHeight < 500) {
                strHeight = intFromControlToBottomHeight + 'px';
                strTop = (intFromControlToTopHeight + intComboHeight) + 'px';

            // try 200px top
            } else if (intFromControlToTopHeight > 200 && intContentHeight < 500) {
                strHeight = intFromControlToTopHeight + 'px';
                strBottom = (intFromControlToBottomHeight + intComboHeight) + 'px';

            // else full page
            } else {
                strHeight = window.innerHeight + 'px';
                strTop = '0px';
            }
        }


        // set width and left variables
        // try regular
        if (scrollContainer.scrollWidth <= scrollContainer.offsetWidth) {
            if (intComboWidth < 150) {
                intNewWidth = (window.innerWidth - jsnComboOffset.left) - 20;

                if (intNewWidth < 300) {
                    strWidth = intNewWidth + 'px';
                } else {
                    strWidth = '300px';
                }

            } else {
                strWidth = intComboWidth + 'px';
            }
            strLeft = jsnComboOffset.left + 'px';

        // else full width
        } else {
            strWidth = '100%';
            strLeft = '0px';
        }


        // set position and size using variables
        positioningContainer.style.left = strLeft;
        positioningContainer.style.top = strTop;
        positioningContainer.style.bottom = strBottom;
        // minWidth allows the dropdown to resize to the content
        positioningContainer.style.minWidth = strWidth;
        positioningContainer.style.height = strHeight;

        if (strTop) {
            dropDownContainer.classList.add('below');
        } else {
            dropDownContainer.classList.add('above');
        }


        // if the table is wider than the drop down: reflow
        if (
            scrollContainer.clientWidth < scrollContainer.scrollWidth &&
            xtag.query(scrollContainer, 'tbody tr:first-child td, tbody tr:first-child th').length > 1
        ) {
            scrollContainer.classList.add('reflow');
        }


        // if the table is shorter than the drop down: resize the dropdown to be as short as the table
        if (intContentHeight < scrollContainer.clientHeight) {
            positioningContainer.style.height = intContentHeight + 'px';
        }

        // make combobox float over overlay so that you can focus into the input box
        element.classList.add('open');

        // change element open state variable
        element.dropdownOpen = true;

        // bind drop down
        bindDropDown(element);

        // scroll to the selected record (if any)
        scrollToSelectedRecord(element);
    }

    function dropDown(element) {
        var dropDownContainer = document.createElement('div');
        var positioningContainer;
        var scrollContainer;
        var observer;

        // focus control
        if (!evt.touchDevice) {
            element.control.focus();
        }
        element.control.setAttribute('aria-owns', 'combo-list-' + element.internal.id);

        // create the dropdown element (and its children)
        dropDownContainer.classList.add('gs-combo-dropdown-container');
        dropDownContainer.setAttribute('gs-dynamic', '');
        dropDownContainer.innerHTML = (
            '<div class="gs-combo-positioning-container" gs-dynamic>' +
            '    <div id="combo-list-' + element.internal.id + '" class="gs-combo-scroll-container" gs-dynamic></div>' +
            '</div>'
        );

        // append dropdown to the body
        document.body.appendChild(dropDownContainer);

        // set variables for the various elements that we will need for calculation
        positioningContainer = xtag.queryChildren(dropDownContainer, '.gs-combo-positioning-container')[0];
        scrollContainer = xtag.queryChildren(positioningContainer, '.gs-combo-scroll-container')[0];

        element.currentDropDownContainer = dropDownContainer;

        // fill dropdown with content
        if (element.dropDownTable) {
            //element.dropDownTable = GS.cloneElement(element.staticDropDownTable);
            scrollContainer.appendChild(element.dropDownTable);

        //} else if (element.tableTemplate) {
        //    scrollContainer.innerHTML = element.tableTemplate;
        //
        } else {
            scrollContainer.innerHTML = element.initalHTML;
        }

        // create an observer instance
        observer = new MutationObserver(function () { //mutations
            dropDownSize(element);
        });

        // pass in the element node, as well as the observer options
        observer.observe(scrollContainer, {childList: true, subtree: true});

        //console.log(scrollContainer);
        dropDownSize(element);


        if (!element.theadElement && !element.tbodyElement) {
            element.theadElement = xtag.queryChildren(element.dropDownTable, 'thead')[0];
            element.tbodyElement = xtag.queryChildren(element.dropDownTable, 'tbody')[0];
        }
        if (element.theadElement && element.tbodyElement && element.theadElement.children[0]) {
            element.tbodyElement.innerHTML = (
                element.theadElement.innerHTML + '' + element.tbodyElement.innerHTML
            );

            var cols_i = 0;
            var cols_len = element.theadElement.children[0].children.length;

            element.tbodyheader = xtag.query(element.tbodyElement, 'tr:not([data-record_no])')[0];
            while (cols_i < cols_len) {
                element
                    .theadElement
                    .children[0]
                    .children[cols_i]
                    .setAttribute(
                        'style',
                        (
                            'width: ' + element.tbodyheader.children[cols_i].clientWidth + 'px !important; ' +
                            'padding-right: 0; ' +
                            'padding-left: 0;'
                        )
                    );
                cols_i += 1;
            }
        }
    }

    // open dropdown
    function openDropDown(element) {
        // if we are not already dropping down
        if (!element.droppingDown) {
            // if there is a source attribute on the combobox: refresh data
            if (element.getAttribute('src') || element.getAttribute('source')) {
                getData(element, false, true, function () {
                    dropDown(element);
                });
            } else {
                dropDown(element);
            }
            element.droppingDown = true;
        }
    }

    // highlights record, sets value of the combobox using value attribute
    //      if bolChange === true then:
    //          change event and check for limit to list
    function selectRecordFromValue(element, strValue, bolChange) {
        var record = findRecordFromString(element, strValue, false);

        if (bolChange === true) {
            bolChange = (String(element.lastValue) !== String(strValue));
        }

        // if a record was found: select it
        if (record) {
            selectRecord(element, record, bolChange);

        // else if limit to list (and no record was found):
        } else if (element.hasAttribute('limit-to-list') && bolChange) {
            if (strValue === '' && element.hasAttribute('allow-empty')) {
                clearSelection(element);
                handleChange(element, bolChange);

            } else {
                alert('The text you entered is not in the list');
                openDropDown(element);
                GS.setInputSelection(element.control, 0, strValue.length);
            }

        // else (not limit to list and no record found):
        } else {
            clearSelection(element);
            element.selectedRecord = record;

            if (!element.hasAttribute('limit-to-list')) {
                element.control.value = strValue;
                element.innerValue = strValue;
            }

            handleChange(element, bolChange);
        }
    }

    function blurFunction(event) {
        if (event.target.parentNode.parentNode.changeOccured === true) {
            event.target.parentNode.parentNode.changeOccured = false;
        } else if (event.target.parentNode.parentNode.control.value !== event.target.parentNode.parentNode.lastValue) {
            GS.triggerEvent(event.target, 'change');
            if (!event.target.hasRun) {
                event.target.hasRun = true;
            }
        }
        event.target.parentNode.parentNode.classList.remove('focus');
        event.target.parentNode.parentNode.toSpan();
    }

    function focusFunction(event) {
        var element = event.target;
        var element2 = GS.findParentTag(element, 'gs-combo');

        if (element2 && element2.tagName === 'GS-COMBO') {
            element = element2;
        }
        if (!element.control.classList.contains('placeholder')) {
            element.lastValue = element.control.innerHTML;
        } else {
            element.lastValue = '';
        }
        element.classList.add('focus');
        element.bolSelect = true;
        element.toInput();
        element.control.focus();
        if (element.bolSelect) {
            element.control.setSelectionRange(0, element.control.value.length);
        } else {
            element.control.setSelectionRange(element.control.value.length, element.control.value.length);
        }
    }


    // remove dropdown from screen
    function closeDropDown(element) {
        // if there is a dropdown to remove: remove the dropdown
        if (element.currentDropDownContainer) {
            document.body.removeChild(element.currentDropDownContainer);
            element.currentDropDownContainer = null;

            element.classList.remove('open');
            element.dropdownOpen = false;
            element.droppingDown = false;
            element.control.removeAttribute('aria-owns');

            //element.parentNode.removeChild(element.placeholderElement);
            //element.placeholderElement = undefined;
            //
            //element.style.left   = element.oldLeft;
            //element.style.right  = element.oldRight;
            //element.style.top    = element.oldTop;
            //element.style.bottom = element.oldBottom;
            //element.style.width  = element.oldWidth;
            //element.style.height = element.oldHeight;
        }
    }


    // handle behaviours on keydown
    function handleKeyDown(element, event) {
        var intKeyCode = (event.keyCode || event.which);
        var selectedTr;
        var trs;
        var i;
        var len;
        var selectedRecordIndex;
        var firstTd;
        var lastChild;
        var strTextValue;

        if (!element.hasAttribute('disabled') && !element.hasAttribute('readonly')) {
            if ((intKeyCode === 40 || intKeyCode === 38) && !event.shiftKey && !event.metaKey && !event.ctrlKey && !element.error) {
                if (!element.dropdownOpen) {
                    openDropDown(element);

                } else {
                    trs = xtag.queryChildren(xtag.queryChildren(element.dropDownTable, 'tbody')[0], 'tr');

                    i = 0;
                    len = trs.length;
                    while (i < len) {
                        if (trs[i].hasAttribute('selected')) {
                            selectedRecordIndex = i;
                            selectedTr = trs[i];
                            trs[i].removeAttribute('selected');

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
                    scrollToSelectedRecord(element);
                }
                if (selectedTr) {
                    element.control.value = xtag.queryChildren(selectedTr, 'td')[0].textContent;
                }

                GS.setInputSelection(element.control, 0, element.control.value.length);

                event.preventDefault();
                event.stopPropagation();

            } else if ((intKeyCode === 39) && !event.shiftKey && !event.metaKey && !event.ctrlKey && !element.error) {
                selectedTr = xtag.queryChildren(xtag.queryChildren(element.dropDownTable, 'tbody')[0], 'tr[selected]')[0];

                if (selectedTr) {
                    firstTd = xtag.queryChildren(selectedTr, 'td')[0];
                    lastChild = firstTd.lastElementChild;

                    if (lastChild && lastChild.tagName.substring(0, 3) === 'GS-') {
                        strTextValue = lastChild.textValue || lastChild.value || lastChild.textContent;
                    } else {
                        strTextValue = firstTd.textContent;
                    }

                    selectRecord(element, selectedTr, element.innerValue !== (selectedTr.getAttribute('value') || strTextValue));
                }

                event.stopPropagation();

            } else if (event.keyCode === 13 || event.keyCode === 9) {
                if (
                    element.dropDownTable &&
                    xtag.queryChildren(
                        xtag.queryChildren(
                            element.dropDownTable,
                            'tbody'
                        )[0],
                        'tr[selected]'
                    ).length > 0
                ) {
                    selectRecordFromValue(element, element.control.value, true);
                    element.ignoreChange = true;
                }

                closeDropDown(element);

            // if the esc key is pressed, restore the previous value and close the dropdown
            } else if (event.keyCode === 27) {
                if (element.dropdownOpen) {
                    element.value = element.value;
                    closeDropDown(element);
                }

            } else if (
                !event.metaKey &&       // not command key
                !event.ctrlKey &&       // not control key
                event.keyCode !== 37 && // not arrow keys
                event.keyCode !== 38 &&
                event.keyCode !== 39 &&
                event.keyCode !== 40 &&
                event.keyCode !== 46 && // not forward delete key
                event.keyCode !== 8
            ) {  // not delete key
                element.attemptSearchOnNextKeyup = true;
            }
        } else {
            if (event.keyCode !== 9) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }

    // search on keyup
    //      the reason we are using keyup for search is because on keydown the letter has not been typed in yet and
    //      it would be harder if we tried to use the keycode to get the letter that was typed. so on keydown
    //      (which is where we can tell if CMD or CTRL and other keys that we dont want to search on and pressed)
    //      if we didn't type something that we dont want to search on but we typed somthing else: set this.attemptSearchOnNextKeyup
    //      to true and on keyup we read that and if it is set to true then we do a search and set it back to false
    function handleKeyUp(element) { //event
        var strSearch = element.control.value;
        var matchRecord;

        // if element.attemptSearchOnNextKeyup is true and
        //      there is a search string and
        //      the user has their text selection at the end of the of the input
        if (
            element.attemptSearchOnNextKeyup === true &&
            strSearch &&
            GS.getInputSelection(element.control).start === strSearch.length
        ) {

            // ######### FOR CROSS
            // you need to comment the code inside this block.
            // you need an if statment for >2000 records.
            // you need to use the currently commented code for <=2000 records.
            // you need new code for >2000.
            // you need to get the template and put it inside a virtual template element.
            // a virtual template element is just a template element inside a javascript variable.
            //      var templateElement = document.createElement('template');
            // you need to fill templateElement with the record template string, don't use the thead. (you'll find most everything in element.tableTemplate)
            // you need to extract the contents of the first td and put that into a variable.
            // you need to extract the contents of the "value" attribute on the tr (if present).
            // because you extracted the contents before templating, the variables are untemplated.
            // you need to get the column name from the first td template.
            //      there are three things you need to try:
            //          do a regex for "row.something", cut off the row
            //              OR
            //          do a regex for "row['something']", cut off the row[' and ']
            //              OR
            //          do a regex for "row["something"]", cut off the row[" and "]
            //
            //      that should be good enough. if you can't get the column: stop and
            //          console.warn to tell the developer to stick <!-- row.column -->
            //          at the top of the first td
            // you need to run an AJAX call on the postgres object in "src" with a where clause.
            // the where clause will be something like this:
            //          (OLDWHERE) AND COLUMN ILIKE $UnCOPYQTE$ strSearch%$UnCOPYQTE$
            // the ajax call should only get one record.
            // use the two templates to set the value (copy the original code).
            //
            // after you're done, leave these comments for future developers

            if (xtag.queryChildren(xtag.queryChildren(element.dropDownTable, 'tbody')[0], 'tr').length > 2000) {
                var strSearchCol = '';
                var templateElement = element.tableTemplate;

                templateElement = templateElement.substring(templateElement.indexOf('td'), templateElement.indexOf('/td') - 1);
                templateElement = templateElement.substring(templateElement.indexOf('{'), templateElement.length);
                if (templateElement.indexOf('row.') === -1) {
                    if (templateElement.indexOf('row[') === -1) {
                        console.warn('There is no doT.js in the first "<td>" in your template please fill your first "<td>" with templating code.');
                    } else {
                        templateElement = templateElement.substring(parseInt(templateElement.indexOf('row['), 10) + 5, templateElement.length - 2 - 3).trim();
                    }
                } else {
                    templateElement = templateElement.substring(parseInt(templateElement.indexOf('row.'), 10) + 4, templateElement.length - 3).trim();
                }


                strSearchCol = templateElement;

                var strSrc = GS.templateWithQuerystring(element.getAttribute('src'));
                var srcParts = (
                    strSrc[0] === '('
                        ? [strSrc, '']
                        : strSrc.split('.')
                );
                var strSchema = srcParts[0];
                var strObject = srcParts[1];
                var strColumns = GS.templateWithQuerystring(element.getAttribute('cols') || '*').split(/[\s]*,[\s]*/).join('\t');
                var strWhere = (
                    element.hasAttribute('where')
                        ? GS.templateWithQuerystring(element.getAttribute('where') || '') + ' AND ' + strSearchCol + '::text ILIKE $UnCOPYQTE$' + strSearch + '%$UnCOPYQTE$'
                        : strSearchCol + '::text ILIKE $UnCOPYQTE$' + strSearch + '%$UnCOPYQTE$'
                );
                var strOrd = GS.templateWithQuerystring(element.getAttribute('ord') || '');
                var strLimit = '1';
                var strOffset = GS.templateWithQuerystring(element.getAttribute('offset') || '');

                if (strSearchCol) {
                    GS.requestSelectFromSocket(
                        GS.envSocket,
                        strSchema,
                        strObject,
                        strColumns,
                        strWhere,
                        strOrd,
                        strLimit,
                        strOffset,
                        function (data, error) {
                            var arrCells;
                            var cell_i;
                            var cell_len;

                            if (!error) {
                                if (data.strMessage !== 'TRANSACTION COMPLETED') {
                                    arrCells = arrRecords[i].split('\t');

                                    element.control.value = (
                                        arrCells[0] = arrCells[0] === '\\N'
                                            ? null
                                            : GS.decodeFromTabDelimited(arrCells[0])
                                    );
                                    GS.setInputSelection(element.control, strSearch.length, element.control.value.length);
                                    if (element.open) {
                                        matchRecord = findRecordFromString(element, strSearch, true);
                                        if (matchRecord) {
                                            highlightRecord(element, matchRecord);
                                            scrollToSelectedRecord(element);
                                        }
                                    }
                                }
                            } else {
                                handleData(element, bolInitalLoad, data, error);
                                //GS.removeLoader(element);
                            }
                        }
                    );
                }

            } else {
                matchRecord = findRecordFromString(element, strSearch, true);

                // if we found a record and its was already selected: selected the matched record and dont
                if (matchRecord) {
                    highlightRecord(element, matchRecord);
                    element.control.value = xtag.queryChildren(matchRecord, 'td')[0].textContent;
                    GS.setInputSelection(element.control, strSearch.length, element.control.value.length);

                    scrollToSelectedRecord(element);

                } else {
                    clearSelection(element);
                    //selectRecordFromValue(element, strSearch, false);
                    //GS.setInputSelection(element.control, strSearch.length, element.control.value.length);
                }
            }


        }

        if (element.attemptSearchOnNextKeyup === true) {
            element.attemptSearchOnNextKeyup = false;
        }
    }


    // handles data result from method function: getData
    //      success:  template
    //      error:    add error classes
    function handleData(element, bolInitalLoad, data, error) {
        var divElement;
        var tableElement;
        var theadElement;
        var theadCellElements;
        var tbodyElement;
        var tbodyCellElements;
        var currentCellLabelElement;
        var i;
        var len;
        var strTemplate;
        var arrHide;
        var strHeaderCells;
        var strRecordCells;
        var recordElement;
        var jsnTemplate;
        var strHTML;

        element.data = data;

        GS.triggerEvent(element, 'content_loaded');
        //GS.triggerEvent(this, 'after_select'); <== caused a MAJOR issue where code that was supposed to
        //                                              run after an envelope after_select caught all of
        //                                              the after selects of the comboboxes in the envelope

        // clear any old error status
        element.classList.remove('error');
        element.dropDownButton.setAttribute('title', '');
        element.dropDownButton.setAttribute('icon', 'angle-down');

        // if there was no error
        if (!error) {
            element.error = false;

            //console.log(this, this.tableTemplate);

            if (element.tableTemplate) {
                //tableTemplateElement = document.createElement('template');
                //tableTemplateElement.innerHTML = this.tableTemplate;
                //
                //theadElement = xtag.query(tableTemplateElement.content, 'thead')[0];
                //tbodyElement = xtag.query(tableTemplateElement.content, 'tbody')[0];
                //
                //console.log(theadElement, tbodyElement);

                strTemplate = element.tableTemplate; //this.initalHTML;
            } else { // if (data.arr_column)
                // create an array of hidden column numbers
                arrHide = (element.getAttribute('hide') || '').split(/[\s]*,[\s]*/);

                // build up the header cells variable and the record cells variable
                strHeaderCells = '';
                strRecordCells = '';
                i = 0;
                len = data.arr_column.length;
                while (i < len) {
                    // if this column is not hidden
                    if (arrHide.indexOf((i + 1) + '') === -1 && arrHide.indexOf(data.arr_column[i]) === -1) {
                        // append a new cell to each of the header cells and record cells variables
                        strHeaderCells += '<th gs-dynamic>' + encodeHTML(data.arr_column[i]) + '</th> ';
                        strRecordCells += '<td gs-dynamic>{{! row[\'' + data.arr_column[i] + '\'] }}</td> ';
                    }
                    i += 1;
                }

                // put everything together
                strTemplate = (
                    '<table gs-dynamic>' +
                        '<thead gs-dynamic>' +
                            '<tr gs-dynamic>' + strHeaderCells + '</tr>' +
                        '</thead>' +
                        '<tbody gs-dynamic>' +
                            '<tr value="{{! row[\'' + data.arr_column[0] + '\'] }}" gs-dynamic>' + strRecordCells + '</tr>' +
                        '</tbody>' +
                    '<table>'
                );
            }

            divElement = document.createElement('div');

            divElement.innerHTML = strTemplate;

            tableElement = xtag.queryChildren(divElement, 'table')[0];
            theadElement = xtag.queryChildren(tableElement, 'thead')[0];
            tbodyElement = xtag.queryChildren(tableElement, 'tbody')[0];
            element.theadElement = theadElement;
            element.tbodyElement = tbodyElement;

            // if there is a tbody
            if (tbodyElement) {
                recordElement = xtag.queryChildren(tbodyElement, 'tr')[0];

                // if there is a record: template
                if (recordElement) {
                    recordElement.setAttribute('id', 'combo-list-' + element.internal.id + '-item-{{! row_number - 1 }}');

                    // if there is a thead element: add reflow cell headers to the tds
                    if (theadElement) {
                        theadCellElements = xtag.query(theadElement, 'td, th');
                        tbodyCellElements = xtag.query(tbodyElement, 'td, th');

                        if (tbodyCellElements[0].nodeName === 'TH') {
                            recordElement.setAttribute('aria-label', tbodyCellElements[1].textContent);
                        } else {
                            recordElement.setAttribute('aria-label', tbodyCellElements[0].textContent);
                        }

                        i = 0;
                        len = theadCellElements.length;
                        while (i < len) {
                            currentCellLabelElement = document.createElement('b');
                            currentCellLabelElement.classList.add('cell-label');
                            currentCellLabelElement.setAttribute('data-text', (theadCellElements[i].textContent || '') + ':');
                            currentCellLabelElement.setAttribute('gs-dynamic', '');

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
                    strHTML = GS.templateWithEnvelopeData(tbodyElement.innerHTML, data);
                    tbodyElement.innerHTML = GS.templateShowSubTemplates(strHTML, jsnTemplate);

                    element.dropDownTable = tableElement;
                    element.ready = true;
                }
            }

            //if (data.arr_column) {
            if (bolInitalLoad && element.getAttribute('value')) {
                selectRecordFromValue(element, element.getAttribute('value'), false);

            } else if (element.value) {
                selectRecordFromValue(element, element.value, false);
            }
            //}

        // else there was an error: add error class, title attribute
        } else {
            console.error(data);
            element.error = true;
            element.ready = false;
            element.classList.add('error');
            element.dropDownButton.setAttribute('title', 'This combobox has failed to load.');
            element.dropDownButton.setAttribute('icon', 'exclamation-circle');

            if (element.hasAttribute('limit-to-list')) {
                element.setAttribute('disabled', '');
            }
        }
        if (element.hasAttribute('value') && element.hasAttribute('limit-to-list')) {
            if (findRecordFromString(element, element.getAttribute('value'), false) && findRecordFromString(element, element.getAttribute('value'), false).hasAttribute('value')) {
                element.value = findRecordFromString(element, element.getAttribute('value'), false).getAttribute('value');
                //console.log('run', findRecordFromString(element, element.getAttribute('value'), false), element, element.getAttribute('value'), false);
            }
        }
    }

    // handles fetching the data
    //      if bolInitalLoad === true then
    //          use: initialize query COALESCE TO source query
    //      else
    //          use: source query
    function getData(element, bolInitalLoad, bolClearPrevious, callback) {
        var strSrc = GS.templateWithQuerystring(
            (bolInitalLoad && element.getAttribute('initialize'))
                ? element.getAttribute('initialize')
                : element.getAttribute('src')
        );
        var srcParts = (
            strSrc[0] === '('
                ? [strSrc, '']
                : strSrc.split('.')
        );
        var strSchema = srcParts[0];
        var strObject = srcParts[1];
        var strColumns = GS.templateWithQuerystring(element.getAttribute('cols') || '*').split(/[\s]*,[\s]*/).join('\t');
        var strWhere = GS.templateWithQuerystring(element.getAttribute('where') || '');
        var strOrd = GS.templateWithQuerystring(element.getAttribute('ord') || '');
        var strLimit = GS.templateWithQuerystring(element.getAttribute('limit') || '');
        var strOffset = GS.templateWithQuerystring(element.getAttribute('offset') || '');
        var arrTotalRecords = [];

        GS.triggerEvent(element, 'before_select');
        GS.triggerEvent(element, 'onbefore_select');
        if (element.hasAttribute('onbefore_select')) {
            new Function(element.getAttribute('onbefore_select')).apply(element);
        }

        //GS.addLoader(element, 'Loading...');
        GS.requestCachingSelect(
            GS.envSocket,
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
                    } else {
                        //GS.removeLoader(element);
                        element.arrColumnNames = data.arrColumnNames;

                        envData = {'arr_column': element.arrColumnNames, 'dat': arrTotalRecords};

                        element.internalData.records = envData;

                        handleData(element, bolInitalLoad, envData);
                        GS.triggerEvent(element, 'after_select');
                        GS.triggerEvent(element, 'onafter_select');
                        if (element.hasAttribute('onafter_select')) {
                            new Function(element.getAttribute('onafter_select')).apply(element);
                        }
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }
                } else {
                    handleData(element, bolInitalLoad, data, error);
                    //GS.removeLoader(element);
                }
            },
            bolClearPrevious
        );
    }

    function refreshControl(element, bolspan) {
        var i;
        var len;
        var divElement;
        var arrPassThroughAttributes = [
            'placeholder',
            'name',
            'maxlength',
            'autocorrect',
            'autocapitalize',
            'autocomplete',
            'autofocus',
            'spellcheck',
            'readonly'
        ];
        var ctrlValue;

        if (element.hasAttribute('defer-insert')) {
            if (element.hasAttribute('value')) {
                element.ignoreChange = true;
                ctrlValue = element.getAttribute('value');
            } else {
                ctrlValue = element.value;
            }
            ctrlValue = (ctrlValue || '');
        } else {
            // if the gs-text element has a tabindex: save the tabindex and remov the attribute
            if (element.hasAttribute('tabindex')) {
                element.savedTabIndex = element.getAttribute('tabindex');
                element.removeAttribute('tabindex');
            }
        }

        // clear out the combobox HTML
        element.innerHTML = '';

        // creating/setting root
        divElement = document.createElement('div');
        divElement.setAttribute('gs-dynamic', '');
        divElement.classList.add('root');

        element.appendChild(divElement);
        element.root = divElement;
        if (!bolspan) {
            element.root.innerHTML = (
                '<input role="textbox" aria-autocomplete="none" gs-dynamic class="control" type="text" />' +
                '<gs-button gs-dynamic aria-label="Open the Combo box" alt="Open the Combo box" class="drop_down_button" icononly icon="angle-down"></gs-button>'
            );
        } else {
            element.root.innerHTML = (
                '<span gs-dynamic class="control" type="text" style="width: 100%;">' + ctrlValue + '</span>' +
                '<gs-button gs-dynamic aria-label="Open the Combo box" alt="Open the Combo box" class="drop_down_button" icononly icon="angle-down"></gs-button>'
            );
        }

        element.control = xtag.query(element, '.control')[0];
        if (element.hasAttribute('id')) {
            element.control.setAttribute('id', element.getAttribute('id') + '_control');
        }
        if (element.hasAttribute('aria-labelledby')) {
            element.control.setAttribute('aria-labelledby', element.getAttribute('aria-labelledby'));
        }
        if (element.hasAttribute('title')) {
            element.control.setAttribute('title', element.getAttribute('title'));
        }
        element.dropDownButton = xtag.query(element, '.drop_down_button')[0];
        element.dropDownButton.removeAttribute('tabindex');
        element.dropDownButton.savedTabIndex = false;

        if (element.hasAttribute('defer-insert')) {
            element.control.value = ctrlValue;
        }

        // copy passthrough attrbutes to control
        i = 0;
        len = arrPassThroughAttributes.length;
        while (i < len) {
            if (element.hasAttribute(arrPassThroughAttributes[i])) {
                element.control.setAttribute(arrPassThroughAttributes[i], element.getAttribute(arrPassThroughAttributes[i]) || '');
            }
            i += 1;
        }

        // if we saved a tabindex: apply the tabindex to the control
        if (element.savedTabIndex !== undefined && element.savedTabIndex !== null) {
            element.control.setAttribute('tabindex', element.savedTabIndex);
        }

        // bind change event to control
        //console.log('change bound');
        element.control.addEventListener('change', function (event) {
            event.preventDefault();
            event.stopPropagation();

            //console.log('change detected');
            if (!element.ignoreChange) {
                selectRecordFromValue(element, this.value, true);
            }
            element.ignoreChange = false;
            element.lastValue = element.control.value;
        });

        //  on safari the change event doesn't occur if you click out while the autocomplete has
        //      completed the value (because the user technically didn't change after the javascript changed the value)
        //  to solve this the code below will mimic a change event if one does not occur at the right time

        // there are two ways that user's cause change events:
        //      1) after making a change to the value: taking the focus out of the field
        //      2) after making a change to the value: hitting return

        // this code counts on the fact that a browser will always emit a change event before a 'blur' or 'keyup'
        // the execution is as follows

        // this is the basic plan:
        //  change:
        //          // changeOccured tells the event code to not do anything because a change event did fire
        //          element.changeOccured to true
        //  focus:
        //          // element.lastValue allows us to compare the value to the old value, and if there's a difference: we need a change event
        //          set element.lastValue to current value of the control
        //  blur:
        //          if element.changeOccured === true:
        //              set element.changeOccured = false
        //          else:
        //              if control.value !== lastValue: // if the value has been changed
        //                  trigger artificial change event on control
        //  keyup (on return key):
        //          if element.changeOccured === true:
        //              set element.changeOccured = false
        //          else:
        //              if control.value !== lastValue: // if the value has been changed
        //                  trigger artificial change event on control

        element.control.addEventListener('change', function () {
            element.changeOccured = true;
        });

        if (element.hasAttribute('defer-insert')) {
            if (element.hasRun) {
                element.control.focus();
            }
            element.addEventListener('focus', focusFunction);

            element.control.addEventListener('blur', blurFunction);
        } else {
            element.control.addEventListener('focus', function (event) {
                element.lastValue = element.control.value;
                element.control.focus();
                event.target.parentNode.parentNode.classList.add('focus');
            });

            element.control.addEventListener('blur', function (event) {
                if (element.changeOccured === true) {
                    element.changeOccured = false;
                } else if (element.control.value !== element.lastValue) {
                    GS.triggerEvent(element.control, 'change');
                }

                event.target.parentNode.parentNode.classList.remove('focus');
            });
        }

        element.control.addEventListener(evt.mouseout, function (event) {
            event.target.parentNode.parentNode.classList.remove('hover');
        });

        element.control.addEventListener(evt.mouseover, function (event) {
            event.target.parentNode.parentNode.classList.add('hover');
        });

        element.control.addEventListener('keyup', function (event) {
            // if the key was return
            if ((event.keyCode || event.which) === 13 && !element.hasAttribute('readonly')) {
                if (element.changeOccured === true) {
                    element.changeOccured = false;
                } else if (element.control.value !== element.lastValue) {
                    GS.triggerEvent(element.control, 'change');
                }
            }
        });
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
                arrAttrParts = strQSCol.split(/[\s]*,[\s]*/);
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

    // dont do anything that modifies the element here
    function elementCreated(element) {
        // if "created" hasn't been suspended: run created code
        if (!element.hasAttribute('suspend-created')) {
            if (!element.hasAttribute('role')) {
                element.setAttribute('role', 'combobox');
            }
        }
    }

    function findFor(element) {
        var forElem;

        if (
            element.previousElementSibling &&
            element.previousElementSibling.tagName.toUpperCase() === 'LABEL' &&
            element.previousElementSibling.hasAttribute('for') &&
            element.previousElementSibling.getAttribute('for') === element.getAttribute('id')
        ) {
            forElem = element.previousElementSibling;
        } else if (xtag.query(document, 'label[for="' + element.getAttribute('id') + '"]').length > 0) {
            forElem = xtag.query(document, 'label[for="' + element.getAttribute('id') + '"]')[0];
        }

        if (forElem) {
            forElem.setAttribute('for', element.getAttribute('id') + '_control');
            if (element.control) {
                element.control.setAttribute('id', element.getAttribute('id') + '_control');
                if (element.hasAttribute('aria-labelledby')) {
                    element.control.setAttribute('aria-labelledby', element.getAttribute('aria-labelledby'));
                }
                if (element.hasAttribute('title')) {
                    element.control.setAttribute('title', element.getAttribute('title'));
                }
            }
        }
    }

    var comboID = 0;
    function elementInserted(element) {
        var tableTemplateElement;
        var tableTemplateElementCopy;
        var i;
        var len;
        var recordElement;
        var arrElement;
        var currentElement;

        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;
                element.internal = {};
                element.internalData = {};
                saveDefaultAttributes(element);

                element.internal.id = comboID;
                comboID += 1;

                element.dropdownOpen = false;
                element.error = false;
                element.ready = false;

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
                if (element.hasAttribute('defer-insert')) {
                    if (!element.hasAttribute('tabindex')) {
                        element.setAttribute('tabindex', '0');
                    }
                    element.bolSelect = true;
                }

                tableTemplateElement = xtag.queryChildren(element, 'template')[0];

                if (tableTemplateElement) {
                    if (tableTemplateElement.innerHTML.indexOf('&gt;') > -1 || tableTemplateElement.innerHTML.indexOf('&lt;') > -1) {
                        console.warn('GS-COMBO WARNING: &gt; or &lt; detected in table template, this can have undesired effects on doT.js. Please use gt(x,y), gte(x,y), lt(x,y), or lte(x,y) to silence this warning.');
                    }

                    tableTemplateElementCopy = document.createElement('template');
                    tableTemplateElementCopy.innerHTML = tableTemplateElement.innerHTML;

                    recordElement = xtag.query(xtag.query(tableTemplateElementCopy.content, 'tbody')[0], 'tr')[0];

                    if (recordElement) {
                        arrElement = xtag.query(recordElement, '[column]');

                        i = 0;
                        len = arrElement.length;
                        while (i < len) {
                            currentElement = arrElement[i];

                            if ((!currentElement.getAttribute('value')) && currentElement.getAttribute('column')) {
                                currentElement.setAttribute('value', '{{! row.' + currentElement.getAttribute('column') + ' }}');
                            }
                            i += 1;
                        }

                        element.tableTemplate = tableTemplateElementCopy.innerHTML;

                        if (!element.getAttribute('src') && !element.getAttribute('source') && !element.getAttribute('initalize')) {
                            element.dropDownTable = GS.cloneElement(xtag.query(tableTemplateElementCopy.content, 'table')[0]);
                        }
                    }
                }

                // filling root
                if (element.hasAttribute('defer-insert')) {
                    refreshControl(element, true);
                    element.addEventListener(evt.mousedown, function (event) {
                        if (event.target.classList.contains('drop_down_button')) {
                            var element = event.target.parentNode.parentNode;
                            if (!element.dropdownOpen && !element.error) {
                                openDropDown(element);
                                element.ignoreClick = true;

                                event.stopImmediatePropagation();
                                event.stopPropagation();
                                event.preventDefault();
                            }
                        }// else if (evt.touchDevice && event.target.classList.contains('control')) {
                        //     var element = event.target.parentNode.parentNode;
                        //     //alert(event.target.outerHTML);
                        //     focusFunction(event);
                        //     if (document.activeElement == element.control) {
                        //         event.stopImmediatePropagation();
                        //         event.stopPropagation();
                        //         event.preventDefault();
                        //     }
                        // }
                    });
                    if (evt.touchDevice) {
                        element.addEventListener(evt.click, focusFunction);
                        element.addEventListener(evt.mousedown, function (event) {
                            element.startX = event.touches[0].clientX;
                            element.startY = event.touches[0].clientY;

                            element.addEventListener('touchmove', function (event) {
                                element.lastX = event.touches[0].clientX;
                                element.lastY = event.touches[0].clientY;
                            });
                        });
                        element.addEventListener(evt.mouseup, function (event) {
                            var element = event.target;
                            if (event.target.classList.contains('control')) {
                                element = event.target.parentNode.parentNode;
                            }
                            if (
                                element.lastX &&
                                element.lastY &&
                                (
                                    parseInt(element.lastX, 10) > (parseInt(element.startX, 10) + 10) ||
                                    parseInt(element.lastX, 10) < (parseInt(element.startX, 10) - 10) ||
                                    parseInt(element.lastY, 10) > (parseInt(element.startY, 10) + 10) ||
                                    parseInt(element.lastY, 10) < (parseInt(element.startY, 10) - 10)
                                )
                            ) {
                            } else {// if (element.startY && element.startX) {
                                focusFunction(event);
                            }
                        });
                    }

                } else {
                    refreshControl(element);
                    element.addEventListener('click', function (event) {
                        var clickHandler;
                        if (event.target.classList.contains('drop_down_button')) {
                            //console.log(element.dropdownOpen, element.error);
                            if (!element.dropdownOpen && !element.error) {
                                clickHandler = function () {
                                    openDropDown(element);
                                    window.removeEventListener('click', clickHandler);
                                };

                                window.addEventListener('click', clickHandler);
                            } else {
                                //closeDropDown(element);
                            }
                        }
                    });
                }

                element.addEventListener('keydown', function (event) {
                    if (event.target.classList.contains('control')) {
                        handleKeyDown(element, event);
                    }
                });

                element.addEventListener('keyup', function (event) {
                    if (event.target.classList.contains('control')) {
                        handleKeyUp(element, event);
                    }
                });

                if (xtag.queryChildren(element, '.root').length < 1) {
                    refreshControl(element);
                }

                if (element.getAttribute('src') || element.getAttribute('source') || element.getAttribute('initalize')) {
                    getData(element, true);
                } else {
                    element.ready = true;

                    if (element.getAttribute('value')) {
                        selectRecordFromValue(element, element.getAttribute('value'), false);

                    } else if (element.value) {
                        selectRecordFromValue(element, element.value, false);
                    }
                }

                // retarget focus and blur events
                element.addEventListener('focus', function () {
                    GS.triggerEvent(element, 'onfocus');
                    if (element.hasAttribute('onfocus')) {
                        new Function(element.getAttribute('onfocus')).apply(element);
                    }
                }, true);

                element.addEventListener('blur', function () {
                    GS.triggerEvent(element, 'onblur');
                    if (element.hasAttribute('onblur')) {
                        new Function(element.getAttribute('onblur')).apply(element);
                    }
                }, true);
            }
            if (element.hasAttribute('id')) {
                findFor(element);
            }
        }
    }

    xtag.register('gs-combo', {
        lifecycle: {
            created: function () {
                // if the value was set before the "created" lifecycle code runs: set attribute
                //      (discovered when trying to set a value of a date control in the after_open of a dialog)
                //      ("delete" keyword added because of firefox)
                if (this.value && !this.hasAttribute('value')) {
                    this.setAttribute('value', this.value);
                    delete this.value;
                }

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
                    if (strAttrName === 'value' && oldValue !== newValue) {
                        this.value = newValue;
                    }
                }
            }
        },
        events: {},
        accessors: {
            value: {
                get: function () {
                    if (this.control || this.innerValue) {
                        return this.innerValue || this.control.value;
                    }
                    if (this.getAttribute('value')) {
                        return this.getAttribute('value');
                    }
                    return undefined;
                },

                // set the value of the input and set the value attribute
                set: function (newValue) {
                    if (this.hasAttribute('defer-insert')) {
                        // if we have not yet templated: just stick the value in an attribute
                        if (this.ready === false) {
                            if (newValue !== this.getAttribute('value')) {
                                this.setAttribute('value', newValue);
                            }

                        // else if the value is empty and allow-empty is present
                        } else if (newValue === '' && this.hasAttribute('allow-empty')) {
                            this.innerValue = '';
                            this.control.value = '';

                        // else select the record using the string that was sent
                        } else {
                            selectRecordFromValue(this, newValue, false);
                        }
                        if (this.control && this.control.tagName.toUpperCase() === 'SPAN') {
                            refreshControl(this, true);
                        } else {
                            refreshControl(this);
                        }
                    } else {
                        // if we have not yet templated: just stick the value in an attribute
                        if (this.ready === false) {
                            if (newValue !== this.getAttribute('value')) {
                                this.setAttribute('value', newValue);
                            }

                        // else if the value is empty and allow-empty is present
                        } else if (newValue === '' && this.hasAttribute('allow-empty')) {
                            this.innerValue = '';
                            this.control.value = '';

                        // else select the record using the string that was sent
                        } else {
                            selectRecordFromValue(this, newValue, false);
                        }
                    }
                }
            },
            textValue: {
                // get value straight from the input
                get: function () {
                    return this.control.value;
                },

                // set the value of the input and set the value attribute
                set: function (newValue) {
                    if (this.hasAttribute('defer-insert')) {
                        // if we have not yet templated: just stick the value in an attribute
                        if (this.ready === false) {
                            this.setAttribute('value', newValue);

                        // else select the record using the string that was sent
                        } else {
                            selectRecordFromValue(this, newValue, false);
                        }
                        if (this.control.tagName.toUpperCase() === 'SPAN') {
                            refreshControl(this, true);
                        } else {
                            refreshControl(this);
                        }
                    } else {
                        // if we have not yet templated: just stick the value in an attribute
                        if (this.ready === false) {
                            this.setAttribute('value', newValue);

                        // else select the record using the string that was sent
                        } else {
                            selectRecordFromValue(this, newValue, false);
                        }
                    }
                }
            }
        },
        methods: {
            focus: function () {
                var element = this;
                if (element.hasAttribute('defer-insert')) {
                    element.toInput();
                }
                element.control.focus();
            },

            'getData': function (callback) {
                getData(this, undefined, true, callback);
            },

            'refresh': function (callback) {
                getData(this, undefined, true, callback);
            },

            'open': function () {
                openDropDown(this);
            },

            'close': function () {
                closeDropDown(this);
            },

            'column': function (strColumn) {
                if (this.selectedRecord) {
                    return this.internalData.records.dat[this.selectedRecord.rowIndex][this.internalData.records.arr_column.indexOf(strColumn)];
                } else {
                    return null;
                }
            },

            'toSpan': function () {
                var element = this;
                element.control.removeEventListener('blur', blurFunction);
                element.removeEventListener('focus', focusFunction);
                refreshControl(element, true);
                element.control.value = element.value;
                //var inputWidth = element.offsetWidth;
                element.control.setInputSelectionRange = function () {
                  //console.log('Intercepted');
                };
                if (element.getAttribute('placeholder') && element.control.innerHTML === '') {
                    element.control.classList.add('placeholder');
                    element.control.innerHTML = element.getAttribute('placeholder');
                }
                //if (evt.touchDevice) {
                //    element.style.width = inputWidth + 'px';
                //}
                selectRecordFromValue(element, element.value, false);
            },

            'toInput': function () {
                var element = this;
                element.control.removeEventListener('blur', blurFunction);
                element.removeEventListener('focus', focusFunction);
                refreshControl(element);
                element.control.value = element.value;
                selectRecordFromValue(element, element.value, false);
            }
        }
    });
});
