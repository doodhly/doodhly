import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import xss from 'xss';
import { AppError } from '../errors/app-error';

/**
 * Sanitizes an object or string to prevent XSS.
 * Recursively cleans all string values in an object.
 */
function sanitize(input: any): any {
    if (typeof input === 'string') {
        return xss(input);
    }
    if (Array.isArray(input)) {
        return input.map((item: any) => sanitize(item));
    }
    if (typeof input === 'object' && input !== null) {
        const sanitizedData: any = {};
        for (const key in input) {
            sanitizedData[key] = sanitize(input[key]);
        }
        return sanitizedData;
    }
    return input;
}

/**
 * Middleware to validate request against a Zod schema and sanitize input.
 */
export const validate = (schema: z.ZodTypeAny) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Sanitize Inputs
        req.body = sanitize(req.body);
        req.query = sanitize(req.query);
        req.params = sanitize(req.params);

        // 2. Validate against Schema
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const details = error.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message,
            }));

            return next(new AppError(`Validation failed: ${details[0].message}`, 400));
        }
        next(error);
    }
};
