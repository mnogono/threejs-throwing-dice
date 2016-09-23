var lib = window.lib || {};
lib.baseTypes = lib.baseTypes || {};
lib.baseTypes = {emptyTo:function(test, defaultValue) {
  if (window.lib.baseTypes.isEmpty(test)) {
    return defaultValue;
  }
  return test;
}, isNull:function(test) {
  return typeof test !== "string" && (test === null || test === undefined || !window.lib.baseTypes.isObject(test) && isNaN(test));
}, nullTo:function(test, defaultValue) {
  if (window.lib.baseTypes.isNull(test)) {
    return defaultValue;
  }
  return test;
}, isObject:function(test) {
  return test === Object(test);
}, isArray:function(test) {
  return Array.isArray(test);
}, isEmpty:function(test) {
  if (window.lib.baseTypes.isNull(test)) {
    return true;
  }
  if (test === "") {
    return true;
  }
  if (window.lib.baseTypes.isObject(test)) {
    if (test.length > 0) {
      return false;
    }
    if (test.length === 0) {
      return true;
    }
    for (var key in test) {
      if (test.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}, sign:function(x) {
  return typeof x === "number" ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
}, isNumber:function(variant) {
  return typeof variant != "boolean" && typeof variant != "string" && !isNaN(variant);
}, round:function(value, digits) {
  var k = Math.pow(10, digits);
  return Math.round(value * k) / k;
}};
lib.baseTypes.RAD2DEGREE = 180 / Math.PI;
lib.baseTypes.DEGREE2RAD = 1 / lib.baseTypes.RAD2DEGREE;
lib.baseTypes.MIN2MSEC = 60 * 1E3;
lib.baseTypes.MSEC2MIN = 1 / lib.baseTypes.MIN2MSEC;
lib.baseTypes.MSEC2SEC = .001;
lib.baseTypes.SEC2MSEC = 1E3;
lib.baseTypes.MIN2SEC = 60;
lib.baseTypes.HOUR2MSEC = 60 * 60 * 1E3;
lib.baseTypes.HOUR2SEC = 60 * 60;
lib.baseTypes.SEC2MIN = 1 / 60;
lib.baseTypes.SEC2HOUR = 1 / 3600;
if (!window.lib) {
  window.lib = {};
}
if (!window.lib.objects) {
  window.lib.objects = {extend:function(child, parent) {
    var F = function() {
    };
    F.prototype = parent.prototype;
    child.prototype = new F;
    child.prototype.constructor = child;
    child.superclass = parent.prototype;
  }, keys:function(obj) {
    if (!isObject(obj)) {
      return [];
    }
    var keys = [];
    for (var key in obj) {
      if (has(obj, key)) {
        keys.push(key);
      }
    }
    return keys;
  }, monopolyScaleFactor:function() {
    var $playSpaceWrapper = $("#play-space-wrapper");
    var maxWidth = parseInt($playSpaceWrapper.css("max-width"));
    var maxHeight = parseInt($playSpaceWrapper.css("max-height"));
    var currentWidth = $playSpaceWrapper.width();
    var currentHeight = $playSpaceWrapper.height();
    return Math.max(maxHeight / currentHeight, maxWidth / currentWidth);
  }};
}
;if (!window.lib) {
  var lib = window.lib = {}
}
if (!window.lib.arrays) {
  window.lib.arrays = {};
}
window.lib.arrays = {asc:function(a, b) {
  return a > b ? -1 : a == b ? 0 : 1;
}, desc:function(a, b) {
  return a > b ? 1 : a == b ? 0 : -1;
}, sortInsert:function(ar, element, compare) {
  var sorted = ar.map(function(e, i, ar) {
    if (compare(element, e) > 0) {
      var t = element;
      element = e;
      e = t;
    }
    return e;
  });
  sorted.push(element);
  return sorted;
}, equal:function(a1, a2, eps) {
  if (a1.length != a2.length) {
    return false;
  }
  if (eps) {
    for (var i = 0;i < a1.length;++i) {
      if (Math.abs(a1[i] - a2[i]) > eps) {
        return false;
      }
    }
  } else {
    for (var i = 0;i < a1.length;++i) {
      if (a1[i] !== a2[i]) {
        return false;
      }
    }
  }
  return true;
}, print:function(a) {
  console.debug(JSON.stringify(a));
}};
function concat() {
  var arConcat = [];
  for (var i = 0;i < arguments.length;i++) {
    for (var j in arguments[i]) {
      arConcat.push(arguments[i][j]);
    }
  }
  return arConcat;
}
function removeElements(array, values, key, reverse) {
  if (!array) {
    return;
  }
  if (key) {
    for (var i = 0;i < array.length;i++) {
      var isDelete = false;
      for (var j = 0;j < values.length;j++) {
        if (array[i][key] == values[j]) {
          isDelete = true;
          break;
        }
      }
      if (isDelete && !reverse || !isDelete && reverse) {
        array.splice(i, 1);
        i--;
      }
    }
  } else {
    for (i = 0;i < array.length;i++) {
      isDelete = false;
      for (j = 0;j < values.length;j++) {
        if (array[i] == values[j]) {
          isDelete = true;
          break;
        }
      }
      if (isDelete && !reverse || !isDelete && reverse) {
        array.splice(i, 1);
        i--;
      }
    }
  }
  return array;
}
function indexOf(array, item, isSorted) {
  if (array == null) {
    return -1;
  }
  var i = 0, length = array.length;
  if (isSorted) {
    if (typeof isSorted == "number") {
      i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
    } else {
      i = sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
  }
  for (;i < length;i++) {
    if (array[i] === item) {
      return i;
    }
  }
  return -1;
}
function sortedIndex(array, obj, iterator, context) {
  iterator = lib.collections._lookupIterator(iterator, context);
  var value = iterator(obj);
  var low = 0, high = array.length;
  while (low < high) {
    var mid = low + high >>> 1;
    iterator(array[mid]) < value ? low = mid + 1 : high = mid;
  }
  return low;
}
function binarySearch(array, value, checkResults, closestIndex) {
  checkResults = lib.baseTypes.emptyTo(checkResults, true);
  closestIndex = lib.baseTypes.emptyTo(closestIndex, false);
  var index = sortedIndex(array, value);
  if (index >= array.length) {
    index = array.length - 1;
  }
  if (checkResults) {
    if (array[index] !== value) {
      return -1;
    }
  }
  if (closestIndex) {
    if (array[index] == value || index == 0) {
      return index;
    } else {
      var dif = Math.abs(array[index] - value);
      var difPrev = Math.abs(array[index - 1] - value);
      if (difPrev < dif) {
        --index;
      }
    }
  }
  return index;
}
function sum(ar, lowerBound, upperBound) {
  lowerBound = lib.baseTypes.emptyTo(lowerBound, 0);
  upperBound = lib.baseTypes.emptyTo(upperBound, ar.length);
  var sum = 0;
  for (var i = lowerBound;i < upperBound;++i) {
    sum += ar[i];
  }
  return sum;
}
function average(ar, lowerBound, upperBound) {
  return sum(ar, lowerBound, upperBound) / ar.length;
}
function squareDifference(ar, fAverage, lowerBound, upperBound) {
  lowerBound = lib.baseTypes.emptyTo(lowerBound, 0);
  upperBound = lib.baseTypes.emptyTo(upperBound, ar.length);
  var s = 0;
  for (var i = lowerBound;i < upperBound;++i) {
    s += (ar[i] - fAverage) * (ar[i] - fAverage);
  }
  return s;
}
function standardDeviation(ar, fAverage, lowerBound, upperBound) {
  lowerBound = lib.baseTypes.emptyTo(lowerBound, 0);
  upperBound = lib.baseTypes.emptyTo(upperBound, ar.length);
  fAverage = lib.baseTypes.emptyTo(fAverage, average(ar, lowerBound, upperBound));
  return Math.sqrt(squareDifference(ar, fAverage, lowerBound, upperBound) / (upperBound - lowerBound - 1));
}
function distance(x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
function shuffle(ar) {
  for (var i = 0, len = ar.length;i < len;++i) {
    for (var j = i;j < len;++j) {
      var randomIndex = Math.floor(Math.random() * len);
      if (randomIndex == i) {
        continue;
      }
      var t = ar[i];
      ar[i] = ar[randomIndex];
      ar[randomIndex] = t;
    }
  }
}
;if (!window.lib) {
  var lib = window.lib = {}
}
if (!window.lib.geometry) {
  window.lib.geometry = {};
}
window.lib.geometry = {expandBox:function(additionalCoordinates, box) {
  if (additionalCoordinates) {
    var minX = box[0], minY = box[1], maxX = box[2], maxY = box[3];
    for (var i = 0, size = additionalCoordinates.length;i < size;i += 2) {
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
}, calculateBox:function(crds) {
  var minX = crds[0], minY = crds[1], maxX = crds[0], maxY = crds[1];
  for (var i = 2, size = crds.length;i < size;i += 2) {
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
}, isCrdInsideBox:function(x, y, box, threshold) {
  if (!box) {
    return false;
  }
  if (!threshold) {
    threshold = 0;
  }
  return box[0] - threshold <= x && x <= box[2] + threshold && box[1] - threshold <= y && y <= box[3] + threshold;
}, isCrdBetween:function(x, y, xMin, yMin, xMax, yMax) {
  return xMin <= x && x <= xMax && yMin <= y && y <= yMax;
}, lineEquation:function(x1, y1, x2, y2) {
  var isHorizontal = false;
  var isVertical = false;
  if (Math.abs(x2 - x1) <= 1E-10) {
    isVertical = true;
    A = 1;
    B = 0;
  } else {
    if (Math.abs(y2 - y1) <= 1E-10) {
      isHorizontal = true;
      A = 0;
      B = 1;
    } else {
      var A = y1 - y2;
      var B = x2 - x1;
    }
  }
  var C = -y1 * B - x1 * A;
  return {"A":A, "B":B, "C":C, "isVertical":isVertical, "isHorizontal":isHorizontal};
}, distanceToLine:function(x, y, eq) {
  return (eq.A * x + eq.B * y + eq.C) / Math.sqrt(eq.A * eq.A + eq.B * eq.B);
}, vectorLength:function(vec) {
  return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
}, normalizeVector:function(vec) {
  var len = window.lib.geometry.vectorLength(vec);
  vec[0] /= len;
  vec[1] /= len;
  return vec;
}, distance:function(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}, distance3d:function(x1, y1, z1, x2, y2, z2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) + (z2 - z1) * (z2 - z1));
}, angleBetweenVectors:function(normalizedVec1, normalizedVec2) {
  return Math.acos(normalizedVec1[0] * normalizedVec2[0] + normalizedVec1[1] * normalizedVec2[1]);
}, perimeter:function(crds) {
  var perimeter = 0;
  for (var i = 0, size = crds.length - 4;i <= size;i += 2) {
    perimeter += window.lib.geometry.distance(crds[i], crds[i + 1], crds[i + 2], crds[i + 3]);
  }
  return perimeter;
}, square:function(crds) {
  var square = 0;
  for (var i = 0, size = crds.length - 4;i <= size;i += 2) {
    square += (crds[i + 2] - crds[i]) * (crds[i + 1] + crds[i + 3]);
  }
  square *= .5;
  return Math.abs(square);
}, coordinate2Vector:function(x1, y1, x2, y2) {
  return [x2 - x1, y2 - y1];
}, swapVectorDirection:function(vec) {
  vec[0] *= -1;
  vec[1] *= -1;
  return vec;
}, segmentIntersectionLine:function(x1, y1, x2, y2, eq) {
  var d1 = window.lib.geometry.distanceToLine(x1, y1, eq);
  var d2 = window.lib.geometry.distanceToLine(x2, y2, eq);
  if (Math.sign(d1) != Math.sign(d2)) {
    var distance = Math.abs(d1) + Math.abs(d2);
    return [x1 + (x2 - x1) * Math.abs(d1) / distance, y1 + (y2 - y1) * Math.abs(d1) / distance];
  }
  return false;
}, lineIntersection:function(eq1, eq2) {
  var x = (eq1.C * eq2.B - eq2.C * eq1.B) / (eq2.A * eq1.B - eq1.A * eq2.B);
  var y = -(eq1.C + eq1.A * x) / eq1.B;
  return [x, y];
}, isDirectionEquals:function(normalizeVec1, normalizeVec2) {
  return Math.abs(normalizeVec2[0]) - Math.abs(normalizeVec1[0]) < 1E-10 && Math.abs(normalizeVec2[1]) - Math.abs(normalizeVec1[1]) < 1E-10;
}, transform:function(originalCrds, scaleX, scaleY, moveX, moveY, angle, pivotX, pivotY) {
  var crds = originalCrds.slice();
  if (scaleX != 1 || scaleY != 1) {
    for (i = 0, len = crds.length;i < len;i += 2) {
      crds[i] = pivotX + (crds[i] - pivotX) * scaleX;
      crds[i + 1] = pivotY + (crds[i + 1] - pivotY) * scaleY;
    }
  }
  if (!isEmpty(angle) && angle != 0) {
    var x, y;
    for (i = 0, len = crds.length;i < len;i += 2) {
      x = crds[i] - pivotX;
      y = crds[i + 1] - pivotY;
      crds[i] = x * Math.cos(angle) - y * Math.sin(angle) + pivotX;
      crds[i + 1] = x * Math.sin(angle) + y * Math.cos(angle) + pivotY;
    }
  }
  if (moveX != 0 || moveY != 0) {
    for (i = 0, len = crds.length;i < len;i += 2) {
      crds[i] = crds[i] + moveX;
      crds[i + 1] = crds[i + 1] + moveY;
    }
  }
  return crds;
}, nearestLine:function(crds, x, y, threshold, isOnlyInBBox) {
  if (typeof isOnlyInBBox === "undefined") {
    isOnlyInBBox = true;
  }
  var minDistance = Number.MAX_VALUE;
  var minDistancePoint = -1;
  var distance;
  var xMin, xMax, yMin, yMax;
  var eq;
  for (var i = 0, size = crds.length - 4;i <= size;i += 2) {
    xMin = Math.min(crds[i], crds[i + 2]);
    xMax = Math.max(crds[i], crds[i + 2]);
    yMin = Math.min(crds[i + 1], crds[i + 3]);
    yMax = Math.max(crds[i + 1], crds[i + 3]);
    if (threshold == Number.POSITIVE_INFINITY || window.lib.geometry.isCrdBetween(x, y, xMin - threshold, yMin - threshold, xMax + threshold, yMax + threshold)) {
      eq = window.lib.geometry.lineEquation(crds[i], crds[i + 1], crds[i + 2], crds[i + 3]);
      if (eq.isHorizontal) {
        distance = y - crds[i + 1];
      } else {
        if (eq.isVertical) {
          distance = x - crds[i];
        } else {
          distance = window.lib.geometry.distanceToLine(x, y, eq);
        }
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
      } else {
        if (eq.isVertical) {
          x0 = crds[i];
          y0 = y;
        } else {
          y0 = (y * eq.A * eq.A - eq.B * eq.C - eq.B * x * eq.A) / (eq.A * eq.A + eq.B * eq.B);
          x0 = -(eq.B * y0 + eq.C) / eq.A;
        }
      }
      xMin = Math.min(crds[i], crds[i + 2]);
      xMax = Math.max(crds[i], crds[i + 2]);
      yMin = Math.min(crds[i + 1], crds[i + 3]);
      yMax = Math.max(crds[i + 1], crds[i + 3]);
      if (!isOnlyInBBox || window.lib.geometry.isCrdBetween(x0, y0, xMin, yMin, xMax, yMax)) {
        return {"point1":i, "point2":i + 2, "distance":distance, "x":x0, "y":y0};
      }
    }
  }
  return null;
}, nearestPointOfLine:function(x, y, lineEquation) {
  var x0, y0;
  if (lineEquation.isHorizontal) {
    x0 = x;
    y0 = -lineEquation.C;
  } else {
    if (lineEquation.isVertical) {
      x0 = -lineEquation.C;
      y0 = y;
    } else {
      y0 = (y * lineEquation.A * lineEquation.A - lineEquation.B * lineEquation.C - lineEquation.B * x * lineEquation.A) / (lineEquation.A * lineEquation.A + lineEquation.B * lineEquation.B);
      x0 = -(lineEquation.B * y0 + lineEquation.C) / lineEquation.A;
    }
  }
  return {"x":x0, "y":y0};
}, normVec2Line:function(eq) {
  var vec = [eq.A, eq.B];
  return window.lib.geometry.normalizeVector(vec);
}, side:function(x, y, eq) {
  return sign(window.lib.geometry.distanceToLine(x, y, eq));
}, mirror:function(crds, eq) {
  if (eq.isVertical) {
    var x0 = -eq.C / eq.A;
    for (var i = 0, size = crds.length;i < size;i += 2) {
      crds[i] = crds[i] - 2 * (crds[i] - x0);
    }
  } else {
    if (eq.isHorizontal) {
      var y0 = -eq.C / eq.B;
      for (i = 0, size = crds.length;i < size;i += 2) {
        crds[i + 1] = crds[i + 1] - 2 * (crds[i + 1] - y0);
      }
    } else {
      for (i = 0, size = crds.length;i < size;i += 2) {
        var n = window.lib.geometry.normVec2Line(eq);
        var d = window.lib.geometry.distanceToLine(crds[i], crds[i + 1], eq);
        crds[i] = -2 * d * n[0] + crds[i];
        crds[i + 1] = -2 * d * n[1] + crds[i + 1];
      }
    }
  }
}, average:function(crds) {
  var x = 0, y = 0;
  for (var i = 0, len = crds.length;i < len;i += 2) {
    x += crds[i];
    y += crds[i + 1];
  }
  return [x / (.5 * len), y / (.5 * len)];
}, isConvexAngle:function(prevX, prevY, currX, currY, nextX, nextY) {
  return (currX - prevX) * (nextY - prevY) - (currY - prevY) * (nextX - prevX);
}, isClockwise:function(crds) {
  var maxYVal = -Number.MAX_VALUE, maxYInd = -1, i, len = crds.length, point;
  for (i = 0;i < len;i += 2) {
    if (crds[i + 1] > maxYVal) {
      maxYVal = crds[i + 1];
      maxYInd = i;
    }
  }
  i = maxYInd;
  var prevIndex;
  do {
    i -= 2;
    if (i < 0) {
      i = len - 2;
    }
    prevIndex = i;
  } while (i !== maxYInd && crds[i] === crds[maxYInd] && crds[i + 1] === crds[maxYInd + 1]);
  i = maxYInd;
  var angle;
  var nextIndex;
  do {
    i += 2;
    if (i === len) {
      i = 0;
    }
    nextIndex = i;
  } while (i !== maxYInd && (angle = window.lib.geometry.isConvexAngle(crds[prevIndex], crds[prevIndex + 1], crds[maxYInd], crds[maxYInd + 1], crds[nextIndex], crds[nextIndex + 1])) === 0);
  return angle < 0;
}, getConvexPoints:function(crds) {
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
    for (var i = 0;i < len;i += 2) {
      __filterConvexPoints(crds, i, points);
    }
  } else {
    for (i = len - 2;i >= 0;i -= 2) {
      __filterConvexPoints(crds, i, p, points);
    }
  }
  return points.slice(0, p + 2);
}, getCurveIntersects:function(firstCurveCoordinates, secondCurveCoordinates, stepMultiplier) {
  var meanXYList = [];
  var intersects = [];
  var step = 5 * stepMultiplier;
  for (var p = 0;p < firstCurveCoordinates.length / 2;p += 3) {
    var minSX = -1, minSY = -1, minDistance = Number.MAX_VALUE;
    var fx = firstCurveCoordinates[p * 2];
    var fy = firstCurveCoordinates[p * 2 + 1];
    for (var pp = 0;pp < secondCurveCoordinates.length / 2;pp += 3) {
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
    for (var p = 0;p < firstCurveCoordinates.length / 2 - 1;p += 3) {
      _spline = window.lib.geometry.curveToSpline(firstCurveCoordinates[p * 2], firstCurveCoordinates[p * 2 + 1], firstCurveCoordinates[p * 2 + 2], firstCurveCoordinates[p * 2 + 3], firstCurveCoordinates[p * 2 + 4], firstCurveCoordinates[p * 2 + 5], firstCurveCoordinates[p * 2 + 6], firstCurveCoordinates[p * 2 + 7], 20);
      Array.prototype.push.apply(firstCurveToSpline, _spline);
    }
    for (var pp = 0;pp < secondCurveCoordinates.length / 2 - 1;pp += 3) {
      _spline = window.lib.geometry.curveToSpline(secondCurveCoordinates[pp * 2], secondCurveCoordinates[pp * 2 + 1], secondCurveCoordinates[pp * 2 + 2], secondCurveCoordinates[pp * 2 + 3], secondCurveCoordinates[pp * 2 + 4], secondCurveCoordinates[pp * 2 + 5], secondCurveCoordinates[pp * 2 + 6], secondCurveCoordinates[pp * 2 + 7], 20);
      Array.prototype.push.apply(secondCurveToSpline, _spline);
    }
    if (secondCurveToSpline.length > 0 && firstCurveToSpline.length > 0) {
      var mx1, my1, mx2, my2;
      var length, pointStep, ratio, remLength = 0, curLength = step;
      var pointOnLine = [0, 0];
      for (var m = 0;m < meanCoordinates.length - 2;m += 2) {
        mx1 = meanCoordinates[m];
        my1 = meanCoordinates[m + 1];
        mx2 = meanCoordinates[m + 2];
        my2 = meanCoordinates[m + 3];
        length = window.lib.geometry.vectLen(mx2 - mx1, my2 - my1);
        pointStep = Math.round((length + remLength) / step);
        if (remLength + length < step) {
          remLength += length;
        }
        for (var j = 0;j < pointStep;j++) {
          ratio = (curLength - remLength) / (length - curLength);
          curLength += step;
          pointOnLine = window.lib.geometry.calcDividedSegmentPoint(mx1, my1, mx2, my2, ratio);
          var normalToPoint = window.lib.geometry.calcNormalToPointOnSegment(pointOnLine[0], pointOnLine[1], mx1, my1, mx2, my2);
          var pointOnLine1 = window.lib.geometry.calcLineAndContourCrossPoint(normalToPoint[0], normalToPoint[1], normalToPoint[2], normalToPoint[3], firstCurveToSpline);
          var pointOnLine2 = window.lib.geometry.calcLineAndContourCrossPoint(normalToPoint[0], normalToPoint[1], normalToPoint[2], normalToPoint[3], secondCurveToSpline);
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
  return {intersects:intersects, meanCoordinates:meanCoordinates};
}, coarsePolyline:function(xy, maxError, maxLen) {
  if (xy == null || xy.length < 6) {
    return xy;
  }
  var nPt = Math.round(xy.length / 2);
  var mark = [];
  var points = [];
  for (var i = 0;i < xy.length;i += 2) {
    points.push([xy[i], xy[i + 1]]);
  }
  var _approximatedCurve = window.lib.geometry.RDPsd(points, Math.pow(maxError, 2));
  var approximatedCurve = [];
  _approximatedCurve.forEach(function(point) {
    approximatedCurve.push(point[0]);
    approximatedCurve.push(point[1]);
  });
  return approximatedCurve;
}, vectLen:function(vx, vy) {
  var ax = Math.abs(vx);
  var ay = Math.abs(vy);
  if (ax == 0 && ay == 0) {
    return 0;
  }
  if (ax > ay) {
    ay /= ax;
    return ax * Math.sqrt(1 + ay * ay);
  } else {
    ax /= ay;
    return ay * Math.sqrt(1 + ax * ax);
  }
}, curveToSpline:function(x1, y1, x2, y2, x3, y3, x4, y4, segmentsCount) {
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
}, calcDividedSegmentPoint:function(x1, y1, x2, y2, ratio) {
  var x = (x1 + ratio * x2) / (1 + ratio);
  var y = (y1 + ratio * y2) / (1 + ratio);
  return [x, y];
}, calcNormalToPointOnSegment:function(px, py, x1, y1, x2, y2) {
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
}, calcLineAndContourCrossPoint:function(x1, y1, x2, y2, contour) {
  var minD = Number.MAX_VALUE, curD;
  var minPoint = [], lastPoint;
  for (var i = 0;i < contour.length - 2;i += 2) {
    lastPoint = window.lib.geometry.calcLineAndSegmentCrossPoint(x1, y1, x2, y2, contour[i], contour[i + 1], contour[i + 2], contour[i + 3]);
    if (lastPoint != null) {
      curD = window.lib.geometry.vectLen(lastPoint[0] - x1, lastPoint[1] - y1);
      if (curD < minD) {
        minPoint = lastPoint;
        minD = curD;
      }
    }
  }
  if (minPoint.length == 0) {
    return null;
  }
  return minPoint;
}, calcLineAndSegmentCrossPoint:function(x1, y1, x2, y2, x3, y3, x4, y4) {
  var dd = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  var bb = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
  if (dd == 0) {
    if (bb != 0) {
      return null;
    }
    return [];
  }
  var u = bb / dd;
  if (u < 0 || u > 1) {
    return null;
  }
  return [x3 + u * (x4 - x3), y3 + u * (y4 - y3)];
}, calcLineCoefs:function(x1, y1, x2, y2) {
  var abc = [];
  abc.push(y1 - y2);
  abc.push(x2 - x1);
  abc.push(x1 * y2 - x2 * y1);
  return abc;
}, RDPsd:function(points, epsilon) {
  var firstPoint = points[0];
  var lastPoint = points[points.length - 1];
  if (points.length < 3) {
    return points;
  }
  var index = -1;
  var dist = 0;
  for (var i = 1;i < points.length - 1;i++) {
    var cDist = window.lib.geometry.distanceFromPointToLine(points[i], firstPoint, lastPoint);
    if (cDist > dist) {
      dist = cDist;
      index = i;
    }
  }
  if (dist > epsilon) {
    var l1 = points.slice(0, index + 1);
    var l2 = points.slice(index);
    var r1 = window.lib.geometry.RDPsd(l1, epsilon);
    var r2 = window.lib.geometry.RDPsd(l2, epsilon);
    var rs = r1.slice(0, r1.length - 1).concat(r2);
    return rs;
  } else {
    return [firstPoint, lastPoint];
  }
}, RDPppd:function(points, epsilon) {
  var firstPoint = points[0];
  var lastPoint = points[points.length - 1];
  if (points.length < 3) {
    return points;
  }
  var index = -1;
  var dist = 0;
  for (var i = 1;i < points.length - 1;i++) {
    var cDist = window.lib.geometry.findPerpendicularDistance(points[i], firstPoint, lastPoint);
    if (cDist > dist) {
      dist = cDist;
      index = i;
    }
  }
  if (dist > epsilon) {
    var l1 = points.slice(0, index + 1);
    var l2 = points.slice(index);
    var r1 = window.lib.geometry.RDPppd(l1, epsilon);
    var r2 = window.lib.geometry.RDPppd(l2, epsilon);
    var rs = r1.slice(0, r1.length - 1).concat(r2);
    return rs;
  } else {
    return [firstPoint, lastPoint];
  }
}, findPerpendicularDistance:function(p, p1, p2) {
  var result;
  var slope;
  var intercept;
  if (p1[0] == p2[0]) {
    result = Math.abs(p[0] - p1[0]);
  } else {
    slope = (p2[1] - p1[1]) / (p2[0] - p1[0]);
    intercept = p1[1] - slope * p1[0];
    result = Math.abs(slope * p[0] - p[1] + intercept) / Math.sqrt(Math.pow(slope, 2) + 1);
  }
  return result;
}, distanceFromPointToLine:function(p, a, b) {
  p = {x:p[0], y:p[1]};
  a = {x:a[0], y:a[1]};
  b = {x:b[0], y:b[1]};
  return Math.sqrt(window.lib.geometry.distanceFromPointToLineSquared(p, a, b));
}, distanceFromPointToLineSquared:function(p, i, j) {
  var lineLength = window.lib.geometry.pointDistance(i, j);
  if (lineLength == 0) {
    return window.lib.geometry.pointDistance(p, a);
  }
  var t = ((p.x - i.x) * (j.x - i.x) + (p.y - i.y) * (j.y - i.y)) / lineLength;
  if (t < 0) {
    return window.lib.geometry.pointDistance(p, i);
  }
  if (t > 1) {
    return window.lib.geometry.pointDistance(p, j);
  }
  return window.lib.geometry.pointDistance(p, {x:i.x + t * (j.x - i.x), y:i.y + t * (j.y - i.y)});
}, pointDistance:function(i, j) {
  return window.lib.geometry.sqr(i.x - j.x) + window.lib.geometry.sqr(i.y - j.y);
}, sqr:function(x) {
  return x * x;
}, translateValue:function(value, degree, pixelSize) {
  var result = parseFloat(value);
  if (isNaN(result)) {
    return value;
  }
  if (degree == null || pixelSize == null) {
    return result;
  }
  if (degree == 1) {
    result *= pixelSize;
  } else {
    if (degree == 2) {
      result *= Math.pow(pixelSize, 2);
    } else {
      if (degree == 3) {
        result *= Math.pow(pixelSize, 3);
      }
    }
  }
  return result;
}};
if (!window.lib) {
  window.lib = {};
}
if (!window.lib.animation) {
  window.lib.animation = {};
}
window.lib.animation.AnimationFrame = function(options) {
  this.time = options.time;
  this.x = options.x || 0;
  this.y = options.y || 0;
  this.size = options.size || 0;
  this.opacity = window.lib.baseTypes.emptyTo(options.opacity, 1);
};
if (!window.lib) {
  window.lib = {};
}
if (!window.lib.animation) {
  window.lib.animation = {};
}
window.lib.animation.Animation = function(options) {
  this.duration = options.duration || 1E3;
  this.fpms = options.fpms || .06;
  this.frames = [];
  this.time = 0;
  this.stopped = true;
  this.keyFrames = [];
  this.prevFrameIndex = 0;
  this.onAnimationStartCallback = options.onAnimationStartCallback;
  this.onAnimationCallback = options.onAnimationCallback;
  this.onAnimationStopCallback = options.onAnimationStopCallback;
  this.onAnimationCallbackContext = options.onAnimationCallbackContext;
};
window.lib.animation.Animation.prototype.addKeyFrame = function(keyFrame) {
  this.keyFrames.push(keyFrame);
};
window.lib.animation.Animation.prototype.setFrames = function(frames) {
  this.frames = frames;
};
window.lib.animation.Animation.prototype.start = function() {
  this.time = 0;
  this.stopped = false;
  this.lastTimestamp = 0;
  this.prevFrameIndex = 0;
  this.onAnimationStartCallback && this.onAnimationStartCallback.call(this.onAnimationCallbackContext);
  this.onAnimationRequest();
};
window.lib.animation.Animation.prototype.onAnimationRequest = function(timestamp) {
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
    return;
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
};
window.lib.animation.Animation.prototype.createFrames = function() {
};
window.lib.animation.Animation.prototype.stop = function() {
  this.stopped = true;
  this.time = 0;
  this.prevFrameIndex = 0;
  this.onAnimationStopCallback && this.onAnimationStopCallback.call(this.onAnimationCallbackContext);
};
if (!window.animation) {
  window.animation = {};
}
window.animation.AnimationLinear = function(options) {
  window.animation.AnimationLinear.superclass.constructor.call(this, options);
};
window.lib.objects.extend(window.animation.AnimationLinear, window.lib.animation.Animation);
window.animation.AnimationLinear.prototype.createFrames = function() {
  this.frames = [];
  var attributes = [];
  for (var a in this.keyFrames[0]) {
    if (a !== "time") {
      attributes.push(a);
    }
  }
  for (var i = 0, len = this.keyFrames.length - 1;i < len;++i) {
    var diffTime = this.duration * (this.keyFrames[i + 1].time - this.keyFrames[i].time);
    var frameCount = this.fpms * diffTime;
    var diffAttributes = {};
    for (a = 0;a < attributes.length;++a) {
      var attribute = attributes[a];
      diffAttributes[attribute] = (this.keyFrames[i + 1][attribute] - this.keyFrames[i][attribute]) / frameCount;
    }
    var dt = diffTime / frameCount;
    var attributes0 = {};
    for (a = 0;a < attributes.length;++a) {
      attribute = attributes[a];
      attributes0[attribute] = this.keyFrames[i][attribute];
    }
    var t0 = this.duration * this.keyFrames[i].time;
    for (var f = 0;f < frameCount;++f) {
      var animationFrame = new window.lib.animation.AnimationFrame({time:t0 + f * dt});
      for (a = 0;a < attributes.length;++a) {
        attribute = attributes[a];
        animationFrame[attribute] = attributes0[attribute] + f * diffAttributes[attribute];
      }
      this.frames.push(animationFrame);
    }
  }
};
window.animation.AnimationLinear.prototype.createFrames_old = function() {
  var count_2 = 30 * this.duration;
  var count = count_2 + count_2;
  var dx = (this.endFrame.x - this.startFrame.x) / count;
  var dy = (this.endFrame.y - this.startFrame.y) / count;
  var frames = [];
  var size = 0;
  var dsize = 1 / count_2;
  var sizes = [];
  for (var i = 0;i < count_2;++i) {
    var t = i * dsize;
    var s = Math.exp(-.5 / t);
    sizes.push(s);
    frames.push(new window.lib.animation.AnimationFrame({x:this.startFrame.x + i * dx, y:this.startFrame.y + i * dy}));
  }
  for (i = count_2;i < count;++i) {
    var t = (2 * count_2 - i) * dsize;
    var s = Math.exp(-.5 / t);
    sizes.push(s);
    frames.push(new window.lib.animation.AnimationFrame({x:this.startFrame.x + i * dx, y:this.startFrame.y + i * dy}));
  }
  var max = 0;
  for (var i = 0;i < sizes.length;++i) {
    max = Math.max(max, sizes[i]);
  }
  for (var i = 0;i < sizes.length;++i) {
    sizes[i] = sizes[i] / max;
    frames[i].size = .8 * sizes[i];
  }
  this.setFrames(frames);
};
if (!window.coin) {
  window.coin = {};
}
window.coin.Coin = function(options) {
  this.img = options.img;
  $(this.img).addClass("coin");
  $(this.img).addClass("invisible");
  this.imgWidth = this.img.width;
};
window.coin.Coin.prototype.setAnimation = function(animation) {
  this.animation = animation;
};
window.coin.Coin.prototype.onAnimation = function(frame) {
  $(this.img).css({left:frame.x + "px", top:frame.y + "px", width:frame.size * this.imgWidth / this.scaleFactor + "px"});
};
window.coin.Coin.prototype.onAnimationStart = function() {
  this.scaleFactor = window.lib.objects.monopolyScaleFactor();
  $(this.img).removeClass("invisible");
};
window.coin.Coin.prototype.onAnimationStop = function() {
  $(this.img).addClass("invisible");
};
if (!window.coin) {
  window.coin = {};
}
if (!window.coin.animation) {
  window.coin.animation = {};
}
window.coin.animation.CoinsAnimation = function(options) {
  this.duration = options.duration || 1500;
  this.count = 35;
  this.coins = [];
  this.url = options.url || "/image/coin.png";
  this.animationResolve = null;
};
window.coin.animation.CoinsAnimation.prototype.addCoin = function(imageCoin) {
  var img = new Image;
  img.src = imageCoin.src;
  this.coins.push(new window.coin.Coin({img:img}));
  $("body").append(img);
};
window.coin.animation.CoinsAnimation.prototype.play = function(player1, player2, player1Cash, player2Cash) {
  var decimalPointSeparator = $.animateNumber.numberStepFactories.separator(".");
  $(player1 + " .cash span").animateNumber({number:player1Cash, numberStep:decimalPointSeparator});
  $(player2 + " .cash span").animateNumber({number:player2Cash, numberStep:decimalPointSeparator});
  var offset1 = $(player1).offset();
  var x1 = offset1.left + $(player1).width() * .5;
  var y1 = offset1.top + $(player1).height() * .5;
  var offset2 = $(player2).offset();
  var x2 = offset2.left + $(player2).width() * .5;
  var y2 = offset2.top + $(player2).height() * .5;
  var x3 = (x1 + x2) * .5 - 300;
  var y3 = (y1 + y2) * .5;
  var xVarRadius = $(player1).width() * .5;
  var yVarRadius = $(player1).height() * .5;
  for (var i = 0;i < this.coins.length;++i) {
    var coin = this.coins[i];
    var animation = new window.animation.AnimationLinear({duration:this.duration + 250 - 500 * Math.random(), onAnimationCallback:coin.onAnimation, onAnimationStartCallback:coin.onAnimationStart, onAnimationStopCallback:coin.onAnimationStop, onAnimationCallbackContext:coin});
    var _x1 = x1 + Math.ceil(xVarRadius - Math.random() * 2 * xVarRadius);
    var _y1 = y1 + Math.ceil(yVarRadius - Math.random() * 2 * yVarRadius);
    var _x2 = x2 + .25 * Math.ceil(xVarRadius - Math.random() * 2 * xVarRadius);
    var _y2 = y2 + .25 * Math.ceil(yVarRadius - Math.random() * 2 * yVarRadius);
    animation.addKeyFrame(new window.lib.animation.AnimationFrame({time:0, x:_x1, y:_y1, size:.2}));
    animation.addKeyFrame(new window.lib.animation.AnimationFrame({time:.5, x:(_x1 + _x2) * .5, y:(_y1 + _y2) * .5, size:1}));
    animation.addKeyFrame(new window.lib.animation.AnimationFrame({time:1, x:_x2, y:_y2, size:.2}));
    animation.createFrames();
    coin.setAnimation(animation);
  }
  var p = new Promise(function(resolve, reject) {
    this.animationResolve = resolve;
  }.bind(this));
  for (i = 0;i < this.coins.length;++i) {
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
window.coin.animation.CoinsAnimation.prototype.loadScene = function() {
  return new Promise(function(resolve, reject) {
    var imageCoin = new Image;
    var coins = this;
    imageCoin.onload = function() {
      for (var i = 0;i < coins.count;++i) {
        coins.addCoin(this);
      }
      resolve();
    };
    imageCoin.src = this.url;
  }.bind(this));
};
if (!window.chip) {
  window.chip = {};
}
if (!window.chip.animation) {
  window.chip.animation = {};
}
(function(d) {
  var q = function(b) {
    return b.split("").reverse().join("");
  }, m = {numberStep:function(b, a) {
    var e = Math.floor(b);
    d(a.elem).text(e);
  }}, h = function(b) {
    var a = b.elem;
    a.nodeType && a.parentNode && (a = a._animateNumberSetter, a || (a = m.numberStep), a(b.now, b));
  };
  d.Tween && d.Tween.propHooks ? d.Tween.propHooks.number = {set:h} : d.fx.step.number = h;
  d.animateNumber = {numberStepFactories:{append:function(b) {
    return function(a, e) {
      var g = Math.floor(a);
      d(e.elem).prop("number", a).text(g + b);
    };
  }, separator:function(b, a, e) {
    b = b || " ";
    a = a || 3;
    e = e || "";
    return function(g, k) {
      var c = Math.floor(g).toString(), t = d(k.elem);
      if (c.length > a) {
        for (var f = c, l = a, m = f.split("").reverse(), c = [], n, r, p, s = 0, h = Math.ceil(f.length / l);s < h;s++) {
          n = "";
          for (p = 0;p < l;p++) {
            r = s * l + p;
            if (r === f.length) {
              break;
            }
            n += m[r];
          }
          c.push(n);
        }
        f = c.length - 1;
        l = q(c[f]);
        c[f] = q(parseInt(l, 10).toString());
        c = c.join(b);
        c = q(c);
      }
      t.prop("number", g).text(c + e);
    };
  }}};
  d.fn.animateNumber = function() {
    for (var b = arguments[0], a = d.extend({}, m, b), e = d(this), g = [a], k = 1, c = arguments.length;k < c;k++) {
      g.push(arguments[k]);
    }
    if (b.numberStep) {
      var h = this.each(function() {
        this._animateNumberSetter = b.numberStep;
      }), f = a.complete;
      a.complete = function() {
        h.each(function() {
          delete this._animateNumberSetter;
        });
        f && f.apply(this, arguments);
      };
    }
    return e.animate.apply(e, g);
  };
})(jQuery);
window.chip.animation.ChipAnimation = function(options) {
  this.duration = options.duration || 1500;
  this.sparkUrl = options.sparkUrl || "/images/spark.png";
  this.sparkCount = 100;
  this.sparks = [];
};
window.chip.animation.ChipAnimation.prototype.addSpark = function(imageSpark) {
  var img = new Image;
  img.src = imageSpark.src;
  var chipSpark = new window.chip.spark.ChipSpark({img:img});
  this.sparks.push(chipSpark);
  $("#chips").append(img);
  var animation = new window.animation.AnimationLinear({duration:500, onAnimationStartCallback:chipSpark.onAnimationStart, onAnimationCallback:chipSpark.onAnimation, onAnimationStopCallback:chipSpark.onAnimationStop, onAnimationCallbackContext:chipSpark});
  animation.addKeyFrame(new window.lib.animation.AnimationFrame({time:0, x:0, y:0, size:.1, opacity:0}));
  animation.addKeyFrame(new window.lib.animation.AnimationFrame({time:.3, x:0, y:0, size:.3, opacity:1}));
  animation.addKeyFrame(new window.lib.animation.AnimationFrame({time:.7, x:0, y:0, size:.3, opacity:1}));
  animation.addKeyFrame(new window.lib.animation.AnimationFrame({time:1, x:0, y:0, size:.1, opacity:0}));
  chipSpark.setAnimation(animation);
};
window.chip.animation.ChipAnimation.prototype.loadScene = function() {
  return new Promise(function(resolve, reject) {
    var imageSpark = new Image;
    $(imageSpark).addClass("invisible");
    var chipAnimation = this;
    imageSpark.onload = function() {
      for (var i = 0;i < chipAnimation.sparkCount;++i) {
        chipAnimation.addSpark(this);
      }
      resolve();
    };
    imageSpark.src = this.sparkUrl;
  }.bind(this));
};
window.chip.animation.ChipAnimation.prototype.play = function(playerNum, currentFieldId, nextFieldId, lastFieldId) {
  this.fields = [];
  for (var i = 0;i < 38;++i) {
    var pf = $("#pf-" + i);
    this.fields.push({x:parseFloat(pf.css("left")), y:parseFloat(pf.css("top")), width:parseFloat(pf.width()), height:parseFloat(pf.height())});
  }
  this.$chip = $("#chips").find(".player" + playerNum);
  var chipLeft = parseFloat(this.$chip.css("left"));
  var chipTop = parseFloat(this.$chip.css("top"));
  this.chipWidth_2 = parseFloat(this.$chip.css("width")) * .5;
  this.chipHeight_2 = parseFloat(this.$chip.css("height")) * .5;
  var direction = 1;
  var totalDistance = 0;
  var fieldId = currentFieldId;
  var stepFieldId = fieldId + direction;
  if (stepFieldId > 37) {
    stepFieldId = 0;
  } else {
    if (stepFieldId < 0) {
      stepFieldId = 37;
    }
  }
  var distances = [];
  var animation = new window.animation.AnimationLinear({duration:this.duration, onAnimationCallback:this.onAnimation, onAnimationStartCallback:this.onAnimationStart, onAnimationStopCallback:this.onAnimationStop, onAnimationCallbackContext:this});
  animation.addKeyFrame(new window.lib.animation.AnimationFrame({time:0, x:this.fields[fieldId].x + this.fields[fieldId].width * .5, y:this.fields[fieldId].y + this.fields[fieldId].height * .5}));
  do {
    var distance = window.lib.geometry.distance(this.fields[fieldId].x, this.fields[fieldId].y, this.fields[stepFieldId].x, this.fields[stepFieldId].y);
    distances.push(distance);
    totalDistance += distance;
    fieldId = stepFieldId;
    stepFieldId += direction;
    if (stepFieldId > 37) {
      stepFieldId = 0;
    } else {
      if (stepFieldId < 0) {
        stepFieldId = 37;
      }
    }
    var keyFrame = new window.lib.animation.AnimationFrame({time:null, x:this.fields[fieldId].x + this.fields[fieldId].width * .5, y:this.fields[fieldId].y + this.fields[fieldId].height * .5});
    animation.addKeyFrame(keyFrame);
  } while (fieldId != nextFieldId);
  if (nextFieldId != lastFieldId) {
    var distance = window.lib.geometry.distance(this.fields[nextFieldId].x, this.fields[nextFieldId].y, this.fields[lastFieldId].x, this.fields[lastFieldId].y);
    distances.push(distance);
    totalDistance += distance;
    animation.addKeyFrame(new window.lib.animation.AnimationFrame({time:1, x:this.fields[lastFieldId].x + this.fields[lastFieldId].width * .5, y:this.fields[lastFieldId].y + this.fields[lastFieldId].height * .5}));
  }
  var _distance = 0;
  for (var f = 1;f < animation.keyFrames.length;++f) {
    if (animation.keyFrames[f].time == null) {
      _distance += distances[f - 1];
      animation.keyFrames[f].time = _distance / totalDistance;
    }
  }
  animation.createFrames();
  animation.start();
  var p = new Promise(function(resolve, reject) {
    this.animationResolve = resolve;
  }.bind(this));
  return p;
};
window.chip.animation.ChipAnimation.prototype.onAnimation = function(frame) {
  var x = frame.x - this.chipWidth_2;
  var y = frame.y - this.chipHeight_2;
  var varX = 1 * this.chipWidth_2;
  var varY = 1 * this.chipHeight_2;
  var x0 = parseFloat(this.$chip.css("left"));
  var y0 = parseFloat(this.$chip.css("top"));
  var vec = window.lib.geometry.coordinate2Vector(x0, y0, x, y);
  window.lib.geometry.normalizeVector(vec);
  this.$chip.css({left:x + "px", top:y + "px"});
  if (this.sparkIndex < this.sparks.length) {
    var spark = this.sparks[this.sparkIndex];
    var x2 = frame.x + varX - 2 * varX * Math.random() - 30 * vec[0];
    var y2 = frame.y + varY - 2 * varY * Math.random() + 30 * vec[1];
    var dt0 = spark.animation.keyFrames[0].time;
    spark.animation.keyFrames[0].x = frame.x;
    spark.animation.keyFrames[0].y = frame.y;
    var dt1 = dt0 + spark.animation.keyFrames[1].time;
    spark.animation.keyFrames[1].x = frame.x + dt1 * (x2 - frame.x);
    spark.animation.keyFrames[1].y = frame.y + dt1 * (y2 - frame.y);
    var dt2 = dt1 + spark.animation.keyFrames[2].time;
    spark.animation.keyFrames[2].x = frame.x + dt2 * (x2 - frame.x);
    spark.animation.keyFrames[2].y = frame.y + dt2 * (y2 - frame.y);
    spark.animation.keyFrames[3].x = x2;
    spark.animation.keyFrames[3].y = y2;
    spark.animation.createFrames();
    spark.animation.start();
    ++this.sparkIndex;
  }
};
window.chip.animation.ChipAnimation.prototype.onAnimationStart = function() {
  this.sparkIndex = 0;
};
window.chip.animation.ChipAnimation.prototype.onAnimationStop = function() {
  this.animationResolve();
};
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
  this.sparkWidth_2 = this.img.width * .5;
  this.sparkHeight_2 = this.img.height * .5;
};
window.chip.spark.ChipSpark.prototype.setAnimation = function(animation) {
  this.animation = animation;
};
window.chip.spark.ChipSpark.prototype.onAnimation = function(frame) {
  var x = frame.x;
  var y = frame.y;
  $(this.img).css({left:x + "px", top:y + "px", width:this.sparkWidth * frame.size / this.scaleFactor + "px", opacity:frame.opacity});
};
window.chip.spark.ChipSpark.prototype.onAnimationStart = function() {
  this.scaleFactor = window.lib.objects.monopolyScaleFactor();
  $(this.img).removeClass("invisible");
};
window.chip.spark.ChipSpark.prototype.onAnimationStop = function() {
  $(this.img).addClass("invisible");
};
