import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

const BMICalculator = () => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBMI] = useState(null);
  const [category, setCategory] = useState("");

  const calculateBMI = () => {
    if (!weight || !height) return;
    
    const heightInMeters = height / 100; // Convert height from cm to meters
    const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(2);

    setBMI(bmiValue);
    
    if (bmiValue < 18.5) setCategory("Underweight");
    else if (bmiValue < 24.9) setCategory("Normal weight");
    else if (bmiValue < 29.9) setCategory("Overweight");
    else setCategory("Obese");
  };

  return (
    <div>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Weight (kg)</Form.Label>
          <Form.Control
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter weight in kg"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Height (cm)</Form.Label>
          <Form.Control
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Enter height in cm"
          />
        </Form.Group>
        <Button variant="primary" onClick={calculateBMI}>Calculate BMI</Button>
      </Form>

      {bmi && (
        <div className="mt-3">
          <h5>Your BMI: {bmi}</h5>
          <p>Category: {category}</p>
        </div>
      )}
    </div>
  );
};

export default BMICalculator;
