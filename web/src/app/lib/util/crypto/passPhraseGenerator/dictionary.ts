import { InjectionToken } from '@angular/core';

interface Dictionary {
    getWords(): string[];
}

export const DICTIONARY = new InjectionToken<Dictionary>('dictionary');
export default Dictionary;
