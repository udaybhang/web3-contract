const solc = require("solc");
const path = require('path');
const fs = require("fs");
const Web3 = require("web3");
web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
// fileContent = fs.readFileSync("demo.sol").toString();
let fileContent = fs.readFileSync(path.join(__dirname, '../', '/contract/' + 'demo' + '.sol')).toString();
console.log('File content: ',fileContent);
var input = {
  language: "Solidity",
  sources: {
    "demo.sol": {
      content: fileContent,
    },
  },

  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};
console.log("input::", input);
var output = JSON.parse(solc.compile(JSON.stringify(input)));
console.log("Output: ", output);
ABI = output.contracts[fs.readFileSync(path.join(__dirname, '../', '/contract/' + 'demo' + '.sol'), 'utf-8')]["demo"].abi;
bytecode = output.contracts[fs.readFileSync(path.join(__dirname, '../', '/contract/' + 'demo' + '.sol'), 'utf-8')]["demo"].evm.bytecode.object;
console.log("Bytecode: ", bytecode);
console.log("ABI: ", ABI);
