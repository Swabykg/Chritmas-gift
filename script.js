// Progress bar goal amount
const GOAL_AMOUNT = 2399;

// Load saved donations from localStorage (or initialize to 0)
function loadSavedDonations() {
    const saved = localStorage.getItem('totalDonated');
    return saved ? parseFloat(saved) : 0;
}

// Save total donations to localStorage
function saveTotalDonations(amount) {
    localStorage.setItem('totalDonated', amount.toString());
}

let currentDonated = loadSavedDonations();

// Donation Modal Functions
function openDonateModal() {
    const modal = document.getElementById('donateModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    // Reset amount to 1 when opening modal
    document.getElementById('amount').value = 1;
    updateProgressBar();
}

function closeDonateModal() {
    const modal = document.getElementById('donateModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('donateModal');
    if (event.target === modal) {
        closeDonateModal();
    }
}

// Handle Donation Form Submission
function handleDonation(event) {
    event.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    // Add this donation to the total and save it
    currentDonated += amount;
    saveTotalDonations(currentDonated);
    
    // Store form data (optional - for future use)
    const donationData = {
        amount: amount,
        name: name,
        email: email,
        totalDonated: currentDonated
    };
    
    // Log donation data (you can remove this or send to a server)
    console.log('Donation Data:', donationData);
    
    // Update progress bar before redirecting
    updateProgressBar();
    
    // Redirect to Greenlight payment page
    window.location.href = 'https://gl.me/u/rMzMm2QtQTML';
}

// Smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add parallax effect to trees on scroll
window.addEventListener('scroll', () => {
    const trees = document.querySelectorAll('.tree');
    const scrolled = window.pageYOffset;
    
    trees.forEach((tree, index) => {
        const speed = 0.5 + (index * 0.1);
        tree.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Amount increase/decrease functions
function increaseAmount() {
    const amountInput = document.getElementById('amount');
    const currentValue = parseInt(amountInput.value) || 1;
    amountInput.value = currentValue + 1;
    updateProgressBar();
}

function decreaseAmount() {
    const amountInput = document.getElementById('amount');
    const currentValue = parseInt(amountInput.value) || 1;
    if (currentValue > 1) {
        amountInput.value = currentValue - 1;
        updateProgressBar();
    }
}

// Update progress bar based on donation amount
function updateProgressBar() {
    const amountInput = document.getElementById('amount');
    const donationAmount = parseFloat(amountInput ? amountInput.value : 0) || 0;
    
    // Show current total + potential new donation
    const totalAmount = currentDonated + donationAmount;
    
    const progressBar = document.getElementById('progressBar');
    const progressAmount = document.getElementById('currentProgress');
    
    // Calculate percentage (cap at 100%)
    const percentage = Math.min((totalAmount / GOAL_AMOUNT) * 100, 100);
    
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
    
    if (progressAmount) {
        // Show current total, and if there's a donation amount entered, show it as "current + new"
        if (donationAmount > 0 && amountInput) {
            progressAmount.textContent = `$${currentDonated.toLocaleString()} (+$${donationAmount.toLocaleString()})`;
        } else {
            progressAmount.textContent = '$' + currentDonated.toLocaleString();
        }
    }
}

// Initialize animations on page load
window.addEventListener('load', () => {
    // Load saved donations
    currentDonated = loadSavedDonations();
    
    // Ensure animations start
    const risingText = document.querySelector('.rising-text');
    if (risingText) {
        risingText.style.animation = 'textRise 2s ease-out forwards';
    }
    
    const heroImage = document.querySelector('.hero-image-container');
    if (heroImage) {
        heroImage.style.animation = 'imageFadeIn 2s ease-out 1.5s forwards';
    }
    
    // Initialize progress bar with saved total
    updateProgressBar();
});

