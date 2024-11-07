import type { NextFunction, Response } from "express";
import { responseType } from "../constants";
import jwt from "jsonwebtoken";
import type { AuthUser, IRequest } from "../custom-types";

export const isAuthorized = (req: IRequest, res: Response, next: NextFunction): any => {
    const authHeaders = req.headers.authorization;
    const token = authHeaders?.split(" ")[1];

    if(!token) {
        return res.status(401).json({
            type: responseType.FAILED,
            message: "Unauthorized",
            error: new Error("User not authorized")
        })
    }

    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
        if(err) {
            return res.status(401).json({
                type: responseType.FAILED,
                message: "Unauthorized",
                error: new Error("User not authorized")
            })
        }

        req.user = user as AuthUser;
        next();
    });
}