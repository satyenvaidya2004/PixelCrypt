import React from 'react';
import '../styles/LearningResources.css';

const LearningResources = () => {
  return (
    <section id="resources" className="learning-resources">
      <div className="learning-resources-container">
        <div className="learning-resources-content">
          <h2 className="learning-resources-title">Learning Resources</h2>
          <p className="learning-resources-description">
            Access comprehensive guides, tutorials, and documentation to enhance your understanding 
            of cryptography, steganography, and data security.
          </p>
          <div className="resources-cta">
            <a href="#documentation" className="resources-button">View Documentation</a>
          </div>
        </div>
        <div className="learning-resources-image">
          <div className="resources-icon">📚</div>
        </div>
      </div>
    </section>
  );
};

export default LearningResources;

