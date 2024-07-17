import { render, screen } from '@testing-library/react'
import SideBar from '../../src/components/SideBar'
import React from 'react'
import { vi } from 'vitest'

describe("SideBar", () => {
    const mockFunction = vi.fn();
    const mockUsername = "testUsername"
    const mockPlaylists = [
        {
            id: 'testId',
            name: 'testName'
        }
    ]
    it("Should show no playlists if nothing is passed as a playlist prop, but still display username", () => {
        render(<SideBar sidebar={'home'} setSidebar={mockFunction} username={mockUsername} playlist={[]} handleSendPlaylist={mockFunction} handleSideBarClick={mockFunction} />)
        // Presence of username
        expect(screen.getByText(`Hello ${mockUsername}`)).toBeInTheDocument();
        // Absence of Tooltip for playlists
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it("Should render name of playlist", () => {
        render(<SideBar sidebar={'home'} setSidebar={mockFunction} username={mockUsername} playlist={mockPlaylists} handleSendPlaylist={mockFunction} handleSideBarClick={mockFunction} />)
        // Absence of Tooltip for playlists
        expect(screen.queryByText('testName')).toBeInTheDocument();
    });
})