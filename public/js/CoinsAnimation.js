if (!window.coin) {
    window.coin = {};
}

if (!window.coin.animation) {
    window.coin.animation = {};
}

window.coin.animation.CoinsAnimation = function (options) {
    /** animation duration msec */
    this.duration = options.duration || 1500;

    /** coins count */
    this.count = 35;//options.count || 10;

    /** @type{Array<window.coin.Coin>} */
    this.coins = [];

    this.url = options.url || "/image/coin.png";

    this.animationResolve = null;
};

/**
 * just create and add coin
 * @private
 * */
window.coin.animation.CoinsAnimation.prototype.addCoin = function(imageCoin) {
    var img = new Image;
    img.src = imageCoin.src;

    this.coins.push(new window.coin.Coin({
        img: img
    }));

    $("body").append(img);
};

/**
 * play animation to flay some coins from player1 to player2
 * @param {string} player1 player from container id, like "#player-1"
 * @param {string} player2 player to container id, like "#player-5"
 * @param {number} player1 cash after transaction
 * @param {number} player2 cash after transaction
 * @return Promise when animation will be end
 * */
window.coin.animation.CoinsAnimation.prototype.play = function(player1, player2, player1Cash, player2Cash) {
    //calculate center of each players containers

    var decimalPointSeparator = $.animateNumber.numberStepFactories.separator('.');
    $(player1+ " .cash span").animateNumber({
        number: player1Cash,
        numberStep: decimalPointSeparator
    });

    $(player2+ " .cash span").animateNumber({
        number: player2Cash,
        numberStep: decimalPointSeparator
    });

    var offset1 = $(player1).offset();
    var x1 = offset1.left + $(player1).width() * 0.5;
    var y1 = offset1.top + $(player1).height() * 0.5;

    var offset2 = $(player2).offset();
    var x2 = offset2.left + $(player2).width() * 0.5;
    var y2 = offset2.top + $(player2).height() * 0.5;

    var x3 = (x1 + x2) * 0.5 - 300;
    var y3 = (y1 + y2) * 0.5;

    var xVarRadius = $(player1).width() * 0.5;
    var yVarRadius = $(player1).height() * 0.5;

    for (var i = 0; i < this.coins.length; ++i) {
        var coin = this.coins[i];

        var animation = new window.animation.AnimationLinear({
            duration: this.duration + 250 - 500 * Math.random(),
            onAnimationCallback:  coin.onAnimation,
            onAnimationStartCallback: coin.onAnimationStart,
            onAnimationStopCallback:  coin.onAnimationStop,
            onAnimationCallbackContext: coin
        });

        var _x1 = x1 + Math.ceil(xVarRadius - Math.random() * 2 * xVarRadius);
        var _y1 = y1 + Math.ceil(yVarRadius - Math.random() * 2 * yVarRadius);

        var _x2 = x2 + 0.25 * Math.ceil(xVarRadius - Math.random() * 2 * xVarRadius);
        var _y2 = y2  + 0.25 * Math.ceil(yVarRadius - Math.random() * 2 * yVarRadius);

        animation.addKeyFrame(new window.lib.animation.AnimationFrame({
            time: 0,
            x: _x1,
            y: _y1,
            size: 0.2
        }));

        animation.addKeyFrame(new window.lib.animation.AnimationFrame({
            time: 0.5,
            x: (_x1 + _x2) * 0.5,
            y: (_y1 + _y2) * 0.5,
            size: 1
        }));

        animation.addKeyFrame(new window.lib.animation.AnimationFrame({
            time: 1,
            x: _x2,
            y: _y2,
            size: 0.2
        }));

        animation.createFrames();

        coin.setAnimation(animation);
    }

    var p = new Promise(function(resolve, reject) {
        this.animationResolve = resolve;
    }.bind(this));

    for (i = 0; i < this.coins.length; ++i) {
        this.coins[i].animation.start();
    }

    this.onAnimation();

    return p;
};

window.coin.animation.CoinsAnimation.prototype.onAnimation = function() {
    if (this.coins.every(function(coin) {
            return coin.animation.stopped == true;
        })) {
        this.animationResolve && this.animationResolve();
    }

    requestAnimationFrame(this.onAnimation.bind(this));
};

/**
 * return promise, when scene loaded
 * */
window.coin.animation.CoinsAnimation.prototype.loadScene = function() {
    return new Promise(function(resolve, reject) {
        //load 1 image with coin
        var imageCoin = new Image;
        var coins = this;
        imageCoin.onload = function() {
            //create array of coin objects
            for (var i = 0; i < coins.count; ++i) {
                coins.addCoin(this);
            }

            resolve();
        };
        imageCoin.src = this.url;

    }.bind(this));
};