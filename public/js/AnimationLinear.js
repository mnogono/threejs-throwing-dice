if (!window.animation) {
    window.animation = {};
}
/**
 * @extends lib.animation.Animation
 * @fieldOf window.coin.animation
 * @param options
 * @constructor
 */
window.animation.AnimationLinear = function (options) {
    window.animation.AnimationLinear.superclass.constructor.call(this, options);
};

window.lib.objects.extend(window.animation.AnimationLinear, window.lib.animation.Animation);

/**
 * create actual animation information depend of key frames
 * total animation duration is this.duration
 * here using key frames to linear interpolation of actual animation
 * calculate actual animation this.fps
 */
window.animation.AnimationLinear.prototype.createFrames = function() {
    this.frames = [];
    var attributes = [];
    for (var a in this.keyFrames[0]) {
        if (a !== "time") {
            attributes.push(a);
        }
    }

    for (var i = 0, len = this.keyFrames.length - 1; i < len; ++i) {
        //time difference in msec
        var diffTime = this.duration * (this.keyFrames[i + 1].time - this.keyFrames[i].time);
        var frameCount = this.fpms * diffTime;

        var diffAttributes = {};
        for (a = 0; a < attributes.length; ++a) {
            var attribute = attributes[a];
            diffAttributes[attribute] = (this.keyFrames[i + 1][attribute] - this.keyFrames[i][attribute]) / frameCount;
        }

        var dt = diffTime / frameCount;

        var attributes0 = {};
        for (a = 0; a < attributes.length; ++a) {
            attribute = attributes[a];
            attributes0[attribute] = this.keyFrames[i][attribute];
        }

        var t0 = this.duration * this.keyFrames[i].time;

        for (var f = 0; f < frameCount; ++f) {

            var animationFrame = new window.lib.animation.AnimationFrame({
                time: t0 + f * dt
            });

            for (a = 0; a < attributes.length; ++a) {
                attribute = attributes[a];
                animationFrame[attribute] = attributes0[attribute] + f * diffAttributes[attribute];
            }

            this.frames.push(animationFrame);
        }
    }
};

window.animation.AnimationLinear.prototype.createFrames_old = function () {
    var count_2 = 30 * this.duration;
    var count = count_2 + count_2;
    var dx = (this.endFrame.x - this.startFrame.x) / count;
    var dy = (this.endFrame.y - this.startFrame.y) / count;

    var frames = [];
    var size = 0;
    var dsize = 1. / count_2;

    var sizes = [];

    for (var i = 0; i < count_2; ++i) {
        var t = i * dsize;
        var s = Math.exp(-0.5 / t);
        sizes.push(s);

        frames.push(new window.lib.animation.AnimationFrame({
            x: this.startFrame.x + i * dx,
            y: this.startFrame.y + i * dy
        }));
    }

    for (i = count_2; i < count; ++i) {
        var t = (2 * count_2 - i) * dsize;
        var s = Math.exp(-0.5 / t);
        sizes.push(s);

        frames.push(new window.lib.animation.AnimationFrame({
            x: this.startFrame.x + i * dx,
            y: this.startFrame.y + i * dy
        }));
    }

    //norm sizes to 1
    var max = 0;
    for (var i = 0; i < sizes.length; ++i) {
        max = Math.max(max, sizes[i]);
    }
    for (var i = 0; i < sizes.length; ++i) {
        sizes[i] = sizes[i] / max;

        frames[i].size = 0.8 * sizes[i];
    }

    this.setFrames(frames);
};