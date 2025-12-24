import React from 'react'
import background from "../assets/background1.mp4";

function Backgroundstyle() {
  return (
    <>
      <div className="relative w-full min-h-screen flex justify-center items-center overflow-hidden">

        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover"
        >
          <source src={background} type="video/mp4" />
        </video>

        <div className="relative z-10 text-white text-center">
          <h1 className="text-[60px] text-[yellow] text-400">
            Welcome to EduCloud
          </h1>
          <p className="text-[30px]">
            Smart Student Management System
          </p>
        </div>

      </div>
    </>
  )
}

export default Backgroundstyle;
