import { ethers } from "hardhat";

async function main() {
  console.log("🏛️ Deploying ImpactChain Governance contracts...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const governanceContracts: { [key: string]: any } = {};

  // Deploy ImpactToken
  console.log("\n📄 Deploying ImpactToken...");
  const ImpactToken = await ethers.getContractFactory("ImpactToken");
  const impactToken = await ImpactToken.deploy(deployer.address);
  await impactToken.waitForDeployment();
  governanceContracts.ImpactToken = impactToken;
  console.log("✅ ImpactToken deployed to:", await impactToken.getAddress());

  // Deploy ImpactTimelock (24 hour delay)
  console.log("\n📄 Deploying ImpactTimelock...");
  const ImpactTimelock = await ethers.getContractFactory("ImpactTimelock");
  const impactTimelock = await ImpactTimelock.deploy(
    86400, // 24 hour minimum delay
    [deployer.address], // proposers
    [deployer.address], // executors
    deployer.address    // admin
  );
  await impactTimelock.waitForDeployment();
  governanceContracts.ImpactTimelock = impactTimelock;
  console.log("✅ ImpactTimelock deployed to:", await impactTimelock.getAddress());

  // Deploy ImpactGovernor
  console.log("\n📄 Deploying ImpactGovernor...");
  const ImpactGovernor = await ethers.getContractFactory("ImpactGovernor");
  const impactGovernor = await ImpactGovernor.deploy(await impactToken.getAddress());
  await impactGovernor.waitForDeployment();
  governanceContracts.ImpactGovernor = impactGovernor;
  console.log("✅ ImpactGovernor deployed to:", await impactGovernor.getAddress());

  // Setup governance roles
  console.log("\n�� Setting up governance roles...");
  
  const PROPOSER_ROLE = await impactTimelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await impactTimelock.EXECUTOR_ROLE();
  
  console.log("   • Granting proposer role to Governor...");
  await impactTimelock.grantRole(PROPOSER_ROLE, await impactGovernor.getAddress());
  
  console.log("   • Granting executor role to Governor...");
  await impactTimelock.grantRole(EXECUTOR_ROLE, await impactGovernor.getAddress());

  // Print deployment summary
  console.log("\n🎉 GOVERNANCE DEPLOYMENT COMPLETE!");
  console.log("=====================================");
  console.log("Network: Base Sepolia");
  console.log("Deployer:", deployer.address);
  console.log("\n📄 Governance Contract Addresses:");
  
  for (const [name, contract] of Object.entries(governanceContracts)) {
    console.log(`\${name}: \${await contract.getAddress()}`);
  }

  // Save governance addresses
  const fs = require("fs");
  const addresses: {[key: string]: string} = {};
  for (const [name, contract] of Object.entries(governanceContracts)) {
    addresses[name] = await contract.getAddress();
  }
  
  fs.writeFileSync(
    "./deployment-governance.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("\n💾 Governance addresses saved to deployment-governance.json");

  console.log("\n📋 Next Steps:");
  console.log("1. Distribute IMPACT tokens to community");
  console.log("2. Create initial governance proposals");
  console.log("3. Integrate governance with existing contracts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
