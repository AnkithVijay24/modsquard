import { Router } from 'express';
import { carDataService } from '../../services/carDataService';

const router = Router();

// Get all makes for a specific year
router.get('/:year/makes', async (req, res) => {
  try {
    const { year } = req.params;
    const makes = await carDataService.getMakes(year);
    res.json(makes);
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'Failed to fetch makes' });
  }
});

// Get all models for a specific year and make
router.get('/:year/:make/models', async (req, res) => {
  try {
    const { year, make } = req.params;
    const models = await carDataService.getModels(year, make);
    res.json(models);
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'Failed to fetch models' });
  }
});

export default router; 