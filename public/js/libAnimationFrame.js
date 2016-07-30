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
window.lib.animation.AnimationFrame = function (options) {
    /** relation animation time, range [0...1] */
    this.time = options.time;

    /** position x attribute to animate */
    this.x = options.x || 0;

    /** position y attribute to animate */
    this.y = options.y || 0;

    /** relation size attribute, range [0...1] */
    this.size = options.size || 0;
};