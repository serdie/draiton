
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/context/auth-context';

export function UserAvatar({ user }: { user: User }) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'Usuario'} />
        <AvatarFallback>{user.displayName ? getInitials(user.displayName) : 'U'}</AvatarFallback>
      </Avatar>
  )
}
