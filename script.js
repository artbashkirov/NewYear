// Итоги года 2025 - Адаптивный слайдер
const TOTAL_CARDS = 14;
const CARD_DURATION = 5000; // 5 секунд на карточку
let currentIndex = 0;
let autoPlayInterval = null;
let progressAnimationFrame = null;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    startAutoPlay();
});

function initSlider() {
    const slider = document.querySelector('.slider');
    
    // Создаем карточки
    for (let i = 0; i < TOTAL_CARDS; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = i;
        
        const img = document.createElement('img');
        // Загружаем изображения @2x для высокого качества
        img.src = `img/${String(i + 1).padStart(2, '0')}@2x.png`;
        img.alt = `Карточка ${i + 1}`;
        img.onerror = () => {
            // Если @2x не найден, пробуем без @2x
            img.src = `img/${String(i + 1).padStart(2, '0')}.png`;
            img.onerror = () => {
                // Если нет изображения, показываем плейсхолдер
                img.src = `https://via.placeholder.com/360x640/3d0000/ffffff?text=Card+${i + 1}`;
            };
        };
        
        card.appendChild(img);
        slider.appendChild(card);
    }
    
    updateCards();
    updateProgressBar();
}

function updateCards() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        const cardIndex = parseInt(card.dataset.index);
        
        // Удаляем все классы позиций
        card.classList.remove('left', 'center', 'right', 'hidden');
        
        if (cardIndex === currentIndex - 1) {
            card.classList.add('left');
        } else if (cardIndex === currentIndex) {
            card.classList.add('center');
        } else if (cardIndex === currentIndex + 1) {
            card.classList.add('right');
        } else {
            card.classList.add('hidden');
        }
    });
    
    // Обновляем состояние кнопок навигации
    updateNavigationButtons();
}

function updateProgressBar() {
    const segments = document.querySelectorAll('.progress-segment');
    
    segments.forEach((segment, index) => {
        segment.classList.remove('completed', 'active');
        
        if (index < currentIndex) {
            segment.classList.add('completed');
        } else if (index === currentIndex) {
            segment.classList.add('active');
        }
    });
}

function nextCard() {
    if (currentIndex < TOTAL_CARDS - 1) {
        currentIndex++;
        updateCards();
        updateProgressBar();
        
        // Если достигли последней карточки, останавливаем автопрокрутку
        if (currentIndex === TOTAL_CARDS - 1) {
            stopAutoPlay();
        }
    }
}

function prevCard() {
    if (currentIndex > 0) {
        currentIndex--;
        updateCards();
        updateProgressBar();
        
        // Возобновляем автопрокрутку если откатились назад
        if (currentIndex < TOTAL_CARDS - 1 && !autoPlayInterval) {
            startAutoPlay();
        }
    }
}

function goToCard(index) {
    if (index >= 0 && index < TOTAL_CARDS) {
        currentIndex = index;
        updateCards();
        updateProgressBar();
        
        // Останавливаем автопрокрутку при ручном переходе
        stopAutoPlay();
        
        // Возобновляем автопрокрутку, если не последняя карточка
        if (currentIndex < TOTAL_CARDS - 1) {
            startAutoPlay();
        }
    }
}

function startAutoPlay() {
    stopAutoPlay(); // Очищаем предыдущий интервал
    
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

function updateNavigationButtons() {
    const leftBtn = document.querySelector('.nav-btn-left');
    const rightBtn = document.querySelector('.nav-btn-right');
    
    leftBtn.disabled = currentIndex === 0;
    rightBtn.disabled = currentIndex === TOTAL_CARDS - 1;
}

// Обработчики событий
document.querySelector('.nav-btn-left').addEventListener('click', () => {
    prevCard();
});

document.querySelector('.nav-btn-right').addEventListener('click', () => {
    nextCard();
});

// Клик по сегментам прогресс-бара
document.querySelectorAll('.progress-segment').forEach((segment, index) => {
    segment.addEventListener('click', () => {
        goToCard(index);
    });
    
    // Добавляем курсор pointer
    segment.style.cursor = 'pointer';
});

// Клавиатурная навигация
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        prevCard();
    } else if (e.key === 'ArrowRight') {
        nextCard();
    }
});

// Пауза при наведении на карточку
document.addEventListener('mouseenter', (e) => {
    if (e.target.closest('.card.center')) {
        stopAutoPlay();
    }
}, true);

document.addEventListener('mouseleave', (e) => {
    if (e.target.closest('.card.center') && currentIndex < TOTAL_CARDS - 1) {
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

console.log('Слайдер инициализирован. Карточек:', TOTAL_CARDS);
