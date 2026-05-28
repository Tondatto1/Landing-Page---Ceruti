import React, { useLayoutEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import Lenis from 'lenis';
import './ScrollStack.css';

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const lastTransformsRef = useRef(new Map<number, any>());
  const isUpdatingRef = useRef(false);
  const isVisibleRef = useRef(true);
  const scheduledFrameRef = useRef<number | null>(null);

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value as string);
  }, []);

  const stableHeightRef = useRef<number>(typeof window !== 'undefined' ? window.innerHeight : 800);
  const stableWidthRef = useRef<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: stableHeightRef.current,
        scrollContainer: document.documentElement
      };
    } else {
      const scroller = scrollerRef.current;
      return {
        scrollTop: scroller!.scrollTop,
        containerHeight: scroller!.clientHeight,
        scrollContainer: scroller!
      };
    }
  }, [useWindowScroll]);

  const getElementOffset = useCallback(
    (element: HTMLElement) => {
      let top = 0;
      let current: HTMLElement | null = element;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement;
      }
      // If we are not using window scroll, we actually want the offset 
      // relative to our scroller container (which is typically offsetParent anyway
      // if position relative. But to be safe, if !useWindowScroll, we can just use element.offsetTop)
      if (!useWindowScroll) {
        return element.offsetTop;
      }
      return top;
    },
    [useWindowScroll]
  );

  const offsetsCacheRef = useRef<{ cards: Map<HTMLElement, number>; end: number }>({
    cards: new Map(),
    end: 0
  });

  const calculateOffsets = useCallback(() => {
    const scroller = useWindowScroll ? document : scrollerRef.current;
    if (!scroller) return;

    const oldTransforms = new Map<HTMLElement, string>();
    const oldTransitions = new Map<HTMLElement, string>();
    cardsRef.current.forEach(card => {
      if (card) {
        oldTransforms.set(card, card.style.transform);
        oldTransitions.set(card, card.style.transition);
        card.style.transition = 'none';
        card.style.transform = 'none';
      }
    });

    const endElement = useWindowScroll
      ? (document.querySelector('.scroll-stack-end') as HTMLElement)
      : (scrollerRef.current?.querySelector('.scroll-stack-end') as HTMLElement);

    const end = endElement ? getElementOffset(endElement) : 0;
    const cards = new Map<HTMLElement, number>();

    cardsRef.current.forEach(card => {
      if (card) cards.set(card, getElementOffset(card));
    });

    cardsRef.current.forEach((card, i) => {
      if (card) {
        card.style.transition = oldTransitions.get(card) || '';
        card.style.transform = oldTransforms.get(card) || '';
      }
    });

    offsetsCacheRef.current = { cards, end };
  }, [getElementOffset, useWindowScroll, stackPosition, itemStackDistance, parsePercentage, getScrollData]);

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current || !isVisibleRef.current) return;

    isUpdatingRef.current = true;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    const endElementTop = offsetsCacheRef.current.end;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardTop = offsetsCacheRef.current.cards.get(card) || 0;
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
      const pinEnd = endElementTop - containerHeight / 2;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      if (blurAmount && !isMobile) {
        let topCardIndex = 0;
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jCardTop = offsetsCacheRef.current.cards.get(cardsRef.current[j]) || 0;
          const jTriggerStart = jCardTop - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) {
            topCardIndex = j;
          }
        }

        if (i < topCardIndex) {
          const depthInStack = topCardIndex - i;
          blur = Math.max(0, depthInStack * blurAmount);
        }
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      const newTransform = {
        translateY: translateY,
        scale: scale,
        rotation: rotation,
        blur: blur
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.01 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.0001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : '';

        card.style.transform = transform;
        card.style.filter = filter;

        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    calculateProgress,
    parsePercentage,
    getScrollData,
    getElementOffset
  ]);

  const requestUpdate = useCallback(() => {
    if (scheduledFrameRef.current !== null) return;
    scheduledFrameRef.current = requestAnimationFrame(() => {
      scheduledFrameRef.current = null;
      updateCardTransforms();
    });
  }, [updateCardTransforms]);

  const handleScroll = useCallback(() => {
    requestUpdate();
  }, [requestUpdate]);

  const setupLenis = useCallback(() => {
    // Completely disable Lenis page-wide scroll hijacking to avoid conflicts with browser scrolling,
    // anchor links navigation, touchpads, and iframes, resolving all shaking, freezing, and sticking.
    return null;
  }, []);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll('.scroll-stack-card')
        : scroller.querySelectorAll('.scroll-stack-card')
    ) as HTMLElement[];

    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = 'transform, filter';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
      card.style.transform = 'translateZ(0)';
      card.style.webkitTransform = 'translateZ(0)';
      card.style.perspective = '1000px';
      card.style.webkitPerspective = '1000px';
      
      // Ensure smooth native tracking scrolling by setting a fast and responsive transition
      card.style.transition = 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), filter 0.15s ease-out';
    });

    // IntersectionObserver to pause scroll-event calculations when component is not in viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If we are using window scroll, the cards translate far down from their original container,
        // so we bypass pausing or use a massive margin to prevent premature freezes.
        if (useWindowScroll) {
          isVisibleRef.current = true;
        } else {
          isVisibleRef.current = entry.isIntersecting;
        }
        
        if (entry.isIntersecting || useWindowScroll) {
          requestUpdate();
        }
      },
      { root: null, rootMargin: '1200px 0px', threshold: 0.01 }
    );
    observer.observe(scroller);

    let resizeTimer: number;
    const onResize = () => {
      const isMobile = window.innerWidth < 768;
      
      // On mobile, completely ignore vertical height changes (URL bar hiding/showing). Only recalculate on width change (orientation)
      if (isMobile && window.innerWidth === stableWidthRef.current) {
        return;
      }
      
      stableWidthRef.current = window.innerWidth;
      stableHeightRef.current = window.innerHeight;

      // Update transitions dynamically on window resize
      cardsRef.current.forEach((card) => {
        if (card) {
          card.style.transition = 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), filter 0.15s ease-out';
        }
      });

      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        calculateOffsets();
        requestUpdate();
      }, 150);
    };

    window.addEventListener('resize', onResize);

    const handleNativeScroll = () => {
      requestUpdate();
    };
    window.addEventListener('scroll', handleNativeScroll, { passive: true });
    
    // Initial calculate before first update
    calculateOffsets();

    // Recalculate offsets after short delays to handle any asynchronous layout shifts
    // (e.g., dynamic images loading, font rendering shifts, or banner insertions)
    const timer1 = setTimeout(() => {
      calculateOffsets();
      requestUpdate();
    }, 500);

    const timer2 = setTimeout(() => {
      calculateOffsets();
      requestUpdate();
    }, 2000);

    setupLenis();

    requestUpdate();

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', handleNativeScroll);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (scheduledFrameRef.current !== null) {
        cancelAnimationFrame(scheduledFrameRef.current);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
      stackCompletedRef.current = false;
      cardsRef.current = [];
      transformsCache.clear();
      isUpdatingRef.current = false;
    };
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    setupLenis,
    requestUpdate
  ]);

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
      <div className="scroll-stack-inner">
        {children}
        {/* Spacer so the last pin can release cleanly */}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
};

export default ScrollStack;
