// Итоги года 2025 - Слайдер с макетом Figma
const TOTAL_CARDS = 14;
const CARD_DURATION = 5000; // 5 секунд
let currentIndex = 0;
let autoPlayInterval = null;
let allCards = []; // Массив для хранения всех карточек

// Управление прогресс-баром
let progressStartTime = 0;
let progressElapsed = 0;
let progressAnimationId = null;
let isPaused = false;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initProgressBar();
    initSlider();
    updateView();
    startAutoPlay();
    initEventListeners();
    updateLogoForScreenSize();
});

// Создание прогресс-бара
function initProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    
    for (let i = 0; i < TOTAL_CARDS; i++) {
        const segment = document.createElement('div');
        segment.className = 'progress-segment';
        segment.dataset.index = i;
        
        // Добавляем элемент для прогресса
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        segment.appendChild(progressFill);
        
        // Клик по сегменту для перехода
        segment.addEventListener('click', () => goToCard(i));
        
        progressBar.appendChild(segment);
    }
}

// Создание карточек слайдера
function initSlider() {
    const slides = document.querySelector('.slides');
    
    // Создаем ВСЕ карточки сразу в DOM
    for (let i = 0; i < TOTAL_CARDS; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = i;
        
        const img = document.createElement('img');
        img.src = `img/loc_Card${String(i + 1).padStart(2, '0')}@2x.png`;
        img.alt = `Итоги ${i + 1}`;
        img.loading = i < 3 ? 'eager' : 'lazy';
        
        // Fallback если изображение не загрузилось
        img.onerror = () => {
            console.error(`Не удалось загрузить: ${img.src}`);
        };
        
        card.appendChild(img);
        slides.appendChild(card);
        allCards.push(card);
    }
    
    // Отключаем нативные взаимодействия на карточках
    initCardInteractionBlockers();
}

// Блокировка нативных взаимодействий на карточках
function initCardInteractionBlockers() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        // Блокируем двойной тап для зума на мобильных
        card.addEventListener('dblclick', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Блокируем долгое нажатие (альтернативный способ)
        let longPressTimer = null;
        
        card.addEventListener('touchstart', (e) => {
            longPressTimer = setTimeout(() => {
                // Блокируем системные действия при долгом нажатии
            }, 500);
        }, { passive: false });
        
        card.addEventListener('touchend', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
            }
        });
        
        card.addEventListener('touchmove', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
            }
        });
    });
}

// Обновление отображения
function updateView() {
    const segments = document.querySelectorAll('.progress-segment');
    
    // Обновляем классы всех карточек
    allCards.forEach((card, index) => {
        // Удаляем все позиционные классы
        card.classList.remove('position-left', 'position-center', 'position-right', 'position-far-left', 'position-far-right', 'hidden');
        
        const diff = index - currentIndex;
        
        if (diff < -1) {
            // Карточки далеко слева (скрыты)
            card.classList.add('position-far-left');
        } else if (diff === -1) {
            // Левая карточка (видимая)
            card.classList.add('position-left');
        } else if (diff === 0) {
            // Центральная карточка
            card.classList.add('position-center');
        } else if (diff === 1) {
            // Правая карточка (видимая)
            card.classList.add('position-right');
        } else if (diff > 1) {
            // Карточки далеко справа (скрыты)
            card.classList.add('position-far-right');
        }
    });
    
    // Обновляем прогресс-бар
    segments.forEach((segment, index) => {
        segment.classList.remove('completed', 'active');
        const progressBar = segment.querySelector('.progress-fill');
        
        if (index < currentIndex) {
            segment.classList.add('completed');
            if (progressBar) progressBar.style.width = '100%';
        } else if (index === currentIndex) {
            segment.classList.add('active');
            if (progressBar) progressBar.style.width = '0%';
            // Последняя карточка - сразу completed
            if (currentIndex === TOTAL_CARDS - 1) {
                segment.classList.add('completed');
                segment.classList.remove('active');
                if (progressBar) progressBar.style.width = '100%';
            }
        } else {
            if (progressBar) progressBar.style.width = '0%';
        }
    });
    
    // Обновляем кнопки навигации
    updateNavigationButtons();
}

// Следующая карточка
function nextCard() {
    if (currentIndex < TOTAL_CARDS - 1) {
        currentIndex++;
        updateView();
        
        // Останавливаем автопрокрутку на последней карточке
        if (currentIndex === TOTAL_CARDS - 1) {
            stopAutoPlay();
        } else {
            restartAutoPlay();
        }
    }
}

// Предыдущая карточка
function prevCard() {
    if (currentIndex > 0) {
        currentIndex--;
        updateView();
        restartAutoPlay();
    }
}

// Переход на конкретную карточку
function goToCard(index) {
    if (index >= 0 && index < TOTAL_CARDS && index !== currentIndex) {
        currentIndex = index;
        updateView();
        
        if (currentIndex === TOTAL_CARDS - 1) {
            stopAutoPlay();
        } else {
            restartAutoPlay();
        }
    }
}

// Управление прогрессом
function updateProgress() {
    if (isPaused || currentIndex >= TOTAL_CARDS - 1) {
        return;
    }
    
    const now = Date.now();
    const elapsed = progressElapsed + (now - progressStartTime);
    const progress = Math.min(elapsed / CARD_DURATION, 1);
    
    // Обновляем визуальный прогресс
    const activeSegment = document.querySelector('.progress-segment.active');
    if (activeSegment) {
        const progressBar = activeSegment.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.width = `${progress * 100}%`;
        }
    }
    
    // Если прогресс завершен, переключаем карточку
    if (progress >= 1) {
        nextCard();
    } else {
        progressAnimationId = requestAnimationFrame(updateProgress);
    }
}

function startProgress() {
    progressStartTime = Date.now();
    progressElapsed = 0;
    isPaused = false;
    
    if (progressAnimationId) {
        cancelAnimationFrame(progressAnimationId);
    }
    
    progressAnimationId = requestAnimationFrame(updateProgress);
}

function pauseProgress() {
    if (!isPaused && progressAnimationId) {
        isPaused = true;
        const now = Date.now();
        progressElapsed += (now - progressStartTime);
        
        cancelAnimationFrame(progressAnimationId);
        progressAnimationId = null;
    }
}

function resumeProgress() {
    if (isPaused && currentIndex < TOTAL_CARDS - 1) {
        isPaused = false;
        progressStartTime = Date.now();
        progressAnimationId = requestAnimationFrame(updateProgress);
    }
}

function stopProgress() {
    isPaused = false;
    progressElapsed = 0;
    
    if (progressAnimationId) {
        cancelAnimationFrame(progressAnimationId);
        progressAnimationId = null;
    }
}

// Автопрокрутка
function startAutoPlay() {
    if (currentIndex < TOTAL_CARDS - 1) {
        startProgress();
    }
}

function stopAutoPlay() {
    stopProgress();
}

function restartAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
}

// Обновление кнопок навигации
function updateNavigationButtons() {
    const leftBtn = document.querySelector('.nav-arrow-left');
    const rightBtn = document.querySelector('.nav-arrow-right');
    
    if (leftBtn) leftBtn.disabled = currentIndex === 0;
    if (rightBtn) rightBtn.disabled = currentIndex === TOTAL_CARDS - 1;
}

// Инициализация событий
function initEventListeners() {
    // Кнопки навигации
    const leftBtn = document.querySelector('.nav-arrow-left');
    const rightBtn = document.querySelector('.nav-arrow-right');
    
    if (leftBtn) leftBtn.addEventListener('click', prevCard);
    if (rightBtn) rightBtn.addEventListener('click', nextCard);
    
    // Клавиатурная навигация
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevCard();
        } else if (e.key === 'ArrowRight') {
            nextCard();
        }
    });
    
    // Touch события для свайпов на мобильных
    initTouchEvents();
    
    // Пауза при наведении на центральную карточку (десктоп)
    document.addEventListener('mouseenter', (e) => {
        if (e.target.closest('.card.position-center')) {
            pauseProgress();
        }
    }, true);
    
    document.addEventListener('mouseleave', (e) => {
        if (e.target.closest('.card.position-center') && currentIndex < TOTAL_CARDS - 1) {
            resumeProgress();
        }
    }, true);
    
    // Пауза при зажатии курсора на карточке (десктоп)
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        let isMousePressed = false;
        
        sliderContainer.addEventListener('mousedown', (e) => {
            if (e.target.closest('.card.position-center')) {
                console.log('Mouse down - pausing progress');
                isMousePressed = true;
                pauseProgress();
            }
        });
        
        sliderContainer.addEventListener('mouseup', () => {
            if (isMousePressed) {
                console.log('Mouse up - resuming progress');
                isMousePressed = false;
                if (currentIndex < TOTAL_CARDS - 1) {
                    resumeProgress();
                }
            }
        });
        
        // Глобальный mouseup на случай если отпустили за пределами
        document.addEventListener('mouseup', () => {
            if (isMousePressed) {
                console.log('Mouse up (global) - resuming progress');
                isMousePressed = false;
                if (currentIndex < TOTAL_CARDS - 1) {
                    resumeProgress();
                }
            }
        });
    }
    
    // Пауза/возобновление при смене видимости вкладки
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoPlay();
        } else if (currentIndex < TOTAL_CARDS - 1) {
            startAutoPlay();
        }
    });
    
    // Отключаем все нативные взаимодействия на карточках (для мобильных)
    
    // Контекстное меню
    document.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.card')) {
            e.preventDefault();
            return false;
        }
    });
    
    // Drag and drop
    document.addEventListener('dragstart', (e) => {
        if (e.target.closest('.card')) {
            e.preventDefault();
            return false;
        }
    });
    
    // Кнопка закрытия
    const closeBtn = document.querySelector('.btn-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (confirm('Закрыть презентацию?')) {
                window.close();
            }
        });
    }
}

// Обработка свайпов на мобильных
function initTouchEvents() {
    const sliderContainer = document.querySelector('.slider-container');
    if (!sliderContainer) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    
    // Пауза при касании (мобильные)
    sliderContainer.addEventListener('touchstart', (e) => {
        if (e.target.closest('.card.position-center')) {
            pauseProgress();
        }
        
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    // Возобновление после отпускания пальца
    sliderContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
        
        // Возобновляем автопрокрутку после завершения касания
        setTimeout(() => {
            if (currentIndex < TOTAL_CARDS - 1) {
                resumeProgress();
            }
        }, 300); // Небольшая задержка для плавности
    }, { passive: true });
    
    // Если палец ушел за пределы карточки
    sliderContainer.addEventListener('touchcancel', () => {
        if (currentIndex < TOTAL_CARDS - 1) {
            resumeProgress();
        }
    }, { passive: true });
    
    function handleSwipe() {
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        // Проверяем что это горизонтальный свайп (не вертикальный)
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Свайп вправо - предыдущая карточка
                prevCard();
            } else {
                // Свайп влево - следующая карточка
                nextCard();
            }
        }
    }
}

// Переключение логотипа для мобильной версии
function updateLogoForScreenSize() {
    const logo = document.querySelector('.logo-ny');
    if (!logo) return;
    
    const isMobile = window.innerWidth < 1200;
    
    if (isMobile) {
        logo.src = 'assets/loc_LogoNY.svg';
        logo.alt = 'Яндекс Маркет - Итоги 2025';
    } else {
        logo.src = 'assets/Logo2.svg';
        logo.alt = 'Яндекс Маркет - Мои итоги 2025 года';
    }
}

// Обработчик изменения размера окна
window.addEventListener('resize', () => {
    updateLogoForScreenSize();
});

console.log('Слайдер "Итоги года 2025" инициализирован');
console.log(`Карточек: ${TOTAL_CARDS}, Длительность: ${CARD_DURATION}ms`);
