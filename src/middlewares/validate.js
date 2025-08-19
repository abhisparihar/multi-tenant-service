import { validationResult } from "express-validator";
import Schema from "validate";

/**
 * Constructs a JSON response for validation errors and sets the HTTP status to 400 (Bad Request).
 * 
 * @param {Object} validate - The Ajv validation object.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} - The formatted error response.
 */
function errorResponse(validate, res) {
    // console.log(JSON.stringify(validate.errors, null, 2));
    return res.status(400).json({
        type: "error",
        data: {},
        error: "Bad Request",
        message: `Validation error: ${validate[0].message}`,
        details: {
            field: validate[0].path,
            message: validate[0].message
        }
    });
}

/**
 * Middleware to handle validation results
 */
export default function (schema) {
    const validateSchema = new Schema(schema);
    return (req, res, next) => {

        let options = {};
        Object.keys(req.params).length
            ? (options = { ...options, ...req.params })
            : (options = { ...options });
        Object.keys(req.body).length
            ? (options = { ...options, ...req.body })
            : (options = { ...options });
        Object.keys(req.query).length
            ? (options = { ...options, ...req.query })
            : (options = { ...options });

        const errors = validateSchema.validate(options, { strip: false })
        if (errors.length == 0) {
            next();
        } else {
            if (req.files || req.file) {
                deleteFilesOnError(req);
            }
            return errorResponse(errors, res);
        }
    };
}
