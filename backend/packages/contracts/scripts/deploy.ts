import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";

interface DeployedContracts {
  governanceToken: Contract;
  reputationBadge: Contract;
  timelock: Contract;
  daoCore: Contract;
  fundingRound: Contract;
}

async function main() {
  console.log("🚀 Starting ImpactChain contract deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  const contracts: Partial<DeployedContracts> = {};

  try {
    // 1. Deploy Governance Token (Upgradeable)
    console.log("\n1️⃣ Deploying GovernanceToken...");
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    const governanceToken = await upgrades.deployProxy(
      GovernanceToken,
      ["ImpactChain Token", "ICT", deployer.address],
      { initializer: "initialize" }
    );
    await governanceToken.waitForDeployment();
    contracts.governanceToken = governanceToken;
    console.log("✅ GovernanceToken deployed to:", await governanceToken.getAddress());

    // 2. Deploy Reputation Badge
    console.log("\n2️⃣ Deploying ReputationBadge...");
    const ReputationBadge = await ethers.getContractFactory("ReputationBadge");
    const reputationBadge = await ReputationBadge.deploy();
    await reputationBadge.waitForDeployment();
    contracts.reputationBadge = reputationBadge;
    console.log("✅ ReputationBadge deployed to:", await reputationBadge.getAddress());

    // 3. Deploy Timelock Controller
    console.log("\n3️⃣ Deploying TimelockController...");
    const TimelockController = await ethers.getContractFactory("TimelockController");
    const minDelay = 60 * 60 * 24; // 24 hours
    const proposers = [deployer.address]; // Will be updated to DAO later
    const executors = [deployer.address]; // Will be updated to DAO later
    const admin = deployer.address; // Will be renounced later
    
    const timelock = await TimelockController.deploy(
      minDelay,
      proposers,
      executors,
      admin
    );
    await timelock.waitForDeployment();
    contracts.timelock = timelock;
    console.log("✅ TimelockController deployed to:", await timelock.getAddress());

    // 4. Deploy DAO Core
    console.log("\n4️⃣ Deploying DAOCore...");
    const DAOCore = await ethers.getContractFactory("DAOCore");
    const votingDelay = 1; // 1 block
    const votingPeriod = 45818; // ~1 week with 13s block time
    const quorumPercentage = 4; // 4% quorum
    
    const daoCore = await DAOCore.deploy(
      await governanceToken.getAddress(),
      await timelock.getAddress(),
      quorumPercentage,
      votingDelay,
      votingPeriod
    );
    await daoCore.waitForDeployment();
    contracts.daoCore = daoCore;
    console.log("✅ DAOCore deployed to:", await daoCore.getAddress());

    // 5. Deploy Sample Funding Round
    console.log("\n5️⃣ Deploying Sample FundingRound...");
    const FundingRound = await ethers.getContractFactory("FundingRound");
    const deadline = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days from now
    const platformFee = 250; // 2.5%
    
    const fundingRound = await FundingRound.deploy(
      "Clean Water Initiative - Kenya",
      "Providing clean water access to 5000 people in rural Kenya through solar-powered pumps",
      "ipfs://QmSampleMetadataHash",
      deployer.address,
      ethers.parseEther("100"), // 100 MATIC target
      deadline,
      platformFee,
      deployer.address // Platform fee recipient
    );
    await fundingRound.waitForDeployment();
    contracts.fundingRound = fundingRound;
    console.log("✅ Sample FundingRound deployed to:", await fundingRound.getAddress());

    // 6. Setup DAO permissions
    console.log("\n6️⃣ Setting up DAO permissions...");
    
    // Grant DAO the proposer and executor roles
    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
    const TIMELOCK_ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE();
    
    await timelock.grantRole(PROPOSER_ROLE, await daoCore.getAddress());
    await timelock.grantRole(EXECUTOR_ROLE, await daoCore.getAddress());
    
    // Revoke admin role from deployer (optional - commented out for testing)
    // await timelock.revokeRole(TIMELOCK_ADMIN_ROLE, deployer.address);
    
    console.log("✅ DAO permissions configured");

    // 7. Grant minter role to funding contracts (for governance tokens)
    console.log("\n7️⃣ Setting up token permissions...");
    const MINTER_ROLE = await governanceToken.MINTER_ROLE();
    await governanceToken.grantRole(MINTER_ROLE, await fundingRound.getAddress());
    console.log("✅ Token permissions configured");

    // 8. Create sample milestones for funding round
    console.log("\n8️⃣ Adding sample milestones...");
    const milestone1Deadline = Math.floor(Date.now() / 1000) + (10 * 24 * 60 * 60); // 10 days
    const milestone2Deadline = Math.floor(Date.now() / 1000) + (20 * 24 * 60 * 60); // 20 days
    
    await fundingRound.addMilestone(
      "Site Assessment and Planning",
      "Complete site surveys and technical planning for water pump installation",
      ethers.parseEther("30"),
      milestone1Deadline
    );
    
    await fundingRound.addMilestone(
      "Equipment Procurement",
      "Purchase and ship solar pumps and filtration equipment",
      ethers.parseEther("50"),
      milestone2Deadline
    );
    
    await fundingRound.addMilestone(
      "Installation and Training",
      "Install equipment and train local operators",
      ethers.parseEther("20"),
      deadline
    );
    
    console.log("✅ Sample milestones added");

    // 9. Print deployment summary
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("=====================================");
    console.log("📄 Contract Addresses:");
    console.log("=====================================");
    console.log(`GovernanceToken: ${await contracts.governanceToken!.getAddress()}`);
    console.log(`ReputationBadge: ${await contracts.reputationBadge!.getAddress()}`);
    console.log(`TimelockController: ${await contracts.timelock!.getAddress()}`);
    console.log(`DAOCore: ${await contracts.daoCore!.getAddress()}`);
    console.log(`Sample FundingRound: ${await contracts.fundingRound!.getAddress()}`);
    console.log("=====================================");

    // 10. Save deployment info to file
    const deploymentInfo = {
      network: await deployer.provider.getNetwork(),
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        governanceToken: await contracts.governanceToken!.getAddress(),
        reputationBadge: await contracts.reputationBadge!.getAddress(),
        timelock: await contracts.timelock!.getAddress(),
        daoCore: await contracts.daoCore!.getAddress(),
        sampleFundingRound: await contracts.fundingRound!.getAddress(),
      },
      parameters: {
        tokenName: "ImpactChain Token",
        tokenSymbol: "ICT",
        votingDelay,
        votingPeriod,
        quorumPercentage,
        timelockDelay: minDelay,
        platformFee,
      }
    };

    const fs = require('fs');
    fs.writeFileSync(
      `deployment-${deploymentInfo.network.chainId}.json`,
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(`💾 Deployment info saved to deployment-${deploymentInfo.network.chainId}.json`);

    // 11. Verification instructions
    console.log("\n🔍 To verify contracts on Polygonscan:");
    console.log("=====================================");
    console.log(`npx hardhat verify ${await contracts.reputationBadge!.getAddress()}`);
    console.log(`npx hardhat verify ${await contracts.timelock!.getAddress()} ${minDelay} [${proposers.join(',')}] [${executors.join(',')}] ${admin}`);
    console.log(`npx hardhat verify ${await contracts.daoCore!.getAddress()} ${await contracts.governanceToken!.getAddress()} ${await contracts.timelock!.getAddress()} ${quorumPercentage} ${votingDelay} ${votingPeriod}`);

    return contracts as DeployedContracts;

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Handle both direct execution and module import
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { main as deployContracts }; 