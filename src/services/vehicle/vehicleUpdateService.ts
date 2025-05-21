import type { Build } from './buildService';
import { updateBuild } from './buildService';

interface VehicleUpdateData {
  title: string;
  description: string;
  year: string;
  make: string;
  model: string;
  images?: File[];
}

export const updateVehicleDetails = async (
  vehicleId: string,
  data: VehicleUpdateData,
  currentVehicle: Build
): Promise<Build> => {
  try {
    // Create an object with only the changed fields
    const changedFields: Partial<Build> & { newImages?: File[] } = {};

    // Only include fields that have changed
    if (data.title !== currentVehicle.title) {
      changedFields.title = data.title;
    }
    if (data.description !== currentVehicle.description) {
      changedFields.description = data.description;
    }
    if (data.year !== currentVehicle.carYear.toString()) {
      changedFields.carYear = parseInt(data.year);
    }
    if (data.make !== currentVehicle.carMake) {
      changedFields.carMake = data.make;
    }
    if (data.model !== currentVehicle.carModel) {
      changedFields.carModel = data.model;
    }

    // Always include images if they are provided, as they are new uploads
    if (data.images && data.images.length > 0) {
      changedFields.newImages = data.images;
    }

    // If we're only updating images, we need to include the current values
    // to prevent them from being cleared
    if (data.images && Object.keys(changedFields).length === 1) {
      changedFields.title = currentVehicle.title;
      changedFields.description = currentVehicle.description;
      changedFields.carYear = currentVehicle.carYear;
      changedFields.carMake = currentVehicle.carMake;
      changedFields.carModel = currentVehicle.carModel;
    }

    console.log('Sending update with fields:', changedFields);
    const updatedBuild = await updateBuild(vehicleId, changedFields);
    return updatedBuild;
  } catch (error) {
    console.error('Error in updateVehicleDetails:', error);
    throw new Error('Failed to update vehicle details');
  }
}; 