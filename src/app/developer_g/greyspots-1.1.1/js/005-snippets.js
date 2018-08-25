//global registerDesignSnippet

// snippets are in the textmate format more info:
//      http://blog.macromates.com/2005/the-power-of-snippets/

window.addEventListener('design-register-element', function () {
    // uncategorized snippets
    registerDesignSnippet('Lorem Ipsum', 'Lorem Ipsum', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');

    registerDesignSnippet('Document Start', 'Document Start',
            '<!DOCTYPE html>\n' +
            '<html lang="en">\n' +
            '    <head>\n' +
            '        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n' +
            '        <meta name="apple-mobile-web-app-capable" content="yes" />\n' +
            '        <meta name="apple-mobile-web-app-status-bar-style" content="black" />\n' +
            '        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1.0, minimal-ui" />\n' +
            '        <!-- Make this page use standard caching procedure when used as an iframe -->\n' +
            '        <meta http-equiv="Cache-control" content="no-store, must-revalidate" />\n' +
            '        \n' +
            '        <title>${1:New Page}</title>\n' +
            '        \n' +
            '        <script src="/js/greyspots.js" type="text/javascript"></script>\n' +
            '        <link href="/css/greyspots.css" type="text/css" rel="stylesheet" />\n' +
            '        \n' +
            '        <script>\n' +
            '//global GS, ml, evt, document, window\n' +
            '//jslint browser:true\n' +
            '\n' +
            '\n' +
            '        </script>\n' +
            '        \n' +
            '        <style>\n' +
            '\n' +
            '        </style>\n' +
            '    </head>\n' +
            '    <body>\n' +
            '        $0\n' +
            '    </body>\n' +
            '</html>');

    registerDesignSnippet('Centered H1', 'Centered H1', '<center><h1>$0</h1></center>');
    registerDesignSnippet('Centered H2', 'Centered H2', '<center><h2>$0</h2></center>');
    registerDesignSnippet('Centered H3', 'Centered H3', '<center><h3>$0</h3></center>');
    registerDesignSnippet('Centered H4', 'Centered H4', '<center><h4>$0</h4></center>');
    registerDesignSnippet('Centered H5', 'Centered H5', '<center><h5>$0</h5></center>');
    registerDesignSnippet('Centered H6', 'Centered H6', '<center><h6>$0</h6></center>');


    
    registerDesignSnippet('Format JSON', 'JSON.stringify','JSON.stringify(${1:value}, ${2:replacer}, ${3:space});');


    registerDesignSnippet('setInterval', 'setInterval',
            'var ${1:intervalId} = setInterval(function(){\n' +
            '    ${3}\n' +
            '}, ${2:milliseconds});\n');
            
            
    registerDesignSnippet('clearInterval', 'clearInterval','clearInterval(${1:intervalId});');
    
    
    
    registerDesignSnippet('setTimeout', 'setTimeout',
            'var ${1:intervalId} = setTimeout(function(){\n' +
            '    ${3}\n' +
            '}, ${2:milliseconds});\n');
            
            
    registerDesignSnippet('clearTimeout', 'clearTimeout','clearTimeout(${1:intervalId});');

    // javascript snippets
    registerDesignSnippet('Xtag Register', 'xtag.register',
            'window.addEventListener(\'design-register-element\', function () {\n' +
            'window.designElementProperty_GS${1:element} = function (selectedElement) {\n' +
            '        // Sample properties:\n' +
            '        // Checkbox:\n' +
            '        // addProp(\'Property\', true, \'<gs-checkbox class="target" value="\' + (selectedElement.hasAttribute(\'property\') || \'\') + \'" mini></gs-checkbox>\', function () {\n' +
            '        //     return setOrRemoveBooleanAttribute(selectedElement, \'property\', this.value === \'true\', true);\n' +
            '        // });\n' +
            '        // Text:\n' +
            '        // addProp(\'Property\', true, \'<gs-text class="target" value="\' + encodeHTML(selectedElement.getAttribute(\'property\') || \'\') + \'" mini></gs-text>\', function () {\n' +
            '        //     return setOrRemoveTextAttribute(selectedElement, \'property\', this.value, false);\n' +
            '        // });\n' +
            '    };\n' +
            '});\n' +
            '\n' +
            '//global xtag\n' +
            '//jslint browser:true\n' +
            'document.addEventListener("DOMContentLoaded", function () {\n' +
            '    "use strict";\n' +
            '    // dont do anything that modifies the element here\n' +
            '    function elementCreated(element) {\n' +
            '        // if "created" hasn\'t been suspended: run created code\n' +
            '        if (!element.hasAttribute(\'suspend-created\')) {\n' +
            '            ${2:Created Code}\n' +
            '        }\n' +
            '    }\n' +
            '\n' +
            '    function elementInserted(element) {\n' +
            '        // if "created" hasn\'t been suspended and "inserted" hasn\'t been suspended: run inserted code\n' +
            '        if (!element.hasAttribute("suspend-created") && !element.hasAttribute("suspend-inserted")) {\n' +
            '            // if this is the first time inserted has been run: continue\n' +
            '            if (!element.inserted) {\n' +
            '                element.inserted = true;\n' +
            '                ${3:Inserted Code}\n' +
            '            }\n' +
            '        }\n' +
            '    }\n' +
            '\n' +
            '    xtag.register("${1:element}", {\n' +
            '        lifecycle: {\n' +
            '            created function () {\n' +
            '                elementCreated(this);\n' +
            '            },\n' +
            '            inserted: function () {\n' +
            '                elementInserted(this);\n' +
            '            },\n' +
            '            attributeChanged: function (strAttrName, oldValue, newValue) {\n' +
            '                var element = this;\n' +
            '\n' +
            '                // if "suspend-created" has been removed: run created and inserted code\n' +
            '                if (strAttrName === "suspend-created" && newValue === null) {\n' +
            '                    elementInserted(element);\n' +
            '\n' +
            '                // if "suspend-inserted" has been removed: run inserted code\n' +
            '                } else if (strAttrName === "suspend-inserted" && newValue === null) {\n' +
            '                    elementInserted(element);\n' +
            '                }\n' +
            '            }\n' +
            '        },\n' +
            '        events: {},\n' +
            '        accessors: {\n' +
            '            // Sample accessor:\n' +
            '            // \'value\': {\n' +
            '            //     get: function () {\n' +
            '            //         var element = this;\n' +
            '            //     },\n' +
            '            //     set: function (strNewValue) {\n' +
            '            //         var element = this;\n' +
            '            //     }\n' +
            '            // }\n' +
            '        },\n' +
            '        methods: {\n' +
            '            // Sample method:\n' +
            '            // \'method\': function () {\n' +
            '            //     var element = this;\n' +
            '            // }\n' +
            '        }\n' +
            '    });\n' +
            '});');
    
    registerDesignSnippet('While Loop', 'While Loop', 'var i = ${0:0);\n'
        + 'var len = ${1:10);\n'
        + 'while (i < len) {\n'
        + '    $3\n'
        + '    i++;\n'
        + '}\n');
    
    registerDesignSnippet('Window Load', 'window.addEventListener',
            'window.addEventListener(\'load\', function () {\n' +
            '    $0\n' +
            '});');

    registerDesignSnippet('Multiline String', 'Multiline String',
            'ml(function () {/*\n' +
            '    ${0}\n' +
            '})');
            
    registerDesignSnippet('document.getElementById', 'document.getElementById',
            'document.getElementById(\'${1:id}\')');
            
    registerDesignSnippet('document.getElementsByClassName', 'document.getElementsByClassName',
            'document.getElementsByClassName(\'${1:class}\')');
            
    registerDesignSnippet('document.getElementsByName', 'document.getElementsByName',
            'document.getElementsByName(\'${1:name}\')');
            
    registerDesignSnippet('document.getElementsByTagName', 'document.getElementsByTagName',
            'document.getElementsByTagName(\'${1:tagname}\')');





    registerDesignSnippet('.getElementById', '.getElementById',
            '.getElementById(\'${1:id}\')');
            
    registerDesignSnippet('.getElementsByClassName', '.getElementsByClassName',
            '.getElementsByClassName(\'${1:class}\')');
            
    registerDesignSnippet('.getElementsByName', '.getElementsByName',
            '.getElementsByName(\'${1:name}\')');
            
    registerDesignSnippet('.getElementsByTagName', '.getElementsByTagName',
            '.getElementsByTagName(\'${1:tagname}\')');



    registerDesignSnippet('For loop', 'For loop',
            ' (var ${1:i} = 0, ${2:len} = ${3:Things}.length; $1 < $2; $1++) {\n' +
		    '    ${4:$3[$1]}$0\n' +
	        '}');





    registerDesignSnippet('Xtag Query', 'xtag.query',
            'xtag.query(${1:element}, \'${2:selector}\');');
    registerDesignSnippet('Xtag Query Children', 'xtag.queryChildren',
            'xtag.queryChildren(${1:element}, \'${2:selector}\');');
    registerDesignSnippet('Xtag Match Selector', 'xtag.matchSelector',
            'xtag.matchSelector(${1:element}, \'${2:selector}\');');

    registerDesignSnippet('ml()', 'ml()',
            'ml(function () {/*\n' +
            '    ${0}\n' +
            '*/})');

    // HTML snippets
    registerDesignSnippet('<style>', '<style>', 'style>\n' +
                                                '    $0\n' +
                                                '</style>');
    registerDesignSnippet('<script>', '<script>', 'script>\n' +
                                                  '    $0\n' +
                                                  '</script>');
    registerDesignSnippet('<link>', '<link>', 'link href="${1}" type="text/css" rel="stylesheet" />');
    
    
    // CSS snippets
    registerDesignSnippet('Curved Borders', 'Curved Borders', '-webkit-border-radius: ${1:50%};\n' +
                                                             '-moz-border-radius: ${1:50%};\n' +
                                                             '-ms-border-radius: ${1:50%};\n' +
                                                             '-o-border-radius: ${1:50%};\n' +
                                                             'border-radius: ${1:50%};');
    registerDesignSnippet('border-radius', 'border-radius', '-webkit-border-radius: ${1:50%};\n' +
                                                             '-moz-border-radius: ${1:50%};\n' +
                                                             '-ms-border-radius: ${1:50%};\n' +
                                                             '-o-border-radius: ${1:50%};\n' +
                                                             'border-radius: ${1:50%};');
    registerDesignSnippet('box-sizing', 'box-sizing', '-webkit-box-sizing: ${1:border-box};\n' +
                                                      '-moz-box-sizing: ${1:border-box};\n' +
                                                      '-ms-box-sizing: ${1:border-box};\n' +
                                                      '-o-box-sizing: ${1:border-box};\n' +
                                                      'box-sizing: ${1:border-box};');
    registerDesignSnippet('transform', 'transform', '-webkit-transform: ${1:rotate(42deg)};\n' +
                                                    '-moz-transform: ${1:rotate(42deg)};\n' +
                                                    '-ms-transform: ${1:rotate(42deg)};\n' +
                                                    '-o-transform: ${1:rotate(42deg)};\n' +
                                                    'transform: ${1:rotate(42deg)};');
    
    registerDesignSnippet('Desktop Media Query', 'Desktop Media Query', '@media only screen and (max-width: 5000px) {\n' +
                                                                        '    $0\n' +
                                                                        '}');
    registerDesignSnippet('Tablet Media Query', 'Tablet Media Query', '@media only screen and (max-width: 768px) {\n' +
                                                                      '    $0\n' +
                                                                      '}');
    registerDesignSnippet('Phone Media Query', 'Phone Media Query', '@media only screen and (max-width: 321px) {\n' +
                                                                    '    $0\n' +
                                                                    '}');
});