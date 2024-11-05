import type { NextFunction, Request, Response } from "express";
import { responseType } from "../constants";
import jwt from "jsonwebtoken";

export const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
    const authHeaders = req.headers.authorization

    if(!authHeaders) {
        return res.status(401).json({
            type: responseType.FAILED,
            message: "Unauthorized",
            error: new Error("User not authorized")
        })
    };

    const token = authHeaders.split(" ")[1];

    if(!token) {
        return res.status(401).json({
            type: responseType.FAILED,
            message: "Unauthorized",
            error: new Error("User not authorized")
        })
    }

    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
        if(err) {
            res.status(401).json({
                type: responseType.FAILED,
                message: "Unauthorized",
                error: new Error("User not authorized")
            })
        }

        req.user = user as AuthUser;
        next();
    })
}