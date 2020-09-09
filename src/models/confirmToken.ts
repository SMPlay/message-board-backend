import { Schema, model, Document } from "mongoose";

const confirmTokenSchema = new Schema({
  userId: String,
  token: String,
});

export interface ConfirmToken extends Document {
  userId: string,
  token: string
}

export const ConfirmTokenModel = model<ConfirmToken>("confirm-tokens", confirmTokenSchema);
