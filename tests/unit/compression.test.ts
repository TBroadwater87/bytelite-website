import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InteractiveCompressionDemo from '../../src/components/InteractiveCompressionDemo';

describe('InteractiveCompressionDemo', () => {
  it('renders upload zone initially', () => {
    render(<InteractiveCompressionDemo />);
    expect(screen.getByText('Try ByteLite Compression')).toBeInTheDocument();
    expect(screen.getByText('Drop a file here or click to upload')).toBeInTheDocument();
  });

  it('handles file selection', async () => {
    render(<InteractiveCompressionDemo />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText('Upload file for compression') as HTMLElement;
    
    // Find the file input
    const fileInput = input.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });
  });

  it('shows compression results', async () => {
    render(<InteractiveCompressionDemo />);
    
    const file = new File(['x'.repeat(1024 * 1024)], 'large.dat', { type: 'application/octet-stream' });
    const input = screen.getByLabelText('Upload file for compression') as HTMLElement;
    const fileInput = input.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByText('Compress with ByteLite')).toBeInTheDocument();
    });
    
    const compressButton = screen.getByText('Compress with ByteLite');
    fireEvent.click(compressButton);
    
    await waitFor(() => {
      expect(screen.getByText('Compression Complete!')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    expect(screen.getByText('10 bytes')).toBeInTheDocument(); // 1MB file compresses to 10 bytes
  });

  it('calculates correct compression ratios', async () => {
    render(<InteractiveCompressionDemo />);
    
    // Test 1TB file compression
    const tbFile = new File([''], 'huge.dat', { type: 'application/octet-stream' });
    Object.defineProperty(tbFile, 'size', {
      value: 1099511627776, // 1TB in bytes
      writable: false,
    });
    
    const input = screen.getByLabelText('Upload file for compression') as HTMLElement;
    const fileInput = input.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [tbFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByText('1 TB')).toBeInTheDocument();
    });
  });
});