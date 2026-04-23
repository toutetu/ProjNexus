import { Head, useForm } from '@inertiajs/react';
import { FileCheck2, FolderPlus } from 'lucide-react';
import type { FormEventHandler } from 'react';

import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface CreateProjectForm {
    title: string;
    purpose: string;
    estimated_amount: string;
}

export default function ProjectsCreate() {
    const { data, setData, post, processing, errors } = useForm<CreateProjectForm>({
        title: '',
        purpose: '',
        estimated_amount: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('projects.store'));
    };

    return (
        <AuthenticatedLayout
            activeKey="new"
            breadcrumb={[
                { label: '申請・承認', icon: FileCheck2 },
                { label: '新規申請', icon: FolderPlus },
            ]}
        >
            <Head title="新規申請" />

            <div className="mx-auto max-w-3xl space-y-6">
                <section className="rounded-lg border border-brand-border bg-white p-6 shadow-sm">
                    <h1 className="flex items-center text-2xl font-bold tracking-tight text-brand-dark">
                        <span className="mr-2.5 inline-block h-6 w-1 rounded-sm bg-brand-accent" />
                        新規申請
                    </h1>
                    <p className="mt-2 text-sm text-brand-muted">
                        案件名・目的・見積金額を入力して、下書き案件を作成します。
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
                            placeholder="例: 次世代EAMシステム開発"
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
                            placeholder="案件の目的や背景を記載"
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
                            placeholder="例: 5000000"
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
                        <PrimaryButton disabled={processing}>下書き保存</PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
