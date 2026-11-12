import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { Component, type ErrorInfo, type ReactNode } from "react";

class ErrorBoundary extends Component<{children: ReactNode},{hasError:boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Dashboard render error", error, info); }
  render() { return this.state.hasError ? <main className="error-boundary"><h1>Something went wrong</h1><p>The dashboard could not be displayed.</p><button className="btn btn-primary" onClick={()=>this.setState({hasError:false})}>Try again</button></main> : this.props.children; }
}
function ProtectedRoute({children}:{children:ReactNode}) {
  const {user}=useAuth(); const location=useLocation();
  return user ? children : <Navigate to="/login" replace state={{from:location.pathname}}/>;
}
function AppRoutes() {
  return <Routes><Route path="/login" element={<Login/>}/><Route path="/dashboard" element={<ProtectedRoute><ErrorBoundary><Dashboard/></ErrorBoundary></ProtectedRoute>}/><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes>;
}
export default function App() { return <AuthProvider><AppRoutes/></AuthProvider>; }
