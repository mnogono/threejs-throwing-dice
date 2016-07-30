if (!window.lib) {
    window.lib = {};
}

if (!window.lib.animation) {
    window.lib.animation = {};
}

/**
 * @fieldOf window.lib.animation
 * @param options
 * @constructor
 */
window.lib.animation.Animation = function (options) {
    /** animation duration in msec */
    this.duration = options.duration || 1000;

    /** frames per msec */
    this.fpms = options.fpms || 0.06;

    /** @type {Array<window.lib.animation.AnimationFrame>} actual animation frames */
    this.frames = [];

    /** time spend from start of animation msec */
    this.time = 0;

    /** @type{boolean} flag animation is stopped */
    this.stopped = true;

    /** @type{Array<window.lib.animation.AnimationFrame>} key frames */
    this.keyFrames = [];

    //this.startFrame = null;
    //this.endFrame = null;

    this.prevFrameIndex = 0;

    this.onAnimationStartCallback = options.onAnimationStartCallback;
    this.onAnimationCallback = options.onAnimationCallback;
    this.onAnimationStopCallback = options.onAnimationStopCallback;
    this.onAnimationCallbackContext = options.onAnimationCallbackContext;
};

/**
 * add new key frame to animation
 * @param {window.lib.animation.AnimationFrame} keyFrame
 */
window.lib.animation.Animation.prototype.addKeyFrame = function(keyFrame) {
    this.keyFrames.push(keyFrame);
};

/*
window.lib.animation.Animation.prototype.setStartFrame = function (frame) {
    this.startFrame = frame;
};

window.lib.animation.Animation.prototype.setEndFrame = function (frame) {
    this.endFrame = frame;
};
*/

window.lib.animation.Animation.prototype.setFrames = function (frames) {
    this.frames = frames;
};

window.lib.animation.Animation.prototype.start = function () {
    this.time = 0;
    this.stopped = false;
    this.lastTimestamp = 0;
    this.prevFrameIndex = 0;

    this.onAnimationStartCallback && this.onAnimationStartCallback.call(this.onAnimationCallbackContext);

    this.onAnimationRequest();
};

window.lib.animation.Animation.prototype.onAnimationRequest = function (timestamp) {
    if (this.stopped == true) {
        return;
    }

    if (!timestamp) {
        requestAnimationFrame(this.onAnimationRequest.bind(this));
        return;
    }

    if (!this.lastTimestamp) {
        this.lastTimestamp = timestamp;
        requestAnimationFrame(this.onAnimationRequest.bind(this));
        return
    }

    this.time += timestamp - this.lastTimestamp;

    if (this.time > this.frames[this.frames.length - 1].time) {
        this.stop();
    } else {
        this.lastTimestamp = timestamp;

        var i = this.prevFrameIndex;

        while (this.time > this.frames[i].time) {
            ++i;
        }
        this.prevFrameIndex = i;

        this.onAnimationCallback && this.onAnimationCallback.call(this.onAnimationCallbackContext, this.frames[i]);

        requestAnimationFrame(this.onAnimationRequest.bind(this));
    }


    /*
    var frameIndex = Math.floor(this.frames.length * (this.time / this.duration));

    if (frameIndex < this.frames.length) {
        this.onAnimationCallback && this.onAnimationCallback.call(this.onAnimationCallbackContext, this.frames[frameIndex]);

        requestAnimationFrame(this.onAnimationRequest.bind(this));
    } else {
        this.stop();
    }
    */
};

/**
 * create animation frmaes (actual animation)
 * override this function
 */
window.lib.animation.Animation.prototype.createFrames = function () {};

window.lib.animation.Animation.prototype.stop = function () {
    this.stopped = true;
    this.time = 0;
    this.prevFrameIndex = 0;

    this.onAnimationStopCallback && this.onAnimationStopCallback.call(this.onAnimationCallbackContext);
};
