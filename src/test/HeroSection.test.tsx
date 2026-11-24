import React from 'react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WarmConnectProvider } from '../context/WarmConnectContext';
import { HeroSection } from '../components/HeroSection';
import { AlumniProfileModal } from '../components/AlumniProfileModal';
import { CareerGoalFinderModal } from '../components/CareerGoalFinderModal';
import { MentorshipRequestModal } from '../components/MentorshipRequestModal';

describe('HeroSection', () => {
  it('renders editorial headline, CTAs, Top Match card, and 3 floating alumni satellite cards', () => {
    render(
      <WarmConnectProvider>
        <HeroSection />
      </WarmConnectProvider>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /your next opportunity might be one conversation away/i })
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /find my mentor/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore alumni/i })).toHaveAttribute('href', '#alumni-explorer');

    // Main Top Match card (Priya Sharma) and 3 floating cards
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.getByText('Dr. Rohit Verma')).toBeInTheDocument();
    expect(screen.getByText('Kabir Mehta')).toBeInTheDocument();
    expect(screen.getByText('Ananya Das')).toBeInTheDocument();
  });

  it('opens profile modal from View Profile button and from satellite alumni cards', async () => {
    const user = userEvent.setup();

    render(
      <WarmConnectProvider>
        <HeroSection />
        <AlumniProfileModal />
      </WarmConnectProvider>
    );

    await user.click(screen.getByRole('button', { name: /^view profile$/i }));
    const priyaDialog = screen.getByRole('dialog');
    expect(priyaDialog).toBeInTheDocument();
    expect(within(priyaDialog).getByRole('heading', { name: 'Priya Sharma' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close alumni profile modal/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click satellite card via accessible role/aria-label
    await user.click(screen.getByRole('button', { name: /view profile for dr\. rohit verma/i }));
    const rohitDialog = screen.getByRole('dialog');
    expect(rohitDialog).toBeInTheDocument();
    expect(within(rohitDialog).getByRole('heading', { name: 'Dr. Rohit Verma' })).toBeInTheDocument();
  });

  it('opens CareerGoalFinderModal and MentorshipRequestModal from hero buttons', async () => {
    const user = userEvent.setup();

    render(
      <WarmConnectProvider>
        <HeroSection />
        <CareerGoalFinderModal />
        <MentorshipRequestModal />
      </WarmConnectProvider>
    );

    await user.click(screen.getByRole('button', { name: /find my mentor/i }));
    expect(screen.getByRole('dialog', { name: /career goal & mentor matcher/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close career goal finder/i }));

    await user.click(screen.getByRole('button', { name: /request introduction/i }));
    expect(screen.getByRole('dialog', { name: /request mentorship/i })).toBeInTheDocument();
    expect(screen.getByText(/with priya sharma \(google\)/i)).toBeInTheDocument();
  });

  it('handles pointer move and pointer leave on the 3D stage gracefully without layout crash', () => {
    render(
      <WarmConnectProvider>
        <HeroSection />
      </WarmConnectProvider>
    );

    const stage = screen.getByTestId('hero-3d-stage');
    Object.defineProperty(stage, 'getBoundingClientRect', {
      value: () => ({ left: 0, top: 0, width: 500, height: 500, right: 500, bottom: 500 }),
    });

    fireEvent.pointerMove(stage, { clientX: 400, clientY: 120 });
    fireEvent.pointerLeave(stage);

    expect(screen.getByTestId('hero-3d-card-container')).toBeInTheDocument();
  });
});
