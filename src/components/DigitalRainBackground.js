import React, { useEffect, useRef } from "react";
import "../styles/DigitalRainBackground.css";

const DigitalRainBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charArray = chars.split("");

    const fontSize = 24;
    const fallSpeed = 0.4; // lower = slower
    let columns;
    let drops = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      columns = Math.floor(canvas.width / fontSize);

      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -50;
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      // Fade effect
      ctx.fillStyle = "rgba(4, 7, 22, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `bold ${fontSize}px monospace`;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";

      for (let i = 0; i < columns; i++) {
        const char = charArray[Math.floor(Math.random() * charArray.length)];

        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
        // ctx.shadowColor = "rgba(0, 255, 255, 0.6)";
        ctx.shadowColor = "#0a0a1a";
        ctx.shadowBlur = 8;

        ctx.fillText(char, x, y);

        drops[i] += fallSpeed;

        // reset drop from the top randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    let animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="digital-rain-bg" />;
};

export default DigitalRainBackground;
