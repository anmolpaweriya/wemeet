import React, { useEffect, useRef, useState } from 'react'



// custom hooks
import { useGetAPI } from '../../CustomHooks/useAPI';



export default function UserSection({
    userList,
    setUserList
}) {




    // custom hooks
    const api = useGetAPI();




    function toggleShowUser(userId, showUser) {

        setUserList(preState => preState.map(e => {
            if (e._id != userId) return e;

            return {
                ...e,
                showUser
            }
        }))

    }





    return (
        <div className='  h-[70vh] overflow-y-scroll'>






            <div className='gap-3 w-full flex flex-wrap box-border p-3 '
            >


                {userList.map((e) => {




                    return <a


                        onClick={() => {
                            toggleShowUser(e._id, !e.showUser)
                        }}
                        key={e._id}

                        className={'glassy grid  grid-cols-[1fr_0fr] rounded-xl overflow-hidden hover:scale-95 transition-all duration-700 border-4 ' + (e.active ? 'border-green-500 greenGradient ' : ' ') + (e.showUser ? " showUserDetails " : "")} >
                        <div
                            className={'profilePicDiv w-36 rounded-lg overflow-hidden h-[150px]  grid grid-rows-[auto_2em] transition-all duration-700 '}
                        >



                            <div className='overflow-hidden h-full'>

                                <img
                                    className='object-cover h-full w-full rounded-lg'
                                    src={api + '/profilePic/' + e.profilePic} alt="" />

                            </div>
                            <div
                                className='p-1 h-full overflow-hidden'
                            >

                                <h1 className='font-bold'>
                                    {e.username}
                                </h1>


                            </div>

                        </div>


                        <div className={'bg-transparent userDetailsDiv flex flex-col gap-2 p-0 font-bold overflow-hidden w-full transition-all h-0 '}>

                            <p>{e.username}</p>

                            <p
                                className={e.rights == 'admin' ? 'text-blue-600' : 'text-red-500 '}
                            >{e.rights}</p>
                            <p>{(new Date(e.createdAt)).toDateString()}</p>

                        </div>
                    </a>
                })
                }

            </div>


        </div >
    )
}
