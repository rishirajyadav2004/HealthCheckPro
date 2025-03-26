import React, { useState , useEffect , useMemo} from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Carousel, Card, Row, Col, Accordion, Modal, Button } from "react-bootstrap";
import "../styles/LandingPage.css";
import "bootstrap/dist/css/bootstrap.min.css";
import BMICalculator from "../components/BMICalculator.js";
import WorkoutPlans from "../components/DietPlans.js";
import DietPlans from "../components/WorkoutPlans.js";




const LandingPage = () => {
    const [showBMI, setShowBMI] = useState(false);
    const [showWorkout, setShowWorkout] = useState(false);
    const [showDiet, setShowDiet] = useState(false);
    const navigate = useNavigate(); // For navigation
  
    // Dynamic background for hero section
    const [bgColor, setBgColor] = useState("#64B5F6");
    const colors = useMemo(() => ["#BBDEFB", "#90CAF9", "#64B5F6", "#42A5F5", "#2196F3", "#1E88E5", "#1565C0"], []);
    
  
    useEffect(() => {
      const interval = setInterval(() => {
        setBgColor(colors[Math.floor(Math.random() * colors.length)]);
        
      }, 3000); // Change color every 3 seconds
  
      return () => clearInterval(interval);
    }, [colors]);
  
    return (
    <div>
      {/* Navbar Section */}
      <Navbar className="custom-navbar" expand="lg" fixed="top">
        <Container>
          <Navbar.Brand href="#home">
            <img 
              src="healthcheckpro-logo.webp"
              alt="HealthCheckPro Logo"
              width="90" 
              height="80" 
              className="d-inline-block align-top me-2"
            />
            Health Check Pro
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#features">Features</Nav.Link>
              <Nav.Link href="#faqs">FAQs</Nav.Link>
              <Nav.Link href="#contact">Contact</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>


      {/* Hero Section with Buttons */}
      <section className="animated-bg" style={{ backgroundColor: bgColor }}>

        <Container className="text-center">
          <h1 className="hero-title">Your Journey to Better Health Starts Here</h1>
          <p className="hero-subtitle">Track your progress, set goals, and build a healthier future.</p>
          <div className="hero-buttons">
            <Button className="btn-get-started" onClick={() => navigate("/register")}>Get Started</Button>
            <Button className="btn-sign-in" onClick={() => navigate("/login")}>Sign In</Button>
          </div>
        </Container>
      </section>


      {/* Carousel Section */}
      <Container className="carousel-container">
        <Carousel className="mb-5">
          <Carousel.Item>
            <img className="d-block w-100" src="Diet and Nutrition1.jpg" alt="Feature 1" />
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-100" src="Personalized healthScore1.jpg" alt="Feature 2" />
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-100" src="user friendly1.jpg" alt="Feature 3" />
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-100" src="fitness community1.jpg" alt="Feature 4" />
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-100" src="secure1.jpg" alt="Feature 5" />
          </Carousel.Item>
        </Carousel>
      </Container>
      <section id="about" class="about-section py-5">
  <div class="container">
    <h2 class="mb-4">About Us</h2>
    <p class="about-text">
      At <strong>Health Check Pro</strong>, we believe that health is the greatest wealth. 
      In today's fast-paced world, people often ignore minor health issues that could lead to serious conditions. 
      Our AI-powered platform bridges this gap by providing real-time health insights based on user queries.
    </p>
    <p class="about-text">
      Using advanced artificial intelligence and machine learning, we analyze symptoms, offer preliminary health assessments, 
      and provide actionable advice. Our goal is to empower individuals with the right knowledge so they can make informed 
      health decisions and seek professional help when necessary.
    </p>
    <p class="about-text">
      We are committed to making healthcare more accessible and efficient by integrating technology with expert knowledge. 
      Whether you need to track symptoms, get AI-powered recommendations, or consult medical professionals, 
      Health Check Pro is here to support you on your wellness journey.
    </p>
  </div>
</section>


     {/* Features Section */}
<Container id="features">
  <h2 className="text-center mb-4">Our Key Features</h2>
  <Row>
    <Col md={4}>
      <Card className="mb-4 shadow">
        <Card.Img variant="top" src="AI-Powered Health Queries.webp" />
        <Card.Body>
          <Card.Title>AI-Powered Health Queries</Card.Title>
          <Card.Text>
            Ask health-related questions and get AI-driven insights based on medical data.
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
    <Col md={4}>
      <Card className="mb-4 shadow">
        <Card.Img variant="top" src="Personalized Health Suggestions.jpg" />
        <Card.Body>
          <Card.Title>Personalized Health Suggestions</Card.Title>
          <Card.Text>
            Based on your inputs, receive customized health and wellness advice tailored to your needs.
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
    
    
  
    <Col md={4}>
      <Card className="mb-4 shadow">
        <Card.Img variant="top" src="Instant Symptom Analysis.webp" />
        <Card.Body>
          <Card.Title>Instant Symptom Analysis</Card.Title>
          <Card.Text>
            Enter your symptoms and get instant AI-based analysis with potential conditions and next steps.
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
    </Row>
    </Container>
    <Container id="features">
    <h2 className="text-center mb-4">Unlock Your Best Self!</h2>
  <Row>
    <Col md={4}>
            <Card className="mb-4 shadow" onClick={() => setShowBMI(true)} style={{ cursor: "pointer" }}>
              <Card.Img variant="top" src="Live Health Tracker.jpg " />
              <Card.Body>
                <Card.Title>Live Health Tracker</Card.Title>
                <Card.Text>
                  Click to check your BMI and track basic health parameters in real-time.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
  <Card className="mb-4 shadow" style={{ cursor: "pointer" }} onClick={() => setShowWorkout(true)}>
    <Card.Img variant="top" src="Workout Plans.jpg" />
    <Card.Body>
      <Card.Title>Workout Plans</Card.Title>
      <Card.Text>Click to view personalized workout plans for your fitness goals.</Card.Text>
    </Card.Body>
  </Card>
</Col>
<Col md={4}>
  <Card className="mb-4 shadow" style={{ cursor: "pointer" }} onClick={() => setShowDiet(true)}>
    <Card.Img variant="top" src="Healthy Diet Plans.jpg" />
    <Card.Body>
      <Card.Title>Healthy Diet Plans</Card.Title>
      <Card.Text>Click to view personalized diet recommendations based on your BMI & health goals.</Card.Text>
    </Card.Body>
  </Card>
</Col>

  </Row>
</Container>
{/* BMI Modal */}
<Modal show={showBMI} onHide={() => setShowBMI(false)}>  {/* ✅ Modal Component */}
        <Modal.Header closeButton>
          <Modal.Title>BMI Calculator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <BMICalculator />  {/* ✅ Render BMI Calculator inside Modal */}
        </Modal.Body>
      </Modal>
      {/* 🖥️ Modal for Workout Plans */}
      <Modal show={showWorkout} onHide={() => setShowWorkout(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Workout Plans</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <WorkoutPlans />  {/* ✅ Display workout plans inside the modal */}
        </Modal.Body>
      </Modal>

      {/* Healthy Diet Plans Modal */}
      <Modal show={showDiet} onHide={() => setShowDiet(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Healthy Diet Recommendations</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DietPlans />
        </Modal.Body>
      </Modal>


<Container id="faqs" class="mt-5">
  <h2 class="text-left mb-4">Frequently Asked Questions</h2>
  <Accordion>
    <Accordion.Item eventKey="0">
      <Accordion.Header>
        <i class="bi bi-question-circle-fill me-2"></i>
        How does this platform work?
      </Accordion.Header>
      <Accordion.Body>
        You can ask questions related to your health conditions, and our AI-powered system will provide possible insights based on medical data.
      </Accordion.Body>
    </Accordion.Item>

    <Accordion.Item eventKey="1">
      <Accordion.Header>
        <i class="bi bi-shield-check me-2"></i>
        Is the diagnosis accurate?
      </Accordion.Header>
      <Accordion.Body>
        Our system provides possible health conditions based on your symptoms, but we recommend consulting a medical professional for a proper diagnosis.
      </Accordion.Body>
    </Accordion.Item>

    <Accordion.Item eventKey="2">
      <Accordion.Header>
        <i class="bi bi-cash-stack me-2"></i> 
        Is this service free?
      </Accordion.Header>
      <Accordion.Body>
        Basic health insights are free, but you may need a paid subscription for doctor consultations.
      </Accordion.Body>
    </Accordion.Item>


    <Accordion.Item eventKey="4">
      <Accordion.Header>
        <i class="bi bi-lock-fill me-2"></i> 
        Is my data secure?
      </Accordion.Header>
      <Accordion.Body>
        Yes! We use end-to-end encryption and follow strict security protocols to protect your personal and medical data.
      </Accordion.Body>
    </Accordion.Item>
  </Accordion>
</Container>


      {/* Footer Section */}
      
     <footer className="footer">
        <div className="footer-container">
          <div className="footer-section brand">
            <h2>HealthCheckPro</h2>
            <h3>Contact Us</h3>
            <p><strong>Email:</strong> contact@company.com</p>
            <p><strong>Phone:</strong> (414) 687 - 5892</p>
            <p><strong>Address:</strong> 794 McAllister St, San Francisco, 94102</p>
            <div className="footer-icons">
              <i className="bi bi-twitter-x"></i>
              <i className="bi bi-instagram"></i>
              <i className="bi bi-threads"></i>
              <i className="bi bi-linkedin"></i>
              <i className="bi bi-youtube"></i>
            </div>
          </div>

          <div className="footer-section">
            <h3>Product</h3>
            <ul>
              <li>Features</li>
              <li>Pricing</li>
              <li>Case Studies</li>
              <li>Reviews</li>
              <li>Updates</li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Company</h3>
            <ul>
              <li>About</li>
              <li>Contact Us</li>
              <li>Careers</li>
              <li>Culture</li>
              <li>Blog</li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Support</h3>
            <ul>
              <li>Getting Started</li>
              <li>Help Center</li>
              <li>Server Status</li>
              <li>Report a Bug</li>
              <li>Chat Support</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
        <p>
          © 2025 HealthCheckPro. All rights reserved. | 
          <button onClick={() => alert("Terms & Conditions will be added soon!")}>Terms and Conditions</button> | 
          <button onClick={() => alert("Privacy Policy will be added soon!")}>Privacy Policy</button>
        </p>

        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

