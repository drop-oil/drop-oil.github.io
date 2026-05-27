document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Hero Slideshow Control (背景画像スライドショー)
       ========================================================================== */
    const slides = document.querySelectorAll('.hero-slideshow .slide');
    let currentSlide = 0;
    const slideIntervalTime = 6000; // 6秒ごとにスライド切り替え

    function nextSlide() {
        if (slides.length === 0) return;
        
        // 現在のアクティブスライドを非表示へ
        slides[currentSlide].classList.remove('active');
        
        // 次のスライドインデックスを計算
        currentSlide = (currentSlide + 1) % slides.length;
        
        // 次のスライドを表示へ
        slides[currentSlide].classList.add('active');
    }

    // スライドが2枚以上ある場合のみスライドショーを開始
    if (slides.length > 1) {
        setInterval(nextSlide, slideIntervalTime);
    }

    /* ==========================================================================
       2. Mobile Navigation Toggle (スマホ用メニュー開閉)
       ========================================================================== */
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.nav-mobile a');

    function toggleMenu() {
        mobileMenuBtn.classList.toggle('active');
        mobileNavOverlay.classList.toggle('open');
        document.body.classList.toggle('overflow-hidden'); // 背後のスクロールを防ぐ
    }

    if (mobileMenuBtn && mobileNavOverlay) {
        mobileMenuBtn.addEventListener('click', toggleMenu);

        // リンクをクリックした際にメニューを閉じる
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileNavOverlay.classList.contains('open')) {
                    toggleMenu();
                }
            });
        });
    }

    /* ==========================================================================
       3. Header scrolled background change (スクロール時のヘッダー色変更)
       ========================================================================== */
    const header = document.getElementById('site-header');
    
    function checkHeaderScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', checkHeaderScroll);
    checkHeaderScroll(); // 初期ロード時にもチェック

    /* ==========================================================================
       4. Scroll Fade-in Animation (スクロール時のふわっとフェードイン効果)
       ========================================================================== */
    const fadeElements = document.querySelectorAll('.scroll-fade');

    if ('IntersectionObserver' in window) {
        const fadeObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    // 一度表示されたら監視を終了する（パフォーマンス向上）
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1, // 要素の10%が見えたら発火
            rootMargin: '0px 0px -50px 0px' // 少し早めにアニメーション開始
        });

        fadeElements.forEach(element => {
            fadeObserver.observe(element);
        });
    } else {
        // IntersectionObserver非対応のブラウザは最初からすべて表示
        fadeElements.forEach(element => {
            element.classList.add('animated');
        });
    }

    /* ==========================================================================
       5. Back to Top Button (トップへ戻るボタンの表示制御)
       ========================================================================== */
    const backToTopBtn = document.getElementById('back-to-top');

    function checkBackToTop() {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }

    window.addEventListener('scroll', checkBackToTop);
    checkBackToTop();

    /* ==========================================================================
       6. Form Submission Redirect Handler (フォーム送信成功ステータス検知)
       ========================================================================== */
    const formStatus = document.getElementById('form-status');
    const urlParams = new URLSearchParams(window.location.search);
    const submitStatus = urlParams.get('status');

    if (submitStatus === 'success') {
        if (formStatus) {
            formStatus.classList.add('success');
            formStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> 予約リクエストが送信されました！FormSubmitからの連携承認メール、またはセラピストからの返信をお待ちください。';
            formStatus.style.display = 'block';
            
            // 予約フォームセクションまで自動スクロール
            const reserveSection = document.getElementById('reserve');
            if (reserveSection) {
                setTimeout(() => {
                    reserveSection.scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
        }
    }

    /* ==========================================================================
       7. Form Validation (フォーム入力簡易バリデーション)
       ========================================================================== */
    const reserveForm = document.getElementById('reserve-form');

    if (reserveForm) {
        reserveForm.addEventListener('submit', (e) => {
            const ageInput = document.getElementById('age');
            const age = parseInt(ageInput.value, 10);

            // 年齢チェック (18歳未満の利用制限などがある場合)
            if (isNaN(age) || age < 18 || age > 100) {
                e.preventDefault();
                alert('ご予約は18歳以上の方に限らせていただきます。正しい年齢をご入力ください。');
                ageInput.focus();
                return false;
            }

            // 第1〜3希望日の論理チェック (過去の日付は不可)
            const dateInputs = [
                document.getElementById('date1'),
                document.getElementById('date2'),
                document.getElementById('date3')
            ];

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let i = 0; i < dateInputs.length; i++) {
                const dateVal = dateInputs[i].value;
                if (dateVal) {
                    const selectedDate = new Date(dateVal);
                    selectedDate.setHours(0, 0, 0, 0);

                    if (selectedDate < today) {
                        e.preventDefault();
                        alert(`第${i + 1}希望日には、今日以降の日付を指定してください。`);
                        dateInputs[i].focus();
                        return false;
                    }
                }
            }

            // 送信ボタンの二重送信防止
            const submitBtn = document.getElementById('submit-btn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 送信中...';
            }
        });
    }

    /* ==========================================================================
       8. Date Picker Past Date Restriction (カレンダーでの過去日選択不可対応)
       ========================================================================== */
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    ['date1', 'date2', 'date3'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.setAttribute('min', todayStr);
        }
    });

    /* ==========================================================================
       9. Q&A Accordion Toggle (秘密のQ&A開閉制御)
       ========================================================================== */
    const qaQuestions = document.querySelectorAll('.qa-question');
    qaQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            item.classList.toggle('active');
        });
    });
});
