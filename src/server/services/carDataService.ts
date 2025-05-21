import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CarData {
  make: string;
  model: string;
  year: string;
}

class CarDataService {
  private dataCache: Map<string, CarData[]> = new Map();
  private dataDir: string;

  constructor() {
    this.dataDir = path.join(__dirname, '../../../car-data');
  }

  async loadYearData(year: string): Promise<CarData[]> {
    // Check cache first
    if (this.dataCache.has(year)) {
      return this.dataCache.get(year)!;
    }

    return new Promise((resolve, reject) => {
      const cars: CarData[] = [];
      const filePath = path.join(this.dataDir, `${year}.csv`);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        reject(new Error(`No data available for year ${year}`));
        return;
      }

      fs.createReadStream(filePath)
        .pipe(parse({ columns: true, skip_empty_lines: true }))
        .on('data', (row) => {
          cars.push({
            make: row.make,
            model: row.model,
            year
          });
        })
        .on('end', () => {
          this.dataCache.set(year, cars);
          resolve(cars);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async getMakes(year: string): Promise<string[]> {
    try {
      const cars = await this.loadYearData(year);
      const makes = [...new Set(cars.map(car => car.make))].sort();
      return makes;
    } catch (error) {
      throw error;
    }
  }

  async getModels(year: string, make: string): Promise<string[]> {
    try {
      const cars = await this.loadYearData(year);
      const models = [...new Set(
        cars
          .filter(car => car.make.toLowerCase() === make.toLowerCase())
          .map(car => car.model)
      )].sort();
      return models;
    } catch (error) {
      throw error;
    }
  }

  clearCache() {
    this.dataCache.clear();
  }
}

export const carDataService = new CarDataService(); 