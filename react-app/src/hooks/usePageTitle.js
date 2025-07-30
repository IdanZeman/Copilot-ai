import { useEffect } from 'react'

// Custom hook to set page title
export const usePageTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title ? `${title} | מעצב החולצות שלי` : 'מעצב החולצות שלי'
    
    return () => {
      document.title = previousTitle
    }
  }, [title])
}

// Custom hook to set meta tags
export const useMetaTags = ({ title, description, keywords, image }) => {
  useEffect(() => {
    // Set page title
    if (title) {
      document.title = `${title} | מעצב החולצות שלי`
    }

    // Set meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.name = 'description'
        document.head.appendChild(metaDescription)
      }
      metaDescription.content = description
    }

    // Set meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.name = 'keywords'
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.content = keywords
    }

    // Set Open Graph meta tags
    if (title) {
      let ogTitle = document.querySelector('meta[property="og:title"]')
      if (!ogTitle) {
        ogTitle = document.createElement('meta')
        ogTitle.setAttribute('property', 'og:title')
        document.head.appendChild(ogTitle)
      }
      ogTitle.content = title
    }

    if (description) {
      let ogDescription = document.querySelector('meta[property="og:description"]')
      if (!ogDescription) {
        ogDescription = document.createElement('meta')
        ogDescription.setAttribute('property', 'og:description')
        document.head.appendChild(ogDescription)
      }
      ogDescription.content = description
    }

    if (image) {
      let ogImage = document.querySelector('meta[property="og:image"]')
      if (!ogImage) {
        ogImage = document.createElement('meta')
        ogImage.setAttribute('property', 'og:image')
        document.head.appendChild(ogImage)
      }
      ogImage.content = image
    }

  }, [title, description, keywords, image])
}

export default usePageTitle
