import React from 'react'

function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2563eb', marginBottom: '30px' }}>
        🎨 מעצב חולצות AI - שלב 1
      </h1>
      
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        backgroundColor: '#f9fafb'
      }}>
        <h2 style={{ color: '#059669' }}>✅ React App פועל!</h2>
        <p>זהו השלב הראשון - אפליקציית React בסיסית</p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>השלבים הבאים:</h3>
          <ul style={{ textAlign: 'right', listStyle: 'none', padding: 0 }}>
            <li style={{ margin: '10px 0' }}>📝 1. הוספת NotificationContext</li>
            <li style={{ margin: '10px 0' }}>🔐 2. הוספת AuthContext (פשוט)</li>
            <li style={{ margin: '10px 0' }}>🏠 3. יצירת דף בית</li>
            <li style={{ margin: '10px 0' }}>🎯 4. הוספת ניווט</li>
            <li style={{ margin: '10px 0' }}>🚀 5. הוספת יתר הפיצ'רים</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
