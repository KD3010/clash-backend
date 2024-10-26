
import { Request, Response } from 'express';
import { registrationSchema } from "../validations/authValidations";
import { formatError, renderEmailTemplate } from "../helper";
import prisma from "../config/dbconfig";
import { responseType } from "../constants";
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { EmailJobs } from '../jobs';

const generateSalt = async() => await bcrypt.genSalt(10);
const generateToken = async() => await bcrypt.hash(uuid(), await generateSalt())

export const register = async (req: Request, res: Response): Promise<any> => {
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

        const salt = await generateSalt();
        const password = bcrypt.hashSync(validate?.data?.password, salt);
        const token = await generateToken();

        const verification_url = process.env.APP_URL + `/api/auth/verify-email?email=${validate?.data?.email}&token=${token}`;

        const template = renderEmailTemplate('verify-email.html');
        const replacements = {
            username: validate?.data?.name,
            link: verification_url
        }

        await EmailJobs.emailQueue.add('emailQueue', {
            to: validate?.data?.email,
            subject: 'Please verify your account - Clash',
            body: template(replacements)
        })

        const newUser = await prisma.user.create({
            data: {
                name: validate?.data?.name,
                email: validate?.data?.email,
                password: password,
                email_verify_token: token,
            }
        })

        return res.status(201).json({
            type: responseType.SUCCESS,
            message: 'Registration complete, Check your inbox to verify your email!',
            data: {
                user: newUser
            }
        })
    } catch (error) {
        return res.status(500).json({
            type: responseType.FAILED,
            message: 'Oops! Something went wrong. Please try again',
            error
        })
    }

}

export const verifyEmail = async (req: Request, res: Response) => {
    const { email, token } = req.query;
    
    if(!email && !token) {
        res.status(401).json({
            type: responseType.FAILED,
            message: 'Invalid credentials, please try again',
        })
    }

    const user = await prisma.user.findUnique({
        where: {
            email: email as string,
        }
    })

    if(!user) {
        res.status(401).json({
            type: responseType.FAILED,
            message: 'Invalid credentials, user does not exist',
        })
    }
    if(token?.toString() === user?.email_verify_token?.toString()) {
        res.status(401).json({
            type: responseType.FAILED,
            message: 'Invalid request, invalid token',
        })
    }

    const updatedUser = await prisma.user.update({
        data: {
            email_verified_at: new Date().toISOString(),
            email_verify_token: null
        }, 
        where: {
            email: email as string
        }
    })

    updatedUser && res.redirect(process.env.CLIENT_APP_URL + "/login");
}