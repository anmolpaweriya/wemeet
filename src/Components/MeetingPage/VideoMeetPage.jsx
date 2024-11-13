import React, { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'
import { Peer } from 'peerjs'


// icons
import { FaVideo } from "react-icons/fa";
import { FaVideoSlash } from "react-icons/fa";
import { FaMicrophone } from "react-icons/fa";
import { FaMicrophoneSlash } from "react-icons/fa";
import { FaCopy } from "react-icons/fa";
import { MdScreenShare } from "react-icons/md";
import { IoMdChatbubbles } from "react-icons/io";
import { IoCall } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { MdDraw } from "react-icons/md";








// custom hooks
import { useSocket } from '../../CustomHooks/useSocket';
import { usePushToastFunc } from '../Toastify/Toastify';
import { useGetAPI } from '../../CustomHooks/useAPI';
import { useUserDetails } from '../../CustomHooks/useUserDetails';
import PreLoader, { useLoadingStart, useLoadingStop } from '../PreLoader/PreLoader';
import { usePeer, useSetPeer } from '../../CustomHooks/usePeer';

export default function VideoMeetPage({
    meetDetails,
    connectedUser,
    setConnectedUser,
    messages,
    setMessages
}) {


    // custom hooks
    const pushToastFunc = usePushToastFunc();
    const api = useGetAPI();
    const userDetails = useUserDetails()
    const socket = useSocket();
    const loadingStart = useLoadingStart();
    const loadingStop = useLoadingStop();
    const peer = usePeer();
    const setPeer = useSetPeer();






    // variables and states

    const simpleUserVideoRef = useRef();
    const simpleUserLocalVideoRef = useRef();
    const simpleUserLocalStream = useRef();
    const labeledFaceDetector = useRef(null);

    const videoRef = useRef();
    const localStream = useRef();
    const [enabledMedia, setEnabledMedia] = useState({
        video: false,
        audio: false
    })
    const [showChat, setShowChat] = useState(false)
    const messageInputRef = useRef();
    const [isScreenShare, setIsScreenShare] = useState(false)
    const iceServers =  [
        {
          urls: "stun:stun.relay.metered.ca:80",
        },
        {
          urls: "turn:global.relay.metered.ca:80",
          username: "2ad699eea1f2f61b1f11958b",
          credential: "5tcqmBTXblTRGu/p",
        },
        {
          urls: "turn:global.relay.metered.ca:80?transport=tcp",
          username: "2ad699eea1f2f61b1f11958b",
          credential: "5tcqmBTXblTRGu/p",
        },
        {
          urls: "turn:global.relay.metered.ca:443",
          username: "2ad699eea1f2f61b1f11958b",
          credential: "5tcqmBTXblTRGu/p",
        },
        {
          urls: "turns:global.relay.metered.ca:443?transport=tcp",
          username: "2ad699eea1f2f61b1f11958b",
          credential: "5tcqmBTXblTRGu/p",
        },
    ]









    // functions
    function loadLabeledImages() {
        const labels = [userDetails.username]
        return Promise.all(
            labels.map(async label => {
                const descriptions = []

                const img = await faceapi.fetchImage(`${api}/profilePic/${userDetails.profilePic}`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                descriptions.push(detections.descriptor)


                return new faceapi.LabeledFaceDescriptors(label, descriptions)
            })
        )
    }



    async function localStreamReload() {

        if (!enabledMedia.video && !isScreenShare && !enabledMedia.audio) {
            if ((meetDetails.hostId != userDetails._id)) {
                socket.emit('removeStream', meetDetails.host, userDetails._id, false)
                simpleUserVideoRef.current.srcObject = null
            } else {
                videoRef.current.srcObject = null;
                connectedUser.forEach(e => {
                    socket.emit('removeStream', e.username, userDetails._id, true)

                })
            }
        }

        if (!enabledMedia.video && localStream.current)
            localStream.current.getVideoTracks()[0]?.stop()
        if (!isScreenShare && localStream.current)
            localStream.current.getVideoTracks()[0]?.stop()

        if (!enabledMedia.audio && localStream.current)
            localStream.current.getAudioTracks()[0]?.stop()



        if (!enabledMedia.video && !isScreenShare && !enabledMedia.audio && localStream.current) {


            localStream.current.getVideoTracks()[0]?.stop()
            localStream.current.getAudioTracks()[0]?.stop()
            localStream.current = null;

            return;
        }

        if (isScreenShare)
            localStream.current = await navigator.mediaDevices.getDisplayMedia({ ...enabledMedia, video: true });
        else
            localStream.current = await navigator.mediaDevices.getUserMedia(enabledMedia);

        if (userDetails.username == meetDetails.host) {
            videoRef.current.srcObject = localStream.current;
            sendStreamToConnectedUsers()
        }
        else {
            simpleUserVideoRef.current.srcObject = localStream.current
            sendStreamToHost()
        }




    }


    function copyUrlFunc() {
        navigator.clipboard.writeText(window.location.href)

        pushToastFunc({
            message: "Copied",
            theme: "dark"
        })
    }

    async function callEndFunc() {

        if (meetDetails.host != userDetails.username) {
            window.location.href = '/'
            return;
        }

        const confirmEndMeet = confirm("Do You Wanna End this Meeting ");
        if (!confirmEndMeet) return;
        loadingStart('VideoMeetPage')

        const data = await fetch(api + '/api/endMeeting', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                authToken: localStorage.getItem('weMeetauthToken'),
                meetId: meetDetails._id,
                usersList: connectedUser
            })
        }).then(res => res.json())
        loadingStop('VideoMeetPage')


        if (data.err) {


            pushToastFunc({
                message: data.err,
                theme: "dark",
                type: 'error'
            })
            return;
        }

        window.location.href = '/'
    }


    function admitJoinRequest(username) {
        setConnectedUser(preState => preState.map(e => {

            if (e.username != username) return e
            return {
                ...e, allow: true,
                unknown: undefined,
            }

        }))

        socket.emit('askToJoinReply', username, true)


    }
    function cancelJoinRequest(username) {
        setConnectedUser(preState => preState.filter(e => e.username != username))

        socket.emit('askToJoinReply', username, false)
    }

    async function simpleUserHiddenVideoStreamReload() {
        simpleUserLocalStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })

        simpleUserLocalVideoRef.current.srcObject = simpleUserLocalStream.current;

        simpleUserLocalVideoRef.current.onplay = () => {


            setInterval(async () => {


                const faceMatcher = new faceapi.FaceMatcher(labeledFaceDetector.current, 0.6)


                const detector = await faceapi.detectAllFaces(simpleUserLocalVideoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors()
                const displaySize = { width: simpleUserLocalVideoRef.current.width, height: simpleUserLocalVideoRef.current.height }


                const resizedDetections = faceapi.resizeResults(detector, displaySize)




                const labelResult = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))



                labelResult.forEach((labelName, i) => {

                    if (labelName._label == userDetails.username) {

                        socket.emit('user-live', userDetails._id);
                    } else {
                        socket.emit('unknown-user', userDetails._id)
                    }

                })

            }, 1000);
        }


    }


    function sendStreamToConnectedUsers() {
        connectedUser.map(e => {
            peer.call(e._id, localStream.current)
        })

    }
    function sendStreamToHost(id) {
        if (!localStream.current || !peer)
            return;

        if (meetDetails.hostId == userDetails._id) return;
        peer.call(meetDetails.hostId, localStream.current)



    }

    function sendMessage(message) {
        socket.emit('sendMessage', meetDetails._id, userDetails.username, message)


        setMessages(preState => [...preState,
        { username: "You", message }])
    }
    function secondsFormat(sec) {
        if (!sec) return ""

        if (sec < 60) return `${sec} s`
        if (sec < 60 * 60) return `${Math.floor(sec / 60)} m`
        return `${Math.floor(sec / 3600)} h`
    }












    // useEffects


    useEffect(() => {

        // reload stream 
        localStreamReload();

    }, [enabledMedia, isScreenShare])






    useEffect(() => {
        socket.emit('join-room', meetDetails._id);




        setPeer(new Peer(userDetails._id, {iceServers}))



        if (userDetails.username == meetDetails.host) {
            loadingStop('VideoMeetPage')
            return;
        }


        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        ]).then(async () => {

            labeledFaceDetector.current = await loadLabeledImages()

            simpleUserHiddenVideoStreamReload()

            loadingStop('VideoMeetPage')
        })


    }, [])



    useEffect(() => {

        peer?.on("call", call => {
            // console.log(call)        // testing

            call.answer();
            call.on('stream', remoteStream => {
                // console.log(remoteStream)    // testing

                if (meetDetails.hostId == userDetails._id) {
                    document.getElementById(`id-${call.peer}`).srcObject = remoteStream
                    peer.call(call.peer, localStream.current)
                }
                else
                    videoRef.current.srcObject = remoteStream
            })
        })

        peer?.on('open', (id) => {

            sendStreamToHost()

        })
    }, [peer])



    return (
        <>
            <PreLoader
                id="VideoMeetPage"
            />

            <video
                autoPlay
                className='hidden'
                width={500}
                height={500}
                ref={simpleUserLocalVideoRef}
            />




            {/* chat section  */}
            <div className={'transition-all w-[400px] max-w-[100vw] grid grid-rows-[50px_auto_50px] fixed  h-full bg-[#ffffff99] rounded-l-3xl z-10 shadow-2xl glassy p-2 box-border duration-500 '
                + (showChat ? " right-0 " : " right-[-100%] ")
            }>

                <button
                    className='text-4xl  justify-self-end p-2'
                    onClick={() => setShowChat(false)}
                ><MdCancel /></button>


                <div className='h-full overflow-y-scroll flex flex-col gap-1'>
                    {messages.map(e => {

                        return <div className='w-full flex gap-2 items-center'>
                            <p className='font-bold text-sm bg-black text-white p-2 rounded-xl'> {e.username}</p>
                            <p
                                className='font-bold'
                            >
                                {e.message}
                            </p>
                        </div>
                    })}

                </div>



                <div
                    className='w-full grid grid-cols-[auto_100px] border-2 rounded-xl overflow-hidden'
                >
                    <input type="text"
                        spellCheck={false}
                        ref={messageInputRef}
                        className='text-xl p-2 w-full outline-none'

                        onKeyDown={e => {
                            if (e.key != "Enter") return;

                            sendMessage(messageInputRef.current.value)
                            messageInputRef.current.value = ""

                        }}
                    />
                    <button
                        className='bg-orange-500 transition-all hover:bg-orange-600 rounded-xl text-xl font-bold text-white '
                        onClick={() => {
                            sendMessage(messageInputRef.current.value)
                            messageInputRef.current.value = ""

                        }}
                    >Send</button>
                </div>
            </div>

            <div
                className='h-full box-border pt-14 w-full flex gap-2 items-center flex-col '
            >


                <h1 className='text-3xl font-bold p-2 '>
                    {meetDetails.meetName}
                </h1>


                {/* main video stream  */}
                <div
                    className='relative w-[90vw] max-w-[1000px] h-[50vh] bg-gray-300 rounded-xl overflow-hidden'
                >


                    <div className='absolute z-1 w-full h-full top-0 left-0  flex items-center justify-center '>

                        <img
                            className='w-20 h-20 object-cover rounded-full'
                            src={api + '/profilePic/' + meetDetails.hostProfilePic}
                            alt="" />
                    </div>




                    <video
                        className='w-full h-full relative z-3'
                        ref={videoRef}
                        id='MainVideoID'
                        autoPlay />

                </div>




                {/* users list  */}
                <div className='p-2 flex w-[100vw] overflow-x-scroll m-2 gap-2 overflow-y-hidden'>


                    {(userDetails.username != meetDetails.host) ?
                        <div
                            className=' relative h-[100px] w-[200px] rounded-lg p-1 bg-gray-300 '>

                            <p
                                style={{
                                    textShadow: "0px 0px 7px #fff"
                                }}
                                className='absolute bottom-4 left-4 z-10 font-bold'>

                                You
                            </p>




                            <div className='absolute z-1 w-full h-full top-0 left-0  flex items-center justify-center '>

                                <img
                                    className='w-16 h-16 object-cover rounded-full'
                                    src={api + '/profilePic/' + userDetails.profilePic}
                                    alt="" />
                            </div>



                            <video autoPlay
                                className='w-full h-full relative z-2'

                                ref={simpleUserVideoRef}
                            />


                        </div>
                        :
                        <></>
                    }



                    {(userDetails.username == meetDetails.host) && connectedUser.map(e => {
                        console.log(e.unknown, e.username) // testing 


                        if (!e.connected && e.allow) return;
                        return <div
                            key={e.username}
                            className={'relative h-[100px] w-[200px] rounded-lg p-1 box-border  '
                                + (e.unknown ? " bg-red-400 " : " bg-gray-300 ")
                                + ((!e.unknow && e.active) ? " bg-green-400 " : " bg-gray-300 ")
                            }
                        >
                            <p
                                style={{
                                    textShadow: "0px 0px 7px #fff"
                                }}
                                className='absolute bottom-4 left-4 z-10 font-bold'>

                                {e.username}
                            </p>



                            <div className='absolute z-1 w-full h-full top-0 left-0  flex items-center justify-center '>

                                <img
                                    className='w-16 h-16 object-cover rounded-full'
                                    src={api + '/profilePic/' + e.profilePic}
                                    alt="" />
                            </div>


                            {e.allow
                                ?
                                <video autoPlay
                                    className='w-full h-full relative z-2'
                                    id={`id-${e._id}`}

                                />
                                :
                                <div className='relative z-2 flex w-full justify-end gap-4 pr-3'>

                                    <button
                                        onClick={() => admitJoinRequest(e.username)}
                                        className='bg-green-400 font-bold p-2  rounded-lg text-xl'><FaCheck /></button>
                                    <button
                                        onClick={() => cancelJoinRequest(e.username)}
                                        className='bg-red-400 font-bold p-2  rounded-lg text-xl'><MdCancel /></button>

                                </div>
                            }


                            <p className='absolute right-1 top-2'>
                                {secondsFormat(e.liveTime)}
                            </p>
                        </div>
                    })}


                </div>





                <div className='flex w-full justify-evenly p -2 max-w-[1000px]'>

                    <button className={'hidden sm:flex p-4 text-2xl rounded-full hover:scale-95 transition-all '
                        + (isScreenShare ? " bg-blue-400 text-white " : " bg-gray-300 ")
                    }

                        onClick={() => {

                            setIsScreenShare(preState => !preState)
                            enabledMedia.video && setEnabledMedia(preState => {
                                return {
                                    ...preState,
                                    video: false
                                }
                            })
                        }}
                    >

                        <MdScreenShare />


                    </button>
                    <button className={' p-4 text-2xl rounded-full hover:scale-95 transition-all '
                        + (enabledMedia.video ? " bg-blue-400 text-white " : " bg-gray-300 ")
                    }

                        onClick={() => {

                            isScreenShare && setIsScreenShare(false);
                            setEnabledMedia(preState => {
                                return {
                                    ...preState,
                                    video: !preState.video
                                }
                            })
                        }

                        }
                    >
                        {enabledMedia.video ?
                            <FaVideo />
                            :
                            <FaVideoSlash />
                        }
                    </button>

                    <button className={' p-4 text-2xl rounded-full hover:scale-95 transition-all '
                        + (enabledMedia.audio ? " bg-blue-400 text-white " : " bg-gray-300 ")
                    }
                        onClick={() => setEnabledMedia(preState => {
                            return {
                                ...preState,
                                audio: !preState.audio
                            }
                        })}

                    >
                        {enabledMedia.audio ?
                            <FaMicrophone />
                            :
                            <FaMicrophoneSlash />
                        }


                    </button>

                    <button className={'bg-gray-300 p-4 text-2xl rounded-full hover:scale-95 transition-all '}
                        onClick={copyUrlFunc}
                    ><FaCopy /></button>
                    <a className={'bg-gray-300 p-4 text-2xl rounded-full hover:scale-95 transition-all '}
                        href='./apDraw/index.html'
                        target='_blank'
                    ><MdDraw /></a>

                    <button className={' p-4 text-2xl rounded-full hover:scale-95 transition-all ' +
                        (showChat ? " bg-blue-400 text-white " : " bg-gray-300 ")}

                        onClick={() => setShowChat(preState => !preState)}

                    ><IoMdChatbubbles /></button>

                    <button className={'bg-red-500 p-4 text-2xl rounded-full hover:scale-95 transition-all '}

                        onClick={callEndFunc}
                    ><IoCall /></button>

                </div>
            </div>
        </>

    )
}
