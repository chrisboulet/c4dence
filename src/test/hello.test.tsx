import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

const HelloWorld = () => <h1>Hello World</h1>

describe('HelloWorld', () => {
    it('renders correctly', () => {
        render(<HelloWorld />)
        expect(screen.getByText('Hello World')).toBeInTheDocument()
    })
})
