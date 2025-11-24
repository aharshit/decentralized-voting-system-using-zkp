pragma circom 2.2.3;

include "../node_modules/circomlib/circuits/poseidon.circom"; 
include "../node_modules/circomlib/circuits/comparators.circom";
include "./allowed_voters.circom";


template voting () {
    signal input ToWhomVote;
    signal input Salt;
    signal input IdentityKey;
    
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
   
    signal isAllowed;
    isAllowed <== 0;
    for (var i = 0; i < ALLOWED_VOTERS.length; i++) {
        signal m;
        m <== IdentityKey === ALLOWED_VOTERS[i];
        isAllowed <== isAllowed + m - isAllowed * m;
    }

    isAllowed === 1;

    component idCommit = Poseidon(1);
    idCommit.inputs[0] <== IdentityKey;
    Nullifier <== idCommit.out;

    component VoteHash = Poseidon(2);
    VoteHash.inputs[0] <== ToWhomVote;
    VoteHash.inputs[1] <== Salt;
    Vote <== VoteHash.out;  
    
}

component main = voting();