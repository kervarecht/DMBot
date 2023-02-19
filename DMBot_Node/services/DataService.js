const DBService = require('../services/DBService.js');

class Trait = {
    constructor(name, description){
        this.name = name;
        this.description = description;
    }
}
const insertTrait = function (
    name,
    description,
    traitType,
    abilityScore,
    abilityScoreModifier,
    abilityScoreAdvantage,
    abilityScoreProficiency,
    savingThrow,
    savingThrowModifier,
    savingThrowAdvantage,
    skill,
    skillModifier,
    skillAdvantage,
    skillExpertise,
    race,
    subrace,
    background,
    characterClass,
    subclass,
    source) {
    
}



module.exports = {
    insertTrait: insertTrait
}