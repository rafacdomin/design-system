import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useId,
} from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
import { withTheme } from '@ds/core'
import { clsx } from 'clsx'
import styles from './Carousel.module.scss'

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode[]
  showArrows?: boolean
  showDots?: boolean
  autoplay?: boolean
  autoplayInterval?: number
  loop?: boolean
  slidesPerView?:
    | number
    | { mobile?: number; tablet?: number; desktop?: number }
  prevAriaLabel?: string
  nextAriaLabel?: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CarouselPreviousProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CarouselNextProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CarouselDotsProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CarouselContextValue {
  emblaRef: (node: HTMLElement | null) => void
  emblaApi: EmblaCarouselType | undefined
  selectedIndex: number
  scrollSnaps: number[]
  slidesInView: number[]
  totalSlides: number
  canScrollPrev: boolean
  canScrollNext: boolean
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
  contentId: string
  prevAriaLabel: string
  nextAriaLabel: string
}

const CarouselContext = createContext<CarouselContextValue | null>(null)

export function useCarousel() {
  const context = useContext(CarouselContext)
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }
  return context
}

const CarouselComponent = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      children,
      showArrows = true,
      showDots = true,
      autoplay = false,
      autoplayInterval = 4000,
      loop = false,
      slidesPerView,
      className,
      prevAriaLabel = 'Slide anterior',
      nextAriaLabel = 'Próximo slide',
      ...props
    },
    ref
  ) => {
    const emblaOptions = React.useMemo<EmblaOptionsType>(() => {
      let mobile = 1
      let tablet = 2
      let desktop = 3

      if (typeof slidesPerView === 'number') {
        mobile = Math.min(1, slidesPerView)
        tablet = Math.min(2, slidesPerView)
        desktop = Math.min(3, slidesPerView)
      } else if (slidesPerView) {
        if (slidesPerView.mobile !== undefined) {
          mobile = Math.min(1, slidesPerView.mobile)
        }
        if (slidesPerView.tablet !== undefined) {
          tablet = Math.min(2, slidesPerView.tablet)
        }
        if (slidesPerView.desktop !== undefined) {
          desktop = Math.min(3, slidesPerView.desktop)
        }
      }

      return {
        loop,
        slidesToScroll: mobile,
        breakpoints: {
          '(min-width: 768px)': { slidesToScroll: tablet },
          '(min-width: 1024px)': { slidesToScroll: desktop },
        },
      }
    }, [loop, slidesPerView])

    const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
    const [slidesInView, setSlidesInView] = useState<number[]>([0])
    const [canScrollPrev, setCanScrollPrev] = useState(false)
    const [canScrollNext, setCanScrollNext] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const contentId = useId()

    const childrenKeys = React.useMemo(() => {
      return React.Children.toArray(children)
        .map((child) => (React.isValidElement(child) ? child.key : ''))
        .join(',')
    }, [children])

    useEffect(() => {
      if (emblaApi) {
        emblaApi.reInit(emblaOptions)
      }
    }, [emblaApi, emblaOptions, childrenKeys])

    const onSelect = useCallback((api: EmblaCarouselType) => {
      setSelectedIndex(api.selectedScrollSnap())
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
      if (typeof api.slidesInView === 'function') {
        setSlidesInView(api.slidesInView())
      }
    }, [])

    const onInitOrReInit = useCallback(
      (api: EmblaCarouselType) => {
        setScrollSnaps(api.scrollSnapList())
        onSelect(api)
      },
      [onSelect]
    )

    const scrollPrev = useCallback(() => {
      emblaApi?.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
      emblaApi?.scrollNext()
    }, [emblaApi])

    const scrollTo = useCallback(
      (index: number) => {
        emblaApi?.scrollTo(index)
      },
      [emblaApi]
    )

    useEffect(() => {
      if (!emblaApi) return

      // eslint-disable-next-line react-hooks/set-state-in-effect
      onInitOrReInit(emblaApi)

      emblaApi.on('select', onSelect)
      emblaApi.on('init', onInitOrReInit)
      emblaApi.on('reInit', onInitOrReInit)

      return () => {
        emblaApi.off('select', onSelect)
        emblaApi.off('init', onInitOrReInit)
        emblaApi.off('reInit', onInitOrReInit)
      }
    }, [emblaApi, onSelect, onInitOrReInit])

    useEffect(() => {
      if (!autoplay || !emblaApi) return

      const intervalId = setInterval(() => {
        if (isPaused) return
        if (emblaApi.canScrollNext()) {
          emblaApi.scrollNext()
        } else {
          emblaApi.scrollTo(0)
        }
      }, autoplayInterval)

      return () => clearInterval(intervalId)
    }, [autoplay, autoplayInterval, emblaApi, isPaused])

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    const totalSlides = React.Children.count(children)

    const customStyles = React.useMemo(() => {
      const stylesObj: Record<string, string | number> = {}
      let mobile = 1
      let tablet = 2
      let desktop = 3

      if (typeof slidesPerView === 'number') {
        mobile = Math.min(1, slidesPerView)
        tablet = Math.min(2, slidesPerView)
        desktop = Math.min(3, slidesPerView)
      } else if (slidesPerView) {
        if (slidesPerView.mobile !== undefined) {
          mobile = Math.min(1, slidesPerView.mobile)
        }
        if (slidesPerView.tablet !== undefined) {
          tablet = Math.min(2, slidesPerView.tablet)
        }
        if (slidesPerView.desktop !== undefined) {
          desktop = Math.min(3, slidesPerView.desktop)
        }
      }

      stylesObj['--ds-carousel-slides-per-view-mobile'] = mobile
      stylesObj['--ds-carousel-slides-per-view-tablet'] = tablet
      stylesObj['--ds-carousel-slides-per-view-desktop'] = desktop

      return stylesObj as React.CSSProperties
    }, [slidesPerView])

    const contextValue: CarouselContextValue = {
      emblaRef,
      emblaApi,
      selectedIndex,
      scrollSnaps,
      slidesInView,
      totalSlides,
      canScrollPrev,
      canScrollNext,
      scrollPrev,
      scrollNext,
      scrollTo,
      contentId,
      prevAriaLabel,
      nextAriaLabel,
    }

    return (
      <CarouselContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={clsx(styles.carousel, className)}
          style={{ ...customStyles, ...props.style }}
          role="region"
          aria-roledescription="carousel"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          {...props}
        >
          <CarouselContentComponent>
            {React.Children.map(children, (child, index) => (
              <CarouselItemComponent key={index} index={index}>
                {child}
              </CarouselItemComponent>
            ))}
          </CarouselContentComponent>

          {(showArrows || showDots) && (
            <div className={styles.controls}>
              {showArrows && <CarouselPreviousComponent />}
              {showDots && <CarouselDotsComponent />}
              {showArrows && <CarouselNextComponent />}
            </div>
          )}
        </div>
      </CarouselContext.Provider>
    )
  }
)

CarouselComponent.displayName = 'Carousel'

const CarouselContentComponent = React.forwardRef<
  HTMLDivElement,
  CarouselContentProps
>(({ className, children, ...props }, ref) => {
  const { emblaRef, contentId } = useCarousel()
  return (
    <div
      ref={emblaRef}
      className={clsx(styles.viewport, className)}
      id={contentId}
      {...props}
    >
      <div ref={ref} className={styles.container}>
        {children}
      </div>
    </div>
  )
})

CarouselContentComponent.displayName = 'Carousel.Content'

const CarouselItemComponent = React.forwardRef<
  HTMLDivElement,
  CarouselItemProps
>(({ className, index, children, ...props }, ref) => {
  const { slidesInView, totalSlides } = useCarousel()
  const isInView = slidesInView.includes(index)
  return (
    <div
      ref={ref}
      className={clsx(styles.slide, className)}
      role="group"
      aria-roledescription="slide"
      aria-label={`Slide ${index + 1} de ${totalSlides}`}
      aria-hidden={!isInView ? 'true' : undefined}
      {...props}
    >
      {children}
    </div>
  )
})

CarouselItemComponent.displayName = 'Carousel.Item'

const CarouselPreviousComponent = React.forwardRef<
  HTMLButtonElement,
  CarouselPreviousProps
>(({ className, ...props }, ref) => {
  const { scrollPrev, canScrollPrev, contentId, prevAriaLabel } = useCarousel()
  return (
    <button
      ref={ref}
      type="button"
      className={clsx(styles.buttonPrev, className)}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      aria-label={props['aria-label'] || prevAriaLabel}
      aria-controls={contentId}
      {...props}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  )
})

CarouselPreviousComponent.displayName = 'Carousel.Previous'

const CarouselNextComponent = React.forwardRef<
  HTMLButtonElement,
  CarouselNextProps
>(({ className, ...props }, ref) => {
  const { scrollNext, canScrollNext, contentId, nextAriaLabel } = useCarousel()
  return (
    <button
      ref={ref}
      type="button"
      className={clsx(styles.buttonNext, className)}
      disabled={!canScrollNext}
      onClick={scrollNext}
      aria-label={props['aria-label'] || nextAriaLabel}
      aria-controls={contentId}
      {...props}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  )
})

CarouselNextComponent.displayName = 'Carousel.Next'

const CarouselDotsComponent = React.forwardRef<
  HTMLDivElement,
  CarouselDotsProps
>(({ className, ...props }, ref) => {
  const { scrollSnaps, selectedIndex, scrollTo, contentId } = useCarousel()

  if (scrollSnaps.length <= 1) return null

  return (
    <div ref={ref} className={clsx(styles.dots, className)} {...props}>
      {scrollSnaps.map((_, index) => {
        const isActive = index === selectedIndex
        return (
          <button
            key={index}
            type="button"
            className={clsx(styles.dot, isActive && styles.active)}
            onClick={() => scrollTo(index)}
            aria-label={`Ir para slide ${index + 1}`}
            aria-current={isActive ? 'true' : undefined}
            aria-controls={contentId}
          />
        )
      })}
    </div>
  )
})

CarouselDotsComponent.displayName = 'Carousel.Dots'

// Wrapping in theme HOC
const ThemedCarousel = withTheme<HTMLDivElement, CarouselProps>(
  CarouselComponent
)

// Compounding
export const Carousel = Object.assign(ThemedCarousel, {
  Content: CarouselContentComponent,
  Item: CarouselItemComponent,
  Previous: CarouselPreviousComponent,
  Next: CarouselNextComponent,
  Dots: CarouselDotsComponent,
})
