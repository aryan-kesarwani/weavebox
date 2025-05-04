"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from 'react-router-dom'
import { useArweaveWallet} from '../utils/util'
import { setUserAddress } from '../redux/slices/arConnectionSlice'
import { useDispatch } from 'react-redux'

// Self-contained component with no external dependencies beyond React
const WeaveBoxLanding: React.FC = () => {
  // State management
  const [darkMode, setDarkMode] = useState<boolean>(true)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false)
  const [username, setUsername] = useState<string>("")
  const [walletAddressInput, setWalletAddressInput] = useState<string>("")
  const [isScrolled, setIsScrolled] = useState<boolean>(false)
  
  // Router and Redux hooks
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  // Use the custom hooks from util.ts
  const { handleConnectWallet } = useArweaveWallet()

  // Canvas ref for particle animation
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove("dark")
    } else {
      document.documentElement.classList.add("dark")
    }
  }, [darkMode])

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Particle animation for hero section
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const devicePixelRatio = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * devicePixelRatio
      canvas.height = canvas.offsetHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    setCanvasDimensions()

    // Particle properties
    const particles: {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
    }[] = []

    // Create particles
    const createParticles = () => {
      particles.length = 0
      const particleCount = Math.min(Math.floor(window.innerWidth / 10), 100)

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: `rgba(${37 + Math.random() * 100}, ${99 + Math.random() * 50}, ${235 + Math.random() * 20}, ${
            0.2 + Math.random() * 0.3
          })`,
        })
      }
    }

    createParticles()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      particles.forEach((particle) => {
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        particle.x += particle.speedX
        particle.y += particle.speedY

        // Bounce off walls
        if (particle.x < 0 || particle.x > canvas.offsetWidth) {
          particle.speedX = -particle.speedX
        }

        if (particle.y < 0 || particle.y > canvas.offsetHeight) {
          particle.speedY = -particle.speedY
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      setCanvasDimensions()
      createParticles()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Custom connect wallet function that handles UI state
  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      // Call the actual connect wallet function from the hook
      await handleConnectWallet()
      // If successful, navigate to dashboard
      navigate('/dashboard')
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  // Handle sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Attempting to sign in with:", walletAddressInput, username)
      // Using the imported userSignIn function
      // For now just close the modal - implement actual sign-in as needed
      dispatch(setUserAddress(walletAddressInput))
      setShowSignInModal(false)
      navigate('/dashboard')
    } catch (error) {
      console.error("Error during sign in:", error)
    }
  }

  // Features data
  const features = [
    {
      title: "Permanent Storage",
      description: "Files stored forever on the blockchain with no recurring fees or maintenance required.",
    },
    {
      title: "Google Drive Integration",
      description: "Import files directly from Google Drive with our seamless integration.",
    },
    {
      title: "Decentralized Architecture",
      description: "No central point of failure ensures your data is always accessible.",
    },
    {
      title: "One-time Payment",
      description: "Pay once, store forever. No subscriptions or hidden fees.",
    },
    {
      title: "End-to-End Encryption",
      description: "Your files are encrypted before being stored on the blockchain.",
    },
    {
      title: "Unlimited Storage",
      description: "Store as much data as you need without worrying about space limitations.",
    },
  ]

  // Comparison data
  const comparisonFeatures = [
    {
      name: "Storage Duration",
      weavebox: "Permanent (200+ years)",
      googledrive: "As long as you pay",
    },
    {
      name: "Decentralization",
      weavebox: "Fully decentralized",
      googledrive: "Centralized",
    },
    {
      name: "Cost Model",
      weavebox: "One-time payment",
      googledrive: "Recurring subscription",
    },
    {
      name: "Privacy",
      weavebox: "End-to-end encryption",
      googledrive: "Company can access data",
    },
    {
      name: "Data Ownership",
      weavebox: "You own your data",
      googledrive: "Terms of service apply",
    },
    {
      name: "Censorship Resistance",
      weavebox: "Highly resistant",
      googledrive: "Subject to regulations",
    },
  ]

  // Testimonials data
  const testimonials = [
    {
      name: "John Doe",
      role: "Blockchain Developer",
      initials: "JD",
      quote:
        "WeaveBox has revolutionized how I store critical code repositories. The permanent storage gives me peace of mind that my work will never be lost.",
    },
    {
      name: "Sarah Anderson",
      role: "Digital Artist",
      initials: "SA",
      quote:
        "As an artist, preserving my work is paramount. WeaveBox ensures my creations will be accessible for generations to come.",
    },
    {
      name: "Michael Roberts",
      role: "Research Scientist",
      initials: "MR",
      quote:
        "Data accessibility and censorship resistance are critical in my field. WeaveBox provides both with a simple, elegant solution.",
    },
  ]

  // Animation classes for elements that fade in on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-visible")
          }
        })
      },
      { threshold: 0.1 },
    )

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el)
    })

    return () => {
      document.querySelectorAll(".animate-on-scroll").forEach((el) => {
        observer.unobserve(el)
      })
    }
  }, [])

  return (
    <div className="weavebox-landing">
      {/* Navbar */}
      <header className={`navbar ${isScrolled ? "navbar-scrolled" : ""} ${darkMode ? "navbar-dark" : ""}`}>
        <div className="navbar-container">
          <a href="#" className="logo">
            <div className="logo-icon">
              <span>W</span>
            </div>
            <span className="logo-text">WeaveBox</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#comparison" className="nav-link">
              Comparison
            </a>
            <a href="#testimonials" className="nav-link">
              Testimonials
            </a>
          </nav>

          <div className="desktop-actions">
            {/* Theme Toggle */}
            <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle" aria-label="Toggle theme">
              {darkMode ? (
                <svg className="sun-icon" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="moon-icon" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Sign In Button */}
            {/* <button className="sign-in-button" onClick={() => setShowSignInModal(true)}>
              Sign In
            </button> */}

            {/* Connect Wallet Button */}
            <button className="connect-wallet-button" onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? (
                <div className="connecting">
                  <div className="spinner"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="wallet-icon-text">
                  <svg className="wallet-icon" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span>Connect Wallet</span>
                </div>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="mobile-menu-button">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? (
                <svg className="close-icon" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="menu-icon" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-container">
              <a href="#features" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Features
              </a>
              <a href="#comparison" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Comparison
              </a>
              <a href="#testimonials" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Testimonials
              </a>
              <div className="mobile-actions">
                <button
                  className="mobile-sign-in"
                  onClick={() => {
                    setIsMenuOpen(false)
                    setShowSignInModal(true)
                  }}
                >
                  Sign In
                </button>
                <button
                  className="mobile-connect-wallet"
                  onClick={() => {
                    setIsMenuOpen(false)
                    connectWallet()
                  }}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <div className="connecting">
                      <div className="spinner"></div>
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <div className="wallet-icon-text">
                      <svg className="wallet-icon" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <span>Connect Wallet</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <canvas ref={canvasRef} className="particle-canvas"></canvas>
          <div className="hero-container">
            <div className="hero-content animate-on-scroll">
              <div className="hero-badge">
                <span className="badge-dot"></span>
                Decentralized Storage Solution
              </div>
              <h1 className="hero-title">
                <span className="gradient-text">WeaveBox</span>
                <br />
                <span className="hero-subtitle">Permanent File Storage</span>
              </h1>
              <p className="hero-description">
                Upload and store your files permanently on Arweave. One-time payment, lifetime storage, with Google
                Drive integration.
              </p>
              <div className="hero-buttons">
                <button className="primary-button" onClick={connectWallet} disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <div className="spinner"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="wallet-icon" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <span>Connect Wallet</span>
                    </>
                  )}
                </button>
                <button className="secondary-button">
                  Learn More
                  <svg className="arrow-icon" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="hero-image animate-on-scroll">
              <div className="file-browser">
                <div className="browser-header">
                  <div className="browser-dots">
                    <div className="browser-dot red"></div>
                    <div className="browser-dot yellow"></div>
                    <div className="browser-dot green"></div>
                  </div>
                </div>
                <div className="browser-content">
                  <div className="file-grid">
                    <div className="file-item pdf">
                      <div className="file-icon">PDF</div>
                    </div>
                    <div className="file-item img">
                      <div className="file-icon">IMG</div>
                    </div>
                    <div className="file-item doc">
                      <div className="file-icon">DOC</div>
                    </div>
                  </div>
                  <div className="file-details">
                    <div className="file-line"></div>
                    <div className="file-line medium"></div>
                    <div className="file-line short"></div>
                  </div>
                  <div className="file-actions">
                    <div className="file-action-button"></div>
                    <div className="file-action-primary"></div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="decorative-blob top-right"></div>
              <div className="decorative-blob bottom-left"></div>
            </div>
          </div>

          {/* Wave divider */}
          <div className="wave-divider">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
              <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
            </svg>
          </div>
        </section>

        {/* Key Features Section */}
        <section id="features" className="features-section">
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title animate-on-scroll">Key Features</h2>
              <p className="section-description animate-on-scroll">
                WeaveBox offers a revolutionary approach to file storage with these powerful features
              </p>
            </div>

            <div className="features-grid">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="feature-card animate-on-scroll"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`feature-icon feature-icon-${index % 3}`}>
                    {index % 3 === 0 ? (
                      <svg viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : index % 3 === 1 ? (
                      <svg viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                        />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                        />
                      </svg>
                    )}
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Comparison Section */}
        <section id="comparison" className="comparison-section">
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title animate-on-scroll">WeaveBox vs. Traditional Storage</h2>
              <p className="section-description animate-on-scroll">
                See how WeaveBox compares to traditional cloud storage solutions
              </p>
            </div>

            <div className="comparison-table-wrapper animate-on-scroll">
              <div className="comparison-table">
                <div className="comparison-header">
                  <div className="comparison-header-cell empty"></div>
                  <div className="comparison-header-cell weavebox">
                    <div className="comparison-product">WeaveBox</div>
                    <div className="comparison-type">Decentralized Storage</div>
                  </div>
                  <div className="comparison-header-cell googledrive">
                    <div className="comparison-product">Google Drive</div>
                    <div className="comparison-type">Traditional Storage</div>
                  </div>
                </div>

                <div className="comparison-body">
                  {comparisonFeatures.map((feature, index) => (
                    <div key={index} className="comparison-row">
                      <div className="comparison-cell feature-name">{feature.name}</div>
                      <div className="comparison-cell weavebox-value">
                        <div className="check-wrapper">
                          <svg className="check-icon" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature.weavebox}</span>
                        </div>
                      </div>
                      <div className="comparison-cell googledrive-value">{feature.googledrive}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="testimonials-section">
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title animate-on-scroll">What Our Users Say</h2>
              <p className="section-description animate-on-scroll">
                Join thousands of satisfied users who trust WeaveBox with their valuable data
              </p>
            </div>

            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="testimonial-card animate-on-scroll"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="quote-icon">
                    <svg viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                  </div>
                  <div className="testimonial-header">
                    <div className="testimonial-avatar">
                      <span>{testimonial.initials}</span>
                    </div>
                    <div className="testimonial-author">
                      <h3 className="testimonial-name">{testimonial.name}</h3>
                      <p className="testimonial-role">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="testimonial-stars">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`star-icon ${i < 5 - (index === 2 ? 1 : 0) ? "filled" : ""}`}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    ))}
                  </div>
                  <p className="testimonial-quote">{testimonial.quote}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-background"></div>
          <div className="section-container">
            <div className="cta-content animate-on-scroll">
              <h2 className="cta-title">Ready to Store Your Files Forever?</h2>
              <p className="cta-description">
                Join thousands of users who trust WeaveBox for permanent, decentralized storage. Pay once, store
                forever.
              </p>
              <div className="cta-buttons">
                <button className="primary-button" onClick={connectWallet} disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <div className="spinner"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="wallet-icon" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <span>Connect Wallet</span>
                    </>
                  )}
                </button>
                <button className="secondary-button">Contact Sales</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-column">
              <a href="#" className="footer-logo">
                <div className="logo-icon">
                  <span>W</span>
                </div>
                <span className="logo-text">WeaveBox</span>
              </a>
              <p className="footer-description">
                WeaveBox offers permanent storage solutions for your important files and documents, built on Arweave
                blockchain.
              </p>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="GitHub">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <svg viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="Email">
                  <svg viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer-column">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                <li>
                  <a href="#" className="footer-link">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#features" className="footer-link">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#comparison" className="footer-link">
                    Comparison
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="footer-link">
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-title">Resources</h3>
              <ul className="footer-links">
                <li>
                  <a href="#" className="footer-link">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-title">Subscribe</h3>
              <p className="footer-description">Stay updated with the latest features and releases.</p>
              <div className="subscribe-form">
                <input type="email" placeholder="Enter your email" className="subscribe-input" />
                <button className="subscribe-button">Subscribe</button>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="copyright">© {new Date().getFullYear()} WeaveBox. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Sign In Modal */}
      {showSignInModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button onClick={() => setShowSignInModal(false)} className="modal-close" aria-label="Close modal">
              <svg viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="modal-title">Sign in with wallet</h3>

            <form onSubmit={handleSignIn} className="modal-form">
              <div className="form-group">
                <label htmlFor="walletAddress" className="form-label">
                  Wallet Address
                </label>
                <input
                  id="walletAddress"
                  type="text"
                  value={walletAddressInput}
                  onChange={(e) => setWalletAddressInput(e.target.value)}
                  placeholder="Enter your wallet address"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="form-input"
                  required
                />
              </div>

              <button type="submit" className="modal-submit">
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Base Styles */
        :root {
          --primary-blue: #2563eb;
          --primary-purple: #9333ea;
          --gradient: linear-gradient(to right, var(--primary-blue), var(--primary-purple));
          --text-primary: #111827;
          --text-secondary: #4b5563;
          --text-tertiary: #6b7280;
          --bg-primary: #ffffff;
          --bg-secondary: #f9fafb;
          --bg-tertiary: #f3f4f6;
          --border-color: #e5e7eb;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          --radius-sm: 0.25rem;
          --radius: 0.5rem;
          --radius-md: 0.75rem;
          --radius-lg: 1rem;
          --transition: all 0.2s ease;
          --transition-slow: all 0.3s ease;
        }

        .dark {
          --text-primary: #f9fafb;
          --text-secondary: #e5e7eb;
          --text-tertiary: #9ca3af;
          --bg-primary: #111827;
          --bg-secondary: #1f2937;
          --bg-tertiary: #374151;
          --border-color: #374151;
        }

        /* Global Styles */
        .weavebox-landing {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: var(--text-primary);
          background: var(--bg-primary);
          line-height: 1.5;
          min-height: 100vh;
          transition: var(--transition);
        }

        /* Navbar Styles */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          padding: 1.25rem 0;
          transition: var(--transition);
          background-color: transparent;
        }

        .navbar-scrolled {
          padding: 0.75rem 0;
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          box-shadow: var(--shadow);
        }

        .navbar-dark.navbar-scrolled {
          background-color: rgba(17, 24, 39, 0.8);
        }

        .navbar-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .logo-icon {
          width: 2rem;
          height: 2rem;
          border-radius: var(--radius-sm);
          background: var(--gradient);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-icon span {
          color: white;
          font-weight: bold;
          font-size: 1.25rem;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: bold;
          background: var(--gradient);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .desktop-nav {
          display: none;
        }

        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          padding: 0.5rem 1rem;
          transition: var(--transition);
        }

        .nav-link:hover {
          color: var(--primary-blue);
        }

        .desktop-actions {
          display: none;
        }

        .theme-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          color: var(--text-tertiary);
          transition: var(--transition);
        }

        .theme-toggle:hover {
          color: var(--text-primary);
        }

        .sun-icon, .moon-icon {
          width: 1.25rem;
          height: 1.25rem;
          stroke: currentColor;
          fill: none;
        }

        .sign-in-button {
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
          border: 1px solid var(--border-color);
          background: transparent;
          color: var(--text-primary);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
        }

        .sign-in-button:hover {
          background: var(--bg-tertiary);
        }

        .connect-wallet-button {
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
          border: none;
          background: var(--gradient);
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .connect-wallet-button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: var(--shadow);
        }

        .connect-wallet-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .wallet-icon-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .wallet-icon {
          width: 1rem;
          height: 1rem;
          stroke: currentColor;
          fill: none;
        }

        .connecting {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .mobile-menu-button {
          display: block;
        }

        .mobile-menu-button button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          color: var(--text-primary);
        }

        .menu-icon, .close-icon {
          width: 1.5rem;
          height: 1.5rem;
          stroke: currentColor;
          fill: none;
        }

        .mobile-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-primary);
          box-shadow: var(--shadow-md);
          z-index: 40;
        }

        .mobile-menu-container {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-nav-link {
          color: var(--text-primary);
          text-decoration: none;
          padding: 0.75rem 0;
          display: block;
          transition: var(--transition);
        }

        .mobile-nav-link:hover {
          color: var(--primary-blue);
        }

        .mobile-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-color);
        }

        .mobile-sign-in {
          padding: 0.75rem;
          border-radius: var(--radius);
          border: 1px solid var(--border-color);
          background: transparent;
          color: var(--text-primary);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          width: 100%;
        }

        .mobile-sign-in:hover {
          background: var(--bg-tertiary);
        }

        .mobile-connect-wallet {
          padding: 0.75rem;
          border-radius: var(--radius);
          border: none;
          background: var(--gradient);
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .mobile-connect-wallet:hover {
          opacity: 0.9;
        }

        .mobile-connect-wallet:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Hero Section Styles */
        .hero-section {
          position: relative;
          padding: 8rem 0 5rem;
          overflow: hidden;
        }

        .particle-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0.3;
        }

        .dark .particle-canvas {
          opacity: 0.2;
        }

        .hero-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
          position: relative;
          z-index: 10;
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          align-items: center;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background-color: rgba(37, 99, 235, 0.1);
          color: var(--primary-blue);
          padding: 0.375rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          width: fit-content;
        }

        .dark .hero-badge {
          background-color: rgba(37, 99, 235, 0.2);
        }

        .badge-dot {
          position: relative;
          display: inline-block;
          width: 0.5rem;
          height: 0.5rem;
        }

        .badge-dot::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-color: var(--primary-blue);
          opacity: 0.75;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .badge-dot::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-color: var(--primary-blue);
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
        }

        .gradient-text {
          background: var(--gradient);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-subtitle {
          color: var(--text-primary);
        }

        .hero-description {
          font-size: 1.125rem;
          color: var(--text-secondary);
          max-width: 32rem;
        }

        .hero-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .primary-button {
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius);
          border: none;
          background: var(--gradient);
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .primary-button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: var(--shadow);
        }

        .primary-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .secondary-button {
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius);
          border: 1px solid var(--border-color);
          background: transparent;
          color: var(--text-primary);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .secondary-button:hover {
          background: var(--bg-tertiary);
        }

        .arrow-icon {
          width: 1rem;
          height: 1rem;
          stroke: currentColor;
          fill: none;
          transition: var(--transition);
        }

        .secondary-button:hover .arrow-icon {
          transform: translateX(4px);
        }

        .hero-users {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
        }

        .user-avatars {
          display: flex;
        }

        .user-avatar {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          border: 2px solid var(--bg-primary);
          background-color: var(--bg-tertiary);
          margin-left: -0.5rem;
        }

        .user-avatar:first-child {
          margin-left: 0;
        }

        .users-text {
          font-size: 0.875rem;
          color: var(--text-tertiary);
        }

        .users-count {
          font-weight: 600;
          color: var(--text-primary);
        }

        .hero-image {
          position: relative;
        }

        .file-browser {
          position: relative;
          z-index: 10;
          background: var(--bg-primary);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
        }

        .browser-header {
          height: 3rem;
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          padding: 0 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .browser-dots {
          display: flex;
          gap: 0.5rem;
        }

        .browser-dot {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
        }

        .browser-dot.red {
          background-color: #ef4444;
        }

        .browser-dot.yellow {
          background-color: #f59e0b;
        }

        .browser-dot.green {
          background-color: #10b981;
        }

        .browser-content {
          padding: 1.5rem;
        }

        .file-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .file-item {
          aspect-ratio: 1;
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .file-item.pdf {
          background-color: rgba(37, 99, 235, 0.1);
        }

        .file-item.img {
          background-color: rgba(147, 51, 234, 0.1);
        }

        .file-item.doc {
          background-color: rgba(16, 185, 129, 0.1);
        }

        .dark .file-item.pdf {
          background-color: rgba(37, 99, 235, 0.2);
        }

        .dark .file-item.img {
          background-color: rgba(147, 51, 234, 0.2);
        }

        .dark .file-item.doc {
          background-color: rgba(16, 185, 129, 0.2);
        }

        .file-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 500;
        }

        .file-item.pdf .file-icon {
          background-color: #2563eb;
        }

        .file-item.img .file-icon {
          background-color: #9333ea;
        }

        .file-item.doc .file-icon {
          background-color: #10b981;
        }

        .file-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .file-line {
          height: 1rem;
          background-color: var(--bg-tertiary);
          border-radius: 9999px;
          width: 100%;
        }

        .file-line.medium {
          width: 83.333333%;
        }

        .file-line.short {
          width: 66.666667%;
        }

        .file-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .file-action-button {
          height: 2rem;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-sm);
          width: 33.333333%;
        }

        .file-action-primary {
          height: 2rem;
          background: var(--gradient);
          border-radius: var(--radius-sm);
          width: 33.333333%;
        }

        .decorative-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.2;
          z-index: 1;
        }

        .decorative-blob.top-right {
          top: -1.5rem;
          right: -1.5rem;
          width: 6rem;
          height: 6rem;
          background: linear-gradient(to bottom right, #2563eb, #9333ea);
        }

        .decorative-blob.bottom-left {
          bottom: -2rem;
          left: -2rem;
          width: 10rem;
          height: 10rem;
          background: linear-gradient(to top right, #9333ea, #2563eb);
        }

        .wave-divider {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
        }

        .wave-divider svg {
          width: 100%;
          height: auto;
          display: block;
          fill: var(--bg-tertiary);
        }

        /* Features Section Styles */
        .features-section {
          padding: 5rem 0;
          background-color: var(--bg-tertiary);
        }

        .section-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .section-description {
          font-size: 1.125rem;
          color: var(--text-secondary);
          max-width: 36rem;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .feature-card {
          background-color: var(--bg-primary);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow);
          border: 1px solid var(--border-color);
          transition: var(--transition);
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .feature-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          border-radius: var(--radius);
          margin-bottom: 1rem;
          color: white;
        }

        .feature-icon svg {
          width: 1.5rem;
          height: 1.5rem;
          stroke: currentColor;
          fill: none;
        }

        .feature-icon-0 {
          background: linear-gradient(to right, #2563eb, #4f46e5);
        }

        .feature-icon-1 {
          background: linear-gradient(to right, #9333ea, #7c3aed);
        }

        .feature-icon-2 {
          background: linear-gradient(to right, #4f46e5, #6366f1);
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .feature-description {
          color: var(--text-secondary);
        }

        /* Comparison Section Styles */
        .comparison-section {
          padding: 5rem 0;
        }

        .comparison-table-wrapper {
          overflow-x: auto;
        }

        .comparison-table {
          min-width: 768px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }

        .comparison-header {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
        }

        .comparison-header-cell {
          padding: 1.5rem;
          text-align: center;
        }

        .comparison-header-cell.empty {
          background-color: transparent;
        }

        .comparison-header-cell.weavebox {
          background: var(--gradient);
          color: white;
          border-top-left-radius: var(--radius-lg);
        }

        .comparison-header-cell.googledrive {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          border-top-right-radius: var(--radius-lg);
        }

        .comparison-product {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .comparison-type {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .comparison-body {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-top: none;
        }

        .comparison-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          border-bottom: 1px solid var(--border-color);
        }

        .comparison-row:last-child {
          border-bottom: none;
        }

        .comparison-cell {
          padding: 1.5rem;
        }

        .comparison-cell.feature-name {
          font-weight: 500;
        }

        .comparison-cell.weavebox-value {
          border-left: 1px solid var(--border-color);
          color: var(--primary-blue);
        }

        .comparison-cell.googledrive-value {
          border-left: 1px solid var(--border-color);
          color: var(--text-tertiary);
        }

        .check-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .check-icon {
          width: 1rem;
          height: 1rem;
          stroke: currentColor;
          fill: none;
          background-color: rgba(37, 99, 235, 0.1);
          padding: 0.25rem;
          border-radius: 50%;
        }

        .dark .check-icon {
          background-color: rgba(37, 99, 235, 0.2);
        }

        /* Testimonials Section Styles */
        .testimonials-section {
          padding: 5rem 0;
          background-color: var(--bg-tertiary);
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .testimonial-card {
          background-color: var(--bg-primary);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow);
          border: 1px solid var(--border-color);
          position: relative;
          transition: var(--transition);
        }

        .testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .quote-icon {
          position: absolute;
          top: -1rem;
          right: -1rem;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: var(--gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .quote-icon svg {
          width: 1.25rem;
          height: 1.25rem;
          stroke: currentColor;
          fill: none;
        }

        .testimonial-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .testimonial-avatar {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background: var(--gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          margin-right: 1rem;
        }

        .testimonial-name {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .testimonial-role {
          font-size: 0.875rem;
          color: var(--text-tertiary);
        }

        .testimonial-stars {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 1rem;
        }

        .star-icon {
          width: 1rem;
          height: 1rem;
          stroke: #f59e0b;
          fill: none;
        }

        .star-icon.filled {
          fill: #f59e0b;
        }

        .testimonial-quote {
          color: var(--text-secondary);
          font-style: italic;
        }

        /* CTA Section Styles */
        .cta-section {
          padding: 5rem 0;
          position: relative;
          overflow: hidden;
        }

        .cta-background {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(37, 99, 235, 0.05), rgba(147, 51, 234, 0.05));
        }

        .dark .cta-background {
          background: linear-gradient(to right, rgba(37, 99, 235, 0.1), rgba(147, 51, 234, 0.1));
        }

        .cta-content {
          max-width: 48rem;
          margin: 0 auto;
          text-align: center;
        }

        .cta-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .cta-description {
          font-size: 1.125rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .cta-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          justify-content: center;
        }

        /* Footer Styles */
        .footer {
          background-color: var(--bg-primary);
          border-top: 1px solid var(--border-color);
        }

        .footer-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 3rem 1rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .footer-column {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          margin-bottom: 0.5rem;
        }

        .footer-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .footer-description {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-link {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background-color: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          transition: var(--transition);
        }

        .social-link:hover {
          background-color: var(--primary-blue);
          color: white;
        }

        .social-link svg {
          width: 1rem;
          height: 1rem;
          fill: currentColor;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .footer-link {
          color: var(--text-secondary);
          text-decoration: none;
          transition: var(--transition);
        }

        .footer-link:hover {
          color: var(--primary-blue);
        }

        .subscribe-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .subscribe-input {
          padding: 0.75rem 1rem;
          border-radius: var(--radius);
          border: 1px solid var(--border-color);
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .subscribe-button {
          padding: 0.75rem 1rem;
          border-radius: var(--radius);
          border: none;
          background: var(--gradient);
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
        }

        .subscribe-button:hover {
          opacity: 0.9;
        }

        .footer-bottom {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
          text-align: center;
        }

        .copyright {
          color: var(--text-tertiary);
          font-size: 0.875rem;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 1rem;
        }

        .modal {
          background-color: var(--bg-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          max-width: 28rem;
          width: 100%;
          padding: 2rem;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-tertiary);
          transition: var(--transition);
        }

        .modal-close:hover {
          color: var(--text-primary);
        }

        .modal-close svg {
          width: 1.5rem;
          height: 1.5rem;
          stroke: currentColor;
          fill: none;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .form-input {
          padding: 0.75rem 1rem;
          border-radius: var(--radius);
          border: 1px solid var(--border-color);
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary-blue);
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }

        .modal-submit {
          padding: 0.75rem 1rem;
          border-radius: var(--radius);
          border: none;
          background: var(--gradient);
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          margin-top: 0.5rem;
        }

        .modal-submit:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        /* Animation Styles */
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .animate-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Responsive Styles */
        @media (min-width: 640px) {
          .hero-title {
            font-size: 3rem;
          }

          .hero-buttons {
            flex-direction: row;
          }

          .cta-buttons {
            flex-direction: row;
          }

          .subscribe-form {
            flex-direction: row;
          }

          .subscribe-input {
            flex: 1;
          }
        }

        @media (min-width: 768px) {
          .desktop-nav {
            display: flex;
            gap: 2rem;
          }

          .desktop-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .mobile-menu-button {
            display: none;
          }

          .hero-container {
            grid-template-columns: 1fr 1fr;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .testimonials-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .testimonials-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .footer-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      ` }} />
    </div>
  )
}

export default WeaveBoxLanding
