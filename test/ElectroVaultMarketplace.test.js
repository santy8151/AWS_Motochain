const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ElectroVaultMarketplace", function () {
  let marketplace;
  let owner, seller, buyer, other;

  const SAMPLE_VEHICLE = {
    brand: "Tesla",
    model: "Model 3",
    year: 2023,
    vin: "5YJ3E1EA7NF123456",
    metadataURI: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    priceWei: ethers.parseEther("1.5"),
    vehicleType: 0, // AUTOMOBILE
    mileage: 15000,
    batteryHealth: "95%",
  };

  beforeEach(async function () {
    [owner, seller, buyer, other] = await ethers.getSigners();

    const ElectroVault = await ethers.getContractFactory("ElectroVaultMarketplace");
    marketplace = await ElectroVault.deploy();
    await marketplace.waitForDeployment();
  });

  // ── DEPLOYMENT ─────────────────────────────────
  describe("Despliegue", function () {
    it("Debe establecer el owner correcto", async function () {
      expect(await marketplace.owner()).to.equal(owner.address);
    });

    it("Fee inicial debe ser 2.5%", async function () {
      expect(await marketplace.platformFeePercent()).to.equal(250);
    });

    it("Balance de escrow inicial debe ser 0", async function () {
      expect(await marketplace.escrowBalance()).to.equal(0);
    });
  });

  // ── LISTING ────────────────────────────────────
  describe("Publicar vehículos", function () {
    it("Debe publicar un vehículo correctamente", async function () {
      const tx = await marketplace.connect(seller).listVehicle(
        ...Object.values(SAMPLE_VEHICLE)
      );
      await tx.wait();

      const vehicle = await marketplace.getVehicle(1);
      expect(vehicle.brand).to.equal("Tesla");
      expect(vehicle.seller).to.equal(seller.address);
      expect(vehicle.status).to.equal(0); // AVAILABLE
    });

    it("Debe emitir evento VehicleListed", async function () {
      await expect(
        marketplace.connect(seller).listVehicle(...Object.values(SAMPLE_VEHICLE))
      )
        .to.emit(marketplace, "VehicleListed")
        .withArgs(1, seller.address, 0, SAMPLE_VEHICLE.priceWei, "Tesla", "Model 3");
    });

    it("Debe fallar si el precio es 0", async function () {
      const invalidVehicle = { ...SAMPLE_VEHICLE, priceWei: 0 };
      await expect(
        marketplace.connect(seller).listVehicle(...Object.values(invalidVehicle))
      ).to.be.revertedWith("Precio debe ser mayor a 0");
    });

    it("Debe incrementar el contador de vehículos", async function () {
      await marketplace.connect(seller).listVehicle(...Object.values(SAMPLE_VEHICLE));
      await marketplace.connect(seller).listVehicle(
        "BMW", "CE 04", 2023, "WBS1J5103MCF12345",
        "ipfs://Qm2", ethers.parseEther("0.8"), 1, 500, "98%"
      );
      expect(await marketplace.getTotalVehicles()).to.equal(2);
    });
  });

  // ── PURCHASING ─────────────────────────────────
  describe("Compra de vehículos", function () {
    beforeEach(async function () {
      await marketplace.connect(seller).listVehicle(...Object.values(SAMPLE_VEHICLE));
    });

    it("Debe completar una compra exitosamente", async function () {
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

      await marketplace.connect(buyer).purchaseVehicle(1, {
        value: SAMPLE_VEHICLE.priceWei,
      });

      const vehicle = await marketplace.getVehicle(1);
      expect(vehicle.status).to.equal(2); // SOLD

      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      expect(sellerBalanceAfter).to.be.gt(sellerBalanceBefore);
    });

    it("Debe emitir evento VehiclePurchased", async function () {
      await expect(
        marketplace.connect(buyer).purchaseVehicle(1, { value: SAMPLE_VEHICLE.priceWei })
      )
        .to.emit(marketplace, "VehiclePurchased")
        .withArgs(1, 1, buyer.address, seller.address, SAMPLE_VEHICLE.priceWei);
    });

    it("Debe fallar si el pago es insuficiente", async function () {
      await expect(
        marketplace.connect(buyer).purchaseVehicle(1, {
          value: ethers.parseEther("0.5"),
        })
      ).to.be.revertedWith("ETH insuficiente");
    });

    it("El vendedor no puede comprar su propio vehículo", async function () {
      await expect(
        marketplace.connect(seller).purchaseVehicle(1, {
          value: SAMPLE_VEHICLE.priceWei,
        })
      ).to.be.revertedWith("El vendedor no puede comprar su propio vehiculo");
    });

    it("Debe acumular fees de plataforma en escrow", async function () {
      await marketplace.connect(buyer).purchaseVehicle(1, {
        value: SAMPLE_VEHICLE.priceWei,
      });

      const expectedFee = (SAMPLE_VEHICLE.priceWei * 250n) / 10000n;
      expect(await marketplace.escrowBalance()).to.equal(expectedFee);
    });

    it("Debe devolver el exceso de ETH", async function () {
      const excess = ethers.parseEther("0.5");
      const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

      const tx = await marketplace.connect(buyer).purchaseVehicle(1, {
        value: SAMPLE_VEHICLE.priceWei + excess,
      });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
      const spent = buyerBalanceBefore - buyerBalanceAfter - gasUsed;

      expect(spent).to.be.closeTo(SAMPLE_VEHICLE.priceWei, ethers.parseEther("0.001"));
    });
  });

  // ── ADMIN ──────────────────────────────────────
  describe("Funciones de administración", function () {
    it("Owner puede verificar un vehículo", async function () {
      await marketplace.connect(seller).listVehicle(...Object.values(SAMPLE_VEHICLE));
      await marketplace.connect(owner).verifyVehicle(1);
      const vehicle = await marketplace.getVehicle(1);
      expect(vehicle.verified).to.be.true;
    });

    it("No-owner no puede verificar vehículos", async function () {
      await marketplace.connect(seller).listVehicle(...Object.values(SAMPLE_VEHICLE));
      await expect(marketplace.connect(buyer).verifyVehicle(1)).to.be.reverted;
    });

    it("Owner puede cambiar el fee de plataforma", async function () {
      await marketplace.connect(owner).setPlatformFee(300); // 3%
      expect(await marketplace.platformFeePercent()).to.equal(300);
    });

    it("Fee no puede superar el 10%", async function () {
      await expect(
        marketplace.connect(owner).setPlatformFee(1001)
      ).to.be.revertedWith("Fee excede el maximo permitido");
    });

    it("Owner puede retirar fees acumulados", async function () {
      await marketplace.connect(seller).listVehicle(...Object.values(SAMPLE_VEHICLE));
      await marketplace.connect(buyer).purchaseVehicle(1, {
        value: SAMPLE_VEHICLE.priceWei,
      });

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      await marketplace.connect(owner).withdrawFees();
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
      expect(await marketplace.escrowBalance()).to.equal(0);
    });
  });

  // ── REMOVE LISTING ─────────────────────────────
  describe("Retirar listados", function () {
    beforeEach(async function () {
      await marketplace.connect(seller).listVehicle(...Object.values(SAMPLE_VEHICLE));
    });

    it("Vendedor puede retirar su vehículo", async function () {
      await marketplace.connect(seller).removeVehicle(1);
      const vehicle = await marketplace.getVehicle(1);
      expect(vehicle.status).to.equal(3); // REMOVED
    });

    it("Otro usuario no puede retirar un vehículo ajeno", async function () {
      await expect(
        marketplace.connect(buyer).removeVehicle(1)
      ).to.be.revertedWith("Solo el vendedor puede realizar esta accion");
    });
  });
});
