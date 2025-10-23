import { useEffect, useRef, RefObject } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  animationClass?: string;
  staggerDelay?: number;
}

export const useScrollAnimation = (
  options: ScrollAnimationOptions = {}
): RefObject<HTMLElement> => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    animationClass = 'animate-fade-in',
    staggerDelay = 0
  } = options;

  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            
            if (staggerDelay > 0) {
              element.style.animationDelay = `${staggerDelay}s`;
            }
            
            element.classList.add(animationClass);
            observer.unobserve(element);
          }
        });
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin, animationClass, staggerDelay]);

  return ref;
};

export const useStaggeredScrollAnimation = (
  containerRef: RefObject<HTMLElement>,
  childSelector: string,
  options: ScrollAnimationOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    animationClass = 'animate-fade-in',
    staggerDelay = 0.15
  } = options;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const children = entry.target.querySelectorAll(childSelector);
            children.forEach((child, index) => {
              const element = child as HTMLElement;
              element.style.animationDelay = `${index * staggerDelay}s`;
              element.classList.add(animationClass);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef, childSelector, threshold, rootMargin, animationClass, staggerDelay]);
};
