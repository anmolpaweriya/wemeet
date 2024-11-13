import React, { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'








// custiom hooks
import { useGetAPI } from '../../CustomHooks/useAPI'
import { useUserDetails } from '../../CustomHooks/useUserDetails'
import { useSocket } from '../../CustomHooks/useSocket'
import { usePushToastFunc } from '../Toastify/Toastify'
import PreLoader, { useLoadingStop } from '../PreLoader/PreLoader'





export default function AttendanceSection({

}) {



    const videoRef = useRef()
    const interval = useRef(null)
    const localStream = useRef(null)
    const labeledFaceDetector = useRef(null);
    const [isVideoEnable, setIsVideoEnable] = useState(false)
    const [videoDimensions, setVideoDimensions] = useState({ width: 400, height: 500 })
    const [isPresent, SetisPresent] = useState(false)
    const firstAttend = useRef(false)
    const isRequestAllowed = useRef(true);







    // custom hooks
    const api = useGetAPI();
    const userDetails = useUserDetails()
    const socket = useSocket();
    const pushToastFunc = usePushToastFunc();
    const loadingStop = useLoadingStop();


















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



    async function todayFirstAttendance() {
        if (firstAttend.current) return;
        if (!isRequestAllowed.current) return;
        isRequestAllowed.current = false;


        const data = await fetch(api + '/api/attendance', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ authToken: localStorage.getItem('weMeetauthToken') })
        }).then(res => res.json())


        isRequestAllowed.current = true
        if (data.err) {
            pushToastFunc({
                message: data.err,
                theme: 'dark',
                type: 'error'
            })

            return;

        }
        firstAttend.current = true;


        if (data.note)
            pushToastFunc({
                message: data.note,
                theme: 'dark',
            })
        else
            pushToastFunc({
                message: data.success,
                theme: 'dark',
                type: 'success'
            })
    }


    function updateVideoStream() {

        interval.current && clearInterval(interval.current)

        if (!isVideoEnable) {
            if (localStream.current) {
                localStream.current.getVideoTracks()[0].stop();
            }
            return
        }




        navigator.mediaDevices.getUserMedia({ video: isVideoEnable && videoDimensions }).then(stream => {
            localStream.current = stream
            videoRef.current.srcObject = stream





            videoRef.current.onplay = (e) => {
                const canva = faceapi.createCanvasFromMedia(videoRef.current)
                const videoDiv = document.querySelector('.videoDiv')
                videoDiv.querySelector('canvas')?.remove()


                videoDiv.append(canva);

                const displaySize = { width: videoRef.current.width, height: videoRef.current.height }
                faceapi.matchDimensions(canva, displaySize)



                interval.current = setInterval(async () => {

                    canva.getContext('2d').clearRect(0, 0, canva.width, canva.height)

                    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDetector.current, 0.6)


                    const detector = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors()
                    const resizedDetections = faceapi.resizeResults(detector, displaySize)


                    !resizedDetections.length && SetisPresent(false)

                    const labelResult = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))



                    labelResult.forEach((labelName, i) => {


                        if (labelName._label == userDetails.username) {
                            todayFirstAttendance()
                            socket.emit('user-live', userDetails._id)
                        }
                        SetisPresent(labelName._label == userDetails.username)

                        const box = resizedDetections[i].detection.box;
                        const drawBox = new faceapi.draw.DrawBox(box, { label: labelName.toString() })
                        drawBox.draw(canva)
                    })
                    // faceapi.draw.drawDetections(canva, resizedDetections)
                    // faceapi.draw.drawFaceLandmarks(canva, resizedDetections)


                }, 500);

            }
        })
    }









    // useEffects

    useEffect(() => {



        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        ]).then(async () => {

            labeledFaceDetector.current = await loadLabeledImages()
            loadingStop('AttendPage')
            updateVideoStream()
        })


    }, [])






    useEffect(() => {

        updateVideoStream()

    }, [isVideoEnable])



    useEffect(() => {


        if (socket.connected) return;
        if (!userDetails) return



        socket.on('connect', () => {
            console.log(socket.id)


        })

        socket.connect();
    }, [userDetails])





    return (
        <>
            <PreLoader
                id="AttendPage"
            />
            <div className='relative z-1 flex gap-2'>
                <button
                    onClick={() => setIsVideoEnable(preState => !preState)}
                    className='bg-blue-400 p-2 rounded-md px-4 text-xl cursor-pointer'
                >{isVideoEnable ? "Stop" : "Start"}</button>
                {isPresent && <button
                    onClick={() => setIsVideoEnable(preState => !preState)}
                    className='bg-blue-400 p-2 rounded-md px-4 text-xl cursor-pointer'
                >Present</button>
                }</div>

            <div className='videoDiv relative '>

                <video
                    autoPlay
                    muted
                    ref={videoRef}
                    width={videoDimensions.width}
                    height={videoDimensions.height}
                    className='rounded-xl absolute'
                ></video>
            </div>
        </>
    )
}
