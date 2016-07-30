if (!window.chip) {
    window.chip = {};
}

if (!window.chip.animation) {
    window.chip.animation = {};
}

/**
 *
 * @param {object} options
 * @constructor
 */
window.chip.animation.ChipAnimation = function(options) {
    /** chip move animation duration msec */
    this.duration = options.duration || 1500;

    /** @type{string} spark url image */
    this.sparkUrl = options.sparkUrl || "/images/spark.png";

    /** @type{number} number of sparks */
    this.sparkCount = 100;

    /** @type{window.chip.spark.ChipSpark} sparks */
    this.sparks = [];
};

window.chip.animation.ChipAnimation.prototype.addSpark = function(imageSpark) {
    var img = new Image;
    img.src = imageSpark.src;

    var chipSpark = new window.chip.spark.ChipSpark({
        img: img
    });
    this.sparks.push(chipSpark);

    $("#chips").append(img);

    var animation = new window.animation.AnimationLinear({
        duration: 2000,
        onAnimationStartCallback: chipSpark.onAnimationStart,
        onAnimationCallback: chipSpark.onAnimation,
        onAnimationStopCallback: chipSpark.onAnimationStop,
        onAnimationCallbackContext: chipSpark
    });

    animation.addKeyFrame(new window.lib.animation.AnimationFrame({
        time: 0,
        x: 0,
        y: 0,
        size: 0,
        opacity: 1
    }));

    animation.addKeyFrame(new window.lib.animation.AnimationFrame({
        time: 0.7,
        x: 0,
        y: 0,
        size: 0,
        opacity: 1
    }));

    animation.addKeyFrame(new window.lib.animation.AnimationFrame({
        time: 1,
        x: 0,
        y: 0,
        size: 0,
        opacity: 1
    }));

    chipSpark.setAnimation(animation);
};

window.chip.animation.ChipAnimation.prototype.loadScene = function() {
    return new Promise(function(resolve, reject) {
        var imageSpark = new Image;
        var chipAnimation = this;
        imageSpark.onload = function() {

            for (var i = 0; i < chipAnimation.sparkCount; ++i) {
                chipAnimation.addSpark(this);
            }

            resolve();
        };
        imageSpark.src = this.sparkUrl;

    }.bind(this));
};

/**
 * start playing move player chip animation
 * @param {number} playerNum player index
 * @param {number} currentFieldId play field index
 * @param {number} nextFieldId play field index after throwing player dice (currentFieldId + dice score)
 * @param {number} lastFieldId final play field of player, special case when player stop on thunderstorm play field
 *
 * @return {Promise}
 */
window.chip.animation.ChipAnimation.prototype.play = function(playerNum, currentFieldId, nextFieldId, lastFieldId) {
    /** @type{array<object>} play fields data */
    this.fields = [];

    for (var i = 0; i < 38; ++i) {
        var pf = $("#pf-" + i);

        this.fields.push({
            x: parseFloat(pf.css("left")),
            y: parseFloat(pf.css("top")),
            width: parseFloat(pf.width()),
            height: parseFloat(pf.height())
        });
    }

    this.$chip = $('#chips').find('.player' + playerNum);

    var chipLeft = parseFloat(this.$chip.css("left"));
    var chipTop = parseFloat(this.$chip.css("top"));

    this.chipWidth_2 = parseFloat(this.$chip.css("width")) * 0.5;
    this.chipHeight_2 = parseFloat(this.$chip.css("height")) * 0.5;

    //TODO implement move direction 1 or -1 depend on player state
    var direction = 1; //listFields['field-'+currentFieldId]['type'] == 'Reverse' ? currentRangePosition-- : currentRangePosition++;

    /** @type{number} total range in px for player chip going on*/
    var totalDistance = 0;

    var fieldId = currentFieldId;
    var stepFieldId = fieldId + direction;
    if (stepFieldId > 37) {
        stepFieldId = 0;
    } else if (stepFieldId < 0) {
        stepFieldId = 37;
    }

    //calculate total distance of chip move
    var distances = [];

    var animation = new window.animation.AnimationLinear({
        duration: this.duration,
        onAnimationCallback:  this.onAnimation,
        onAnimationStartCallback: this.onAnimationStart,
        onAnimationStopCallback:  this.onAnimationStop,
        onAnimationCallbackContext: this
    });

    animation.addKeyFrame(new window.lib.animation.AnimationFrame({
        time: 0,
        x: this.fields[fieldId].x + this.fields[fieldId].width * 0.5,
        y: this.fields[fieldId].y + this.fields[fieldId].height * 0.5
    }));

    do {
        var distance = window.lib.geometry.distance(
            this.fields[fieldId].x,
            this.fields[fieldId].y,
            this.fields[stepFieldId].x,
            this.fields[stepFieldId].y);

        distances.push(distance);
        totalDistance += distance;

        fieldId = stepFieldId;
        stepFieldId += direction;
        if (stepFieldId > 37) {
            stepFieldId = 0;
        } else if (stepFieldId < 0) {
            stepFieldId = 37;
        }

        var keyFrame = new window.lib.animation.AnimationFrame({
            time: null,
            x: this.fields[fieldId].x + this.fields[fieldId].width * 0.5,
            y: this.fields[fieldId].y + this.fields[fieldId].height * 0.5
        });

        animation.addKeyFrame(keyFrame);
    } while (fieldId != nextFieldId);

    //special case when nextFieldId != lastFieldIf
    if (nextFieldId != lastFieldId) {
        var distance = window.lib.geometry.distance(
            this.fields[nextFieldId].x,
            this.fields[nextFieldId].y,
            this.fields[lastFieldId].x,
            this.fields[lastFieldId].y);

        distances.push(distance);
        totalDistance += distance;

        animation.addKeyFrame(new window.lib.animation.AnimationFrame({
            time: 1,
            x: this.fields[lastFieldId].x + this.fields[lastFieldId].width * 0.5,
            y: this.fields[lastFieldId].y + this.fields[lastFieldId].height * 0.5
        }));
    }

    //calculate animation time of each key frame

    var _distance = 0;
    for (var f = 1; f < animation.keyFrames.length; ++f) {
        if (animation.keyFrames[f].time == null) {
            _distance += distances[f - 1];
            animation.keyFrames[f].time = _distance / totalDistance;
        }
    }

    animation.createFrames();

    animation.start();

    var p = new Promise(function(resolve, reject) {
        this.animationResolve = resolve;
    }.bind(this));

    return p;
};

window.chip.animation.ChipAnimation.prototype.onAnimation = function(frame) {
    var x = frame.x - this.chipWidth_2;
    var y = frame.y - this.chipHeight_2;
    var varX = 0.5 * this.chipWidth_2;
    var varY = 0.5 * this.chipHeight_2;

    this.$chip.css({
        left: x + "px",
        top: y + "px"
    });

    if (this.sparkIndex < this.sparks.length) {
        var spark = this.sparks[this.sparkIndex];

        spark.animation.keyFrames[0].x = frame.x + varX - 2 * varX * Math.random();
        spark.animation.keyFrames[0].y = frame.y + varY - 2 * varY * Math.random();
        spark.animation.keyFrames[0].size = 0.2;
        spark.animation.keyFrames[0].opacity = 1;

        spark.animation.keyFrames[1].x = frame.x + varX - 2 * varX * Math.random();
        spark.animation.keyFrames[1].y = frame.y + varY - 2 * varY * Math.random();
        spark.animation.keyFrames[1].size = 0.3;
        spark.animation.keyFrames[1].opacity = 1;

        spark.animation.keyFrames[2].x = frame.x + varX - 2 * varX * Math.random();
        spark.animation.keyFrames[2].y = frame.y + varY - 2 * varY * Math.random();
        spark.animation.keyFrames[2].size = 0.1;
        spark.animation.keyFrames[2].opacity = 0.0;

        spark.animation.createFrames();

        spark.animation.start();

        ++this.sparkIndex;
        //if (this.sparkIndex >= this.sparks.length) {
        //    this.sparkIndex = 0;
        //}
    }
};

window.chip.animation.ChipAnimation.prototype.onAnimationStart = function() {
    this.sparkIndex = 0;
};

window.chip.animation.ChipAnimation.prototype.onAnimationStop = function() {
    this.animationResolve();
};