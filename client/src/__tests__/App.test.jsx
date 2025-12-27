import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import LoginPage from '../pages/LoginPage'

// Mocking useAuthStore
const loginMock = vi.fn()
const checkAuthMock = vi.fn()

vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    token: null,
    login: loginMock,
    checkAuth: checkAuthMock,
    isLoading: false,
    error: null,
  })),
}))

// Mocking Backend API calls (Simulating Firebase/Database interactions)
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
  })
)

describe('ASSET3D Application Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 1. Design Test: Checking if main layout elements render
  it('Design Test: Renders Login Page correctly with Logo and Title', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    // Check for "ASSET3D" title
    expect(screen.getByText('ASSET3D')).toBeInTheDocument()

    // Check for "Aktivaforvaltningssystem" subtitle
    expect(screen.getByText('Aktivaforvaltningssystem')).toBeInTheDocument()

    // Check if input fields exist (Design check)
    // Using placeholder text to avoid multiple element errors with labels
    expect(screen.getByPlaceholderText(/navn@selskap.no/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
  })

  // 2. Language Test: Checking for specific Norwegian text strings
  it('Language Test: Checks for correct Norwegian text', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    // Using getAllByText because "Logg inn" appears in the button AND maybe in other places,
    // but here we just want to ensure it exists.
    // Actually, "Logg inn" is unique as button text in this view.
    // "Passord" is in the label AND the helper text.
    expect(screen.getByRole('button', { name: /logg inn/i })).toBeInTheDocument()
    expect(screen.getByText('Husk meg')).toBeInTheDocument()
    expect(screen.getByText('Glemt passord?')).toBeInTheDocument()
  })

  // 3. Button Test: Simulating interactions
  it('Button Test: Updates input and submits form on button click', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const emailInput = screen.getByPlaceholderText(/navn@selskap.no/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    const submitButton = screen.getByRole('button', { name: /logg inn/i })

    // Simulate typing
    fireEvent.change(emailInput, { target: { value: 'test@asset3d.no' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    // Check if values updated
    expect(emailInput.value).toBe('test@asset3d.no')
    expect(passwordInput.value).toBe('password123')

    // Simulate click
    fireEvent.click(submitButton)

    // Verify login function was called (Mocked Function Test)
    expect(loginMock).toHaveBeenCalledWith('test@asset3d.no', 'password123')
  })

  // 4. "Firebase" / Backend Test (Mocked)
  // Since we use PostgreSQL, this mocks the API response we would expect from the backend.
  it('Backend/Database Mock Test: Simulates backend auth check', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    // Verify checkAuth is called on mount
    expect(checkAuthMock).toHaveBeenCalled()
  })
})
