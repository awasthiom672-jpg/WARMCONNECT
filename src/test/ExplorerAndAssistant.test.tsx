import React from 'react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WarmConnectProvider } from '../context/WarmConnectContext';
import { AlumniExplorer } from '../components/AlumniExplorer';
import { OpportunitySection } from '../components/OpportunitySection';
import { SmartIntroAssistant } from '../components/SmartIntroAssistant';
import { Toast } from '../components/Toast';

describe('AlumniExplorer, OpportunitySection, and SmartIntroAssistant', () => {
  it('filters alumni by branch, search query, shortlist bookmark, and resets empty state cleanly', async () => {
    const user = userEvent.setup();

    render(
      <WarmConnectProvider>
        <AlumniExplorer />
        <Toast />
      </WarmConnectProvider>
    );

    expect(screen.getByText('8 of 8 profiles')).toBeInTheDocument();

    // Filter by HCD branch
    await user.click(screen.getByRole('button', { name: /^hcd$/i }));
    expect(screen.getByText('1 of 8 profiles')).toBeInTheDocument();
    expect(screen.getByText('Ananya Das')).toBeInTheDocument();

    // Bookmark Ananya Das
    await user.click(screen.getByRole('button', { name: /save ananya das to shortlist/i }));
    expect(screen.getByText(/shortlist \(1\)/i)).toBeInTheDocument();

    // Search nonsense triggers empty state and reset restores full directory
    await user.type(screen.getByLabelText(/search alumni/i), 'zzzz-nonexistent');
    expect(screen.getByText(/no matching alumni found/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /reset all filters/i }));
    expect(screen.getByText('8 of 8 profiles')).toBeInTheDocument();
  });

  it('records referral inquiries in the in-memory demo mode without claiming a live referral', async () => {
    const user = userEvent.setup();

    render(
      <WarmConnectProvider>
        <OpportunitySection />
        <Toast />
      </WarmConnectProvider>
    );

    const referralButtons = screen.getAllByRole('button', { name: /request internal referral/i });
    expect(referralButtons.length).toBeGreaterThan(0);

    await user.click(referralButtons[0]);
    expect(screen.getByRole('button', { name: /inquiry pending/i })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/demo referral inquiry recorded/i);
  });

  it('updates SmartIntroAssistant draft when tone or recipient changes', async () => {
    const user = userEvent.setup();

    render(
      <WarmConnectProvider>
        <SmartIntroAssistant />
      </WarmConnectProvider>
    );

    const draft = screen.getByLabelText(/draft message preview/i) as HTMLTextAreaElement;
    expect(draft.value).toContain('Dear Priya Sharma');

    await user.click(screen.getByRole('button', { name: /^friendly$/i }));
    expect(draft.value).toContain('Hi Priya Sharma!');

    await user.selectOptions(screen.getByLabelText(/target alumnus/i), 'rohit-verma');
    expect(draft.value).toContain('Hi Dr. Rohit Verma!');
  });
});
