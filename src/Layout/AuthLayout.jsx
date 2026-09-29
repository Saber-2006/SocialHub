import React from 'react'
import { Outlet } from 'react-router';
import { FaMessage } from "react-icons/fa6";
import { MdInsertPhoto } from "react-icons/md";
import { FaBell } from "react-icons/fa";
import { MdGroups } from "react-icons/md";
import { IoStar } from "react-icons/io5";

export default function AuthLayout() {
  return (
    <>
    <div className='flex flex-col lg:flex-row gap-4 content-between min-h-screen w-full'>
      <div
  className="relative w-full lg:w-1/2 flex p-4 bg-cover bg-center"
  style={{ backgroundImage: "url('/img/signup-bg-DGRfriy9 (1).png')" }}
>
  {/* Blue overlay */}
  <div className="absolute inset-0 bg-blue-500/80"></div>

  <div className="content relative z-10 text-white p-2 flex flex-col gap-4 w-full">
    <div className='flex flex-row gap-2 align-middle items-center'>
      <span className="text-3xl font-bold w-[50px] h-[50px] flex items-center justify-center rounded-lg
bg-white/10 backdrop-blur-md
border border-white/20
shadow-lg text-white">
  S
</span>
      <p className='text-3xl font-bold'>SocialHub</p>
    </div>
  
  <div className='mt-5 text-center w-full md:w-[80%] lg:w-[70%] text-start '>
    <h1 className='text-[40px] font-bold'>Welcome to Your 
      <span className='text-cyan-200'>  Social Space </span>
    </h1>
    <p>Join millions of users sharing moments, ideas, and building meaningful connections every day</p>
  </div>
  
  <div className='grid gap-3 grid-cols-1 md:grid-cols-2 mt-2'>
    <div className='bg-white/10 backdrop-blur-md flex gap-2 border boreder-white/20 p-2 shadow-lg rounded-lg hover:bg-white/20 hover:scale-105 transition duration-300'>
    <div className='bg-green-600/20 backdrop-blur-md text-green-500 w-[45px] h-[45px] rounded-lg flex items-center justify-center text-lg'>
    <FaMessage />
    </div>
    <div className='flex flex-col'>
      <p className='font-bold'>Real-time Chat</p>
      <p className='text-sm'>Instant messaging</p>
    </div>
    </div>

    <div className='bg-white/10 backdrop-blur-md flex gap-2 border boreder-white/20 p-2 shadow-lg rounded-lg hover:bg-white/20 hover:scale-105 transition duration-300'>
    <div className='bg-blue-600/50 backdrop-blur-md text-white w-[45px] h-[45px] rounded-lg flex items-center justify-center text-lg'>
    <MdInsertPhoto />
    </div>
    <div className='flex flex-col'>
      <p className='font-bold'>Share Media</p>
      <p className='text-sm'>Photos & videos</p>
    </div>
    </div>

    <div className='bg-white/10 backdrop-blur-md flex gap-2 border boreder-white/20 p-2 shadow-lg rounded-lg hover:bg-white/20 hover:scale-105 transition duration-300'>
    <div className='bg-purple-600/20 backdrop-blur-md text-purple-500 w-[45px] h-[45px] rounded-lg flex items-center justify-center text-lg'>
    <FaBell />

    </div>
    <div className='flex flex-col'>
      <p className='font-bold'>Smart Alerts</p>
      <p className='text-sm'>Stay updated</p>
    </div>
    </div>


        <div className='bg-white/10 backdrop-blur-md flex gap-2 border boreder-white/20 p-2 shadow-lg rounded-lg hover:bg-white/20 hover:scale-105 transition duration-300'>
    <div className='bg-green-600/20 backdrop-blur-md text-green-500 w-[45px] h-[45px] rounded-lg flex items-center justify-center text-lg'>
    <MdGroups />
    </div>
    <div className='flex flex-col'>
      <p className='font-bold'>Communities</p>
      <p className='text-sm'>Find your tribe</p>
    </div>
    </div>


  </div>

  <div className='bg-white/5 backdrop-blur-md rounded-lg w-full  p-4 gap-4 border boreder-white/20 p-2 shadow-lg rounded-lg mt-5 hover:bg-white/20 hover:scale-105 transition duration-300'>
  <div className='flex flex-col gap-2 h-full '>
    <div className='flex flex-row gap-2 align-middle items-center'>
      <div className='p-1 rounded-full border border-white/20'>
      <img src="public/img/alex-avatar-BLDJqiDr.pngpublic/img/alex-avatar-BLDJqiDr.png" alt="User Avatar" className='w-[40px] h-[40px] rounded-full object-cover' />
    </div>
    <div>
    <p className='text-white font-bold'>John Doe</p> 
    <p className='text-gray-300'>john.doe@gmail.com</p>
    </div>
    </div>
    <div className='flex flex-row gap-2'>
      <p className='text-gray-300'>1/7/2026</p>
      <div className='flex flex-row gap-1 items-center'>
        <IoStar className='text-yellow-400' />
        <IoStar className='text-yellow-400' />
        <IoStar className='text-yellow-400' />
        <IoStar className='text-yellow-400' />
        <IoStar className='text-yellow-400' />
      </div>
    </div>
    <p className='text-white font-bold text-sm'>Great social app! The interface is clean and easy to use, and it's simple to connect with friends and share updates. The app runs smoothly, notifications work well, and I like how organized everything feels. It's a great platform for staying connected and discovering new content. Highly recommended!</p>
  </div>
  </div>

  <div className='flex flex-row gap-3 items-center justify-center'>
    <ul className='flex flex-row gap-4 text-sm mt-5 lisyt-none'>
    <li className='text-gray-300 hover:text-white cursor-pointer'>About Us </li>
    <li className='text-gray-300 hover:text-white cursor-pointer'>Privacy Policy</li>
    <li className='text-gray-300 hover:text-white cursor-pointer'>Terms of Service</li>
    <li className='text-gray-300 hover:text-white cursor-pointer'>Help Center</li>
    </ul>
  </div>
  </div>
</div>
    <div className="border-2 border-gray-300 rounded-lg shadow-lg p-4
      h-auto my-4 lg:my-auto mx-4 flex w-full lg:w-1/2 items-center justify-center">
    <Outlet>
      
    </Outlet>
</div>
    </div>
    </>
  )
}