
import React, { useMemo, useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
	listTests,
	deleteTest,
	getTest,
	createTest,
	updateTest,
	listDepartments,
	listManagedDepartments,
	listRanks,
	listQualifications,
	type AdminTest,
	type CreateTestDto,
} from '@/features/admin/tests/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { useSession } from '@/shared/contexts/SessionContext'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'

type Purpose = 'ENTRY' | 'PROMOTION' | 'QUALIFICATION'

const baseSchema = z.object({
	title: z.string().min(1, 'Обязательное поле'),
	description: z.string().optional(),
	duration_minutes: z.coerce.number().int().positive('> 0'),
	passing_score_percent: z.coerce.number().int().min(0).max(100),
	max_focus_losses: z.coerce.number().int().min(0),
})

const createSchema = baseSchema.extend({
	purpose: z.enum(['ENTRY', 'PROMOTION', 'QUALIFICATION']),
	target: z.union([
		z.object({ department_id: z.string().uuid() }),
		z.object({ rank_id: z.string().uuid() }),
		z.object({ qualification_id: z.string().uuid() }),
	]),
})

type CreateFormValues = z.infer<typeof createSchema>

const editSchema = baseSchema.extend({
	target: z.union([
		z.object({ department_id: z.string().uuid() }),
		z.object({ rank_id: z.string().uuid() }),
		z.object({ qualification_id: z.string().uuid() }),
	]).optional(),
})

type EditFormValues = z.infer<typeof editSchema>

function UnifiedTestForm({
	mode,
	testId,
	onClose,
}: {
	mode: 'create' | 'edit'
	testId?: string
	onClose: (updated?: AdminTest) => void
}) {
	const queryClient = useQueryClient()
	const isCreate = mode === 'create'

	const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: listDepartments, staleTime: 300_000 })
	const { data: managedDepartments } = useQuery({ queryKey: ['me','managed-departments'], queryFn: listManagedDepartments, staleTime: 300_000 })

	const { data: test, isLoading: isTestLoading } = useQuery({
		queryKey: ['admin-test', testId],
		queryFn: () => getTest(testId as string),
		enabled: !isCreate && !!testId,
		staleTime: 60_000,
	})

	const [purpose, setPurpose] = useState<Purpose>('ENTRY')
	const currentPurpose: Purpose | undefined = isCreate ? purpose : (test?.purpose as Purpose | undefined)

	const { data: ranks } = useQuery({
		queryKey: ['ranks', (test as any)?.target_department_id, currentPurpose],
		queryFn: () => listRanks(((test as any)?.target_department_id as string) || undefined),
		enabled: !!(!isCreate && test && currentPurpose === 'PROMOTION'),
		staleTime: 300_000,
	})

	const { data: qualifications } = useQuery({
		queryKey: ['qualifications', (test as any)?.target_department_id, currentPurpose],
		queryFn: () => listQualifications(((test as any)?.target_department_id as string) || undefined),
		enabled: !!(!isCreate && test && currentPurpose === 'QUALIFICATION'),
		staleTime: 300_000,
	})

	const createMutation = useMutation({
		mutationFn: (dto: CreateTestDto) => createTest(dto),
		onSuccess: (created) => {
			queryClient.invalidateQueries({ queryKey: ['admin-tests'] })
			onClose(created)
		},
	})

	const updateMutation = useMutation({
		mutationFn: (dto: EditFormValues) => updateTest(testId as string, dto),
		onSuccess: (updated) => {
			queryClient.invalidateQueries({ queryKey: ['admin-tests'] })
			queryClient.invalidateQueries({ queryKey: ['admin-test', testId] })
			onClose(updated)
		},
	})

	// Forms
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		control,
		setValue,
		reset,
	} = useForm<CreateFormValues | EditFormValues>({
		resolver: zodResolver(isCreate ? createSchema : editSchema),
		defaultValues: isCreate
			? {
				// Create defaults
				// @ts-ignore
				passing_score_percent: 80,
				// @ts-ignore
				max_focus_losses: 1,
				// @ts-ignore
				duration_minutes: 20,
				// @ts-ignore
				target: { department_id: '' as any },
			}
			: undefined,
	})

	React.useEffect(() => {
		if (!isCreate && test) {
			reset({
				// @ts-ignore
				title: test.title,
				// @ts-ignore
				description: test.description || '',
				// @ts-ignore
				duration_minutes: test.duration_minutes,
				// @ts-ignore
				passing_score_percent: test.passing_score_percent,
				// @ts-ignore
				max_focus_losses: test.max_focus_losses,
				// @ts-ignore
				target: test.target_department_id
					? { department_id: test.target_department_id }
					: test.target_rank_id
						? { rank_id: test.target_rank_id }
						: test.target_qualification_id
							? { qualification_id: test.target_qualification_id }
							: undefined,
			})
		}
	}, [isCreate, test, reset])

	if (!isCreate && (isTestLoading || !test)) {
		return <div>Загрузка...</div>
	}

	return (
		<form
			onSubmit={handleSubmit(async (values: any) => {
				if (isCreate) {
					const payload: CreateTestDto = {
						title: values.title,
						description: values.description,
						duration_minutes: values.duration_minutes,
						passing_score_percent: values.passing_score_percent,
						max_focus_losses: values.max_focus_losses,
						purpose,
						target: values.target,
					}
					await createMutation.mutateAsync(payload)
				} else {
					await updateMutation.mutateAsync(values as EditFormValues)
				}
			})}
			className="space-y-4"
		>
			<div className="grid gap-3">
				<Input placeholder="Название" {...register('title' as const)} />
				{errors && (errors as any).title && (
					<p className="text-destructive text-sm">{(errors as any).title.message as string}</p>
				)}
			</div>
			<Textarea placeholder="Описание" {...register('description' as const)} />
			<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
				<Input type="number" placeholder="Длительность (мин)" {...register('duration_minutes' as const)} />
				<Input type="number" placeholder="Проходной %" {...register('passing_score_percent' as const)} />
				<Input type="number" placeholder="Макс. потерь фокуса" {...register('max_focus_losses' as const)} />
			</div>

			{/* Purpose/Target */}
			{isCreate ? (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
					<div>
						<label className="block text-sm mb-1">Назначение (purpose)</label>
						<select
							className="w-full border rounded px-2 py-2"
							value={purpose}
							onChange={(e) => {
								const p = e.target.value as Purpose
								setPurpose(p)
								// reset target
								setValue('target' as any, undefined)
							}}
						>
							<option value="ENTRY">ENTRY</option>
							<option value="PROMOTION">PROMOTION</option>
							<option value="QUALIFICATION">QUALIFICATION</option>
						</select>
					</div>

					{purpose === 'ENTRY' && (
						<div>
							<label className="block text-sm mb-1">Департамент</label>
							<Controller
								control={control}
								name={'target' as const}
								render={({ field }) => (
									<Select
										value={(field.value as any)?.department_id || undefined}
										onValueChange={(v) => field.onChange({ department_id: v })}
									>
										<SelectTrigger>
											<SelectValue placeholder="Не выбрано" />
										</SelectTrigger>
										<SelectContent>
											{(managedDepartments || []).map((d) => (
												<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
						</div>
					)}

					{purpose === 'PROMOTION' && (
						<div>
							<label className="block text-sm mb-1">Звание</label>
							<Controller
								control={control}
								name={'target' as const}
								render={({ field }) => (
									<Select
										value={(field.value as any)?.rank_id || undefined}
										onValueChange={(v) => field.onChange({ rank_id: v })}
									>
										<SelectTrigger>
											<SelectValue placeholder="Не выбрано" />
										</SelectTrigger>
										<SelectContent>
											{/* ranks могут зависеть от выбранного департамента на бэкенде */}
											{(ranks || []).map((r) => (
												<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
						</div>
					)}

					{purpose === 'QUALIFICATION' && (
						<div>
							<label className="block text-sm mb-1">Квалификация</label>
							<Controller
								control={control}
								name={'target' as const}
								render={({ field }) => (
									<Select
										value={(field.value as any)?.qualification_id || undefined}
										onValueChange={(v) => field.onChange({ qualification_id: v })}
									>
										<SelectTrigger>
											<SelectValue placeholder="Не выбрано" />
										</SelectTrigger>
										<SelectContent>
											{(qualifications || []).map((q) => (
												<SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
						</div>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<div>
						<label className="text-sm text-muted-foreground">Назначение</label>
						<Input readOnly value={(test?.purpose || '') as any} />
					</div>
					{/* Target редактируем в рамках текущего purpose */}
					{currentPurpose === 'ENTRY' && (
						<Controller
							control={control}
							name={'target' as const}
							render={({ field }) => (
								<Select
									value={(field.value as any)?.department_id || (test as any)?.target_department_id || undefined}
									onValueChange={(v) => field.onChange({ department_id: v })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Не выбрано" />
									</SelectTrigger>
									<SelectContent>
										{(departments || []).map((d) => (
											<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
					)}
					{currentPurpose === 'PROMOTION' && (
						<Controller
							control={control}
							name={'target' as const}
							render={({ field }) => (
								<Select
									value={(field.value as any)?.rank_id || (test as any)?.target_rank_id || undefined}
									onValueChange={(v) => field.onChange({ rank_id: v })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Не выбрано" />
									</SelectTrigger>
									<SelectContent>
										{(ranks || []).map((r) => (
											<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
					)}
					{currentPurpose === 'QUALIFICATION' && (
						<Controller
							control={control}
							name={'target' as const}
							render={({ field }) => (
								<Select
									value={(field.value as any)?.qualification_id || (test as any)?.target_qualification_id || undefined}
									onValueChange={(v) => field.onChange({ qualification_id: v })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Не выбрано" />
									</SelectTrigger>
									<SelectContent>
										{(qualifications || []).map((q) => (
											<SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
					)}
				</div>
			)}

			<div className="flex gap-2">
				<Button type="submit" disabled={isSubmitting}>Сохранить</Button>
				<Button type="button" variant="outline" onClick={() => onClose(undefined)}>Отмена</Button>
			</div>
		</form>
	)
}

export default function AdminTestsPage() {
	const { isLoading } = useSession()
	const { isLoggedIn, session } = usePermissions()
	const queryClient = useQueryClient()
	const [isOpen, setIsOpen] = useState(false)
	const [mode, setMode] = useState<'create' | 'edit'>('create')
	const [editingId, setEditingId] = useState<string | undefined>(undefined)

	const { data: tests, isLoading: isLoadingTests } = useQuery({
		queryKey: ['admin-tests'],
		queryFn: listTests,
		staleTime: 300_000,
	})

	// --- UI фильтры и дебаунс ---
	const [search, setSearch] = useState('')
	const [purposeFilter, setPurposeFilter] = useState<'all' | 'ENTRY' | 'PROMOTION' | 'QUALIFICATION'>('all')
	const [debouncedSearch, setDebouncedSearch] = useState('')

	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 500)
		return () => clearTimeout(t)
	}, [search])

	const filteredTests = useMemo(() => {
		const arr = Array.isArray(tests) ? tests : []
		return arr.filter((t) => {
			const matchesPurpose = purposeFilter === 'all' ? true : (t.purpose || '').toUpperCase() === purposeFilter
			if (!debouncedSearch) return matchesPurpose
			const title = (t.title || '').toLowerCase()
			const desc = (t.description || '').toLowerCase()
			const matchesSearch = title.includes(debouncedSearch) || desc.includes(debouncedSearch)
			return matchesPurpose && matchesSearch
		})
	}, [tests, debouncedSearch, purposeFilter])

	const removeMutation = useMutation({
		mutationFn: (id: string) => deleteTest(id),
		onSuccess: (_data, id) => {
			queryClient.setQueryData<AdminTest[] | undefined>(['admin-tests'], (old) =>
				Array.isArray(old) ? old.filter((t) => t.id !== id) : old
			)
			queryClient.invalidateQueries({ queryKey: ['admin-tests'] })
			toast.success('Тест успешно удален')
		},
	})

	if (isLoading) {
		return (
			<div className="container mx-auto p-6">Загрузка...</div>
		)
	}

	if (!isLoggedIn || !(session?.permissions || []).includes('tests.manage')) {
		return <Navigate to="/dashboard" replace />
	}

	return (
		<div className="container mx-auto p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Админ панель - Управление тестами</h1>
					<p className="text-muted-foreground">Создание и управление тестами и экзаменами</p>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={() => {
							setMode('create')
							setEditingId(undefined)
							setIsOpen(true)
						}}
					>
						Создать новый тест
					</Button>
				</div>
			</div>

			{/* Панель фильтров */}
			<Card className="mb-4">
				<CardHeader>
					<CardTitle>Фильтры</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<Input
							placeholder="Поиск по названию/описанию"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
						<div>
							<label className="text-sm text-muted-foreground">Назначение</label>
							<Select value={purposeFilter} onValueChange={(v) => setPurposeFilter(v as any)}>
								<SelectTrigger>
									<SelectValue placeholder="Все" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Все</SelectItem>
									<SelectItem value="ENTRY">ENTRY</SelectItem>
									<SelectItem value="PROMOTION">PROMOTION</SelectItem>
									<SelectItem value="QUALIFICATION">QUALIFICATION</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Список тестов</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoadingTests ? (
						<div>Загрузка...</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ID</TableHead>
									<TableHead>Название</TableHead>
									<TableHead>Описание</TableHead>
									<TableHead>Длительность</TableHead>
									<TableHead>Действия</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredTests.map((t: AdminTest) => (
									<TableRow key={t.id}>
										<TableCell className="text-muted-foreground font-mono">{t.id.slice(0, 8)}</TableCell>
										<TableCell className="font-medium">{t.title}</TableCell>
										<TableCell className="truncate max-w-[480px]">{t.description}</TableCell>
										<TableCell>{t.duration_minutes} мин</TableCell>
										<TableCell className="flex gap-2">
											<Button
												variant="outline"
												onClick={() => {
													setMode('edit')
													setEditingId(t.id)
													setIsOpen(true)
												}}
											>
												Редактировать
											</Button>
											<Button
												variant="destructive"
												onClick={() => {
													if (!confirm('Удалить тест? Действие необратимо.')) return
													removeMutation.mutate(t.id)
												}}
												disabled={removeMutation.isPending}
											>
												Удалить
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<Dialog open={isOpen} onOpenChange={(v) => setIsOpen(v)}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>{mode === 'create' ? 'Создание теста' : 'Редактирование теста'}</DialogTitle>
					</DialogHeader>
					<UnifiedTestForm
						mode={mode}
						testId={editingId}
						onClose={(updated) => {
							setIsOpen(false)
							setEditingId(undefined)
							if (updated) {
								toast.success('Сохранено')
							}
						}}
					/>
				</DialogContent>
			</Dialog>
		</div>
	)
}