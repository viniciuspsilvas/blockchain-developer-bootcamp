import { FC } from "react";
import {
  loadAccount,
  selectProvider
} from "../lib/features/providers/providerSlice";
import { useAppDispatch, useAppSelector } from "../lib/hooks";

import { ethers } from "ethers";
import { config } from "../app/page";
import Blockies from "react-blockies";
import Image from "next/image";
import logo from "../assets/logo.png";
import eth from "../assets/eth.svg";

// export interface NavbarProps {}

export const Navbar: FC = () => {
  const dispatch = useAppDispatch();

  const { chainId, account, balance } = useAppSelector(selectProvider);

  const connectHandler = async () => {
    const ethereum = window.ethereum;
    const accounts = await ethereum.request({
      method: "eth_requestAccounts"
    });

    // Connect Ethers to blockchain
    const account = ethers.utils.getAddress(accounts[0]);
    dispatch(loadAccount(account));
  };

  const networkHandler = async (e: { target: { value: unknown; }; }) => {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: e.target.value }]
    });
  };
  return (
    <div className="bg-primary h-[10vh] relative grid grid-cols-12">
      <div className="px-8 col-span-5 flex items-center ">
        <Image
          src={logo}
          alt="DApp Logo"
          width={35}
          height={35}
          className="mr-2"
        />
        <h1>DApp Token Exchange</h1>
      </div>

      <div className="flex">
        <Image src={eth} alt="ETH Logo" />

        {chainId &&
          <select
            name="networks"
            id="networks"
            className=""
            value={config[chainId] ? `0x${chainId.toString(16)}` : `0`}
            onChange={networkHandler}
          >
            <option value="0" disabled>
              Select Network
            </option>
            <option value="0x7A69">Localhost</option>
            <option value="0x2a">Kovan</option>
            <option value="0xaa36a7">Sepolia</option>
          </select>}
      </div>

      <div className="flex pl-4 items-center col-start-9 col-end-13 rounded-lg bg-secondary absolute top-1/2 right-6 translate-y-[-50%] w-[400px] h-12">
        {balance
          ? <p className="m-6">
              <small className="small mr-3 text-neutral">My Balance</small>
              {Number(balance).toFixed(4)}
            </p>
          : <p>
              <small className="small m-1">My Balance</small>0 ETH
            </p>}

        <div className="h-full flex-1 bg- rounded-lg ">
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
                <div className="flex h-full justify-center items-center gap-4 ">
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
                className="button w-full px-4 py-3 text-blue border border-blue rounded-[10px] font-bold transition duration-250 ease-in-out hover:text-white hover:border-white"
                onClick={connectHandler}
              >
                Connect
              </button>}
        </div>
      </div>
    </div>
  );
};
