import FloatingShape from "./components/FloatingShape"
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Verify from "./pages/Verify";
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";

// protect routes;

const ProtectedRoute = ({children}) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if(!isAuthenticated){
    return <Navigate to='/login' replace/>
  }

  if(!user.isVerified){
    return <Navigate to='/verify-email' replace/>
  }

  return children;
}

const RedirectAuthenticatedUser = ({children}) => {
  const {isAuthenticated, user} = useAuthStore();

  if(isAuthenticated && user.isVerified){
    return <Navigate to='/' replace />
  }

  return children;
}


function App() {
  const {checkAuth, isAuthenticated, user} = useAuthStore();


  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  console.log("isAuthenticated: ", isAuthenticated);
  console.log("user: ", user);

  return (
    <div>
      <Routes>
        <Route path='/' element={<ProtectedRoute>
          <Home/>
        </ProtectedRoute>}></Route>
        <Route path='/signup' element={<RedirectAuthenticatedUser>
          <Signup/>
          </RedirectAuthenticatedUser>}></Route>
        <Route path='/login' element={<RedirectAuthenticatedUser>
          <Login/>
          </RedirectAuthenticatedUser>}></Route>
        <Route path='/forgot-password' element={<RedirectAuthenticatedUser>
          <ForgotPassword/>
          </RedirectAuthenticatedUser>}></Route>
        <Route path='/reset-password/:resetToken' element={<ResetPassword/>}></Route>
        <Route path='/verify-email' element={<RedirectAuthenticatedUser>
          <Verify/>
          </RedirectAuthenticatedUser>}></Route>
      </Routes>
      <Toaster/>
    </div>
  )
}

export default App
