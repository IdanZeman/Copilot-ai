import React from 'react'
import Navbar from './Navbar'

const MyOrdersPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">ההזמנות שלי</h1>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <p className="text-xl text-center text-gray-600">
              אין לך הזמנות עדיין. התחל לעצב חולצה עכשיו!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyOrdersPage
