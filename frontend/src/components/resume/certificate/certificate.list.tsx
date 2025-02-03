import { useFault } from "@components/fault";
import { api } from "@utils/api";
import { AxiosError } from "axios";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { CertificateForm, CertificateView } from "./certificate.view";

interface CertificateListProps {}

export function CertificateList(props: CertificateListProps) {
    const fault = useFault();

    const [certificates, { mutate, refetch }] = createResource(async () => {
        try {
            const response = await api.get("/resume/certificate/all");
            const result: CertificatesResponse = 
                response.data as CertificatesResponse;
            return result.certificates;
        } catch (error) {
            fault.minor({
                message:
                    ((error as AxiosError).response?.data as any).error ??
                    (error as AxiosError).message,
            });
            return [];
        }
    });

    const [editing_certificates, updateEditingCertificates] = createStore(
        [] as number[]
    );

    const [creating_new, createNew] = createSignal(false);

    return (
        <section class="w-full flex flex-col gap-4 justify-items-center">
            <span class="flex flex-row gap-4">
                <h2 class="text-2xl font-semibold text-gray-900">
                    Certifications & Licenses
                </h2>
                <button
                    onClick={() => createNew(true)}
                    class="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                >
                    Add Certificate
                </button>
            </span>
            <Show when={creating_new()}>
                <CertificateForm
                    onCancel={() => {
                        createNew(false);
                    }}
                    onSubmit={() => {
                        refetch();
                        createNew(false);
                    }}
                    is_new
                />
            </Show>
            <Suspense
                fallback={<p class="text-gray-500">Loading certificates...</p>}
            >
                <For each={certificates()}>
                    {(certificate) => {
                        return (
                            <Show
                                when={editing_certificates.includes(
                                    certificate.certificate_id
                                )}
                                fallback={
                                    <CertificateView
                                        certificate={certificate}
                                        edit={(certificate_id) => {
                                            updateEditingCertificates([
                                                ...editing_certificates,
                                                certificate_id,
                                            ]);
                                        }}
                                        delete={async (certificate_id) => {
                                            try {
                                                await api.post(
                                                    "/resume/certificate/delete",
                                                    { certificate_id }
                                                );
                                                refetch();
                                            } catch (error) {
                                                fault.minor({
                                                    message:
                                                        ((error as AxiosError)
                                                            .response?.data as any)
                                                            .error ??
                                                        (error as AxiosError)
                                                            .message,
                                                });
                                            }
                                        }}
                                    />
                                }
                            >
                                <CertificateForm
                                    certificate={certificate}
                                    onCancel={() => {
                                        updateEditingCertificates(
                                            editing_certificates.filter(
                                                (id) =>
                                                    id !==
                                                    certificate.certificate_id
                                            )
                                        );
                                    }}
                                    onSubmit={() => {
                                        refetch();
                                        updateEditingCertificates(
                                            editing_certificates.filter(
                                                (id) =>
                                                    id !==
                                                    certificate.certificate_id
                                            )
                                        );
                                    }}
                                />
                            </Show>
                        );
                    }}
                </For>
            </Suspense>
        </section>
    );
}