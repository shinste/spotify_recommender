import { render, screen } from '@testing-library/react'
import Display from '../../src/components/Display'
import { vi } from 'vitest'
import React from 'react'

describe("Display", () => {
    it("Should render disclaimer message and no displays when empty showcase, but still display title", () => {
        const mockFunction = vi.fn();
        render(<Display showcase={[]} title="testTitle" reference="testReference" setMute={mockFunction} mute={true} handleButtonClick={mockFunction} handleDrag={mockFunction} handleAdd={mockFunction} playlist=""/>)
        // No Display
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
        // Disclaimer Message
        expect(screen.getByText(/Sorry/i)).toBeInTheDocument();
        // Title
        expect(screen.getByText('testTitle')).toBeInTheDocument();
    });
})