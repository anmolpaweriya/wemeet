import React, { useEffect, useState } from 'react'
import Calander from '../Calander/Calander'
import { useGetAPI } from '../../CustomHooks/useAPI'
import { usePushToastFunc } from '../Toastify/Toastify'
import PreLoader, { useLoadingStart, useLoadingStop } from '../PreLoader/PreLoader'





export default function RecordsSection({
    userList
}) {

    const nowDate = new Date()


    const [recordsDate, setRecordsDate] = useState((new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate())).getTime())
    const [attendDetails, setAttendDetails] = useState([])



    // csutom hooks 
    const api = useGetAPI();
    const pushToastFunc = usePushToastFunc();
    const loadingStart = useLoadingStart();
    const loadingStop = useLoadingStop();






    async function getUserRecodsWithDate(dateTime) {

        loadingStart('RecordsPage');
        const data = await fetch(api + '/api/getRecords', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dateTime, authToken: localStorage.getItem('weMeetauthToken') })
        }).then(res => res.json())


        loadingStop('RecordsPage')
        if (data.err) {
            pushToastFunc({
                message: data.err,
                type: 'error',
                theme: 'dark'
            })
            return;
        }

        setAttendDetails(data.userList.map(e => {


            for (let i = 0; i < userList.length; i++) {

                if (userList[i].username != e.username) continue;

                return userList[i];
            }

        }))

    }



    useEffect(() => {
        if (!userList.length) return;

        getUserRecodsWithDate(recordsDate)
    }, [recordsDate, userList])

    return (
        <div>
            <Calander
                date={recordsDate}
                setDate={setRecordsDate}
            />

            <PreLoader
                id={"RecordsPage"}
            />


            <div>
                <h1
                    className='text-2xl m-4 font-bold'
                >
                    User List</h1>


                <div>

                    <table className='w-full border-b-2 border-b-black'>
                        <tr
                            className='sticky top-0 '
                        >
                            <th className='bg-black text-white  p-2'>Sr. No. </th>
                            <th className='bg-black text-white  p-2'>Profile Pic </th>
                            <th className='bg-black text-white  p-2'>Username </th>

                        </tr>


                        {attendDetails.map((e, i) => {
                            console.log(attendDetails)
                            return <tr
                                key={i}
                                className={'hover:bg-gray-200 ' + (e?.active ? ' bg-lime-300 ' : "")}
                            >
                                <td className='border-x-2 border-x-black p-2 text-center'>{i + 1} </td>
                                <td className='border-r-2 border-r-black p-2 text-center flex justify-center items-center'><img
                                    width={50}
                                    src={api + '/profilePic/' + e?.profilePic} alt="" /></td>
                                <td className='border-r-2 border-r-black p-2 text-center'>{e?.username} </td>


                            </tr>



                        })}
                    </table>
                </div>
            </div>
        </div>
    )
}
