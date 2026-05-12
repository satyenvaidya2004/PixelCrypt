import React from "react";
import "../styles/About.css";
import heroShield from "../images/hero_clean_shield.png";
import {
  AiOutlineSafety,
  AiOutlineLock,
  AiOutlineEyeInvisible,
  AiOutlineThunderbolt,
  AiOutlineTeam,
  AiOutlineGlobal,
} from "react-icons/ai";
import { MdOutlineShield, MdOutlineSpeed } from "react-icons/md";
import { RiDoubleQuotesL } from "react-icons/ri";
import { BsImageFill, BsFileTextFill } from "react-icons/bs";
import Footer from "./Footer";

const whyChooseUs = [
  {
    icon: <MdOutlineShield />,
    color: "cyan",
    title: "Advanced Steganography",
    desc: "We use advanced encoding techniques to hide your data deep within images.",
  },
  {
    icon: <AiOutlineLock />,
    color: "purple",
    title: "End-to-End Security",
    desc: "Your data is encrypted and secured from the moment it's encoded to the moment it's decoded.",
  },
  {
    icon: <AiOutlineEyeInvisible />,
    color: "pink",
    title: "Completely Invisible",
    desc: "The presence of hidden messages cannot be detected by the naked eye or common tools.",
  },
  {
    icon: <AiOutlineThunderbolt />,
    color: "cyan",
    title: "Lightning Fast",
    desc: "Encode and decode your messages in just a few seconds. Save time without compromising security.",
  },
  {
    icon: <AiOutlineTeam />,
    color: "purple",
    title: "User-Focused Design",
    desc: "Our clean and intuitive interface makes security accessible for everyone.",
  },
];

const stats = [
  { icon: <AiOutlineTeam />, value: "10K+", label: "Happy Users" },
  { icon: <BsImageFill />, value: "50K+", label: "Images Encoded" },
  { icon: <AiOutlineLock />, value: "99.9%", label: "Security Rate" },
  { icon: <MdOutlineSpeed />, value: "2s", label: "Avg. Processing Time" },
  { icon: <AiOutlineGlobal />, value: "100+", label: "Countries Supported" },
];

const About = () => {
  return (
    <>
      <section className="about-page">
        <div className="about-wrapper">

          {/* ── TOP GRID ── */}
          <div className="about-top-grid">

            {/* LEFT COLUMN */}
            <div className="about-left">
              <p className="section-label">ABOUT US</p>
              <h1 className="about-heading">
                We <span className="gradient-cyan">Protect</span> What Matters{" "}
                <span className="gradient-pink">Most.</span>
              </h1>
              <p className="about-desc">
                PixelCrypt uses advanced steganography to hide your secret messages
                inside images. Whether it's personal data or confidential information,
                we help you keep it private, secure, and invisible.
              </p>

              <div className="mission-card">
                <div className="mission-icon">
                  <MdOutlineShield />
                </div>
                <div>
                  <p className="mission-title">Our Mission</p>
                  <p className="mission-text">
                    To empower users with a simple yet powerful tool that ensures
                    privacy and data security in the digital world.
                  </p>
                </div>
              </div>

              <div className="quote-block">
                <RiDoubleQuotesL className="quote-mark" />
                <p>
                  <em>
                    Privacy is not an option,<br />
                    it's a right. We make sure<br />
                    you hold that right.
                  </em>
                </p>
              </div>
            </div>

            {/* CENTER COLUMN */}
            <div className="about-center-wrapper">
              <div className="about-center">
                <div className="hero-image-wrap">
                  <img src={heroShield} alt="PixelCrypt Steganography Illustration" className="about-hero-img" />
                </div>

                <div className="what-is-card">
                  <h2 className="what-is-title">
                    What is <span className="gradient-cyan">PixelCrypt?</span>
                  </h2>
                  <p className="what-is-desc">
                    PixelCrypt is a professional steganography tool that allows you to
                    encode secret messages inside images and decode them with ease.
                    Our advanced algorithms ensure your messages remain hidden even
                    from the most suspicious eyes.
                  </p>
                  <div className="feature-tags">
                    <div className="feature-tag">
                      <MdOutlineShield className="tag-icon cyan" />
                      <span>Military-Grade<br />Security</span>
                    </div>
                    <div className="feature-tag">
                      <AiOutlineEyeInvisible className="tag-icon pink" />
                      <span>Invisible<br />&amp; Undetectable</span>
                    </div>
                    <div className="feature-tag">
                      <AiOutlineThunderbolt className="tag-icon purple" />
                      <span>Fast<br />&amp; Efficient</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="about-right">
              <p className="section-label">WHY CHOOSE US</p>
              <div className="why-list">
                {whyChooseUs.map((item, i) => (
                  <div className="why-item" key={i}>
                    <div className={`why-icon-wrap ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className={`why-title ${item.color}`}>{item.title}</p>
                      <p className="why-desc">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── STATS BAR ── */}
          <div className="stats-bar">
            {stats.map((s, i) => (
              <div className="stat-item" key={i}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>
      <Footer />
    </>
  );
};

export default About;
