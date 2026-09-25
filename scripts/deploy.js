const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Desplegando ElectroVault Marketplace en Ethereum...\n");

  // Obtener cuentas disponibles
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Cuenta del deployer: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  // Desplegar el contrato
  console.log("📦 Compilando y desplegando contrato...");
  const ElectroVault = await ethers.getContractFactory("ElectroVaultMarketplace");
  const marketplace = await ElectroVault.deploy();

  await marketplace.waitForDeployment();
  const contractAddress = await marketplace.getAddress();

  console.log(`✅ Contrato desplegado exitosamente!`);
  console.log(`📍 Dirección del contrato: ${contractAddress}`);
  console.log(`🌐 Red: ${(await ethers.provider.getNetwork()).name}`);

  // Verificar configuración inicial
  const feePercent = await marketplace.platformFeePercent();
  console.log(`\n⚙️  Configuración inicial:`);
  console.log(`   Fee de plataforma: ${feePercent / 100}%`);
  console.log(`   Owner: ${await marketplace.owner()}`);

  // Guardar la dirección del contrato en un archivo JSON
  const fs = require("fs");
  const deployInfo = {
    network: (await ethers.provider.getNetwork()).name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    abi: JSON.parse(
      fs.readFileSync("./artifacts/contracts/ElectroVaultMarketplace.sol/ElectroVaultMarketplace.json")
    ).abi,
  };

  fs.writeFileSync(
    "./frontend/src/contract-info.json",
    JSON.stringify(deployInfo, null, 2)
  );

  console.log(`\n📄 ABI y dirección guardados en frontend/src/contract-info.json`);
  console.log(`\n🎉 ¡Despliegue completado! ElectroVault está listo.`);

  // Instrucciones post-despliegue
  if (deployInfo.network !== "localhost" && deployInfo.network !== "hardhat") {
    console.log(`\n🔍 Verifica el contrato en Etherscan:`);
    console.log(`   https://etherscan.io/address/${contractAddress}`);
    console.log(`\n   Para verificar el código fuente:`);
    console.log(`   npx hardhat verify --network ${deployInfo.network} ${contractAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en el despliegue:", error);
    process.exit(1);
  });
