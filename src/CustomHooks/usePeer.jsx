import React, { useContext, useState } from 'react'


const PeerContext = React.createContext();
const SetPeerContext = React.createContext();

export function usePeer() { return useContext(PeerContext) }
export function useSetPeer() { return useContext(SetPeerContext) }


export default function PeerProvider({ children }) {


    const [peer, setPeer] = useState(null)






    return <PeerContext.Provider value={peer}>
        <SetPeerContext.Provider value={setPeer}>


            {children}

        </SetPeerContext.Provider>
    </PeerContext.Provider>
}

