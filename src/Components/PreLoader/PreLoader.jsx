import React, { useContext, useRef } from 'react'





// css
import './PreLoader.css'







// context api
export const LoadingStartContext = React.createContext();
export const LoadingStopContext = React.createContext();














// funcitons 


function loadingStart(id) {
    document.getElementById('PreLoaderFloatingDots-' + id)?.classList.remove('hideLoading');
}
function loadingStop(id) {
    document.getElementById('PreLoaderFloatingDots-' + id)?.classList.add('hideLoading');
}








export function useLoadingStart() {
    return useContext(LoadingStartContext);
}




export function useLoadingStop() {
    return useContext(LoadingStopContext);
}




export function LoadingProvider({ children }) {
    return <LoadingStartContext.Provider value={loadingStart}>
        <LoadingStopContext.Provider value={loadingStop}>
            {children}
        </LoadingStopContext.Provider>
    </LoadingStartContext.Provider>

}












export default function PreLoader({ id }) {







    // return JSX
    return (<div className="PreLoader"

        id={'PreLoaderFloatingDots-' + id}
    >

        <div className="loadingAnimation">
            <span className='animationSphere' style={{ '--i': '1' }}></span>
            <span className='animationSphere' style={{ '--i': '2' }}></span>
            <span className='animationSphere' style={{ '--i': '3' }}></span>
            <span className='animationSphere' style={{ '--i': '4' }}></span>
            <span className='animationSphere' style={{ '--i': '5' }}></span>

        </div>
    </div>)
}