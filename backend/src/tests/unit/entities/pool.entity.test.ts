import { Pool } from '../../../domain/entities/pool.entity';

describe('Pool Entity', () => {
  const validPoolProps = {
    address: 'PoolAddress123',
    name: 'SOL/USDC Pool',
    tokenAAddress: 'TokenA123',
    tokenBAddress: 'TokenB456',
    liquidity: 1000,
    volume24h: 50000,
    fees24h: 150,
    apr: 0.25,
    tvl: 2000000,
    price: 100,
    priceChange24h: 0.05,
    isActive: true,
  };

  describe('create', () => {
    it('should create a pool with valid properties', () => {
      // Act
      const pool = Pool.create(validPoolProps);

      // Assert
      expect(pool.address).toBe('PoolAddress123');
      expect(pool.name).toBe('SOL/USDC Pool');
      expect(pool.tokenAAddress).toBe('TokenA123');
      expect(pool.tokenBAddress).toBe('TokenB456');
      expect(pool.liquidity).toBe(1000);
      expect(pool.volume24h).toBe(50000);
      expect(pool.fees24h).toBe(150);
      expect(pool.apr).toBe(0.25);
      expect(pool.tvl).toBe(2000000);
      expect(pool.price).toBe(100);
      expect(pool.priceChange24h).toBe(0.05);
      expect(pool.isActive).toBe(true);
      expect(pool.createdAt).toBeInstanceOf(Date);
      expect(pool.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate an ID when not provided', () => {
      // Act
      const pool = Pool.create(validPoolProps);

      // Assert
      expect(pool.id).toBeDefined();
      expect(typeof pool.id).toBe('string');
      expect(pool.id.length).toBeGreaterThan(0);
    });

    it('should use provided ID when given', () => {
      // Arrange
      const propsWithId = { ...validPoolProps, id: 'custom-id-123' };

      // Act
      const pool = Pool.create(propsWithId);

      // Assert
      expect(pool.id).toBe('custom-id-123');
    });

    it('should set creation and update timestamps', () => {
      // Arrange
      const now = new Date();

      // Act
      const pool = Pool.create(validPoolProps);

      // Assert
      expect(pool.createdAt.getTime()).toBeGreaterThanOrEqual(now.getTime() - 1000);
      expect(pool.updatedAt.getTime()).toBeGreaterThanOrEqual(now.getTime() - 1000);
    });
  });

  describe('updateMetrics', () => {
    it('should update pool metrics and timestamp', () => {
      // Arrange
      const pool = Pool.create(validPoolProps);
      const originalUpdatedAt = pool.updatedAt;

      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        // Act
        pool.updateMetrics(2000, 75000, 200, 0.35, 3000000, 110, 0.1);

        // Assert
        expect(pool.liquidity).toBe(2000);
        expect(pool.volume24h).toBe(75000);
        expect(pool.fees24h).toBe(200);
        expect(pool.apr).toBe(0.35);
        expect(pool.tvl).toBe(3000000);
        expect(pool.price).toBe(110);
        expect(pool.priceChange24h).toBe(0.1);
        expect(pool.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });
  });

  describe('activate', () => {
    it('should activate the pool and update timestamp', () => {
      // Arrange
      const pool = Pool.create({ ...validPoolProps, isActive: false });
      const originalUpdatedAt = pool.updatedAt;

      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        // Act
        pool.activate();

        // Assert
        expect(pool.isActive).toBe(true);
        expect(pool.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });
  });

  describe('deactivate', () => {
    it('should deactivate the pool and update timestamp', () => {
      // Arrange
      const pool = Pool.create(validPoolProps);
      const originalUpdatedAt = pool.updatedAt;

      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        // Act
        pool.deactivate();

        // Assert
        expect(pool.isActive).toBe(false);
        expect(pool.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });
  });

  describe('business methods', () => {
    it('should identify high volume pools', () => {
      // Arrange
      const highVolumePool = Pool.create({
        ...validPoolProps,
        volume24h: 1500000, // > $1M
      });
      const lowVolumePool = Pool.create({
        ...validPoolProps,
        volume24h: 500000, // < $1M
      });

      // Assert
      expect(highVolumePool.isHighVolume()).toBe(true);
      expect(lowVolumePool.isHighVolume()).toBe(false);
    });

    it('should identify high APR pools', () => {
      // Arrange
      const highAPRPool = Pool.create({
        ...validPoolProps,
        apr: 0.75, // 75% > 50%
      });
      const lowAPRPool = Pool.create({
        ...validPoolProps,
        apr: 0.25, // 25% < 50%
      });

      // Assert
      expect(highAPRPool.isHighAPR()).toBe(true);
      expect(lowAPRPool.isHighAPR()).toBe(false);
    });

    it('should identify profitable pools', () => {
      // Arrange
      const profitablePool = Pool.create({
        ...validPoolProps,
        fees24h: 100,
        apr: 0.15,
      });
      const unprofitablePool = Pool.create({
        ...validPoolProps,
        fees24h: 0,
        apr: 0,
      });

      // Assert
      expect(profitablePool.isProfitable()).toBe(true);
      expect(unprofitablePool.isProfitable()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return a JSON representation of the pool', () => {
      // Arrange
      const pool = Pool.create(validPoolProps);

      // Act
      const json = pool.toJSON();

      // Assert
      expect(json).toEqual({
        id: pool.id,
        address: 'PoolAddress123',
        name: 'SOL/USDC Pool',
        tokenAAddress: 'TokenA123',
        tokenBAddress: 'TokenB456',
        liquidity: 1000,
        volume24h: 50000,
        fees24h: 150,
        apr: 0.25,
        tvl: 2000000,
        price: 100,
        priceChange24h: 0.05,
        isActive: true,
        createdAt: pool.createdAt,
        updatedAt: pool.updatedAt,
      });
    });
  });
});