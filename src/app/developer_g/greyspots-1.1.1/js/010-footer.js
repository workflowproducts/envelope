//global registerDesignSnippet, designRegisterElement, window, addProp, addFlexContainerProps, addFlexProps, document, xtag

window.addEventListener('design-register-element', function () {
    'use strict';
    registerDesignSnippet('<gs-footer>', '<gs-footer>', 'gs-footer>$0</gs-footer>');

    designRegisterElement('gs-footer', '/env/app/developer_g/greyspots-' + GS.version() + '/documentation/doc-elem-page.html');

    window.designElementProperty_GSFOOTER = function (selectedElement) {
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

        addProp('Visibility', true,
                '<gs-select class="target" value="' + strVisibilityAttribute + '" mini>' +
                '    <option value="">Visible</option>' +
                '    <option value="hidden">Invisible</option>' +
                '    <option value="hide-on-desktop">Invisible at desktop size</option>' +
                '    <option value="hide-on-tablet">Invisible at tablet size</option>' +
                '    <option value="hide-on-phone">Invisible at phone size</option>' +
                '    <option value="show-on-desktop">Visible at desktop size</option>' +
                '    <option value="show-on-tablet">Visible at tablet size</option>' +
                '    <option value="show-on-phone">Visible at phone size</option>' +
                '</gs-select>', function () {
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
        });

        addFlexContainerProps(selectedElement);
        //addFlexProps(selectedElement);
    };
});

// document.addEventListener('DOMContentLoaded', function () {
//     'use strict';

//     xtag.register('gs-footer', {
//         lifecycle: {},
//         events: {},
//         accessors: {},
//         methods: {}
//     });
// });

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    xtag.register('gs-footer', {
        lifecycle: {
            created: function () {
                if (!this.hasAttribute('role')) {
                    this.setAttribute('role', 'contentinfo');
                }
            },
        },
        events: {},
        accessors: {},
        methods: {}
    });
});