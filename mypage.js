const SUPABASE_URL = 'https://tsbbfkmmsakhernjfprm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_c3kjyrfdpKy-o8XyXXvSBQ_2UfRtZ_t';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    // Theme logic
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
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

    // Check Auth
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        alert('로그인이 필요한 페이지입니다.');
        window.location.href = 'index.html';
        return;
    }

    const authContainer = document.getElementById('authContainer');
    authContainer.innerHTML = `
        <div class="user-info-container">
            <span class="user-email">${user.email.split('@')[0]}님</span>
            <button class="logout-btn" id="logoutBtn" style="margin-left: 10px; padding: 0.3rem 0.6rem; border: none; background: transparent; cursor: pointer; color: var(--text-color); font-weight: bold; border-left: 1px solid var(--border-color);">로그아웃</button>
        </div>
    `;

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        window.location.href = 'index.html';
    });

    // Load Orders
    const ordersContainer = document.getElementById('ordersContainer');
    let allOrders = [];
    try {
        const savedOrders = localStorage.getItem('orders');
        if (savedOrders) {
            allOrders = JSON.parse(savedOrders);
        }
    } catch(e) {
        console.error('Failed to parse orders:', e);
    }

    // Filter orders by current user
    const userOrders = allOrders.filter(order => order.userEmail === user.email).sort((a, b) => b.timestamp - a.timestamp);

    if (userOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-orders">
                <p>주문 내역이 없습니다.</p>
                <a href="index.html#shop" class="home-btn">쇼핑하러 가기</a>
            </div>`;
        return;
    }

    ordersContainer.innerHTML = userOrders.map(order => {
        const date = new Date(order.timestamp).toLocaleString();
        
        let statusBadge = '결제완료';
        // Mocking status changes based on time elapsed for demo purposes
        const elapsedHours = (Date.now() - order.timestamp) / (1000 * 60 * 60);
        if (elapsedHours > 48) statusBadge = '배송완료';
        else if (elapsedHours > 24) statusBadge = '배송중';
        else if (elapsedHours > 1) statusBadge = '상품준비중';

        const itemsHtml = order.items.map(item => `
            <li class="order-item">
                <span class="order-item-name">${item.name} <span style="font-weight:normal; color:var(--text-muted);">(${item.option}g)</span> &times; ${item.quantity || 1}개</span>
                <span>${((item.price || 0) * (item.quantity || 1)).toLocaleString()}원</span>
            </li>
        `).join('');

        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <strong>주문일자:</strong> ${date} <br>
                        <span style="font-size: 0.8rem; display:inline-block; margin-top:0.3rem;">주문번호: ${order.id}</span>
                    </div>
                    <div class="order-status">${statusBadge}</div>
                </div>
                <ul class="order-items">
                    ${itemsHtml}
                </ul>
                <div class="order-footer">
                    총 결제 금액: <span style="color: var(--primary-color);">${order.total.toLocaleString()}원</span>
                </div>
            </div>
        `;
    }).join('');
});
