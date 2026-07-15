import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import LandingPage from '../pages/LandingPage';
import Chat from '../pages/Chat';
import Dashboard from '../pages/Dashboard';
import Navigation from '../pages/Navigation';

// Mock axios globally for all tests
vi.mock('axios', () => {
  return {
    default: {
      get: vi.fn(() => Promise.resolve({ data: {} })),
      post: vi.fn(() => Promise.resolve({ data: {} })),
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn(), eject: vi.fn() },
          response: { use: vi.fn(), eject: vi.fn() }
        },
        get: vi.fn(() => Promise.resolve({ data: {} })),
        post: vi.fn(() => Promise.resolve({ data: {} }))
      }))
    }
  };
});

describe('StadiaFlow AI Pages rendering checks', () => {
  it('renders LandingPage successfully', () => {
    render(<LandingPage />);
    expect(screen.getByText('StadiaFlow AI')).toBeInTheDocument();
    expect(screen.getByText('Smart Stadium Assistant for FIFA World Cup 2026')).toBeInTheDocument();
  });

  it('renders Chat page successfully', () => {
    render(<Chat />);
    expect(screen.getByText('StadiaFlow AI')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask about gates, concessions, seating/i)).toBeInTheDocument();
  });

  it('renders Dashboard page successfully', () => {
    render(<Dashboard />);
    expect(screen.getByText('Operations Command Center')).toBeInTheDocument();
    expect(screen.getByText('Gemini Operations Insight')).toBeInTheDocument();
  });

  it('renders Navigation page successfully', () => {
    render(<Navigation />);
    expect(screen.getByText('Interactive Concourse Map')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search gates, food concessions/i)).toBeInTheDocument();
  });
});
