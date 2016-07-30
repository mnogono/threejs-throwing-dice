if (!window.coin) {
    window.coin = {};
}

window.coin.Coin = function (options) {
    this.img = options.img;

    $(this.img).addClass("coin");
    $(this.img).addClass("invisible");

    this.imgWidth = this.img.width;
};

window.coin.Coin.prototype.setAnimation = function(animation) {
    this.animation = animation;
};

window.coin.Coin.prototype.onAnimation = function(frame) {
    $(this.img).css({
        left: frame.x + "px",
        top: frame.y + "px",
        width: frame.size * this.imgWidth / this.scaleFactor + "px"
    });
};

window.coin.Coin.prototype.onAnimationStart = function() {
    this.scaleFactor = window.lib.objects.monopolyScaleFactor();

    $(this.img).removeClass("invisible");
};

window.coin.Coin.prototype.onAnimationStop = function() {
    $(this.img).addClass("invisible");
};