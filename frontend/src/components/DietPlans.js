import React from "react";
import { Card, Row, Col } from "react-bootstrap";

const DietPlans = () => {
  const dietPlans = [
    { title: "Weight Loss Diet", img: "Weight Loss Plan.jpg", details: "Low-carb, high-protein meals with portion control." },
    { title: "Muscle Gain Diet", img: "Muscle Building Plan.jpg", details: "High-protein, nutrient-rich diet for muscle growth." },
    { title: "Diabetes-Friendly Diet", img: "Diabetes-Friendly Diet.jpg", details: "Balanced meals with low sugar and complex carbs." },
  ];

  return (
    <Row>
      {dietPlans.map((plan, index) => (
        <Col md={4} key={index}>
          <Card className="mb-3 shadow">
            <Card.Img variant="top" src={plan.img} />
            <Card.Body>
              <Card.Title>{plan.title}</Card.Title>
              <Card.Text>{plan.details}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DietPlans;
