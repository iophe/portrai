interface LoadingSpinnerProps {
	white?: boolean;
}

function LoadingSpinner(props: LoadingSpinnerProps) {
	return (
		<div
			class="w-6 h-6 border-2 border-t-transparent  rounded-full animate-spin"
			classList={{
				"border-white": props.white,
				"border-forest-600": !props.white,
			}}
			aria-label="Loading"
		></div>
	);
}

export default LoadingSpinner;
