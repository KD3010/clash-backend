
import { Request, Response } from 'express';
import { loginSchema, registrationSchema } from "../validations/authValidations";
import { formatError, renderEmailTemplate } from "../helper";
import prisma from "../config/dbconfig";
import { responseType } from "../constants";
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { EmailJobs } from '../jobs';
import jwt from 'jsonwebtoken';
import type { IRequest } from '../custom-types';

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

    const template = renderEmailTemplate('onboarding-email.html');

    const replacements = {
        username: user?.name
    }
    
    await EmailJobs.emailQueue.add('emailQueue', {
        to: user?.email,
        subject: "Ready to Clash? Help Us Decide Which Image Rules Them All!",
        body: template(replacements)
    });

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

export const login = async (req: Request, res: Response): Promise<any> => {
    const validation = loginSchema.safeParse(req.body);

    if(validation.error) {
        res.status(422).json({
            type: responseType.FAILED,
            message: "Invalid credentials",
            error: formatError(validation.error)
        })
    }

    const user = await prisma.user.findUnique({
        where: {
            email: validation.data?.email
        }
    }) || null;

    if(!user) {
        return res.status(422).json({
            type: responseType.FAILED,
            message: 'User does not exist',
            error: {}
        })
    }

    if(validation?.data && !bcrypt.compareSync(validation?.data.password, user?.password)) {
        return res.status(422).json({
            type: responseType.FAILED,
            message: "Invalid credentials",
            error: {}
        })
    }

    if(validation?.data && !user?.email_verified_at) {
        return res.status(422).json({
            type: responseType.FAILED,
            message: "Please verify your email",
            error: {}
        })
    }

    const JWTPaylod = {
        id: user?.id,
        name: user?.name,
        email: user?.email
    }

    const token = jwt.sign(JWTPaylod, process.env.JWT_SECRET!, { expiresIn: '30d' });

    return res.status(201).json({
        type: responseType.SUCCESS,
        message: "Logged in successfully",
        data: {
            ...JWTPaylod,
            token: `Bearer ${token}`
        }
    })
}

export const logout = async (req: IRequest, res: Response) => {
    
    if(!req.headers.authorization && !req.user) {
        res.status(401).json({
            type: responseType.FAILED,
            MESSAGE: "Unauthorized",
            error: {}
        })
    }

    req.user = null;

    res.status(201).json({
        type: responseType.SUCCESS,
        message: "Logged out successfully",
        data: {
            user: req.user
        }
    })
}