import "./App.css";
import "./styles/Scrollbar.css";

import { Routes, Route } from "react-router-dom";

// Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Auth Pages (separated)
import LoginPage from "./components/Login";
import RegisterPage from "./components/Register";
import ForgotPasswordPage from "./components/Forgot";

// Home Page Sections
import Hero from "./components/Hero";
import Labs from "./components/Labs";
import LearningResources from "./components/LearningResources";

// Core Functionalities
import Encode from "./components/Encode";
import Decode from "./components/Decode";

// Other Pages
import About from "./components/About";

// History Pages
import EncodeHistory from "./components/EncodeHistory";
import DecodeHistory from "./components/DecodeHistory";

function App() {
  return (
    <div className="App">

      {/* Navigation */}
      <Navbar />

      <main>
        <Routes>

          {/* Home Route */}
          <Route
            path="/"
            element={
              <>
                <Hero />
                <Labs />
                <LearningResources />
              </>
            }
          />

          {/* Core Functionality */}
          <Route path="/encode" element={<Encode />} />
          <Route path="/decode" element={<Decode />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />

          {/* History Pages */}
          <Route path="/encode-history" element={<EncodeHistory />} />
          <Route path="/decode-history" element={<DecodeHistory />} />


          {/* About */}
          <Route path="/about" element={<About />} />

        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
