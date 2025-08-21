import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { FileText, Download, ExternalLink, Loader2 } from 'lucide-react'
import { Layout } from '@/shared/ui/layout'
import { documentsApi } from '@/shared/api/documents'
import type { DocumentTreeCategory } from '@/shared/types/documents'
import { useToast } from '@/shared/ui/use-toast'

export default function DocumentsPage() {
  const [documentTree, setDocumentTree] = useState<DocumentTreeCategory[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true)
        const response = await documentsApi.getDocumentTree()
        if (response.success && response.data) {
          setDocumentTree(response.data)
        } else {
          toast({
            title: "Ошибка",
            description: response.error || "Не удалось загрузить документы",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Error fetching documents:', error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить документы",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  const handleDownload = (slug: string) => {
    // In a real implementation, this would fetch the document content
    // and trigger download. For now, we'll navigate to the document.
    window.open(`/documents/slug/${slug}`, '_blank')
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-gray-600 dark:text-gray-400">Загрузка документов...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Документация
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Справочные материалы и руководства
          </p>
        </div>

        {documentTree.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Документы не найдены
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                В данный момент нет доступных документов для просмотра.
              </p>
            </CardContent>
          </Card>
        ) : (
          documentTree.map((category) => (
            <div key={category.id} className="space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {category.title}
                </h2>
                {category.description && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                )}
              </div>

              {category.documents.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  В этой категории пока нет документов.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {category.documents.map((doc) => (
                    <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{doc.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-sm text-gray-500 space-y-1">
                          {doc.version && (
                            <div>Версия: {doc.version}</div>
                          )}
                          {doc.updated_at && (
                            <div>
                              Обновлено: {new Date(doc.updated_at).toLocaleDateString('ru-RU')}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleDownload(doc.slug)}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Открыть
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Render subcategories recursively if needed */}
              {category.children && category.children.length > 0 && (
                <div className="ml-4 space-y-4">
                  {category.children.map((subcategory) => (
                    <div key={subcategory.id} className="space-y-2">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                        {subcategory.title}
                      </h3>
                      {subcategory.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {subcategory.description}
                        </p>
                      )}
                      {subcategory.documents.length > 0 && (
                        <div className="grid gap-3 md:grid-cols-2">
                          {subcategory.documents.map((doc) => (
                            <Card key={doc.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{doc.title}</span>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleDownload(doc.slug)}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        <Card>
          <CardHeader>
            <CardTitle>Часто задаваемые вопросы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Как пройти вступительный тест?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Найдите "Руководство по тестированию" в соответствующей категории выше.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Где найти правила департамента?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Все правила департаментов находятся в категории "Департаменты".
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}