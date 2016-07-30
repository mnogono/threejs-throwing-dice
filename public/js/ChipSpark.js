if (!window.chip) {
    window.chip = {};
}

if (!window.chip.spark) {
    window.chip.spark = {};
}

window.chip.spark.ChipSpark = function(options) {
    this.img = options.img;
    $(this.img).addClass("spark");
    $(this.img).addClass("invisible");

    this.sparkWidth = this.img.width;

    this.sparkWidth_2 = this.img.width * 0.5;
    this.sparkHeight_2 = this.img.height * 0.5;
};

window.chip.spark.ChipSpark.prototype.setAnimation = function(animation) {
    this.animation = animation;
};

window.chip.spark.ChipSpark.prototype.onAnimation = function(frame) {
    var x = frame.x;// - (this.sparkWidth_2 / this.scaleFactor);
    var y = frame.y;// - (this.sparkHeight_2 / this.scaleFactor);

    $(this.img).css({
        left: x + "px",
        top:y + "px",
        width: this.sparkWidth * frame.size / this.scaleFactor + "px",
        opacity: frame.opacity
    });
};

window.chip.spark.ChipSpark.prototype.onAnimationStart = function() {
    this.scaleFactor = window.lib.objects.monopolyScaleFactor();
    $(this.img).removeClass("invisible");
};

window.chip.spark.ChipSpark.prototype.onAnimationStop = function() {
    $(this.img).addClass("invisible");
};