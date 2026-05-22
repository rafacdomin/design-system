import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Carousel } from './Carousel'
import { ThemeProvider } from '@ds/core'
import { type EmblaCarouselType } from 'embla-carousel'
import { vi } from 'vitest'

let registeredCallbacks: Record<string, (api: EmblaCarouselType) => void> = {}

const mockScrollNext = vi.fn()
const mockScrollPrev = vi.fn()
const mockScrollTo = vi.fn()
const mockReInit = vi.fn(() => {
  if (registeredCallbacks['reInit']) {
    registeredCallbacks['reInit'](mockEmblaApi as unknown as EmblaCarouselType)
  }
})
const mockCanScrollNext = vi.fn(() => true)
const mockCanScrollPrev = vi.fn(() => true)
const mockSelectedScrollSnap = vi.fn(() => 0)
const mockScrollSnapList = vi.fn(() => [0, 1, 2])
const mockSlidesInView = vi.fn(() => [0])

const mockOn = vi.fn((event: string, cb: (api: EmblaCarouselType) => void) => {
  registeredCallbacks[event] = cb
})
const mockOff = vi.fn()

const mockEmblaApi = {
  scrollNext: mockScrollNext,
  scrollPrev: mockScrollPrev,
  scrollTo: mockScrollTo,
  reInit: mockReInit,
  canScrollNext: mockCanScrollNext,
  canScrollPrev: mockCanScrollPrev,
  selectedScrollSnap: mockSelectedScrollSnap,
  scrollSnapList: mockScrollSnapList,
  slidesInView: mockSlidesInView,
  on: mockOn,
  off: mockOff,
}

vi.mock('embla-carousel-react', () => {
  return {
    default: () => [(_node: HTMLElement | null) => {}, mockEmblaApi],
  }
})

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Carousel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    registeredCallbacks = {}
    mockCanScrollNext.mockReturnValue(true)
    mockCanScrollPrev.mockReturnValue(true)
    mockSelectedScrollSnap.mockReturnValue(0)
    mockScrollSnapList.mockReturnValue([0, 1, 2])
    mockSlidesInView.mockReturnValue([0])
  })

  describe('Rendering', () => {
    it('should render the carousel container and children slides', () => {
      renderWithTheme(
        <Carousel>
          <div key="1">Slide 1</div>
          <div key="2">Slide 2</div>
          <div key="3">Slide 3</div>
        </Carousel>
      )

      // Main container with role region
      const carousel = screen.getByRole('region')
      expect(carousel).toBeInTheDocument()
      expect(carousel).toHaveAttribute('aria-roledescription', 'carousel')

      // Slides rendered
      expect(screen.getByText('Slide 1')).toBeInTheDocument()
      expect(screen.getByText('Slide 2')).toBeInTheDocument()
      expect(screen.getByText('Slide 3')).toBeInTheDocument()
    })

    it('should update dots when slides count changes dynamically', () => {
      mockScrollSnapList.mockReturnValue([0, 1])

      const { rerender } = renderWithTheme(
        <Carousel>
          <div key="1">Slide 1</div>
          <div key="2">Slide 2</div>
        </Carousel>
      )

      expect(
        screen.getByRole('button', { name: /ir para slide 1/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /ir para slide 2/i })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /ir para slide 3/i })
      ).not.toBeInTheDocument()

      // Change the mock return value to simulate Embla's behavior when 3 slides are present
      mockScrollSnapList.mockReturnValue([0, 1, 2])

      // Re-render with an extra slide
      rerender(
        <ThemeProvider>
          <Carousel>
            <div key="1">Slide 1</div>
            <div key="2">Slide 2</div>
            <div key="3">Slide 3</div>
          </Carousel>
        </ThemeProvider>
      )

      expect(
        screen.getByRole('button', { name: /ir para slide 3/i })
      ).toBeInTheDocument()
    })

    it('should not render arrows or dots if showArrows and showDots are false', () => {
      renderWithTheme(
        <Carousel showArrows={false} showDots={false}>
          <div key="1">Slide 1</div>
          <div key="2">Slide 2</div>
        </Carousel>
      )

      expect(
        screen.queryByRole('button', { name: /slide anterior/i })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /próximo slide/i })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /ir para slide 1/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call scrollPrev and scrollNext when arrows are clicked', async () => {
      const user = userEvent.setup()
      renderWithTheme(
        <Carousel>
          <div key="1">Slide 1</div>
          <div key="2">Slide 2</div>
        </Carousel>
      )

      const prevBtn = screen.getByRole('button', { name: /slide anterior/i })
      const nextBtn = screen.getByRole('button', { name: /próximo slide/i })

      await user.click(nextBtn)
      expect(mockScrollNext).toHaveBeenCalledTimes(1)

      await user.click(prevBtn)
      expect(mockScrollPrev).toHaveBeenCalledTimes(1)
    })

    it('should call scrollTo when dots are clicked', async () => {
      const user = userEvent.setup()
      renderWithTheme(
        <Carousel>
          <div key="1">Slide 1</div>
          <div key="2">Slide 2</div>
        </Carousel>
      )

      const dot2 = screen.getByRole('button', { name: /ir para slide 2/i })
      await user.click(dot2)

      expect(mockScrollTo).toHaveBeenCalledWith(1)
    })

    it('should disable arrows when scrolling is not possible', () => {
      mockCanScrollPrev.mockReturnValue(false)
      mockCanScrollNext.mockReturnValue(false)

      renderWithTheme(
        <Carousel>
          <div key="1">Slide 1</div>
          <div key="2">Slide 2</div>
        </Carousel>
      )

      const prevBtn = screen.getByRole('button', { name: /slide anterior/i })
      const nextBtn = screen.getByRole('button', { name: /próximo slide/i })

      expect(prevBtn).toBeDisabled()
      expect(nextBtn).toBeDisabled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should navigate on ArrowLeft and ArrowRight keys when focused', () => {
      renderWithTheme(
        <Carousel>
          <div key="1">Slide 1</div>
          <div key="2">Slide 2</div>
        </Carousel>
      )

      const carousel = screen.getByRole('region')
      act(() => {
        carousel.focus()
      })

      act(() => {
        fireEvent.keyDown(carousel, { key: 'ArrowRight' })
      })
      expect(mockScrollNext).toHaveBeenCalledTimes(1)

      act(() => {
        fireEvent.keyDown(carousel, { key: 'ArrowLeft' })
      })
      expect(mockScrollPrev).toHaveBeenCalledTimes(1)
    })
  })

  describe('Autoplay', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should scroll automatically when autoplay is enabled', () => {
      renderWithTheme(
        <Carousel autoplay autoplayInterval={3000}>
          <div key="1">Slide 1</div>
          <div key="2">Slide 2</div>
        </Carousel>
      )

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(mockScrollNext).toHaveBeenCalledTimes(1)
    })

    it('should pause autoplay on mouseenter/focus and resume on mouseleave/blur', () => {
      renderWithTheme(
        <Carousel autoplay autoplayInterval={3000}>
          <div key="1">Slide 1</div>
          <div key="2">Slide 2</div>
        </Carousel>
      )

      const carousel = screen.getByRole('region')

      // Mouse enters - paused
      fireEvent.mouseEnter(carousel)
      act(() => {
        vi.advanceTimersByTime(3000)
      })
      expect(mockScrollNext).not.toHaveBeenCalled()

      // Mouse leaves - resumed
      fireEvent.mouseLeave(carousel)
      act(() => {
        vi.advanceTimersByTime(3000)
      })
      expect(mockScrollNext).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithTheme(
        <Carousel aria-label="Projetos do Portfólio">
          <div key="1">Slide 1</div>
          <div key="2">Slide 2</div>
        </Carousel>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should apply correct ARIA roles and labels to slides', () => {
      mockSelectedScrollSnap.mockReturnValue(0)
      mockScrollSnapList.mockReturnValue([0, 1])

      renderWithTheme(
        <Carousel>
          <div key="1">Slide 1</div>
          <div key="2">Slide 2</div>
        </Carousel>
      )

      const slide1 = screen.getByText('Slide 1').closest('[role="group"]')
      const slide2 = screen.getByText('Slide 2').closest('[role="group"]')

      expect(slide1).toHaveAttribute('aria-roledescription', 'slide')
      expect(slide1).toHaveAttribute('aria-label', 'Slide 1 de 2')
      expect(slide1).not.toHaveAttribute('aria-hidden')

      expect(slide2).toHaveAttribute('aria-roledescription', 'slide')
      expect(slide2).toHaveAttribute('aria-label', 'Slide 2 de 2')
      expect(slide2).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
