import React from 'react';
import Lottie from "react-lottie";

export default function Animation({ animationData }) {
  const options = {
    loop: true, // Set to false if you don't want the animation to loop
    autoplay: true, // Autoplay the animation
    animationData: animationData, // The JSON data of the sticker
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice", // You can adjust this based on your layout
    },
  };

  return (
    <Lottie options={options} />
  );
};