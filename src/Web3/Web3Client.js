import { ABI } from "./ContractABI";
import Web3 from "web3";

let selectedAccount;
let isInitialized = false;
let airContract;

export const init = async () => {
  let provider = window.ethereum;

  if (typeof provider !== "undefined") {
    // Metamask is Installed

    await provider
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        selectedAccount = accounts[0];
        console.log(`Selected Account is ${selectedAccount}`);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  window.ethereum.on("accountChange", function (accounts) {
    selectedAccount = accounts[0];
    console.log(`Selected Account changed to ${selectedAccount}`);
  });

  const web3 = new Web3(provider);

  airContract = new web3.eth.Contract(
    ABI,
    "0x4B6E9C8bA148649b2C1D532cf6A3f6a959de30B3"
  );

  if (!((await web3.eth.net.getNetworkType()) === "ropsten")) {
    alert(
      "You are not on Ropsten Network. Please switch metamask to Ropsten network then press ok to continue!"
    );
    window.location.reload(false);
  }

  isInitialized = true;
};

export const addAddressForAirDrop = async (address, amount) => {
  if (!isInitialized) {
    await init();
  }
  try {
    const data = await airContract.methods
      .addAddressForAirDrop(address, Web3.utils.toWei(`${amount}`, "ether"))
      .send({ from: selectedAccount });
    return data;
  } catch (err) {
    console.error(err);
  }
};

export const getAdmin = async () => {
  if (!isInitialized) {
    await init();
  }
  try {
    const data = await airContract.methods._admin().call();
    return data;
  } catch (err) {
    console.error(err);
  }
};

export const addWLAddress = async (address, amount) => {
  try {
    if (!isInitialized) {
      await init();
    }
    const data = await airContract.methods
      .addAddressForAirDrop(address, amount)
      .send({ from: selectedAccount });
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const removeAddress = async (address) => {
  if (!isInitialized) {
    await init();
  }
  try {
    const data = await airContract.methods
      .removeAddressForAirDrop(address)
      .send({ from: selectedAccount });
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const claim = async (address) => {
  if (!isInitialized) {
    await init();
  }
  try {
    const data = await airContract.methods
      .claimToken(address)
      .send({ from: selectedAccount });
    return data;
  } catch (err) {
    console.error(err);
  }
};

export const getWLAddList = async () => {
  if (!isInitialized) {
    await init();
  }
  try {
    const data = await airContract.methods.getWhitelistedAddress().call();
    return data;
  } catch (err) {
    console.error(err);
  }
};

export const getWLAmount = async (index) => {
  if (!isInitialized) {
    await init();
  }
  try {
    const data = await airContract.methods._airdropAmountList(index).call();
    return data;
  } catch (err) {
    console.error(err);
  }
};
