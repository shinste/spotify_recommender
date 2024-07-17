import { render, screen, fireEvent } from '@testing-library/react'
import Select from '../../src/components/Select'
import { vi } from 'vitest'
import React from 'react'

describe("Select", () => {
    const mockFunction = vi.fn()
    it("Should change selection to All when 'All' passed", () => {
        render(<Select selected='All' setSelected={mockFunction} />)
        const selectBox = screen.getByRole('combobox') as HTMLSelectElement;
        expect(selectBox.value).toBe('All');
    })  

    it("Should change selection to Most when 'Most' passed", () => {
        render(<Select selected='Most' setSelected={mockFunction} />)
        const selectBox = screen.getByRole('combobox') as HTMLSelectElement;
        expect(selectBox.value).toBe('Most');
    })  
    
    it("Should change selection to Top when 'Top' passed", () => {
        render(<Select selected='Top' setSelected={mockFunction} />)
        const selectBox = screen.getByRole('combobox') as HTMLSelectElement;
        expect(selectBox.value).toBe('Top');
    })  

    it("Should change selection to Saved when 'Saved' passed", () => {
        render(<Select selected='Saved' setSelected={mockFunction} />)
        const selectBox = screen.getByRole('combobox') as HTMLSelectElement;
        expect(selectBox.value).toBe('Saved');
    })  

    it("Should change selection to Playlists when 'Playlists' passed", () => {
        render(<Select selected='Playlists' setSelected={mockFunction} />)
        const selectBox = screen.getByRole('combobox') as HTMLSelectElement;
        expect(selectBox.value).toBe('Playlists');
    })  
})
