import React, {
	ChangeEvent,
	createRef,
	DragEvent,
	MouseEvent,
	MouseEventHandler,
	useEffect,
	useRef,
	useState,
} from "react";
import TodoItem, { Todo } from "./components/TodoItem";

enum Filter {
	ALL = "All",
	COMPLETED = "Completed",
	PENDING = "Pending"
}

const activeFilterClass = "bg-white text-black p-1 rounded-sm";
function App() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [currentFilter, setFilter] = useState<Filter>(Filter.ALL);
	const [title, setTitle] = useState("");
	const [invalid, setInvalid] = useState(false);
	const buttonRef = createRef<HTMLButtonElement>();
 
	let dragIdx = -1;
	function onBuzzingEnd() {
		const timeout = setTimeout(() => setInvalid(false), 300);
	}

	function onDragging(id: String) {
		dragIdx = todos.findIndex((todo) => todo.id === id);
	}
	function onDragginEnd() {
		dragIdx = -1;
	}
	function onDrop(id: String) {
		if (dragIdx < 0) return;
		let dropIdx = todos.findIndex((todo) => todo.id === id);

		setTodos((todos) => {
			let dragged = todos[dragIdx];
			let dropped = todos[dropIdx];
			return todos.map((todo, idx) => {
				if (idx === dragIdx) {
					return dropped;
				}
				if (idx === dropIdx) {
					return dragged;
				}
				return todo;
			});
		});
	}
	function onFilter(filter: Filter) {
		if (filter !== currentFilter) {
			setFilter(filter);
		}
	}
	function onDelete(id: String) {
		setTodos((todos) => {
			const filteredTodos = todos.filter((todo) => todo.key != id);
			return filteredTodos;
		});
	}

	function onCompleteToggle(checked: boolean, id: String) {
		setTodos((todos) => {
			return todos.map((todo) => {
				if (todo.id == id) {
					return {
						...todo,
						completed: checked,
					};
				}
				return todo;
			});
		});
	}

	function onClear(event: MouseEvent) {
		if (todos.length > 0) {
			setTodos([]);
		}
	}
	function onAddTodo() {
		if (title != undefined && title !== "") {
			if (currentFilter != Filter.ALL) {
				onFilter(Filter.ALL);
			}
			const testid = "todo-test";
			const key = crypto.randomUUID();
			const todo: Todo = {
				key,
				id: key,
				title,
				testid,
				completed: false,
			};
			setTodos([...todos, todo]);
			if (invalid) setInvalid(false);
			setTitle("");
			return;
		}

		setInvalid(true);
	}

	async function addRandomTodos() {
		const response = await fetch("https://dummyjson.com/todos");
		const json = await response.json();

		let allTodos: any[] = json["todos"].map((item: any) => ({
			...item,
			sort: Math.random() + 1,
		}));

		allTodos = allTodos.sort((a, b) => a.sort - b.sort);

		setTodos(
			allTodos.slice(0, 3).map((item) => {
				const testid = "todo-test";
				const key = crypto.randomUUID();

				const todo: Todo = {
					key,
					id: key,
					title: item.todo.slice(0, 35),
					testid,
					completed: item.completed,
				};
				return todo;
			})
		);
	}

	useEffect(() => {
		window.addEventListener("keypress", (ev) => {
			const key = ev.key;
			if (key == "Enter") {
				buttonRef.current?.click();
			}
		});
	});
	let filteredTodos = todos;
	if(currentFilter != Filter.ALL){
		switch(currentFilter){
			case Filter.COMPLETED:
				filteredTodos = todos.filter((todo) => todo.completed);
				break;
			case Filter.PENDING:
				filteredTodos = todos.filter(todo => !todo.completed);
				break;
		}
	}
	return (
		<div className="w-full min-h-screen bg-slate-600 flex items-center flex-col gap-10">
			<h1 className="font-mono font-bold text-4xl mt-28 text-white animated-text">
				{"TODO'Meter".split("").map((char, index) => <span key={char + index}>{char}</span>)}
			</h1>

			<div className="flex flex-col">
				<div className="flex">
					<input
						maxLength={35}
						onChange={(ev) => setTitle(ev.currentTarget.value)}
						onAnimationEnd={onBuzzingEnd}
						placeholder="WRITE SOMETHING"
						className={
							"reset border-black border-2 w-60 bg-slate-50 font-mono p-2 " +
							(invalid ? "buzz" : "")
						}
						type="text"
						value={title}
					/>
					<button
						ref={buttonRef}
						onClick={onAddTodo}
						className="p-2 bg-blue-800 font-mono text-white"
					>
						Add
					</button>
				</div>
				<button
					onClick={addRandomTodos}
					className="bg-pink-700 hover:bg-pink-600 transition-colors py-2 w-full mt-2 rounded-lg font-mono text-white"
				>
					Random TODOS!
				</button>
			</div>

			<ul className="bg-blue-200 rounded-xl w-2/4 min-w-fit min-h-fit h-fit flex justify-center flex-col gap-2 p-4">
				{filteredTodos.length == 0 ? (
					<h2 className="font-mono my-auto">There's no todos...</h2>
				) : (
					filteredTodos.map((todo) => (
						<TodoItem
						 
							onCompleteToggle={onCompleteToggle}
							onDelete={onDelete}
							onDragginEnd={onDragginEnd}
							onDragging={onDragging}
							onDrop={onDrop}
							{...todo}
						/>
					))
				)}
				<div className="w-full flex items-center">
					<button onClick={onClear} className="clear-btn">
						Clear All
					</button>

					<div className="font-mono flex text-gray-600 gap-5 ms-auto">
						<button
							className={currentFilter == Filter.ALL ? activeFilterClass : ""}
							onClick={() => onFilter(Filter.ALL)}
						>
							{Filter.ALL}
						</button>
						<button
							className={
								currentFilter == Filter.COMPLETED ? activeFilterClass : ""
							}
							onClick={() => onFilter(Filter.COMPLETED)}
						>
							{Filter.COMPLETED}
						</button>

						<button className={currentFilter == Filter.PENDING ? activeFilterClass : ""} onClick={() => onFilter(Filter.PENDING)}>
							{Filter.PENDING}
						</button>
					</div>
				</div>
			</ul>
		</div>
	);
}

export default App;
