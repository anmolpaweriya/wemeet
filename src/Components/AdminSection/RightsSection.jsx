import React, { useMemo, useState } from 'react'
import { HiOutlineShieldCheck } from 'react-icons/hi2'
import { FiSearch } from 'react-icons/fi'
import { useGetAPI } from '../../CustomHooks/useAPI'
import { useLoadingStart, useLoadingStop } from '../PreLoader/PreLoader'
import { usePushToastFunc } from '../Toastify/Toastify'

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
                <div className="adminMemberMeta">
                    {user.rights === 'admin' ? 'Administrator' : 'Standard user'}
                </div>
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

function RoleBadge({ role }) {
    return (
        <span className={'adminBadge ' + (role === 'admin' ? 'adminBadge--admin' : 'adminBadge--user')}>
            {role === 'admin' ? 'Admin' : 'User'}
        </span>
    )
}

export default function RightsSection({ userList, setUserList }) {
    const [search, setSearch] = useState('')

    const api = useGetAPI()
    const loadingStart = useLoadingStart()
    const loadingStop = useLoadingStop()
    const pushToastFunc = usePushToastFunc()

    const filteredUsers = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return userList
        return userList.filter((u) => u.username.toLowerCase().includes(q))
    }, [userList, search])

    const adminCount = userList.filter((u) => u.rights === 'admin').length

    async function updateUserRights(userId, userRights) {
        loadingStart('AdminPage')
        const res = await fetch(api + '/api/updaterights', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                userRights,
                authToken: localStorage.getItem('weMeetauthToken'),
            }),
        })
        loadingStop('AdminPage')

        const data = await res.json()

        if (data.err != undefined) {
            pushToastFunc({ message: data.err, theme: 'dark', type: 'error' })
            return
        }

        pushToastFunc({ message: data.success, theme: 'dark', type: 'success' })

        setUserList((preState) =>
            preState.map((e) => {
                if (e._id != userId) return e
                return { ...e, rights: userRights }
            })
        )
    }

    return (
        <div className="adminPanel">
            <div className="adminPanelHeader">
                <div className="adminPanelTitleBlock">
                    <h2>Access management</h2>
                    <p>Control admin and user permissions for each account.</p>
                </div>
                <div className="adminStatRow">
                    <div className="adminStatCard adminStatCard--accent">
                        <span>Total users</span>
                        <strong>{userList.length}</strong>
                    </div>
                    <div className="adminStatCard">
                        <span>Administrators</span>
                        <strong>{adminCount}</strong>
                    </div>
                </div>
            </div>

            <div className="adminTableCard">
                <div className="adminToolbar">
                    <div className="adminSearchWrap">
                        <FiSearch />
                        <input
                            type="search"
                            className="adminSearchInput"
                            placeholder="Search by username..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <span className="adminToolbarCount">
                        {filteredUsers.length} of {userList.length} shown
                    </span>
                </div>
                <div className="adminTableScroll">
                    <table className="adminDataTable">
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Status</th>
                                    <th>Current role</th>
                                    <th>Change role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="adminTableEmpty">
                                            <div className="adminEmptyState">
                                                <HiOutlineShieldCheck />
                                                <p>
                                                    {userList.length === 0
                                                        ? 'No users to manage'
                                                        : 'No users match your search'}
                                                </p>
                                                <span>
                                                    {userList.length === 0
                                                        ? 'Users will appear here once registered'
                                                        : 'Try a different search term'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td>
                                                <MemberCell user={user} api={api} />
                                            </td>
                                            <td>
                                                <StatusBadge active={user.active} />
                                            </td>
                                            <td>
                                                <RoleBadge role={user.rights} />
                                            </td>
                                            <td>
                                                <div className="adminRightsCell">
                                                    <select
                                                        className="adminRightsSelect"
                                                        value={user.rights}
                                                        onChange={(el) =>
                                                            updateUserRights(user._id, el.target.value)
                                                        }
                                                    >
                                                        <option value="admin">Administrator</option>
                                                        <option value="user">Standard user</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
