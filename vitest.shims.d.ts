/// <reference types="@vitest/browser-playwright" />
import type { Assertion, AsymmetricMatchersContaining } from 'vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
    interface Assertion<T = any> extends TestingLibraryMatchers<any, T> { }
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> { }
}

