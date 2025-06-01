document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1000, 
        easing: 'ease-out-cubic',
        offset: 80,
        mirror: true,
        anchorPlacement: 'top-bottom',
    });

    function throttle(fn, wait) {
        let lastTime = 0;
        let timeoutId = null;
        return function (...args) {
            const now = Date.now();
            const remaining = wait - (now - lastTime);
            clearTimeout(timeoutId);
            if (remaining <= 0) {
                fn.apply(this, args);
                lastTime = now;
            } else {
                timeoutId = setTimeout(() => {
                    fn.apply(this, args);
                    lastTime = Date.now();
                }, remaining);
            }
        };
    }

    const alertBox = document.getElementById('custom-alert-box');
    function showCustomAlert(message, type = 'info', duration = 3500) { 
        if (!alertBox) return;
        alertBox.textContent = message;
        alertBox.className = 'show';
        alertBox.classList.remove('form-success', 'form-error'); 

        if (type === 'success') {
            alertBox.classList.add('form-success');
        } else if (type === 'error') {
            alertBox.classList.add('form-error');
        }

        setTimeout(() => {
            alertBox.className = '';
        }, duration);
    }

    const header = document.getElementById('header');
    const backToTopButton = document.getElementById('back-to-top');

    const handleScroll = () => {
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }
        if (backToTopButton) {
            const isScrolledEnough = window.scrollY > 300;
            backToTopButton.style.opacity = isScrolledEnough ? '1' : '0';
            backToTopButton.style.visibility = isScrolledEnough ? 'visible' : 'hidden';
            backToTopButton.style.transform = isScrolledEnough ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)';
        }
    };
    window.addEventListener('scroll', throttle(handleScroll, 100));
    if (backToTopButton) {
         backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mainNavLinksContainer = document.getElementById('nav-links');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true' || false;
            mobileMenu.classList.toggle('hidden');
            mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.setAttribute('aria-hidden', isExpanded);
            mobileMenuButton.querySelector('svg').classList.toggle('rotate-90', !isExpanded); 
        });

        mobileMenu.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
                mobileMenuButton.querySelector('svg').classList.remove('rotate-90');
            });
        });
    }

    const navLinks = [];
    if (mainNavLinksContainer) navLinks.push(...mainNavLinksContainer.querySelectorAll('.nav-link'));
    if (mobileMenu) navLinks.push(...mobileMenu.querySelectorAll('a[href^="#"]'));

    const sections = Array.from(document.querySelectorAll('main section[id]'));

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === "#" || href === "#0") return;

            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = header ? header.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset - 20;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                    mobileMenu.setAttribute('aria-hidden', 'true');
                    mobileMenuButton.querySelector('svg').classList.remove('rotate-90');
                }
            }
        });
    });

    function updateActiveNavLink(activeSectionId) {
        navLinks.forEach(link => {
            link.classList.remove('nav-link-active');
            if (link.getAttribute('href') === `#${activeSectionId}`) {
                link.classList.add('nav-link-active');
            }
        });
    }

    const sectionObserverOptions = {
        root: null,
        rootMargin: `-${(header ? header.offsetHeight : 0) + 60}px 0px -40% 0px`, 
        threshold: 0.2 
    };

    if (sections.length > 0) {
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateActiveNavLink(entry.target.id);
                }
            });
        }, sectionObserverOptions);

        sections.forEach(section => {
            sectionObserver.observe(section);
        });

        let initialSectionVisible = false;
        const currentHash = window.location.hash;
        if (currentHash) {
            const targetSection = document.querySelector(currentHash);
            if (targetSection) {
                updateActiveNavLink(targetSection.id);
                initialSectionVisible = true;
            }
        }

        if (!initialSectionVisible) {
            for (const section of sections) {
                const rect = section.getBoundingClientRect();
                const headerHeight = header ? header.offsetHeight : 0;
                if (rect.top >= headerHeight - 100 && rect.top < window.innerHeight / 2) {
                     updateActiveNavLink(section.id);
                     initialSectionVisible = true;
                     break;
                }
            }
        }
         if (!initialSectionVisible && sections.length > 0) { 
            updateActiveNavLink(sections[0].id);
        }
    }

    const slideshowContainers = document.querySelectorAll('.slideshow-container');
    slideshowContainers.forEach(container => {
        const slides = Array.from(container.querySelectorAll('.slideshow-slide'));
        const prevButton = container.querySelector('.prev-slide');
        const nextButton = container.querySelector('.next-slide');
        const dotsContainer = container.querySelector('.slideshow-dots');
        const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.dot')) : [];

        let currentSlide = 0;
        let slideInterval = null;

        if (slides.length === 0) return;

        function showSlide(index) {
            if (index < 0 || index >= slides.length) return;
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                slide.setAttribute('aria-hidden', i !== index);
            });
            slides[index].classList.add('active');
            slides[index].setAttribute('aria-hidden', 'false');

            if (dots.length > 0) {
                dots.forEach((dot) => {
                    dot.classList.remove('active');
                    dot.removeAttribute('aria-current');
                });
                if (dots[index]) {
                     dots[index].classList.add('active');
                     dots[index].setAttribute('aria-current', 'true');
                }
            }
            currentSlide = index;
        }

        function nextSlideAction() { showSlide((currentSlide + 1) % slides.length); }
        function prevSlideAction() { showSlide((currentSlide - 1 + slides.length) % slides.length); }

        function startAutoplay() {
            if (slideInterval) clearInterval(slideInterval);
            slideInterval = setInterval(nextSlideAction, 5000);
        }
        function stopAutoplay() {
            clearInterval(slideInterval);
            slideInterval = null;
        }

        showSlide(0);

        if (prevButton) prevButton.addEventListener('click', () => { stopAutoplay(); prevSlideAction(); startAutoplay(); });
        if (nextButton) nextButton.addEventListener('click', () => { stopAutoplay(); nextSlideAction(); startAutoplay(); });

        dots.forEach(dot => {
            dot.addEventListener('click', (event) => {
                const index = parseInt(event.target.getAttribute('data-slide-index'), 10);
                if (!isNaN(index)) { stopAutoplay(); showSlide(index); startAutoplay(); }
            });
            dot.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    const index = parseInt(event.target.getAttribute('data-slide-index'), 10);
                     if (!isNaN(index)) { stopAutoplay(); showSlide(index); startAutoplay(); }
                }
            });
        });

        const slideshowObserver = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { startAutoplay(); }
            else { stopAutoplay(); }
        }, { threshold: 0.1 });
        slideshowObserver.observe(container);

        container.addEventListener('mouseenter', stopAutoplay);
        container.addEventListener('mouseleave', () => {
            const rect = container.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom >= 0) { startAutoplay(); }
        });
    });

    const counters = document.querySelectorAll('.counter');

    const animateCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        if (isNaN(target)) return;

        let count = 0;
        const duration = 2500; 
        const frameDuration = 1000 / 60; 
        const totalFrames = Math.round(duration / frameDuration);
        const increment = target / totalFrames;

        const updateCount = () => {
            count += increment;
            if (count < target) {
                counter.textContent = Math.ceil(count).toLocaleString(); 
                requestAnimationFrame(updateCount);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };
        counter.textContent = (0).toLocaleString();
        requestAnimationFrame(updateCount);
    };

    const impactSection = document.getElementById('impact');
    if (impactSection && counters.length > 0) {
        let animated = false;
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    counters.forEach(animateCounter);
                    animated = true;
                }
            });
        }, { threshold: 0.3 });
        counterObserver.observe(impactSection);
    }

    const testimonialCarousel = document.getElementById('testimonial-carousel');
    if (testimonialCarousel) {
        const slides = Array.from(testimonialCarousel.querySelectorAll('.testimonial-slide'));
        const prevButton = testimonialCarousel.querySelector('.testimonial-prev');
        const nextButton = testimonialCarousel.querySelector('.testimonial-next');
        let currentTestimonial = 0;
        let testimonialInterval;

        if (slides.length > 0) {
            function showTestimonial(index) {
                slides.forEach((slide, i) => {
                    slide.classList.remove('active');
                    slide.setAttribute('aria-hidden', i !== index);
                });
                slides[index].classList.add('active');
                slides[index].setAttribute('aria-hidden', 'false');
                currentTestimonial = index;
            }

            function nextTestimonialAction() { showTestimonial((currentTestimonial + 1) % slides.length); }
            function prevTestimonialAction() { showTestimonial((currentTestimonial - 1 + slides.length) % slides.length); }

            function startTestimonialAutoplay() {
                if(testimonialInterval) clearInterval(testimonialInterval);
                testimonialInterval = setInterval(nextTestimonialAction, 6000); 
            }
            function stopTestimonialAutoplay() { clearInterval(testimonialInterval); }

            if (prevButton) prevButton.addEventListener('click', () => { stopTestimonialAutoplay(); prevTestimonialAction(); startTestimonialAutoplay(); });
            if (nextButton) nextButton.addEventListener('click', () => { stopTestimonialAutoplay(); nextTestimonialAction(); startTestimonialAutoplay(); });

            showTestimonial(0);

            const testimonialObserver = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) startTestimonialAutoplay();
                else stopTestimonialAutoplay();
            }, { threshold: 0.1 });
            testimonialObserver.observe(testimonialCarousel);

            testimonialCarousel.addEventListener('mouseenter', stopTestimonialAutoplay);
            testimonialCarousel.addEventListener('mouseleave', () => {
                 const rect = testimonialCarousel.getBoundingClientRect();
                 if (rect.top < window.innerHeight && rect.bottom >= 0) startTestimonialAutoplay();
            });
        }
    }

    function handleFormSubmission(formId, successMessage) {
        const form = document.getElementById(formId);

        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                showCustomAlert(successMessage, 'success');
                form.reset();
            });
        }
    }
    handleFormSubmission('contactForm', 'Thank you! Your message has been sent (demo).');
    handleFormSubmission('newsletterForm', 'Thank you for subscribing! (demo).');

    const shareButton = document.getElementById('share-button');
    if (shareButton) {
        shareButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const shareData = {
                title: document.title,
                text: 'Join Sahajshakti Sarvakalyaan Trust in making a difference! Learn more about their impactful work.', 
                url: window.location.href
            };
            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                    showCustomAlert('Thanks for sharing!', 'success');
                } catch (error) {
                    console.error('Error sharing:', error);
                    showCustomAlert('Sharing failed. Please try again or copy the link.', 'error');
                }
            } else {
                try {
                    const textArea = document.createElement("textarea");
                    textArea.value = `${shareData.text} ${shareData.url}`;
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        showCustomAlert('Link and message copied to clipboard! Please share it.', 'success');
                    } catch (err) {
                        showCustomAlert('Failed to copy. Please share the URL manually.', 'error');
                    }
                    document.body.removeChild(textArea);
                } catch (err) {
                    showCustomAlert('Sharing not supported. Please copy the URL manually.', 'error');
                }
            }
        });
    }

    const currentYearElements = document.querySelectorAll('#currentYear'); 
    currentYearElements.forEach(el => {
        if (el) el.textContent = new Date().getFullYear();
    });

    document.querySelectorAll('img').forEach(img => {
        if (img.getAttribute('onerror') && img.getAttribute('onerror').includes("placehold.co/150x50")) {
            return;
        }
        if (img.getAttribute('data-error-handled')) {
            return;
        }

        const altText = encodeURIComponent(img.alt || "Image");
        const width = img.naturalWidth > 0 ? img.naturalWidth : (img.offsetWidth > 0 ? img.offsetWidth : (img.width > 0 ? img.width : 300));
        const height = img.naturalHeight > 0 ? img.naturalHeight : (img.offsetHeight > 0 ? img.offsetHeight : (img.height > 0 ? img.height : 200));
        const placeholderSrc = `https://placehold.co/${width}x${height}/E2E8F0/4A5568?text=${altText.replace(/\+/g, '%20')}`;

       img.onerror = function() {
                    if (this.src !== placeholderSrc) { 
                       this.src = placeholderSrc;
                       this.alt = `Placeholder: ${img.alt || 'Image'}`;
                       console.warn(`Image failed to load: ${img.getAttribute('src')}. Replaced with general placeholder.`);
                    }
                    this.setAttribute('data-error-handled', 'true');
                };
                if (img.complete && (img.naturalWidth === 0 || !img.src || img.src === window.location.href) && img.src !== placeholderSrc) {
                    img.dispatchEvent(new Event('error')); 
                }
            });

        });
    const lazyLoadImages = document.querySelectorAll('img[data-src]');
    const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                img.onload = () => {
                    img.classList.add('loaded');
                };
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '100px 0px' });