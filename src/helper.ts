import type { ZodError } from "zod";
import fs from 'fs';
import handlebars from "handlebars";

export const formatError = (error: ZodError): any => {
    return error?.issues?.reduce((acc, issue) => acc = {...acc, [issue?.path?.[0]]: issue?.message}, {})
} 

export const renderEmailTemplate = (filename: string) => {
    const source = fs.readFileSync(__dirname + `/public/${filename}`, 'utf-8').toString();
    const template = handlebars.compile(source);

    return template;
}
