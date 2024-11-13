import React, { useEffect, useRef, useState } from 'react'

// css
import './AdminSection.css'





// components
import NavBar from '../NavBar/NavBar'
import UserSection from './UserSection';
import RightsSection from './RightsSection';
import RecordsSection from './RecordsSection';
import PreLoader from '../PreLoader/PreLoader';
import MeetingSection from './MeetingSection';






// icons 
import { FaUser } from "react-icons/fa";
import { FaHistory } from "react-icons/fa";
import { SiGooglemeet } from "react-icons/si";
import { MdAdminPanelSettings, MdDraw } from "react-icons/md";






// custom hooks
import { useSocket } from '../../CustomHooks/useSocket';
import { useUserDetails } from '../../CustomHooks/useUserDetails';
import { usePushToastFunc } from '../Toastify/Toastify';
import { useGetAPI } from '../../CustomHooks/useAPI';
import { useLoadingStart, useLoadingStop } from '../PreLoader/PreLoader';
















export default function AdminSection() {




    // states
    const [userList, setUserList] = useState([])
    const [activeSection, setActiveSection] = useState('users')

    // custom hooks
    const api = useGetAPI();
    const socket = useSocket();
    const userDetails = useUserDetails();
    const pushToastFunc = usePushToastFunc();
    const liveTimeOut = useRef({})
    const loadingStart = useLoadingStart();
    const loadingStop = useLoadingStop();

    const [isExpand, setIsExpand] = useState(false)








    function removeUserLive(userId) {

        setUserList(preState => preState.map(e => {
            if (e._id != userId) return e;

            return { ...e, active: false }
        }))
    }




    useEffect(() => {
        loadingStart('AdminPage')
        fetch(api + '/api/getusers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ authToken: localStorage.getItem('weMeetauthToken') })

        })
            .then(res => res.json()).then(data => {
                loadingStop('AdminPage')
                if (data.err) {
                    pushToastFunc({
                        message: data.err,
                        theme: 'dark',
                        type: 'error'
                    })
                    return;

                }

                if (!data.userList) {
                    pushToastFunc({
                        message: 'Something Went Wrong',
                        theme: 'dark',
                        type: 'error'
                    })
                    return;

                }



                loadingStop('AdminPage')

                setUserList(data.userList)
                pushToastFunc({
                    message: 'Data Fetched',
                    theme: 'dark',
                    type: 'success'
                })

            })

    }, [])



    useEffect(() => {
        if (socket.connected) return;
        if (!userList.length) return

        socket.on('connect', () => {
            console.log(socket.id)

            socket.emit('join-room', userDetails.rights)


            socket.on('user-live', userId => {
                setUserList(preState => preState.map(e => {
                    if (e._id != userId) return e;
                    console.log('user is live ', e.username)

                    liveTimeOut.current[e._id] && clearTimeout(liveTimeOut.current[e._id])
                    liveTimeOut.current[e._id] = setTimeout(() => {

                        removeUserLive(e._id)
                    }, 2000);


                    return { ...e, active: true }
                }))

            })



        })


        socket.connect()
    }, [userList])



    return (
        <>
            <PreLoader
                id={'AdminPage'}
            />
            <NavBar />
            <div
                className={'pt-[50px] grid  h-full items-center transition-all duration-500 ' +
                    (isExpand ? " grid-cols-[200px_auto] " : " grid-cols-[50px_auto] ")
                }
            >


                <div
                    onMouseEnter={() => {
                        setIsExpand(true)

                    }}
                    onMouseLeave={() => {
                        setIsExpand(false)
                    }}
                    className='border-r-2 border-r-orange-500 flex flex-col items-start py-4 px-1 gap-2 bg-orange-500 h-[50svh] rounded-r-3xl  '
                >

                    <button
                        className={' w-full rounded-lg grid grid-cols-2 items-center gap-4 p-2  transition-all duration-500 '
                            + (activeSection == 'users' ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300  ')
                            + (isExpand ? " text-xl  " : " justify-center  text-2xl ")

                        }
                        onClick={e => setActiveSection('users')}
                    ><FaUser />

                        <p
                            className={"transition-all  overflow-hidden " + (isExpand ? " w-full " : " w-0 ")}
                        >Users</p>

                    </button>

                    <button className={' w-full rounded-lg grid grid-cols-2 items-center gap-4 p-2  justify-center  text-2xl ' + (activeSection == 'records' ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300')
                        + (isExpand ? " text-xl  " : " justify-center  text-2xl ")
                    }
                        onClick={e => setActiveSection('records')}

                    ><FaHistory />

                        <p
                            className={"transition-all  overflow-hidden " + (isExpand ? " w-full " : " w-0 ")}
                        >Records</p>
                    </button>
                    <button
                        onClick={e => setActiveSection('rights')}
                        className={' w-full rounded-lg grid grid-cols-2 items-center gap-4 p-2  justify-center text-2xl  ' + (activeSection == 'rights' ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300 ')

                            + (isExpand ? " text-xl  " : " justify-center  text-2xl ")
                        }><MdAdminPanelSettings />
                        <p
                            className={"transition-all  overflow-hidden " + (isExpand ? " w-full " : " w-0 ")}
                        >Rights</p>
                    </button>
                    <button
                        onClick={e => setActiveSection('meeting')}
                        className={' w-full rounded-lg grid grid-cols-2 items-center gap-4 p-2  justify-center text-2xl  ' + (activeSection == 'meeting' ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300 ')
                            + (isExpand ? " text-xl  " : " justify-center  text-2xl ")
                        }><SiGooglemeet />
                        <p
                            className={"transition-all  overflow-hidden " + (isExpand ? " w-full " : " w-0 ")}
                        >Meeting</p>
                    </button>
                    <a
                        target='_blank'
                        href='./apDraw/index.html'
                        className={' w-full rounded-lg grid grid-cols-2 items-center gap-4 p-2  justify-center text-2xl  ' + (activeSection == 'drawing' ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300 ')
                            + (isExpand ? " text-xl  " : " justify-center  text-2xl ")
                        }>
                        <MdDraw />
                        <p
                            className={"transition-all  overflow-hidden " + (isExpand ? " w-full " : " w-0 ")}
                        >

                            Draw</p>
                    </a>

                </div>

                <div                >

                    <h1 className=' underLineHeaiding '>

                        {activeSection[0].toUpperCase() + activeSection.slice(1)}
                    </h1>




                    {
                        activeSection == 'users' && <UserSection
                            userList={userList}
                            setUserList={setUserList}
                        />
                    }
                    {
                        activeSection == 'records' && <RecordsSection
                            userList={userList}
                        />
                    }
                    {
                        activeSection == 'rights' && <RightsSection
                            userList={userList}
                            setUserList={setUserList}
                        />
                    }
                    {
                        activeSection == 'meeting' && <MeetingSection />
                    }

                </div>
            </div>
        </>
    )
}
