const formatD20Rolls = function (rolls, advantage) {
    if (!Array.isArray(rolls)) return new TypeError("Rolls are not in array format", "FormatterService.js");
    //console.log(rolls);
    //create a referenceArray
    let referenceArray = []
    //loop through the array elements
    for (let i = 0; i < rolls.length; i++) {
        //loop through the element's values
        for (let j = 0; j < rolls[i].length; j++) {
            if (!Array.isArray(rolls[i][j])) {

                //if the value is not an array, format it ((**value**)) and push to the referenceArray
                let processedString = '';
                //Add a + if the value is greater than 0
                if (rolls[i][j] > 0) {
                    processedString = "(*+".concat(rolls[i][j], "*)")
                }
                else if (rolls[i][j] < 0) {
                    processedString = "(*".concat(rolls[i][j], "*)")
                }
                else {
                    processedString = "(*0*)"
                }
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
const formatCharacterList = async function (characterArray, fields) {
    if (Array.isArray(characterArray)) {
        let formattedString = '';
        for (let x = 0; x < characterArray.length; x++) {
            let character = await formatCharacterInfo(characterArray[x], fields);
            formattedString = formattedString.concat(character)
            if (x == characterArray.length - 1) {
                //console.log(formattedString);
                return formattedString;
            }
        }

    }
    else {
        response = await formatCharacterInfo(characterArray, fields);
        return response
    }

}

const formatCharacterInfo = async function (characterInfo, fields) {
    if (!Array.isArray(characterInfo)) {
        let formattedArray = [];
        let keys = Object.keys(characterInfo);
        for (let x = 0; x < keys.length; x++) {
            if (fields.includes(keys[x])) {
                let key = keys[x]
                let value = characterInfo[key];
                console.log(key, "value: ", value)
                switch (keys[x]) {
                    case 'character_name':
                        formattedArray.push("**Name: " + value + "** ")
                        break;
                    case 'alignment':
                        formattedArray.push("Alignment: " + value)
                        break;
                    case 'race':
                        formattedArray.push("Race: " + value)
                        break;
                    case 'speed':
                        formattedArray.push("Speed: " + value)
                        break;
                    case 'size':
                        formattedArray.push("Size: " + value)
                        break;
                    case 'trait_name':
                        let trait = "\n*".concat(value, "* ", characterInfo.trait_description);
                        formattedArray.push(trait)
                        break;
                }

            }
            if (x == keys.length - 1) {
                console.log(formattedArray);
                return formattedArray.join(" - ").concat(" \n");
            }
        }

    }
    else {
        let formattedArray = [];
        let basicFieldsArray = ["character_name", "alignment", "race", "speed", "size"]
        let basicFields = basicFieldsArray.filter(field => fields.includes(field));
        //console.log(basicFields);
        let basicInfo = await formatCharacterInfo(characterInfo[0], basicFields);
        formattedArray.push(basicInfo);
        let traitsArray = ["trait_name"]
        for (let i = 0; i < characterInfo.length; i++) {
            let trait = await formatCharacterInfo(characterInfo[i], traitsArray);
            formattedArray.push(trait);
            if (i == characterInfo.length - 1) {
                //console.log(formattedArray);
                return formattedArray.join(" - ").concat(" \
                ");
            }
        }
    }
}

const formatMacro = function(macroName, macroDice, modifier, macroAdvantage) {
    let advantage = macroAdvantage;
    if (advantage == 0) advantage = "No Advantage"
    if (advantage == 1) advantage = "Advantage"
    if (advantage == 2) advantage = "Disadvantage"
    return `Name: **${macroName}**: ${macroDice}  ${modifier}, ${advantage}`
}

const formatAdvantage = function(advantage){
        if (advantage == 0) {
            advantage = "No Advantage"
        }
        else if (advantage == 1) 
        {
            advantage = "Advantage"
        }
        else if (advantage == 2) {
            advantage = "Disadvantage"
        }
        else advantage = '';
        return `${advantage}`
    }

module.exports = {
    formatD20Rolls: formatD20Rolls,
    formatTotal: formatTotal,
    getResultIndex: getResultIndex,
    formatCharacterList: formatCharacterList,
    formatCharacterInfo: formatCharacterInfo,
    formatMacro: formatMacro,
    formatAdvantage: formatAdvantage
}