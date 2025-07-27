// Import auth-related functionality
import { setupAuthLinks, requireAuthentication } from './auth-ui.js';
import { getCurrentUser, isUserLoggedIn, waitForAuthInit } from './auth-state.js';
import { showWarningNotification, showErrorNotification, showSimpleSuccessNotification, showInfoNotification, showDevNotification } from './notifications.js';
import { isDevelopmentMode, generateMockAIResponse, logAPICall, initDevMode } from './dev-config.js';

// Global variables
let currentStep = 1;
const totalSteps = 5; // Total number of steps in the form
let selectedDesign = null;
let formData = {};

// Get API base URL based on environment
function getAPIBaseURL() {
    console.log('🔍 === getAPIBaseURL function called ===');
    console.log('🌐 Current hostname:', window.location.hostname);
    console.log('🌐 Current origin:', window.location.origin);
    console.log('🌐 Current protocol:', window.location.protocol);
    console.log('🌐 Current port:', window.location.port);
    console.log('🌐 Full location object:', window.location);
    
    // Check for manual localhost override in localStorage
    const forceLocalhost = localStorage.getItem('force-localhost');
    console.log('🔧 localStorage force-localhost value:', forceLocalhost);
    if (forceLocalhost === 'true') {
        console.log('🔧 Force localhost mode active - using localhost API');
        return 'http://localhost:3000';
    }
    
    // Check for development mode override
    const devMode = localStorage.getItem('development-mode');
    console.log('🔧 localStorage development-mode value:', devMode);
    if (devMode === 'true') {
        console.log('🔧 Development mode override - using localhost API');
        return 'http://localhost:3000';
    }
    
    // If development mode is active, always use localhost
    console.log('🔧 Checking isDevelopmentMode function...');
    if (typeof isDevelopmentMode === 'function') {
        const devModeResult = isDevelopmentMode();
        console.log('🔧 isDevelopmentMode() result:', devModeResult);
        if (devModeResult) {
            console.log('🔧 Development mode active - using localhost API');
            return 'http://localhost:3000';
        }
    } else {
        console.log('⚠️ isDevelopmentMode function not available');
    }
    
    // Check if we're running locally
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    console.log('🏠 Is localhost check:', isLocalhost);
    if (isLocalhost) {
        console.log('✅ Local environment detected - using localhost:3000');
        return 'http://localhost:3000';
    }
    
    // For production on Render (or any other domain)
    const productionURL = window.location.origin;
    console.log('🚀 Production environment detected - using origin:', productionURL);
    console.log('🔍 === getAPIBaseURL returning ===:', productionURL);
    return productionURL;
}

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
            return validateDescription();
        case 3:
            return validateColorSelection();
        case 4:
            return validateQuantity();
        case 5:
            return validateSizeSelection() && validateContactInfo();
        default:
            return true;
    }
}

// Validate description for step 2
function validateDescription() {
    const description = document.getElementById('designPrompt');
    if (!description || !description.value.trim()) {
        showWarningNotification('אנא תאר מה החולצה צריכה לבטא');
        return false;
    }
    if (description.value.trim().length < 10) {
        showWarningNotification('אנא הכנס תיאור מפורט יותר (לפחות 10 תווים)');
        return false;
    }
    formData.description = description.value.trim();
    return true;
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
    // Get all size inputs
    const sizeInputs = document.querySelectorAll('.quantity-input');
    let totalQuantity = 0;

    // Calculate total quantity
    sizeInputs.forEach(input => {
        if (input && input.value) {
            totalQuantity += parseInt(input.value) || 0;
        }
    });

    // Check if at least one size is selected
    if (totalQuantity === 0) {
        showWarningNotification('אנא בחר לפחות מידה אחת וכמות');
        return false;
    }

    // Save the total quantity to formData
    formData.totalQuantity = totalQuantity;
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
        const frontText = document.getElementById('frontText').value.trim();
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
    const previewTopCaption = document.getElementById('previewTopCaption');
    const previewBottomCaption = document.getElementById('previewBottomCaption');
    
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
    
    // Update text overlay
    updateFrontTextPreview();
    
    console.log('Front preview updated');
}

// Update front text preview
function updateFrontTextPreview() {
    const previewTopCaption = document.getElementById('previewTopCaption');
    const previewBottomCaption = document.getElementById('previewBottomCaption');
    const frontTextPosition = document.querySelector('input[name="frontTextPosition"]:checked');
    const frontOverlayText = document.getElementById('frontText');
    
    if (!previewTopCaption || !previewBottomCaption) return;
    
    // Clear previous text
    previewTopCaption.textContent = '';
    previewBottomCaption.textContent = '';
    
    if (frontTextPosition && frontTextPosition.value !== 'none' && frontOverlayText) {
        const text = frontOverlayText.value.trim();
        if (text) {
            if (frontTextPosition.value === 'above') {
                previewTopCaption.textContent = text;
            } else if (frontTextPosition.value === 'below') {
                previewBottomCaption.textContent = text;
            }
        }
    }
    
    console.log('Front text preview updated');
}

// Update back text preview
function updateBackTextPreview() {
    const backPreviewTopCaption = document.getElementById('backPreviewTopCaption');
    const backPreviewBottomCaption = document.getElementById('backPreviewBottomCaption');
    const backTextPosition = document.querySelector('input[name="backTextPosition"]:checked');
    const backText = document.getElementById('backText');
    
    if (!backPreviewTopCaption || !backPreviewBottomCaption) return;
    
    // Clear previous text
    backPreviewTopCaption.textContent = '';
    backPreviewBottomCaption.textContent = '';
    
    if (backTextPosition && backTextPosition.value !== 'none' && backText) {
        const text = backText.value.trim();
        if (text) {
            if (backTextPosition.value === 'above') {
                backPreviewTopCaption.textContent = text;
            } else if (backTextPosition.value === 'below') {
                backPreviewBottomCaption.textContent = text;
            }
        }
    }
    
    console.log('Back text preview updated');
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
    console.log('🎨 generateDesign function called');
    console.log('🌍 Current window.location:', window.location);
    console.log('🔗 Current URL details:', {
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        port: window.location.port,
        pathname: window.location.pathname,
        origin: window.location.origin
    });
    
    // Test API base URL function
    const apiBaseURL = getAPIBaseURL();
    console.log('🎯 API Base URL from function:', apiBaseURL);
    
    // Check usage limits before generating
    try {
        const { checkUsageLimit, recordUsage } = await import('./usage-tracker.js');
        
        const canGenerate = await checkUsageLimit();
        if (!canGenerate) {
            console.log('❌ Usage limit reached');
            return; // Error message already shown by checkUsageLimit
        }
    } catch (error) {
        console.error('Error checking usage limits:', error);
        showErrorNotification('שגיאה', 'בעיה בבדיקת מגבלות השימוש');
        return;
    }
    
    // No need to check authentication here since form is blocked for guests
    const prompt = document.getElementById('designPrompt').value.trim();
    console.log('📝 Prompt from form:', prompt);
    
    // Save the description in formData
    formData.description = prompt;
    
    // Get and save design preferences
    const designColorInput = document.querySelector('input[name="designColor"]:checked');
    const designStyleInput = document.querySelector('input[name="designStyle"]:checked');
    const shirtColorInput = document.querySelector('input[name="shirtColor"]:checked');
    const eventTypeInput = document.querySelector('input[name="eventType"]:checked');
    
    if (designColorInput) formData.designColor = designColorInput.value;
    if (designStyleInput) formData.designStyle = designStyleInput.value;
    if (shirtColorInput) formData.shirtColor = shirtColorInput.value;
    if (eventTypeInput) formData.eventType = eventTypeInput.value;
    
    if (!prompt) {
        console.log('❌ No prompt provided');
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
        const devMode = isDevelopmentMode();
        console.log('🔧 Development mode:', devMode);
        
        if (devMode) {
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
            // Real AI generation
            console.log('🚀 Starting real AI generation for front design');
            console.log('📝 Prompt:', prompt);
            console.log('🎯 Event type element:', document.getElementById('eventType'));
            
            // Get event type from form
            const eventTypeElement = document.querySelector('input[name="eventType"]:checked');
            const eventType = eventTypeElement ? eventTypeElement.value : 'general';
            console.log('🎪 Event type:', eventType);
            
            const requestBody = {
                eventType: eventType,
                description: prompt,
                designType: 'front'
            };
            console.log('📤 Request body:', requestBody);
            
            const apiURL = `${getAPIBaseURL()}/api/generate-design`;
            console.log('🌐 Final API URL for request:', apiURL);
            console.log('📤 Full request details:', {
                url: apiURL,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('🚀 Making fetch request to:', apiURL);
            
            const response = await fetch(apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('📡 Response received:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                url: response.url,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API call failed:', response.status, errorText);
                throw new Error(`API call failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('📦 Response data:', data);
            
            if (data.success && data.design) {
                console.log('✅ Design generated successfully');
                console.log('🖼️ Image data received:', !!data.design.imageData);
                
                // Convert base64 to data URL
                const imgData = data.design.imageData;
                const src = imgData.startsWith("data:") ? imgData 
                                                        : `data:image/png;base64,${imgData}`;
                
                // Display the generated design
                document.getElementById('generated-designs').innerHTML = `
                    <div class="design-option" onclick="selectDesign(this)">
                        <img src="${src}" alt="עיצוב AI מותאם אישית" onerror="console.error('❌ Failed to load image:', this.src)">
                        <p>עיצוב מותאם אישית</p>
                    </div>
                `;
            } else {
                throw new Error('Failed to generate design');
            }
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
    console.log('🎨 === generateBackDesign function called ===');
    console.log('🌍 Current window.location:', window.location);
    console.log('🔗 Current URL details:', {
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        port: window.location.port,
        pathname: window.location.pathname,
        origin: window.location.origin
    });
    
    // Test API base URL function
    const apiBaseURL = getAPIBaseURL();
    console.log('🎯 API Base URL from function:', apiBaseURL);
    
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
    const description = document.getElementById('designPrompt').value.trim();
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
            // Real AI generation for back design
            console.log('🚀 Starting real AI generation for back design');
            console.log('📝 Description:', description);
            
            // Get event type from form
            const eventTypeElement = document.querySelector('input[name="eventType"]:checked');
            const eventType = eventTypeElement ? eventTypeElement.value : 'general';
            console.log('🎪 Event type:', eventType);
            
            const requestBody = {
                eventType: eventType,
                description: description,
                designType: 'back'
            };
            console.log('📤 Request body for back design:', requestBody);
            
            const apiURL = `${getAPIBaseURL()}/api/generate-design`;
            console.log('🌐 Back design API URL:', apiURL);
            console.log('📤 Back design request details:', {
                url: apiURL,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('🚀 Making back design fetch request to:', apiURL);
            
            const response = await fetch(apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('📡 Back design response received:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                url: response.url,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Back design API call failed:', response.status, errorText);
                throw new Error(`API call failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('📦 Back design response data:', data);
            
            if (data.success && data.design) {
                console.log('✅ Back design generated successfully');
                console.log('🖼️ Back design image data received:', !!data.design.imageData);
                
                // Convert base64 to data URL
                const imgData = data.design.imageData;
                const src = imgData.startsWith("data:") ? imgData 
                                                        : `data:image/png;base64,${imgData}`;
                
                // Show the generated design
                const designImage = document.getElementById('designImage');
                designImage.src = src;
                designImage.alt = 'עיצוב AI לחלק האחורי';
                designImage.setAttribute('data-design-generated', 'true');
                designImage.onerror = function() {
                    console.error('❌ Failed to load back design image:', this.src);
                };
            } else {
                throw new Error('Failed to generate back design');
            }
        }
        
        // Show the generated design
        document.getElementById('loadingDesigns').style.display = 'none';
        document.getElementById('designContainer').style.display = 'block';
        document.getElementById('backTextSection').style.display = 'block';
        
        // Show design improvement section
        const designImprovement = document.getElementById('designImprovement');
        if (designImprovement) {
            designImprovement.style.display = 'block';
        }
        
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

// Improve existing design
async function improveDesign() {
    // Check if development mode is enabled - skip AI calls
    if (isDevelopmentMode()) {
        showDevNotification('מצב פיתוח פעיל - שיפור עיצוב אינו זמין במצב זה');
        return;
    }
    
    // Check if a design exists and was generated
    const designImage = document.getElementById('designImage');
    if (!designImage || !designImage.src || 
        !designImage.getAttribute('data-design-generated') || 
        designImage.src.includes('placeholder')) {
        showErrorNotification('שגיאה', 'יש ליצור עיצוב לפני שיפור');
        return;
    }
    
    // Get improvement prompt
    const improvementPrompt = document.getElementById('improvementPrompt');
    if (!improvementPrompt || !improvementPrompt.value.trim()) {
        showErrorNotification('שגיאה', 'אנא הזן הנחיות לשיפור העיצוב');
        return;
    }
    
    // Get the improve button outside try block
    const improveBtn = document.getElementById('improveDesignBtn');
    const originalText = improveBtn.textContent;
    
    try {
        // Check usage limits
        if (window.UsageTracker) {
            const canGenerate = await window.UsageTracker.checkUsageLimit();
            if (!canGenerate) {
                return; // Error already shown by checkUsageLimit
            }
        }
        
        // Show loading state
        improveBtn.disabled = true;
        improveBtn.textContent = 'משפר עיצוב...';
        
        // Validate that we have the original description
        if (!formData.description) {
            throw new Error('חסר תיאור העיצוב המקורי');
        }
        
        // Prepare improvement request
        const response = await fetch(`${getAPIBaseURL()}/api/improve-design`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                originalPrompt: formData.description,
                prompt: improvementPrompt.value.trim(),
                eventType: formData.eventType || 'general'
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`שגיאת שרת: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        if (!data.success || !data.design || !data.design.imageData) {
            throw new Error('תגובת השרת לא הכילה עיצוב תקין');
        }
        
        // Convert base64 to data URL
        const imgData = data.design.imageData;
        const src = imgData.startsWith("data:") ? imgData 
                                               : `data:image/png;base64,${imgData}`;
        
        // Update the design image with improved version
        designImage.src = src;
        designImage.setAttribute('data-design-generated', 'true');
        
        // Update back preview if exists
        const backPreviewImage = document.getElementById('backPreviewImage');
        if (backPreviewImage) {
            backPreviewImage.src = src;
        }
        
        // Record usage
        if (window.UsageTracker) {
            await window.UsageTracker.recordUsage();
        }
        
        showSuccessNotification('העיצוב שופר בהצלחה', 'העיצוב המשופר מוצג על החולצה');
        
    } catch (error) {
        console.error('❌ Error improving design:', error);
        showErrorNotification('שגיאה בשיפור העיצוב', error.message || 'אירעה שגיאה בלתי צפויה');
    } finally {
        // Always restore button state
        if (improveBtn) {
            improveBtn.disabled = false;
            improveBtn.textContent = originalText;
        }
        
        // Clear improvement prompt
        if (improvementPrompt) {
            improvementPrompt.value = '';
        }
        
        // Update usage badge
        if (window.updateUsageBadge) {
            window.updateUsageBadge();
        }
    }
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
    
    // Save values to formData
    formData.shirtColor = shirtColor.value;
    formData.designColor = designColor.value;
    
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
        // Check if overlay already exists
        let authOverlay = document.getElementById('auth-required-form-overlay');
        if (authOverlay) {
            console.log('Auth overlay already exists, not creating duplicate');
            return;
        }
        
        // Create overlay
        authOverlay = document.createElement('div');
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
            // Wait for auth to initialize
            await waitForAuthInit();
            
            const currentUser = getCurrentUser();
            if (!currentUser) {
                showErrorNotification('שגיאה', 'יש להתחבר כדי לשלוח הזמנה');
                return;
            }

            // Show loading state
            const submitBtn = document.querySelector('.submit-btn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'שולח הזמנה...';
            }

            // Collect all form data
            const orderData = {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                
                // Design information
                designPrompt: document.getElementById('designPrompt')?.value || '',
                designImage: (() => {
                    const imgSrc = document.getElementById('designImage')?.src || '';
                    // Convert absolute localhost URLs to relative paths
                    if (imgSrc.includes('localhost')) {
                        return imgSrc.replace(/^.*localhost:\d+/, '');
                    }
                    return imgSrc;
                })(),
                selectedDesign: formData.selectedDesign || null,
                designMethod: formData.designMethod || 'ai',
                designStyle: document.querySelector('input[name="designStyle"]:checked')?.value || '',
                designColor: document.querySelector('input[name="designColor"]:checked')?.value || '',
                
                // T-shirt details
                shirtColor: document.querySelector('input[name="shirtColor"]:checked')?.value || '',
                
                // Text overlays
                frontText: document.getElementById('frontText')?.value || '',
                frontTextPosition: document.querySelector('input[name="frontTextPosition"]:checked')?.value || 'none',
                backText: document.getElementById('backText')?.value || '',
                backTextPosition: document.querySelector('input[name="backTextPosition"]:checked')?.value || 'none',
                
                // Collect sizes and quantities
                sizes: {},
                totalQuantity: 0,
                
                // Customer details
                fullName: document.getElementById('fullName')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                email: document.getElementById('email')?.value || '',
                address: document.getElementById('address')?.value || '',
                city: document.getElementById('city')?.value || '',
                postalCode: document.getElementById('postalCode')?.value || '',
                notes: document.getElementById('notes')?.value || '',
                
                // Order details
                eventType: document.querySelector('input[name="eventType"]:checked')?.value || document.getElementById('customEventType')?.value || '',
                eventDate: document.getElementById('eventDate')?.value || '',
                specialRequests: document.getElementById('specialRequests')?.value || '',
                
                submissionTime: new Date().toISOString()
            };

            // Collect size quantities
            const quantityInputs = document.querySelectorAll('.quantity-input');
            quantityInputs.forEach(input => {
                const size = input.getAttribute('data-size');
                const quantity = parseInt(input.value) || 0;
                if (quantity > 0) {
                    orderData.sizes[size] = quantity;
                    orderData.totalQuantity += quantity;
                }
            });

            // Import and use order service
            const { orderService } = await import('./order-service.js');
            const result = await orderService.saveOrder(orderData);
            
            if (result.success) {
                // Store order data in formData for potential future use
                formData = { ...formData, ...orderData, orderId: result.orderId };
                
                showSimpleSuccessNotification(`הזמנה #${result.orderId.substring(0, 8).toUpperCase()} נשלחה בהצלחה!`);
                
                // Redirect to orders page after short delay
                setTimeout(() => {
                    window.location.href = '../html/my-orders.html';
                }, 2000);
                
            } else {
                throw new Error(result.error || 'Failed to save order');
            }
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showErrorNotification('שגיאה', 'אירעה שגיאה בשליחת ההזמנה. אנא נסה שוב מאוחר יותר.');
        } finally {
            // Restore button state
            const submitBtn = document.querySelector('.submit-btn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'שלח הזמנה';
            }
        }
    }
}

// Helper function to save form choices
function saveFormChoice(name, value) {
    formData[name] = value;
    console.log(`💾 Saved form choice: ${name} = ${value}`, formData);
}

// Initialize form
async function initForm(skipAuthCheck = false) {
    setupNavigation();
    
    // Add listeners for radio button changes
    ['designColor', 'designStyle', 'shirtColor'].forEach(name => {
        document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
            radio.addEventListener('change', (e) => saveFormChoice(name, e.target.value));
            // If this radio is checked, save its value initially
            if (radio.checked) {
                saveFormChoice(name, radio.value);
            }
        });
    });
    
    // Check if we're on the order form page and require authentication
    if (window.location.pathname.includes('/order') || window.location.pathname.includes('order-form.html')) {
        if (!skipAuthCheck) {
            // Wait for auth to initialize
            await waitForAuthInit();
            
            if (!isUserLoggedIn()) {
                // Block the entire form for non-authenticated users
                blockFormForGuests();
                return;
            } else {
                // User is authenticated, enable the form
                enableFormForAuthenticatedUser();
            }
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
    
    // Setup event listeners for front text position
    document.querySelectorAll('input[name="frontTextPosition"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const frontOverlayTextInput = document.getElementById('frontOverlayTextInput');
            if (e.target.value !== 'none') {
                frontOverlayTextInput.style.display = 'block';
            } else {
                frontOverlayTextInput.style.display = 'none';
            }
            // Update text preview
            updateFrontTextPreview();
        });
    });
    
    // Setup event listener for front overlay text input
    const frontOverlayText = document.getElementById('frontText');
    if (frontOverlayText) {
        frontOverlayText.addEventListener('input', () => {
            // Update character counter
            const count = frontOverlayText.value.length;
            const frontOverlayTextCount = document.getElementById('frontOverlayTextCount');
            if (frontOverlayTextCount) {
                frontOverlayTextCount.textContent = count;
            }
            // Update text preview
            updateFrontTextPreview();
        });
    }
    
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
    const description = document.getElementById('designPrompt');
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
            // Update back text preview
            updateBackTextPreview();
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
            // Update back text preview
            updateBackTextPreview();
        });
    }
    
    // Improvement prompt character counter
    const improvementPrompt = document.getElementById('improvementPrompt');
    if (improvementPrompt) {
        improvementPrompt.addEventListener('input', () => {
            const count = improvementPrompt.value.length;
            const improvementCount = document.getElementById('improvementCount');
            if (improvementCount) {
                improvementCount.textContent = count;
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
    
    // Improve design button
    const improveDesignBtn = document.getElementById('improveDesignBtn');
    if (improveDesignBtn) {
        improveDesignBtn.addEventListener('click', improveDesign);
    }
    
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
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize auth system first (mark as initialized to prevent double init)
    if (!window.authUIInitialized) {
        await setupAuthLinks();
        window.authUIInitialized = true;
    }
    
    // Then initialize form and other components
    await initForm();
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
window.improveDesign = improveDesign;
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
