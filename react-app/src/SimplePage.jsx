import React from 'react'

const SimplePage = () => {
  console.log('🚀 SimplePage loaded')
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', direction: 'rtl' }}>
      <h1 style={{ color: 'blue' }}>בדיקה - האתר עובד!</h1>
      <p>אם אתה רואה את זה, React עובד תקין</p>
      <button onClick={() => alert('הכפתור עובד!')}>
        לחץ לבדיקה
      </button>
    </div>
  )
}

export default SimplePage
