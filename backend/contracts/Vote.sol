// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Groth16Verifier.sol";

contract  Vote{
    Groth16Verifier public verifier;

    mapping(uint256 => bool) public usedNullifier;
    mapping(uint256 => uint256) public voteCount;

    constructor(address _verifier) {
        verifier = Groth16Verifier(_verifier);
    }

    function vote(
        uint256 candidate,
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[2] calldata publicSignals
    ) external returns (bool) {
        bool ok = verifier.verifyProof(a, b, c, publicSignals);
        require(ok, "invalid proof");
        uint256 nullifier = publicSignals[1];

        require(!usedNullifier[nullifier], "double vote");
        usedNullifier[nullifier] = true;

        voteCount[candidate] += 1;

        return true;
    }
}
