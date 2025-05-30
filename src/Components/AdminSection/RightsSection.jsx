import React from 'react'
import { useGetAPI } from '../../CustomHooks/useAPI'
import { useLoadingStart, useLoadingStop } from '../PreLoader/PreLoader';
import { usePushToastFunc } from '../Toastify/Toastify';

export default function RightsSection({
    userList,
    setUserList
}) {


    const api = useGetAPI();
    const loadingStart = useLoadingStart();
    const loadingStop = useLoadingStop();
    const pushToastFunc = usePushToastFunc();



    async function updateUserRights(userId, userRights) {

        loadingStart('AdminPage')
        const res = await fetch(api + '/api/updaterights', {
            method: 'PATCH',
            headers: {

                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId, userRights,
                authToken: localStorage.getItem('weMeetauthToken')
            })
        })
        loadingStop('AdminPage')


        const data = await res.json();

        if (data.err != undefined) {
            pushToastFunc({
                message: data.err,
                theme: 'dark',
                type: 'error'
            })
            return;
        }

        pushToastFunc({
            message: data.success,
            theme: 'dark',
            type: 'success'
        })

        setUserList(preState => preState.map(e => {
            if (e._id != userId) return e;

            return {
                ...e,
                rights: userRights
            }
        }))

    }



    return (
        <div>

            <table className='w-full border-b-2 border-b-orange-500'>
                <tr
                    className='sticky top-0 '
                >
                    <th className='bg-orange-500 text-white  p-2'>Sr. No. </th>
                    <th className='bg-orange-500 text-white  p-2'>Profile Pic </th>
                    <th className='bg-orange-500 text-white  p-2'>Username </th>
                    <th className='bg-orange-500 text-white  p-2'>rights</th>
                </tr>


                {userList.map((e, i) => {

                    return <tr
                        key={i}
                        className={'hover:bg-gray-200 ' + (e.active ? ' bg-lime-300 ' : "")}
                    >
                        <td className='border-x-2 border-x-orange-500 p-2 text-center'>{i + 1} </td>
                        <td className='border-r-2 border-r-orange-500 p-2 text-center flex justify-center items-center'><img
                            width={50}
                            src={api + '/profilePic/' + e.profilePic} alt="" /></td>
                        <td className='border-r-2 border-r-orange-500 p-2 text-center'>{e.username} </td>
                        <td className=' p-2 text-center'>
                            <select value={e.rights}
                                onChange={(el) => updateUserRights(e._id, el.target.value)}
                            >
                                <option value="admin">admin</option>
                                <option value="user">user</option>
                            </select>

                        </td>

                    </tr>



                })}
            </table>
        </div>
    )
}
