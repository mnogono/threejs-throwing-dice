if (!window.lib) {
    window.lib = {};
}

if (!window.lib.objects) {
    window.lib.objects = {

        /**
         * Extend object
         * @param {Object} child child
         * @param {Object} parent parent
         */
        extend: function (child, parent) {
            var F = function () {
            };
            F.prototype = parent.prototype;
            child.prototype = new F();
            child.prototype.constructor = child;
            child.superclass = parent.prototype;
        },

        /**
         * Retrieve the names of an object's properties.
         *
         * @param obj
         * @return {*}
         */
        keys: function (obj) {
            if (!isObject(obj)) return [];
            var keys = [];
            for (var key in obj) if (has(obj, key)) keys.push(key);
            return keys;
        },

        /**
         * just to monopoly project
         */
        monopolyScaleFactor: function () {
            var $playSpaceWrapper = $('#play-space-wrapper');

            //стороны поля - оригинал
            var maxWidth = parseInt($playSpaceWrapper.css('max-width'));
            var maxHeight = parseInt($playSpaceWrapper.css('max-height'));

            //стороны поля - текущие
            var currentWidth = $playSpaceWrapper.width();
            var currentHeight = $playSpaceWrapper.height();

            return Math.max(maxHeight / currentHeight, maxWidth / currentWidth);
        }
    };
}


