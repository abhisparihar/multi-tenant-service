import mongoose from "mongoose";

//validation rule for email
export const email = val => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val.trim());
//validation rule for role type
export const permissionPattern = val => typeof val == "string" && /^[a-zA-Z0-9]+(_[a-zA-Z0-9]+)*$/.test(val);
// validation rule for mongo objectId
export const mongoObjectId = val => val ? mongoose.Types.ObjectId.isValid(val) : true;
// Validation rule for number greater than 0
export const greaterThanZero = val => val ? parseInt(val) > 0 : true;
// Validation rule for number age is between 0 to 100
export const isValidAge = val => val ? parseInt(val) >= 0 && parseInt(val) <= 100 : true;
// validation for role Based Permission Access 
export const roleBasedPermissionAccess = val => {
    const { roleId, permissions } = val

    let isValidRoleId = roleId ? mongoObjectId(roleId) : false
    let isValidPermissions = permissions && typeof permissions == "object" ? permissions.every(permissionPattern) : false
    return isValidRoleId && isValidPermissions
}

export const tenDigitNumber = val => /^\d{10}$/.test(val.trim());

// export const notFutureDate = (dateStr) => {
//     // Validate format: MM/DD/YYYY
//     const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
//     if (!regex.test(dateStr)) return false;

//     // Convert to Date object (avoid timezone shift by using YYYY-MM-DD)
//     const [month, day, year] = dateStr.split('/').map(Number);
//     const date = new Date(year, month - 1, day); // JS Date uses 0-based months

//     // Check if date is valid and not in the future
//     return !isNaN(date.getTime()) && date <= new Date();
// };

export const notFutureDate = (dateStr) => {
    // Expected format: YYYY/MM/DD HH:mm
    const format = 'MM/DD/YYYY';

    // Parse using moment with strict mode
    const inputMoment = moment(dateStr, format, true);

    // Check if valid and not in the future
    return inputMoment.isValid() && inputMoment.isSameOrBefore(moment());
};

//validation custom field
export const customFieldPattern = val => typeof val == "string" && /^[a-zA-Z0-9]+([-_][a-zA-Z0-9]+)*$/.test(val)

export const fieldNotGettingInclude = val => {
    if (val !== undefined) {
        return false
    }
    return true;

}
export const checkEmptyString = val => val !== undefined ? Boolean(val?.trim()) : true;

export const validateCustomFields = (customFieldObj) => {
    if (customFieldObj) {
        return Object.keys(customFieldObj).every(customFieldPattern);
    }
    return true
}

export const checkStringWithNoSpecialChar = val => typeof val == "string" && /^[a-zA-Z0-9 ]*$/.test(val)

export const validateBusinessDetails = val => {
    if (val?.jobTitle && typeof val.jobTitle != "string") {
        return false
    }
    if (val?.companyName && typeof val.companyName != "string") {
        return false
    }
    if (val?.businessType && typeof val.businessType != "string" && !["B2B", "B2C"].includes(val.businessType)) {
        return false
    }
    if (val?.companyWebSite && !validateURL(val?.companyWebSite)) {
        return false
    }
    if (val?.linkedinUrl && !validateURL(val?.linkedinUrl)) {
        return false
    }
    if (val?.skype && typeof val?.skype !== "string") {
        return false
    }
    return true
}
export const validatePhoneNumber = (phoneNumber, countryCode = null) => {
    return true
    /* // Call the `phone` function, passing the country code only if it's available
    if (phoneNumber) {
        const result =
            countryCode
                ? phone("+" + phoneNumber, { country: countryCode })
                : phone("+" + phoneNumber);

        return Boolean(result?.isValid);
    } else {
        return true
    } */
}

export const validateISOcode = code => {
    if (code) {
        const regex = /^[A-Z]{2,3}$/i; // Matches Alpha-2 or Alpha-3 codes
        return regex.test(code);
    }
    return true
}

export const validateCountryIndexing = countryIndexing => {
    if (typeof countryIndexing == "object") {
        return Object.entries(countryIndexing).every(([id, index]) => id && index && mongoObjectId(id) && parseInt(index) != NaN)
    }
    return false
}

export const isValidDate = date => date ? !isNaN(new Date(date).getTime()) : true;

export const templateNameValidation = val => typeof val == "string" && /^[a-z0-9_]+$/.test(val);

export const isValidArrayOfObjectIds = array => {
    if (array && Array.isArray(array)) {
        return array.every(item => mongoObjectId(item))
    }
    return true
}

export const isValidFutureDateTimePST = (dateStr) => {
    // Step 1: Parse with strict format
    const format = 'YYYY/MM/DD HH:mm';
    const inputMoment = moment(dateStr, format, true);
    // const inputMoment = moment.tz(dateStr, format, true, config.defaultCustomerTimeZone);

    // Step 2: Check valid format
    if (!inputMoment.isValid()) return false;

    // Step 3: Get current time in PST
    const nowPST = moment();
    // const nowPST = moment.tz(config.defaultCustomerTimeZone);

    // Step 4: Compare
    return inputMoment.isSameOrAfter(nowPST);
};