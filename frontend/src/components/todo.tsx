import { ParentProps } from "solid-js";
type TodoProps = ParentProps & {
	dbg?: boolean;
};

function Todo(props: TodoProps) {
	return (
		<div
			class="w-full h-full flex flex-col justify-center items-center"
			classList={{ "dbg-1": props.dbg }}
		>
			TODO : {props.children}
		</div>
	);
}

export default Todo;
