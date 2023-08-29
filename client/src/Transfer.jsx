import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex, utf8ToBytes, hexToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

const PrivateKeys = ["d41016d459a725792dfea934c2e8970a00e602cad84d6da5908a16d7ec5959c7", "0fbe2049b8837b29c0f31a5837dc40e4b731dd66b14896722791ea817fa58490", "7e6c59ba96e09ab0b466f9e455b2bbe3a0962e100044ddad76e04fed44cd49c9"];

const nonce = {
  "d41016d459a725792dfea934c2e8970a00e602cad84d6da5908a16d7ec5959c7": 0,
  "0fbe2049b8837b29c0f31a5837dc40e4b731dd66b14896722791ea817fa58490": 0,
  "7e6c59ba96e09ab0b466f9e455b2bbe3a0962e100044ddad76e04fed44cd49c9": 0
};
//PrivateKeys.forEach(key => { nonce[key] = 0; });

async function sign(address, sendAmount, recipient) {
  for (let i = 0; i < PrivateKeys.length; i++) {
    let publicKey = secp256k1.getPublicKey(hexToBytes(PrivateKeys[i]));
    let addr = toHex(keccak256(publicKey.slice(1)).slice(-20));
    if (addr === address) {
      const Message = address + "_" + sendAmount + "_" + recipient + "_" + nonce[PrivateKeys[i]];
      const SaltHash = toHex(hashMessage(Message));
      console.log("SaltHash: ", SaltHash);
      let signature = await secp256k1.sign(SaltHash, hexToBytes(PrivateKeys[i]));
      console.log("Signature: ", signature);
      const jsonSignature = JSON.stringify(signature, (key, value) =>
        typeof value === 'bigint'
          ? value.toString() : value);
      console.log("Nonce: " + nonce[PrivateKeys[i]]);
      console.log("JSON Signature: ", jsonSignature);
      nonce[PrivateKeys[i]]++;
      return [jsonSignature, publicKey, SaltHash];
    }
  }
}

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const [signature, publicKey, SaltHash] = await sign(address, sendAmount, recipient);
    console.log("Signature: ", signature);
    console.log("Public Key: ", publicKey);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        signature: signature,
        sender: address,
        Hash: SaltHash,
        amount: parseInt(sendAmount),
        recipient,
        publicKey: toHex(publicKey)
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
