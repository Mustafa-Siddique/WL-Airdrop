import { useEffect, useState } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import {
  addWLAddress,
  claim,
  getAdmin,
  getWLAddList,
  getWLAmount,
  init,
  removeAddress,
} from "./Web3/Web3Client";
import Web3 from "web3";
import { logDOM } from "@testing-library/react";
const web3 = new Web3(window.ethereum);

function App() {
  const [address, setAddress] = useState(""),
    [contractAdmin, setContractAdmin] = useState(""),
    [addressList, setAddressList] = useState([]),
    [amountList, setAmountList] = useState(""),
    [isWL, setIsWL] = useState(false);
  // [userIndex, setUserIndex] = useState('');

  const [addWLRes, setAddWLRes] = useState();
  const [addWLURI, setAddWLURI] = useState();
  const [addWLData, setAddWLData] = useState({
    address: "",
    amount: "",
  });

  const [remWLRes, setRemWLRes] = useState();
  const [remWLURI, setRemWLURI] = useState();
  const [remWL, setRemWL] = useState({
    address: "",
  });

  const [claimRes, setClaimRes] = useState(null);
  const [claimURI, setClaimURI] = useState();

  useEffect(() => {
    init();
    connectMM();
    checkAdmin();
    checkWL();
  }, []);

  useEffect(() => {
    if (!(address || addressList.length)) return;

    for (const [i, addressRaw] of Object.entries(addressList)) {
      if (addressRaw.toLowerCase() !== address.toLowerCase()) continue;
      setIsWL(true);
      // setUserIndex(i);
      getUserAmount(i);
    }
  }, [address, addressList]);

  const connectMM = async () => {
    try {
      const web3 = window.ethereum;
      await web3.request({ method: "eth_requestAccounts" }).then((accounts) => {
        setAddress(accounts[0]);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const checkAdmin = async () => {
    const _admin = await getAdmin();
    setContractAdmin(_admin.toLowerCase());
  };

  const checkWL = async () => {
    const arrWL = await getWLAddList();
    setAddressList(arrWL);
  };

  const getUserAmount = async (userIndex) => {
    const arrTKX = await getWLAmount(userIndex);
    setAmountList(arrTKX / 10 ** 18);
  };

  // add user address to whitelisted address list
  function addWLChange(e) {
    const newData = { ...addWLData };
    newData[e.target.id] = e.target.value;
    setAddWLData(newData);
  }
  const whitelistAddress = async (e) => {
    e.preventDefault();
    const data = await addWLAddress(
      addWLData.address,
      web3.utils.toWei("" + addWLData.amount, "ether")
    );
    if (data.status) {
      setAddWLURI(data.transactionHash);
      setAddWLRes(0);
    } else {
      setAddWLRes(1);
    }
  };

  // remove user from whitelist
  function remWLChange(e) {
    const newData = { ...remWL };
    newData[e.target.id] = e.target.value;
    setRemWL(newData);
  }
  const removeAdd = async () => {
    const data = await removeAddress(remWL.address);
    if (data.status) {
      setRemWLURI(data.transactionHash);
      setRemWLRes(0);
    } else {
      setRemWLRes(1);
    }
  };

  // claim tokens
  const _claim = async () => {
      const data = await claim(address);
      if (data.status) {
        setClaimURI(data.transactionHash);
        setClaimRes(0);
      } else {
        setClaimRes(1);
      }
    },
    getClaim = () => {
      switch (claimRes) {
        case 0:
          return (
            <Alert variant="success">
              Claimed token successfully!, Txn Hash: {claimURI} or &nbsp;
              <Alert.Link
                href={`https://ropsten.etherscan.io/tx/${claimURI}`}
                target="_blank"
                rel="noreferrer"
              >
                Click here
              </Alert.Link>
            </Alert>
          );

        case 1:
          <Alert variant="danger">Failed to claim!</Alert>;

        default:
          break;
      }
    };

  return (
    <div className="App pt-5">
      <div className="container">
        <Button variant="success" className="ms-auto d-block">
          {address
            ? address.slice(0, 6) + "..." + address.slice(-4)
            : "CONNECT WALLET"}
        </Button>

        <Tabs
          defaultActiveKey="home"
          id="uncontrolled-tab-example"
          className="mb-3"
        >
          {/* ADMIN SECTION */}
          <Tab eventKey="home" title="ADMIN">
            {/* WHITELIST ADDRESS BY ADMIN */}
            <Form onSubmit={(e) => whitelistAddress(e)}>
              <h3 className="text-center mt-5">Add Whitelist</h3>
              <Form.Group className="mb-3" controlId="address">
                <Form.Label>Wallet address</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={addWLData.address}
                  onChange={(e) => addWLChange(e)}
                  placeholder="Enter Wallet Address"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="amount">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  required
                  value={addWLData.amount}
                  onChange={(e) => addWLChange(e)}
                  placeholder="Amount"
                />
              </Form.Group>
              {addWLRes === 0 ? (
                <Alert variant="success">
                  Success! Txn Hash:{addWLURI} or &nbsp;
                  <Alert.Link
                    href={`https://ropsten.etherscan.io/tx/${addWLURI}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Click here
                  </Alert.Link>
                </Alert>
              ) : addWLRes === 1 ? (
                <Alert variant="danger">Failed!</Alert>
              ) : (
                ""
              )}
              <Button
                variant="outline-success"
                className="fw-bold"
                type="submit"
                disabled={
                  address.toLowerCase() === contractAdmin ? false : true
                }
              >
                {address.toLowerCase() === contractAdmin
                  ? "Add Whitelist Address"
                  : "You are not the Admin"}
              </Button>
            </Form>

            {/* REMOVE WHITELISTED ADDRESS BY ADMIN */}
            <Form>
              <h3 className="text-center mt-5">Remove Whitelist</h3>
              <Form.Group className="mb-3" controlId="address">
                <Form.Label>Wallet address</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={remWL.address}
                  onChange={(e) => remWLChange(e)}
                  placeholder="Enter Wallet Address"
                />
              </Form.Group>
              {remWLRes === 0 ? (
                <Alert variant="danger">
                  Deleted wallet successfully, Txn Hash: {remWLURI} or &nbsp;
                  <Alert.Link
                    href={`https://ropsten.etherscan.io/tx/${remWLURI}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Click here
                  </Alert.Link>
                </Alert>
              ) : remWLRes === 1 ? (
                <Alert variant="danger">Failed to delete!</Alert>
              ) : (
                ""
              )}
              <Button
                variant="outline-danger"
                className="fw-bold"
                type="button"
                onClick={() => removeAdd()}
                disabled={
                  address.toLowerCase() === contractAdmin ? false : true
                }
              >
                {address.toLowerCase() === contractAdmin
                  ? "Remove Whitelist Address"
                  : "You are not the Admin"}
              </Button>
            </Form>
          </Tab>

          {/* USER SECTION */}
          <Tab eventKey="profile" title="USER">
            {/* CLAIM TOKENS BY USER */}
            <Form>
              <h3 className="text-center mt-5">CLAIM AIRDROP TOKENS</h3>
              <Form.Group className="mb-3" controlId="formBasicWallet">
                <Form.Label>Wallet address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Wallet Address"
                  value={address}
                  disabled
                />
                <Form.Text>
                  Connect the same wallet you are whitelisted with to claim TKX
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicAmount">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Amount"
                  value={amountList}
                  disabled
                />
              </Form.Group>
              {!isWL && <p className="text-danger">You are not Whitelisted</p>}
              {getClaim()}
              <Button
                variant="outline-success"
                className="fw-bold"
                type="button"
                onClick={_claim}
                disabled={isWL ? false : true}
              >
                Claim Tokens
              </Button>
            </Form>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
