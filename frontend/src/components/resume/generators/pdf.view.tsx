import { Show, createMemo, onCleanup } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import DocumentIcon from "@assets/icons/document.svg?component-solid";
import DownloadIcon from "@assets/icons/download.svg?component-solid";
import { En, Fr, Lang } from "@components/language";

interface PDFViewProps {
	pdf_data: Blob;
	document_name: string;
	document_title?: string;
	document_id: string;
}

export function PDFView(props: PDFViewProps) {
	// Create an object URL from the blob for viewing and downloading
	const pdf_url = createMemo(() => {
		if (props.pdf_data) {
			return URL.createObjectURL(props.pdf_data);
		}
		return null;
	});

	// Clean up the URL when component is disposed
	onCleanup(() => {
		if (pdf_url()) {
			URL.revokeObjectURL(pdf_url()!);
		}
	});

	return (
		<Presence>
			<Motion.section
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				transition={{ duration: 0.4, easing: "ease-out" }}
				class="shadow rounded w-full p-4 bg-lapis-10 h-fit flex flex-col gap-4"
			>
				<header class="w-full overflow-clip self-center flex flex-row gap-4 items-center">
					<DocumentIcon class="fill-lapis-400 min-w-fit" />
					<Show
						when={props.document_title}
						fallback={<h3>{props.document_name}</h3>}
					>
						<h3 class="w-full overflow-hidden text-ellipsis whitespace-nowrap">
							{props.document_title}
						</h3>
					</Show>
				</header>

				<nav class="flex flex-row self-center gap-4">
					<Motion
						hover={{ scale: 1.05 }}
						press={{ scale: 0.95 }}
						transition={{ duration: 0.1 }}
					>
						<button
							class="bg-lapis-100 rounded text-snow-100 py-2 px-4 flex items-center gap-2"
							onClick={async () => {
								if (pdf_url()) {
									const a = document.createElement("a");
									a.href = pdf_url()!;
									a.download = props.document_name + ".pdf";
									a.click();
								}
							}}
						>
							<DownloadIcon class="fill-snow-100" />
							<span>
								<Lang>
									<En>Download PDF</En>
									<Fr>Télécharger le PDF</Fr>
								</Lang>
							</span>
						</button>
					</Motion>
				</nav>

				<Motion.figure
					initial={{ opacity: 0, scale: 0.98 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.4, delay: 0.2 }}
					class="max-w-[210mm] h-fit m-0"
				>
					<Show when={pdf_url()}>
						<iframe
							src={pdf_url() + "#view=FitH"}
							class="w-full h-[500px] border border-gray-300 rounded"
							title={props.document_name}
						/>
					</Show>
				</Motion.figure>
			</Motion.section>
		</Presence>
	);
}
