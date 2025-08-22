import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { UsefulLinksWidgetProps } from '@/features/dashboard/model/types';
import { 
  Database,
  FileText,
  Gamepad2,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';

export const UsefulLinksWidget: React.FC<UsefulLinksWidgetProps> = ({ links }) => {
  const getLinkIcon = (iconName: string) => {
    switch (iconName) {
      case 'Database':
        return <Database className="w-4 h-4" />;
      case 'FileText':
        return <FileText className="w-4 h-4" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-4 h-4" />;
      case 'MessageCircle':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
<Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-100">
          Полезные ссылки
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {links.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">
              <ExternalLink className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-400">Нет доступных ссылок</p>
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.url)}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-left group"
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center group-hover:bg-gray-500 transition-colors">
                  <div className="text-gray-300 group-hover:text-gray-200">
                    {getLinkIcon(link.icon)}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-100 group-hover:text-gray-200 transition-colors">
                    {link.title}
                  </h4>
                  {link.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                      {link.description}
                    </p>
                  )}
                </div>
                
                {/* External Link Icon */}
                <div className="flex-shrink-0">
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 