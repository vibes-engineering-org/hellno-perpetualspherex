import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect } from "react";
import { useAccount, useConnect, useSignMessage } from "wagmi";

function App() {
  useEffect(() => {
    // important, never remove this sdk init
    sdk.actions.ready();
  }, []);

  return (
    <div className="p-5 max-w-2xl mx-auto min-h-screen flex flex-col items-center justify-center gap-8">
      <h1 className="text-4xl md:text-5xl text-center font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        Vibes Engineering Template
      </h1>
      <p className="text-lg text-center opacity-80 text-gray-300">Ready to launch 🚀</p>
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <ConnectMenu />
      </div>
    </div>
  );
}

function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  if (isConnected) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-sm text-gray-400">Connected account:</div>
        <div className="text-xs font-mono bg-gray-900 p-2 rounded break-all">{address}</div>
        <SignButton />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => connect({ connector: connectors[0] })}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
    >
      Connect
    </button>
  );
}

function SignButton() {
  const { signMessage, isPending, data, error } = useSignMessage();

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => signMessage({ message: "hello world" })}
        disabled={isPending}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Signing..." : "Sign message"}
      </button>
      {data && (
        <div className="mt-2">
          <div className="text-sm text-green-400 mb-1">Signature</div>
          <div className="text-xs font-mono bg-gray-900 p-2 rounded break-all">{data}</div>
        </div>
      )}
      {error && (
        <div className="mt-2">
          <div className="text-sm text-red-400 mb-1">Error</div>
          <div className="text-xs bg-red-900/20 border border-red-500 p-2 rounded">{error.message}</div>
        </div>
      )}
    </div>
  );
}

export default App;
