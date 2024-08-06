const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const TOTAL_SUPPLY = 1_000_000n;

module.exports = buildModule("QaCoinModule", (m) => {
  const QaCoin = m.contract("QaCoin", [TOTAL_SUPPLY], {});

  return { QaCoin };
});
