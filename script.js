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
            console.warn('Make sure Realtime Database is enabled in Firebase Console');
            console.warn('Go to: Firebase Console > Build > Realtime Database > Create Database');
            // Fallback to localStorage if Firebase fails
            currentDonated = loadSavedDonations();
            updateProgressBar();
        });
        
        firebaseInitialized = true;
        console.log('Firebase Realtime Database connected successfully');
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
        
        // Add individual donation record with all details
        const donationsRef = ref(database, 'donations/list');
        const newDonationRef = push(donationsRef);
        const donationRecord = {
            amount: amount,
            name: name,
            email: email,
            timestamp: Date.now(),
            date: new Date().toISOString()
        };
        
        console.log('💾 Saving donation to Firebase:', donationRecord);
        await set(newDonationRef, donationRecord);
        console.log('✅ Donation record saved:', newDonationRef.key);
        
        // Update total (Firebase will handle the increment atomically)
        const totalRef = ref(database, 'donations/total');
        const currentTotal = currentDonated || 0;
        const newTotal = currentTotal + amount;
        await set(totalRef, newTotal);
        console.log('✅ Total updated:', currentTotal, '→', newTotal);
        
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

// Send email via EmailJS (immediately)
function sendDonationEmail(amount, name, email) {
    const emailData = {
        amount: amount,
        name: name,
        email: email,
        timestamp: Date.now()
    };
    
    // Send email immediately
    console.log('📧 Sending email immediately...');
    sendEmailJS(emailData);
}

// Actually send the email via EmailJS (returns a promise)
function sendEmailJS(emailData) {
    return new Promise((resolve, reject) => {
        // Check if EmailJS is available
        if (typeof emailjs === 'undefined') {
            console.error('❌ EmailJS not loaded - make sure EmailJS SDK is included');
            reject(new Error('EmailJS not loaded'));
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
        
        console.log('📧 EmailJS sending with params:', templateParams);
        console.log('📧 Using service: service_qadjtm9, template: template_9qfqqyq');
        
        // Send email via EmailJS
        emailjs.send('service_qadjtm9', 'template_9qfqqyq', templateParams)
            .then(function(response) {
                console.log('✅ Email sent successfully!', response);
                console.log('Response status:', response.status);
                console.log('Response text:', response.text);
                resolve(response);
            }, function(error) {
                console.error('❌ Failed to send email:', error);
                console.error('Error details:', {
                    status: error.status,
                    text: error.text,
                    message: error.message
                });
                reject(error);
            });
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
    event.stopPropagation();
    
    console.log('=== Form Submitted ===');
    
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    // Validate form data
    if (!amount || amount <= 0 || !name || !email) {
        alert('Please fill in all fields correctly.');
        return false;
    }
    
    console.log('Form data valid:', { amount, name, email });
    
    // Save donation to Firebase (with timeout to prevent hanging)
    const savePromise = new Promise(async (resolve) => {
        try {
            if (firebaseInitialized && window.firebaseDatabase) {
                console.log('Saving to Firebase...');
                try {
                    const saved = await saveDonationToFirebase(amount, name, email);
                    if (saved) {
                        console.log('✅ Successfully saved to Firebase');
                        // Update local total
                        currentDonated += amount;
                    } else {
                        console.log('⚠️ Firebase save returned false, using localStorage');
                        currentDonated += amount;
                        localStorage.setItem('totalDonated', currentDonated.toString());
                    }
                } catch (firebaseError) {
                    console.error('❌ Firebase save error:', firebaseError);
                    // Fallback to localStorage
                    currentDonated += amount;
                    localStorage.setItem('totalDonated', currentDonated.toString());
                }
            } else {
                console.log('⚠️ Firebase not initialized, using localStorage');
                currentDonated += amount;
                localStorage.setItem('totalDonated', currentDonated.toString());
            }
        } catch (error) {
            console.error('❌ Error in save promise:', error);
            // Fallback to localStorage
            currentDonated += amount;
            localStorage.setItem('totalDonated', currentDonated.toString());
        }
        resolve();
    });
    
    // Wait for Firebase save (max 2 seconds timeout)
    try {
        await Promise.race([
            savePromise,
            new Promise(resolve => setTimeout(resolve, 2000)) // 2 second timeout
        ]);
        console.log('Save completed');
    } catch (error) {
        console.error('Save timeout or error:', error);
    }
    
    // Send email immediately (with timeout to prevent hanging)
    try {
        console.log('📧 Sending email immediately...');
        const emailData = {
            amount: amount,
            name: name,
            email: email,
            timestamp: Date.now()
        };
        
        // Wait for email to send (max 3 seconds timeout)
        await Promise.race([
            sendEmailJS(emailData),
            new Promise(resolve => setTimeout(() => {
                console.log('⚠️ Email send timeout, continuing...');
                resolve();
            }, 3000)) // 3 second timeout
        ]);
        console.log('✅ Email sent');
    } catch (error) {
        console.error('❌ Error sending email:', error);
        // Continue even if email fails
    }
    
    // Redirect to Greenlight payment page
    console.log('Redirecting to Greenlight...');
    window.location.href = 'https://gl.me/u/rMzMm2QtQTML';
    
    return false; // Prevent default form submission
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
    const remainingAmount = document.getElementById('remainingAmount');
    
    // Only show the actual current total (no preview)
    const totalAmount = currentDonated;
    
    // Calculate percentage (cap at 100%)
    const percentage = Math.min((totalAmount / GOAL_AMOUNT) * 100, 100);
    
    // Calculate remaining amount
    const remaining = Math.max(0, GOAL_AMOUNT - totalAmount);
    
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
    
    if (progressAmount) {
        progressAmount.textContent = '$' + currentDonated.toLocaleString();
    }
    
    if (remainingAmount) {
        remainingAmount.textContent = '$' + remaining.toLocaleString();
    }
}

// Create continuous snowfall
function createSnowflake() {
    const snowContainer = document.getElementById('snowContainer');
    if (!snowContainer) return;
    
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.textContent = '❄';
    
    // Random horizontal position
    const leftPosition = Math.random() * 100;
    snowflake.style.left = leftPosition + '%';
    
    // Random animation duration (8-15 seconds for variety)
    const duration = 8 + Math.random() * 7;
    snowflake.style.animationDuration = duration + 's';
    
    // Random size for variety
    const size = 0.8 + Math.random() * 0.6;
    snowflake.style.fontSize = size + 'em';
    
    // Random opacity
    const opacity = 0.6 + Math.random() * 0.4;
    snowflake.style.opacity = opacity;
    
    // Start from random position above viewport
    snowflake.style.transform = `translateY(-${Math.random() * 100}px)`;
    
    snowContainer.appendChild(snowflake);
    
    // Remove snowflake after animation completes
    setTimeout(() => {
        if (snowflake.parentNode) {
            snowflake.remove();
        }
    }, duration * 1000);
}

// Start continuous snowfall
function startSnowfall() {
    // Create initial snowflakes
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            createSnowflake();
        }, i * 200); // Stagger initial creation
    }
    
    // Continuously create new snowflakes
    setInterval(() => {
        createSnowflake();
    }, 300); // Create a new snowflake every 300ms
}

// Initialize animations on page load
window.addEventListener('load', () => {
    // Start continuous snowfall
    startSnowfall();
    
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

