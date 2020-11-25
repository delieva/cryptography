const xorChar = (char, key) => {
    return String.fromCharCode(char.charCodeAt(0) ^ key);
}

module.exports = {
    xorChar: xorChar
}