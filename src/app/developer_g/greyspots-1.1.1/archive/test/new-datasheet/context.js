//global GS, xtag, document, window, ml, evt, doT, Worker
//jslint browser:true, maxlen:80, white:false, this:true



// CODE INDEX:
//          (use "find" (CTRL-f or CMD-f) to skip to a section)
//          ("PRE-RENDER" refers to a section of functions that do not depend
//                  on the viewport being rendered AND dont use any render
//                  functions)
//          ("POST-RENDER" refers to a section of functions that either depend
//                  on the viewport being rendered OR use render functions)
//      # TOP  (this just brings you back this index)
//      # ELEMENT CONFIG
//      # PRE-RENDER UTILITY FUNCTIONS
//      # ELEMENT FUNCTIONS
//      # RENDER FUNCTIONS
//      # POST-RENDER UTILITY FUNCTIONS
//      # PASTE FUNCTIONS
//      # BUTTON FUNCTIONS
//      # EVENT FUNCTIONS
//          # WINDOW EVENTS
//          # HIGH LEVEL BINDING
//      # XTAG DEFINITION
//      # ELEMENT LIFECYCLE
//      # ELEMENT ACCESSORS
//      # ELEMENT METHODS

// for sections of code that need to be completed:
//      # NEED CODING


document.addEventListener('DOMContentLoaded', function () {
    'use strict';
// ############################################################################
// ############################## ELEMENT CONFIG ##############################
// ############################################################################


// #############################################################################
// ####################### PRE-RENDER UTILITY FUNCTIONS ########################
// #############################################################################


// #############################################################################
// ############################# ELEMENT FUNCTIONS #############################
// #############################################################################

    // this section deals with the generation of the gs-table's non-cell HTML

    // some attributes can't be used in their normal, dev-friendly format,
    //      this function translates those attributes to their final formats
    // some attributes need to be defaulted, even if they're not present
    function resolveElementAttributes(element) {
        // default null string attribute
        element.setAttribute(
            'null-string',
            (
                element.getAttribute('null-string') ||
                ''
            )
        );
    }

    // replace element HTML with the new HTML
    function prepareElement(element) {
        var rootElement;

        // the root is created as a variable so that we can append it to the
        //      gs-table without destrying the templates because the next step
        //      of this element's initalization is the "siphon" (where we
        //      extract the info out of the templates)
        rootElement = document.createElement('div');
        rootElement.classList.add('root');
        element.appendChild(rootElement);

        // create standard gs-contextmenu html
        rootElement.innerHTML =
                // we need a container to hold the content and scroll
                '<div class="scroll-container"></div>';

        // we want to easily/quickly be able to get elements without
        //      using selectors
        element.elems = {};

        element.elems.root = rootElement;
        element.elems.scrollContainer = rootElement.children[0];

        // we need a place to store our template, so we'll create an
        //      element.internalTemplates JSON object and store each
        //      template under a unique name
        element.internalTemplates = {
            "menu": ""
        };

        // we need a place to store our positioning preferences
        element.internalPositioning = {
            "directionPreferences": [],
            "positionMode": "center", // center, element, X/Y
            "referencePoint": ""
        };

        // we need a place to store our event functions
        element.internalEvents = {};
    }

    // get a gs-table's templates and translate them for future templating
    function siphonElement(element) {
        var menuTemplate;

        // get each template element and save them to each their own variable,
        //      for easy access
        menuTemplate = xtag.queryChildren(element, '[for="menu"]')[0];

        // if there's no "data-record" template: error
        if (!menuTemplate) {
            throw 'GS-TABLE Error: no "menu" template found. ' +
                    'The "menu" must be a immediate child in ' +
                    'order to be found.';
        }

        // store the template's content
        element.internalTemplates.menu = menuTemplate.innerHTML;
    }


// ############################################################################
// ############################# RENDER FUNCTIONS #############################
// ############################################################################

    function renderLocation(element) {
        element.style.left = '100px';
        element.style.top = '100px';
        element.style.width = '100px';
        element.style.height = '300px';
    }

    function renderContent(element) {
        element.elems.scrollContainer.innerHTML = (
            element.internalTemplates.menu
        );

        // after re-rendering the content, the menu may change size, so we need
        //      to re-locate the menu element
        renderLocation(element);
    }


// #############################################################################
// ####################### POST-RENDER UTILITY FUNCTIONS #######################
// #############################################################################


// #############################################################################
// ############################# BUTTON FUNCTIONS ##############################
// #############################################################################


// #############################################################################
// ############################## EVENT FUNCTIONS ##############################
// #############################################################################

    // ############# WINDOW EVENTS #############
    function unbindReposition(element) {
        window.removeEventListener(
            'resize',
            element.internalEvents.windowResize
        );
    }
    function bindReposition(element) {
        element.internalEvents.windowResize = function (event) {
            
        };

        window.addEventListener(
            'resize',
            element.internalEvents.windowResize
        );
    }

    // ############# HIGH LEVEL BINDING #############
    function unbindElement(element) {
        unbindReposition(element);
    }
    function bindElement(element) {
        bindReposition(element);
    }

// #############################################################################
// ############################## XTAG DEFINITION ##############################
// #############################################################################

    function elementInserted(element) {
        // if "created"/"inserted" are not suspended: run inserted code
        if (
            !element.hasAttribute('suspend-created') &&
            !element.hasAttribute('suspend-inserted')
        ) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;

                resolveElementAttributes(element);
                prepareElement(element);
                siphonElement(element);
                renderContent(element);
                bindElement(element);
            }
        }
    }

    xtag.register('gs-contextmenu', {

// #############################################################################
// ############################# ELEMENT LIFECYCLE #############################
// #############################################################################

        lifecycle: {
            'created': function () {},

            'inserted': function () {
                elementInserted(this);
            },

            'removed': function () {
                unbindElement(this);
            },

            'attributeChanged': function (strAttrName) {//, oldValue, newValue
                var element = this;

                // if suspend attribute: run inserted event
                if (
                    strAttrName === 'suspend-created' ||
                    strAttrName === 'suspend-inserted'
                ) {
                    elementInserted(element);

                // if the element is not suspended: handle attribute changes
                } else if (
                    !element.hasAttribute('suspend-created') &&
                    !element.hasAttribute('suspend-inserted')
                ) {
                    if (strAttrName === 'value' && element.root) {
                        element.refresh();
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
            "positionTo": function (referencePoint, preferredDirection) {
                var element = this;
                var strPositionMode;
                var arrDirection;

                // we want to be able to position to the any of these:
                //      current mouse position
                //      center of the screen
                //      specific X/Y
                //      attached to an element

                // if current mouse position
                if (referencePoint === 'mouse') {
                    strPositionMode = 'X/Y';

                // if center mode
                } else if (referencePoint === 'center') {
                    strPositionMode = 'center';
                    referencePoint = window;

                // if element
                } else if (referencePoint.nodeName !== undefined) {
                    strPositionMode = 'element';

                // if window
                } else if (referencePoint.location) {
                    strPositionMode = 'center';
                    referencePoint = window;

                // if position variable
                } else if (
                    referencePoint.X !== undefined &&
                    referencePoint.Y !== undefined
                ) {
                    strPositionMode = 'X/Y';

                // else, default to center
                } else {
                    strPositionMode = 'center';
                    referencePoint = window;
                }

                // some position modes are not availible on touch devices
                if (evt.touchDevice) {
                    // if not to element and not to center
                    if (
                        strPositionMode !== 'element' &&
                        strPositionMode !== 'center'
                    ) {
                        strPositionMode = 'center';
                        referencePoint = window;
                    }
                }

                // store the position mode for the renderer
                element.internalPositioning.positionMode = strPositionMode;

                // based on the position mode, we need to send a reference point
                if (strPositionMode === 'center') {
                    element.internalPositioning.referencePoint = window;

                } else if (strPositionMode === 'element') {
                    element.internalPositioning.referencePoint = referencePoint;

                } else if (strPositionMode === 'X/Y') {
                    element.internalPositioning.referencePoint = referencePoint;
                }

                // we have four directions the menu can go, the preferred
                //      direction will result in a chain of directions to try
                //      for the position
                if (strPositionMode === 'center') {
                    arrDirection = ['center'];

                } else if (preferredDirection === 'up') {
                    arrDirection = ['up', 'down', 'right', 'left', 'center'];

                } else if (preferredDirection === 'down') {
                    arrDirection = ['down', 'up', 'right', 'left', 'center'];

                } else if (preferredDirection === 'left') {
                    arrDirection = ['left', 'right', 'down', 'up', 'center'];

                } else if (preferredDirection === 'right') {
                    arrDirection = ['right', 'left', 'down', 'up', 'center'];

                } else if (strPositionMode === element) {
                    arrDirection = ['down', 'up', 'right', 'left', 'center'];

                } else {
                    arrDirection = ['center'];
                }

                element.internalPositioning.directionPreferences = arrDirection;

                // re-render the location of the menu
                renderLocation(element);
            }
        }

    });
});
