"use client";
import { verify } from "@/lib/utils";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWriteContract } from "wagmi";
import { ethers } from "ethers";
import { AttestationABI } from "@/lib/abi/AttestationABI";
import { contractAddress } from "@/lib/constants";

export default function Home() {
  const [appId, setAppId] = useState(process.env.NEXT_PUBLIC_APP_ID || "");
  const [schemaId, setSchemaId] = useState(process.env.NEXT_PUBLIC_SCHEMA_ID || "");
  const [mintToken, setMintToken] = useState(false);
  const account = useAccount();
  const { writeContract } = useWriteContract();

  // A function that starts the zkpass verification process and mints a token
  // if the verification goes well and the mintToken checkbox is checked
  const handleVerify = async () => {
    // Verify
    const { response, message } = await verify(appId, schemaId, account.address);

    // If the response is null, show an alert with the message
    if (!response) {
      alert(message);
      return;
    }

    // Log the response and, if the mintToken checkbox is checked, mint a token
    console.log("Transgate response: ", response);
    if (mintToken && response.recipient) {
      try {
        const hexTaskId = ethers.hexlify(ethers.toUtf8Bytes(response.taskId)) as `0x${string}`; // to hex
        const hexSchemaId = ethers.hexlify(ethers.toUtf8Bytes(schemaId)) as `0x${string}`; // to hex

        const args = {
          taskId: hexTaskId,
          schemaId: hexSchemaId,
          uHash: response.uHash,
          recipient: response.recipient,
          publicFieldsHash: response.publicFieldsHash,
          validator: response.validatorAddress,
          allocatorSignature: response.allocatorSignature,
          validatorSignature: response.validatorSignature,
        };

        writeContract({
          address: contractAddress,
          abi: AttestationABI,
          functionName: "attest",
          args: [args],
        });
      } catch (err) {
        alert(JSON.stringify(err));
        console.log("error", err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-8 pb-20 sm:p-14 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <div className="flex flex-col gap-1 justify-center items-center mb-12">
        <h1 className="text-4xl font-bold">zkPass Schema SDK Tester</h1>
        <p className="text-sm text-center">
          A simple app that tests the schema verification process using TransGate and the SDK.
        </p>
      </div>

      {/* Input fields */}
      <div className="flex gap-14">
        <div className="flex gap-3 items-center">
          <label className="text-md">App ID</label>
          <input
            type="text"
            className="w-96 p-2 border border-gray-300 rounded-md text-black"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
          />
        </div>
        <div className="flex gap-3 items-center">
          <label className="text-md">Schema ID</label>
          <input
            type="text"
            className="w-96 p-2 border border-gray-300 rounded-md text-black"
            value={schemaId}
            onChange={(e) => setSchemaId(e.target.value)}
          />
        </div>
      </div>

      {/* Verify button, Connect button and minting checkbox */}
      <div className="flex gap-4 mt-8 items-center">
        <ConnectButton />
        <button
          className={`${
            !appId || !schemaId || !account.address ? "bg-gray-400" : "bg-yellow-300"
          } px-5 py-2 text-black rounded-md`}
          onClick={handleVerify}
          disabled={!appId || !schemaId || !account.address}
        >
          Verify
        </button>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <input type="checkbox" className="h-5 w-5" checked={mintToken} onChange={(e) => setMintToken(e.target.checked)} />
        <label>Write the attestation on chain if the verification goes well</label>
      </div>
    </div>
  );
}
