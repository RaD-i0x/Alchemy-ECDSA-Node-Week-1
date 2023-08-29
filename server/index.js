const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes, hexToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

const balances = {
  //public key 1: 02dd061cf1c46ba1d0dcfec07662fef555951b728e26f9c4b4db9fad7d5039c35d
  "1483eddbc07cc621404b500e09e1f2c6454f0a57": 100,

  //public key 2: 03d3f471438e4651f6530adb6df45b6a35d98659cfa1fc75cb8fba242fcc113a68
  "87059cb771ad37223731939c99749a1d83421549": 50,

  //public key 3: 032dd95bb298e00d6d3ced0dea93deb1c1b7a15134d1cbc71fbe33b40532a26043
  "b4f711097837d51e181e43bcd4c0b00af5bfd619": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { signature, sender, Hash, recipient, amount, publicKey } = req.body;

  let sig = JSON.parse(signature);
  //console.log all the params recieved to check on server side if they are correctly recieved
  console.log("Signature: " + signature);
  console.log("Wallet address: " + sender);
  console.log("Hash: " + Hash);
  console.log("recipient: " + recipient);
  console.log("Amount: " + amount);
  console.log("Public Key: " + publicKey);
  sig.r = BigInt(sig.r);
  sig.s = BigInt(sig.s);

  const isVerified = secp256k1.verify(sig, Hash, publicKey);
  if (!isVerified) {
    res.status(400).send({ message: "signature verification failed" });
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }

  console.log("Sent amount: " + amount + " from sender: " + sender + " to recipient: " + recipient + " Successfully");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
