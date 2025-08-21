import React from 'react'
import { render, screen } from '@testing-library/react'
import { ApprovedApplicationMessage } from '../../src/features/applications'

describe('ApprovedApplicationMessage', () => {
  it('renders approval message', () => {
    render(<ApprovedApplicationMessage />)
    expect(screen.getByText(/одобрена/)).toBeInTheDocument()
  })
})