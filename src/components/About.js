import React from "react";
import "../styles/About.css";

const About = () => {
  return (
    <section className="about-page">
      <div className="about-container">
        <h1>About PixelCrypt</h1>
        <p>
          PixelCrypt is an experimental steganography lab where SRM+C NN models,
          AES encryption, and DCT-based embedding converge. The project lets you
          train, encode, decode, and analyze stego artifacts built on the ALASKA
          dataset while visualizing how modern defenses react.
        </p>
        <p>
          Use the Encode/Decode pages to try the pipeline yourself, explore the
          resources to learn more, or reach out if you want to extend the lab
          with custom datasets and models.
        </p>
      </div>
    </section>
  );
};

export default About;

