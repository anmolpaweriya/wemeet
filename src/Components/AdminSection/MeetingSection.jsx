import React, { useEffect, useState } from 'react'


// icons 
import { MdDelete } from "react-icons/md";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";





// custom hooks 
import { useGetAPI } from '../../CustomHooks/useAPI'
import { usePushToastFunc } from '../Toastify/Toastify';
import PreLoader, { useLoadingStart, useLoadingStop } from '../PreLoader/PreLoader';





export default function MeetingSection() {



    const [meetings, setMeetings] = useState([])


    // custom hooks
    const api = useGetAPI();
    const loadingStart = useLoadingStart();
    const loadingStop = useLoadingStop();
    const pushToastFunc = usePushToastFunc();








    // functions

    async function createMeetingFunc() {

        const meetName = prompt("Enter Meeting Name : ");
        if (!meetName) return;



        const data = await fetch(api + '/api/createMeet', {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                authToken: localStorage.getItem('weMeetauthToken'),
                meetName
            })
        }).then(res => res.json())

        loadingStop('MeetingPage')

        if (data.err) {
            pushToastFunc({
                message: data.err,
                type: 'error',
                theme: 'dark'
            })
            return;
        }

        if (data.success)
            pushToastFunc({
                message: data.success,
                type: 'success',
                theme: 'dark'
            })


        fetchMeetings()

    }


    async function fetchMeetings() {
        loadingStart('MeetingPage')
        const data = await fetch(api + '/api/getMeets').then(res => res.json())
        loadingStop('MeetingPage')


        pushToastFunc({
            message: "Meetings Fetched",
            theme: 'dark'
        })

        setMeetings(data.meetingList)
    }



    async function deleteMeetings(meetId) {
        loadingStart('MeetingPage')
        const data = await fetch(api + '/api/deleteMeet', {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                authToken: localStorage.getItem('weMeetauthToken')
                , meetId
            })

        }).then(res => res.json())
        loadingStop('MeetingPage')



        if (data.err) {


            pushToastFunc({
                message: data.err,
                theme: 'dark'
                , type: "error"
            })
            return;
        }

        if (data.success) {


            pushToastFunc({
                message: data.success,
                theme: 'dark'
                , type: "success"
            })
        }



        fetchMeetings();

    }

    function toggleExpandFunc(meetId, expand) {

        setMeetings(preState => preState.map(e => {
            if (e._id != meetId) return e;
            return { ...e, expand }
        }))
    }
    function secondsFormat(sec) {
        if (!sec) return ""

        if (sec < 60) return `${sec} s`
        if (sec < 60 * 60) return `${Math.floor(sec / 60)} m`
        return `${Math.floor(sec / 3600)} h`
    }













    useEffect(() => {
        fetchMeetings()
    }, [])



    return (
        <>
            <PreLoader
                id={'MeetingPage'}
            />
            <div className='p-2'>

                <button
                    className='rounded orangeGradient w-full max-w-48 text-white text-2xl p-2 font-bold hover:scale-95 transition-all'
                    onClick={createMeetingFunc}
                >
                    Create
                </button>



                <div
                    className='py-10 px-10 box-border mt-5 overflow-y-scroll h-[50vh] grid gap-y-5 gap-x-10 '


                    style={{
                        gridTemplateColumns: "repeat(auto-fill,minmax(300px ,1fr))"
                    }}
                >
                    {meetings.map(e => {
                        return <div
                            key={e._id}
                            className={'glassy bg-[#009afc10] p-2 w-full transition-all hover:scale-95 grid   ' + (e.expand ? " grid-rows-[auto_2em_10rem]  h-80 " : " grid-rows-[auto_2em_0rem] h-40 ")}
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


                            {e.active ?
                                <div className='flex justify-end items-center gap-4'>

                                    <a
                                        className='p-2 px-4 text-xl bg-orange-500 text-white rounded-lg '
                                        href={`./?room=${e._id}`}

                                    >Join</a>
                                    <button
                                        className='p-2 px-4 text-2xl bg-red-600 rounded text-white '
                                        onClick={() => deleteMeetings(e._id)}
                                    ><MdDelete /></button>
                                </div>



                                :

                                <div className='flex justify-between items-center gap-4'>

                                    <h1
                                        className='font-bold text-red-500'
                                    >Meeting Ended</h1>
                                    <button
                                        className='flex gap-1 items-center text-gray-600 text-sm'
                                        onClick={() => toggleExpandFunc(e._id, !e.expand)}
                                    >
                                        {
                                            e.expand ?
                                                <>

                                                    <FaAngleUp />
                                                    less details
                                                </>
                                                : <>
                                                    <FaAngleDown />
                                                    more details
                                                </>
                                        }
                                    </button>

                                </div>



                            }


                            {e.expand
                                ?
                                <div className='overflow-y-scroll   grid gap-2  '>

                                    {e.usersList.map(e => {
                                        return <div
                                            className='grid grid-cols-[60px_auto_50px] items-center'
                                        >
                                            <div
                                                className='h-10 w-10 overflow-hidden rounded-full bg-gray-500'
                                            >

                                                <img src={api + '/profilepic/' + e.profilePic}
                                                    className='w-full h-full object-cover'
                                                    alt="" />
                                            </div>
                                            <p>

                                                {e.username}
                                            </p>
                                            <p>{secondsFormat(e.liveTime)}</p>
                                        </div>
                                    })}

                                </div>
                                : <></>
                            }




                        </div>
                    })}
                </div>
            </div >
        </>

    )
}
