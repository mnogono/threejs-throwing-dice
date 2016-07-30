if (!window.lib) {
    var lib = window.lib = {};
}

if (!window.lib.geometry) {
    window.lib.geometry = {};
}

window.lib.geometry = {
    /**
     * expand original box if needed
     * @param {Array<number>} additionalCoordinates additional coordinates can be out of the original box
     * @param {Array<number>} box original box
     * @returns {Array<number>} expanded box
     */
    expandBox: function (additionalCoordinates, box) {
        if (additionalCoordinates) {
            var minX = box[0],
                minY = box[1],
                maxX = box[2],
                maxY = box[3];

            for (var i = 0, size = additionalCoordinates.length; i < size; i += 2) {
                if (additionalCoordinates[i] < minX) {
                    minX = additionalCoordinates[i];
                }
                if (additionalCoordinates[i + 1] < minY) {
                    minY = additionalCoordinates[i + 1];
                }
                if (additionalCoordinates[i] > maxX) {
                    maxX = additionalCoordinates[i];
                }
                if (additionalCoordinates[i + 1] > maxY) {
                    maxY = additionalCoordinates[i + 1];
                }
            }

            box[0] = minX;
            box[1] = minY;
            box[2] = maxX;
            box[3] = maxY;
        }

        return box;
    },

    /**
     * calculate box
     * @param {Array<number>} crds
     * @returns {Array<number>} geometry box
     */
    calculateBox: function (crds) {
        var minX = crds[0],
            minY = crds[1],
            maxX = crds[0],
            maxY = crds[1];

        for (var i = 2, size = crds.length; i < size; i += 2) {
            if (crds[i] < minX) {
                minX = crds[i];
            }
            if (crds[i + 1] < minY) {
                minY = crds[i + 1];
            }
            if (crds[i] > maxX) {
                maxX = crds[i];
            }
            if (crds[i + 1] > maxY) {
                maxY = crds[i + 1];
            }
        }

        return [minX, minY, maxX, maxY];
    },

    /**
     * check is crd in the box with threshold
     * @param {number} x
     * @param {number} y
     * @param {Array<number>} box
     * @param {number} [threshold] by default 0
     * @returns {boolean}
     */
    isCrdInsideBox: function (x, y, box, threshold) {
        if (!box) {
            return false;
        }

        if (!threshold) {
            threshold = 0;
        }

        return (box[0] - threshold) <= x && x <= (box[2] + threshold) &&
            (box[1] - threshold) <= y && y <= (box[3] + threshold);
    },

    /**
     * check is crd between min and max coordinate values
     * @param {number} x
     * @param {number} y
     * @param {number} xMin
     * @param {number} yMin
     * @param {number} xMax
     * @param {number} yMax
     * @returns {boolean}
     */
    isCrdBetween: function (x, y, xMin, yMin, xMax, yMax) {
        return xMin <= x && x <= xMax && yMin <= y && y <= yMax;
    },

    /**
     * calculate the line equation Ax + Bx + C = 0
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @returns {{A: number, B: number, C: number, isVertical: boolean, isHorizontal: boolean}}
     */
    lineEquation: function (x1, y1, x2, y2) {
        var isHorizontal = false;
        var isVertical = false;

        if (Math.abs(x2 - x1) <= 1e-10) {
            isVertical = true;
            A = 1;
            B = 0;
        } else if (Math.abs(y2 - y1) <= 1e-10) {
            isHorizontal = true;
            A = 0;
            B = 1;
        } else {
            var A = y1 - y2;
            var B = x2 - x1;
        }
        var C = -y1 * B - x1 * A;

        return {
            'A': A,
            'B': B,
            'C': C,
            'isVertical': isVertical,
            'isHorizontal': isHorizontal
        };
    },

    /**
     * calculate distance to line
     * @param {number} x
     * @param {number} y
     * @param {object} eq line equation @see window.lib.geometry.lineEquation
     * @returns {number} distance
     */
    distanceToLine: function (x, y, eq) {
        return (eq.A * x + eq.B * y + eq.C) / Math.sqrt(eq.A * eq.A + eq.B * eq.B);
    },

    /**
     * calculate the vector length
     * @param {Array<number>} vec
     * @returns {number}
     */
    vectorLength: function (vec) {
        return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
    },

    /**
     * normalize vector, set length to 1. Source vector will be modify
     * @param {Array<number>} vec
     * @returns {Array<number>} result vector
     * @methodOf window.lib.geometry
     */
    normalizeVector: function (vec) {
        var len = window.lib.geometry.vectorLength(vec);
        vec[0] /= len;
        vec[1] /= len;
        return vec;
    },

    /**
     * caluclate distance between 2 points
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @returns {number}
     */
    distance: function (x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    },

    distance3d: function (x1, y1, z1, x2, y2, z2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) + (z2 - z1) * (z2 - z1));
    },

    /**
     * calculate the angle in radiang between 2 normalized vectors
     * @param {Array<number>} normalizedVec1
     * @param {Array<number>} normalizedVec2
     * @returns {number} angle in radians
     * @methodOf window.lib.geometry
     */
    angleBetweenVectors: function (normalizedVec1, normalizedVec2) {
        return Math.acos(normalizedVec1[0] * normalizedVec2[0] + normalizedVec1[1] * normalizedVec2[1]);
    },

    /**
     * calculate perimeter
     * @param {Array<number>} crds array of coordinates
     * @returns {number} perimeter
     */
    perimeter: function (crds) {
        var perimeter = 0.0;
        for (var i = 0, size = crds.length - 4; i <= size; i += 2) {
            perimeter += window.lib.geometry.distance(crds[i], crds[i + 1], crds[i + 2], crds[i + 3]);
        }
        return perimeter
    },

    /**
     * calculate square
     * @param {Array<number>} crds array of coordinates
     * @returns {number} square
     */
    square: function (crds) {
        var square = 0.0;
        for (var i = 0, size = crds.length - 4; i <= size; i += 2) {
            square += (crds[i + 2] - crds[i]) * (crds[i + 1] + crds[i + 3]);
        }
        square *= 0.5; //just little improve performance remove 0.5 factor from iteration cycle
        return Math.abs(square);
    },

    /**
     * convert coordinates to vector
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @returns {Array<number>} vector
     */
    coordinate2Vector: function (x1, y1, x2, y2) {
        return [x2 - x1, y2 - y1];
    },

    /**
     * swap vector direction, Source vector will be modify
     * @param {Array<number>} vec
     * @returns {Array<number>}
     */
    swapVectorDirection: function (vec) {
        vec[0] *= -1;
        vec[1] *= -1;
        return vec;
    },

    /**
     * check is segment intersect line
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @param eq
     * @returns {Array|false} return intersection coordinate or false
     */
    segmentIntersectionLine: function (x1, y1, x2, y2, eq) {
        var d1 = window.lib.geometry.distanceToLine(x1, y1, eq);
        var d2 = window.lib.geometry.distanceToLine(x2, y2, eq);
        if (Math.sign(d1) != Math.sign(d2)) {
            var distance = Math.abs(d1) + Math.abs(d2);
            return [x1 + (x2 - x1) * Math.abs(d1) / distance, y1 + (y2 - y1) * Math.abs(d1) / distance];
        }

        return false;
    },

    /**
     * calculate and return intersection coordinate
     * @param {object} eq1 @see window.lib.geometry.lineEquatopm
     * @param {object} eq2 @see window.lib.geometry.lineEquatopm
     * @returns {Array<number>} intersection coordinate
     */
    lineIntersection: function (eq1, eq2) {
        var x = (eq1.C * eq2.B - eq2.C * eq1.B) / (eq2.A * eq1.B - eq1.A * eq2.B);
        var y = -(eq1.C + eq1.A * x) / eq1.B;
        return [x, y];
    },

    /**
     * check is directions of vectors is equals
     * @param {Array<number>} normalizeVec1
     * @param {Array<number>} normalizeVec2
     * @returns {boolean}
     */
    isDirectionEquals: function (normalizeVec1, normalizeVec2) {
        return ((Math.abs(normalizeVec2[0]) - Math.abs(normalizeVec1[0])) < 1e-10) &&
            ((Math.abs(normalizeVec2[1]) - Math.abs(normalizeVec1[1])) < 1e-10);
    },

    /**
     * transform coordinates by scaling, moving and rotation
     * @param {Array<number>} originalCrds original coordinates
     * @param {number} scaleX scale coefficient for x axis
     * @param {number} scaleY scale coefficient for y axis
     * @param {number} moveX move by x direction
     * @param {number} moveY move by x direction
     * @param {number} angle rotate in radians
     * @param {number} pivotX pivot point x coordinate
     * @param {number} pivotY pivot point y coordinate
     */
    transform: function (originalCrds, scaleX, scaleY, moveX, moveY, angle, pivotX, pivotY) {
        var crds = originalCrds.slice();

        if (scaleX != 1 || scaleY != 1) {
            for (i = 0, len = crds.length; i < len; i += 2) {
                crds[i] = pivotX + (crds[i] - pivotX) * scaleX;
                crds[i + 1] = pivotY + (crds[i + 1] - pivotY) * scaleY;
            }
        }

        if (!isEmpty(angle) && angle != 0) {
            var x, y;
            for (i = 0, len = crds.length; i < len; i += 2) {
                x = crds[i] - pivotX;
                y = crds[i + 1] - pivotY;
                crds[i] = x * Math.cos(angle) - y * Math.sin(angle) + pivotX;
                crds[i + 1] = x * Math.sin(angle) + y * Math.cos(angle) + pivotY;
            }
        }

        if (moveX != 0 || moveY != 0) {
            for (i = 0, len = crds.length; i < len; i += 2) {
                crds[i] = crds[i] + moveX;
                crds[i + 1] = crds[i + 1] + moveY;
            }
        }

        return crds;
    },

    /**
     * return information about nearest line for coordinate
     * @param {Array<number>} crds geometry coordinates
     * @param {number} x coordinated of point
     * @param {number} y coordinated of point
     * @param {number} threshold
     * @returns {object|null} {point1: number, point2: number, x: number, y: number, distance: number}
     * @param {boolean} [isOnlyInBBox=true] skip line if crd not in bbox of line
     */
    nearestLine: function (crds, x, y, threshold, isOnlyInBBox) {
        if (typeof(isOnlyInBBox) === 'undefined') isOnlyInBBox = true;

        var minDistance = Number.MAX_VALUE;
        var minDistancePoint = -1;
        var distance;
        var xMin, xMax, yMin, yMax;
        var eq;
        //find the minimum distance between crd and line, skip line if crd not in bbox of line
        for (var i = 0, size = crds.length - 4; i <= size; i += 2) {
            xMin = Math.min(crds[i], crds[i + 2]);
            xMax = Math.max(crds[i], crds[i + 2]);
            yMin = Math.min(crds[i + 1], crds[i + 3]);
            yMax = Math.max(crds[i + 1], crds[i + 3]);
            if (threshold == Number.POSITIVE_INFINITY || window.lib.geometry.isCrdBetween(x, y, xMin - threshold, yMin - threshold, xMax + threshold, yMax + threshold)) {
                eq = window.lib.geometry.lineEquation(crds[i], crds[i + 1], crds[i + 2], crds[i + 3]);
                if (eq.isHorizontal) {
                    distance = y - crds[i + 1];
                } else if (eq.isVertical) {
                    distance = x - crds[i];
                } else {
                    distance = window.lib.geometry.distanceToLine(x, y, eq);
                }
                if (Math.abs(distance) < Math.abs(minDistance)) {
                    minDistance = distance;
                    minDistancePoint = i;
                }
            }
        }

        if (minDistancePoint >= 0) {
            i = minDistancePoint;
            distance = minDistance;
            eq = window.lib.geometry.lineEquation(crds[i], crds[i + 1], crds[i + 2], crds[i + 3]);
            if (threshold == Number.POSITIVE_INFINITY || Math.abs(distance) <= threshold) {
                var x0, y0;
                if (eq.isHorizontal) {
                    x0 = x;
                    y0 = crds[i + 1];
                } else if (eq.isVertical) {
                    x0 = crds[i];
                    y0 = y;
                } else {
                    //calculate point coordinate on the line
                    y0 = (y * eq.A * eq.A - eq.B * eq.C - eq.B * x * eq.A) / (eq.A * eq.A + eq.B * eq.B);
                    x0 = -(eq.B * y0 + eq.C) / eq.A;
                }

                //check is found coordinate between line segment
                xMin = Math.min(crds[i], crds[i + 2]);
                xMax = Math.max(crds[i], crds[i + 2]);
                yMin = Math.min(crds[i + 1], crds[i + 3]);
                yMax = Math.max(crds[i + 1], crds[i + 3]);
                if (!isOnlyInBBox || window.lib.geometry.isCrdBetween(x0, y0, xMin, yMin, xMax, yMax)) {
                    return {
                        'point1': i,
                        'point2': i + 2,
                        'distance': distance,
                        'x': x0,
                        'y': y0
                    };
                }
            }
        }
        return null;
    },

    /**
     * return information about nearest line for coordinate
     * @param {number} x coordinated of point
     * @param {number} y coordinated of point
     * @param lineEquation
     * @returns {object|null} {point1: number, point2: number, x: number, y: number, distance: number}
     */
    nearestPointOfLine: function (x, y, lineEquation) {
        var x0, y0;
        if (lineEquation.isHorizontal) {
            x0 = x;
            y0 = -lineEquation.C;
        } else if (lineEquation.isVertical) {
            x0 = -lineEquation.C;
            y0 = y;
        } else {
            //calculate point coordinate on the line
            y0 = (y * lineEquation.A * lineEquation.A - lineEquation.B * lineEquation.C -
                lineEquation.B * x * lineEquation.A) / (lineEquation.A * lineEquation.A + lineEquation.B * lineEquation.B);
            x0 = -(lineEquation.B * y0 + lineEquation.C) / lineEquation.A;
        }

        return {
            'x': x0,
            'y': y0
        };
    },

    /**
     * return norm and normalize vector to the specify line
     * @param eq
     * @returns {Array<number>}
     */
    normVec2Line: function (eq) {
        var vec = [eq.A, eq.B];
        return window.lib.geometry.normalizeVector(vec);
    },

    /**
     * return the side where [x,y] is located relative to the line
     * @param x
     * @param y
     * @param eq line equation
     * @returns {number}
     */
    side: function (x, y, eq) {
        return sign(window.lib.geometry.distanceToLine(x, y, eq));
    },

    /**
     * mirror coordinates relative the specify line
     * @param {Array<number>} crds
     * @param {object} eq @see window.lib.geometry.lineEquation
     */
    mirror: function (crds, eq) {
        if (eq.isVertical) {
            var x0 = -eq.C / eq.A;
            for (var i = 0, size = crds.length; i < size; i += 2) {
                crds[i] = crds[i] - 2 * (crds[i] - x0);
            }

        } else if (eq.isHorizontal) {
            var y0 = -eq.C / eq.B;
            for (i = 0, size = crds.length; i < size; i += 2) {
                crds[i + 1] = crds[i + 1] - 2 * (crds[i + 1] - y0);
            }

        } else {
            for (i = 0, size = crds.length; i < size; i += 2) {
                var n = window.lib.geometry.normVec2Line(eq);
                var d = window.lib.geometry.distanceToLine(crds[i], crds[i + 1], eq);
                crds[i] = -2 * d * n[0] + crds[i];
                crds[i + 1] = -2 * d * n[1] + crds[i + 1];
            }
        }
    },

    /**
     * return average x,y coordinates
     * @param {Array<number>} crds
     * @return {Array<number>} average coordinate
     */
    average: function (crds) {
        var x = 0, y = 0;
        for (var i = 0, len = crds.length; i < len; i += 2) {
            x += crds[i];
            y += crds[i + 1];
        }

        return [x / (0.5 * len), y / (0.5 * len)];
    },

    /**
     *
     * @param {number} prevX
     * @param {number} prevY
     * @param {number} currX
     * @param {number} currY
     * @param {number} nextX
     * @param {number} nextY
     * @returns {number} < 0 if angle is convex, > 0 if angle is not convex, 0 if angle is 180
     */
    isConvexAngle: function(prevX, prevY, currX, currY, nextX, nextY) {
        return (currX - prevX) * (nextY - prevY) -
            (currY - prevY) * (nextX - prevX);
    },

    /**
     * return if bypass of crds is clockwise or not
     * @param crds
     * @returns {boolean}
     */
    isClockwise: function (crds) {
        var maxYVal = -Number.MAX_VALUE,
            maxYInd = -1,
            i,
            len = crds.length,
            point;
        for (i = 0; i < len; i += 2) {
            if (crds[i + 1] > maxYVal) {
                maxYVal = crds[i + 1];
                maxYInd = i;
            }
        }
        //var perPoint, nextPoint, currPoint = points[maxYInd];
        i = maxYInd;
        var prevIndex;
        do {
            i -= 2;
            if (i < 0) i = len - 2;
            prevIndex = i;
        } while (i !== maxYInd && crds[i] === crds[maxYInd] && crds[i + 1] === crds[maxYInd + 1]);
        i = maxYInd;
        var angle;
        var nextIndex;
        do {
            i += 2;
            if (i === len) i = 0;
            nextIndex = i;
        } while (i !== maxYInd && (angle = window.lib.geometry.isConvexAngle(crds[prevIndex], crds[prevIndex + 1],
            crds[maxYInd], crds[maxYInd + 1],
            crds[nextIndex], crds[nextIndex + 1])) === 0);
        return angle < 0;
    },

    /**
     * return all convex points of list of coordinates
     * @param {[number]} crds
     * @returns {[]} return convex points
     */
    getConvexPoints: function(crds) {
        var len = crds.length;
        var p;
        var clockwise = window.lib.geometry.isClockwise(crds);
        var currIndex;

        function __filterConvexPoints(crds, i, points) {
            if (p < 2) {
                p += 2;
                points[p] = crds[i];
                points[p + 1] = crds[i + 1];
                return true;
            }
            if (window.lib.geometry.isConvexAngle(points[p - 2], points[p - 2 + 1], points[p], points[p + 1], crds[i], crds[i + 1]) < 0) {
                p += 2;
                points[p] = crds[i];
                points[p + 1] = crds[i + 1];
            } else {
                p -= 2;
            }

            return false;
        }

        var points = [];
        p = -2;

        if (clockwise) {
            for (var i = 0; i < len; i += 2) {
                __filterConvexPoints(crds, i, points);
            }
        } else {
            for (i = len - 2; i >= 0; i -= 2) {
                __filterConvexPoints(crds, i, p, points);
            }
        }

        return points.slice(0, p + 2);
    },

    getCurveIntersects: function (firstCurveCoordinates, secondCurveCoordinates, stepMultiplier) {
        var meanXYList = [];
        var intersects = [];
        var step = 5 * stepMultiplier;
        for (var p = 0; p < firstCurveCoordinates.length / 2; p += 3) {
            var minSX = -1, minSY = -1, minDistance = Number.MAX_VALUE;
            var fx = firstCurveCoordinates[p * 2];
            var fy = firstCurveCoordinates[p * 2 + 1];

            for (var pp = 0; pp < secondCurveCoordinates.length / 2; pp += 3) {
                var sx = secondCurveCoordinates[pp * 2];
                var sy = secondCurveCoordinates[pp * 2 + 1];

                var distance = Math.pow(sx - fx, 2) + Math.pow(sy - fy, 2);
                if (distance < minDistance) {
                    minDistance = distance;
                    minSX = sx;
                    minSY = sy;
                }
            }
            if (minSX > 0 && minSY > 0) {
                var meanX = (fx + minSX) / 2;
                var meanY = (fy + minSY) / 2;
                meanXYList.push(meanX);
                meanXYList.push(meanY);
            }
        }
        if (meanXYList.length > 0) {
            var meanCoordinates = window.lib.geometry.coarsePolyline(meanXYList, 10, 0);

            var firstCurveToSpline = [];
            var secondCurveToSpline = [];

            var _spline;
            for (var p = 0; p < firstCurveCoordinates.length / 2 - 1; p += 3) {
                _spline = window.lib.geometry.curveToSpline(
                    firstCurveCoordinates[p * 2], firstCurveCoordinates[p * 2 + 1],
                    firstCurveCoordinates[p * 2 + 2], firstCurveCoordinates[p * 2 + 3],
                    firstCurveCoordinates[p * 2 + 4], firstCurveCoordinates[p * 2 + 5],
                    firstCurveCoordinates[p * 2 + 6], firstCurveCoordinates[p * 2 + 7],
                    20);
                Array.prototype.push.apply(firstCurveToSpline, _spline);
            }

            for (var pp = 0; pp < secondCurveCoordinates.length / 2 - 1; pp += 3) {
                _spline = window.lib.geometry.curveToSpline(
                    secondCurveCoordinates[pp * 2], secondCurveCoordinates[pp * 2 + 1],
                    secondCurveCoordinates[pp * 2 + 2], secondCurveCoordinates[pp * 2 + 3],
                    secondCurveCoordinates[pp * 2 + 4], secondCurveCoordinates[pp * 2 + 5],
                    secondCurveCoordinates[pp * 2 + 6], secondCurveCoordinates[pp * 2 + 7],
                    20);
                Array.prototype.push.apply(secondCurveToSpline, _spline);
            }

            if (secondCurveToSpline.length > 0 && firstCurveToSpline.length > 0) {
                var mx1, my1, mx2, my2;
                var length, pointStep, ratio, remLength = 0, curLength = step;
                var pointOnLine = [0, 0];

                for (var m = 0; m < meanCoordinates.length - 2; m += 2) {
                    mx1 = meanCoordinates[m];
                    my1 = meanCoordinates[m + 1];
                    mx2 = meanCoordinates[m + 2];
                    my2 = meanCoordinates[m + 3];

                    length = window.lib.geometry.vectLen(mx2 - mx1, my2 - my1);
                    pointStep = Math.round((length + remLength) / step);

                    if (remLength + length < step) remLength += length;

                    for (var j = 0; j < pointStep; j++) {
                        ratio = (curLength - remLength) / (length - curLength);
                        curLength += step;
                        pointOnLine = window.lib.geometry.calcDividedSegmentPoint(mx1, my1, mx2, my2, ratio);
                        var normalToPoint = window.lib.geometry.calcNormalToPointOnSegment(pointOnLine[0], pointOnLine[1], mx1, my1, mx2, my2);
                        var pointOnLine1 = window.lib.geometry.calcLineAndContourCrossPoint(
                            normalToPoint[0],
                            normalToPoint[1],
                            normalToPoint[2],
                            normalToPoint[3],
                            firstCurveToSpline
                        );
                        var pointOnLine2 = window.lib.geometry.calcLineAndContourCrossPoint(
                            normalToPoint[0],
                            normalToPoint[1],
                            normalToPoint[2],
                            normalToPoint[3],
                            secondCurveToSpline
                        );

                        if (pointOnLine1 != null && pointOnLine2 != null) {
                            var intersectLineCoordinates = [];
                            intersectLineCoordinates.push(pointOnLine1[0]);
                            intersectLineCoordinates.push(pointOnLine1[1]);
                            intersectLineCoordinates.push(pointOnLine2[0]);
                            intersectLineCoordinates.push(pointOnLine2[1]);

                            intersects.push(intersectLineCoordinates);

                        }


                    }
                    curLength = step;
                    remLength = window.lib.geometry.vectLen(pointOnLine[0] - mx2, pointOnLine[1] - my2);
                }

            }
        }
        return {intersects: intersects, meanCoordinates: meanCoordinates};
    },

    coarsePolyline: function (xy, maxError, maxLen) {
        if (xy == null || xy.length < 6) return xy;

        var nPt = Math.round(xy.length / 2);
        var mark = [];

        //var nodexIdx = [0, Math.round(xy.length / 2 - 1)];
        //var douglasPeucker = new DouglasPeucker(xy, maxError * maxError, mark);

        //for (var ni = 0; ni < nodesIdx.length - 1; ni++) {
        //    if (nodesIdx[ni + 1] - nodesIdx[ni] + 1 < 3) continue;
        //
        //    douglasPeucker.processing(nodesIdx[ni], nodesIdx[ni + 1]);
        //}

        var points = [];
        for(var i = 0; i < xy.length; i += 2) {
            points.push([xy[i], xy[i + 1]]);
        }
        var _approximatedCurve = window.lib.geometry.RDPsd(points, Math.pow(maxError, 2));
        var approximatedCurve = [];
        _approximatedCurve.forEach(function(point) {
            approximatedCurve.push(point[0]);
            approximatedCurve.push(point[1]);
        });
        return approximatedCurve;

        //var xyBuff = [];
        //if (maxLen > 0) {
        //    var x0 = xy[0], y0 = xy[1];
        //
        //    xyBuff.push(x0);
        //    xyBuff.push(y0);
        //
        //    for (var i = 1; i < nPt; i++) {
        //        if (mark[i]) {
        //            var x = xy[2 * i], y = xy[2 * i + 1];
        //            var addXY = divideSegment(x0, y0, x, y, maxLen);
        //            for (var k = 0; k < addXY.length; k += 2) {
        //                xyBuff.push(addXY[k]);
        //                xyBuff.push(addXY[k + 1]);
        //            }
        //            xyBuff.push(x0 = x);
        //            xyBuff.push(y0 = y);
        //        }
        //    }
        //} else {
        //    for (var i = 0; i < nPt; i++) {
        //        if (mark[i]) {
        //            xyBuff.push(xy.getFloat(2 * i));
        //            xyBuff.push(xy.getFloat(2 * i + 1));
        //        }
        //    }
        //}
        //
        //
        //return xyBuff;
    },

    vectLen: function (vx, vy) {
        var ax = Math.abs(vx);
        var ay = Math.abs(vy);

        if (ax == 0 && ay == 0) return 0;

        if (ax > ay) {
            ay /= ax;
            return ax * Math.sqrt(1 + ay * ay);
        } else {
            ax /= ay;
            return ay * Math.sqrt(1 + ax * ax);
        }
    },

    curveToSpline: function (x1, y1, x2, y2, x3, y3, x4, y4, segmentsCount) {
        var mum1, mum13, mu3;
        var segmentStep = 1 / segmentsCount;
        var curStep = 0;
        var splineCoordinates = [];
        while (curStep < 1 - segmentStep) {
            mum1 = 1 - curStep;
            mum13 = mum1 * mum1 * mum1;
            mu3 = curStep * curStep * curStep;

            var x = mum13 * x1 + 3 * curStep * mum1 * mum1 * x2 + 3 * curStep * curStep * mum1 * x3 + mu3 * x4;
            var y = mum13 * y1 + 3 * curStep * mum1 * mum1 * y2 + 3 * curStep * curStep * mum1 * y3 + mu3 * y4;

            splineCoordinates.push(x);
            splineCoordinates.push(y);

            curStep += segmentStep;

        }
        return splineCoordinates;
    },

    calcDividedSegmentPoint: function (x1, y1, x2, y2, ratio) {
        var x = ((x1 + ratio * x2) / (1 + ratio));
        var y = ((y1 + ratio * y2) / (1 + ratio));
        return [x, y];
    },

    calcNormalToPointOnSegment: function (px, py, x1, y1, x2, y2) {
        var abc1 = window.lib.geometry.calcLineCoefs(x1, y1, x2, y2);
        var abc2 = [];
        abc2[0] = -abc1[1];
        abc2[1] = abc1[0];
        abc2[2] = -(abc2[0] * px + abc2[1] * py);
        var result = [];
        result[0] = px;
        result[1] = py;

        if (abc2[1] != 0) {
            result[2] = px + 1;
            result[3] = -(abc2[0] * result[2] + abc2[2]) / abc2[1];
        } else {
            result[2] = px;
            result[1] = py + 1;
        }
        return result;
    },

    calcLineAndContourCrossPoint: function (x1, y1, x2, y2, contour) {
        var minD = Number.MAX_VALUE, curD;
        var minPoint = [], lastPoint;
        for (var i = 0; i < contour.length - 2; i += 2) {
            lastPoint = window.lib.geometry.calcLineAndSegmentCrossPoint(x1, y1, x2, y2, contour[i], contour[i + 1], contour[i + 2], contour[i + 3]);
            if (lastPoint != null) {
                curD = window.lib.geometry.vectLen(lastPoint[0] - x1, lastPoint[1] - y1);
                if (curD < minD) {
                    minPoint = lastPoint;
                    minD = curD;
                }
            }
        }
        if (minPoint.length == 0) return null; //контур и прямая не пересекаются
        return minPoint;
    },

    calcLineAndSegmentCrossPoint: function (x1, y1, x2, y2, x3, y3, x4, y4) {
        var dd = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        var bb = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);

        if (dd == 0.0) {
            if (bb != 0.0) return null; //Прямые паралельны
            return [];        //Прямые совпадают
        }

        var u = bb / dd;
        if (u < 0 || u > 1) return null; //Пересечение вне отрезка

        return [x3 + u * (x4 - x3), y3 + u * (y4 - y3)];
    },

    calcLineCoefs: function (x1, y1, x2, y2) {
        var abc = [];
        abc.push(y1 - y2);
        abc.push(x2 - x1);
        abc.push(x1 * y2 - x2 * y1);

        return abc;
    },


// this is the implementation with shortest Distance (as of 2013-09 suggested by the wikipedia page. Thanks Edward Lee for pointing this out)
    RDPsd: function (points, epsilon) {
        var firstPoint = points[0];
        var lastPoint = points[points.length - 1];
        if (points.length < 3) {
            return points;
        }
        var index = -1;
        var dist = 0;
        for (var i = 1; i < points.length - 1; i++) {
            var cDist = window.lib.geometry.distanceFromPointToLine(points[i], firstPoint, lastPoint);

            if (cDist > dist) {
                dist = cDist;
                index = i;
            }
        }
        if (dist > epsilon) {
            // iterate
            var l1 = points.slice(0, index + 1);
            var l2 = points.slice(index);
            var r1 = window.lib.geometry.RDPsd(l1, epsilon);
            var r2 = window.lib.geometry.RDPsd(l2, epsilon);
            // concat r2 to r1 minus the end/startpoint that will be the same
            var rs = r1.slice(0, r1.length - 1).concat(r2);
            return rs;
        } else {
            return [firstPoint, lastPoint];
        }
    },


    // this is the implementation with perpendicular Distance
    RDPppd: function (points, epsilon) {
        var firstPoint = points[0];
        var lastPoint = points[points.length - 1];
        if (points.length < 3) {
            return points;
        }
        var index = -1;
        var dist = 0;
        for (var i = 1; i < points.length - 1; i++) {
            var cDist = window.lib.geometry.findPerpendicularDistance(points[i], firstPoint, lastPoint);
            if (cDist > dist) {
                dist = cDist;
                index = i;
            }
        }
        if (dist > epsilon) {
            // iterate
            var l1 = points.slice(0, index + 1);
            var l2 = points.slice(index);
            var r1 = window.lib.geometry.RDPppd(l1, epsilon);
            var r2 = window.lib.geometry.RDPppd(l2, epsilon);
            // concat r2 to r1 minus the end/startpoint that will be the same
            var rs = r1.slice(0, r1.length - 1).concat(r2);
            return rs;
        } else {
            return [firstPoint, lastPoint];
        }
    },

    findPerpendicularDistance: function (p, p1, p2) {

        // if start and end point are on the same x the distance is the difference in X.
        var result;
        var slope;
        var intercept;
        if (p1[0] == p2[0]) {
            result = Math.abs(p[0] - p1[0]);
        } else {
            slope = (p2[1] - p1[1]) / (p2[0] - p1[0]);
            intercept = p1[1] - (slope * p1[0]);
            result = Math.abs(slope * p[0] - p[1] + intercept) / Math.sqrt(Math.pow(slope, 2) + 1);
        }

        return result;
    },


    distanceFromPointToLine: function (p, a, b) {
        // convert array to object to please Edwards code;
        p = {x: p[0], y: p[1]};
        a = {x: a[0], y: a[1]};
        b = {x: b[0], y: b[1]};
        return Math.sqrt(window.lib.geometry.distanceFromPointToLineSquared(p, a, b));
    },

    //This is the difficult part. Commenting as we go.
    distanceFromPointToLineSquared: function (p, i, j) {
        var lineLength = window.lib.geometry.pointDistance(i, j);//First, we need the length of the line segment.
        if (lineLength == 0) {	//if it's 0, the line is actually just a point.
            return window.lib.geometry.pointDistance(p, a);
        }
        var t = ((p.x - i.x) * (j.x - i.x) + (p.y - i.y) * (j.y - i.y)) / lineLength;

        //t is very important. t is a number that essentially compares the individual coordinates
        //distances between the point and each point on the line.

        if (t < 0) {	//if t is less than 0, the point is behind i, and closest to i.
            return window.lib.geometry.pointDistance(p, i);
        }	//if greater than 1, it's closest to j.
        if (t > 1) {
            return window.lib.geometry.pointDistance(p, j);
        }
        return window.lib.geometry.pointDistance(p, {x: i.x + t * (j.x - i.x), y: i.y + t * (j.y - i.y)});
        //this figure represents the point on the line that p is closest to.
    },

    //returns distance between two points. Easy geometry.
    pointDistance: function (i, j) {
        return window.lib.geometry.sqr(i.x - j.x) + window.lib.geometry.sqr(i.y - j.y);
    },

    //just to make the code a bit cleaner.
    sqr: function (x) {
        return x * x;
    },

    translateValue: function(value, degree, pixelSize) {
        var result = parseFloat(value);
        if(isNaN(result)) return value;

        if(degree == null || pixelSize == null) return result;

        if (degree == 1) {
            result *= pixelSize;
        } else if (degree == 2) {
            result *= Math.pow(pixelSize, 2);
        } else if (degree == 3) {
            result *= Math.pow(pixelSize, 3);
        }
        return result;
    },
};
