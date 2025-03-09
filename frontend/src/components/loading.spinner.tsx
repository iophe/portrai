
interface LoadingSpinnerProps {}

function LoadingSpinner(props: LoadingSpinnerProps) {
	return (<div class="w-6 h-6 border-2 border-t-transparent border-forest-600 rounded-full animate-spin" 
	aria-label="Loading">
</div>);
}

export default LoadingSpinner;
