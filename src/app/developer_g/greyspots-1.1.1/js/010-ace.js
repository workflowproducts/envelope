//global window, GS, ml, xtag, evt, ace, doT, CryptoJS, encodeHTML, Worker
//global addSnippet, addElement, addFlexProps, addCheck, addText, addSelect
//global addControlProps, addFlexContainerProps, addProp
//global addAttributeSwitcherProp, addGSControlProps, addCornerRoundProps
//global addIconProps
//jslint browser:true, maxlen:80, white:false, this:true

// # CODE INDEX:          <- (use "find" (CTRL-f or CMD-f) to skip to a section)
//      # TOP             <- (this just brings you back this index)
//      # SNIPPET/DESIGN
//      # SHARED VARIABLES
//      # PASSWORD RECEIVER
//      # UTILITY FUNCTIONS
//      # ELEMENT FUNCTIONS
//      # RENDER FUNCTIONS
//      # EVENT FUNCTIONS
//          # QS EVENTS
//          # FOCUS EVENTS
//          # BLUR EVENTS
//          # KEY EVENTS
//          # SELECTION EVENTS
//          # RESIZE EVENTS
//          # CMD-S EVENTS
//          # DEVELOPER EVENTS
//          # HIGH LEVEL BINDING
//      # ELEMENT INSTANTIATION
//      # ELEMENT LIFECYCLE
//      # ELEMENT ACCESSORS
//      # ELEMENT METHODS
//
// For code that needs to be completed:
//      # NEED CODING


// #############################################################################
// ############################## SNIPPET/DESIGN ###############################
// #############################################################################

window.addEventListener('design-register-element', function () {
    "use strict";
    addSnippet('<gs-ace>', '<gs-ace>', 'gs-ace column="${1:name}"></gs-ace>');
    addSnippet(
        '<gs-ace> With Label',
        '<gs-ace>',
        (
            'label for="${1:ace-insert-note}">${2:Notes}:</label>\n' +
            '<gs-ace id="${1:ace-insert-note}" column="${3:note}"></gs-ace>'
        )
    );

    addElement('gs-ace', '#controls_ace');

    // DEFINE PROPERTIES
    window.designElementProperty_GSACE = function (selected) {
        addGSControlProps();
        addText('D', 'Encrypted', 'encrypted');
        addText('O', 'Column In QS', 'qs');
        addSelect('V', 'Theme', 'theme', [
            {"val": "", "txt": "Eclipse (Default)"},
            {"val": "chrome", "txt": "Chrome"},
            {"val": "clouds", "txt": "Clouds"},
            {"val": "crimson_editor", "txt": "Crimson Editor"},
            {"val": "dawn", "txt": "Dawn"},
            {"val": "dreamweaver", "txt": "Dreamweaver"},
            {"val": "eclipse", "txt": "Eclipse"},
            {"val": "github", "txt": "GitHub"},
            {"val": "iplastic", "txt": "IPlastic"},
            {"val": "solarized_light", "txt": "Solarized Light"},
            {"val": "textmate", "txt": "TextMate"},
            {"val": "tomorrow", "txt": "Tomorrow"},
            {"val": "xcode", "txt": "XCode"},
            {"val": "kuroir", "txt": "Kuroir"},
            {"val": "katzenmilch", "txt": "KatzenMilch"},
            {"val": "sqlserver", "txt": "SQL Server"},
            {"val": "ambiance", "txt": "Ambiance"},
            {"val": "chaos", "txt": "Chaos"},
            {"val": "clouds_midnight", "txt": "Clouds Midnight"},
            {"val": "cobalt", "txt": "Cobalt"},
            {"val": "idle_fingers", "txt": "idle Fingers"},
            {"val": "kr_theme", "txt": "krTheme"},
            {"val": "merbivore", "txt": "Merbivore"},
            {"val": "merbivore_soft", "txt": "Merbivore Soft"},
            {"val": "mono_industrial", "txt": "Mono Industrial"},
            {"val": "monokai", "txt": "Monokai"},
            {"val": "pastel_on_dark", "txt": "Pastel on dark"},
            {"val": "solarized_dark", "txt": "Solarized Dark"},
            {"val": "terminal", "txt": "Terminal"},
            {"val": "tomorrow_night", "txt": "Tomorrow Night"},
            {"val": "tomorrow_night_blue", "txt": "Tomorrow Night Blue"},
            {"val": "tomorrow_night_bright", "txt": "Tomorrow Night Bright"},
            {"val": "tomorrow_night_eighties", "txt": "Tomorrow Night 80s"},
            {"val": "twilight", "txt": "Twilight"},
            {"val": "vibrant_ink", "txt": "Vibrant Ink"}
        ]);
        addSelect('D', 'Mode', 'mode', [
            {"val": "", "txt": "text (Default)"},
            'abap', 'abc', 'actionscript', 'ada', 'apache_conf', 'asciidoc',
            'assembly_x86', 'autohotkey', 'batchfile', 'c_cpp', 'c9search',
            'cirru', 'clojure', 'cobol', 'coffee', 'coldfusion', 'csharp',
            'css', 'curly', 'd', 'dart', 'diff', 'dockerfile', 'dot', 'dummy',
            'dummysyntax', 'eiffel', 'ejs', 'elixir', 'elm', 'erlang', 'forth',
            'fortran', 'ftl', 'gcode', 'gherkin', 'gitignore', 'glsl',
            'gobstones', 'golang', 'groovy', 'haml', 'handlebars', 'haskell',
            'haxe', 'html', 'html_elixir', 'html_ruby', 'ini', 'io', 'jack',
            'jade', 'java', 'javascript', 'json', 'jsoniq', 'jsp', 'jsx',
            'julia', 'latex', 'lean', 'less', 'liquid', 'lisp', 'livescript',
            'logiql', 'lsl', 'lua', 'luapage', 'lucene', 'makefile', 'markdown',
            'mask', 'matlab', 'maze', 'mel', 'mushcode', 'mysql', 'nix', 'nsis',
            'objectivec', 'ocaml', 'pascal', 'perl', 'pgsql', 'php',
            'powershell', 'praat', 'prolog', 'properties', 'protobuf', 'python',
            'r', 'razor', 'rdoc', 'rhtml', 'rst', 'ruby', 'rust', 'sass',
            'scad', 'scala', 'scheme', 'scss', 'sh', 'sjs', 'smarty',
            'snippets', 'soy_template', 'space', 'sql', 'sqlserver', 'stylus',
            'svg', 'swift', 'tcl', 'tex', 'text', 'textile', 'toml', 'twig',
            'typescript', 'vala', 'vbscript', 'velocity', 'verilog', 'vhdl',
            'wollok', 'xml', 'xquery', 'yaml', 'django'
        ]);
        addText('V', 'Rows', 'rows');
        addCheck('O', 'Autocomplete', 'Autocomplete');
        addFlexProps(selected);
    };
});

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

// #############################################################################
// ############################# SHARED VARIABLES ##############################
// #############################################################################

    // these are config variables
    var strAceRootFolder = '/js/ace/';

    // these are variables that are shared between gs-ace elements
    var Range;
    var snippetManager;
    var bolAceLoading = false;
    var bolAceLoaded = false;
    var arrAceLoadCallbacks = [];


// #############################################################################
// ############################ PASSWORD RECEIVER ##############################
// #############################################################################

    // if there's encrypted controls on the screen, a password dialog pops up.
    //      If we have encrypted gs-ace elements, they have to wait to render a
    //      properly decrypted value. When we get the signal that we have a
    //      password, re-render all encrypted gs-ace elements that use that key.
    window.addEventListener('try-password', function (event) {
        var strKey = event.keyVariable;
        var elems = xtag.query(document, 'gs-ace[encrypted="' + strKey + '"]');
        var i;
        var len;

        i = 0;
        len = elems.length;
        while (i < len) {
            elems[i].render();
            i += 1;
        }
    });


// #############################################################################
// ############################ UTILITY FUNCTIONS ##############################
// #############################################################################

    // loading scripts is clunky, factoring out into a function will help the
    //      code self-document.
    function loadAceFile(strPath, callback) {
        var scriptElement;

        // gotta build the script tag
        scriptElement = document.createElement('script');
        scriptElement.src = strAceRootFolder + strPath;
        scriptElement.setAttribute('data-ace-base', strAceRootFolder);
        scriptElement.onload = function () {
            if (callback) {
                callback();
            }
        };

        // appending the script to the head is what causes it to load
        document.head.appendChild(scriptElement);
    }

    // if we've stored up some elements that are waiting to be initiated because
    //      ace hasn't been loaded yet, let's run through them now and let them
    //      proceed. This function is only called after the ace files have been
    //      loaded.
    function initiateAllWaitingAceElements() {
        var i;
        var len;

        i = 0;
        len = arrAceLoadCallbacks.length;
        while (i < len) {
            arrAceLoadCallbacks[i]();
            i += 1;
        }
    }

    // we need to wait to initiate any ace elements until after all related
    //      files have been downloaded. We don't want to slow down most pages
    //      with ace, so we load the ace files on the first "inserted" lifecycle
    //      call of a gs-ace
    function loadAce(callback) {
        // if we've already loaded ace, immediate callback
        if (bolAceLoaded) {
            callback();

        // ace is in the process of being loaded, just bind and wait
        } else if (bolAceLoading) {
            arrAceLoadCallbacks.push(callback);

        // load ace, and then the supplementary files we need.
        } else {
            arrAceLoadCallbacks.push(callback);
            bolAceLoading = true;

            // we have to load ace before we load the supplementary files
            loadAceFile('ace.js', function () {
                var arrFiles;
                var i;
                var intRequested;
                var intLoaded;
                var loadedCallback;

                // this callback is run one for every file after it is loaded.
                //      Once all files have been loaded, it loops through the
                //      callbacks we've stored up for all the aces that want to
                //      run and execute them.
                loadedCallback = function () {
                    intLoaded += 1;

                    // we've loaded all the files we requested
                    if (intLoaded === intRequested) {
                        // we need the snippet/autocomplete and selection range
                        //      modules loaded into variables we can reach.
                        Range = require('ace/range').Range;
                        snippetManager = require('ace/snippets').snippetManager;

                        // allow all the gs-ace elements that are waiting for
                        //      ace to load to continue with their lifecycle
                        initiateAllWaitingAceElements();

                        // we update the state variables last to minimize the
                        //      possibility of a race condition
                        bolAceLoaded = true;
                        bolAceLoading = false;
                    }
                };

                // right now, we only load the language tools (for snippets and
                //      autocomplete) and the searchbox (for programatically
                //      opening the find/replace box). In the future, if we need
                //      to change the files we load, just change this.
                arrFiles = [
                    {"name": "ext-language_tools.js", "loaded": false},
                    {"name": "ext-searchbox.js", "loaded": false}
                ];

                // loop through all the files and start loading them
                intLoaded = 0;
                i = 0;
                intRequested = arrFiles.length;
                while (i < intRequested) {
                    loadAceFile(arrFiles[i].name, loadedCallback);
                    i += 1;
                }
            });
        }
    }

    // we need to be able to execute event attributes (like onafter_select)
    //      while being able to reference the gs-ace as "this" in the code.
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
            // onfocus, onblur and onchange attributes are handled automatically
            //      by the browser
            strEvent !== 'focus' &&
            strEvent !== 'blur' &&
            strEvent !== 'change'
        ) {
            evalInContext(element, element.getAttribute('on' + strEvent));
        }
    }

    // encryption adds a layer of code in between getting and setting values. We
    //      don't want to have to repeat the decryption code multiple times. If
    //      the gs-ace isn't encrypted, it just returns the value given.
    function encryptValue(element, strValue) {
        var strKey = element.getAttribute('encrypted');

        // if there's no key, don't try to encrypt
        if (strKey && (window[strKey] || '')) {
            return CryptoJS.AES.encrypt(
                (strValue || ''),
                (window[strKey] || '')
            );
        }

        return strValue;
    }

    // encryption adds a layer of code in between getting and setting values. We
    //      don't want to have to repeat the decryption code multiple times. If
    //      the gs-ace isn't encrypted, it just returns the value given.
    function decryptValue(element, strValue) {
        var strKey = element.getAttribute('encrypted');

        // we error if we try to decrypt without a password
        if (strKey && (window[strKey] || '')) {
            return CryptoJS.AES.decrypt(
                (strValue || ''),
                (window[strKey] || '')
            ).toString(CryptoJS.enc.Utf8);
        }

        return strValue;
    }

    // encryption adds a layer of code in between getting and setting values. We
    //      don't want to have to repeat the decryption code multiple times. If
    //      the gs-ace isn't encrypted, it just returns the value attribute.
    function setEncryptElemVal(element, strValue) {
        return element.setAttribute('value', encryptValue(element, strValue));
    }

    // encryption adds a layer of code in between getting and setting values. We
    //      don't want to have to repeat the decryption code multiple times. If
    //      the gs-ace isn't encrypted, it just returns the value attribute.
    function getDecryptElemVal(element) {
        return decryptValue(element, element.getAttribute('value'));
    }

    // encryption adds a layer of code in between getting and setting values. We
    //      don't want to have to repeat the encryption code multiple times. If
    //      the gs-ace isn't encrypted, it just returns the ace value.
    function getDecryptAceVal(element) {
        return element.internalAce.getValue();
    }


// #############################################################################
// ############################# ELEMENT FUNCTIONS #############################
// #############################################################################

    // create internal structures and inner elements that persist through the
    //      whole lifetime of the element
    function prepareElement(element) {
        var root;
        var strTemp;

        // we need containers for our internal data.
        element.elems = {};
        element.internalAce = {};
        element.internalData = {};
        element.internalEvents = {};
        element.internalDisplay = {
            "markers": {}
        };

        // we need to create the div that will house the ace element. This
        //      element will persist until element death.
        root = GS.stringToElement(
            '<div class="root" gs-dynamic></div>'
        );

        // save root
        element.elems.root = root;

        // clear anything old out of the element
        element.innerHTML = '';

        // append our root element
        element.appendChild(root);

        // create ace editor here
        element.internalAce = ace.edit(root);
        element.internalAce.setShowPrintMargin(false);
        element.internalAce.setDisplayIndentGuides(true);
        element.internalAce.setShowFoldWidgets(false);
        element.internalAce.session.setUseWrapMode('free');
        element.internalAce.setBehavioursEnabled(false);

        // blocks a warning
        strTemp = '$blockScrolling';
        element.internalAce[strTemp] = Infinity;

        // get tab index and save it for later
        if (element.hasAttribute('tabindex')) {
            element.internalDisplay.tabIndex = element.getAttribute('tabindex');
            element.removeAttribute('tabindex');
        }
    }


// #############################################################################
// ############################# RENDER FUNCTIONS ##############################
// #############################################################################

    // sync ace editor element with current value and parameters
    function render(element, bolPreventUndo) {
        var strTheme;
        var strLanguage;
        var bolAutocomplete;
        var strValueAttr;

        // gather parameters
        strTheme = element.getAttribute('theme') || 'eclipse';
        strLanguage = element.getAttribute('mode') || 'text';
        bolAutocomplete = element.hasAttribute('autocomplete');

        // apply parameters
        element.internalAce.setTheme('ace/theme/' + strTheme);
        element.internalAce.session.setMode('ace/mode/' + strLanguage);
        element.internalAce.setOptions({
            'enableBasicAutocompletion': bolAutocomplete,
            'enableSnippets': bolAutocomplete,
            'enableLiveAutocompletion': bolAutocomplete
        });

        // get and set latest value

        // we only want to mess with the value if it's different from the value
        //      attribute. the setValue ace function causes a 'change' event
        //      that we don't want to occur unless the user made a change.
        strValueAttr = getDecryptElemVal(element);

        if (strValueAttr !== getDecryptAceVal(element)) {
            // if we're doing the initial value set, we don't want to allow undo
            if (bolPreventUndo) {
                element.internalAce.session.setValue(strValueAttr || '');

            // else, we want the user to be able to undo
            } else {
                element.internalAce.setValue(strValueAttr || '');
            }
        }

        // handle differences between touch and desktop
        if (evt.touchDevice) {
            element.internalAce.setOptions({maxLines: Infinity});
            element.elems.root.classList.add('childrenneedsclick');
        } else {
            element.elems.root.style.height = '100%';
        }

        // handle disabled and readonly
        element.internalAce.setReadOnly(
            element.hasAttribute('disabled') ||
            element.hasAttribute('readonly')
        );

        // handle height settings
        if (element.hasAttribute('rows')) {
            element.style.height = (
                parseInt(element.getAttribute('rows'), 10) *
                element.internalAce.renderer.lineHeight
            ) + 'px';
        } else {
            //element.style.height, need to use default attribute
            // ### NEED CODING ###
        }

        // handle tabindex setting
        if (element.internalDisplay.tabIndex !== undefined) {
            xtag.query(element, '.ace_text-input')[0].setAttribute(
                'tabindex',
                element.internalDisplay.tabIndex
            );
        }

        // cause the ace editor to perform a resize
        element.internalAce.resize();
    }


// #############################################################################
// ############################## EVENT FUNCTIONS ##############################
// #############################################################################

    // ############# QS EVENTS #############
    function unbindQuerystringEvents(element) {
        
    }
    function bindQuerystringEvents(element) {
        
    }

    // ############# FOCUS EVENTS #############
    function unbindFocus(element) {
        element.internalAce.removeEventListener(
            'focus',
            element.internalEvents.aceFocus
        );
    }
    function bindFocus(element) {
        element.internalEvents.aceFocus = function () {
            // when we enter the field, we save the last published value so that
            //      when we leave the field, we can compare the current value
            //      with the last published value, and if there's a difference,
            //      trigger a change event.
            element.internalEvents.lastPublishedValue = (
                getDecryptElemVal(element)
            );
        };

        element.internalAce.addEventListener(
            'focus',
            element.internalEvents.aceFocus
        );
    }

    // ############# BLUR EVENTS #############
    function unbindBlur(element) {
        element.internalAce.removeEventListener(
            'blur',
            element.internalEvents.aceBlur
        );
    }
    function bindBlur(element) {
        element.internalEvents.aceBlur = function () {
            var strValue = getDecryptElemVal(element);

            // if the last published value is different from when we entered
            //      the field, we want to trigger a change, because blur
            //      means we're leaving the field.
            if (element.internalEvents.lastPublishedValue !== strValue) {
                element.internalEvents.lastPublishedValue = strValue;
                triggerEvent(element, 'change');
            }
        };

        element.internalAce.addEventListener(
            'blur',
            element.internalEvents.aceBlur
        );
    }

    // ############# KEY EVENTS #############
    function unbindKey(element) {
        element.elems.root.removeEventListener(
            'keydown',
            element.internalEvents.keydownValueChange
        );
        element.internalAce.removeEventListener(
            'change',
            element.internalEvents.changeValueChange
        );
    }
    function bindKey(element) {
        element.internalEvents.keydownValueChange = function (event) {
            var intKeyCode = (event.which || event.keyCode);

            // CMD-S triggers save
            if (intKeyCode === 83 && (event.metaKey || event.ctrlKey)) {
                // we don't want the webpage to try to use CMD-S as a signal
                //      to as the user if they want to save the webpage.
                event.preventDefault();
                event.stopPropagation();

                // CMD-S always triggers a change and value_change, no matter
                //      if there's a difference in value.
                triggerEvent(element, 'value_change');
                triggerEvent(element, 'change');

                // on blur, we compare the latest published value with the
                //      current value. We don't want to trigger a change
                //      event if they leave the ace after a CMD-S
                element.internalEvents.lastPublishedValue = getDecryptElemVal();

            // space
            //} else if (intKeyCode === 32) {

            // non alpha
            } else if (
                !(
                    (intKeyCode >= 65 && intKeyCode < 90) ||
                    (intKeyCode >= 97 && intKeyCode < 122) ||
                    (intKeyCode === 45) // dash
                )
            ) {
                if (element.internalAce.completer) {
                    element.internalAce.completer.detach();
                }
            }
        };
        element.internalEvents.changeValueChange = function () {
            var strValue = getDecryptAceVal(element);

            // if the value attribute is not up to date, update value
            //      attribute and trigger change
            if (getDecryptElemVal(element) !== strValue) {
                setEncryptElemVal(element, strValue);

                // we want the developer to be able to access the new
                //      value, so we trigger the event last
                triggerEvent(element, 'value_change');
            }
        };

        element.elems.root.addEventListener(
            'keydown',
            element.internalEvents.keydownValueChange
        );
        element.internalAce.addEventListener(
            'change',
            element.internalEvents.changeValueChange
        );
    }

    // ############# SELECTION EVENTS #############
    function unbindSelection(element) {
        element.elems.root.removeEventListener(
            evt.mouseup,
            element.internalEvents.selectionChange
        );
        element.elems.root.removeEventListener(
            'keyup',
            element.internalEvents.selectionChange
        );
    }
    function bindSelection(element) {
        element.internalEvents.selectionChange = function () {
            triggerEvent(element, 'selection_change');
        };

        element.elems.root.addEventListener(
            evt.mouseup,
            element.internalEvents.selectionChange
        );
        element.elems.root.addEventListener(
            'keyup',
            element.internalEvents.selectionChange
        );
    }

    // ############# RESIZE EVENTS #############
    function unbindResize(element) {
        window.removeEventListener(
            'resize',
            element.internalEvents.windowResize
        );
        window.removeEventListener(
            evt.mousemove,
            element.internalEvents.elementResize
        );
    }
    function bindResize(element) {
        element.internalEvents.windowResize = function () {
            element.internalAce.resize();
        };
        element.internalEvents.elementResize = function () {
            if (
                element.internalDisplay.lastHeight !== element.clientHeight ||
                element.internalDisplay.lastWidth !== element.clientWidth
            ) {
                element.internalAce.resize();
                element.internalDisplay.lastHeight = element.clientHeight;
                element.internalDisplay.lastWidth = element.clientWidth;
            }
        };

        window.addEventListener(
            'resize',
            element.internalEvents.windowResize
        );
        window.addEventListener(
            evt.mousemove,
            element.internalEvents.elementResize
        );
    }

    // ############# CMD-S EVENTS #############
    function unbindCMDS(element) {
        window.removeEventListener(
            'keydown',
            element.internalEvents.cmdsPrevent
        );
    }
    function bindCMDS(element) {
        element.internalEvents.cmdsPrevent = function () {
            var intKeyCode = (event.which || event.keyCode);

            // CMD-S triggers change event in gs-ace, we don't want the window
            //      to attempt to save the webpage to the desktop. Only if all
            //      gs-ace elements have been removed from the DOM will the user
            //      be able to save the webpage again.
            if (intKeyCode === 83 && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        window.addEventListener(
            'keydown',
            element.internalEvents.cmdsPrevent
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
            var strHTML;
            var arrAttr;
            var jsnAttr;
            var i;
            var len;

            if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
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
        unbindQuerystringEvents(element);
        unbindFocus(element);
        unbindBlur(element);
        unbindKey(element);
        unbindSelection(element);
        unbindResize(element);
        unbindCMDS(element);
        unbindDeveloper(element);
    }
    function bindElement(element) {
        bindQuerystringEvents(element);
        bindFocus(element);
        bindBlur(element);
        bindKey(element);
        bindSelection(element);
        bindResize(element);
        bindCMDS(element);
        bindDeveloper(element);
    }


// #############################################################################
// ########################### ELEMENT INSTANTIATION ###########################
// #############################################################################

    function elementInserted(element) {
        var strKey;

        // if this ace is an encrypted ace, we may have to trigger the password
        //      popup
        strKey = element.getAttribute('encrypted');

        if (strKey && !window[strKey] && !window['getting' + strKey]) {
            window['getting' + strKey] = true;
            GS.triggerEvent(
                element,
                'password-error',
                {"reason": "no", "keyVariable": strKey}
            );
        }

        // proceed with element initiation
        if (
            // if "created"/"inserted" are not suspended: continue
            !element.hasAttribute('suspend-created') &&
            !element.hasAttribute('suspend-inserted') &&
            // if this is the first time inserted has been run: continue
            !element.inserted
        ) {
            element.inserted = true;

            // we need to wait to initiate any ace elements until after all
            //      related files have been downloaded. We don't want to slow
            //      down most pages with ace, so we load the ace files on the
            //      first "inserted" lifecycle call of a gs-ace
            loadAce(function () {
                prepareElement(element);
                bindElement(element);
                render(element, true);
            });
        }
    }

    xtag.register('gs-ace', {

// #############################################################################
// ############################# ELEMENT LIFECYCLE #############################
// #############################################################################

        lifecycle: {
            'inserted': function () {
                elementInserted(this);
            },

            'removed': function () {
                this.destroy();
            },

            'attributeChanged': function (attr) {//, oldValue, newValue
                var element = this;

                // if suspend attribute: run inserted event
                if (attr === 'suspend-created' || attr === 'suspend-inserted') {
                    elementInserted(element);

                // if the element is not suspended: handle attribute changes
                } else if (
                    !element.hasAttribute('suspend-created') &&
                    !element.hasAttribute('suspend-inserted') &&
                    // if ace isn't loaded, no need to re-render because the
                    //      first render hasn't happened yet.
                    bolAceLoaded
                ) {
                    render(element);
                }
            }
        },

// #############################################################################
// ############################# ELEMENT ACCESSORS #############################
// #############################################################################

        accessors: {
            // the "value" attribute is the master location for the text value
            //      anything else would lead to confusion. So, the .value
            //      accessor just sets the attribute.
            'value': {
                'get': function () {
                    return this.getAttribute('value');
                },
                'set': function (newValue) {
                    setEncryptElemVal(this, newValue);
                }
            }
        },

// #############################################################################
// ############################## ELEMENT METHODS ##############################
// #############################################################################

        methods: {
            // we don't want a bunch of data hanging in memory, so this allows
            //      the browser to forget everything and use that memory for
            //      other things. This is especially important if the ace has
            //      a boatload of data.
            'destroy': function () {
                var element = this;

                // sometimes, the element gets destroyed multiple times.
                //      we don't want to cause any errors when this happens.
                if (element.elems.root) {
                    // prevent the element from recieving any events
                    unbindElement(element);

                    // this is the fastest way to destroy all of the data
                    element.internalAce = {};
                    element.internalData = {};
                    element.internalEvents = {};
                    element.internalDisplay = {};

                    // destroy element store
                    element.elems = {};

                    // empty innerHTML
                    element.innerHTML = '';
                }
            },

            // we want to be able to have an external toolbar to toggle comments
            'toggleComments': function () {
                this.internalDisplay.editor.toggleCommentLines();
                this.internalDisplay.editor.focus();
            },

            // we want to be able to have an external toolbar to indent code
            'indentSelected': function () {
                this.internalDisplay.editor.blockIndent();
                this.internalDisplay.editor.focus();
            },

            // we want to be able to have an external toolbar to outdent code
            'outdentSelected': function () {
                this.internalDisplay.editor.blockOutdent();
                this.internalDisplay.editor.focus();
            },

            // we want to be able to extend the snippet list
            'addSnippet': function (strName, strTabTrigger, strSnippet) {
                snippetManager.register([
                    {
                        'name': strName,
                        'tabTrigger': strTabTrigger,
                        'content': strSnippet
                    }
                ]);
            },

            // we want to be able to offer different functionality depending
            //      on what the user has selected.
            'getSingleSelection': function () {
                var selection = this.internalAce.getSelection();
                var selectionRange = this.internalAce.getSelectionRange();

                if (selection.inMultiSelectMode !== true) {
                    return selectionRange;
                }

                // if the user is doing multi selection, we're not getting into
                //      that
                return {
                    "start": {"row": 0, "column": 0},
                    "end": {"row": 0, "column": 0}
                };
            },

            // sometimes, we don't want to allow the user to undo beyond a
            //      certain point. So, you can call this method to clear the
            //      undo history
            'clearUndo': function () {
                this.internalAce.session.getUndoManager().reset();
            },

            // we want to re-render the ace and it's contents
            'render': function () {
                render(this);
            },

            // we want to be able to set the search box
            'find': function (strFind, bolRegex, bolInsens, bolWholeWord) {
                var strSelector;
                var classList;
                var objSearchField;
                var regexToggle;
                var sensitiveToggle;
                var wholeToggle;

                // we only want to do something if a search string is provided
                if (strFind) {
                    // we have a search string, find
                    this.internalAce.find(strFind);
                    this.internalAce.execCommand('find');

                    // ### SEARCH FIELD ###
                    strSelector = '.ace_search_field';
                    objSearchField = xtag.query(this, strSelector)[0];
                    classList = objSearchField.classList;
                    objSearchField.value = strFind;

                    // ### REGEX BUTTON ###
                    strSelector = '.ace_button[action="toggleRegexpMode"]';
                    regexToggle = xtag.query(this, strSelector)[0];
                    classList = regexToggle.classList;

                    if (
                        // we want regex, and it's not checked, check
                        (bolRegex && !classList.contains('checked')) ||
                        // we don't want regex, and it's checked, uncheck
                        (!bolRegex && classList.contains('checked'))
                    ) {
                        GS.triggerEvent(regexToggle, 'click');
                    }

                    // ### CASE BUTTON ###
                    strSelector = '.ace_button[action="toggleCaseSensitive"]';
                    sensitiveToggle = xtag.query(this, strSelector)[0];
                    classList = sensitiveToggle.classList;

                    if (
                        // we want sensitive, and it's not checked, check
                        (!bolInsens && !classList.contains('checked')) ||
                        // we don't want sensitive, and it's checked, uncheck
                        (bolInsens && classList.contains('checked'))
                    ) {
                        GS.triggerEvent(sensitiveToggle, 'click');
                    }

                    // ### WHOLE WORDS ###
                    strSelector = '.ace_button[action="toggleWholeWords"]';
                    wholeToggle = xtag.query(this, strSelector)[0];
                    classList = wholeToggle.classList;

                    if (
                        // we want whole words, and it's not checked, check
                        (bolWholeWord && !classList.contains('checked')) ||
                        // we don't want whole words, and it's checked, uncheck
                        (!bolWholeWord && classList.contains('checked'))
                    ) {
                        GS.triggerEvent(wholeToggle, 'click');
                    }
                }
            },

            // we want to be able to change selection for the editor
            'setSelection': function (startRow, startCol, endRow, endCol) {
                var jsnRange;

                // if no start row/column have been provided: we gotta error
                if (
                    startRow === undefined || startCol === undefined ||
                    startRow === null || startCol === null
                ) {
                    throw 'GS-ACE Error: no selection start provided.';
                }

                // if only a start row/column is provided, make the selection
                //      end in the same place. effectivly moving the cursor and
                //      not having a selection
                if (
                    endRow === undefined || endCol === undefined ||
                    endRow === null || endCol === null
                ) {
                    endRow = startRow;
                    endCol = startCol;
                }

                // apply selection
                jsnRange = new Range(startRow, startCol, endRow, endCol);
                this.internalAce.selection.setSelectionRange(jsnRange);
            },

            // we need to pass the focus through
            'focus': function () {
                if (this.internalAce) {
                    this.internalAce.focus();
                }
            },

            // we want to be able to highlight portions of the text that are
            //      relevant. The primary example is the property pane in the
            //      file editor. We highlight the closest html element to the
            //      cursor and allow the user to change it in the property pane.
            'addHighlight': function (strName, stRow, stCol, enRow, enCol) {
                // we need to make sure the name is valid to use as a JSON
                //      property name and as a CSS class, because we're going to
                //      use it for both.
                if (!(/^[a-z0-9\-\_]+$/i).test('asdfasdf')) {
                    throw (
                        'GS-ACE Error: ' +
                            'invalid highlight name "' + strName + '"' +
                            ' sent to ".addHighlight()". Only use ' +
                            'alphanumeric, underscore, and/or dash.'
                    );
                }

                // if we already have one added with this name, we need to
                //      remove it before we can add it again. You can't have two
                //      with the same name.
                if (this.internalDisplay.markers[strName]) {
                    this.removeMarker(strName);
                }

                // now that we're sure that we have a good name and that we
                //      aren't going to overwrite one that already exists, let's
                //      create the marker.
                this.internalDisplay.markers[strName] = (
                    this.internalAce.session.addMarker(
                        new Range(stRow, stCol, enRow, enCol),
                        'gs-ace-marker ' + strName,
                        'background'
                    )
                );
            },

            // we want to be able to remove text highlighting
            'removeHighlight': function (strName) {
                // we don't want to remove markers that don't exist
                if (this.internalDisplay.markers[strName]) {
                    // remove the marker from ace
                    this.internalAce.session.removeMarker(
                        this.internalDisplay.markers[strName]
                    );

                    // clear our reference to the marker, so that we know it's
                    //      no longer a marker
                    this.internalDisplay.markers[strName] = null;
                }
            },

            // we need to be able to translate row/column to character number
            'rowAndColumnToCharNumber': function (stRow, stCol) {
                var strValue = getDecryptAceVal(this);
                var arrValue = strValue.split('\n');
                var charCount;
                var i;

                // if no start row/column have been provided: we gotta error
                if (
                    stRow === undefined || stCol === undefined ||
                    stRow === null || stCol === null
                ) {
                    throw 'GS-ACE Error: no row/column provided.';
                }

                // if row is beyond value, error
                if (stRow > arrValue.length) {
                    throw 'GS-ACE Error: row out of range.';
                }

                // we need to loop through each line because each line may have
                //      different amounts of characters.
                charCount = stCol;
                i = 0;
                while (i < stRow) {
                    charCount += arrValue[i].length + 1; // +1 for newline

                    // if column is beyond value, error
                    if (i === (stRow - 1) && stCol > arrValue[i].length) {
                        throw 'GS-ACE Error: column out of range.';
                    }

                    i += 1;
                }

                return charCount;
            }
        }
    });
});
