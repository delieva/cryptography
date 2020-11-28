const xorChar = (char, key) => {
    if (typeof key === "string") {
        key = key.charCodeAt(0);
    }
    return String.fromCharCode(char.charCodeAt(0) ^ key);
}

module.exports = {
    xorChar: xorChar
}