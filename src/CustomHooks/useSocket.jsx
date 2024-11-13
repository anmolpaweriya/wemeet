import React, { useContext } from 'react'
import { useGetAPI } from './useAPI';
import { io } from 'socket.io-client'



const SocketContext = React.createContext();




export function useSocket() { return useContext(SocketContext) }





export default function SocketProvider({ children }) {

    const api = useGetAPI();

    const socket = io(api, { autoConnect: false })




    return <SocketContext.Provider value={socket}>
        {children}
    </SocketContext.Provider>
}