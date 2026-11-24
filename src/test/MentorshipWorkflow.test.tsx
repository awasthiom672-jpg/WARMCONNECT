import React from 'react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WarmConnectProvider, useWarmConnect } from '../context/WarmConnectContext';
import { MentorshipRequestModal } from '../components/MentorshipRequestModal';
import { MentorshipTrackerDrawer } from '../components/MentorshipTrackerDrawer';
import { Toast } from '../components/Toast';
import { Navbar } from '../components/Navbar';
import { DEMO_ALUMNI } from '../data/mockData';

const WorkflowTestHarness: React.FC = () => {
  const { setRequestModalAlumni } = useWarmConnect();
  const rohit = DEMO_ALUMNI.find((a) => a.id === 'rohit-verma')!;
  const ananya = DEMO_ALUMNI.find((a) => a.id === 'ananya-das')!;

  return (
    <div>
      <Navbar />
      <button type="button" onClick={() => setRequestModalAlumni(rohit)}>
        Open Rohit Request
      </button>
      <button type="button" onClick={() => setRequestModalAlumni(ananya)}>
        Open Ananya Request
      </button>
      <MentorshipRequestModal />
      <MentorshipTrackerDrawer />
      <Toast />
    </div>
  );
};

describe('Mentorship Request End-to-End Workflow', () => {
  it('validates and submits a mentorship request without persisting demo data to localStorage', async () => {
    const user = userEvent.setup();

    render(
      <WarmConnectProvider>
        <WorkflowTestHarness />
      </WarmConnectProvider>
    );

    // 1. Open request modal for Dr. Rohit Verma
    await user.click(screen.getByRole('button', { name: /open rohit request/i }));
    expect(screen.getByRole('dialog', { name: /request mentorship/i })).toBeInTheDocument();
    expect(screen.getByText(/with dr\. rohit verma \(deepmind\)/i)).toBeInTheDocument();

    // 2. Attempt submit with too short a message (< 20 chars)
    const noteInput = screen.getByLabelText(/personal note & context/i);
    await user.type(noteInput, 'Too short');
    await user.click(screen.getByRole('button', { name: /submit request/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/at least 20 characters/i);

    // 3. Select topic, cadence, and valid contextual message
    const topicSelect = screen.getByLabelText(/select mentorship focus area/i);
    await user.selectOptions(topicSelect, 'Publishing at NeurIPS/ICLR');
    expect(topicSelect).toHaveValue('Publishing at NeurIPS/ICLR');

    const cadenceSelect = screen.getByLabelText(/preferred session cadence/i);
    await user.selectOptions(cadenceSelect, 'Bi-weekly mock interview or project feedback');

    await user.clear(noteInput);
    const validMessage =
      'I am a 4th year CSAM student researching multi-modal RLHF alignment and would appreciate feedback on our NeurIPS submission.';
    await user.type(noteInput, validMessage);

    // 4. Submit request
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    // 5. Verify modal closes, tracker drawer opens with Pending request, and Toast confirms submission
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /request mentorship/i })).not.toBeInTheDocument();
    });

    const tracker = await screen.findByRole('dialog', { name: /my mentorship requests/i });
    expect(tracker).toBeInTheDocument();
    expect(tracker).toHaveTextContent('Dr. Rohit Verma');
    expect(tracker).toHaveTextContent('Topic: Publishing at NeurIPS/ICLR');
    expect(tracker).toHaveTextContent(validMessage);
    expect(tracker).toHaveTextContent('Pending');

    const toast = await screen.findByRole('status');
    expect(toast).toHaveTextContent(/demo mentorship request created for dr\. rohit verma/i);

    // 6. Demo data is held in memory only and is not persisted as if it were a real account.
    expect(localStorage.getItem('warmconnect_mentorship_requests_v1')).toBeNull();

    // 7. Close drawer and verify duplicate pending request prevention
    await user.click(screen.getByRole('button', { name: /close mentorship requests drawer/i }));
    await user.click(screen.getByRole('button', { name: /open rohit request/i }));
    await user.type(
      screen.getByLabelText(/personal note & context/i),
      'Following up with another duplicate mentorship inquiry that exceeds twenty chars.'
    );
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    const dupAlert = await screen.findByRole('alert');
    expect(dupAlert).toHaveTextContent(/already have a pending mentorship request/i);
  });

  it('resets the form when switching alumni and supports withdrawing a newly created request', async () => {
    const user = userEvent.setup();

    render(
      <WarmConnectProvider>
        <WorkflowTestHarness />
      </WarmConnectProvider>
    );

    await user.click(screen.getByRole('button', { name: /open rohit request/i }));
    await user.selectOptions(screen.getByLabelText(/select mentorship focus area/i), 'Math for ML');
    await user.type(screen.getByLabelText(/personal note & context/i), 'Draft note for Rohit');
    await user.click(screen.getByRole('button', { name: /^cancel$/i }));

    await user.click(screen.getByRole('button', { name: /open ananya request/i }));
    expect(screen.getByLabelText(/select mentorship focus area/i)).toHaveValue('Portfolio Critique');
    expect(screen.getByLabelText(/personal note & context/i)).toHaveValue('');
    await user.click(screen.getByRole('button', { name: /^cancel$/i }));

    await user.click(screen.getByRole('button', { name: /view mentorship requests/i }));
    expect(screen.getByText(/no active requests/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close mentorship requests drawer/i }));

    await user.click(screen.getByRole('button', { name: /open ananya request/i }));
    await user.type(screen.getByLabelText(/personal note & context/i), 'I would appreciate advice about building a strong product design portfolio and preparing for interviews.');
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    const tracker = await screen.findByRole('dialog', { name: /my mentorship requests/i });
    expect(tracker).toHaveTextContent('Ananya Das');
    await user.click(screen.getByRole('button', { name: /withdraw/i }));
    expect(screen.getByText(/no active requests/i)).toBeInTheDocument();
  });
});
