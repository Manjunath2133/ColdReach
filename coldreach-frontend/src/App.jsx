import React from 'react';
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'
import SendForm from "./components/SendForm";


function App() {
  const [count, setCount] = useState(0)

  return (
    
    <div className="min-h-screen bg-gray-100">
      <SendForm />
    </div>
    
  )
}

export default App
