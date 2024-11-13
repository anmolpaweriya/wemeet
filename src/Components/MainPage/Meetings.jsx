import React, { useEffect, useState } from 'react'






// custom hooks
import PreLoader, { useLoadingStart, useLoadingStop } from '../PreLoader/PreLoader';
import { usePushToastFunc } from '../Toastify/Toastify';
import { useGetAPI } from '../../CustomHooks/useAPI';




export default function Meetings() {


    const [meetings, setMeetings] = useState([])


    // custom hooks
    const api = useGetAPI();
    const loadingStart = useLoadingStart();
    const loadingStop = useLoadingStop();
    const pushToastFunc = usePushToastFunc();














    async function fetchMeetings() {
        loadingStart('MeetingsPage')
        const data = await fetch(api + '/api/getMeets').then(res => res.json())
        loadingStop('MeetingsPage')


        pushToastFunc({
            message: "Meetings Fetched",
            theme: 'dark'
        })

        setMeetings(data.meetingList)
    }








    useEffect(() => {
        console.log('meeting Page')
        fetchMeetings();
    }, [])


    return (<>
        <PreLoader
            id={'MeetingsPage'}
        />




        <div
            className='py-5 mt-5 w-[100vw] box-border px-10 overflow-y-scroll h-[70vh] grid gap-y-5 gap-x-10'

            style={{
                gridTemplateColumns: "repeat(auto-fill,minmax(300px ,1fr))"
            }}
        >
            {meetings.map(e => {
                return <a
                    href={`./?room=${e._id}`}
                    key={e._id}
                    className='glassy p-2 w-full h-40 transition-all hover:scale-95 grid grid-rows-[auto_2em]'
                >
                    <div
                        className='grid grid-rows-[auto_2em]'
                    >

                        <h1 className='text-3xl font-bold '>
                            {e.meetName}
                        </h1>

                        <div
                            className='flex justify-between text-xs text-gray-500'
                        >

                            <p>Created By {e.host}</p>
                            <p>Created At {(new Date(e.createdAt)).toDateString()}</p>
                        </div>
                    </div>


                    <div className='flex justify-end items-center gap-4'>
                        {e.active ?

                            <button
                                className='p-2 px-4 text-xl bg-orange-500 text-white rounded-lg '
                            >Join</button>



                            :

                            <h1
                                className='font-bold text-red-500'
                            >Meeting Ended</h1>
                        }




                    </div>
                </a>
            })}
        </div>
    </>
    )
}
