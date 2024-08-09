const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("QaCoinModule", (m) => {
  const QaCoin = m.contract("QaCoin", [], {});

  return { QaCoin };
});
