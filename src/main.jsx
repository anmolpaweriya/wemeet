import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'


// context provider
import APIProvider from './CustomHooks/useAPI.jsx'
import UserDetailProvider from './CustomHooks/useUserDetails.jsx'
import { ToastifyProvider } from './Components/Toastify/Toastify.jsx'
import { LoadingProvider } from './Components/PreLoader/PreLoader.jsx'
import SocketProvider from './CustomHooks/useSocket.jsx'
import PeerProvider from './CustomHooks/usePeer.jsx'



ReactDOM.createRoot(document.getElementById('root')).render(
  <LoadingProvider>
    <ToastifyProvider position='bottom-right'>

      <APIProvider>
        <SocketProvider>
          <UserDetailProvider>
            <PeerProvider>




              <App />

            </PeerProvider>

          </UserDetailProvider>
        </SocketProvider>
      </APIProvider>

    </ToastifyProvider>
  </LoadingProvider>
)
