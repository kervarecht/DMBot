const enigmaService = require('../services/EnigmaService');

//Atbash
test('Atbash Encrypt: abc', () => {
    expect(enigmaService.atbashEncrypt('abc')).toBe('zyx');
});

test('Atbash Encrypt: count to 1 with punctuation and capitals', () => {
    expect(enigmaService.atbashEncrypt('COUNT to 1!')).toBe('XLFMG gl 1!');
});

test('Atbash Decrypt: zyx', () => {
    expect(enigmaService.atbashDecrypt('zyx')).toBe('abc');
});

test('Atbash Decrypt: XLMHG gl 1!', () => {
    expect(enigmaService.atbashDecrypt('XLFMG gl 1!')).toBe('COUNT to 1!'); 
});