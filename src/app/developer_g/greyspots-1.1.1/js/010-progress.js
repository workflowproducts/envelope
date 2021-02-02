//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps
//jslint browser:true, white:false, this:true
//, maxlen:80

window.addEventListener('design-register-element', function () {
    "use strict";

    addSnippet('<gs-progress>', '<gs-progress>', 'gs-progress></gs-progress>');

    /*
    TODO: there is no documentation
    designRegisterElement('gs-progress', '');
    */

    window.designElementProperty_GSPROGRESS = function () {
        addText('D', 'Value', 'value');
        addFlexProps();
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    
    // dont do anything that modifies the element here
    function elementCreated(element) {
        // if "created" hasn't been suspended: run created code
        if (!element.hasAttribute('suspend-created')) {
            var observer;
            var headerElement = xtag.queryChildren(element, 'gs-header')[0];
            var footerElement = xtag.queryChildren(element, 'gs-footer')[0];

            // create an observer instance
            observer = new MutationObserver(function(mutations) {
                element.recalculatePadding();
            });

            // pass in the element node, as well as the observer options
            if (headerElement) {
                observer.observe(headerElement, {childList: true, subtree: true});
            }
            if (footerElement) {
                observer.observe(footerElement, {childList: true, subtree: true});
            }
        }
    }

    //
    function elementInserted(element) {
        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;
                
                element.control = document.createElement('div');
                element.control.setAttribute('gs-dynamic', '');
                element.control.classList.add('control');
                element.control.style.width = element.value + '%';
                element.appendChild(element.control);
            }
        }
    }
    
    xtag.register('gs-progress', {
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
                    // attribute code
                    if (strAttrName === 'value') {
                        this.control.style.width = this.value + '%';
                    }
                }
            }
        },
        events: {},
        accessors: {
            value: {
                get: function () {
                    return this.getAttribute('value');
                },
                set: function (newValue) {
                    this.setAttribute('value', newValue);
                }
            }
        },
        methods: {
            recalculatePadding: function () {
                var headerElement = xtag.queryChildren(this, 'gs-header')[0],
                    footerElement = xtag.queryChildren(this, 'gs-footer')[0];
                
                if (headerElement) {
                    //console.log('1***', headerElement.offsetHeight);
                    this.style.paddingTop = headerElement.offsetHeight + 'px';
                } else {
                    this.style.paddingTop = '';
                }
                if (footerElement) {
                    //console.log('2***', footerElement.offsetHeight);
                    this.style.paddingBottom = footerElement.offsetHeight + 'px';
                } else {
                    this.style.paddingBottom = '';
                }
            }
        }
    });
});
