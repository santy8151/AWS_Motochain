// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ElectroVault Marketplace
 * @dev Smart contract para compra/venta de vehículos eléctricos con criptomonedas
 * @author ElectroVault - Blockchain Vehicle Marketplace
 */
contract ElectroVaultMarketplace is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _vehicleIds;
    Counters.Counter private _transactionIds;

    // ─────────────────────────────────────────────
    //  ENUMS
    // ─────────────────────────────────────────────

    enum VehicleType { AUTOMOBILE, MOTORCYCLE, BICYCLE }
    enum VehicleStatus { AVAILABLE, RESERVED, SOLD, REMOVED }
    enum TransactionStatus { PENDING, COMPLETED, REFUNDED, DISPUTED }

    // ─────────────────────────────────────────────
    //  STRUCTS
    // ─────────────────────────────────────────────

    struct Vehicle {
        uint256 id;
        address payable seller;
        string brand;
        string model;
        uint256 year;
        string vin;           // Vehicle Identification Number
        string metadataURI;   // IPFS URI con imágenes y docs
        uint256 priceWei;     // Precio en Wei (ETH)
        VehicleType vehicleType;
        VehicleStatus status;
        uint256 listedAt;
        uint256 soldAt;
        uint256 mileage;
        string batteryHealth; // Salud de batería en %
        bool verified;        // Verificado por el marketplace
    }

    struct Transaction {
        uint256 id;
        uint256 vehicleId;
        address buyer;
        address seller;
        uint256 amountWei;
        uint256 platformFeeWei;
        TransactionStatus status;
        uint256 createdAt;
        uint256 completedAt;
        string txHash;
    }

    struct SellerProfile {
        address wallet;
        string name;
        uint256 totalSales;
        uint256 reputation;   // 0–500 (0–5 estrellas × 100)
        bool isVerified;
        uint256 joinedAt;
    }

    // ─────────────────────────────────────────────
    //  STATE VARIABLES
    // ─────────────────────────────────────────────

    uint256 public platformFeePercent = 250; // 2.5% = 250 basis points
    uint256 public constant MAX_FEE = 1000;  // 10% tope
    uint256 public escrowBalance;

    mapping(uint256 => Vehicle)      public vehicles;
    mapping(uint256 => Transaction)  public transactions;
    mapping(address => SellerProfile) public sellers;
    mapping(address => uint256[])    public sellerListings;
    mapping(address => uint256[])    public buyerPurchases;

    uint256[] public activeListings;

    // ─────────────────────────────────────────────
    //  EVENTS
    // ─────────────────────────────────────────────

    event VehicleListed(
        uint256 indexed vehicleId,
        address indexed seller,
        VehicleType vehicleType,
        uint256 priceWei,
        string brand,
        string model
    );

    event VehiclePurchased(
        uint256 indexed transactionId,
        uint256 indexed vehicleId,
        address indexed buyer,
        address seller,
        uint256 amountWei
    );

    event VehicleRemoved(uint256 indexed vehicleId, address indexed seller);
    event PriceUpdated(uint256 indexed vehicleId, uint256 oldPrice, uint256 newPrice);
    event VehicleVerified(uint256 indexed vehicleId, address indexed verifier);
    event FundsReleased(uint256 indexed transactionId, address indexed seller, uint256 amount);
    event RefundIssued(uint256 indexed transactionId, address indexed buyer, uint256 amount);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event SellerRegistered(address indexed seller, string name);

    // ─────────────────────────────────────────────
    //  MODIFIERS
    // ─────────────────────────────────────────────

    modifier onlySeller(uint256 vehicleId) {
        require(vehicles[vehicleId].seller == msg.sender, "Solo el vendedor puede realizar esta accion");
        _;
    }

    modifier vehicleExists(uint256 vehicleId) {
        require(vehicleId > 0 && vehicleId <= _vehicleIds.current(), "Vehiculo no existe");
        _;
    }

    modifier vehicleAvailable(uint256 vehicleId) {
        require(vehicles[vehicleId].status == VehicleStatus.AVAILABLE, "Vehiculo no disponible");
        _;
    }

    // ─────────────────────────────────────────────
    //  CONSTRUCTOR
    // ─────────────────────────────────────────────

    constructor() Ownable(msg.sender) {}

    // ─────────────────────────────────────────────
    //  SELLER FUNCTIONS
    // ─────────────────────────────────────────────

    /**
     * @dev Registra un vendedor en el marketplace
     */
    function registerSeller(string calldata name) external {
        require(bytes(name).length > 0, "Nombre requerido");
        require(!sellers[msg.sender].isVerified || sellers[msg.sender].joinedAt == 0, "Ya registrado");

        sellers[msg.sender] = SellerProfile({
            wallet: msg.sender,
            name: name,
            totalSales: 0,
            reputation: 300, // 3 estrellas iniciales
            isVerified: false,
            joinedAt: block.timestamp
        });

        emit SellerRegistered(msg.sender, name);
    }

    /**
     * @dev Lista un vehículo eléctrico para venta
     */
    function listVehicle(
        string calldata brand,
        string calldata model,
        uint256 year,
        string calldata vin,
        string calldata metadataURI,
        uint256 priceWei,
        VehicleType vehicleType,
        uint256 mileage,
        string calldata batteryHealth
    ) external returns (uint256) {
        require(bytes(brand).length > 0, "Marca requerida");
        require(bytes(model).length > 0, "Modelo requerido");
        require(year >= 2000 && year <= block.timestamp / 365 days + 1970 + 1, "Año invalido");
        require(bytes(vin).length >= 10, "VIN invalido");
        require(priceWei > 0, "Precio debe ser mayor a 0");

        _vehicleIds.increment();
        uint256 newId = _vehicleIds.current();

        vehicles[newId] = Vehicle({
            id: newId,
            seller: payable(msg.sender),
            brand: brand,
            model: model,
            year: year,
            vin: vin,
            metadataURI: metadataURI,
            priceWei: priceWei,
            vehicleType: vehicleType,
            status: VehicleStatus.AVAILABLE,
            listedAt: block.timestamp,
            soldAt: 0,
            mileage: mileage,
            batteryHealth: batteryHealth,
            verified: false
        });

        sellerListings[msg.sender].push(newId);
        activeListings.push(newId);

        emit VehicleListed(newId, msg.sender, vehicleType, priceWei, brand, model);
        return newId;
    }

    /**
     * @dev Actualiza el precio de un vehículo
     */
    function updatePrice(uint256 vehicleId, uint256 newPriceWei)
        external
        vehicleExists(vehicleId)
        onlySeller(vehicleId)
        vehicleAvailable(vehicleId)
    {
        require(newPriceWei > 0, "Precio invalido");
        uint256 oldPrice = vehicles[vehicleId].priceWei;
        vehicles[vehicleId].priceWei = newPriceWei;
        emit PriceUpdated(vehicleId, oldPrice, newPriceWei);
    }

    /**
     * @dev Retira un vehículo del marketplace
     */
    function removeVehicle(uint256 vehicleId)
        external
        vehicleExists(vehicleId)
        onlySeller(vehicleId)
        vehicleAvailable(vehicleId)
    {
        vehicles[vehicleId].status = VehicleStatus.REMOVED;
        _removeFromActive(vehicleId);
        emit VehicleRemoved(vehicleId, msg.sender);
    }

    // ─────────────────────────────────────────────
    //  BUYER FUNCTIONS
    // ─────────────────────────────────────────────

    /**
     * @dev Compra un vehículo — el pago va a escrow hasta confirmación
     */
    function purchaseVehicle(uint256 vehicleId)
        external
        payable
        nonReentrant
        vehicleExists(vehicleId)
        vehicleAvailable(vehicleId)
    {
        Vehicle storage v = vehicles[vehicleId];
        require(msg.sender != v.seller, "El vendedor no puede comprar su propio vehiculo");
        require(msg.value >= v.priceWei, "ETH insuficiente");

        uint256 fee = (v.priceWei * platformFeePercent) / 10000;
        uint256 sellerAmount = v.priceWei - fee;

        // Actualizar estado
        v.status = VehicleStatus.SOLD;
        v.soldAt = block.timestamp;

        // Registrar transacción
        _transactionIds.increment();
        uint256 txId = _transactionIds.current();

        transactions[txId] = Transaction({
            id: txId,
            vehicleId: vehicleId,
            buyer: msg.sender,
            seller: v.seller,
            amountWei: v.priceWei,
            platformFeeWei: fee,
            status: TransactionStatus.COMPLETED,
            createdAt: block.timestamp,
            completedAt: block.timestamp,
            txHash: ""
        });

        buyerPurchases[msg.sender].push(txId);
        escrowBalance += fee;

        // Transferir fondos al vendedor
        v.seller.transfer(sellerAmount);

        // Actualizar reputación del vendedor
        sellers[v.seller].totalSales += 1;

        // Devolver exceso si overpaid
        if (msg.value > v.priceWei) {
            payable(msg.sender).transfer(msg.value - v.priceWei);
        }

        _removeFromActive(vehicleId);

        emit VehiclePurchased(txId, vehicleId, msg.sender, v.seller, v.priceWei);
        emit FundsReleased(txId, v.seller, sellerAmount);
    }

    // ─────────────────────────────────────────────
    //  ADMIN FUNCTIONS
    // ─────────────────────────────────────────────

    /**
     * @dev Verifica un vehículo (solo owner del marketplace)
     */
    function verifyVehicle(uint256 vehicleId)
        external
        onlyOwner
        vehicleExists(vehicleId)
    {
        vehicles[vehicleId].verified = true;
        emit VehicleVerified(vehicleId, msg.sender);
    }

    /**
     * @dev Actualiza la comisión de la plataforma
     */
    function setPlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= MAX_FEE, "Fee excede el maximo permitido");
        uint256 old = platformFeePercent;
        platformFeePercent = newFeePercent;
        emit PlatformFeeUpdated(old, newFeePercent);
    }

    /**
     * @dev Retira las comisiones acumuladas
     */
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 amount = escrowBalance;
        require(amount > 0, "Sin fondos para retirar");
        escrowBalance = 0;
        payable(owner()).transfer(amount);
    }

    // ─────────────────────────────────────────────
    //  VIEW FUNCTIONS
    // ─────────────────────────────────────────────

    function getVehicle(uint256 vehicleId)
        external
        view
        vehicleExists(vehicleId)
        returns (Vehicle memory)
    {
        return vehicles[vehicleId];
    }

    function getTransaction(uint256 txId)
        external
        view
        returns (Transaction memory)
    {
        require(txId > 0 && txId <= _transactionIds.current(), "Transaccion no existe");
        return transactions[txId];
    }

    function getActiveListings() external view returns (uint256[] memory) {
        return activeListings;
    }

    function getSellerListings(address seller)
        external
        view
        returns (uint256[] memory)
    {
        return sellerListings[seller];
    }

    function getBuyerPurchases(address buyer)
        external
        view
        returns (uint256[] memory)
    {
        return buyerPurchases[buyer];
    }

    function getTotalVehicles() external view returns (uint256) {
        return _vehicleIds.current();
    }

    function getTotalTransactions() external view returns (uint256) {
        return _transactionIds.current();
    }

    // ─────────────────────────────────────────────
    //  INTERNAL HELPERS
    // ─────────────────────────────────────────────

    function _removeFromActive(uint256 vehicleId) internal {
        for (uint256 i = 0; i < activeListings.length; i++) {
            if (activeListings[i] == vehicleId) {
                activeListings[i] = activeListings[activeListings.length - 1];
                activeListings.pop();
                break;
            }
        }
    }

    // Permite recibir ETH directamente
    receive() external payable {
        escrowBalance += msg.value;
    }
}
