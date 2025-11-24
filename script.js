// Progress bar goal amount
const GOAL_AMOUNT = 2399;

let currentDonated = 0;
let firebaseInitialized = false;

// Initialize Firebase connection and set up real-time listener
function initializeFirebase() {
    // Wait for Firebase to be available
    if (window.firebaseDatabase && window.firebaseRef && window.firebaseOnValue) {
        const database = window.firebaseDatabase;
        const ref = window.firebaseRef;
        const onValue = window.firebaseOnValue;
        
        // Reference to the total donations in Firebase
        const totalRef = ref(database, 'donations/total');
        
        // Listen for real-time updates
        onValue(totalRef, (snapshot) => {
            const data = snapshot.val();
            currentDonated = data ? parseFloat(data) : 0;
            updateProgressBar();
            console.log('Total donations updated:', currentDonated);
        }, (error) => {
            console.error('Error reading from Firebase:', error);
            // Fallback to localStorage if Firebase fails
            currentDonated = loadSavedDonations();
            updateProgressBar();
        });
        
        firebaseInitialized = true;
    } else {
        // Retry after a short delay if Firebase isn't ready yet
        setTimeout(initializeFirebase, 100);
    }
}

// Fallback: Load saved donations from localStorage (if Firebase isn't available)
function loadSavedDonations() {
    const saved = localStorage.getItem('totalDonated');
    return saved ? parseFloat(saved) : 0;
}

// Save donation to Firebase
async function saveDonationToFirebase(amount, name, email) {
    if (!window.firebaseDatabase || !window.firebaseRef || !window.firebaseSet || !window.firebasePush) {
        console.error('Firebase not initialized');
        return false;
    }
    
    try {
        const database = window.firebaseDatabase;
        const ref = window.firebaseRef;
        const set = window.firebaseSet;
        const push = window.firebasePush;
        
        // Add individual donation record
        const donationsRef = ref(database, 'donations/list');
        const newDonationRef = push(donationsRef);
        await set(newDonationRef, {
            amount: amount,
            name: name,
            email: email,
            timestamp: Date.now()
        });
        
        // Update total (Firebase will handle the increment atomically)
        const totalRef = ref(database, 'donations/total');
        const currentTotal = currentDonated || 0;
        await set(totalRef, currentTotal + amount);
        
        return true;
    } catch (error) {
        console.error('Error saving to Firebase:', error);
        // Fallback to localStorage
        const newTotal = currentDonated + amount;
        localStorage.setItem('totalDonated', newTotal.toString());
        return false;
    }
}

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

// Send email via EmailJS (with 5 minute delay)
function sendDonationEmail(amount, name, email) {
    // Store email data in sessionStorage so it persists even if they navigate away
    const emailData = {
        amount: amount,
        name: name,
        email: email,
        timestamp: Date.now(),
        sendTime: Date.now() + (5 * 60 * 1000) // 5 minutes from now
    };
    
    sessionStorage.setItem('pendingEmail', JSON.stringify(emailData));
    
    // Schedule email to send in 5 minutes
    setTimeout(() => {
        sendEmailJS(emailData);
    }, 5 * 60 * 1000); // 5 minutes = 300,000 milliseconds
}

// Actually send the email via EmailJS
function sendEmailJS(emailData) {
    // Check if EmailJS is available
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS not loaded');
        return;
    }
    
    // EmailJS template parameters
    const templateParams = {
        to_name: emailData.name,
        to_email: emailData.email,
        donation_amount: emailData.amount.toFixed(2),
        total_raised: (currentDonated + emailData.amount).toLocaleString(),
        goal_amount: GOAL_AMOUNT.toLocaleString(),
        message: `Thank you ${emailData.name} for your generous donation of $${emailData.amount.toFixed(2)}!`
    };
    
    // Send email via EmailJS
    emailjs.send('service_qadjtm9', 'template_9qfqqyq', templateParams)
        .then(function(response) {
            console.log('Email sent successfully!', response.status, response.text);
            // Remove from sessionStorage after successful send
            sessionStorage.removeItem('pendingEmail');
        }, function(error) {
            console.error('Failed to send email:', error);
        });
}

// Check for pending emails on page load (in case they come back)
function checkPendingEmails() {
    const pendingEmail = sessionStorage.getItem('pendingEmail');
    if (pendingEmail) {
        const emailData = JSON.parse(pendingEmail);
        const now = Date.now();
        const timeRemaining = emailData.sendTime - now;
        
        if (timeRemaining <= 0) {
            // Time has passed, send immediately
            sendEmailJS(emailData);
        } else {
            // Schedule for remaining time
            setTimeout(() => {
                sendEmailJS(emailData);
            }, timeRemaining);
        }
    }
}

// Handle Donation Form Submission
async function handleDonation(event) {
    event.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    // Save donation to Firebase (or localStorage as fallback)
    if (firebaseInitialized) {
        await saveDonationToFirebase(amount, name, email);
    } else {
        // Fallback to localStorage
        currentDonated += amount;
        localStorage.setItem('totalDonated', currentDonated.toString());
    }
    
    // Schedule email to be sent in 5 minutes
    sendDonationEmail(amount, name, email);
    
    // Store form data (optional - for future use)
    const donationData = {
        amount: amount,
        name: name,
        email: email,
        totalDonated: currentDonated + amount
    };
    
    // Log donation data
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
    // Don't update progress bar - only update after form submission
}

function decreaseAmount() {
    const amountInput = document.getElementById('amount');
    const currentValue = parseInt(amountInput.value) || 1;
    if (currentValue > 1) {
        amountInput.value = currentValue - 1;
        // Don't update progress bar - only update after form submission
    }
}

// Update progress bar based on actual saved donations only
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    const progressAmount = document.getElementById('currentProgress');
    
    // Only show the actual current total (no preview)
    const totalAmount = currentDonated;
    
    // Calculate percentage (cap at 100%)
    const percentage = Math.min((totalAmount / GOAL_AMOUNT) * 100, 100);
    
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
    
    if (progressAmount) {
        progressAmount.textContent = '$' + currentDonated.toLocaleString();
    }
}

// Initialize animations on page load
window.addEventListener('load', () => {
    // Initialize Firebase connection
    initializeFirebase();
    
    // Fallback: Load saved donations from localStorage if Firebase isn't ready
    if (!firebaseInitialized) {
        currentDonated = loadSavedDonations();
    }
    
    // Check for pending emails that need to be sent
    checkPendingEmails();
    
    // Ensure animations start
    const risingText = document.querySelector('.rising-text');
    if (risingText) {
        risingText.style.animation = 'textRise 2s ease-out forwards';
    }
    
    const heroImage = document.querySelector('.hero-image-container');
    if (heroImage) {
        heroImage.style.animation = 'imageFadeIn 2s ease-out 1.5s forwards';
    }
    
    // Initialize progress bar
    updateProgressBar();
});

