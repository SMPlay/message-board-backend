import { Schema, model, Document } from "mongoose";

const UsersSchema = new Schema({
  name: String,
  email: String,
  login: String,
  password: String,
  isConfirmed: Boolean,
  isAdmin: Boolean,
});

export interface User extends Document {
    name: string,
    email: string,
    login: string,
    password: string,
    isConfirmed: boolean,
    isAdmin: boolean,
}

export const UserModel = model<User>("users", UsersSchema);
