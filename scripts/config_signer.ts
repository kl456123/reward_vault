import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const { chainId } = await hre.ethers.provider.getNetwork();

  const rewardVault = await hre.ethers.getContractAt(
    "RewardVault",
    "0x15a40246c9dCdF80D5ae58c791719D68a8C5576E"
  );
  const signer = "0x7fcbd9d429932a11884cb5ce9c61055b369f56f7";
  const SIGNER_ROLE = await rewardVault.SIGNER();
  const hasRole = await rewardVault.hasRole(SIGNER_ROLE, signer);
  if (!hasRole) {
    await (await rewardVault.grantRole(SIGNER_ROLE, signer)).wait();
    console.log(`grant signer role to ${signer}`);
  } else {
    console.log(`${signer} has signer role already`);
  }
}

main();
