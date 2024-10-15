import type { ZodError } from "zod";

export const formatError = (error: ZodError): any => {
    return error?.issues?.reduce((acc, issue) => acc = {...acc, [issue?.path?.[0]]: issue?.message}, {})
} 