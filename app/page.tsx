"use client";
import { verify } from "@/lib/utils";
import { useState } from "react";

export default function Home() {
  const [appId, setAppId] = useState(process.env.NEXT_PUBLIC_APP_ID || "");
  const [schemaId, setSchemaId] = useState(process.env.NEXT_PUBLIC_SCHEMA_ID || "");

  // A function that starts the zkpass verification process
  const handleVerify = async () => {
    await verify(appId, schemaId);
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

      {/* Verify button */}
      <button
        className={`${!appId || !schemaId ? "bg-gray-400" : "bg-yellow-300"} px-5 py-2 mt-8 text-black rounded-md`}
        onClick={handleVerify}
        disabled={!appId || !schemaId}
      >
        Verify
      </button>
    </div>
  );
}
