//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps
//global addAttributeSwitcherProp
//jslint browser:true, white:false, this:true
//not yet: maxlen:80

//begintooltipjs
window.addEventListener('design-register-element', function () {
    "use strict";
    addSnippet(
        '<gs-tooltip>',
        '<gs-tooltip>',
        'gs-tooltip column="${1:name}"></gs-tooltip>'
    );

    /*
    TODO: there is no documentation
    designRegisterElement('gs-tooltip', '#tooltip');
    */

    window.designElementProperty_GSTOOLTIP = function () {
        addText('V', 'Tip', 'tip');
        addAttributeSwitcherProp('V', 'Position', [
            {"val": "", "txt": "Default"},
            {"val": "left", "txt": "Left"},
            {"val": "right", "txt": "Right"},
            {"val": "top", "txt": "Top"},
            {"val": "bottom", "txt": "Bottom"}
        ]);
        addFlexContainerProps();
        addFlexProps();
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';


    function tooltipPos(forElement, tooltipElement, hidden) {
        var styleSheet;

        if (!document.getElementById('tooltip_cascading_style_sheet_with_a_long_id_that_will_never_be_used_in_the_wild')) {
            styleSheet = document.createElement('style');
            styleSheet.setAttribute('id', 'tooltip_cascading_style_sheet_with_a_long_id_that_will_never_be_used_in_the_wild');
            document.getElementsByTagName('head')[0].appendChild(styleSheet);
        } else {
            styleSheet = document.getElementById('tooltip_cascading_style_sheet_with_a_long_id_that_will_never_be_used_in_the_wild');
        }
        styleSheet.innerHTML = '';
        var jsnPositionData = GS.getElementPositionData(forElement);
        var arrTests;
        var strResolvedDirection;
        var element = tooltipElement.control;
        var pageWidth = document.body.getBoundingClientRect().width;
        element.classList.add('firsthover');

        // order of tests depending on direction
        if (element.hasAttribute('top')) {
            arrTests = ['top', 'bottom', 'left', 'right'];
        } else if (element.hasAttribute('bottom')) {
            arrTests = ['bottom', 'top', 'left', 'right'];
        } else if (element.hasAttribute('left')) {
            arrTests = ['left', 'right', 'bottom', 'top'];
        } else {// right
            arrTests = ['right', 'left', 'bottom', 'top'];
        }

        //check if there's room in each direction
        var i = 0;
        var len = arrTests.length;
        while (i < len) {
            //there is 10px of space in between the elements including the triangle
            if (
                (arrTests[i] === 'top' && (element.offsetHeight + 10) <= jsnPositionData.intRoomAbove) ||
                (arrTests[i] === 'bottom' && (element.offsetHeight + 10) <= jsnPositionData.intRoomBelow) ||
                (arrTests[i] === 'left' && (element.offsetWidth + 10) <= jsnPositionData.intRoomLeft) ||
                (arrTests[i] === 'right' && (element.offsetWidth + 10) <= jsnPositionData.intRoomRight)
            ) {
                strResolvedDirection = arrTests[i];
                break;
            }
            i += 1;
        }
        //we always default to right, this way you can scroll to the right on a phone
        //    you can't scroll to the left if it overflows
        if (!strResolvedDirection) {
            strResolvedDirection = 'right';
        }
        //we save the original attribute so as not to change the testing order
        //    all uses of the "left" etc. atttributes use the styleas attribute
        element.setAttribute('styleas', strResolvedDirection);
        //zero these out since we rely on it later
        element.style.left = 0;
        element.style.top = 0;
        element.style.maxWidth = '250px';

        //if the element is in a different place then the tooltip we need to use the getBoundingClientRect left/top to position the tootip


        if (strResolvedDirection === 'left') {
            element.style.left = ((forElement.getBoundingClientRect().left - element.getBoundingClientRect().left) - parseInt(element.offsetWidth, 10)) - 10 + 'px';
            element.style.top = forElement.getBoundingClientRect().top - element.getBoundingClientRect().top + 'px';


        } else if (strResolvedDirection === 'top') {
            element.style.left = (((forElement.getBoundingClientRect().width / 2) - (element.getBoundingClientRect().width / 2)) + (forElement.getBoundingClientRect().left - element.getBoundingClientRect().left)) + 'px';
            if ((element.getBoundingClientRect().left + element.offsetWidth) > pageWidth && (element.offsetWidth < pageWidth)) {
                styleSheet.innerHTML = '.tooltiptext::after { left: calc(50% + ' + (element.getBoundingClientRect().left - (pageWidth - element.offsetWidth)) + 'px) !important; }';
                element.style.left = (parseFloat(element.style.left, 10) - (element.getBoundingClientRect().left - (pageWidth - element.offsetWidth))) + 'px';
            }
            element.style.top = forElement.getBoundingClientRect().top - (element.getBoundingClientRect().top + element.offsetHeight + forElement.offsetHeight) + 10 + 'px';


        } else if (strResolvedDirection === 'bottom') {
            element.style.top = (forElement.offsetHeight) + 10 + forElement.getBoundingClientRect().top - element.getBoundingClientRect().top + 'px';
            element.style.left = (((forElement.getBoundingClientRect().width / 2) - (element.getBoundingClientRect().width / 2)) + (forElement.getBoundingClientRect().left - element.getBoundingClientRect().left)) + 'px';
            if ((element.getBoundingClientRect().left + element.offsetWidth) > pageWidth && (element.offsetWidth < pageWidth)) {
                styleSheet.innerHTML = '.tooltiptext::after { left: calc(50% + ' + (element.getBoundingClientRect().left - (pageWidth - element.offsetWidth)) + 'px) !important; }';
                element.style.left = (parseFloat(element.style.left, 10) - (element.getBoundingClientRect().left - (pageWidth - element.offsetWidth))) + 'px';
            }

        } else {// right
            element.style.left = (forElement.getBoundingClientRect().left + parseInt(forElement.offsetWidth, 10) + 10) - element.getBoundingClientRect().left + 'px';
            element.style.top = forElement.getBoundingClientRect().top - element.getBoundingClientRect().top + 'px';
        }
        //make element visible
        if (!hidden) {
            element.classList.add('hover');
        } else {
            element.classList.remove('firsthover');
        }
    }

    function toolTipBodyClickEvent(element) {
        //hover makes the element visible
        element.control.classList.remove('firsthover');
        element.control.classList.remove('hover');
    }

    function toolTipClickEvent(forElement, tooltipElement) {
        //prevent event bubbling to body
        event.preventDefault();
        event.stopPropagation();
        //remove all open tooltips
        if (xtag.query(document.body, '.tooltiptext.hover').length > 0) {
            var i = 0;
            var len = xtag.query(document.body, '.tooltiptext.hover').length;
            while (i < len) {
                xtag.query(document.body, '.tooltiptext.hover')[i].classList.remove('firsthover');
                xtag.query(document.body, '.tooltiptext.hover')[i].classList.remove('hover');
                i += 1;
            }
        }
        //position tooltips
        tooltipPos(forElement, tooltipElement);
        tooltipElement.toolTipBodyClickEvent = function () {
            toolTipBodyClickEvent(tooltipElement);
        };
        document.body.addEventListener('click', tooltipElement.toolTipBodyClickEvent);
    }

    function toolTipMouseOverEvent(forElement, tooltipElement) {
        //setting the position of the element
        tooltipPos(forElement, tooltipElement);
    }

    function toolTipMouseOutEvent(ignore, tooltipElement) { //forElement
        tooltipElement.control.classList.remove('firsthover');
        tooltipElement.control.classList.remove('hover');
    }

    function toolTipResizeEvent(forElement, tooltipElement) {
        //nothing should happen if it's not open
        var bolRun = (tooltipElement.control.classList.contains('hover'));

        if (bolRun) {
            tooltipPos(forElement, tooltipElement);
        } else {
            // tooltipPos(forElement, tooltipElement, true);
        }
    }

    function initTooltip(forElement, tooltipElement) {
        // tooltipPos(forElement, tooltipElement, true);
        //we use element.function so we can pass the vars without doing it anon, this way we can removeEventListener later
        tooltipElement.toolTipResizeEvent = function () {
            toolTipResizeEvent(forElement, tooltipElement);
        };
        tooltipElement.toolTipMouseOverEvent = function () {
            toolTipMouseOverEvent(forElement, tooltipElement);
        };
        tooltipElement.toolTipMouseOutEvent = function () {
            toolTipMouseOutEvent(forElement, tooltipElement);
        };
        tooltipElement.toolTipClickEvent = function () {
            toolTipClickEvent(forElement, tooltipElement);
        };
        window.addEventListener('resize', tooltipElement.toolTipResizeEvent);
        forElement.addEventListener('mouseover', tooltipElement.toolTipMouseOverEvent);
        forElement.addEventListener('mouseout', tooltipElement.toolTipMouseOutEvent);
        forElement.addEventListener('click', tooltipElement.toolTipClickEvent);
    }

    function deInitTooltip(forElement, tooltipElement) {
        //in case the for changes we need to be able to reset the element it's targeting
        window.removeEventListener('resize', tooltipElement.toolTipResizeEvent);
        forElement.removeEventListener('mouseover', tooltipElement.toolTipMouseOverEvent);
        forElement.removeEventListener('mouseout', tooltipElement.toolTipMouseOutEvent);
        forElement.removeEventListener('click', tooltipElement.toolTipClickEvent);
        document.body.removeEventListener('click', tooltipElement.toolTipBodyClickEvent);
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

    function getForElement(element, callback) {
        var forElement;
        if (element.hasAttribute('for')) {//if for attribute, use that
            forElement = document.getElementById(element.getAttribute('for'));
        } else if (element.hasAttribute('tip') && element.children.length > 1) {//if tip attribute, use second element if there (we already added span)
            forElement = element.children[1];
        } else {//get next element
            if (element.nextElementSibling && element.nextElementSibling.tagName.toUpperCase() !== 'gs-tooltip') {
                forElement = element.nextElementSibling;
            }
        }
        if (forElement) {
            element.forElement = forElement;
            callback(forElement, element);
        } else {
            element.forElement = false;
            console.warn('"gs-tooltip" Not attached to element.');
        }
    }

    function elementInserted(element) {
        var newFirstElement;
        var newFirstElementCont;

        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;
                element.internal = {};
                saveDefaultAttributes(element);

                element.refresh();
                //set innerHTML of newFirstElement
                if (element.hasAttribute('tip')) {//if there is tip attribute we use that
                    newFirstElement = document.createElement('span');
                    newFirstElement.innerHTML = element.getAttribute('tip');
                } else {//else use the element innerHTML
                    newFirstElement = document.createElement('span');
                    newFirstElement.innerHTML = element.innerHTML;
                }

                //shared code: copying over attributes to newFirstElement
                if (element.hasAttribute('left')) {
                    newFirstElement.setAttribute('left', '');
                } else if (element.hasAttribute('top')) {
                    newFirstElement.setAttribute('top', '');
                } else if (element.hasAttribute('bottom')) {
                    newFirstElement.setAttribute('bottom', '');
                } else {//right
                    newFirstElement.setAttribute('right', '');
                }

                //add newFirstElement to element
                if (element.hasAttribute('tip')) {//if there is tip attribute we have to add container for positioning
                    newFirstElementCont = document.createElement('div');
                    newFirstElementCont.classList.add('tooltipcont');
                    newFirstElementCont.appendChild(newFirstElement);
                    element.insertBefore(newFirstElementCont, element.firstChild);
                    element.control = element.children[0].children[0];
                } else {//else we empty and add
                    element.innerHTML = '';
                    element.appendChild(newFirstElement);
                    element.control = element.children[0];
                }

                element.control.classList.add('tooltiptext');
                //get forElement
                //initalize tooltips
                getForElement(element, initTooltip);
            }
        }
    }

    xtag.register('gs-tooltip', {
        lifecycle: {
            inserted: function () {
                elementInserted(this);
            },

            attributeChanged: function (strAttrName, ignore, newValue) {//oldValue
                // if "suspend-created" has been removed: run created and inserted code
                if (strAttrName === 'suspend-created' && newValue === null) {
                    elementInserted(this);

                // if "suspend-inserted" has been removed: run inserted code
                } else if (strAttrName === 'suspend-inserted' && newValue === null) {
                    elementInserted(this);
                } else if (!this.hasAttribute('suspend-created') && !this.hasAttribute('suspend-inserted')) {
                    this.refresh();
                }
                //if you change the for then it wont work
                if (strAttrName === 'for') {
                    //the element might not have found a forElement, if it hasn't we don't want to deinit
                    if (this.forElement) {
                        //de-initalize so that it doesn't open for both forElements
                        deInitTooltip(this.forElement, this);
                        //reinit
                        getForElement(this, initTooltip);
                    } else {
                        //init
                        getForElement(this, initTooltip);
                    }
                }
            }
        },
        events: {},
        accessors: {},
        methods: {
            refresh: function () {
                //also reset the for? not adding this right now.


                //reset attribute in case it changed
                if (this.control) {
                    this.control.removeAttribute('left');
                    this.control.removeAttribute('top');
                    this.control.removeAttribute('bottom');
                    this.control.removeAttribute('right');

                    if (this.hasAttribute('left')) {
                        this.control.setAttribute('left', '');
                    } else if (this.hasAttribute('top')) {
                        this.control.setAttribute('top', '');
                    } else if (this.hasAttribute('bottom')) {
                        this.control.setAttribute('bottom', '');
                    } else {//right
                        this.control.setAttribute('right', '');
                    }
                }
            }
        }
    });
});
//endtooltipjs