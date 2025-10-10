import React, { useState } from 'react';
import { Calendar, Rocket, Code, Zap } from 'lucide-react';

const TimelineNode = ({ year, title, description, icon: Icon, color, side }) => (
  <div className={`flex items-center mb-8 ${side === 'left' ? 'flex-row-reverse' : ''}`}>
    <div className={`w-5/12 ${side === 'left' ? 'text-right pr-8' : 'pl-8'}`}>
      <div className={`${color} rounded-lg shadow-2xl p-6 border-4 border-black hover:scale-105 transition-transform transform rotate-1 hover:rotate-0`}
           style={{
             boxShadow: '8px 8px 0px rgba(0,0,0,0.3)',
           }}>
        <div className="flex items-center gap-2 mb-2 justify-center">
          <Icon className="w-6 h-6 text-black animate-bounce" style={{ animationDuration: '2s' }} />
          <span className="text-3xl font-black text-black" style={{ 
            textShadow: '3px 3px 0px rgba(255,255,255,0.3)',
            fontFamily: 'Comic Sans MS, cursive'
          }}>{year}</span>
        </div>
        <h3 className="text-2xl font-black text-black mb-2" style={{ 
          textShadow: '2px 2px 0px rgba(255,255,255,0.4)',
          fontFamily: 'Comic Sans MS, cursive'
        }}>{title}</h3>
        <p className="text-black font-bold text-sm">{description}</p>
      </div>
    </div>
    <div className="w-2/12 flex justify-center relative">
      <div className="absolute w-16 h-16 bg-gradient-to-r from-green-400 via-purple-500 to-orange-500 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-pink-500 border-4 border-black shadow-xl z-10 relative"></div>
    </div>
    <div className="w-5/12"></div>
  </div>
);

const GakBlob = ({ delay }) => (
  <div 
    className="absolute rounded-full opacity-30 animate-pulse"
    style={{
      width: `${Math.random() * 150 + 50}px`,
      height: `${Math.random() * 150 + 50}px`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      background: `radial-gradient(circle, ${['#00ff00', '#ff6600', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 4)]} 0%, transparent 70%)`,
      animationDelay: `${delay}s`,
      animationDuration: '4s'
    }}
  />
);

const Timeline = () => {
  const [filter, setFilter] = useState('all');
  
  const events = [
    {
      year: '1956-57',
      title: 'FORTRAN',
      description: 'First manual published October 1956, compiler delivered April 1957. Developed by IBM for scientific computing. The first widely-used high-level programming language.',
      icon: Code,
      color: 'bg-gradient-to-br from-cyan-400 to-blue-500',
      category: 'language'
    },
    {
      year: '1958',
      title: 'LISP',
      description: 'Developed by John McCarthy at MIT. Created for artificial intelligence research. Still influential in AI and functional programming today.',
      icon: Code,
      color: 'bg-gradient-to-br from-purple-400 to-pink-500',
      category: 'language'
    },
    {
      year: '1959',
      title: 'COBOL',
      description: 'Created by Codasyl based on Grace Hopper\'s FLOW-MATIC. Designed for business data processing by the US Department of Defense.',
      icon: Code,
      color: 'bg-gradient-to-br from-green-400 to-emerald-500',
      category: 'language'
    },
    {
      year: '1960-63',
      title: 'IBM 7090/7094 Mainframes',
      description: 'NASA Mission Control used IBM mainframe computers - thousands of times more powerful than spacecraft computers. Could run FORTRAN for trajectory calculations and mission planning.',
      icon: Rocket,
      color: 'bg-gradient-to-br from-orange-400 to-red-500',
      category: 'space'
    },
    {
      year: '1961-69',
      title: 'Apollo Spacecraft Computer',
      description: 'Apollo Guidance Computer programmed in assembly language (not high-level languages). Used special "rope memory" and custom assembly code to navigate to the moon.',
      icon: Rocket,
      color: 'bg-gradient-to-br from-red-400 to-pink-500',
      category: 'space'
    },
    {
      year: '1965-72',
      title: 'Mission Control Houston',
      description: 'Ground-based IBM mainframes performed real-time monitoring, backup calculations, and mission simulations using FORTRAN and other high-level languages.',
      icon: Rocket,
      color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      category: 'space'
    }
  ];

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.category === filter);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden p-8">
      {/* Gak blobs background */}
      {[...Array(15)].map((_, i) => <GakBlob key={i} delay={i * 0.3} />)}
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-6xl animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            {['⚡', '🚀', '💻', '🌟', '✨'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-orange-500 to-purple-500 opacity-30 blur-3xl"></div>
          <h1 className="text-6xl font-black mb-4 relative" style={{
            fontFamily: 'Comic Sans MS, cursive',
            background: 'linear-gradient(45deg, #ff6600, #00ff00, #ff00ff, #00ffff)',
            backgroundSize: '400% 400%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradient 3s ease infinite',
            textShadow: '0 0 30px rgba(0,255,0,0.5)'
          }}>
            RADICAL PROGRAMMING TIMELINE!
          </h1>
          <p className="text-green-400 text-2xl mb-6 font-bold" style={{
            fontFamily: 'Comic Sans MS, cursive',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
          }}>
            🎮 The birth of code and the race to SPACE! 🚀
          </p>
          
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-lg font-black border-4 border-black transition-all transform hover:scale-110 ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' 
                  : 'bg-gradient-to-r from-green-400 to-cyan-400 text-black hover:from-yellow-400 hover:to-orange-400'
              }`}
              style={{ 
                fontFamily: 'Comic Sans MS, cursive',
                boxShadow: '5px 5px 0px rgba(0,0,0,0.3)'
              }}
            >
              ALL THE THINGS!
            </button>
            <button
              onClick={() => setFilter('language')}
              className={`px-6 py-3 rounded-lg font-black border-4 border-black transition-all transform hover:scale-110 ${
                filter === 'language' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'bg-gradient-to-r from-green-400 to-cyan-400 text-black hover:from-yellow-400 hover:to-orange-400'
              }`}
              style={{ 
                fontFamily: 'Comic Sans MS, cursive',
                boxShadow: '5px 5px 0px rgba(0,0,0,0.3)'
              }}
            >
              <Code className="w-5 h-5 inline mr-2" />
              CODE STUFF
            </button>
            <button
              onClick={() => setFilter('space')}
              className={`px-6 py-3 rounded-lg font-black border-4 border-black transition-all transform hover:scale-110 ${
                filter === 'space' 
                  ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white' 
                  : 'bg-gradient-to-r from-green-400 to-cyan-400 text-black hover:from-yellow-400 hover:to-orange-400'
              }`}
              style={{ 
                fontFamily: 'Comic Sans MS, cursive',
                boxShadow: '5px 5px 0px rgba(0,0,0,0.3)'
              }}
            >
              <Rocket className="w-5 h-5 inline mr-2" />
              SPACE JUNK
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-2 h-full bg-gradient-to-b from-green-400 via-orange-500 to-purple-500"></div>
          
          {filteredEvents.map((event, index) => (
            <TimelineNode
              key={index}
              {...event}
              side={index % 2 === 0 ? 'right' : 'left'}
            />
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-br from-green-500 to-cyan-500 border-4 border-black p-6 rounded-lg transform -rotate-1" style={{
          boxShadow: '10px 10px 0px rgba(0,0,0,0.4)'
        }}>
          <h3 className="font-black text-black mb-3 flex items-center gap-2 text-2xl" style={{
            fontFamily: 'Comic Sans MS, cursive',
            textShadow: '2px 2px 0px rgba(255,255,255,0.5)'
          }}>
            <Zap className="w-6 h-6 animate-pulse" />
            THE COMPUTER DIVIDE - IT'S TOTALLY EXTREME!
          </h3>
          <p className="text-black font-bold text-base mb-2">
            <strong>🛸 SPACECRAFT:</strong> The Apollo Guidance Computer had extremely limited resources (2K RAM, 36K ROM), so it needed the efficiency of assembly code rather than high-level languages. GNARLY!
          </p>
          <p className="text-black font-bold text-base">
            <strong>🎯 MISSION CONTROL:</strong> IBM 7090/7094 mainframes were thousands of times more powerful and could run FORTRAN for complex calculations, trajectory planning, and real-time monitoring. This ground-based computing power was essential for mission success. WICKED COOL!
          </p>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default Timeline;