import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

import { articles } from '../data/content';

const finderMetaDefaults = [
  {
    dateModified: 'Today, 8:23 AM',
    size: '10.6 MB',
    kind: 'Pages Publication',
  },
  {
    dateModified: 'Yesterday, 2:15 PM',
    size: '4.2 MB',
    kind: 'Pages Publication',
  },
  {
    dateModified: 'Sunday, October 14, 2007, 6:48 PM',
    size: '884 KB',
    kind: 'Keynote Document',
  },
  {
    dateModified: 'Saturday, October 13, 2007, 5:36 PM',
    size: '768 KB',
    kind: 'Portable Document Format (PDF)',
  },
];

const clampValue = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type CardMetrics = {
  cardWidth: number;
  cardHeight: number;
  spacing: number;
  translateZBase: number;
  focusLift: number;
  reflectionHeight: number;
};

const computeCardMetrics = (width: number): CardMetrics => {
  const minContainer = 360;
  const maxContainer = 1280;
  const normalized = clampValue(
    (width - minContainer) / (maxContainer - minContainer),
    0,
    1
  );

  const cardWidth = 140 + (210 - 140) * normalized;
  const cardHeight = cardWidth * 0.86;
  const spacing = cardWidth * (0.58 + normalized * 0.18);
  const translateZBase = 150 + normalized * 90;
  const focusLift = cardWidth * 0.22;
  const reflectionHeight = Math.round(cardHeight * 0.85);

  return {
    cardWidth,
    cardHeight,
    spacing,
    translateZBase,
    focusLift,
    reflectionHeight,
  };
};

const ArticlesWindow = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [detailViewArticleIndex, setDetailViewArticleIndex] =
    useState<number | null>(null);
  const coverflowRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [splitRatio, setSplitRatio] = useState(0.58);
  const [cardMetrics, setCardMetrics] = useState<CardMetrics>(() =>
    computeCardMetrics(900)
  );
  const isMobile = useIsMobile();

  const coverImages = useMemo(
    () =>
      articles.map((_, index) => {
        const palette = ['#22303c', '#1a2333', '#16202a', '#1f1e2e', '#152226'];
        return palette[index % palette.length];
      }),
    [articles]
  );

  const tableRows = useMemo(
    () =>
      articles.map((article, index) => {
        const meta = finderMetaDefaults[index % finderMetaDefaults.length];
        return {
          name: article.name,
          datePublished: article.datePublished || meta.dateModified,
          size: meta.size,
          kind: meta.kind,
          year: article.year,
        };
      }),
    [articles]
  );

  const clampIndex = useCallback(
    (value: number) => Math.max(0, Math.min(articles.length - 1, value)),
    [articles.length]
  );

  const handleStep = useCallback(
    (delta: number) => {
      setActiveIndex((current) => clampIndex(current + delta));
    },
    [clampIndex]
  );

  const handleNext = useCallback(() => {
    handleStep(1);
  }, [handleStep]);

  const handlePrev = useCallback(() => {
    handleStep(-1);
  }, [handleStep]);

  useEffect(() => {
    const element = coverflowRef.current;
    if (!element) return;

    let rafId: number | null = null;
    let lastWidth = 0;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const newWidth = entry.contentRect.width;
      // Skip update if width change is less than 2px (prevents micro-updates)
      if (Math.abs(newWidth - lastWidth) < 2) return;

      // Cancel pending animation frame
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      // Throttle updates using requestAnimationFrame
      rafId = requestAnimationFrame(() => {
        lastWidth = newWidth;
        setCardMetrics(computeCardMetrics(newWidth));
        rafId = null;
      });
    });

    observer.observe(element);

    const handleWheel = (event: WheelEvent) => {
      if (articles.length <= 1) return;
      event.preventDefault();
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (delta > 8) {
        handleNext();
      } else if (delta < -8) {
        handlePrev();
      }
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      observer.disconnect();
      element.removeEventListener('wheel', handleWheel);
    };
  }, [handleNext, handlePrev]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      }
    },
    [handleNext, handlePrev]
  );

  const activeArticle = articles[activeIndex];
  const selectedRow = tableRows[activeIndex] ?? tableRows[0] ?? null;

  const handleDoubleClick = useCallback((index: number) => {
    setActiveIndex(index);
    setDetailViewArticleIndex(index);
    setDetailViewOpen(true);
  }, []);

  const handleCloseDetailView = useCallback(() => {
    setDetailViewOpen(false);
    setDetailViewArticleIndex(null);
  }, []);

  const detailViewArticle =
    detailViewArticleIndex !== null ? articles[detailViewArticleIndex] : null;
  const detailViewRow =
    detailViewArticleIndex !== null ? tableRows[detailViewArticleIndex] : null;

  const hasCoverImages = coverImages.length > 0;
  const overlayPaletteIndex = detailViewArticleIndex ?? activeIndex;
  const overlayBaseColor = hasCoverImages
    ? coverImages[overlayPaletteIndex % coverImages.length]
    : '#1b2330';
  const overlayAccentColor = hasCoverImages
    ? coverImages[(overlayPaletteIndex + 1) % coverImages.length]
    : '#121924';

  // Memoize card transforms to avoid recalculating on every render
  const cardTransforms = useMemo(() => {
    return articles.map((article, index) => {
      const offset = index - activeIndex;
      const clampedOffset = Math.max(-3, Math.min(3, offset));
      const translateX = clampedOffset * cardMetrics.spacing;
      const rotateY = clampedOffset * -35;
      const scale = Math.max(0.5, 1 - Math.abs(clampedOffset) * 0.2);
      const translateZ =
        cardMetrics.translateZBase -
        Math.abs(clampedOffset) * cardMetrics.spacing * 0.55 +
        (offset === 0 ? cardMetrics.focusLift : 0);
      const opacity = offset === 0 ? 1 : 0.7;

      return {
        translateX,
        rotateY,
        scale,
        translateZ,
        opacity,
        zIndex: 10 + articles.length - Math.abs(offset),
        boxShadow: offset === 0
          ? '0 30px 78px rgba(0,0,0,0.6)'
          : '0 18px 40px rgba(0,0,0,0.45)',
      };
    });
  }, [articles, activeIndex, cardMetrics]);

  const handleDividerPointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const startY = event.clientY;
    const startRatio = splitRatio;
    const MIN_RATIO = 0.3;
    const MAX_RATIO = 0.78;

    document.body.style.cursor = 'row-resize';

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientY - startY;
      const nextRatio = clampValue(
        startRatio + delta / rect.height,
        MIN_RATIO,
        MAX_RATIO
      );
      setSplitRatio(nextRatio);
    };

    const handlePointerUp = () => {
      document.body.style.cursor = '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden text-[11px] leading-5 text-[#1f2530]">
      <div
        ref={containerRef}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        {/* Hide coverflow on mobile to save space */}
        <div
          className="flex min-h-[240px] flex-col gap-4 px-0"
          style={{ flex: splitRatio }}
        >
          <div className="relative flex-1 overflow-hidden bg-[#000000]">
            {/* Glass reflective surface background */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[60%] origin-bottom opacity-90">
              <div className="relative h-full w-full">
                {/* Base dark glass surface with subtle texture - more transparent */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#050505] to-[#020202]" />
                {/* Stronger reflective highlight at the top */}
                <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/[0.15] via-white/[0.08] to-white/[0.03]" />
                {/* Secondary reflection layer */}
                <div className="absolute inset-x-0 top-[15%] h-[45%] bg-gradient-to-b from-transparent via-white/[0.035] to-white/[0.08]" />
                {/* Horizontal reflection bands */}
                <div className="absolute inset-x-0 top-[25%] h-[15%] bg-gradient-to-b from-white/[0.05] via-white/[0.025] to-transparent" />
                <div className="absolute inset-x-0 top-[50%] h-[20%] bg-gradient-to-b from-white/[0.04] via-white/[0.02] to-transparent opacity-80" />
                {/* Edge highlights for glass effect */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                {/* Subtle vertical highlights for depth */}
                <div className="absolute left-1/4 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/6 to-transparent" />
                <div className="absolute right-1/4 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/6 to-transparent" />
              </div>
            </div>

            <div className="relative z-10 flex h-full flex-col px-0">
              <div
                ref={coverflowRef}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-[#020202] via-[#040404] to-[#010102] focus:outline-none"
              >
                <div
                  className="absolute left-1/2 top-1/2 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2"
                  style={{
                    perspective: '1400px',
                    transformStyle: 'preserve-3d',
                    height: `${cardMetrics.cardHeight * 2.5}px`,
                    willChange: 'height',
                  }}
                >
                  {articles.map((article, index) => {
                    const transform = cardTransforms[index];
                    const baseColor = coverImages[index];
                    const accentColor = coverImages[(index + 1) % coverImages.length];

                    const renderCardFace = (mirrored = false) => (
                      <div
                        className="relative h-full w-full overflow-hidden rounded-[7px] border border-black/55"
                        style={
                          mirrored
                            ? { transform: 'scaleY(-1)', transformOrigin: 'top center' }
                            : undefined
                        }
                      >
                        {article.image ? (
                          <>
                            <img
                              src={article.image}
                              alt={article.name}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                          </>
                        ) : (
                          <>
                            <div
                              className="absolute inset-0"
                              style={{
                                background: `linear-gradient(135deg, ${baseColor}, ${accentColor})`,
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                          </>
                        )}
                        <div className="absolute bottom-3 left-3 right-3 text-left text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.72)]">
                          <p className="text-[11px] uppercase tracking-[0.36em] text-white/65">
                            {article.year}
                          </p>
                          <h3 className="mt-1 text-[12px] font-semibold leading-tight">
                            {article.name}
                          </h3>
                        </div>
                      </div>
                    );

                    return (
                      <div
                        key={article.name}
                        className="absolute left-1/2 top-1/2 origin-center transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                        style={{
                          transform: `translate3d(-50%, -50%, 0) translateX(${transform.translateX}px) translateZ(${transform.translateZ}px) rotateY(${transform.rotateY}deg) scale(${transform.scale})`,
                          opacity: transform.opacity,
                          zIndex: transform.zIndex,
                          willChange: 'transform, opacity',
                        }}
                      >
                        <button
                          type="button"
                          aria-label={`Mostra l'articolo ${article.name}`}
                          onClick={() => setActiveIndex(index)}
                          onDoubleClick={() => handleDoubleClick(index)}
                          className="relative rounded-[9px] border border-white/18 bg-gradient-to-br from-white/18 via-white/12 to-white/6 shadow-[0_28px_64px_rgba(0,0,0,0.6)] backdrop-blur-[7px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                          style={{
                            width: `${cardMetrics.cardWidth}px`,
                            height: `${cardMetrics.cardHeight}px`,
                            boxShadow: transform.boxShadow,
                          }}
                        >
                          {renderCardFace()}
                        </button>
                        <div
                          className="pointer-events-none absolute inset-x-0 top-full origin-top overflow-hidden"
                          style={{
                            height: `${cardMetrics.reflectionHeight}px`,
                            top: `${cardMetrics.cardHeight}px`,
                          }}
                        >
                          <div className="relative h-full w-full" style={{ opacity: 0.9 }}>
                            {renderCardFace(true)}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/15 to-black/5" />
                            {/* Additional reflection highlight */}
                            <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/20 via-white/10 to-transparent" />
                            {/* Bottom fade for realistic reflection */}
                            <div className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-black/45 to-transparent" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-[200px] bg-gradient-to-r from-black via-transparent to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-[200px] bg-gradient-to-l from-black via-transparent to-transparent" />

                <button
                  type="button"
                  onClick={handlePrev}
                  className="group absolute left-8 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/18 bg-gradient-to-b from-[#1c2128] via-[#12161c] to-[#050709] text-white/80 shadow-[0_6px_12px_rgba(0,0,0,0.55)] transition hover:scale-[1.05]"
                  aria-label="Mostra articolo precedente"
                >
                  <span className="text-sm font-semibold text-white/85 transition group-hover:-translate-x-0.5">
                    ‹
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="group absolute right-8 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/18 bg-gradient-to-b from-[#1c2128] via-[#12161c] to-[#050709] text-white/80 shadow-[0_6px_12px_rgba(0,0,0,0.55)] transition hover:scale-[1.05]"
                  aria-label="Mostra articolo successivo"
                >
                  <span className="text-sm font-semibold text-white/85 transition group-hover:translate-x-0.5">
                    ›
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          role="separator"
          onPointerDown={handleDividerPointerDown}
          className="group relative flex h-6 cursor-row-resize items-center justify-center px-5"
        >
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-60" />
        </div>

        <div
          className="flex min-h-[220px] flex-1 flex-col gap-4 px-0"
          style={{ flex: 1 - splitRatio }}
        >
          <section className="relative flex h-full w-full flex-col overflow-hidden rounded-none border border-[#c1c8d4] bg-gradient-to-b from-[#fbfbfd] via-[#f0f2f6] to-[#e1e5ec] text-[#2c3240] shadow-[0_20px_44px_rgba(20,28,40,0.16)]">
            <div className="overflow-auto border-b border-[#ccd3df]">
              <table className="min-w-full select-none text-[11px]">
                <thead className="bg-gradient-to-b from-white via-white to-[#e8ecf4] text-[#4b5360]">
                  <tr className="border-b border-[#cbd2dd]">
                    <th className="px-3 py-1.5 text-left font-semibold uppercase tracking-[0.28em]">
                      Name
                    </th>
                    <th className="px-3 py-1.5 text-left font-semibold uppercase tracking-[0.28em]">
                      Date Published
                    </th>
                    <th className="px-3 py-1.5 text-left font-semibold uppercase tracking-[0.28em]">
                      Size
                    </th>
                    <th className="px-3 py-1.5 text-left font-semibold uppercase tracking-[0.28em]">
                      Kind
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <tr
                        key={row.name}
                        onClick={() => {
                          if (isMobile && isActive) {
                            handleDoubleClick(index);
                          } else {
                            setActiveIndex(index);
                          }
                        }}
                        onDoubleClick={() => handleDoubleClick(index)}
                        className={`cursor-default border-b border-[#d5dae4] text-[11px] ${isActive
                          ? 'bg-[#dbe2f0]'
                          : 'bg-white/80 hover:bg-[#eef1f7]'
                          }`}
                      >
                        <td className="px-3 py-1.5 text-[11px] font-semibold text-[#1d212c]">
                          {row.name}
                        </td>
                        <td className="px-3 py-1.5 text-[#4c5461]">
                          {row.datePublished}
                        </td>
                        <td className="px-3 py-1.5 text-[#4c5461]">{row.size}</td>
                        <td className="px-3 py-1.5 text-[#4c5461]">{row.kind}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>


            {!detailViewOpen && (
              <div className="mt-auto flex items-center justify-between border-t border-[#c6ccd8] bg-gradient-to-b from-[#eef1f6] via-[#e4e7ee] to-[#d7dbe4] px-3 py-1.5 text-[11px] text-[#4a5260]">
                <span>
                  {articles.length > 0
                    ? `${activeIndex + 1} of ${articles.length} selected`
                    : 'No items'}
                </span>
                <span className="text-[#6a7280]">
                  {selectedRow?.size ?? '—'}
                </span>
                <span className="text-[#6a7280]">213.74 GB available</span>
              </div>
            )}
          </section>
        </div>
      </div>

      {detailViewOpen && detailViewArticle && detailViewRow && (
        <div className="absolute inset-0 z-50 flex flex-col overflow-hidden bg-gradient-to-b from-[#f5f5f5] via-[#ededed] to-[#e5e5e5]">
          <div className="flex items-center justify-between border-b border-[#b8b8b8] bg-gradient-to-b from-[#ebebeb] via-[#d7d7d7] to-[#cacaca] px-5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="min-w-0 pr-6">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[#6b7280]">
                {detailViewRow.datePublished}
              </p>
              <h2 className="truncate text-[14px] font-semibold text-[#1f2530] drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]">
                {detailViewArticle.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleCloseDetailView}
              className="flex h-7 w-7 items-center justify-center rounded border border-[#a0a0a0] bg-gradient-to-b from-white to-[#e8e8e8] text-[11px] font-semibold text-[#4a5260] shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition hover:bg-gradient-to-b hover:from-[#f0f0f0] hover:to-[#d7d7d7]"
              aria-label="Chiudi dettagli articolo"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-1 overflow-y-auto py-6">
            <div className={`grid w-full max-w-[900px] gap-6 ${isMobile ? 'grid-cols-1 px-4' : 'lg:grid-cols-[minmax(0,320px)_1fr] px-5'}`}>
              <div className={`mx-auto w-full ${isMobile ? 'max-w-full' : 'max-w-[320px]'}`}>
                <div className="relative overflow-hidden rounded-[8px] border border-[#b8b8b8] bg-gradient-to-b from-white to-[#f0f0f0] px-5 py-6 shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.8)]">
                  {detailViewArticle.image ? (
                    <>
                      <img
                        src={detailViewArticle.image}
                        alt={detailViewArticle.name}
                        className="absolute inset-0 h-full w-full object-cover opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </>
                  ) : (
                    <div
                      className="absolute inset-0 opacity-85"
                      style={{
                        background: `linear-gradient(140deg, ${overlayBaseColor}, ${overlayAccentColor})`,
                      }}
                    />
                  )}
                  <div className="relative flex h-full flex-col justify-between text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                    <span className="text-[11px] uppercase tracking-[0.4em] text-white/80">
                      {detailViewArticle.year}
                    </span>
                    <h3 className="mt-5 text-[20px] font-semibold leading-tight">
                      {detailViewArticle.name}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 text-left text-[11px] leading-relaxed text-[#2f3540]">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#7b8390]">
                    {detailViewRow.kind}
                  </p>
                  <h3 className="text-[18px] font-semibold text-[#1c2029] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                    {detailViewArticle.name}
                  </h3>
                </div>
                <p className="text-[11px] leading-relaxed text-[#47505d]">
                  {detailViewArticle.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {detailViewArticle.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-[#c1c8d4] bg-gradient-to-b from-white via-[#f3f5f8] to-[#e3e6ed] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3b4050] shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-[#d1d6df] pt-3 text-[11px]">
                  <div>
                    <dt className="font-semibold text-[#6b7280]">Date Published</dt>
                    <dd className="text-[#4c5461]">{detailViewRow.datePublished}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#6b7280]">Size</dt>
                    <dd className="text-[#4c5461]">{detailViewRow.size}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#6b7280]">Kind</dt>
                    <dd className="text-[#4c5461]">{detailViewRow.kind}</dd>
                  </div>
                </dl>
                {detailViewArticle.link && (
                  <a
                    href={detailViewArticle.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-max items-center gap-1 rounded border border-[#a0a0a0] bg-gradient-to-b from-white to-[#e8e8e8] px-4 py-1.5 text-[11px] font-semibold text-[#2f3540] shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition hover:bg-gradient-to-b hover:from-[#f0f0f0] hover:to-[#d7d7d7]"
                  >
                    Leggi articolo
                    <span aria-hidden>↗</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlesWindow;

