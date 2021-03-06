const joi = require("joi");
const User = require("../modals/user");
const md5 = require("md5");
const Accounts = require("web3-eth-accounts");
const solc = require("solc");
const path = require("path");
const fs = require("fs");
const Web3 = require("web3");
const Contract = require('web3-eth-contract');
exports.signup = async (req, res) => {
  const schema = joi.object().keys({
    username: joi
      .string()
      .required()
      .error((e) => "firstname is required"),
    email: joi
      .string()
      .required()
      .error((e) => "email is required"),
    password: joi
      .string()
      .required()
      .error((e) => "password is required"),
  });
  const result = joi.validate(req.body, schema, { abortEarly: true });
  if (result.error) {
    res.status(400).json({ message: result.error.details[0].message });
  }
  isemailfound = await User.findOne({ email: req.body.email }).exec();
  if (isemailfound) {
    return res.status(400).json({ message: "Email already taken" });
  }
  // ismobilefound = await User.findOne({ mobileno: req.body.mobileno }).exec()
  // if (ismobilefound) {
  //     return res.status(400).json({ message: 'Mobile already taken' })
  // }
  const accesstoken = generate_token(32);
  var userdetails = new User({
    username: req.body.username,
    email: req.body.email,
    accesstoken: accesstoken,
    password: md5(req.body.password),
  });
  var userdetails = await userdetails.save();
  res
    .status(200)
    .json({
      message: "User registered successfully",
      userdetails: userdetails,
    });
};

exports.login = async (req, res) => {
  try {
    const schema = joi.object().keys({
      username: joi
        .string()
        .required()
        .error((e) => "username is required"),
      password: joi
        .string()
        .required()
        .error((e) => "Password is required"),
    });

    const result = joi.validate(req.body, schema, { abortEarly: true });
    if (result.error) {
      res.status(400).json({ message: result.error.details[0].message });
      return;
    }
    var userdetails = await User.findOne({
      username: req.body.username,
      password: md5(req.body.password),
    }).exec();
    if (!userdetails) throw new Error("Please enter valid credentials");
    accesstoken = generate_token(32);
    userdetails = await User.findOneAndUpdate(
      { _id: userdetails._id },
      { accesstoken: accesstoken },
      { new: true }
    ).exec();
    if (!userdetails) new Error("token failed to store");
    res
      .status(200)
      .json({
        message: "user logged in successfully",
        userdetails: userdetails,
      });
  } catch (err) {
    res.status(300).json({
      message: err.message,
    });
  }
};

exports.createAccount = async (req, res) => {
  try {
    var accounts = new Accounts(C.WebSocketProvider);
    let accInfo = accounts.create();
    if (accInfo) {
      res.status(200).json({
        message: "Account has been created!",
        info: accInfo,
      });
    }
  } catch (err) {
    console.log(err.message);
    res.status(403).json({
      message: "Account creation failed!",
      errMessage: err.message,
      error: err,
    });
  }
};

exports.connectContract = async(req, res) => {
  try {
    Contract.setProvider(C.WebSocketProvider);
    let fileContent = fs
      .readFileSync(path.join(__dirname, "../", "/contract/" + "demo" + ".sol"))
      .toString();
    console.log("File content: ", fileContent);
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
    let ABI = output.contracts["demo.sol"]["demo"].abi;
    let contract = new Contract(ABI, '0xAee1E0b7dEcaf0E053c64361048b7236030db6d0');
    let result = JSON.stringify(contract, getCircularReplacer());
    let cnt = JSON.parse(result);
    res.status(200).json({
      message:'Contract Instance!',
      data: cnt
    })
  } catch (err) {
    res.status(403).json({
      message: "Contract failed!",
      error: err.message
    });
  }
}
exports.getTransaction = async(req, res) =>{
  try {
    let {txHash} = req.body;
    if(!txHash) throw new Error('Please provide transaction hash!');
    let web3 = new Web3(
      new Web3.providers.HttpProvider(C.HttpProvider)
    );
    let transactionLog = await web3.eth.getTransaction(txHash);
    res.status(200).json({
      message:'Transaction verified!',
      data: transactionLog
    })
  } catch (err) {
    res.status(403).json({
      message: "Transaction verification failed!",
      error: err.message
    });
  }
}

exports.signTransaction = async (req, res) => {
  try {
    let {from, to, value} = req.body;
    if(!from) throw new Error('Please provide address from!');
    else if(!to) throw new Error('Please provide address to!');
    else {
      value = value ? value : "2";
    let web3 = new Web3(
      new Web3.providers.HttpProvider(C.HttpProvider)
    );
    let createAccount = await web3.eth.accounts.create();
    //    Creates an account object from a private key.
    let accountData = await web3.eth.accounts.privateKeyToAccount(
      createAccount.privateKey
    );
    // tansfer value
    let ethValue = await web3.utils.toWei(value, "ether");
    // Signs an Ethereum transaction with a given private key.
    let createTransaction = await web3.eth.accounts.signTransaction(
      {
        to,
        value:ethValue,
        gas: 2000000,
      },
      accountData.privateKey
    );
    console.log(createTransaction);
    let createReceipt = await web3.eth.sendTransaction({
      from,
      to,
      value:ethValue
    });
    res.status(200).json({
      message: "Transaction Success!",
      data: createReceipt,
    });
    }
  } catch (err) {
    console.log(err);
    res.status(403).json({
      message: "Transaction fail!",
      errMessage: err.message,
    });
  }
};
exports.deployContract = async (req, res) => {
  try {
    let defaultAccount;
    let web3 = new Web3(
      new Web3.providers.HttpProvider(C.HttpProvider)
    );
    let fileContent = fs
      .readFileSync(path.join(__dirname, "../", "/contract/" + "demo" + ".sol"))
      .toString();
    console.log("File content: ", fileContent);
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
    var output = JSON.parse(solc.compile(JSON.stringify(input)));
    ABI = output.contracts["demo.sol"]["demo"].abi;
    bytecode = output.contracts["demo.sol"]["demo"].evm.bytecode.object;
    contract = new web3.eth.Contract(ABI);
    accounts = await web3.eth.getAccounts();
    defaultAccount = accounts[0];
    demoContract = await contract
      .deploy({ data: bytecode })
      .send({ from: defaultAccount, gas: 470000 })
      .on("receipt", (receipt) => {
        //event,transactions,contract address will be returned by blockchain
        console.log("Contract Address:", receipt.contractAddress);
        //   return receipt.contractAddress
      });
    let response = await demoContract.methods.x().call();
    console.log("Initial Value:", response);

    res.status(200).json({
      message: "Contract Deployed!",
      data: response,
    });
  } catch (er) {
    res.status(403).json({
      message: "Contract Deployment fail!",
      errMessage: er.message,
      error: er,
    });
  }
};
exports.generateAbiByteCode = async (req, res) => {
  try {
    web3 = new Web3(new Web3.providers.HttpProvider(C.HttpProvider));
    let fileContent = fs
      .readFileSync(path.join(__dirname, "../", "/contract/" + "demo" + ".sol"))
      .toString();
    console.log("File content: ", fileContent);
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
    ABI = output.contracts["demo.sol"]["demo"];
    bytecode = output.contracts["demo.sol"]["demo"].evm.bytecode.object;
    console.log("Bytecode: ", bytecode);
    console.log("ABI: ", ABI);
    res.status(200).json({
      message: "ABI and bytecode generated sucessfully",
      abi: ABI,
      bytecode: bytecode,
    });
  } catch (err) {
    res.status(403).json({
      message: "Code generation fail!",
      errMessage: err.message,
      error: err,
    });
  }
};

exports.createWallet = async (req, res) => {
  try {
    var accounts = new Accounts(C.WebSocketProvider);
    let walletInfo = accounts.wallet.create(2, "some random string");
    let result = JSON.stringify(walletInfo, getCircularReplacer());
    let walletCreated = JSON.parse(result);
    if (walletInfo && walletCreated) {
      res.status(200).json({
        message: "Wallet has been created!",
        info: walletCreated,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(403).json({
      message: "Wallet creation failed!",
      errMessage: err.message,
      error: err,
    });
  }
};
getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};
generate_token = (length) => {
  var a =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
  var b = [];
  for (var i = 0; i < length; i++) {
    var j = (Math.random() * (a.length - 1)).toFixed(0);
    b[i] = a[j];
  }
  return b.join("");
};
