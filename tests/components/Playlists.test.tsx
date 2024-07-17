import { render, screen } from '@testing-library/react'
import Playlists from '../../src/components/Playlists'
import { vi } from 'vitest'
import React from 'react'

describe("Playlists", () => {
    const mockFunction = vi.fn();
    const mockTitle = 'testPlaylist'
    const mockId = 'testId'
    const mockDivRef = {
        current: document.createElement('div')
      };
      

    it("Should not render list of playlists, and give message about there being no playlists", () => {
        render(<Playlists name={mockTitle} playlistDivRef={mockDivRef} playlists={[]} personal={mockId} handleSendPlaylist={mockFunction}/>)
        // Absence of buttons
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        // Presence of lack of playlist message
        expect(screen.getByText(/no playlists/i)).toBeInTheDocument();
    });
    
    it("Should render the list of playlists, and prompt user to choose one", () => {
        const mockPlaylists = [
            {
                owner: {
                    id: mockId
                },
                images: [
                    {
                        url: 'dskjfsd'
                    }
                ],
                name: 'testPlaylistName',
                collaborative: true
            }
        ]
        render(<Playlists name={mockTitle} playlistDivRef={mockDivRef} playlists={mockPlaylists} personal={mockId} handleSendPlaylist={mockFunction}/>)
        // Title in message
        expect(screen.queryByText(mockTitle)).toBeInTheDocument();
        // Playlist Listed
        expect(screen.queryByText('testPlaylistName')).toBeInTheDocument();
        // Img Presence
        expect(screen.getByRole('presentation')).toBeInTheDocument();
    })
})