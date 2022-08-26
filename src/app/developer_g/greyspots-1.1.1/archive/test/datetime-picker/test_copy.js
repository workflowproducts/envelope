document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var arrTakenContainers = [], intScrollBarWidth;

    function getScrollBarWidth() {
        var inner = document.createElement('div'),
            outer = document.createElement('div'),
            intWidth;

        inner.style.height = '200px';

        outer.style.position = 'absolute';
        outer.style.top = '0';
        outer.style.left = '0';
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';

        outer.style.width = '50px';
        outer.style.height = '100px';

        outer.appendChild(inner);
        document.body.appendChild(outer);

        intWidth = (outer.offsetWidth - inner.offsetWidth);

        document.body.removeChild(outer);

        return intWidth;
    }

    function dragStartHandler(event) {
        var wheel = this;
        var element = wheel.element;
        wheel.dragStart = event.pageY;
        wheel.rotationStart = wheel.rotation;
        wheel.numbersRotated = 1;

        window.ontouchmove = function (event) {
            event.preventDefault();
            event.stopPropagation();
        };

        var dragHandler = function (event) {
            var diff = wheel.dragStart - event.pageY;

            wheel.rotation += diff;
            wheel.setAttribute('style', 'transform: translateZ(-' + element.radius + ') rotateX(' + wheel.rotation + 'deg);');

            if (wheel.name.toUpperCase() !== 'AM' && wheel.name.toUpperCase() !== 'PM') {
                if ((wheel.rotation - wheel.rotationStart) > (wheel.numbersRotated * wheel.rotationInterval)) {
                    wheel.numbersRotated += 1;
    
                    wheel.removeChild(wheel.firstChild);
                    var newRotation = parseFloat(wheel.lastChild.getAttribute('rotation')), newNumber = parseInt(wheel.lastChild.innerText, 10) + 1;
                    newRotation -= wheel.rotationInterval;
                    if (newRotation > 180) {
                        newRotation -= 360;
                    } else if (newRotation < -180) {
                        newRotation += 360;
                    }
                    if (newNumber >= (wheel.max + 1)) {
                        newNumber -= (wheel.max + 1);
                    }
                    wheel.appendChild(GS.stringToElement('<span rotation="' + newRotation + '" style="transform: rotateX(' + newRotation + 'deg) translateZ(' + element.radius + ');">' + GS.leftPad(newNumber, '0', 2) + '</span>'));
    
                } else if ((wheel.rotation - wheel.rotationStart) < ((wheel.numbersRotated - 1) * wheel.rotationInterval)) {
                    wheel.numbersRotated -= 1;
                    
                    wheel.removeChild(wheel.lastChild);
                    var newRotation = parseFloat(wheel.firstChild.getAttribute('rotation')), newNumber = parseInt(wheel.firstChild.innerText, 10) - 1;
                    newRotation += wheel.rotationInterval;
                    if (newRotation > 180) {
                        newRotation -= 360;
                    } else if (newRotation < -180) {
                        newRotation += 360;
                    }
                    if (newRotation > 180) {
                        newRotation -= 360;
                    }
                    if (newNumber < wheel.min) {
                        newNumber += (wheel.max + 1);
                    }
                    wheel.insertBefore(GS.stringToElement('<span rotation="' + newRotation + '" style="transform: rotateX(' + newRotation + 'deg) translateZ(' + element.radius + ');">' + GS.leftPad(newNumber, '0', 2) + '</span>'), wheel.firstChild);
                }
            }

            wheel.dragStart = event.pageY;
        };

        var dragStopHandler = function (event) {
            window.ontouchmove = null;

            if (wheel.rotation >= 0 && (wheel.rotation % wheel.rotationInterval) < (wheel.rotationInterval / 2)) {
                wheel.rotation += wheel.rotationInterval - (wheel.rotation % wheel.rotationInterval);
            } else if (Math.abs(wheel.rotation % wheel.rotationInterval) > (wheel.rotationInterval / 2)) {
                wheel.rotation -= wheel.rotationInterval - Math.abs(wheel.rotation % wheel.rotationInterval);
            } else {
                wheel.rotation -= wheel.rotation % wheel.rotationInterval;
            }

            while (wheel.rotation > 180) {
                wheel.rotation -= 360;
            }
            while (wheel.rotation < -180) {
                wheel.rotation += 360;
            }

            wheel.setAttribute('style', 'transform: translateZ(-' + element.radius + ') rotateX(' + wheel.rotation + 'deg);');

            window.removeEventListener(evt.mousemove, dragHandler);
            window.removeEventListener(evt.mouseup, dragStopHandler);
        };

        window.addEventListener(evt.mousemove, dragHandler);
        window.addEventListener(evt.mouseup, dragStopHandler);
    }

    intScrollBarWidth = getScrollBarWidth();

    // dont do anything that modifies the element here
    function elementCreated(element) {
        // if "created" hasn't been suspended: run created code
        if (!element.hasAttribute('suspend-created')) {

        }
    }

    //
    function elementInserted(element) {
        var styleElement, i, len, wheelHTML;

        // if "created" hasn't been suspended and "inserted" hasn't been suspended: run inserted code
        if (!element.hasAttribute('suspend-created') && !element.hasAttribute('suspend-inserted')) {
            // if this is the first time inserted has been run: continue
            if (!element.inserted) {
                element.inserted = true;

                element.arrOption = [[]];
                for (i = 0, len = 60; i < len; i += 1) {
                    element.arrOption[0].push(i);
                }

                element.radius = '4em'; //(element.clientHeight / 2) + 'px';
                element.wheelNames = element.getAttribute('wheels').split(',');
                // -180 will select the first number
                wheelHTML = new Array(element.wheelNames.length + 1).join(ml(function () {/*
                    <div class="dial">
                        <div class="transparent top"></div>
                        <div class="transparent bottom"></div>
                        <div class="container">
                            <div class="wheel" style="transform: translateZ(-{{RADIUS}}) rotateX(-180deg);"></div>
                        </div>
                    </div>
                */}));

                element.innerHTML = ml(function () {/*
                    <div gs-dynamic class="root">
                        {{WHEELS}}
                    </div>
                */}).replace('{{WHEELS}}', wheelHTML).replace(/\{\{RADIUS\}\}/g, element.radius);

                element.wheels = xtag.query(element, '.wheel');
                for (i = 0, len = element.wheels.length; i < len; i += 1) {
                    element.wheels[i].rotation = -180;
                    element.wheels[i].element = element;
                    element.wheels[i].addEventListener(evt.mousedown, dragStartHandler);
                    element.wheels[i].rotationInterval = 360 / 16;
                    element.wheels[i].name = element.wheelNames[i];
                    if (element.wheelNames[i] === 'hh' || element.wheelNames[i] === 'MM') {
                        element.wheels[i].min = 1;
                        element.wheels[i].max = 12;
                    } else if (element.wheelNames[i] === 'HH') {
                        element.wheels[i].min = 0;
                        element.wheels[i].max = 23;
                    } else if (element.wheelNames[i] === 'mm' || element.wheelNames[i] === 'ss') {
                        element.wheels[i].min = 0;
                        element.wheels[i].max = 59;
                    } else if (element.wheelNames[i] === 'DD') {
                        element.wheels[i].min = 1;
                        element.wheels[i].max = 31;
                    } else if (element.wheelNames[i] === 'YY') {
                        element.wheels[i].min = 0;
                        element.wheels[i].max = 99;
                    } else if (element.wheelNames[i] === 'YYYY') {
                        element.wheels[i].min = 0;
                        element.wheels[i].max = 10000;
                        element.wheels[i].parentNode.style.width = '3.25em';

                    } else if (element.wheelNames[i].toUpperCase() === 'AM' || element.wheelNames[i].toUpperCase() === 'PM') {
                        element.wheels[i].max = 7; // to fix the for below
                    }

                    for (var rotation = 0, j = element.wheels[i].max - 7; rotation > -360; rotation -= element.wheels[i].rotationInterval, j += 1) {
                        if (element.wheelNames[i].toUpperCase() === 'AM' || element.wheelNames[i].toUpperCase() === 'PM') {
                            element.wheels[i].appendChild(GS.stringToElement('<span rotation="' + rotation + '" style="transform: rotateX(' + rotation + 'deg) translateZ(' + element.radius + ');">' + ((j % 2) === 0 ? 'AM' : 'PM') + '</span>'));
                        } else {
                            element.wheels[i].appendChild(GS.stringToElement('<span rotation="' + rotation + '" style="transform: rotateX(' + rotation + 'deg) translateZ(' + element.radius + ');">' + GS.leftPad(j, '0', 2) + '</span>'));
                            if (j === element.wheels[i].max) {
                                j = element.wheels[i].min - 1;
                            }
                        }
                    }
                }

            }
        }
    }

    xtag.register('gs-datetime', {
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

    xtag.register('gs-wheel', {
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