import React from 'react'
import ReactDOM from 'react-dom/client'
import MealPlanner from '../meal_planner_app.tsx'
import './index.css'
import './styles/print.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MealPlanner />
  </React.StrictMode>,
)
