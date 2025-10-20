export function useCardsLayout() {
  console.warn('useCardsLayout is deprecated now that FeaturedSalons uses fixed-width cards.');
  return { cardsPerView: 4, gapPx: 12, cardHeight: 340 };
}
