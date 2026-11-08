import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ThreatReportRegistryModule", m => {
  const publisher = m.getAccount(0);
  const registry = m.contract("ThreatReportRegistry", [publisher]);
  return { registry };
});
