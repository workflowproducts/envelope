//global GS, window, xtag, registerDesignSnippet

window.addEventListener('design-register-element', function () {
    "use strict";
    registerDesignSnippet('Add Loader (to page)', 'GS.addLoader', 'addLoader(\'${0:class-name}\', \'${1:Loading...}\');');
    registerDesignSnippet('Add Loader (to element)', 'GS.addLoader', 'addLoader(${0:document.getElementById(\'id\')}, \'${1:Loading...}\');');
    registerDesignSnippet('Remove Loader (from page)', 'GS.removeLoader', 'removeLoader(\'${0:class-name}\');');
    registerDesignSnippet('Remove Loader (from element)', 'GS.removeLoader', 'removeLoader(${0:document.getElementById(\'id\')});');
});

document.addEventListener('DOMContentLoaded', function () {
    "use strict";
    xtag.register('gs-loader', {
        lifecycle: {},
        events: {},
        accessors: {},
        methods: {}
    });
});

GS.addLoader = function (loaderClassOrTarget, loaderContent) {
    "use strict";
    var loaderElement = document.createElement('gs-loader');
    var loaderClass;
    var loaderTarget;

    // turn loaderClassOrTarget into class or target
    if (typeof loaderClassOrTarget === 'string') {
        loaderClass = loaderClassOrTarget;

    } else if (typeof loaderClassOrTarget === 'object') {
        loaderTarget = loaderClassOrTarget;
    }

    // if there is a loader class: add class to loader for future identification
    if (loaderClass) {
        loaderElement.classList.add('loader-' + loaderClass);
    }

    // default loader target to body
    if (!loaderTarget) {
        loaderTarget = document.body;
    }

    // add spinning elements and loader content to loader container
    loaderElement.innerHTML = (
        '<div class="loader-positioning" gs-dynamic>' +
            '<div class="loader" gs-dynamic></div>' +
            '<div class="loader-inner spinning" gs-dynamic></div>' +
            '<div class="loader-inner-inner spinning" gs-dynamic></div>' +
            '<div class="loader-inner-inner-inner spinning" gs-dynamic></div>' +
        (
            loaderContent
                ? '<div class="loader-content" gs-dynamic role="alert">' + loaderContent + '</div>'
                : ''
        ) +
        '</div>'
    );

    // prevent scrolling on a loader
    loaderElement.addEventListener('mousewheel', function (event) {
        event.preventDefault();
    });

    // append loader to target
    loaderTarget.appendChild(loaderElement); // document.body
};

GS.removeLoader = function (loaderClassOrTarget) {
    "use strict";
    var element;
    var i;
    var len;
    var arrLoaders;
    var loaderClass;
    var loaderTarget;

    if (typeof loaderClassOrTarget === 'string') {
        loaderClass = loaderClassOrTarget;

    } else if (typeof loaderClassOrTarget === 'object') {
        loaderTarget = loaderClassOrTarget;
    }

    if (loaderClass) {
        element = document.getElementsByClassName('loader-' + loaderClass)[0];

    } else if (loaderTarget) {
        element = xtag.queryChildren(loaderTarget, 'gs-loader')[0];

    } else {
        arrLoaders = xtag.queryChildren(document.body, 'gs-loader');

        i = 0;
        len = arrLoaders.length;
        while (i < len) {
            if (!arrLoaders[i].hasAttribute('id')) {
                element = arrLoaders[i];
                break;
            }
            i += 1;
        }
    }

    if (element) {
        element.parentNode.removeChild(element);
    } else {
        console.warn(
            'GS.removeLoader Error: loader' +
            (
                loaderClass
                    ? ' class: "' + loaderClass + '"'
                    : ''
            ) +
            ' not found'
        );
    }

    element = document.createElement('div');
    element.setAttribute('gs-dynamic', '');
    element.setAttribute('hidden', '');
    element.setAttribute('role', 'alert');
    element.textContent = 'Done';
    document.body.appendChild(element);
    setTimeout(function () {
        element.parentNode.removeChild(element);
    }, 1000);
};

GS.removeAllLoaders = function () {
    "use strict";
    var i;
    var len;
    var arrLoaders = xtag.query(document.body, 'gs-loader');

    i = 0;
    len = arrLoaders.length;
    while (i < len) {
        if (!arrLoaders[i].hasAttribute('id')) {
            arrLoaders[i].parentNode.removeChild(arrLoaders[i]);
        }
        i += 1;
    }
};