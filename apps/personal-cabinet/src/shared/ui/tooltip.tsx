import { TooltipProvider as Provider } from '@radix-ui/react-tooltip'

interface TooltipProviderProps {
  children: React.ReactNode
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <Provider>{children}</Provider>
} 