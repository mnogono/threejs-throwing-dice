if (!window.animation) {
    window.animation = {};
}

/**
 * @extends lib.animation.Animation
 * @param options
 * @constructor
 */
window.animation.AnimationCircle = function (options) {
    this.superclass.constructor.call(this, options);

    this.middleFrame = options.middleFrame;
};

window.lib.objects.extend(window.animation.AnimationCircle, window.lib.animation.Animation);

window.animation.AnimationCircle.prototype.createFrames = function () {
    var frames = [];
    var circle = this.circleFrom3Ponts(
        this.startFrame.x,
        this.startFrame.y,
        this.endFrame.x,
        this.endFrame.y,
        this.middleFrame.x,
        this.middleFrame.y);

    this.setFrames(frames);
};

window.animation.AnimationCircle.prototype.circleFrom3Ponts = function () {
    var A = x2 - x1;
    var B = y2 - y1;
    var C = x3 - x1;
    var D = y3 - y1;
    var E = A * (x1 + x2) + B * (y1 + y2);
    var F = C * (x1 + x3) + D * (y1 + y3);
    var G = 2 * (A * (y3 - y2) - B * (x3 - x2));
    if (G != 0) {
        var Cx = (D * E - B * F) / G;
        var Cy = (A * F - C * E) / G;

        return {
            x: Cx,
            y: Cy,
            r: Math.sqrt((x1 - Cx) * (x1 - Cx) + (y1 - Cy) * (y1 - Cy))
        };
    };

    return null;
};