import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Textarea } from '@shared/ui'
import { useCabinet } from '@shared/hooks'
import { useEffect } from 'react'

const profileSchema = z.object({
  username: z.string().min(2, 'Имя пользователя должно содержать минимум 2 символа'),
  bio: z.string().max(500, 'Биография не должна превышать 500 символов').optional(),
  avatar_url: z.string().url('Должна быть валидная ссылка').optional().or(z.literal('')),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function ProfileForm() {
  const { profile, profileLoading, updateProfile, updateProfileLoading } = useCabinet()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      bio: '',
      avatar_url: '',
    },
  })

  // Заполняем форму данными профиля при загрузке
  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username || '',
        bio: '', // Убираем profile.bio, так как его нет в схеме
        avatar_url: '', // Убираем profile.avatar_url, так как его нет в схеме
      })
    }
  }, [profile, form])

  const onSubmit = (data: ProfileFormData) => {
    updateProfile(data)
  }

  return (
    <div className="flex-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {profileLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя пользователя</FormLabel>
                    <FormControl>
                      <Input placeholder="ivan_petrov" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="avatar_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ссылка на аватар</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>О себе</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Расскажите немного о себе..."
                    className="resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
              <Button type="submit" disabled={updateProfileLoading}>
                {updateProfileLoading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </>
          )}
        </form>
      </Form>
    </div>
  )
} 