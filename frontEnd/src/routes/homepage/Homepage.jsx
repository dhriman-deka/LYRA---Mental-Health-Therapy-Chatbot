import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { useState } from "react";
import "./homepage.css";

const Homepage = () => {
  const [typingStatus, setTypingStatus] = useState("human1");

  return (
    <div className="homepage">
      {/* Background */}
      <div className="background-elements">
        <img src="/orbital.png" alt="" className="orbital" aria-hidden="true" />
        <div className="gradient-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="content-wrapper">
        {/* Left Section */}
        <div className="hero-section">
          <h1 className="main-title">LYRA</h1>
          <h2 className="subtitle">Your AI Companion for Mental Wellness</h2>
          <p className="description">
            Experience a safe, judgment-free space where empathetic AI technology 
            meets therapeutic support. Let Lyra guide you through your mental 
            wellness journey, available 24/7 to listen, understand, and help you 
            grow.
          </p>
          <div className="feature-points">
            <div className="feature">
              <span className="feature-icon">🎯</span>
              <span>Personalized Support</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🌙</span>
              <span>24/7 Availability</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🤝</span>
              <span>Judgment-Free Space</span>
            </div>
          </div>
          <Link to="/sign-in" className="cta-button">
            Begin Your Journey
          </Link>
        </div>

        {/* Right Section */}
        <div className="showcase-section">
          <div className="showcase-container">
            <div className="showcase-background">
              <div className="animated-bg"></div>
            </div>
            <img src="/bot.png" alt="" className="bot-image" />
            
            <div className="chat-interface">
              <div className="chat-avatar">
                <img
                  src={
                    typingStatus === "human1"
                      ? "/human1.jpeg"
                      : typingStatus === "human2"
                      ? "/human2.jpeg"
                      : "/bot.png"
                  }
                  alt=""
                />
              </div>
              <div className="chat-content">
                <TypeAnimation
                  sequence={[
                    "I've been feeling overwhelmed lately...",
                    2000,
                    () => setTypingStatus("bot"),
                    "I understand. Let's work through these feelings together.",
                    2000,
                    () => setTypingStatus("human2"),
                    "It helps to have someone to talk to.",
                    2000,
                    () => setTypingStatus("bot"),
                    "You're taking an important step. I'm here to support you.",
                    2000,
                    () => setTypingStatus("human1"),
                  ]}
                  wrapper="span"
                  repeat={Infinity}
                  cursor={true}
                  omitDeletionAnimation={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="trust-section">
        <div className="trust-point">
          <span className="trust-icon">🔒</span>
          <p>Private & Secure</p>
        </div>
        <div className="trust-point">
          <span className="trust-icon">💡</span>
          <p>Evidence-Based Approach</p>
        </div>
        <div className="trust-point">
          <span className="trust-icon">❤️</span>
          <p>Empathetic Support</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <nav className="footer-links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/crisis">Crisis Resources</Link>
            <span className="copyright">© 2024 Konarq Technologies</span>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;