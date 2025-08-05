// src/widgets/forum/index.tsx

import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card';

// 1. УБИРАЕМ импорт ForumFeature. Он нам больше не нужен.

// 2. ИСПОЛЬЗУЕМ React.lazy с прямым динамическим импортом.
// React сам поймет, что нужно загрузить компонент TopicList из файла по этому пути.
const TopicList = React.lazy(() => import('@/features/forum/ui/topic-list'));
const CreateTopic = React.lazy(() => import('@/features/forum/ui/create-topic'));

export function ForumWidget() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Форум</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Suspense теперь работает как надо */}
          <Suspense fallback={<div>Загрузка списка тем...</div>}>
            <TopicList />
          </Suspense>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Создать новую тему</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Загрузка формы...</div>}>
            <CreateTopic />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

// Убедитесь, что у вас есть эти файлы и они экспортируют компоненты по умолчанию:
// - src/features/forum/ui/topic-list.tsx -> export default TopicList;
// - src/features/forum/ui/create-topic.tsx -> export default CreateTopic;

// Если они экспортируют именованные компоненты (export const TopicList),
// то используйте такой синтаксис:
// const TopicList = React.lazy(() => 
//   import('@/features/forum/ui/topic-list').then(module => ({ default: module.TopicList }))
// );