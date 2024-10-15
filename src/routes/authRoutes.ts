import { Router, Request, Response } from "express";
import { registrationSchema } from "../validations/authValidations";
import { formatError } from "../helper";
import prisma from "../config/dbconfig";
import { responseType } from "../constants";

const router = Router();

router.post("/register", async (req: Request, res: Response): Promise<any> => {
    try {
        const body = req.body;
        const validate = registrationSchema.safeParse(body);
        
        if(!validate.success) {
            return res.status(422).json({
                type: responseType.FAILED,
                message: 'Invalid request! please check credentials',
                error: formatError(validate.error)
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: validate?.data?.email
            }
        })

        if(existingUser) {
            return res.status(422).json({
                type: responseType.FAILED,
                message: "Invalid request, please try again",
                error: {
                    email : 'User with email already exists'
                }
            })
        }

        return res.status(201).json({
            type: responseType.SUCCESS,
            message: 'Registration complete, please login to proceed',
            user: 'User'
        })
    } catch (error) {
        return res.status(500).json({
            type: responseType.FAILED,
            message: 'Oops! Something went wrong. Please try again',
            error
        })
    }

});

export default router;