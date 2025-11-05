// Итоги года 2025 - Слайдер с макетом Figma
const TOTAL_CARDS = 14;
const CARD_DURATION = 5000; // 5 секунд
let currentIndex = 0;
let autoPlayInterval = null;
let allCards = []; // Массив для хранения всех карточек

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initProgressBar();
    initSlider();
    updateView();
    startAutoPlay();
    initEventListeners();
});

// Создание прогресс-бара
function initProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    
    for (let i = 0; i < TOTAL_CARDS; i++) {
        const segment = document.createElement('div');
        segment.className = 'progress-segment';
        segment.dataset.index = i;
        
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
        
        if (index < currentIndex) {
            segment.classList.add('completed');
        } else if (index === currentIndex) {
            // Последняя карточка - сразу completed (без анимации)
            if (currentIndex === TOTAL_CARDS - 1) {
                segment.classList.add('completed');
            } else {
                // Остальные - с анимацией
                segment.classList.add('active');
            }
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

// Автопрокрутка
function startAutoPlay() {
    if (currentIndex < TOTAL_CARDS - 1) {
        autoPlayInterval = setInterval(() => {
            nextCard();
        }, CARD_DURATION);
    }
}

function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
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
    
    // Пауза при наведении на центральную карточку
    document.addEventListener('mouseenter', (e) => {
        if (e.target.closest('.card.position-center')) {
            stopAutoPlay();
        }
    }, true);
    
    document.addEventListener('mouseleave', (e) => {
        if (e.target.closest('.card.position-center') && currentIndex < TOTAL_CARDS - 1) {
            startAutoPlay();
        }
    }, true);
    
    // Пауза/возобновление при смене видимости вкладки
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoPlay();
        } else if (currentIndex < TOTAL_CARDS - 1) {
            startAutoPlay();
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

console.log('Слайдер "Итоги года 2025" инициализирован');
console.log(`Карточек: ${TOTAL_CARDS}, Длительность: ${CARD_DURATION}ms`);
