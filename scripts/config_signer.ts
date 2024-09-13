import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const { chainId } = await hre.ethers.provider.getNetwork();

  const rewardVault = await hre.ethers.getContractAt(
    "RewardVault",
    "0x487b9e8031055d291d51c5c83a4d0f030d47199f"
  );
  const signer = "0x7fcbd9d429932a11884cb5ce9c61055b369f56f7";
  const SIGNER_ROLE = await rewardVault.SIGNER();
  await (await rewardVault.grantRole(SIGNER_ROLE, signer)).wait();
  console.log(await rewardVault.hasRole(SIGNER_ROLE, signer));
}

main();
