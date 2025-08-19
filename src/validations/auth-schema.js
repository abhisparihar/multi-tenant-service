import { email } from './validation-rule.js';

export const Login = {
    email: {
        type: String,
        required: true,
        use: { email },
        message: {
            email: "Email must have in valid format."
        }
    },
    password: {
        type: String,
        required: true,
        message: {
            required: "password must be required."
        }
    },
};

export const Register = {
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        use: { email },
        message: {
            email: "Email must have in valid format."
        }
    },
    tenantName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        message: {
            required: "password must be required."
        }
    },
}