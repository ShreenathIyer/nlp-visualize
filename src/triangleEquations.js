//returns the length of the opposite side to the angle, using the adjacent side's length
function oppositeTan(angle, adjacent) {
    return Math.tan(angle) * adjacent;
};

//returns the length of the adjacent side to the angle, using the hypotenuse's length
function adjacentCos(angle, hypotenuse) {
    return Math.cos(angle) * hypotenuse;
}

//returns the length of the opposite side to the angle, using the adjacent's length
function oppositeTan(angle, adjacent) {
    return Math.tan(angle) * adjacent;
}

//returns the length of the adjacent side to the angle, using the opposite's length
function adjacentTan(angle, opposite) {
    return opposite / Math.tan(angle);
}

//returns the length of the opposite side to the angle, using the hypotenuse's length
function oppositeSin(angle, hypotenuse) {
    return Math.sin(angle) * hypotenuse;
}

//returns the angle using the opposite and adjacent
function angleTan(opposite, adjacent) {
    return Math.atan(opposite/adjacent);
}

//returns the length of the unknown side of a triangle, using the other two sides' lengths
function triangleSide(sideA, sideB) {
    var hypothenuse, shorterSide;
    if (sideA > sideB) {
        hypothenuse = sideA;
        shorterSide = sideB;
    } else {
        hypothenuse = sideB;
        shorterSide = sideA;
    };
    return Math.sqrt(Math.pow(hypothenuse, 2) - Math.pow(shorterSide, 2))
};

//returns the length of the hypotenuse, using the other two sides' lengths
function triangleHypotenuse(sideA, sideB) {
    return Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2))
};
