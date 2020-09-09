import {Schema, model, Document} from "mongoose"

const RefreshTokenSchema = new Schema({
  userId: String,
  token: String
});

export interface RefreshToken extends Document {
  userId: string,
  token: string
}

export const RefreshTokenModel =  model<RefreshToken>('refresh-tokens', RefreshTokenSchema);
