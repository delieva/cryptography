# Lab 6 report

### Encryption algorithm - AES

For storing key we are using (we would like to use, but because of absence of needed tech we have just mocked it) **Amazon 
kws** - for storing encrypted DEK and **A physical Hardware Security Module (HSM)** for storing key to decrypt our
decrypted DEK.

Every specified field will be encrypted before insertion in database and will be decrypted while select.
You can check it in [user.model.js](./backend/db/models/user.js)

Considering we are using lib for encryption it adds nonce automatically, so we can be sure that we are storing 
everything right

Also we are using store version to have ability to easily change our encrypt approach

### Libs

For encryptions we used [CryptoJs](https://www.npmjs.com/package/crypto-js)

For random we used [crypto-random-string](https://www.npmjs.com/package/crypto-random-string)

### Possible attacks
1. As long as we are using two places for storing data keys it will be a bit hard to stole it, however, if somebody stoles 
our HSM and listens to out internet traffic somehow he will have opportunity decrypt our data

2. Bruteforce : )