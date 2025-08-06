import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import { Search, Mail, Lock, User } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    placeholder: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Enter your email" />
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Search..." className="pl-8" />
    </div>
  ),
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter a number',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Pre-filled value',
  },
};

export const Large: Story = {
  args: {
    className: 'h-12 text-lg',
    placeholder: 'Large input',
  },
};

export const Small: Story = {
  args: {
    className: 'h-8 text-sm',
    placeholder: 'Small input',
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-sm">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input id="username" placeholder="Enter username" className="pl-8" />
        </div>
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="email" id="email" placeholder="Enter email" className="pl-8" />
        </div>
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="password" id="password" placeholder="Enter password" className="pl-8" />
        </div>
      </div>
      <Button className="w-full">Submit</Button>
    </div>
  ),
};

export const SearchWithButton: Story = {
  render: () => (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-8" />
      </div>
      <Button type="submit">Search</Button>
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="error-input">Email</Label>
      <Input 
        id="error-input" 
        type="email" 
        placeholder="Enter your email" 
        className="border-red-500 focus:border-red-500"
      />
      <p className="text-sm text-red-500">Please enter a valid email address.</p>
    </div>
  ),
}; 