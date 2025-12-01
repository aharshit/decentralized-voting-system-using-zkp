import { groth16 } from "snarkjs";

export async function generateProof(inputs) {
  const wasmPath = "/voteCircuit.wasm";
  const zkeyPath = "/vote.zkey";

  const { proof, publicSignals } = await groth16.fullProve(
    inputs,
    wasmPath,
    zkeyPath
  );
  

  return { proof, publicSignals };
}
