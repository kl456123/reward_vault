import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const { chainId } = await hre.ethers.provider.getNetwork();

  const rewardVault = await hre.ethers.getContractAt(
    "RewardVault",
    "0x5F8473c993B68df62780532D6477AC3D98Db2548"
  );
  const signer = "0xda942bcc2463297ea463774739a4008d1c98a436";
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
