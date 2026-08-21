import { LocationModel } from "../models/location.model.js";

export interface LocationSeedEntry {
  state: string;
  district?: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export async function seedIndiaLocations(
  locations: LocationSeedEntry[]
) {
  const operations = locations.map((location) => {
    const filter: Record<string, string> = {
      country: "India",
      state: location.state,
      city: location.city,
    };

    if (location.district) {
      filter.district = location.district;
    }

    const setData: Record<string, unknown> = {
      country: "India",
      state: location.state,
      city: location.city,
      isActive: true,
    };

    if (location.district !== undefined) {
      setData.district = location.district;
    }

    if (location.latitude !== undefined) {
      setData.latitude = location.latitude;
    }

    if (location.longitude !== undefined) {
      setData.longitude = location.longitude;
    }

    return {
      updateOne: {
        filter,
        update: {
          $set: setData,
        },
        upsert: true,
      },
    };
  });

  if (operations.length === 0) {
    return 0;
  }

  const result = await LocationModel.bulkWrite(
    operations,
    { ordered: false }
  );

  return (
    result.upsertedCount +
    result.modifiedCount +
    result.matchedCount
  );
}
