import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Minimal ImpactChain Contracts...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // Deploy MinimalToken
  console.log("\n1️⃣ Deploying MinimalToken...");
  const MinimalToken = await ethers.getContractFactory("MinimalToken");
  const token = await MinimalToken.deploy("ImpactChain Token", "ICT", deployer.address);
  await token.waitForDeployment();
  console.log("✅ MinimalToken deployed to:", await token.getAddress());

  // Deploy MinimalBadge
  console.log("\n2️⃣ Deploying MinimalBadge...");
  const MinimalBadge = await ethers.getContractFactory("MinimalBadge");
  const badge = await MinimalBadge.deploy(deployer.address);
  await badge.waitForDeployment();
  console.log("✅ MinimalBadge deployed to:", await badge.getAddress());

  // Deploy FundingRound
  console.log("\n3️⃣ Deploying FundingRound...");
  const FundingRound = await ethers.getContractFactory("FundingRound");
  const deadline = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
  const fundingRound = await FundingRound.deploy(
    "Kenya Clean Water",
    "Solar-powered water pumps for rural Kenya",
    "ipfs://QmSampleHash",
    deployer.address,
    ethers.parseEther("100"),
    deadline,
    250, // 2.5% fee
    deployer.address,
    deployer.address
  );
  await fundingRound.waitForDeployment();
  console.log("✅ FundingRound deployed to:", await fundingRound.getAddress());

  // Add milestones
  console.log("\n4️⃣ Adding milestones...");
  await fundingRound.addMilestone(
    "Site Assessment",
    "Complete site surveys",
    ethers.parseEther("30"),
    Math.floor(Date.now() / 1000) + (10 * 24 * 60 * 60)
  );
  await fundingRound.addMilestone(
    "Equipment Purchase",
    "Buy solar pumps",
    ethers.parseEther("50"),
    Math.floor(Date.now() / 1000) + (20 * 24 * 60 * 60)
  );
  console.log("✅ Milestones added");

  // Mint test tokens
  console.log("\n5️⃣ Minting test tokens...");
  await token.mintOnDonation(deployer.address, ethers.parseEther("1000"));
  console.log("✅ Test tokens minted");

  // Mint test badge
  console.log("\n6️⃣ Minting test badge...");
  await badge.mintBadge(deployer.address, 0, 1000, "ipfs://QmTestBadge");
  console.log("✅ Test badge minted");

  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("=====================================");
  console.log(`MinimalToken: ${await token.getAddress()}`);
  console.log(`MinimalBadge: ${await badge.getAddress()}`);
  console.log(`FundingRound: ${await fundingRound.getAddress()}`);
  console.log("=====================================");

  // Save deployment info
  const deployment = {
    network: "localhost",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      token: await token.getAddress(),
      badge: await badge.getAddress(),
      fundingRound: await fundingRound.getAddress()
    }
  };

  const fs = require('fs');
  fs.writeFileSync('deployment-minimal.json', JSON.stringify(deployment, null, 2));
  console.log("💾 Saved to deployment-minimal.json");
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default main; 