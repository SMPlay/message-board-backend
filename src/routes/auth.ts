import {Request, Response, Router} from "express";
import {validationResult} from "express-validator";
import {compare, hash} from "bcrypt";
import {v4 as uuidv4,} from "uuid";

import {registrationValidator, sendAuthorizationMessage} from "../utils";
import {ConfirmToken, ConfirmTokenModel, RefreshTokenModel, UserModel} from '../models';

export const authRouter = Router();

export interface RegistrationRequest extends Request {
    body: {
        name: string;
        login: string;
        email: string;
        password: string;
        confirmPassword: string;
    }
}

export interface ConfirmUserRequest extends Request {
    body: {
        token: string,
    }
}

authRouter.post("/registration", registrationValidator, async (req: RegistrationRequest, res: Response) => {
    const {body: {email, password, name, login}} = req;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({message: errors.array()[0].msg});
        return;
    }

    try {
        const existingUserByLogin = await UserModel.findOne({login});
        const existingUserByEmail = await UserModel.findOne({email});

        if (existingUserByLogin) {
            res.status(403).json({message: "User is already exists!"});
            return;
        }

        if (existingUserByEmail) {
            res.status(403).json({message: "User with this email is already exists!"});
            return;
        }
        const hashedPassword = await hash(password, 12);
        const user = new UserModel({
            name,
            login,
            email,
            password: hashedPassword,
            isConfirmed: false,
            isAdmin: false,
        });
        const registeredUser = await user.save();
        const refreshToken = new RefreshTokenModel({
            token: '',
            userId: registeredUser.id
        });
        await refreshToken.save();
        const confirmToken = uuidv4();
        const confirmTokenDocument = new ConfirmTokenModel({
            token: confirmToken,
            userId: registeredUser.id
        });
        await confirmTokenDocument.save();
        await sendAuthorizationMessage(confirmToken, email);
        res.status(200).json({message: "success"});
    } catch (e) {
        throw e;
    }
});

authRouter.post("/confirm-user", async ({body: {token}}: ConfirmUserRequest, res) => {
    try {
        const existedToken: ConfirmToken = await ConfirmTokenModel.findOne({token});

        if (!existedToken) {
            res.status(403).json({message: "This token does not exist"});
            return;
        }
        await UserModel.findByIdAndUpdate(existedToken.userId, {isConfirmed: true})
        await ConfirmTokenModel.findOneAndRemove({token});

        res.status(200).json({message: "success"});
    } catch (e) {
        throw e
    }
})