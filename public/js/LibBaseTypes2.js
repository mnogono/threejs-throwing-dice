var lib = window.lib || {};
lib.baseTypes = lib.baseTypes || {};

lib.baseTypes = {
    /**
     * return default value is test values is empty
     * @param test
     * @param defaultValue
     * @returns {boolean}
     */
    emptyTo: function (test, defaultValue) {
        if (window.lib.baseTypes.isEmpty(test)) {
            return defaultValue;
        }
        return test;
    },

    /**
     * check is values is null or undefined or NaN
     * @param test
     * @returns {boolean}
     */
    isNull: function (test) {
        return typeof(test) !== "string" && (test === null || test === undefined || (!window.lib.baseTypes.isObject(test) && isNaN(test)));
    },

    /**
     * check is value is null and if it is true, return default value
     * @param {*} test
     * @param {*} defaultValue
     * @returns {*} test or default
     */
    nullTo: function (test, defaultValue) {
        if (window.lib.baseTypes.isNull(test)) {
            return defaultValue;
        }
        return test;
    },

    /**
     * Check is test object
     * @param test
     * @returns {boolean}
     * @methodOf lib.baseTypes
     */
    isObject: function (test) {
        return test === Object(test);
    },

    /**
     *
     * @param test
     * @returns {boolean}
     * @methodOf lib.baseTypes
     */
    isArray: function (test) {
        return Array.isArray(test);
    },

    /**
     * check is test value is empty
     * @param {*} test check value
     * @return {boolean} return true is test value is empty
     */
    isEmpty: function (test) {
        if (window.lib.baseTypes.isNull(test)) return true;
        if (test === "") return true;
        if (window.lib.baseTypes.isObject(test)) {
            if (test.length > 0) return false;
            if (test.length === 0) return true;
            for (var key in test) {
                if (test.hasOwnProperty(key)) return false;
            }
            return true;
        } else {
            return false;
        }
    },

    sign: function (x) {
        return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
    },

    /**
     * Check is variant is number
     * 123 or 123.123 or '123.123' or (null - equal to 0) it is a numbers, otherwise no
     * @param {*} variant
     * @return {boolean} result of checks
     */
    isNumber: function (variant) {
        return typeof(variant) != "boolean" && typeof(variant) != "string" && !isNaN(variant);
    },

    /**
     * round value
     * @param {number} value
     * @param {number} digits count of digits
     */
    round: function (value, digits) {
        var k = Math.pow(10, digits);
        return Math.round(value * k) / k;
    }
};

/** @type {number} factor for convert radian to degree */
lib.baseTypes.RAD2DEGREE = 180. / Math.PI;

/** @type {number} factor for convert degree to radians */
lib.baseTypes.DEGREE2RAD = 1. / lib.baseTypes.RAD2DEGREE;

/** @type {number} factor for convert minutes to milliseconds */
lib.baseTypes.MIN2MSEC = 60. * 1000.;

/** @type {number} factor for convert milliseconds to minutes */
lib.baseTypes.MSEC2MIN = 1. / lib.baseTypes.MIN2MSEC;

lib.baseTypes.MSEC2SEC = 0.001;

lib.baseTypes.SEC2MSEC = 1000.;

lib.baseTypes.MIN2SEC = 60.;

lib.baseTypes.HOUR2MSEC = 60. * 60. * 1000.;

lib.baseTypes.HOUR2SEC = 60. * 60.;

lib.baseTypes.SEC2MIN = 1. / 60.;

lib.baseTypes.SEC2HOUR = 1. / 3600.;