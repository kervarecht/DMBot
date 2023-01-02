const formatD20Rolls = function (rolls, advantage) {
    if (!Array.isArray(rolls)) return new TypeError("Rolls are not in array format", "FormatterService.js");
    console.log(rolls);
    //create a referenceArray
    let referenceArray = []
    //loop through the array elements
    for (let i = 0; i < rolls.length; i++) {
        //loop through the element's values
        for (let j = 0; j < rolls[i].length; j++) {
            if (!Array.isArray(rolls[i][j])) {
                //if the value is not an array, format it ((**value**)) and push to the referenceArray
                let processedString = '';
                processedString = "(**".concat(rolls[i][j], "**)");
                referenceArray.push(processedString);
            }
            else {
                //if the value is an array, get the result index for the advantage type
                let index = getResultIndex(rolls[i][j], advantage);
                //update the result index for the advantage roll (0 if no advantage) to **value**
                let processedArray = rolls[i][j]
                processedArray[index] = "**".concat(processedArray[index], "**");
                //update the first value to be (value and the second value to be value)
                processedArray[0] = "(".concat(processedArray[0]);
                processedArray[1] = processedArray[1].toString().concat(")");
                //join with a comma in between and push to the referenceArray
                referenceArray.push(processedArray.join(","));
            }
        }
    }
    return referenceArray.join(",");
}

const formatTotal = function (total) {
    return `**${total}**`;
}

const getResultIndex = function (array, advantage) {
    let rollWithAdvantage, rollWithDisadvantage, resultArray;
    if (Number(advantage) === 1) rollWithAdvantage = true
    if (Number(advantage) === 2) rollWithDisadvantage = true;
    let value = array[0];
    let index = 0;
    if (rollWithAdvantage) {
        for (let i = 0; i < array.length; i++) {
            if (value < array[i]) {
                value = array[i]
                index = i;
            }
        }
    }
    else if (rollWithDisadvantage) {
        for (let i = 0; i < array.length; i++) {
            if (value > array[i]) {
                value = array[i]
                index = i;
            }
        }
    }
    else {
        index = 0;
    }
    return index;
}


module.exports = {
    formatD20Rolls: formatD20Rolls,
    formatTotal: formatTotal,
    getResultIndex: getResultIndex
}