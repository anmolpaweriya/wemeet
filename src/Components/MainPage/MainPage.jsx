import React, { useState } from 'react'


// components
import NavBar from '../NavBar/NavBar'
import AttendanceSection from './AttendanceSection'
import Meetings from './Meetings'



export default function MainPage() {



    const [currentSection, setCurrentSection] = useState('attendance')











    return (<>
        <NavBar />
        <div
            className='mt-[50px] grid  justify-center  gap-2'
        >

            <div
                className='bg-gray-200 m-2 p-1 rounded-lg grid grid-cols-3 w-[400px] justify-self-center'
            >
                <button
                    onClick={() => setCurrentSection('attendance')}
                    className={'w-full rounded-md text-center ' + (currentSection == 'attendance' ? " bg-white  shadow-lg " : "")} >Attendance</button>
                <button
                    onClick={() => setCurrentSection('meetings')}
                    className={'w-full rounded-lg text-center ' + (currentSection == 'meetings' ? " bg-white  shadow-lg " : "")}>Meetings</button>
                <a
                    href='./apDraw/index.html'
                    target='_blank'
                    className={'w-full rounded-lg text-center ' + (currentSection == 'drawing' ? " bg-white  shadow-lg " : "")}>Draw</a>
            </div>


            <h1

                className='text-5xl justify-self-center font-bold justify-center mb-10  orangeGradient gradientText h-full'
            >{currentSection[0].toUpperCase() + currentSection.slice(1)} Page</h1>

            {
                currentSection == "attendance" ?
                    <AttendanceSection />
                    :
                    <></>
            }
            {
                currentSection == "meetings" ?
                    <Meetings />
                    :
                    <></>
            }


        </div>
    </>
    )
}
