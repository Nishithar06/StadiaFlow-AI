import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

// Extend Vitest's expect assertions with Jest-DOM matchers
expect.extend(matchers);

// Automatically run cleanup after each test to prevent leaks
afterEach(() => {
  cleanup();
});

// Mock react-router-dom elements
vi.mock('react-router-dom', () => {
  return {
    Link: ({ to, children, ...props }) => React.createElement('a', { href: to, ...props }, children),
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock window.scrollTo to prevent errors in jsdom
window.scrollTo = vi.fn();
