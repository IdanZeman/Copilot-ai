import React, { useState, useEffect } from 'react'
import { useMetaTags } from '../hooks/usePageTitle'
import { useNotifications } from '../contexts/NotificationContext'
import { useAuth } from '../contexts/AuthContext'
import { AuthRequiredModal } from './LoginButton'
import Navbar from './Navbar'

const DesignFormPage = () => {
  // SEO Meta tags
  useMetaTags({
    title: 'עיצוב חולצה חדשה',
    description: 'צור עיצוב ייחודי לחולצה שלך בעזרת בינה מלאכותית. בחר סוג אירוע, תאר את הרעיון שלך וקבל עיצוב מותאם אישית.',
    keywords: 'עיצוב חולצה, AI design, הדפסה על חולצות, עיצוב מותאם אישית'
  })

  // Authentication
  const { isLoggedIn, requireAuth, user } = useAuth()
  
  // Notifications
  const { showSuccess, showError } = useNotifications()

  // Auth required modal state
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Check if user is logged in - if not, show auth requirement
  useEffect(() => {
    if (!isLoggedIn) {
      setShowAuthModal(true)
    }
  }, [isLoggedIn])

  // If not logged in, show auth modal instead of the form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <i className="fas fa-lock text-4xl text-blue-500 mb-4"></i>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">נדרשת התחברות</h2>
              <p className="text-gray-600">
                כדי להתחיל לעצב חולצה, עליך להתחבר תחילה
              </p>
            </div>
            <AuthRequiredModal 
              isOpen={showAuthModal} 
              onClose={() => setShowAuthModal(false)}
              title="נדרשת התחברות לעיצוב חולצה"
              message="כדי להתחיל בתהליך העיצוב ולשמור את ההזמנה שלך, עליך להתחבר תחילה"
            />
          </div>
        </div>
      </div>
    )
  }

  // State for form data
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    eventType: '',
    customEventType: '',
    description: '',
    selectedDesign: null,
    improvementPrompt: '',
    backTextPosition: 'none',
    backText: '',
    frontDesignMethod: 'ai',
    frontTextPosition: 'none',
    frontText: '',
    selectedSymbol: '',
    selectedSymbolCategory: '',
    uploadedImage: null,
    frontDesign: null,
    shirtColor: '',
    printColor: '',
    sizes: [],
    fullName: '',
    phone: '',
    email: '',
    preferredDate: '',
    notes: ''
  })

  // Event type options
  const eventTypes = [
    { value: 'military', icon: 'fas fa-shield-alt', label: 'צבאי' },
    { value: 'family', icon: 'fas fa-home', label: 'משפחתי' },
    { value: 'wedding', icon: 'fas fa-heart', label: 'חתונה' },
    { value: 'corporate', icon: 'fas fa-building', label: 'עסקי' },
    { value: 'birthday', icon: 'fas fa-birthday-cake', label: 'יום הולדת' },
    { value: 'sports', icon: 'fas fa-football-ball', label: 'ספורט' },
    { value: 'other', icon: 'fas fa-plus', label: 'אחר' }
  ]

  const steps = [
    'בחירת סוג אירוע',
    'תיאור העיצוב',
    'עיצוב אחורי',
    'עיצוב קדמי',
    'צבעים וכמויות'
  ]

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Generate back design using AI
  const generateBackDesign = async () => {
    setIsGenerating(true)
    
    try {
      // For now, we'll use a mock design generation
      // Later this will be connected to the real AI API
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      // Mock design URL - in real implementation this would come from the AI API
      const mockDesignUrl = '/images/default-tshirt.png'
      
      setFormData(prev => ({
        ...prev,
        selectedDesign: mockDesignUrl
      }))
      
      console.log('✅ Design generated successfully (mock)')
      
    } catch (error) {
      console.error('❌ Error generating design:', error)
      // In a real app, show error notification here
    } finally {
      setIsGenerating(false)
    }
  }

  // Regenerate design
  const regenerateDesign = async () => {
    setFormData(prev => ({
      ...prev,
      selectedDesign: null,
      backText: '',
      backTextPosition: 'none'
    }))
    await generateBackDesign()
  }

  // Generate front design using AI
  const generateFrontDesign = async () => {
    setIsGenerating(true)
    
    try {
      // For now, we'll use a mock design generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock front design URL
      const mockFrontDesignUrl = '/images/default-tshirt.png'
      
      setFormData(prev => ({
        ...prev,
        frontDesign: mockFrontDesignUrl
      }))
      
      console.log('✅ Front design generated successfully (mock)')
      
    } catch (error) {
      console.error('❌ Error generating front design:', error)
    } finally {
      setIsGenerating(false)
    }
  }
  // Submit order
  const submitOrder = async () => {
    // Check authentication before submitting
    if (!requireAuth()) {
      setShowAuthModal(true)
      return
    }

    try {
      // Here we would normally send to backend
      console.log('📤 Submitting order:', formData)
      
      // Mock success - in real app would be API call
      // Show success notification instead of modal
      showSuccess(
        'ההזמנה נשלחה בהצלחה! נחזור אליך בתוך 24 שעות עם אישור ומחיר מדויק.',
        { 
          title: '🎉 הזמנה נשלחה!',
          duration: 6000 
        }
      )
      
      // Redirect to homepage after a short delay
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
      
    } catch (error) {
      console.error('❌ Error submitting order:', error)
      showError('שגיאה בשליחת ההזמנה. אנא נסה שוב.', {
        title: 'שגיאה',
        duration: 8000
      })
    }
  }
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('הקובץ גדול מדי. בחר קובץ קטן מ-5MB')
        return
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('אנא בחר קובץ תמונה (PNG, JPG, GIF)')
        return
      }
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          uploadedImage: {
            file: file,
            preview: e.target.result,
            name: file.name
          }
        }))
      }
      reader.readAsDataURL(file)
    }
  }
  useEffect(() => {
    if (currentStep === 2 && !formData.selectedDesign && !isGenerating && formData.description.trim().length >= 10) {
      generateBackDesign()
    }
  }, [currentStep])

  // Handle step navigation
  const nextStep = () => {
    // Check authentication before proceeding
    if (!isLoggedIn) {
      setShowAuthModal(true)
      return
    }

    // Validate step requirements
    if (currentStep === 1) {
      // Check description minimum length
      if (formData.description.trim().length < 10) {
        showError('תיאור קצר מדי', 'אנא תאר במינימום 10 תווים מה החולצה צריכה לבטא')
        return
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Step 1: Event Type Selection
  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">איזה סוג אירוע?</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {eventTypes.map((type) => (
          <label 
            key={type.value}
            className={`option-card cursor-pointer border-2 rounded-xl p-6 text-center transition-all duration-200 hover:shadow-lg ${
              formData.eventType === type.value 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <input
              type="radio"
              name="eventType"
              value={type.value}
              checked={formData.eventType === type.value}
              onChange={(e) => handleInputChange('eventType', e.target.value)}
              className="sr-only"
            />
            <div className="flex flex-col items-center gap-3">
              <i className={`${type.icon} text-3xl text-blue-600`}></i>
              <span className="font-medium text-gray-800">{type.label}</span>
            </div>
          </label>
        ))}
      </div>

      {/* Custom Event Type Input */}
      {formData.eventType === 'other' && (
        <div className="bg-gray-50 p-6 rounded-xl">
          <label htmlFor="customEventType" className="block text-sm font-medium text-gray-700 mb-2">
            תאר/י את סוג האירוע:
          </label>
          <input
            type="text"
            id="customEventType"
            value={formData.customEventType}
            onChange={(e) => handleInputChange('customEventType', e.target.value)}
            placeholder="לדוגמה: חגיגת סיום, יום גיבוש, אירוע חברה..."
            maxLength="50"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="text-sm text-gray-500 mt-1">
            {formData.customEventType.length}/50
          </div>
        </div>
      )}
    </div>
  )

  // Step 2: Description
  const renderStep2 = () => {
    const descriptionLength = formData.description.trim().length
    const isDescriptionValid = descriptionLength >= 10
    
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">מה החולצה צריכה לבטא?</h2>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <textarea
            id="designPrompt"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="תאר/י במילים שלך מה החולצה צריכה לבטא... (לדוגמה: זוג שמתחתן בשקיעה, צוות לוחמים רצים עם אלונקה, רגע של ניצחון)"
            rows="6"
            maxLength="200"
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
              descriptionLength > 0 && !isDescriptionValid 
                ? 'border-red-300 bg-red-50' 
                : isDescriptionValid 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between items-center mt-2">
            <div className={`text-sm ${
              descriptionLength > 0 && !isDescriptionValid 
                ? 'text-red-600' 
                : isDescriptionValid 
                ? 'text-green-600' 
                : 'text-gray-500'
            }`}>
              {descriptionLength > 0 && !isDescriptionValid && (
                <span className="flex items-center gap-1">
                  <i className="fas fa-exclamation-triangle"></i>
                  נדרש מינימום 10 תווים ({10 - descriptionLength} נוספים)
                </span>
              )}
              {isDescriptionValid && (
                <span className="flex items-center gap-1">
                  <i className="fas fa-check-circle"></i>
                  מעולה! התיאור מספק
                </span>
              )}
              {descriptionLength === 0 && 'מינימום 10 תווים נדרש'}
            </div>
            <div className="text-sm text-gray-500">
              {formData.description.length}/200
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>דוגמאות:</strong> "חברי היחידה רצים יחד עם דגל", "זוג רוקד מתחת לכוכבים", 
            "ילדים משחקים כדורגל בשקיעה", "צוות עובדים בונה ביחד"
          </p>
        </div>
      </div>
    )
  }

  // Step 3: Back Design Generation
  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">בחר/י עיצוב לחלק האחורי של החולצה</h2>
      
      {/* Generate Design Button */}
      {!formData.selectedDesign && (
        <div className="text-center">
          <button
            onClick={generateBackDesign}
            disabled={isGenerating}
            className={`px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 ${
              isGenerating
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isGenerating ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                יוצר עיצוב...
              </>
            ) : (
              <>
                <i className="fas fa-magic mr-2"></i>
                צור עיצוב עכשיו
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="bg-blue-50 p-8 rounded-xl text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-blue-800 font-medium">יוצר עיצובים מותאמים אישית עבורך...</p>
          <p className="text-blue-600 text-sm mt-2">זה לוקח כמה שניות...</p>
        </div>
      )}

      {/* Generated Design Display */}
      {formData.selectedDesign && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-center">העיצוב שנוצר עבורך</h3>
          <div className="flex justify-center mb-4">
            <div className="relative bg-gray-100 p-4 rounded-lg">
              <img 
                src={formData.selectedDesign} 
                alt="עיצוב מותאם אישית" 
                className="max-w-xs max-h-64 object-contain"
              />
            </div>
          </div>
          
          {/* Regenerate Button */}
          <div className="text-center mb-6">
            <button
              onClick={regenerateDesign}
              disabled={isGenerating}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
            >
              <i className="fas fa-redo mr-2"></i>
              צור עיצוב חדש
            </button>
          </div>

          {/* Back Text Options */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
            <h4 className="text-lg font-semibold mb-6 text-gray-800 text-center">
              <i className="fas fa-font text-blue-600 mr-2"></i>
              רוצה להוסיף טקסט לעיצוב האחורי?
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                formData.backTextPosition === 'none' 
                  ? 'border-blue-500 bg-blue-100 text-blue-800' 
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
              }`}>
                <input
                  type="radio"
                  name="backTextPosition"
                  value="none"
                  checked={formData.backTextPosition === 'none'}
                  onChange={(e) => handleInputChange('backTextPosition', e.target.value)}
                  className="sr-only"
                />
                <div className="flex flex-col items-center">
                  <i className="fas fa-ban text-2xl mb-2 text-gray-600"></i>
                  <span className="font-medium">ללא טקסט</span>
                </div>
              </label>
              
              <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                formData.backTextPosition === 'above' 
                  ? 'border-blue-500 bg-blue-100 text-blue-800' 
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
              }`}>
                <input
                  type="radio"
                  name="backTextPosition"
                  value="above"
                  checked={formData.backTextPosition === 'above'}
                  onChange={(e) => handleInputChange('backTextPosition', e.target.value)}
                  className="sr-only"
                />
                <div className="flex flex-col items-center">
                  <i className="fas fa-arrow-up text-2xl mb-2 text-blue-600"></i>
                  <span className="font-medium">טקסט מעל העיצוב</span>
                </div>
              </label>
              
              <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                formData.backTextPosition === 'below' 
                  ? 'border-blue-500 bg-blue-100 text-blue-800' 
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
              }`}>
                <input
                  type="radio"
                  name="backTextPosition"
                  value="below"
                  checked={formData.backTextPosition === 'below'}
                  onChange={(e) => handleInputChange('backTextPosition', e.target.value)}
                  className="sr-only"
                />
                <div className="flex flex-col items-center">
                  <i className="fas fa-arrow-down text-2xl mb-2 text-blue-600"></i>
                  <span className="font-medium">טקסט מתחת לעיצוב</span>
                </div>
              </label>
            </div>

            {/* Text Input */}
            {formData.backTextPosition !== 'none' && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  הטקסט שלך:
                </label>
                <input
                  type="text"
                  value={formData.backText}
                  onChange={(e) => handleInputChange('backText', e.target.value)}
                  placeholder="לדוגמה: יחידת הצנחנים 2024, משפחת כהן, צוות הניצחון..."
                  maxLength="30"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-medium"
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500">
                    {formData.backText.length}/30 תווים
                  </div>
                  <div className="text-xs text-blue-600">
                    💡 טיפ: טקסט קצר ויעיל נראה הכי טוב
                  </div>
                </div>
              </div>
            )}

            {/* Preview Section */}
            {formData.backTextPosition !== 'none' && (
              <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border-2 border-dashed border-blue-300">
                <h5 className="text-center text-sm font-semibold text-blue-800 mb-4 flex items-center justify-center">
                  <i className="fas fa-eye mr-2"></i>
                  תצוגה מקדימה - חלק אחורי של החולצה
                </h5>
                <div className="bg-gradient-to-b from-gray-100 to-gray-200 p-8 rounded-lg text-center relative min-h-80 flex flex-col justify-center items-center">
                  {formData.backTextPosition === 'above' && formData.backText && (
                    <div className="mb-6 text-xl font-bold text-gray-800 px-4 py-2 bg-white/80 rounded-lg shadow-sm">
                      {formData.backText}
                    </div>
                  )}
                  
                  {/* Design Preview */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="relative bg-white rounded-lg shadow-lg p-4 border-2 border-gray-300">
                      <img 
                        src={formData.selectedDesign} 
                        alt="עיצוב אחורי" 
                        className="w-32 h-32 object-contain"
                      />
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        עיצוב AI
                      </div>
                    </div>
                  </div>
                  
                  {formData.backTextPosition === 'below' && formData.backText && (
                    <div className="mt-6 text-xl font-bold text-gray-800 px-4 py-2 bg-white/80 rounded-lg shadow-sm">
                      {formData.backText}
                    </div>
                  )}
                  
                  {/* T-shirt outline for context */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="w-full h-full border-4 border-gray-300 border-dashed rounded-lg opacity-30"></div>
                  </div>
                </div>
                
                {formData.backText && (
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        נראה מעולה! מוכן להמשיך
                      <i className="fas fa-check-circle ml-1"></i>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">עיצוב החלק הקדמי של החולצה</h2>
      
      {/* Front Design Method Selection */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 text-center">
          <i className="fas fa-palette text-blue-600 mr-2"></i>
          איך תרצה לעצב את החלק הקדמי?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <label className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 text-center ${
            formData.frontDesignMethod === 'ai' 
              ? 'border-blue-500 bg-blue-100 text-blue-800' 
              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
          }`}>
            <input
              type="radio"
              name="frontDesignMethod"
              value="ai"
              checked={formData.frontDesignMethod === 'ai'}
              onChange={(e) => handleInputChange('frontDesignMethod', e.target.value)}
              className="sr-only"
            />
            <div className="flex flex-col items-center">
              <i className="fas fa-robot text-3xl mb-3 text-purple-600"></i>
              <span className="font-semibold text-lg mb-2">עיצוב AI</span>
              <span className="text-sm text-gray-600">יצירה אוטומטית בעזרת בינה מלאכותית</span>
            </div>
          </label>
          
          <label className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 text-center ${
            formData.frontDesignMethod === 'upload' 
              ? 'border-blue-500 bg-blue-100 text-blue-800' 
              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
          }`}>
            <input
              type="radio"
              name="frontDesignMethod"
              value="upload"
              checked={formData.frontDesignMethod === 'upload'}
              onChange={(e) => handleInputChange('frontDesignMethod', e.target.value)}
              className="sr-only"
            />
            <div className="flex flex-col items-center">
              <i className="fas fa-upload text-3xl mb-3 text-green-600"></i>
              <span className="font-semibold text-lg mb-2">העלאת תמונה</span>
              <span className="text-sm text-gray-600">העלה לוגו או תמונה קיימת</span>
            </div>
          </label>
          
          <label className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 text-center ${
            formData.frontDesignMethod === 'symbols' 
              ? 'border-blue-500 bg-blue-100 text-blue-800' 
              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
          }`}>
            <input
              type="radio"
              name="frontDesignMethod"
              value="symbols"
              checked={formData.frontDesignMethod === 'symbols'}
              onChange={(e) => handleInputChange('frontDesignMethod', e.target.value)}
              className="sr-only"
            />
            <div className="flex flex-col items-center">
              <i className="fas fa-star text-3xl mb-3 text-yellow-600"></i>
              <span className="font-semibold text-lg mb-2">ארכיון סמלים</span>
              <span className="text-sm text-gray-600">בחירה מארכיון סמלים מוכנים</span>
            </div>
          </label>
        </div>

        {/* AI Design Option */}
        {formData.frontDesignMethod === 'ai' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="font-semibold text-lg mb-4 text-center text-purple-800">
              <i className="fas fa-magic mr-2"></i>
              עיצוב אוטומטי לחלק הקדמי
            </h4>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-purple-800 mb-4">
                <i className="fas fa-lightbulb mr-2"></i>
                האלגוריתם יצור עיצוב קדמי שמתאים לעיצוב האחורי ולאירוע שלך
              </p>
              <button 
                onClick={generateFrontDesign}
                disabled={isGenerating}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isGenerating 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isGenerating ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    יוצר עיצוב קדמי...
                  </>
                ) : (
                  <>
                    <i className="fas fa-wand-magic-sparkles mr-2"></i>
                    צור עיצוב קדמי אוטומטי
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Upload Option */}
        {formData.frontDesignMethod === 'upload' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="font-semibold text-lg mb-4 text-center text-green-800">
              <i className="fas fa-cloud-upload-alt mr-2"></i>
              העלאת תמונה או לוגו
            </h4>
            
            {!formData.uploadedImage ? (
              <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center bg-green-50">
                <i className="fas fa-file-image text-4xl text-green-600 mb-4"></i>
                <p className="text-green-800 font-medium mb-2">גרור תמונה לכאן או לחץ לבחירה</p>
                <p className="text-green-600 text-sm mb-4">PNG, JPG עד 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 cursor-pointer inline-block"
                >
                  בחר קובץ
                </label>
              </div>
            ) : (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <i className="fas fa-check-circle text-green-600 mr-2"></i>
                    <span className="font-medium text-green-800">הקובץ הועלה בהצלחה</span>
                  </div>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, uploadedImage: null }))}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <i className="fas fa-trash mr-1"></i>
                    הסר
                  </button>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-center mb-2">
                    <img 
                      src={formData.uploadedImage.preview} 
                      alt="תצוגה מקדימה" 
                      className="max-w-32 max-h-32 object-contain rounded"
                    />
                  </div>
                  <p className="text-center text-sm text-gray-600">{formData.uploadedImage.name}</p>
                </div>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600">
                💡 טיפ: תמונות באיכות גבוהה ורקע שקוף יתנו תוצאה הטובה ביותר
              </p>
            </div>
          </div>
        )}

        {/* Symbols Archive Option */}
        {formData.frontDesignMethod === 'symbols' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="font-semibold text-lg mb-4 text-center text-yellow-800">
              <i className="fas fa-archive mr-2"></i>
              בחירה מארכיון הסמלים
            </h4>
            
            {/* Symbol Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { category: 'military', icon: 'fas fa-shield-alt', label: 'צבאי', color: 'green' },
                { category: 'sports', icon: 'fas fa-trophy', label: 'ספורט', color: 'blue' },
                { category: 'corporate', icon: 'fas fa-building', label: 'עסקי', color: 'gray' },
                { category: 'family', icon: 'fas fa-heart', label: 'משפחתי', color: 'red' }
              ].map((cat) => (
                <button 
                  key={cat.category}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-center hover:shadow-md ${
                    cat.color === 'green' ? 'border-green-300 bg-green-50 hover:bg-green-100' :
                    cat.color === 'blue' ? 'border-blue-300 bg-blue-50 hover:bg-blue-100' :
                    cat.color === 'gray' ? 'border-gray-300 bg-gray-50 hover:bg-gray-100' :
                    'border-red-300 bg-red-50 hover:bg-red-100'
                  }`}
                >
                  <i className={`${cat.icon} text-2xl mb-2 ${
                    cat.color === 'green' ? 'text-green-600' :
                    cat.color === 'blue' ? 'text-blue-600' :
                    cat.color === 'gray' ? 'text-gray-600' :
                    'text-red-600'
                  }`}></i>
                  <div className="text-sm font-medium">{cat.label}</div>
                </button>
              ))}
            </div>

            {/* Sample Symbols Grid */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-center text-yellow-800 font-medium mb-4">דוגמאות מהארכיון:</p>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {[
                  '⭐', '🏆', '🎯', '🔥', '💪', '🦅', 
                  '🏅', '⚡', '🎖️', '🔱', '👑', '🏰'
                ].map((symbol, index) => (
                  <div 
                    key={index}
                    onClick={() => handleInputChange('selectedSymbol', symbol)}
                    className={`p-3 rounded-lg text-center text-2xl transition-all duration-200 cursor-pointer border-2 ${
                      formData.selectedSymbol === symbol 
                        ? 'border-yellow-500 bg-yellow-200 shadow-md' 
                        : 'bg-white border-transparent hover:border-yellow-400 hover:shadow-md'
                    }`}
                  >
                    {symbol}
                  </div>
                ))}
              </div>
              {formData.selectedSymbol && (
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                    נבחר: {formData.selectedSymbol}
                    <i className="fas fa-check-circle ml-1"></i>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Front Text Addition */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200 mt-6">
          <h4 className="text-lg font-semibold mb-6 text-gray-800 text-center">
            <i className="fas fa-font text-blue-600 mr-2"></i>
            רוצה להוסיף טקסט לעיצוב הקדמי?
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 text-center ${
              formData.frontTextPosition === 'none' 
                ? 'border-blue-500 bg-blue-100 text-blue-800' 
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
            }`}>
              <input
                type="radio"
                name="frontTextPosition"
                value="none"
                checked={formData.frontTextPosition === 'none'}
                onChange={(e) => handleInputChange('frontTextPosition', e.target.value)}
                className="sr-only"
              />
              <div className="flex flex-col items-center">
                <i className="fas fa-ban text-2xl mb-2 text-gray-600"></i>
                <span className="font-medium">ללא טקסט</span>
              </div>
            </label>
            
            <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 text-center ${
              formData.frontTextPosition === 'above' 
                ? 'border-blue-500 bg-blue-100 text-blue-800' 
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
            }`}>
              <input
                type="radio"
                name="frontTextPosition"
                value="above"
                checked={formData.frontTextPosition === 'above'}
                onChange={(e) => handleInputChange('frontTextPosition', e.target.value)}
                className="sr-only"
              />
              <div className="flex flex-col items-center">
                <i className="fas fa-arrow-up text-2xl mb-2 text-blue-600"></i>
                <span className="font-medium">טקסט מעל העיצוב</span>
              </div>
            </label>
            
            <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 text-center ${
              formData.frontTextPosition === 'below' 
                ? 'border-blue-500 bg-blue-100 text-blue-800' 
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
            }`}>
              <input
                type="radio"
                name="frontTextPosition"
                value="below"
                checked={formData.frontTextPosition === 'below'}
                onChange={(e) => handleInputChange('frontTextPosition', e.target.value)}
                className="sr-only"
              />
              <div className="flex flex-col items-center">
                <i className="fas fa-arrow-down text-2xl mb-2 text-blue-600"></i>
                <span className="font-medium">טקסט מתחת לעיצוב</span>
              </div>
            </label>
          </div>

          {/* Text Input */}
          {formData.frontTextPosition !== 'none' && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                הטקסט שלך:
              </label>
              <input
                type="text"
                value={formData.frontText}
                onChange={(e) => handleInputChange('frontText', e.target.value)}
                placeholder="לדוגמה: יחידת הצנחנים 2024, משפחת כהן, צוות הניצחון..."
                maxLength="30"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-medium"
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-gray-500">
                  {formData.frontText.length}/30 תווים
                </div>
                <div className="text-xs text-blue-600">
                  💡 טיפ: טקסט קצר ויעיל נראה הכי טוב
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Front Preview */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-dashed border-blue-300 mt-6">
          <h5 className="text-center text-sm font-semibold text-blue-800 mb-4 flex items-center justify-center">
            <i className="fas fa-eye mr-2"></i>
            תצוגה מקדימה - חלק קדמי של החולצה
          </h5>
          <div className="bg-gradient-to-b from-gray-100 to-gray-200 p-8 rounded-lg text-center relative min-h-80 flex flex-col justify-center items-center">
            {/* Top Text */}
            {formData.frontTextPosition === 'above' && formData.frontText && (
              <div className="mb-6 text-xl font-bold text-gray-800 px-4 py-2 bg-white/80 rounded-lg shadow-sm">
                {formData.frontText}
              </div>
            )}
            
            {/* Front Design */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative bg-white rounded-lg shadow-lg p-6 border-2 border-gray-300">
                {formData.frontDesignMethod === 'ai' && formData.frontDesign ? (
                  <div className="w-24 h-24 flex items-center justify-center">
                    <img 
                      src={formData.frontDesign} 
                      alt="עיצוב AI קדמי" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : formData.frontDesignMethod === 'ai' ? (
                  <div className="w-24 h-24 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-robot text-3xl text-purple-600"></i>
                  </div>
                ) : formData.frontDesignMethod === 'upload' && formData.uploadedImage ? (
                  <div className="w-24 h-24 flex items-center justify-center">
                    <img 
                      src={formData.uploadedImage.preview} 
                      alt="תמונה שהועלתה" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : formData.frontDesignMethod === 'upload' ? (
                  <div className="w-24 h-24 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-image text-3xl text-green-600"></i>
                  </div>
                ) : formData.selectedSymbol ? (
                  <div className="w-24 h-24 bg-yellow-100 rounded-lg flex items-center justify-center text-4xl">
                    {formData.selectedSymbol}
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-yellow-100 rounded-lg flex items-center justify-center text-3xl">
                    ⭐
                  </div>
                )}
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  קדמי
                </div>
              </div>
            </div>
            
            {/* Bottom Text */}
            {formData.frontTextPosition === 'below' && formData.frontText && (
              <div className="mt-6 text-xl font-bold text-gray-800 px-4 py-2 bg-white/80 rounded-lg shadow-sm">
                {formData.frontText}
              </div>
            )}
            
            {/* T-shirt outline */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full border-4 border-gray-300 border-dashed rounded-lg opacity-30"></div>
            </div>
          </div>
          
          {/* Status indicator */}
          {(formData.frontText || formData.selectedSymbol || formData.uploadedImage) && (
            <div className="mt-4 text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                נראה מעולה! מוכן להמשיך
                <i className="fas fa-check-circle ml-1"></i>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">צבעים, מידות וכמויות</h2>
      
      {/* Color Selection */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border border-red-200">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 text-center">
          <i className="fas fa-palette text-red-600 mr-2"></i>
          בחר צבע חולצה
        </h3>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
          {[
            { name: 'לבן', color: '#FFFFFF', border: 'border-gray-300' },
            { name: 'שחור', color: '#000000', border: 'border-gray-700' },
            { name: 'אדום', color: '#DC2626', border: 'border-red-600' },
            { name: 'כחול', color: '#2563EB', border: 'border-blue-600' },
            { name: 'ירוק', color: '#059669', border: 'border-green-600' },
            { name: 'צהוב', color: '#FACC15', border: 'border-yellow-500' },
            { name: 'אפור', color: '#6B7280', border: 'border-gray-500' },
            { name: 'ורוד', color: '#EC4899', border: 'border-pink-500' },
            { name: 'סגול', color: '#7C3AED', border: 'border-purple-600' },
            { name: 'כתום', color: '#EA580C', border: 'border-orange-600' },
            { name: 'טורקיז', color: '#0891B2', border: 'border-cyan-600' },
            { name: 'חום', color: '#92400E', border: 'border-amber-700' }
          ].map((colorOption) => (
            <label 
              key={colorOption.name}
              className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                formData.shirtColor === colorOption.name
                  ? `${colorOption.border} bg-gray-100 shadow-md` 
                  : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm'
              }`}
            >
              <input
                type="radio"
                name="shirtColor"
                value={colorOption.name}
                checked={formData.shirtColor === colorOption.name}
                onChange={(e) => handleInputChange('shirtColor', e.target.value)}
                className="sr-only"
              />
              <div className="flex flex-col items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-full border-2 ${colorOption.border}`}
                  style={{ backgroundColor: colorOption.color }}
                ></div>
                <span className="text-sm font-medium">{colorOption.name}</span>
                {formData.shirtColor === colorOption.name && (
                  <i className="fas fa-check-circle text-green-600"></i>
                )}
              </div>
            </label>
          ))}
        </div>
        
        {formData.shirtColor && (
          <div className="bg-white p-4 rounded-lg">
            <p className="text-center text-gray-800 font-medium">
              צבע חולצה נבחר: {formData.shirtColor}
            </p>
          </div>
        )}
      </div>

      {/* Print Color Selection */}
      {formData.shirtColor && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
          <h3 className="text-xl font-semibold mb-6 text-gray-800 text-center">
            <i className="fas fa-print text-purple-600 mr-2"></i>
            בחר צבע הדפסה
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {(() => {
              // Define light and dark colors
              const lightColors = ['לבן', 'צהוב', 'ורוד']
              const darkColors = ['שחור', 'אדום', 'כחול', 'ירוק', 'אפור', 'סגול', 'כתום', 'טורקיז', 'חום']
              
              // Determine available print colors based on shirt color
              const isShirtLight = lightColors.includes(formData.shirtColor)
              const availablePrintColors = isShirtLight ? darkColors : ['לבן']
              
              const printColorOptions = [
                { name: 'לבן', color: '#FFFFFF', border: 'border-gray-300' },
                { name: 'שחור', color: '#000000', border: 'border-gray-700' },
                { name: 'אדום', color: '#DC2626', border: 'border-red-600' },
                { name: 'כחול', color: '#2563EB', border: 'border-blue-600' },
                { name: 'ירוק', color: '#059669', border: 'border-green-600' },
                { name: 'אפור', color: '#6B7280', border: 'border-gray-500' },
                { name: 'סגול', color: '#7C3AED', border: 'border-purple-600' },
                { name: 'כתום', color: '#EA580C', border: 'border-orange-600' },
                { name: 'טורקיז', color: '#0891B2', border: 'border-cyan-600' },
                { name: 'חום', color: '#92400E', border: 'border-amber-700' }
              ]
              
              return printColorOptions
                .filter(color => availablePrintColors.includes(color.name))
                .map((colorOption) => (
                  <label 
                    key={colorOption.name}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                      formData.printColor === colorOption.name
                        ? `${colorOption.border} bg-gray-100 shadow-md` 
                        : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm'
                    }`}
                  >
                    <input
                      type="radio"
                      name="printColor"
                      value={colorOption.name}
                      checked={formData.printColor === colorOption.name}
                      onChange={(e) => handleInputChange('printColor', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className={`w-8 h-8 rounded-full border-2 ${colorOption.border}`}
                        style={{ backgroundColor: colorOption.color }}
                      ></div>
                      <span className="text-sm font-medium">{colorOption.name}</span>
                      {formData.printColor === colorOption.name && (
                        <i className="fas fa-check-circle text-green-600"></i>
                      )}
                    </div>
                  </label>
                ))
            })()}
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">חולצה:</span>
                <div 
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: [
                    { name: 'לבן', color: '#FFFFFF' },
                    { name: 'שחור', color: '#000000' },
                    { name: 'אדום', color: '#DC2626' },
                    { name: 'כחול', color: '#2563EB' },
                    { name: 'ירוק', color: '#059669' },
                    { name: 'צהוב', color: '#FACC15' },
                    { name: 'אפור', color: '#6B7280' },
                    { name: 'ורוד', color: '#EC4899' },
                    { name: 'סגול', color: '#7C3AED' },
                    { name: 'כתום', color: '#EA580C' },
                    { name: 'טורקיז', color: '#0891B2' },
                    { name: 'חום', color: '#92400E' }
                  ].find(c => c.name === formData.shirtColor)?.color }}
                ></div>
                <span className="font-medium">{formData.shirtColor}</span>
              </div>
              
              {formData.printColor && (
                <>
                  <i className="fas fa-arrow-left text-gray-400"></i>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">הדפסה:</span>
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: [
                        { name: 'לבן', color: '#FFFFFF' },
                        { name: 'שחור', color: '#000000' },
                        { name: 'אדום', color: '#DC2626' },
                        { name: 'כחול', color: '#2563EB' },
                        { name: 'ירוק', color: '#059669' },
                        { name: 'אפור', color: '#6B7280' },
                        { name: 'סגול', color: '#7C3AED' },
                        { name: 'כתום', color: '#EA580C' },
                        { name: 'טורקיז', color: '#0891B2' },
                        { name: 'חום', color: '#92400E' }
                      ].find(c => c.name === formData.printColor)?.color }}
                    ></div>
                    <span className="font-medium">{formData.printColor}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Size and Quantity Selection */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 text-center">
          <i className="fas fa-ruler text-blue-600 mr-2"></i>
          מידות וכמויות
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size) => (
            <div key={size} className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="text-center mb-3">
                <span className="font-bold text-lg text-gray-800">{size}</span>
                <div className="text-xs text-gray-500 mt-1">
                  {size === 'XS' && 'חזה: 88-92 ס״מ'}
                  {size === 'S' && 'חזה: 92-96 ס״מ'}
                  {size === 'M' && 'חזה: 96-100 ס״מ'}
                  {size === 'L' && 'חזה: 100-104 ס״מ'}
                  {size === 'XL' && 'חזה: 104-108 ס״מ'}
                  {size === 'XXL' && 'חזה: 108-112 ס״מ'}
                  {size === 'XXXL' && 'חזה: 112-116 ס״מ'}
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    const currentSize = formData.sizes.find(s => s.size === size)
                    const newQuantity = Math.max(0, (currentSize?.quantity || 0) - 1)
                    const newSizes = newQuantity === 0 
                      ? formData.sizes.filter(s => s.size !== size)
                      : formData.sizes.map(s => s.size === size ? { ...s, quantity: newQuantity } : s)
                    
                    if (newQuantity > 0 && !currentSize) {
                      newSizes.push({ size, quantity: newQuantity })
                    }
                    
                    handleInputChange('sizes', newSizes)
                  }}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <i className="fas fa-minus text-gray-600"></i>
                </button>
                
                <span className="mx-4 min-w-[3rem] text-center font-bold text-lg">
                  {formData.sizes.find(s => s.size === size)?.quantity || 0}
                </span>
                
                <button
                  onClick={() => {
                    const currentSize = formData.sizes.find(s => s.size === size)
                    const newQuantity = (currentSize?.quantity || 0) + 1
                    const newSizes = currentSize
                      ? formData.sizes.map(s => s.size === size ? { ...s, quantity: newQuantity } : s)
                      : [...formData.sizes, { size, quantity: newQuantity }]
                    
                    handleInputChange('sizes', newSizes)
                  }}
                  className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <i className="fas fa-plus text-white"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 text-center">
          <i className="fas fa-user text-green-600 mr-2"></i>
          פרטי יצירת קשר
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שם מלא *
            </label>
            <input
              type="text"
              value={formData.fullName || ''}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="הכנס את שמך המלא"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              טלפון *
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="050-1234567"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              אימייל *
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תאריך אספקה מועדף
            </label>
            <input
              type="date"
              value={formData.preferredDate || ''}
              onChange={(e) => handleInputChange('preferredDate', e.target.value)}
              min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            הערות נוספות (אופציונלי)
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="הערות מיוחדות, בקשות נוספות..."
            rows="3"
            maxLength="500"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
          <div className="text-sm text-gray-500 mt-1">
            {(formData.notes || '').length}/500
          </div>
        </div>
      </div>

      {/* Price Estimation */}
      {formData.shirtColor && formData.printColor && formData.sizes.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border border-yellow-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">
            <i className="fas fa-calculator text-yellow-600 mr-2"></i>
            הערכת מחיר
          </h3>
          
          <div className="bg-white p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {formData.sizes.reduce((total, s) => total + s.quantity, 0)}
                </div>
                <div className="text-sm text-gray-600">חולצות</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  ₪{(formData.sizes.reduce((total, s) => total + s.quantity, 0) * 45).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">מחיר משוקד*</div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center mt-4">
              * מחיר משוקד בהתבסס על ₪45 לחולצה. המחיר הסופי יותאם בהתאם לעיצוב הסופי ועל פי הזמנה
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-dashed border-gray-300">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">
          <i className="fas fa-clipboard-list text-gray-600 mr-2"></i>
          סיכום ההזמנה
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-medium">סוג אירוע:</span>
            <span>{formData.eventType === 'other' ? formData.customEventType : 
              eventTypes.find(t => t.value === formData.eventType)?.label}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-medium">עיצוב אחורי:</span>
            <span>{formData.selectedDesign ? '✓ נוצר' : '✗ לא נוצר'}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-medium">עיצוב קדמי:</span>
            <span>
              {formData.frontDesignMethod === 'ai' && formData.frontDesign ? '✓ AI' :
               formData.frontDesignMethod === 'upload' && formData.uploadedImage ? '✓ תמונה' :
               formData.frontDesignMethod === 'symbols' && formData.selectedSymbol ? '✓ סמל' : '✗ לא נבחר'}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-medium">צבע חולצה:</span>
            <span>{formData.shirtColor || 'לא נבחר'}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-medium">צבע הדפסה:</span>
            <span>{formData.printColor || 'לא נבחר'}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-medium">כמות:</span>
            <span>
              {formData.sizes.length > 0 
                ? `${formData.sizes.reduce((total, s) => total + s.quantity, 0)} חולצות`
                : 'לא נבחרו מידות'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderStep1()
      case 1: return renderStep2()
      case 2: return renderStep3()
      case 3: return renderStep4()
      case 4: return renderStep5()
      default: return renderStep1()
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.eventType && (formData.eventType !== 'other' || formData.customEventType.trim())
      case 1: return formData.description.trim().length >= 10
      case 2: return formData.selectedDesign && (formData.backTextPosition === 'none' || formData.backText.trim())
      case 3: {
        // Must select a front design method and have some content
        const hasDesign = 
          (formData.frontDesignMethod === 'ai' && formData.frontDesign) ||
          (formData.frontDesignMethod === 'upload' && formData.uploadedImage) ||
          (formData.frontDesignMethod === 'symbols' && formData.selectedSymbol)
        
        const hasValidText = formData.frontTextPosition === 'none' || formData.frontText.trim()
        
        return formData.frontDesignMethod && hasDesign && hasValidText
      }
      case 4: {
        // Must have shirt color, print color, sizes, and contact info
        const hasColors = formData.shirtColor && formData.printColor
        const hasSizes = formData.sizes.length > 0 && formData.sizes.some(s => s.quantity > 0)
        const hasContactInfo = formData.fullName.trim() && formData.phone.trim() && formData.email.trim()
        
        return hasColors && hasSizes && hasContactInfo
      }
      default: return true
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">עיצוב חולצה מותאמת אישית</h1>
            <p className="text-xl text-gray-600">צור עיצוב ייחודי בעזרת בינה מלאכותית</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="bg-gray-200 rounded-full h-2 mb-6">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex flex-col items-center ${
                    index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    index <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-xs mt-2 text-center max-w-20">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            {renderCurrentStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentStep === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              → חזור
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={submitOrder}
                disabled={!canProceed()}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  canProceed()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {canProceed() ? (
                  <>
                    שלח הזמנה 🚀
                  </>
                ) : (
                  'השלם את כל השדות'
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  canProceed()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                הבא ←
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="נדרשת התחברות"
        message="כדי להמשיך בתהליך העיצוב ולשלוח הזמנה, עליך להתחבר תחילה"
      />
    </div>
  )
}

export default DesignFormPage
