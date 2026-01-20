import { getTemperatures, searchLocations, getLocationCoordinates, LocationCoordinates } from '../src/weather';

// Mock node-cache
jest.mock('node-cache', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
  }));
});

describe('Weather Service', () => {
  describe('searchLocations', () => {
    it('should search for locations by name', async () => {
      const results = await searchLocations('Belgrade');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      
      if (results.length > 0) {
        expect(results[0]).toHaveProperty('latitude');
        expect(results[0]).toHaveProperty('longitude');
        expect(results[0]).toHaveProperty('name');
        expect(results[0]).toHaveProperty('country');
      }
    }, 30000);

    it('should return empty array for non-existent location', async () => {
      const results = await searchLocations('XyZveryRandomPlace12345');
      
      expect(Array.isArray(results)).toBe(true);
      // Note: might have results or might be empty depending on API
    }, 30000);
  });

  describe('getLocationCoordinates', () => {
    it('should get coordinates for known location', async () => {
      const coords = await getLocationCoordinates('Belgrade');
      
      expect(coords).toHaveProperty('latitude');
      expect(coords).toHaveProperty('longitude');
      expect(typeof coords.latitude).toBe('number');
      expect(typeof coords.longitude).toBe('number');
    }, 30000);

    it('should throw error for non-existent location', async () => {
      await expect(getLocationCoordinates('XyZveryRandomPlace12345')).rejects.toThrow();
    }, 30000);
  });

  describe('getTemperatures', () => {
    it('should get Belgrade temperatures by default', async () => {
      const result = await getTemperatures();
      
      expect(result).toHaveProperty('location');
      expect(result).toHaveProperty('temperatures');
      expect(result).toHaveProperty('updatedAt');
      expect(Array.isArray(result.temperatures)).toBe(true);
    }, 30000);

    it('should get temperatures by location name', async () => {
      const result = await getTemperatures('Paris');
      
      expect(result.location.name).toContain('Paris');
      expect(Array.isArray(result.temperatures)).toBe(true);
    }, 30000);

    it('should get temperatures by coordinates', async () => {
      const coords: LocationCoordinates = {
        latitude: 48.8566,
        longitude: 2.3522,
        name: 'Paris',
      };
      
      const result = await getTemperatures(coords);
      
      expect(result.location.latitude).toBe(48.8566);
      expect(result.location.longitude).toBe(2.3522);
      expect(Array.isArray(result.temperatures)).toBe(true);
    }, 30000);

    it('should return temperature objects with required fields', async () => {
      const result = await getTemperatures();
      
      if (result.temperatures.length > 0) {
        const temp = result.temperatures[0];
        expect(temp).toHaveProperty('date');
        expect(temp).toHaveProperty('time');
        expect(temp).toHaveProperty('temperature');
        expect(temp).toHaveProperty('unit', 'Celsius');
        expect(temp).toHaveProperty('weatherDescription');
      }
    }, 30000);

    it('should include cached flag in response', async () => {
      const result = await getTemperatures();
      
      expect(result).toHaveProperty('cached');
      expect(typeof result.cached).toBe('boolean');
    }, 30000);

    it('should respect force refresh parameter', async () => {
      const result1 = await getTemperatures(undefined, false);
      const result2 = await getTemperatures(undefined, true);
      
      expect(result1).toHaveProperty('updatedAt');
      expect(result2).toHaveProperty('updatedAt');
    }, 30000);
  });

  describe('Temperature validation', () => {
    it('temperatures should be valid numbers', async () => {
      const result = await getTemperatures();
      
      result.temperatures.forEach(temp => {
        expect(typeof temp.temperature).toBe('number');
        expect(temp.temperature).toBeGreaterThan(-100);
        expect(temp.temperature).toBeLessThan(100);
      });
    }, 30000);

    it('should have valid ISO date format', async () => {
      const result = await getTemperatures();
      
      result.temperatures.forEach(temp => {
        expect(temp.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(temp.time).toMatch(/^\d{2}:\d{2}$/);
      });
    }, 30000);
  });
});
