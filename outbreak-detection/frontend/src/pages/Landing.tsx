import { useEffect, useRef, useState } from 'react';
import './Landing.css';

const FRAME_COUNT = 180;
const PRELOAD_IMAGES: HTMLImageElement[] = [];

// Preload images globally so it only happens once
let imagesLoadedGlobal = false;
let loadedCount = 0;

for (let i = 1; i <= FRAME_COUNT; i++) {
  const img = new Image();

  img.src = `${import.meta.env.BASE_URL}logo_animation/frame_${i
    .toString()
    .padStart(5, '0')}.png`;

  img.onload = () => {
    loadedCount++;

    if (loadedCount === FRAME_COUNT) {
      imagesLoadedGlobal = true;
      window.dispatchEvent(new Event('imagesPreloaded'));
    }
  };

  PRELOAD_IMAGES.push(img);
}

const SECTIONS_DATA = [
  {
    title: "OUT WATCH",
    text: "OUT WATCH is an intelligent outbreak surveillance system built to detect emerging disease outbreaks and identify their potential...",
    fullText: `
OUT WATCH is an intelligent outbreak surveillance system designed to detect emerging disease outbreaks and identify their potential geographic sources. It analyzes disease surveillance patterns across time and location, transforming complex epidemiological data into actionable visual intelligence for faster situational awareness and response.

By combining machine learning, spatiotemporal analysis, and geographic visualization, OUT WATCH identifies unusual patterns in disease activity and highlights areas that may require closer attention. The system helps track outbreak intensity, identify potential sources and clusters, and visualize how disease activity is distributed across geographic regions.

OUT WATCH is designed to support data-driven surveillance by bringing detection, localization, and spatial intelligence together in a unified platform. Its goal is to make complex outbreak information easier to understand, interpret, and act upon.
`
  },

  {
    title: "Global Tracking",
    text: "Track disease activity across geographic regions and identify emerging patterns...",
    fullText: `
Full description for Global Tracking will go here.
`
  },

  {
    title: "Real-time Intel",
    text: "Transform surveillance data into meaningful intelligence for faster situational awareness...",
    fullText: `
Full description for Real-time Intel will go here.
`
  },

  {
    title: "Actionable Data",
    text: "Turn complex outbreak data into information that can support faster and more informed response...",
    fullText: `
Full description for Actionable Data will go here.
`
  },

  {
    title: "Surveillance",
    text: "Support continuous disease surveillance through centralized monitoring and visualization...",
    fullText: `
Full description for Surveillance will go here.
`
  }
];

export default function Landing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [imagesLoaded, setImagesLoaded] = useState(imagesLoadedGlobal);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewMoreOpen, setIsViewMoreOpen] = useState(false);
  const [titleMouse, setTitleMouse] = useState({ x: 0, y: 0 });

  // Handle images preload completion
  useEffect(() => {
    if (imagesLoadedGlobal) {
      setImagesLoaded(true);
    } else {
      const handlePreloaded = () => setImagesLoaded(true);

      window.addEventListener('imagesPreloaded', handlePreloaded);

      return () =>
        window.removeEventListener('imagesPreloaded', handlePreloaded);
    }
  }, []);

  // Handle Scroll events for animation and active items
  useEffect(() => {
    const handleScroll = () => {
      const html = document.documentElement;
      const scrollTop = window.scrollY || html.scrollTop;
      const maxScrollTop = Math.max(
        0,
        html.scrollHeight - window.innerHeight
      );

      let scrollFraction = 0;

      if (maxScrollTop > 0) {
        scrollFraction = scrollTop / maxScrollTop;
      }

      setScrollProgress(scrollFraction);

      if (carouselRef.current) {
        const carouselTop =
          carouselRef.current.getBoundingClientRect().top;

        const proportion = carouselTop / window.innerHeight;

        if (proportion > 0.5) {
          setActiveIndex(-1);
        } else {
          let index = Math.ceil(-1 * (proportion + 0.5));

          index = Math.max(
            0,
            Math.min(index, SECTIONS_DATA.length - 1)
          );

          setActiveIndex(index);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true
    });

    // Trigger once on mount
    handleScroll();

    return () =>
      window.removeEventListener('scroll', handleScroll);
  }, []);

  // Draw globe onto canvas
  useEffect(() => {
    if (!imagesLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    let frameIndex = Math.floor(
      scrollProgress * FRAME_COUNT
    );

    frameIndex = Math.max(
      0,
      Math.min(frameIndex, FRAME_COUNT - 1)
    );

    const img = PRELOAD_IMAGES[frameIndex];

    if (img) {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const scale = Math.min(
        canvas.width / img.naturalWidth,
        canvas.height / img.naturalHeight
      );

      const width = img.naturalWidth * scale;
      const height = img.naturalHeight * scale;

      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.drawImage(
        img,
        x,
        y,
        width,
        height
      );
    }
  }, [scrollProgress, imagesLoaded]);

  return (
    <div className="landing-wrapper">
      <div className="landing-bg"></div>

      <div
        className={`globe-fixed-container ${
          activeIndex >= 0 ? 'is-carousel' : ''
        }`}
      >
        <canvas
          ref={canvasRef}
          width={1000}
          height={1000}
          className="globe-canvas"
        />
      </div>

      <div className="content-scroll">
        <div className="opening-section">
          <div className="opening-content">
            <div className="watch-text">
              UT WATCH
            </div>
          </div>
        </div>

        <div
          className="carousel"
          ref={carouselRef}
        >
          <div className="left">
            {SECTIONS_DATA.map((section, idx) => (
              <div
                key={idx}
                className={`left-item ${
                  activeIndex === idx ? 'active' : ''
                }`}
              >
                <div className="title">
                  {section.title}
                </div>

                <div className="text">
                  {section.text}
                </div>

                <button
                  type="button"
                  className="view-more-btn"
                  onClick={() =>
                    setIsViewMoreOpen(true)
                  }
                >
                  View More
                </button>
              </div>
            ))}
          </div>

          <div className="right">
            {/* Empty space that allows the fixed canvas to visually occupy the right side */}
          </div>
        </div>

        {isViewMoreOpen && activeIndex >= 0 && (
          <div className="view-more-overlay">
            <div
              className="view-more-panel"
              onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();

              const x =
              ((e.clientX - rect.left) / rect.width - 0.5) * 2;

              const y =
              ((e.clientY - rect.top) / rect.height - 0.5) * 2;

              setTitleMouse({ x, y });
              }}
              onMouseLeave={() => {
              setTitleMouse({ x: 0, y: 0 });
              }}
              style={{
               transform: `
                  perspective(1200px)
                  rotateY(${titleMouse.x * 2}deg)
                  rotateX(${titleMouse.y * -2}deg)
                `,
               }}
            >

              <button
                type="button"
                className="view-more-close"
                onClick={() =>
                  setIsViewMoreOpen(false)
                }
                aria-label="Close"
              >
                ×
              </button>

              <div className="view-more-title">
                 {SECTIONS_DATA[activeIndex].title}
              </div>
              
              <div className="view-more-content">
                {SECTIONS_DATA[activeIndex].fullText}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}