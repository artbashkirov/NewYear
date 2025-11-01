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
    
    // Создаем три слота для трёх видимых карточек
    for (let position = 0; position < 3; position++) {
        const slot = document.createElement('div');
        slot.className = 'card-slot';
        slot.dataset.position = position; // 0=left, 1=center, 2=right
        slides.appendChild(slot);
    }
    
    // Создаем все карточки (они будут перемещаться между слотами)
    allCards = [];
    for (let i = 0; i < TOTAL_CARDS; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = i;
        
        const img = document.createElement('img');
        img.src = `img/${String(i + 1).padStart(2, '0')}@2x.png`;
        img.alt = `Итоги ${i + 1}`;
        img.loading = 'lazy';
        
        // Fallback если изображение не загрузилось
        img.onerror = () => {
            img.src = `img/${String(i + 1).padStart(2, '0')}.png`;
        };
        
        card.appendChild(img);
        allCards.push(card);
    }
}

// Обновление отображения
function updateView() {
    const slots = document.querySelectorAll('.card-slot');
    const segments = document.querySelectorAll('.progress-segment');
    
    // Очищаем все слоты
    slots.forEach(slot => {
        slot.innerHTML = '';
        slot.classList.remove('position-left', 'position-center', 'position-right');
    });
    
    // Размещаем карточки в слотах
    const leftIndex = currentIndex - 1;
    const centerIndex = currentIndex;
    const rightIndex = currentIndex + 1;
    
    if (leftIndex >= 0 && leftIndex < TOTAL_CARDS) {
        slots[0].classList.add('position-left');
        slots[0].appendChild(allCards[leftIndex].cloneNode(true));
    }
    
    if (centerIndex >= 0 && centerIndex < TOTAL_CARDS) {
        slots[1].classList.add('position-center');
        slots[1].appendChild(allCards[centerIndex].cloneNode(true));
    }
    
    if (rightIndex >= 0 && rightIndex < TOTAL_CARDS) {
        slots[2].classList.add('position-right');
        slots[2].appendChild(allCards[rightIndex].cloneNode(true));
    }
    
    // Обновляем прогресс-бар
    segments.forEach((segment, index) => {
        segment.classList.remove('completed', 'active');
        
        if (index < currentIndex) {
            segment.classList.add('completed');
        } else if (index === currentIndex) {
            segment.classList.add('active');
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
        if (e.target.closest('.card-slot.position-center')) {
            stopAutoPlay();
        }
    }, true);
    
    document.addEventListener('mouseleave', (e) => {
        if (e.target.closest('.card-slot.position-center') && currentIndex < TOTAL_CARDS - 1) {
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
