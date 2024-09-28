type StorageUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB';

const units: Record<StorageUnit, number> = {
  'B': 1,
  'KB': 1024,
  'MB': 1024 * 1024,
  'GB': 1024 * 1024 * 1024,
  'TB': 1024 * 1024 * 1024 * 1024
};

export function convertBytes(bytes: number, unit: string): number {
    if (isValidStorageUnit(unit)) {
      const convertedValue = bytes / units[unit];
      return Number(convertedValue.toFixed(1));
    }
    console.warn(`Invalid storage unit: ${unit}. Defaulting to bytes.`);
    return bytes;
  }

function isValidStorageUnit(unit: string): unit is StorageUnit {
return unit in units;
}