document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // Хедер: Эффект матового стекла при скролле
    // =========================================
    const header = document.getElementById('state-header');

    if (header) {
        const checkScroll = () => {
            if (window.scrollY > 10) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
        };

        // Проверяем при загрузке
        checkScroll();

        // Проверяем при скролле
        window.addEventListener('scroll', checkScroll);
    }

    // =========================================
    // Динамический отступ для body под Header
    // =========================================
    if (header) {
        const headerResizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const headerHeight = entry.target.offsetHeight;
                document.body.style.paddingTop = `${headerHeight}px`;
            }
        });
        headerResizeObserver.observe(header);
    }

    // =========================================
    // Мобильное меню (Оновлено)
    // =========================================
    const burgerBtn = document.querySelector('.header__burger');
    const mobileMenu = document.getElementById('mobile-menu');

    if (burgerBtn && mobileMenu) {
        burgerBtn.addEventListener('click', () => {
            const isActive = mobileMenu.classList.toggle('is-active');
            burgerBtn.classList.toggle('is-active'); // Перетворюємо на хрестик

            if (isActive) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

    // =========================================
    // Логіка Покрокової Форми та Калькулятора
    // =========================================
    const form = document.getElementById('funding-form');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');

    const nextStepBtn = document.getElementById('next-step-btn');
    const prevStepBtn = document.getElementById('prev-step-btn');
    const resetBtn = document.getElementById('reset-calc');

    // Елементи калькулятора
    const revenueInput = document.getElementById('annual-revenue');
    const phoneInput = document.getElementById('phone');
    const calcResultEl = document.getElementById('calc-result');
    const defaultResult = "$0 - $10,000";

    const PERCENT_1 = 0.60;
    const PERCENT_2 = 1.50;
    const MONTHS = 12;

    // Плавний скрол до форми
    const scrollBtns = document.querySelectorAll('.js-scroll-to-form');
    if (scrollBtns.length > 0) {
        scrollBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const formSection = document.getElementById('hero-section');
                if (formSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const y = formSection.getBoundingClientRect().top + window.scrollY - headerHeight;
                    window.scrollTo({ top: y, behavior: 'smooth' });

                    // Закриваємо мобільне меню, якщо скрол відбувся з нього
                    const mobileMenu = document.getElementById('mobile-menu');
                    const burgerBtn = document.querySelector('.header__burger');
                    if (mobileMenu && mobileMenu.classList.contains('is-active')) {
                        mobileMenu.classList.remove('is-active');
                        burgerBtn.classList.remove('is-active');
                        document.body.style.overflow = '';
                    }
                }
            });
        });
    }

    if (form) {
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

        // --- Логіка Калькулятора ---
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

        if (revenueInput && revenueMask) {
            revenueMask.on('accept', updateCalculator);
        }

        // --- Скидання форми ---
        const resetForm = () => {
            form.reset();
            if (revenueMask) revenueMask.value = '';
            if (phoneMask) phoneMask.value = '';
            calcResultEl.textContent = defaultResult;

            // Повертаємо на 1-й крок
            step2.style.display = 'none';
            step2.classList.remove('is-active');
            step1.style.display = 'block';
            step1.classList.add('is-active');

            if (window.validator) {
                window.validator.refresh();
            }

            const successMsg = document.getElementById('form-success-msg');
            if (successMsg) successMsg.style.display = 'none';
        };

        if (resetBtn) resetBtn.addEventListener('click', resetForm);

        // --- Перехід назад ---
        if (prevStepBtn) {
            prevStepBtn.addEventListener('click', () => {
                step2.style.display = 'none';
                step2.classList.remove('is-active');
                step1.style.display = 'block';
                step1.classList.add('is-active');
            });
        }

        // --- Валідація JustValidate ---
        if (typeof window.JustValidate !== 'undefined') {
            window.validator = new window.JustValidate('#funding-form', {
                errorFieldCssClass: 'just-validate-error-field',
                errorLabelCssClass: 'just-validate-error-label',
                focusInvalidField: true,
                lockForm: true,
            });

            window.validator
                // --- КРОК 1 ---
                .addField('#annual-revenue', [
                    { rule: 'required', errorMessage: 'Required' },
                    {
                        validator: () => {
                            const val = revenueMask ? parseInt(revenueMask.unmaskedValue, 10) : 0;
                            return val > 0;
                        },
                        errorMessage: 'Must be > $0'
                    }
                ])
                .addField('#amount-requested', [{ rule: 'required', errorMessage: 'Required' }])
                .addField('#credit-score', [{ rule: 'required', errorMessage: 'Required' }])
                .addField('#industry-type', [{ rule: 'required', errorMessage: 'Required' }])

                // --- КРОК 2 ---
                .addField('#first-name', [
                    { rule: 'required', errorMessage: 'Required' },
                    { rule: 'minLength', value: 2, errorMessage: 'Too short' }
                ])
                .addField('#last-name', [
                    { rule: 'required', errorMessage: 'Required' },
                    { rule: 'minLength', value: 2, errorMessage: 'Too short' }
                ])
                .addField('#company-name', [{ rule: 'required', errorMessage: 'Required' }])
                .addField('#phone', [
                    { rule: 'required', errorMessage: 'Required' },
                    {
                        validator: () => phoneMask && phoneMask.unmaskedValue.length === 10,
                        errorMessage: 'Must be 10 digits'
                    }
                ])
                .addField('#email', [
                    { rule: 'required', errorMessage: 'Required' },
                    { rule: 'email', errorMessage: 'Invalid email' }
                ])
                .addField('#state', [{ rule: 'required', errorMessage: 'Required' }])
                .addField('#website', [
                    { rule: 'required', errorMessage: 'Required' },
                    { rule: 'customRegexp', value: /^(https?:\/\/)?([\w\d-]+\.)+[\w\d]{2,}(\/.*)?$/i, errorMessage: 'Invalid URL' }
                ]);

            // Логіка кнопки переходу
            if (nextStepBtn) {
                nextStepBtn.addEventListener('click', async () => {
                    const fieldsToValidate = ['#annual-revenue', '#amount-requested', '#credit-score', '#industry-type'];
                    let isValid = true;

                    for (const field of fieldsToValidate) {
                        const fieldValid = await window.validator.revalidateField(field);
                        if (!fieldValid) isValid = false;
                    }

                    if (isValid) {
                        step1.style.display = 'none';
                        step1.classList.remove('is-active');
                        step2.style.display = 'block';
                        setTimeout(() => step2.classList.add('is-active'), 10);
                    }
                });
            }

            // Real-time валідація при введенні
            const formInputs = form.querySelectorAll('input, select');
            formInputs.forEach(input => {
                const eventName = input.tagName.toLowerCase() === 'select' ? 'change' : 'input';
                input.addEventListener(eventName, () => {
                    if (window.validator && input.id) {
                        const hasError = input.classList.contains('just-validate-error-field');
                        if (hasError) {
                            window.validator.revalidateField('#' + input.id).catch(() => { });
                        }
                    }
                });
            });

            // Відправка
            window.validator.onSuccess((event) => {
                event.preventDefault();

                const formData = new FormData(form);
                const dataObj = Object.fromEntries(formData.entries());

                dataObj.phoneUnmasked = phoneMask ? phoneMask.unmaskedValue : '';
                dataObj.revenueUnmasked = revenueMask ? revenueMask.unmaskedValue : '';
                dataObj.calculatorResult = calcResultEl.textContent;

                const payloadArray = [dataObj];
                console.log('--- Form Validated & Prepared ---', payloadArray);

                const submitBtn = document.getElementById('submit-btn');
                const successMsg = document.getElementById('form-success-msg');
                const originalBtnText = submitBtn.innerHTML;

                submitBtn.innerHTML = 'SENDING...';
                submitBtn.disabled = true;

                fetch('https://jsonplaceholder.typicode.com/posts', {
                    method: 'POST',
                    body: JSON.stringify(payloadArray),
                    headers: { 'Content-type': 'application/json; charset=UTF-8' }
                })
                    .then(response => response.json())
                    .then(json => {
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                        successMsg.innerHTML = `Application submitted successfully!<br><span style="font-size: 12px; color: #666;">Server Response ID: ${json.id}</span>`;
                        successMsg.style.display = 'block';

                        setTimeout(() => {
                            resetForm();
                        }, 3000);
                    })
                    .catch(err => {
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                        successMsg.innerHTML = 'Error submitting application. Try again.';
                        successMsg.style.color = '#FF3B30';
                        successMsg.style.display = 'block';
                    });
            });
        }
    }

    // =========================================
    // Секция Loans: Логика тултипов (з автоскролом)
    // =========================================
    const loanItems = document.querySelectorAll('.loans__item');
    const tooltipTextContainer = document.getElementById('tooltip-text');
    const tooltipElement = document.getElementById('dynamic-tooltip');
    const tooltipCloseBtn = document.getElementById('tooltip-close');
    const loansSection = document.getElementById('loans-section');
    const headerNode = document.getElementById('state-header');

    if (loanItems.length > 0 && tooltipTextContainer && loansSection) {

        let tooltipClosedManually = false;
        let isHovered = false;

        const updateTooltip = (item) => {
            if (item.classList.contains('is-active')) return;

            loanItems.forEach(el => el.classList.remove('is-active'));
            item.classList.add('is-active');
            tooltipTextContainer.innerHTML = item.getAttribute('data-tooltip');
        };

        loanItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                isHovered = true;
                if (window.innerWidth > 767) {
                    updateTooltip(item);
                }
            });

            item.addEventListener('mouseleave', () => {
                isHovered = false;
            });

            item.addEventListener('click', (e) => {
                if (window.innerWidth <= 767) {
                    e.preventDefault();
                    updateTooltip(item);
                    tooltipElement.classList.add('is-visible');
                    tooltipClosedManually = false;
                }
            });
        });

        if (tooltipCloseBtn) {
            tooltipCloseBtn.addEventListener('click', () => {
                tooltipElement.classList.remove('is-visible');
                tooltipClosedManually = true;
            });
        }

        window.addEventListener('scroll', () => {
            // Автоперемикання контенту при скролі
            if (!isHovered) {
                const headerHeight = headerNode ? headerNode.offsetHeight : 100;
                let activeItem = null;

                for (let i = 0; i < loanItems.length; i++) {
                    const rect = loanItems[i].getBoundingClientRect();
                    if (rect.bottom > headerHeight + 50) {
                        activeItem = loanItems[i];
                        break;
                    }
                }

                const sectionRect = loansSection.getBoundingClientRect();
                const inSectionView = sectionRect.top < window.innerHeight && sectionRect.bottom > headerHeight;

                if (activeItem && inSectionView) {
                    updateTooltip(activeItem);
                }
            }

            // Показ/сховування плашки на мобілках
            if (window.innerWidth <= 767) {
                const sectionRect = loansSection.getBoundingClientRect();
                const inView = (sectionRect.top < window.innerHeight - 100) && (sectionRect.bottom > 100);

                if (inView) {
                    if (!tooltipElement.classList.contains('is-visible') && !tooltipClosedManually) {
                        tooltipElement.classList.add('is-visible');
                    }
                } else {
                    if (tooltipElement.classList.contains('is-visible')) {
                        tooltipElement.classList.remove('is-visible');
                    }
                    tooltipClosedManually = false;
                }
            }
        }, { passive: true });
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

    // =========================================
    // Секция FAQ: Аккордеон
    // =========================================
    const faqItems = document.querySelectorAll('.faq__item');

    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const questionBtn = item.querySelector('.faq__question');

            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('is-active');

                // Закрываем все открытые вопросы
                faqItems.forEach(el => {
                    el.classList.remove('is-active');
                    el.querySelector('.faq__question').setAttribute('aria-expanded', 'false');

                    // Меняем минус обратно на плюс
                    const path = el.querySelector('.faq__icon path');
                    if (path) {
                        path.setAttribute('d', 'M28.5 17.5H17.5M17.5 17.5H6.5M17.5 17.5V6.5M17.5 17.5V28.5');
                    }
                });

                // Если элемент не был активен, открываем его
                if (!isActive) {
                    item.classList.add('is-active');
                    questionBtn.setAttribute('aria-expanded', 'true');

                    // Меняем плюс на минус (убираем вертикальную линию в SVG)
                    const activePath = item.querySelector('.faq__icon path');
                    if (activePath) {
                        activePath.setAttribute('d', 'M28.5 17.5H6.5'); // Только горизонтальная линия
                    }
                }
            });
        });
    }
});