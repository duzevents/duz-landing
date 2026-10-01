document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    if (typeof IntersectionObserver !== 'undefined') {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.section').forEach(el => observer.observe(el));
    }
});
