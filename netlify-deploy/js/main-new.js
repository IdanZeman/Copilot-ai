// Client-side code - Only UI interactions
(function() {
    // Elements
    const form = document.getElementById('tshirtForm');
    const designBtn = document.getElementById('generateFrontBtn');
    const previewContainer = document.getElementById('designPreviewContainer');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    const steps = document.querySelectorAll('.step-content');
    const stepIndicators = document.querySelectorAll('.step');
    let currentStep = 0;

    // Initialize step visibility
    function updateStepVisibility() {
        // Update step visibility
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep);
        });

        // Update step indicators
        stepIndicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index <= currentStep);
        });

        // Update buttons visibility
        prevBtn.style.display = currentStep === 0 ? 'none' : 'block';
        nextBtn.style.display = currentStep === steps.length - 1 ? 'none' : 'block';
        submitBtn.style.display = currentStep === steps.length - 1 ? 'block' : 'none';

        // Update progress bar
        const progress = ((currentStep + 1) / steps.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    // Initialize first step
    updateStepVisibility();

    // Validation function
    function validateStep() {
        const currentStepElement = steps[currentStep];
        
        // Step 1: Event Type
        if (currentStep === 0) {
            const eventType = currentStepElement.querySelector('input[name="eventType"]:checked');
            if (!eventType) {
                showError('אנא בחר סוג אירוע');
                return false;
            }
            
            // If "other" is selected, check if custom event type is filled
            if (eventType.value === 'other') {
                const customEventType = document.getElementById('customEventType');
                if (!customEventType.value.trim()) {
                    showError('אנא הזן את סוג האירוע');
                    return false;
                }
            }
        }

        // Step 2: Description
        if (currentStep === 1) {
            const description = document.getElementById('description');
            if (!description.value.trim()) {
                showError('אנא הזן תיאור של העיצוב הרצוי');
                return false;
            }
        }

        // Step 3: AI Generated Designs
        if (currentStep === 2) {
            const selectedDesign = currentStepElement.querySelector('input[name="selectedDesign"]:checked');
            if (!selectedDesign) {
                showError('אנא בחר עיצוב');
                return false;
            }
        }

        // Step 4: Front Design
        if (currentStep === 3) {
            const frontMethod = currentStepElement.querySelector('input[name="frontDesignMethod"]:checked');
            if (!frontMethod) {
                showError('אנא בחר שיטת עיצוב לחלק הקדמי');
                return false;
            }

            // Check specific method requirements
            if (frontMethod.value === 'upload') {
                const uploadedImage = document.getElementById('uploadedImage');
                if (!uploadedImage.src || uploadedImage.src === window.location.href) {
                    showError('אנא העלה תמונה');
                    return false;
                }
            } else if (frontMethod.value === 'archive') {
                const selectedIcon = currentStepElement.querySelector('input[name="frontIcon"]:checked');
                if (!selectedIcon) {
                    showError('אנא בחר אייקון מהארכיון');
                    return false;
                }
            } else if (frontMethod.value === 'ai') {
                const aiPrompt = document.getElementById('frontAIPrompt');
                if (!aiPrompt.value.trim()) {
                    showError('אנא הזן תיאור לעיצוב AI');
                    return false;
                }
            }
        }

        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });

        if (!isValid) {
            showError('אנא מלא את כל השדות הנדרשים');
            return false;
        }

        // Check quantities in step 5 (index 4)
        if (currentStep === 4) {
            const quantities = document.querySelectorAll('.quantity-input');
            let total = 0;
            quantities.forEach(input => total += parseInt(input.value) || 0);
            
            if (total === 0) {
                showError('נא לבחור לפחות חולצה אחת');
                return false;
            }
        }

        return true;
    }

    // Error display function
    function showError(message) {
        const currentStepElement = steps[currentStep];
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Remove existing error if any
        const existingError = currentStepElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        currentStepElement.insertBefore(errorDiv, currentStepElement.firstChild);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Navigation event handlers
    nextBtn.addEventListener('click', () => {
        if (validateStep()) {
            currentStep++;
            updateStepVisibility();
            window.scrollTo(0, 0);
        }
    });

    prevBtn.addEventListener('click', () => {
        currentStep--;
        updateStepVisibility();
        window.scrollTo(0, 0);
    });

    // Design generation handler
    async function handleDesignGeneration(event) {
        event.preventDefault();
        console.log('Starting design generation');

        // Show loading and hide designs grid
        const loadingDesigns = document.getElementById('loadingDesigns');
        const designsGrid = document.getElementById('designsGrid');
        
        if (loadingDesigns) loadingDesigns.style.display = 'block';
        if (designsGrid) designsGrid.style.display = 'none';

        try {
            // Simulate API call to generate designs (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2 second delay

            // Generate 3 sample designs (using default image for now)
            const designs = [
                { id: 'design1', imgSrc: '/images/default-tshirt.png' },
                { id: 'design2', imgSrc: '/images/default-tshirt.png' },
                { id: 'design3', imgSrc: '/images/default-tshirt.png' }
            ];

            // Clear existing designs
            if (designsGrid) {
                designsGrid.innerHTML = '';
                
                // Add new designs
                designs.forEach((design, index) => {
                    const designOption = document.createElement('label');
                    designOption.className = 'design-option';
                    designOption.setAttribute('for', design.id);
                    
                    designOption.innerHTML = `
                        <div class="design-preview">
                            <img src="${design.imgSrc}" alt="עיצוב ${index + 1}">
                        </div>
                        <input type="radio" name="selectedDesign" value="${design.id}" id="${design.id}">
                        <span class="design-label">עיצוב ${index + 1}</span>
                    `;
                    
                    designsGrid.appendChild(designOption);
                });

                // Hide loading and show designs
                loadingDesigns.style.display = 'none';
                designsGrid.style.display = 'grid';

                // Show design improvement section
                const designImprovement = document.getElementById('designImprovement');
                if (designImprovement) {
                    designImprovement.style.display = 'block';
                }

                // Show text overlay section
                const textOverlaySection = document.getElementById('textOverlaySection');
                if (textOverlaySection) {
                    textOverlaySection.style.display = 'block';
                }
            }

        } catch (error) {
            console.error('Error:', error);
            if (loadingDesigns) {
                loadingDesigns.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        אירעה שגיאה ביצירת העיצובים. אנא נסה שוב.
                    </div>
                `;
                setTimeout(() => {
                    loadingDesigns.style.display = 'none';
                    if (designsGrid) designsGrid.style.display = 'none';
                }, 3000);
            }
        }
    }

    // Handle shirt color change
    const shirtColorInputs = document.querySelectorAll('input[name="shirtColor"]');
    shirtColorInputs.forEach(input => {
        input.addEventListener('change', () => {
            const color = input.value;
            const preview = document.getElementById('frontPreview');
            if (preview) {
                preview.style.backgroundColor = color === 'white' ? '#ffffff' : 
                                             color === 'black' ? '#000000' :
                                             color === 'navy' ? '#1e3a8a' :
                                             color === 'gray' ? '#6b7280' :
                                             color === 'red' ? '#dc2626' : '#ffffff';
            }
        });
    });

    // Handle design color change
    const designColorInputs = document.querySelectorAll('input[name="designColor"]');
    designColorInputs.forEach(input => {
        input.addEventListener('change', () => {
            const color = input.value;
            const previewIcon = document.getElementById('previewIcon');
            if (previewIcon) {
                previewIcon.style.color = color === 'white' ? '#ffffff' : 
                                        color === 'black' ? '#000000' :
                                        color === 'navy' ? '#1e3a8a' :
                                        color === 'gray' ? '#6b7280' :
                                        color === 'red' ? '#dc2626' :
                                        color === 'gold' ? '#fbbf24' :
                                        color === 'silver' ? '#d1d5db' : '#000000';
            }
        });
    });

    // Handle file upload
    const fileInput = document.getElementById('frontImageUpload');
    const uploadedImagePreview = document.getElementById('uploadedImagePreview');
    const uploadedImage = document.getElementById('uploadedImage');
    const removeImageBtn = document.getElementById('removeImageBtn');

    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    uploadedImage.src = e.target.result;
                    uploadedImagePreview.style.display = 'block';
                    // Update front preview
                    const previewIcon = document.getElementById('previewIcon');
                    if (previewIcon) {
                        previewIcon.innerHTML = `<img src="${e.target.result}" alt="Uploaded design">`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', function() {
            fileInput.value = '';
            uploadedImagePreview.style.display = 'none';
            uploadedImage.src = '';
            // Reset front preview
            const previewIcon = document.getElementById('previewIcon');
            if (previewIcon) {
                previewIcon.innerHTML = '<i class="fas fa-image"></i>';
            }
        });
    }

    // Handle archive icon selection
    const iconInputs = document.querySelectorAll('input[name="frontIcon"]');
    iconInputs.forEach(input => {
        input.addEventListener('change', () => {
            const iconClass = input.value;
            const previewIcon = document.getElementById('previewIcon');
            if (previewIcon) {
                previewIcon.innerHTML = `<i class="fas fa-${iconClass}"></i>`;
            }
        });
    });

    // Handle text overlay
    const textPositionInputs = document.querySelectorAll('input[name="frontTextPosition"]');
    const overlayTextInput = document.getElementById('frontOverlayText');

    textPositionInputs.forEach(input => {
        input.addEventListener('change', () => {
            const position = input.value;
            const textInput = document.getElementById('frontOverlayTextInput');
            if (textInput) {
                textInput.style.display = position === 'none' ? 'none' : 'block';
            }
        });
    });

    if (overlayTextInput) {
        overlayTextInput.addEventListener('input', () => {
            const text = overlayTextInput.value;
            const position = document.querySelector('input[name="frontTextPosition"]:checked').value;
            const topCaption = document.getElementById('previewTopCaption');
            const bottomCaption = document.getElementById('previewBottomCaption');
            
            if (position === 'above' && topCaption) {
                topCaption.textContent = text;
                bottomCaption.textContent = '';
            } else if (position === 'below' && bottomCaption) {
                bottomCaption.textContent = text;
                topCaption.textContent = '';
            }
        });
    }

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateStep()) {
            return;
        }

        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.classList.remove('hidden');
        }
        
        // בפועל כאן יהיה קוד שישלח את הטופס לשרת
        console.log('Form submitted successfully');
    });

    // Event listeners
    if (designBtn) {
        designBtn.addEventListener('click', handleDesignGeneration);
    }
})();
