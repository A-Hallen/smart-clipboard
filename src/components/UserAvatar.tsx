import React from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  user: any;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  showName = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuario';
  const avatarUrl = user?.photoURL;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Si la imagen falla, mostrar el icono por defecto
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <User 
          className={`${avatarUrl ? 'hidden' : ''} w-4 h-4 text-gray-500 dark:text-gray-400`}
        />
      </div>
      {showName && (
        <span className={`${textSizeClasses[size]} font-medium text-gray-700 dark:text-gray-300 truncate`}>
          {displayName}
        </span>
      )}
    </div>
  );
};

export default UserAvatar;
