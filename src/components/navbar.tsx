import { FC } from "react";
import {
  loadAccount,
  selectAccount,
  selectNetwork,
  selectBalance
} from "../lib/features/providers/providerSlice";
import { useAppDispatch, useAppSelector } from "../lib/hooks";

import { ethers } from "ethers";
import { config } from "../app/page";
import Blockies from "react-blockies";
import Image from "next/image";
import logo from "../assets/logo.png";
import eth from "../assets/eth.svg";

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
    <div className="h-[10vh] relative grid grid-cols-12">
      <div className="bg-secondary px-8 col-span-3 flex items-center">
        <Image
          src={logo}
          alt="DApp Logo"
          width={35}
          height={35}
          className="mr-2"
          style={{ width: 'auto', height: 'auto' }}
        />
        <h1>DApp Token Exchange</h1>
      </div>

      <div className="flex items-center p-4">
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
          className=" bg-transparent text-white px-2 py-1 rounded-md"
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

      <div className="flex pl-3 items-center justify-between rounded-lg bg-secondary absolute top-1/2 right-6 translate-y-[-50%] w-[400px] ">
        {balance
          ? <p className="flex h-full justify-center items-center gap-4">
              <small className="small  text-neutral">My Balance</small>
              {Number(balance).toFixed(4)} ETH
            </p>
          : <p>
              <small className="small  text-neutral">My Balance</small> 0 ETH
            </p>}

        <div className="bg-slate-800 h-full py-3 p-3 rounded-lg">
          {account
            ? <a
                href={
                  config[chainId]
                    ? `${config[chainId].explorerURL}/address/${account}`
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
