document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------
    // Hero Slider Logic
    // ------------------------------------
    const heroSlides = document.querySelectorAll('.hero-slide');
    let currentHeroSlide = 0;

    function nextHeroSlide() {
        heroSlides[currentHeroSlide].classList.remove('active');
        currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
        heroSlides[currentHeroSlide].classList.add('active');
    }

    // Auto rotate hero slides every 5 seconds
    setInterval(nextHeroSlide, 5000);

    // ------------------------------------
    // Space Slider Logic
    // ------------------------------------
    const slider = document.getElementById('spaceSlider');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    let currentSlide = 0;

    function updateSlider() {
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlider();
    });

    prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlider();
    });

    // Auto slide
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlider();
    }, 5000);

    // ------------------------------------
    // Cart Logic
    // ------------------------------------
    let cart = [];
    const cartDrawer = document.getElementById('cartDrawer');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartCountEl = document.getElementById('cartCount');
    const totalPriceEl = document.getElementById('totalPrice');
    const addButtons = document.querySelectorAll('.add-to-cart');
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');

    function updateCartUI() {
        cartItemsList.innerHTML = '';
        let total = 0;
        
        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p class="empty-msg">장바구니가 비어 있습니다.</p>';
        } else {
            cart.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.price.toLocaleString()}원 (${item.option}g)</p>
                    </div>
                    <button class="remove-item" data-index="${index}">삭제</button>
                `;
                cartItemsList.appendChild(itemEl);
                total += item.price;
            });
        }

        cartCountEl.textContent = cart.length;
        totalPriceEl.textContent = total.toLocaleString();

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                cart.splice(index, 1);
                updateCartUI();
            });
        });
    }

    addButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const basePrice = parseInt(btn.getAttribute('data-price'));
            const optionSelect = btn.parentElement.querySelector('.option-select');
            const optionValue = optionSelect.value;
            
            let finalPrice = basePrice;
            if (optionValue === '500') {
                finalPrice += (id === 'p1' ? 12000 : 11000);
            } else if (id === 'p3' && optionValue === '2') {
                finalPrice += 18000;
            }

            cart.push({
                id,
                name,
                price: finalPrice,
                option: optionValue
            });

            updateCartUI();
            cartDrawer.classList.add('active');
        });
    });

    cartBtn.addEventListener('click', () => {
        cartDrawer.classList.add('active');
    });

    closeCart.addEventListener('click', () => {
        cartDrawer.classList.remove('active');
    });

    document.getElementById('checkoutBtn').addEventListener('click', () => {
        if (cart.length === 0) {
            alert('장바구니가 비어 있습니다.');
            return;
        }
        alert('결제 페이지로 이동합니다. (토스페이먼츠/카카오페이 연동 예정)');
    });

    // ------------------------------------
    // Login Modal Logic
    // ------------------------------------
    const loginModal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeLogin = document.getElementById('closeLogin');

    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('active');
    });

    closeLogin.addEventListener('click', () => {
        loginModal.classList.remove('active');
    });

    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
    });

    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            alert('소셜 로그인이 완료되었습니다.');
            loginModal.classList.remove('active');
            loginBtn.textContent = '마이페이지';
        });
    });

    // ------------------------------------
    // Location Logic
    // ------------------------------------
    document.getElementById('routeBtn').addEventListener('click', () => {
        alert('카카오내비 / 네이버 지도 앱으로 길찾기를 시작합니다.');
    });

    // ------------------------------------
    // Visitor Count & Reset Logic (Daily Actual Count)
    // ------------------------------------
    const visitorCountEl = document.getElementById('visitorCount');
    const duration = 2000; // 2 seconds
    
    function getActualVisitorCount() {
        const now = new Date();
        const lastVisitDate = localStorage.getItem('lastVisitDate');
        let currentDayCount = parseInt(localStorage.getItem('dailyVisitorCount')) || 0;
        
        // KST (UTC+9) Date string
        const kstDate = new Intl.DateTimeFormat('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(now);

        if (lastVisitDate !== kstDate) {
            // New day in KST: Reset count
            currentDayCount = 1;
            localStorage.setItem('lastVisitDate', kstDate);
        } else {
            // Same day: Increment count
            currentDayCount += 1;
        }
        
        localStorage.setItem('dailyVisitorCount', currentDayCount);
        return currentDayCount;
    }

    function animateCountUp(target, element, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentCount = Math.floor(progress * target);
            element.textContent = currentCount.toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Get the updated count for today and animate
    const todayCount = getActualVisitorCount();
    animateCountUp(todayCount, visitorCountEl, duration);

    // ------------------------------------
    // Dark Mode Toggle Logic
    // ------------------------------------
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Apply saved theme on load
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        }
    });

    // ------------------------------------
    // Scroll Reveal Logic
    // ------------------------------------
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.15 // 15% of the element is visible
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // ------------------------------------
    // Inquiry Form Logic
    // ------------------------------------
    const inquiryForm = document.getElementById('inquiryForm');
    const inquiryList = document.getElementById('inquiryList');

    function loadInquiries() {
        const inquiries = JSON.parse(localStorage.getItem('inquiries')) || [];
        renderInquiries(inquiries);
    }

    function renderInquiries(inquiries) {
        if (inquiries.length === 0) {
            inquiryList.innerHTML = '<p class="empty-msg">등록된 문의가 없습니다.</p>';
            return;
        }

        inquiryList.innerHTML = inquiries.map(item => `
            <div class="inquiry-item">
                <div class="inquiry-item-header">
                    <span>${item.name}</span>
                    <small>${item.date}</small>
                </div>
                <div class="inquiry-item-content">${item.content}</div>
            </div>
        `).join('');
    }

    inquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('userName').value;
        const contact = document.getElementById('userContact').value;
        const content = document.getElementById('inquiryContent').value;
        const date = new Date().toLocaleDateString('ko-KR');

        const newInquiry = { name, contact, content, date };
        const inquiries = JSON.parse(localStorage.getItem('inquiries')) || [];
        
        inquiries.unshift(newInquiry); // Add to the beginning
        localStorage.setItem('inquiries', JSON.stringify(inquiries));

        renderInquiries(inquiries);
        inquiryForm.reset();
        alert('문의가 성공적으로 제출되었습니다.');
    });

    // Initial load
    loadInquiries();
});
