# AI Custom T-Shirt Designer - Hebrew RTL Website

A fully responsive, RTL (Hebrew) website for creating custom-designed T-shirts using AI technology.

## 🌟 Features

### Multi-Step Form Flow
1. **Event Type Selection** - Military, Family, Wedding, Corporate, Birthday, Sports
2. **Target Audience** - Adults, Kids, Teens, Mixed
3. **Design Description** - Free text describing what the shirt should express
4. **Front Design** - Icon selection + optional top caption with live preview
5. **AI Design Generation** - Automated back design creation
6. **Customization** - Shirt color and quantity by size selection
7. **Order Summary** - Complete order review and customer details

### Technical Features
- **Fully RTL Layout** - Complete Hebrew right-to-left interface
- **Mobile-First Design** - Responsive across all devices
- **AI Integration Ready** - Structured for DALL-E, Stability AI, or similar APIs
- **Form Validation** - Comprehensive client-side validation
- **Progress Tracking** - Visual step indicator and progress bar
- **Live Previews** - Real-time front design preview
- **Clean Image Generation** - No mockups, just pure illustrations

## 🛠 Technology Stack

- **HTML5** - Semantic markup with RTL support
- **CSS3** - Modern styling with Flexbox/Grid, animations
- **Vanilla JavaScript** - No dependencies, lightweight
- **Font Awesome** - Icon library
- **Google Fonts** - Heebo font family for Hebrew

## 📁 File Structure

```
/
├── index.html          # Main HTML structure
├── styles.css          # Complete CSS styling
├── script.js           # JavaScript functionality
└── README.md          # Documentation
```

## 🎨 Design Principles

### Visual Design
- **Clean & Minimal** - Focus on usability and content
- **Hebrew Typography** - Optimized for Hebrew text rendering
- **Gradient Accents** - Modern blue-purple gradient theme
- **Card-Based Layout** - Organized content in digestible sections
- **Smooth Animations** - Polished user experience

### User Experience
- **Intuitive Navigation** - Clear progress indication
- **Form Validation** - Real-time feedback and error handling
- **Loading States** - Visual feedback during AI processing
- **Accessibility** - Proper contrast ratios and semantic HTML

## 🚀 AI Integration

### Design Prompt Logic
The system creates precise prompts for AI image generation:

```javascript
function createDesignPrompt() {
    return `Create a clean black and white line drawing illustration for a T-shirt back design. 
    Event type: ${eventType}. 
    Target audience: ${audience}. 
    The design should express: ${description}. 
    Style: minimalist line art, no text, no people, no mockups, just the illustration.`;
}
```

### API Integration Points
- **Image Generation APIs**: DALL-E, Stability AI, Midjourney
- **Design Requirements**: 
  - Black and white line drawings only
  - No text or people in illustrations
  - Clean, minimalist style
  - Suitable for T-shirt printing

## 📱 Responsive Design

### Breakpoints
- **Desktop**: 769px and up
- **Tablet**: 768px and down
- **Mobile**: 480px and down

### Mobile Optimizations
- Simplified grid layouts
- Touch-friendly button sizes
- Optimized form inputs
- Condensed navigation

## 🔧 Setup Instructions

1. **Clone/Download** the files to your web server
2. **Configure AI API** - Add your API keys to the image generation function
3. **Customize Styling** - Modify colors, fonts, or layout in `styles.css`
4. **Test Responsiveness** - Verify on various devices

## 🌍 Localization

### Hebrew RTL Support
- Complete right-to-left layout
- Hebrew font optimization
- RTL-specific CSS properties
- Proper text alignment and spacing

### Content Translation
All user-facing text is in Hebrew:
- Form labels and placeholders
- Error messages and validation
- Button text and navigation
- Success messages

## 🎯 Future Enhancements

### Potential Features
- **User Accounts** - Save designs and order history
- **Design Library** - Pre-made template collections
- **Advanced Customization** - Multiple design layers
- **Social Sharing** - Share designs on social media
- **Order Tracking** - Production and shipping status

### Technical Improvements
- **Backend Integration** - Database and order management
- **Payment Processing** - Secure checkout system
- **Email Notifications** - Order confirmations and updates
- **Admin Dashboard** - Order management interface

## 📞 Support

For technical support or customization requests, please refer to the code comments and documentation within each file.

---

**Note**: This is a frontend implementation. For production use, you'll need to:
1. Integrate with actual AI APIs (DALL-E, Stability AI, etc.)
2. Add backend order processing
3. Implement payment gateway
4. Set up email notifications
5. Add database storage for orders and designs