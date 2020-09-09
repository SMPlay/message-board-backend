import { Schema, model, Document } from "mongoose";

const ResetPasswordSchema = new Schema({
  userId: String,
  token: String,
});

export interface ResetPassword extends Document {
  userId: string,
  token: string
}

export const ResetPasswordModel = model<ResetPassword>("reset-password-tokens", ResetPasswordSchema);
