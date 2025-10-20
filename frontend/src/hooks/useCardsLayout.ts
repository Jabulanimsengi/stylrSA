import { useEffect, useState } from 'react';

type LayoutVars = {
  cardsPerView: number;
  gapPx: number;
  cardHeight: number;
};

type ElementRef = { current: HTMLElement | null } | undefined;

export function useCardsLayout(containerRef?: ElementRef): LayoutVars {
  const readVars = (): LayoutVars => {
    const el = containerRef?.current ?? document.documentElement;
    const styles = getComputedStyle(el);
    const per = parseFloat(styles.getPropertyValue('--cards-per-view')) || 4;

    const gapRaw = styles.getPropertyValue('--card-gap').trim();
    const gap = gapRaw.endsWith('px') ? parseFloat(gapRaw) : parseFloat(gapRaw) || 12;

    const hRaw = styles.getPropertyValue('--card-height').trim();
    const cardHeight = hRaw.endsWith('px') ? parseFloat(hRaw) : parseFloat(hRaw) || 340;

    return { cardsPerView: per, gapPx: gap, cardHeight };
  };

  const [vars, setVars] = useState<LayoutVars>({ cardsPerView: 4, gapPx: 12, cardHeight: 340 });

  useEffect(() => {
    const update = () => setVars(readVars());
    update();

    window.addEventListener('resize', update);
    let ro: ResizeObserver | null = null;
    const el = containerRef?.current;
    if (el && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => update());
      ro.observe(el);
    }
    return () => {
      window.removeEventListener('resize', update);
      if (ro && el) ro.unobserve(el);
    };
  }, [containerRef]);

  return vars;
}
