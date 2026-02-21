document.addEventListener('DOMContentLoaded', () => {
    // =========================================
    // Динамический отступ для body под Header
    // =========================================
    const header = document.querySelector('.header');

    if (header) {
        // Создаем наблюдатель, который следит за изменениями размеров хедера
        const headerResizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                // Получаем актуальную высоту хедера
                const headerHeight = entry.target.offsetHeight;
                // Применяем её как padding-top к body
                document.body.style.paddingTop = `${headerHeight}px`;
            }
        });

        // Запускаем наблюдение за хедером
        headerResizeObserver.observe(header);
    }

    // =========================================
    // Мобильное меню
    // =========================================
    const burgerBtn = document.querySelector('.header__burger');
    const closeBtn = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');

    if (burgerBtn && closeBtn && mobileMenu) {
        // Открытие меню
        burgerBtn.addEventListener('click', () => {
            mobileMenu.classList.add('is-active');
            // Блокируем скролл на body
            document.body.style.overflow = 'hidden';
        });

        // Закрытие меню
        closeBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('is-active');
            // Возвращаем скролл
            document.body.style.overflow = '';
        });
    }

    // =========================================
    // Hero Слайдер
    // =========================================
    const slides = document.querySelectorAll('.hero__slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('is-active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('is-active');
        }, 5000); // Смена каждые 5 секунд
    }

    // =========================================
    // Логика Попап формы
    // =========================================
    const popupOpenBtns = document.querySelectorAll('.js-open-popup, #btn-get-funded');
    const popup = document.getElementById('funding-popup');
    const popupClose = document.querySelector('.popup__close');
    const resetBtn = document.getElementById('reset-calc');
    const form = document.getElementById('funding-form');

    // Элементы калькулятора
    const revenueInput = document.getElementById('annual-revenue');
    const phoneInput = document.getElementById('phone');
    const calcResultEl = document.getElementById('calc-result');
    const defaultResult = "$0 - $10,000";

    // Константы для формулы
    const PERCENT_1 = 0.60;
    const PERCENT_2 = 1.50;
    const MONTHS = 12;

    // --- Открытие / Закрытие ---
    const openPopup = () => {
        popup.classList.add('is-active');
        document.body.style.overflow = 'hidden';
    };

    const closePopup = () => {
        popup.classList.remove('is-active');
        document.body.style.overflow = '';
        resetForm();
    };

    if (popupOpenBtns.length > 0) {
        popupOpenBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openPopup();
            });
        });
    }
    if (popupClose) popupClose.addEventListener('click', closePopup);
    // Обработчик клика по оверлею убран, форма закрывается только по крестику.

    // --- Маски IMask ---
    let revenueMask, phoneMask;
    if (typeof IMask !== 'undefined') {
        phoneMask = IMask(phoneInput, {
            mask: '(000) 000-0000'
        });

        revenueMask = IMask(revenueInput, {
            mask: Number,
            scale: 0,
            thousandsSeparator: ',',
            padFractionalZeros: false,
            normalizeZeros: true,
            min: 0
        });
    }

    // --- Логика Калькулятора ---
    const updateCalculator = () => {
        const rawValue = revenueMask ? revenueMask.unmaskedValue : revenueInput.value;
        const annualRevenue = parseInt(rawValue, 10);

        if (!annualRevenue || annualRevenue === 0) {
            calcResultEl.textContent = defaultResult;
            return;
        }

        const x = annualRevenue / MONTHS;
        const sum1 = Math.round(x * PERCENT_1);
        const sum2 = Math.round(x * PERCENT_2);

        const formatSum = (num) => '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        calcResultEl.textContent = `${formatSum(sum1)} - ${formatSum(sum2)}`;
    };

    if (revenueInput) {
        revenueMask.on('accept', updateCalculator);
    }

    // --- Сброс формы ---
    const resetForm = () => {
        form.reset();
        if (revenueMask) revenueMask.value = '';
        if (phoneMask) phoneMask.value = '';
        calcResultEl.textContent = defaultResult;

        const errorElements = form.querySelectorAll('.just-validate-error-label');
        errorElements.forEach(el => el.remove());
        const errorInputs = form.querySelectorAll('.just-validate-error-field');
        errorInputs.forEach(el => el.classList.remove('just-validate-error-field'));

        const successMsg = document.getElementById('form-success-msg');
        if (successMsg) successMsg.style.display = 'none';
    };

    if (resetBtn) resetBtn.addEventListener('click', resetForm);

    // --- Валидация и Отправка (JustValidate) ---
    if (typeof window.JustValidate !== 'undefined') {
        const validator = new window.JustValidate('#funding-form', {
            errorFieldCssClass: 'just-validate-error-field',
            errorLabelCssClass: 'just-validate-error-label',
            focusInvalidField: true,
            lockForm: true,
        });

        validator
            .addField('#first-name', [{ rule: 'required', errorMessage: 'First Name is required' }])
            .addField('#last-name', [{ rule: 'required', errorMessage: 'Last Name is required' }])
            .addField('#company-name', [{ rule: 'required', errorMessage: 'Company Name is required' }])
            .addField('#email', [
                { rule: 'required', errorMessage: 'Email is required' },
                { rule: 'email', errorMessage: 'Email is invalid' }
            ])
            .addField('#phone', [
                { rule: 'required', errorMessage: 'Phone is required' },
                {
                    validator: () => phoneMask.unmaskedValue.length === 10,
                    errorMessage: 'Phone number must be 10 digits'
                }
            ])
            .addField('#state', [{ rule: 'required', errorMessage: 'Please select a state' }])
            .addField('#website', [
                { rule: 'required', errorMessage: 'Website is required' },
                { rule: 'url', errorMessage: 'URL is invalid' }
            ])
            .addField('#annual-revenue', [
                { rule: 'required', errorMessage: 'Annual Revenue is required' },
                {
                    validator: () => parseInt(revenueMask.unmaskedValue, 10) > 0,
                    errorMessage: 'Revenue must be greater than 0'
                }
            ])
            .addField('#amount-requested', [{ rule: 'required', errorMessage: 'Selection required' }])
            .addField('#credit-score', [{ rule: 'required', errorMessage: 'Selection required' }])
            .addField('#industry-type', [{ rule: 'required', errorMessage: 'Selection required' }])

            .onSuccess((event) => {
                event.preventDefault();

                // Збираємо дані у об'єкт
                const formData = new FormData(form);
                const dataObj = Object.fromEntries(formData.entries());

                dataObj.phoneUnmasked = phoneMask.unmaskedValue;
                dataObj.revenueUnmasked = revenueMask.unmaskedValue;
                dataObj.calculatorResult = calcResultEl.textContent;

                // Пакуємо об'єкт у масив (відповідно до ТЗ)
                const payloadArray = [dataObj];

                console.log('--- Form Data Prepared for Backend ---', payloadArray);

                const submitBtn = document.getElementById('submit-btn');
                const successMsg = document.getElementById('form-success-msg');
                const originalBtnText = submitBtn.innerHTML;

                submitBtn.innerHTML = 'SENDING...';
                submitBtn.disabled = true;

                // Заглушка відправки POST-даних на бекенд (імітація fetch запиту)
                fetch('https://jsonplaceholder.typicode.com/posts', {
                    method: 'POST',
                    body: JSON.stringify(payloadArray),
                    headers: { 'Content-type': 'application/json; charset=UTF-8' }
                })
                    .then(response => response.json())
                    .then(json => {
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;

                        // Виводимо довільне повідомлення про успіх та повернутий JSON
                        successMsg.innerHTML = `Application submitted successfully!<br><span style="font-size: 12px; color: #666;">Server Response ID: ${json.id}</span>`;
                        successMsg.style.display = 'block';

                        // Затримка перед закриттям
                        setTimeout(() => {
                            closePopup();
                        }, 3000);
                    })
                    .catch(err => {
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                        successMsg.innerHTML = 'Error submitting application. Try again.';
                        successMsg.style.color = 'red';
                        successMsg.style.display = 'block';
                    });
            });
    }

    // =========================================
    // Секция Loans: Логика тултипов
    // =========================================
    const loanItems = document.querySelectorAll('.loans__item');
    const tooltipTextContainer = document.getElementById('tooltip-text');
    const tooltipElement = document.getElementById('dynamic-tooltip');
    const tooltipCloseBtn = document.getElementById('tooltip-close');
    const loansSection = document.getElementById('loans-section');

    if (loanItems.length > 0 && tooltipTextContainer && loansSection) {

        // Флаг для отслеживания ручного закрытия
        let tooltipClosedManually = false;

        // Функция обновления контента
        const updateTooltip = (item) => {
            // Убираем класс у всех
            loanItems.forEach(el => el.classList.remove('is-active'));
            // Добавляем текущему
            item.classList.add('is-active');
            // Обновляем текст
            tooltipTextContainer.innerHTML = item.getAttribute('data-tooltip');
        };

        // Обработчики для каждого блока
        loanItems.forEach(item => {
            // Для ПК: смена по наведению
            item.addEventListener('mouseenter', () => {
                if (window.innerWidth > 767) {
                    updateTooltip(item);
                }
            });

            // Для Мобилок: смена и открытие по клику
            item.addEventListener('click', (e) => {
                if (window.innerWidth <= 767) {
                    e.preventDefault(); // Если внутри ссылка
                    updateTooltip(item);
                    tooltipElement.classList.add('is-visible');
                    // Сбрасываем флаг, так как пользователь сам захотел открыть тултип
                    tooltipClosedManually = false;
                }
            });
        });

        // Закрытие мобильного тултипа по крестику
        if (tooltipCloseBtn) {
            tooltipCloseBtn.addEventListener('click', () => {
                tooltipElement.classList.remove('is-visible');
                // Запоминаем, что юзер закрыл его, чтобы он не прыгал обратно при скролле
                tooltipClosedManually = true;
            });
        }

        // Логика автоматического показа/скрытия при скролле (только для мобилок)
        window.addEventListener('scroll', () => {
            if (window.innerWidth <= 767) {
                const sectionRect = loansSection.getBoundingClientRect();

                // Проверяем, находится ли секция в зоне видимости
                // offset 100px - чтобы тултип появлялся/исчезал не по первому же пикселю секции
                const inView = (sectionRect.top < window.innerHeight - 100) && (sectionRect.bottom > 100);

                if (inView) {
                    // Если секция на экране, и юзер не закрывал тултип руками — показываем
                    if (!tooltipElement.classList.contains('is-visible') && !tooltipClosedManually) {
                        tooltipElement.classList.add('is-visible');
                    }
                } else {
                    // Если вышли за пределы секции — скрываем
                    if (tooltipElement.classList.contains('is-visible')) {
                        tooltipElement.classList.remove('is-visible');
                    }
                    // Сбрасываем ручное закрытие. Если юзер вернется к секции позже, тултип снова покажется
                    tooltipClosedManually = false;
                }
            }
        });
    }

    // =========================================
    // Секция Process: Смена цвета шагов по клику
    // =========================================
    const processSteps = document.querySelectorAll('.process__step');

    if (processSteps.length > 0) {
        processSteps.forEach(step => {
            step.addEventListener('click', () => {
                // Убираем активный класс у всех шагов
                processSteps.forEach(el => el.classList.remove('is-active'));
                // Добавляем кликнутому
                step.classList.add('is-active');
            });
        });
    }
});