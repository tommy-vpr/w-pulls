import React from "react";
import "./RotatingGallery.css";

const images: string[] = [
  "/images/p8.jpeg",
  "/images/p4.jpeg",
  "/images/p3.jpeg",
  "/images/p5.jpeg",
  "/images/p11.jpeg",
  "/images/p2.jpeg",
  "/images/p10.jpeg",
  "/images/p1.jpeg",
  "/images/p9.jpeg",
  "/images/p7.jpeg",
];

const RotatingGallery: React.FC = () => {
  return (
    <div className="gallery-wrapper">
      <div className="box">
        {images.map((src, index) => (
          <span key={src} style={{ ["--i" as any]: index + 1 }}>
            <img src={src} alt={`gallery-${index}`} />
          </span>
        ))}
      </div>
    </div>
  );
};

export default RotatingGallery;
