import { useEffect, useRef, useState } from 'react';
import './Landing.css';

const FRAME_COUNT = 180;
const PRELOAD_IMAGES: HTMLImageElement[] = [];

// Preload images globally so it only happens once
let imagesLoadedGlobal = false;
let loadedCount = 0;
for (let i = 1; i <= FRAME_COUNT; i++) {
  const img = new Image();
  img.src = `${import.meta.env.BASE_URL}logo_animation/frame_${i.toString().padStart(5, '0')}.png`;
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
    title: "Project Alpha", 
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi quisquam eaque, laboriosam expedita perferendis facilis esse deleniti qui voluptas! Nesciunt!" 
  },
  { 
    title: "Global Tracking", 
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi quisquam eaque, laboriosam expedita perferendis facilis esse deleniti qui voluptas! Nesciunt!" 
  },
  { 
    title: "Real-time Intel", 
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi quisquam eaque, laboriosam expedita perferendis facilis esse deleniti qui voluptas! Nesciunt!" 
  },
  { 
    title: "Actionable Data", 
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi quisquam eaque, laboriosam expedita perferendis facilis esse deleniti qui voluptas! Nesciunt!" 
  },
  { 
    title: "Surveillance", 
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi quisquam eaque, laboriosam expedita perferendis facilis esse deleniti qui voluptas! Nesciunt!" 
  },
];

export default function Landing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(imagesLoadedGlobal);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Handle images preload completion
  useEffect(() => {
    if (imagesLoadedGlobal) {
      setImagesLoaded(true);
    } else {
      const handlePreloaded = () => setImagesLoaded(true);
      window.addEventListener('imagesPreloaded', handlePreloaded);
      return () => window.removeEventListener('imagesPreloaded', handlePreloaded);
    }
  }, []);

  // Handle Scroll events for animation and active items
  useEffect(() => {
    const handleScroll = () => {
      const html = document.documentElement;
      const scrollTop = window.scrollY || html.scrollTop;
      const maxScrollTop = Math.max(0, html.scrollHeight - window.innerHeight);
      
      let scrollFraction = 0;
      if (maxScrollTop > 0) {
        scrollFraction = scrollTop / maxScrollTop;
      }
      setScrollProgress(scrollFraction);

      if (carouselRef.current) {
        const carouselTop = carouselRef.current.getBoundingClientRect().top;
        const proportion = carouselTop / window.innerHeight;
        
        if (proportion > 0.5) {
           setActiveIndex(-1);
        } else {
           let index = Math.ceil(-1 * (proportion + 0.5));
           index = Math.max(0, Math.min(index, SECTIONS_DATA.length - 1));
           setActiveIndex(index);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger once on mount
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Draw globe onto canvas
  useEffect(() => {
    if (!imagesLoaded || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameIndex = Math.floor(scrollProgress * FRAME_COUNT);
    frameIndex = Math.max(0, Math.min(frameIndex, FRAME_COUNT - 1));

    const img = PRELOAD_IMAGES[frameIndex];
    if (img) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const scale = Math.min(
  canvas.width / img.naturalWidth,
  canvas.height / img.naturalHeight
);

const width = img.naturalWidth * scale;
const height = img.naturalHeight * scale;

const x = (canvas.width - width) / 2;
const y = (canvas.height - height) / 2;

ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.drawImage(img, x, y, width, height);
    }
  }, [scrollProgress, imagesLoaded]);

  return (
    <div className="landing-wrapper">
      <div className="landing-bg"></div>

      <div className={`globe-fixed-container ${activeIndex >= 0 ? 'is-carousel' : ''}`}>
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
             <div className="watch-text">UT WATCH</div>
          </div>
        </div>

        <div className="carousel" ref={carouselRef}>
          <div className="left">
            {SECTIONS_DATA.map((section, idx) => (
              <div 
                key={idx} 
                className={`left-item ${activeIndex === idx ? 'active' : ''}`}
              >
                <div className="title">{section.title}</div>
                <div className="text">{section.text}</div>
                <button type="button" className="view-more-btn">View More</button>
              </div>
            ))}
          </div>
          <div className="right">
            {/* Empty space that allows the fixed canvas to visually occupy the right side */}
          </div>
        </div>
      </div>
    </div>
  );
}
