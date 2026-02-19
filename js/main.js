document.addEventListener('DOMContentLoaded', () => {
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
});