import { LocationModel } from "../models/location.model.js";

class LocationRepository {
  async findByCity(city: string, state?: string) {
    const filter: {
      city: string;
      state?: string;
      isActive: boolean;
    } = {
      city: city.trim(),
      isActive: true,
    };

    if (state?.trim()) {
      filter.state = state.trim();
    }

    return LocationModel.find(filter).sort({
      district: 1,
      city: 1,
    });
  }

  async findByState(state: string) {
    return LocationModel.find({
      state: state.trim(),
      isActive: true,
    }).sort({
      district: 1,
      city: 1,
    });
  }

  async findStates() {
    return LocationModel.distinct("state", {
      country: "India",
      isActive: true,
    });
  }

  async search(query: string) {
    const regex = new RegExp(query.trim(), "i");

    return LocationModel.find({
      isActive: true,
      $or: [
        { state: regex },
        { district: regex },
        { city: regex },
      ],
    })
      .sort({
        state: 1,
        district: 1,
        city: 1,
      })
      .limit(50);
  }
}

export const locationRepository =
  new LocationRepository();
