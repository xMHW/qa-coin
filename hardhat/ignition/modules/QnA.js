const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// const JAN_1ST_2030 = 1893456000;
// const ONE_GWEI = 1_000_000_000n;
const TOKEN_ADDR = "0x160FC635F6B5fAA4F5d50eF180aE14F16F289963";

module.exports = buildModule("QnA", (m) => {
  const QnA = m.contract("QnA", [TOKEN_ADDR], {});

  return { QnA };
});
