import React from 'react'
import { render, screen } from '@testing-library/react'
import HomePage from '../../src/pages/HomePage.tsx'
describe('Home', () => {
    it("Should render the login page if token is not found", () => {
        render(<HomePage />)
        expect(screen.queryByText(/approve/i)).toBeInTheDocument();
    });

    it("")
})