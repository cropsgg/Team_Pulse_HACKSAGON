import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";

async function main() {
  console.log("🚀 Deploying ImpactChain with Governance to Base blockchain...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const deployedContracts: { [key: string]: Contract } = {};

  // 1. Deploy Governance Contracts First
  console.log("\n🏛️ GOVERNANCE CONTRACTS");
  console.log("=====================================");

  // Deploy ImpactToken
  console.log("\n📄 Deploying ImpactToken...");
  const ImpactToken = await ethers.getContractFactory("ImpactToken");
  const impactToken = await ImpactToken.deploy(deployer.address);
  await impactToken.waitForDeployment();
  deployedContracts.ImpactToken = impactToken;
  console.log("✅ ImpactToken deployed to:", await impactToken.getAddress());

  // Deploy ImpactTimelock (24 hour delay)
  console.log("\n📄 Deploying ImpactTimelock...");
  const ImpactTimelock = await ethers.getContractFactory("ImpactTimelock");
  const impactTimelock = await ImpactTimelock.deploy(
    86400, // 24 hour minimum delay
    [deployer.address], // proposers (will be updated to governor)
    [deployer.address], // executors (will be updated to governor)
    deployer.address    // admin
  );
  await impactTimelock.waitForDeployment();
  deployedContracts.ImpactTimelock = impactTimelock;
  console.log("✅ ImpactTimelock deployed to:", await impactTimelock.getAddress());

  // Deploy ImpactGovernor
  console.log("\n📄 Deploying ImpactGovernor...");
  const ImpactGovernor = await ethers.getContractFactory("ImpactGovernor");
  const impactGovernor = await ImpactGovernor.deploy(await impactToken.getAddress());
  await impactGovernor.waitForDeployment();
  deployedContracts.ImpactGovernor = impactGovernor;
  console.log("✅ ImpactGovernor deployed to:", await impactGovernor.getAddress());

  // 2. Deploy Core Contracts
  console.log("\n🏗️ CORE CONTRACTS");
  console.log("=====================================");

  // Deploy Router
  console.log("\n📄 Deploying Router...");
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(deployer.address);
  await router.waitForDeployment();
  deployedContracts.Router = router;
  console.log("✅ Router deployed to:", await router.getAddress());

  // Temporary values for Base
  const tempTreasury = deployer.address;
  const basePriceFeed = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"; // Base ETH/USD

  // Deploy NGORegistry
  console.log("\n📄 Deploying NGORegistry...");
  const NGORegistry = await ethers.getContractFactory("NGORegistry");
  const ngoRegistry = await upgrades.deployProxy(
    NGORegistry,
    [deployer.address, await impactGovernor.getAddress()], // Use governance as admin
    { initializer: "initialize", kind: "uups" }
  );
  await ngoRegistry.waitForDeployment();
  deployedContracts.NGORegistry = ngoRegistry;
  console.log(`✅ NGORegistry deployed to:`, await ngoRegistry.getAddress());
  await router.updateModule("NGORegistry", await ngoRegistry.getAddress());

  // Deploy FeeManager
  console.log("\n📄 Deploying FeeManager...");
  const FeeManager = await ethers.getContractFactory("FeeManager");
  const feeManager = await upgrades.deployProxy(
    FeeManager,
    [deployer.address, await impactGovernor.getAddress(), tempTreasury],
    { initializer: "initialize", kind: "uups" }
  );
  await feeManager.waitForDeployment();
  deployedContracts.FeeManager = feeManager;
  console.log(`✅ FeeManager deployed to:`, await feeManager.getAddress());
  await router.updateModule("FeeManager", await feeManager.getAddress());

  // Deploy DonationManager
  console.log("\n📄 Deploying DonationManager...");
  const DonationManager = await ethers.getContractFactory("DonationManager");
  const donationManager = await upgrades.deployProxy(
    DonationManager,
    [
      deployer.address,
      await impactGovernor.getAddress(),
      await ngoRegistry.getAddress(),
      basePriceFeed,
      tempTreasury,
      250 // 2.5% initial fee
    ],
    { initializer: "initialize", kind: "uups" }
  );
  await donationManager.waitForDeployment();
  deployedContracts.DonationManager = donationManager;
  console.log(`✅ DonationManager deployed to:`, await donationManager.getAddress());
  await router.updateModule("DonationManager", await donationManager.getAddress());

  // Deploy MilestoneManager
  console.log("\n📄 Deploying MilestoneManager...");
  const MilestoneManager = await ethers.getContractFactory("MilestoneManager");
  const milestoneManager = await upgrades.deployProxy(
    MilestoneManager,
    [
      deployer.address,
      await impactGovernor.getAddress(),
      await donationManager.getAddress(),
      await ngoRegistry.getAddress()
    ],
    { initializer: "initialize", kind: "uups" }
  );
  await milestoneManager.waitForDeployment();
  deployedContracts.MilestoneManager = milestoneManager;
  console.log(`✅ MilestoneManager deployed to:`, await milestoneManager.getAddress());
  await router.updateModule("MilestoneManager", await milestoneManager.getAddress());

  // Deploy StartupRegistry
  console.log("\n📄 Deploying StartupRegistry...");
  const StartupRegistry = await ethers.getContractFactory("StartupRegistry");
  const startupRegistry = await upgrades.deployProxy(
    StartupRegistry,
    [
      deployer.address,
      await impactGovernor.getAddress(),
      ethers.parseEther("1") // 1 ETH minimum VC stake
    ],
    { initializer: "initialize", kind: "uups" }
  );
  await startupRegistry.waitForDeployment();
  deployedContracts.StartupRegistry = startupRegistry;
  console.log(`✅ StartupRegistry deployed to:`, await startupRegistry.getAddress());
  await router.updateModule("StartupRegistry", await startupRegistry.getAddress());

  // Deploy EquityAllocator
  console.log("\n📄 Deploying EquityAllocator...");
  const EquityAllocator = await ethers.getContractFactory("EquityAllocator");
  const equityAllocator = await upgrades.deployProxy(
    EquityAllocator,
    [
      deployer.address,
      await impactGovernor.getAddress(),
      30 * 24 * 3600, // 30 days cliff
      365 * 24 * 3600 // 1 year vesting
    ],
    { initializer: "initialize", kind: "uups" }
  );
  await equityAllocator.waitForDeployment();
  deployedContracts.EquityAllocator = equityAllocator;
  console.log(`✅ EquityAllocator deployed to:`, await equityAllocator.getAddress());
  await router.updateModule("EquityAllocator", await equityAllocator.getAddress());

  // Deploy CSRManager
  console.log("\n📄 Deploying CSRManager...");
  const CSRManager = await ethers.getContractFactory("CSRManager");
  const csrManager = await upgrades.deployProxy(
    CSRManager,
    [
      deployer.address,
      await impactGovernor.getAddress(),
      await ngoRegistry.getAddress(),
      tempTreasury,
      200 // 2% fee
    ],
    { initializer: "initialize", kind: "uups" }
  );
  await csrManager.waitForDeployment();
  deployedContracts.CSRManager = csrManager;
  console.log(`✅ CSRManager deployed to:`, await csrManager.getAddress());
  await router.updateModule("CSRManager", await csrManager.getAddress());

  // Deploy QAMemory
  console.log("\n📄 Deploying QAMemory...");
  const QAMemory = await ethers.getContractFactory("QAMemory");
  const qaMemory = await upgrades.deployProxy(
    QAMemory,
    [
      deployer.address,
      await impactGovernor.getAddress(),
      75 // 75% quality threshold
    ],
    { initializer: "initialize", kind: "uups" }
  );
  await qaMemory.waitForDeployment();
  deployedContracts.QAMemory = qaMemory;
  console.log(`✅ QAMemory deployed to:`, await qaMemory.getAddress());
  await router.updateModule("QAMemory", await qaMemory.getAddress());

  // 3. Setup governance roles
  console.log("\n🔑 Setting up governance roles...");
  
  // Grant admin role to governance for timelock operations
  const TIMELOCK_ADMIN_ROLE = await impactTimelock.TIMELOCK_ADMIN_ROLE();
  const PROPOSER_ROLE = await impactTimelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await impactTimelock.EXECUTOR_ROLE();
  
  console.log("   • Granting proposer role to Governor...");
  await impactTimelock.grantRole(PROPOSER_ROLE, await impactGovernor.getAddress());
  
  console.log("   • Granting executor role to Governor...");
  await impactTimelock.grantRole(EXECUTOR_ROLE, await impactGovernor.getAddress());

  // 4. Print deployment summary
  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("=====================================");
  console.log("Network: Base Sepolia");
  console.log("Deployer:", deployer.address);
  console.log("\n📄 Contract Addresses:");
  
  for (const [name, contract] of Object.entries(deployedContracts)) {
    console.log(`${name}: ${await contract.getAddress()}`);
  }

  // 5. Save addresses
  const fs = require("fs");
  const addresses: {[key: string]: string} = {};
  for (const [name, contract] of Object.entries(deployedContracts)) {
    addresses[name] = await contract.getAddress();
  }
  
  fs.writeFileSync(
    "./deployment-with-governance.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("\n💾 Addresses saved to deployment-with-governance.json");

  // 6. Next steps
  console.log("\n📋 Next Steps:");
  console.log("1. Transfer ownership of modules to governance");
  console.log("2. Renounce admin roles on timelock");
  console.log("3. Distribute IMPACT tokens to community");
  console.log("4. Create initial governance proposals");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 