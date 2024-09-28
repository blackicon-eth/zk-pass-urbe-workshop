"use client";
import { verify } from "@/lib/utils";

export default function Home() {
  // A function that starts the zkpass verification process
  const handleVerify = async () => {
    await verify();
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-8 pb-20 gap-3 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-2xl">Welcome to the TransGate Verification Tester</h1>
      <p className="text-sm text-center">
        This is a simple app that tests the TransGate verification process.
        <br />
        Click the button below to verify your data with your schema.
      </p>
      <button className="bg-yellow-300 px-5 py-2 mt-10 text-black rounded-md" onClick={handleVerify}>
        Verify
      </button>
    </div>
  );
}
