import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Contract, Signer } from "ethers";

describe("ImpactChain Integration Tests", function () {
  let admin: Signer;
  let user1: Signer;
  let user2: Signer;
  let ngo: Signer;
  
  // Contract instances
  let impactToken: Contract;
  let governor: Contract;
  let timelock: Contract;
  let router: Contract;
  let ngoRegistry: Contract;
  let donationManager: Contract;
  let milestoneManager: Contract;
  let startupRegistry: Contract;
  let equityAllocator: Contract;
  let csrManager: Contract;
  let qaMemory: Contract;
  let feeManager: Contract;

  before(async function () {
    [admin, user1, user2, ngo] = await ethers.getSigners();
  });

  describe("Contract Deployment", function () {
    it("Should deploy all core contracts", async function () {
      // Deploy ImpactToken
      const ImpactToken = await ethers.getContractFactory("ImpactToken");
      impactToken = await ImpactToken.deploy(
        "Impact Token",
        "IMPACT", 
        await admin.getAddress(),
        ethers.utils.parseEther("1000000")
      );
      await impactToken.deployed();
      expect(impactToken.address).to.not.equal(ethers.constants.AddressZero);

      // Deploy TimelockController
      const TimelockController = await ethers.getContractFactory("ImpactChainTimelock");
      timelock = await TimelockController.deploy(
        86400, // 24 hours
        [await admin.getAddress()],
        [await admin.getAddress()], 
        await admin.getAddress()
      );
      await timelock.deployed();
      expect(timelock.address).to.not.equal(ethers.constants.AddressZero);

      // Deploy Governor
      const ImpactGovernor = await ethers.getContractFactory("ImpactGovernor");
      governor = await ImpactGovernor.deploy(
        impactToken.address,
        timelock.address,
        await admin.getAddress()
      );
      await governor.deployed();
      expect(governor.address).to.not.equal(ethers.constants.AddressZero);

      // Deploy Router
      const Router = await ethers.getContractFactory("Router");
      router = await Router.deploy(await admin.getAddress());
      await router.deployed();
      expect(router.address).to.not.equal(ethers.constants.AddressZero);
    });

    it("Should deploy all module contracts", async function () {
      // Deploy NGORegistry
      const NGORegistry = await ethers.getContractFactory("NGORegistry");
      ngoRegistry = await upgrades.deployProxy(
        NGORegistry,
        [await admin.getAddress()],
        { initializer: "initialize", kind: "uups" }
      );
      await ngoRegistry.deployed();
      expect(ngoRegistry.address).to.not.equal(ethers.constants.AddressZero);

      // Deploy DonationManager
      const DonationManager = await ethers.getContractFactory("DonationManager");
      donationManager = await upgrades.deployProxy(
        DonationManager,
        [await admin.getAddress()],
        { initializer: "initialize", kind: "uups" }
      );
      await donationManager.deployed();
      expect(donationManager.address).to.not.equal(ethers.constants.AddressZero);

      // Deploy MilestoneManager
      const MilestoneManager = await ethers.getContractFactory("MilestoneManager");
      milestoneManager = await upgrades.deployProxy(
        MilestoneManager,
        [await admin.getAddress()],
        { initializer: "initialize", kind: "uups" }
      );
      await milestoneManager.deployed();
      expect(milestoneManager.address).to.not.equal(ethers.constants.AddressZero);

      // Deploy StartupRegistry
      const StartupRegistry = await ethers.getContractFactory("StartupRegistry");
      startupRegistry = await upgrades.deployProxy(
        StartupRegistry,
        [await admin.getAddress()],
        { initializer: "initialize", kind: "uups" }
      );
      await startupRegistry.deployed();
      expect(startupRegistry.address).to.not.equal(ethers.constants.AddressZero);

      // Deploy EquityAllocator
      const EquityAllocator = await ethers.getContractFactory("EquityAllocator");
      equityAllocator = await upgrades.deployProxy(
        EquityAllocator,
        [await admin.getAddress()],
        { initializer: "initialize", kind: "uups" }
      );
      await equityAllocator.deployed();
      expect(equityAllocator.address).to.not.equal(ethers.constants.AddressZero);

      // Deploy CSRManager
      const CSRManager = await ethers.getContractFactory("CSRManager");
      csrManager = await upgrades.deployProxy(
        CSRManager,
        [await admin.getAddress()],
        { initializer: "initialize", kind: "uups" }
      );
      await csrManager.deployed();
      expect(csrManager.address).to.not.equal(ethers.constants.AddressZero);

      // Deploy QAMemory
      const QAMemory = await ethers.getContractFactory("QAMemory");
      qaMemory = await upgrades.deployProxy(
        QAMemory,
        [await admin.getAddress()],
        { initializer: "initialize", kind: "uups" }
      );
      await qaMemory.deployed();
      expect(qaMemory.address).to.not.equal(ethers.constants.AddressZero);

      // Deploy FeeManager
      const FeeManager = await ethers.getContractFactory("FeeManager");
      feeManager = await upgrades.deployProxy(
        FeeManager,
        [await admin.getAddress()],
        { initializer: "initialize", kind: "uups" }
      );
      await feeManager.deployed();
      expect(feeManager.address).to.not.equal(ethers.constants.AddressZero);
    });

    it("Should register modules in router", async function () {
      await router.updateModule("NGORegistry", ngoRegistry.address);
      await router.updateModule("DonationManager", donationManager.address);
      await router.updateModule("MilestoneManager", milestoneManager.address);
      await router.updateModule("StartupRegistry", startupRegistry.address);
      await router.updateModule("EquityAllocator", equityAllocator.address);
      await router.updateModule("CSRManager", csrManager.address);
      await router.updateModule("QAMemory", qaMemory.address);
      await router.updateModule("FeeManager", feeManager.address);

      const [names, addresses] = await router.getAllModules();
      expect(names.length).to.equal(8);
      expect(addresses.length).to.equal(8);
    });
  });

  describe("Basic Functionality", function () {
    it("Should register an NGO", async function () {
      await ngoRegistry.connect(ngo).registerNGO(
        "QmTestNGOProfile123",
        await ngo.getAddress()
      );

      const ngoProfile = await ngoRegistry.getNGOProfile(1);
      expect(ngoProfile.id).to.equal(1);
      expect(ngoProfile.ngoAddress).to.equal(await ngo.getAddress());
    });

    it("Should create a donation", async function () {
      await donationManager.connect(user1).donate(1, "Test donation", {
        value: ethers.utils.parseEther("1")
      });

      const donationBalance = await donationManager.getAvailableBalance(1);
      expect(donationBalance).to.be.gt(0);
    });

    it("Should create a milestone", async function () {
      await milestoneManager.createMilestone(
        1, // NGO ID
        "QmTestGoal123",
        ethers.utils.parseEther("0.5"),
        Math.floor(Date.now() / 1000) + 86400, // 1 day from now
        await admin.getAddress(),
        1
      );

      const milestone = await milestoneManager.getMilestone(1);
      expect(milestone.id).to.equal(1);
      expect(milestone.parentId).to.equal(1);
    });

    it("Should register a startup", async function () {
      await startupRegistry.connect(user1).registerStartup(
        await user1.getAddress(),
        "QmTestValuation123",
        ethers.constants.AddressZero, // No equity token yet
        ethers.utils.parseEther("100")
      );

      const startup = await startupRegistry.getStartup(1);
      expect(startup.id).to.equal(1);
      expect(startup.founder).to.equal(await user1.getAddress());
    });

    it("Should store QA data", async function () {
      await qaMemory.storeQA(
        "hash123",
        "QmTestCID123",
        "en"
      );

      const qaData = await qaMemory.getQAData(1);
      expect(qaData.id).to.equal(1);
      expect(qaData.language).to.equal("en");
    });
  });

  describe("Governance", function () {
    it("Should have correct governance setup", async function () {
      expect(await impactToken.symbol()).to.equal("IMPACT");
      expect(await governor.token()).to.equal(impactToken.address);
      expect(await governor.timelock()).to.equal(timelock.address);
    });

    it("Should delegate voting power", async function () {
      await impactToken.delegate(await admin.getAddress());
      const votes = await impactToken.getVotes(await admin.getAddress());
      expect(votes).to.be.gt(0);
    });
  });
}); 