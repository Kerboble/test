





import React from 'react';
import Sphere from "../img/icons8-sphere-51.png"

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="header">
        <div className="logo"> <img src={Sphere} alt="Sphere"/> </div>
        <nav>
          <ul>
            <li><a href="#">My Courses</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">About</a></li>
          </ul>
        </nav>
        <div className="search">
          <input type="text" placeholder="Search courses..." />
          <button>Search</button>
        </div>
      </header>
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Our Platform</h1>
          <p>Learn coding interactively with our online courses.</p>
          <button>Get Learning!</button>
        </div>
      </section>
      <section className="features">
        <h2>Our Features</h2>
        <div className="feature-list">
          <div className="feature-item">
            <h3>Interactive Learning</h3>
            <p>Engage with interactive code playgrounds from the comfort of home or wherever you choose to work.</p>
          </div>
          <div className="feature-item">
            <h3>Expert Instructors</h3>
            <p>Learn from industry experts and experienced instructors.</p>
          </div>
          <div className="feature-item">
            <h3>Flexible Schedule</h3>
            <p>Study remote to allow you to save on gas and supplies.</p>
          </div>
        </div>
      </section>
      <footer className="footer">
        <p>&copy; 2024 StudySphere. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;