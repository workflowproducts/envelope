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
        '<gs-slide>',
        '<gs-slide>',
        (
            'gs-slide>\n' +
            '    <template for="${1:none}"></template>\n' +
            '    <template for="${2:detail}"></template>\n' +
            '</gs-slide>'
        )
    );

    /*
    TODO: there is no documentation
    designRegisterElement('gs-slide', '');
    */

    window.designElementProperty_GSSLIDE = function () {
        addText('V', 'Template', 'template');
        addText('O', 'Column In QS', 'qs');
        addText('O', 'Refresh On QS Columns', 'refresh-on-querystring-values');
        addCheck('O', 'Refresh On QS Change', 'refresh-on-querystring-change');
        addFlexContainerProps();
        addFlexProps();
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    function subsafeTemplate(strTemplate) {
        var templateElement = document.createElement('template');
        var strID;
        var arrTemplates;
        var i;
        var len;
        var jsnTemplates;
        var strRet;
        var arrTemplateNames;

        templateElement.innerHTML = strTemplate;

        // temporarily remove templates. recursively go through templates whose parents do not have the source attribute
        i = 0;
        arrTemplates = xtag.query(templateElement.content, 'template');

        jsnTemplates = {};
        arrTemplateNames = [];

        while (arrTemplates.length > 0 && i < 100) {
            //console.log(arrTemplates[0]);
            //console.log(arrTemplates[0].parentNode);
            //console.log(arrTemplates[0].parentNode.hasAttribute('src'));

            // if the current template has a source parent: remove temporarily
            if (
                arrTemplates[0].parentNode &&
                arrTemplates[0].parentNode.hasAttribute &&
                (
                    arrTemplates[0].parentNode.hasAttribute('src') ||
                    arrTemplates[0].parentNode.hasAttribute('source')
                )
            ) {
                strID = 'UNIqUE_PLaCEhOLDER-' + GS.GUID() + '-UNiQUE_PLaCEhOLdER';
                jsnTemplates[strID] = arrTemplates[0].outerHTML;
                arrTemplates[0].outerHTML = strID;
                arrTemplateNames.push(strID);

            // else: add to the arrTemplates array
            } else if (arrTemplates[0].content) {
                arrTemplates.push.apply(arrTemplates, xtag.query(arrTemplates[0].content, 'template'));
            }

            // remove the current template from the arrTemplates array
            arrTemplates.splice(0, 1);

            i += 1;
        }

        strRet = doT.template(
            '{{##def.snippet:\n' +
                    '    {{ var qs = GS.qryToJSON(GS.getQueryString()); }} {{# def.template }}\n' +
                    '#}}\n' +
                    '{{#def.snippet}}',
            null,
            {"template": templateElement.innerHTML}
        )();

        i = 0;
        len = arrTemplateNames.length;
        //for (strID in jsnTemplates) {
        while (i < len) {
            // DO NOT DELETE THE REPLACE, it allows single dollar signs to be inside dot notation
            strRet = strRet.replace(
                new RegExp(arrTemplateNames[i], 'g'),
                jsnTemplates[arrTemplateNames[i]].replace(/\$/g, '$$$$')
            );
            i += 1;
        }

        return strRet;
    }

    function saveDefaultAttributes(element) {
        var i;
        var len;
        var jsnAttr;

        // we need a place to store the attributes
        element.internal.defaultAttributes = {};

        // loop through attributes and store them in the internal defaultAttributes object
        i = 0;
        len = element.attributes.length;
        while (i < len) {
            jsnAttr = element.attributes[i];

            element.internal.defaultAttributes[jsnAttr.nodeName] = (jsnAttr.value || '');

            i += 1;
        }
    }

    function pushReplacePopHandler(element) {
        var i;
        var len;
        var strQS = GS.getQueryString();
        var strQSCol = element.getAttribute('qs');
        var strQSAttr;
        var arrQSParts;
        var arrAttrParts;
        var arrPopKeys;
        var currentValue;
        var bolRefresh = false;
        var strOperator;

        if (strQSCol && strQSCol.indexOf('=') !== -1) {
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
        }

        // handle "refresh-on-querystring-values" and "refresh-on-querystring-change" attributes
        if (element.internal.bolQSFirstRun === true) {
            if (element.hasAttribute('refresh-on-querystring-values') || element.hasAttribute('qs')) {
                if (element.getAttribute('refresh-on-querystring-values')) {
                    arrPopKeys = element.getAttribute('refresh-on-querystring-values').split(/\s*,\s*/gim);
                } else {
                    arrPopKeys = [];
                }

                if (strQSCol) {
                    GS.listAdd(arrPopKeys, strQSCol);
                }

                i = 0;
                len = arrPopKeys.length;
                //for (i = 0, len = arrPopKeys.length; i < len; i += 1) {
                while (i < len) {
                    currentValue = GS.qryGetVal(strQS, arrPopKeys[i]);

                    if (element.popValues[arrPopKeys[i]] !== currentValue) {
                        bolRefresh = true;
                    }

                    element.popValues[arrPopKeys[i]] = currentValue;
                    i += 1;
                }

            } else if (element.hasAttribute('refresh-on-querystring-change')) {
                bolRefresh = true;
            } else if (element.hasAttribute('template') || element.hasAttribute('value')) {
                bolRefresh = true;
            }

            if (bolRefresh) {
                //console.log(currentValue);
                element.slide('right', currentValue, true);
            }
        } else {
            if (element.hasAttribute('refresh-on-querystring-values')) {
                arrPopKeys = element.getAttribute('refresh-on-querystring-values').split(/\s*,\s*/gim);

                i = 0;
                len = arrPopKeys.length;
                //for (i = 0, len = arrPopKeys.length; i < len; i += 1) {
                while (i < len) {
                    element.popValues[arrPopKeys[i]] = GS.qryGetVal(strQS, arrPopKeys[i]);
                    i += 1;
                }
            }
        }

        element.internal.bolQSFirstRun = true;
    }

    // dont do anything that modifies the element here
    function elementCreated(element) {
        // if "created" hasn't been suspended: run created code
        if (!element.hasAttribute('suspend-created')) {

        }
    }

    function elementInserted(element) {
        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;
                // we can't reset this in case the element is added later
                if (!window.slideIdNum) {
                    window.slideIdNum = 0;
                }

                //must be for this element to prevent one element from clearing another
                //    this is cleared to prevent really long obsolete stylesheets
                var relatedStyleSheet = document.createElement('style');
                document.head.appendChild(relatedStyleSheet);
                element.relatedStyleSheet = relatedStyleSheet;


                element.internal = {};
                saveDefaultAttributes(element);

                // Get templates and define some variables
                var arrTemplate = xtag.queryChildren(element, 'template');
                var i;
                var len;
                var attr_i;
                var attr_len;
                var arrAttrNames;
                var arrAttrValues;
                var strAttrName;
                var template;

                element.attributesFromTemplate = [];
                element.templates = {};

                //for (i = 0, len = arrTemplate.length; i < len; i += 1) {
                i = 0;
                len = arrTemplate.length;
                while (i < len) {
                    if (i === 0) {
                        element.firstTemplate = arrTemplate[i].getAttribute('for') || arrTemplate[i].getAttribute('id');
                    }

                    arrAttrNames = [];
                    arrAttrValues = [];

                    attr_i = 0;
                    attr_len = arrTemplate[i].attributes.length;
                    //for (attr_i = 0, attr_len = arrTemplate[i].attributes.length; attr_i < attr_len; attr_i += 1) {
                    while (attr_i < attr_len) {
                        strAttrName = arrTemplate[i].attributes[attr_i].nodeName;

                        if (strAttrName !== 'for' && strAttrName !== 'id') {
                            arrAttrNames.push(strAttrName);
                            arrAttrValues.push(arrTemplate[i].attributes[attr_i].value);
                        }
                        attr_i += 1;
                    }

                    template = arrTemplate[i];
                    element.templates[template.getAttribute('for') || template.getAttribute('id')] = {
                        'content': template.innerHTML,
                        'arrAttrNames': arrAttrNames,
                        'arrAttrValues': arrAttrValues,
                        'templated': !(element.hasAttribute('static') || template.hasAttribute('static'))
                    };
                    if (!(element.hasAttribute('static') || template.hasAttribute('static')) &&
                            (
                        element.templates[template.getAttribute('for') || template.getAttribute('id')].content.indexOf('&gt;') > -1 ||
                        element.templates[template.getAttribute('for') || template.getAttribute('id')].content.indexOf('&lt;') > -1
                    )) {
                        console.warn('GS-SLIDE WARNING: &gt; or &lt; detected in "' + (template.getAttribute('for') || template.getAttribute('id')) + '" template, this can have undesired effects on doT.js. Please use gt(x,y), gte(x,y), lt(x,y), or lte(x,y) to silence this warning.');
                    }

                    i += 1;
                }

                // Clear out the templates from the DOM
                element.innerHTML = '';

                element.arrQueryStringAttributes = [];
                element.popValues = {};

                if (
                    (
                        element.hasAttribute('template') &&
                        element.getAttribute('template').indexOf('{{') > -1
                    ) ||
                    element.hasAttribute('qs') ||
                    element.hasAttribute('refresh-on-querystring-values') ||
                    element.hasAttribute('refresh-on-querystring-change')
                ) {
                    pushReplacePopHandler(element);
                    window.addEventListener('pushstate', function () {
                        pushReplacePopHandler(element);
                    });
                    window.addEventListener('replacestate', function () {
                        pushReplacePopHandler(element);
                    });
                    window.addEventListener('popstate', function () {
                        pushReplacePopHandler(element);
                    });
                }

                // element.refresh();
                // element.innerHTML = subsafeTemplate(arrTemplate[0].content);
                //console.log(subsafeTemplate(arrTemplate[0].content), arrTemplate[0]);
                element.slide('gs-slideStartFirstTemplate');
            }
        }
    }

    xtag.register('gs-slide', {
        lifecycle: {
            created: function () {
                elementCreated(this);
            },

            inserted: function () {
                elementInserted(this);
            },

            attributeChanged: function (strAttrName, oldValue, newValue) {
                var element = this;
                // if "suspend-created" has been removed: run created and inserted code
                if (strAttrName === 'suspend-created' && newValue === null) {
                    elementCreated(element);
                    elementInserted(element);

                // if "suspend-inserted" has been removed: run inserted code
                } else if (strAttrName === 'suspend-inserted' && newValue === null) {
                    elementInserted(element);

                } else if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
                    if (strAttrName === 'value') {
                        console.warn('gs-slide Warning: "value" attribute is not in use. Please use the "template" attribute instead.', element);
                    } else if (strAttrName === 'template' && element.inserted === true) {
                        element.slide('right', newValue);
                    }
                }
            }
        },
        events: {},
        accessors: {
            // cannot set the template with an accessor
            value: {
                get: function () {
                    var element = this;
                    console.warn('gs-slide Warning: \'.value\' accessor is deprecated. Please use the \'.template\' accessor to replace the \'.value\' accessor.', element);
                    return element.getAttribute('template');
                }
            },
            template: {
                get: function () {
                    return this.getAttribute('template');
                }
            },
            currentTemplate: {
                get: function () {
                    var templateName;
                    var strQueryString = GS.getQueryString();
                    var strQSAttribute = this.getAttribute('qs');
                    var strValueAttribute = this.getAttribute('template') || this.getAttribute('value');
                    if (strQSAttribute && GS.qryGetVal(strQueryString, strQSAttribute)) {
                        templateName = GS.qryGetVal(strQueryString, strQSAttribute);
                    } else if (strValueAttribute) {
                        templateName = GS.templateWithQuerystring(strValueAttribute);
                    }
                    return templateName;
                }
            }
        },
        methods: {
            'slide': function (direction, templateTo, bolqs) {
                var element = this;
                var strQueryString = GS.getQueryString();
                var strQSAttribute = element.getAttribute('qs');
                var strValueAttribute = templateTo;
                var templateName;
                var i;
                var len;
                var newHTML;
                var offsetCSS;
                var keyFrameCSS;
                var newPageID = 'slideCont' + window.slideIdNum;
                // window property to prevent duplicates
                window.slideIdNum++;

                if (direction !== 'gs-slideStartFirstTemplate' && !bolqs && (element.hasAttribute('refresh-on-querystring-change') || element.hasAttribute('refresh-on-querystring-values') || element.hasAttribute('qs'))) {
                    element.slide((direction || 'right'), templateTo, true);
                    console.warn('gs-slide Warning: \'Do not use element.slide on an element using querystring attributes, use GS.pushQueryString();\'');
                    return;
                }

                // if we've been given a name: use that
                if (templateTo) {
                    templateName = templateTo;
                // else: get a name
                } else {
                    if (strQSAttribute && GS.qryGetVal(strQueryString, strQSAttribute)) {
                        templateName = GS.qryGetVal(strQueryString, strQSAttribute);
                    } else if (strValueAttribute) {
                        templateName = GS.templateWithQuerystring(strValueAttribute);
                    }
                }

                templateName = templateName || element.firstTemplate;

                if (element.templates[templateName] && element.templates[templateName].content) {
                    // if there are values in element.attributesFromTemplate
                    if (element.attributesFromTemplate.length > 0) {
                        // loop through them
                        i = 0;
                        len = element.attributesFromTemplate.length;
                        //for (i = 0, len = element.attributesFromTemplate.length; i < len; i += 1) {
                        while (i < len) {
                            // if attribute was initallySet: set it back to initalvalue
                            if (element.attributesFromTemplate[i].initallySet) {
                                element.setAttribute(element.attributesFromTemplate[i].name, element.attributesFromTemplate[i].initalValue);

                            // else: remove it
                            } else {
                                element.removeAttribute(element.attributesFromTemplate[i].name);
                            }
                            i += 1;
                        }
                    }

                    // clear element.attributesFromTemplate
                    element.attributesFromTemplate = [];

                    // if there are values in element.templates[templateName].arrAttrNames
                    if (element.templates[templateName].arrAttrNames.length > 0) {
                        // loop through them
                        i = 0;
                        len = element.templates[templateName].arrAttrNames.length;
                        while (i < len) {
                            // add to element.attributesFromTemplate
                            element.attributesFromTemplate.push({
                                'name': element.templates[templateName].arrAttrNames[i],
                                'initallySet': element.hasAttribute(element.templates[templateName].arrAttrNames[i]),
                                'initalValue': element.getAttribute(element.templates[templateName].arrAttrNames[i])
                            });

                            // set attribute
                            element.setAttribute(element.templates[templateName].arrAttrNames[i], GS.templateWithQuerystring(element.templates[templateName].arrAttrValues[i]));
                            i += 1;
                        }
                    }

                    // if this isn't the first one
                    if (direction !== 'gs-slideStartFirstTemplate') {
                        // newhtml is added after the css is added
                        if (element.templates[templateName].templated) {
                            newHTML = '<div id="' + newPageID + '">' + subsafeTemplate(element.templates[templateName].content) + '</div>';
                        } else {
                            newHTML = '<div id="' + newPageID + '">' + element.templates[templateName].content + '</div>';
                        }

                        // create slide css
                        // keyFrameCSS is added at the end
                        offsetCSS = '#' + newPageID + ' {\n';
                        if (direction === 'left') {
                            offsetCSS += '    left: 0;\n';
                            keyFrameCSS = '@-webkit-keyframes slidein {\n' +
                                    '    0% { left: -100%; }\n' +
                                    '    100% { left: 0; }\n' +
                                    '}\n' +
                                    '@keyframes slidein {\n' +
                                    '    0% { left: -100%; }\n' +
                                    '    100% { left: 0; }\n' +
                                    '}\n';

                        } else if (direction === 'top') {
                            offsetCSS += '    top: -100%;\n';
                            keyFrameCSS = '@-webkit-keyframes slidein {\n' +
                                    '    0% { top: 0%; }\n' +
                                    '    100% { top: 0; }\n' +
                                    '}\n' +
                                    '@keyframes slidein {\n' +
                                    '    0% { top: -100%; }\n' +
                                    '    100% { top: 0; }\n' +
                                    '}\n';

                        } else if (direction === 'bottom') {
                            offsetCSS += '    top: 100%;\n';
                            keyFrameCSS = '@-webkit-keyframes slidein {\n' +
                                    '    0% { top: 100%; }\n' +
                                    '    100% { top: 0; }\n' +
                                    '}\n' +
                                    '@keyframes slidein {\n' +
                                    '    0% { top: 100%; }\n' +
                                    '    100% { top: 0; }\n' +
                                    '}\n';

                        //right should be the default
                        } else {
                            offsetCSS += '    left: 0;\n';
                            keyFrameCSS = '@-webkit-keyframes slidein {\n' +
                                    '    0% { left: 100%; }\n' +
                                    '    100% { left: 0; }\n' +
                                    '}\n' +
                                    '@keyframes slidein {\n' +
                                    '    0% { left: 100%; }\n' +
                                    '    100% { left: 0; }\n' +
                                    '}\n';
                        }

                        offsetCSS += '    -webkit-animation: slidein 1s forwards;\n' +
                                '    animation: slidein 1s forwards;\n' +
                                '}\n';
                        offsetCSS += keyFrameCSS;
                        element.relatedStyleSheet.innerHTML = offsetCSS;
                        element.innerHTML += newHTML;
                        //remove previous template
                        setTimeout(function () {
                            element.removeChild(element.children[0]);
                        }, 1000);
                    // if this is the first one
                    } else {
                        if (element.templates[templateName].templated) {
                            element.innerHTML = '<div id="' + newPageID + '">' + subsafeTemplate(element.templates[templateName].content); + '</div>'
                        } else {
                            element.innerHTML = '<div id="' + newPageID + '">' + element.templates[templateName].content; + '</div>'
                        }
                        GS.triggerEvent(element, 'templated');
                        element.templated_first = true;
                    }

                    // if template is not native: handle templates inside the slide
                    if (shimmed.HTMLTemplateElement) {
                        window.HTMLTemplateElement.bootstrap(element);
                    }
                  //console.log(templateName, newPageID);
                    GS.triggerEvent(element, 'templatechange', {'templateName': templateName});
                    GS.triggerEvent(element, 'template_change', {'templateName': templateName});
                } else {
                    element.innerHTML = '';
                }
            }
        }
    });
});