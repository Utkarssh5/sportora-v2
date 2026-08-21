import mongoose, { Document, Schema } from "mongoose";

export interface ILocation extends Document {
  country: string;
  state: string;
  district?: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
}

const LocationSchema = new Schema<ILocation>(
  {
    country: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    district: {
      type: String,
      required: false,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

LocationSchema.index(
  {
    country: 1,
    state: 1,
    district: 1,
    city: 1,
  },
  { unique: true }
);

LocationSchema.index({
  state: 1,
  city: 1,
});

export const LocationModel =
  mongoose.model<ILocation>("Location", LocationSchema);
