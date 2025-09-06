"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image?: string | null;
  } | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showName?: boolean;
  showEmail?: boolean;
  showTooltip?: boolean;
  tooltipContent?: string;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-12 w-12"
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm",
  xl: "text-base"
};

export function UserAvatar({
  user,
  size = "md",
  className,
  showName = false,
  showEmail = false,
  showTooltip = true,
  tooltipContent
}: UserAvatarProps) {
  if (!user) {
    const avatarElement = (
      <Avatar className={sizeClasses[size]}>
        <AvatarFallback className={cn(textSizeClasses[size], "bg-muted")}>
          ?
        </AvatarFallback>
      </Avatar>
    );

    return (
      <div className={cn("flex items-center gap-2", className)}>
        {showTooltip ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {avatarElement}
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm font-medium">Unknown User</p>
                <p className="text-xs text-muted-foreground">No information available</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          avatarElement
        )}
        {showName && (
          <div className="flex flex-col">
            <span className={cn("font-medium", textSizeClasses[size])}>
              Unknown User
            </span>
            {showEmail && (
              <span className={cn("text-muted-foreground", textSizeClasses[size])}>
                No email
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${user.firstName} ${user.lastName}`;

  const avatarElement = (
    <Avatar className={sizeClasses[size]}>
      {user.image && (
        <AvatarImage
          src={user.image}
          alt={fullName}
          className="object-cover"
        />
      )}
      <AvatarFallback className={cn(textSizeClasses[size], "bg-primary text-primary-foreground")}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showTooltip ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {avatarElement}
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="text-sm font-medium">{fullName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                {tooltipContent && (
                  <p className="text-xs text-muted-foreground">{tooltipContent}</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        avatarElement
      )}
      {showName && (
        <div className="flex flex-col">
          <span className={cn("font-medium", textSizeClasses[size])}>
            {fullName}
          </span>
          {showEmail && (
            <span className={cn("text-muted-foreground", textSizeClasses[size])}>
              {user.email}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for cards and lists
export function UserAvatarCompact({
  user,
  size = "sm",
  className,
  showTooltip = true,
  tooltipContent
}: Omit<UserAvatarProps, 'showName' | 'showEmail'>) {
  return <UserAvatar user={user} size={size} className={className} showTooltip={showTooltip} tooltipContent={tooltipContent} />;
}

// With name version for detailed views
export function UserAvatarWithName({
  user,
  size = "md",
  className,
  showEmail = false,
  showTooltip = true,
  tooltipContent
}: Omit<UserAvatarProps, 'showName'> & { showName?: boolean }) {
  return <UserAvatar user={user} size={size} className={className} showName showEmail={showEmail} showTooltip={showTooltip} tooltipContent={tooltipContent} />;
}
