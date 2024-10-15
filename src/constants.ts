export const emailQueueName: string = "emailQueue";
export const password_regex: RegExp = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
export const password_error: string = 'Password must satisfy following conditions:\n1. Minimum length of the password should be 8\n2. Password must contain a capital letter and a small letter\n3. Password must contain at least one numeral\n4. Password must contain at least one special character';
export const responseType = {
    'FAILED': 'failed',
    'SUCCESS': 'success',
    'PROCESSING': 'processing'
}