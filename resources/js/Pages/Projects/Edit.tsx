import { Head, useForm } from '@inertiajs/react';
import { FileCheck2, FilePenLine } from 'lucide-react';
import type { FormEventHandler } from 'react';

import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface ProjectEditData {
    id: number;
    title: string;
    purpose: string | null;
    estimatedAmount: number | null;
}

interface Props {
    project: ProjectEditData;
}

interface EditProjectForm {
    title: string;
    purpose: string;
    estimated_amount: string;
}

export default function ProjectsEdit({ project }: Props) {
    const { data, setData, put, processing, errors } = useForm<EditProjectForm>({
        title: project.title ?? '',
        purpose: project.purpose ?? '',
        estimated_amount:
            project.estimatedAmount !== null ? String(project.estimatedAmount) : '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        put(route('projects.update', project.id));
    };

    return (
        <AuthenticatedLayout
            activeKey="projects-approval"
            breadcrumb={[
                { label: '申請・承認', icon: FileCheck2 },
                { label: '案件編集', icon: FilePenLine },
            ]}
        >
            <Head title="案件編集" />

            <div className="mx-auto max-w-3xl space-y-6">
                <section className="rounded-lg border border-brand-border bg-white p-6 shadow-sm">
                    <h1 className="flex items-center text-2xl font-bold tracking-tight text-brand-dark">
                        <span className="mr-2.5 inline-block h-6 w-1 rounded-sm bg-brand-accent" />
                        案件編集
                    </h1>
                    <p className="mt-2 text-sm text-brand-muted">
                        承認前の案件情報を更新できます。
                    </p>
                </section>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-lg border border-brand-border bg-white p-6 shadow-sm"
                >
                    <div>
                        <InputLabel htmlFor="title" value="案件名" />
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(event) => setData('title', event.target.value)}
                            maxLength={255}
                            className="mt-2"
                            required
                        />
                        <InputError className="mt-2" message={errors.title} />
                    </div>

                    <div>
                        <InputLabel htmlFor="purpose" value="目的" />
                        <textarea
                            id="purpose"
                            value={data.purpose}
                            onChange={(event) => setData('purpose', event.target.value)}
                            maxLength={2000}
                            className="mt-2 min-h-28 w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                        <InputError className="mt-2" message={errors.purpose} />
                    </div>

                    <div>
                        <InputLabel htmlFor="estimated_amount" value="見積金額（円）" />
                        <Input
                            id="estimated_amount"
                            type="number"
                            min={0}
                            step="1"
                            value={data.estimated_amount}
                            onChange={(event) =>
                                setData('estimated_amount', event.target.value)
                            }
                            className="mt-2"
                            required
                        />
                        <InputError className="mt-2" message={errors.estimated_amount} />
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-brand-border pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => history.back()}
                            disabled={processing}
                        >
                            戻る
                        </Button>
                        <PrimaryButton disabled={processing}>更新する</PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
