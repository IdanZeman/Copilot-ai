// Global variables
let currentStep = 1;
const totalSteps = 5; // Total number of steps in the form
let selectedDesign = null;
let formData = {};

// Navigation functionality
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// Utility functions
function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (!progressBar || !progressText) return;

    const progress = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `שלב ${currentStep} מתוך ${totalSteps}`;
}

function showStep(step) {
    // Only proceed if we're on a page with form steps
    const formSteps = document.querySelectorAll('.form-step');
    if (formSteps.length === 0) return;

    // Hide all steps
    formSteps.forEach(el => el.style.display = 'none');
    
    // Show the current step
    const currentStep = document.querySelector(`.form-step[data-step="${step}"]`);
    if (currentStep) {
        currentStep.style.display = 'block';
        
        // Update progress bar
        updateProgressBar();
        
        // Update buttons visibility
        updateNavigationButtons();
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    if (prevBtn && nextBtn && submitBtn) {
        // Previous button visibility
        prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
        
        // Next button visibility
        nextBtn.style.display = currentStep === totalSteps ? 'none' : 'block';
        
        // Submit button visibility
        submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
    }
}

function validateCurrentStep() {
    // Add validation logic for each step
    switch(currentStep) {
        case 1:
            return validateDesignSelection();
        case 2:
            return validateSizeSelection();
        case 3:
            return validateColorSelection();
        case 4:
            return validateQuantity();
        case 5:
            return validateContactInfo();
        default:
            return true;
    }
}

// Navigation event handlers
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
            window.scrollTo(0, 0);
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        window.scrollTo(0, 0);
    }
}

// Validation functions
function validateDesignSelection() {
    const designMethod = document.querySelector('input[name="design-method"]:checked');
    if (!designMethod) {
        alert('אנא בחר שיטת עיצוב');
        return false;
    }
    
    if (designMethod.value === 'ai') {
        const prompt = document.getElementById('design-prompt').value.trim();
        if (!prompt) {
            alert('אנא הכנס תיאור לעיצוב המבוקש');
            return false;
        }
    } else if (designMethod.value === 'upload') {
        const fileInput = document.getElementById('design-upload');
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('אנא העלה קובץ עיצוב');
            return false;
        }
    } else if (designMethod.value === 'gallery') {
        if (!selectedDesign) {
            alert('אנא בחר עיצוב מהגלריה');
            return false;
        }
    }
    
    return true;
}

function validateSizeSelection() {
    const size = document.querySelector('input[name="size"]:checked');
    if (!size) {
        alert('אנא בחר מידה');
        return false;
    }
    formData.size = size.value;
    return true;
}

function validateColorSelection() {
    const color = document.querySelector('input[name="color"]:checked');
    if (!color) {
        alert('אנא בחר צבע');
        return false;
    }
    formData.color = color.value;
    return true;
}

function validateQuantity() {
    const quantity = document.getElementById('quantity').value;
    if (!quantity || quantity < 1) {
        alert('אנא הכנס כמות תקינה');
        return false;
    }
    formData.quantity = quantity;
    return true;
}

function validateContactInfo() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    
    if (!name || !email || !phone || !address) {
        alert('אנא מלא את כל פרטי הקשר');
        return false;
    }
    
    if (!validateEmail(email)) {
        alert('אנא הכנס כתובת אימייל תקינה');
        return false;
    }
    
    if (!validatePhone(phone)) {
        alert('אנא הכנס מספר טלפון תקין');
        return false;
    }
    
    formData.contactInfo = { name, email, phone, address };
    return true;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9]{9,10}$/;
    return re.test(phone);
}

// Design method selection
function showDesignMethod(method) {
    // Hide all method contents
    document.querySelectorAll('.method-content').forEach(el => el.style.display = 'none');
    
    // Show selected method content
    const selectedContent = document.querySelector(`.${method}-method-content`);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
}

// File upload handling
function handleFileUpload(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('designImage').src = e.target.result;
            document.getElementById('uploadedFileName').textContent = file.name;
            document.querySelector('.uploaded-image-preview').style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }
}

function removeUploadedFile() {
    document.getElementById('design-upload').value = '';
    document.getElementById('designImage').src = '/images/default-tshirt.png';
    document.querySelector('.uploaded-image-preview').style.display = 'none';
}

// Size chart functionality
function toggleSizeChart() {
    const sizeChart = document.getElementById('size-chart');
    const overlay = document.getElementById('overlay');
    sizeChart.style.display = sizeChart.style.display === 'none' ? 'block' : 'none';
    overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
}

// Gallery selection
function selectDesign(designId) {
    selectedDesign = designId;
    document.querySelectorAll('.design-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`#design-${designId}`).classList.add('selected');
}

// AI design generation
async function generateDesign() {
    const prompt = document.getElementById('design-prompt').value.trim();
    if (!prompt) {
        alert('אנא הכנס תיאור לעיצוב המבוקש');
        return;
    }
    
    try {
        document.querySelector('.loading-designs').style.display = 'block';
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show generated designs
        document.getElementById('generated-designs').style.display = 'grid';
        document.querySelector('.loading-designs').style.display = 'none';
    } catch (error) {
        console.error('Error generating designs:', error);
        alert('אירעה שגיאה בעת יצירת העיצובים. אנא נסה שוב מאוחר יותר.');
    }
}

// Character counter
function updateCharCount(textarea) {
    const maxLength = parseInt(textarea.getAttribute('maxlength'));
    const currentLength = textarea.value.length;
    const counter = document.querySelector('.char-counter');
    counter.textContent = `${currentLength}/${maxLength}`;
}

// Form submission
async function submitForm() {
    if (validateCurrentStep()) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Redirect to success page or show success message
            alert('ההזמנה התקבלה בהצלחה!');
            window.location.href = 'my-orders.html';
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('אירעה שגיאה בשליחת הטופס. אנא נסה שוב מאוחר יותר.');
        }
    }
}

// Initialize form
function initForm() {
    setupNavigation();
    showStep(1);
    
    // Setup event listeners
    document.querySelectorAll('input[name="design-method"]').forEach(input => {
        input.addEventListener('change', (e) => showDesignMethod(e.target.value));
    });
    
    const designPrompt = document.getElementById('design-prompt');
    if (designPrompt) {
        designPrompt.addEventListener('input', () => updateCharCount(designPrompt));
    }
    
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseover', (e) => {
            const tooltipText = e.target.getAttribute('data-tooltip');
            // Add tooltip element
        });
    });
}

// Call initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initForm);
