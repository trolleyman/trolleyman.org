// NB: If these constants are updated, remember to update the Django versions (in api/validation.py)!
export const MAX_NAME_LENGTH = 16;
export const NAME_LEGAL_SYMBOLS = "-_";

export interface ValidationResult {
    valid: boolean;
    reason: string;
}

// NB: If updating these functions, ensure that the Django functions are also updated (in api/validation.py)!
export function isValidName(name: any): ValidationResult {
    let valid = true;
    let reason = "";
    if (typeof name !== "string") {
        valid = false;
        reason = "Please enter a username.";
    } else if (name === "") {
        valid = false;
        reason = "Please enter a username.";
    } else if (name.length > MAX_NAME_LENGTH) {
        valid = false;
        reason = "The username entered is too long.";
    } else {
        for (let i = 0; i < name.length; i++)
            if (!isValidNameChar(name[i])) {
                valid = false;
                reason = "The username contains the invalid character '" + name[i] + "'.";
                break;
            }
    }
    return { valid: valid, reason: reason };
}

// NB: If updating these functions, ensure that the Django functions are also updated (in api/validation.py)!
export function isValidNameChar(ch: string): boolean {
    const cd = function(s: string): number { return s.charCodeAt(0); };
    const c = ch.charCodeAt(0);
    if (c >= cd('a') && c <= cd('z')) {
        // lowercase chars
        return true;
    } else if (c >= cd('A') && c <= cd('Z')) {
        // uppercase chars
        return true;
    } else if (c >= cd('1') && c <= cd('9')) {
        // digits
        return true;
    } else if (NAME_LEGAL_SYMBOLS.indexOf(ch) !== -1) {
        // symbols
        return true;
    }
    return false;
}
