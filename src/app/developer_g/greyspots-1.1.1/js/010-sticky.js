//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps, shimmed
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    'use strict';

    addSnippet(
        '<gs-sticky>',
        '<gs-sticky>',
        (
            'gs-sticky>\n' +
            '    <gs-sticky-inner>\n' +
            '        ${0}\n' +
            '    </gs-sticky-inner>\n' +
            '</gs-sticky>'
        )
    );

    addElement('gs-sticky', '#layout_sticky_header_footer');

    window.designElementProperty_GSSTICKY = function () {
        addSelect('V', 'Direction', 'direction', [
            {"val": "", "txt": "Up"},
            {"val": "down", "txt": "Down"}
        ]);
        addCheck('O', 'Always Stuck', 'stuck');
        addCheck('O', 'Touch Devices Allowed', 'touch-device-allowed');
        addFlexContainerProps();
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    function stickHandler(element) {
        var bolTop = (element.getAttribute('direction') !== 'down'),
            intScrollPosition = document.body.scrollTop,
            jsnElementPositionData = GS.getElementPositionData(element),
            bolShouldBeStuck = (bolTop && jsnElementPositionData.intRoomAbove < 0) || (!bolTop && jsnElementPositionData.intRoomBelow < 0);
        
        if (bolShouldBeStuck && !element.hasAttribute('stuck')) {
            element.style.height = element.offsetHeight + 'px';
            element.setAttribute('stuck', '');
            
            //if (bolTop) {
            //    element.parentNode.style.paddingTop = element.offsetHeight + 'px';
            //} else {
            //    element.parentNode.style.paddingBottom = element.offsetHeight + 'px';
            //}
            
        } else if (!bolShouldBeStuck && element.hasAttribute('stuck')) {
            element.style.height = '';
            element.removeAttribute('stuck');
            //
            //if (bolTop) {
            //    element.parentNode.style.paddingTop = '';
            //} else {
            //    element.parentNode.style.paddingBottom = '';
            //}
        }
        
        //console.log(bolTop, intScrollPosition, jsnElementPositionData);
    }
    
    // dont do anything that modifies the element here
    function elementCreated(element) {
        // if "created" hasn't been suspended: run created code
        if (!element.hasAttribute('suspend-created')) {
            if (!element.hasAttribute('role') && !GS.findParentTag(element, 'gs-dialog')) {
                if (element.getAttribute('direction') === 'down') {
                    element.setAttribute('role', 'contentinfo');
                } else {
                    element.setAttribute('role', 'banner');
                }
            }
        }
    }
    
    //
    function elementInserted(element) {
        var currentParent;
        
        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;
                
                if (element.children.length > 1) {
                    throw 'gs-sticky Error: Too many children. gs-sticky elements must have one child and it must be a <gs-sticky-inner> element.';
                    
                } else if (element.children.length === 0) {
                    throw 'gs-sticky Error: No children. gs-sticky elements must have one child and it must be a <gs-sticky-inner> element.';
                    
                } else if (element.children[0].nodeName !== 'GS-STICKY-INNER') {
                    throw 'gs-sticky Error: Invalid child. gs-sticky elements must have one child and it must be a <gs-sticky-inner> element.';
                }
                
                element.parentNode.style.height = 'auto';
                
                if (element.hasAttribute('stuck')) {
                    //console.log(element.children[0].offsetHeight, element.getAttribute('direction'));
                    if (element.getAttribute('direction') !== 'down') {
                        element.parentNode.style.paddingTop = element.children[0].offsetHeight + 'px';
                    } else {
                        element.parentNode.style.paddingBottom = element.children[0].offsetHeight + 'px';
                    }
                }
                
                if (!element.hasAttribute('stuck') && (!evt.touchDevice || element.hasAttribute('touch-device-allowed'))) {
                    stickHandler(element);
                    currentParent = element.parentNode;
                    if (currentParent.nodeName !== 'BODY') {
                        console.warn('gs-sticky Warning: Element not immediate child of BODY. This element was designed for being an immediate child of the BODY, doing otherwise may give unexpected results.');
                    }
                    
                    window.addEventListener('resize', function () {
                        if (element.parentNode === currentParent) {
                            stickHandler(element);
                        }
                    });
                    
                    window.addEventListener('scroll', function () {
                        if (element.parentNode === currentParent) {
                            stickHandler(element);
                        }
                    });
                    
                    window.addEventListener('orientationchange', function () {
                        if (element.parentNode === currentParent) {
                            stickHandler(element);
                        }
                    });
                }
            }
        }
    }
    
    xtag.register('gs-sticky-inner', {});
    xtag.register('gs-sticky', {
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
        accessors: {},
        methods: {}
    });
});