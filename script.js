// Supabase configuration
const SUPABASE_URL = 'https://tsbbfkmmsakhernjfprm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_c3kjyrfdpKy-o8XyXXvSBQ_2UfRtZ_t';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
                // Determine additional price based on the product ID or base price
                if (id === 'p1') finalPrice += 12000;
                else if (id === 'p2') finalPrice += 11000;
                else if (id === 'p_sig') finalPrice += 11000;
                else if (id === 'p_tanzania') finalPrice += 11000;
                else if (id === 'p_kenya') finalPrice += 13000;
                else if (id === 'p_kenya_pb') finalPrice += 14000;
                else if (id === 'p_colombia') finalPrice += 10000;
                else if (id === 'p_honduras') finalPrice += 10000;
                else if (id === 'p_harrar') finalPrice += 12000;
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
    // Auth Logic (Supabase Auth)
    // ------------------------------------
    const authContainer = document.getElementById('authContainer');
    const loginModal = document.getElementById('loginModal');
    const closeLogin = document.getElementById('closeLogin');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authTabContents = document.querySelectorAll('.auth-tab-content');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Update Header UI based on Auth State
    function updateAuthUI(user) {
        if (user) {
            authContainer.innerHTML = `
                <div class="user-info-container">
                    <span class="user-email">안녕하세요, ${user.email.split('@')[0]}님</span>
                    <button class="logout-btn" id="logoutBtn">로그아웃</button>
                </div>
            `;
            document.getElementById('logoutBtn').addEventListener('click', handleLogout);
        } else {
            authContainer.innerHTML = `<button class="icon-btn" id="loginBtn">로그인</button>`;
            document.getElementById('loginBtn').addEventListener('click', () => {
                loginModal.classList.add('active');
            });
        }
    }

    // Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert('로그인 실패: ' + error.message);
        } else {
            alert('로그인 성공!');
            loginModal.classList.remove('active');
            loginForm.reset();
        }
    });

    // Handle Registration
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
        });

        if (error) {
            alert('회원가입 실패: ' + error.message);
        } else {
            alert('회원가입 성공! 이메일을 확인해주세요.');
            // Some Supabase configs auto-login after signup, others require email confirm
            if (data.user && data.session) {
                loginModal.classList.remove('active');
            }
            registerForm.reset();
        }
    });

    // Handle Logout
    async function handleLogout() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            alert('로그아웃 실패: ' + error.message);
        } else {
            alert('로그아웃 되었습니다.');
        }
    }

    // Auth State Change Listener
    supabaseClient.auth.onAuthStateChange((event, session) => {
        const user = session?.user ?? null;
        updateAuthUI(user);
        toggleReviewForm(user);
    });

    // Modal Tab Switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            
            authTabs.forEach(t => t.classList.remove('active'));
            authTabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${target}Tab`).classList.add('active');
        });
    });

    // Modal Close Logic
    closeLogin.addEventListener('click', () => {
        loginModal.classList.remove('active');
    });

    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
    });

    // Initial Auth Check
    async function checkInitialAuth() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        updateAuthUI(user);
        toggleReviewForm(user);
    }
    checkInitialAuth();

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
    // Review Logic
    // ------------------------------------
    const reviewForm = document.getElementById('reviewForm');
    const reviewList = document.getElementById('reviewList');
    const reviewFormContainer = document.getElementById('reviewFormContainer');
    const stars = document.querySelectorAll('.star');
    const ratingValueInput = document.getElementById('ratingValue');
    let allReviews = []; // Store all reviews for sorting and pagination
    let currentSort = 'latest';
    let currentPage = 1;
    const reviewsPerPage = 5;

    // Star Rating Click Event
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = star.getAttribute('data-value');
            ratingValueInput.value = val;
            updateStarUI(val);
        });
    });

    function updateStarUI(val) {
        stars.forEach(s => {
            if (s.getAttribute('data-value') <= val) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    }

    // Initialize stars to 5
    updateStarUI(5);

    // Fetch Reviews from Supabase
    async function fetchReviews() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        const { data, error } = await supabaseClient
            .from('reviews')
            .select('*');

        if (error) {
            console.error('Error fetching reviews:', error);
            return;
        }

        allReviews = data;
        updateReviewStats();
        sortAndRenderReviews(user);
    }

    function updateReviewStats() {
        const total = allReviews.length;
        const avg = total > 0 
            ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) 
            : '0.0';
        
        document.getElementById('avgStars').textContent = `★ ${avg}`;
        document.getElementById('totalReviewsCount').textContent = `(${total}개 리뷰)`;
    }

    function sortAndRenderReviews(currentUser) {
        let sorted = [...allReviews];
        
        if (currentSort === 'latest') {
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
            sorted.sort((a, b) => b.rating - a.rating);
        }

        // Pagination logic
        const startIndex = (currentPage - 1) * reviewsPerPage;
        const paginatedReviews = sorted.slice(startIndex, startIndex + reviewsPerPage);
        
        renderReviews(paginatedReviews, currentUser);
        renderPagination(sorted.length);
    }

    function renderReviews(reviews, currentUser) {
        if (!reviews || reviews.length === 0) {
            reviewList.innerHTML = '<p class="empty-msg">첫 번째 리뷰를 남겨보세요!</p>';
            return;
        }

        reviewList.innerHTML = reviews.map(rev => {
            const isAuthor = currentUser && currentUser.email === rev.author_email;
            return `
                <div class="review-item" id="review-${rev.id}">
                    <div class="review-item-header">
                        <div>
                            <span class="review-author">${rev.author_email.split('@')[0]}***</span>
                            <div class="review-stars">${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</div>
                        </div>
                        <div style="text-align: right;">
                            <span class="review-date">${new Date(rev.created_at).toLocaleDateString()}</span>
                            ${isAuthor ? `
                                <br>
                                <button class="review-edit-btn" data-id="${rev.id}" data-content="${rev.content}" data-rating="${rev.rating}" data-image="${rev.image_url || ''}">수정</button>
                                <button class="review-delete-btn" data-id="${rev.id}">삭제</button>
                            ` : ''}
                        </div>
                    </div>
                    ${rev.image_url ? `<img src="${rev.image_url}" class="review-image" alt="Review Image">` : ''}
                    <div class="review-content">${rev.content}</div>
                </div>
            `;
        }).join('');

        // Add Edit Event Listeners (Inline)
        document.querySelectorAll('.review-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const content = btn.getAttribute('data-content');
                const rating = parseInt(btn.getAttribute('data-rating'));
                const imageUrl = btn.getAttribute('data-image');
                
                showInlineEditForm(id, content, rating, imageUrl);
            });
        });

        // Add Delete Event Listeners
        document.querySelectorAll('.review-delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const reviewId = btn.getAttribute('data-id');
                if (confirm('정말 삭제하시겠어요?')) {
                    console.log('Attempting to delete review ID:', reviewId);
                    const { error } = await supabaseClient
                        .from('reviews')
                        .delete()
                        .eq('id', reviewId);

                    if (error) {
                        console.error('Delete Error:', error);
                        alert('리뷰 삭제 실패: ' + error.message);
                    } else {
                        console.log('Delete successful');
                        alert('리뷰가 삭제되었습니다.');
                        fetchReviews();
                    }
                }
            });
        });
    }

    function renderPagination(totalCount) {
        const totalPages = Math.ceil(totalCount / reviewsPerPage);
        const paginationContainer = document.getElementById('reviewPagination');
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) return;

        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', async () => {
                currentPage = i;
                const { data: { user } } = await supabaseClient.auth.getUser();
                sortAndRenderReviews(user);
                document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' });
            });
            paginationContainer.appendChild(pageBtn);
        }
    }

    // Sort Button Event Listeners
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = btn.getAttribute('data-sort');
            currentPage = 1;
            const { data: { user } } = await supabaseClient.auth.getUser();
            sortAndRenderReviews(user);
        });
    });

    function showInlineEditForm(id, originalContent, originalRating, originalImage) {
        const reviewItem = document.getElementById(`review-${id}`);
        if (!reviewItem) {
            console.error('Review item not found in DOM:', id);
            return;
        }
        const contentEl = reviewItem.querySelector('.review-content');
        const headerEl = reviewItem.querySelector('.review-item-header');
        const imageEl = reviewItem.querySelector('.review-image');

        // Hide original content and header buttons
        if (contentEl) contentEl.style.display = 'none';
        if (imageEl) imageEl.style.display = 'none';
        const editBtn = headerEl.querySelector('.review-edit-btn');
        const deleteBtn = headerEl.querySelector('.review-delete-btn');
        if (editBtn) editBtn.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'none';

        // Create inline form
        const editForm = document.createElement('div');
        editForm.className = 'inline-edit-form';
        editForm.innerHTML = `
            <div class="inline-edit-stars">
                ${[1, 2, 3, 4, 5].map(v => `<span class="star ${v <= originalRating ? 'active' : ''}" data-value="${v}">★</span>`).join('')}
            </div>
            <input type="url" class="inline-edit-image-url" placeholder="이미지 URL" value="${originalImage}">
            <textarea class="inline-edit-textarea">${originalContent}</textarea>
            <div class="inline-edit-buttons">
                <button class="btn-inline-cancel">취소</button>
                <button class="btn-inline-save">수정 완료</button>
            </div>
        `;

        reviewItem.appendChild(editForm);

        let currentRating = originalRating;
        const inlineStars = editForm.querySelectorAll('.star');
        
        // Inline star click logic
        inlineStars.forEach(star => {
            star.addEventListener('click', () => {
                currentRating = parseInt(star.getAttribute('data-value'));
                inlineStars.forEach(s => {
                    if (parseInt(s.getAttribute('data-value')) <= currentRating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
        });

        // Cancel button logic
        editForm.querySelector('.btn-inline-cancel').addEventListener('click', () => {
            editForm.remove();
            if (contentEl) contentEl.style.display = 'block';
            if (imageEl) imageEl.style.display = 'block';
            if (editBtn) editBtn.style.display = 'inline-block';
            if (deleteBtn) deleteBtn.style.display = 'inline-block';
        });

        // Save button logic
        editForm.querySelector('.btn-inline-save').addEventListener('click', async () => {
            const newContent = editForm.querySelector('.inline-edit-textarea').value;
            const newImage = editForm.querySelector('.inline-edit-image-url').value;
            
            if (confirm('수정 하시겠어요?')) {
                console.log('Attempting to update review ID:', id, { content: newContent, rating: currentRating, image_url: newImage });
                const { error } = await supabaseClient
                    .from('reviews')
                    .update({ content: newContent, rating: currentRating, image_url: newImage })
                    .eq('id', id);

                if (error) {
                    console.error('Update Error:', error);
                    alert('리뷰 수정 실패: ' + error.message);
                } else {
                    console.log('Update successful');
                    alert('리뷰가 수정되었습니다!');
                    fetchReviews();
                }
            }
        });
    }

    // Submit Review
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            alert('로그인이 필요한 기능입니다.');
            return;
        }

        const content = document.getElementById('reviewContent').value;
        const rating = parseInt(ratingValueInput.value);
        const imageUrl = document.getElementById('reviewImageUrl').value;

        // Insert new review
        const { error } = await supabaseClient
            .from('reviews')
            .insert([
                { 
                    content, 
                    author_email: user.email, 
                    rating,
                    image_url: imageUrl 
                }
            ]);

        if (error) {
            alert('리뷰 등록 실패: ' + error.message);
        } else {
            alert('리뷰가 등록되었습니다!');
            reviewForm.reset();
            updateStarUI(5);
            fetchReviews();
        }
    });

    // Toggle Review Form Visibility based on Auth
    function toggleReviewForm(user) {
        const authMsg = reviewFormContainer.querySelector('.auth-needed-msg');
        if (user) {
            authMsg.style.display = 'none';
            reviewForm.style.display = 'block';
        } else {
            authMsg.style.display = 'block';
            reviewForm.style.display = 'none';
        }
    }

    // Initial load
    fetchReviews();

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

    inquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('userName').value;
        const contact = document.getElementById('userContact').value;
        const content = document.getElementById('inquiryContent').value;
        const date = new Date().toLocaleDateString('ko-KR');

        try {
            console.log('Attempting to insert:', { name, contact, content });
            // Save to Supabase contact table
            const { data, error } = await supabaseClient
                .from('contact')
                .insert([
                    { 
                        name: name, 
                        phone: contact, // Column name changed from 'contact' to 'phone'
                        content: content
                    }
                ]);

            if (error) {
                console.error('Supabase Error Details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            alert('문의가 접수되었습니다!');

            // Update UI list (using local storage as fallback/mock for list display)
            const newInquiry = { name, contact, content, date };
            const inquiries = JSON.parse(localStorage.getItem('inquiries')) || [];
            inquiries.unshift(newInquiry);
            localStorage.setItem('inquiries', JSON.stringify(inquiries));
            renderInquiries(inquiries);

            inquiryForm.reset();
        } catch (error) {
            console.error('Error submitting inquiry:', error);
            alert('문의 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    });

    // Initial load
    loadInquiries();
});
