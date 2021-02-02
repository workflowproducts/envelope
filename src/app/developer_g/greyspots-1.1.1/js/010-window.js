//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps
//jslint browser:true, maxlen:80, white:false, this:true

// # CODE INDEX:          <- (use "find" (CTRL-f or CMD-f) to skip to a section)
//      # TOP             <- (this just brings you back this index)
//      # ELEMENT DOCUMENTATION
//      # NOTES/IDEAS
//      # SNIPPET/DESIGN
//      # UTILITY FUNCTIONS
//      # ELEMENT FUNCTIONS
//      # RENDER FUNCTIONS
//      # EVENT FUNCTIONS
//          # WINDOW EVENTS
//          # RESIZE EVENTS
//          # DEVELOPER EVENTS
//          # HIGH LEVEL BINDING
//      # XTAG DEFINITION
//      # ELEMENT LIFECYCLE
//      # ELEMENT ACCESSORS
//      # ELEMENT METHODS
//      # PANE DECLARATION
//
// For code that needs to be completed:
//      # NEED CODING



// ############################################################################
// ########################## ELEMENT DOCUMENTATION ###########################
// ############################################################################


// ############################################################################
// ############################### NOTES/IDEAS ################################
// ############################################################################


// ############################################################################
// ############################## SNIPPET/DESIGN ##############################
// ############################################################################


document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    var defaultColWidth = 50;

// ############################################################################
// ############################ UTILITY FUNCTIONS #############################
// ############################################################################

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

    // we need a function that can take PX/EM units and convert them to numeric
    //      pixels. this is because we run off of pixels.
    function unitToPX(element, strUnit) {
        // if we need to convert em to px
        if (strUnit.toLowerCase().indexOf('em') > -1) {
            return GS.emToPx(element, strUnit);
        }

        return parseInt(strUnit, 10);
    }


// #############################################################################
// ############################# ELEMENT FUNCTIONS #############################
// #############################################################################

    // create internal structures and inner elements that persist through the
    //      whole lifetime of the element
    function prepareElement(element) {
        // we need a place to store elements so that we don't keep destroying
        //      and recreating elements
        element.elems = {};

        // we need a place to store event functions because, to unbind a
        //      specific event javascript requires that you have the
        //      original function that was bound to that event
        element.internalEvents = {};

        // this is where we store the variables pertaining to drag and drop
        //      resize of columns.
        element.internalResize = {
            "currentlyResizing": false
        };

        // resizing needs a one pixel line to show the users where they're
        //     going to stop resizing if they let the mouse go
        element.elems.resizeHelper = document.createElement('div');
        element.elems.resizeHelper.classList.add('pane-resize-helper');
    }

// #############################################################################
// ############################# RENDER FUNCTIONS ##############################
// #############################################################################

    // recalculate and reset column widths
    function render(element) {
        var i;
        var len;
        var intWidthPool;
        var arrPanes = element.panes;
        var intTotalWidth;
        var intLeft;
        var lastVisible;
        var pane;

        // we need to gather the developer's width settings
        i = 0;
        len = arrPanes.length;
        while (i < len) {
            pane = arrPanes[i];

            if (!pane.internalDisplay) {
                pane.internalDisplay = {
                    "setActColWidths": null,
                    "setMinColWidths": null,
                    "setMaxColWidths": null,
                    "ratioWidths": null,
                    "colWidths": null,
                    "colRatios": null
                };

                // we want to retain the developer's declared width settings
                pane.internalDisplay.setActColWidths = (
                    unitToPX(element, pane.style.width)
                );
                pane.internalDisplay.setMinColWidths = (
                    unitToPX(element, pane.style.minWidth)
                );
                pane.internalDisplay.setMaxColWidths = (
                    unitToPX(element, pane.style.maxWidth)
                );

                // we don't want the css settings to mess with us down the line.
                //      now that we have them saved, we need to clear them.
                pane.style.width = '';
                pane.style.minWidth = '';
                pane.style.maxWidth = '';
            }

            i += 1;
        }

        // the way the auto resizing works is that columns with a
        //      "width" style set get a static width, the items with a
        //      min-width get a ratio. The static items get their
        //      amount of the width "pool". After the static items get
        //      their fill, the ratioed items get the rest of the width
        //      in their proportion.

        // ultimately, we're going to try to fit the columns into
        //      the viewport
        intWidthPool = (element.clientWidth);

        // let's gather the most up-to-date info on the columns
        intTotalWidth = 0;
        i = 0;
        len = arrPanes.length;
        while (i < len) {
            pane = arrPanes[i];

            // "ratioWidths" is used not only to determine the proportions of
            //      the columns, but if it's filled for a particular column,
            //      that means that it's a stretchy column and that it's
            //      visible.
            pane.internalDisplay.ratioWidths = null;

            // clear all other state variables we calculate in this render
            //      function
            pane.internalDisplay.colRatios = null;
            pane.internalDisplay.colWidths = null;

            // we only need to look at non-hidden columns
            if (!arrPanes[i].hasAttribute('hidden')) {
                // if this column has a set width, remove it's width from the
                //      available pool and don't set it's "ratioWidths"
                if (pane.internalDisplay.setActColWidths) {
                    intWidthPool -= pane.internalDisplay.setActColWidths;

                // get this column's width so that we can calculate it's
                //      stretched width
                } else {
                    pane.internalDisplay.ratioWidths = (
                        pane.internalDisplay.setMinColWidths ||
                        defaultColWidth
                    );

                    // in order to calculate the ratios, we need to know the
                    //      combined width of the stretchy column min-widths
                    intTotalWidth += (
                        pane.internalDisplay.ratioWidths
                    );
                }
            }
            i += 1;
        }

        // calculate column widths
        intLeft = 0;
        i = 0;
        len = arrPanes.length;
        while (i < len) {
            pane = arrPanes[i];

            // if this column is stretchy
            if (pane.internalDisplay.ratioWidths) {
                // we need to know how big the stretchable columns are in
                //      relation to each other so that we can stretch them in
                //      proportion
                pane.internalDisplay.colRatios = (
                    (
                        (pane.internalDisplay.ratioWidths) /
                        intTotalWidth
                    ) * 100
                );

                // now that we have the ratio calculated, let's apply it and
                //      determine the final width
                pane.internalDisplay.colWidths = (
                    // don't get smaller than min column width
                    Math.max(
                        intWidthPool / (
                            100 / pane.internalDisplay.colRatios
                        ),
                        (pane.internalDisplay.setMinColWidths || 0)
                    )
                );

            // else, this column is static
            } else {
                pane.internalDisplay.colWidths = (
                    pane.internalDisplay.setActColWidths
                );
            }

            // clear pane state
            pane.classList.remove('last');
            pane.style.width = '';
            pane.style.left = '';

            // we only want to apply width/left to visible panes
            if (!pane.hasAttribute('hidden')) {
                // set left/width according to the latest calculations
                pane.style.width = (pane.internalDisplay.colWidths + 'px');
                pane.style.left = (intLeft + 'px');

                // increment the current left position
                intLeft += pane.internalDisplay.colWidths;

                // we want to reference the last visible pane after this loop
                lastVisible = pane;
            }

            i += 1;
        }

        // we always want to strip the right-side border off of the last
        //      visible pane
        lastVisible.classList.add('last');
    }


// #############################################################################
// ############################## EVENT FUNCTIONS ##############################
// #############################################################################

    // ############# WINDOW EVENTS #############
    function unbindWindow(element) {
        element.removeEventListener(
            'resize',
            element.internalEvents.windowResize
        );
    }
    function bindWindow(element) {
        element.internalEvents.windowResize = function () {
            render(element);
        };

        window.addEventListener(
            'resize',
            element.internalEvents.windowResize
        );
    }

    // ############# RESIZE EVENTS #############
    function unbindResize(element) {
        element.removeEventListener(
            'mousemove',
            element.internalEvents.resizeHandleHover
        );
        element.removeEventListener(
            evt.mousedown,
            element.internalEvents.resizeDragStart
        );
        document.body.removeEventListener(
            evt.mousemove,
            element.internalEvents.resizeDragMove
        );
        document.body.removeEventListener(
            evt.mouseup,
            element.internalEvents.resizeDragEnd
        );
    }
    function bindResize(element) {
        element.internalEvents.resizeHandleHover = function (event) {
            var jsnElementPos;
            var jsnMousePos;
            var intMouseX;
            var i;
            var len;
            var intLeft;
            var arrPanes;
            var pane;
            var resizePane;

            // no need to check if we're at a border if we're already resizing.
            if (element.internalResize.currentlyResizing !== true) {
                // we want the mouse position and the position of the element
                //      itself
                jsnElementPos = GS.getElementOffset(element);
                jsnMousePos = GS.mousePosition(event);

                // we need the mouse Y to be relative to the element
                intMouseX = (jsnMousePos.left - jsnElementPos.left);

                // loop through each visible pane and see if the mouse is within
                //      2px of a column border
                arrPanes = element.panes;
                intLeft = 0;
                i = 0;
                len = arrPanes.length;
                while (i < len) {
                    pane = arrPanes[i];

                    if (
                        !pane.hasAttribute('hidden') &&
                        !pane.classList.contains('last')
                    ) {
                        // we don't care about the left side of the first pane,
                        //      so the each loop checks the right side of the
                        //      pane.
                        intLeft += pane.clientWidth;

                        // if mouse is within a pixel of the border, that's the
                        //      one we want to resize, break out
                        if (
                            intMouseX >= (intLeft - 1) &&
                            intMouseX <= (intLeft + 1)
                        ) {
                            resizePane = pane;
                            break;
                        }
                    }

                    // if we've passed the mouse position, just break out of
                    //      loop. no sense in extra cycles
                    if (intLeft > intMouseX) {
                        break;
                    }

                    i += 1;
                }

                if (resizePane) {
                    element.classList.add('horizontal-resize-cursor');
                    element.internalResize.resizePane = resizePane;
                } else {
                    element.classList.remove('horizontal-resize-cursor');
                }
            }
        };

        element.addEventListener(
            'mousemove',
            element.internalEvents.resizeHandleHover
        );

        element.internalEvents.resizeDragEnd = function () {
            // we need to let everything know that we are no longer
            //      resizing cells
            element.internalResize.currentlyResizing = false;

            // remove cursor
            element.classList.remove('horizontal-resize-cursor');

            // remove helper
            element.removeChild(element.elems.resizeHelper);

            // unbind mousemove and mouseup
            document.body.removeEventListener(
                evt.mousemove,
                element.internalEvents.resizeDragMove
            );
            document.body.removeEventListener(
                evt.mouseup,
                element.internalEvents.resizeDragEnd
            );
        };

        element.internalEvents.resizeDragMove = function (event) {
            var jsnElementPos;
            var jsnMousePos;
            var intMouseLeft;
            var intPaneLeft;
            var intNewWidth;
            var intOldWidth;
            var resizePane;
            var difference;
            var i;
            var len;
            var arrPanes;
            var pane;
            var intStretchyPanes;

            // if the mouse moves off of the screen and then is moused up,
            //      we wont know it. so, if the mouse is up (and we're not
            //      on a touch device): preventDefault, stopPropagation and
            //      end the drag session
            if (event.which === 0 && !evt.touchDevice) {
                event.preventDefault();
                event.stopPropagation();
                element.internalEvents.resizeDragEnd();

            // we're still activly resize, update resize helper
            } else {
                // we want the mouse position and the position of the element
                //      itself
                jsnElementPos = GS.getElementOffset(element);
                jsnMousePos = GS.mousePosition(event);

                // we need the mouse Y to be relative to the element
                intMouseLeft = (jsnMousePos.left - jsnElementPos.left);

                // reposition helper line
                element.elems.resizeHelper.style.left = intMouseLeft + 'px';

                // resize pane in question
                resizePane = element.internalResize.resizePane;
                intPaneLeft = parseInt(resizePane.style.left, 10) || 0;
                intNewWidth = (intMouseLeft - intPaneLeft);

                // if static column, basic resize
                if (resizePane.internalDisplay.setActColWidths) {
                    resizePane.internalDisplay.setActColWidths = intNewWidth;

                // if stretchy column, resize so that the line will be where
                //      the user dropped it, despite the fact that the other
                //      stretchy columns will need to resize.
                } else {
                    intOldWidth = resizePane.internalDisplay.colWidths;
                    difference = (intNewWidth / intOldWidth);

                    // split difference between all stretchy columns to left,
                    //      if you don't do this, it acts wierd
                    arrPanes = element.panes;
                    intStretchyPanes = 0;
                    i = 0;
                    len = arrPanes.length;
                    while (i < len) {
                        pane = arrPanes[i];

                        if (!pane.internalDisplay.setActColWidths) {
                            intStretchyPanes += 1;
                        }
                        if (pane === resizePane) {
                            break;
                        }
                        i += 1;
                    }

                    // if we're dealing with more than one stretchy column, we
                    //      must distrute the difference SOIUZ NERUSHIMYJ
                    if (intStretchyPanes > 1) {
                        difference = (
                            difference + ((1 - difference) / intStretchyPanes)
                        );
                    }

                    // apply difference
                    i = 0;
                    len = arrPanes.length;
                    while (i < len) {
                        pane = arrPanes[i];

                        if (!pane.internalDisplay.setActColWidths) {
                            pane.internalDisplay.setMinColWidths = (
                                pane.internalDisplay.setMinColWidths *
                                (difference)
                            );
                        }
                        if (pane === resizePane) {
                            break;
                        }
                        i += 1;
                    }
                }

                // cause re-render
                render(element);
            }
        };

        element.internalEvents.resizeDragStart = function (event) {
            if (element.classList.contains('horizontal-resize-cursor')) {
                // we want to prevent text selection
                event.preventDefault();
                event.stopPropagation();

                // we need to let everything know that we are resizing cells,
                //      this is used to prevent cell selection during cell
                //      resize
                element.internalResize.currentlyResizing = true;

                // users need feedback for drag and drop. We're opting for
                //      showing a line
                element.appendChild(element.elems.resizeHelper);

                // update position of resize helper
                element.internalEvents.resizeDragMove(event);

                // we need to bind the mousemove and mouseup functionality to
                //      the body so that we can still use the mouse events even
                //      if the mouse is no longer over the gs-table
                document.body.addEventListener(
                    evt.mousemove,
                    element.internalEvents.resizeDragMove
                );
                document.body.addEventListener(
                    evt.mouseup,
                    element.internalEvents.resizeDragEnd
                );
            }
        };
        element.addEventListener(
            evt.mousedown,
            element.internalEvents.resizeDragStart
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
        unbindWindow(element);
        unbindResize(element);
        unbindDeveloper(element);
    }
    function bindElement(element) {
        bindWindow(element);
        bindResize(element);
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

            prepareElement(element);
            bindElement(element);
            render(element);
        }
    }

    xtag.register('gs-window', {

// #############################################################################
// ############################# ELEMENT LIFECYCLE #############################
// #############################################################################

        lifecycle: {
            'inserted': function () {
                elementInserted(this);
            },

            // we want to make sure we don't leave any loose ends
            'removed': function () {
                unbindElement(this);
            },

            'attributeChanged': function (attr) {//, oldValue, newValue
                console.log('test');
                if (attr === 'suspend-created' || attr === 'suspend-inserted') {
                    elementInserted(this);
                }
            }
        },

// #############################################################################
// ############################# ELEMENT ACCESSORS #############################
// #############################################################################

        accessors: {
            'panes': {
                'get': function () {
                    return xtag.queryChildren(this, 'gs-pane');
                }
            }
        },

// #############################################################################
// ############################## ELEMENT METHODS ##############################
// #############################################################################

        methods: {
            // we want to be able to programatically show/hide panes
            'show': function (pane) {
                if (typeof pane === 'string') {
                    pane = xtag.queryChildren(this, pane)[0];
                }
                pane.removeAttribute('hidden');
                render(this);
            },

            // we want to be able to programatically show/hide panes
            'hide': function (pane) {
                if (typeof pane === 'string') {
                    pane = xtag.queryChildren(this, pane)[0];
                }
                pane.setAttribute('hidden', '');
                render(this);
            },

            // we want to be able to programatically show/hide panes
            'remove': function (pane) {
                if (typeof pane === 'string') {
                    pane = xtag.queryChildren(this, pane)[0];
                }
                this.removeChild(pane);
                render(this);
            },

            // we want to be able to programatically show/hide panes
            'add': function (pane) {
                if (typeof pane === 'string') {
                    pane = GS.stringToElement(pane);
                }
                this.appendChild(pane);
                render(this);
            },

            // we want to be able to programatically cause a re-render, this is
            //      useful in case the developer takes matters into their own
            //      hands and starts messing with panes directly
            'render': function () {
                render(this);
            }
        }
    });

// #############################################################################
// ############################## PANE DECLARATION #############################
// #############################################################################

    xtag.register('gs-pane', {
        lifecycle: {
            // if the developer changes the hidden state directly, notify the
            //      parent pane (if there is one)
            'attributeChanged': function (strAttrName) {
                // ### NEED CODING ### - doesn't seem to run
                console.log('sdf');
                if (strAttrName === 'hidden') {
                    if (this.parentNode.nodeName === 'GS-WINDOW') {
                        this.parentNode.render();
                    }
                }
            }
        },
        observedAttributes: ['hidden']
    });
});
