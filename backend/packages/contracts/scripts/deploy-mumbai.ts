import { ethers } from "hardhat";
import { writeFileSync } from "fs";

async function main() {
  console.log("🚀 Deploying to Polygon Mumbai Testnet...");
  
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await deployer.provider.getBalance(deployerAddress);
  
  console.log("📍 Deployer address:", deployerAddress);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "MATIC");
  
  if (balance < ethers.parseEther("0.1")) {
    console.error("❌ Insufficient MATIC balance. Need at least 0.1 MATIC for deployment.");
    console.log("🔗 Get Mumbai MATIC from: https://faucet.polygon.technology/");
    process.exit(1);
  }

  // Deploy MinimalToken
  console.log("\n1️⃣ Deploying MinimalToken...");
  const MinimalToken = await ethers.getContractFactory("MinimalToken");
  const token = await MinimalToken.deploy("ImpactChain Token", "ICT", deployerAddress);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ MinimalToken deployed to:", tokenAddress);

  // Deploy MinimalBadge
  console.log("\n2️⃣ Deploying MinimalBadge...");
  const MinimalBadge = await ethers.getContractFactory("MinimalBadge");
  const badge = await MinimalBadge.deploy(deployerAddress);
  await badge.waitForDeployment();
  const badgeAddress = await badge.getAddress();
  console.log("✅ MinimalBadge deployed to:", badgeAddress);

  // Deploy FundingRound
  console.log("\n3️⃣ Deploying FundingRound...");
  const FundingRound = await ethers.getContractFactory("FundingRound");
  const deadline = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days
  const fundingRound = await FundingRound.deploy(
    "Mumbai Test Campaign",
    "Test campaign for blockchain integration",
    "ipfs://QmTestCampaignHash",
    deployerAddress, // beneficiary
    ethers.parseEther("10"), // 10 MATIC target
    deadline,
    250, // 2.5% fee
    deployerAddress, // oracle
    deployerAddress  // owner
  );
  await fundingRound.waitForDeployment();
  const fundingRoundAddress = await fundingRound.getAddress();
  console.log("✅ FundingRound deployed to:", fundingRoundAddress);

  // Add milestones
  console.log("\n4️⃣ Adding milestones...");
  await fundingRound.addMilestone(
    "Phase 1: Planning",
    "Complete project planning and assessment",
    ethers.parseEther("3"),
    Math.floor(Date.now() / 1000) + (10 * 24 * 60 * 60) // 10 days
  );
  await fundingRound.addMilestone(
    "Phase 2: Implementation",
    "Execute project implementation",
    ethers.parseEther("5"),
    Math.floor(Date.now() / 1000) + (20 * 24 * 60 * 60) // 20 days
  );
  await fundingRound.addMilestone(
    "Phase 3: Completion",
    "Project completion and evaluation",
    ethers.parseEther("2"),
    Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  );
  console.log("✅ Milestones added");

  // Mint test tokens (for testing purposes)
  console.log("\n5️⃣ Minting test tokens...");
  await token.mintOnDonation(deployerAddress, ethers.parseEther("1000"));
  console.log("✅ Test tokens minted (1000 ICT)");

  // Mint test badge
  console.log("\n6️⃣ Minting test badge...");
  await badge.mintBadge(deployerAddress, 0, 1000, "ipfs://QmTestBadgeHash");
  console.log("✅ Test badge minted");

  // Create deployment record
  const deploymentInfo = {
    network: "mumbai",
    chainId: 80001,
    timestamp: new Date().toISOString(),
    deployer: deployerAddress,
    contracts: {
      token: tokenAddress,
      badge: badgeAddress,
      fundingRound: fundingRoundAddress
    },
    verification: {
      polygonscan: `https://mumbai.polygonscan.com/address/${tokenAddress}`,
      sourcify: "https://sourcify.dev/"
    },
    testData: {
      tokenSupply: "1000 ICT minted",
      badgesMinted: 1,
      milestonesAdded: 3,
      campaignTarget: "10 MATIC"
    }
  };

  // Save deployment info
  const deploymentPath = "./deployment-mumbai.json";
  writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📄 Deployment info saved to: ${deploymentPath}`);

  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("=====================================");
  console.log(`MinimalToken: ${tokenAddress}`);
  console.log(`MinimalBadge: ${badgeAddress}`);
  console.log(`FundingRound: ${fundingRoundAddress}`);
  console.log("=====================================");

  // Verification instructions
  console.log("\n🔍 To verify contracts on PolygonScan, run:");
  console.log(`npx hardhat verify --network mumbai ${tokenAddress} "ImpactChain Token" "ICT" "${deployerAddress}"`);
  console.log(`npx hardhat verify --network mumbai ${badgeAddress} "${deployerAddress}"`);
  console.log(`npx hardhat verify --network mumbai ${fundingRoundAddress} "Mumbai Test Campaign" "Test campaign for blockchain integration" "ipfs://QmTestCampaignHash" "${deployerAddress}" "${ethers.parseEther("10")}" "${deadline}" "250" "${deployerAddress}" "${deployerAddress}"`);

  console.log("\n🔗 View on Mumbai PolygonScan:");
  console.log(`Token: https://mumbai.polygonscan.com/address/${tokenAddress}`);
  console.log(`Badge: https://mumbai.polygonscan.com/address/${badgeAddress}`);
  console.log(`Campaign: https://mumbai.polygonscan.com/address/${fundingRoundAddress}`);
  
  console.log("\n📝 Next Steps:");
  console.log("1. Update backend .env with deployed contract addresses");
  console.log("2. Test contract interactions via GraphQL");
  console.log("3. Integrate with frontend wallet connections");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 