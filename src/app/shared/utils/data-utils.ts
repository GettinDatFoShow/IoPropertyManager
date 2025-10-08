/**
 * Removes undefined values from an object recursively
 * Firestore doesn't accept undefined values, so we need to clean them
 */
export function removeUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedValues).filter(item => item !== undefined);
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = removeUndefinedValues(obj[key]);
      if (value !== undefined) {
        cleaned[key] = value;
      }
    });
    return cleaned;
  }

  return obj;
}

/**
 * Converts empty strings to undefined for optional fields
 */
export function emptyStringToUndefined(value: string | undefined): string | undefined {
  return (value === '' || value === null) ? undefined : value;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formats a full name from first and last name
 */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName?.trim() || ''} ${lastName?.trim() || ''}`.trim();
}