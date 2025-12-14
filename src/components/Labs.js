import React from 'react';
import '../styles/Labs.css';

const Labs = () => {
  const labs = [
    {
      id: 1,
      title: 'Cipher Lab',
      description: 'Explore classical and modern encryption algorithms',
      icon: '🔐'
    },
    {
      id: 2,
      title: 'Steganography Lab',
      description: 'Hide messages within images using steganography',
      icon: '🖼️'
    },
    {
      id: 3,
      title: 'File Encryption Lab',
      description: 'Encrypt and decrypt files securely',
      icon: '📁'
    },
    {
      id: 4,
      title: 'Digital Signature Lab',
      description: 'Create and verify digital signatures',
      icon: '✍️'
    }
  ];

  return (
    <section id="labs" className="labs">
      <div className="labs-container">
        <div className="labs-header">
          <h2 className="labs-title">Explore Our Interactive Labs</h2>
          <p className="labs-subtitle">
            Dive into hands-on cryptography, steganography, file encryption, and digital signatures. 
            Each lab is designed for learning, experimentation, and real-world skills.
          </p>
        </div>
        <div className="labs-grid">
          {labs.map((lab) => (
            <div key={lab.id} className="lab-card">
              <div className="lab-icon">{lab.icon}</div>
              <h3 className="lab-title">{lab.title}</h3>
              <p className="lab-description">{lab.description}</p>
              <a href={`#${lab.title.toLowerCase().replace(' ', '-')}`} className="lab-link">
                Explore →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Labs;

