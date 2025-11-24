pragma circom 2.2.3;

include "../node_modules/circomlib/circuits/poseidon.circom"; 
include "../node_modules/circomlib/circuits/comparators.circom"; 
include "../node_modules/circomlib/circuits/bitify.circom"; 
include "./merkleTree.circom";

template voting (depth) {
    signal input ToWhomVote;
    signal input Salt;
    signal input IdentityKey;
    signal input Root;
    signal input lemma[depth + 2];
    signal input path[depth];

    signal output Vote;
    signal output Nullifier;

    component VoteIsMinRange = GreaterEqThan(3);
    VoteIsMinRange.in[0] <== ToWhomVote;
    VoteIsMinRange.in[1] <==  0;

    component VoteInMaxRange = LessEqThan(3);
    VoteInMaxRange.in[0] <== ToWhomVote;
    VoteInMaxRange.in[1] <== 7;

    signal VoteIsValid <== VoteInMaxRange.out * VoteIsMinRange.out;
    VoteIsValid===1;
   
    component idCommit = Poseidon(1);
    idCommit.inputs[0] <== IdentityKey;
    idCommit.out === lemma[0];
    component mp = MerkleProof(depth);
    mp.path <== path;
    mp.lemma <== lemma;
    Root === lemma[depth + 1];

    component VoteHash = Poseidon(2);
    VoteHash.inputs[0] <== ToWhomVote;
    VoteHash.inputs[1] <== Salt;
    Vote <== VoteHash.out;

    Nullifier <== idCommit.out;
    
}

component main = voting(10);