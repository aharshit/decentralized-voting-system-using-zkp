import { useState, useEffect } from "react";
import { ethers } from "ethers";
import votingAbi from "./contractABI.json";
import { VOTING_CONTRACT_ADDRESS } from "./config.js";
import { generateProof } from "./generateWitness.js";
import pokemonList from "./candidates.json";

function Home() {
  const [account, setAccount] = useState(null);
  const [voteCounts, setVoteCounts] = useState({});

  async function connectWallet() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    setAccount(addr);
  }

  async function loadResults() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        VOTING_CONTRACT_ADDRESS,
        votingAbi,
        provider
      );

      const counts = {};
      for (let p of pokemonList) {
        counts[p.id] = Number(await contract.voteCount(p.id));
      }
      setVoteCounts(counts);
    } catch (err) {
      console.error(err);
    }
  }

  async function vote(pokemonId) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        VOTING_CONTRACT_ADDRESS,
        votingAbi,
        signer
      );

      alert("Generating ZK proof...");

      const salt = (BigInt(Date.now()) +BigInt(Math.floor(Math.random() * 1e6))).toString();
      const identityKey = BigInt(account).toString();
      const inputs = {
        ToWhomVote: pokemonId,
        Salt: salt,
        IdentityKey: identityKey
      };

      const { proof, publicSignals } = await generateProof(inputs);
      console.log(publicSignals);
      const a = [proof.pi_a[0], proof.pi_a[1]];
      const b = [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]]
      ];
      const c = [proof.pi_c[0], proof.pi_c[1]];
      const pub = [publicSignals[0].toString(),
      publicSignals[1].toString()];


      const tx = await contract.vote(pokemonId, a, b, c, pub);
      await tx.wait();

      alert("Vote submitted!");
      loadResults();
    } catch (err) {
      console.error(err);
      alert("Vote failed: " + err.message);
    }
  }

  useEffect(() => {
    if (account) loadResults();
  }, [account]);

  useEffect(() => {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", async (accounts) => {
      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const newAcc = accounts[0];
        setAccount(newAcc);
      } else {
        setAccount(null);
      }
    });
  }
}, []);


  return (
    <div className="p-6 text-center">
      <h1 className="text-4xl font-bold mb-6">Vote for Your Favourite Pokémon</h1>

      {!account ? (
        <button
          onClick={connectWallet}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-xl"
        >
          Connect Wallet
        </button>
      ) : (
        <p className="text-xl mb-4">Connected: {account}</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        {pokemonList.map((p) => (
          <div
            key={p.id}
            className="border p-4 rounded-xl shadow hover:shadow-xl cursor-pointer"
            onClick={() => vote(p.id)}
          >
            <img src={p.img} className="w-32 mx-auto" />
            <h3 className="mt-3 text-2xl">{p.name}</h3>
            <p className="text-lg">Votes: {voteCounts[p.id] ?? 0}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Home;
