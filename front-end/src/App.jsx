import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";

export default function App () {

  

  return (
    <div>
      <BrowserRouter>
        <AppRouter/>
        <ToastContainer/>
      </BrowserRouter>
    </div>
  )
}