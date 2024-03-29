const DiceService = require('../services/DiceService.js');

//Validate Dice Rolls Tests
test('Validate Dice Rolls: 1d20', () => {
    expect(DiceService.validateDiceRoll('1d20')).toBe(true);
});

test('Validate Dice Rolls: 2d12', () => {
    expect(DiceService.validateDiceRoll('2d12')).toBe(true);
});

test('Validate Dice Rolls: d4', () => {
    expect(DiceService.validateDiceRoll('d4')).toBe(true);
});

test('Validate Dice Rolls: 1d', () => {
    expect(DiceService.validateDiceRoll('1d')).toBe(false);
});

test('Validate Dice Rolls: 1d0', () => {
    expect(DiceService.validateDiceRoll('1d0')).toBe(false);
});

test('Validate Dice Rolls: 0d20', () => {
    expect(DiceService.validateDiceRoll('0d20')).toBe(false);
});

test('Validate Dice Rolls: 1d-1', () => {
    expect(DiceService.validateDiceRoll('1d-1')).toBe(false);
});

test('Validate Dice Rolls: 1d1.5', () => {
    expect(DiceService.validateDiceRoll('1d1.5')).toBe(false);
});

test('Validate Dice Rolls: 1x20', () => {
    expect(DiceService.validateDiceRoll('1x20')).toBe(false);
});

//Validate Modifier Tests

test('Validate Modifier: +1', () => {
    expect(DiceService.validateModifier('+1')).toBe(true);
});

test('Validate Modifier: -1', () => {
    expect(DiceService.validateModifier('-1')).toBe(true);
}); 

test('Validate Modifier: 0', () => {
    expect(DiceService.validateModifier('0')).toBe(true);
});

test('Validate Modifier: +0', () => {
    expect(DiceService.validateModifier('+0')).toBe(true);
});

test('Validate Modifier: -0', () => {
    expect(DiceService.validateModifier('-0')).toBe(true);
});

test('Validate Modifier: +', () => {
    expect(DiceService.validateModifier('+')).toBe(false);
});

test('Validate Modifier: -', () => {
    expect(DiceService.validateModifier('-')).toBe(false);
});

test('Validate Modifier: 1', () => {
    expect(DiceService.validateModifier('1')).toBe(false);
});

test('Validate Modifier: -1.5', () => {
    expect(DiceService.validateModifier('-1.5')).toBe(false);
});

test('Validate Modifier: 1.5', () => {
    expect(DiceService.validateModifier('1.5')).toBe(false);
});

test('Validate Modifier: 1x', () => {
    expect(DiceService.validateModifier('1x')).toBe(false);
});

//Parse Operations Tests

test('Parse Operations: 1d20', () => {
    expect(DiceService.parseOperations('1d20')).toEqual({"operands":[], "inputs":[{"diceCount": "1", "diceValue": "20", "modifier": null}]});
});

test('Parse Operations: 1d20+1', () => {
    expect(DiceService.parseOperations('1d20+1')).toEqual({"operands":["plus"], "inputs":[{"diceCount": "1", "diceValue": "20", "modifier": null}, {"diceCount": null, "diceValue": null, "modifier": 1}]});
});

test('Parse Operations: 1d20-1', () => {
    expect(DiceService.parseOperations('1d20-1')).toEqual({"operands":["minus"], "inputs":[{"diceCount": "1", "diceValue": "20", "modifier": null}, {"diceCount": null, "diceValue": null, "modifier": 1}]});
});

test('Parse Operations: 1d20+1d4', () => {
    expect(DiceService.parseOperations('1d20+1d4')).toEqual({"operands":["plus"], "inputs":[{"diceCount": "1", "diceValue": "20", "modifier": null}, {"diceCount": "1", "diceValue": "4", "modifier": null}]});
});

test('Parse Operations: 1d20-1d4', () => {
    expect(DiceService.parseOperations('1d20-1d4')).toEqual({"operands":["minus"], "inputs":[{"diceCount": "1", "diceValue": "20", "modifier": null}, {"diceCount": "1", "diceValue": "4", "modifier": null}]});
});

test('Parse Operations: 1d20+1d4+1', () => {
    expect(DiceService.parseOperations('1d20+1d4+1')).toEqual({"operands":["plus","plus"], "inputs":[{"diceCount": "1", "diceValue": "20", "modifier": null}, {"diceCount": "1", "diceValue": "4", "modifier": null}, {"diceCount": null, "diceValue": null, "modifier": 1}]});
});

test('Parse Operations: Number', () => {
    expect(DiceService.parseOperations(1)).toThrow(TypeError);
});