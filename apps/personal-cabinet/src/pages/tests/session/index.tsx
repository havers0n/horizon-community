import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/api-client'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui'
import { Progress } from '@/shared/ui/progress'
import { toast } from 'sonner'
import { reportFocusLoss } from '@/shared/api/test-sessions-service'

type Option = { id: string; option_text: string }
type Question = { id: string; question_text: string; question_type: string; test_question_options?: Option[] }

const TestSessionPage: React.FC = () => {
	const { sessionId } = useParams()
	const navigate = useNavigate()

	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ['test-session', sessionId],
		queryFn: async () => {
			const res = await apiClient.get<any>(`/test-sessions/${sessionId}`)
			return (res as any)?.data ?? res
		},
		enabled: !!sessionId,
		staleTime: 30_000,
	})

	const [answers, setAnswers] = React.useState<Record<string, string | string[]>>({})
	const [currentIndex, setCurrentIndex] = React.useState(0)

	// Таймер и контроль фокуса/аннулирования
	const [hasStarted, setHasStarted] = React.useState(false)
	const [remainingSec, setRemainingSec] = React.useState<number>(0)
	const [focusLosses, setFocusLosses] = React.useState<number>(0)
	const [focusLocked, setFocusLocked] = React.useState(false)
	const submittedRef = React.useRef(false)

	const submitMutation = useMutation({
		mutationFn: async (payload: { answers: { questionId: string; answer: any }[] }) => {
			const res = await apiClient.post<any>(`/test-sessions/${sessionId}/submit`, payload as any)
			return (res as any)?.data ?? res
		},
		onSuccess: async (r: any) => {
			toast.success('Тест завершен! Перенаправляем на страницу результатов...')
			navigate(`/tests/result/${sessionId}`)
		},
		onError: (e: any) => {
			toast.error(e?.message || 'Ошибка при отправке ответов')
		},
	})

	const session = data
	const test = session?.tests
	const questions: Question[] = (test?.test_questions || [])
	const total = questions.length
	const current = questions[currentIndex]

	const setAnswer = (q: Question, value: string) => {
		setAnswers(prev => {
			const type = String(q.question_type || '').toLowerCase()
			if (type.includes('multiple')) {
				const arr = Array.isArray(prev[q.id]) ? (prev[q.id] as string[]) : []
				return { ...prev, [q.id]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
			}
			return { ...prev, [q.id]: value }
		})
	}

	const submit = async () => {
		const payload = {
			answers: Object.entries(answers).map(([questionId, value]) => (
				Array.isArray(value)
					? { questionId, selectedOptionIds: value }
					: { questionId, optionId: value }
			)),
		}
		await submitMutation.mutateAsync(payload as any)
	}

	// Старт теста: предварительный экран -> запуск таймера
	const startTest = () => {
		const durationMin = typeof test?.duration_minutes === 'number' ? test.duration_minutes : 0
		setRemainingSec(durationMin > 0 ? durationMin * 60 : 0)
		setHasStarted(true)
		setFocusLosses(0)
	}

	// Тик таймера
	React.useEffect(() => {
		if (!hasStarted || focusLocked) return
		if (remainingSec <= 0) return
		const id = setInterval(() => setRemainingSec(s => Math.max(0, s - 1)), 1000)
		return () => clearInterval(id)
	}, [hasStarted, focusLocked, remainingSec])

	// Автосабмит по окончании времени
	React.useEffect(() => {
		if (!hasStarted || focusLocked) return
		if (remainingSec === 0 && !submittedRef.current) {
			submittedRef.current = true
			submit().catch(() => { submittedRef.current = false })
		}
	}, [remainingSec, hasStarted, focusLocked])

	// Обработка потери фокуса: visibilitychange + blur
	React.useEffect(() => {
		if (!hasStarted || focusLocked) return
		const handleViolation = async () => {
			if (!sessionId) return
			try {
				await reportFocusLoss(sessionId)
				setFocusLosses(v => v + 1)
				toast('Потеря фокуса. Это предупреждение. Повторная попытка аннулирует тест.')
			} catch (e) {
				setFocusLocked(true)
				toast.error('Тест аннулирован за повторное нарушение правил.')
			}
		}
		const onVis = () => { if (document.hidden) handleViolation() }
		const onBlur = () => { handleViolation() }
		const onBeforeUnload = (e: BeforeUnloadEvent) => {
			e.preventDefault()
			e.returnValue = 'Вы уверены, что хотите покинуть страницу? Прогресс теста будет потерян.'
			return e.returnValue
		}
		document.addEventListener('visibilitychange', onVis)
		window.addEventListener('blur', onBlur)
		window.addEventListener('beforeunload', onBeforeUnload)
		return () => {
			document.removeEventListener('visibilitychange', onVis)
			window.removeEventListener('blur', onBlur)
			window.removeEventListener('beforeunload', onBeforeUnload)
		}
	}, [hasStarted, focusLocked, sessionId])

	// Загрузка/ошибка отображаются после декларации всех хуков, чтобы не ломать порядок
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		)
	}
	if (isError) {
		return (
			<div className="container mx-auto px-4 py-6">
				<div className="text-red-400">{(error as any)?.message || 'Ошибка загрузки сессии'}</div>
				<div className="mt-4">
					<Button variant="outline" onClick={() => refetch()}>Повторить</Button>
				</div>
			</div>
		)
	}

	// Экран до старта теста
	if (!hasStarted && !focusLocked) {
		return (
			<div className="container mx-auto px-4 py-6">
				<Card>
					<CardContent className="space-y-4 p-6">
						<h1 className="text-2xl font-bold">Вы начинаете тест</h1>
						<div className="text-muted-foreground space-y-2">
							<p>Вам даётся {typeof test?.duration_minutes === 'number' ? test.duration_minutes : '-'} мин. на выполнение теста.</p>
							<p>Будьте внимательны: запрещено сворачивать или переключать вкладку во время теста.</p>
							<p>При первой попытке потери фокуса вы получите предупреждение. При повторной — ваш тест будет аннулирован.</p>
						</div>
						<div className="flex items-center gap-2 pt-2">
							<Button onClick={startTest}>Начать тест</Button>
							<Button variant="outline" onClick={() => navigate(-1)}>Отмена</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	// Экран аннулирования
	if (focusLocked) {
		return (
			<div className="container mx-auto px-4 py-6">
				<Card>
					<CardContent className="p-6 space-y-3">
						<h1 className="text-2xl font-bold text-destructive">Тест аннулирован</h1>
						<div className="text-muted-foreground">Сессия аннулирована из-за повторного нарушения правил. Обратитесь к администратору.</div>
						<div>
							<Button onClick={() => navigate('/tests')}>К списку тестов</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	// Основной экран теста
	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">{test?.title || 'Тест'}</h1>
					{typeof test?.max_focus_losses === 'number' && (
						<div className="text-sm text-muted-foreground">Нарушений фокуса: {focusLosses} / {test.max_focus_losses}</div>
					)}
				</div>
				<div className="text-right">
					<div className="text-sm text-muted-foreground">Оставшееся время</div>
					<div className="text-xl font-mono">
						{Math.floor(remainingSec / 60)}:{String(remainingSec % 60).padStart(2, '0')}
					</div>
				</div>
			</div>
			<Card>
				<CardContent className="space-y-4 p-4">
					<div className="flex items-center justify-between text-sm text-gray-400">
						<div>Сессия: {session?.id}</div>
						<div>Вопрос {currentIndex + 1} из {total}</div>
					</div>
					<Progress value={(total ? (currentIndex) / total : 0) * 100} className="h-2" />
					{current ? (
						<div className="rounded-md border border-gray-700 p-3">
							<div className="text-gray-100 font-medium mb-2">{currentIndex + 1}. {current.question_text}</div>
							<div className="space-y-1">
								{(current.test_question_options || []).map(opt => {
									const isMultiple = String(current.question_type || '').toLowerCase().includes('multiple')
									const name = `q_${current.id}`
									const checked = isMultiple
										? Array.isArray(answers[current.id]) && (answers[current.id] as string[]).includes(opt.id)
										: answers[current.id] === opt.id
									return (
										<label key={opt.id} className="flex items-center gap-2 text-gray-200">
											<input
												type={isMultiple ? 'checkbox' : 'radio'}
												name={name}
												value={opt.id}
												checked={checked}
												onChange={() => setAnswer(current, opt.id)}
												className="h-4 w-4"
											/>
											<span className="text-sm">{opt.option_text}</span>
										</label>
									)
								})}
							</div>
						</div>
					) : (
						<div className="text-gray-400">Нет доступных вопросов</div>
					)}
					<div className="flex justify-between gap-2">
						<Button variant="outline" onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}>Назад</Button>
						{currentIndex < (total - 1) ? (
							<Button onClick={() => setCurrentIndex(i => Math.min(total - 1, i + 1))}>Далее</Button>
						) : (
							<Button onClick={submit} disabled={submitMutation.isPending}>Отправить ответы</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default TestSessionPage



