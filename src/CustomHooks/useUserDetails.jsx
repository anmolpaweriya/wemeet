import React, { useContext, useEffect, useState } from 'react'
import { useGetAPI } from './useAPI';
import PreLoader, { useLoadingStart, useLoadingStop } from '../Components/PreLoader/PreLoader';



const UserDetailsContext = React.createContext();
const SetUserDetailsContext = React.createContext();




export function useUserDetails() { return useContext(UserDetailsContext) }
export function useSetUserDetails() { return useContext(SetUserDetailsContext) }

export default function UserDetailProvider({ children }) {


    const [userDetails, setUserDetails] = useState(null)
    const api = useGetAPI();
    const loadingStop = useLoadingStop();
    const loadingStart = useLoadingStart();


    async function fetchUserDetails() {
        const authToken = localStorage.getItem('weMeetauthToken')
        loadingStart('userDetail')
        const res = await fetch(api + '/api/auth', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ authToken })
        })
        loadingStop('userDetail')

        if (res.status == 400 || res.status == 403) {
            localStorage.clear()
            setUserDetails(null)
            return;
        }
        const data = await res.json();


        setUserDetails(data.userDetail)
    }

    useEffect(() => {
        const authToken = localStorage.getItem('weMeetauthToken')
        loadingStop('userDetail')
        if (!authToken)
            return

        fetchUserDetails()
    }, []);

    return <UserDetailsContext.Provider value={userDetails}>
        <SetUserDetailsContext.Provider value={setUserDetails}>
            <PreLoader
                id="userDetail"
            />

            {children}

        </SetUserDetailsContext.Provider>
    </UserDetailsContext.Provider>
}


