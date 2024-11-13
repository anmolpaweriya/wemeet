import React from 'react'
import { useSetUserDetails, useUserDetails } from '../../CustomHooks/useUserDetails'
import { useGetAPI } from '../../CustomHooks/useAPI';

export default function NavBar() {

    const userDetails = useUserDetails();
    const setUserDetails = useSetUserDetails();




    if (!userDetails) return;


    return (
        <div
            className='fixed top-0 flex justify-between  items-center  font-bold w-full p-2 px-4 box-border  h-[50px]  border-b-4 border-b-orange-500 '



        >
            <h1
                className='gradientText orangeGradient font-extrabold text-2xl'
            >
                We Meet
            </h1>

            <div className='flex gap-5 items-center'>
                <h3 className='text-1.5xl gap-2 flex'>
                    {userDetails.username}
                    <p className='text-blue-400'>
                        ( {userDetails.rights} )
                    </p>
                </h3>
                <button
                    className='rounded-lg text-white bg-black p-2 px-4 '
                    onClick={e => {
                        setUserDetails(null)
                        localStorage.clear()
                    }}
                >Log out</button>

            </div>


        </div>


    )
}
