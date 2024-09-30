// import React, { useState, useEffect } from "react";
// import { VscSend } from "react-icons/vsc";
// import io from "socket.io-client";
// import { v4 as uuidv4 } from "uuid";

// const socket = io("http://localhost:3001");

// const Chat = () => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [username, setUsername] = useState("");
//   const [user, setUser] = useState("");
//   const [initial, setInitial] = useState("");
//   const [userId, setUserId] = useState("");

//   const setUniqueUserId = () => {
//     const uniqueId = uuidv4();
//     setUserId(uniqueId);
//   };

//   useEffect(() => {
//     setUniqueUserId();
//   }, []);

//   useEffect(() => {
//     const handleNewMessage = (message) => {
//       setMessages((prevMessages) => [...prevMessages, message]);
//     };

//     socket.on("chat message", handleNewMessage);

//     return () => {
//       socket.off("chat message", handleNewMessage);
//     };
//   }, []);

//   const sendMessage = () => {
//     if (newMessage) {
//       const currentTime = new Date();
//       const hours = currentTime.getHours();
//       const minutes = currentTime.getMinutes();
//       const time = `${hours < 10 ? "0" : ""}${hours}:${
//         minutes < 10 ? "0" : ""
//       }${minutes}`;

//       socket.emit("chat message", {
//         message: newMessage,
//         username: username,
//         userId: userId,
//         time: time,
//       });

//       setNewMessage("");
//     }
//   };

//   const getUser = () => {
//     setUsername(user.charAt(0).toUpperCase());
//     setInitial(user.charAt(0).toUpperCase());
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && username) {
//       sendMessage();
//     }
//   };

//   const handleKeyPressName = (e) => {
//     if (e.key === "Enter" && user) {
//       getUser();
//     }
//   };

//   return (
//     <div className='flex h-screen antialiased overflow-y-auto text-gray-800 mt-3'>
//       <div className='h-full w-full overflow-x-hidden'>
//         <div className='flex flex-col flex-auto h-full p-3'>
//           <div className='flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4'>
//             <div className='flex flex-col h-full overflow-auto'>
//               <div className='flex flex-col h-full'>
//                 {messages.map((message, index) => (
//                   <div
//                     key={index}
//                     className={`flex items-center ${
//                       message.userId === userId ? "" : "justify-end"
//                     }`}>
//                     <div className='flex flex-row items-center p-2.5'>
//                       {message.userId === userId && (
//                         <div className='flex items-center text-white font-semibold justify-center size-10 mr-3 rounded-full bg-blue-400 flex-shrink-0'>
//                           {message.username === username
//                             ? initial
//                             : message.username.charAt(0).toUpperCase()}
//                         </div>
//                       )}

//                       {message.userId !== userId && (
//                         <div className='text-xs text-gray-500 mr-2 font-semibold'>
//                           {message.time}
//                         </div>
//                       )}

//                       <div
//                         className={`text-sm shadow rounded-xl ${
//                           message.userId === userId ? "bg-white" : "bg-blue-100"
//                         } py-2 px-3`}>
//                         {message.message}
//                       </div>

//                       {message.userId === userId && (
//                         <div className='text-xs text-gray-500 ml-2 font-semibold'>
//                           {message.time}
//                         </div>
//                       )}

//                       {message.userId !== userId && (
//                         <div className='flex items-center text-white font-semibold justify-center size-10 ml-3 rounded-full bg-blue-500'>
//                           {message.username === username
//                             ? initial
//                             : message.username.charAt(0).toUpperCase()}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <div className='flex flex-row items-center h-16 rounded-xl bg-white w-full px-2.5'>
//               <div className='flex-grow'>
//                 <div className='relative w-full'>
//                   {!username ? (
//                     <input
//                       type='text'
//                       value={user}
//                       placeholder='Въведи име'
//                       onKeyDown={handleKeyPressName}
//                       onChange={(e) => setUser(e.target.value)}
//                       className='flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 px-3.5 h-10'
//                     />
//                   ) : (
//                     <input
//                       type='text'
//                       value={newMessage}
//                       placeholder='Въведи съобщение'
//                       onKeyDown={handleKeyPress}
//                       onChange={(e) => setNewMessage(e.target.value)}
//                       className='flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 px-3.5 h-10'
//                     />
//                   )}
//                 </div>
//               </div>
//               <div className='ml-3'>
//                 <button
//                   onClick={username ? sendMessage : getUser}
//                   className='flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded-xl text-white p-2.5'>
//                   <VscSend className='size-4' />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chat;
