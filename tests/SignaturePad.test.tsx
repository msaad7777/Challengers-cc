import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignaturePad from '@/app/c3h/pavilion/SignaturePad';

function setup(overrides: Partial<Parameters<typeof SignaturePad>[0]> = {}) {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  render(
    <SignaturePad
      signerName="Mohammed Saad"
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...overrides}
    />,
  );
  return { onSubmit, onCancel };
}

describe('SignaturePad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial render', () => {
    it('shows both tab buttons', () => {
      setup();
      expect(screen.getByRole('button', { name: /type signature/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /draw signature/i })).toBeInTheDocument();
    });

    it('defaults to the typed tab with the signer name pre-filled', () => {
      setup();
      const input = screen.getByPlaceholderText(/mohammed saad/i) as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('Mohammed Saad');
    });

    it('renders a cursive preview when the typed signature is non-empty', () => {
      setup();
      // Pre-fill matches signerName, so preview should appear immediately.
      expect(screen.getByText('Mohammed Saad', { selector: 'div' })).toBeInTheDocument();
    });

    it('shows Cancel and Sign & submit buttons', () => {
      setup();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign & submit/i })).toBeInTheDocument();
    });
  });

  describe('typed signature', () => {
    it('emits typed payload on submit', async () => {
      const user = userEvent.setup();
      const { onSubmit } = setup({ signerName: '' });
      const input = screen.getByPlaceholderText(/mohammed saad/i);
      await user.clear(input);
      await user.type(input, 'Tarek Islam');
      await user.click(screen.getByRole('button', { name: /sign & submit/i }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith({ type: 'typed', data: 'Tarek Islam' });
    });

    it('trims whitespace from the typed signature before submit', async () => {
      const user = userEvent.setup();
      const { onSubmit } = setup({ signerName: '' });
      const input = screen.getByPlaceholderText(/mohammed saad/i);
      await user.type(input, '  Gokul Prakash   ');
      await user.click(screen.getByRole('button', { name: /sign & submit/i }));
      expect(onSubmit).toHaveBeenCalledWith({ type: 'typed', data: 'Gokul Prakash' });
    });

    it('disables submit when input has fewer than 2 characters', async () => {
      const user = userEvent.setup();
      const { onSubmit } = setup({ signerName: '' });
      const input = screen.getByPlaceholderText(/mohammed saad/i);
      await user.type(input, 'A');
      const submit = screen.getByRole('button', { name: /sign & submit/i });
      expect(submit).toBeDisabled();
      await user.click(submit);
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('disables submit when input is only whitespace', async () => {
      const user = userEvent.setup();
      const { onSubmit } = setup({ signerName: '' });
      const input = screen.getByPlaceholderText(/mohammed saad/i);
      await user.type(input, '       ');
      const submit = screen.getByRole('button', { name: /sign & submit/i });
      expect(submit).toBeDisabled();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('cancel button', () => {
    it('calls onCancel without invoking onSubmit', async () => {
      const user = userEvent.setup();
      const { onSubmit, onCancel } = setup();
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('busy state', () => {
    it('disables Cancel and shows "Signing…" on the submit button', () => {
      setup({ busy: true });
      const submit = screen.getByRole('button', { name: /signing…/i });
      expect(submit).toBeDisabled();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });
  });

  describe('drawn signature tab', () => {
    it('switches to the draw tab and renders a canvas + clear button', async () => {
      const user = userEvent.setup();
      setup();
      await user.click(screen.getByRole('button', { name: /draw signature/i }));
      const canvas = document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^clear$/i })).toBeInTheDocument();
    });

    it('keeps submit disabled until the user has drawn at least once', async () => {
      const user = userEvent.setup();
      const { onSubmit } = setup();
      await user.click(screen.getByRole('button', { name: /draw signature/i }));
      const submit = screen.getByRole('button', { name: /sign & submit/i });
      expect(submit).toBeDisabled();
      await user.click(submit); // should be a no-op
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('emits a drawn payload (PNG dataURL) after pointer events on canvas', async () => {
      const user = userEvent.setup();
      const { onSubmit } = setup();
      await user.click(screen.getByRole('button', { name: /draw signature/i }));
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas).toBeTruthy();

      // Simulate a small drawn stroke. fireEvent's PointerEvent is
      // sufficient — the component listens for pointerdown/move/up.
      fireEvent.pointerDown(canvas, { clientX: 20, clientY: 30, pointerId: 1 });
      fireEvent.pointerMove(canvas, { clientX: 60, clientY: 80, pointerId: 1 });
      fireEvent.pointerUp(canvas, { clientX: 60, clientY: 80, pointerId: 1 });

      const submit = screen.getByRole('button', { name: /sign & submit/i });
      expect(submit).not.toBeDisabled();
      await user.click(submit);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.type).toBe('drawn');
      expect(payload.data).toMatch(/^data:image\/png;base64,/);
    });

    it('Clear button resets the "has drawn" state', async () => {
      const user = userEvent.setup();
      setup();
      await user.click(screen.getByRole('button', { name: /draw signature/i }));
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      fireEvent.pointerDown(canvas, { clientX: 20, clientY: 30, pointerId: 1 });
      fireEvent.pointerMove(canvas, { clientX: 60, clientY: 80, pointerId: 1 });
      fireEvent.pointerUp(canvas, { clientX: 60, clientY: 80, pointerId: 1 });

      // Submit is enabled after drawing.
      expect(screen.getByRole('button', { name: /sign & submit/i })).not.toBeDisabled();

      await user.click(screen.getByRole('button', { name: /^clear$/i }));
      // After clear, submit should be disabled again.
      expect(screen.getByRole('button', { name: /sign & submit/i })).toBeDisabled();
    });
  });

  describe('tab switching does not lose typed input', () => {
    it('typed value persists when navigating away and back', async () => {
      const user = userEvent.setup();
      setup({ signerName: '' });
      const input = screen.getByPlaceholderText(/mohammed saad/i) as HTMLInputElement;
      await user.type(input, 'Sazzad Mahmud');
      await user.click(screen.getByRole('button', { name: /draw signature/i }));
      await user.click(screen.getByRole('button', { name: /type signature/i }));
      const inputAgain = screen.getByPlaceholderText(/mohammed saad/i) as HTMLInputElement;
      expect(inputAgain.value).toBe('Sazzad Mahmud');
    });
  });
});
