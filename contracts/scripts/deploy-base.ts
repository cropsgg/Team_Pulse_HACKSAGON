import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";

async function main() {
  console.log("🚀 Deploying ImpactChain to Base blockchain...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy contracts in dependency order
  const deployedContracts: { [key: string]: Contract } = {};

  // Skip governance contracts for now due to OpenZeppelin compatibility issues
  console.log("⚠️  Skipping governance contracts (ImpactToken, TimelockController, ImpactGovernor)");
  console.log("   These can be deployed separately after resolving OpenZeppelin version compatibility");

  // 4. Deploy Router
  console.log("\n📄 Deploying Router...");
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(deployer.address);
  await router.waitForDeployment();
  deployedContracts.Router = router;
  console.log("✅ Router deployed to:", await router.getAddress());

  // 5. Deploy module implementations with correct parameters
  
  // Temporary treasury and price feed addresses for Base
  const tempTreasury = deployer.address; // Use deployer as temporary treasury
  const basePriceFeed = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"; // Base ETH/USD

  console.log("\n📄 Deploying NGORegistry...");
  const NGORegistry = await ethers.getContractFactory("NGORegistry");
  const ngoRegistry = await upgrades.deployProxy(
    NGORegistry,
    [deployer.address, deployer.address], // admin, governance
    { initializer: "initialize", kind: "uups" }
  );
  await ngoRegistry.waitForDeployment();
  deployedContracts.NGORegistry = ngoRegistry;
  console.log(`✅ NGORegistry deployed to:`, await ngoRegistry.getAddress());
  await router.updateModule("NGORegistry", await ngoRegistry.getAddress());

  console.log("\n📄 Deploying FeeManager...");
  const FeeManager = await ethers.getContractFactory("FeeManager");
  const feeManager = await upgrades.deployProxy(
    FeeManager,
    [deployer.address, deployer.address, tempTreasury], // admin, governance, treasury
    { initializer: "initialize", kind: "uups" }
  );
  await feeManager.waitForDeployment();
  deployedContracts.FeeManager = feeManager;
  console.log(`✅ FeeManager deployed to:`, await feeManager.getAddress());
  await router.updateModule("FeeManager", await feeManager.getAddress());

  console.log("\n📄 Deploying DonationManager...");
  const DonationManager = await ethers.getContractFactory("DonationManager");
  const donationManager = await upgrades.deployProxy(
    DonationManager,
    [
      deployer.address, // admin
      deployer.address, // governance
      await ngoRegistry.getAddress(), // ngoRegistry
      basePriceFeed, // priceFeed
      tempTreasury, // treasury
      250 // 2.5% initial fee
    ],
    { initializer: "initialize", kind: "uups" }
  );
  await donationManager.waitForDeployment();
  deployedContracts.DonationManager = donationManager;
  console.log(`✅ DonationManager deployed to:`, await donationManager.getAddress());
  await router.updateModule("DonationManager", await donationManager.getAddress());

  // Deploy MilestoneManager with 4 parameters
  console.log("\n📄 Deploying MilestoneManager...");
  const MilestoneManager = await ethers.getContractFactory("MilestoneManager");
  const milestoneManager = await upgrades.deployProxy(
    MilestoneManager,
    [
      deployer.address, // admin
      deployer.address, // governance
      await donationManager.getAddress(), // donationManager
      await ngoRegistry.getAddress() // ngoRegistry
    ],
    { initializer: "initialize", kind: "uups" }
  );
  await milestoneManager.waitForDeployment();
  deployedContracts.MilestoneManager = milestoneManager;
  console.log(`✅ MilestoneManager deployed to:`, await milestoneManager.getAddress());
  await router.updateModule("MilestoneManager", await milestoneManager.getAddress());

  // Deploy StartupRegistry with 3 parameters
  console.log("\n📄 Deploying StartupRegistry...");
  const StartupRegistry = await ethers.getContractFactory("StartupRegistry");
  const startupRegistry = await upgrades.deployProxy(
    StartupRegistry,
    [
      deployer.address, // admin
      deployer.address, // governance
      ethers.parseEther("1") // minimumVCStake (1 ETH)
    ],
    { initializer: "initialize", kind: "uups" }
  );
  await startupRegistry.waitForDeployment();
  deployedContracts.StartupRegistry = startupRegistry;
  console.log(`✅ StartupRegistry deployed to:`, await startupRegistry.getAddress());
  await router.updateModule("StartupRegistry", await startupRegistry.getAddress());

  // Deploy EquityAllocator with 4 parameters
  console.log("\n📄 Deploying EquityAllocator...");
  const EquityAllocator = await ethers.getContractFactory("EquityAllocator");
  const equityAllocator = await upgrades.deployProxy(
    EquityAllocator,
    [
      deployer.address, // admin
      deployer.address, // governance
      30 * 24 * 3600, // defaultCliffPeriod (30 days)
      365 * 24 * 3600 // defaultVestingPeriod (1 year)
    ],
    { initializer: "initialize", kind: "uups" }
  );
  await equityAllocator.waitForDeployment();
  deployedContracts.EquityAllocator = equityAllocator;
  console.log(`✅ EquityAllocator deployed to:`, await equityAllocator.getAddress());
  await router.updateModule("EquityAllocator", await equityAllocator.getAddress());

  // Deploy CSRManager with 5 parameters
  console.log("\n📄 Deploying CSRManager...");
  const CSRManager = await ethers.getContractFactory("CSRManager");
  const csrManager = await upgrades.deployProxy(
    CSRManager,
    [
      deployer.address, // admin
      deployer.address, // governance
      await ngoRegistry.getAddress(), // ngoRegistry
      tempTreasury, // csrTreasury
      200 // initialFeeBps (2%)
    ],
    { initializer: "initialize", kind: "uups" }
  );
  await csrManager.waitForDeployment();
  deployedContracts.CSRManager = csrManager;
  console.log(`✅ CSRManager deployed to:`, await csrManager.getAddress());
  await router.updateModule("CSRManager", await csrManager.getAddress());

  // Deploy QAMemory with 3 parameters
  console.log("\n📄 Deploying QAMemory...");
  const QAMemory = await ethers.getContractFactory("QAMemory");
  const qaMemory = await upgrades.deployProxy(
    QAMemory,
    [
      deployer.address, // admin
      deployer.address, // governance
      75 // qualityThreshold (75%)
    ],
    { initializer: "initialize", kind: "uups" }
  );
  await qaMemory.waitForDeployment();
  deployedContracts.QAMemory = qaMemory;
  console.log(`✅ QAMemory deployed to:`, await qaMemory.getAddress());
  await router.updateModule("QAMemory", await qaMemory.getAddress());

  // 6. Setup roles and permissions
  console.log("\n🔑 Setting up basic roles and permissions...");
  console.log("⚠️  Governance role setup skipped - will need to be done after governance deployment");

  // 7. Configure FeeManager with price feeds for Base
  console.log("\n💰 Configuring FeeManager...");
  const deployedFeeManager = deployedContracts.FeeManager;
  
  // Base Mainnet Chainlink ETH/USD price feed
  const ETH_USD_FEED = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70";
  
  // Skip price feed configuration for now as it may not exist in the contract
  console.log("⚠️  Price feed configuration skipped - may need manual setup");

  // 8. Print deployment summary
  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("=====================================");
  console.log("Network: Base");
  console.log("Deployer:", deployer.address);
  console.log("\n📄 Contract Addresses:");
  
  for (const [name, contract] of Object.entries(deployedContracts)) {
    console.log(`${name}: ${await contract.getAddress()}`);
  }

  // 9. Save addresses to file
  const fs = require("fs");
  const addresses: {[key: string]: string} = {};
  for (const [name, contract] of Object.entries(deployedContracts)) {
    addresses[name] = await contract.getAddress();
  }
  
  fs.writeFileSync(
    "./deployment-base.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("\n💾 Addresses saved to deployment-base.json");

  // 10. Verification info
  console.log("\n🔍 Verification Commands:");
  console.log("Run these commands to verify contracts on Basescan:");
  for (const [name, contract] of Object.entries(deployedContracts)) {
    console.log(`npx hardhat verify --network base ${await contract.getAddress()}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 