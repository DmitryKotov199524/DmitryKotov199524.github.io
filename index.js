document.addEventListener('DOMContentLoaded', function() {

/**
===================================================================
ОСНОВНАЯ ФУНКЦИЯ ЗАПУСКА ПРИЛОЖЕНИЯ
===================================================================
*/
function initializeApp() {
  initHeaderSection();
  initAboutSection();
  initPortfolioSection();
  initContactsSection();
  initNavigationAndScrolling();
}

/**
Инициализирует анимацию "пишущей машинки" в хедере.
*/
function initHeaderSection() {
  const typingText = document.querySelector(".typing-text");
  if (!typingText) return;

  // Сохраняем оригинальный текст
  const originalText = typingText.textContent;

  // Проверяем предпочтения пользователя относительно анимаций
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Определяем мобильное устройство
  const isMobile = window.innerWidth <= 768;

  // На мобильных устройствах или при отключенных анимациях показываем текст сразу
  if (prefersReduced || isMobile) {
    typingText.style.animation = 'none';
    typingText.style.borderRight = 'none';
    typingText.style.whiteSpace = isMobile && window.innerWidth > 360 ? 'nowrap' : 'normal';
    
    // Убеждаемся, что текст установлен корректно (без дублирования)
    if (typingText.textContent !== originalText) {
      typingText.textContent = originalText;
    }
    return;
  }

  // Для десктопов оставляем оригинальную анимацию
  const restartTypingAnimation = () => {
    typingText.style.animation = 'none';
    requestAnimationFrame(() => {
      typingText.style.animation = '';
    });
  };

  setInterval(restartTypingAnimation, 6000);
}

/**
Инициализирует анимацию плавного появления для секции "Обо мне".
*/
function initAboutSection() {
  const animatedElement = document.querySelector('.about-content');
  if (!animatedElement) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(animatedElement);
}

/**
Инициализирует 3D-карусель в секции "Портфолио" с оптимизированной загрузкой GIF
*/
function initPortfolioSection() {
  const portfolioSection = document.querySelector('#portfolio');
  if (!portfolioSection) return;

  const cards = portfolioSection.querySelectorAll(".card");
  const memberName = portfolioSection.querySelector(".member-name");
  const memberRole = portfolioSection.querySelector(".member-role");
  const leftArrow = portfolioSection.querySelector(".nav-arrow.left");
  const rightArrow = portfolioSection.querySelector(".nav-arrow.right");

  let currentIndex = 0;
  let isAnimating = false;
  let gifPreloadStarted = false;

  // Объект для хранения состояния загрузки GIF
  const gifLoadState = new Map();

  // Функция предзагрузки GIF
  function preloadGifs() {
    if (gifPreloadStarted) return;
    gifPreloadStarted = true;

    cards.forEach((card, index) => {
      const gifSrc = card.querySelector('img').getAttribute('data-gif');
      if (!gifSrc) return;

      const loadingIndicator = card.querySelector('.loading-indicator');
      loadingIndicator.classList.add('visible');

      gifLoadState.set(index, {
        loaded: false,
        error: false,
        element: card
      });

      const img = new Image();
      img.onload = function() {
        gifLoadState.set(index, {
          loaded: true,
          error: false,
          element: card
        });
        
        card.setAttribute('data-gif-loaded', 'true');
        card.classList.add('gif-ready');
        loadingIndicator.classList.remove('visible');
        
        // Если эта карточка сейчас в центре, сразу показываем GIF
        if (card.classList.contains('center')) {
          showGifForCard(card);
        }
      };

      img.onerror = function() {
        gifLoadState.set(index, {
          loaded: false,
          error: true,
          element: card
        });
        
        loadingIndicator.classList.remove('visible');
      };

      // Начинаем загрузку
      img.src = gifSrc;
    });
  }

  // Функция показа GIF для конкретной карточки
  function showGifForCard(card) {
    const gifContainer = card.querySelector('.gif-container');
    const staticImg = card.querySelector('.static-img');
    const gifSrc = card.querySelector('img').getAttribute('data-gif');
    const gifState = gifLoadState.get(parseInt(card.dataset.index));
    
    if (gifState && gifState.loaded && gifSrc) {
      // Устанавливаем multiple backgrounds: сначала GIF, потом градиент
      gifContainer.style.backgroundImage = `url(${gifSrc}), linear-gradient(0deg, rgba(8, 8, 8, 1) 0%, rgba(125, 123, 123, 1) 22%, rgba(240, 237, 237, 1) 41%, rgba(250, 250, 250, 1) 50%, rgba(125, 123, 123, 1) 78%, rgba(8, 8, 8, 1) 100%)`;
      card.classList.add('gif-ready');
      // Скрываем статичное изображение для центральной карточки
      if (card.classList.contains('center')) {
        staticImg.style.opacity = '0';
      }
    } else {
      // Если GIF не загружена, показываем статичное изображение
      card.classList.remove('gif-ready');
      staticImg.style.opacity = '1';
    }
  }

  // Функция скрытия GIF для неактивных карточек и показа статичного изображения
  function hideGifForCard(card) {
    const gifContainer = card.querySelector('.gif-container');
    const staticImg = card.querySelector('.static-img');
    
    // Очищаем background-image чтобы остановить анимацию GIF
    gifContainer.style.backgroundImage = 'linear-gradient(0deg, rgba(8, 8, 8, 1) 0%, rgba(125, 123, 123, 1) 22%, rgba(240, 237, 237, 1) 41%, rgba(250, 250, 250, 1) 50%, rgba(125, 123, 123, 1) 78%, rgba(8, 8, 8, 1) 100%)';
    card.classList.remove('gif-ready');
    
    // ВАЖНОЕ ИСПРАВЛЕНИЕ: Всегда показываем статичное изображение для нецентральных карточек
    staticImg.style.opacity = '1';
  }

  function updateCarousel(newIndex) {
    if (isAnimating) return;
    isAnimating = true;

    currentIndex = (newIndex + cards.length) % cards.length;

    cards.forEach((card, i) => {
      const offset = (i - currentIndex + cards.length) % cards.length;

      card.classList.remove(
        "center",
        "left-1",
        "left-2",
        "right-1",
        "right-2",
        "hidden"
      );

      if (offset === 0) {
        card.classList.add("center");
        // Показываем GIF если она загружена
        showGifForCard(card);
      } else if (offset === 1) {
        card.classList.add("right-1");
        // Скрываем GIF для неактивных карточек и показываем статичное изображение
        hideGifForCard(card);
      } else if (offset === 2) {
        card.classList.add("right-2");
        hideGifForCard(card);
      } else if (offset === cards.length - 1) {
        card.classList.add("left-1");
        hideGifForCard(card);
      } else if (offset === cards.length - 2) {
        card.classList.add("left-2");
        hideGifForCard(card);
      } else {
        card.classList.add("hidden");
        hideGifForCard(card);
      }
    });

    // Анимация смены имени и GitHub ссылки
    memberName.style.opacity = "0";
    memberRole.style.opacity = "0";

    setTimeout(() => {
      const currentCard = cards[currentIndex];
      memberName.textContent = currentCard.dataset.name || '';
      
      const githubLink = currentCard.dataset.link || 'https://github.com/DmitryKotov199524';
      
      memberRole.innerHTML = `
        <a href="${githubLink}" class="github-link" target="_blank">
          <svg class="github-icon" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.337-3.369-1.337-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.14 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
        </a>
      `;
      memberName.style.opacity = "1";
      memberRole.style.opacity = "1";
    }, 300);

    setTimeout(() => {
      isAnimating = false;
    }, 800);
  }

  // Обработчики событий
  leftArrow.addEventListener("click", () => {
    updateCarousel(currentIndex - 1);
  });

  rightArrow.addEventListener("click", () => {
    updateCarousel(currentIndex + 1);
  });

  cards.forEach((card, i) => {
    card.addEventListener("click", () => {
      updateCarousel(i);
    });
  });

  // Управление с клавиатуры
  const keydownHandler = (e) => {
    if (e.key === "ArrowLeft") {
      updateCarousel(currentIndex - 1);
    } else if (e.key === "ArrowRight") {
      updateCarousel(currentIndex + 1);
    }
  };

  // Свайпы для мобильных устройств
  let touchStartX = 0;
  let touchEndX = 0;

  portfolioSection.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  portfolioSection.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        updateCarousel(currentIndex + 1);
      } else {
        updateCarousel(currentIndex - 1);
      }
    }
  }

  // Инициализация при загрузке секции
  new IntersectionObserver(entries => {
    const portfolioIsVisible = entries[0].isIntersecting;
    if (portfolioIsVisible) {
      document.addEventListener('keydown', keydownHandler);
      
      // Запускаем предзагрузку GIF когда секция становится видимой
      if (!gifPreloadStarted) {
        preloadGifs();
      }
      
      updateCarousel(0);
    } else {
      document.removeEventListener('keydown', keydownHandler);
    }
  }, { threshold: 0.1 }).observe(portfolioSection);
}

/**
Инициализирует интерактивные элементы в секции "Контакты".
*/
function initContactsSection() {
  const contactItems = document.querySelectorAll('.sci li');
  if (contactItems.length === 0) return;

  // Инициализируем VanillaTilt только для устройств с hover
  if (window.matchMedia('(hover: hover)').matches && typeof VanillaTilt !== 'undefined') {
    const links = document.querySelectorAll(".sci li a");
    VanillaTilt.init(links, { 
      max: 30, 
      speed: 400, 
      glare: true, 
      "max-glare": 0.5 
    });
  }

  const body = document.body;
  contactItems.forEach(item => {
    item.addEventListener('mouseenter', (event) => {
      const color = getComputedStyle(event.currentTarget).getPropertyValue('--clr').trim();
      if (color) body.style.backgroundColor = color;
    });
    item.addEventListener('mouseleave', () => {
      body.style.backgroundColor = '#000';
    });
  });
}

/**
===================================================================
ИНИЦИАЛИЗАЦИЯ НАВИГАЦИИ И СКРОЛЛА (АДАПТИВНАЯ ВЕРСИЯ)
===================================================================
*/
function initNavigationAndScrolling() {
  const navLinks = document.querySelectorAll(".main-nav a");
  const navHighlight = document.querySelector(".nav-highlight");
  const sections = document.querySelectorAll("main section[id]");

  if (navLinks.length === 0 || !navHighlight || sections.length === 0) return;

  let isProgrammaticScroll = false;
  let scrollTimeout;
  let isScrolling = false;

  function moveHighlight() {
    const activeLink = document.querySelector(".main-nav a.nav-active");
    if (activeLink) {
      navHighlight.style.width = `${activeLink.offsetWidth}px`;
      navHighlight.style.left = `${activeLink.offsetLeft}px`;
    }
  }

  function updateActiveSection() {
    if (isProgrammaticScroll) return;
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    let currentSectionId = sections[0].id;

    sections.forEach(section => {
      if (scrollPosition >= section.offsetTop) {
        currentSectionId = section.id;
      }
    });

    // НЕМЕДЛЕННОЕ обновление навигации без задержек
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${currentSectionId}`;
      link.classList.toggle("nav-active", isActive);
    });
    moveHighlight();
  }

  function scrollToSection(sectionId) {
    const targetSection = document.querySelector(sectionId);
    if (!targetSection || isScrolling) return;

    isScrolling = true;
    isProgrammaticScroll = true;

    // НЕМЕДЛЕННОЕ обновление навигации ПЕРЕД началом скролла
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === sectionId;
      link.classList.toggle("nav-active", isActive);
    });
    moveHighlight();

    targetSection.scrollIntoView({ 
      behavior: "smooth",
      block: "start"
    });
    
    let scrollEndTimer = setTimeout(() => {
      isScrolling = false;
      isProgrammaticScroll = false;
    }, 800);
  }

  navLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      scrollToSection(this.getAttribute("href"));
    });
  });

  const sectionIds = Array.from(sections).map(s => `#${s.id}`);
  const getCurrentSectionIndex = () => {
    const activeLink = document.querySelector('.main-nav a.nav-active');
    return activeLink ? sectionIds.indexOf(activeLink.getAttribute('href')) : 0;
  };

  // Функция пролистывания колесом (только для десктопов)
  const scrollCooldown = 800;
  let lastScrollTime = 0;

  const wheelHandler = (e) => {
    const currentTime = Date.now();
    if (currentTime - lastScrollTime < scrollCooldown) return;
    if (isScrolling || e.target.closest('.carousel-container')) return;

    e.preventDefault();
    const currentIndex = getCurrentSectionIndex();

    if (e.deltaY > 0) {
      const nextIndex = Math.min(currentIndex + 1, sectionIds.length - 1);
      if (nextIndex !== currentIndex) {
        lastScrollTime = currentTime;
        scrollToSection(sectionIds[nextIndex]);
      }
    } else {
      const prevIndex = Math.max(currentIndex - 1, 0);
      if (prevIndex !== currentIndex) {
        lastScrollTime = currentTime;
        scrollToSection(sectionIds[prevIndex]);
      }
    }
  };

  // Включаем пролистывание только на десктопах с мышью и без reduce motion
  const fullPageMq = window.matchMedia("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");

  function syncWheelBinding(e) {
    if (fullPageMq.matches) {
      window.addEventListener("wheel", wheelHandler, { passive: false });
    } else {
      window.removeEventListener("wheel", wheelHandler);
    }
  }
  
  syncWheelBinding();
  fullPageMq.addEventListener?.("change", syncWheelBinding);

  // Плавное обновление хайлайта при горизонтальном скролле навигации
  const nav = document.querySelector(".main-nav");
  nav?.addEventListener("scroll", moveHighlight, { passive: true });

  // Улучшенный обработчик scroll для мгновенного обновления
  window.addEventListener("scroll", () => {
    if (!isProgrammaticScroll) {
      clearTimeout(scrollTimeout);
      // Убираем задержку и обновляем сразу
      updateActiveSection();
    }
  });

  window.addEventListener('resize', () => {
    moveHighlight();
    updateActiveSection();
  });

  // Инициализация
  updateActiveSection();
  setTimeout(moveHighlight, 100);
}

initializeApp();
});