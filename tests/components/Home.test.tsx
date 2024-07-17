import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '../../src/components/Home.tsx';
describe('Home', () => {
    it("Should render the login page if token is not found", () => {
        render(<Home />)
        expect(screen.queryByText(/approve/i)).toBeInTheDocument();
    })
})