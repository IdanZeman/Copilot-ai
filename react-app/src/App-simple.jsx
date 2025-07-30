import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#61dafb' }}>🚀 React App עובד!</h1>
      
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={() => setCount((count) => count + 1)}
          style={{
            backgroundColor: '#61dafb',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          count is {count}
        </button>
      </div>
      
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        border: '2px solid green',
        borderRadius: '10px',
        backgroundColor: '#f0f8f0'
      }}>
        <h2 style={{ color: 'green' }}>✅ React App מוכן!</h2>
        <p>עכשיו נוכל להמשיך עם ההדרגה שלנו</p>
        <p>הבעיות נפתרו ואנחנו יכולים להתקדם!</p>
      </div>
    </div>
  )
}

export default App
