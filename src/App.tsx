import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import './App.css'

// Lazy load the GaussianProcessPage to prevent it from blocking the main app render
const GaussianProcessPage = lazy(() => import('./page/GaussianProcessPage'));

function App() {

  return (
    <Router>
      <div className="app">
        <header className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">CS106 Playground</h1>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link to="/" className="hover:text-gray-300">Home</Link>
                </li>
                <li>
                  <Link to="/gaussian-process" className="hover:text-gray-300">Gaussian Process</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={
              <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6">Welcome to CS106 Playground</h1>
                <p className="mb-4">
                  This is a collection of interactive visualizations and demos for computer science concepts.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Link 
                    to="/gaussian-process" 
                    className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <h2 className="text-xl font-semibold mb-2">Gaussian Process Visualization</h2>
                    <p className="text-gray-600">
                      Explore an interactive visualization of Gaussian Processes with adjustable parameters.
                    </p>
                  </Link>
                </div>
              </div>
            } />
            <Route path="/gaussian-process" element={
              <Suspense fallback={
                <div className="container mx-auto p-4 flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4">Loading Gaussian Process Visualization...</p>
                  </div>
                </div>
              }>
                <GaussianProcessPage />
              </Suspense>
            } />
          </Routes>
        </main>
        
        <footer className="bg-gray-800 text-white p-4 text-center">
          <p>&copy; {new Date().getFullYear()} CS106 Playground</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
