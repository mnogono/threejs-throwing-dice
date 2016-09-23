if (!window.chip) {
    window.chip = {};
}

if (!window.chip.animation) {
    window.chip.animation = {};
}

/*
 jQuery animateNumber plugin v0.0.13
 (c) 2013, Alexandr Borisov.
 https://github.com/aishek/jquery-animateNumber
 */
(function(d){var q=function(b){return b.split("").reverse().join("")},m={numberStep:function(b,a){var e=Math.floor(b);d(a.elem).text(e)}},h=function(b){var a=b.elem;a.nodeType&&a.parentNode&&(a=a._animateNumberSetter,a||(a=m.numberStep),a(b.now,b))};d.Tween&&d.Tween.propHooks?d.Tween.propHooks.number={set:h}:d.fx.step.number=h;d.animateNumber={numberStepFactories:{append:function(b){return function(a,e){var g=Math.floor(a);d(e.elem).prop("number",a).text(g+b)}},separator:function(b,a,e){b=b||" ";
    a=a||3;e=e||"";return function(g,k){var c=Math.floor(g).toString(),t=d(k.elem);if(c.length>a){for(var f=c,l=a,m=f.split("").reverse(),c=[],n,r,p,s=0,h=Math.ceil(f.length/l);s<h;s++){n="";for(p=0;p<l;p++){r=s*l+p;if(r===f.length)break;n+=m[r]}c.push(n)}f=c.length-1;l=q(c[f]);c[f]=q(parseInt(l,10).toString());c=c.join(b);c=q(c)}t.prop("number",g).text(c+e)}}}};d.fn.animateNumber=function(){for(var b=arguments[0],a=d.extend({},m,b),e=d(this),g=[a],k=1,c=arguments.length;k<c;k++)g.push(arguments[k]);
    if(b.numberStep){var h=this.each(function(){this._animateNumberSetter=b.numberStep}),f=a.complete;a.complete=function(){h.each(function(){delete this._animateNumberSetter});f&&f.apply(this,arguments)}}return e.animate.apply(e,g)}})(jQuery);


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
        duration: 500,
        onAnimationStartCallback: chipSpark.onAnimationStart,
        onAnimationCallback: chipSpark.onAnimation,
        onAnimationStopCallback: chipSpark.onAnimationStop,
        onAnimationCallbackContext: chipSpark
    });

    animation.addKeyFrame(new window.lib.animation.AnimationFrame({
        time: 0,
        x: 0,
        y: 0,
        size: 0.1,
        opacity: 0
    }));

    animation.addKeyFrame(new window.lib.animation.AnimationFrame({
        time: 0.3,
        x: 0,
        y: 0,
        size: 0.3,
        opacity: 1
    }));

    animation.addKeyFrame(new window.lib.animation.AnimationFrame({
        time: 0.7,
        x: 0,
        y: 0,
        size: 0.3,
        opacity: 1
    }));

    animation.addKeyFrame(new window.lib.animation.AnimationFrame({
        time: 1,
        x: 0,
        y: 0,
        size: 0.1,
        opacity: 0
    }));

    chipSpark.setAnimation(animation);
};

window.chip.animation.ChipAnimation.prototype.loadScene = function() {
    return new Promise(function(resolve, reject) {
        var imageSpark = new Image;
        $(imageSpark).addClass("invisible");

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
    var varX = 1 * this.chipWidth_2;
    var varY = 1 * this.chipHeight_2;

    //find out chip move direction
    var x0 = parseFloat(this.$chip.css("left"));
    var y0 = parseFloat(this.$chip.css("top"));

    var vec = window.lib.geometry.coordinate2Vector(x0, y0, x, y);
    window.lib.geometry.normalizeVector(vec);

    this.$chip.css({
        left: x + "px",
        top: y + "px"
    });

    if (this.sparkIndex < this.sparks.length) {
        var spark = this.sparks[this.sparkIndex];

        var x2 = frame.x + varX - 2 * varX * Math.random() - 30 * vec[0];
        var y2 = frame.y + varY - 2 * varY * Math.random() + 30 * vec[1];

        var dt0 = spark.animation.keyFrames[0].time;
        spark.animation.keyFrames[0].x =  frame.x;
        spark.animation.keyFrames[0].y =  frame.y;

        var dt1 = dt0 + spark.animation.keyFrames[1].time;
        spark.animation.keyFrames[1].x =  frame.x + dt1 * (x2 - frame.x);
        spark.animation.keyFrames[1].y =  frame.y + dt1 * (y2 - frame.y);

        var dt2 = dt1 + spark.animation.keyFrames[2].time;
        spark.animation.keyFrames[2].x =  frame.x + dt2 * (x2 - frame.x);
        spark.animation.keyFrames[2].y =  frame.y + dt2 * (y2 - frame.y);

        spark.animation.keyFrames[3].x =  x2;
        spark.animation.keyFrames[3].y =  y2;

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