// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://v2.hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ZKVotingDeploy", (m) => {

  const verifier = m.contract("Groth16Verifier");

  const voting = m.contract("Vote", [verifier]);

  return { verifier, voting };
});

