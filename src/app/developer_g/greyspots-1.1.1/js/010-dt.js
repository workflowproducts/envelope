//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps, addDataEvents, addAutocompleteProps
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    'use strict';

    addSnippet('<gs-dt>', '<gs-dt>', 'gs-dt column="${1:name}"></gs-dt>');
    addSnippet('<gs-dt> With Label', '<gs-dt>', 'label for="${1:dt-insert-start_date}">${2:Start Date}:</label>\n' +
                                                               '<gs-dt id="${1:dt-insert-start_date}" column="${3:start_date}"></gs-dt>');

    addElement('gs-dt', '#controls_dt');

    window.designElementProperty_GSDT = function() {
        addGSControlProps();
        addText('O', 'Column In QS', 'qs');
        addText('V', 'Placeholder', 'placeholder');
        addCheck('V', 'Popup?', 'popup');
        addCombo('D', 'Format', 'format', [
            {"val": "", "txt": "Default (01/01/2015)"},
            {"val": "shortdate", "txt": "shortdate (1/1/15)"},
            {"val": "mediumdate", "txt": "mediumdate (Jan 1, 2015)"},
            {"val": "longdate", "txt": "longdate (January 1, 2015)"},
            {"val": "fulldate", "txt": "fulldate (Thursday, January 1, 2015)"},
            {"val": "isodate", "txt": "isodate (2015-01-01)"},
            {"val": "isodatetime", "txt": "isodatetime (2015-01-01T00:00:00)"},
            {"val": "shorttime", "txt": "shorttime (1:00 AM)"},
            {"val": "mediumtime", "txt": "mediumtime (01:00:00 AM)"},
            {"val": "isotime", "txt": "isotime (01:00:00)"}
        ]);
        addAutocompleteProps();
        addFocusEvents();
        addFlexProps();
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    function getFormatString(element) {
        var strFormat;

        if (element.hasAttribute('format')) {
            strFormat = element.getAttribute('format');
        }

        if (!strFormat) {
            strFormat = 'MM/dd/yyyy';
        } else {
            strFormat = strFormat.replace(/\bshortdate\b/i, 'M/d/yy');
            strFormat = strFormat.replace(/\bnormaldate\b/i, 'MM/dd/yyyy');
            strFormat = strFormat.replace(/\bmediumdate\b/i, 'MMM d, yyyy');
            strFormat = strFormat.replace(/\blongdate\b/i, 'MMMM d, yyyy');
            strFormat = strFormat.replace(/\bfulldate\b/i, 'EEEE, MMMM d, yyyy');
            strFormat = strFormat.replace(/\bshorttime\b/i, 'h:mm a');
            strFormat = strFormat.replace(/\bmediumtime\b/i, 'h:mm:ss a');
            strFormat = strFormat.replace(/\bisodate\b/i, 'yyyy-MM-dd');
            strFormat = strFormat.replace(/\bisotime\b/i, 'HH:mm:ss');
            strFormat = strFormat.replace(/\bisodatetime\b/i, 'yyyy-MM-dd\'T\'HH:mm:ss');
        }

        return strFormat;
    }

    /*function parseDate(str, format) {
        // This truth, we hold to be self-evident. That the universe was created on January 1, 1970.
        var d = new Date('1/1/1970 00:00:00');

        var arrFullMonth = ['january','february','march','april','may','june','july','august','september','october','november','december'];
        var arrShortMonth = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
        var arrFormatSeparators;
        var strFormatSeparators;
        var regFormatSeparators;
        var arrDate;
        var arrFormat;
        var arrValueRanges;
        var currentValueRange;
        var i;
        var j;
        var n;
        var len;

        arrFormatSeparators = format.match(/[^yMdEHhKAaPpmsS]+/g);
        strFormatSeparators = '[' + arrFormatSeparators.join('').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/-/g, '\\-') + ']';
        regFormatSeparators = new RegExp(strFormatSeparators, 'g');
        arrDate = str.split(regFormatSeparators);
        arrFormat = format.split(regFormatSeparators);
        i = 0;

        if (arrDate.length !== arrFormat.length) {
            return new Date('Invalid Date');
        }

        // y    Full year
        // yyyy Full year
        // yy   Last two digits of the year
        // M    Month number
        // MMM  Month name
        // MMMM Month name
        // d    Day of the month
        // E    Day name (Ignore)
        // H    Hour number (24-hour, midnight 0)
        // h    Hour number (12-hour)
        // AaPp AM/PM
        // m    Minutes
        // s    Seconds
        // S    Milliseconds

        len = arrDate.length;
        while (i < len) {
            if (arrFormat[i].length === 2) {
                arrDate[i] = GS.leftPad(arrDate[i], '0', 2).substring(0, 2);
            }

            if (arrFormat[i].length === 0) {
            } else if (arrFormat[i][0] === 'y') {
                if (arrFormat[i].length === 4 || arrFormat[i].length === 1) {
                    d.setFullYear(parseInt(arrDate[i], 10));

                } else {
                    d.setYear(parseInt(arrDate[i], 10));

                }

            } else if (arrFormat[i][0] === 'M') {
                if (arrFormat[i].length === 4) {
                    d.setMonth(arrFullMonth.indexOf(arrDate[i].toLowerCase()));

                } else if (arrFormat[i].length === 3) {
                    d.setMonth(arrShortMonth.indexOf(arrDate[i].toLowerCase()));

                } else {
                    d.setMonth(parseInt(arrDate[i], 10) - 1);

                }

            } else if (arrFormat[i][0] === 'd') {
                d.setDate(parseInt(arrDate[i], 10));

            } else if (arrFormat[i][0] === 'H') {
                d.setHours(parseInt(arrDate[i], 10));

            } else if (arrFormat[i][0] === 'h') {
                d.setHours(parseInt(arrDate[i], 10));

            } else if (/[AaPp]/.test(arrFormat[i][0])) {
                d.setHours((d.getHours() > 12 ? d.getHours() - 12 : d.getHours()) + (/[Pp]/.test(arrDate[i]) ? 12 : 0));

            } else if (arrFormat[i][0] === 'm') {
                d.setMinutes(parseInt(arrDate[i], 10));

            } else if (arrFormat[i][0] === 's') {
                d.setSeconds(parseInt(arrDate[i], 10));

            } else if (arrFormat[i][0] === 'S') {
                d.setMilliseconds(parseInt(arrDate[i], 10));

            }
            i += 1;
        }

        return d;
    }*/

    function formatDate(dteValue, strFormat) {
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
            },
            locale = {
                monthsFull:   ['January','February','March','April','May','June', 'July','August','September','October','November','December'],
                monthsShort:  ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
                daysFull:     ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
                daysShort:    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
                shortDateFormat: 'M/d/yyyy h:mm a',
                longDateFormat: 'EEEE, MMMM dd, yyyy h:mm:ss a'
            };

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

        //console.log(dteValue.getFullYear());

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

    function formatDateHTML(dteValue, strFormat) {
        // This function will generate spans with an attribute saying what part of the format it is
        // so when you click on a gs-dt it selects the correct component
        var strHTML;
        var strValue;
        var arrFormatSeparators;
        var strFormatSeparators;
        var regFormatSeparators;
        var arrDate;
        var arrFormat;
        var arrValueRanges;
        var i;
        var j;
        var len;

        strHTML = '';
        strValue = formatDate(dteValue, strFormat);

        arrFormatSeparators = strFormat.match(/[^yMdEHhKAaPpmsS]+/g);
        strFormatSeparators = '[' + arrFormatSeparators.join('').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/-/g, '\\-') + ']';
        regFormatSeparators = new RegExp(strFormatSeparators, 'g');
        arrDate = strValue.split(regFormatSeparators);
        arrFormat = strFormat.split(regFormatSeparators);
        arrValueRanges = [];
        i = 0;
        j = 0;

        len = arrDate.length;
        while (i < len) {
            arrValueRanges.push({
                start: j,
                end: j + arrDate[i].length
            });
            j += arrDate[i].length + 1;
            i += 1;
        }

        i = 0;
        while (i < len) {
            strHTML += '<span format="' + arrFormat[i] + '">' + strValue.substring(arrValueRanges[i].start, arrValueRanges[i].end) + '</span>';
            if ((i + 1) < len) {
                strHTML += strValue.substring(arrValueRanges[i].end, arrValueRanges[i + 1].start);
            }
            i += 1;
        }

        return strHTML;
    }

    function setArrowRules(element, arrFormat) {
        // this function determines if the day can change the month and if the month can change the year
        // because, if the month is before the day, then it will usually get set first
        var bolDay = false;
        var bolMonth = false;

        var i = 0;
        var len = arrFormat.length;
        var strLetter;
        var dayIndex;
        var monthIndex;
        var yearIndex;

        while (i < len) {
            strLetter = arrFormat[i][0] || 'A'; // sometimes an empty string comes through the format

            if (strLetter === 'd') {
                dayIndex = i;
            }

            if (strLetter === 'M') {
                monthIndex = i;
            }

            if (strLetter === 'y') {
                yearIndex = i;
            }

            i += 1;
        }

        element.internal.bolDayToMonth = dayIndex < monthIndex;
        element.internal.bolMonthToYear = monthIndex < yearIndex;
        element.internal.bolDayToYear = dayIndex < yearIndex && dayIndex < monthIndex;
    }

    function newDateInCurrentTimeZone(str) {
        // this function is to counteract iso style dates being treated as GMT/UTC
        if (/^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]($|\ )/.test(str)) {
            str = str.replace('-', '/').replace('-', '/');
        }
        if (/\ [0-9]/.test(str)) {
            str = str.replace(/-[0-9][0-9]$/, '');
            return new Date(str);
        } else if (str.indexOf(':') > -1) {
            return new Date('1/1/1970 ' + str);
        } else {
            return new Date(str + ' 00:00:00');
        }
    }

    function getNumberOfDaysInMonth(d) {
        d = new Date(d);
        d.setMonth(d.getMonth() + 1);
        d.setDate(0);
        return d.getDate();
    }

    function insertText(str) {
        if (!document.queryCommandSupported('insertText') || !document.queryCommandEnabled('insertText')) {
            var element = document.activeElement;
            var jsnTextSelection = GS.getInputSelection(element);
            //console.trace(JSON.stringify(jsnTextSelection), element.value);
            element.value = element.value.substring(0, jsnTextSelection.start) + str + element.value.substring(jsnTextSelection.end);
            //console.log(JSON.stringify(jsnTextSelection), element.value);
            element.parentNode.cancelSelectEvent = true;
            GS.setInputSelection(element, jsnTextSelection.start + str.length, jsnTextSelection.start + str.length);
            //console.log(JSON.stringify(GS.getInputSelection(element)), jsnTextSelection.start + str.length);
        } else {
            var element = document.activeElement;
            //console.log(element);
            //console.log(element.value, element.parentNode.value);
            document.execCommand('insertText', true, str);
            //console.log(element.value, element.parentNode.value);
        }
    }

    function controlKeydownFunction(event) {
        var element = event.target.parentNode;

        if (!event.ctrlKey && !event.metaKey && !event.altKey) {
            var strValue = element.control.value;
            var intKeyCode = (event.keyCode || event.which);
            var jsnTextSelection;

            var format;
            var arrFormatSeparators;
            var strFormatSeparators;
            var regFormatSeparators;
            var arrDate;
            var arrFormat;
            var arrValueRanges;
            var currentValueRange;
            var i;
            var j;
            var len;

            var getValueRanges = function () {
                arrFormatSeparators = format.match(/[^yMdEHhKAaPpmsS]+/g);
                strFormatSeparators = '[' + arrFormatSeparators.join('').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/-/g, '\\-') + ']';
                regFormatSeparators = new RegExp(strFormatSeparators, 'g');
                arrDate = strValue.split(regFormatSeparators);
                arrFormat = format.split(regFormatSeparators);
                arrValueRanges = [];
                i = 0;
                j = 0;

                len = arrDate.length;
                while (i < len) {
                    arrValueRanges.push({
                        start: j,
                        end: j + arrDate[i].length
                    });
                    j += arrDate[i].length + 1;
                    i += 1;
                }
            };

            format = getFormatString(element);
            getValueRanges();

            jsnTextSelection = GS.getInputSelection(element.control);
            currentValueRange = -2;
            i = 0;
            len = arrValueRanges.length;
            while (i < len) {
                if (jsnTextSelection.start >= arrValueRanges[i].start && jsnTextSelection.end <= arrValueRanges[i].end) {
                    currentValueRange = i;
                    break;
                }
                i += 1;
            }

            // left     37
            // up       38
            // right    39
            // down     40

            //console.log('intKeyCode', intKeyCode);

            // arrowing and special advancement characters (see above)
            if (intKeyCode >= 37 && intKeyCode <= 40 && element.internal.validDate) {
                event.preventDefault();
                event.stopPropagation();

                // changing sections
                (function () {
                    if (intKeyCode === 37) {
                        if (currentValueRange === -2) {
                            currentValueRange = 0;
                        } else {
                            currentValueRange -= 1;
                        }

                        // when the length is zero, that only means
                        // that there were two speparators in a row
                        // e.g. ", "
                        while (currentValueRange > 0 && arrDate[currentValueRange].length === 0) {
                            currentValueRange -= 1;
                        }
                    } else if (intKeyCode === 39) {
                        if (currentValueRange === -2) {
                            currentValueRange = 0;
                        } else {
                            currentValueRange += 1;
                        }

                        // see above
                        while (currentValueRange < arrDate.length && arrDate[currentValueRange].length === 0) {
                            currentValueRange += 1;
                        }
                    }

                    if (currentValueRange === -2) {
                            currentValueRange = 0;
                    } else if (currentValueRange < 0) {
                        currentValueRange += arrValueRanges.length;
                    } else if (currentValueRange >= arrValueRanges.length) {
                        currentValueRange -= arrValueRanges.length;
                    }
                    //console.log('currentValueRange', currentValueRange);
                    GS.setInputSelection(element.control, arrValueRanges[currentValueRange].start, arrValueRanges[currentValueRange].end);
                }());

                // update value
                (function () {
                    var d = newDateInCurrentTimeZone(element.control.value);
                    var saveDay;
                    var saveMonth;
                    var saveYear;
                    if (intKeyCode === 38) {
                        if (/y/.test(arrFormat[currentValueRange])) {
                            d.setFullYear(d.getFullYear() + 1);

                        } else if (/M/.test(arrFormat[currentValueRange])) {
                            if (!element.internal.bolMonthToYear) {
                                saveYear = d.getFullYear();
                            }
                            // this is so we can deal with the differing number of days per month
                            saveDay = d.getDate();
                            d.setDate(1);
                            d.setMonth(d.getMonth() + 1);
                            d.setDate(Math.min(saveDay, getNumberOfDaysInMonth(d)));
                            if (!element.internal.bolMonthToYear) {
                                d.setFullYear(saveYear);
                            }

                        } else if (/[dE]/.test(arrFormat[currentValueRange])) {
                            if (!element.internal.bolDayToMonth) {
                                saveMonth = d.getMonth();
                            }
                            if (!element.internal.bolDayToYear) {
                                saveYear = d.getFullYear();
                            }

                            if (!element.internal.bolDayToMonth && d.getDate() === getNumberOfDaysInMonth(d)) {
                                d.setDate(1);
                            } else {
                                d.setDate(d.getDate() + 1);
                            }

                            if (!element.internal.bolDayToMonth) {
                                d.setMonth(saveMonth);
                            }
                            if (!element.internal.bolDayToYear) {
                                d.setFullYear(saveYear);
                            }

                        } else if (/[HhK]/.test(arrFormat[currentValueRange])) {
                            d.setHours(d.getHours() + 1);

                        } else if (/[Aap]/.test(arrFormat[currentValueRange])) {
                            d.setHours(d.getHours() + (/a/i.test(arrDate[currentValueRange]) ? 12 : -12));

                        } else if (/[m]/.test(arrFormat[currentValueRange])) {
                            d.setMinutes(d.getMinutes() + 1);

                        } else if (/[s]/.test(arrFormat[currentValueRange])) {
                            d.setSeconds(d.getSeconds() + 1);

                        } else if (/[S]/.test(arrFormat[currentValueRange])) {
                            d.setMilliseconds(d.getMilliseconds() + 1);

                        }

                    } else if (intKeyCode === 40) {
                        if (arrFormat[currentValueRange] === 'yyyy') {
                            d.setFullYear(d.getFullYear() - 1);

                        } else if (/y/.test(arrFormat[currentValueRange])) {
                            d.setYear(d.getYear() - 1);

                        } else if (/M/.test(arrFormat[currentValueRange])) {
                            if (!element.internal.bolMonthToYear) {
                                saveYear = d.getFullYear();
                            }
                            // this is so we can deal with the differing number of days per month
                            saveDay = d.getDate();
                            d.setDate(1);
                            d.setMonth(d.getMonth() - 1);
                            d.setDate(Math.min(saveDay, getNumberOfDaysInMonth(d)));
                            if (!element.internal.bolMonthToYear) {
                                d.setFullYear(saveYear);
                            }

                        } else if (/[dE]/.test(arrFormat[currentValueRange])) {
                            if (!element.internal.bolDayToMonth) {
                                saveMonth = d.getMonth();
                            }
                            if (!element.internal.bolDayToYear) {
                                saveYear = d.getFullYear();
                            }

                            if (!element.internal.bolDayToMonth && d.getDate() === 1) {
                                d.setDate(getNumberOfDaysInMonth(d));
                            } else {
                                d.setDate(d.getDate() - 1);
                            }

                            if (!element.internal.bolDayToMonth) {
                                d.setMonth(saveMonth);
                            }
                            if (!element.internal.bolDayToYear) {
                                d.setFullYear(saveYear);
                            }

                        } else if (/[HhK]/.test(arrFormat[currentValueRange])) {
                            d.setHours(d.getHours() - 1);

                        } else if (/[AaPp]/.test(arrFormat[currentValueRange])) {
                            d.setHours(d.getHours() - (/a/i.test(arrDate[currentValueRange]) ? 12 : -12));

                        } else if (/[m]/.test(arrFormat[currentValueRange])) {
                            d.setMinutes(d.getMinutes() - 1);

                        } else if (/[s]/.test(arrFormat[currentValueRange])) {
                            d.setSeconds(d.getSeconds() - 1);

                        } else if (/[S]/.test(arrFormat[currentValueRange])) {
                            d.setMilliseconds(d.getMilliseconds() - 1);

                        }
                    }

                    element.internal.validDate = d.toString() !== 'Invalid Date';
                    if (element.internal.validDate) {
                        element.internal.lastValidDate = d;
                        strValue = formatDate(d, getFormatString(element));
                        element.internal.lastValidValue = strValue;
                        getValueRanges();
                        GS.setInputSelection(element.control, 0, element.control.value.length);
                        insertText(strValue);
                        GS.setInputSelection(element.control, arrValueRanges[currentValueRange].start, arrValueRanges[currentValueRange].end);
                    } else {
                        GS.setInputSelection(element.control, 0, element.control.value.length);
                        insertText('Invalid Date');
                        setTimeout(function() {
                            element.control.value = null;
                        }, 250);
                    }
                }());

            // this is reached if it's an invalid date
            } else if (intKeyCode >= 37 && intKeyCode <= 40) {
                event.preventDefault();

            // return should save
            } else if (intKeyCode === 13) {
                GS.triggerEvent(element.control, 'change');

            } else if (intKeyCode === 32) {
                event.preventDefault();
                var d = newDateInCurrentTimeZone(element.control.value);

                element.internal.lastValidDate = d;
                strValue = formatDate(d, getFormatString(element));
                element.internal.lastValidValue = strValue;
                getValueRanges();
                GS.setInputSelection(element.control, 0, element.control.value.length);
                insertText(strValue);

                currentValueRange += 1;
                while (currentValueRange < arrDate.length && arrDate[currentValueRange].length === 0) {
                    currentValueRange += 1;
                }
                if (currentValueRange >= arrDate.length) {
                    currentValueRange -= arrDate.length;
                }

                element.cancelSelectEvent = true;
                GS.setInputSelection(element.control, arrValueRanges[currentValueRange].start, arrValueRanges[currentValueRange].end);
                strValue = element.control.value;

            // everything that doesn't already do something
            } else if (intKeyCode >= 48) {
                var bolAlpha = intKeyCode >= 65 && intKeyCode <= 90;
                var bolNum = (intKeyCode >= 48 && intKeyCode <= 57) || (intKeyCode >= 96 && intKeyCode <= 105);
                var bolAllowTyping = !element.internal.validDate;
                if (bolAlpha && (arrFormat[Math.max(currentValueRange, 0)] === 'MMM' || arrFormat[Math.max(currentValueRange, 0)] === 'MMMM' || (/[AaPp]/).test(arrFormat[Math.max(currentValueRange, 0)]))) {
                    bolAllowTyping = true;
                } else if (bolNum && arrFormat[Math.max(currentValueRange, 0)] !== 'MMM' && arrFormat[Math.max(currentValueRange, 0)] !== 'MMMM') {
                    bolAllowTyping = true;
                }

                if (!bolAllowTyping) {
                    event.preventDefault();

                // when the whole thing is selected, replace the first sub-field
                } else if (currentValueRange < 0 && GS.charFromKeyCode(event)) {
                    event.preventDefault();
                    currentValueRange = 0;
                    GS.setInputSelection(element.control, arrValueRanges[currentValueRange].start, arrValueRanges[currentValueRange].end);
                    element.cancelSelectEvent = true;
                    insertText(GS.charFromKeyCode(event));

                // disallow typing the day name sub-field
                } else if (arrFormat[currentValueRange] === 'EEE' || arrFormat[currentValueRange] === 'EEEE' || (/[AaPp]/.test(arrFormat[currentValueRange]) && intKeyCode !== 65 && intKeyCode !== 80)) {
                    event.preventDefault();

                // only allow typing a or p in AM/PM sub-field
                } else if (/[AaPp]/.test(arrFormat[currentValueRange]) && (intKeyCode === 65 || intKeyCode === 80)) {
                    event.preventDefault();
                    GS.setInputSelection(element.control, arrValueRanges[currentValueRange].start, arrValueRanges[currentValueRange].end);
                    insertText(intKeyCode === 65 ? 'AM' : 'PM');
                    GS.setInputSelection(element.control, arrValueRanges[currentValueRange].start, arrValueRanges[currentValueRange].end);
                    strValue = element.control.value;

                // if there a valid date and we are in a 2-digit field and we have 2 digits, advance
                } else if (element.internal.validDate && currentValueRange >= 0 && arrFormat[currentValueRange].length === 2 && arrDate[currentValueRange].length === 2 && (jsnTextSelection.end - jsnTextSelection.start) === 0) {
                    event.preventDefault();

                    currentValueRange += 1;
                    while (currentValueRange < arrDate.length && arrDate[currentValueRange].length === 0) {
                        currentValueRange += 1;
                    }
                    if (currentValueRange >= arrDate.length) {
                        currentValueRange -= arrDate.length;
                    }

                    element.cancelSelectEvent = true;
                    GS.setInputSelection(element.control, arrValueRanges[currentValueRange].start, arrValueRanges[currentValueRange].end);
                    insertText(GS.charFromKeyCode(event));
                    strValue = element.control.value;
                }
                element.cancelSelectEvent = true;
            }
        }
        element.internal.lastKeyupValue = !bolAllowTyping ? element.internal.lastKeyupValue : undefined;
    }

    function controlKeyupFunction(event) {
        var element = event.target.parentNode;

        var strValue = element.control.value;
        var intKeyCode = (event.keyCode || event.which);
        // slash, dash, dash (firefox), subtract, comma, colon and space
        var arrAdvanceKey = [191, 189, 173, 109, 188, 186, 32];
        var bolAdvanceKey = arrAdvanceKey.indexOf(intKeyCode) > -1;
        var jsnTextSelection;

        var format;
        var arrFormatSeparators;
        var strFormatSeparators;
        var regFormatSeparators;
        var arrDate;
        var arrFormat;
        var arrValueRanges;
        var currentValueRange;
        var intMinValidationLength;
        var intCurrentValueRangeLength;
        var i;
        var j;
        var len;

        var getValueRanges = function () {
            arrFormatSeparators = format.match(/[^yMdEHhKAaPpmsS]+/g);
            strFormatSeparators = '[' + arrFormatSeparators.join('').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/-/g, '\\-') + ']';
            regFormatSeparators = new RegExp(strFormatSeparators, 'g');
            arrDate = strValue.split(regFormatSeparators);
            arrFormat = format.split(regFormatSeparators);
            arrValueRanges = [];
            i = 0;
            j = 0;

            len = arrDate.length;
            while (i < len) {
                arrValueRanges.push({
                    start: j,
                    end: j + arrDate[i].length,
                    len: arrDate[i].length
                });
                j += arrDate[i].length + 1;
                i += 1;
            }
        };

        format = getFormatString(element);
        getValueRanges();

        jsnTextSelection = GS.getInputSelection(element.control);
        currentValueRange = -1;
        i = 0;
        len = arrValueRanges.length;
        while (i < len) {
            if (jsnTextSelection.start >= arrValueRanges[i].start && jsnTextSelection.end <= arrValueRanges[i].end) {
                currentValueRange = i;
                break;
            }
            i += 1;
        }

        if (!((intKeyCode >= 37 && intKeyCode <= 40) || intKeyCode === 27 || intKeyCode < 48) && currentValueRange !== -1) {
            intMinValidationLength = (
                arrFormat[currentValueRange][0] === 'M'     ? (arrFormat[currentValueRange].length === 1 ? 2 : Math.min(arrFormat[currentValueRange].length, 3)) :
                arrFormat[currentValueRange] === 'y'        ? 2 :
                arrFormat[currentValueRange] === 'yy'       ? 2 :
                arrFormat[currentValueRange] === 'yyyy'     ? 4 : 2
            );
            intCurrentValueRangeLength = arrValueRanges[currentValueRange].len;
            //console.log(intCurrentValueRangeLength, intMinValidationLength);

            if (bolAdvanceKey || (intCurrentValueRangeLength >= intMinValidationLength && !(/[AaPp]/.test(arrFormat[currentValueRange]) && intKeyCode !== 65 && intKeyCode !== 80))) {
                var d = newDateInCurrentTimeZone(element.control.value);
                // if (arrFormat[currentValueRange] === 'yyyy') {
                //     d.setFullYear(parseInt(arrDate[currentValueRange], 10));
                // }

                //console.log(element.internal.lastKeyupValue, strValue, intCurrentValueRangeLength, intMinValidationLength);

                element.internal.validDate = d.toString() !== 'Invalid Date' && (element.control.value.match(/[^0-9a-z]/gi)).length >= 2;
                //console.log(element.internal.validDate);
                if (element.internal.validDate && (element.internal.lastKeyupValue || '').toLowerCase() !== strValue.toLowerCase()) {
                    element.internal.lastKeyupValue = element.control.value;

                    element.internal.lastValidDate = d;
                    strValue = formatDate(d, getFormatString(element));
                    element.internal.lastValidValue = strValue;
                    getValueRanges();
                    GS.setInputSelection(element.control, 0, element.control.value.length);
                    insertText(strValue);
                    GS.setInputSelection(element.control, jsnTextSelection.start, jsnTextSelection.end);

                    // advance to next field if at longest valid length
                    if (bolAdvanceKey || intCurrentValueRangeLength >= intMinValidationLength) {
                        currentValueRange += 1;
                        // see above
                        while (currentValueRange < arrDate.length && arrDate[currentValueRange].length === 0) {
                            currentValueRange += 1;
                        }
                        if (currentValueRange >= arrValueRanges.length) {
                            GS.setInputSelection(element.control, 0, strValue.length);
                        } else {
                            GS.setInputSelection(element.control, arrValueRanges[currentValueRange].start, arrValueRanges[currentValueRange].end);
                        }
                    }
                }
            }
        }
    }

    function controlSelectFunction(event) {
        //console.log('controlSelectFunction', event);
        var element = event.target.parentNode;
        if (!element) {
            return;
        }
        var jsnTextSelection = GS.getInputSelection(element.control);
        if ((jsnTextSelection.end - jsnTextSelection.start) === 0 || element.cancelSelectEvent) {
            element.cancelSelectEvent = false;
            return;
        }

        var strValue = element.control.value;
        var intKeyCode = (event.keyCode || event.which);

        var format;
        var arrFormatSeparators;
        var strFormatSeparators;
        var regFormatSeparators;
        var arrDate;
        var arrFormat;
        var arrValueRanges;
        var currentValueRange;
        var i;
        var j;
        var len;

        var getValueRanges = function () {
            arrFormatSeparators = format.match(/[^yMdEHhKAaPpmsS]+/g);
            strFormatSeparators = '[' + arrFormatSeparators.join('').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/-/g, '\\-') + ']';
            regFormatSeparators = new RegExp(strFormatSeparators, 'g');
            arrDate = strValue.split(regFormatSeparators);
            arrFormat = format.split(regFormatSeparators);
            arrValueRanges = [];
            i = 0;
            j = 0;

            len = arrDate.length;
            while (i < len) {
                arrValueRanges.push({
                    start: j,
                    end: j + arrDate[i].length,
                    len: arrDate[i].length
                });
                j += arrDate[i].length + 1;
                i += 1;
            }
        };

        format = getFormatString(element);
        getValueRanges();

        currentValueRange = -1;
        i = 0;
        len = arrValueRanges.length;
        while (i < len) {
            if (jsnTextSelection.start >= arrValueRanges[i].start && jsnTextSelection.end <= arrValueRanges[i].end) {
                currentValueRange = i;
                break;
            }
            i += 1;
        }

        if (currentValueRange >= 0) {
            element.cancelSelectEvent = true;
            GS.setInputSelection(element.control, arrValueRanges[currentValueRange].start, arrValueRanges[currentValueRange].end);
        }
    }

    function arrowMousedownFunction(event) {
        var element = event.target.parentNode.element;//GS.findParentTag(event.target, 'gs-dt');
        event.preventDefault();
        if (evt.touchDevice) {
            element.bolArrowEvent = true;
        }

        GS.triggerEvent(element.control, 'keydown', {
            which: (
                event.target.classList.contains('dt-arrow-left')    ? 37 :
                event.target.classList.contains('dt-arrow-up')      ? 38 :
                event.target.classList.contains('dt-arrow-right')   ? 39 :
                event.target.classList.contains('dt-arrow-down')    ? 40 : 0
            )
        });
    }

    // re-target change event from control to element
    function changeFunction(event) {
        //console.log('changeFunction');
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        event.target.parentNode.syncGetters();//iphone sometimes doesn't do a key like with time wheels
        event.target.parentNode.internal.lastChangeValue = event.target.parentNode.value;

        if (event.target.parentNode.changeOldValue !== event.target.value) {
            event.target.parentNode.changeOldValue = event.target.value;
        //if (event.target.parentNode.oldValue !== event.target.value) {
            GS.triggerEvent(event.target.parentNode, 'change');
        }

        return false;
    }

    function focusFunction(event) {
        var element = event.target;
        if (event.target.classList.contains('control')) {
            element = element.parentNode.parentNode;
        }
        element.removeEventListener('focus', focusFunction);
        element.classList.add('focus');
        element.addControl();
        if (element.control.value && element.control.value.length > 0) {
            if (element.bolSelect) {
                element.control.setSelectionRange(0, element.control.value.length);
            } else {
                element.control.setSelectionRange(element.control.value.length, element.control.value.length);
            }
        }
        element.bolSelect = true;
    }

    function mousedownFunction(event) {
        //console.log('mousedownFunction');
        var element = event.target.tagName.toUpperCase() === 'GS-DT' ? event.target : GS.findParentTag(event.target, 'gs-dt');
        if (event.target.tagName.toUpperCase() === 'SPAN') {
            var currentFormat = event.target.getAttribute('format');
            event.preventDefault();
            event.stopPropagation();
            element.focus();

            var strValue = element.value;
            var format;
            var arrFormatSeparators;
            var strFormatSeparators;
            var regFormatSeparators;
            var arrDate;
            var arrFormat;
            var arrValueRanges;
            var currentValueRange;
            var i;
            var j;
            var len;

            var getValueRanges = function () {
                arrFormatSeparators = format.match(/[^yMdEHhKAaPpmsS]+/g);
                strFormatSeparators = '[' + arrFormatSeparators.join('').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/-/g, '\\-') + ']';
                regFormatSeparators = new RegExp(strFormatSeparators, 'g');
                arrDate = strValue.split(regFormatSeparators);
                arrFormat = format.split(regFormatSeparators);
                arrValueRanges = [];
                i = 0;
                j = 0;

                len = arrDate.length;
                while (i < len) {
                    arrValueRanges.push({
                        start: j,
                        end: j + arrDate[i].length
                    });
                    j += arrDate[i].length + 1;
                    i += 1;
                }
            };

            format = getFormatString(element);
            getValueRanges();
            currentValueRange = arrFormat.indexOf(currentFormat);
            GS.setInputSelection(element.control, arrValueRanges[currentValueRange].start, arrValueRanges[currentValueRange].end);
        }
    }

    function controlClickFunction(event) {
        //console.log('controlClickFunction');
        var element = GS.findParentTag(event.target, 'gs-dt');
        var currentFormat = event.target.getAttribute('format');

        var strValue = element.value;
        var format;
        var arrFormatSeparators;
        var strFormatSeparators;
        var regFormatSeparators;
        var arrDate;
        var arrFormat;
        var arrValueRanges;
        var currentValueRange;
        var i;
        var j;
        var len;
        var jsnTextSelection = GS.getInputSelection(element.control);

        var getValueRanges = function () {
            arrFormatSeparators = format.match(/[^yMdEHhKAaPpmsS]+/g);
            strFormatSeparators = '[' + arrFormatSeparators.join('').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/-/g, '\\-') + ']';
            regFormatSeparators = new RegExp(strFormatSeparators, 'g');
            arrDate = strValue.split(regFormatSeparators);
            arrFormat = format.split(regFormatSeparators);
            arrValueRanges = [];
            i = 0;
            j = 0;

            len = arrDate.length;
            while (i < len) {
                arrValueRanges.push({
                    start: j,
                    end: j + arrDate[i].length
                });
                j += arrDate[i].length + 1;
                i += 1;
            }
        };

        format = getFormatString(element);
        getValueRanges();

        currentValueRange = -1;
        i = 0;
        len = arrValueRanges.length;
        while (i < len) {
            if (jsnTextSelection.start >= arrValueRanges[i].start && jsnTextSelection.end <= arrValueRanges[i].end) {
                currentValueRange = i;
                break;
            }
            i += 1;
        }

        if (currentValueRange >= 0) {
            GS.setInputSelection(element.control, arrValueRanges[currentValueRange].start, arrValueRanges[currentValueRange].end);
        }
    }

    // re-target blur event from control to element
    function blurFunction(event) {
        //console.trace(event);
        if (!event.target.parentNode.bolArrowEvent) {
            GS.triggerEvent(event.target.parentNode, 'blur'); //  || !document.queryCommandSupported('insertText') || !document.queryCommandEnabled('insertText')
            if (event.target.parentNode.internal.lastChangeValue !== event.target.parentNode.value) {
                event.target.parentNode.internal.lastChangeValue = event.target.parentNode.value;
                GS.triggerEvent(event.target.parentNode, 'change');
            }
            event.target.parentNode.classList.remove('focus');
            event.target.parentNode.removeControl();
        } else {
            var selection = GS.getInputSelection(event.target);
            event.target.focus();
            GS.setInputSelection(event.target, selection.start, selection.end);
            event.target.parentNode.bolArrowEvent = false;
        }
    }

    // mouseout, remove hover class
    function mouseoutFunction(event) {
        GS.triggerEvent(event.target.parentNode, evt.mouseout);
        event.target.classList.remove('hover');
    }

    // mouseover, add hover class
    function mouseoverFunction(event) {
        GS.triggerEvent(event.target.parentNode, evt.mouseover);
        event.target.classList.add('hover');
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

    function createPushReplacePopHandler(element) {
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
                    element.value = strQSValue;
                }
            } else {
                element.value = strQSValue;
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
            if (element.value) {
                element.setAttribute('value', element.value);
                delete element.value;
                //element.value = null;
            }
        }
    }

    function findFor(element) {
        var forElem;
        //console.log(element, element.previousElementSibling)
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
        
        /*
            if (element.hasAttribute('id')) {
                findFor(element);
            }
        // please ensure that if the element has an id it is given an id
                if (element.hasAttribute('id')) {
                    element.control.setAttribute('id', element.getAttribute('id') + '_control');
                }
                if (element.hasAttribute('aria-labelledby')) {
                    element.control.setAttribute('aria-labelledby', element.getAttribute('aria-labelledby'));
                }
                if (element.hasAttribute('title')) {
                    element.control.setAttribute('title', element.getAttribute('title'));
                }
        */
    }

    function elementInserted(element) {
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
                element.bolSelect = true;

                if (element.getAttribute('value') === 'now' || element.getAttribute('value') === 'today') {
                    //console.log(formatDate(new Date(), getFormatString(element)), new Date(), getFormatString(element));
                    element.setAttribute('value', formatDate(new Date(), getFormatString(element)));
                }

                var arrFormatSeparators;
                var strFormatSeparators;
                var regFormatSeparators;
                var arrFormat;

                arrFormatSeparators = getFormatString(element).match(/[^yMdEHhKAaPpmsS]+/g);
                strFormatSeparators = '[' + arrFormatSeparators.join('').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/-/g, '\\-') + ']';
                regFormatSeparators = new RegExp(strFormatSeparators, 'g');
                arrFormat = getFormatString(element).split(regFormatSeparators);
                setArrowRules(element, arrFormat);

                element.internal.validDate = newDateInCurrentTimeZone(element.getAttribute('value') || '').toString() !== 'Invalid Date';
                if (element.internal.validDate) {
                    element.internal.lastValidValue = element.getAttribute('value');
                    element.internal.lastValidDate = newDateInCurrentTimeZone(element.getAttribute('value'));
                    element.internal.lastValidValue = formatDate(element.internal.lastValidDate, getFormatString(element));
                    element.setAttribute('value', element.internal.lastValidValue);
                } else {
                    element.internal.lastValidValue = '';
                    element.internal.lastValidDate = null;
                }
                element.internal.lastChangeValue = element.internal.lastValidValue;

                if (element.internal.lastValidDate) {
                    element.innerHTML = formatDateHTML(element.internal.lastValidDate, getFormatString(element));
                    element.syncGetters();
                } else if (element.hasAttribute('placeholder')) {
                    element.innerHTML = '<span class="placeholder">' + element.getAttribute('placeholder') + '</span>';
                }

                element.addEventListener('focus', focusFunction);
                element.addEventListener(evt.mousedown, mousedownFunction);
                if (evt.touchDevice) {
                    element.addEventListener(evt.click, focusFunction);
                    element.addEventListener(evt.mousedown, function (event) {
                        //alert(event.touches[0].clientX);
                        element.startX = event.touches[0].clientX;
                        element.startY = event.touches[0].clientY;
                        element.addEventListener('touchmove', function (event) {
                            //alert(event.touches[0].clientX);
                            element.lastX = event.touches[0].clientX;
                            element.lastY = event.touches[0].clientY;

                        });
                    });
                    element.addEventListener(evt.mouseup, function (event) {
                        var target = event.target;
                        //alert(target.outerHTML);
                        //alert(target.startX + ' : ' + target.lastX + ' : ' + target.startY + ' : ' + target.lastY);
                        if (target.lastX && target.lastY &&
                            (parseInt(target.lastX, 10) > (parseInt(target.startX, 10) + 10) ||
                            parseInt(target.lastX, 10) < (parseInt(target.startX, 10) - 10) ||
                            parseInt(target.lastY, 10) > (parseInt(target.startY, 10) + 10) ||
                            parseInt(target.lastY, 10) < (parseInt(target.startY, 10) - 10))
                        ) {
                        } else {
                            focusFunction(event);
                        }

                        /*
                        //if event.target is the control
                        if (event.target.tagName === 'GS-TEXT') {
                            var element = event.target;
                            //alert(event.target.outerHTML);
                            //focus it
                            focusFunction(event);
                            //if we focused it prevent click event from happening
                            if (document.activeElement == element.control) {
                                event.stopImmediatePropagation();
                                event.stopPropagation();
                                event.preventDefault();
                            }
                            //else the click event happens trying again
                        }*/
                    });
                }
                // bind/handle query string
                if (element.getAttribute('qs')) {
                    createPushReplacePopHandler(element);
                    window.addEventListener('pushstate', function () {
                        createPushReplacePopHandler(element);
                    });
                    window.addEventListener('replacestate', function () {
                        createPushReplacePopHandler(element);
                    });
                    window.addEventListener('popstate', function () {
                        createPushReplacePopHandler(element);
                    });
                }
            }
            if (element.hasAttribute('id')) {
                findFor(element);
            }
        }
    }

    xtag.register('gs-dt', {
        lifecycle: {
            created: function () {
                elementCreated(this);
            },

            inserted: function () {
                elementInserted(this);
            },

            attributeChanged: function (strAttrName, oldValue, newValue) {
                var element = this;
                if (element.control) {
                    // if "suspend-created" has been removed: run created and inserted code
                    if (strAttrName === 'suspend-created' && newValue === null) {
                        elementCreated(element);
                        elementInserted(element);

                    // if "suspend-inserted" has been removed: run inserted code
                    } else if (strAttrName === 'suspend-inserted' && newValue === null) {
                        elementInserted(element);

                    } else if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
                        var currentValue;

                        if (strAttrName === 'disabled' || strAttrName === 'readonly') {
                        } else if (strAttrName === 'value' && element.initalized) {
                            currentValue = element.control.value;

                            // if there is a difference between the new value in the
                            //      attribute and the valued in the front end: refresh the front end
                            if (newValue !== currentValue) {
                                element.syncView();
                            }
                        }
                    }
                }
            }
        },
        events: {
            // on keydown and keyup sync the value attribute and the control value
            'keydown': function (event) {
                var element = this;
                if (!element.hasAttribute('readonly') && !element.hasAttribute('disabled')) {
                    element.syncGetters();
                }
            },
            'keyup': function () {
                var element = this;
                if (!element.hasAttribute('readonly') && !element.hasAttribute('disabled')) {
                    element.syncGetters();
                }
            }
        },
        accessors: {
            value: {
                // get value straight from the input
                get: function () {
                    if (this.control) {
                        return this.control.value
                    } else {
                        return this.getAttribute('value');
                    }
                },

                // set the value of the input and set the value attribute
                set: function (strNewValue) {
                    this.setAttribute('value', strNewValue);
                    this.syncView();
                }
            }
        },
        methods: {
            focus: function () {
                var element = this;
                element.bolSelect = false;
                //console.log('test');
                focusFunction({ target: element });
                //GS.triggerEvent(element, 'focus');
            },

            removeControl: function () {
                var element = this;
                if (element.control) {
                    element.setAttribute('tabindex', element.control.getAttribute('tabindex'));
                }
                if (element.control.value) {
                    element.internal.validDate = newDateInCurrentTimeZone(element.control.value).toString() !== 'Invalid Date';
                    if (element.internal.validDate) {
                        element.innerHTML = formatDateHTML(newDateInCurrentTimeZone(element.control.value), getFormatString(element));
                        if (element.arrowElem) {
                            element.arrowElem.parentNode.removeChild(element.arrowElem);
                        }
                    } else {
                        element.removeAttribute('value');
                    }
                    element.syncGetters();
                } else if (element.hasAttribute('placeholder')) {
                    element.innerHTML = '<span class="placeholder">' + element.getAttribute('placeholder') + '</span>';
                    if (element.arrowElem) {
                        element.arrowElem.parentNode.removeChild(element.arrowElem);
                    }
                } else {
                    element.innerHTML = '';
                    if (element.arrowElem) {
                        element.arrowElem.parentNode.removeChild(element.arrowElem);
                    }
                }
                element.control = false;
            },

            addControl: function () {
                var element = this;
                var arrPassThroughAttributes = [
                    'placeholder', 'name', 'maxlength', 'autocorrect',
                    'autocapitalize', 'autocomplete', 'autofocus', 'spellcheck',
                    'readonly', 'disabled'
                ];
                var i;
                var len;
                var elementValue = element.value || '';
                var elementWidth = element.offsetWidth;

                if (element.children.length > 0 && element.children[0].classList.contains('placeholder')) {
                    elementValue = '';
                }
                if (element.value) {
                    var d = newDateInCurrentTimeZone(element.value);
                    element.internal.validDate = d.toString() !== 'Invalid Date';
                    element.internal.lastValidDate = d;
                    element.internal.lastValidValue = formatDate(element.internal.lastValidDate, getFormatString(element));
                    elementValue = element.internal.lastValidValue;
                }

                /*
                // removed because it's confusing
                if (!elementValue) {
                    element.internal.validDate = true;
                    element.internal.lastValidDate = new Date();
                    element.internal.lastValidValue = formatDate(element.internal.lastValidDate, getFormatString(element));
                    elementValue = element.internal.lastValidValue;
                }*/

                // if the gs-dt element has a tabindex: save the tabindex and remove the attribute
                if (element.hasAttribute('tabindex')) {
                    element.savedTabIndex = element.getAttribute('tabindex');
                    element.removeAttribute('tabindex');
                }
                // add control input and save it to a variable for later use
                element.innerHTML = '';
                if (!(element.hasAttribute('disabled') || element.hasAttribute('readonly'))) {
                    element.innerHTML =
                        '<input class="control needsclick" gs-dynamic type="' + (element.getAttribute('type') || 'text') + '" />';// +
                    element.control = element.children[0];
                    
                    element.control.addEventListener(evt.click, controlClickFunction);
                    if (element.hasAttribute('id')) {
                        element.control.setAttribute('id', element.getAttribute('id') + '_control');
                    }
                    if (element.hasAttribute('aria-labelledby')) {
                        element.control.setAttribute('aria-labelledby', element.getAttribute('aria-labelledby'));
                    }
                    if (element.hasAttribute('title')) {
                        element.control.setAttribute('title', element.getAttribute('title'));
                    }

                    // esc resets the value (the same as the reset button) (see issue #142)
                    element.control.addEventListener('keydown', function (event) {
                        element.control.focus();

                        var intKeyCode = (event.keyCode || event.which);
                        if (intKeyCode === 27) {
                            element.internal.validDate = true;
                            GS.setInputSelection(element.control, 0, element.control.value.length);
                            insertText(elementValue);
                            GS.setInputSelection(element.control, 0, element.control.value.length);
                        }
                    });

                    if (element.hasAttribute('popup')) {
                        var arrowElem = document.createElement('div');
                        arrowElem.classList.add('dt-arrows');
                        arrowElem.setAttribute('gs-dynamic', '');
                        arrowElem.innerHTML = '<gs-button no-focus icononly icon="arrow-up" class="dt-arrow dt-arrow-up"></gs-button>' +
                            '<gs-button no-focus icononly icon="arrow-down" class="dt-arrow dt-arrow-down"></gs-button>' +
                            '<gs-button no-focus icononly icon="undo" class="dt-arrow dt-reset"></gs-button>';
                        var rect = element.getBoundingClientRect();
                        element.arrowElem = arrowElem;
                        arrowElem.style.top = (rect.height + rect.top) + 'px';
                        arrowElem.element = element;
                        document.body.appendChild(arrowElem);
                        arrowElem.style.left = parseInt(rect.width + rect.left - arrowElem.offsetWidth, 10) + 'px';
                        //console.log(arrowElem.offsetWidth, arrowElem.clientWidth);
                        // element.control = arrowElem;

                        var arrows = arrowElem;//= element.children[1];
                        arrows.addEventListener(evt.mousedown, function (event) {
                            event.stopPropagation();
                            event.preventDefault();
                        });
                        arrows.children[0].addEventListener(evt.mousedown, arrowMousedownFunction);
                        arrows.children[1].addEventListener(evt.mousedown, arrowMousedownFunction);
                        arrows.children[2].addEventListener(evt.mousedown, function (event) {
                            event.preventDefault();
                            element.control.focus();

                            element.internal.validDate = true;
                            GS.setInputSelection(element.control, 0, element.control.value.length);
                            insertText(elementValue);
                            GS.setInputSelection(element.control, 0, element.control.value.length);
                        });
                    }
                } else {
                    element.innerHTML =
                        '<input class="control" gs-dynamic type="' + (element.getAttribute('type') || 'text') + '" />';
                    element.control = element.children[0];
                    if (element.hasAttribute('id')) {
                        element.control.setAttribute('id', element.getAttribute('id') + '_control');
                    }
                    if (element.hasAttribute('aria-labelledby')) {
                        element.control.setAttribute('aria-labelledby', element.getAttribute('aria-labelledby'));
                    }
                    if (element.hasAttribute('title')) {
                        element.control.setAttribute('title', element.getAttribute('title'));
                    }
                }

                // bind event re-targeting functions
                element.control.removeEventListener('change', changeFunction);
                element.control.addEventListener('change', changeFunction);

                element.control.removeEventListener('blur', blurFunction);
                element.control.addEventListener('blur', blurFunction);

                element.removeEventListener(evt.mouseout, mouseoutFunction);
                element.addEventListener(evt.mouseout, mouseoutFunction);

                element.removeEventListener(evt.mouseout, mouseoverFunction);
                element.addEventListener(evt.mouseover, mouseoverFunction);
                // copy passthrough attributes to control
                i = 0;
                len = arrPassThroughAttributes.length;
                while (i < len) {
                    if (element.hasAttribute(arrPassThroughAttributes[i])) {
                        if (arrPassThroughAttributes[i] === 'disabled') {
                            element.control.setAttribute(
                                'readonly',
                                element.getAttribute(arrPassThroughAttributes[i]) || ''
                            );
                        } else {
                            element.control.setAttribute(
                                arrPassThroughAttributes[i],
                                element.getAttribute(arrPassThroughAttributes[i]) || ''
                            );
                        }
                    }
                    i += 1;
                }
                //console.log(elementValue);
                element.control.value = elementValue;
                GS.setInputSelection(element.control, 0, elementValue.length);
                element.value = elementValue;
                // if we saved a tabindex: apply the tabindex to the control
                if (element.savedTabIndex !== undefined && element.savedTabIndex !== null) {
                    element.control.setAttribute('tabindex', element.savedTabIndex);
                }
                //element.style.width = elementWidth - 7 + 'px';
                //console.log(element.style.width, elementWidth + 'px');
                element.syncView();
                element.control.focus();
                element.addEventListener('focus', focusFunction);

                if (!(element.hasAttribute('disabled') || element.hasAttribute('readonly'))) {
                    element.addEventListener('keydown', controlKeydownFunction);
                    element.addEventListener('keyup', controlKeyupFunction);
                    element.control.addEventListener('select', controlSelectFunction);
                    element.control.addEventListener('click', controlSelectFunction);
                    element.control.addEventListener(evt.mouseup, controlSelectFunction);
                }
            },

            syncView: function () {
                var element = this;
                if (element.control) {
                    element.control.value = element.getAttribute('value') || '';
                } else {
                    if (element.value) {
                        element.innerHTML = formatDateHTML(newDateInCurrentTimeZone(element.getAttribute('value')), getFormatString(element));
                    } else if (element.hasAttribute('placeholder')) {
                        element.innerHTML = '<span class="placeholder">' + element.getAttribute('placeholder') + '</span>';
                    }
                }
                element.initalized = true;
            },

            syncGetters: function () {
                if (this.control) {
                    this.setAttribute('value', this.control.value);
                }
            }
        }
    });
});