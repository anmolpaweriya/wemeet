import React, { useEffect, useRef, useState } from 'react'


// icons
import { AiOutlineLoading3Quarters } from "react-icons/ai";







// components
import NavBar from '../NavBar/NavBar'
import PreLoader, { useLoadingStart, useLoadingStop } from '../PreLoader/PreLoader';
import VideoMeetPage from './VideoMeetPage';








// custom hooks
import { useGetAPI } from '../../CustomHooks/useAPI'
import { useUserDetails } from '../../CustomHooks/useUserDetails';
import { useSocket } from '../../CustomHooks/useSocket';
import { usePushToastFunc } from '../Toastify/Toastify';













export default function MeetingPage({
    meetId
}) {


    const [meetDetails, setMeetDetails] = useState({})
    const [enterMeet, setEnterMeet] = useState(false)
    const [connectedUser, setConnectedUser] = useState([])
    const [joinRequestSend, setJoinRequestSend] = useState(false)
    const userOnlineTimeout = useRef({})
    const userUnknownTimeout = useRef({})
    const [messages, setMessages] = useState([])





    // custom hooks
    const api = useGetAPI();
    const loadingStart = useLoadingStart();
    const loadingStop = useLoadingStop();
    const userDetails = useUserDetails();
    const socket = useSocket();
    const pushToastFunc = usePushToastFunc();









    async function fetchRoomDetail() {

        loadingStart('MeetJoinPage')
        const res = await fetch(api + '/api/getMeetDetails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ meetId })
        })
        loadingStop('MeetJoinPage')


        const data = await res.json();


        setMeetDetails(data.meetDetails)
    }

    function joinMeetFunc() {
        if (userDetails.username == meetDetails.host) {

            setEnterMeet(true);
            return;
        }
        if (joinRequestSend) return;
        setJoinRequestSend(true);

        socket.emit('askToJoin', userDetails, meetDetails.host)
    }


    function askToJoin(userData) {




        setConnectedUser(preState => {


            const isAlreadyAllowed = { current: false }


            const tempResult = preState.map(e => {
                if ((e.username == userData.username) && e.allow) {
                    isAlreadyAllowed.current = true;
                    return {
                        ...e,
                        connected: true
                    }
                } else
                    return e;
            })

            if (isAlreadyAllowed.current) {
                socket.emit('askToJoinReply', userData.username, true)
                return tempResult;
            }


            pushToastFunc({
                message: `${userData.username} wanna join`,
                theme: "dark"
            })

            return [{
                ...userData,
                allow: false,
                active: false,
                connected: true,
            }, ...preState]


        }


        )





    }


    function askToJoinReply(response) {

        setJoinRequestSend(false);

        setEnterMeet(response)

    }


    function userIsLive(userId) {

        setConnectedUser(preState => preState.map(e => {
            if (e._id != userId) return e;

            return {
                ...e,
                active: true,
                connected: true,
                unknown: undefined,
                liveTime: (e.liveTime ? e.liveTime + 1 : 1)
            }
        }))





        userOnlineTimeout.current[userId] && clearTimeout(userOnlineTimeout.current[userId]);

        userOnlineTimeout.current[userId] = setTimeout(() => {
            setConnectedUser(preState => preState.map(e => {
                if (e._id != userId) return e;

                return {
                    ...e,
                    active: false
                }
            }))
        }, 1500);
    }
    function unknonwUser(userId) {



        setConnectedUser(preState => preState.map(e => {
            if (e._id != userId) return e;

            if (e.unknown == undefined)
                pushToastFunc({
                    message: "unauthorized face Detected",
                    type: 'error',
                    theme: 'dark'
                })

            return {
                ...e,
                active: false,
                unknown: true,
                connected: true,
            }
        }))






        userUnknownTimeout.current[userId] && clearTimeout(userUnknownTimeout.current[userId]);

        userUnknownTimeout.current[userId] = setTimeout(() => {

            setConnectedUser(preState => preState.map(e => {
                if (e._id != userId) return e;

                return {
                    ...e,
                    active: false,
                    unknown: false,
                }
            }))
        }, 1500);
    }

    function removeStream(userId) {
        console.log(userId, meetDetails.hostId)
        if (meetDetails.hostId != userId) {
            document.getElementById(`id-${userId}`).srcObject = null
        } else {
            document.getElementById(`MainVideoID`).srcObject = null
        }

    }



    function disconnectUser(userId) {

        if (meetDetails.hostId != userId)
            setConnectedUser(preState => preState.map(e => {

                if (e._id != userId) return e;
                return {
                    ...e,
                    connected: false
                }

            }

            ))

        else
            window.location.href = '/'
    }
    function receiveMessage(username, message) {

        setMessages(preState => [...preState,
        { username, message }])

    }









    // useeffect


    window.onbeforeunload = () => {
        if (meetDetails.hostId != userDetails._id) {
            socket.emit('disconnectUser', meetDetails.host, userDetails._id)
            return
        }


        connectedUser.forEach(e => {
            socket.emit('disconnectUser', e.username, userDetails._id)
        })


        fetch(api + '/api/leaveMeet', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                authToken: localStorage.getItem('weMeetauthToken'),
                meetId: meetDetails._id,
                usersList: connectedUser.map(e => { return { ...e, connected: false } })
            }),
            keepalive: true,
        })


    }

    useEffect(() => {

        if (!meetDetails.hostId) {

            fetchRoomDetail()
            return;
        }

        if (meetDetails.hostId == userDetails._id) {
            setConnectedUser(meetDetails.usersList)
        }

        if (socket.connected) return;// only connect once


        socket.on('connect', () => {
            console.log(socket.id)


            socket.emit('join-room', userDetails.rights)
            socket.emit('join-room', userDetails.username)









            // events
            socket.on('askToJoin', askToJoin)
            socket.on('askToJoinReply', askToJoinReply)
            socket.on('user-live', userIsLive)
            socket.on('removeStream', removeStream)
            socket.on('disconnectUser', disconnectUser)
            socket.on('receiveMessage', receiveMessage)
            socket.on('unknown-user', unknonwUser)


        })


        socket.connect()
    }, [meetDetails])




    if (enterMeet)
        return <>
            <NavBar />
            <VideoMeetPage
                messages={messages}
                setMessages={setMessages}
                meetDetails={meetDetails}
                connectedUser={connectedUser}
                setConnectedUser={setConnectedUser}
            />
        </>
    return (
        <>
            <NavBar />
            <PreLoader
                id="MeetJoinPage"
            />
            <div
                className='h-full box-border pt-20 flex flex-col justify-center items-center gap-6'
            >

                <h1
                    className='text-4xl font-bold'
                >{meetDetails.meetName}</h1>

                <div>
                    host : {meetDetails.host}
                </div>
                <p
                    className='flex gap-2 '
                >
                    Meet Id:
                    <span
                        className='text-blue-500'
                    >
                        {meetId}
                    </span>
                </p>


                <br />
                <br />
                <br />



                {meetDetails.active
                    ?


                    <div
                        className={' rounded-xl text-2xl font-bold text-white hover:scale-95 transition-all flex gap-5 items-center ' +
                            (joinRequestSend ? " bg-orange-200  p-3 " : " bg-orange-500 px-10 py-3 ")
                        }

                        onClick={joinMeetFunc}
                    >


                        {joinRequestSend &&
                            <div className='animate-spin'>

                                <AiOutlineLoading3Quarters />
                            </div>
                        }

                        Join</div>

                    :
                    <>
                        <h1
                            className='text-2xl font-bold text-red-500'
                        >Meeting Ended</h1>
                        <a
                            href='/'
                            className={' rounded-xl text-2xl font-bold text-white hover:scale-95 transition-all flex gap-5 items-center bg-orange-500 px-10 py-3 '
                            }
                        >Home</a>
                    </>
                }

            </div>
        </>
    )
}
