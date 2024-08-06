const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// const JAN_1ST_2030 = 1893456000;
// const ONE_GWEI = 1_000_000_000n;
const TOKEN_ADDR = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

module.exports = buildModule("QnA", (m) => {
  const QnA = m.contract("QnA", [TOKEN_ADDR], {});

  return { QnA };
});
