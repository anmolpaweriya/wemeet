import React, { useEffect, useLayoutEffect, useState } from 'react'
import * as faceapi from 'face-api.js'



// icons 
import { FaCamera } from "react-icons/fa";



// custom hooks
import { usePushToastFunc } from '../Toastify/Toastify';
import { useGetAPI } from '../../CustomHooks/useAPI';
import { useSetUserDetails } from '../../CustomHooks/useUserDetails';
import PreLoader, { useLoadingStart, useLoadingStop } from '../PreLoader/PreLoader';





export default function LoginSystem() {

    const [section, setsection] = useState('login');
    const [profilePic, setProfilePic] = useState(null);
    const [faceApiLoaded, setFaceApiLoaded] = useState(false)
    const [isImageValid, SetisImageValid] = useState(false);
    const [signUpCredentials, setSignUpCredentials] = useState({
        username: "",
        password: ""
    })
    const [loginCredentials, setLoginCredentials] = useState({
        username: "",
        password: ""
    })

    const loadingStart = useLoadingStart();
    const loadingStop = useLoadingStop();


    // cutom hooks
    const api = useGetAPI();
    const setUserDetails = useSetUserDetails();
    const pushToastFunc = usePushToastFunc();






    // functions
    async function checkImage() {

        if (!faceApiLoaded) {
            await loadFaceAPI()
        }



        const image = await faceapi.bufferToImage(profilePic)
        const detector = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();



        if (detector.length > 1) {
            pushToastFunc({
                message: 'more than 1 Face Is Detected',
                theme: 'dark',
                type: 'error'
            })
            SetisImageValid(false)


        } else if (detector.length == 0) {
            pushToastFunc({
                message: 'No Face Detected',
                theme: 'dark',
                type: 'error'
            })
            SetisImageValid(false)


        }



        if (detector.length != 1) return;

        if (detector[0].detection._score < 0.7) {
            pushToastFunc({
                message: 'Face is Not Clear',
                theme: 'dark',
                type: 'error'
            })
            SetisImageValid(false)

            return
        }



        SetisImageValid(true)

        pushToastFunc({
            message: 'Image is Valid',
            theme: 'dark',
            type: 'success'
        })


    }



    async function loadFaceAPI() {
        return Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        ]).then(() => {
            setFaceApiLoaded(true)
            loadingStop('loginPage')
        })

    }


    async function loginFuncBtn(e) {
        e.preventDefault();


        if (!loginCredentials.username || !loginCredentials.password) {
            pushToastFunc({
                message: 'Credentials are Missing',
                theme: 'dark',
                type: 'error'
            })
            return;
        }



        if (loginCredentials.username.includes(' ')) {
            pushToastFunc({
                message: 'username cannot contain spaces',
                theme: 'dark',
                type: 'error'
            })
            return;
        }

        loadingStart('loginPage')

        const data = await fetch(api + '/api/login', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: loginCredentials.username,
                password: loginCredentials.password,
            })
        }).then(res => {
            try {
                return res.json()
            } catch (e) {
                return res.text()
            }
        }
        )

        loadingStop('loginPage')
        if (data.err != undefined) {
            pushToastFunc({
                message: data.err,
                theme: 'dark',
                type: 'error'
            })
            return;
        }

        if (!data.authToken) {
            pushToastFunc({
                message: 'SomeThing Went Wrong',
                theme: 'dark',
                type: 'error'
            })
            return;
        }


        pushToastFunc({
            message: "Logged In",
            theme: 'dark',
            type: 'success'
        })



        setTimeout(() => {
            localStorage.setItem('weMeetauthToken', data.authToken)
            // setUserDetails(data.userDetail)
            window.location.reload();
        }, 5000);

    }




    async function signupFuncBtn(e) {
        e.preventDefault();


        if (!isImageValid) {
            pushToastFunc({
                message: 'Image Is Not Valid',
                theme: 'dark',
                type: 'error'
            })
            return;
        }


        if (!signUpCredentials.username || !signUpCredentials.password) {
            pushToastFunc({
                message: 'Credentials are Missing',
                theme: 'dark',
                type: 'error'
            })
            return;
        }



        if (signUpCredentials.username.includes(' ')) {
            pushToastFunc({
                message: 'username cannot contain spaces',
                theme: 'dark',
                type: 'error'
            })
            return;
        }
        const formData = new FormData();

        // append variables first or else we aren't able to fetch them before uploading file
        formData.append('username', signUpCredentials.username)
        formData.append('password', signUpCredentials.password)
        formData.append('profilePic', profilePic)


        loadingStart('loginPage')
        const data = await fetch(api + '/api/signup', {
            method: "PUT",
            body: formData
        }).then(res => {
            try {
                return res.json()
            } catch (e) {
                return res.text()
            }
        }
        )

        loadingStop('loginPage')


        if (data.err != undefined) {
            pushToastFunc({
                message: data.err,
                theme: 'dark',
                type: 'error'
            })
            return;
        }




        pushToastFunc({
            message: "Signed up",
            theme: 'dark',
            type: 'success'
        })



        setTimeout(() => {
            localStorage.setItem('weMeetauthToken', data.authToken)
            setUserDetails(data.userDetail)

        }, 5000);



    }











    // useeffects


    useEffect(() => {
        if (!profilePic) return
        checkImage()
    }, [profilePic])



    // load face api
    useLayoutEffect(() => {

        loadFaceAPI()

    }, [])



    return (<>
        <PreLoader
            id="loginPage"
        />
        <div className='flex flex-col justify-center items-center w-full h-full '>

            <div className={'absolute duration-500 transition-all glassy p-5 bg-blue-300 flex flex-col justify-center translate-y-[-50%] ' + (section == 'login' ? 'top-[50svh]' : 'top-[-100svh]')}>
                <h1 className='font-bold text-2xl'>Login</h1>

                <form className='grid gap-4 py-4 mt-4'>
                    <input
                        required
                        className=' bg-transparent outline-none border-b-2 border-b-white text-black p-1 px-2 placeholder:text-white'
                        placeholder='username'
                        spellCheck={false}
                        type="text"
                        value={loginCredentials.username}
                        onChange={e => setLoginCredentials(preState => {
                            return { ...preState, username: e.target.value.trim() }
                        })}
                    />
                    <input
                        required
                        className=' bg-transparent outline-none border-b-2 border-b-white text-black p-1 ox-2 placeholder:text-white'
                        placeholder='password'
                        type="password"
                        value={loginCredentials.password}
                        onChange={e => setLoginCredentials(preState => {
                            return { ...preState, password: e.target.value }
                        })}
                    />
                    <button
                        onClick={loginFuncBtn}
                        className='bg-white p-2 rounded-xl'
                    >Login</button>

                </form>


                <a
                    align="center"
                    className='text-sm cursor-pointer mt-5'
                    onClick={e => setsection('signup')}
                > don't have an account? <span className='text-blue-800'>Signup</span>  </a>
            </div>



            <div className={'absolute duration-500 transition-all  glassy p-5 bg-red-300 flex flex-col justify-center translate-y-[-50%] ' + (section == 'signup' ? 'top-[50svh]' : 'top-[150svh]')}>
                <h1 className='font-bold text-2xl'>Sign Up</h1>

                <form className='grid gap-4 py-4 mt-4'>
                    <label
                        className={'justify-self-center text-7xl overflow-hidden w-[100px] h-[100px] flex justify-center items-center rounded-full ' + (profilePic != null ? ' border-4 ' : '') + (isImageValid ? ' border-green-400 ' : '  border-red-500')}
                    >
                        {profilePic ?

                            <img
                                className='h-full'
                                src={URL.createObjectURL(profilePic)}
                            />

                            :
                            <FaCamera />
                        }
                        <input type="file"
                            className='hidden'
                            required
                            accept="image/png, image/jpeg"
                            onChange={e => setProfilePic(e.target.files[0])}

                        />
                    </label>
                    <input
                        required
                        className={' bg-transparent outline-none border-b-2 border-b-white text-black p-1 px-2 placeholder:text-white '}
                        placeholder='username'
                        spellCheck={false}
                        type="text"
                        value={signUpCredentials.username}
                        onChange={e => setSignUpCredentials(preState => {
                            return { ...preState, username: e.target.value.trim() }
                        })}
                    />
                    <input
                        required
                        className=' bg-transparent outline-none border-b-2 border-b-white text-black p-1 ox-2 placeholder:text-white'
                        placeholder='password'
                        type="password"
                        value={signUpCredentials.password}
                        onChange={e => setSignUpCredentials(preState => {
                            return { ...preState, password: e.target.value }
                        })}
                    />


                    <button
                        className='bg-white p-2 rounded-xl'
                        onClick={signupFuncBtn}
                    >Signup</button>

                </form>


                <a
                    onClick={e => setsection('login')}
                    align="center"
                    className='text-sm cursor-pointer mt-5'
                > Already have an account? <span className='text-blue-800'>login</span>  </a>
            </div>


        </div>
    </>

    )
}
