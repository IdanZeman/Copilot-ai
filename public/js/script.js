// Import auth-related functionality
import { setupAuthLinks, requireAuthentication, isUserLoggedIn, getCurrentUser } from './auth-ui.js';
import { showWarningNotification, showErrorNotification, showSimpleSuccessNotification, showInfoNotification } from './notifications.js';
import { isDevelopmentMode, generateMockAIResponse, logAPICall, showDevNotification, initDevMode } from './dev-config.js';

// Global variables
let currentStep = 1;
const totalSteps = 5; // Total number of steps in the form
let selectedDesign = null;
let formData = {};

// Load auth modal templates
async function loadAuthModals() {
    try {
        const response = await fetch('../html/auth-modals.html');
        const html = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const templates = tempDiv.querySelectorAll('template');
        const container = document.getElementById('auth-modals-container');
        
        templates.forEach(template => {
            container.appendChild(template);
        });
        
        setupAuthLinks();
    } catch (error) {
        console.error('Error loading auth modals:', error);
    }
}

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
    const formSteps = document.querySelectorAll('.step-content');
    if (formSteps.length === 0) return;

    // Hide all steps
    formSteps.forEach(el => {
        el.style.display = 'none';
        el.classList.remove('active');
    });
    
    // Show the current step
    const currentStepElement = document.getElementById(`step${step}`);
    if (currentStepElement) {
        currentStepElement.style.display = 'block';
        currentStepElement.classList.add('active');
        
        // Show info notification for step 2 about AI design generation
        if (step === 2) {
            setTimeout(() => {
                showInfoNotification(
                    'כיצד זה עובד?', 
                    'לאחר שתלחץ על "צור עיצוב עכשיו", הבינה המלאכותית תיצור עיצוב מותאם אישית בהתבסס על התיאור שכתבת. התהליך לוקח כמה שניות.'
                );
            }, 3000);
        }
        
        // Special handling for step 3 - auto-generate back design
        if (step === 3) {
            const designContainer = document.getElementById('designContainer');
            const designImage = document.getElementById('designImage');
            
            // Only generate if no design exists yet
            if (designContainer && (designContainer.style.display === 'none' || 
                designImage.src.includes('default-tshirt.png'))) {
                setTimeout(generateBackDesign, 500); // Small delay for smooth UX
            }
        }
        
        // Update progress indicators
        updateProgressIndicators(step);
        
        // Update progress bar
        updateProgressBar();
        
        // Update buttons visibility
        updateNavigationButtons();
    }
}

function updateProgressIndicators(step) {
    // Update step indicators in the progress bar
    const stepIndicators = document.querySelectorAll('.step[data-step]');
    stepIndicators.forEach(indicator => {
        const stepNum = parseInt(indicator.getAttribute('data-step'));
        indicator.classList.remove('active', 'completed');
        
        if (stepNum === step) {
            indicator.classList.add('active');
        } else if (stepNum < step) {
            indicator.classList.add('completed');
        }
    });
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (prevBtn && nextBtn && submitBtn) {
        // Previous button visibility
        prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
        
        // Next button visibility
        nextBtn.style.display = currentStep === totalSteps ? 'none' : 'block';
        
        // Submit button visibility
        submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
        
        // Update next button text based on current step
        if (currentStep === 2) {
            // Step 2: Description step - change to "Create Design"
            nextBtn.innerHTML = '<i class="fas fa-palette"></i> צור עיצוב עכשיו <i class="fas fa-arrow-left"></i>';
            nextBtn.title = 'לחץ כדי ליצור עיצוב בינה מלאכותית בהתבסס על התיאור שלך';
        } else {
            // All other steps - keep default text
            nextBtn.innerHTML = 'המשך לשלב הבא <i class="fas fa-arrow-left"></i>';
            nextBtn.title = 'המשך לשלב הבא בתהליך עיצוב החולצה';
        }
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
    // No need to check authentication here since form is blocked for guests
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
    // Step 1: Event Type selection
    const eventType = document.querySelector('input[name="eventType"]:checked');
    if (!eventType) {
        showWarningNotification('אנא בחר סוג אירוע');
        return false;
    }
    
    // If "other" is selected, check custom input
    if (eventType.value === 'other') {
        const customEventType = document.getElementById('customEventType').value.trim();
        if (!customEventType) {
            showWarningNotification('אנא תאר את סוג האירוע');
            return false;
        }
    }
    
    formData.eventType = eventType.value;
    return true;
}

function validateSizeSelection() {
    // Step 2: Description validation
    const description = document.getElementById('description').value.trim();
    if (!description) {
        showWarningNotification('אנא תאר מה החולצה צריכה לבטא');
        return false;
    }
    
    if (description.length < 10) {
        showWarningNotification('אנא הכנס תיאור מפורט יותר (לפחות 10 תווים)');
        return false;
    }
    
    formData.description = description;
    return true;
}

function validateColorSelection() {
    // Step 3: Back design validation
    const designContainer = document.getElementById('designContainer');
    const designImage = document.getElementById('designImage');
    
    // Check if a design has been generated and selected
    // In development mode, default-tshirt.png is acceptable if marked as generated
    const isDev = isDevelopmentMode();
    const isGenerated = designImage && designImage.getAttribute('data-design-generated') === 'true';
    const hasValidDesign = designContainer && designContainer.style.display !== 'none' && 
                          designImage && designImage.src && 
                          (isDev ? isGenerated : !designImage.src.includes('default-tshirt.png'));
    
    if (!hasValidDesign) {
        showWarningNotification('אנא צור עיצוב לחלק האחורי של החולצה');
        return false;
    }
    
    // If user wants back text, validate it
    const backTextPosition = document.querySelector('input[name="backTextPosition"]:checked');
    if (backTextPosition && backTextPosition.value !== 'none') {
        const backText = document.getElementById('backText').value.trim();
        if (!backText) {
            showWarningNotification('אנא הכנס את הטקסט לחלק האחורי');
            return false;
        }
        formData.backText = backText;
        formData.backTextPosition = backTextPosition.value;
    }
    
    formData.backDesign = designImage.src;
    return true;
}

function validateQuantity() {
    // Step 4: Front design validation
    const frontDesignMethod = document.querySelector('input[name="frontDesignMethod"]:checked');
    if (!frontDesignMethod) {
        showWarningNotification('אנא בחר אפשרות עיצוב לחלק הקדמי');
        return false;
    }
    
    // Validate based on selected method
    if (frontDesignMethod.value === 'upload') {
        const uploadInput = document.getElementById('frontImageUpload');
        if (!uploadInput || !uploadInput.files || uploadInput.files.length === 0) {
            showWarningNotification('אנא העלה תמונה לחלק הקדמי');
            return false;
        }
    } else if (frontDesignMethod.value === 'ai') {
        const selectedDesign = document.querySelector('.design-option.selected');
        const generatedDesigns = document.getElementById('generated-designs');
        if (!selectedDesign || !generatedDesigns || generatedDesigns.style.display === 'none') {
            showWarningNotification('אנא צור ובחר עיצוב AI לחלק הקדמי');
            return false;
        }
    } else if (frontDesignMethod.value === 'archive') {
        const selectedSymbol = document.querySelector('input[name="frontIcon"]:checked');
        if (!selectedSymbol) {
            showWarningNotification('אנא בחר סמל מהארכיון');
            return false;
        }
    }
    
    // If front text is selected, validate it
    const frontTextPosition = document.querySelector('input[name="frontTextPosition"]:checked');
    if (frontTextPosition && frontTextPosition.value !== 'none') {
        const frontText = document.getElementById('frontOverlayText').value.trim();
        if (!frontText) {
            showWarningNotification('אנא הכנס את הטקסט לחלק הקדמי');
            return false;
        }
        formData.frontText = frontText;
        formData.frontTextPosition = frontTextPosition.value;
    }
    
    formData.frontDesignMethod = frontDesignMethod.value;
    return true;
}

function validateContactInfo() {
    // Step 5: Customization and contact info validation
    
    // Validate shirt color selection
    const shirtColor = document.querySelector('input[name="shirtColor"]:checked');
    if (!shirtColor) {
        showWarningNotification('אנא בחר צבע חולצה');
        return false;
    }
    
    // Validate design color selection
    const designColor = document.querySelector('input[name="designColor"]:checked');
    if (!designColor) {
        showWarningNotification('אנא בחר צבע גלופה');
        return false;
    }
    
    // Validate quantity - at least one size must have quantity > 0
    const quantities = document.querySelectorAll('.quantity-input');
    let totalQuantity = 0;
    quantities.forEach(input => {
        totalQuantity += parseInt(input.value) || 0;
    });
    
    if (totalQuantity === 0) {
        showWarningNotification('אנא הכנס כמות לפחות במידה אחת');
        return false;
    }
    
    // Validate contact information
    const name = document.querySelector('input[name="customerName"]').value.trim();
    const email = document.querySelector('input[name="customerEmail"]').value.trim();
    const phone = document.querySelector('input[name="customerPhone"]').value.trim();
    
    if (!name || !email || !phone) {
        showWarningNotification('אנא מלא את כל פרטי הקשר');
        return false;
    }
    
    if (!validateEmail(email)) {
        showWarningNotification('אנא הכנס כתובת אימייל תקינה');
        return false;
    }
    
    if (!validatePhone(phone)) {
        showWarningNotification('אנא הכנס מספר טלפון תקין');
        return false;
    }
    
    // Save all form data
    formData.shirtColor = shirtColor.value;
    formData.designColor = designColor.value;
    formData.quantities = {};
    quantities.forEach(input => {
        const size = input.name.replace('quantity_', '').toUpperCase();
        formData.quantities[size] = parseInt(input.value) || 0;
    });
    formData.totalQuantity = totalQuantity;
    formData.contactInfo = { 
        name, 
        email, 
        phone, 
        notes: document.querySelector('textarea[name="customerNotes"]').value.trim() 
    };
    
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
    console.log('showDesignMethod called with:', method);
    
    // Hide all method contents
    document.querySelectorAll('.front-method-content').forEach(el => {
        el.style.display = 'none';
        console.log('Hiding element:', el.id);
    });
    
    // Show selected method content
    let selectedContent;
    if (method === 'upload') {
        selectedContent = document.getElementById('uploadContent');
    } else if (method === 'archive') {
        selectedContent = document.getElementById('archiveContent');
    } else if (method === 'ai') {
        selectedContent = document.getElementById('aiContent');
    }
    
    if (selectedContent) {
        selectedContent.style.display = 'block';
        console.log('Showing element:', selectedContent.id);
        
        // Show front text section when a design method is selected
        const frontTextSection = document.getElementById('frontTextSection');
        if (frontTextSection) {
            frontTextSection.style.display = 'block';
            console.log('Front text section shown');
        }
    } else {
        console.log('No element found for method:', method);
    }
}

// Update front design preview
function updateFrontPreview() {
    const frontPreview = document.getElementById('frontPreview');
    const previewIcon = document.getElementById('previewIcon');
    if (!frontPreview || !previewIcon) return;
    
    // Get selected design method
    const frontDesignMethod = document.querySelector('input[name="frontDesignMethod"]:checked');
    if (!frontDesignMethod) return;
    
    // Update preview based on method
    if (frontDesignMethod.value === 'archive') {
        const selectedIcon = document.querySelector('input[name="frontIcon"]:checked');
        if (selectedIcon) {
            const iconClass = selectedIcon.value === 'shield' ? 'shield-alt' : 
                            selectedIcon.value === 'heart' ? 'heart' :
                            selectedIcon.value === 'star' ? 'star' :
                            selectedIcon.value === 'crown' ? 'crown' :
                            selectedIcon.value === 'mountain' ? 'mountain' :
                            selectedIcon.value === 'fire' ? 'fire' : 'star';
            
            previewIcon.innerHTML = `<i class="fas fa-${iconClass}"></i>`;
            frontPreview.style.display = 'block';
        }
    } else if (frontDesignMethod.value === 'ai') {
        const selectedDesign = document.querySelector('.design-option.selected img');
        if (selectedDesign) {
            previewIcon.innerHTML = `<img src="${selectedDesign.src}" alt="עיצוב AI" style="width: 100%; height: 100%; object-fit: cover;">`;
            frontPreview.style.display = 'block';
        }
    }
    
    console.log('Front preview updated');
}

// File upload handling
function handleFileUpload(input) {
    // No need to check authentication here since form is blocked for guests
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
function selectDesign(element) {
    // Remove selected class from all options
    document.querySelectorAll('.design-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    element.classList.add('selected');
    selectedDesign = element;
    
    // Update front preview for AI designs
    updateFrontPreview();
    
    console.log('Design selected:', element);
}

// AI design generation
async function generateDesign() {
    // Check usage limits before generating
    try {
        const { checkUsageLimit, recordUsage } = await import('./usage-tracker.js');
        
        const canGenerate = await checkUsageLimit();
        if (!canGenerate) {
            return; // Error message already shown by checkUsageLimit
        }
    } catch (error) {
        console.error('Error checking usage limits:', error);
        showErrorNotification('שגיאה', 'בעיה בבדיקת מגבלות השימוש');
        return;
    }
    
    // No need to check authentication here since form is blocked for guests
    const prompt = document.getElementById('design-prompt').value.trim();
    if (!prompt) {
        showWarningNotification('אנא הכנס תיאור לעיצוב המבוקש');
        return;
    }
    
    try {
        document.querySelector('.loading-designs').style.display = 'block';
        
        // Record usage before generating
        try {
            const { recordUsage } = await import('./usage-tracker.js');
            await recordUsage();
        } catch (error) {
            console.error('Error recording usage:', error);
        }
        
        // Check if in development mode
        if (isDevelopmentMode()) {
            // Log API call in development mode
            logAPICall('generateDesign', { prompt });
            
            // Use mock response instead of real AI
            const mockResponse = generateMockAIResponse(prompt, 'design');
            
            // Simulate loading time
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Use mock designs
            document.getElementById('generated-designs').innerHTML = `
                <div class="design-option" onclick="selectDesign(this)">
                    <img src="${mockResponse.images[0]}" alt="עיצוב AI 1">
                    <p>עיצוב 1 (מצב פיתוח)</p>
                </div>
                <div class="design-option" onclick="selectDesign(this)">
                    <img src="${mockResponse.images[1]}" alt="עיצוב AI 2">
                    <p>עיצוב 2 (מצב פיתוח)</p>
                </div>
                <div class="design-option" onclick="selectDesign(this)">
                    <img src="${mockResponse.images[2]}" alt="עיצוב AI 3">
                    <p>עיצוב 3 (מצב פיתוח)</p>
                </div>
            `;
        } else {
            // Real AI generation would go here
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Show generated designs
        document.getElementById('generated-designs').style.display = 'grid';
        document.querySelector('.loading-designs').style.display = 'none';
        
        // Show front text section after generating designs
        const frontTextSection = document.getElementById('frontTextSection');
        if (frontTextSection) {
            frontTextSection.style.display = 'block';
        }
        
        // Update usage badge
        if (window.updateUsageBadge) {
            window.updateUsageBadge();
        }
        
    } catch (error) {
        console.error('Error generating designs:', error);
        showErrorNotification('שגיאה', 'אירעה שגיאה בעת יצירת העיצובים. אנא נסה שוב מאוחר יותר.');
    }
}

// Generate back design based on description
async function generateBackDesign() {
    // Check usage limits before generating
    try {
        const { checkUsageLimit, recordUsage } = await import('./usage-tracker.js');
        
        const canGenerate = await checkUsageLimit();
        if (!canGenerate) {
            return; // Error message already shown by checkUsageLimit
        }
    } catch (error) {
        console.error('Error checking usage limits:', error);
        showErrorNotification('שגיאה', 'בעיה בבדיקת מגבלות השימוש');
        return;
    }
    
    // No need to check authentication here since form is blocked for guests
    const description = document.getElementById('description').value.trim();
    if (!description) {
        showWarningNotification('אנא מלא תחילה את השלב הקודם עם תיאור העיצוב');
        return;
    }
    
    try {
        document.getElementById('loadingDesigns').style.display = 'block';
        document.getElementById('designContainer').style.display = 'none';
        
        // Record usage before generating
        try {
            const { recordUsage } = await import('./usage-tracker.js');
            await recordUsage();
        } catch (error) {
            console.error('Error recording usage:', error);
        }
        
        // Check if in development mode
        if (isDevelopmentMode()) {
            // Log API call in development mode
            logAPICall('generateBackDesign', { description });
            
            // Use mock response instead of real AI
            const mockResponse = generateMockAIResponse(description, 'back_design');
            
            // Simulate loading time
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show the generated design with mock data
            const designImage = document.getElementById('designImage');
            designImage.src = mockResponse.image;
            designImage.alt = `${mockResponse.description} (מצב פיתוח)`;
        } else {
            // Real AI generation would go here
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // For demo purposes, show a placeholder design
            const designImage = document.getElementById('designImage');
            designImage.src = 'https://via.placeholder.com/300x300/4a90e2/ffffff?text=AI+Generated+Design';
        }
        
        // Show the generated design
        document.getElementById('loadingDesigns').style.display = 'none';
        document.getElementById('designContainer').style.display = 'block';
        document.getElementById('backTextSection').style.display = 'block';
        
        // Update back preview
        const backPreview = document.getElementById('backPreview');
        const backPreviewImage = document.getElementById('backPreviewImage');
        if (backPreview && backPreviewImage) {
            const designImage = document.getElementById('designImage');
            if (designImage && designImage.src) {
                backPreviewImage.src = designImage.src;
                backPreview.style.display = 'block';
                console.log('Back preview updated');
            }
        }
        
        // Mark design as generated for validation
        const designImage = document.getElementById('designImage');
        if (designImage) {
            designImage.setAttribute('data-design-generated', 'true');
        }
        
        showSimpleSuccessNotification('העיצוב נוצר בהצלחה! ניתן להמשיך לשלב הבא');
        
        // Update usage badge
        if (window.updateUsageBadge) {
            window.updateUsageBadge();
        }
        
    } catch (error) {
        console.error('Error generating back design:', error);
        showErrorNotification('שגיאה', 'אירעה שגיאה ביצירת העיצוב. אנא נסה שוב מאוחר יותר.');
        document.getElementById('loadingDesigns').style.display = 'none';
    }
}

// Character counter
function updateCharCount(textarea) {
    const maxLength = parseInt(textarea.getAttribute('maxlength'));
    const currentLength = textarea.value.length;
    const counter = document.querySelector('.char-counter');
    counter.textContent = `${currentLength}/${maxLength}`;
}

// Update total quantity
function updateTotalQuantity() {
    const quantityInputs = document.querySelectorAll('.quantity-input');
    let total = 0;
    quantityInputs.forEach(input => {
        total += parseInt(input.value) || 0;
    });
    
    const totalElement = document.getElementById('totalQuantity');
    if (totalElement) {
        totalElement.textContent = total;
    }
}

// Check color contrast and show warning if needed
function checkColorContrast() {
    const shirtColor = document.querySelector('input[name="shirtColor"]:checked');
    const designColor = document.querySelector('input[name="designColor"]:checked');
    const warningElement = document.getElementById('contrastWarning');
    
    if (!shirtColor || !designColor || !warningElement) return;
    
    // Define poor contrast combinations
    const poorContrast = [
        ['black', 'navy'], ['black', 'gray'],
        ['white', 'silver'], ['white', 'gold'],
        ['navy', 'black'], ['gray', 'black'],
        ['silver', 'white'], ['gold', 'white']
    ];
    
    const combination = [shirtColor.value, designColor.value];
    const hasPoorContrast = poorContrast.some(pair => 
        (pair[0] === combination[0] && pair[1] === combination[1]) ||
        (pair[1] === combination[0] && pair[0] === combination[1])
    );
    
    if (hasPoorContrast) {
        warningElement.style.display = 'block';
    } else {
        warningElement.style.display = 'none';
    }
}

// Block form for guest users
function blockFormForGuests() {
    // Hide all form steps
    const formSteps = document.querySelectorAll('.step-content');
    formSteps.forEach(step => {
        step.style.display = 'none';
    });
    
    // Hide navigation buttons
    const navButtons = document.querySelector('.navigation-buttons');
    if (navButtons) {
        navButtons.style.display = 'none';
    }
    
    // Hide progress bar
    const progressContainer = document.querySelector('.progress-container, .progress-bar-container');
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
    
    // Create and show authentication required overlay
    const formContainer = document.querySelector('.form-container, #tshirtForm');
    if (formContainer) {
        // Create overlay
        const authOverlay = document.createElement('div');
        authOverlay.id = 'auth-required-form-overlay';
        authOverlay.className = 'auth-required-form-overlay';
        authOverlay.innerHTML = `
            <div class="auth-required-form-message">
                <div class="auth-icon">
                    <i class="fas fa-lock"></i>
                </div>
                <h2>נדרשת התחברות</h2>
                <p>כדי להתחיל לעצב חולצה מותאמת אישית, אנא התחבר למערכת</p>
                <div class="auth-benefits">
                    <div class="benefit-item">
                        <i class="fas fa-palette"></i>
                        <span>עיצובי AI מתקדמים</span>
                    </div>
                    <div class="benefit-item">
                        <i class="fas fa-save"></i>
                        <span>שמירת ההזמנות שלך</span>
                    </div>
                    <div class="benefit-item">
                        <i class="fas fa-user-shield"></i>
                        <span>חוויה מאובטחת ואישית</span>
                    </div>
                </div>
                <button class="btn btn-primary btn-large auth-login-btn" id="authFormLoginBtn">
                    <i class="fab fa-google"></i>
                    התחבר עם Google
                </button>
                <div class="back-to-home">
                    <a href="/" class="btn btn-secondary">
                        <i class="fas fa-arrow-right"></i>
                        חזור לעמוד הבית
                    </a>
                </div>
            </div>
        `;
        
        // Insert overlay after form container
        formContainer.parentNode.insertBefore(authOverlay, formContainer.nextSibling);
        
        // Add click event to login button
        const authLoginBtn = document.getElementById('authFormLoginBtn');
        if (authLoginBtn) {
            authLoginBtn.addEventListener('click', () => {
                const loginLink = document.querySelector('.login-link');
                if (loginLink) {
                    loginLink.click();
                }
            });
        }
    }
}

// Enable form for authenticated users
function enableFormForAuthenticatedUser() {
    console.log('Enabling form for authenticated user...');
    
    // Remove auth overlay if it exists
    const authOverlay = document.getElementById('auth-required-form-overlay');
    if (authOverlay) {
        authOverlay.remove();
    }
    
    // Show navigation buttons
    const navButtons = document.querySelector('.navigation-buttons');
    if (navButtons) {
        navButtons.style.display = 'flex';
    }
    
    // Show progress bar
    const progressContainer = document.querySelector('.progress-container, .progress-bar-container');
    if (progressContainer) {
        progressContainer.style.display = 'block';
    }
    
    // Enable form container
    const formContainer = document.querySelector('.form-container, #tshirtForm');
    if (formContainer) {
        formContainer.style.pointerEvents = 'auto';
        formContainer.style.opacity = '1';
    }
    
    // Initialize and show the first step
    currentStep = 1;
    showStep(1);
    
    console.log('Form enabled successfully for authenticated user');
}

// Form submission
async function submitForm() {
    // No need to check authentication here since form is blocked for guests
    if (validateCurrentStep()) {
        try {
            // Add user info to form data
            formData.userId = getCurrentUser().id;
            formData.userEmail = getCurrentUser().email;
            formData.submissionTime = new Date().toISOString();
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Redirect to success page or show success message
            alert('ההזמנה התקבלה בהצלחה!');
            window.location.href = '/orders';
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('אירעה שגיאה בשליחת הטופס. אנא נסה שוב מאוחר יותר.');
        }
    }
}

// Initialize form
function initForm(skipAuthCheck = false) {
    setupNavigation();
    
    // Check if we're on the order form page and require authentication
    if (window.location.pathname.includes('/order') || window.location.pathname.includes('order-form.html')) {
        if (!skipAuthCheck && !isUserLoggedIn()) {
            // Block the entire form for non-authenticated users
            blockFormForGuests();
            return;
        } else {
            // User is authenticated, enable the form
            enableFormForAuthenticatedUser();
        }
    }
    
    showStep(1);
    
    // Setup navigation buttons event listeners
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextStep);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevStep);
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            submitForm();
        });
    }
    
    // Setup event listeners for design method selection
    document.querySelectorAll('input[name="frontDesignMethod"]').forEach(input => {
        input.addEventListener('change', (e) => {
            console.log('Design method changed to:', e.target.value);
            showDesignMethod(e.target.value);
        });
    });
    
    // Setup event listeners for icon selection
    document.querySelectorAll('input[name="frontIcon"]').forEach(input => {
        input.addEventListener('change', (e) => {
            console.log('Icon selected:', e.target.value);
            // Show front text section when an icon is selected
            const frontTextSection = document.getElementById('frontTextSection');
            if (frontTextSection) {
                frontTextSection.style.display = 'block';
                console.log('Front text section shown after icon selection');
            }
            // Update front preview
            updateFrontPreview();
        });
    });
    
    // Event type "other" option handling
    document.querySelectorAll('input[name="eventType"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const customInput = document.getElementById('customEventInput');
            if (e.target.value === 'other') {
                customInput.style.display = 'block';
            } else {
                customInput.style.display = 'none';
            }
        });
    });
    
    // Description character counter
    const description = document.getElementById('description');
    if (description) {
        description.addEventListener('input', () => {
            const count = description.value.length;
            const charCountElement = document.getElementById('charCount');
            if (charCountElement) {
                charCountElement.textContent = count;
            }
        });
    }
    
    // Custom event type character counter
    const customEventType = document.getElementById('customEventType');
    if (customEventType) {
        customEventType.addEventListener('input', () => {
            const count = customEventType.value.length;
            const customEventCount = document.getElementById('customEventCount');
            if (customEventCount) {
                customEventCount.textContent = count;
            }
        });
    }
    
    const designPrompt = document.getElementById('design-prompt');
    if (designPrompt) {
        designPrompt.addEventListener('input', () => updateCharCount(designPrompt));
    }
    
    // Regenerate design button
    const regenerateBtn = document.getElementById('regenerateBtn');
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', generateBackDesign);
    }
    
    // Back text position handling
    document.querySelectorAll('input[name="backTextPosition"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const backTextInput = document.getElementById('backTextInput');
            if (e.target.value !== 'none') {
                backTextInput.style.display = 'block';
            } else {
                backTextInput.style.display = 'none';
            }
        });
    });
    
    // Back text character counter
    const backText = document.getElementById('backText');
    if (backText) {
        backText.addEventListener('input', () => {
            const count = backText.value.length;
            const backTextCount = document.getElementById('backTextCount');
            if (backTextCount) {
                backTextCount.textContent = count;
            }
        });
    }
    
    // Quantity inputs for total calculation
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        input.addEventListener('input', updateTotalQuantity);
    });
    
    // Color contrast checking
    document.querySelectorAll('input[name="shirtColor"], input[name="designColor"]').forEach(input => {
        input.addEventListener('change', checkColorContrast);
    });
    
    // Front text position handling
    document.querySelectorAll('input[name="frontTextPosition"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const frontTextInput = document.getElementById('frontOverlayTextInput');
            if (e.target.value !== 'none') {
                frontTextInput.style.display = 'block';
            } else {
                frontTextInput.style.display = 'none';
            }
        });
    });
    
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
document.addEventListener('DOMContentLoaded', () => {
    initForm();
    loadAuthModals();
    
    // Initialize development mode
    initDevMode();
    
    // Update dev mode button text on page load
    updateDevModeButtonText();
});

// Update dev mode button text based on current state
function updateDevModeButtonText() {
    const devModeText = document.getElementById('dev-mode-text');
    if (devModeText) {
        const isDevMode = localStorage.getItem('development-mode') === 'true';
        devModeText.textContent = isDevMode ? 'כבה מצב פיתוח' : 'הפעל מצב פיתוח';
    }
}

// Make functions available globally for HTML onclick handlers
window.nextStep = nextStep;
window.prevStep = prevStep;
window.submitForm = submitForm;
window.generateDesign = generateDesign;
window.generateBackDesign = generateBackDesign;
window.handleFileUpload = handleFileUpload;
window.removeUploadedFile = removeUploadedFile;
window.toggleSizeChart = toggleSizeChart;
window.selectDesign = selectDesign;
window.showDesignMethod = showDesignMethod;
window.updateCharCount = updateCharCount;
window.updateTotalQuantity = updateTotalQuantity;
window.checkColorContrast = checkColorContrast;
window.blockFormForGuests = blockFormForGuests;
window.enableFormForAuthenticatedUser = enableFormForAuthenticatedUser;
window.toggleDevMode = toggleDevMode;

// Toggle development mode
function toggleDevMode() {
    const currentMode = localStorage.getItem('development-mode') === 'true';
    const newMode = !currentMode;
    
    localStorage.setItem('development-mode', newMode.toString());
    
    // Update button text
    updateDevModeButtonText();
    
    // Show notification
    if (newMode) {
        showDevNotification('מצב פיתוח הופעל - קריאות AI חסומות');
    } else {
        showInfoNotification('מצב פיתוח כובה - קריאות AI מופעלות');
    }
    
    // Reinitialize dev mode
    initDevMode();
}
