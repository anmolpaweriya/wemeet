import { useEffect, useState } from 'react'
import './App.css'
import { useUserDetails } from './CustomHooks/useUserDetails'
import LoginSystem from './Components/LoginSystem/LoginSystem';
import MainPage from './Components/MainPage/MainPage';
import AdminSection from './Components/AdminSection/AdminSection';
import MeetingPage from './Components/MeetingPage/MeetingPage';

function App() {


  const userDetails = useUserDetails();

  const meetId = new URLSearchParams(window.location.search).get('room');





  if (userDetails == null)
    return <LoginSystem />



  if (meetId)
    return <MeetingPage
      meetId={meetId}
    />

  if (userDetails.rights == 'admin')
    return <AdminSection />
  return <MainPage />

}

export default App
