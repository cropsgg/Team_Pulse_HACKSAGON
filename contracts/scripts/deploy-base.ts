import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";

async function main() {
  console.log("🚀 Deploying ImpactChain to Base blockchain...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy contracts in dependency order
  const deployedContracts: { [key: string]: Contract } = {};

  // 1. Deploy ImpactToken (governance token)
  console.log("\n📄 Deploying ImpactToken...");
  const ImpactToken = await ethers.getContractFactory("ImpactToken");
  const impactToken = await ImpactToken.deploy(
    "Impact Token", // name
    "IMPACT", // symbol
    deployer.address, // initial owner
    ethers.utils.parseEther("1000000") // 1M initial supply
  );
  await impactToken.deployed();
  deployedContracts.ImpactToken = impactToken;
  console.log("✅ ImpactToken deployed to:", impactToken.address);

  // 2. Deploy TimelockController
  console.log("\n📄 Deploying TimelockController...");
  const TimelockController = await ethers.getContractFactory("ImpactChainTimelock");
  const timelock = await TimelockController.deploy(
    86400, // 24 hours delay
    [deployer.address], // proposers
    [deployer.address], // executors
    deployer.address // admin
  );
  await timelock.deployed();
  deployedContracts.TimelockController = timelock;
  console.log("✅ TimelockController deployed to:", timelock.address);

  // 3. Deploy Governor
  console.log("\n📄 Deploying ImpactGovernor...");
  const ImpactGovernor = await ethers.getContractFactory("ImpactGovernor");
  const governor = await ImpactGovernor.deploy(
    impactToken.address,
    timelock.address,
    deployer.address
  );
  await governor.deployed();
  deployedContracts.ImpactGovernor = governor;
  console.log("✅ ImpactGovernor deployed to:", governor.address);

  // 4. Deploy Router
  console.log("\n📄 Deploying Router...");
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(deployer.address);
  await router.deployed();
  deployedContracts.Router = router;
  console.log("✅ Router deployed to:", router.address);

  // 5. Deploy module implementations
  const modules = [
    "NGORegistry",
    "DonationManager", 
    "MilestoneManager",
    "StartupRegistry",
    "EquityAllocator",
    "CSRManager",
    "QAMemory",
    "FeeManager"
  ];

  for (const moduleName of modules) {
    console.log(`\n📄 Deploying ${moduleName}...`);
    
    const ModuleFactory = await ethers.getContractFactory(moduleName);
    const moduleProxy = await upgrades.deployProxy(
      ModuleFactory,
      [deployer.address], // admin
      { 
        initializer: "initialize",
        kind: "uups"
      }
    );
    await moduleProxy.deployed();
    
    deployedContracts[moduleName] = moduleProxy;
    console.log(`✅ ${moduleName} deployed to:`, moduleProxy.address);
    
    // Register module in router
    await router.updateModule(moduleName, moduleProxy.address);
    console.log(`🔗 ${moduleName} registered in Router`);
  }

  // 6. Setup roles and permissions
  console.log("\n🔑 Setting up roles and permissions...");
  
  // Grant governor role to timelock
  const GOVERNANCE_ROLE = await impactToken.GOVERNANCE_ROLE();
  await impactToken.grantRole(GOVERNANCE_ROLE, timelock.address);
  console.log("✅ Granted GOVERNANCE_ROLE to TimelockController");

  // Setup timelock roles
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  await timelock.grantRole(PROPOSER_ROLE, governor.address);
  await timelock.grantRole(EXECUTOR_ROLE, governor.address);
  console.log("✅ Granted roles to Governor in TimelockController");

  // 7. Configure FeeManager with price feeds for Base
  console.log("\n💰 Configuring FeeManager...");
  const feeManager = deployedContracts.FeeManager;
  
  // Base Mainnet Chainlink ETH/USD price feed
  const ETH_USD_FEED = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70";
  
  await feeManager.setPriceFeed("ETH", ETH_USD_FEED);
  console.log("✅ Configured ETH/USD price feed for Base");

  // 8. Print deployment summary
  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("=====================================");
  console.log("Network: Base");
  console.log("Deployer:", deployer.address);
  console.log("\n📄 Contract Addresses:");
  
  for (const [name, contract] of Object.entries(deployedContracts)) {
    console.log(`${name}: ${contract.address}`);
  }

  // 9. Save addresses to file
  const fs = require("fs");
  const addresses = {};
  for (const [name, contract] of Object.entries(deployedContracts)) {
    addresses[name] = contract.address;
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
    console.log(`npx hardhat verify --network base ${contract.address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 