import React, { useEffect, useState } from 'react'
import { HiOutlineUserGroup } from 'react-icons/hi2'
import { FiCalendar } from 'react-icons/fi'
import Calander from '../Calander/Calander'
import { useGetAPI } from '../../CustomHooks/useAPI'
import { usePushToastFunc } from '../Toastify/Toastify'
import PreLoader, { useLoadingStart, useLoadingStop } from '../PreLoader/PreLoader'

function formatRecordDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

function MemberCell({ user, api }) {
    return (
        <div className="adminMemberCell">
            <img
                className="adminAvatar"
                src={api + '/profilePic/' + user.profilePic}
                alt={user.username}
            />
            <div className="adminMemberInfo">
                <div className="adminMemberName">{user.username}</div>
                <div className="adminMemberMeta">Member</div>
            </div>
        </div>
    )
}

function StatusBadge({ active }) {
    return (
        <span className={'adminBadge ' + (active ? 'adminBadge--online' : 'adminBadge--offline')}>
            <span className="adminBadgeDot" />
            {active ? 'Online' : 'Offline'}
        </span>
    )
}

export default function RecordsSection({ userList }) {
    const nowDate = new Date()
    const [recordsDate, setRecordsDate] = useState(
        new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime()
    )
    const [attendDetails, setAttendDetails] = useState([])

    const api = useGetAPI()
    const pushToastFunc = usePushToastFunc()
    const loadingStart = useLoadingStart()
    const loadingStop = useLoadingStop()

    async function getUserRecodsWithDate(dateTime) {
        loadingStart('RecordsPage')
        const data = await fetch(api + '/api/getRecords', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dateTime,
                authToken: localStorage.getItem('weMeetauthToken'),
            }),
        }).then((res) => res.json())

        loadingStop('RecordsPage')
        if (data.err) {
            pushToastFunc({ message: data.err, type: 'error', theme: 'dark' })
            return
        }

        setAttendDetails(
            data.userList.map((e) => {
                for (let i = 0; i < userList.length; i++) {
                    if (userList[i].username != e.username) continue
                    return userList[i]
                }
            })
        )
    }

    useEffect(() => {
        if (!userList.length) return
        getUserRecodsWithDate(recordsDate)
    }, [recordsDate, userList])

    const presentUsers = attendDetails.filter(Boolean)
    const onlineCount = presentUsers.filter((u) => u.active).length

    return (
        <div className="adminPanel">
            <div className="adminPanelHeader">
                <div className="adminPanelTitleBlock">
                    <h2>Attendance records</h2>
                    <p>View who was marked present on the selected date.</p>
                </div>
                <div className="adminStatRow">
                    <div className="adminStatCard adminStatCard--accent">
                        <span>Present</span>
                        <strong>{presentUsers.length}</strong>
                    </div>
                    <div className="adminStatCard">
                        <span>Online now</span>
                        <strong>{onlineCount}</strong>
                    </div>
                    <div className="adminStatCard">
                        <span>Selected date</span>
                        <strong style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                            {formatRecordDate(recordsDate)}
                        </strong>
                    </div>
                </div>
            </div>
            <PreLoader id="RecordsPage" />
<div className='grid lg:grid-cols-[1fr_3fr] md:grid-cols-2 grid-cols-1 gap-4'>
            <div className="adminCalendarCard">
                <Calander date={recordsDate} setDate={setRecordsDate} />
            </div>


            <div className="adminTableCard">
                <div className="adminToolbar">
                    <FiCalendar style={{ color: '#64748b', flexShrink: 0 }} />
                    <span className="adminToolbarCount">
                        {presentUsers.length} attendee{presentUsers.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="adminTableScroll">
                    <table className="adminDataTable">
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Status</th>
                                <th>Attendance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {presentUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="adminTableEmpty">
                                        <div className="adminEmptyState">
                                            <HiOutlineUserGroup />
                                            <p>No attendance for this date</p>
                                            <span>Select another day on the calendar</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                presentUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <MemberCell user={user} api={api} />
                                        </td>
                                        <td>
                                            <StatusBadge active={user.active} />
                                        </td>
                                        <td>
                                            <span className="adminBadge adminBadge--present">
                                                Present
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </div>
    )
}
