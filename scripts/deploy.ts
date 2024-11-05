import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const rewardVault = await (
    await hre.ethers.getContractFactory("RewardVault")
  ).deploy();
  await rewardVault.waitForDeployment();

  const initData = rewardVault.interface.encodeFunctionData("initialize", [
    deployer.address,
  ]);

  const proxy = await (
    await hre.ethers.getContractFactory("TransparentUpgradeableProxy")
  ).deploy(rewardVault, deployer, initData);
  await proxy.waitForDeployment();

  // verify
  await hre.run("verify:verify", {
    address: await rewardVault.getAddress(),
  });

  // TODO(get proxy admin contract address)
  // await hre.run("verify:verify", {
  // address: proxyAdmin,
  // constructorArguments: [deployer.address],
  // });

  await hre.run("verify:verify", {
    address: await proxy.getAddress(),
    constructorArguments: [
      await rewardVault.getAddress(),
      deployer.address,
      initData,
    ],
  });
}

main();
