import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WarmConnectProvider } from '../context/WarmConnectContext';
import { Navbar } from '../components/Navbar';
import { CareerGoalFinderModal } from '../components/CareerGoalFinderModal';
import { MentorshipTrackerDrawer } from '../components/MentorshipTrackerDrawer';

describe('Navbar', () => {
  it('renders brand wordmark, primary navigation links, and request counter', () => {
    render(
      <WarmConnectProvider>
        <Navbar />
      </WarmConnectProvider>
    );

    expect(screen.getByRole('link', { name: /warmconnect/i })).toHaveAttribute('href', '#top');
    expect(screen.getByRole('link', { name: /^alumni$/i })).toHaveAttribute('href', '#alumni-explorer');
    expect(screen.getByRole('link', { name: /^process$/i })).toHaveAttribute('href', '#how-it-works');
    expect(screen.getByRole('link', { name: /^network$/i })).toHaveAttribute('href', '#network-graph');
    expect(screen.getByRole('link', { name: /^opportunities$/i })).toHaveAttribute('href', '#opportunities');
    expect(screen.getByRole('link', { name: /^outreach$/i })).toHaveAttribute('href', '#message-assistant');

    expect(screen.getByRole('button', { name: /view mentorship requests/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /find my mentor/i })).toBeInTheDocument();
  });

  it('invokes onOpenSearch when the search button is clicked', async () => {
    const user = userEvent.setup();
    const onOpenSearch = vi.fn();

    render(
      <WarmConnectProvider>
        <Navbar onOpenSearch={onOpenSearch} />
      </WarmConnectProvider>
    );

    await user.click(screen.getByRole('button', { name: /search alumni/i }));
    expect(onOpenSearch).toHaveBeenCalledTimes(1);
  });

  it('opens the CareerGoalFinderModal and MentorshipTrackerDrawer from header actions', async () => {
    const user = userEvent.setup();

    render(
      <WarmConnectProvider>
        <Navbar />
        <CareerGoalFinderModal />
        <MentorshipTrackerDrawer />
      </WarmConnectProvider>
    );

    await user.click(screen.getByRole('button', { name: /find my mentor/i }));
    expect(screen.getByRole('dialog', { name: /career goal & mentor matcher/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: /career goal & mentor matcher/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /view mentorship requests/i }));
    expect(screen.getByRole('dialog', { name: /my mentorship requests/i })).toBeInTheDocument();
  });

  it('opens mobile navigation drawer and closes on Escape key', async () => {
    const user = userEvent.setup();

    render(
      <WarmConnectProvider>
        <Navbar />
      </WarmConnectProvider>
    );

    const toggleBtn = screen.getByRole('button', { name: /toggle navigation menu/i });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: /mobile navigation/i })).not.toBeInTheDocument();
  });
});
