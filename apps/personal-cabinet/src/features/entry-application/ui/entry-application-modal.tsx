import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/shared/lib/use-toast'
import { UserPlus, Paperclip } from 'lucide-react'
import { api } from '@/shared/api'
import { apiClient } from '@/shared/api/api-client'
import type { Department } from '@/shared/api/public-service'
import { useSession } from '@/shared/contexts/SessionContext'
import { supabase } from '@/shared/lib/supabase'

const entryCadetApplicationSchema = z.object({
	fullName: z.string().min(5, 'Укажите имя и фамилию полностью'),
	age: z.coerce.number().int().min(16, 'Возраст должен быть не менее 16 лет'),
	departmentId: z.string().uuid('Выберите департамент'),
	departmentUnderstanding: z.string().min(10, 'Опишите, чем занимается департамент'),
	motivation: z.string().min(10, 'Опишите вашу мотивацию'),
	hasMicrophone: z.enum(['yes', 'no']),
	pcMeetsRequirements: z.enum(['yes', 'no']),
	pcRequirementsText: z.string().optional().default(''),
	source: z.string().min(2, 'Укажите источник'),
	otherCommunitiesExperience: z.enum(['current', 'past', 'none'], {
		required_error: 'Выберите вариант опыта',
	}),
})

type EntryCadetApplicationFormData = z.infer<typeof entryCadetApplicationSchema>

interface EntryApplicationModalProps {
	children?: React.ReactNode
	isOpen?: boolean
	onOpenChange?: (open: boolean) => void
}

// Department тип импортируется из публичного сервиса

// positions removed: cadet entry form не выбирает позицию

export function EntryApplicationModal({ children, isOpen, onOpenChange }: EntryApplicationModalProps) {
	const [internalOpen, setInternalOpen] = useState(false)
	const open = typeof isOpen === 'boolean' ? isOpen : internalOpen
	const setOpen = onOpenChange || setInternalOpen
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const { session, refetch: refetchSession } = useSession()
	const [isUploading, setIsUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	// Загрузка департаментов из публичного API через стандартизованный сервисный клиент
	const { data: departments } = useQuery<Department[]>({
		queryKey: ['public', 'departments'],
		queryFn: () => api.public.getDepartments(),
		staleTime: 5 * 60 * 1000,
	})
	const form = useForm<EntryCadetApplicationFormData>({
		resolver: zodResolver(entryCadetApplicationSchema),
		defaultValues: {
			fullName: '',
			age: '' as any,
			departmentId: '' as any,
			departmentUnderstanding: '',
			motivation: '',
			pcRequirementsText: '',
			source: '',
			hasMicrophone: '' as any,
			pcMeetsRequirements: '' as any,
			otherCommunitiesExperience: '' as any,
		} as any,
	})

	const mutation = useMutation({
		mutationFn: async (data: EntryCadetApplicationFormData) => {
			const toBool = (v: 'yes' | 'no') => v === 'yes'
			const mapExperience = (v: 'current' | 'past' | 'none') => ({
				in_other_communities_now: v === 'current',
				been_in_other_fivem_communities: v === 'current' || v === 'past',
			})
			const payload = {
				type: 'entry',
				target_department_id: data.departmentId,
				data: {
					full_name: data.fullName,
					age: data.age,
					department_understanding: data.departmentUnderstanding,
					motivation: data.motivation,
					has_microphone: toBool(data.hasMicrophone),
					pc_meets_requirements: toBool(data.pcMeetsRequirements),
					pc_requirements_text: data.pcRequirementsText || '',
					source: data.source,
					...mapExperience(data.otherCommunitiesExperience),
				},
			}
			const created = await apiClient.post<any>('/applications', payload)
			return created
		},
		onSuccess: async () => {
			toast({
				title: 'Заявка отправлена!',
				description: 'Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.'
			})
			await refetchSession()
			queryClient.invalidateQueries({ queryKey: ['dashboard', 'data'] })
			setOpen(false)
			form.reset()
		},
		onError: (err: any) => {
			toast({
				title: 'Ошибка',
				description: err?.message || 'Не удалось отправить заявку. Попробуйте еще раз.',
				variant: 'destructive'
			})
		}
	})

	const onSubmit = (data: EntryCadetApplicationFormData) => {
		mutation.mutate(data)
	}
	// watching to keep controlled select synced (value used implicitly by react-hook-form)
	form.watch('departmentId')

	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.currentTarget.files?.[0]
		if (!selectedFile) return
		try {
			if (!session?.user?.id) {
				toast({ title: 'Не авторизовано', description: 'Пользователь не найден в сессии', variant: 'destructive' })
				return
			}
			setIsUploading(true)
			const userId = session.user.id
			const filePath = `${userId}/${Date.now()}-${selectedFile.name}`
			const { error: uploadError } = await supabase
				.storage
				.from('application-attachments')
				.upload(filePath, selectedFile)
			if (uploadError) throw uploadError

			const { data: { publicUrl } } = supabase
				.storage
				.from('application-attachments')
				.getPublicUrl(filePath)
			if (!publicUrl) {
				toast({ title: 'Загрузка выполнена, но URL не получен', description: 'Не удалось получить публичный URL файла', variant: 'destructive' })
				return
			}
			const currentText = form.getValues('pcRequirementsText') || ''
			const nextText = currentText ? `${currentText}\n${publicUrl}` : publicUrl
			form.setValue('pcRequirementsText', nextText, { shouldDirty: true, shouldTouch: true })
			toast({ title: 'Скриншот успешно загружен', description: 'Ссылка добавлена в поле системных требований' })
		} catch (err: any) {
			toast({ title: 'Ошибка загрузки файла', description: err?.message || 'Попробуйте снова', variant: 'destructive' })
		} finally {
			setIsUploading(false)
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button>
						<UserPlus className="h-4 w-4 mr-2" />
						Подать заявку на вступление
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<UserPlus className="h-5 w-5" />
						Заявка на вступление как кадет
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<UserPlus className="h-5 w-5" />
									Личная информация и вопросы
								</CardTitle>
								<CardDescription>
									Заполните все поля. Ответы будут использованы для рассмотрения вашей заявки как кадета.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="fullName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Ваше имя и фамилия</FormLabel>
												<FormControl>
													<Input placeholder="Иван Иванов" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="age"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Ваш возраст</FormLabel>
												<FormControl>
													<Input type="number" min={16} placeholder="18" value={(field.value as any) ?? ''} onChange={(e) => field.onChange(e.currentTarget.value === '' ? '' : Number(e.currentTarget.value))} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="departmentId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>В какой департамент вы хотите вступить?</FormLabel>
											<Select onValueChange={field.onChange} value={field.value || ''}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Выберите департамент" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{departments?.map((dept) => (
														<SelectItem key={dept.id} value={dept.id}>
															{dept.full_name || dept.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="departmentUnderstanding"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Чем занимается данный департамент по вашему мнению?</FormLabel>
											<FormControl>
												<Textarea placeholder="Опишите, какие задачи выполняет департамент..." className="min-h-[100px]" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="motivation"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Почему вы хотите вступить именно в этот департамент?</FormLabel>
											<FormControl>
												<Textarea placeholder="Опишите вашу мотивацию..." className="min-h-[100px]" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>)}/>

								<div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
									<div className="md:col-span-5">
										<FormField
											control={form.control}
											name="hasMicrophone"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="flex items-center min-h-[24px]">Присутствует ли у вас исправный микрофон?</FormLabel>
													<Select onValueChange={field.onChange} value={field.value || ''}>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Выберите ответ" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="yes">Да</SelectItem>
															<SelectItem value="no">Нет</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className="md:col-span-7">
										<FormField
											control={form.control}
											name="pcMeetsRequirements"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="block w-full text-right flex items-center justify-end min-h-[24px]">Соответствует ли ваш ПК системным требованиям FiveM?</FormLabel>
													<Select onValueChange={field.onChange} value={field.value || ''}>
														<FormControl>
															<SelectTrigger className="w-full md:w-[85%] md:ml-auto">
																<SelectValue placeholder="Выберите ответ" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="yes">Да</SelectItem>
															<SelectItem value="no">Нет</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								<FormField
									control={form.control}
									name="pcRequirementsText"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Ваши системные требования</FormLabel>
											<FormControl>
												<Textarea placeholder="Опишите характеристики ПК (например: CPU, RAM, GPU, OS) или прикрепите скриншот — ссылка будет добавлена сюда автоматически" className="min-h-[100px]" {...field} />
											</FormControl>
											<div className="flex items-center gap-2 pt-2">
												<input ref={fileInputRef} id="pc-specs-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
												<Button type="button" variant="outline" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
													{isUploading ? 'Загрузка...' : (<><Paperclip className="h-4 w-4 mr-2" /> Прикрепить скриншот</>)}
												</Button>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="source"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Откуда вы узнали про нас?</FormLabel>
											<FormControl>
												<Input placeholder="Discord, VK, друзья, YouTube и т.д." {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="otherCommunitiesExperience"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Опыт в других FiveM-сообществах</FormLabel>
											<Select onValueChange={field.onChange} value={field.value || ''}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Выберите вариант" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="current">Да, состою сейчас</SelectItem>
													<SelectItem value="past">Да, состоял ранее</SelectItem>
													<SelectItem value="none">Нет, это первый опыт</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>

						<div className="flex justify-end gap-2">
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending ? 'Отправка...' : 'Отправить заявку'}
							</Button>
							<Button type="button" variant="outline" onClick={() => setOpen(false)}>
								Отмена
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
} 