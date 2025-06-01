document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1000,
        easing: 'ease-out-cubic',
        offset: 80,
        mirror: true,
        anchorPlacement: 'top-bottom',
    });

    const RAZORPAY_KEY_ID = "rzp_test_6scZJgdRJOWfry"; // Your test key

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
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
            mobileMenu.classList.toggle('hidden');
            mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.setAttribute('aria-hidden', isExpanded);
            mobileMenuButton.querySelector('svg').classList.toggle('rotate-90', !isExpanded);
        });
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
                mobileMenuButton.querySelector('svg').classList.remove('rotate-90');
            });
        });
    }

    const packageCards = document.querySelectorAll('.package-card');
    const amountButtons = document.querySelectorAll('.amount-button');
    const customAmountInputDiv = document.getElementById('custom-amount-input');
    const customAmountInput = document.getElementById('custom_amount');
    const selectedAmountInput = document.getElementById('selected_amount');
    const customSelectButton = document.querySelector('.custom-select-button');
    const paymentModal = document.getElementById('paymentModal');
    const closeModalButton = document.getElementById('closeModalButton');
    const modalAmountDisplay = document.getElementById('modalAmountDisplay');
    const paymentCompleteButton = document.getElementById('paymentCompleteButton');
    const selectedAmountBox = document.getElementById('selected-amount-box');
    const selectedAmountDisplay = document.getElementById('selected-amount-display');

    function deselectAllAmounts() {
        amountButtons.forEach(btn => btn.classList.remove('selected'));
        packageCards.forEach(card => card.classList.remove('selected'));
        if (customAmountInputDiv) customAmountInputDiv.classList.add('hidden');
        if (customAmountInput) {
            customAmountInput.removeAttribute('required');
            customAmountInput.value = '';
        }
        if (selectedAmountInput) selectedAmountInput.value = '';
        if (selectedAmountBox) {
            selectedAmountBox.classList.remove('visible');
            if (selectedAmountDisplay) selectedAmountDisplay.textContent = '₹0';
        }
    }

    function scrollToDonateForm() {
        const donateFormElement = document.getElementById('selected-amount-box');
        if (donateFormElement) {
            const headerOffset = header ? header.offsetHeight : 0;
            const elementPosition = donateFormElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerOffset - 20;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    function updateSelectedAmountDisplay(amount) {
        if (selectedAmountBox && selectedAmountDisplay) {
            selectedAmountDisplay.textContent = `₹${amount || 0}`;
            selectedAmountBox.classList.add('visible');
        }
    }

    packageCards.forEach(card => {
        card.addEventListener('click', () => {
            deselectAllAmounts();
            card.classList.add('selected');
            const amount = card.getAttribute('data-amount');
            if (selectedAmountInput) selectedAmountInput.value = amount;
            updateSelectedAmountDisplay(amount);
            scrollToDonateForm();
        });
    });

    amountButtons.forEach(button => {
        button.addEventListener('click', () => {
            deselectAllAmounts();
            button.classList.add('selected');
            const amountType = button.getAttribute('data-amount');
            if (amountType === 'custom') {
                if (customAmountInputDiv) customAmountInputDiv.classList.remove('hidden');
                if (customAmountInput) {
                    customAmountInput.setAttribute('required', 'true');
                    customAmountInput.focus();
                }
            } else {
                if (selectedAmountInput) selectedAmountInput.value = amountType;
                updateSelectedAmountDisplay(amountType);
                scrollToDonateForm();
            }
        });
    });

    if (customAmountInput) {
        customAmountInput.addEventListener('input', () => {
            if (customSelectButton && !customSelectButton.classList.contains('selected')) {
                deselectAllAmounts();
                customSelectButton.classList.add('selected');
                if (customAmountInputDiv) customAmountInputDiv.classList.remove('hidden');
                customAmountInput.setAttribute('required', 'true');
            }
            const amount = customAmountInput.value;
            if (selectedAmountInput) selectedAmountInput.value = amount;
            updateSelectedAmountDisplay(amount);
        });
    }

    const donationForm = document.getElementById('donation-form');
    if (donationForm) {
        donationForm.addEventListener('submit', function (event) {
            event.preventDefault();
            let finalAmount = selectedAmountInput ? selectedAmountInput.value : '';
            const donorNameInput = document.getElementById('donor_name');
            const donorEmailInput = document.getElementById('donor_email');
            const donorPhoneInput = document.getElementById('donor_phone');

            const donorName = donorNameInput ? donorNameInput.value : '';
            const donorEmail = donorEmailInput ? donorEmailInput.value : '';
            const donorPhone = donorPhoneInput ? donorPhoneInput.value : '';

            if (!finalAmount || parseFloat(finalAmount) < 100) {
                showCustomAlert('Please enter or select a valid donation amount (minimum ₹100).', 'error');
                if (parseFloat(finalAmount) < 100 && customAmountInput && customSelectButton.classList.contains('selected')) {
                    customAmountInput.focus();
                }
                return;
            }
            if (!donorName) {
                showCustomAlert('Please enter your name.', 'error');
                if (donorNameInput) donorNameInput.focus();
                return;
            }
            if (!donorEmail || !/^\S+@\S+\.\S+$/.test(donorEmail)) {
                showCustomAlert('Please enter a valid email address.', 'error');
                if (donorEmailInput) donorEmailInput.focus();
                return;
            }

            if (modalAmountDisplay) modalAmountDisplay.textContent = `₹${finalAmount}`;
            if (paymentModal) {
                paymentModal.classList.add('visible');
                paymentModal.dataset.donorName = donorName;
                paymentModal.dataset.donationAmount = finalAmount;
                paymentModal.dataset.donorEmail = donorEmail;
                paymentModal.dataset.donorPhone = donorPhone;
            }
        });
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            if (paymentModal) paymentModal.classList.remove('visible');
        });
    }

    if (paymentModal) {
        paymentModal.addEventListener('click', (event) => {
            if (event.target === paymentModal) {
                paymentModal.classList.remove('visible');
            }
        });
    }

    // UPDATED paymentCompleteButton Event Listener for Backend and MySQL Integration
    if (paymentCompleteButton) {
        paymentCompleteButton.addEventListener('click', async () => {
            if (!paymentModal) return;

            const donorName = paymentModal.dataset.donorName;
            const donationAmount = paymentModal.dataset.donationAmount;
            const donorEmail = paymentModal.dataset.donorEmail;
            const donorPhone = paymentModal.dataset.donorPhone;

            if (!donorName || !donationAmount || parseFloat(donationAmount) < 100) {
                showCustomAlert('Donor details or amount are invalid. Please close this pop-up and correct the form.', 'error', 5000);
                return;
            }

            if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === "YOUR_KEY_ID" || RAZORPAY_KEY_ID.trim() === "") {
                showCustomAlert('Payment gateway is not configured correctly. Please contact support.', 'error', 5000);
                console.error("Razorpay Key ID is not configured.");
                return;
            }

            try {
                // Step 1: Create Razorpay order by calling backend
                const response = await fetch('/api/donations/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: parseFloat(donationAmount),
                        donorName,
                        donorEmail,
                        donorPhone,
                    }),
                });

                const data = await response.json();
                if (!response.ok) {
                    showCustomAlert(data.error || 'Failed to initiate payment.', 'error', 5000);
                    return;
                }

                const { orderId } = data;

                // Step 2: Open Razorpay checkout
                const options = {
                    key: RAZORPAY_KEY_ID,
                    amount: donationAmount * 100, // Amount in paise
                    currency: 'INR',
                    name: 'Sahajshakti Sarvakalyaan Trust',
                    description: 'Donation for NGO Causes',
                    image: 'images/logo.png',
                    order_id: orderId, // Use backend-generated order ID
                    handler: async function (response) {
                        try {
                            // Step 3: Verify payment and save to MySQL
                            const verifyResponse = await fetch('/api/donations/verify-payment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    // CORRECTED: Use the parameter names expected by the backend
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    donorName,
                                    donorEmail,
                                    donorPhone,
                                    amount: donationAmount, // Ensure amount is sent as 'amount'
                                }),
                            });

                            const verifyData = await verifyResponse.json();
                            if (!verifyResponse.ok) {
                                showCustomAlert(verifyData.error || 'Payment verification failed.', 'error', 6000);
                                return;
                            }

                            showCustomAlert('Thank you for your donation! Payment successful. Redirecting to certificate...', 'success', 4000);

                            if (donationForm) donationForm.reset();
                            deselectAllAmounts();
                            if (paymentModal) paymentModal.classList.remove('visible');

                            // Redirect to certificate page
                            setTimeout(() => {
                                window.location.href = `certificate.html?donorName=${encodeURIComponent(donorName)}&donationAmount=${encodeURIComponent(`₹${donationAmount}`)}&paymentId=${response.razorpay_payment_id}`;
                            }, 2500);
                        } catch (error) {
                            console.error('Error verifying payment:', error);
                            showCustomAlert('Failed to verify payment. Please contact support.', 'error', 6000);
                        }
                    },
                    prefill: {
                        name: donorName,
                        email: donorEmail,
                        contact: donorPhone,
                    },
                    notes: {
                        donation_reference_id: 'USER_DONATION_' + Date.now(),
                    },
                    theme: {
                        color: '#FF6F00',
                    },
                    modal: {
                        ondismiss: function () {
                            showCustomAlert('Payment was cancelled or the window was closed. You can try again.', 'info', 4000);
                        },
                    },
                };

                const rzp1 = new Razorpay(options);
                rzp1.on('payment.failed', function (response) {
                    console.error('Razorpay Payment Failed:', response.error);
                    let errorMessage = `Payment failed: ${response.error.description || 'An unknown error occurred'}.`;
                    if (response.error.reason) {
                        errorMessage += ` Reason: ${response.error.reason}.`;
                    }
                    showCustomAlert(errorMessage, 'error', 6000);
                });
                rzp1.open();
            } catch (error) {
                console.error('Error initializing payment:', error);
                showCustomAlert('Could not initiate payment. Please check your internet connection or contact support.', 'error', 5000);
            }
        });
    }
    // END UPDATED paymentCompleteButton

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showCustomAlert('Thank you for subscribing to our newsletter!', 'success');
            newsletterForm.reset();
        });
    }

    const currentYearElements = document.querySelectorAll('#currentYear');
    currentYearElements.forEach(el => {
        if (el) el.textContent = new Date().getFullYear();
    });

    // Image placeholder logic
    document.querySelectorAll('img').forEach(img => {
        if ((img.getAttribute('onerror') && img.getAttribute('onerror').includes("placehold.co")) || img.getAttribute('data-error-handled')) {
            return;
        }

        const originalSrc = img.src;
        const altText = encodeURIComponent(img.alt || "Image");
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        if (width === 0 && img.offsetWidth > 0) width = img.offsetWidth;
        else if (width === 0 && img.width > 0) width = img.width;
        else if (width === 0) width = 300;

        if (height === 0 && img.offsetHeight > 0) height = img.offsetHeight;
        else if (height === 0 && img.height > 0) height = img.height;
        else if (height === 0) height = 200;

        const placeholderSrc = `https://placehold.co/${width}x${height}/E2E8F0/4A5568?text=${altText.replace(/\+/g, '%20')}`;

        img.onerror = function () {
            if (this.src !== placeholderSrc) {
                this.src = placeholderSrc;
                this.alt = `Placeholder: ${img.alt || 'Image'}`;
            }
            this.setAttribute('data-error-handled', 'true');
        };

        if (img.complete && (img.naturalWidth === 0 || !img.src || img.src === window.location.href) && img.src !== placeholderSrc) {
            img.dispatchEvent(new Event('error'));
        } else if (!img.src) {
            img.dispatchEvent(new Event('error'));
        }
    });
});
