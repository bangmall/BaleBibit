/* BaleBibit Interactive Logic */

document.addEventListener('DOMContentLoaded', () => {

    /* Sticky Header on Scroll */
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = "0 2px 15px rgba(0,0,0,0.1)";
        } else {
            header.style.boxShadow = "none";
        }
    });

    /* Mobile Menu Toggle & Overlay */
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.querySelector('.nav-menu');
    const menuOverlay = document.getElementById('menuOverlay');

    function toggleMenu() {
        navMenu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';

        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }

    mobileToggle.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', toggleMenu);

    /* Smooth Scroll & Close Menu */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }

            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* Scroll to Top */
    const scrollTopBtn = document.getElementById('scrollTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    /* Reveal on Scroll Animation */
    const revealItems = document.querySelectorAll('[data-reveal]');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    revealItems.forEach(item => revealObserver.observe(item));

    /* Cart System */
    let cart = [];

    const cartCountEl = document.getElementById('cartCount');
    const checkoutCartListEl = document.getElementById('checkoutCartList');
    const checkoutTotalEl = document.getElementById('checkoutTotal');
    const addToCartBtns = document.querySelectorAll('.add-to-cart');

    // Add to Cart Function
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = parseInt(btn.getAttribute('data-price'));

            // Check if item exists
            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.qty++;
            } else {
                cart.push({ id, name, price, qty: 1 });
            }

            updateCartUI();

            // Interaction Feedback
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Masuk Keranjang';
            btn.classList.add('btn-success');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('btn-success');
            }, 1000);
        });
    });

    // Update Cart UI
    function updateCartUI() {
        // Update Header Count
        const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
        cartCountEl.innerText = totalQty;
        cartCountEl.style.transform = "scale(1.2)";
        setTimeout(() => cartCountEl.style.transform = "scale(1)", 200);

        // Update Checkout List
        checkoutCartListEl.innerHTML = '';
        let totalPrice = 0;

        if (cart.length === 0) {
            checkoutCartListEl.innerHTML = '<li class="empty-cart-msg">Keranjang masih kosong.</li>';
        } else {
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.qty;
                totalPrice += itemTotal;

                // Bonus Logic: Buy 10 Get 1 Free (Per item type)
                let bonusText = "";
                if (item.qty >= 10) {
                    const bonusQty = Math.floor(item.qty / 10);
                    bonusText = `<div style="color: var(--primary); font-size: 0.8rem; margin-top:5px;">
                        <i class="fas fa-gift"></i> Bonus: Gratis ${bonusQty} Bibit!
                    </div>`;
                }

                const li = document.createElement('li');
                li.className = 'cart-item-row';
                li.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-top">
                            <span class="cart-item-name">${item.name}</span>
                            <button class="remove-item" data-index="${index}"><i class="fas fa-trash"></i></button>
                        </div>
                        <div class="cart-item-bottom">
                            <div class="qty-control">
                                <label>Jumlah:</label>
                                <input type="number" class="qty-input" value="${item.qty}" min="1" data-index="${index}">
                            </div>
                            <span class="cart-item-subtotal">Rp ${itemTotal.toLocaleString()}</span>
                        </div>
                        ${bonusText}
                    </div>
                `;
                checkoutCartListEl.appendChild(li);
            });

            // Add events for quantity change
            document.querySelectorAll('.qty-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const idx = parseInt(e.target.getAttribute('data-index'));
                    let newQty = parseInt(e.target.value);
                    if (isNaN(newQty) || newQty < 1) newQty = 1;
                    cart[idx].qty = newQty;
                    updateCartUI();
                });
            });

            // Add events for remove item
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                    cart.splice(idx, 1);
                    updateCartUI();
                });
            });
        }

        checkoutTotalEl.innerText = "Rp " + totalPrice.toLocaleString();
    }

    /* Checkout / WhatsApp Integration */
    const orderForm = document.getElementById('orderForm');

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            alert("Keranjang masih kosong. Silakan pilih bibit terlebih dahulu.");
            document.querySelector('#produk').scrollIntoView({ behavior: 'smooth' });
            return;
        }

        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;
        const payment = document.getElementById('payment').value;

        // Calculate Grand Total & Prepare Items for History
        let grandTotal = 0;
        const orderItems = [];

        cart.forEach(item => {
            const subtotal = item.price * item.qty;
            grandTotal += subtotal;

            let bonusQty = 0;
            if (item.qty >= 10) {
                bonusQty = Math.floor(item.qty / 10);
            }

            orderItems.push({
                id: item.id,
                name: item.name,
                qty: item.qty,
                price: item.price,
                bonusQty: bonusQty
            });
        });

        // Save to History (localStorage)
        const newOrder = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            customerName: name,
            customerAddress: address,
            customerPhone: phone,
            paymentMethod: payment,
            items: orderItems,
            grandTotal: grandTotal
        };

        const existingHistory = JSON.parse(localStorage.getItem('balebibit_orders')) || [];
        existingHistory.push(newOrder);
        localStorage.setItem('balebibit_orders', JSON.stringify(existingHistory));

        // Refresh History UI
        loadHistory();


        // Construct Message
        let message = `Halo BaleBibit, saya mau pesan bibit pepaya.%0A%0A`;
        message += `*Data Pemesan:*%0A`;
        message += `Nama: ${name}%0A`;
        message += `Alamat: ${address}%0A`;
        message += `No. HP: ${phone}%0A%0A`;

        message += `*Detail Pesanan:*%0A`;

        cart.forEach(item => {
            const subtotal = item.price * item.qty;
            message += `- ${item.name} (${item.qty} pohon): Rp ${subtotal.toLocaleString()}%0A`;

            if (item.qty >= 10) {
                const bonusQty = Math.floor(item.qty / 10);
                message += `  _(Bonus: ${bonusQty} Pohon Gratis)_%0A`;
            }
        });

        message += `%0ATotal Tagihan: *Rp ${grandTotal.toLocaleString()}*%0A`;
        message += `Pembayaran: ${payment}%0A`;
        message += `Tolong disiapkan ya!`;

        // Open WhatsApp
        const waLink = `https://wa.me/6285955347125?text=${message}`;
        window.open(waLink, '_blank');

        // Reset form and cart after successful order
        orderForm.reset();
        cart = [];
        updateCartUI();
    });

    // Cart Icon Scroll to Order
    document.getElementById('cartBtn').addEventListener('click', () => {
        document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
    });

    /* --- History Logic START --- */
    const historyModal = document.getElementById('historyModal');
    const historyWrapper = document.getElementById('historyWrapper');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const historyBtn = document.getElementById('historyBtn');
    const closeModal = document.querySelector('.close-modal');

    // Function to load and display history
    function loadHistory() {
        const historyData = JSON.parse(localStorage.getItem('balebibit_orders')) || [];

        historyWrapper.innerHTML = '';

        if (historyData.length > 0) {
            // Sort by latest first
            historyData.reverse().forEach((order, index) => {
                const dateObj = new Date(order.timestamp);

                // Format Date: "Senin, 28 Desember 2025"
                const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const dateString = dateObj.toLocaleDateString('id-ID', dateOptions);
                const timeString = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                const card = document.createElement('div');
                card.className = 'history-card';

                let productsHtml = '';
                order.items.forEach(item => {
                    productsHtml += `<li>
                        <span>${item.name} x${item.qty}</span>
                        <span>Rp ${(item.price * item.qty).toLocaleString()}</span>
                    </li>`;
                    if (item.bonusQty) {
                        productsHtml += `<li style="color: var(--primary); font-size: 0.85rem; font-style: italic;">
                            <span>+ Bonus: ${item.bonusQty} pohon</span>
                            <span>Gratis</span>
                        </li>`;
                    }
                });

                card.innerHTML = `
                    <div class="history-header">
                        <div class="history-date">
                            <i class="far fa-clock"></i> ${dateString} - Pukul ${timeString}
                        </div>
                        <div class="history-actions" style="display: flex; align-items: center; gap: 10px;">
                            <div class="history-total">
                                Total: Rp ${order.grandTotal.toLocaleString()}
                            </div>
                            <button class="delete-history-item btn-sm" data-id="${order.id}" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 1.1rem;" title="Hapus pesanan ini">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="history-details">
                        <div class="buyer-info">
                            <p><strong>Nama:</strong> ${order.customerName}</p>
                            <p><strong>No. HP:</strong> ${order.customerPhone}</p>
                            <p><strong>Metode Bayar:</strong> ${order.paymentMethod}</p>
                        </div>
                        <div class="address-info">
                            <p><strong>Alamat:</strong></p>
                            <p>${order.customerAddress}</p>
                        </div>
                        <div class="history-products">
                            <h5>Detail Produk:</h5>
                            <ul>
                                ${productsHtml}
                            </ul>
                        </div>
                    </div>
                `;

                historyWrapper.appendChild(card);
            });

            // Add Event Listeners for Individual Delete Buttons
            document.querySelectorAll('.delete-history-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.getAttribute('data-id'));
                    if (confirm("Hapus histori pesanan ini?")) {
                        const currentHistory = JSON.parse(localStorage.getItem('balebibit_orders')) || [];
                        const updatedHistory = currentHistory.filter(item => item.id !== id);
                        localStorage.setItem('balebibit_orders', JSON.stringify(updatedHistory));
                        loadHistory(); // Reload UI
                    }
                });
            });

        } else {
            historyWrapper.innerHTML = '<div class="text-center p-4 text-muted">Belum ada riwayat pesanan.</div>';
        }
    }

    // Modal Logic
    historyBtn.addEventListener('click', () => {
        loadHistory();
        historyModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });

    closeModal.addEventListener('click', () => {
        historyModal.classList.remove('show');
        document.body.style.overflow = '';
    });

    // Close when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });

    // Clear History Event
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm("Apakah Anda yakin ingin menghapus semua riwayat pesanan?")) {
            localStorage.removeItem('balebibit_orders');
            loadHistory();
            alert("Riwayat pesanan berhasil dihapus.");
        }
    });

    /* --- Review System Logic START --- */
    const reviewsModal = document.getElementById('reviewsModal');
    const openReviewsModalBtn = document.getElementById('openReviewsModalBtn');
    const closeReviewsModalBtn = document.querySelector('.close-reviews-modal');

    // Open Modal
    openReviewsModalBtn.addEventListener('click', () => {
        reviewsModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    });

    // Close Modal
    closeReviewsModalBtn.addEventListener('click', () => {
        reviewsModal.classList.remove('show');
        document.body.style.overflow = '';
    });

    // Close when clicking outside (Shared logic, but specific to this modal if needed, or rely on global listener if modified)
    window.addEventListener('click', (e) => {
        if (e.target === reviewsModal) {
            reviewsModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });

    const reviewFormContainer = document.getElementById('reviewFormContainer');
    const toggleReviewFormBtn = document.getElementById('toggleReviewFormBtn');
    const reviewForm = document.getElementById('reviewForm');
    const reviewsGrid = document.getElementById('reviewsGrid');
    const reviewPhotoInput = document.getElementById('reviewPhoto');
    const photoPreview = document.getElementById('photoPreview');

    // Toggle Form
    toggleReviewFormBtn.addEventListener('click', () => {
        if (reviewFormContainer.style.display === 'none') {
            reviewFormContainer.style.display = 'block';
            toggleReviewFormBtn.innerHTML = '<i class="fas fa-times"></i> Tutup Formulir';
            reviewFormContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
            reviewFormContainer.style.display = 'none';
            toggleReviewFormBtn.innerHTML = '<i class="fas fa-star"></i> Tulis Ulasan';
        }
    });

    // Image Preview (Small)
    reviewPhotoInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview Foto" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">`;
            }
            reader.readAsDataURL(file);
        } else {
            photoPreview.innerHTML = '';
        }
    });

    // Default Reviews (Hardcoded)
    const defaultReviews = [
        {
            id: 'def1',
            name: 'Budi Purnama',
            role: 'Petani Pepaya',
            rating: 5,
            comment: 'Bibit dari BaleBibit luar biasa. 8 bulan sudah panen, buahnya besar-besar dan manis. Pelayanan juga ramah.',
            img: 'https://placehold.co/60x60/333/fff?text=BP',
            photo: null,
            date: '2024-11-15'
        },
        {
            id: 'def2',
            name: 'Siti Komariah',
            role: 'Ibu Rumah Tangga',
            rating: 5,
            comment: 'Saya ambil paket reguler, terima beres. Proses penanamannya rapi. Alhamdulillah tumbuh sehat sehat bibitnya.',
            img: 'https://placehold.co/60x60/333/fff?text=SK',
            photo: null,
            date: '2024-12-01'
        }
    ];

    // Load Reviews
    function loadReviews() {
        const localReviews = JSON.parse(localStorage.getItem('balebibit_reviews')) || [];
        const allReviews = [...localReviews, ...defaultReviews];

        reviewsGrid.innerHTML = '';

        if (allReviews.length === 0) {
            reviewsGrid.innerHTML = '<p class="text-center" style="grid-column: 1/-1; color: #555;">Belum ada ulasan.</p>';
            return;
        }

        allReviews.forEach(review => {
            const starsHtml = Array(5).fill(0).map((_, i) =>
                `<i class="fas fa-star" style="color: ${i < review.rating ? '#F39C12' : '#ccc'}"></i>`
            ).join('');

            // const dateStr = review.date ? new Date(review.date).toLocaleDateString('id-ID') : '';

            const photoHtml = review.photo ? `<img src="${review.photo}" class="review-photo" loading="lazy" onclick="window.open(this.src)" title="Klik untuk memperbesar">` : '';

            const card = document.createElement('div');
            card.className = 'review-card';
            card.style.background = '#fff'; // Modal bg
            card.style.border = '1px solid #eee';

            card.innerHTML = `
                <div class="review-header">
                    <div class="reviewer-profile">
                        <img src="${review.img || 'https://placehold.co/60x60/eee/333?text=' + review.name.charAt(0)}" class="reviewer-img" alt="${review.name}">
                        <div class="reviewer-info">
                            <h4 style="color: var(--dark);">${review.name}</h4>
                            <span style="color: var(--gray);">${review.role || 'Pelanggan'}</span>
                        </div>
                    </div>
                    <div class="review-stars">
                        ${starsHtml}
                    </div>
                </div>
                <div class="review-body">
                    <p style="color: var(--dark); margin: 0;">"${review.comment}"</p>
                    ${photoHtml}
                </div>
            `;
            reviewsGrid.appendChild(card);
        });
    }

    // Submit Review
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('reviewName').value;
        const comment = document.getElementById('reviewComment').value;
        const rating = document.querySelector('input[name="rating"]:checked')?.value;
        const file = reviewPhotoInput.files[0];

        if (!rating) {
            alert("Mohon pilih rating bintang.");
            return;
        }

        const processReview = (photoDataUrl = null) => {
            const newReview = {
                id: Date.now(),
                name: name,
                role: 'Pembeli Terverifikasi',
                rating: parseInt(rating),
                comment: comment,
                img: null, // Default placeholder will be used
                photo: photoDataUrl,
                date: new Date().toISOString()
            };

            const existingReviews = JSON.parse(localStorage.getItem('balebibit_reviews')) || [];
            existingReviews.unshift(newReview); // Add to top
            localStorage.setItem('balebibit_reviews', JSON.stringify(existingReviews));

            alert("Terima kasih! Ulasan Anda telah berhasil dikirim.");
            reviewForm.reset();
            photoPreview.innerHTML = '';
            reviewFormContainer.style.display = 'none';
            toggleReviewFormBtn.innerHTML = '<i class="fas fa-star"></i> Tulis Ulasan';

            loadReviews();
        };

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                // Resize Image logic could be here, but for now we just save 1:1 base64. 
                // The display logic handles the size (80px).
                processReview(e.target.result);
            }
            reader.readAsDataURL(file);
        } else {
            processReview(null);
        }
    });

    // Initialize Reviews
    loadReviews();

    /* --- Review System Logic END --- */

    /* --- History Logic END --- */

});
