const { secp256k1 } = require("ethereum-cryptography/secp256k1.js");
const { hexToBytes, toHex, utf8ToBytes } = require("ethereum-cryptography/utils.js");
const { keccak256 } = require("ethereum-cryptography/keccak");

const privateKey = secp256k1.utils.randomPrivateKey();
const publicKey = secp256k1.getPublicKey(privateKey);
const addr = keccak256(publicKey.slice(1)).slice(-20);

console.log("====== Private Key ====== : " + toHex(privateKey));
console.log("====== Public Key ====== : " + toHex(publicKey));
console.log("====== Address ====== : " + toHex(addr));


