import React from 'react'
import { cn } from '@/shared/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'

export interface PageHeaderProps {
	title: string
	description?: string
	actions?: React.ReactNode
	breadcrumbs?: React.ReactNode
	className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions, breadcrumbs, className }) => {
	return (
		<div className={cn('flex items-start justify-between', className)}>
			<div>
				{breadcrumbs}
				<h1 className="text-2xl font-bold">{title}</h1>
				{description && (
					<p className="text-sm text-muted-foreground mt-1">{description}</p>
				)}
			</div>
			{actions && (
				<div className="flex items-center gap-2">{actions}</div>
			)}
		</div>
	)
}

export interface SectionCardProps {
	title?: string
	description?: string
	headerExtra?: React.ReactNode
	footer?: React.ReactNode
	children: React.ReactNode
	className?: string
	contentClassName?: string
}

export const SectionCard: React.FC<SectionCardProps> = ({
	title,
	description,
	headerExtra,
	footer,
	children,
	className,
	contentClassName,
}) => {
	return (
		<Card className={cn('card-horizon', className)}>
			{(title || description || headerExtra) && (
				<CardHeader>
					<div className="flex items-start justify-between">
						<div>
							{title && <CardTitle>{title}</CardTitle>}
							{description && <CardDescription>{description}</CardDescription>}
						</div>
						{headerExtra && <div className="flex items-center gap-2">{headerExtra}</div>}
					</div>
				</CardHeader>
			)}
			<CardContent className={cn('p-6', contentClassName)}>
				{children}
				{footer && <div className="mt-4">{footer}</div>}
			</CardContent>
		</Card>
	)
}
