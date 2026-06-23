import { useState } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, AlertCircle } from "lucide-react";
import "./auth.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const res = await API.post(endpoint, formData);

      if (isLogin) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.user.role.toLowerCase());
        localStorage.setItem("userId", res.data.user.id || res.data.user._id);
        localStorage.setItem("userName", res.data.user.name);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        const role = res.data.user.role.toLowerCase();
        window.location.href = role === "faculty" ? "/faculty/dashboard" : "/student/dashboard";
      } else {
        setIsLogin(true);
        alert("Registration successful! Please login.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div 
        className="auth-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <header className="auth-header">
          <div className="auth-logo">Progress<span>Lens</span></div>
          <h3>{isLogin ? "Welcome Back" : "Join ProgressLens"}</h3>
          <p>{isLogin ? "Sign in to continue your academic journey" : "Start tracking your project progress today"}</p>
        </header>

        <AnimatePresence mode="wait">
          <motion.form 
            key={isLogin ? "login" : "register"}
            onSubmit={handleSubmit} 
            className="auth-form"
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -10, opacity: 0 }}
          >
            {!isLogin && (
              <div className="input-group">
                <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
              </div>
            )}
            
            <div className="input-group">
              <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
            </div>

            <div className="input-group">
              <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            </div>

            {!isLogin && (
              <div className="input-group">
                <select name="role" onChange={handleChange} className="auth-select">
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
              {!loading && (isLogin ? <LogIn size={18} /> : <UserPlus size={18} />)}
            </button>

            {error && (
              <motion.div 
                className="auth-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </motion.form>
        </AnimatePresence>

        <footer className="auth-footer">
          <p onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span>{isLogin ? "Register Now" : "Sign In"}</span>
          </p>
        </footer>
      </motion.div>
    </div>
  );
}