import React, { useState, useEffect } from "react";

type BallProps = {
  initialX: number;
  initialY: number;
  speed: number;
};

const Ball: React.FC<BallProps> = ({ initialX, initialY, speed }) => {
  const [x, setX] = useState(initialX);
  const [y, setY] = useState(initialY);

  useEffect(() => {
    const interval = setInterval(() => {
      setX(x + speed);
    }, 10);

    return () => clearInterval(interval);
  }, [x, speed]);

  return <div style={{ position: "absolute", left: x, top: y, width: "20px", height: "20px", borderRadius: "50%", background: "red" }} />;
};

export default Ball;