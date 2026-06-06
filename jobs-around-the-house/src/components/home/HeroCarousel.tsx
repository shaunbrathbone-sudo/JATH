"use client";

import { useState, useEffect, useCallback } from "react";

interface HeroSlide {
  id: string;
  name: string;
  slug: string;
  heroImageUrl: string;
}

interface Props {
  slides: HeroSlide[];
  interval?: number;
}

export default function HeroCarousel({ slides, interval = 5000 }: Props) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToNext = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
      setIsTransitioning(false);
    }, 600);
  }, [slides.length]);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [slides.length, interval, goToNext]);

  if (slides.length === 0) return null;

  const currentSlide = slides[current];

  return (
    <>
      {/* Background images — preload all, show current */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-carousel__slide ${
            index === current && !isTransitioning
              ? "hero-carousel__slide--active"
              : ""
          }`}
          style={{
            backgroundImage: `url('${slide.heroImageUrl}')`,
          }}
          aria-hidden={index !== current}
        />
      ))}

      {/* Dark overlay */}
      <div className="hero-carousel__overlay" />

      {/* Category label */}
      <div className="hero-carousel__label">
        <span className="hero-carousel__category-name">{currentSlide.name}</span>
      </div>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="hero-carousel__dots">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              className={`hero-carousel__dot ${
                index === current ? "hero-carousel__dot--active" : ""
              }`}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrent(index);
                  setIsTransitioning(false);
                }, 600);
              }}
              aria-label={`Show ${slide.name}`}
            />
          ))}
        </div>
      )}
    </>
  );
}
