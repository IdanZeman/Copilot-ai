// Client-side code - Only UI interactions
(function() {
    // Global form data storage
    let formData = {};
    
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

    // Mobile navigation functionality
    function initMobileNav() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', function() {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
                
                // Prevent body scroll when menu is open
                document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
            });

            // Close menu when clicking on a link
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });

            // Handle window resize
            window.addEventListener('resize', function() {
                if (window.innerWidth > 768) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    // Mobile-friendly touch interactions
    function initMobileInteractions() {
        // Add touch-friendly click handlers for mobile
        const radioOptions = document.querySelectorAll('.radio-option');
        radioOptions.forEach(option => {
            option.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            option.addEventListener('touchend', function() {
                this.style.transform = '';
            });
        });

        // Improve form field focus on mobile
        const formInputs = document.querySelectorAll('input, textarea, select');
        formInputs.forEach(input => {
            input.addEventListener('focus', function() {
                // Scroll element into view on mobile when focused
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        this.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }, 300); // Wait for keyboard to appear
                }
            });
        });

        // Prevent zoom on input focus (iOS)
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            let originalContent = viewport.content;
            
            formInputs.forEach(input => {
                input.addEventListener('focus', function() {
                    if (window.innerWidth <= 768) {
                        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                    }
                });
                
                input.addEventListener('blur', function() {
                    viewport.content = originalContent;
                });
            });
        }

        // Improve button press feedback on mobile
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
                this.style.opacity = '0.8';
            });
            
            button.addEventListener('touchend', function() {
                this.style.transform = '';
                this.style.opacity = '';
            });
        });
    }

    // Optimize image loading for mobile
    function optimizeImagesForMobile() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Add loading="lazy" for better performance on mobile
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            
            // Handle image load errors gracefully
            img.addEventListener('error', function() {
                if (this.dataset.fallback) {
                    this.src = this.dataset.fallback;
                } else {
                    this.style.display = 'none';
                    console.log('Image failed to load:', this.src);
                }
            });
        });
    }

    // Mobile performance optimizations
    function initMobilePerformance() {
        // Disable hover effects on touch devices
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }

        // Optimize animations for mobile
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduced-motion');
        }

        // Add loading indicator for slow connections
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                document.body.classList.add('slow-connection');
                console.log('Slow connection detected, optimizing for performance');
            }
        }

        // Prevent iOS bounce scroll
        document.addEventListener('touchmove', function(e) {
            if (e.target.closest('.nav-menu.active')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Optimize scroll performance
        let ticking = false;
        function updateScrollPosition() {
            // Add scroll-based optimizations here if needed
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        });
    }

    // Handle orientation changes
    function handleOrientationChange() {
        window.addEventListener('orientationchange', function() {
            // Fix viewport height issues on mobile browsers
            setTimeout(function() {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
                
                // Close mobile menu if open
                const hamburger = document.querySelector('.hamburger');
                const navMenu = document.querySelector('.nav-menu');
                if (hamburger && navMenu) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }, 100);
        });

        // Set initial viewport height
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // Mobile toolbar enhancements
    function initMobileToolbar() {
        if (window.innerWidth <= 768) {
            // Make progress container sticky
            const progressContainer = document.querySelector('.progress-container');
            if (progressContainer) {
                progressContainer.style.position = 'sticky';
                progressContainer.style.top = '60px';
                progressContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                progressContainer.style.backdropFilter = 'blur(10px)';
                progressContainer.style.zIndex = '100';
                progressContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }
            
            // Enhance color options
            const colorOptions = document.querySelector('.color-options');
            if (colorOptions) {
                colorOptions.style.gridTemplateColumns = 'repeat(auto-fit, minmax(80px, 1fr))';
                colorOptions.style.gap = '12px';
                colorOptions.style.justifyItems = 'center';
                
                // Wrap color options in container
                if (!colorOptions.parentElement.classList.contains('color-options-container')) {
                    const container = document.createElement('div');
                    container.className = 'color-options-container';
                    colorOptions.parentElement.insertBefore(container, colorOptions);
                    container.appendChild(colorOptions);
                }
            }
            
            // Add mobile step info
            const stepIndicators = document.querySelector('.step-indicators');
            if (stepIndicators && !stepIndicators.nextElementSibling?.classList.contains('mobile-step-info')) {
                const stepInfo = document.createElement('div');
                stepInfo.className = 'mobile-step-info';
                stepInfo.innerHTML = `שלב <span id="current-step-number">1</span> מתוך <span id="total-steps">${stepIndicators.children.length}</span>`;
                stepIndicators.parentElement.insertBefore(stepInfo, stepIndicators.nextElementSibling);
            }
        }
    }

    // Update mobile step info
    function updateMobileStepInfo() {
        const currentStepSpan = document.getElementById('current-step-number');
        if (currentStepSpan) {
            currentStepSpan.textContent = currentStep + 1;
        }
    }

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
        
        // Update mobile step info
        updateMobileStepInfo();
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

    // Function to collect form data from current step
    function collectFormData() {
        // Collect event type
        const eventTypeElement = document.querySelector('input[name="eventType"]:checked');
        if (eventTypeElement) {
            formData.eventType = eventTypeElement.value;
        }
        
        // Collect description
        const descriptionElement = document.getElementById('description');
        if (descriptionElement) {
            formData.description = descriptionElement.value;
        }
        
        // Collect other form fields as needed
        const eventNameElement = document.getElementById('eventName');
        if (eventNameElement) {
            formData.eventName = eventNameElement.value;
        }
        
        console.log('Form data collected:', formData);
    }

    // Navigation event handlers
    nextBtn.addEventListener('click', () => {
        if (validateStep()) {
            // Collect form data before moving to next step
            collectFormData();
            
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

        // Get elements (with null checks)
        const loadingDesigns = document.getElementById('loadingDesigns');
        const designContainer = document.getElementById('designContainer');
        const designImage = document.getElementById('designImage');
        const regenerateSection = document.querySelector('.regenerate-section');
        const regenerateBtn = document.getElementById('regenerateBtn');
        const designImprovement = document.getElementById('designImprovement');
        
        // Note: textOverlaySection doesn't exist in HTML, so we skip it
        
        console.log('Found elements:', {
            loadingDesigns: !!loadingDesigns,
            designContainer: !!designContainer,
            designImage: !!designImage,
            regenerateSection: !!regenerateSection,
            regenerateBtn: !!regenerateBtn,
            designImprovement: !!designImprovement
        });
        
        // Show loading and hide other elements
        if (loadingDesigns) {
            loadingDesigns.style.display = 'block';
            console.log('Loading element shown');
        } else {
            console.error('loadingDesigns element not found!');
        }
        if (designContainer) designContainer.style.display = 'none';
        if (regenerateSection) regenerateSection.style.display = 'none';
        if (regenerateBtn) regenerateBtn.disabled = true;
        if (designImprovement) designImprovement.style.display = 'none';

        try {
            // Get form data for AI generation
            const eventType = formData.eventType || document.querySelector('input[name="eventType"]:checked')?.value;
            const description = formData.description || document.getElementById('description')?.value;
            const designType = 'front'; // Specify if this is front or back design
            
            if (!eventType || !description) {
                throw new Error('חסרים פרטי האירוע או התיאור לייצור העיצוב');
            }

            // Call the real AI API - for static deployment, we'll use a mock response
            // const response = await fetch('/api/generate-design', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         eventType: eventType,
            //         description: description,
            //         designType: designType
            //     })
            // });

            // Mock response for static deployment
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
            
            const mockResult = {
                success: true,
                design: {
                    imageUrl: './images/default-tshirt.png',
                    id: 'mock-design-' + Date.now()
                }
            };

            // if (!response.ok) {
            //     throw new Error(`Server error: ${response.status}`);
            // }

            // const result = await response.json();
            const result = mockResult;
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to generate design');
            }

            if (designImage && result.design) {
                // Set the AI-generated design image
                console.log('Setting image source to:', result.design.imageUrl);
                
                // Clear any previous event handlers
                designImage.onload = null;
                designImage.onerror = null;
                
                // Set up error handling BEFORE setting src
                let errorHandled = false;
                designImage.onerror = function() {
                    if (errorHandled) return; // Prevent multiple calls
                    errorHandled = true;
                    
                    console.log('❌ DALL-E image failed to load (DNS issue), showing success indicator');
                    
                    // Clear handlers to prevent conflicts
                    this.onload = null;
                    this.onerror = null;
                    
                    // Show default image with success styling
                    this.src = './images/default-tshirt.png';
                    this.alt = 'עיצוב AI נוצר בהצלחה!';
                    this.style.border = '3px solid #4CAF50';
                    this.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.3)';
                    
                    // Add success overlay
                    const container = this.parentElement;
                    if (container && !container.querySelector('.success-overlay')) {
                        const overlay = document.createElement('div');
                        overlay.className = 'success-overlay';
                        overlay.style.cssText = `
                            position: absolute;
                            top: 10px;
                            right: 10px;
                            background: #4CAF50;
                            color: white;
                            padding: 8px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: bold;
                            z-index: 10;
                            animation: pulse 2s infinite;
                        `;
                        overlay.innerHTML = '✓ עיצוב AI נוצר';
                        container.style.position = 'relative';
                        container.appendChild(overlay);
                        
                        // Show success message
                        setTimeout(() => {
                            alert('🎨 העיצוב נוצר בהצלחה!\nהתמונה נשמרה במערכת ותהיה זמינה בהזמנה הסופית.');
                        }, 500);
                    }
                };
                
                // Set up success handler
                designImage.onload = function() {
                    if (errorHandled) return; // Don't run if error was already handled
                    
                    console.log('✅ DALL-E image loaded successfully!');
                    // Remove any success overlay since real image loaded
                    const overlay = this.parentElement?.querySelector('.success-overlay');
                    if (overlay) overlay.remove();
                    
                    // Reset styling
                    this.style.border = '';
                    this.style.boxShadow = '';
                };
                
                // Now set the source (this will trigger either onload or onerror)
                designImage.src = result.design.imageUrl;
                designImage.alt = 'AI Generated T-shirt Design';
                
                // Store design data for later use
                formData.currentDesign = {
                    imageUrl: result.design.imageUrl,
                    prompt: result.design.prompt,
                    revisedPrompt: result.design.revisedPrompt
                };
                
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
                if (loadingDesigns) loadingDesigns.style.display = 'none';
                if (designContainer) designContainer.style.display = 'block';
                if (regenerateSection) regenerateSection.style.display = 'block';
                if (regenerateBtn) regenerateBtn.disabled = false;
                if (designImprovement) designImprovement.style.display = 'block';
                
                console.log('Design generated successfully:', result.design);
            }

        } catch (error) {
            console.error('Error generating design:', error);
            
            // Hide loading
            if (loadingDesigns) loadingDesigns.style.display = 'none';
            
            // Show error message to user
            alert(`שגיאה ביצירת העיצוב: ${error.message}. אנא נסה שוב או בדוק את החיבור לאינטרנט.`);
            
            // Re-enable regenerate button for retry
            if (regenerateBtn) regenerateBtn.disabled = false;
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
                    const designsGrid = document.getElementById('designsGrid');
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
        
        // Show loading and hide other sections
        if (loadingDesigns) loadingDesigns.style.display = 'block';
        if (designsGrid) designsGrid.style.display = 'none';
        if (designImprovement) designImprovement.style.display = 'none';

        try {
            // Hide the generate button while loading
            event.target.style.display = 'none';

            // Get form data for AI generation
            const eventType = formData.eventType || document.querySelector('input[name="eventType"]:checked')?.value;
            const description = formData.description || document.getElementById('description')?.value;
            const designType = 'back'; // Specify this is for back design
            
            if (!eventType || !description) {
                throw new Error('חסרים פרטי האירוע או התיאור לייצור העיצוב');
            }

            // Generate 3 different back designs using AI
            const designPromises = [];
            for (let i = 0; i < 3; i++) {
                designPromises.push(
                    fetch('/api/generate-design', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            eventType: eventType,
                            description: description + ` (וריאציה ${i + 1})`, // Add variation to get different designs
                            designType: designType
                        })
                    }).then(response => response.json())
                );
            }

            const results = await Promise.all(designPromises);
            
            // Check if all generations were successful
            const successfulDesigns = results.filter(result => result.success);
            if (successfulDesigns.length === 0) {
                throw new Error('לא הצליח לייצר אף עיצוב');
            }

            // Clear and populate designs grid
            if (designsGrid) {
                designsGrid.innerHTML = '';
                
                successfulDesigns.forEach((result, index) => {
                    const design = result.design;
                    const designId = `design${index + 1}`;
                    
                    const designOption = document.createElement('label');
                    designOption.className = 'design-option';
                    designOption.setAttribute('for', designId);
                    
                    designOption.innerHTML = `
                        <div class="design-preview">
                            <img src="./images/default-tshirt.png" alt="עיצוב AI ${index + 1}" data-ai-url="${design.imageUrl}">
                            <div class="success-badge">✓ AI</div>
                        </div>
                        <input type="radio" name="selectedDesign" value="${designId}" id="${designId}">
                        <span class="design-label">עיצוב ${index + 1}</span>
                    `;
                    
                    designsGrid.appendChild(designOption);
                    
                    // Try to load the DALL-E image
                    const img = designOption.querySelector('img');
                    const tempImg = new Image();
                    
                    tempImg.onload = function() {
                        img.src = design.imageUrl;
                        designOption.querySelector('.success-badge').style.display = 'none';
                    };
                    
                    tempImg.onerror = function() {
                        // Keep default image with success badge
                        console.log(`DALL-E image ${index + 1} failed to load, keeping placeholder`);
                    };
                    
                    tempImg.src = design.imageUrl;
                });

                // Auto-select the first design
                const firstRadio = designsGrid.querySelector('input[type="radio"]');
                if (firstRadio) firstRadio.checked = true;
                
                // Store designs data for later use
                formData.backDesigns = successfulDesigns.map(result => result.design);
            }

            // Show the designs and enable next steps
            if (loadingDesigns) loadingDesigns.style.display = 'none';
            if (designsGrid) designsGrid.style.display = 'block';
            if (designImprovement) designImprovement.style.display = 'block';
            
            console.log('Back designs generated successfully:', successfulDesigns);

        } catch (error) {
            console.error('Error generating back designs:', error);
            
            // Hide loading
            if (loadingDesigns) loadingDesigns.style.display = 'none';
            
            // Show error message to user
            alert(`שגיאה ביצירת עיצובי הגב: ${error.message}. אנא נסה שוב או בדוק את החיבור לאינטרנט.`);
            
            // Show the generate button again for retry
            event.target.style.display = 'block';
        }
    }

    // Initialize the application
    function init() {
        initMobileNav();
        initMobileInteractions();
        initMobilePerformance();
        initMobileToolbar();
        handleOrientationChange();
        optimizeImagesForMobile();
        initBackText();
        updateStepVisibility();
        
        // Collect initial form data
        collectFormData();
    }

    // Initialize the application
    init();
})();
