const SUPABASE_URL = 'https://tsbbfkmmsakhernjfprm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_c3kjyrfdpKy-o8XyXXvSBQ_2UfRtZ_t';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    // ------------------------------------
    // Theme
    // ------------------------------------
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }
    themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme');
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
    // Auth Check
    // ------------------------------------
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        alert('로그인이 필요한 페이지입니다.');
        window.location.href = 'index.html';
        return;
    }

    // Set welcome message
    document.getElementById('welcomeMsg').textContent = `${user.email.split('@')[0]}님, 환영합니다!`;
    document.getElementById('profileEmail').textContent = user.email;

    // Auth Container (Header)
    const authContainer = document.getElementById('authContainer');
    authContainer.innerHTML = `
        <div class="user-info-container">
            <span class="user-email">${user.email.split('@')[0]}님</span>
            <button class="logout-btn" id="logoutBtn" style="margin-left:10px; padding:0.3rem 0.6rem; border:none; background:transparent; cursor:pointer; color:var(--text-color); font-weight:bold; border-left:1px solid var(--border-color);">로그아웃</button>
        </div>
    `;
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        window.location.href = 'index.html';
    });

    // ------------------------------------
    // Tab Switching
    // ------------------------------------
    const tabs = document.querySelectorAll('.mypage-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`tab-${target}`).classList.add('active');
        });
    });

    // ------------------------------------
    // Tab 1: Orders
    // ------------------------------------
    const ordersContainer = document.getElementById('ordersContainer');

    const { data: userOrders, error: ordersError } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });

    if (ordersError) {
        console.error('Failed to fetch orders:', ordersError);
        ordersContainer.innerHTML = '<div class="empty-orders">주문 내역을 불러오는데 실패했습니다.</div>';
    } else if (!userOrders || userOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-orders">
                <p>주문 내역이 없습니다.</p>
                <a href="index.html#shop" class="home-btn">쇼핑하러 가기</a>
            </div>`;
    } else {
        ordersContainer.innerHTML = userOrders.map(order => {
            const orderTime = new Date(order.created_at);
            const date = orderTime.toLocaleString();
            let statusBadge = order.status || '결제완료';
            const elapsedHours = (Date.now() - orderTime.getTime()) / (1000 * 60 * 60);
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
                            <strong>주문일자:</strong> ${date}<br>
                            <span style="font-size:0.8rem; display:inline-block; margin-top:0.3rem;">주문번호: ${order.id}</span>
                        </div>
                        <div class="order-status">${statusBadge}</div>
                    </div>
                    <ul class="order-items">${itemsHtml}</ul>
                    <div class="order-footer">
                        총 결제 금액: <span style="color:var(--primary-color);">${order.total.toLocaleString()}원</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ------------------------------------
    // Tab 2: Profile — Load & Save
    // ------------------------------------

    // Load profile from Supabase user metadata
    const meta = user.user_metadata || {};
    document.getElementById('profilePhone').value = meta.phone || '';
    document.getElementById('profileZip').value = meta.zip || '';
    document.getElementById('profileAddress').value = meta.address || '';
    document.getElementById('profileAddressDetail').value = meta.address_detail || '';

    document.getElementById('profileSaveBtn').addEventListener('click', async () => {
        const saveBtn = document.getElementById('profileSaveBtn');
        const saveMsg = document.getElementById('saveMsg');

        const phone = document.getElementById('profilePhone').value.trim();
        const zip = document.getElementById('profileZip').value.trim();
        const address = document.getElementById('profileAddress').value.trim();
        const addressDetail = document.getElementById('profileAddressDetail').value.trim();

        saveBtn.disabled = true;
        saveBtn.textContent = '저장 중...';

        const { error } = await supabaseClient.auth.updateUser({
            data: { phone, zip, address, address_detail: addressDetail }
        });

        saveBtn.disabled = false;
        saveBtn.textContent = '저장하기';

        if (error) {
            alert('저장 실패: ' + error.message);
        } else {
            saveMsg.textContent = '✅ 저장되었습니다!';
            saveMsg.classList.add('show');
            setTimeout(() => saveMsg.classList.remove('show'), 3000);
        }
    });

    // ------------------------------------
    // Tab 3: Password Reset
    // ------------------------------------
    document.getElementById('resetPasswordBtn').addEventListener('click', async () => {
        const pwMsg = document.getElementById('pwMsg');
        const btn = document.getElementById('resetPasswordBtn');
        btn.disabled = true;
        btn.textContent = '발송 중...';

        const { error } = await supabaseClient.auth.resetPasswordForEmail(user.email, {
            redirectTo: 'https://vibecoding-chi-seven.vercel.app'
        });

        btn.disabled = false;
        btn.textContent = '비밀번호 변경 이메일 발송';

        if (error) {
            pwMsg.textContent = '❌ 발송 실패: ' + error.message;
            pwMsg.style.color = '#e74c3c';
        } else {
            pwMsg.textContent = `✅ ${user.email}으로 메일을 발송했습니다.`;
            pwMsg.style.color = '#27ae60';
        }
        pwMsg.classList.add('show');
    });

    // ------------------------------------
    // Tab 3: Account Deletion
    // ------------------------------------
    document.getElementById('deleteAccountBtn').addEventListener('click', async () => {
        const confirmed = confirm(
            '정말 탈퇴하시겠습니까?\n\n탈퇴 시 모든 개인정보가 삭제되며, 이 작업은 되돌릴 수 없습니다.'
        );
        if (!confirmed) return;

        const doubleConfirm = confirm(
            `"${user.email}" 계정을 최종 탈퇴 처리합니다. 계속하시겠습니까?`
        );
        if (!doubleConfirm) return;

        const deleteBtn = document.getElementById('deleteAccountBtn');
        deleteBtn.disabled = true;
        deleteBtn.textContent = '처리 중...';

        try {
            // 1. Sign out first
            await supabaseClient.auth.signOut();

            // 2. Show farewell message and redirect
            document.body.innerHTML = `
                <div style="
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    font-family: 'Noto Serif KR', serif;
                    background: var(--bg-color, #fff);
                    padding: 2rem;
                    gap: 1.5rem;
                ">
                    <div style="font-size: 3rem;">☕</div>
                    <h2 style="font-size: 1.8rem; color: #5c3c21; font-weight: 700;">회원탈퇴 되었습니다.</h2>
                    <p style="font-size: 1.1rem; color: #666; line-height: 1.8;">
                        이용해주셔서 감사합니다.<br>
                        주례 브루어스는 언제나 좋은 커피로 기다리겠습니다.
                    </p>
                    <a href="index.html" style="
                        margin-top: 1rem;
                        padding: 0.8rem 2.5rem;
                        background: #bd906c;
                        color: white;
                        text-decoration: none;
                        border-radius: 30px;
                        font-weight: 700;
                        font-size: 1rem;
                        transition: background 0.3s;
                    ">홈으로 돌아가기</a>
                </div>
            `;

        } catch (err) {
            deleteBtn.disabled = false;
            deleteBtn.textContent = '회원 탈퇴하기';
            alert('오류가 발생했습니다: ' + err.message);
        }
    });
});
