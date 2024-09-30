"use client";

import { useState } from "react";
import { verify } from "@/lib/utils";

export default function Home() {
  const [appId, setAppId] = useState(process.env.NEXT_PUBLIC_APP_ID || "");
  const [schemaId, setSchemaId] = useState(
    process.env.NEXT_PUBLIC_SCHEMA_ID || ""
  );

  // A function that starts the zkpass verification process
  const handleVerify = async () => {
    await verify(appId, schemaId);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-8 pb-20 gap-3 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-2xl">Welcome to the TransGate Verification Tester</h1>
      <p className="text-sm text-center">
        This is a simple app that tests the TransGate verification process.
        <br />
        Click the button below to verify your data with your schema.
      </p>
      <div className="flex flex-col gap-2">
        <label>App ID *</label>
        <input
          type="text"
          placeholder="App ID"
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          className="p-2 border border-gray-300 rounded-md text-black"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label>Schema ID *</label>
        <input
          type="text"
          placeholder="Schema ID"
          value={schemaId}
          onChange={(e) => setSchemaId(e.target.value)}
          className="p-2 border border-gray-300 rounded-md text-black"
        />
      </div>
      <button
        className="bg-yellow-300 px-5 py-2 text-black rounded-md"
        onClick={handleVerify}
      >
        Verify
      </button>
    </div>
  );
}
