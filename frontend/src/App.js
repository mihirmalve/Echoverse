import { Routes, Route,Navigate, useLocation} from "react-router-dom";
import './App.css';
import Home from "./pages/Home/Home.js";
import Rooms from "./pages/Rooms/Rooms";
import Activate from "./pages/Activate/Activate";
import Authenticate from "./pages/Authenticate/Authenticate";
import Navigation from "./components/shared/Navigation/Navigation";
import { useSelector } from "react-redux";


//const isAuth = false;
//const user = {activated : true};
function App() {
  return (
   <>
  <Navigation />

   <Routes> 
    <Route path="/" element={ 
    <GuestRoute> 
      <Home />
      </GuestRoute>} />
      
      <Route path="/activate" element ={
        <SemiProtectedRoute>
          <Activate/>
        </SemiProtectedRoute>
      } />
  
    <Route path="/authenticate" element={<GuestRoute>
      <Authenticate />
      </GuestRoute>} />
    <Route path="/rooms" element={
    <ProtectedRoute>
      <Rooms />
      </ProtectedRoute>} />
   </Routes>
   </>
  );
}

const GuestRoute = ({children}) =>{
const isAuth = useSelector((state) => state.auth.isAuth);
  const location = useLocation();
  if(isAuth) {
    return <Navigate to="/rooms"  replace state={{from : location}}/>
  }
  return children;

  }

  const SemiProtectedRoute = ({children}) => {
    const isAuth = useSelector((state) => state.auth.isAuth);
    const user = useSelector((state) => state.auth.user);
    const location = useLocation();
    if(!isAuth) {
      return <Navigate to="/" replace state={{from : location}} />
    }
    else if(isAuth&&!user.activated){
      return children;
    }
    return <Navigate to="/rooms" replace state={{from : location}} />
  }

  const ProtectedRoute = ({children}) => {
    const isAuth = useSelector((state) => state.auth.isAuth);
    const user = useSelector((state) => state.auth.user);
    const location = useLocation();
    if(!isAuth) {
      return <Navigate to="/" replace state={{from : location}} />
    }
    else if(isAuth&&!user.activated){
      return <Navigate to="/activate" replace state={{from : location}} /> ;
    }
    return children;
  }



export default App;
