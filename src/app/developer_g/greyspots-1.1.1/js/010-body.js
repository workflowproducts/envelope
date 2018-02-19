
window.addEventListener('design-register-element', function () {
    window.designElementProperty_GSBODY = function(selectedElement) {
        addFlexContainerProps(selectedElement);
        //addFlexProps(selectedElement);
        
        addProp('Padded', true, '<gs-checkbox class="target" value="' + (selectedElement.hasAttribute('padded')) + '" mini></gs-checkbox>', function () {
            return setOrRemoveBooleanAttribute(selectedElement, 'padded', (this.value === 'true'), true);
        });
    };
    
    registerDesignSnippet('<gs-body>', '<gs-body>', 'gs-body>\n' +
                                                    '    $0\n' +
                                                    '</gs-body>');
    
    designRegisterElement('gs-body', '/env/app/developer_g/greyspots-' + GS.version() + '/documentation/doc-elem-page.html');
});

// document.addEventListener('DOMContentLoaded', function () {
//     xtag.register('gs-body', {
//         lifecycle: {},
//         events: {},
//         accessors: {},
//         methods: {}
//     });
// });
// JOSEPH want's this to revert back to default if you remove the role attribute
document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    xtag.register('gs-body', {
        lifecycle: {
            created: function () {
                if (!this.hasAttribute('role')) {
                    this.setAttribute('role', 'main');
                }
            },
        },
        events: {},
        accessors: {},
        methods: {}
    });
});