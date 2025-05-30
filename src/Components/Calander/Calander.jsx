import React from 'react'

export default function Calander({
    date,
    setDate
}) {


    const weekArr = ['Sun', 'Mon', 'Tus', 'Wed', 'Thur', 'Fri', 'Sat',]
    const monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',]

    const calDate = new Date(date);
    const firstDate = new Date(calDate.getFullYear(), calDate.getMonth(), 1);
    const lastDate = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0);

    const dateArr = [...Array(lastDate.getDate()).keys()]



    return (
        <div className=' w-fit m-auto border-4 rounded-xl  '>
            <div
                className='p-2 flex justify-center gap-3'
            >


                <select value={calDate.getMonth()}
                    className='rounded p-2'
                    onChange={(el) => setDate((new Date(calDate.getFullYear(), el.target.value, 1)).getTime())}
                >
                    {monthArr.map((e, i) => {
                        return <option
                            key={i}
                            value={i}>{e}</option>
                    })}

                </select>

                <input
                    onChange={(el) => setDate((new Date(el.target.value, calDate.getMonth(), 1)).getTime())}
                    className='w-20 p-2'
                    type="number" value={calDate.getFullYear()} />
            </div>
            <div className='w-fit grid grid-cols-7 mx-auto border-t-4 p-1 gap-1 items-center justify-center text-center rounded'>


                {weekArr.map((e, i) => {
                    return <h1
                        key={i}
                        className={' p-2 font-bold ' + (((i == 0) || (i == weekArr.length - 1)) && ' text-red-500')}>
                        {e}
                    </h1>
                })}


                {[...Array(firstDate.getDay()).keys()].map(e => {

                    return <p></p>
                })}

                {dateArr.map(e => {

                    return <a

                        onClick={() => setDate((new Date(calDate.getFullYear(), calDate.getMonth(), e + 1)).getTime())}
                        key={e}
                        className={' rounded-full p-2 ' + (e + 1 == calDate.getDate() ? " bg-blue-400 text-white hover:bg-blue-400 " : " hover:bg-gray-200 ")}
                    >
                        {e + 1}

                    </a>
                })}


            </div>
        </div>
    )
}
