import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { AddNote, NoteList } from "../notes.util";

interface CertificateViewProps {
	certificate: Certificate;
	edit: (certificate_id: number) => void;
	delete: (certificate_id: number) => void;
}

export function CertificateView(props: CertificateViewProps) {
	return (
		<article class="p-4 border border-gray-200 rounded-lg flex flex-col gap-2">
			<header class="flex flex-col justify-between items-start mb-2">
				<h3 class="text-lg font-medium text-gray-900">
					{props.certificate.certificate_name}
				</h3>
				<Show when={props.certificate.optional_issuer}>
					<h4 class="text-gray-700">
						{props.certificate.optional_issuer}
					</h4>
				</Show>
			</header>
			<Show when={props.certificate.optional_location}>
				<p class="text-gray-600 text-sm">
					{props.certificate.optional_location}
				</p>
			</Show>
			<Show when={props.certificate.optional_granted_date}>
				<p class="text-gray-600 text-sm">
					Granted: {props.certificate.optional_granted_date}
				</p>
			</Show>
			<p class="text-gray-700">{props.certificate.description}</p>
			<footer class="mt-2">
				<ul class="flex gap-2 flex-wrap">
					<For each={props.certificate.tags}>
						{(tag) => (
							<li class="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
								{tag}
							</li>
						)}
					</For>
				</ul>
			</footer>
			<div class="self-end flex flex-row gap-4">
				<button
					title="Edit this certificate"
					class="self-end w-fit px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
					onclick={() => {
						props.edit(props.certificate.certificate_id);
					}}
				>
					Edit
				</button>
				<button
					title="Delete this certificate"
					class="self-end w-fit px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
					onclick={() => {
						props.delete(props.certificate.certificate_id);
					}}
				>
					Delete
				</button>
			</div>
			<NoteList notes={props.certificate.notes} />
			<AddNote
				id={props.certificate.certificate_id}
				section_type="certificate"
			/>
		</article>
	);
}

interface CertificateFormProps {
	certificate?: Certificate;
	is_new?: boolean;
	onSubmit: (certificate_id: number) => void;
	onCancel: () => void;
}

export function CertificateForm(props: CertificateFormProps) {
	const fault = useFault();
	const [form_data, setFormData] = createStore({
		certificate_name: props.certificate?.certificate_name || "",
		optional_issuer: props.certificate?.optional_issuer || "",
		optional_location: props.certificate?.optional_location || "",
		optional_granted_date: props.certificate?.optional_granted_date || "",
		description: props.certificate?.description || "",
		priority: props.certificate?.priority || 0,
		tags: props.certificate?.tags || [],
		notes: props.certificate?.notes || [],
	});
	const [new_tag, setNewTag] = createSignal("");

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!props.is_new) {
			if (!props.certificate) return;
			try {
				await api.post("/resume/certificate/update", {
					...form_data,
					certificate_id: props.certificate.certificate_id,
				});
				props.onSubmit(props.certificate.certificate_id);
			} catch (error) {
				fault.minor({
					message:
						((error as AxiosError).response?.data as any).error ??
						(error as AxiosError).message,
				});
			}
		} else {
			try {
				const res = await api.post(
					"/resume/certificate/create",
					form_data
				);
				const certificate_id = res.data.certificate_id;
				props.onSubmit(certificate_id);
			} catch (error) {
				fault.minor({
					message:
						((error as AxiosError).response?.data as any).error ??
						(error as AxiosError).message,
				});
			}
		}
	}

	function addTag(e: KeyboardEvent) {
		if (e.key === "Enter" && new_tag()) {
			e.preventDefault();
			setFormData("tags", [...form_data.tags, new_tag()]);
			setNewTag("");
		}
	}

	return (
		<form onSubmit={handleSubmit} class="">
			<div class="space-y-2">
				<label class="block text-sm font-medium text-gray-700">
					Certificate Name
				</label>
				<input
					type="text"
					value={form_data.certificate_name}
					onInput={(e) =>
						setFormData("certificate_name", e.currentTarget.value)
					}
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
					required
				/>
			</div>

			<div class="space-y-2">
				<label class="block text-sm font-medium text-gray-700">
					Issuer
				</label>
				<input
					type="text"
					value={form_data.optional_issuer}
					onInput={(e) =>
						setFormData("optional_issuer", e.currentTarget.value)
					}
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
				/>
			</div>

			<div class="space-y-2">
				<label class="block text-sm font-medium text-gray-700">
					Location
				</label>
				<input
					type="text"
					value={form_data.optional_location}
					onInput={(e) =>
						setFormData("optional_location", e.currentTarget.value)
					}
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
				/>
			</div>

			<div class="space-y-2">
				<label class="block text-sm font-medium text-gray-700">
					Date Granted
				</label>
				<input
					type="date"
					value={form_data.optional_granted_date}
					onInput={(e) =>
						setFormData(
							"optional_granted_date",
							e.currentTarget.value
						)
					}
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
				/>
			</div>

			<div class="space-y-2">
				<label class="block text-sm font-medium text-gray-700">
					Description
				</label>
				<textarea
					value={form_data.description}
					onInput={(e) =>
						setFormData("description", e.currentTarget.value)
					}
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
					rows="4"
				/>
			</div>

			<div class="space-y-2">
				<label class="block text-sm font-medium text-gray-700">
					Tags
				</label>
				<input
					type="text"
					value={new_tag()}
					onInput={(e) => setNewTag(e.currentTarget.value)}
					onKeyPress={addTag}
					placeholder="Press Enter to add tag"
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500"
				/>
				<ul class="flex gap-2 flex-wrap">
					<For each={form_data.tags}>
						{(tag, index) => (
							<li class="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded flex items-center gap-1">
								{tag}
								<button
									type="button"
									onClick={() =>
										setFormData("tags", (t) =>
											t.filter((_, i) => i !== index())
										)
									}
									class="text-gray-500 hover:text-gray-700"
								>
									×
								</button>
							</li>
						)}
					</For>
				</ul>
			</div>

			<div class="flex justify-end gap-4">
				<button
					type="button"
					onClick={props.onCancel}
					class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
				>
					Cancel
				</button>
				<button
					type="submit"
					class="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
				>
					Save Certificate
				</button>
			</div>
		</form>
	);
}
