window.Range = require('ace/range').Range;

document.addEventListener('DOMContentLoaded', function () {
    xtag.register('gs-ui-test', {
        lifecycle: {
            created: function() {
                // Add root
                var root = document.createElement('div');
                root.classList.add('root');
                this.appendChild(root);
                this.root = root;
                
                // Add heading
                var heading = document.createElement('div');
                heading.innerText = this.getAttribute('heading') + ':';
                this.root.appendChild(heading);
                
                // Get templates
                var template = this.querySelector('template');
                this.HTMLTemplate = '<!-- HTML -->\n' + html_beautify(template.innerHTML);
                template = this.querySelectorAll('template')[1];
                if (template) {
                    this.JSTemplate = '// JS\n' + template.innerHTML;
                } else {
                    this.JSTemplate = '// JS\n';
                }
                
                // Add grid
                this.grid = this.root.appendChild(document.createElement('gs-grid'));
                this.grid.setAttribute('width', '36');
                
                // Add code view block
                this.codeViewBlock = this.grid.appendChild(document.createElement('gs-block'));
                this.codeViewBlock.setAttribute('width', '18');
                
                // Init ace
                this.HTMLArea = this.codeViewBlock.appendChild(document.createElement('div'));
                var guid = GS.GUID();
                this.HTMLArea.setAttribute('id', 'area' + guid);
                this.HTMLEditor = ace.edit('area' + guid);
                
                this.JSArea = this.codeViewBlock.appendChild(document.createElement('div'));
                guid = GS.GUID();
                this.JSArea.setAttribute('id', 'area' + guid);
                this.JSEditor = ace.edit('area' + guid);
                
                // Set options
                this.HTMLEditor.setTheme('ace/theme/eclipse');
                this.HTMLEditor.getSession().setMode('ace/mode/html');
                this.HTMLEditor.setShowPrintMargin(false);
                this.HTMLEditor.setDisplayIndentGuides(true);
                this.HTMLEditor.setShowFoldWidgets(false);
                this.HTMLEditor.session.setUseWrapMode('free');
                this.HTMLEditor.setBehavioursEnabled(false);
                this.HTMLEditor.$blockScrolling = Infinity; // <== blocks a warning
                this.HTMLEditor.setOptions({
                    'enableBasicAutocompletion': true,
                    'enableSnippets'           : true,
                    'enableLiveAutocompletion' : true
                });
                this.HTMLEditor.getSession().setUseWorker(false);
                
                this.JSEditor.setTheme('ace/theme/eclipse');
                this.JSEditor.getSession().setMode('ace/mode/javascript');
                this.JSEditor.setShowPrintMargin(false);
                this.JSEditor.setDisplayIndentGuides(true);
                this.JSEditor.setShowFoldWidgets(false);
                this.JSEditor.session.setUseWrapMode('free');
                this.JSEditor.setBehavioursEnabled(false);
                this.JSEditor.$blockScrolling = Infinity; // <== blocks a warning
                this.JSEditor.setOptions({
                    'enableBasicAutocompletion': true,
                    'enableSnippets'           : true,
                    'enableLiveAutocompletion' : true
                });
                this.JSEditor.getSession().setUseWorker(false);
                
                // Set value
                this.HTMLEditor.setValue(this.HTMLTemplate);
                this.JSEditor.setValue(this.JSTemplate);
                
                // Device specific stuff
                if (evt.touchDevice) {
                    this.HTMLEditor.setOptions({
                        maxLines: Infinity
                    });
                    this.JSEditor.setOptions({
                        maxLines: Infinity
                    });
                    
                } else {
                    this.HTMLArea.style.height = '10em';
                    this.JSArea.style.height = '10em';
                }
                
                this.HTMLEditor.selection.setSelectionRange(new Range(0, 0, 0, 0));
                this.JSEditor.selection.setSelectionRange(new Range(0, 0, 0, 0));
                
                // Add preview
                this.previewBlock = this.grid.appendChild(document.createElement('gs-block'));
                this.previewBlock.setAttribute('width', '18');
                this.previewBlock.innerHTML = '<div>' + this.HTMLTemplate + '</div>';
                
                this.previewBlock.firstElementChild.style.height = this.codeViewBlock.clientHeight + 'px';
                
                var self = this;
                this.HTMLEditor.on('change', function () {
                    self.HTMLTemplate = self.HTMLEditor.getValue();
                    self.JSTemplate = self.JSEditor.getValue();
                    self.previewBlock.innerHTML = '<div>' + self.HTMLTemplate + '</div>';
                    
                    self.previewBlock.firstElementChild.style.height = self.codeViewBlock.clientHeight + 'px';
                    
                    try {
                        // I know it is very much like eval but this is safe
                        new Function(self.JSTemplate).apply();
                    } catch (e) {
                        console.error(e);
                    }
                });
                this.JSEditor.on('change', function () {
                    self.HTMLTemplate = self.HTMLEditor.getValue();
                    self.JSTemplate = self.JSEditor.getValue();
                    self.previewBlock.innerHTML = '<div>' + self.HTMLTemplate + '</div>';
                    
                    self.previewBlock.firstElementChild.style.height = self.codeViewBlock.clientHeight + 'px';
                    
                    try {
                        // I know it is very much like eval but this is safe
                        new Function(self.JSTemplate).apply();
                    } catch (e) {
                        console.error(e);
                    }
                });
                try {
                    // I know it is very much like eval but this is safe
                    new Function(self.JSTemplate).apply();
                } catch (e) {
                    console.error(e);
                }
            }
        }
    });
});