import { locationRepository } from "../repositories/location.repository.js";

class LocationService {
  async getByCity(city: string, state?: string) {
    if (!city?.trim()) {
      throw new Error("City is required.");
    }

    return locationRepository.findByCity(city, state);
  }

  async getByState(state: string) {
    if (!state?.trim()) {
      throw new Error("State is required.");
    }

    return locationRepository.findByState(state);
  }

  async getStates() {
    return locationRepository.findStates();
  }

  async search(query: string) {
    if (!query?.trim()) {
      throw new Error("Search query is required.");
    }

    return locationRepository.search(query);
  }
}

export const locationService = new LocationService();
