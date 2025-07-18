// Global variables
let currentStep = 1;
const totalSteps = 5; // Total number of steps in the form
let selectedDesign = null;
let formData = {};

// Navigation functionality
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// DOM elements
const progressFill = document.getElementById('progressFill');
const stepIndicators = document.querySelectorAll('.step');
const stepContents = document.querySelectorAll('.step-content');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const form = document.getElementById('tshirtForm');

// Character counters
const description = document.getElementById('description');
const charCount = document.getElementById('charCount');
const topCaption = document.getElementById('topCaption');
const captionCount = document.getElementById('captionCount');
const bottomCaption = document.getElementById('bottomCaption');
const bottomCaptionCount = document.getElementById('bottomCaptionCount');

// Preview elements
const frontPreview = document.getElementById('frontPreview');
const previewTopCaption = document.getElementById('previewTopCaption');
const previewBottomCaption = document.getElementById('previewBottomCaption');
const previewIcon = document.getElementById('previewIcon');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    updateStepDisplay();
    setupEventListeners();
    updateCharCounters();
});

// Setup event listeners
function setupEventListeners() {
    // Navigation buttons
    nextBtn.addEventListener('click', nextStep);
    prevBtn.addEventListener('click', prevStep);
    submitBtn.addEventListener('click', submitForm);
    
    // Event type selection - handle "other" option
    document.querySelectorAll('input[name="eventType"]').forEach(input => {
        input.addEventListener('change', handleEventTypeChange);
    });
    
    // Character counters
    description.addEventListener('input', updateCharCounters);
    topCaption.addEventListener('input', updateCharCounters);
    topCaption.addEventListener('input', updateFrontPreview);
    bottomCaption.addEventListener('input', updateCharCounters);
    bottomCaption.addEventListener('input', updateFrontPreview);
    
    // Custom event type input
    const customEventType = document.getElementById('customEventType');
    if (customEventType) {
        customEventType.addEventListener('input', updateCharCounters);
    }
    
    // Front design preview
    document.querySelectorAll('input[name="frontIcon"]').forEach(input => {
        input.addEventListener('change', updateFrontPreview);
    });
    
    // Quantity calculations
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('input', updateTotalQuantity);
    });
    
    // Design selection listeners
    document.querySelectorAll('input[name="selectedDesign"]').forEach(input => {
        input.addEventListener('change', handleDesignSelection);
    });
    
    // Text position listeners
    document.querySelectorAll('input[name="textPosition"]').forEach(input => {
        input.addEventListener('change', handleTextPositionChange);
    });
    
    // Improvement prompt listener
    const improvementPrompt = document.getElementById('improvementPrompt');
    if (improvementPrompt) {
        improvementPrompt.addEventListener('input', updateCharCounters);
    }
    
    // Overlay text listener
    const overlayText = document.getElementById('overlayText');
    if (overlayText) {
        overlayText.addEventListener('input', updateCharCounters);
    }
    
    // Improve design button
    const improveBtn = document.getElementById('improveDesignBtn');
    if (improveBtn) {
        improveBtn.addEventListener('click', handleImproveDesign);
    }
    
    // Regenerate designs button
    const regenerateBtn = document.getElementById('regenerateBtn');
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', handleRegenerateDesigns);
    }
    
    // Front design method listeners
    document.querySelectorAll('input[name="frontDesignMethod"]').forEach(input => {
        input.addEventListener('change', handleFrontDesignMethodChange);
    });
    
    // Front image upload
    const frontImageUpload = document.getElementById('frontImageUpload');
    if (frontImageUpload) {
        frontImageUpload.addEventListener('change', handleFrontImageUpload);
    }
    
    // Remove uploaded image
    const removeImageBtn = document.getElementById('removeImageBtn');
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', removeFrontImage);
    }
    
    // Generate front AI design
    const generateFrontBtn = document.getElementById('generateFrontBtn');
    if (generateFrontBtn) {
        generateFrontBtn.addEventListener('click', handleGenerateFrontAI);
    }
    
    // Front AI prompt counter
    const frontAIPrompt = document.getElementById('frontAIPrompt');
    if (frontAIPrompt) {
        frontAIPrompt.addEventListener('input', updateCharCounters);
    }
    
    // Front text position listeners
    document.querySelectorAll('input[name="frontTextPosition"]').forEach(input => {
        input.addEventListener('change', handleFrontTextPositionChange);
    });
    
    // Front overlay text listener
    const frontOverlayText = document.getElementById('frontOverlayText');
    if (frontOverlayText) {
        frontOverlayText.addEventListener('input', updateCharCounters);
    }
    
    // Form validation for each step
    document.querySelectorAll('input[type="radio"]').forEach(input => {
        input.addEventListener('change', validateCurrentStep);
    });
}

// Handle event type change (show/hide custom input)
function handleEventTypeChange(e) {
    const customEventInput = document.getElementById('customEventInput');
    const customEventType = document.getElementById('customEventType');
    
    if (e.target.value === 'other') {
        customEventInput.style.display = 'block';
        if (customEventType) {
            customEventType.focus();
        }
    } else {
        customEventInput.style.display = 'none';
        if (customEventType) {
            customEventType.value = '';
            updateCharCounters();
        }
    }
}

// Update character counters
function updateCharCounters() {
    if (description) {
        charCount.textContent = description.value.length;
        if (description.value.length > 200) {
            charCount.style.color = '#dc2626';
        } else if (description.value.length > 180) {
            charCount.style.color = '#f59e0b';
        } else {
            charCount.style.color = '#6b7280';
        }
    }
    
    // Update custom event type counter
    const customEventType = document.getElementById('customEventType');
    const customEventCount = document.getElementById('customEventCount');
    if (customEventType && customEventCount) {
        customEventCount.textContent = customEventType.value.length;
        if (customEventType.value.length > 45) {
            customEventCount.style.color = '#dc2626';
        } else {
            customEventCount.style.color = '#6b7280';
        }
    }
    
    if (topCaption) {
        captionCount.textContent = topCaption.value.length;
        if (topCaption.value.length > 25) {
            captionCount.style.color = '#dc2626';
        } else {
            captionCount.style.color = '#6b7280';
        }
    }

    if (bottomCaption) {
        bottomCaptionCount.textContent = bottomCaption.value.length;
        if (bottomCaption.value.length > 25) {
            bottomCaptionCount.style.color = '#dc2626';
        } else {
            bottomCaptionCount.style.color = '#6b7280';
        }
    }
    
    // Update improvement prompt counter
    const improvementPrompt = document.getElementById('improvementPrompt');
    const improvementCount = document.getElementById('improvementCount');
    if (improvementPrompt && improvementCount) {
        improvementCount.textContent = improvementPrompt.value.length;
        if (improvementPrompt.value.length > 135) {
            improvementCount.style.color = '#dc2626';
        } else {
            improvementCount.style.color = '#6b7280';
        }
    }
    
    // Update overlay text counter
    const overlayText = document.getElementById('overlayText');
    const overlayTextCount = document.getElementById('overlayTextCount');
    if (overlayText && overlayTextCount) {
        overlayTextCount.textContent = overlayText.value.length;
        if (overlayText.value.length > 25) {
            overlayTextCount.style.color = '#dc2626';
        } else {
            overlayTextCount.style.color = '#6b7280';
        }
    }
    
    // Update front AI prompt counter
    const frontAIPrompt = document.getElementById('frontAIPrompt');
    const frontAICount = document.getElementById('frontAICount');
    if (frontAIPrompt && frontAICount) {
        frontAICount.textContent = frontAIPrompt.value.length;
        if (frontAIPrompt.value.length > 135) {
            frontAICount.style.color = '#dc2626';
        } else {
            frontAICount.style.color = '#6b7280';
        }
    }
    
    // Update front overlay text counter
    const frontOverlayText = document.getElementById('frontOverlayText');
    const frontOverlayTextCount = document.getElementById('frontOverlayTextCount');
    if (frontOverlayText && frontOverlayTextCount) {
        frontOverlayTextCount.textContent = frontOverlayText.value.length;
        if (frontOverlayText.value.length > 25) {
            frontOverlayTextCount.style.color = '#dc2626';
        } else {
            frontOverlayTextCount.style.color = '#6b7280';
        }
    }
}

// Update front design preview
function updateFrontPreview() {
    const frontDesignMethod = document.querySelector('input[name="frontDesignMethod"]:checked');
    const frontTextPosition = document.querySelector('input[name="frontTextPosition"]:checked');
    const frontOverlayText = document.getElementById('frontOverlayText')?.value || '';
    
    // Update text display based on position
    if (previewTopCaption && previewBottomCaption) {
        previewTopCaption.textContent = '';
        previewBottomCaption.textContent = '';
        
        if (frontTextPosition && frontTextPosition.value === 'above') {
            previewTopCaption.textContent = frontOverlayText;
        } else if (frontTextPosition && frontTextPosition.value === 'below') {
            previewBottomCaption.textContent = frontOverlayText;
        }
    }
    
    // Update design based on method
    if (previewIcon && frontDesignMethod) {
        if (frontDesignMethod.value === 'upload' && formData.frontUploadedImage) {
            // Show uploaded image
            previewIcon.innerHTML = `<img src="${formData.frontUploadedImage}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">`;
        } else if (frontDesignMethod.value === 'archive') {
            // Show selected icon
            const selectedIcon = document.querySelector('input[name="frontIcon"]:checked');
            if (selectedIcon) {
                const iconMap = {
                    'shield': 'fas fa-shield-alt',
                    'heart': 'fas fa-heart',
                    'star': 'fas fa-star',
                    'crown': 'fas fa-crown',
                    'mountain': 'fas fa-mountain',
                    'fire': 'fas fa-fire'
                };
                const iconClass = iconMap[selectedIcon.value] || 'fas fa-image';
                previewIcon.innerHTML = `<i class="${iconClass}"></i>`;
            } else {
                previewIcon.innerHTML = '<i class="fas fa-image"></i>';
            }
        } else if (frontDesignMethod.value === 'ai') {
            // Show selected AI design
            const selectedAIDesign = document.querySelector('input[name="aiFrontDesign"]:checked');
            if (selectedAIDesign) {
                const aiImageElement = document.getElementById(selectedAIDesign.value.replace('ai', 'aiFront'));
                if (aiImageElement && aiImageElement.src) {
                    previewIcon.innerHTML = `<img src="${aiImageElement.src}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">`;
                } else {
                    previewIcon.innerHTML = '<i class="fas fa-magic"></i>';
                }
            } else {
                previewIcon.innerHTML = '<i class="fas fa-magic"></i>';
            }
        } else {
            previewIcon.innerHTML = '<i class="fas fa-image"></i>';
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
    
    const totalQuantityElement = document.getElementById('totalQuantity');
    if (totalQuantityElement) {
        totalQuantityElement.textContent = total;
    }
    
    return total;
}

// Step navigation
function nextStep() {
    if (validateCurrentStep()) {
        saveCurrentStepData();
        
        if (currentStep === 2) {
            // Generate AI designs after description step
            currentStep++;
            updateStepDisplay();
            generateAIDesigns();
        } else if (currentStep < totalSteps) {
            currentStep++;
            updateStepDisplay();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
    }
}

// Validate current step
function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            const eventType = document.querySelector('input[name="eventType"]:checked');
            if (!eventType) {
                alert('אנא בחר/י סוג אירוע');
                return false;
            }
            // If "other" is selected, check if custom event type is provided
            if (eventType.value === 'other') {
                const customEventType = document.getElementById('customEventType').value.trim();
                const customEventInput = document.getElementById('customEventType');
                if (!customEventType) {
                    // Add visual indication instead of alert
                    customEventInput.classList.add('invalid');
                    customEventInput.focus();
                    setTimeout(() => {
                        customEventInput.classList.remove('invalid');
                    }, 2000);
                    return false;
                } else {
                    customEventInput.classList.remove('invalid');
                }
            }
            return true;
            
        case 2:
            const desc = description.value.trim();
            if (!desc) {
                alert('אנא הכנס/י תיאור לחולצה');
                return false;
            }
            if (desc.length > 200) {
                alert('התיאור ארוך מדי (מקסימום 200 תווים)');
                return false;
            }
            return true;
            
        case 3:
            // Validate AI design selection
            const selectedDesign = document.querySelector('input[name="selectedDesign"]:checked');
            if (!selectedDesign) {
                alert('אנא בחר/י עיצוב לחלק האחורי של החולצה');
                return false;
            }
            
            // If text overlay is selected, validate text input
            const textPosition = document.querySelector('input[name="textPosition"]:checked');
            if (textPosition && textPosition.value !== 'none') {
                const overlayText = document.getElementById('overlayText').value.trim();
                const overlayTextInput = document.getElementById('overlayText');
                if (!overlayText) {
                    // Add visual indication instead of alert
                    overlayTextInput.classList.add('invalid');
                    overlayTextInput.focus();
                    setTimeout(() => {
                        overlayTextInput.classList.remove('invalid');
                    }, 2000);
                    return false;
                } else {
                    overlayTextInput.classList.remove('invalid');
                }
            }
            return true;
            
        case 4:
            // Validate front design method selection
            const frontDesignMethod = document.querySelector('input[name="frontDesignMethod"]:checked');
            if (!frontDesignMethod) {
                alert('אנא בחר/י איך תרצה ליצור את העיצוב הקדמי');
                return false;
            }
            
            // Validate based on selected method
            if (frontDesignMethod.value === 'upload') {
                if (!formData.frontUploadedImage) {
                    alert('אנא העלה תמונה לעיצוב הקדמי');
                    return false;
                }
            } else if (frontDesignMethod.value === 'archive') {
                const frontIcon = document.querySelector('input[name="frontIcon"]:checked');
                if (!frontIcon) {
                    alert('אנא בחר/י אייקון מהארכיון');
                    return false;
                }
            } else if (frontDesignMethod.value === 'ai') {
                const aiFrontDesign = document.querySelector('input[name="aiFrontDesign"]:checked');
                if (!aiFrontDesign) {
                    alert('אנא צור ובחר עיצוב AI לחלק הקדמי');
                    return false;
                }
            }
            
            // If front text overlay is selected, validate text input
            const frontTextPosition = document.querySelector('input[name="frontTextPosition"]:checked');
            if (frontTextPosition && frontTextPosition.value !== 'none') {
                const frontOverlayText = document.getElementById('frontOverlayText').value.trim();
                const frontOverlayTextInput = document.getElementById('frontOverlayText');
                if (!frontOverlayText) {
                    // Add visual indication instead of alert
                    frontOverlayTextInput.classList.add('invalid');
                    frontOverlayTextInput.focus();
                    setTimeout(() => {
                        frontOverlayTextInput.classList.remove('invalid');
                    }, 2000);
                    return false;
                } else {
                    frontOverlayTextInput.classList.remove('invalid');
                }
            }
            return true;
            
        case 5:
            const shirtColor = document.querySelector('input[name="shirtColor"]:checked');
            const totalQty = updateTotalQuantity();
            
            if (!shirtColor) {
                alert('אנא בחר/י צבע חולצה');
                return false;
            }
            if (totalQty === 0) {
                alert('אנא הכנס/י לפחות חולצה אחת');
                return false;
            }
            
            // Validate contact info
            const name = document.querySelector('input[name="customerName"]').value.trim();
            const email = document.querySelector('input[name="customerEmail"]').value.trim();
            const phone = document.querySelector('input[name="customerPhone"]').value.trim();
            
            if (!name) {
                alert('אנא הכנס/י שם מלא');
                return false;
            }
            if (!email || !isValidEmail(email)) {
                alert('אנא הכנס/י כתובת אימייל תקינה');
                return false;
            }
            if (!phone) {
                alert('אנא הכנס/י מספר טלפון');
                return false;
            }
            return true;
            
        default:
            return true;
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Save current step data
function saveCurrentStepData() {
    switch (currentStep) {
        case 1:
            formData.eventType = document.querySelector('input[name="eventType"]:checked').value;
            if (formData.eventType === 'other') {
                formData.customEventType = document.getElementById('customEventType').value.trim();
            }
            break;
        case 2:
            formData.description = description.value.trim();
            break;
        case 3:
            // Save AI design selection
            const selectedDesign = document.querySelector('input[name="selectedDesign"]:checked');
            if (selectedDesign) {
                formData.selectedDesign = selectedDesign.value;
            }
            
            // Save text overlay settings
            const textPosition = document.querySelector('input[name="textPosition"]:checked');
            if (textPosition) {
                formData.textPosition = textPosition.value;
                if (textPosition.value !== 'none') {
                    formData.overlayText = document.getElementById('overlayText').value.trim();
                }
            }
            
            // Save improvement prompt if exists
            const improvementPrompt = document.getElementById('improvementPrompt').value.trim();
            if (improvementPrompt) {
                formData.improvementPrompt = improvementPrompt;
            }
            break;
        case 4:
            // Save front design method and data
            const frontDesignMethod = document.querySelector('input[name="frontDesignMethod"]:checked');
            if (frontDesignMethod) {
                formData.frontDesignMethod = frontDesignMethod.value;
                
                if (frontDesignMethod.value === 'upload') {
                    // Image data already saved in formData.frontUploadedImage
                } else if (frontDesignMethod.value === 'archive') {
                    const frontIcon = document.querySelector('input[name="frontIcon"]:checked');
                    if (frontIcon) {
                        formData.frontIcon = frontIcon.value;
                    }
                } else if (frontDesignMethod.value === 'ai') {
                    const aiFrontDesign = document.querySelector('input[name="aiFrontDesign"]:checked');
                    if (aiFrontDesign) {
                        formData.aiFrontDesign = aiFrontDesign.value;
                    }
                    if (formData.frontAIPrompt) {
                        // AI prompt already saved
                    }
                }
            }
            
            // Save front text overlay settings
            const frontTextPosition = document.querySelector('input[name="frontTextPosition"]:checked');
            if (frontTextPosition) {
                formData.frontTextPosition = frontTextPosition.value;
                if (frontTextPosition.value !== 'none') {
                    formData.frontOverlayText = document.getElementById('frontOverlayText').value.trim();
                }
            }
            break;
        case 5:
            formData.shirtColor = document.querySelector('input[name="shirtColor"]:checked').value;
            formData.quantities = {
                s: parseInt(document.querySelector('input[name="quantity_s"]').value) || 0,
                m: parseInt(document.querySelector('input[name="quantity_m"]').value) || 0,
                l: parseInt(document.querySelector('input[name="quantity_l"]').value) || 0,
                xl: parseInt(document.querySelector('input[name="quantity_xl"]').value) || 0,
                xxl: parseInt(document.querySelector('input[name="quantity_xxl"]').value) || 0
            };
            formData.customerName = document.querySelector('input[name="customerName"]').value.trim();
            formData.customerEmail = document.querySelector('input[name="customerEmail"]').value.trim();
            formData.customerPhone = document.querySelector('input[name="customerPhone"]').value.trim();
            formData.customerNotes = document.querySelector('textarea[name="customerNotes"]').value.trim();
            break;
    }
}

// Update step display
function updateStepDisplay() {
    // Update progress bar
    const progressPercentage = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${progressPercentage}%`;
    
    // Update step indicators
    stepIndicators.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber === currentStep) {
            step.classList.add('active');
        } else if (stepNumber < currentStep) {
            step.classList.add('completed');
        }
    });
    
    // Update step content
    stepContents.forEach((content, index) => {
        content.classList.remove('active');
        if (index + 1 === currentStep) {
            content.classList.add('active');
        }
    });
    
    // Update navigation buttons
    prevBtn.style.display = currentStep > 1 ? 'flex' : 'none';
    nextBtn.style.display = currentStep < totalSteps ? 'flex' : 'none';
    submitBtn.style.display = currentStep === totalSteps ? 'flex' : 'none';
    
    // Re-register event listeners for the current step
    setupStepEventListeners();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Setup event listeners for the current step
function setupStepEventListeners() {
    if (currentStep === 4) {
        // Front design method listeners
        document.querySelectorAll('input[name="frontDesignMethod"]').forEach(input => {
            // Remove existing listeners to prevent duplicates
            input.removeEventListener('change', handleFrontDesignMethodChange);
            input.addEventListener('change', handleFrontDesignMethodChange);
        });
        
        // Front image upload
        const frontImageUpload = document.getElementById('frontImageUpload');
        if (frontImageUpload) {
            frontImageUpload.removeEventListener('change', handleFrontImageUpload);
            frontImageUpload.addEventListener('change', handleFrontImageUpload);
        }
        
        // Remove uploaded image
        const removeImageBtn = document.getElementById('removeImageBtn');
        if (removeImageBtn) {
            removeImageBtn.removeEventListener('click', removeFrontImage);
            removeImageBtn.addEventListener('click', removeFrontImage);
        }
        
        // Generate front AI design
        const generateFrontBtn = document.getElementById('generateFrontBtn');
        if (generateFrontBtn) {
            generateFrontBtn.removeEventListener('click', handleGenerateFrontAI);
            generateFrontBtn.addEventListener('click', handleGenerateFrontAI);
        }
        
        // Front text position listeners
        document.querySelectorAll('input[name="frontTextPosition"]').forEach(input => {
            input.removeEventListener('change', handleFrontTextPositionChange);
            input.addEventListener('change', handleFrontTextPositionChange);
        });
        
        // Archive icon listeners
        document.querySelectorAll('input[name="frontIcon"]').forEach(input => {
            input.removeEventListener('change', updateFrontPreview);
            input.addEventListener('change', updateFrontPreview);
        });
        
        // AI front design listeners
        document.querySelectorAll('input[name="aiFrontDesign"]').forEach(input => {
            input.removeEventListener('change', updateFrontPreview);
            input.addEventListener('change', updateFrontPreview);
        });
    }
}

// Generate AI designs
function generateAIDesigns() {
    const loadingDesigns = document.getElementById('loadingDesigns');
    const designsGrid = document.getElementById('designsGrid');
    
    // Show loading state
    loadingDesigns.style.display = 'block';
    designsGrid.style.display = 'none';
    
    // Hide improvement and text sections initially
    document.getElementById('designImprovement').style.display = 'none';
    document.getElementById('textOverlaySection').style.display = 'none';
    
    // Simulate AI generation (replace with actual AI API call)
    setTimeout(() => {
        // Generate designs based on form data
        generateMockDesigns();
        
        // Hide loading and show designs
        loadingDesigns.style.display = 'none';
        designsGrid.style.display = 'grid';
        
        // Re-register event listeners for design selection
        setupDesignEventListeners();
        
        console.log('AI designs generated for:', {
            eventType: formData.eventType,
            description: formData.description
        });
    }, 3000);
}

// Create design prompt for AI
function createDesignPrompt() {
    const eventTypeMap = {
        'military': 'צבאי',
        'family': 'משפחתי',
        'wedding': 'חתונה',
        'corporate': 'עסקי',
        'birthday': 'יום הולדת',
        'sports': 'ספורט',
        'other': 'אחר'
    };
    
    const audienceMap = {
        'adults': 'מבוגרים',
        'kids': 'ילדים',
        'teens': 'נוער',
        'mixed': 'מעורב'
    };
    
    let eventTypeText = eventTypeMap[formData.eventType];
    if (formData.eventType === 'other' && formData.customEventType) {
        eventTypeText = formData.customEventType;
    }
    
    return `Create a clean black and white line drawing illustration for a T-shirt back design. 
    Event type: ${eventTypeText}. 
    Target audience: ${audienceMap[formData.audience]}. 
    The design should express: ${formData.description}. 
    Style: minimalist line art, no text, no people, no mockups, just the illustration that represents the concept.`;
}

// Generate mock designs (replace with actual AI API call)
async function generateMockDesigns(prompt) {
    // Mock design data - in real implementation, call DALL-E, Stability AI, etc.
    const mockDesigns = [
        {
            id: 1,
            imageUrl: 'data:image/svg+xml;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="black" stroke-width="3"/>
                    <path d="M60 100 L100 60 L140 100 L100 140 Z" fill="none" stroke="black" stroke-width="2"/>
                    <circle cx="100" cy="100" r="20" fill="none" stroke="black" stroke-width="2"/>
                </svg>
            `),
            label: 'עיצוב 1'
        },
        {
            id: 2,
            imageUrl: 'data:image/svg+xml;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                    <path d="M50 150 Q100 50 150 150" fill="none" stroke="black" stroke-width="3"/>
                    <path d="M70 130 Q100 80 130 130" fill="none" stroke="black" stroke-width="2"/>
                    <circle cx="100" cy="120" r="10" fill="black"/>
                </svg>
            `),
            label: 'עיצוב 2'
        },
        {
            id: 3,
            imageUrl: 'data:image/svg+xml;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                    <rect x="50" y="50" width="100" height="100" fill="none" stroke="black" stroke-width="3"/>
                    <path d="M50 100 L100 50 L150 100 L100 150 Z" fill="none" stroke="black" stroke-width="2"/>
                    <circle cx="100" cy="100" r="15" fill="none" stroke="black" stroke-width="2"/>
                </svg>
            `),
            label: 'עיצוב 3'
        }
    ];
    
    return mockDesigns;
}

// Display generated designs
function displayDesigns(designs, container) {
    container.innerHTML = '';
    
    designs.forEach(design => {
        const designElement = document.createElement('label');
        designElement.className = 'design-option';
        
        designElement.innerHTML = `
            <input type="radio" name="selectedDesign" value="${design.id}">
            <div class="design-card">
                <div class="design-image">
                    <img src="${design.imageUrl}" alt="${design.label}">
                </div>
                <div class="design-label">${design.label}</div>
            </div>
        `;
        
        container.appendChild(designElement);
    });
    
    // Add event listeners for design selection
    container.querySelectorAll('input[name="selectedDesign"]').forEach(input => {
        input.addEventListener('change', function() {
            selectedDesign = this.value;
            validateCurrentStep();
        });
    });
}

// Update order summary
function updateOrderSummary() {
    const eventTypeMap = {
        'military': 'צבאי',
        'family': 'משפחתי',
        'wedding': 'חתונה',
        'corporate': 'עסקי',
        'birthday': 'יום הולדת',
        'sports': 'ספורט',
        'other': 'אחר'
    };
    
    const audienceMap = {
        'adults': 'מבוגרים',
        'kids': 'ילדים',
        'teens': 'נוער',
        'mixed': 'מעורב'
    };
    
    const colorMap = {
        'black': 'שחור',
        'white': 'לבן',
        'navy': 'כחול כהה',
        'gray': 'אפור',
        'red': 'אדום'
    };
    
    // Update summary fields
    let eventTypeText = eventTypeMap[formData.eventType] || '';
    if (formData.eventType === 'other' && formData.customEventType) {
        eventTypeText = formData.customEventType;
    }
    document.getElementById('summaryEventType').textContent = eventTypeText;
    document.getElementById('summaryAudience').textContent = audienceMap[formData.audience] || '';
    document.getElementById('summaryColor').textContent = colorMap[formData.shirtColor] || '';
    
    // Update quantities
    const summaryQuantities = document.getElementById('summaryQuantities');
    const summaryTotalQuantity = document.getElementById('summaryTotalQuantity');
    
    let totalQuantity = 0;
    let quantitiesHTML = '';
    
    const sizeMap = { s: 'S', m: 'M', l: 'L', xl: 'XL', xxl: 'XXL' };
    
    Object.entries(formData.quantities).forEach(([size, quantity]) => {
        if (quantity > 0) {
            quantitiesHTML += `
                <div class="summary-item">
                    <span>מידה ${sizeMap[size]}:</span>
                    <span>${quantity}</span>
                </div>
            `;
            totalQuantity += quantity;
        }
    });
    
    summaryQuantities.innerHTML = quantitiesHTML;
    summaryTotalQuantity.textContent = totalQuantity;
}

// Submit form
function submitForm(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    // Collect all form data
    const finalFormData = {
        ...formData,
        customerName: document.querySelector('input[name="customerName"]').value.trim(),
        customerEmail: document.querySelector('input[name="customerEmail"]').value.trim(),
        customerPhone: document.querySelector('input[name="customerPhone"]').value.trim(),
        customerNotes: document.querySelector('textarea[name="customerNotes"]').value.trim()
    };
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> שולח...';
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        console.log('Order submitted:', finalFormData);
        
        // Save order to localStorage using orders manager
        if (typeof addOrderFromForm === 'function') {
            addOrderFromForm(finalFormData);
        }
        
        // Show success message
        document.getElementById('successMessage').classList.remove('hidden');
        
        // Reset button
        submitBtn.innerHTML = '<i class="fas fa-check"></i> שלח הזמנה';
        submitBtn.disabled = false;
        
        // Reset form after 3 seconds and redirect to orders page
        setTimeout(() => {
            window.location.href = 'my-orders.html';
        }, 3000);
    }, 2000);
}

// Reset form function
function resetForm() {
    currentStep = 1;
    selectedDesign = null;
    formData = {};
    
    // Reset form elements
    if (form) {
        form.reset();
    }
    
    // Update display
    updateStepDisplay();
    updateCharCounters();
    updateFrontPreview();
    
    // Reset buttons
    submitBtn.innerHTML = '<i class="fas fa-check"></i> שלח הזמנה';
    submitBtn.disabled = false;
}

// Utility function to create base64 SVG
function createSVGDesign(content) {
    return 'data:image/svg+xml;base64,' + btoa(content);
}

// Initialize form data
formData = {
    eventType: null,
    audience: null,
    description: '',
    frontIcon: null,
    topCaption: '',
    bottomCaption: '',
    selectedDesign: null,
    shirtColor: 'white',
    quantities: { s: 0, m: 0, l: 0, xl: 0, xxl: 0 }
};

// AI Design Selection Functions
function handleDesignSelection(e) {
    const designValue = e.target.value;
    selectedDesign = designValue;
    
    // Show improvement and text overlay sections
    document.getElementById('designImprovement').style.display = 'block';
    document.getElementById('textOverlaySection').style.display = 'block';
    
    // Update form data
    formData.selectedDesign = designValue;
    
    console.log('Selected design:', designValue);
}

function handleTextPositionChange(e) {
    const position = e.target.value;
    const overlayTextInput = document.getElementById('overlayTextInput');
    
    if (position === 'none') {
        overlayTextInput.style.display = 'none';
        // Clear the text input
        const overlayText = document.getElementById('overlayText');
        if (overlayText) {
            overlayText.value = '';
            updateCharCounters();
        }
    } else {
        overlayTextInput.style.display = 'block';
        // Focus on the text input
        const overlayText = document.getElementById('overlayText');
        if (overlayText) {
            overlayText.focus();
        }
    }
    
    formData.textPosition = position;
}

function handleImproveDesign() {
    const improvementPrompt = document.getElementById('improvementPrompt').value.trim();
    if (!improvementPrompt) {
        alert('אנא הכנס/י הוראות לשיפור העיצוב');
        return;
    }
    
    // Show loading state
    const improveBtn = document.getElementById('improveDesignBtn');
    const originalText = improveBtn.textContent;
    improveBtn.textContent = 'משפר...';
    improveBtn.disabled = true;
    
    // Simulate AI improvement (replace with actual API call)
    setTimeout(() => {
        console.log('Improving design with prompt:', improvementPrompt);
        // Here you would call the AI API to improve the design
        // For now, just show success message
        improveBtn.textContent = 'עיצוב שופר!';
        setTimeout(() => {
            improveBtn.textContent = originalText;
            improveBtn.disabled = false;
        }, 2000);
    }, 2000);
    
    formData.improvementPrompt = improvementPrompt;
}

function handleRegenerateDesigns() {
    // Show loading state
    document.getElementById('loadingDesigns').style.display = 'block';
    document.getElementById('designsGrid').style.display = 'none';
    document.getElementById('designImprovement').style.display = 'none';
    document.getElementById('textOverlaySection').style.display = 'none';
    
    // Simulate regeneration (replace with actual AI API call)
    setTimeout(() => {
        generateMockDesigns();
        document.getElementById('loadingDesigns').style.display = 'none';
        document.getElementById('designsGrid').style.display = 'grid';
        
        // Re-register event listeners after regeneration
        setupDesignEventListeners();
    }, 3000);
}

function generateMockDesigns() {
    // This function simulates generating new designs
    // In a real implementation, this would call an AI API
    console.log('Generating new designs based on:', formData.description);
    
    // Update the design previews with new mock images
    const designs = document.querySelectorAll('.design-option');
    designs.forEach((design, index) => {
        const img = design.querySelector('img');
        // Generate new mock image with different color
        const colors = ['#6273f4', '#10b981', '#f59e0b'];
        const color = colors[index % colors.length];
        img.src = `data:image/svg+xml;base64,${btoa(`
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="#f8f9fa"/>
                <text x="100" y="100" text-anchor="middle" fill="${color}" font-size="14">UPDATED DESIGN ${index + 1}</text>
            </svg>
        `)}`;
    });
}

// Setup event listeners specifically for design selection
function setupDesignEventListeners() {
    // Design selection listeners
    document.querySelectorAll('input[name="selectedDesign"]').forEach(input => {
        input.addEventListener('change', handleDesignSelection);
    });
    
    // Text position listeners
    document.querySelectorAll('input[name="textPosition"]').forEach(input => {
        input.addEventListener('change', handleTextPositionChange);
    });
    
    // Also add click listeners to the design options themselves
    document.querySelectorAll('.design-option').forEach(option => {
        option.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        });
    });
}

// Front Design Method Functions
function handleFrontDesignMethodChange(e) {
    const method = e.target.value;
    
    // Hide all content sections
    document.getElementById('uploadContent').style.display = 'none';
    document.getElementById('archiveContent').style.display = 'none';
    document.getElementById('aiContent').style.display = 'none';
    
    // Show the selected method content
    if (method === 'upload') {
        document.getElementById('uploadContent').style.display = 'block';
    } else if (method === 'archive') {
        document.getElementById('archiveContent').style.display = 'block';
    } else if (method === 'ai') {
        document.getElementById('aiContent').style.display = 'block';
    }
    
    // Show text section after method selection
    document.getElementById('frontTextSection').style.display = 'block';
    
    formData.frontDesignMethod = method;
}

function handleFrontImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('אנא בחר/י קובץ תמונה תקין');
        return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        alert('הקובץ גדול מדי. גודל מקסימלי: 5MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const uploadedImage = document.getElementById('uploadedImage');
        const uploadedImagePreview = document.getElementById('uploadedImagePreview');
        const uploadLabel = document.querySelector('.upload-label');
        
        uploadedImage.src = e.target.result;
        uploadedImagePreview.style.display = 'block';
        uploadLabel.style.display = 'none';
        
        formData.frontUploadedImage = e.target.result;
        updateFrontPreview();
    };
    reader.readAsDataURL(file);
}

function removeFrontImage() {
    const uploadedImagePreview = document.getElementById('uploadedImagePreview');
    const uploadLabel = document.querySelector('.upload-label');
    const frontImageUpload = document.getElementById('frontImageUpload');
    
    uploadedImagePreview.style.display = 'none';
    uploadLabel.style.display = 'block';
    frontImageUpload.value = '';
    
    delete formData.frontUploadedImage;
    updateFrontPreview();
}

function handleGenerateFrontAI() {
    const prompt = document.getElementById('frontAIPrompt').value.trim();
    if (!prompt) {
        const promptInput = document.getElementById('frontAIPrompt');
        promptInput.classList.add('invalid');
        promptInput.focus();
        setTimeout(() => {
            promptInput.classList.remove('invalid');
        }, 2000);
        return;
    }
    
    const generateBtn = document.getElementById('generateFrontBtn');
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> יוצר...';
    generateBtn.disabled = true;
    
    // Simulate AI generation
    setTimeout(() => {
        // Generate mock AI designs
        generateFrontAIMockDesigns(prompt);
        
        // Show results
        document.getElementById('aiFrontResults').style.display = 'block';
        
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
        
        formData.frontAIPrompt = prompt;
    }, 2000);
}

function generateFrontAIMockDesigns(prompt) {
    const designs = [
        `data:image/svg+xml;base64,${btoa(`
            <svg width="100" height="80" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="80" fill="#f0f4ff"/>
                <circle cx="50" cy="40" r="25" fill="none" stroke="#667eea" stroke-width="3"/>
                <text x="50" y="45" text-anchor="middle" fill="#667eea" font-size="10">AI 1</text>
            </svg>
        `)}`,
        `data:image/svg+xml;base64,${btoa(`
            <svg width="100" height="80" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="80" fill="#f0f9ff"/>
                <polygon points="50,15 65,35 35,35" fill="none" stroke="#10b981" stroke-width="3"/>
                <text x="50" y="55" text-anchor="middle" fill="#10b981" font-size="10">AI 2</text>
            </svg>
        `)}`,
        `data:image/svg+xml;base64,${btoa(`
            <svg width="100" height="80" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="80" fill="#fef7ff"/>
                <rect x="35" y="25" width="30" height="30" fill="none" stroke="#f59e0b" stroke-width="3"/>
                <text x="50" y="65" text-anchor="middle" fill="#f59e0b" font-size="10">AI 3</text>
            </svg>
        `)}`
    ];
    
    document.getElementById('aiFront1').src = designs[0];
    document.getElementById('aiFront2').src = designs[1];
    document.getElementById('aiFront3').src = designs[2];
}

function handleFrontTextPositionChange(e) {
    const position = e.target.value;
    const frontOverlayTextInput = document.getElementById('frontOverlayTextInput');
    
    if (position === 'none') {
        frontOverlayTextInput.style.display = 'none';
        // Clear the text input
        const frontOverlayText = document.getElementById('frontOverlayText');
        if (frontOverlayText) {
            frontOverlayText.value = '';
            updateCharCounters();
        }
    } else {
        frontOverlayTextInput.style.display = 'block';
        // Focus on the text input
        const frontOverlayText = document.getElementById('frontOverlayText');
        if (frontOverlayText) {
            frontOverlayText.focus();
        }
    }
    
    formData.frontTextPosition = position;
    updateFrontPreview();
}