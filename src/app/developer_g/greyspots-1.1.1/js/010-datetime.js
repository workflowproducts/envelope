//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps, addFocusEvents
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    'use strict';

    addSnippet('<gs-datetime>', '<gs-datetime>', 'gs-datetime></gs-datetime>');

    // TODO: there is no documentation
    // designRegisterElement('gs-datetime', '#');

    window.designElementProperty_GSDATETIME = function() {
        addGSControlProps();
        addText('O', 'Column In QS', 'qs');
        addCheck('V', 'Calendar on desktop', 'desktop-calendar');
        addText('V', 'Placeholder', 'placeholder');
        addFocusEvents();
        addFlexProps();
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    function transformCSS(css) {
        return  '-webkit-transform: ' + css + '; ' +
                '-moz-transform: ' + css + '; ' +
                '-ms-transform: ' + css + '; ' +
                '-o-transform: ' + css + '; ' +
                'transform: ' + css + ';';
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
        var strOperator;

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

        element.internal.bolQSFirstRun = true;
    }

    /***************** DATETIME CALENDAR *****************/
    
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

    function datetimeOpenCalendarDialog(element) {
        'use strict';
        var i, len, dateHTML, timeHTML, pickerHTML, dialogHTML, dialogTemplate = document.createElement('template');
        var dteToday = new Date(), dteValue = element.dteValue || new Date(dteToday);

        dateHTML = ml(function () {/*
            <div class="adjust-section date-adjust-section centered">
                <div class="date-today">&#xf017;</div>
                <div class="date-input">
                    <input class="month" />
                    <span class="divider">/</span>
                    <input class="day" />
                    <span class="divider">/</span>
                    <input class="year" />
                </div>
                <div class="adjust-container">
                    <div class="date-adjust up">&#xf077;</div><div class="date-adjust down">&#xf078;</div>
                </div>
            </div>
            <div class="calendar centered">
                <gs-button class="month-letter" month="0" remove-right>J</gs-button><gs-button class="month-letter" month="1" remove-all>F</gs-button><gs-button class="month-letter" month="2" remove-all>M</gs-button><gs-button class="month-letter" month="3" remove-all>A</gs-button><gs-button class="month-letter" month="4" remove-all>M</gs-button><gs-button class="month-letter" month="5" remove-all>J</gs-button><gs-button class="month-letter" month="6" remove-all>J</gs-button><gs-button class="month-letter" month="7" remove-all>A</gs-button><gs-button class="month-letter" month="8" remove-all>S</gs-button><gs-button class="month-letter" month="9" remove-all>O</gs-button><gs-button class="month-letter" month="10" remove-all>N</gs-button><gs-button class="month-letter" month="11" remove-left>D</gs-button>
                <div flex-horizontal>
                    <gs-button icononly icon="chevron-left" class="month-adjust down"></gs-button>

                    <center flex class="month-label"></center>

                    <gs-button icononly icon="chevron-right" class="month-adjust up"></gs-button>
                </div>
                <div flex-horizontal>
                    <gs-button icononly icon="chevron-left" class="year-adjust down"></gs-button>

                    <center flex class="year-label"></center>

                    <gs-button icononly icon="chevron-right" class="year-adjust up"></gs-button>
                </div>
                <div>
                    <div class="day-letter">S</div><div class="day-letter">M</div><div class="day-letter">T</div><div class="day-letter">W</div><div class="day-letter">T</div><div class="day-letter">F</div><div class="day-letter">S</div>
                </div>
            </div>
        */});

        timeHTML = ml(function () {/*
            <div class="time-section">
                <div class="adjust-section time-adjust-section centered">
                    <div class="time-now">&#xf017;</div>
                    <div class="time-input">
                        <input class="hour" />
                        <span class="divider">:</span>
                        <input class="minute" />
                        <span class="divider">:</span>
                        <input class="second" />
                        <span class="divider"> </span>
                        <input class="ampm" />
                    </div>
                    <div class="adjust-container">
                        <div class="time-adjust up">&#xf077;</div><div class="time-adjust down">&#xf078;</div>
                    </div>
                </div>
                <div class="clock-parent">
                    <div class="clock"></div>
                </div>
            </div>
        */});

        if (element.hasDate && element.hasTime) {
            pickerHTML = ml(function () {/*
                <gs-grid widths="1,1">
                    <gs-block>
                        {{DATEHTML}}
                    </gs-block>
                    <gs-block>
                        {{TIMEHTML}}
                    </gs-block>
                </gs-grid>
            */}).replace('{{DATEHTML}}', dateHTML).replace('{{TIMEHTML}}', timeHTML);

        } else if (element.hasDate) {
            pickerHTML = dateHTML;

        } else if (element.hasTime) {
            pickerHTML = timeHTML;

        }

        dialogHTML = ml(function () {/*
            <gs-body class="gs-datetime-calendar-dialog">
                {{PICKERHTML}}
                <gs-grid widths="1,1">
                    <gs-block>
                        <gs-button dialogclose>Cancel</gs-button>
                    </gs-block>
                    <gs-block>
                        <gs-button dialogclose bg-primary>Done</gs-button>
                    </gs-block>
                </gs-grid>
            </gs-body>
        */}).replace('{{PICKERHTML}}', pickerHTML);
        dialogTemplate.innerHTML = dialogHTML;
        dialogTemplate.setAttribute('no-background', '');
        dialogTemplate.setAttribute('data-overlay-close', '');
        if (!element.hasTime) {
            dialogTemplate.setAttribute('data-max-width', '25em');
        }
        GS.openDialogToElement(element, dialogTemplate, 'down', function () {
            var dteStart = new Date(dteValue);

            var refreshDateInputs = function () {};
            var refreshTimeInputs = function () {};

            var regenerateCalendar = function () {};
            var resetClock = function () {};

            if (element.hasDate) {
                var dialog = this;

                var calendar = xtag.query(dialog, '.calendar')[0];
                var dateAdjustSection = xtag.query(dialog, '.date-adjust-section')[0];
                var dateInput = xtag.query(dateAdjustSection, '.date-input')[0];

                var dayInput = xtag.query(dateInput, '.day')[0];
                var monthInput = xtag.query(dateInput, '.month')[0];
                var yearInput = xtag.query(dateInput, '.year')[0];

                var monthLabel = xtag.query(calendar, '.month-label')[0];
                var yearLabel = xtag.query(calendar, '.year-label')[0];
                var arrMonth = [
                    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
                ];
                
                if (element.hasAttribute('spanish')) {
                    var arrMonth = [
                        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                    ];
                } else {
                    var arrMonth = [
                        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
                    ];
                }

                refreshDateInputs = function () {
                    dayInput.value = GS.leftPad(dteValue.getDate(), '0', 2);
                    monthInput.value = GS.leftPad(dteValue.getMonth() + 1, '0', 2);
                    yearInput.value = dteValue.getFullYear();

                    if (dateInput.selectText) {
                        GS.setInputSelection(dateInput.selectText, 0, dateInput.selectText.value.length);
                        dateInput.selectText = null;
                    }
                };
                refreshDateInputs();

                regenerateCalendar = function (dteStart) {
                    var children = xtag.queryChildren(calendar, '.day');
                    for (var i = 0, len = children.length; i < len; i += 1) {
                        calendar.removeChild(children[i]);
                    }

                    var dteCurrent = new Date(dteStart), intCurrentMonth = dteCurrent.getMonth(), intNextMonth = intCurrentMonth + 1;
                    if (intNextMonth === 12) {
                        intNextMonth = 0;
                    }

                    monthLabel.innerText = arrMonth[dteStart.getMonth()];
                    yearLabel.innerText = dteStart.getFullYear();

                    dteCurrent.setDate(1);
                    dteCurrent.setDate(dteCurrent.getDate() - dteCurrent.getDay());

                    while (dteCurrent.getMonth() !== intNextMonth || dteCurrent.getDay() !== 0) {
                        var day = document.createElement('div');
                        day.classList.add('day');
                        day.innerText = dteCurrent.getDate();
                        if (dteCurrent.getMonth() !== intCurrentMonth) {
                            day.classList.add('grey');
                        }
                        if (dteCurrent.getMonth() === dteToday.getMonth() && dteCurrent.getFullYear() === dteToday.getFullYear() && dteCurrent.getDate() === dteToday.getDate()) {
                            day.classList.add('today');
                            if (!element.hasAttribute('show-today')) {
                                day.innerText = 'T';
                            }
                        }
                        if (dteCurrent.getMonth() === dteValue.getMonth() && dteCurrent.getFullYear() === dteValue.getFullYear() && dteCurrent.getDate() === dteValue.getDate()) {
                            day.classList.add('selected');
                        }
                        day.value = new Date(dteCurrent);
                        calendar.appendChild(day);

                        dteCurrent.setDate(dteCurrent.getDate() + 1);
                    }
                };
                regenerateCalendar(dteStart);

                dateInput.addEventListener('keyup', function (event) {
                    var code = event.which || event.keyCode || event.charCode;
                    var dtePreviousValue = new Date(dteValue);
                    // 37: left
                    // 38: up
                    // 39: right
                    // 40: down
                    if (code === 38 || code === 40) {
                        event.target.value = GS.leftPad((parseInt(event.target.value, 10) + (code === 38 ? 1 : -1)).toString(), '0', 2);
                        dateInput.selectText = event.target;
                        event.preventDefault();
                    }

                    if (event.target.classList.contains('year') && code === 37) {
                        xtag.query(dateInput, '.day')[0].focus();
                        event.preventDefault();

                    } else if (event.target.classList.contains('year') && code === 39) {
                        event.preventDefault();

                    } else if (event.target.classList.contains('year')) {
                        dteValue.setFullYear(event.target.value);
                        dteStart = new Date(dteValue);
                        event.target.value = dteValue.getFullYear();

                    } else if (event.target.classList.contains('month') && code === 37) {
                        event.preventDefault();

                    } else if (event.target.classList.contains('month') && code === 39) {
                        xtag.query(dateInput, '.day')[0].focus();
                        event.preventDefault();

                    } else if (event.target.classList.contains('month')) {
                        event.target.value = GS.leftPad(event.target.value.substring(0, 2), '0', 2);
                        dteValue.setMonth(parseInt(event.target.value, 10) - 1);
                        dteStart = new Date(dteValue);
                        event.target.value = GS.leftPad(dteValue.getMonth() + 1, '0', 2);

                    } else if (event.target.classList.contains('day') && code === 37) {
                        xtag.query(dateInput, '.month')[0].focus();
                        event.preventDefault();

                    } else if (event.target.classList.contains('day') && code === 39) {
                        xtag.query(dateInput, '.year')[0].focus();
                        event.preventDefault();

                    } else if (event.target.classList.contains('day')) {
                        dteValue.setDate(event.target.value);
                        event.target.value = GS.leftPad(dteValue.getDate(), '0', 2);
                        dteStart = new Date(dteValue);
                    }

                    if (dtePreviousValue.getTime() !== dteValue.getTime()) {
                        refreshDateInputs();
                        regenerateCalendar(dteStart);
                    }
                });

                dateAdjustSection.addEventListener('mousedown', function (event) {
                    if (event.target.nodeName.toUpperCase() !== 'INPUT') {
                        event.preventDefault();
                    }
                });

                dateAdjustSection.addEventListener('click', function (event) {
                    var dtePreviousValue = new Date(dteValue);
                    var activeElement = document.activeElement; // just to shorten things a bit

                    if (activeElement.parentNode.classList.contains('date-input') && event.target.classList.contains('date-adjust')) {
                        activeElement.value = GS.leftPad((parseInt(activeElement.value, 10) + (event.target.classList.contains('up') ? 1 : -1)).toString(), '0', 2);
                        dateInput.selectText = activeElement;

                        if (activeElement.classList.contains('year')) {
                            dteValue.setFullYear(activeElement.value);

                        } else if (activeElement.classList.contains('month')) {
                            dteValue.setMonth(parseInt(activeElement.value, 10) - 1);

                        } else if (activeElement.classList.contains('day')) {
                            dteValue.setDate(activeElement.value);
                        }
                        dteStart = new Date(dteValue);

                    } else if (event.target.classList.contains('date-today')) {
                        dteValue.setFullYear(dteToday.getFullYear());
                        dteValue.setMonth(dteToday.getMonth());
                        dteValue.setDate(dteToday.getDate());

                        dteStart = new Date(dteValue);

                    }

                    if (dtePreviousValue.getTime() !== dteValue.getTime()) {
                        refreshDateInputs();
                        regenerateCalendar(dteStart);
                    }
                });

                calendar.addEventListener('click', function (event) {
                    if (event.target.classList.contains('month-letter')) {
                        dteStart.setMonth(event.target.getAttribute('month'));

                        regenerateCalendar(dteStart);

                    } else if (event.target.classList.contains('day')) {
                        var selected = xtag.query(calendar, '.selected')[0];
                        if (selected) {
                            selected.classList.remove('selected');
                            event.target.classList.add('selected');
                        }

                        dteValue = event.target.value;
                        dteStart = new Date(dteValue);

                        if (element.hasTime) {
                            refreshDateInputs();
                            if (event.target.classList.contains('grey')) {
                                regenerateCalendar(dteStart);
                            }
                        } else {
                            GS.closeDialog(dialog, 'Done');
                        }
                    } else if (event.target.classList.contains('month-adjust')) {
                        dteStart.setMonth(dteStart.getMonth() + (event.target.classList.contains('up') ? 1 : -1));

                        monthLabel.innerText = arrMonth[dteStart.getMonth()];

                        regenerateCalendar(dteStart);
                    } else if (event.target.classList.contains('year-adjust')) {
                        dteStart.setFullYear(dteStart.getFullYear() + (event.target.classList.contains('up') ? 1 : -1));

                        yearLabel.innerText = dteStart.getFullYear();

                        regenerateCalendar(dteStart);
                    }
                });
            }

            //console.log(element.hasTime);
            if (element.hasTime) {
                var clock = xtag.query(document, 'gs-dialog .clock')[0];
                var timeAdjustSection = xtag.query(document, 'gs-dialog .time-adjust-section')[0];
                var timeInput = xtag.query(timeAdjustSection, '.time-input')[0];

                var hourInput = xtag.query(timeInput, '.hour')[0];
                var minuteInput = xtag.query(timeInput, '.minute')[0];
                var secondInput = xtag.query(timeInput, '.second')[0];
                var ampmInput = xtag.query(timeInput, '.ampm')[0];

                var hourHand;
                var minuteHand;
                var secondHand;

                refreshTimeInputs = function () {
                    var hour = dteValue.getHours();
                    var ampm = hour >= 12 ? 'PM' : 'AM';
                    hour = hour === 0 ? 24 : hour;
                    hour = hour > 12 ? hour - 12 : hour;
                    hourInput.value = GS.leftPad(hour, '0', 2);
                    minuteInput.value = GS.leftPad(dteValue.getMinutes(), '0', 2);
                    secondInput.value = GS.leftPad(dteValue.getSeconds(), '0', 2);
                    ampmInput.value = ampm;

                    if (timeInput.selectText) {
                        GS.setInputSelection(timeInput.selectText, 0, timeInput.selectText.value.length);
                        timeInput.selectText = null;
                    }
                };
                refreshTimeInputs();

                var i = 0, len = 60, clockHTML = '';
                for (; i < len; i += 1) {
                    clockHTML += '<div class="marking' + ((i % 5) === 0 ? ' large' : '') + '" style="' + transformCSS('rotate(' + i * 6 + 'deg)') + '"></div>';
                }
                clockHTML += ml(function () {/*
                    <div class="position-reference"></div>
                    <div class="clock-hand hour-hand">
                        <div class="clock-hand-drag-handle"></div>
                    </div>
                    <div class="clock-hand minute-hand">
                        <div class="clock-hand-drag-handle"></div>
                    </div>
                    <div class="clock-hand second-hand">
                        <div class="clock-hand-drag-handle"></div>
                    </div>
                */});
                clock.innerHTML = clockHTML;
                hourHand = xtag.query(clock, '.hour-hand')[0];
                minuteHand = xtag.query(clock, '.minute-hand')[0];
                secondHand = xtag.query(clock, '.second-hand')[0];
                var resetClock = function () {
                    // the 180 is because the html is such that the hands point down
                    hourHand.setAttribute('style', transformCSS('rotate(' + (((dteValue.getHours() % 12) * 30) + 180) + 'deg)'));
                    minuteHand.setAttribute('style', transformCSS('rotate(' + ((dteValue.getMinutes() * 6) + 180) + 'deg)'));
                    secondHand.setAttribute('style', transformCSS('rotate(' + ((dteValue.getSeconds() * 6) + 180) + 'deg)'));
                };
                resetClock();

                timeInput.addEventListener('keyup', function (event) {
                    var code = event.which || event.keyCode || event.charCode;
                    var dtePreviousValue = new Date(dteValue);
                    // 38: up
                    // 40: down
                    // 65: a
                    // 80: p
                    if (event.target.classList.contains('ampm')) {
                        timeInput.selectText = event.target;
                        event.preventDefault();

                        if (dteValue.getHours() >= 12 && (code === 65 || code === 38 || code === 40)) {
                            dteValue.setHours(dteValue.getHours() - 12);

                        } else if (dteValue.getHours() < 12 && (code === 80 || code === 38 || code === 40)) {
                            dteValue.setHours(dteValue.getHours() + 12);

                        }

                    } else if (code === 38 || code === 40) {
                        event.target.value = GS.leftPad((parseInt(event.target.value, 10) + (code === 38 ? 1 : -1)).toString(), '0', 2);
                        timeInput.selectText = event.target;
                        event.preventDefault();
                    }

                    if (event.target.classList.contains('hour')) {
                        dteValue.setHours(event.target.value + (dteValue.getHours() > 12 ? 12 : 0));
                        dteStart = new Date(dteValue);

                    } else if (event.target.classList.contains('minute')) {
                        dteValue.setMinutes(event.target.value);
                        dteStart = new Date(dteValue);

                    } else if (event.target.classList.contains('second')) {
                        dteValue.setSeconds(event.target.value);
                        dteStart = new Date(dteValue);
                    }

                    if (dtePreviousValue.getTime() !== dteValue.getTime()) {
                        refreshTimeInputs();
                        refreshDateInputs();

                        resetClock(dteStart);
                        regenerateCalendar(dteStart);
                    }
                });

                timeAdjustSection.addEventListener('mousedown', function (event) {
                    if (event.target.nodeName.toUpperCase() !== 'INPUT') {
                        event.preventDefault();
                    }
                });

                timeAdjustSection.addEventListener('click', function (event) {
                    var dtePreviousValue = new Date(dteValue);
                    var activeElement = document.activeElement; // just to shorten things a bit

                    if (event.target.classList.contains('ampm')) {
                        GS.setInputSelection(event.target, 0, 2);

                    } else if (activeElement.parentNode.classList.contains('time-input') && event.target.classList.contains('time-adjust')) {
                        if (activeElement.classList.contains('ampm')) {
                            if (dteValue.getHours() < 12) {
                                dteValue.setHours(dteValue.getHours() + 12);

                            } else {
                                dteValue.setHours(dteValue.getHours() - 12);
                            }

                        } else {
                            activeElement.value = GS.leftPad((parseInt(activeElement.value, 10) + (event.target.classList.contains('up') ? 1 : -1)).toString(), '0', 2);
                        }
                        timeInput.selectText = activeElement;

                        if (activeElement.classList.contains('hour')) {
                            if (activeElement.value === '11' && dteValue.getHours() === 0) {
                                dteValue.setHours(-1);

                                dteStart = new Date(dteValue);
                                regenerateCalendar(dteStart);
                            } else {
                                dteValue.setHours(parseInt(activeElement.value, 10) + (dteValue.getHours() > 12 ? 12 : 0));
                            }

                        } else if (activeElement.classList.contains('minute')) {
                            dteValue.setMinutes(activeElement.value);

                        } else if (activeElement.classList.contains('second')) {
                            dteValue.setSeconds(activeElement.value);

                        }
                        dteStart = new Date(dteValue);

                    } else if (event.target.classList.contains('time-now')) {
                        var dteNow = new Date();
                        dteValue.setHours(dteToday.getHours());
                        dteValue.setMinutes(dteToday.getMinutes());
                        dteValue.setSeconds(dteToday.getSeconds());

                        dteStart = new Date(dteValue);

                    }

                    if (dtePreviousValue.getTime() !== dteValue.getTime()) {
                        refreshTimeInputs();
                        refreshDateInputs();

                        resetClock(dteStart);
                        regenerateCalendar(dteStart);
                    }
                });

                clock.addEventListener('mousedown', function (event) {
                    var target = event.target;

                    var clockRect = clock.getBoundingClientRect();
                    var refX = clockRect.left + (clockRect.width / 2);
                    var refY = clockRect.top + (clockRect.height / 2);

                    if (target.classList.contains('clock-hand-drag-handle')) {
                        target = target.parentNode;
                    }

                    if (target.classList.contains('clock-hand')) {
                        var dragHandler = function (event) {
                            var x = event.clientX - refX;
                            var y = event.clientY - refY;
                            var thetaRad = Math.atan2(y, x); // atan2 needs y first (?!?!?!?)
                            var thetaDeg = thetaRad * (180 / Math.PI);
                            if (target.classList.contains('hour-hand')) {
                                var tMod30 = thetaDeg % 30;
                                if (tMod30 <= 15) {
                                    thetaDeg -= tMod30;
                                } else {
                                    thetaDeg += 30 - tMod30;
                                }
                            } else {
                                var tMod6 = thetaDeg % 6;
                                if (tMod6 <= 3) {
                                    thetaDeg -= tMod6;
                                } else {
                                    thetaDeg += 6 - tMod6;
                                }
                            }
                            thetaDeg += 90;
                            if (thetaDeg <= 0) {
                                thetaDeg += 360;
                            }

                            if (target.classList.contains('hour-hand')) {
                                var newHours = thetaDeg / 30;
                                // 11PM -> 12AM
                                if (dteValue.getHours() === 23 && newHours === 12) {
                                    dteValue.setHours(24);

                                // 1PM -> 12PM (because below we do 12 + newHours)
                                } else if (dteValue.getHours() === 13 && newHours === 12) {
                                    dteValue.setHours(12);

                                // 12AM -> 11PM
                                } else if (dteValue.getHours() === 0 && newHours === 11) {
                                    dteValue.setHours(-1);

                                // 12AM -> 12AM
                                } else if (dteValue.getHours() === 0 && newHours === 12) {
                                    dteValue.setHours(0);

                                // 11PM -> 10PM
                                } else if (dteValue.getHours() === 23 && newHours < 11) {
                                    dteValue.setHours(12 + newHours);

                                // 12PM -> 1PM
                                } else if (dteValue.getHours() === 12 && newHours === 1) {
                                    dteValue.setHours(13);

                                // 1AM -> 12AM
                                } else if (dteValue.getHours() === 1 && newHours === 12) {
                                    dteValue.setHours(0);

                                // *PM -> *PM
                                } else if (dteValue.getHours() > 12) {
                                    dteValue.setHours(12 + newHours);

                                // *AM -> *AM
                                } else {
                                    dteValue.setHours(newHours);
                                }

                            } else if (target.classList.contains('minute-hand')) {
                                var newMinutes = thetaDeg / 6;
                                newMinutes = newMinutes === 60 ? 0 : newMinutes;
                                if (dteValue.getMinutes() === 59 && newMinutes === 0) {
                                    dteValue.setMinutes(60);

                                } else if (dteValue.getMinutes() === 0 && newMinutes === 59) {
                                    dteValue.setMinutes(-1);

                                } else {
                                    dteValue.setMinutes(newMinutes);
                                }

                            } else if (target.classList.contains('second-hand')) {
                                var newSeconds = thetaDeg / 6;
                                newSeconds = newSeconds === 60 ? 0 : newSeconds;
                                if (dteValue.getSeconds() === 59 && newSeconds === 0) {
                                    dteValue.setSeconds(60);

                                } else if (dteValue.getSeconds() === 0 && newSeconds === 59) {
                                    dteValue.setSeconds(-1);

                                } else {
                                    dteValue.setSeconds(newSeconds);
                                }

                            }

                            if (dteStart.getTime() !== dteValue.getTime()) {
                                dteStart = new Date(dteValue);

                                refreshTimeInputs();
                                refreshDateInputs();

                                resetClock(dteStart);
                                regenerateCalendar(dteStart);
                            }
                        };

                        var dragStopHandler = function (event) {
                            window.removeEventListener('mousemove', dragHandler);
                            window.removeEventListener('mouseup', dragStopHandler);
                        };

                        window.addEventListener('mousemove', dragHandler);
                        window.addEventListener('mouseup', dragStopHandler);
                    }
                });
            }
        }, function (event, strAnswer) {
            if (strAnswer === 'Done') {
                element.dteValue = dteValue;
                GS.triggerEvent(element, 'change');
            }
        });
    }


    /***************** DATETIME WHEEL *****************/

    function splitDate(element) {
        var i;
        var len;
        var arrFormat = element.getAttribute('format').split(/\b/);
        var arrDate = element.value ? element.value.split(/\b/) : formatDate(element, new Date(), getFormatString(element)).split(/\b/);
        if (arrFormat.indexOf('\'') > -1) {
            var arrTempDate = [];
            for (i = 0, len = arrDate.length; i < len; i += 1) {
                if (arrDate[i].indexOf('T') > 1) {
                    var temp = arrDate[i].split('T');
                    arrTempDate.push(temp[0], '\'', 'T', '\'', temp[1]);
                } else {
                    arrTempDate.push(arrDate[i]);
                }
            }
            arrDate = arrTempDate;
        }
        return arrDate;
    }

    function datetimeOpenWheelDialog(element) {
        var i;
        var len;
        var arrFormat = element.getAttribute('format').split(/\b/);
        var arrDate = splitDate(element);
        var dialogHTML;
        var label = element.hasAttribute('id') ? xtag.query(document, '[for="' + element.id + '"]')[0] : null;
        var labelHTML = label ? '<center><h3>' + label.innerHTML.replace(/:$/, '') + '</h3></center>' : '';
        var dialogTemplate = document.createElement('template');
        
        if (element.hasAttribute('spanish')) {
            var monthsFull   = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            var monthsShort  = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        } else {
            var monthsFull   = ['January','February','March','April','May','June', 'July','August','September','October','November','December'];
            var monthsShort  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        }

        var wheelHTML = function () {
            var strRet = '';
            //console.log(arrFormat, arrDate);
            for (i = 0, len = arrFormat.length; i < len; i += 1) {
                if (arrFormat[i] === '\'') {
                    i += 1;
                }

                if (arrFormat[i] === 'MMMM') {
                    arrFormat[i] = 'MM';
                    arrDate[i] = monthsFull.indexOf(arrDate[i]) + 1;

                } else if (arrFormat[i] === 'MMM') {
                    arrFormat[i] = 'MM';
                    arrDate[i] = monthsShort.indexOf(arrDate[i]) + 1;

                } else if (arrFormat[i] === 'a') {
                    arrFormat[i] = 'ampm';

                } else if (arrFormat[i] === 'EEE' || arrFormat[i] === 'EEEE') {
                    i += 1;
                    continue;
                }
                strRet += '<gs-wheel values="' + arrFormat[i] + '" value="' + arrDate[i] + '"></gs-wheel>';
                i += 1;

                if (arrFormat[i] === '\'') {
                    i += 1;
                }

                if (i < len) {
                    strRet += '<span class="divider"' + (evt.touchDevice ? ' touch' : '') + '><span>' + arrFormat[i] + '</span></span>';
                }
            }
            return strRet;
        };

        if (element.hasAttribute('spanish')) {
            dialogHTML = ml(function () {/*
                <gs-page id="wheel-dialog">
                    <gs-header>
                        {{LABELHTML}}
                        <gs-grid widths="1,1,1">
                            <gs-block>
                                <gs-button dialogclose>Cancelar</gs-button>
                            </gs-block>
                            <gs-block>
                                <gs-button class="now-button">Ahora</gs-button>
                            </gs-block>
                            <gs-block>
                                <gs-button dialogclose bg-primary>Hecho</gs-button>
                            </gs-block>
                        </gs-grid>
                    </gs-header>
                    <gs-body class="gs-datetime-wheel-dialog">
                        <div class="root">
                            {{WHEELS}}
                        </div>
                    </gs-body>
                </gs-page>
            */}).replace('{{LABELHTML}}', labelHTML).replace('{{WHEELS}}', wheelHTML());
        } else {
            dialogHTML = ml(function () {/*
                <gs-page id="wheel-dialog">
                    <gs-header>
                        {{LABELHTML}}
                        <gs-grid widths="1,1,1">
                            <gs-block>
                                <gs-button dialogclose>Cancel</gs-button>
                            </gs-block>
                            <gs-block>
                                <gs-button class="now-button">Now</gs-button>
                            </gs-block>
                            <gs-block>
                                <gs-button dialogclose bg-primary>Done</gs-button>
                            </gs-block>
                        </gs-grid>
                    </gs-header>
                    <gs-body class="gs-datetime-wheel-dialog">
                        <div class="root">
                            {{WHEELS}}
                        </div>
                    </gs-body>
                </gs-page>
            */}).replace('{{LABELHTML}}', labelHTML).replace('{{WHEELS}}', wheelHTML());
        }
        
        dialogTemplate.innerHTML = dialogHTML;
        dialogTemplate.setAttribute('data-mode', evt.touchDevice ? 'full' : 'detect');
        GS.openDialog(dialogTemplate, function () {
            // var dialog = xtag.query(document, 'gs-dialog')[0];
            var dialog = document.getElementById('wheel-dialog');

            xtag.query(dialog, '.now-button')[0].addEventListener('click', function () {
                element.dteValue = new Date();
                arrFormat = element.getAttribute('format').split(/\b/);
                arrDate = splitDate(element);
                xtag.query(dialog, '.gs-datetime-wheel-dialog > .root')[0].innerHTML = wheelHTML();
            });

            dialog.addEventListener('change', function (event) {
                //console.log('test');
                if (event.target.getAttribute('values') === 'MM' || event.target.getAttribute('values')[0] === 'y') {
                    var year = xtag.query(dialog, 'gs-wheel[values^="y"]')[0].value;
                    var month = xtag.query(dialog, 'gs-wheel[values="MM"]')[0].value;
                    var dayElement = xtag.query(dialog, 'gs-wheel[values^="d"]')[0];
                    // month is zero based, but we pass a one based number
                    // 0 is the last day of the previous month
                    var days = new Date(year, month, 0).getDate();

                    var valuesPart = dayElement.getAttribute('values').match(/d*/)[0];
                    dayElement.parentNode.insertBefore(GS.stringToElement('<gs-wheel values="' + valuesPart + ',' + days + '" value="' + Math.min(dayElement.value, days) + '"></gs-wheel>'), dayElement);
                    dayElement.parentNode.removeChild(dayElement);
                }
            });
            if (xtag.query(dialog, 'gs-wheel[values="MM"]')[0]) {
                GS.triggerEvent(xtag.query(dialog, 'gs-wheel[values="MM"]')[0], 'change');
            }

        }, function (event, strAnswer) {
            if (strAnswer === 'Done' || strAnswer === 'Hecho') {
                var dialog = xtag.query(document, 'gs-dialog')[0];
                //console.log(dialog);

                for (i = 0, len = arrFormat.length; i < len; i += 1) {
                    if (arrFormat[i] === '\'') {
                        i += 1;
                    }

                    if (arrFormat[i] === 'MMMM') {
                        arrFormat[i] = 'MM';
                        arrDate[i] = monthsFull.indexOf(arrDate[i]);

                    } else if (arrFormat[i] === 'MMM') {
                        arrFormat[i] = 'MM';
                        arrDate[i] = monthsShort.indexOf(arrDate[i]);

                    } else if (arrFormat[i] === 'a') {
                        arrFormat[i] = 'ampm';

                    } else if (arrFormat[i] === 'EEE' || arrFormat[i] === 'EEEE') {
                        i += 1;
                        continue;
                    }

                    if (arrFormat[i] === 'dd' || arrFormat[i] === 'd') {
                        arrDate[i] = xtag.query(document, 'gs-wheel[values^="' + arrFormat[i] + '"]')[0].value;
                    } else if (xtag.query(document, 'gs-wheel[values="' + arrFormat[i] + '"]')[0]) {
                        arrDate[i] = xtag.query(document, 'gs-wheel[values="' + arrFormat[i] + '"]')[0].value;
                    }
                    i += 1;

                    if (arrFormat[i] === '\'') {
                        i += 1;
                    }
                }
                //console.log((element.hasDate ? '' : '2017/01/01 ') + arrDate.join('').replace('\'T\'', 'T'));
                element.dteValue = new Date((element.hasDate ? '' : '2017/01/01 ') + arrDate.join('').replace('\'T\'', 'T'));
                GS.triggerEvent(element, 'change');
            }
        });
    }

    function getFormatString(element) {
        var strFormat;

        if (element.hasAttribute('format')) {
            strFormat = element.getAttribute('format');
        }

        if (!strFormat) {
            strFormat = 'MM/dd/yyyy';
        } else if (strFormat.toLowerCase() === 'shortdate') {
            strFormat = 'M/d/yy';
        } else if (strFormat.toLowerCase() === 'mediumdate') {
            strFormat = 'MMM d, yyyy';
        } else if (strFormat.toLowerCase() === 'longdate') {
            strFormat = 'MMMM d, yyyy';
        } else if (strFormat.toLowerCase() === 'fulldate') {
            strFormat = 'EEEE, MMMM d, yyyy';
        } else if (strFormat.toLowerCase() === 'shorttime') {
            strFormat = 'h:mm a';
        } else if (strFormat.toLowerCase() === 'mediumtime') {
            strFormat = 'h:mm:ss a';
        } else if (strFormat.toLowerCase() === 'isodate') {
            strFormat = 'yyyy-MM-dd';
        } else if (strFormat.toLowerCase() === 'isotime') {
            strFormat = 'HH:mm:ss';
        } else if (strFormat.toLowerCase() === 'isodatetime') {
            strFormat = 'yyyy-MM-dd\'T\'HH:mm:ss';
        }

        return strFormat;
    }

    function formatDate(element, dteValue, strFormat) {
        /* (this function contains a (modified) substantial portion of code from another source
            here is the copyright for sake of legality) (Uses code by Matt Kruse)
        Copyright (c) 2006-2009 Rostislav Hristov, Asual DZZD

        Permission is hereby granted, free of charge, to any person obtaining a
        copy of this software and associated documentation files
        (the "Software"), to deal in the Software without restriction,
        including without limitation the rights to use, copy, modify, merge,
        publish, distribute, sublicense, and/or sell copies of the Software,
        and to permit persons to whom the Software is furnished to do so,
        subject to the following conditions:

        The above copyright notice and this permission notice shall be included
        in all copies or substantial portions of the Software.

        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
        IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
        CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
        TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
        SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
        var i = 0, j = 0, l = 0, c = '', token = '', x, y, yearLen,
            formatNumber = function (n, s) {
                if (typeof s == 'undefined' || s == 2) {
                  return (n >= 0 && n < 10 ? '0' : '') + n;
                } else {
                    if (n >= 0 && n < 10) {
                       return '00' + n;
                    }
                    if (n >= 10 && n <100) {
                       return '0' + n;
                    }
                    return n;
                }
            };
            
            if (element.hasAttribute('spanish')) {
                var locale = {
                        monthsFull:   ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                        monthsShort:  ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
                        daysFull:     ['Domingo', 'Lune', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                        daysShort:    ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
                        shortDateFormat: 'M/d/yyyy h:mm a',
                        longDateFormat: 'EEEE, MMMM dd, yyyy h:mm:ss a'
                    };
                    
            } else {
                var locale = {
                    monthsFull:   ['January','February','March','April','May','June', 'July','August','September','October','November','December'],
                    monthsShort:  ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
                    daysFull:     ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
                    daysShort:    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
                    shortDateFormat: 'M/d/yyyy h:mm a',
                    longDateFormat: 'EEEE, MMMM dd, yyyy h:mm:ss a'
                };
            }

        y = dteValue.getFullYear();
        // Nunzio commented this out on Monday, October 19, 2015
        // It was causing an issue during typing in the year field
        /*if (y < 1000) {
            y = String(y + 1900);
        }*/

        var M = dteValue.getMonth() + 1,
            d = dteValue.getDate(),
            E = dteValue.getDay(),
            H = dteValue.getHours(),
            m = dteValue.getMinutes(),
            s = dteValue.getSeconds(),
            S = dteValue.getMilliseconds();

        yearLen = String(y).length;
        dteValue = {
            y: y,
            yyyy: y,
            yy: String(y).substring(yearLen - 2, yearLen),
            M: M,
            MM: formatNumber(M),
            MMM: locale.monthsShort[M-1],
            MMMM: locale.monthsFull[M-1],
            d: d,
            dd: formatNumber(d),
            EEE: locale.daysShort[E],
            EEEE: locale.daysFull[E],
            H: H,
            HH: formatNumber(H)
        };

        //console.log(dteValue);

        if (H === 0) {
            dteValue.h = 12;
        } else if (H > 12) {
            dteValue.h = H - 12;
        } else {
            dteValue.h = H;
        }

        dteValue.hh = formatNumber(dteValue.h);
        dteValue.k = H !== 0 ? H : 24;
        dteValue.kk = formatNumber(dteValue.k);

        if (H > 11) {
            dteValue.K = H - 12;
        } else {
            dteValue.K = H;
        }

        dteValue.KK = formatNumber(dteValue.K);

        if (H > 11) {
            dteValue.a = 'PM';
        } else {
            dteValue.a = 'AM';
        }

        dteValue.m = m;
        dteValue.mm = formatNumber(m);
        dteValue.s = s;
        dteValue.ss = formatNumber(s);
        dteValue.S = S;
        dteValue.SS = formatNumber(S);
        dteValue.SSS = formatNumber(S, 3);

        var result = '';

        i = 0;
        c = '';
        token = '';
        s = false;
        while (i < strFormat.length) {
            token = '';
            c = strFormat.charAt(i);
            if (c == '\'') {
                i++;
                if (strFormat.charAt(i) == c) {
                    result = result + c;
                    i++;
                } else {
                    s = !s;
                }
            } else {
                while (strFormat.charAt(i) == c) {
                    token += strFormat.charAt(i++);
                }
                if (token.indexOf('MMMM') != -1 && token.length > 4) {
                    token = 'MMMM';
                }
                if (token.indexOf('EEEE') != -1 && token.length > 4) {
                    token = 'EEEE';
                }
                if (typeof dteValue[token] != 'undefined' && !s) {
                    result = result + dteValue[token];
                } else {
                    result = result + token;
                }
            }
        }

        return result;
    }

    // dont do anything that modifies the element here
    function datetimeElementCreated(element) {
        // if "created" hasn't been suspended: run created code
        if (!element.hasAttribute('suspend-created')) {

        }
    }

    // re-target focus event from control to element
    function focusFunction(event) {
        event.target.classList.add('focus');
    }

    // re-target blur event from control to element
    function blurFunction(event) {
        event.target.classList.remove('focus');
    }

    // mouseout, remove hover class
    function mouseoutFunction(event) {
        event.target.classList.remove('hover');
    }

    // mouseover, add hover class
    function mouseoverFunction(event) {
        event.target.classList.add('hover');
    }

    function datetimeElementInserted(element) {
        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;
                element.internal = {};
                saveDefaultAttributes(element);

                if (!element.hasAttribute('tabindex')) {
                    element.setAttribute('tabindex', '0');
                }

                element.setAttribute('format', getFormatString(element));
                /*if (element.hasAttribute('format')) {
                    var d1 = new Date(), d2 = new Date(formatDate(element, d1, element.getAttribute('format')));
                    if (d1.getTime() !== d2.getTime()) {
                        element.timezoneOffset = d2.getTime() - d1.getTime();
                    }
                }*/
                
                //console.log(element.getAttribute('value'));
                // if (element.getAttribute('value') === 'now' || element.getAttribute('value') === 'today') {
                //     element.setAttribute('value', formatDate(element, new Date(), element.getAttribute('format')));
                // }
                //console.log(element.getAttribute('value'));


                element.hasDate = /\b(y|yyyy|yy|M|MM|MMM|MMMM|d|dd|EEE|EEEE)\b/g.test(element.getAttribute('format'));
                element.hasTime = /\b(k|kk|hh|h|H|HH|m|mm|s|ss|S|SS|SSS)\b/g.test(element.getAttribute('format'));

                if (element.getAttribute('value') === 'today' || element.getAttribute('value') === 'now') {
                    element.dteValue = new Date();
                } else if (element.getAttribute('value')) {
                    if (/^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]($|\ )/.test(element.getAttribute('value'))) {
                        //console.log(element.getAttribute('value').replace('-', '/').replace('-', '/'));
                        element.setAttribute('value', element.getAttribute('value').replace('-', '/').replace('-', '/'));
                    }

                    if (/\.([0-9]*)$/.test(element.getAttribute('value'))) {
                        element.setAttribute('value', element.getAttribute('value').replace(/\.([0-9]*)$/, ''));
                        //alert(element.dteValue);
                    }

                    if (element.getAttribute('value').indexOf(' ') > -1) {
                        element.setAttribute('value', element.getAttribute('value').replace(/-[0-9][0-9]$/, ''));
                        element.dteValue = new Date(element.getAttribute('value'));
                    } else if (element.getAttribute('value').indexOf(':') > -1) {
                        element.dteValue = new Date('1/1/1970 ' + element.getAttribute('value'));
                    } else {
                        element.dteValue = new Date(element.getAttribute('value') + ' 00:00:00');
                    }
                    if (isNaN(element.dteValue.getTime())) {
                        element.dteValue = new Date((element.hasDate ? '' : '1/1/1970 ') + element.getAttribute('value') + (element.hasTime ? '' : ' 00:00:00'));
                    }
                    //alert(element.dteValue);
                } else if (!element.getAttribute('value')) {
                    element.innerHTML = '<span gs-dynamic class="placeholder">' + (element.getAttribute('placeholder') || '') + '</span>';
                }

                // handle "qs" attribute
                if (element.getAttribute('qs')) {
                    pushReplacePopHandler(element);
                    window.addEventListener('pushstate',    function () { pushReplacePopHandler(element); });
                    window.addEventListener('replacestate', function () { pushReplacePopHandler(element); });
                    window.addEventListener('popstate',     function () { pushReplacePopHandler(element); });
                }

                var label = element.hasAttribute('id') ? xtag.query(document, '[for="' + element.id + '"]')[0] : null;
                if (label) {
                    label.addEventListener('click', function () {
                        GS.triggerEvent(element, 'click');
                    });
                }

                element.addEventListener('click', function () {
                    if (!element.hasAttribute('disabled') && !element.hasAttribute('readonly')) {
                        if (!evt.touchDevice && element.hasAttribute('desktop-calendar')) {
                            datetimeOpenCalendarDialog(element);
                        } else {
                            datetimeOpenWheelDialog(element);
                        }
                    }
                });

                element.addEventListener('keyup', function (event) {
                    var code = event.which || event.keyCode || event.charCode;

                    if (code !== 9) { // tab
                        event.preventDefault();
                        GS.triggerEvent(element, 'click');
                    }
                });

                element.addEventListener('focus', focusFunction);
                element.addEventListener('blur', blurFunction);
                element.addEventListener(evt.mouseout, mouseoutFunction);
                element.addEventListener(evt.mouseover, mouseoverFunction);
            }
        }
    }

    xtag.register('gs-datetime', {
        lifecycle: {
            created: function () {
                datetimeElementCreated(this);
            },

            inserted: function () {
                datetimeElementInserted(this);
            },

            attributeChanged: function (strAttrName, oldValue, newValue) {
                // if "suspend-created" has been removed: run created and inserted code
                if (strAttrName === 'suspend-created' && newValue === null) {
                    datetimeElementCreated(this);
                    datetimeElementInserted(this);

                // if "suspend-inserted" has been removed: run inserted code
                } else if (strAttrName === 'suspend-inserted' && newValue === null) {
                    datetimeElementInserted(this);

                } else if (!this.hasAttribute('suspend-created') && !this.hasAttribute('suspend-inserted')) {

                }
            }
        },
        events: {},
        accessors: {
            value: {
                get: function () {
                    return this.hasAttribute('value') && this.getAttribute('value') ? formatDate(this, new Date(this.getAttribute('value')), this.getAttribute('format')) : '';
                },
                set: function (newValue) {
                    if (newValue != null) {
                        var newerValue = GS.newDate(newValue);
                        this.setAttribute('value', newerValue);
                        this.innerText = formatDate(this, new Date(this.getAttribute('value')), this.getAttribute('format'));
                    } else {
                        this.setAttribute('value', newValue || '');
                        this.innerText = '';
                    }
                }
            },
            dteValue: {
                get: function () {
                    var value = this.value;
                    var dteValue = value ? new Date((this.hasDate ? '' : '1/1/1970 ') + value + (this.hasTime ? '' : ' 00:00:00')) : null;

                    return dteValue;
                },
                set: function (newValue) {
                    var newerValue = GS.newDate(newValue);
                    // if (this.hasAttribute('format')) {
                        this.value = newerValue;
                    // } else {
                    //     this.value = formatDate(element, newerValue, (this.hasDate ? 'yyyy/MM/dd' : '') + ' ' + (this.hasTime ? 'HH:mm:ss' : '').trim());
                    // }
                }
            }
        },
        methods: {}
    });

    /******************* WHEEL ******************/

    function addNumberToStart(element) {
        var wheel = element.wheel;
        var arrValues;

        wheel.removeChild(wheel.lastChild);

        var newRotation = parseFloat(wheel.firstChild.getAttribute('rotation'));
        var newNumber = parseInt(wheel.firstChild.getAttribute('data-number'), 10) - 1;

        newRotation += element.rotationInterval;
        if (newRotation > 0) {
            newRotation -= 360;
        }
        if (newNumber < element.min) {
            newNumber += (element.max - element.min) + 1;
        }

        if (element.getAttribute('type') === 'eighths') {
            arrValues = [
                '<sup>0</sup>/<sub>8</sub>',
                '<sup>1</sup>/<sub>8</sub>',
                '<sup>1</sup>/<sub>4</sub>',
                '<sup>3</sup>/<sub>8</sub>',
                '<sup>1</sup>/<sub>2</sub>',
                '<sup>5</sup>/<sub>8</sub>',
                '<sup>3</sup>/<sub>4</sub>',
                '<sup>7</sup>/<sub>8</sub>'
            ];
            wheel.insertBefore(GS.stringToElement('<span class="value" data-number="' + newNumber + '" rotation="' + newRotation + '" style="transform: rotateX(' + newRotation + 'deg) translateZ(' + element.radius + ');">' + arrValues[newNumber] + '</span>'), wheel.firstChild);

        } else if (element.arrvalue) {
            var j = parseInt(wheel.children[0].getAttribute('data-number'), 10) - 1;
            if (j === -1) {
                j = element.arrvalue.length - 1;
            }
            var i = j;
            arrValues = element.arrvalue;
            i = Math.abs(i) % arrValues.length;
            var arrTitles = element.arrtitle;
            wheel.insertBefore(GS.stringToElement('<span class="value" value="' + arrValues[Math.abs(i)] + '" data-number="' + j + '" rotation="' + newRotation + '" style="transform: rotateX(' + newRotation + 'deg) translateZ(' + element.radius + ');">' + arrTitles[Math.abs(i)] + '</span>'), wheel.firstChild);
        } else {
            wheel.insertBefore(GS.stringToElement('<span class="value" data-number="' + newNumber + '" rotation="' + newRotation + '" style="transform: rotateX(' + newRotation + 'deg) translateZ(' + element.radius + ');">' + GS.leftPad(newNumber, '0', 2) + '</span>'), wheel.firstChild);
        }
    }

    function addNumberToEnd(element) {
        var wheel = element.wheel;
        var arrValues;

        wheel.removeChild(wheel.firstChild);

        var newRotation = parseFloat(wheel.lastChild.getAttribute('rotation'))
          , newNumber = parseInt(wheel.lastChild.getAttribute('data-number'), 10) + 1;

        newRotation -= element.rotationInterval;
        if (newRotation <= -360) {
            newRotation += 360;
        }
        if (newNumber > element.max) {
            newNumber -= (element.max - element.min) + 1;
        }

        if (element.getAttribute('type') === 'eighths') {
            arrValues = [
                '<sup>0</sup>/<sub>8</sub>',
                '<sup>1</sup>/<sub>8</sub>',
                '<sup>1</sup>/<sub>4</sub>',
                '<sup>3</sup>/<sub>8</sub>',
                '<sup>1</sup>/<sub>2</sub>',
                '<sup>5</sup>/<sub>8</sub>',
                '<sup>3</sup>/<sub>4</sub>',
                '<sup>7</sup>/<sub>8</sub>'
            ];
            wheel.appendChild(GS.stringToElement('<span class="value" data-number="' + newNumber + '" rotation="' + newRotation + '" style="transform: rotateX(' + newRotation + 'deg) translateZ(' + element.radius + ');">' + arrValues[newNumber] + '</span>'));

        } else if (element.arrvalue) {
            var i = parseInt(wheel.children[wheel.children.length - 1].getAttribute('data-number'), 10) + 1;
            arrValues = element.arrvalue;
            i = Math.abs(i) % arrValues.length;
            var arrTitles = element.arrtitle;
            wheel.appendChild(GS.stringToElement('<span class="value" value="' + arrValues[Math.abs(i)] + '" data-number="' + i + '" rotation="' + newRotation + '" style="transform: rotateX(' + newRotation + 'deg) translateZ(' + element.radius + ');">' + arrTitles[Math.abs(i)] + '</span>'));
        } else {
            wheel.appendChild(GS.stringToElement('<span class="value" data-number="' + newNumber + '" rotation="' + newRotation + '" style="transform: rotateX(' + newRotation + 'deg) translateZ(' + element.radius + ');">' + GS.leftPad(newNumber, '0', 2) + '</span>'), wheel.firstChild);
        }
    }

    function wheelDragStartHandler(event, immediateKinetic) {
        var pageY = 0;
        if (event.touches && event.touches.length !== 1) {
            return;
        } else if (event.touches) {
            pageY = event.touches[0].pageY;
        } else if (event.pageY) {
            pageY = event.pageY;
        }
        var element = this;
        var fontSize = GS.emToPx(element, 1) / GS.emToPx(document.body, 1);
        var wheel = element.wheel;
        element.dragStart = pageY;
        element.rotationStart = element.rotation;
        element.numbersRotated = 1;
        if (element.kineticTimer) {
            clearTimeout(element.kineticTimer);
            element.kineticTimer = null;
        }
        //console.log(element.dragStart, pageY, element.velocity, element.rotation, event);
        //console.log('wheelDragStartHandler', element);

        var dragHandler = function (event) {
            var pageY = 0;
            if (event.touches && event.touches.length !== 1) {
                return;
            } else if (event.touches) {
                pageY = event.touches[0].pageY;
            } else if (event.pageY) {
                pageY = event.pageY;
            }
            //console.log('dragHandler', element);
            element.velocity = element.dragStart - pageY;
            //console.log(element.dragStart, pageY, element.velocity, element.rotation, event);

            element.rotation += element.velocity / fontSize;
            wheel.setAttribute('style', 'transform: translateZ(-' + element.radius + ') rotateX(' + element.rotation + 'deg);');

            if (!element.ampm) {
                while ((element.rotation - element.rotationStart) < ((element.numbersRotated - 1) * element.rotationInterval)) {
                    element.numbersRotated -= 1;

                    addNumberToStart(element);
                }

                while ((element.rotation - element.rotationStart) > (element.numbersRotated * element.rotationInterval)) {
                    element.numbersRotated += 1;

                    addNumberToEnd(element);
                }
            }

            element.dragStart = pageY;
        };

        var dragStopHandler = function (event) {
            if (element.ampm) {
                while (element.rotation > 180) {
                    element.rotation -= 360;
                }
                while (element.rotation < -180) {
                    element.rotation += 360;
                }

                if (element.rotation < 11.25) {
                    element.rotation = 0;
                } else if (element.rotation >= 11.25) {
                    element.rotation = 22.5;
                }

                wheel.setAttribute('style', 'transform: translateZ(-' + element.radius + ') rotateX(' + element.rotation + 'deg);');

                var valueElement = xtag.query(wheel, '[rotation="' + (element.rotation * -1) + '"]')[0];
                if (element.getAttribute('values') && element.getAttribute('values').toLowerCase() === 'ampm') {
                    element.setAttribute('value', valueElement.innerText);
                } else {
                    element.setAttribute('value', (valueElement.getAttribute('value') || valueElement.getAttribute('data-number')));
                }
                
                GS.triggerEvent(element, 'change');

            } else {
                if (Math.abs(element.velocity) > 5) {
                    var drag = 0.01;
                    var interval = 10;
                    element.kineticTimer = setTimeout(function kinetic() {
                        dragHandler({
                            pageY: element.dragStart - (element.velocity * (1 - drag))
                        });
                        drag *= 1.05;
                        if (drag < 1) {
                            element.kineticTimer = setTimeout(kinetic, interval);
                        } else {
                            element.kineticTimer = null;
                            element.velocity = 0;
                            dragStopHandler();
                        }
                    }, interval);

                } else {
                    var oldRotation = element.rotation;
                    element.rotation = Math.round(element.rotation / element.rotationInterval) * element.rotationInterval;

                    while (element.rotation >= 360) {
                        element.rotation -= 360;
                    }
                    while (element.rotation < 0) {
                        element.rotation += 360;
                    }

                    var valueElement = xtag.query(wheel, '[rotation="' + (element.rotation * -1) + '"]')[0];
                    if (element.getAttribute('values') && element.getAttribute('values').toLowerCase() === 'ampm') {
                        element.setAttribute('value', valueElement.innerText);
                    } else {
                        element.setAttribute('value', valueElement.getAttribute('data-number'));
                    }

                    element.rotation = -180;
                    wheel.setAttribute('style', 'transform: translateZ(-' + element.radius + ') rotateX(' + element.rotation + 'deg);');
                    wheelGenerateHTML(element);
                    GS.triggerEvent(element, 'change');
                }
            }

            window.removeEventListener(evt.mousemove, dragHandler);
            window.removeEventListener(evt.mouseup, dragStopHandler);
            window.removeEventListener(evt.mouseout, dragStopHandler);
        };

        if (arguments.length === 2) {
            element.velocity = 6;
            dragStopHandler(event);
        } else {
            window.addEventListener(evt.mousemove, dragHandler);
            window.addEventListener(evt.mouseup, dragStopHandler);
            window.addEventListener(evt.mouseout, dragStopHandler);
        }
    }

    function arrowClickHandler(event) {
        var element = GS.findParentTag(event.target, 'gs-wheel');
        var wheel = element.wheel;
        if (event.target.classList.contains('arrow-up')) {
            element.rotation -= element.rotationInterval;

            if (element.ampm) {
                if (element.rotation < 11.25) {
                    element.rotation = 0;
                } else if (element.rotation >= 11.25) {
                    element.rotation = 22.5;
                }
            } else {
                while (element.rotation >= 360) {
                    element.rotation -= 360;
                }
                while (element.rotation < 0) {
                    element.rotation += 360;
                }
            }

            //console.log(wheel, element.rotation);
            var valueElement = xtag.query(wheel, '[rotation="' + (element.rotation * -1) + '"]')[0];
            if (element.getAttribute('values') && element.getAttribute('values').toLowerCase() === 'ampm') {
                element.setAttribute('value', valueElement.innerText);
            } else {
                element.setAttribute('value', (valueElement.getAttribute('value') || valueElement.getAttribute('data-number')));
            }

            wheel.setAttribute('style', 'transform: translateZ(-' + element.radius + ') rotateX(' + element.rotation + 'deg);');
            if (!element.ampm) {
                addNumberToStart(element);
            }
            GS.triggerEvent(element, 'change');

        } else if (event.target.classList.contains('arrow-down')) {
            element.rotation += element.rotationInterval;

            if (element.ampm) {
                if (element.rotation < 11.25) {
                    element.rotation = 0;
                } else if (element.rotation >= 11.25) {
                    element.rotation = 22.5;
                }
            } else {
                while (element.rotation >= 360) {
                    element.rotation -= 360;
                }
                while (element.rotation < 0) {
                    element.rotation += 360;
                }
            }

            //console.log(wheel, element.rotation);
            var valueElement = xtag.query(wheel, '[rotation="' + (element.rotation * -1) + '"]')[0];
            if (element.getAttribute('values') && element.getAttribute('values').toLowerCase() === 'ampm') {
                element.setAttribute('value', valueElement.innerText);
            } else {
                element.setAttribute('value', (valueElement.getAttribute('value') || valueElement.getAttribute('data-number')));
            }

            wheel.setAttribute('style', 'transform: translateZ(-' + element.radius + ') rotateX(' + element.rotation + 'deg);');
            if (!element.ampm) {
                addNumberToEnd(element);
            }
            GS.triggerEvent(element, 'change');
        }
    }

    function wheelScrollHandler(event) {
        var element = GS.findParentTag(event.target, 'gs-wheel');
        var wheel = element.wheel;
        event.preventDefault();
        if (event.deltaY > 0) {
            element.rotation -= element.rotationInterval;

            if (element.ampm) {
                if (element.rotation < 11.25) {
                    element.rotation = 0;
                } else if (element.rotation >= 11.25) {
                    element.rotation = 22.5;
                }
            } else {
                while (element.rotation >= 360) {
                    element.rotation -= 360;
                }
                while (element.rotation < 0) {
                    element.rotation += 360;
                }
            }

            var valueElement = xtag.query(wheel, '[rotation="' + (element.rotation * -1) + '"]')[0];
            // if (element.getAttribute('values') && element.getAttribute('values').toLowerCase() === 'ampm') {
            //     element.setAttribute('value', (valueElement.getAttribute('data-number') || valueElement.innerText));
            // } else {
                element.setAttribute('value', (valueElement.getAttribute('value') || valueElement.innerText));
                //element.setAttribute('value', (valueElement.getAttribute('value') || valueElement.getAttribute('data-number')));
            // }

            wheel.setAttribute('style', 'transform: translateZ(-' + element.radius + ') rotateX(' + element.rotation + 'deg);');
            if (!element.ampm) {
                addNumberToStart(element);
            }

        } else if (event.deltaY < 0) {
            element.rotation += element.rotationInterval;

            if (element.ampm) {
                if (element.rotation < 11.25) {
                    element.rotation = 0;
                } else if (element.rotation >= 11.25) {
                    element.rotation = 22.5;
                }
            } else {
                while (element.rotation >= 360) {
                    element.rotation -= 360;
                }
                while (element.rotation < 0) {
                    element.rotation += 360;
                }
            }

            var valueElement = xtag.query(wheel, '[rotation="' + (element.rotation * -1) + '"]')[0];
            // if (element.getAttribute('values') && element.getAttribute('values').toLowerCase() === 'ampm') {
            //     element.setAttribute('value', valueElement.innerText);
            // } else {
                element.setAttribute('value', (valueElement.getAttribute('value') || valueElement.innerText));
                //element.setAttribute('value', (valueElement.getAttribute('value') || valueElement.getAttribute('data-number')));
            // }

            wheel.setAttribute('style', 'transform: translateZ(-' + element.radius + ') rotateX(' + element.rotation + 'deg);');
            if (!element.ampm) {
                addNumberToEnd(element);
            }
        }
    }

    function wheelGenerateHTML(element) {
        var bolEighths = (element.getAttribute('type') === 'eighths');
        var arrValues;

        element.rotation = -180;
        element.wheel.setAttribute('style', 'transform: translateZ(-' + element.radius + ') rotateX(' + element.rotation + 'deg);');
        element.wheel.innerHTML = '';
        for (var rotation = 0, j = parseInt(element.value - ((element.arrvalue) ? 1 : 0), 10) - 8; rotation > -360; rotation -= element.rotationInterval, j += 1) {
            if (element.ampm) {
                element.rotation = (element.value === 'AM' ? 0 : 22.5);
                element.wheel.setAttribute('style', 'transform: translateZ(-' + element.radius + ') rotateX(' + (element.value === 'AM' ? '0' : '22.5') + 'deg);');
                element.wheel.appendChild(
                    GS.stringToElement(
                        '<span class="value" data-number="' + (rotation === 0 ? 'AM' : 'PM') + '" ' +
                            'rotation="' + rotation + '" ' +
                            'style="transform: rotateX(' + rotation + 'deg) translateZ(' + element.radius + ');">' +
                                (rotation === 0 ? 'AM' : 'PM') +
                        '</span>'
                    )
                );
                if (rotation == -22.5) {
                    break;
                }

            } else if (element.arrvalue) {
                arrValues = element.arrvalue;
                if (j < 0) {
                    if (j >= 0) {
                        j = element.arrvalue.length - j;
                    } else {
                        j = (element.arrvalue.length + 1) + j;
                    }
                    var i = j;
                } else {
                    var i = j;
                }
                //console.log(i, j);
                j = ((j < 0) ? (Math.abs(i) % arrValues.length) - ((Math.abs(i) % arrValues.length) * 2) : (Math.abs(i) % arrValues.length));
                if (j == -1) {
                    j = arrValues.length - 1;
                }
                i = Math.abs(j) % arrValues.length;
                //console.log(i, j);
                if (rotation == -180) {
                    element.setAttribute('value', arrValues[Math.abs(i)]);
                    if (xtag.query(element, '.container')[0].style.width < element.longestWidth + 'px') {
                        xtag.query(element, '.container')[0].style.width = element.longestWidth + 'px';
                    }
                }
                var arrTitles = element.arrtitle;
                element.wheel.appendChild(
                    GS.stringToElement(
                        '<span class="value" value="' + arrValues[Math.abs(i)] + '" data-number="' + Math.abs(j) + '" ' +
                            'rotation="' + rotation + '" ' +
                            'style="transform: rotateX(' + rotation + 'deg) translateZ(' + element.radius + ');">' +
                                arrTitles[Math.abs(i)] +
                        '</span>'
                    )
                );
            } else if (bolEighths) {
                arrValues = [
                    '<sup>0</sup>/<sub>8</sub>',
                    '<sup>1</sup>/<sub>8</sub>',
                    '<sup>1</sup>/<sub>4</sub>',
                    '<sup>3</sup>/<sub>8</sub>',
                    '<sup>1</sup>/<sub>2</sub>',
                    '<sup>5</sup>/<sub>8</sub>',
                    '<sup>3</sup>/<sub>4</sub>',
                    '<sup>7</sup>/<sub>8</sub>'
                ];
                if (j < element.min) {
                    if (j >= 0) {
                        j = element.max - j;
                    } else {
                        j = (element.max + (element.min === 0 ? 1 : 0)) + j;
                    }
                }
                element.wheel.appendChild(
                    GS.stringToElement(
                        '<span class="value" data-number="' + j + '" ' +
                            'rotation="' + rotation + '" ' +
                            'style="transform: rotateX(' + rotation + 'deg) translateZ(' + element.radius + ');">' +
                                arrValues[j] +
                        '</span>'
                    )
                );
                if (j === element.max) {
                    j = element.min - 1;
                }

            } else {
                if (j < element.min) {
                    if (j >= 0) {
                        j = element.max - j;
                    } else {
                        j = (element.max + (element.min === 0 ? 1 : 0)) + j;
                    }
                }
                element.wheel.appendChild(
                    GS.stringToElement(
                        '<span class="value" data-number="' + j + '" ' +
                            'rotation="' + rotation + '" ' +
                            'style="transform: rotateX(' + rotation + 'deg) translateZ(' + element.radius + ');">' +
                                GS.leftPad(j, '0', 2) +
                        '</span>'
                    )
                );
                if (j === element.max) {
                    j = element.min - 1;
                }
            }
        }
    }

    // dont do anything that modifies the element here
    function wheelElementCreated(element) {
        // if "created" hasn't been suspended: run created code
        if (!element.hasAttribute('suspend-created')) {

        }
    }

    //
    function wheelElementInserted(element) {
        var styleElement, i, len, wheelNames, wheelHTML;

        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;

                if (evt.touchDevice) {
                    element.setAttribute('touch', '');

                    var maybePreventPullToRefresh = false;
                    var lastTouchY = 0;
                    var touchstartHandler = function (e) {
                        if (e.touches.length != 1) {
                            return;
                        }
                        lastTouchY = e.touches[0].clientY;
                        // Pull-to-refresh will only trigger if the scroll begins when the
                        // document's Y offset is zero.
                        maybePreventPullToRefresh = window.pageYOffset == 0;
                    };

                    var touchmoveHandler = function(e) {
                        var touchY = e.touches[0].clientY;
                        var touchYDelta = touchY - lastTouchY;
                        lastTouchY = touchY;

                        if (maybePreventPullToRefresh) {
                            // To suppress pull-to-refresh it is sufficient to preventDefault the
                            // first overscrolling touchmove.
                            maybePreventPullToRefresh = false;
                            if (touchYDelta > 0) {
                                e.preventDefault();
                                return;
                            }
                        }

                        e.preventDefault();
                        return;

                        if (window.pageYOffset == 0 && touchYDelta > 0) {
                            e.preventDefault();
                            return;
                        }
                    };

                    element.addEventListener('touchstart', touchstartHandler, { passive: false });
                    element.addEventListener('touchmove', touchmoveHandler, { passive: false });
                }

                element.radius = '4em'; //(element.clientHeight / 2) + 'px';
                if (element.hasAttribute('min') && element.hasAttribute('max')) {
                    element.setAttribute('values', element.getAttribute('min') + '-' + element.getAttribute('max'));
                }
                element.values = element.getAttribute('values');
                if (evt.touchDevice) {
                    element.innerHTML = ml(function () {/*
                        <div class="root">
                            <div class="transparent top"></div>
                            <div class="container">
                                <div class="wheel" style="transform: translateZ(-{{RADIUS}}) rotateX(-180deg);"></div>
                            </div>
                            <div class="transparent bottom"></div>
                        </div>
                    */}).replace('{{RADIUS}}', element.radius);
                } else {
                    element.innerHTML = ml(function () {/*
                        <div class="root">
                            <div class="arrow-up">&#xf077;</div>
                            <div class="transparent top"></div>
                            <div class="container">
                                <div class="wheel" style="transform: translateZ(-{{RADIUS}}) rotateX(-180deg);"></div>
                            </div>
                            <div class="transparent bottom"></div>
                            <div class="arrow-down">&#xf078;</div>
                        </div>
                    */}).replace('{{RADIUS}}', element.radius);
                }
                element.wheel = xtag.query(element, '.wheel')[0];
                element.arrowUp = xtag.query(element, '.arrow-up')[0];
                element.arrowDown = xtag.query(element, '.arrow-down')[0];
                element.rotation = -180;
                if (evt.touchDevice) {
                    element.addEventListener(evt.mousedown, wheelDragStartHandler);
                } else {
                    element.arrowUp.addEventListener('click', arrowClickHandler);
                    element.arrowDown.addEventListener('click', arrowClickHandler);

                    element.addEventListener('wheel', wheelScrollHandler);
                }
                element.rotationInterval = 360 / 16;
                //y|yyyy|yy|M|MM|d|dd|EEE|EEEE
                //k|kk|hh|h|H|HH|m|mm|s|ss|S|SS|SSS
                //console.log(element.values, element.values.substring(0, 2) === 'dd', element.values.substring(0, 1) === 'd');
                
                if (!element.values && element.hasAttribute('min') && element.hasAttribute('max')) {
                    element.values = (element.getAttribute('min') + '-' + element.getAttribute('max'));
                    element.min = parseInt(element.getAttribute('min'), 10);
                    element.max = parseInt(element.getAttribute('max'), 10);
                } else if (element.values === 'M' || element.values === 'MM' || element.values === 'H' || element.values === 'HH') {
                    element.min = 1;
                    element.max = 12;
                } else if (element.values === 'h' || element.values === 'hh') {
                    element.min = 0;
                    element.max = 23;
                } else if (element.values === 'k' || element.values === 'kk') {
                    element.min = 0;
                    element.max = 23;
                } else if (element.values === 'm' || element.values === 'mm' || element.values === 'ss') {
                    element.min = 0;
                    element.max = 59;
                } else if (element.values && element.values[0] === 'd') {
                    element.min = 1;
                    element.max = element.values.length > 2 ? parseInt(element.values.substring(element.values.length - 2, element.values.length), 10) : 31;
                } else if (element.values === 'y') {
                    element.min = 0;
                    element.max = 99;
                } else if (element.values === 'yyyy') {
                    var d = new Date();
                    element.min = d.getFullYear() - 50;
                    element.max = d.getFullYear() + 50;

                } else if (element.values === 'ampm') {
                    element.ampm = true;
                    element.rotation = element.value === 'AM' ? 0 : 22.5;
                    element.wheel.setAttribute('style', 'transform: translateZ(-' + element.radius + ') rotateX(' + element.rotation + 'deg);');
                } else if (element.arrvalue) {
                    
                } else {
                    // var arrValue = element.values.split('-');
                    // element.min = parseInt(arrValue[0], 10);
                    // element.max = parseInt(arrValue[1], 10);
                    var arrValue = element.values.split('-');
                    var i = parseInt(arrValue[0], 10);
                    //console.log(arrValue);
                    element.arrvalue = [];
                    element.arrtitle = [];
                    var len = parseInt(arrValue[1], 10) + 1;
                    while (i < len) {
                        element.arrvalue.push(i);
                        element.arrtitle.push(i);
                        i++;
                    }
                    element.removeAttribute('values');
                }

                wheelGenerateHTML(element);
            }
        }
    }
    
    
    function longestOfArray(a) {
        var c = 0,
            d = 0,
            l = 0,
            i = a.length;
        if (i) while (i--) {
            d = a[i].length;
            if (d > c) {
                l = i;
                c = d;
            }
        }
        return a[l];
    }

    xtag.register('gs-wheel', {
        lifecycle: {
            created: function () {
                wheelElementCreated(this);
            },

            inserted: function () {
                if (this.innerHTML.indexOf('option') !== -1) {
                    var arrValues = [], arrTitles = [];
                    for (var i = 0, len = this.children.length; i < len; i++) {
                        arrValues[i] = (this.children[i].getAttribute('value') || this.children[i].textContent);
                        arrTitles[i] = this.children[i].textContent;
                    }
                    this.arrvalue = arrValues;
                    this.arrtitle = arrTitles;
                    this.longest = longestOfArray(arrTitles);
                    this.innerHTML = '<div style="position: absolute; visibility: hidden; height: auto; width: auto; white-space: nowrap;">&nbsp;' + this.longest + '&nbsp;</div>';
                    this.longestWidth = this.children[0].offsetWidth;
                    //console.log(this.longestWidth);
                }
                wheelElementInserted(this);
            },

            attributeChanged: function (strAttrName, oldValue, newValue) {
                // if "suspend-created" has been removed: run created and inserted code
                if (strAttrName === 'suspend-created' && newValue === null) {
                    wheelElementCreated(this);
                    wheelElementInserted(this);

                // if "suspend-inserted" has been removed: run inserted code
                } else if (strAttrName === 'suspend-inserted' && newValue === null) {
                    wheelElementInserted(this);

                } else if (!this.hasAttribute('suspend-created') && !this.hasAttribute('suspend-inserted')) {

                }
            }
        },
        events: {},
        accessors: {
            value: {
                get: function () {
                    return this.getAttribute('value') || '0';
                },
                set: function (newValue) {
                    this.setAttribute('value', newValue);
                    wheelGenerateHTML(this);
                }
            }
        },
        methods: {}
    });
});
