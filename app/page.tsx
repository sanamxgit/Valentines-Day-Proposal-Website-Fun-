'use client';

import { useEffect, useState, useRef } from 'react';

export default function Page() {
  const [stars, setStars] = useState<Array<{ id: number; left: number; top: number; delay: number }>>([]);
  const [isClient, setIsClient] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout>();
  const heartIntervalRef = useRef<NodeJS.Timeout>();
  const noBtnRef = useRef<HTMLButtonElement>(null);
  const [noMoveCount, setNoMoveCount] = useState(0);
  const envelopeSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    // Generate stars only on client
    const starArray = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
    }));
    setStars(starArray);

    // Start floating hearts
    heartIntervalRef.current = setInterval(() => {
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.textContent = '💕';
      heart.style.left = Math.random() * 100 + '%';
      heart.style.animationDuration = 3 + Math.random() * 3 + 's';
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 9000);
    }, 800);

    // Start countdown
    updateCountdown();
    countdownRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (heartIntervalRef.current) clearInterval(heartIntervalRef.current);
    };
  }, []);

  const handleEnvelopeClick = () => {
    setEnvelopeOpen(true);
    setTimeout(() => {
      setShowMessage(true);
    }, 600);
  };

  const handleYesClick = () => {
    celebrate();
    setTimeout(() => {
      setShowCelebration(true);
    }, 300);
  };

  const handleNoHover = () => {
    if (noMoveCount < 5) {
      const randomX = (Math.random() - 0.5) * 200;
      const randomY = (Math.random() - 0.5) * 200;
      if (noBtnRef.current) {
        noBtnRef.current.style.transform = `translate(${randomX}px, ${randomY}px)`;
        noBtnRef.current.style.transition = 'transform 0.3s ease';
      }
      setNoMoveCount(noMoveCount + 1);
    }
  };

  const handleNoClick = () => {
    if (noMoveCount < 5) {
      setNoMoveCount(999);
      setTimeout(() => {
        celebrate();
        setTimeout(() => {
          setShowCelebration(true);
        }, 300);
      }, 1000);
    } else {
      celebrate();
      setTimeout(() => {
        setShowCelebration(true);
      }, 300);
    }
  };

  const handleShareClick = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Will You Be My Valentine?',
        text: `Someone said YES to being my Valentine! ❤️`,
        url: url,
      });
    } else {
      alert('Share link: ' + url);
    }
  };

  const handleScrollDown = () => {
    if (envelopeSectionRef.current) {
      envelopeSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const updateCountdown = () => {
    const valentineDay = new Date(new Date().getFullYear(), 1, 14);
    if (new Date() > valentineDay) {
      valentineDay.setFullYear(valentineDay.getFullYear() + 1);
    }

    const now = new Date();
    const diff = valentineDay.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const timerHtml = `
      <div class="countdown-item">
        <div class="countdown-number">${days}</div>
        <div class="countdown-label">Days</div>
      </div>
      <div class="countdown-item">
        <div class="countdown-number">${hours}</div>
        <div class="countdown-label">Hours</div>
      </div>
      <div class="countdown-item">
        <div class="countdown-number">${minutes}</div>
        <div class="countdown-label">Mins</div>
      </div>
      <div class="countdown-item">
        <div class="countdown-number">${seconds}</div>
        <div class="countdown-label">Secs</div>
      </div>
    `;

    const timer = document.getElementById('countdownTimer');
    if (timer) {
      timer.innerHTML = timerHtml;
    }
  };

  const updatePersonalizedMessage = () => {
    const toName = new URLSearchParams(window.location.search).get('to') || 'You';
    const fromName = new URLSearchParams(window.location.search).get('from') || 'I';
    const message = document.getElementById('personalizedMessage');
    if (message) {
      message.textContent = `${toName}, will you be my Valentine? Love, ${fromName} 💕`;
    }
  };

  const celebrate = () => {
    const container = document.getElementById('fireworks');
    if (container) {
      for (let i = 0; i < 30; i++) {
        createFirework(container);
      }
    }

    for (let i = 0; i < 50; i++) {
      createConfetti();
    }
  };

  const createFirework = (container: HTMLElement) => {
    const firework = document.createElement('div');
    firework.style.position = 'absolute';
    firework.style.width = '10px';
    firework.style.height = '10px';
    firework.style.background = `hsl(${Math.random() * 60 + 300}, 100%, 50%)`;
    firework.style.borderRadius = '50%';
    firework.style.left = Math.random() * 100 + '%';
    firework.style.top = Math.random() * 100 + '%';
    firework.style.pointerEvents = 'none';

    const duration = 1 + Math.random() * 0.5;
    firework.style.animation = `confettiFall ${duration}s ease-out forwards`;
    firework.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');

    container.appendChild(firework);
    setTimeout(() => firework.remove(), duration * 1000);
  };

  const createConfetti = () => {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.textContent = ['🎉', '💕', '✨', '🌹', '💖', '🎈'][Math.floor(Math.random() * 6)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-20px';
    confetti.style.setProperty('--tx', (Math.random() - 0.5) * 300 + 'px');
    confetti.style.fontSize = Math.random() * 20 + 20 + 'px';
    confetti.style.animationDuration = 2 + Math.random() * 1 + 's';

    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  };

  const generateLovePoem = () => {
    const adjectives = [
      'sweet', 'beautiful', 'radiant', 'enchanting', 'precious', 'lovely', 'magical', 'brilliant', 'graceful', 'stunning'
    ];
    const nouns = [
      'smile', 'eyes', 'heart', 'soul', 'laugh', 'touch', 'spirit', 'presence', 'kindness', 'warmth'
    ];
    const comparisons = [
      'shines brighter than the stars',
      'sparkles like diamonds',
      'glows like the sun',
      'flows like the sweetest melody',
      'radiates pure love',
      'captivates my heart completely',
      'steals my breath away',
      'makes my heart soar',
    ];

    const adj1 = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun1 = nouns[Math.floor(Math.random() * nouns.length)];
    const noun2 = nouns[Math.floor(Math.random() * nouns.length)];
    const comp = comparisons[Math.floor(Math.random() * comparisons.length)];

    const poem = `Your ${noun1} is as ${adj1} as the morning dew,\nYour ${noun2} ${comp}.\nEvery moment with you feels like a dream,\nWith you, my heart knows what it means to truly love. 💕`;

    const poemDisplay = document.getElementById('poemDisplay');
    if (poemDisplay) {
      poemDisplay.textContent = poem;
      poemDisplay.classList.add('show');

      setTimeout(() => {
        poemDisplay.classList.remove('show');
      }, 5000);
    }
  };

  const MemoryCarousel = () => {
    const [memories, setMemories] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showLoveAnimation, setShowLoveAnimation] = useState(false);

    // Load images from blob storage on mount
    useEffect(() => {
      const loadMemories = async () => {
        try {
          const response = await fetch('/api/memories/images');
          const data = await response.json();
          if (data.images && Array.isArray(data.images)) {
            setMemories(data.images);
          } else {
            setMemories(Array(7).fill(''));
          }
        } catch (error) {
          console.error('Error loading images:', error);
          setMemories(Array(7).fill(''));
        }
      };
      loadMemories();
    }, []);

    const handleMemoryClick = (imageUrl: string, index: number) => {
      if (!imageUrl) return;
      
      // Show love animation for 2 seconds
      setShowLoveAnimation(true);
      setTimeout(() => {
        setShowLoveAnimation(false);
      }, 2000);
      
      // Open modal with image
      setSelectedImage(imageUrl);
    };

    const closeModal = () => {
      setSelectedImage(null);
    };

    return (
      <>
        <div className="carousel">
          {memories.map((memory, idx) => (
            <div
              key={idx}
              className={`memory-slot ${memory ? 'filled' : ''}`}
              onClick={() => handleMemoryClick(memory, idx)}
              style={memory ? { backgroundImage: `url(${memory})` } : {}}
            >
              {!memory && (
                <div className="memory-placeholder">
                  <div style={{ fontSize: '2rem', marginBottom: '5px' }}>❤️</div>
                  <p>Memory {idx + 1}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Love Animation Overlay */}
        {showLoveAnimation && (
          <div className="love-animation-overlay">
            <div className="love-heart">💕</div>
            <div className="love-heart">💖</div>
            <div className="love-heart">💗</div>
            <div className="love-heart">💝</div>
            <div className="love-heart">💞</div>
            <div className="love-heart">💓</div>
            <div className="love-heart">❤️</div>
            <div className="love-heart">💜</div>
            <div className="love-heart">🧡</div>
            <div className="love-heart">💛</div>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div className="image-modal-overlay" onClick={closeModal}>
            <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="image-modal-close" onClick={closeModal}>×</button>
              <img src={selectedImage} alt="Memory" className="image-modal-img" />
            </div>
          </div>
        )}
      </>
    );
  };

  if (!isClient) {
    return null;
  }

  return (
    <>
      <style>{`
        :root {
          --primary-pink: #ff6b9d;
          --light-pink: #ffc0d9;
          --pastel-purple: #d9b3ff;
          --pastel-lavender: #e6d7ff;
          --soft-white: #fef9f7;
          --gold-accent: #ffc87c;
          --text-dark: #4a3728;
          --light-lavender: #f3e8ff;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(135deg, var(--light-pink) 0%, var(--pastel-lavender) 50%, var(--light-pink) 100%);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
          color: var(--text-dark);
          overflow-x: hidden;
          min-height: 100vh;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .stars {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(255, 215, 0, 0.8);
          border-radius: 50%;
          animation: twinkle 3s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .floating-heart {
          position: fixed;
          pointer-events: none;
          z-index: 1;
          font-size: 2rem;
          animation: float 6s ease-in infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .confetti {
          position: fixed;
          pointer-events: none;
          z-index: 10;
          animation: confettiFall 3s ease-out forwards;
        }

        @keyframes confettiFall {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx), 100vh) rotate(360deg);
          }
        }

        .container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .landing-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .spline-hero {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .spline-card {
          width: 100%;
          height: 100%;
        }

        .spline-scroll-text {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          border: none;
          background: none;
          padding: 8px 16px;
          color: #ffffff;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          opacity: 0.9;
          text-shadow: 0 0 8px rgba(0, 0, 0, 0.6);
          font-family: 'Poppins', sans-serif;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .spline-scroll-text span:last-child {
          font-size: 1rem;
          animation: scrollArrow 1.2s ease-in-out infinite;
        }

        @keyframes scrollArrow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(3px);
          }
        }

        .spline-scroll-text:hover {
          opacity: 1;
          transform: translateX(-50%) translateY(-2px);
        }

        .envelope-wrapper {
          perspective: 1000px;
          width: 100%;
          max-width: 400px;
          margin-bottom: 40px;
        }

        .envelope {
          width: 100%;
          aspect-ratio: 1.5;
          background: linear-gradient(135deg, var(--soft-white) 0%, var(--light-pink) 100%);
          border-radius: 10px;
          box-shadow: 0 20px 60px rgba(255, 107, 157, 0.3);
          position: relative;
          cursor: pointer;
          animation: envelopeEntry 1s ease-out;
          transform-style: preserve-3d;
          transition: transform 0.6s ease-out;
          border: 3px solid var(--gold-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 15px;
        }

        @keyframes envelopeEntry {
          from {
            opacity: 0;
            transform: scale(0.5) rotateX(45deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotateX(0deg);
          }
        }

        .envelope.open {
          animation: envelopeOpen 0.8s ease-out forwards;
        }

        @keyframes envelopeOpen {
          0% { transform: rotateX(0deg); }
          100% { transform: rotateX(-170deg); }
        }

        .heart-icon {
          font-size: 4rem;
          animation: heartBeat 1.5s ease-in-out infinite;
        }

        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .envelope-text {
          font-family: 'Pacifico', cursive;
          font-size: 1.5rem;
          color: var(--primary-pink);
          text-align: center;
        }

        .envelope-subtitle {
          font-family: 'Poppins', sans-serif;
          font-size: 0.9rem;
          color: var(--text-dark);
          opacity: 0.7;
        }

        .main-question {
          font-family: 'Lobster', cursive;
          font-size: clamp(2rem, 8vw, 3.5rem);
          color: var(--primary-pink);
          text-align: center;
          margin-bottom: 30px;
          animation: questionFadeIn 0.8s ease-out 0.5s both;
          text-shadow: 2px 2px 4px rgba(255, 107, 157, 0.2);
        }

        @keyframes questionFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .personalized-message {
          font-size: 1.1rem;
          color: var(--text-dark);
          text-align: center;
          margin-bottom: 40px;
          font-style: italic;
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.8s both;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .countdown {
          background: rgba(255, 255, 255, 0.8);
          padding: 20px 30px;
          border-radius: 15px;
          margin-bottom: 40px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          animation: slideUp 0.8s ease-out 1s both;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .countdown-title {
          font-weight: 700;
          color: var(--primary-pink);
          margin-bottom: 12px;
          font-size: 1rem;
        }

        .countdown-timer {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
          gap: 10px;
        }

        .countdown-item {
          text-align: center;
        }

        .countdown-number {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--primary-pink);
        }

        .countdown-label {
          font-size: 0.75rem;
          color: var(--text-dark);
          text-transform: uppercase;
          opacity: 0.7;
        }

        .heart-fill {
          display: inline-block;
          width: 6px;
          height: 6px;
          background: var(--primary-pink);
          border-radius: 50%;
          margin: 0 2px;
        }

        .button-group {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
          animation: buttonsAppear 0.8s ease-out 1.3s both;
        }

        @keyframes buttonsAppear {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .btn {
          padding: 15px 40px;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Poppins', sans-serif;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        .btn-yes {
          background: var(--primary-pink);
          color: white;
        }

        .btn-yes:hover {
          background: #ff4480;
          transform: scale(1.05);
          box-shadow: 0 15px 35px rgba(255, 107, 157, 0.4);
        }

        .btn-no {
          background: var(--pastel-purple);
          color: white;
          position: relative;
        }

        .btn-no:hover {
          background: #c9a1ff;
        }

        .celebration-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.8s ease-out;
          pointer-events: none;
        }

        .celebration-page.active {
          opacity: 1;
          transform: scale(1);
          pointer-events: auto;
        }

        .celebration-content {
          text-align: center;
          background: rgba(255, 255, 255, 0.95);
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
          max-width: 600px;
          animation: celebrationBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes celebrationBounce {
          0% {
            transform: translateY(50px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .celebration-emoji {
          font-size: 4rem;
          margin-bottom: 20px;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          0%, 100% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .celebration-title {
          font-family: 'Lobster', cursive;
          font-size: clamp(1.5rem, 6vw, 3rem);
          color: var(--primary-pink);
          margin-bottom: 15px;
        }

        .love-message {
          font-size: 1.1rem;
          color: var(--text-dark);
          line-height: 1.6;
          margin: 20px 0;
          font-style: italic;
        }

        .fireworks {
          position: fixed;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 5;
        }

        .share-section {
          margin-top: 30px;
          padding-top: 30px;
          border-top: 2px solid var(--light-pink);
        }

        .share-btn {
          background: var(--gold-accent);
          color: var(--text-dark);
          padding: 10px 20px;
          border-radius: 25px;
          font-size: 0.9rem;
          margin: 5px;
          cursor: pointer;
          border: none;
          transition: all 0.3s ease;
        }

        .share-btn:hover {
          background: #ffb347;
          transform: translateY(-2px);
        }

        .memory-lane {
          margin-top: 50px;
          padding: 30px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 15px;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .memory-lane h3 {
          font-family: 'Lobster', cursive;
          color: var(--primary-pink);
          margin-bottom: 20px;
          font-size: 1.5rem;
        }

        .carousel {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .memory-slot {
          aspect-ratio: 1;
          border: 3px dashed var(--light-pink);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: linear-gradient(135deg, var(--light-lavender), var(--soft-white));
          transition: all 0.3s ease;
          overflow: hidden;
          position: relative;
        }

        .memory-slot:hover {
          border-color: var(--primary-pink);
          background: linear-gradient(135deg, var(--light-pink), var(--light-lavender));
          transform: scale(1.05);
        }

        .memory-slot.filled {
          border: none;
          background-size: cover;
          background-position: center;
        }

        .memory-placeholder {
          text-align: center;
          color: var(--primary-pink);
        }

        .memory-placeholder p {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .poem-section {
          margin-top: 30px;
          padding: 20px;
          background: linear-gradient(135deg, var(--light-pink), var(--light-lavender));
          border-radius: 10px;
          border-left: 4px solid var(--primary-pink);
        }

        .poem-btn {
          background: var(--primary-pink);
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .poem-btn:hover {
          background: #ff4480;
          transform: scale(1.05);
        }

        .poem-display {
          margin-top: 15px;
          font-style: italic;
          color: var(--text-dark);
          line-height: 1.8;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .poem-display.show {
          opacity: 1;
        }

        .footer {
          text-align: center;
          margin-top: 50px;
          padding: 20px;
          color: var(--text-dark);
          opacity: 0.7;
          font-size: 0.9rem;
        }

        /* Love Animation Overlay */
        .love-animation-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .love-heart {
          position: absolute;
          font-size: 3rem;
          animation: loveFloat 2s ease-out forwards;
          opacity: 0;
        }

        @keyframes loveFloat {
          0% {
            opacity: 1;
            transform: translateY(0) scale(0.5) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: translateY(-100px) scale(1.2) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) scale(0.8) rotate(360deg);
          }
        }

        .love-heart:nth-child(1) {
          left: 10%;
          animation-delay: 0s;
        }

        .love-heart:nth-child(2) {
          left: 20%;
          animation-delay: 0.1s;
        }

        .love-heart:nth-child(3) {
          left: 30%;
          animation-delay: 0.2s;
        }

        .love-heart:nth-child(4) {
          left: 40%;
          animation-delay: 0.3s;
        }

        .love-heart:nth-child(5) {
          left: 50%;
          animation-delay: 0.4s;
        }

        .love-heart:nth-child(6) {
          left: 60%;
          animation-delay: 0.5s;
        }

        .love-heart:nth-child(7) {
          left: 70%;
          animation-delay: 0.6s;
        }

        .love-heart:nth-child(8) {
          left: 80%;
          animation-delay: 0.7s;
        }

        .love-heart:nth-child(9) {
          left: 15%;
          animation-delay: 0.2s;
        }

        .love-heart:nth-child(10) {
          left: 85%;
          animation-delay: 0.8s;
        }

        /* Image Modal */
        .image-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .image-modal-content {
          position: relative;
          max-width: 90%;
          max-height: 90%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-modal-img {
          max-width: 100%;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(255, 107, 157, 0.3);
          animation: scaleIn 0.3s ease;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .image-modal-close {
          position: absolute;
          top: -40px;
          right: 0;
          background: var(--primary-pink);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 10001;
        }

        .image-modal-close:hover {
          background: #ff4480;
          transform: scale(1.1);
        }

        @media (max-width: 640px) {
          .button-group {
            flex-direction: column;
            gap: 15px;
          }

          .btn {
            width: 100%;
          }

          .celebration-content {
            padding: 25px;
          }

          .carousel {
            grid-template-columns: repeat(2, 1fr);
          }

          .spline-hero {
            padding: 10px;
          }

          .spline-card {
            aspect-ratio: 4 / 5;
          }

          .image-modal-content {
            max-width: 95%;
          }

          .image-modal-close {
            top: -50px;
            right: -10px;
          }

          .love-heart {
            font-size: 2rem;
          }
        }
      `}</style>

      <div className="stars" id="stars">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Spline Hero */}
      <div className="spline-hero">
        <div className="spline-card">
          <iframe
            src="https://my.spline.design/beepboopbemyvalentine-rsRunEld6VJHXaHpewUBeJG4/"
            frameBorder="0"
            width="100%"
            height="100%"
            allowFullScreen
          />
        </div>
        <button className="spline-scroll-text" onClick={handleScrollDown}>
          <span>Scroll down</span>
          <span>▼</span>
        </button>
      </div>

      {/* Landing Page */}
      <div id="landing-page" className="landing-page" style={{
        opacity: showCelebration ? 0 : 1,
        pointerEvents: showCelebration ? 'none' : 'auto',
        transition: 'opacity 0.3s ease'
      }}>
        <div className="container" ref={envelopeSectionRef}>
          <div className="envelope-wrapper">
            <div 
              className={`envelope ${envelopeOpen ? 'open' : ''}`}
              onClick={handleEnvelopeClick}
            >
              <div className="heart-icon">💌</div>
              <div className="envelope-text">Open Your Heart</div>
              <div className="envelope-subtitle">Click to reveal your message</div>
            </div>
          </div>

          <div style={{ 
            opacity: showMessage ? 1 : 0, 
            pointerEvents: showMessage ? 'auto' : 'none',
            transition: 'opacity 0.3s ease'
          }}>
            <div className="main-question">Will You Be My Valentine?</div>
            <div className="personalized-message">{new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('to') || 'You'}, will you be my Valentine? Love, {new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('from') || 'I'} 💕</div>

            <div className="countdown">
              <div className="countdown-title">Days Until Valentine's Day</div>
              <div className="countdown-timer" id="countdownTimer"></div>
            </div>

            <div className="button-group">
              <button className="btn btn-yes" onClick={handleYesClick}>💕 Yes!</button>
              <button 
                className="btn btn-no" 
                ref={noBtnRef}
                onMouseOver={handleNoHover}
                onClick={handleNoClick}
              >
                {noMoveCount >= 5 ? '😭 Just Kidding, Say Yes!' : 'Hmm... No?'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Page */}
      <div className="celebration-page" style={{
        opacity: showCelebration ? 1 : 0,
        pointerEvents: showCelebration ? 'auto' : 'none',
        transform: showCelebration ? 'scale(1)' : 'scale(0.8)',
        transition: 'all 0.8s ease-out'
      }}>
        <div className="fireworks" id="fireworks"></div>
        <div className="celebration-content">
          <div className="celebration-emoji">💖</div>
          <h2 className="celebration-title" id="celebrationTitle">Yes! {new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('to') || 'You'}, You Made Me The Happiest!</h2>
          <p className="love-message" id="loveMessage">{new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('from') || 'I'} and {new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('to') || 'You'} - forever and always! 💕</p>

          <div className="share-section">
            <p style={{ marginBottom: "10px", fontWeight: "600" }}>Share the Love:</p>
            <button className="share-btn" onClick={handleShareClick}>📤 Share This Moment</button>
          </div>

          <div className="memory-lane">
            <h3>Our Memory Lane 🎬</h3>
            <MemoryCarousel />
            <p style={{ fontSize: "0.9rem", color: "var(--text-dark)", opacity: "0.8" }}>
              Click on any heart to add a cherished memory
            </p>
          </div>

          <div className="poem-section">
            <p style={{ marginBottom: "10px", fontWeight: "600" }}>Feeling Inspired?</p>
            <button className="poem-btn" onClick={generateLovePoem}>✨ Generate Love Poem</button>
            <div className="poem-display" id="poemDisplay"></div>
          </div>
        </div>

        <div className="footer">
          <p>Made with ❤️ for the one you love</p>
        </div>
      </div>

      <link href="https://fonts.googleapis.com/css2?family=Pacifico&family=Lobster:wght@400&family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />
    </>
  );
}
