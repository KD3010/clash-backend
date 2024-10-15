import { z } from "zod";
import { password_error, password_regex } from "../constants";

export const registrationSchema = z.object({
    name: z.string({message: "Name is required"}).min(3, {message: 'Name must have three characters'}),
    email: z.string({message: 'Email is required'}).email({message: 'Please provide a valid email'}),
    password: z.string({message: 'Password is required'}).regex(password_regex, {message: password_error}),
    confirm_password: z.string({message: 'Confirm Password is required'}),
})
.refine((data) => data.password === data.confirm_password, {message: 'Passwords do not match', path: ['confirm_password']});
