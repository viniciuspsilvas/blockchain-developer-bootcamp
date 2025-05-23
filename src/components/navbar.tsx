import { FC } from "react";
import {
  loadAccount,
  selectAccount,
  selectNetwork,
  selectBalance
} from "../lib/features/providers/providerSlice";
import { useAppDispatch, useAppSelector } from "../lib/hooks";

import { ethers } from "ethers";
import configDataJson from "../config.json";
import Blockies from "react-blockies";
import Image from "next/image";
import logo from "../assets/logo.png";
import eth from "../assets/eth.svg";
import { ConfigType } from "../app/page";

const configData: ConfigType = configDataJson;

export const Navbar: FC = () => {
  const dispatch = useAppDispatch();

  const account = useAppSelector(selectAccount);
  const chainId = useAppSelector(selectNetwork) || "0"; // Ensure it's always a string
  const balance = useAppSelector(selectBalance);

  const connectHandler = async () => {
    if (!window.ethereum) {
      console.error("MetaMask not detected");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    const account = ethers.utils.getAddress(accounts[0]);
    dispatch(loadAccount(account));
  };

  const networkHandler = async (e: { target: { value: string } }) => {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: e.target.value }]
    });
  };

  return (
    <div className="h-auto md:h-[10vh] relative grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-0 p-4 md:p-0">
      <div className="bg-secondary px-4 md:px-8 col-span-1 md:col-span-3 flex items-center justify-center md:justify-start">
        <Image
          src={logo}
          alt="DApp Logo"
          width={35}
          height={35}
          className="mr-2"
          style={{ width: 'auto', height: 'auto' }}
        />
        <h1 className="text-center md:text-left">DApp Token Exchange</h1>
      </div>

      <div className="flex items-center justify-center md:justify-start p-2 md:p-4">
        <Image
          src={eth}
          alt="ETH Logo"
          width={20}
          height={20}
          className=""
          style={{ width: 'auto', height: 'auto' }}
        />

        <select
          name="networks"
          id="networks"
          className="bg-transparent text-white px-2 py-1 rounded-md w-full md:w-auto"
          value={`0x${parseInt(chainId).toString(16)}`}
          onChange={networkHandler}
        >
          <option value="0" disabled>
            Select Network
          </option>
          <option value="0x7A69">Localhost</option>
          <option value="0xaa36a7">Sepolia</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center md:justify-between rounded-lg bg-secondary md:absolute md:top-1/2 md:right-6 md:translate-y-[-50%] w-full md:w-[400px] p-4 md:p-0 md:pl-4">
        {balance
          ? <p className="flex h-full justify-center items-center gap-4 mb-4 md:mb-0">
              <small className="small text-neutral">My Balance</small>
              {Number(balance).toFixed(4)} ETH
            </p>
          : <p className="mb-4 md:mb-0">
              <small className="small text-neutral">My Balance</small> 0 ETH
            </p>}

        <div className="bg-slate-800 w-full md:w-auto h-full py-3 p-3 rounded-lg">
          {account
            ? <a
                href={
                  configData[chainId]
                    ? `${configData[chainId].explorerURL}/address/${account}`
                    : `#`
                }
                target="_blank"
                rel="noreferrer"
              >
                <div className="flex h-full justify-center items-center gap-4">
                  {account.slice(0, 5) + "..." + account.slice(38, 42)}
                  <Blockies
                    seed={account}
                    size={10}
                    scale={3}
                    color="#2187D0"
                    bgColor="#F1F2F9"
                    spotColor="#767F92"
                    className="identicon"
                  />
                </div>
              </a>
            : <button
                className="w-full px-10 py-3 rounded-[10px] bg-slate-800 font-bold transition duration-250 ease-in-out hover:text-white hover:border-white"
                onClick={connectHandler}
              >
                Connect
              </button>}
        </div>
      </div>
    </div>
  );
};
