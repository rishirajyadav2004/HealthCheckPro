import React, { useState } from "react";
import { Card, Container, Row, Col, Button } from "react-bootstrap";

const plans = [
  {
    title: "Weight Loss Plan",
    image: "Weight Loss Plan.jpg",
    description: "Follow a 30-day cardio and High-intensity interval training routine for fat loss.",
    steps: [
      "Day 1-5: 30 min cardio + HIIT (Jump squats, Burpees, Plank)",
      "Day 6-10: Increase intensity with resistance bands",
      "Day 11-20: Add strength training + jogging",
      "Day 21-30: Maintain HIIT + stretching",
    ],
  },
  {
    title: "Muscle Building Plan",
    image: "Muscle Building Plan.jpg",
    description: "Strength training with progressive overload for muscle growth.",
    steps: [
      "Day 1-5: Full-body workout (Pushups, Squats, Deadlifts)",
      "Day 6-10: Increase weight & reps",
      "Day 11-20: Split workouts (Upper body & Lower body)",
      "Day 21-30: Progressive overload with increased sets",
    ],
  },
  {
    title: "General Fitness",
    image: "General Fitness.jpg",
    description: "A mix of yoga, stretching, and strength exercises for overall health.",
    steps: [
      "Morning Yoga for flexibility",
      "Strength training 3x a week",
      "Daily 30-minute walk",
      "Hydration & healthy diet",
    ],
  },
];

const WorkoutPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <Container>
      {/* Show cards for each workout plan */}
      <Row>
        {plans.map((plan, index) => (
          <Col md={4} key={index}>
            <Card className="mb-4 shadow" onClick={() => setSelectedPlan(plan)}>
              <Card.Img variant="top" src={plan.image} />
              <Card.Body>
                <Card.Title>{plan.title}</Card.Title>
                <Card.Text>{plan.description}</Card.Text>
                <Button variant="primary" className="w-100">View Details</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Show selected workout details */}
      {selectedPlan && (
        <div className="mt-4 p-3 border rounded">
          <h3>{selectedPlan.title}</h3>
          <p>{selectedPlan.description}</p>
          <h5>Workout Steps:</h5>
          <ul>
            {selectedPlan.steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ul>
          <Button variant="secondary" onClick={() => setSelectedPlan(null)}>Close</Button>
        </div>
      )}
    </Container>
  );
};

export default WorkoutPlans;
