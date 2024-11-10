import { convertBytes } from '../../src/utils/sizeConverter.js';

describe('SizeConverter', () => {

  test.each([
    [1024, 'KB', 1.0],
    [1024 * 1024, 'MB', 1.0],
    [1024 * 1024 * 1024, 'GB', 1.0],
    [1024 * 1024 * 1024 * 1024, 'TB', 1.0],
    [2048, 'KB', 2.0],
    [2048 * 1024, 'MB', 2.0],
    [1500, 'KB', 1.5],
    [1500 * 1024, 'MB', 1.5],
    [100, 'B', 100],
  ])('converts %i bytes to %s correctly', (bytes, unit, expected) => {
    expect(convertBytes(bytes, unit)).toBe(expected);
  });

  test('rounds to one decimal place', () => {
    const result = convertBytes(1234, 'KB');
    expect(result).toBe(1.2);
  });

  test('handles large numbers correctly', () => {
    const largeBytes = 5 * 1024 * 1024 * 1024 * 1024;
    expect(convertBytes(largeBytes, 'TB')).toBe(5.0);
  });

  test('handles small numbers correctly', () => {
    const smallBytes = 0.52 * 1024;
    expect(convertBytes(smallBytes, 'KB')).toBe(0.5);
  });

  test('returns original bytes for invalid unit', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const bytes = 1024;
    const result = convertBytes(bytes, 'InvalidUnit');
    
    expect(result).toBe(bytes);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Invalid storage unit: InvalidUnit. Defaulting to bytes.'
    );
    
    consoleSpy.mockRestore();
  });

  test('is case sensitive for units', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const bytes = 1024;
    
    expect(convertBytes(bytes, 'kb')).toBe(bytes);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Invalid storage unit: kb. Defaulting to bytes.'
    );
    
    consoleSpy.mockRestore();
  });

  test('handles zero bytes correctly', () => {
    expect(convertBytes(0, 'MB')).toBe(0);
    expect(convertBytes(0, 'GB')).toBe(0);
    expect(convertBytes(0, 'TB')).toBe(0);
  });

  test('handles negative bytes correctly', () => {
    expect(convertBytes(-1024, 'KB')).toBe(-1.0);
    expect(convertBytes(-2048, 'KB')).toBe(-2.0);
  });
});
