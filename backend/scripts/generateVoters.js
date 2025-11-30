const fs = require("fs");
const voters = require("./validvoters.json");

function hexToDec(hex) {
    return BigInt(hex).toString();
}

let out = `// auto-generated file\nvar ALLOWED_VOTERS = [\n`;

for (let v of voters) {
    out += `    ${hexToDec(v)},\n`;
}

out += `];\n`;

fs.writeFileSync("../circuits/allowed_voters.circom", out);
console.log("generated allowed_voters.circom");
