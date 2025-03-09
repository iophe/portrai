import { useNavigate } from "@solidjs/router";
import {
	Component,
	For,
	JSXElement,
	createContext,
	createSignal,
	onMount,
	useContext,
} from "solid-js";
import CloseIcon from "@assets/icons/close.svg?component-solid";
import { Portal } from "solid-js/web";

type fault_type =
	| "critical_fault"
	| "major_fault"
	| "minor_fault"
	| "info_fault";
const INFO = Symbol("INFO");
const MINOR = Symbol("MINOR");
const MAJOR = Symbol("MAJOR");
const CRITICAL = Symbol("CRITICAL");
export type Te_fault_severity =
	| typeof INFO
	| typeof MINOR
	| typeof MAJOR
	| typeof CRITICAL;

export type ErrorMsg = {
	message?: string;
	element?: (close: () => void) => JSXElement;
	timeout?: number;
	on_close?: () => void;
};
class FaultEvent extends Event {
	detail: ErrorMsg;
	severity: Te_fault_severity;
	timeout?: number;

	private constructor(
		type: fault_type,
		severity: Te_fault_severity,
		detail: ErrorMsg
	) {
		super(type);
		this.detail = detail;
		this.severity = severity;
		this.timeout = detail.timeout;
	}
	static INFO(detail?: ErrorMsg) {
		return new FaultEvent("info_fault", INFO, detail ?? { message: "" });
	}
	static MINOR(detail?: ErrorMsg) {
		return new FaultEvent("minor_fault", MINOR, detail ?? { message: "" });
	}
	static MAJOR(detail?: ErrorMsg) {
		return new FaultEvent("major_fault", MAJOR, detail ?? { message: "" });
	}
	static CRITICAL(detail?: ErrorMsg) {
		return new FaultEvent(
			"critical_fault",
			CRITICAL,
			detail ?? { message: "" }
		);
	}
}

export class FaultTarget extends EventTarget {
	constructor() {
		super();
	}

	info(error: ErrorMsg) {
		this.dispatchEvent(FaultEvent.INFO(error));
	}

	minor(error: ErrorMsg) {
		this.dispatchEvent(FaultEvent.MINOR(error));
	}

	major(error: ErrorMsg) {
		this.dispatchEvent(FaultEvent.MAJOR(error));
	}

	critical(error: ErrorMsg) {
		this.dispatchEvent(FaultEvent.CRITICAL(error));
	}
}

export const FaultContext = createContext<FaultTarget>();
export function useFault<T = FaultTarget>() {
	return useContext(FaultContext) as T;
}
interface FaultProviderProps {
	children?: JSXElement;
}
export function FaultProvider(props: FaultProviderProps) {
	const fault = new FaultTarget();

	return (
		<FaultContext.Provider value={fault}>
			{props.children}
			<FaultHandler />
		</FaultContext.Provider>
	);
}

type FaultProps = {
	children: JSXElement;
	severity: Te_fault_severity;
	timeout?: number;
	remove: () => void;
};

export type FaultHandlerProps = {};

function FaultPopup(props: FaultProps) {
	let ref!: HTMLDivElement;
	onMount(() => {
		if (
			props.severity === INFO ||
			props.severity === MINOR ||
			props.severity === MAJOR
		) {
			setTimeout(() => {
				ref.classList.replace("show", "hide");
				ref.onanimationend = () => {
					props.remove();
				};
			}, props.timeout ?? 2000);
		}
	});
	return (
		<div
			ref={ref}
			class="flex gap-4 justify-between h-fit rounded text-snow-100 font-normal show text-wrap transition-opacity duration-500"
			classList={{
				"bg-snow-100": props.severity === INFO,
				"bg-red-500":
					props.severity === MINOR ||
					props.severity === MAJOR ||
					props.severity === CRITICAL,
			}}
		>
			<span class="p-4">{props.children}</span>
			<button
				class="p-4 cursor-pointer text-gray-50 font-semibold"
				onclick={() => {
					ref.classList.replace("show", "hide");

					ref.onanimationend = () => {
						props.remove();
					};
				}}
			>
				<CloseIcon class="fill-snow-100" />
			</button>
		</div>
	);
}

export function FaultHandler(props: FaultHandlerProps) {
	const [get_faults, set_faults] =
		createSignal<{ event: FaultEvent; id: number }[]>();
	const fault = useFault();
	let auto_increment = 0;

	function add_fault(event: FaultEvent) {
		const faults = get_faults() ?? [];
		const added_fault = { event, id: auto_increment++ };
		set_faults([...faults, added_fault]);
	}

	fault.addEventListener("info_fault", (event) =>
		add_fault(event as FaultEvent)
	);

	fault.addEventListener("minor_fault", (event) =>
		add_fault(event as FaultEvent)
	);
	fault.addEventListener("major_fault", (event) =>
		add_fault(event as FaultEvent)
	);

	fault.addEventListener("critical_fault", (event) => {
		set_faults([
			...(get_faults() ?? []),
			{ event: event as FaultEvent, id: auto_increment++ },
		]);
	});

	return (
		<Portal>
			<div class="z-50 absolute top-0 my-8 left-1/2 -translate-x-1/2 h-fit w-[min(600px,90%)] flex flex-col gap-4">
				<For each={get_faults()}>
					{({ event: fault, id: own_id }) => {
						if (fault.detail.element) {
							return (
								<FaultPopup
									severity={fault.severity}
									timeout={fault.timeout}
									remove={() => {
										fault.detail.on_close?.();

										const faults = get_faults() ?? [];
										set_faults(
											faults.filter(
												({ id }) => id !== own_id
											)
										);
									}}
								>
									{fault.detail.element(() => {
										fault.detail.on_close?.();

										const faults = get_faults() ?? [];
										set_faults(
											faults.filter(
												({ id }) => id !== own_id
											)
										);
									})}
								</FaultPopup>
							);
						} else {
							return (
								<FaultPopup
									severity={fault.severity}
									timeout={fault.timeout}
									remove={() => {
										fault.detail.on_close?.();

										const faults = get_faults() ?? [];
										set_faults(
											faults.filter(
												({ id }) => id !== own_id
											)
										);
									}}
								>
									{fault.detail.message}
								</FaultPopup>
							);
						}
					}}
				</For>
			</div>
		</Portal>
	);
}
