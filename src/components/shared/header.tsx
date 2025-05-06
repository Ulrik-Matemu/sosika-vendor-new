import React from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
  className?: string
}

const Header: React.FC<HeaderProps> = ({ title,  className }) => {
  return (
    <header className={`text-center py-2  rounded-b ${className || ''}`}>
      <h1 className="text-3xl font-bold font-extrabold text-[#00bfff]">{title}</h1>
    </header>
  )
}

export default Header
