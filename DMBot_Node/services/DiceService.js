const roll = function (diceString, modifier, advantage) {
    if (!diceString) diceString = "1d20"
    if (!modifier) modifier = 0

    let results = {
        "total": 0,
        "results": []
    }

    const operations = parseOperations(diceString);
    for (let x = 0; x < operations.inputs.length; x++) {
        let rolls = []
        let rollCount, diceType, modifier;
        if (operations.inputs[x].modifier !== null) {
            modifier = Number(operations.inputs[x].modifier);
            rolls.push(modifier);
            results.total += modifier
        } else {
            if (operations.inputs[x].diceCount === null) {
                rollCount = 1;
            }
            else {
                rollCount = Number(operations.inputs[x].diceCount)

            }
            diceType = Number(operations.inputs[x].diceValue);
            for (let i = 0; i < rollCount; i++) {
                let resultOne, resultTwo, resultsArray, referenceArray;
                resultsArray = [];
                referenceArray = [];
                resultOne = Math.ceil(Math.random() * diceType)
                resultTwo = Math.ceil(Math.random() * diceType)
                resultsArray.push(resultOne, resultTwo);
                referenceArray.push(resultOne, resultTwo);
                rolls.push(referenceArray);
                results.total += advantageSort(resultsArray, advantage)[0];
            }
        }
        results.results.push(rolls);
    }

    return results
}
const parseOperations = function (input) {
    if (typeof input != 'string') return new TypeError("Invalid type, expected string", "DiceService.js")
    let operands = []
    let inputArray = []
    let parsingArray = []
    for (let char = 0; char < input.length; char++) {
        if (input[char] === "-" || input[char] === "+") {
            if (char === 0) return new Error("Cannot start with an operation, start with a dice instead", "DiceService.js");
            input[char] === "+" ? operands.push("plus") : operands.push("minus");
            inputArray.push(parseInputs(parsingArray.join("")));
            parsingArray = []
        }
        else {
            parsingArray.push(input[char]);
            if (char == input.length - 1) {
                inputArray.push(parseInputs(parsingArray.join("")));
            }
        }
    }
    return { "operands": operands, "inputs": inputArray };
}
const parseInputs = function (input) {
    if (typeof input != 'string') return new TypeError("Invalid type, expected string", "DiceService.js")
    let diceCount, diceValue, modifier;
    if (!input.includes('d') && Number.isNaN(input)) {
        return Error(`Couldn't parse input ${input}`, "DiceService.js");
    }
    else if (!input.includes('d')) {
        modifier = Number(input);
        diceCount = null;
        diceValue = null;
    }
    else {
        modifier = null;
        let diceArray = input.split("d");
        if (diceArray.length > 2 || diceArray.length == 0) {
            return new Error("Cannot recognize dice format, please use XdY, ex 2d12.", "DiceService.js");
        }
        else if (diceArray.length == 2) {
            diceCount = diceArray[0];
            diceValue = diceArray[1];
        }
        else {
            diceCount = 1;
            diceValue = diceArray[0];
        }
    }
    return { "diceCount": diceCount, "diceValue": diceValue, "modifier": modifier };
}
const advantageSort = function (array, advantage) {
    let rollWithAdvantage, rollWithDisadvantage, sortedArray;
    if (Number(advantage) === 1) rollWithAdvantage = true
    if (Number(advantage) === 2) rollWithDisadvantage = true;
    if (rollWithDisadvantage) {
        sortedArray = array.sort((a, b) => (a-b));
    }
    else if (rollWithAdvantage) {
        sortedArray = array.sort((a, b) => (b-a))
    }
    else {
        sortedArray = array;
    }
    return sortedArray
}

module.exports = {
    roll: roll,
    parseInputs: parseInputs,
    parseOperations: parseOperations,
    advantageSort: advantageSort
}