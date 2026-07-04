import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../errors/AppError';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // For GET requests, validate req.query. Otherwise, validate req.body.
      const dataToValidate = req.method === 'GET' ? req.query : req.body;

      const validatedData = await schema.parseAsync(dataToValidate);

      // Replace the original data with the validated/coerced data
      if (req.method === 'GET') {
        // Express 5 makes req.query a getter-only property, so we mutate it instead of reassigning
        for (const key of Object.keys(req.query)) {
          delete req.query[key];
        }
        Object.assign(req.query, validatedData);
      } else {
        req.body = validatedData;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Map Zod errors to a cleaner format
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError(formattedErrors));
      } else {
        next(error);
      }
    }
  };
};