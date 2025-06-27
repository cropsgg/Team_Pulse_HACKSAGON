import { ethers } from "hardhat";
import { Contract } from "ethers";

async function main() {
  console.log("🚀 Starting Simple ImpactChain deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // 1. Deploy Simple Governance Token
  console.log("\n1️⃣ Deploying SimpleGovernanceToken...");
  const SimpleGovernanceToken = await ethers.getContractFactory("SimpleGovernanceToken");
  const governanceToken = await SimpleGovernanceToken.deploy(
    "ImpactChain Token",
    "ICT", 
    deployer.address
  );
  await governanceToken.waitForDeployment();
  console.log("✅ SimpleGovernanceToken deployed to:", await governanceToken.getAddress());

  // 2. Deploy Reputation Badge
  console.log("\n2️⃣ Deploying ReputationBadge...");
  const ReputationBadge = await ethers.getContractFactory("ReputationBadge");
  const reputationBadge = await ReputationBadge.deploy(deployer.address);
  await reputationBadge.waitForDeployment();
  console.log("✅ ReputationBadge deployed to:", await reputationBadge.getAddress());

  // 3. Deploy Funding Round
  console.log("\n3️⃣ Deploying FundingRound...");
  const FundingRound = await ethers.getContractFactory("FundingRound");
  const deadline = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days
  const fundingRound = await FundingRound.deploy(
    "Clean Water Initiative - Kenya",
    "Providing clean water access to 5000 people",
    "ipfs://QmSampleHash",
    deployer.address, // creator
    ethers.parseEther("100"), // target
    deadline,
    250, // 2.5% platform fee
    deployer.address, // platform fee recipient
    deployer.address // owner
  );
  await fundingRound.waitForDeployment();
  console.log("✅ FundingRound deployed to:", await fundingRound.getAddress());

  // 4. Add milestones
  console.log("\n4️⃣ Adding milestones...");
  const milestone1Deadline = Math.floor(Date.now() / 1000) + (10 * 24 * 60 * 60);
  const milestone2Deadline = Math.floor(Date.now() / 1000) + (20 * 24 * 60 * 60);
  
  await fundingRound.addMilestone(
    "Site Assessment",
    "Complete site surveys and planning",
    ethers.parseEther("30"),
    milestone1Deadline
  );
  
  await fundingRound.addMilestone(
    "Equipment Purchase",
    "Purchase and ship equipment",
    ethers.parseEther("50"),
    milestone2Deadline
  );
  
  await fundingRound.addMilestone(
    "Installation",
    "Install and train operators",
    ethers.parseEther("20"),
    deadline
  );
  
  console.log("✅ Milestones added");

  // 5. Mint some test tokens
  console.log("\n5️⃣ Minting test tokens...");
  await governanceToken.mintOnDonation(deployer.address, ethers.parseEther("1000"));
  console.log("✅ Test tokens minted");

  // 6. Print summary
  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("=====================================");
  console.log(`SimpleGovernanceToken: ${await governanceToken.getAddress()}`);
  console.log(`ReputationBadge: ${await reputationBadge.getAddress()}`);
  console.log(`FundingRound: ${await fundingRound.getAddress()}`);
  console.log("=====================================");

  // 7. Save addresses
  const deployment = {
    network: "localhost",
    governanceToken: await governanceToken.getAddress(),
    reputationBadge: await reputationBadge.getAddress(),
    fundingRound: await fundingRound.getAddress(),
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync('deployment-localhost.json', JSON.stringify(deployment, null, 2));
  console.log("💾 Deployment saved to deployment-localhost.json");

  return deployment;
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { main as deploySimpleContracts }; 