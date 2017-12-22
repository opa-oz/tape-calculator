(function (document) {
    // Expression pattern
    var PATTERN = "${a} + ${b} = ${sum}";
    // Expression default symbol
    var DEFAULT_SYMBOL = '?';
    // Ellipsis kappa
    var KAPPA = .5522848;
    // Canvas/tape sizes
    var TAPE_SIZES = {
        WIDTH: 900,
        HEIGHT: 105,
        MARGIN_LEFT: 39,
        STEP: 41 // step between numbers
    };
    // Max value of tape
    var MAX_NUMBER = 20;
    // Width of input size
    var INPUT_SIZE = 20;
    // Frequency enum
    var STEPS = {
        DONE: 1,
        PRINT_FIRST: 2,
        PRINT_SECOND: 4,
        PRINT_SUM: 8
    };

    var expressionElement = document.getElementById('expression');
    var canvasElement = document.getElementById('canvas');
    var firstNumberElement = document.getElementById('firstNumber');
    var secondNumberElement = document.getElementById('secondNumber');
    var lastNumberElement = document.getElementById('lastNumber');

    var ctx = canvasElement.getContext('2d');
    var tape = new Image();
    var currentExpression = getRandomCorners();
    var inputValues = {};
    var step = STEPS.PRINT_FIRST;

    canvasElement.width = TAPE_SIZES.WIDTH;
    canvasElement.height = TAPE_SIZES.HEIGHT * 2;

    tape.src = 'assets/tape.png';
    tape.onload = init;

    /**
     * Init function. Start logic here
     */
    function init() {
        renderExpression();
        renderTape();
        renderStep();

        firstNumberElement
            .addEventListener('keypress', onlyNumbersHandler);
        firstNumberElement
            .addEventListener('change', changeHandler('a', STEPS.PRINT_SECOND));

        secondNumberElement
            .addEventListener('keypress', onlyNumbersHandler);
        secondNumberElement
            .addEventListener('change', changeHandler('b', STEPS.PRINT_SUM));

        lastNumberElement
            .addEventListener('keypress', onlyNumbersHandler);
        lastNumberElement
            .addEventListener('change', changeHandler('sum', STEPS.DONE));
    }

    /* HANDLERS */

    /**
     * Handle change event
     * @param {String} field field for listening
     * @param {Number} nextStep
     * @returns {Function} callback
     */
    function changeHandler(field, nextStep) {
        var validValue = currentExpression[field] || 0;

        return function (e) {
            var target = e.target;
            var value = parseInt(target.value, 10);

            inputValues[field] = value;

            if (value === validValue) {
                step = nextStep;
                renderStep();
            }
        };
    }

    /**
     * Allow only numbers in input
     * @param {Object} e event object
     */
    function onlyNumbersHandler(e) {
        var isInvalid = isNaN(parseInt(e.key, 10));

        isInvalid && e.preventDefault();
    }

    /* end HANDLERS*/

    /* RENDER */

    /**
     * Render next flow step
     */
    function renderStep() {
        switch (step) {
            case STEPS.PRINT_FIRST:
                renderLine(0, currentExpression.a);
                renderInput(firstNumberElement, 0, currentExpression.a);
                break;
            case STEPS.PRINT_SECOND:
                renderLabelInsteadOfInput(firstNumberElement);
                renderLine(currentExpression.a, currentExpression.b);
                renderInput(secondNumberElement, currentExpression.a, currentExpression.b);
                break;
            case STEPS.PRINT_SUM:
                renderLabelInsteadOfInput(secondNumberElement);
                lastNumberElement.style.display = 'block';
                lastNumberElement.style.right = '-5px';
                break;
            case STEPS.DONE:
                lastNumberElement.style.display = 'none';
                break;
            default:
                break;
        }

        renderExpression(inputValues);
    }

    /**
     * Render current active input
     * @param {Node} input target input
     * @param {Number} start left corner
     * @param {Number} finish right corner
     */
    function renderInput(input, start, finish) {
        var mid = finish / 2;

        input.style.display = 'block';
        input.style.top = INPUT_SIZE + 'px';
        input.style.left = (TAPE_SIZES.MARGIN_LEFT + (TAPE_SIZES.STEP * start) + (TAPE_SIZES.STEP * mid) - (INPUT_SIZE / 2)) + 'px';

        input.focus();
    }

    /**
     * Replace input with label
     * @param {Node} input target input
     */
    function renderLabelInsteadOfInput(input) {
        var label = document.createElement('span');

        label.innerText = input.value;
        label.style.display = 'block';
        label.style.position = 'absolute';
        label.style.top = input.style.top;
        label.style.left = input.style.left;

        input.parentNode.replaceChild(label, input);
    }

    /**
     * Render line
     * @param {Number} start `from` position
     * @param {Number} finish `to` position
     */
    function renderLine(start, finish) {
        var x = TAPE_SIZES.MARGIN_LEFT + TAPE_SIZES.STEP * start;
        var y = TAPE_SIZES.HEIGHT / 2;
        var w = TAPE_SIZES.MARGIN_LEFT + TAPE_SIZES.STEP * (finish - 1);
        var h = TAPE_SIZES.HEIGHT;
        var ox = (w / 2) * KAPPA;
        var oy = (h / 2) * KAPPA;
        var xe = x + w;
        var ye = y + h;
        var xm = x + w / 2;
        var ym = y + h / 2;
        var headlen = 10;
        var angle = Math.atan2(5, 1);

        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(x, ym);
        ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        ctx.stroke();

        ctx.moveTo(xm, ym);
        ctx.beginPath();
        ctx.lineTo(xe, ym);
        ctx.lineTo(xe - headlen * Math.cos(angle - Math.PI / 6), ym - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(xe, ym);
        ctx.lineTo(xe - headlen * Math.cos(angle + Math.PI / 6), ym - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }

    /**
     * Render expression at top of page
     * @param {Object} values `a`, `b`, `sum` values
     */
    function renderExpression(values) {
        values = values || {};

        expressionElement.innerText = PATTERN.replace(/(\${[a-zA-Z]+})/gi, function (group) {
            group = group.replace(/[${}]/gi, '');

            if (values.hasOwnProperty(group)) {
                return values[group];
            }

            return DEFAULT_SYMBOL;
        });
    }

    /**
     * Render tape image
     */
    function renderTape() {
        ctx.drawImage(tape, 0, TAPE_SIZES.HEIGHT, TAPE_SIZES.WIDTH, TAPE_SIZES.HEIGHT);
    }

    /* end RENDER */

    /* UTIL */

    /**
     * Get random corners of expression
     * @returns {{a: Number, b: Number, sum: Number}}
     */
    function getRandomCorners() {
        var a = getRandomInt(1, MAX_NUMBER / 2);
        var b = getRandomInt(1, MAX_NUMBER - a);

        return {a: a, b: b, sum: a + b};
    }

    /**
     * Get random integer between [min, max]
     * @param {Number} min minimum value
     * @param {Number} max maximum value
     * @returns {number}
     */
    function getRandomInt(min, max) {
        var random = min - 0.5 + Math.random() * (max - min + 1);

        return Math.round(random);
    }

    /* end UTIL */
})(document);
