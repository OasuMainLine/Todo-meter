import React, { DragEvent, HTMLProps, MouseEvent, useEffect, useState } from 'react'


export type Todo = {
    key: React.Key,
    id: String,
    title: String,
    testid: String,
    completed: boolean,
    onCompleteToggle?: (checked: boolean, id: String ) => void,
    onDelete?: (id: String) => void,
    onDragging?: (id: String) => void,
    onDrop?: (id: String) => void,
    onDragginEnd?: () => void,
} 

export default function TodoItem({id,title, testid, completed, onCompleteToggle, onDelete, onDragging, onDragginEnd, onDrop}: Todo) {

    const [isCompleted, setComplete] = useState(completed)

    function handleChange(){
        if (!onCompleteToggle) return;
        onCompleteToggle(!isCompleted, id);
        setComplete(!isCompleted)
    }
    function handleClick(){
      if(!onDelete) return;
      onDelete(id);
    }
    function onDragStart(ev: DragEvent){
      if(!onDragging) return;
        onDragging(id);
        
    }
    function onDragEnd(ev: DragEvent){
      if(!onDragginEnd) return;
      ev.currentTarget.setAttribute("draggable", "false");
      onDragginEnd();
    }
    function onDragOver(ev: DragEvent){
      ev.preventDefault();
    }
    
    function onDropping(ev: DragEvent){
        if(!onDrop) return;
        onDrop(id);
    }

    function onMouseOverGrip(ev: MouseEvent){
        ev.currentTarget.parentElement?.setAttribute("draggable", "true");
    }
   
  return (
    <li data-testid={testid} className="todo-element font-mono w-full p-4 bg-blue-300 rounded-md items-center flex" draggable={false} onDragEnd={onDragEnd} onDragOver={onDragOver} onDrop={onDropping} onDragStart={onDragStart}>
        <button name="dragButton" className="w-8 me-4 gripper" onMouseDown={onMouseOverGrip} >
        <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
        </button>
        <input draggable={false} data-id={id} onChange={handleChange} checked={isCompleted} type="checkbox" name="complete" className='w-4 h-4 me-2'/>
        <h3 draggable={false} className={`text-xl ${completed ? "line-through" : ""}`}>{title}</h3>
        <button name="deleteButton" draggable={false} onClick={handleClick} data-id={id} className='bg-red-300 p-2 rounded-md hover:bg-red-600 hover:text-white transition-all ease-in ms-auto'>Delete</button>
    </li>
  )
}
