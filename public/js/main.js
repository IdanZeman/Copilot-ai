// Client-side code - Only UI interactions
(function() {
    // Elements
    const form = document.getElementById('tshirtForm');
    const designBtn = document.getElementById('generateFrontBtn');
    const backDesignBtn = document.getElementById('generateDesignsBtn');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    const steps = document.querySelectorAll('.step-content');
    const stepIndicators = document.querySelectorAll('.step');
    let currentStep = 0;

    // Initialize back text functionality
    function initBackText() {
        const backTextSection = document.getElementById('backTextSection');
        const backTextInput = document.getElementById('backText');
        const backTextCount = document.getElementById('backTextCount');
        const backTextPositions = document.getElementsByName('backTextPosition');
        const backPreviewTopCaption = document.getElementById('backPreviewTopCaption');
        const backPreviewBottomCaption = document.getElementById('backPreviewBottomCaption');

        // Show text section when a design is selected
        document.getElementById('designContainer').addEventListener('change', function() {
            backTextSection.style.display = 'block';
        });

        // Text input handler
        backTextInput.addEventListener('input', function() {
            const text = this.value;
            const maxLength = this.getAttribute('maxlength');
            backTextCount.textContent = `${text.length}/${maxLength}`;

            // Update the preview based on selected position
            const selectedPosition = document.querySelector('input[name="backTextPosition"]:checked');
            if (selectedPosition) {
                if (selectedPosition.value === 'above') {
                    backPreviewTopCaption.textContent = text;
                    backPreviewBottomCaption.textContent = '';
                } else if (selectedPosition.value === 'below') {
                    backPreviewTopCaption.textContent = '';
                    backPreviewBottomCaption.textContent = text;
                } else {
                    backPreviewTopCaption.textContent = '';
                    backPreviewBottomCaption.textContent = '';
                }
            }
        });

        // Position selection handler
        backTextPositions.forEach(position => {
            position.addEventListener('change', function() {
                const text = backTextInput.value;
                backPreviewTopCaption.textContent = '';
                backPreviewBottomCaption.textContent = '';
                
                if (this.value === 'above') {
                    backPreviewTopCaption.textContent = text;
                    document.getElementById('backTextInput').style.display = 'block';
                } else if (this.value === 'below') {
                    backPreviewBottomCaption.textContent = text;
                    document.getElementById('backTextInput').style.display = 'block';
                } else {
                    document.getElementById('backTextInput').style.display = 'none';
                }
            });
        });
    }

    // Front design method elements
    const frontDesignMethods = document.querySelectorAll('input[name="frontDesignMethod"]');
    const uploadContent = document.getElementById('uploadContent');
    const archiveContent = document.getElementById('archiveContent');
    const aiContent = document.getElementById('aiContent');
    const frontTextSection = document.getElementById('frontTextSection');
    
    // Back design elements
    const designContainer = document.getElementById('designContainer');
    const backTextSection = document.getElementById('backTextSection');

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

    // Back design selection handler
    designContainer.addEventListener('change', function(e) {
        if (e.target.name === 'selectedDesign') {
            backTextSection.style.display = 'block';
        }
    });

    // Show back text section when design is loaded
    const designImage = document.getElementById('designImage');
    const backPreviewImage = document.getElementById('backPreviewImage');
    
    designImage.addEventListener('load', function() {
        if (designContainer.querySelector('input[name="selectedDesign"]:checked')) {
            backTextSection.style.display = 'block';
            // Update preview image
            backPreviewImage.src = designImage.src;
        }
    });
    
    // Initialize back text functionality
    initBackText();

    // Front design method handlers
    frontDesignMethods.forEach(method => {
        method.addEventListener('change', function() {
            // Hide all content sections first
            uploadContent.style.display = 'none';
            archiveContent.style.display = 'none';
            aiContent.style.display = 'none';
            
            // Show the relevant content section based on selection
            switch(this.value) {
                case 'upload':
                    uploadContent.style.display = 'block';
                    frontTextSection.style.display = 'block';
                    break;
                case 'archive':
                    archiveContent.style.display = 'block';
                    frontTextSection.style.display = 'block';
                    break;
                case 'ai':
                    aiContent.style.display = 'block';
                    frontTextSection.style.display = 'block';
                    break;
            }
        });
    });

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

        // Step 3: AI Generated Designs - automatically validated
        if (currentStep === 2) {
            return true; // Skip validation as design is auto-selected
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
            
            // If moving to step 3, start generating design automatically
            if (currentStep === 2) {
                generateNewDesign();
            }
        }
    });

    prevBtn.addEventListener('click', () => {
        currentStep--;
        updateStepVisibility();
        window.scrollTo(0, 0);
    });

    // Design generation function
    async function generateNewDesign() {
        console.log('Starting design generation');

        // Get elements
        const loadingDesigns = document.getElementById('loadingDesigns');
        const designContainer = document.getElementById('designContainer');
        const designImage = document.getElementById('designImage');
        const regenerateSection = document.querySelector('.regenerate-section');
        const regenerateBtn = document.getElementById('regenerateBtn');
        const designImprovement = document.getElementById('designImprovement');
        const textOverlaySection = document.getElementById('textOverlaySection');
        
        // Show loading and hide other elements
        if (loadingDesigns) loadingDesigns.style.display = 'block';
        if (designContainer) designContainer.style.display = 'none';
        if (regenerateSection) regenerateSection.style.display = 'none';
        if (regenerateBtn) regenerateBtn.disabled = true;
        if (designImprovement) designImprovement.style.display = 'none';
        if (textOverlaySection) textOverlaySection.style.display = 'none';

        try {
            // Simulate API call to generate designs (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2 second delay

            // Simulate generating a new design
            await new Promise(resolve => setTimeout(resolve, 3000));

            if (designImage) {
                // Set the design image to a placeholder image
                designImage.src = 'https://placehold.co/600x600/667eea/ffffff?text=AI+Design';
                designImage.alt = 'AI Generated T-shirt Design';
                
                // Automatically select the design
                const selectedDesignInput = document.createElement('input');
                selectedDesignInput.type = 'radio';
                selectedDesignInput.name = 'selectedDesign';
                selectedDesignInput.value = 'design1';
                selectedDesignInput.checked = true;
                selectedDesignInput.style.display = 'none';
                designContainer.appendChild(selectedDesignInput);
                
                // Enable the next button
                const nextButton = document.getElementById('nextBtn');
                if (nextButton) nextButton.disabled = false;
                
                // Hide loading and show all relevant sections
                loadingDesigns.style.display = 'none';
                designContainer.style.display = 'block';
                regenerateSection.style.display = 'block';
                if (regenerateBtn) regenerateBtn.disabled = false;
                designImprovement.style.display = 'block';
                textOverlaySection.style.display = 'block';
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
                // Re-enable the regenerate button
                if (regenerateBtn) regenerateBtn.disabled = false;
                
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
    const frontOverlayTextInput = document.getElementById('frontOverlayTextInput');
    const topCaption = document.getElementById('previewTopCaption');
    const bottomCaption = document.getElementById('previewBottomCaption');

    // Function to update text display
    function updateTextDisplay() {
        const position = document.querySelector('input[name="frontTextPosition"]:checked').value;
        const text = overlayTextInput ? overlayTextInput.value : '';

        // Show/hide text input
        if (frontOverlayTextInput) {
            frontOverlayTextInput.style.display = position === 'none' ? 'none' : 'block';
        }

        // Update preview captions
        if (topCaption && bottomCaption) {
            if (position === 'above') {
                topCaption.textContent = text;
                bottomCaption.textContent = '';
            } else if (position === 'below') {
                bottomCaption.textContent = text;
                topCaption.textContent = '';
            } else {
                topCaption.textContent = '';
                bottomCaption.textContent = '';
            }
        }
    }

    // Event listeners
    textPositionInputs.forEach(input => {
        input.addEventListener('change', updateTextDisplay);
    });

    if (overlayTextInput) {
        overlayTextInput.addEventListener('input', updateTextDisplay);
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

    // Event listeners for design generation
    const regenerateBtn = document.getElementById('regenerateBtn');
    if (designBtn) {
        designBtn.addEventListener('click', handleFrontDesignGeneration);
    }
    if (backDesignBtn) {
        backDesignBtn.addEventListener('click', handleBackDesignGeneration);
    }
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', generateNewDesign);
    }
    
    // Front design generation handler
    async function handleFrontDesignGeneration(event) {
        event.preventDefault();
        console.log('Starting front design generation');
        const aiFrontResults = document.getElementById('aiFrontResults');
        const aiFront1 = document.getElementById('aiFront1');
        const aiFront2 = document.getElementById('aiFront2');
        const aiFront3 = document.getElementById('aiFront3');
        // Show loading (optional: you can add a spinner)
        if (aiFrontResults) aiFrontResults.style.display = 'block';
        // Set placeholder images
        if (aiFront1) aiFront1.src = 'https://placehold.co/200x200/667eea/fff?text=AI+1';
        if (aiFront2) aiFront2.src = 'https://placehold.co/200x200/667eea/fff?text=AI+2';
        if (aiFront3) aiFront3.src = 'https://placehold.co/200x200/667eea/fff?text=AI+3';
        // Auto-select the first design
        const aiFrontRadio1 = document.querySelector('input[name="aiFrontDesign"][value="ai1"]');
        if (aiFrontRadio1) aiFrontRadio1.checked = true;
        // Optionally, update the preview icon
        const previewIcon = document.getElementById('previewIcon');
        if (previewIcon && aiFront1) {
            previewIcon.innerHTML = `<img src="${aiFront1.src}" alt="AI Front Design">`;
        }
    }

    // Front design generation handler
    async function handleFrontDesignGeneration(event) {
        event.preventDefault();
        console.log('Starting front design generation');
        // ... implementation for front design
    }

    // Back design generation handler
    async function handleBackDesignGeneration(event) {
        event.preventDefault();
        console.log('Starting back design generation');

        const loadingDesigns = document.getElementById('loadingDesigns');
        const designsGrid = document.getElementById('designsGrid');
        const designImprovement = document.getElementById('designImprovement');
        const textOverlaySection = document.getElementById('textOverlaySection');
        
        // Show loading and hide other sections
        if (loadingDesigns) loadingDesigns.style.display = 'block';
        if (designsGrid) designsGrid.style.display = 'none';
        if (designImprovement) designImprovement.style.display = 'none';
        if (textOverlaySection) textOverlaySection.style.display = 'none';

        try {
            // Hide the generate button while loading
            event.target.style.display = 'none';

            // Simulate API call to generate designs (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2 second delay

            // Generate 3 sample designs (using default image for now)
            const designs = [
                { id: 'design1', imgSrc: '/images/default-tshirt.png' },
                { id: 'design2', imgSrc: '/images/default-tshirt.png' },
                { id: 'design3', imgSrc: '/images/default-tshirt.png' }
            ];

            // Clear and populate designs grid

    if (uploadLabel && fileInput) {
        uploadLabel.addEventListener('click', function(e) {
            e.preventDefault();
            fileInput.click();
        });
    }

            if (designsGrid) {
                designsGrid.innerHTML = '';
                
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

                // Hide loading and show sections
                loadingDesigns.style.display = 'none';
                designsGrid.style.display = 'grid';
                designImprovement.style.display = 'block';
                textOverlaySection.style.display = 'block';

                // Add click handlers for the new design options
                const designOptions = designsGrid.querySelectorAll('input[name="selectedDesign"]');
                designOptions.forEach(option => {
                    option.addEventListener('change', function() {
                        // Enable the next button when a design is selected
                        const nextButton = document.getElementById('nextBtn');
                        if (nextButton) nextButton.disabled = false;
                    });
                });
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
            }
        } finally {
            // Show the generate button again after error or success
            event.target.style.display = 'block';
        }
    }
})();
